import { ImageResponse } from "next/og";
import { categoryById } from "@/lib/categories";
import { getPin } from "@/lib/pins";

export const alt = "Pinle — tek mekânlık güncel fiyat görevi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function ogPrice(value: number | null) {
  if (value == null) return null;
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace(".", ",")} TL`;
}

export default async function SharedTaskOgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = getPin(id);
  const category = pin ? categoryById(pin.category) : null;
  const completed = pin?.price != null;
  const price = pin ? ogPrice(pin.price) : null;
  const nameSize = pin
    ? pin.name.length > 55
      ? 40
      : pin.name.length > 38
        ? 46
        : pin.name.length > 24
          ? 54
          : 62
    : 56;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "44px 70px", background: "#fbf5ea", color: "#221b15", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: 1040, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
        <div style={{ display: "flex", border: `3px solid ${completed ? "#0e7c66" : "#e0a400"}`, borderRadius: 999, padding: "8px 18px", color: completed ? "#0e7c66" : "#9c7100", fontSize: 22, fontWeight: 800 }}>
          {completed ? "GÖREV TAMAMLANDI" : "TEK FİYAT GÖREVİ"}
        </div>
      </div>
      <div style={{ width: 1040, minHeight: 390, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "34px 54px", background: "#fffdf7", border: "6px solid #221b15", borderRadius: 34, boxShadow: "10px 10px 0 #221b15", overflow: "hidden" }}>
        {pin && category ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ display: "flex", width: "100%", justifyContent: "center", textAlign: "center", fontSize: nameSize, lineHeight: 1.05, fontWeight: 800, overflow: "hidden" }}>
              {pin.name}
            </div>
            <div style={{ display: "flex", marginTop: 12, color: "#71685f", fontSize: 27, fontWeight: 700 }}>
              {category.emoji} {category.label} · {[pin.district, pin.city].filter(Boolean).join(", ")}
            </div>
            {completed && price ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 22 }}>
                <div style={{ display: "flex", color: "#e8442e", fontSize: 82, fontWeight: 800 }}>{price}</div>
                {pin.price_item && <div style={{ display: "flex", color: "#71685f", fontSize: 30, fontWeight: 700 }}>{pin.price_item}</div>}
              </div>
            ) : (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", marginTop: 24, color: "#e8442e", fontSize: 52, fontWeight: 800 }}>
                  Fiyatını biliyor musun?
                </div>
                <div style={{ display: "flex", marginTop: 14, padding: "9px 20px", borderRadius: 999, background: "#ffd166", fontSize: 23, fontWeight: 700 }}>
                  Tahmin etme · gerçekten gördüğün fiyatı ekle
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>Fiyat görevi bulunamadı</div>
        )}
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#71685f" }}>
        pinle.app/gorev · kayıt zorunlu değil
      </div>
    </div>,
    size
  );
}
