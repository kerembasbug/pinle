// Avatarlar — markaya özel fal.ai maskotları (public/avatars/*.png).
// Değer olarak id ("a1"..) saklanır. Eski kullanıcılarda emoji ("🦊") saklı
// olabilir → geriye uyum: avatarUrl null dönerse emoji metni gösterilir.
export const AVATARS = [
  // fal.ai maskotları — mahalle hayvanları + simit
  "a1", "a2", "a3", "a4", "a5", "a6",
  "a7", "a8", "a9", "a10", "a11", "a13",
  // el çizimi SVG maskotlar — Türk sokak-lezzeti & simgeleri
  "nazar", "karpuz", "limon", "ayyildiz", "zeytin", "lokum", "cay", "biber",
] as const;

export function isValidAvatar(a: string): boolean {
  return (AVATARS as readonly string[]).includes(a);
}

/** id → resim yolu; geçerli değilse (legacy emoji/boş) null. */
export function avatarUrl(a: string | null | undefined): string | null {
  return a && isValidAvatar(a) ? `/avatars/${a}.png` : null;
}
