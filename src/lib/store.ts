// Google Play bağlantısı tek kaynaktan yönetilir.
export const PLAY_PACKAGE = "app.pinle.twa";

/**
 * Play mağaza linki. `source` verilirse Play Console → "Kazanım raporları"nda
 * kurulumun hangi yüzeyden geldiği görünür (utm, referrer parametresi içinde
 * TEK SEFER encode edilmeli — çift encode edilirse Play sessizce yok sayar).
 */
export function playUrl(source?: string): string {
  const base = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`;
  if (!source) return base;
  const ref = `utm_source=pinle.app&utm_medium=web&utm_campaign=${source}`;
  return `${base}&referrer=${encodeURIComponent(ref)}`;
}

/** Katkı sonrası değerlendirme istemi için Play'in yorumlar görünümü. */
export function playReviewUrl(source = "post_contribution_review"): string {
  return `${playUrl(source)}&showAllReviews=true`;
}

/**
 * Uygulama olarak mı açılmış? (Play/TWA ya da ana ekrana eklenmiş PWA)
 * TWA, Custom Tabs üzerinden yüklendiği için hem `android-app://` referrer'ı
 * hem de standalone display-mode verir. Zaten uygulamadaysa "uygulamayı indir"
 * göstermek saçma — bu yüzden tüm indirme çağrıları bunu kontrol etmeli.
 */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.referrer.startsWith("android-app://") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent) && !/windows phone/i.test(navigator.userAgent);
}
