import { db, awardPoints } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { withinRateLimit, isClean } from "@/lib/moderation";
import { POINTS } from "@/lib/gamify";

// Mevcut bir pine güncel fiyat bildir. Fiyatsız OSM mekanlarını topluluk
// böyle doldurur — çıkıp aynı mekanı yeniden pinlemeye gerek kalmaz.
// Fiyat hep bir "kalem" (ne için) ile: mekan çıplak rakamla fiyatlanmasın.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateUser();
  const { price, item } = (await request.json().catch(() => ({}))) as {
    price?: number;
    item?: string;
  };

  if (typeof price !== "number" || !Number.isFinite(price) || price < 1 || price > 100000) {
    return Response.json({ error: "Geçerli bir fiyat gir (1–100000 ₺)" }, { status: 400 });
  }
  const value = Math.round(price * 100) / 100; // en fazla 2 ondalık
  const label = (item ?? "").trim().slice(0, 40);
  if (!label) return Response.json({ error: "Ne için? (örn. Döner)" }, { status: 400 });
  if (!isClean(label)) return Response.json({ error: "Uygunsuz metin" }, { status: 400 });

  const d = db();
  const pin = d
    .prepare("SELECT price FROM pins WHERE id = ? AND status = 'active'")
    .get(id) as { price: number | null } | undefined;
  if (!pin) return Response.json({ error: "Pin bulunamadı" }, { status: 404 });

  if (!withinRateLimit(user.id, "price")) {
    return Response.json({ error: "Günlük fiyat bildirimi limitine ulaştın" }, { status: 429 });
  }

  const changed = pin.price !== value;

  d.prepare("INSERT INTO price_reports (pin_id, user_id, price, item) VALUES (?, ?, ?, ?)").run(
    id,
    user.id,
    value,
    label
  );
  d.prepare("UPDATE pins SET price = ?, price_item = ? WHERE id = ?").run(value, label, id);

  // Fiyat değiştiyse oylar artık eski fiyatı doğruluyordu → sıfırla (oylar hep
  // GÜNCEL fiyatı doğrular; "hâlâ bu fiyat" anlamı korunur).
  if (changed) {
    d.prepare("DELETE FROM votes WHERE pin_id = ?").run(id);
  }

  awardPoints(user.id, POINTS.PRICE, "price");

  const counts = d
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS confirms,
        COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS outdated
       FROM votes WHERE pin_id = ?`
    )
    .get(id) as { confirms: number; outdated: number };

  return Response.json({
    price: value,
    price_item: label,
    changed,
    earned: POINTS.PRICE,
    confirms: counts.confirms,
    outdated: counts.outdated,
    myVote: changed ? 0 : undefined,
  });
}
