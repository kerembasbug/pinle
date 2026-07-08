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
export const alt = "Pinle — Ucuz Lezzet Haritası";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = getPin(id);
  const cat = pin ? categoryById(pin.category) : null;
  const price = pin ? ogPrice(pin.price) : null;

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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ fontSize: 56 }}>📍</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#e8442e" }}>Pinle</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#fffdf7",
            border: "6px solid #221b15",
            borderRadius: 36,
            boxShadow: "12px 12px 0 #221b15",
            padding: "44px 64px",
            maxWidth: 980,
            alignItems: "center",
          }}
        >
          {pin ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ fontSize: 72 }}>{cat!.emoji}</div>
                <div
                  style={{
                    fontSize: 58,
                    fontWeight: 800,
                    color: "#221b15",
                    maxWidth: 760,
                    overflow: "hidden",
                  }}
                >
                  {pin.name}
                </div>
              </div>
              {price && (
                <div style={{ fontSize: 96, fontWeight: 800, color: "#e8442e", marginTop: 12 }}>
                  {price}
                </div>
              )}
              <div style={{ display: "flex", gap: 20, marginTop: 20, fontSize: 32 }}>
                <div
                  style={{
                    display: "flex",
                    background: "#e7f5f1",
                    border: "4px solid #0e7c66",
                    borderRadius: 999,
                    padding: "8px 28px",
                    color: "#0e7c66",
                    fontWeight: 700,
                  }}
                >
                  {(OG_CONFIRM[pin.kind] ?? OG_CONFIRM.lezzet)(pin.confirms)}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 56, fontWeight: 800 }}>Ucuz Lezzet Haritası</div>
          )}
        </div>

        <div style={{ fontSize: 30, color: "#221b15", opacity: 0.6, marginTop: 36 }}>
          Sen de pinle, mahallenin muhtarı ol 🏆
        </div>
      </div>
    ),
    size
  );
}
