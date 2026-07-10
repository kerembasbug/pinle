import { db } from "@/lib/db";

// 🔴 Canlı: son 60 dakikanın hareketleri (yeni pin + fiyat girişi).
// Websocket yok — istemci ~30 sn'de bir çeker; sorgu ucuz, indeksli.
export async function GET() {
  const rows = db()
    .prepare(
      `SELECT p.id, p.name, p.lat, p.lng, p.price, p.price_item AS item, 'pin' AS type,
              p.created_at AS at
         FROM pins p
        WHERE p.status = 'active' AND p.created_at > datetime('now', '-60 minutes')
       UNION ALL
       SELECT p.id, p.name, p.lat, p.lng, pr.price, pr.item, 'price' AS type,
              pr.created_at AS at
         FROM price_reports pr
         JOIN pins p ON p.id = pr.pin_id AND p.status = 'active'
        WHERE pr.created_at > datetime('now', '-60 minutes')
        ORDER BY at DESC
        LIMIT 100`
    )
    .all();
  return Response.json(
    { events: rows },
    { headers: { "Cache-Control": "public, max-age=20" } }
  );
}
