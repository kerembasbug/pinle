import type { Metadata, Viewport } from "next";
import { Baloo_2, Sora } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";
import AcquisitionTracker from "@/components/AcquisitionTracker";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pinle — Kazık Yeme, Pinle. Olduğun Yerin Gerçek Fiyat Haritası",
  description:
    "Kazık yeme, Pinle. Nereye gidersen git — döner, çay, şezlong, berber — olduğun yerde gerçekte ne ödeniyor gör. Fiyatları oradakiler girer, oradakiler doğrular. Kayıt yok.",
  applicationName: "Pinle",
  verification: {
    google: "bXesrR2KDCFarpdhHIsHZpHmiBv1OSZ8EiiaWqDnQVo",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Pinle — Kazık Yeme, Pinle.",
    description: "Olduğun yerin gerçek fiyat haritası. Nereye gidersen git, fiyatı bilerek git.",
    siteName: "Pinle",
    locale: "tr_TR",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinle — Kazık Yeme, Pinle.",
    description: "Olduğun yerin gerçek fiyat haritası. Nereye gidersen git, fiyatı bilerek git.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e8442e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${baloo.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Harita tile sunucusuna erken bağlan — LCP için (React head'e hoist eder) */}
        <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tiles.openfreemap.org" />
        {children}
        <AcquisitionTracker />
        <SwRegister />
      </body>
    </html>
  );
}
