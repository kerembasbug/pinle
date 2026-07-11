import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { isValidKind, categoryInKind, categoryById, kindMeta } from "@/lib/categories";
import { nearestPlace } from "@/lib/districts";
import { isClean, withinRateLimit } from "@/lib/moderation";
import { cleanValidUntil } from "@/lib/validity";
import { POINTS } from "@/lib/gamify";
import { authorIdFor } from "@/lib/authorId";
import { overloadGuard } from "@/lib/flags";
// Viral yük sigortası: aynı (kaba) bölge sorguları 15 sn hafızadan döner.
// bbox 2 ondalığa GENİŞLETİLEREK yuvarlanır (superset — pin kaybolmaz, fazlası
// zaten viewport dışında kalır). Kişiselleştirme yok → herkese aynı yanıt.
import { cacheGet, cacheSet, cacheClear } from "@/lib/pinsCache";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const minLat = Number(q.get("minLat") ?? -90);
  const maxLat = Number(q.get("maxLat") ?? 90);
  const minLng = Number(q.get("minLng") ?? -180);
  const maxLng = Number(q.get("maxLng") ?? 180);
  const kind = q.get("kind") ?? "";
  // `deals=1`: yalnızca geçerlilik tarihi bugünden ileri olan aktif indirim/kampanya pinleri
  const dealsOnly = q.get("deals") === "1";
  // `categories`: virgülle ayrık liste (grup filtresi). Geriye uyumluluk için `category` de kabul.
  const catParam = q.get("categories") ?? q.get("category") ?? "";
  const categories = catParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 40);
  if ([minLat, maxLat, minLng, maxLng].some(Number.isNaN)) {
    return Response.json({ error: "Geçersiz sınırlar" }, { status: 400 });
  }

  // Kaba superset bbox → cache anahtarı (dışa doğru yuvarla: sonuç asla eksilmez)
  const f = (v: number, up: boolean) => (up ? Math.ceil(v * 100) / 100 : Math.floor(v * 100) / 100);
  const cMinLat = f(minLat, false), cMaxLat = f(maxLat, true);
  const cMinLng = f(minLng, false), cMaxLng = f(maxLng, true);
  const cacheKey = `${cMinLat},${cMaxLat},${cMinLng},${cMaxLng}|${kind}|${categories.join(",")}|${dealsOnly ? 1 : 0}`;
  const headers = { "Content-Type": "application/json", "Cache-Control": "public, max-age=10" };
  const hit = cacheGet(cacheKey);
  if (hit) return new Response(hit, { headers });

  const catFilter =
    categories.length > 0 ? `AND p.category IN (${categories.map(() => "?").join(",")})` : "";
  const dealFilter = dealsOnly
    ? "AND p.price_valid_until IS NOT NULL AND date(p.price_valid_until) >= date('now')"
    : "";
  const sql = `
    SELECT p.id, p.user_id, p.name, p.kind, p.category, p.price, p.price_item, p.price_valid_until, p.price_updated_at, p.lat, p.lng, p.created_at,
      COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 END), 0) AS confirms,
      COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 END), 0) AS outdated,
      (SELECT COUNT(*) FROM comments c WHERE c.pin_id = p.id) AS comment_count
    FROM pins p
    LEFT JOIN votes v ON v.pin_id = p.id
    WHERE p.status = 'active'
      AND p.lat BETWEEN ? AND ? AND p.lng BETWEEN ? AND ?
      AND (? = '' OR p.kind = ?)
      ${catFilter}
      ${dealFilter}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 400
  `;
  // Sorgu KABA bbox ile çalışır (cache anahtarıyla birebir) — superset güvenli.
  const rows = db()
    .prepare(sql)
    .all(cMinLat, cMaxLat, cMinLng, cMaxLng, kind, kind, ...categories) as Record<
    string,
    unknown
  >[];
  const pins = rows.map(({ user_id, ...p }) => ({
    ...p,
    authorId: authorIdFor(user_id as string),
  }));
  const body = JSON.stringify({ pins });
  cacheSet(cacheKey, body);
  return new Response(body, { headers });
}

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const guard = overloadGuard();
  if (guard) return guard;
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
  const priceItemRaw = String(form.get("price_item") ?? "").trim().slice(0, 40);
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const photo = form.get("photo");

  if (!isValidKind(kind)) {
    return Response.json({ error: "Geçersiz pin tipi" }, { status: 400 });
  }
  // Ad OPSİYONEL: bilmiyorsan boş bırak → konum+tür'den otomatik üretilir
  // (fiyat ve konum, addan daha değerli). Girildiyse 2-80 karakter.
  if (name.length > 80 || (name.length > 0 && name.length < 2)) {
    return Response.json({ error: "İsim 2-80 karakter olmalı" }, { status: 400 });
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
    // Adet/porsiyon normalizasyonu: "2 balık ekmek 550" → tanesi 275 tutulur
    const qtyRaw = Number(String(form.get("price_qty") ?? "1"));
    const qty = Number.isInteger(qtyRaw) && qtyRaw >= 1 && qtyRaw <= 20 ? qtyRaw : 1;
    if (qty > 1) price = Math.round((price / qty) * 100) / 100;
  }
  // Fiyat varsa "ne için" etiketi ZORUNLU — fiyat hep bir ürün/hizmete bağlı
  // (mekan çıplak rakamla fiyatlanmaz; kategori adı ürün değildir).
  let priceItem: string | null = null;
  if (price != null && price > 0) {
    priceItem = priceItemRaw || null;
    if (!priceItem) {
      return Response.json({ error: "Fiyat ne için? (örn. Balık ekmek)" }, { status: 400 });
    }
    if (!isClean(priceItem)) {
      return Response.json({ error: "Metin uygunsuz ifade içeriyor" }, { status: 400 });
    }
  }
  // Opsiyonel fiyat/indirim geçerlilik tarihi
  const valid = cleanValidUntil(form.get("price_valid_until"));
  if ("error" in valid) return Response.json({ error: valid.error }, { status: 400 });
  const validUntil = price != null && price > 0 ? valid.value : null;
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
  const place = nearestPlace(lat, lng);
  // Ad boşsa otomatik üret: "Döner / Dürüm · Kuşadası" (tür + semt) — kullanıcı
  // adını bilmese de pin anlamlı görünür, sonradan düzeltilebilir.
  const finalName =
    name ||
    `${categoryById(category).label}${place?.district && place.district !== "-" ? ` · ${place.district}` : ""}`.slice(
      0,
      80
    );
  db()
    .prepare(
      `INSERT INTO pins (id, user_id, name, kind, category, district, city, price, price_item,
        price_updated_at, price_valid_until, note, photo, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? IS NOT NULL THEN datetime('now') END, ?, ?, ?, ?, ?)`
    )
    .run(
      id, user.id, finalName, kind, category,
      place?.district ?? "-", place?.city ?? "-",
      price, priceItem, price, validUntil, note || null, photoName, lat, lng
    );

  const earned = POINTS.PIN + (photoName ? POINTS.PIN_PHOTO_BONUS : 0);
  awardPoints(user.id, earned, "pin");
  cacheClear(); // pinleyen kendi pinini anında görsün

  // Davet ödülü: davetli İLK pinini attıysa davet edene puan (viral çark).
  const meta2 = db()
    .prepare(
      "SELECT referred_by, (SELECT COUNT(*) FROM pins WHERE user_id = users.id) AS pc FROM users WHERE id = ?"
    )
    .get(user.id) as { referred_by: string | null; pc: number };
  if (meta2?.referred_by && meta2.pc === 1) {
    awardPoints(meta2.referred_by, POINTS.REFERRAL, "referral");
  }

  return Response.json({ id, earned }, { status: 201 });
}
