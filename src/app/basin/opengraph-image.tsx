import { ImageResponse } from "next/og";

export const alt = "Pinle Basın ve Medya Kiti — Gerçek fiyat haritası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 76px",
        color: "#221b15",
        background: "#fbf5ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 720 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, color: "#e8442e" }}>
          📍 Pinle
        </div>
        <div style={{ display: "flex", marginTop: 50, fontSize: 30, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>
          Basın ve medya kiti
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: 66, fontWeight: 800, lineHeight: 1.04 }}>
          <span>Gerçek fiyatı</span>
          <span style={{ color: "#e8442e" }}>gitmeden gör.</span>
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 25 }}>
          Ürün özeti · Veri yöntemi · Marka görselleri · İletişim
        </div>
      </div>
      <div
        style={{
          width: 315,
          height: 430,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "7px solid #221b15",
          borderRadius: 38,
          background: "#ffc145",
          padding: 30,
          boxShadow: "14px 14px 0 #e8442e",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, fontWeight: 800 }}>DOĞRULANMIŞ LAUNCH NOTLARI</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 23, fontWeight: 700 }}>
          {[
            "Android’de yayında",
            "Web + Android",
            "Seed ayrımı açık",
            "Canlı ürün kaynakları",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: "#e8442e" }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 800 }}>pinle.app/basin</div>
      </div>
    </div>,
    size,
  );
}
