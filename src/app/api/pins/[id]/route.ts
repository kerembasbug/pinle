import { db } from "@/lib/db";
import { getUserIfExists } from "@/lib/identity";
import { authorIdFor } from "@/lib/authorId";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getUserIfExists();
  const pin = db()
    .prepare(
      `SELECT p.id, p.user_id, p.name, p.kind, p.category, p.price, p.price_item, p.price_updated_at,
        p.note, p.photo, p.lat, p.lng, p.created_at,
        u.name AS author,
        COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = 1), 0) AS confirms,
        COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = -1), 0) AS outdated,
        COALESCE((SELECT COUNT(*) FROM thanks t WHERE t.pin_id = p.id), 0) AS thanks
       FROM pins p JOIN users u ON u.id = p.user_id
       WHERE p.id = ? AND p.status = 'active'`
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  const commentRows = db()
    .prepare(
      `SELECT c.id, c.user_id, c.body, c.created_at, u.name AS author
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.pin_id = ? ORDER BY c.created_at ASC LIMIT 100`
    )
    .all(id) as Record<string, unknown>[];
  const comments = commentRows.map(({ user_id, ...c }) => ({
    ...c,
    authorId: authorIdFor(user_id as string),
  }));

  let myVote = 0;
  let myThanks = false;
  if (me) {
    const v = db()
      .prepare("SELECT value FROM votes WHERE pin_id = ? AND user_id = ?")
      .get(id, me.id) as { value: number } | undefined;
    myVote = v?.value ?? 0;
    myThanks = !!db()
      .prepare("SELECT 1 FROM thanks WHERE pin_id = ? AND user_id = ?")
      .get(id, me.id);
  }

  const isMine = me?.id === pin.user_id;
  const authorId = authorIdFor(pin.user_id as string);
  delete pin.user_id;
  return Response.json({ pin: { ...pin, isMine, authorId }, comments, myVote, myThanks });
}
