import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { authorIdFor } from "@/lib/authorId";
import { overloadGuard } from "@/lib/flags";

// Davet kodu bağlama: ?ref=KOD ile gelen YENİ kullanıcı bunu bir kez çağırır.
// Kod = davet edenin opak authorId'si (gerçek id ifşa edilmez). Davet eden,
// davetli İLK pinini atınca puan kazanır (pins POST'ta) — ziyaret farm'ı işlemez.
const codeCache = new Map<string, string>(); // authorId → users.id

function resolveCode(code: string): string | null {
  const hit = codeCache.get(code);
  if (hit) return hit;
  const rows = db().prepare("SELECT id FROM users").all() as { id: string }[];
  for (const r of rows) {
    const c = authorIdFor(r.id);
    if (!codeCache.has(c)) codeCache.set(c, r.id);
    if (c === code) return r.id;
  }
  return null;
}

export async function POST(request: Request) {
  const g = overloadGuard();
  if (g) return g;
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  if (!code || !/^[a-f0-9]{16}$/.test(code)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const user = await getOrCreateUser();
  const d = db();
  const me = d
    .prepare("SELECT referred_by, (SELECT COUNT(*) FROM pins WHERE user_id = users.id) AS pins FROM users WHERE id = ?")
    .get(user.id) as { referred_by: string | null; pins: number };
  // Yalnızca gerçekten yeni kullanıcı: daha önce bağlanmamış + hiç pini yok
  if (me.referred_by || me.pins > 0 || authorIdFor(user.id) === code) {
    return Response.json({ ok: false });
  }
  const referrer = resolveCode(code);
  if (!referrer || referrer === user.id) return Response.json({ ok: false });
  d.prepare("UPDATE users SET referred_by = ?, referred_at = datetime('now') WHERE id = ?").run(
    referrer,
    user.id,
  );
  return Response.json({ ok: true });
}
