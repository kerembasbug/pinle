// Pinle artık yalnızca FİYAT ODAKLI mekanlar. Anı/Sorun katmanları kaldırıldı.
// Kategori modeli tek seviye: ~12 "yer tipi". Ne aldığın "ürün/hizmet" alanına
// (price_item) yazılır; tür yalnızca mekanı sınıflar. Eski (OSM seed) ince
// kategori id'leri veri ve SEO için LEGACY tablosunda korunur ve yer tipine eşlenir.

export type PinKind = "lezzet" | "ani" | "sorun";

export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type PlaceType = Category & { priceable?: boolean };

export type KindMeta = {
  id: PinKind;
  label: string;
  emoji: string;
  hasPrice: boolean;
  voteYes: string; // value: 1
  voteNo: string | null; // value: -1, null ise tek buton
  namePlaceholder: string;
  notePlaceholder: string;
  formTitle: string;
  formHint: string;
};

// Tek kind kaldı (mekan). KINDS tek elemanlı; kind sekmesi UI'dan kalktı.
export const KINDS: KindMeta[] = [
  {
    id: "lezzet",
    label: "Mekanlar",
    emoji: "🏪",
    hasPrice: true,
    voteYes: "✓ Hâlâ bu fiyat",
    voteNo: "📈 Zamlandı",
    namePlaceholder: "Mekan adı * (örn. Tarihi Adem Usta)",
    notePlaceholder: "Not (örn. Kuru fasulye + pilav + ayran bu fiyata)",
    formTitle: "Yeni Pin 📌",
    formHint: "Ucuz ve iyi bir yer mi buldun? Mahalle duysun.",
  },
];

// ---- TEK SEVİYE YER TİPLERİ (yeni pin + harita filtresi seçimi) ----
// priceable: çıplak fiyat/"₺?" daveti anlamlı mı (yeme-içme, market, oto). Diğer
// tiplerde de fiyat girilir ama "₺?" nag'i gösterilmez.
export const PLACE_TYPES: PlaceType[] = [
  { id: "restoran", label: "Restoran / Lokanta", emoji: "🍽️", priceable: true },
  { id: "doner", label: "Döner / Dürüm", emoji: "🥙", priceable: true },
  { id: "kafe", label: "Kafe / Çay", emoji: "☕", priceable: true },
  { id: "firin", label: "Fırın / Tatlı", emoji: "🍞", priceable: true },
  { id: "bar", label: "Bar / Meyhane", emoji: "🍺", priceable: true },
  { id: "beach", label: "Beach Club / Plaj", emoji: "🏖️", priceable: true },
  { id: "market", label: "Market / Manav", emoji: "🛒", priceable: true },
  { id: "kuafor", label: "Kuaför / Güzellik", emoji: "💈" },
  { id: "hizmet", label: "Usta / Tamir", emoji: "🔧" },
  { id: "saglik", label: "Eczane / Sağlık", emoji: "💊" },
  { id: "oto", label: "Benzin / Oto", emoji: "⛽", priceable: true },
  { id: "gezi", label: "Park / Gezi", emoji: "🌳" },
  { id: "diger", label: "Diğer", emoji: "📍" },
];

// ---- Eski ince kategoriler (OSM seed & mevcut pinler & SEO). Görüntü için
// korunur; her biri bir yer tipine eşlenir (filtre genişletme + fiyat kararı). ----
const LEGACY_CATEGORIES: Category[] = [
  { id: "lokanta", label: "Esnaf Lokantası", emoji: "🍲" },
  { id: "kebap", label: "Kebap & Izgara", emoji: "🍢" },
  { id: "pide", label: "Pide & Lahmacun", emoji: "🫓" },
  { id: "cigkofte", label: "Çiğ Köfte", emoji: "🌯" },
  { id: "tost", label: "Büfe & Tost", emoji: "🥪" },
  { id: "kokorec", label: "Kokoreç & Midye", emoji: "🐚" },
  { id: "balik", label: "Balık", emoji: "🐟" },
  { id: "corba", label: "Çorba", emoji: "🥣" },
  { id: "kahvalti", label: "Kahvaltı", emoji: "🍳" },
  { id: "tatli", label: "Tatlı & Fırın", emoji: "🍮" },
  { id: "dondurma", label: "Dondurma", emoji: "🍦" },
  { id: "caybahce", label: "Çay Bahçesi", emoji: "🫖" },
  { id: "kahveci", label: "Kahveci", emoji: "☕" },
  { id: "ickili-restoran", label: "İçkili Restoran", emoji: "🍷" },
  { id: "meyhane", label: "Meyhane", emoji: "🍶" },
  { id: "gece-kulubu", label: "Gece Kulübü", emoji: "🎶" },
  { id: "nargile", label: "Nargile", emoji: "💨" },
  { id: "manav", label: "Manav", emoji: "🥬" },
  { id: "kasap", label: "Kasap", emoji: "🥩" },
  { id: "sarkuteri", label: "Şarküteri", emoji: "🧀" },
  { id: "kuruyemis", label: "Kuruyemiş & Baharat", emoji: "🥜" },
  { id: "giyim", label: "Giyim & Ayakkabı", emoji: "👕" },
  { id: "kirtasiye", label: "Kırtasiye & Kitap", emoji: "📚" },
  { id: "teknoloji", label: "Teknoloji", emoji: "🔌" },
  { id: "hediyelik", label: "Hediyelik & Çiçek", emoji: "🎁" },
  { id: "guzellik", label: "Güzellik & Bakım", emoji: "💅" },
  { id: "terzi", label: "Terzi", emoji: "🧵" },
  { id: "tamir", label: "Tamir & Usta", emoji: "🛠️" },
  { id: "kurutemizleme", label: "Kuru Temizleme", emoji: "🧺" },
  { id: "nalbur", label: "Nalbur & Hırdavat", emoji: "🔩" },
  { id: "benzinlik", label: "Benzinlik", emoji: "⛽" },
  { id: "otopark", label: "Otopark", emoji: "🅿️" },
  { id: "otogaleri", label: "Oto Galeri", emoji: "🚗" },
  { id: "lastik", label: "Lastik & Servis", emoji: "🔧" },
  { id: "eczane", label: "Eczane", emoji: "💊" },
  { id: "klinik", label: "Klinik & Hastane", emoji: "🏥" },
  { id: "dishekimi", label: "Diş", emoji: "🦷" },
  { id: "optik", label: "Optik", emoji: "👓" },
  { id: "veteriner", label: "Veteriner", emoji: "🐾" },
  { id: "park", label: "Park & Bahçe", emoji: "🌳" },
  { id: "muze", label: "Müze & Kültür", emoji: "🏛️" },
  { id: "sinema", label: "Sinema & Sahne", emoji: "🎬" },
  { id: "spor", label: "Spor Salonu", emoji: "🏋️" },
  { id: "oyunsalonu", label: "Oyun Salonu", emoji: "🎮" },
];

// Eski ince id → yeni yer tipi id. (Aynı kalanlar: doner, kafe, firin→firin,
// market, diger; bunlar hem legacy hem place-type.)
const LEGACY_TO_TYPE: Record<string, string> = {
  lokanta: "restoran", kebap: "restoran", pide: "restoran", cigkofte: "restoran",
  tost: "restoran", kokorec: "restoran", balik: "restoran", corba: "restoran",
  kahvalti: "restoran",
  tatli: "firin", dondurma: "firin", sarkuteri: "firin",
  caybahce: "kafe", kahveci: "kafe",
  "ickili-restoran": "bar", meyhane: "bar", "gece-kulubu": "bar", nargile: "bar",
  manav: "market", kasap: "market", kuruyemis: "market", giyim: "market",
  kirtasiye: "market", teknoloji: "market", hediyelik: "market",
  guzellik: "kuafor",
  terzi: "hizmet", tamir: "hizmet", kurutemizleme: "hizmet", nalbur: "hizmet",
  benzinlik: "oto", otopark: "oto", otogaleri: "oto", lastik: "oto",
  klinik: "saglik", dishekimi: "saglik", optik: "saglik", veteriner: "saglik",
  muze: "gezi", sinema: "gezi", spor: "gezi", oyunsalonu: "gezi",
};

// Görüntü lookup'ı: yer tipleri + eski kategoriler (eski pinlerin emojisi korunur).
const LOOKUP = new Map<string, Category>();
for (const t of PLACE_TYPES) LOOKUP.set(t.id, { id: t.id, label: t.label, emoji: t.emoji });
for (const c of LEGACY_CATEGORIES) if (!LOOKUP.has(c.id)) LOOKUP.set(c.id, c);

const PRICEABLE_TYPE_IDS = new Set(PLACE_TYPES.filter((t) => t.priceable).map((t) => t.id));

export function kindMeta(_id?: string): KindMeta {
  return KINDS[0];
}

export function isValidKind(id: string): id is PinKind {
  // Yalnızca mekan üretilir; eski "ani/sorun" gelen POST'ları reddet.
  return id === "lezzet";
}

export function categoryById(id: string): Category {
  return LOOKUP.get(id) ?? { id: "diger", label: "Diğer", emoji: "📍" };
}

// Geçerli kategori mi? Hem yeni yer tipi hem eski ince id kabul edilir (yeni pin
// POST'u yer tipi gönderir; SEO ?kategori= eski id olabilir).
export function categoryInKind(_kind: PinKind, categoryId: string): boolean {
  return LOOKUP.has(categoryId);
}

// Bir kategori/yer tipi hangi yer tipine ait? (legacy→type ya da kendisi)
export function placeTypeIdOf(categoryId: string): string {
  return LEGACY_TO_TYPE[categoryId] ?? categoryId;
}

// Harita filtresi: bir yer tipi seçilince o tipi + tüm eski alt id'lerini kapsa
// (eski OSM pinleri ince id taşır, yeni pinler yer tipi id taşır).
export function categoryFilterIds(placeTypeId: string): string[] {
  const ids = [placeTypeId];
  for (const [legacy, t] of Object.entries(LEGACY_TO_TYPE)) {
    if (t === placeTypeId) ids.push(legacy);
  }
  return ids;
}

// Fiyat "₺?" daveti anlamlı mı — yer tipine göre (legacy id de çözülür).
export function isPriceable(_kind: string, categoryId: string): boolean {
  return PRICEABLE_TYPE_IDS.has(placeTypeIdOf(categoryId));
}

// ---- Fiyat kalemi ("ne için?") hızlı önerileri — yer tipine göre ----
const ITEM_SUGGESTIONS: Record<string, string[]> = {
  restoran: ["Porsiyon yemek", "4 çeşit menü", "Sulu yemek + pilav", "Kebap porsiyon", "Balık ekmek", "Çorba"],
  doner: ["Döner dürüm", "Yarım ekmek döner", "Tombik", "İskender"],
  kafe: ["Çay", "Türk kahvesi", "Filtre kahve", "Latte", "Limonata"],
  firin: ["Ekmek", "Simit", "Poğaça", "Börek (kilo)", "Baklava porsiyon"],
  bar: ["Bira (50cl)", "Rakı (kadeh)", "Kokteyl", "Kadeh şarap", "Meze"],
  beach: ["Şezlong + şemsiye (günlük)", "Giriş", "Bira", "Tost"],
  market: ["Su (5L)", "Ekmek", "Süt (1L)", "Yumurta (15'li)"],
  kuafor: ["Saç kesimi", "Sakal", "Saç + sakal", "Fön"],
  hizmet: ["Servis ücreti", "Saatlik işçilik", "Tamir", "Montaj"],
  saglik: ["Muayene", "Diş dolgusu", "Gözlük"],
  oto: ["Benzin (litre)", "Motorin (litre)", "LPG (litre)", "Otopark (saat)"],
  gezi: ["Giriş", "Şezlong (günlük)", "Kano (1 saat)", "Bisiklet (1 saat)"],
  diger: ["1 saat kiralama", "Günlük", "Giriş ücreti", "Servis ücreti"],
};
const GENERIC_ITEM_SUGGESTIONS = ["Porsiyon", "Adet", "1 saat kiralama", "Günlük", "Servis ücreti"];
export function itemSuggestionsFor(categoryId: string): string[] {
  return ITEM_SUGGESTIONS[placeTypeIdOf(categoryId)] ?? GENERIC_ITEM_SUGGESTIONS;
}
