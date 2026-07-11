import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { isValidAvatar } from "@/lib/avatars";
import { overloadGuard } from "@/lib/flags";

// Profil güncelleme — şimdilik yalnız emoji avatar (sabit listeden).
export async function POST(request: Request) {
  const g = overloadGuard();
  if (g) return g;
  const { avatar } = (await request.json().catch(() => ({}))) as { avatar?: string };
  if (typeof avatar !== "string" || !isValidAvatar(avatar)) {
    return Response.json({ error: "Geçersiz avatar" }, { status: 400 });
  }
  const user = await getOrCreateUser();
  db().prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, user.id);
  return Response.json({ ok: true, avatar });
}
