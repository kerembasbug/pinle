import type { Metadata, Viewport } from "next";
import { Baloo_2, Sora } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";

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
  title: "Pinle — Ucuz Lezzet Haritası",
  description:
    "Şehrindeki ucuz ve iyi yemek noktalarını pinle, fiyatları doğrula, mahallenin muhtarı ol. Türkiye'nin sokak lezzeti haritası.",
  applicationName: "Pinle",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Pinle — Ucuz Lezzet Haritası",
    description: "Ucuz ve iyi yemek noktalarını pinle, fiyatları doğrula.",
    siteName: "Pinle",
    locale: "tr_TR",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinle — Ucuz Lezzet Haritası",
    description: "Ucuz ve iyi yemek noktalarını pinle, fiyatları doğrula.",
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
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
