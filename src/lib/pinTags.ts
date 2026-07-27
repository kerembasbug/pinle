// pin_tags okuma yardımcıları (SUNUCU — db import eder, istemciye sokma).
// Saf tanımlar ve karar kuralı lib/venueTags.ts'te (o istemcide de kullanılır).
import { db } from "./db";
import { verdictOf, type TagVerdict } from "./venueTags";

type Row = { tag: string; yes: number; no: number };

/** Bir pinin tüm özellik sonuçları. */
export function tagsForPin(pinId: string): TagVerdict[] {
  const rows = db()
    .prepare(
      `SELECT tag,
              SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS yes,
              SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS no
         FROM pin_tags WHERE pin_id = ?
        GROUP BY tag`
    )
    .all(pinId) as Row[];
  return rows.map((r) => ({ id: r.tag, yes: r.yes, no: r.no, value: verdictOf(r.yes, r.no) }));
}

/** Kullanıcının bu pindeki kendi oyları: { pati: true, kart: false } */
export function myTagVotes(pinId: string, userId: string): Record<string, boolean> {
  const rows = db()
    .prepare("SELECT tag, value FROM pin_tags WHERE pin_id = ? AND user_id = ?")
    .all(pinId, userId) as { tag: string; value: number }[];
  return Object.fromEntries(rows.map((r) => [r.tag, r.value === 1]));
}

/**
 * Bir özelliğin DOĞRULANDIĞI pin id'leri (evet > hayır).
 * Harita filtresi ve SEO sayfaları bunu kullanır.
 */
const CONFIRMED = `
  SELECT pt.pin_id FROM pin_tags pt WHERE pt.tag = ?
   GROUP BY pt.pin_id
  HAVING SUM(CASE WHEN pt.value = 1 THEN 1 ELSE -1 END) > 0
`;

/** Özelliği doğrulanmış toplam mekan sayısı. */
export function tagCount(tag: string): number {
  const r = db()
    .prepare(
      `SELECT COUNT(*) AS c FROM pins p
        WHERE p.status = 'active' AND p.id IN (${CONFIRMED})`
    )
    .get(tag) as { c: number };
  return r.c;
}

/** Şehir kırılımı — SEO sayfasındaki "hangi şehirde kaç tane". */
export function tagCitiesFor(tag: string): { city: string; count: number }[] {
  return db()
    .prepare(
      `SELECT p.city AS city, COUNT(*) AS count FROM pins p
        WHERE p.status = 'active' AND p.city IS NOT NULL AND p.city != '-'
          AND p.id IN (${CONFIRMED})
        GROUP BY p.city ORDER BY count DESC`
    )
    .all(tag) as { city: string; count: number }[];
}

export type TaggedVenue = {
  id: string;
  name: string;
  category: string;
  district: string | null;
  city: string | null;
  price: number | null;
  price_item: string | null;
  votes: number;
};

/** Doğrulanmış mekanlar; en çok doğrulanan önce (city verilirse o şehirden). */
export function taggedVenues(tag: string, city: string | null, limit = 60): TaggedVenue[] {
  const cityFilter = city ? "AND p.city = ?" : "";
  const args = city ? [tag, tag, city, limit] : [tag, tag, limit];
  return db()
    .prepare(
      `SELECT p.id, p.name, p.category, p.district, p.city, p.price, p.price_item,
              (SELECT COUNT(*) FROM pin_tags t2
                WHERE t2.pin_id = p.id AND t2.tag = ? AND t2.value = 1) AS votes
         FROM pins p
        WHERE p.status = 'active' AND p.id IN (${CONFIRMED}) ${cityFilter}
        ORDER BY votes DESC, p.price IS NULL, p.created_at DESC
        LIMIT ?`
    )
    .all(...args) as TaggedVenue[];
}
