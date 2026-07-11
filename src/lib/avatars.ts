// Emoji avatarlar — sabit liste (serbest metin YOK: XSS/troll riski sıfır,
// UI tutarlı kalır). Sokak lezzeti + mahalle hayvanları + nazar teması.
export const AVATARS = [
  "🐱", "🐶", "🦊", "🦉", "🐝", "🐢", "🦀", "🐙",
  "🦜", "🐐", "🦔", "🐟", "🐿️", "🐸", "🦆", "🐞",
  "🧿", "🌶️", "🍉", "🥒", "🧀", "🍇", "🍒", "🥕",
  "🍞", "🥙", "☕", "🍦", "🥟", "🍋", "🌽", "🫒",
] as const;

export function isValidAvatar(a: string): boolean {
  return (AVATARS as readonly string[]).includes(a);
}
