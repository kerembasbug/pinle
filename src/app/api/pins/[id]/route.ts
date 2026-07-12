import { db } from "@/lib/db";
import { getUserIfExists, getOrCreateUser } from "@/lib/identity";
import { authorIdFor } from "@/lib/authorId";
import { isClean, withinRateLimit } from "@/lib/moderation";
import { categoryInKind } from "@/lib/categories";
import { overloadGuard } from "@/lib/flags";
import { cacheClear } from "@/lib/pinsCache";

// Pini düzelt — YALNIZ sahibi. Ad (yanlış/eski/bilinmeyen) ve/veya TÜR (yer tipi)
// güncellenebilir; mükerrer pin açmaya gerek kalmaz.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = overloadGuard();
  if (g) return g;
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!withinRateLimit(user.id, "comment")) {
    return Response.json({ error: "Çok sık deniyorsun, biraz bekle" }, { status: 429 });
  }
  const { name, category } = (await request.json().catch(() => ({}))) as {
    name?: string;
    category?: string;
  };
  const hasName = name !== undefined;
  const hasCat = category !== undefined;
  if (!hasName && !hasCat) {
    return Response.json({ error: "Değişiklik yok" }, { status: 400 });
  }
  const trimmed = (name ?? "").trim();
  if (hasName && (trimmed.length < 2 || trimmed.length > 80)) {
    return Response.json({ error: "İsim 2-80 karakter olmalı" }, { status: 400 });
  }
  if (hasName && !isClean(trimmed)) {
    return Response.json({ error: "Metin uygunsuz ifade içeriyor" }, { status: 400 });
  }
  if (hasCat && !categoryInKind("lezzet", category!)) {
    return Response.json({ error: "Geçersiz tür" }, { status: 400 });
  }

  const d = db();
  const pin = d
    .prepare("SELECT user_id FROM pins WHERE id = ? AND status = 'active'")
    .get(id) as { user_id: string } | undefined;
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });
  if (pin.user_id !== user.id) {
    return Response.json({ error: "Sadece pini ekleyen düzeltebilir" }, { status: 403 });
  }
  if (hasName) d.prepare("UPDATE pins SET name = ? WHERE id = ?").run(trimmed, id);
  if (hasCat) d.prepare("UPDATE pins SET category = ? WHERE id = ?").run(category, id);
  cacheClear();
  return Response.json({ ok: true, name: hasName ? trimmed : undefined, category: hasCat ? category : undefined });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getUserIfExists();
  const pin = db()
    .prepare(
      `SELECT p.id, p.user_id, p.name, p.kind, p.category, p.price, p.price_item, p.price_updated_at,
        p.price_valid_until, p.note, p.photo, p.lat, p.lng, p.created_at,
        u.name AS author, u.avatar AS author_avatar,
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
      `SELECT c.id, c.user_id, c.body, c.created_at, u.name AS author, u.avatar
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
