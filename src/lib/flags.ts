// Acil durum anahtarları (Plan B). Coolify'da env değişip restart atılınca aktifleşir.

/**
 * PINLE_READONLY=1 → tüm yazma uçları 503 döner, okuma/harita çalışmaya devam
 * eder. Viral yük altında DB yazma yarışını keser; kullanıcıya dostça mesaj.
 * Yazma route'larının başında çağır: `const g = overloadGuard(); if (g) return g;`
 */
export function overloadGuard(): Response | null {
  if (process.env.PINLE_READONLY === "1") {
    return Response.json(
      { error: "Şu an yoğunluk var — harita açık, yeni ekleme kısa süreliğine kapalı. Birazdan tekrar dene 🙏" },
      { status: 503, headers: { "Retry-After": "120" } }
    );
  }
  return null;
}
