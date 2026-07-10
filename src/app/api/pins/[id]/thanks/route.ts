import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { POINTS } from "@/lib/gamify";

// "🙏 Teşekkür" — hafif, tek dokunuş takdir. Pinleyene puan + dopamin;
// katkının işe yaradığının sinyali (kalite metriği olarak da kullanılır).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateUser();

  const d = db();
  const pin = d
    .prepare("SELECT user_id FROM pins WHERE id = ? AND status = 'active'")
    .get(id) as { user_id: string } | undefined;
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });
  if (pin.user_id === user.id) {
    return Response.json({ error: "Kendi pinine teşekkür edemezsin 😄" }, { status: 400 });
  }

  const res = d
    .prepare("INSERT OR IGNORE INTO thanks (pin_id, user_id) VALUES (?, ?)")
    .run(id, user.id);
  const isNew = res.changes > 0;
  if (isNew) awardPoints(pin.user_id, POINTS.THANKS_OWNER, "thanks");

  const count = (
    d.prepare("SELECT COUNT(*) AS c FROM thanks WHERE pin_id = ?").get(id) as { c: number }
  ).c;

  return Response.json({ thanks: count, myThanks: true, isNew });
}
