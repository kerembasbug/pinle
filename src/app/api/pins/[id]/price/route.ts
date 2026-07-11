import { db, awardPoints } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit, isClean } from "@/lib/moderation";
import { POINTS } from "@/lib/gamify";
import { cleanValidUntil } from "@/lib/validity";

// Mevcut bir pine güncel fiyat bildir. Fiyatsız OSM mekanlarını topluluk
// böyle doldurur — çıkıp aynı mekanı yeniden pinlemeye gerek kalmaz.
// Fiyat hep bir "kalem" (ne için) ile ve BİRİM fiyata normalize edilir:
// "2 × Balık ekmek = 550₺" → adet 275₺ (fiyat/performans kıyaslanabilir olsun).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const __g = overloadGuard();
  if (__g) return __g;
  const { id } = await params;
  const user = await getOrCreateUser();
  const { price, item, qty, validUntil } = (await request.json().catch(() => ({}))) as {
    price?: number; // TOPLAM ödenen
    item?: string;
    qty?: number; // adet/porsiyon (varsayılan 1)
    validUntil?: string; // opsiyonel geçerlilik tarihi (YYYY-MM-DD)
  };

  const valid = cleanValidUntil(validUntil);
  if ("error" in valid) return Response.json({ error: valid.error }, { status: 400 });

  if (typeof price !== "number" || !Number.isFinite(price) || price < 1 || price > 100000) {
    return Response.json({ error: "Geçerli bir fiyat gir (1–100000 ₺)" }, { status: 400 });
  }
  const n = Number.isInteger(qty) && (qty as number) >= 1 && (qty as number) <= 20 ? (qty as number) : 1;
  const total = Math.round(price * 100) / 100;
  const unit = Math.round((total / n) * 100) / 100; // birim fiyat — pinde bu tutulur
  const label = (item ?? "").trim().slice(0, 40);
  if (!label) return Response.json({ error: "Ne için? (örn. Balık ekmek)" }, { status: 400 });
  if (!isClean(label)) return Response.json({ error: "Uygunsuz metin" }, { status: 400 });

  const d = db();
  const pin = d
    .prepare("SELECT price FROM pins WHERE id = ? AND status = 'active'")
    .get(id) as { price: number | null } | undefined;
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  if (!withinRateLimit(user.id, "price")) {
    return Response.json({ error: "Günlük fiyat bildirimi limitine ulaştın" }, { status: 429 });
  }

  const firstPrice = pin.price == null; // pini "fiyat açan" kişi — bonus
  const changed = pin.price !== unit;

  d.prepare(
    "INSERT INTO price_reports (pin_id, user_id, price, item, qty, total) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, user.id, unit, label, n, total);
  d.prepare(
    "UPDATE pins SET price = ?, price_item = ?, price_updated_at = datetime('now'), price_valid_until = ? WHERE id = ?"
  ).run(unit, label, valid.value, id);

  // Fiyat değiştiyse oylar artık eski fiyatı doğruluyordu → sıfırla (oylar hep
  // GÜNCEL fiyatı doğrular; "hâlâ bu fiyat" anlamı korunur).
  if (changed) {
    d.prepare("DELETE FROM votes WHERE pin_id = ?").run(id);
  }

  let earned = POINTS.PRICE;
  awardPoints(user.id, POINTS.PRICE, "price");
  if (firstPrice) {
    awardPoints(user.id, POINTS.PRICE_FIRST_BONUS, "price_first");
    earned += POINTS.PRICE_FIRST_BONUS;
  }

  const counts = d
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS confirms,
        COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS outdated
       FROM votes WHERE pin_id = ?`
    )
    .get(id) as { confirms: number; outdated: number };

  return Response.json({
    price: unit,
    price_item: label,
    price_valid_until: valid.value,
    qty: n,
    total,
    firstPrice,
    changed,
    earned,
    confirms: counts.confirms,
    outdated: counts.outdated,
    myVote: changed ? 0 : undefined,
  });
}
