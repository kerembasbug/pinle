import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pinle — Ucuz Lezzet Haritası",
    short_name: "Pinle",
    description:
      "Şehrindeki ucuz ve iyi yemek noktalarını pinle, fiyatları doğrula, mahallenin muhtarı ol.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf5ea",
    theme_color: "#e8442e",
    lang: "tr",
    categories: ["food", "maps", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
