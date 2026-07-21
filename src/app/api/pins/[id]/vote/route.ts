import { db, awardPoints } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit } from "@/lib/moderation";
import { POINTS } from "@/lib/gamify";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const __g = overloadGuard();
  if (__g) return __g;
  const { id } = await params;
  const user = await getOrCreateUser();
  const { value } = (await request.json().catch(() => ({}))) as { value?: number };
  if (value !== 1 && value !== -1) {
    return Response.json({ error: "Geçersiz oy" }, { status: 400 });
  }

  const d = db();
  const pin = d.prepare("SELECT user_id FROM pins WHERE id = ? AND status = 'active'").get(id) as
    | { user_id: string }
    | undefined;
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });
  if (pin.user_id === user.id) {
    return Response.json({ error: "Kendi pinini oylayamazsın" }, { status: 400 });
  }
  if (!withinRateLimit(user.id, "vote")) {
    return Response.json({ error: "Günlük oy limitine ulaştın" }, { status: 429 });
  }

  const existing = d
    .prepare("SELECT value FROM votes WHERE pin_id = ? AND user_id = ?")
    .get(id, user.id) as { value: number } | undefined;

  let earned = 0;
  if (!existing) {
    // Pin bu oydan önce hiç doğrulanmış mıydı? (sahibine bonus bir kez verilir)
    const hadConfirm = d
      .prepare("SELECT 1 FROM votes WHERE pin_id = ? AND value = 1 LIMIT 1")
      .get(id);
    d.prepare("INSERT INTO votes (pin_id, user_id, value) VALUES (?, ?, ?)").run(id, user.id, value);
    awardPoints(user.id, POINTS.VOTE, "vote");
    earned = POINTS.VOTE;
    if (value === 1 && !hadConfirm) {
      awardPoints(pin.user_id, POINTS.PIN_CONFIRMED, "pin_confirmed");
    }
  } else if (existing.value !== value) {
    d.prepare(
      "UPDATE votes SET value = ?, updated_at = datetime('now') WHERE pin_id = ? AND user_id = ?"
    ).run(value, id, user.id);
  }

  const counts = d
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS confirms,
        COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS outdated
       FROM votes WHERE pin_id = ?`
    )
    .get(id);

  return Response.json({ ...(counts as object), myVote: value, earned });
}
