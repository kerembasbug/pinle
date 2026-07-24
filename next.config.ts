import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  output: "standalone",
  devIndicators: false,
  async headers() {
    // Güvenlik başlıkları. /embed dışında framelemeye izin verme; MIME-sniff
    // kapalı; referrer sınırlı. CSP: harita tile'ları + kendi origin + data/blob
    // (OG/ikon), inline stil/script (Next hidration + JSON-LD) izinli.
    const isProd = process.env.NODE_ENV === "production";
    // Google Sign-In (GIS) — resmi CSP gereksinimleri. Bunlar olmadan GSI script'i
    // yüklenmiyor (window.google undefined), buton iframe'i bloke oluyor → "Google
    // ile giriş çıkmıyor". Güvenlik turunda CSP eklenince sessizce kırılmıştı.
    // https://developers.google.com/identity/gsi/web/guides/csp
    const csp = [
      "default-src 'self'",
      // googleusercontent/gstatic: One Tap ve buton avatar/görselleri
      "img-src 'self' data: blob: https://*.openfreemap.org https://tiles.openfreemap.org https://*.googleusercontent.com https://*.gstatic.com",
      "connect-src 'self' https://*.openfreemap.org https://tiles.openfreemap.org https://accounts.google.com/gsi/",
      "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
      // Next runtime + JSON-LD; prod'da inline script'ler hash yerine unsafe-inline
      // (uygulama küçük, harici script yok). dev'de eval için unsafe-eval.
      // accounts.google.com/gsi/client: Google Identity Services kütüphanesi.
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://accounts.google.com/gsi/client`,
      // GSI butonu/One Tap kendi iframe'ini accounts.google.com/gsi/ altından açar.
      "frame-src 'self' https://accounts.google.com/gsi/",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    // NOT: X-Frame-Options kullanılmıyor — /embed'in cross-origin framelenmesini
    // engellerdi ve path-bazlı üzerine yazılamaz. CSP frame-ancestors (tüm modern
    // tarayıcılarda desteklenir) framing'i path'e göre yönetir.
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Konum bu origin'de açıkça izinli (bazı gömülü/edge bağlamlarında garanti)
      { key: "Permissions-Policy", value: "geolocation=(self)" },
    ];
    return [
      {
        // /embed başkalarınca framelenebilsin (widget) — frame-ancestors *
        source: "/embed",
        headers: [
          ...base,
          { key: "Content-Security-Policy", value: csp.replace("frame-ancestors 'self'", "frame-ancestors *") },
        ],
      },
      {
        // /embed HARİÇ tüm yollar (iki CSP birleşip en kısıtlayıcıya düşmesin)
        source: "/:path((?!embed$).*)",
        headers: [...base, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
