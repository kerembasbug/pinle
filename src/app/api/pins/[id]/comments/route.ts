import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { isClean, withinRateLimit } from "@/lib/moderation";
import { POINTS } from "@/lib/gamify";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateUser();
  const { body } = (await request.json().catch(() => ({}))) as { body?: string };
  const text = (body ?? "").trim();

  if (text.length < 1 || text.length > 280) {
    return Response.json({ error: "Yorum 1-280 karakter olmalı" }, { status: 400 });
  }
  if (!isClean(text)) {
    return Response.json({ error: "Yorum uygunsuz ifade içeriyor" }, { status: 400 });
  }
  if (!withinRateLimit(user.id, "comment")) {
    return Response.json({ error: "Günlük yorum limitine ulaştın" }, { status: 429 });
  }

  const d = db();
  const pin = d.prepare("SELECT 1 FROM pins WHERE id = ? AND status = 'active'").get(id);
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  const commentId = crypto.randomUUID();
  d.prepare("INSERT INTO comments (id, pin_id, user_id, body) VALUES (?, ?, ?, ?)").run(
    commentId,
    id,
    user.id,
    text
  );
  awardPoints(user.id, POINTS.COMMENT, "comment");

  return Response.json(
    { comment: { id: commentId, body: text, author: user.name, created_at: new Date().toISOString() }, earned: POINTS.COMMENT },
    { status: 201 }
  );
}
