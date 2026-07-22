import { ImageResponse } from "next/og";
import { getPriceTaskBoard } from "@/lib/priceTasks";

export const alt = "Pinle Fiyat Görevleri — haritadaki eksik fiyatları birlikte tamamla";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PriceTasksOgImage() {
  const board = getPriceTaskBoard();
  const label = board.userMissing > 0 ? "KULLANICI + BAŞLANGIÇ" : "BAŞLANGIÇ GÖREVLERİ";

  return new ImageResponse(
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
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: 1040, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
        <div style={{ display: "flex", border: "3px solid #0e7c66", borderRadius: 999, padding: "8px 18px", color: "#0e7c66", fontSize: 22, fontWeight: 800 }}>
          {label}
        </div>
      </div>
      <div style={{ width: 1040, minHeight: 390, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "34px 48px", background: "#fffdf7", border: "6px solid #221b15", borderRadius: 34, boxShadow: "10px 10px 0 #221b15" }}>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, textAlign: "center" }}>
          Haritadaki eksik fiyatları tamamla
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 18 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#e8442e" }}>
            {board.totalMissing.toLocaleString("tr-TR")}
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#71685f" }}>
            açık fiyat görevi
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 20, fontSize: 24, fontWeight: 700 }}>
          <div style={{ display: "flex", padding: "9px 18px", borderRadius: 999, background: "#ffd166" }}>
            {board.seedMissing.toLocaleString("tr-TR")} başlangıç
          </div>
          <div style={{ display: "flex", padding: "9px 18px", borderRadius: 999, background: "#ccefe5", color: "#0e7c66" }}>
            {board.userMissing.toLocaleString("tr-TR")} kullanıcı noktası
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 27, color: "#71685f" }}>
        pinle.app/gorevler · bildiğin bir fiyatı tamamla
      </div>
    </div>,
    size
  );
}
