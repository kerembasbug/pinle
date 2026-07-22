import { ImageResponse } from "next/og";
import { getPriceTaskBoard } from "@/lib/priceTasks";

export const alt = "Pinle Kampüs Fiyat Pilotu — 7 günde gerçek kampüs fiyat haritası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CampusPilotOgImage() {
  const board = getPriceTaskBoard();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "42px 70px",
        background: "#fbf5ea",
        color: "#221b15",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
        <div style={{ display: "flex", border: "3px solid #0e7c66", borderRadius: 999, padding: "8px 18px", color: "#0e7c66", fontSize: 21, fontWeight: 800 }}>
          KAMPÜS FİYAT PİLOTU
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 28, padding: "34px 46px", background: "#fffdf7", border: "6px solid #221b15", borderRadius: 34, boxShadow: "10px 10px 0 #221b15" }}>
        <div style={{ display: "flex", maxWidth: 970, fontSize: 54, lineHeight: 1.08, fontWeight: 800 }}>
          7 günde kampüs çevresinin gerçek fiyat haritasını çıkar
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 26, fontSize: 23, fontWeight: 800 }}>
          <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#ffd166" }}>5–10 gönüllü</div>
          <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#ccefe5", color: "#0e7c66" }}>30 gerçek fiyat sinyali</div>
          <div style={{ display: "flex", padding: "10px 18px", borderRadius: 999, background: "#f7a99d" }}>10 doğrulama</div>
        </div>
        <div style={{ display: "flex", marginTop: 25, fontSize: 24, color: "#71685f" }}>
          {board.totalMissing.toLocaleString("tr-TR")} açık görev · {board.seedMissing.toLocaleString("tr-TR")} başlangıç · {board.userMissing.toLocaleString("tr-TR")} kullanıcı noktası
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 25, color: "#71685f" }}>
        <div style={{ display: "flex" }}>pinle.app/kampus</div>
        <div style={{ display: "flex" }}>Seed, kullanıcı katkısından ayrı</div>
      </div>
    </div>,
    size
  );
}

