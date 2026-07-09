import { getOrCreateUser, setSessionUser } from "@/lib/identity";
import { verifyGoogleIdToken, linkIdentity } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const { idToken } = (await request.json().catch(() => ({}))) as { idToken?: string };
  if (!idToken) return Response.json({ error: "Token yok" }, { status: 400 });

  const profile = await verifyGoogleIdToken(idToken);
  if (!profile) return Response.json({ error: "Google doğrulaması başarısız" }, { status: 401 });

  const { userId } = linkIdentity(user.id, { googleSub: profile.sub, email: profile.email });
  if (userId !== user.id) await setSessionUser(userId);

  const row = db().prepare("SELECT email FROM users WHERE id = ?").get(userId) as {
    email: string | null;
  };
  return Response.json({ ok: true, email: row?.email ?? profile.email });
}
