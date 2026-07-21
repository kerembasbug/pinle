import { ImageResponse } from "next/og";

export const alt = "Pinle Android — Gerçek fiyatı gitmeden gör";
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
      <div style={{ display: "flex", flexDirection: "column", width: 690 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, color: "#e8442e" }}>
          📍 Pinle
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 54, fontSize: 72, fontWeight: 800, lineHeight: 1.02 }}>
          <span>Gerçek fiyatı</span>
          <span style={{ color: "#e8442e" }}>gitmeden gör.</span>
        </div>
        <div style={{ display: "flex", marginTop: 38, fontSize: 28 }}>Android’de yayında · Kazık yeme, Pinle.</div>
      </div>
      <div
        style={{
          width: 300,
          height: 470,
          display: "flex",
          flexDirection: "column",
          border: "8px solid #221b15",
          borderRadius: 42,
          background: "#fffdf7",
          padding: 24,
          boxShadow: "16px 16px 0 #ffc145",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: "#e8442e" }}>📍 Yakındaki fiyatlar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 42 }}>
          <div style={{ display: "flex", justifyContent: "space-between", border: "3px solid #221b15", borderRadius: 20, padding: "15px 18px", fontSize: 22 }}><span>☕ Çay</span><b>25 TL</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", border: "3px solid #221b15", borderRadius: 20, padding: "15px 18px", fontSize: 22 }}><span>🥙 Döner</span><b>160 TL</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", border: "3px solid #221b15", borderRadius: 20, padding: "15px 18px", fontSize: 22 }}><span>✂️ Berber</span><b>450 TL</b></div>
        </div>
      </div>
    </div>
  );
}
