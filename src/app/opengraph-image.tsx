import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pinle — Ucuz Lezzet Haritası";

// Ana sayfa paylaşım kartı: canlı pin + şehir sayısıyla sosyal kanıt.
function stats(): { pins: number; cities: number } {
  try {
    const row = db()
      .prepare(
        "SELECT COUNT(*) AS pins, COUNT(DISTINCT city) AS cities FROM pins WHERE status = 'active'"
      )
      .get() as { pins: number; cities: number };
    return { pins: row.pins ?? 0, cities: row.cities ?? 0 };
  } catch {
    return { pins: 0, cities: 0 };
  }
}

export default function OgImage() {
  const { pins, cities } = stats();
  // 2916 → "2.900+" gibi yuvarla (abartısız, azımsayan aşağı yuvarlama)
  const pinLabel = pins >= 100 ? `${(Math.floor(pins / 100) * 100).toLocaleString("tr-TR")}+` : `${pins}`;

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ fontSize: 76 }}>📍</div>
          <div style={{ fontSize: 92, fontWeight: 800, color: "#e8442e" }}>Pinle</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#fffdf7",
            border: "6px solid #221b15",
            borderRadius: 36,
            boxShadow: "12px 12px 0 #221b15",
            padding: "40px 72px",
          }}
        >
          <div style={{ fontSize: 54, fontWeight: 800, color: "#221b15" }}>
            Ucuz Lezzet Haritası
          </div>
          <div style={{ fontSize: 30, color: "#221b15", opacity: 0.7, marginTop: 10 }}>
            Fiyatları pinle · doğrula · mahallenin muhtarı ol
          </div>

          {pins > 0 && (
            <div style={{ display: "flex", gap: 20, marginTop: 30, fontSize: 32 }}>
              <div
                style={{
                  display: "flex",
                  background: "#e7f5f1",
                  border: "4px solid #0e7c66",
                  borderRadius: 999,
                  padding: "10px 30px",
                  color: "#0e7c66",
                  fontWeight: 700,
                }}
              >
                🍽️ {pinLabel} nokta
              </div>
              <div
                style={{
                  display: "flex",
                  background: "#fdeee7",
                  border: "4px solid #e8442e",
                  borderRadius: 999,
                  padding: "10px 30px",
                  color: "#e8442e",
                  fontWeight: 700,
                }}
              >
                🏙️ {cities} şehir
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 28, color: "#221b15", opacity: 0.55, marginTop: 30 }}>
          pinle.app · kayıt yok, anonim başla
        </div>
      </div>
    ),
    size
  );
}
