import { db } from "./db";

// Basit küfür/hakaret filtresi — kelime sınırlarıyla eşleşir.
// Yanlış pozitifleri önlemek için tam kelime eşleşmesi kullanılır ("sikke" gibi kelimeler geçer).
const BLOCKLIST = [
  "amk", "aq", "awk", "mk", "orospu", "orosbu", "piç", "pic kurusu", "sik", "sikik", "sikeyim",
  "sikerim", "siktir", "yarrak", "yarak", "göt", "got veren", "amcık", "amcik", "amına", "amina",
  "ibne", "ipne", "pezevenk", "kahpe", "kaltak", "sürtük", "surtuk", "gavat", "oç",
  "ananı", "anani", "avradını", "sg", "stfu",
];
const BLOCK_RE = new RegExp(`(^|[^a-zçğıöşü])(${BLOCKLIST.join("|")})([^a-zçğıöşü]|$)`, "i");

export function isClean(text: string): boolean {
  return !BLOCK_RE.test(text.toLocaleLowerCase("tr"));
}

const LIMITS: Record<string, { perDay: number }> = {
  pin: { perDay: 20 },
  comment: { perDay: 60 },
  vote: { perDay: 200 },
  report: { perDay: 20 },
  price: { perDay: 60 },
  thanks: { perDay: 100 },
};

const TABLES: Record<string, string> = {
  pin: "pins",
  comment: "comments",
  vote: "votes",
  report: "reports",
  price: "price_reports",
  thanks: "thanks",
};

/** Günlük eylem limiti — uid başına. Limit aşıldıysa false döner. */
export function withinRateLimit(userId: string, action: keyof typeof LIMITS): boolean {
  const table = TABLES[action];
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS c FROM ${table} WHERE user_id = ? AND created_at > datetime('now', '-1 day')`
    )
    .get(userId) as { c: number };
  return row.c < LIMITS[action].perDay;
}

export const REPORT_HIDE_THRESHOLD = 3;
