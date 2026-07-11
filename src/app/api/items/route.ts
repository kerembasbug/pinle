import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categoryFilterIds, placeTypeIdOf } from "@/lib/categories";

// Ürün/hizmet kalemi autocomplete — topluluğun geçmiş girdilerinden öğrenir.
// Kaynak: price_reports.item + pins.price_item. Aynı yer tipindeki kalemler
// öne gelir; sıklığa göre sıralanır. q boşsa kategorinin popülerleri döner.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 40);
  const cat = (sp.get("cat") ?? "").trim();
  const catIds = cat ? categoryFilterIds(placeTypeIdOf(cat)) : [];
  const like = `%${q.replace(/[%_]/g, "")}%`;

  const catList = catIds.map(() => "?").join(",");
  const rows = db()
    .prepare(
      `SELECT item, SUM(catHit) AS catHits, COUNT(*) AS uses FROM (
         SELECT pr.item AS item,
                CASE WHEN ${catIds.length ? `p.category IN (${catList})` : "0"} THEN 1 ELSE 0 END AS catHit
           FROM price_reports pr JOIN pins p ON p.id = pr.pin_id
          WHERE pr.item IS NOT NULL AND pr.item != ''
         UNION ALL
         SELECT p2.price_item AS item,
                CASE WHEN ${catIds.length ? `p2.category IN (${catList})` : "0"} THEN 1 ELSE 0 END AS catHit
           FROM pins p2
          WHERE p2.price_item IS NOT NULL AND p2.price_item != '' AND p2.status = 'active'
       )
       WHERE item LIKE ? COLLATE NOCASE
       GROUP BY item COLLATE NOCASE
       ORDER BY catHits DESC, uses DESC, item ASC
       LIMIT 8`
    )
    .all(...catIds, ...catIds, like) as { item: string; uses: number }[];

  return Response.json(
    { items: rows.map((r) => r.item) },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
