import { ImageResponse } from "next/og";

export const alt = "Pinle İstanbul Fiyat Sprinti — Beyoğlu mu Kadıköy mü?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "54px 68px",
        color: "#221b15",
        background: "#fbf5ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>21 Temmuz–4 Ağustos</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 800 }}>İstanbul Fiyat Sprinti</div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 10 }}>Mahallenden bir gerçek fiyat ekle veya doğrula.</div>
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 38 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "6px solid #221b15", borderRadius: 28, padding: "24px 30px", background: "#ccefe5", boxShadow: "10px 10px 0 #221b15" }}>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 800 }}>Beyoğlu</div>
          <div style={{ display: "flex", fontSize: 26, marginTop: 10 }}>30 gerçek fiyat hedefi</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "6px solid #221b15", borderRadius: 28, padding: "24px 30px", color: "white", background: "#e8442e", boxShadow: "10px 10px 0 #ffc145" }}>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 800 }}>Kadıköy</div>
          <div style={{ display: "flex", fontSize: 26, marginTop: 10 }}>30 gerçek fiyat hedefi</div>
        </div>
      </div>
    </div>
  );
}
