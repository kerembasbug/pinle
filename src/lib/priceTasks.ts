import { categoryById, isPriceable, placeTypeIdOf } from "./categories";
import { CITIES } from "./cityCenters";
import { db } from "./db";
import { SEED_AUTHOR_NAME } from "./priceDataset";

// Görev panosu yalnızca kullanıcının mekânda kolayca gözleyebileceği fiyatları
// öne çıkarır. `isPriceable` geniş harita filtresini korurken teknoloji/giyim
// gibi aynı üst tipe eşlenen ama belirsiz görevler burada bilinçli olarak dışarıda.
const TASK_CATEGORY_IDS = new Set([
  "restoran",
  "doner",
  "kafe",
  "firin",
  "bar",
  "beach",
  "market",
  "oto",
  "lokanta",
  "kebap",
  "pide",
  "cigkofte",
  "tost",
  "kokorec",
  "balik",
  "corba",
  "kahvalti",
  "tatli",
  "dondurma",
  "caybahce",
  "kahveci",
  "ickili-restoran",
  "meyhane",
  "gece-kulubu",
  "nargile",
  "manav",
  "kasap",
  "sarkuteri",
  "kuruyemis",
  "benzinlik",
  "otopark",
  "lastik",
]);

const MARKET_NAME_HINTS = [
  "market",
  "bakkal",
  "manav",
  "kasap",
  "şarküteri",
  "sarkuteri",
  "tekel",
  "kuruyemiş",
  "kuruyemis",
  "gross",
  "süpermarket",
  "supermarket",
  "a101",
  "bim",
  "şok",
];
const AUTO_NAME_HINTS = [
  "benzin",
  "petrol",
  "otopark",
  "lastik",
  "oto",
  "opet",
  "shell",
  "alpet",
  "lukoil",
  "total",
];

type MissingPriceRow = {
  id: string;
  name: string;
  city: string;
  district: string | null;
  category: string;
  author: string;
  created_at: string;
};

export type PriceTask = {
  id: string;
  name: string;
  city: string;
  citySlug: string;
  district: string | null;
  categoryId: string;
  categoryLabel: string;
  emoji: string;
  source: "seed" | "user";
};

export type CityPriceTasks = {
  city: string;
  citySlug: string;
  missing: number;
  seedMissing: number;
  userMissing: number;
  topCategories: { id: string; label: string; emoji: string; count: number }[];
  tasks: PriceTask[];
};

export type PriceTaskBoard = {
  totalMissing: number;
  seedMissing: number;
  userMissing: number;
  cities: CityPriceTasks[];
  tasks: PriceTask[];
};

function hasNameHint(name: string, hints: string[]) {
  const normalized = name.toLocaleLowerCase("tr-TR");
  return hints.some((hint) => normalized.includes(hint));
}

function isActionableTask(row: MissingPriceRow) {
  if (!TASK_CATEGORY_IDS.has(row.category) || !isPriceable("lezzet", row.category)) {
    return false;
  }
  if (row.author !== SEED_AUTHOR_NAME) return true;

  // Başlangıç verisindeki geniş üst-tip eşlemeleri bazen teknoloji/giyim gibi
  // alakasız isimleri market veya oto altında bırakabiliyor. Yalnız bu iki geniş
  // tipte, ismin de fiyat göreviyle uyuşmasını şart koşuyoruz.
  if (row.category === "market") return hasNameHint(row.name, MARKET_NAME_HINTS);
  if (row.category === "oto") return hasNameHint(row.name, AUTO_NAME_HINTS);
  return true;
}

export function getPriceTaskBoard(): PriceTaskBoard {
  const rows = db()
    .prepare(
      `SELECT p.id, p.name, p.city, p.district, p.category, u.name AS author, p.created_at
         FROM pins p JOIN users u ON u.id = p.user_id
        WHERE p.status = 'active'
          AND p.kind = 'lezzet'
          AND p.price IS NULL
          AND p.city IS NOT NULL
        ORDER BY CASE WHEN u.name = ? THEN 1 ELSE 0 END,
                 p.created_at DESC,
                 p.name ASC,
                 p.id ASC`
    )
    .all(SEED_AUTHOR_NAME) as MissingPriceRow[];

  const cityByName = new Map(CITIES.map((city) => [city.name, city]));
  const actionable = rows.filter(
    (row) => cityByName.has(row.city) && isActionableTask(row)
  );

  const cities = CITIES.map((city) => {
    const cityRows = actionable.filter((row) => row.city === city.name);
    const categoryCounts = new Map<string, number>();
    for (const row of cityRows) {
      const categoryId = placeTypeIdOf(row.category);
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
    }

    const selected: PriceTask[] = [];
    const seenContexts = new Set<string>();
    for (const row of cityRows) {
      const categoryId = placeTypeIdOf(row.category);
      const context = `${row.district ?? "-"}:${categoryId}`;
      if (seenContexts.has(context)) continue;
      seenContexts.add(context);
      const category = categoryById(row.category);
      selected.push({
        id: row.id,
        name: row.name,
        city: city.name,
        citySlug: city.slug,
        district: row.district,
        categoryId,
        categoryLabel: category.label,
        emoji: category.emoji,
        source: row.author === SEED_AUTHOR_NAME ? "seed" : "user",
      });
      if (selected.length === 3) break;
    }

    return {
      city: city.name,
      citySlug: city.slug,
      missing: cityRows.length,
      seedMissing: cityRows.filter((row) => row.author === SEED_AUTHOR_NAME).length,
      userMissing: cityRows.filter((row) => row.author !== SEED_AUTHOR_NAME).length,
      topCategories: [...categoryCounts.entries()]
        .map(([id, count]) => {
          const category = categoryById(id);
          return { id, label: category.label, emoji: category.emoji, count };
        })
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"))
        .slice(0, 3),
      tasks: selected,
    } satisfies CityPriceTasks;
  }).filter((city) => city.missing > 0);

  return {
    totalMissing: actionable.length,
    seedMissing: actionable.filter((row) => row.author === SEED_AUTHOR_NAME).length,
    userMissing: actionable.filter((row) => row.author !== SEED_AUTHOR_NAME).length,
    cities,
    tasks: cities.flatMap((city) => city.tasks),
  };
}
