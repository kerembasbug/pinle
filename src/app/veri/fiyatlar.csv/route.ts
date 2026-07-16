import { db } from "@/lib/db";
import { YEAR } from "@/lib/seoIntents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PriceRow = {
  item: string;
  price: number;
  city: string | null;
  observedAt: string;
};

type Aggregate = {
  item: string;
  count: number;
  median: number;
  min: number;
  max: number;
  cheapestCity: string;
  lastObservedAt: string;
};

function aggregatePrices(): Aggregate[] {
  const rows = db()
    .prepare(
      `SELECT trim(price_item) AS item,
              price,
              city,
              COALESCE(price_updated_at, created_at) AS observedAt
         FROM pins
        WHERE status = 'active'
          AND price IS NOT NULL
          AND price > 0
          AND price_item IS NOT NULL
          AND trim(price_item) != ''`
    )
    .all() as PriceRow[];

  const byItem = new Map<string, PriceRow[]>();
  for (const row of rows) {
    if (!byItem.has(row.item)) byItem.set(row.item, []);
    byItem.get(row.item)!.push(row);
  }

  return [...byItem.entries()]
    .map(([item, observations]) => {
      const sorted = [...observations].sort((a, b) => a.price - b.price);
      const dated = observations.map((row) => row.observedAt).filter(Boolean).sort();
      return {
        item,
        count: observations.length,
        median: sorted[Math.floor(sorted.length / 2)].price,
        min: sorted[0].price,
        max: sorted[sorted.length - 1].price,
        cheapestCity:
          sorted[0].city && sorted[0].city !== "-" ? sorted[0].city : "Belirtilmedi",
        lastObservedAt: dated.at(-1) ?? "",
      };
    })
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count || a.item.localeCompare(b.item, "tr"));
}

function csvCell(value: string | number): string {
  let text = String(value);
  // Kullanıcı tarafından girilen kalem adlarının tablo uygulamalarında formül
  // olarak çalışmasını engelle.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const header = [
    "urun_hizmet",
    "gozlem_sayisi",
    "ortanca_tl",
    "minimum_tl",
    "maksimum_tl",
    "en_ucuz_sehir",
    "son_gozlem_utc",
    "kaynak",
  ];
  const source = "https://pinle.app/fiyatlar";
  const lines = aggregatePrices().map((row) =>
    [
      row.item,
      row.count,
      row.median,
      row.min,
      row.max,
      row.cheapestCity,
      row.lastObservedAt,
      source,
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = `\uFEFF${header.map(csvCell).join(",")}\r\n${lines.join("\r\n")}\r\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pinle-turkiye-sokak-fiyatlari-${YEAR}.csv"`,
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
