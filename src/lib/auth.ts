import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const SECRET = process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";

// ---------- Sihirli link token'ı (durum bilgisiz, HMAC imzalı) ----------
function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}
function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** email için 20 dk geçerli imzalı token üretir. */
export function makeEmailToken(email: string): string {
  const exp = Date.now() + 20 * 60 * 1000;
  const payload = `${b64url(email.toLowerCase())}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** token'ı doğrular, geçerliyse e-postayı döner. */
export function verifyEmailToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [emailB64, expStr, sig] = parts;
  const payload = `${emailB64}.${expStr}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Date.now() > Number(expStr)) return null;
  try {
    return Buffer.from(emailB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

// ---------- Google ID token doğrulama ----------
export type GoogleProfile = { sub: string; email: string | null };

/** Google ID token'ı Google'ın tokeninfo ucuyla doğrular (aud + exp kontrolü). */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as Record<string, string>;
  if (data.aud !== clientId) return null;
  if (!data.sub) return null;
  if (data.exp && Date.now() / 1000 > Number(data.exp)) return null;
  return { sub: data.sub, email: data.email_verified === "true" ? data.email ?? null : null };
}

// ---------- Kimlik bağlama / hesaba geçiş + birleştirme ----------
type LinkResult = { userId: string; switched: boolean };

/**
 * Doğrulanmış bir kimliği (google_sub ve/veya email) mevcut anonim kullanıcıya bağlar.
 * O kimlikle zaten bir hesap varsa ona geçer ve anonim katkıları birleştirir.
 */
export function linkIdentity(
  currentUserId: string,
  identity: { googleSub?: string; email?: string | null }
): LinkResult {
  const d = db();
  const email = identity.email?.toLowerCase() ?? null;
  const googleSub = identity.googleSub ?? null;

  // Bu kimlikle mevcut hesap var mı?
  let existing: { id: string } | undefined;
  if (googleSub) {
    existing = d.prepare("SELECT id FROM users WHERE google_sub = ?").get(googleSub) as
      | { id: string }
      | undefined;
  }
  if (!existing && email) {
    existing = d.prepare("SELECT id FROM users WHERE email = ?").get(email) as
      | { id: string }
      | undefined;
  }

  if (existing && existing.id !== currentUserId) {
    // Mevcut hesaba geçiş — anonim katkıları birleştir, kimlik alanlarını tamamla
    mergeUsers(currentUserId, existing.id);
    if (googleSub)
      d.prepare("UPDATE users SET google_sub = COALESCE(google_sub, ?) WHERE id = ?").run(
        googleSub,
        existing.id
      );
    if (email)
      d.prepare("UPDATE users SET email = COALESCE(email, ?) WHERE id = ?").run(email, existing.id);
    d.prepare("UPDATE users SET linked_at = COALESCE(linked_at, datetime('now')) WHERE id = ?").run(
      existing.id
    );
    return { userId: existing.id, switched: true };
  }

  // Kimliği mevcut (anonim) kullanıcıya iliştir
  d.prepare(
    "UPDATE users SET google_sub = COALESCE(?, google_sub), email = COALESCE(?, email), linked_at = COALESCE(linked_at, datetime('now')) WHERE id = ?"
  ).run(googleSub, email, currentUserId);
  return { userId: currentUserId, switched: false };
}

/** from kullanıcısının katkılarını to'ya taşır, from'u siler. Oylarda çakışmayı yok sayar. */
function mergeUsers(fromId: string, toId: string) {
  const d = db();
  if (fromId === toId) return;
  const tx = d.transaction(() => {
    d.prepare("UPDATE pins SET user_id = ? WHERE user_id = ?").run(toId, fromId);
    d.prepare("UPDATE comments SET user_id = ? WHERE user_id = ?").run(toId, fromId);
    d.prepare("INSERT OR IGNORE INTO votes (pin_id, user_id, value, created_at) SELECT pin_id, ?, value, created_at FROM votes WHERE user_id = ?").run(toId, fromId);
    d.prepare("DELETE FROM votes WHERE user_id = ?").run(fromId);
    d.prepare("INSERT OR IGNORE INTO reports (pin_id, user_id, created_at) SELECT pin_id, ?, created_at FROM reports WHERE user_id = ?").run(toId, fromId);
    d.prepare("DELETE FROM reports WHERE user_id = ?").run(fromId);
    d.prepare("UPDATE points_events SET user_id = ? WHERE user_id = ?").run(toId, fromId);
    // Puanı yeniden hesapla (birleşme sonrası tutarlı)
    d.prepare(
      "UPDATE users SET points = (SELECT COALESCE(SUM(points),0) FROM points_events WHERE user_id = ?) WHERE id = ?"
    ).run(toId, toId);
    d.prepare("DELETE FROM users WHERE id = ?").run(fromId);
  });
  tx();
}
