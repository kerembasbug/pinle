import { db } from "./db";

export const PRICE_DATASET_METHOD_VERSION = "2026-07-21.2";
export const PRICE_DATASET_METHOD_RELEASED_AT = "2026-07-21T00:00:00Z";
export const SEED_AUTHOR_NAME = "Pinle Ekibi 📌";

type PriceObservation = {
  item: string;
  price: number;
  city: string | null;
  observedAt: string;
  sourceAuthor: string;
  confirmed: number;
};

export type PriceAggregate = {
  item: string;
  count: number;
  median: number;
  min: number;
  max: number;
  cheapestCity: string;
  lastObservedAt: string;
  userObservationCount: number;
  seedObservationCount: number;
  confirmedObservationCount: number;
};

export type PriceDataset = {
  items: PriceAggregate[];
  rawObservationCount: number;
  observationCount: number;
  userObservationCount: number;
  seedObservationCount: number;
  confirmedObservationCount: number;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
};

function median(prices: number[]): number {
  const sorted = [...prices].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
  return Math.round(value * 100) / 100;
}

export function getPriceDataset(): PriceDataset {
  const rows = db()
    .prepare(
      `SELECT trim(p.price_item) AS item,
              p.price,
              p.city,
              COALESCE(
                (SELECT MAX(pr.created_at) FROM price_reports pr WHERE pr.pin_id = p.id),
                p.price_updated_at,
                p.created_at
              ) AS observedAt,
              COALESCE(
                (SELECT u2.name
                   FROM price_reports pr2 JOIN users u2 ON u2.id = pr2.user_id
                  WHERE pr2.pin_id = p.id
                  ORDER BY pr2.created_at DESC, pr2.id DESC
                  LIMIT 1),
                u.name
              ) AS sourceAuthor,
              CASE WHEN EXISTS (
                SELECT 1
                  FROM votes v
                 WHERE v.pin_id = p.id
                   AND v.value = 1
                   AND v.user_id != COALESCE(
                     (SELECT pr3.user_id
                        FROM price_reports pr3
                       WHERE pr3.pin_id = p.id
                       ORDER BY pr3.created_at DESC, pr3.id DESC
                       LIMIT 1),
                     p.user_id
                   )
              ) THEN 1 ELSE 0 END AS confirmed
         FROM pins p JOIN users u ON u.id = p.user_id
        WHERE p.status = 'active'
          AND p.price IS NOT NULL
          AND p.price > 0
          AND p.price_item IS NOT NULL
          AND trim(p.price_item) != ''
          AND NOT EXISTS (
            SELECT 1 FROM votes v2 WHERE v2.pin_id = p.id AND v2.value = -1
          )`
    )
    .all() as PriceObservation[];

  const byItem = new Map<string, PriceObservation[]>();
  for (const row of rows) {
    if (!byItem.has(row.item)) byItem.set(row.item, []);
    byItem.get(row.item)!.push(row);
  }

  const items = [...byItem.entries()]
    .map(([item, observations]) => {
      const sortedByPrice = [...observations].sort((a, b) => a.price - b.price);
      const dated = observations.map((row) => row.observedAt).filter(Boolean).sort();
      const cheapestWithCity = sortedByPrice.find(
        (row) => row.city && row.city !== "-" && row.price === sortedByPrice[0].price,
      );
      const userObservationCount = observations.filter(
        (row) => row.sourceAuthor !== SEED_AUTHOR_NAME,
      ).length;
      return {
        item,
        count: observations.length,
        median: median(observations.map((row) => row.price)),
        min: sortedByPrice[0].price,
        max: sortedByPrice.at(-1)!.price,
        cheapestCity: cheapestWithCity?.city ?? "Belirtilmedi",
        lastObservedAt: dated.at(-1) ?? "",
        userObservationCount,
        seedObservationCount: observations.length - userObservationCount,
        confirmedObservationCount: observations.filter((row) => row.confirmed === 1).length,
      } satisfies PriceAggregate;
    })
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count || a.item.localeCompare(b.item, "tr"));

  const includedItems = new Set(items.map((item) => item.item));
  const comparableDates = rows
    .filter((row) => includedItems.has(row.item) && row.observedAt)
    .map((row) => row.observedAt)
    .sort();
  return {
    items,
    rawObservationCount: rows.length,
    observationCount: items.reduce((sum, item) => sum + item.count, 0),
    userObservationCount: items.reduce((sum, item) => sum + item.userObservationCount, 0),
    seedObservationCount: items.reduce((sum, item) => sum + item.seedObservationCount, 0),
    confirmedObservationCount: items.reduce(
      (sum, item) => sum + item.confirmedObservationCount,
      0,
    ),
    firstObservedAt: comparableDates[0] ?? null,
    lastObservedAt: comparableDates.at(-1) ?? null,
  };
}

export function sqliteUtcToIso(value: string | null): string | null {
  if (!value) return null;
  return value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
}
