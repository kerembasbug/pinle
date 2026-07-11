export type PinSummary = {
  id: string;
  name: string;
  kind: string;
  category: string;
  price: number | null;
  price_item: string | null;
  price_valid_until: string | null;
  lat: number;
  lng: number;
  created_at: string;
  confirms: number;
  outdated: number;
  comment_count: number;
  authorId: string;
};

export type PinDetail = {
  id: string;
  name: string;
  kind: string;
  category: string;
  price: number | null;
  price_item: string | null;
  price_updated_at: string | null;
  price_valid_until: string | null;
  note: string | null;
  photo: string | null;
  lat: number;
  lng: number;
  created_at: string;
  author: string;
  authorId: string;
  confirms: number;
  outdated: number;
  thanks: number;
  isMine: boolean;
};

export type Comment = {
  id: string;
  body: string;
  author: string;
  authorId: string;
  created_at: string;
};

export type Me = {
  name: string;
  points: number;
  pinCount: number;
  weeklyPoints: number;
  weeklyRank: number | null;
  isMuhtar: boolean;
  email: string | null;
  badges: { id: string; label: string; emoji: string; earned: boolean; progress: string }[];
  refCode: string;
  invitedCount: number;
};

export function timeAgo(sqlite: string): string {
  const d = new Date(sqlite.includes("T") ? sqlite : sqlite.replace(" ", "T") + "Z");
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR");
}

export function formatPrice(p: number | null): string | null {
  if (p == null) return null;
  return `₺${Number.isInteger(p) ? p : p.toFixed(2).replace(".", ",")}`;
}
