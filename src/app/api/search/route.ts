import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Pin adına göre arama — haritada bir mekana zıplamak için.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ results: [] });
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const results = db()
    .prepare(
      `SELECT id, name, category, city, district, price, lat, lng
       FROM pins
       WHERE status = 'active' AND name LIKE ? COLLATE NOCASE
       ORDER BY (price IS NOT NULL) DESC, created_at DESC
       LIMIT 15`
    )
    .all(like);
  return Response.json({ results });
}
