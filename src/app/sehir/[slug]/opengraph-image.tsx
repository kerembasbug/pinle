import { ImageResponse } from "next/og";
import { cityBySlug, cityStats } from "@/lib/cities";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Şehir ucuz lezzet haritası — Pinle";

// Şehir sayfası paylaşım kartı: WhatsApp/X'te "İstanbul'un ucuz lezzet
// haritası" linki şehir adı + canlı sayılarla önizlensin (viral paylaşım).
export default async function CityOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cityBySlug(slug);
  const name = city?.name ?? "Pinle";
  let pins = 0, priced = 0, districts = 0;
  try {
    if (city) ({ pins, priced, districts } = cityStats(city.name));
  } catch {
    /* build ortamında DB yoksa sayısız kart */
  }

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
          background: "#e8442e",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <div style={{ fontSize: 56 }}>📍</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fffdf7" }}>Pinle</div>
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
            padding: "44px 80px",
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 800, color: "#221b15" }}>{name}</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#e8442e", marginTop: 6 }}>
            Ucuz Lezzet &amp; İndirim Haritası
          </div>

          {pins > 0 && (
            <div style={{ display: "flex", gap: 18, marginTop: 32, fontSize: 30 }}>
              <div
                style={{
                  display: "flex",
                  background: "#e7f5f1",
                  border: "4px solid #0e7c66",
                  borderRadius: 999,
                  padding: "10px 28px",
                  color: "#0e7c66",
                  fontWeight: 700,
                }}
              >
                📌 {pins.toLocaleString("tr-TR")} nokta
              </div>
              {priced > 0 && (
                <div
                  style={{
                    display: "flex",
                    background: "#fdeee7",
                    border: "4px solid #e8442e",
                    borderRadius: 999,
                    padding: "10px 28px",
                    color: "#e8442e",
                    fontWeight: 700,
                  }}
                >
                  🏷️ {priced.toLocaleString("tr-TR")} fiyatlı
                </div>
              )}
              {districts > 0 && (
                <div
                  style={{
                    display: "flex",
                    background: "#fff7e0",
                    border: "4px solid #b8860b",
                    borderRadius: 999,
                    padding: "10px 28px",
                    color: "#8a6508",
                    fontWeight: 700,
                  }}
                >
                  🏙️ {districts} ilçe
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ fontSize: 26, color: "#fffdf7", opacity: 0.85, marginTop: 30 }}>
          pinle.app · kayıt yok · fiyatları mahalle doğrular
        </div>
      </div>
    ),
    size
  );
}
