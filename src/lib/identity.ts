import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "pinle_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

const ADJECTIVES = [
  "Acıkmış", "Turşucu", "Kaşarlı", "Gezgin", "Uykusuz", "Meraklı", "Çaycı",
  "Sabahçı", "Tok", "Cimri", "Şanslı", "Havalı", "Sessiz", "Telaşlı", "Neşeli", "Bereketli",
];
const ANIMALS = [
  "Martı", "Kedi", "Karga", "Kirpi", "Baykuş", "Sincap", "Fok", "Panda",
  "Leylek", "Keçi", "Tavşan", "Kaplumbağa", "Serçe", "Yunus", "Ayı", "Tilki",
];

function nameFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(h / 31) % ANIMALS.length];
  const num = (h % 900) + 100;
  return `${adj} ${animal} #${num}`;
}

/**
 * Anonim kimlik: çerezden uid okur, yoksa üretir ve set eder.
 * Sadece Route Handler / Server Action içinde çağrılmalı (cookie set edebilmek için).
 */
export async function getOrCreateUser(): Promise<{ id: string; name: string }> {
  const store = await cookies();
  let uid = store.get(COOKIE)?.value;
  if (!uid || !/^[0-9a-f-]{36}$/.test(uid)) {
    uid = crypto.randomUUID();
    store.set(COOKIE, uid, {
      maxAge: ONE_YEAR,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
  const d = db();
  const existing = d.prepare("SELECT id, name FROM users WHERE id = ?").get(uid) as
    | { id: string; name: string }
    | undefined;
  if (existing) return existing;
  const name = nameFromId(uid);
  d.prepare("INSERT INTO users (id, name) VALUES (?, ?)").run(uid, name);
  return { id: uid, name };
}

/** Salt-okur varyant: çerez yoksa null döner, cookie set etmez (Server Component'ler için). */
export async function getUserIfExists(): Promise<{ id: string; name: string } | null> {
  const store = await cookies();
  const uid = store.get(COOKIE)?.value;
  if (!uid) return null;
  const row = db().prepare("SELECT id, name FROM users WHERE id = ?").get(uid) as
    | { id: string; name: string }
    | undefined;
  return row ?? null;
}

/** Oturum çerezini belirli bir kullanıcıya ayarlar (hesaba geçiş / login sonrası). */
export async function setSessionUser(userId: string) {
  const store = await cookies();
  store.set(COOKIE, userId, { maxAge: ONE_YEAR, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
}

/** Çıkış: yeni anonim kimlik başlatır. */
export async function logout() {
  const store = await cookies();
  const uid = crypto.randomUUID();
  store.set(COOKIE, uid, { maxAge: ONE_YEAR, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  const name = nameFromId(uid);
  db().prepare("INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)").run(uid, name);
}
