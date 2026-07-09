import { db } from "./db";

export type City = {
  slug: string;
  name: string; // pins.city ile birebir eşleşmeli
  center: [number, number]; // [lng, lat]
};

// Pilot 7 şehir. slug'lar ASCII (SEO dostu URL). name, DB'deki city değeriyle aynı.
export const CITIES: City[] = [
  { slug: "istanbul", name: "İstanbul", center: [28.98, 41.03] },
  { slug: "ankara", name: "Ankara", center: [32.85, 39.92] },
  { slug: "izmir", name: "İzmir", center: [27.14, 38.42] },
  { slug: "mugla", name: "Muğla", center: [28.36, 37.21] },
  { slug: "aydin", name: "Aydın", center: [27.84, 37.85] },
  { slug: "manisa", name: "Manisa", center: [27.43, 38.61] },
  { slug: "denizli", name: "Denizli", center: [29.09, 37.85] },
];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

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
  district: string | null;
  confirms: number;
};

// Şehirdeki öne çıkan pinler: önce doğrulananlar, sonra yeni. SEO listesi için.
export function cityPins(name: string, limit = 40): CityPin[] {
  return db()
    .prepare(
      `SELECT p.id, p.name, p.kind, p.category, p.price, p.district,
              COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = 1), 0) AS confirms
         FROM pins p
        WHERE p.status = 'active' AND p.city = ?
        ORDER BY confirms DESC, p.created_at DESC
        LIMIT ?`
    )
    .all(name, limit) as CityPin[];
}
