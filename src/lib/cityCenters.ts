// Şehir merkezleri — TEK KAYNAK. Burada db import'u YOK, bu yüzden hem sunucu
// (lib/cities.ts, SEO sayfaları) hem istemci (SearchSheet çipleri) kullanabilir.
// Daha önce liste iki yerde ayrı ayrı duruyordu ve birbirinden kaydı: Muğla'nın
// merkezi hiç pin olmayan bir noktayı gösteriyordu (bkz. scripts/check-city-centers.mjs).

export type City = {
  slug: string;
  name: string; // pins.city ile birebir eşleşmeli
  center: [number, number]; // [lng, lat]
  /** Varsayılan 12.5 (şehir içi). Pinleri geniş alana yayılmış iller için düşür. */
  zoom?: number;
};

// Pilot 7 şehir. slug'lar ASCII (SEO dostu URL). name, DB'deki city değeriyle aynı.
export const CITIES: City[] = [
  { slug: "istanbul", name: "İstanbul", center: [28.98, 41.03] },
  { slug: "ankara", name: "Ankara", center: [32.85, 39.92] },
  { slug: "izmir", name: "İzmir", center: [27.14, 38.42] },
  // Muğla ŞEHRİNDE pin yok — veri kıyıda (Bodrum ~27.4, Marmaris ~28.3,
  // Fethiye ~29.1). İl görünümü ver, kullanıcı kümeye dokunup insin.
  { slug: "mugla", name: "Muğla", center: [28.2, 36.9], zoom: 8 },
  { slug: "aydin", name: "Aydın", center: [27.84, 37.85] },
  { slug: "manisa", name: "Manisa", center: [27.43, 38.61] },
  // Eski merkez [29.09, 37.85] şehrin ~8km kuzeyinde boşluktaydı (19 pin);
  // gerçek şehir merkezi 389 pin gösteriyor.
  { slug: "denizli", name: "Denizli", center: [29.081, 37.777] },
];

/** Aramada ayrıca gösterilen destinasyonlar (kendi başına "şehir" değil). */
export const EXTRA_PLACES: City[] = [
  { slug: "bodrum", name: "Bodrum", center: [27.43, 37.03] },
];

/** Arama sayfasındaki çipler: şehirler + destinasyonlar. */
export const PLACE_CHIPS: City[] = [
  ...CITIES.slice(0, 4),
  ...EXTRA_PLACES,
  ...CITIES.slice(4),
];

export const DEFAULT_CITY_ZOOM = 12.5;

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
