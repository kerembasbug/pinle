import { getOrCreateUser } from "@/lib/identity";
import { makeEmailToken } from "@/lib/auth";
import { withinRateLimit } from "@/lib/moderation";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const clean = (email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
    return Response.json({ error: "Geçerli bir e-posta gir" }, { status: 400 });
  }
  // Basit kötüye kullanım koruması (pin limitini yeniden kullanıyoruz)
  if (!withinRateLimit(user.id, "report")) {
    return Response.json({ error: "Çok fazla deneme, biraz bekle" }, { status: 429 });
  }

  const token = makeEmailToken(clean);
  const link = `${SITE}/api/auth/email/verify?token=${encodeURIComponent(token)}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_FROM_EMAIL;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] magic link (email provider yok):", link);
      return Response.json({ ok: true, devLink: link });
    }
    // Prod'da sağlayıcı ayarlı değil — yanıltıcı "gönderildi" gösterme
    return Response.json(
      { error: "E-posta girişi henüz aktif değil. Şimdilik Google ile giriş yapabilirsin." },
      { status: 503 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: clean,
      subject: "Pinle — giriş bağlantın",
      html: `<div style="font-family:sans-serif;max-width:420px">
        <h2 style="color:#e8442e">📍 Pinle giriş</h2>
        <p>Hesabına giriş yapmak / kaydını korumak için bağlantıya tıkla (20 dk geçerli):</p>
        <p><a href="${link}" style="display:inline-block;background:#e8442e;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Giriş yap</a></p>
        <p style="color:#888;font-size:12px">Bu isteği sen yapmadıysan görmezden gel.</p>
      </div>`,
    }),
  });
  if (!res.ok) {
    return Response.json({ error: "E-posta gönderilemedi" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
