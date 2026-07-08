"use client";

// Kullanıcının gizlediği yazarlar — yalnızca bu cihazın localStorage'ında tutulur.
// Sunucuya gönderilmez; gizlenen içerik bu cihazda görünmez olur.
const KEY = "pinle_blocked_authors";

export function getBlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function isBlocked(authorId: string): boolean {
  return getBlocked().has(authorId);
}

export function blockAuthor(authorId: string) {
  const set = getBlocked();
  set.add(authorId);
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function unblockAuthor(authorId: string) {
  const set = getBlocked();
  set.delete(authorId);
  localStorage.setItem(KEY, JSON.stringify([...set]));
}
