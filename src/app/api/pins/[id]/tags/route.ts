import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit } from "@/lib/moderation";
import { overloadGuard } from "@/lib/flags";
import { cacheClear } from "@/lib/pinsCache";
import { POINTS } from "@/lib/gamify";
import { isValidTag } from "@/lib/venueTags";
import { tagsForPin } from "@/lib/pinTags";

// Mekan özelliği bildir ("pati dostu mu?" evet/hayır) — HERKESE açık.
// Kullanıcı başına özellik başına 1 oy; tekrar gönderirse oyu güncellenir.
// Puan YALNIZ ilk kez oy verirken (fikir değiştirmek puan basmasın).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = overloadGuard();
  if (g) return g;
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!withinRateLimit(user.id, "tag")) {
    return Response.json({ error: "Çok sık deniyorsun, biraz bekle" }, { status: 429 });
  }

  const { tag, value } = (await request.json().catch(() => ({}))) as {
    tag?: string;
    value?: boolean;
  };
  if (!tag || !isValidTag(tag)) {
    return Response.json({ error: "Geçersiz özellik" }, { status: 400 });
  }
  if (typeof value !== "boolean") {
    return Response.json({ error: "Evet/hayır belirtilmeli" }, { status: 400 });
  }

  const d = db();
  const pin = d.prepare("SELECT 1 FROM pins WHERE id = ? AND status = 'active'").get(id);
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  const had = d
    .prepare("SELECT 1 FROM pin_tags WHERE pin_id = ? AND user_id = ? AND tag = ?")
    .get(id, user.id, tag);

  d.prepare(
    `INSERT INTO pin_tags (pin_id, user_id, tag, value) VALUES (?, ?, ?, ?)
     ON CONFLICT(pin_id, user_id, tag)
     DO UPDATE SET value = excluded.value, created_at = datetime('now')`
  ).run(id, user.id, tag, value ? 1 : -1);

  let earned = 0;
  if (!had) {
    earned = POINTS.TAG;
    awardPoints(user.id, earned, "tag");
  }
  cacheClear(); // özellik filtresi pin listesini etkiliyor

  return Response.json({ ok: true, earned, tags: tagsForPin(id) });
}
