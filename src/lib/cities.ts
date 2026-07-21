import { db } from "./db";

// Şehir listesi/merkezleri lib/cityCenters.ts'te (db import etmeyen saf modül —
// istemci bileşenleri de oradan okuyor). Buradan yeniden dışa aktarılıyor ki
// mevcut `from "@/lib/cities"` import'ları kırılmasın.
export { CITIES, cityBySlug } from "./cityCenters";
export type { City } from "./cityCenters";
import { CITIES } from "./cityCenters";

export type CityStats = { pins: number; priced: number; districts: number };

export function cityStats(name: string): CityStats {
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS pins,
              COUNT(price) AS priced,
              COUNT(DISTINCT district) AS districts
         FROM pins WHERE status = 'active' AND city = ?`
    )
    .get(name) as CityStats;
  return { pins: row?.pins ?? 0, priced: row?.priced ?? 0, districts: row?.districts ?? 0 };
}

export type CityPin = {
  id: string;
  name: string;
  kind: string;
  category: string;
  price: number | null;
  price_item: string | null;
  district: string | null;
  confirms: number;
};

// Şehirdeki öne çıkan pinler: önce doğrulananlar, sonra yeni. SEO listesi için.
export function cityPins(name: string, limit = 40): CityPin[] {
  return db()
    .prepare(
      `SELECT p.id, p.name, p.kind, p.category, p.price, p.price_item, p.district,
              COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = 1), 0) AS confirms
         FROM pins p
        WHERE p.status = 'active' AND p.city = ?
        ORDER BY confirms DESC, p.created_at DESC
        LIMIT ?`
    )
    .all(name, limit) as CityPin[];
}

// Programatik kategori×şehir sayfaları için hedeflenen long-tail niyetler.
// İnce yeme-içme kategorileri (OSM verisi) + yer tipleri (yeni pinler):
// "berber fiyatları izmir", "kuşadası şezlong fiyatı" gibi hizmet niyetleri
// dahil. CITYCAT_MIN_PINS eşiği ince içerik üretimini zaten engelliyor.
export const SEO_CATEGORIES = [
  // yeme-içme (ince id'ler)
  "doner",
  "kebap",
  "lokanta",
  "kahvalti",
  "pide",
  "cigkofte",
  "tost",
  "kokorec",
  "balik",
  "corba",
  "tatli",
  "dondurma",
  "kafe",
  // yer tipleri (yeni pin verisi biriktikçe sayfalar kendiliğinden açılır)
  "restoran",
  "firin",
  "bar",
  "beach",
  "market",
  "kuafor",
  "hizmet",
  "gezi",
] as const;

// İnce içerik koruması: bu eşiğin altındaki kombinasyonlar için sayfa üretilmez.
export const CITYCAT_MIN_PINS = 3;

export function cityCatPins(name: string, category: string, limit = 40): CityPin[] {
  return db()
    .prepare(
      `SELECT p.id, p.name, p.kind, p.category, p.price, p.price_item, p.district,
              COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = 1), 0) AS confirms
         FROM pins p
        WHERE p.status = 'active' AND p.city = ? AND p.category = ?
        ORDER BY confirms DESC, p.created_at DESC
        LIMIT ?`
    )
    .all(name, category, limit) as CityPin[];
}

export type CatPriceStats = {
  count: number;
  min: number;
  max: number;
  median: number;
  cheapestName: string | null;
  cheapestItem: string | null;
};

// Şehir×kategori canlı fiyat istatistiği — long-tail "X fiyatları ne kadar?"
// sorusuna sayfada GERÇEK veriyle cevap vermek için (ISR ile tazelenir).
export function cityCatPriceStats(name: string, category: string): CatPriceStats | null {
  const rows = db()
    .prepare(
      `SELECT price, name AS pname, price_item FROM pins
        WHERE status = 'active' AND city = ? AND category = ? AND price IS NOT NULL
        ORDER BY price ASC`
    )
    .all(name, category) as { price: number; pname: string; price_item: string | null }[];
  if (rows.length === 0) return null;
  const prices = rows.map((r) => r.price);
  const median = prices[Math.floor(prices.length / 2)];
  return {
    count: rows.length,
    min: prices[0],
    max: prices[prices.length - 1],
    median,
    cheapestName: rows[0].pname,
    cheapestItem: rows[0].price_item,
  };
}

export function cityCatCount(name: string, category: string): { pins: number; priced: number } {
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS pins, COUNT(price) AS priced
         FROM pins WHERE status = 'active' AND city = ? AND category = ?`
    )
    .get(name, category) as { pins: number; priced: number };
  return { pins: row?.pins ?? 0, priced: row?.priced ?? 0 };
}

// generateStaticParams + sitemap için: eşiği geçen (şehir, kategori) kombinasyonları.
export function cityCatCombos(minPins = CITYCAT_MIN_PINS): { city: string; category: string }[] {
  const rows = db()
    .prepare(
      `SELECT city, category, COUNT(*) AS n
         FROM pins WHERE status = 'active' AND city IS NOT NULL
        GROUP BY city, category HAVING n >= ?`
    )
    .all(minPins) as { city: string; category: string; n: number }[];
  const catSet = new Set<string>(SEO_CATEGORIES);
  const cityByName = new Map(CITIES.map((c) => [c.name, c]));
  return rows
    .filter((r) => catSet.has(r.category) && cityByName.has(r.city))
    .map((r) => ({ city: cityByName.get(r.city)!.slug, category: r.category }));
}
