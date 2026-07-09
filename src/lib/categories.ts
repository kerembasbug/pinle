export type PinKind = "lezzet" | "ani" | "sorun";

export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type CategoryGroup = {
  id: string;
  label: string;
  emoji: string;
  categories: Category[];
};

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
  {
    id: "ani",
    label: "Anı",
    emoji: "💌",
    hasPrice: false,
    voteYes: "❤️ Dokundu",
    voteNo: null,
    namePlaceholder: "Başlık * (örn. İlk buluşma bankı)",
    notePlaceholder: "Anını anlat… burada ne oldu? (anonim)",
    formTitle: "Anı Bırak 💌",
    formHint: "Bu noktada yaşadığın bir anıyı anonim olarak bırak.",
  },
  {
    id: "sorun",
    label: "Sorun",
    emoji: "⚠️",
    hasPrice: false,
    voteYes: "⚠️ Hâlâ duruyor",
    voteNo: "✅ Çözüldü",
    namePlaceholder: "Sorun başlığı * (örn. Kavşakta dev çukur)",
    notePlaceholder: "Detay (ne zamandır var, ne kadar tehlikeli…)",
    formTitle: "Sorun Bildir ⚠️",
    formHint: "Mahallendeki sorunu haritaya işle, görünür olsun.",
  },
];

// Gruplı hiyerarşi: üstte az sayıda ana grup, dokununca alt kategoriler açılır.
// "Tüm yerleri kapsasın ama şişmesin" — 7 grup, her grubun altında ilgili kategoriler.
export const CATEGORY_GROUPS: Record<PinKind, CategoryGroup[]> = {
  lezzet: [
    {
      id: "g-yeme",
      label: "Yeme-İçme",
      emoji: "🍽️",
      categories: [
        { id: "lokanta", label: "Esnaf Lokantası", emoji: "🍲" },
        { id: "doner", label: "Döner", emoji: "🥙" },
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
      ],
    },
    {
      id: "g-kafe",
      label: "Kafe",
      emoji: "☕",
      categories: [
        { id: "kafe", label: "Kafe", emoji: "☕" },
        { id: "caybahce", label: "Çay Bahçesi", emoji: "🫖" },
        { id: "kahveci", label: "Kahveci", emoji: "☕" },
      ],
    },
    {
      id: "g-bar",
      label: "Bar & Gece",
      emoji: "🍺",
      categories: [
        { id: "ickili-restoran", label: "İçkili Restoran", emoji: "🍷" },
        { id: "meyhane", label: "Meyhane", emoji: "🍶" },
        { id: "bar", label: "Bar & Pub", emoji: "🍺" },
        { id: "gece-kulubu", label: "Gece Kulübü", emoji: "🎶" },
        { id: "nargile", label: "Nargile", emoji: "💨" },
      ],
    },
    {
      id: "g-market",
      label: "Market & Alışveriş",
      emoji: "🛒",
      categories: [
        { id: "market", label: "Market", emoji: "🛒" },
        { id: "manav", label: "Manav", emoji: "🥬" },
        { id: "kasap", label: "Kasap", emoji: "🥩" },
        { id: "firin", label: "Ekmek & Fırın", emoji: "🍞" },
        { id: "sarkuteri", label: "Şarküteri", emoji: "🧀" },
        { id: "kuruyemis", label: "Kuruyemiş & Baharat", emoji: "🥜" },
        { id: "giyim", label: "Giyim & Ayakkabı", emoji: "👕" },
        { id: "kirtasiye", label: "Kırtasiye & Kitap", emoji: "📚" },
        { id: "teknoloji", label: "Teknoloji", emoji: "🔌" },
        { id: "hediyelik", label: "Hediyelik & Çiçek", emoji: "🎁" },
      ],
    },
    {
      id: "g-hizmet",
      label: "Hizmet",
      emoji: "🔧",
      categories: [
        { id: "kuafor", label: "Kuaför & Berber", emoji: "💈" },
        { id: "guzellik", label: "Güzellik & Bakım", emoji: "💅" },
        { id: "terzi", label: "Terzi", emoji: "🧵" },
        { id: "tamir", label: "Tamir & Usta", emoji: "🛠️" },
        { id: "kurutemizleme", label: "Kuru Temizleme", emoji: "🧺" },
        { id: "nalbur", label: "Nalbur & Hırdavat", emoji: "🔩" },
      ],
    },
    {
      id: "g-oto",
      label: "Akaryakıt & Oto",
      emoji: "⛽",
      categories: [
        { id: "benzinlik", label: "Benzinlik", emoji: "⛽" },
        { id: "otopark", label: "Otopark", emoji: "🅿️" },
        { id: "otogaleri", label: "Oto Galeri", emoji: "🚗" },
        { id: "lastik", label: "Lastik & Servis", emoji: "🔧" },
      ],
    },
    {
      id: "g-saglik",
      label: "Sağlık",
      emoji: "💊",
      categories: [
        { id: "eczane", label: "Eczane", emoji: "💊" },
        { id: "klinik", label: "Klinik & Hastane", emoji: "🏥" },
        { id: "dishekimi", label: "Diş", emoji: "🦷" },
        { id: "optik", label: "Optik", emoji: "👓" },
        { id: "veteriner", label: "Veteriner", emoji: "🐾" },
      ],
    },
    {
      id: "g-gezi",
      label: "Gezi & Eğlence",
      emoji: "🌳",
      categories: [
        { id: "park", label: "Park & Bahçe", emoji: "🌳" },
        { id: "muze", label: "Müze & Kültür", emoji: "🏛️" },
        { id: "sinema", label: "Sinema & Sahne", emoji: "🎬" },
        { id: "spor", label: "Spor Salonu", emoji: "🏋️" },
        { id: "oyunsalonu", label: "Oyun Salonu", emoji: "🎮" },
        { id: "diger", label: "Diğer", emoji: "📍" },
      ],
    },
  ],
  ani: [
    {
      id: "g-ani",
      label: "Anı",
      emoji: "💌",
      categories: [
        { id: "ask", label: "Aşk", emoji: "💘" },
        { id: "nostalji", label: "Nostalji", emoji: "🕰️" },
        { id: "itiraf", label: "İtiraf", emoji: "🤫" },
        { id: "komik", label: "Komik", emoji: "😂" },
        { id: "ani-diger", label: "Diğer", emoji: "💭" },
      ],
    },
  ],
  sorun: [
    {
      id: "g-sorun",
      label: "Sorun",
      emoji: "⚠️",
      categories: [
        { id: "cukur", label: "Çukur", emoji: "🕳️" },
        { id: "kaldirim", label: "Kaldırım", emoji: "🚧" },
        { id: "isik", label: "Aydınlatma", emoji: "💡" },
        { id: "cop", label: "Çöp", emoji: "🗑️" },
        { id: "su", label: "Su/Altyapı", emoji: "💧" },
        { id: "sorun-diger", label: "Diğer", emoji: "⚠️" },
      ],
    },
  ],
};

// Geriye uyumluluk: her kind'ın tüm kategorileri düz liste (validasyon vb.)
export const CATEGORIES_BY_KIND: Record<PinKind, Category[]> = {
  lezzet: CATEGORY_GROUPS.lezzet.flatMap((g) => g.categories),
  ani: CATEGORY_GROUPS.ani.flatMap((g) => g.categories),
  sorun: CATEGORY_GROUPS.sorun.flatMap((g) => g.categories),
};

const ALL_CATEGORIES: Category[] = Object.values(CATEGORIES_BY_KIND).flat();

export function kindMeta(id: string): KindMeta {
  return KINDS.find((k) => k.id === id) ?? KINDS[0];
}

export function isValidKind(id: string): id is PinKind {
  return KINDS.some((k) => k.id === id);
}

export function categoryById(id: string): Category {
  return ALL_CATEGORIES.find((c) => c.id === id) ?? { id: "diger", label: "Diğer", emoji: "📍" };
}

export function categoryInKind(kind: PinKind, categoryId: string): boolean {
  return CATEGORIES_BY_KIND[kind].some((c) => c.id === categoryId);
}

export function groupsForKind(kind: PinKind): CategoryGroup[] {
  return CATEGORY_GROUPS[kind] ?? [];
}

/** Bir kategorinin ait olduğu grubu bulur (marker/filtre için). */
export function groupForCategory(kind: PinKind, categoryId: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS[kind]?.find((g) => g.categories.some((c) => c.id === categoryId));
}

// Fiyatın anlamlı olduğu gruplar: yeme-içme (bir öğün/kahve/içki fiyatı). Market,
// hizmet, sağlık, oto, gezi vb. tek "fiyat" taşımaz → "₺?" daveti/kartı gösterilmez.
const PRICEABLE_GROUPS = new Set(["g-yeme", "g-kafe", "g-bar"]);
export function isPriceable(kind: PinKind, categoryId: string): boolean {
  if (kind !== "lezzet") return false;
  const g = groupForCategory(kind, categoryId);
  return g ? PRICEABLE_GROUPS.has(g.id) : false;
}

/** Kind'ın gruplu gösterime ihtiyacı var mı? (tek grup ise düz göster) */
export function hasGroups(kind: PinKind): boolean {
  return (CATEGORY_GROUPS[kind]?.length ?? 0) > 1;
}
