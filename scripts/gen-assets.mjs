// PWA/Play Store görsel üretimi: ikonlar + feature graphic.
// Kullanım: node scripts/gen-assets.mjs
import sharp from "sharp";
import fs from "node:fs";

fs.mkdirSync("public/icons", { recursive: true });
fs.mkdirSync("store-assets", { recursive: true });

// --- Uygulama ikonu (src/app/icon.svg ile aynı tasarım) ---
const iconSvg = (padRatio = 0) => {
  // padRatio: maskable için güvenli alan (içerik ortada %80'de kalmalı)
  const s = 512;
  const pad = s * padRatio;
  const inner = s - pad * 2;
  const scale = inner / 512;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${padRatio > 0 ? 0 : 112}" fill="#e8442e"/>
  <g transform="translate(${pad},${pad}) scale(${scale})">
    <path d="M256 96c-66 0-120 52-120 116 0 88 104 190 116 201a6 6 0 0 0 8 0c12-11 116-113 116-201 0-64-54-116-120-116z" fill="#fffdf7" stroke="#221b15" stroke-width="18"/>
    <circle cx="256" cy="212" r="52" fill="#ffc145" stroke="#221b15" stroke-width="16"/>
  </g>
</svg>`);
};

await sharp(iconSvg(0)).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(iconSvg(0)).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(iconSvg(0.1)).resize(512, 512).png().toFile("public/icons/maskable-512.png");
await sharp(iconSvg(0)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
// Play Console yüksek çözünürlüklü ikon (512, alfa kanalsız kabul edilir; PNG 32-bit de olur)
await sharp(iconSvg(0)).resize(512, 512).png().toFile("store-assets/play-icon-512.png");

// --- Feature graphic 1024x500 ---
const feature = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="#fbf5ea"/>
  <!-- arka plan yol dokusu -->
  <g stroke="#f0e4cd" stroke-width="14" fill="none">
    <path d="M-20 120 C 200 80, 320 220, 560 180 S 900 100, 1060 160"/>
    <path d="M-20 320 C 180 380, 400 280, 620 340 S 880 420, 1060 360"/>
    <path d="M180 -20 C 220 120, 140 280, 220 520"/>
    <path d="M760 -20 C 700 140, 820 300, 740 520"/>
  </g>
  <!-- mini pinler (emoji yerine vektör) -->
  <g>
    <circle cx="890" cy="120" r="16" fill="#ffc145" stroke="#221b15" stroke-width="5"/>
    <circle cx="120" cy="430" r="13" fill="#0e7c66" stroke="#221b15" stroke-width="5"/>
    <circle cx="950" cy="400" r="11" fill="#e8442e" stroke="#221b15" stroke-width="5"/>
  </g>
  <!-- ana pin -->
  <g transform="translate(120,130)">
    <path d="M110 10 C 55 10, 12 53, 12 106 C 12 180, 100 262, 110 271 a 5 5 0 0 0 7 0 C 127 262, 208 180, 208 106 C 208 53, 165 10, 110 10z"
      fill="#e8442e" stroke="#221b15" stroke-width="10"/>
    <circle cx="110" cy="106" r="42" fill="#fffdf7" stroke="#221b15" stroke-width="9"/>
  </g>
  <!-- başlık -->
  <g font-family="Arial Rounded MT Bold, Arial, sans-serif">
    <text x="380" y="215" font-size="110" font-weight="800" fill="#221b15">Pinle</text>
    <text x="384" y="278" font-size="38" font-weight="700" fill="#e8442e">Ucuz Lezzet Haritası</text>
    <text x="384" y="330" font-size="26" fill="#221b15" opacity="0.75">Pinle, doğrula, mahallenin muhtarı ol</text>
  </g>
  <!-- fiyat rozeti (başlığın altında, sağda) -->
  <g transform="translate(384,368)">
    <rect x="0" y="0" rx="34" width="250" height="68" fill="#fffdf7" stroke="#221b15" stroke-width="6"/>
    <text x="28" y="47" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#c73722">₺120</text>
    <text x="135" y="47" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#0e7c66">✓ 12</text>
  </g>
</svg>`);
await sharp(feature).png().toFile("store-assets/feature-graphic-1024x500.png");

console.log("Üretildi:");
for (const f of ["public/icons/icon-192.png", "public/icons/icon-512.png", "public/icons/maskable-512.png", "public/icons/apple-touch-icon.png", "store-assets/play-icon-512.png", "store-assets/feature-graphic-1024x500.png"]) {
  console.log(" -", f, fs.statSync(f).size, "bayt");
}
