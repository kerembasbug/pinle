import { ImageResponse } from "next/og";
import { getPin } from "@/lib/pins";
import { categoryById } from "@/lib/categories";

// OG varsayılan fontunda ₺ glifi yok — "TL" kullanıyoruz
function ogPrice(p: number | null): string | null {
  if (p == null) return null;
  return `${Number.isInteger(p) ? p : p.toFixed(2).replace(".", ",")} TL`;
}

const OG_CONFIRM: Record<string, (n: number) => string> = {
  lezzet: (n) => `✅ ${n} kişi doğruladı`,
  ani: (n) => `❤️ ${n} kişiye dokundu`,
  sorun: (n) => `⚠️ ${n} kişi onayladı`,
};

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pinle — topluluk doğrulamalı gerçek fiyat kartı";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = getPin(id);
  const cat = pin ? categoryById(pin.category) : null;
  const price = pin ? ogPrice(pin.price) : null;
  const nameFontSize = pin
    ? pin.name.length > 55
      ? 38
      : pin.name.length > 40
        ? 42
        : pin.name.length > 30
          ? 48
          : pin.name.length > 22
            ? 54
            : 60
    : 56;
  const itemFontSize = pin?.price_item && pin.price_item.length > 24
    ? 27
    : pin?.price_item && pin.price_item.length > 16
      ? 30
      : 34;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf5ea",
          fontFamily: "sans-serif",
          overflow: "hidden",
          padding: "46px 70px",
        }}
      >
        <div
          style={{
            width: 1040,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 46 }}>📍</div>
            <div style={{ fontSize: 54, fontWeight: 800, color: "#e8442e" }}>Pinle</div>
          </div>
          <div
            style={{
              display: "flex",
              border: "3px solid #0e7c66",
              borderRadius: 999,
              padding: "8px 20px",
              color: "#0e7c66",
              fontSize: 25,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            GERÇEK FİYAT
          </div>
        </div>

        <div
          style={{
            width: 1040,
            minHeight: 350,
            display: "flex",
            flexDirection: "column",
            background: "#fffdf7",
            border: "6px solid #221b15",
            borderRadius: 36,
            boxShadow: "10px 10px 0 #221b15",
            padding: "38px 52px",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {pin ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: nameFontSize,
                    fontWeight: 800,
                    color: "#221b15",
                    width: "100%",
                    overflow: "hidden",
                    textAlign: "center",
                    lineHeight: 1.05,
                  }}
                >
                  {pin.name}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  color: "#71685f",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {cat!.emoji} {cat!.label}
              </div>
              {price && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 18,
                    width: "100%",
                    marginTop: 12,
                  }}
                >
                  <div style={{ fontSize: 86, fontWeight: 800, color: "#e8442e" }}>{price}</div>
                  {pin.price_item && (
                    <div
                      style={{
                        maxWidth: 360,
                        fontSize: itemFontSize,
                        fontWeight: 700,
                        color: "#71685f",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pin.price_item}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", marginTop: 18, fontSize: 28 }}>
                <div
                  style={{
                    display: "flex",
                    background: "#e7f5f1",
                    border: "4px solid #0e7c66",
                    borderRadius: 999,
                    padding: "7px 24px",
                    color: "#0e7c66",
                    fontWeight: 700,
                  }}
                >
                  {(OG_CONFIRM[pin.kind] ?? OG_CONFIRM.lezzet)(pin.confirms)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 56, fontWeight: 800 }}>Ucuz Lezzet Haritası</div>
          )}
        </div>

        <div style={{ fontSize: 28, color: "#221b15", opacity: 0.65, marginTop: 24 }}>
          Fiyatı gör · doğrula · değiştiyse güncelle
        </div>
      </div>
    ),
    size
  );
}
