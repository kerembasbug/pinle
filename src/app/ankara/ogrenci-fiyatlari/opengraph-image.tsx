import { ImageResponse } from "next/og";

export const alt = "Pinle Ankara Öğrenci Fiyat Dostu İşletme Pilotu";
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
        padding: "52px 68px",
        color: "#221b15",
        background: "#fbf5ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>ANKARA · KURUCU 15</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 42 }}>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.03 }}>
          Öğrenci fiyatı
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, color: "#e8442e", lineHeight: 1.03 }}>
          gitmeden görsün.
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 27 }}>
          İşletme 3 tarihli fiyatını açar · Öğrenci güncelliğini doğrular
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 42 }}>
        {["Bahçelievler", "Maltepe", "Kızılay"].map((district, index) => (
          <div
            key={district}
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              border: "5px solid #221b15",
              borderRadius: 24,
              padding: "22px 18px",
              background: index === 1 ? "#ccefe5" : index === 2 ? "#e8442e" : "#ffc145",
              color: index === 2 ? "white" : "#221b15",
              fontSize: 28,
              fontWeight: 800,
              boxShadow: "7px 7px 0 #221b15",
            }}
          >
            {district}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
