import { db } from "./db";

export type PinRow = {
  id: string;
  name: string;
  kind: string;
  category: string;
  price: number | null;
  price_item: string | null;
  note: string | null;
  photo: string | null;
  created_at: string;
  author: string;
  confirms: number;
  outdated: number;
};

export function getPin(id: string): PinRow | undefined {
  return db()
    .prepare(
      `SELECT p.id, p.name, p.kind, p.category, p.price, p.price_item, p.note, p.photo, p.created_at,
        u.name AS author,
        COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = 1), 0) AS confirms,
        COALESCE((SELECT COUNT(*) FROM votes v WHERE v.pin_id = p.id AND v.value = -1), 0) AS outdated
       FROM pins p JOIN users u ON u.id = p.user_id
       WHERE p.id = ? AND p.status = 'active'`
    )
    .get(id) as PinRow | undefined;
}
