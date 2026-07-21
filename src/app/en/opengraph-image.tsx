import { ImageResponse } from "next/og";

export const alt = "Pinle — See what people actually pay nearby";
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
        justifyContent: "center",
        padding: "70px 80px",
        color: "#221b15",
        background: "#fbf5ea",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, color: "#e8442e" }}>📍 Pinle</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 58, fontSize: 78, fontWeight: 800, lineHeight: 1.02 }}>
        <span>See what people</span>
        <span style={{ color: "#e8442e" }}>actually pay nearby.</span>
      </div>
      <div style={{ display: "flex", marginTop: 46, gap: 18, fontSize: 26 }}>
        <span style={{ border: "3px solid #221b15", borderRadius: 999, padding: "12px 22px", background: "#ffc145" }}>View</span>
        <span style={{ border: "3px solid #221b15", borderRadius: 999, padding: "12px 22px", background: "#fffdf7" }}>Add</span>
        <span style={{ border: "3px solid #221b15", borderRadius: 999, padding: "12px 22px", background: "#dcebea" }}>Verify</span>
        <span style={{ display: "flex", alignItems: "center", marginLeft: 20 }}>Now on Android</span>
      </div>
    </div>
  );
}
