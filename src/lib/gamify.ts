import { db } from "./db";

export const POINTS = {
  PIN: 10,
  PIN_PHOTO_BONUS: 5,
  VOTE: 2,
  PIN_CONFIRMED: 5, // pin sahibine, pini ilk kez doğrulandığında
  COMMENT: 3,
  PRICE: 5, // mevcut bir pine fiyat ekleme/güncelleme (fiyat-öncelikli çekirdek veri)
} as const;

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  progress: string;
};

export function badgesFor(userId: string): Badge[] {
  const d = db();
  const pinCount = (
    d.prepare("SELECT COUNT(*) AS c FROM pins WHERE user_id = ? AND status = 'active'").get(userId) as { c: number }
  ).c;
  const confirmedCount = (
    d
      .prepare(
        `SELECT COUNT(DISTINCT p.id) AS c FROM pins p
         JOIN votes v ON v.pin_id = p.id AND v.value = 1
         WHERE p.user_id = ?`
      )
      .get(userId) as { c: number }
  ).c;
  const voteCount = (
    d.prepare("SELECT COUNT(*) AS c FROM votes WHERE user_id = ?").get(userId) as { c: number }
  ).c;

  return [
    {
      id: "kasif",
      label: "Kaşif",
      emoji: "🧭",
      earned: pinCount >= 5,
      progress: `${Math.min(pinCount, 5)}/5 pin`,
    },
    {
      id: "fiyat-avcisi",
      label: "Fiyat Avcısı",
      emoji: "🎯",
      earned: confirmedCount >= 10,
      progress: `${Math.min(confirmedCount, 10)}/10 doğrulanmış pin`,
    },
    {
      id: "dedektif",
      label: "Dedektif",
      emoji: "🔍",
      earned: voteCount >= 25,
      progress: `${Math.min(voteCount, 25)}/25 doğrulama oyu`,
    },
  ];
}
