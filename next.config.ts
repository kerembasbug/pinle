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
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob: https://*.openfreemap.org https://tiles.openfreemap.org",
      "connect-src 'self' https://*.openfreemap.org https://tiles.openfreemap.org",
      "style-src 'self' 'unsafe-inline'",
      // Next runtime + JSON-LD; prod'da inline script'ler hash yerine unsafe-inline
      // (uygulama küçük, harici script yok). dev'de eval için unsafe-eval.
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
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
