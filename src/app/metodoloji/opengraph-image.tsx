import { ImageResponse } from "next/og";
import { PRICE_DATASET_METHOD_VERSION } from "@/lib/priceDataset";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pinle Veri Güven Modeli — Kaynak, güncellik ve doğrulama";

export default function MethodologyOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "46px 70px",
          background: "#fbf5ea",
          color: "#221b15",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 1040,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", width: 24, height: 24, borderRadius: 999, background: "#e8442e" }} />
            <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#e8442e" }}>Pinle</div>
          </div>
          <div
            style={{
              display: "flex",
              border: "3px solid #0e7c66",
              borderRadius: 999,
              padding: "8px 20px",
              color: "#0e7c66",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            YÖNTEM {PRICE_DATASET_METHOD_VERSION}
          </div>
        </div>

        <div
          style={{
            width: 1040,
            minHeight: 400,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "42px 52px",
            background: "#fffdf7",
            border: "6px solid #221b15",
            borderRadius: 34,
            boxShadow: "10px 10px 0 #221b15",
          }}
        >
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>
            Bir fiyat neden güvenilir?
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 29, color: "#71685f" }}>
            Kaynak ayrımı · 60 gün güncellik · ikinci kişi doğrulaması · veri minimizasyonu
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 30, fontSize: 23, fontWeight: 800 }}>
            <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#ffd166" }}>
              Seed ≠ traction
            </div>
            <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#e7f5f1", color: "#0e7c66" }}>
              Tıklama ≠ katkı
            </div>
            <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, border: "3px solid #221b15" }}>
              Gözlem ≠ tarife
            </div>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#71685f" }}>
          pinle.app/metodoloji
        </div>
      </div>
    ),
    size,
  );
}
