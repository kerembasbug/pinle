import { ImageResponse } from "next/og";
import { getPriceDataset } from "@/lib/priceDataset";
import { YEAR } from "@/lib/seoIntents";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Pinle Türkiye Sokak Fiyatları ${YEAR} — kaynak ayrımlı veri özeti`;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PricesOgImage() {
  const dataset = getPriceDataset();
  const datasetLabel = dataset.userObservationCount > 0
    ? "KAYNAK AYRIMLI VERİ"
    : "BAŞLANGIÇ VERİ SETİ";

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
          padding: "44px 70px",
          background: "#fbf5ea",
          color: "#221b15",
          fontFamily: "sans-serif",
          overflow: "hidden",
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
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            {datasetLabel}
          </div>
        </div>

        <div
          style={{
            width: 1040,
            minHeight: 390,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "34px 48px",
            background: "#fffdf7",
            border: "6px solid #221b15",
            borderRadius: 34,
            boxShadow: "10px 10px 0 #221b15",
          }}
        >
          <div style={{ display: "flex", fontSize: 47, fontWeight: 800, textAlign: "center" }}>
            Türkiye Sokak Fiyatları {YEAR}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 16 }}>
            <div style={{ display: "flex", fontSize: 94, fontWeight: 800, color: "#e8442e" }}>
              {dataset.observationCount}
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#71685f" }}>
              karşılaştırılabilir gözlem
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18, fontSize: 25, fontWeight: 700 }}>
            <div
              style={{
                display: "flex",
                padding: "9px 18px",
                borderRadius: 999,
                background: "#e7f5f1",
                color: "#0e7c66",
              }}
            >
              {dataset.userObservationCount} gerçek kullanıcı
            </div>
            <div
              style={{
                display: "flex",
                padding: "9px 18px",
                borderRadius: 999,
                background: "#ffd166",
              }}
            >
              {dataset.seedObservationCount} başlangıç
            </div>
            <div
              style={{
                display: "flex",
                padding: "9px 18px",
                borderRadius: 999,
                border: "3px solid #221b15",
              }}
            >
              {dataset.confirmedObservationCount} doğrulamalı
            </div>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#71685f" }}>
          pinle.app/fiyatlar · açık toplulaştırılmış CSV
        </div>
      </div>
    ),
    size,
  );
}
