// Mekan özellikleri ("… dostu") — topluluk doğrulamalı.
//
// Neden bunlar: hepsi ÇOK ARANAN ama internette güvenilir cevabı OLMAYAN
// sorular. Google'da "köpek kabul eden kafe" arayan biri forum yorumlarına,
// 3 yıllık Instagram gönderilerine düşüyor. Fiyat gibi bu da yalnız orada
// olanın bildiği, zamanla değişen bir bilgi → aynı topluluk çarkı çalışır.
//
// Kural: her özellik NET bir evet/hayır sorusu olmalı. "Güzel mi?" gibi
// öznel şeyler BİLİNÇLİ olarak yok — onlar yorum bölümünün işi.

export type VenueTag = {
  id: string;
  /** Rozet metni (kısa, mekanın üstünde görünür) */
  label: string;
  emoji: string;
  /** Katkı sorusu — kullanıcıya bu şekilde sorulur */
  question: string;
  /** Doğrulanınca ne anlama geldiği (rozete dokununca / SEO açıklaması) */
  detail: string;
  /** SEO sayfası slug'ı ve arama karşılığı */
  slug: string;
  seoTitle: string;
  /**
   * Bu özelliğin sorulduğu yer tipleri (categories.ts PLACE_TYPES id'leri).
   * Tanımsız = her mekanda sorulur. NOT: isPriceable kullanılmaz — o market,
   * benzinlik ve plajı da kapsıyor, "vejetaryen seçenek" oralarda saçma olur.
   */
  types?: readonly string[];
};

// Yeme-içme mekanları
const YEME = ["restoran", "doner", "kafe", "firin", "bar", "beach"] as const;
// Alkol: yeme-içme + MARKET (tekel bayii — "bu markette içki var mı" da aranan
// ama bulunamayan bilgi). Fırın hariç.
const ALKOL = ["restoran", "doner", "kafe", "bar", "beach", "market"] as const;
// Priz+wifi ile oturmak: bar/plaj degil, kafe-agirlikli
const CALISMA = ["kafe", "restoran", "firin"] as const;

export const VENUE_TAGS: readonly VenueTag[] = [
  {
    id: "pati",
    label: "Pati dostu",
    emoji: "🐾",
    question: "Evcil hayvanla girilebiliyor mu?",
    detail: "Kedi/köpeğinle içeri girebilirsin.",
    slug: "pati-dostu",
    seoTitle: "Pati Dostu Mekanlar",
  },
  {
    id: "cocuk",
    label: "Çocuk dostu",
    emoji: "👶",
    question: "Mama sandalyesi / çocuk için uygun mu?",
    detail: "Mama sandalyesi var, çocukla rahat oturulur.",
    slug: "cocuk-dostu",
    seoTitle: "Çocuk Dostu Mekanlar",
    types: YEME,
  },
  {
    id: "erisim",
    label: "Engelsiz erişim",
    emoji: "♿",
    question: "Tekerlekli sandalyeyle girilebiliyor mu?",
    detail: "Girişte basamak/rampa sorunu yok, içeride dönüş alanı var.",
    slug: "engelsiz-erisim",
    seoTitle: "Engelsiz Erişimi Olan Mekanlar",
  },
  {
    id: "kart",
    label: "Kart geçiyor",
    emoji: "💳",
    question: "Kredi kartı geçiyor mu?",
    detail: "Nakit taşımana gerek yok.",
    slug: "kart-gecen",
    seoTitle: "Kart Geçen Mekanlar",
  },
  {
    id: "calisma",
    label: "Çalışılır",
    emoji: "🔌",
    question: "Priz + wifi var, saatlerce oturulur mu?",
    detail: "Priz ve wifi var; laptopla oturmak sorun olmuyor.",
    slug: "calismaya-uygun",
    seoTitle: "Çalışmaya Uygun Kafeler",
    types: CALISMA,
  },
  {
    id: "bahce",
    label: "Bahçe / açık alan",
    emoji: "🌳",
    question: "Bahçesi ya da açık oturma alanı var mı?",
    detail: "Açık havada oturabileceğin bir alanı var.",
    slug: "bahceli",
    seoTitle: "Bahçeli Mekanlar",
    types: YEME,
  },
  {
    id: "alkol",
    label: "İçkili",
    emoji: "🍷",
    question: "Alkol servisi var mı?",
    detail: "Bira/rakı/şarap servisi yapılıyor.",
    slug: "ickili",
    seoTitle: "İçkili Mekanlar — Alkol Servisi Olan Yerler",
    types: ALKOL,
  },
  {
    id: "vejetaryen",
    label: "Vejetaryen seçenek",
    emoji: "🥗",
    question: "Etsiz (vejetaryen) seçenek var mı?",
    detail: "Menüde etsiz doyurucu bir seçenek var.",
    slug: "vejetaryen",
    seoTitle: "Vejetaryen Seçeneği Olan Mekanlar",
    types: YEME,
  },
  {
    id: "otopark",
    label: "Otopark",
    emoji: "🅿️",
    question: "Park yeri / otoparkı var mı?",
    detail: "Aracını bırakabileceğin bir yer var.",
    slug: "otoparkli",
    seoTitle: "Otoparklı Mekanlar",
  },
] as const;

export const TAG_IDS: readonly string[] = VENUE_TAGS.map((t) => t.id);

export function tagById(id: string): VenueTag | undefined {
  return VENUE_TAGS.find((t) => t.id === id);
}

export function tagBySlug(slug: string): VenueTag | undefined {
  return VENUE_TAGS.find((t) => t.slug === slug);
}

export function isValidTag(id: string): boolean {
  return TAG_IDS.includes(id);
}

/**
 * Bu mekanda hangi özellikler sorulur.
 * `placeTypeId` = categories.ts placeTypeIdOf(pin.category) sonucu.
 */
export function tagsForVenue(placeTypeId: string): readonly VenueTag[] {
  return VENUE_TAGS.filter((t) => !t.types || t.types.includes(placeTypeId));
}

/** Bir özelliğin topluluk oylarından çıkan sonucu. */
export type TagVerdict = {
  id: string;
  yes: number;
  no: number;
  /** true = var, false = yok, null = yeterli bilgi yok */
  value: boolean | null;
};

/**
 * Karar kuralı: çoğunluk kazanır, eşitlikte "bilinmiyor".
 * Tek kişilik bilgi de gösterilir (sayı da gösterilerek — kullanıcı kendi
 * tartsın), fiyattaki yaklaşımın aynısı.
 */
export function verdictOf(yes: number, no: number): boolean | null {
  if (yes === 0 && no === 0) return null;
  if (yes === no) return null;
  return yes > no;
}
