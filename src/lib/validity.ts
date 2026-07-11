// Fiyat/indirim geçerlilik tarihi yardımcıları (YYYY-MM-DD, yerel gün bazlı).

/**
 * Kullanıcıdan gelen geçerlilik tarihini doğrula/normalize et.
 * - boş/tanımsız → null (opsiyonel alan)
 * - format YYYY-MM-DD değilse ya da geçmiş/çok ileri (>1 yıl) ise → { error }
 */
export function cleanValidUntil(raw: unknown): { value: string | null } | { error: string } {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return { value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { error: "Geçerlilik tarihi biçimi hatalı" };
  const d = new Date(s + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { error: "Geçersiz tarih" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() < today.getTime()) return { error: "Geçmiş bir tarih olamaz" };
  const maxAhead = today.getTime() + 366 * 24 * 60 * 60 * 1000;
  if (d.getTime() > maxAhead) return { error: "En fazla 1 yıl sonrası" };
  return { value: s };
}

/**
 * Görüntü etiketi: geçerlilik tarihine göre kalan gün metni.
 * Dönüş: { kind: "active"|"today"|"expired"|"none", text }
 */
export function validityLabel(validUntil: string | null | undefined): {
  kind: "active" | "today" | "expired" | "none";
  text: string;
} {
  if (!validUntil) return { kind: "none", text: "" };
  const d = new Date(validUntil + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { kind: "none", text: "" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  const pretty = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  if (days < 0) return { kind: "expired", text: `${pretty}'de doldu` };
  if (days === 0) return { kind: "today", text: "Bugün son gün" };
  if (days === 1) return { kind: "active", text: "Son 1 gün" };
  if (days <= 14) return { kind: "active", text: `${days} gün geçerli` };
  return { kind: "active", text: `${pretty}'e kadar` };
}
