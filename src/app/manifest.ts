import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pinle — Kazık Yeme, Pinle.",
    short_name: "Pinle",
    description:
      "Olduğun yerin gerçek fiyat haritası. Nereye gidersen git — döner, çay, şezlong, berber — gerçekte ne ödeniyor gör, fiyatı bilerek git.",
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
