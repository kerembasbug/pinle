import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Pin adına göre arama.
//  - Arama sayfası: haritada bir mekana zıplamak için (konumsuz).
//  - Yeni pin formu: lat/lng verilince YAKINDAKİ eşleşmeler öne gelir
//    ("zaten burada var mı?" — mükerrer pini önleyip fiyat eklemeye yönlendirir).
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ results: [] });
  const like = `%${q.replace(/[%_]/g, "")}%`;

  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const hasLoc = Number.isFinite(lat) && Number.isFinite(lng);

  const results = hasLoc
    ? db()
        .prepare(
          // Enlem-boylam farkının karesi (boylamı enleme göre daralt) — kısa
          // mesafede sıralama için yeterli; en yakın eşleşme en üstte.
          `SELECT id, name, category, city, district, price, price_item, lat, lng,
                  ((lat - ?) * (lat - ?) + (lng - ?) * (lng - ?) * 0.58) AS d
             FROM pins
            WHERE status = 'active' AND name LIKE ? COLLATE NOCASE
            ORDER BY d ASC
            LIMIT 8`
        )
        .all(lat, lat, lng, lng, like)
    : db()
        .prepare(
          `SELECT id, name, category, city, district, price, price_item, lat, lng
             FROM pins
            WHERE status = 'active' AND name LIKE ? COLLATE NOCASE
            ORDER BY (price IS NOT NULL) DESC, created_at DESC
            LIMIT 15`
        )
        .all(like);

  return Response.json({ results });
}
