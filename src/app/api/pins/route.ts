import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { isValidKind, categoryInKind, kindMeta } from "@/lib/categories";
import { nearestDistrict } from "@/lib/districts";
import { isClean, withinRateLimit } from "@/lib/moderation";
import { POINTS } from "@/lib/gamify";
import { authorIdFor } from "@/lib/authorId";

const PIN_LIST_SQL = `
  SELECT p.id, p.user_id, p.name, p.kind, p.category, p.price, p.lat, p.lng, p.created_at,
    COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 END), 0) AS confirms,
    COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 END), 0) AS outdated,
    (SELECT COUNT(*) FROM comments c WHERE c.pin_id = p.id) AS comment_count
  FROM pins p
  LEFT JOIN votes v ON v.pin_id = p.id
  WHERE p.status = 'active'
    AND p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?
    AND (? = '' OR p.kind = ?)
    AND (? = '' OR p.category = ?)
  GROUP BY p.id
  ORDER BY p.created_at DESC
  LIMIT 300
`;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const minLat = Number(q.get("minLat") ?? -90);
  const maxLat = Number(q.get("maxLat") ?? 90);
  const minLng = Number(q.get("minLng") ?? -180);
  const maxLng = Number(q.get("maxLng") ?? 180);
  const kind = q.get("kind") ?? "";
  const category = q.get("category") ?? "";
  if ([minLat, maxLat, minLng, maxLng].some(Number.isNaN)) {
    return Response.json({ error: "Geçersiz sınırlar" }, { status: 400 });
  }
  const rows = db()
    .prepare(PIN_LIST_SQL)
    .all(minLat, maxLat, minLng, maxLng, kind, kind, category, category) as Record<
    string,
    unknown
  >[];
  const pins = rows.map(({ user_id, ...p }) => ({
    ...p,
    authorId: authorIdFor(user_id as string),
  }));
  return Response.json({ pins });
}

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!withinRateLimit(user.id, "pin")) {
    return Response.json({ error: "Günlük pin limitine ulaştın, yarın devam!" }, { status: 429 });
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const kind = String(form.get("kind") ?? "lezzet");
  const category = String(form.get("category") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const photo = form.get("photo");

  if (!isValidKind(kind)) {
    return Response.json({ error: "Geçersiz pin tipi" }, { status: 400 });
  }
  if (name.length < 2 || name.length > 80) {
    return Response.json({ error: "Başlık 2-80 karakter olmalı" }, { status: 400 });
  }
  if (!categoryInKind(kind, category)) {
    return Response.json({ error: "Geçersiz kategori" }, { status: 400 });
  }
  if (note.length > 280) {
    return Response.json({ error: "Not en fazla 280 karakter" }, { status: 400 });
  }
  if (!isClean(name) || !isClean(note)) {
    return Response.json({ error: "Metin uygunsuz ifade içeriyor" }, { status: 400 });
  }
  let price: number | null = null;
  if (priceRaw !== "" && kindMeta(kind).hasPrice) {
    price = Number(priceRaw.replace(",", "."));
    if (Number.isNaN(price) || price < 0 || price > 100000) {
      return Response.json({ error: "Geçersiz fiyat" }, { status: 400 });
    }
  }
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "Geçersiz konum" }, { status: 400 });
  }

  let photoName: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    const ext = PHOTO_EXT[photo.type];
    if (!ext) return Response.json({ error: "Sadece JPG/PNG/WebP fotoğraf" }, { status: 400 });
    if (photo.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: "Fotoğraf en fazla 4MB olabilir" }, { status: 400 });
    }
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    photoName = `${crypto.randomUUID()}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, photoName), Buffer.from(await photo.arrayBuffer()));
  }

  const id = crypto.randomUUID();
  const district = nearestDistrict(lat, lng) ?? "-";
  db()
    .prepare(
      `INSERT INTO pins (id, user_id, name, kind, category, district, price, note, photo, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, user.id, name, kind, category, district, price, note || null, photoName, lat, lng);

  const earned = POINTS.PIN + (photoName ? POINTS.PIN_PHOTO_BONUS : 0);
  awardPoints(user.id, earned, "pin");

  return Response.json({ id, earned }, { status: 201 });
}
