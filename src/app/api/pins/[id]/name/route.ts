import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { isClean, withinRateLimit } from "@/lib/moderation";
import { overloadGuard } from "@/lib/flags";
import { cacheClear } from "@/lib/pinsCache";

// Topluluk mekan adı — HERKES önerir (sahiplik yok). Kullanıcı başına 1 öneri
// (değiştirilebilir). En çok önerilen ad pins.name olarak kabul görür; eşitlikte
// en eski (orijinal) ad kazanır. Yanlış/eski/bilinmeyen adı topluluk düzeltir.
export async function POST(
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
  const { name } = (await request.json().catch(() => ({}))) as { name?: string };
  const trimmed = (name ?? "").trim().slice(0, 80);
  if (trimmed.length < 2) {
    return Response.json({ error: "İsim en az 2 karakter olmalı" }, { status: 400 });
  }
  if (!isClean(trimmed)) {
    return Response.json({ error: "Metin uygunsuz ifade içeriyor" }, { status: 400 });
  }

  const d = db();
  const pin = d.prepare("SELECT 1 FROM pins WHERE id = ? AND status = 'active'").get(id);
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  // Bu kullanıcının önerisini kaydet/güncelle
  d.prepare(
    `INSERT INTO name_votes (pin_id, user_id, name) VALUES (?, ?, ?)
     ON CONFLICT(pin_id, user_id) DO UPDATE SET name = excluded.name, created_at = datetime('now')`
  ).run(id, user.id, trimmed);

  // Kazananı hesapla: en çok oy, eşitlikte en eski öneri
  const winner = d
    .prepare(
      `SELECT name, COUNT(*) AS votes
         FROM name_votes WHERE pin_id = ?
        GROUP BY name COLLATE NOCASE
        ORDER BY votes DESC, MIN(created_at) ASC
        LIMIT 1`
    )
    .get(id) as { name: string; votes: number };

  d.prepare("UPDATE pins SET name = ? WHERE id = ?").run(winner.name, id);
  cacheClear();

  const changed = winner.name.toLocaleLowerCase("tr") !== trimmed.toLocaleLowerCase("tr");
  return Response.json({
    name: winner.name, // kabul gören (kazanan) ad
    votes: winner.votes,
    mine: trimmed,
    // Öneri kaydedildi ama henüz kazanmadıysa kullanıcıyı bilgilendir
    pending: changed,
  });
}
