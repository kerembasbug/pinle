import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit, REPORT_HIDE_THRESHOLD } from "@/lib/moderation";
import { clientIpHash } from "@/lib/net";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const __g = overloadGuard();
  if (__g) return __g;
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!withinRateLimit(user.id, "report")) {
    return Response.json({ error: "Günlük rapor limitine ulaştın" }, { status: 429 });
  }

  const d = db();
  const pin = d.prepare("SELECT 1 FROM pins WHERE id = ? AND status = 'active'").get(id);
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  const ipHash = clientIpHash(request);
  d.prepare("INSERT OR IGNORE INTO reports (pin_id, user_id, ip_hash) VALUES (?, ?, ?)").run(
    id,
    user.id,
    ipHash
  );
  // Gizleme eşiği FARKLI IP sayısına bakar — çerez sıfırlayıp tek başına pin
  // gizletme (sansür/griefing) engellenir. Eski IP'siz kayıtlar user_id sayılır.
  const count = (
    d
      .prepare(
        `SELECT COUNT(*) AS c FROM (
           SELECT COALESCE(ip_hash, user_id) AS k FROM reports WHERE pin_id = ? GROUP BY k
         )`
      )
      .get(id) as { c: number }
  ).c;
  if (count >= REPORT_HIDE_THRESHOLD) {
    d.prepare("UPDATE pins SET status = 'hidden' WHERE id = ?").run(id);
  }

  return Response.json({ ok: true, hidden: count >= REPORT_HIDE_THRESHOLD });
}
