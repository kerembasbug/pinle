import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit, REPORT_HIDE_THRESHOLD } from "@/lib/moderation";

export async function POST(
  _request: Request,
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

  d.prepare("INSERT OR IGNORE INTO reports (pin_id, user_id) VALUES (?, ?)").run(id, user.id);
  const count = (
    d.prepare("SELECT COUNT(*) AS c FROM reports WHERE pin_id = ?").get(id) as { c: number }
  ).c;
  if (count >= REPORT_HIDE_THRESHOLD) {
    d.prepare("UPDATE pins SET status = 'hidden' WHERE id = ?").run(id);
  }

  return Response.json({ ok: true, hidden: count >= REPORT_HIDE_THRESHOLD });
}
