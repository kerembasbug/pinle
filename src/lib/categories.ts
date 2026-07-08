export type PinKind = "lezzet" | "ani" | "sorun";

export type Category = {
  id: string;
  label: string;
  emoji: string;
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
    label: "Lezzet",
    emoji: "🍲",
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

export const CATEGORIES_BY_KIND: Record<PinKind, Category[]> = {
  lezzet: [
    { id: "lokanta", label: "Esnaf Lokantası", emoji: "🍲" },
    { id: "doner", label: "Döner", emoji: "🥙" },
    { id: "pide", label: "Pide & Lahmacun", emoji: "🫓" },
    { id: "tost", label: "Büfe & Tost", emoji: "🥪" },
    { id: "cigkofte", label: "Çiğ Köfte", emoji: "🌯" },
    { id: "kahvalti", label: "Kahvaltı", emoji: "🍳" },
    { id: "tatli", label: "Tatlı & Fırın", emoji: "🍮" },
    { id: "diger", label: "Diğer", emoji: "📍" },
  ],
  ani: [
    { id: "ask", label: "Aşk", emoji: "💘" },
    { id: "nostalji", label: "Nostalji", emoji: "🕰️" },
    { id: "itiraf", label: "İtiraf", emoji: "🤫" },
    { id: "komik", label: "Komik", emoji: "😂" },
    { id: "ani-diger", label: "Diğer", emoji: "💭" },
  ],
  sorun: [
    { id: "cukur", label: "Çukur", emoji: "🕳️" },
    { id: "kaldirim", label: "Kaldırım", emoji: "🚧" },
    { id: "isik", label: "Aydınlatma", emoji: "💡" },
    { id: "cop", label: "Çöp", emoji: "🗑️" },
    { id: "su", label: "Su/Altyapı", emoji: "💧" },
    { id: "sorun-diger", label: "Diğer", emoji: "⚠️" },
  ],
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
