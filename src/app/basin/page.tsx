import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import { jsonLdSafe } from "@/lib/jsonld";

const title = "Pinle Basın ve Medya Kiti — Gerçek Fiyat Haritası";
const description =
  "Pinle Android uygulaması için doğrulanmış ürün özeti, editoryal kaynaklar, marka görselleri, veri yöntemi ve basın iletişimi.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/basin" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/basin",
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title, description },
};

const pressJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pinle Basın ve Medya Kiti",
  description,
  url: "https://pinle.app/basin",
  datePublished: "2026-07-21",
  dateModified: "2026-07-21",
  about: {
    "@type": "MobileApplication",
    name: "Pinle",
    operatingSystem: "Android",
    applicationCategory: "LifestyleApplication",
    downloadUrl: "https://play.google.com/store/apps/details?id=app.pinle.twa",
  },
  publisher: {
    "@type": "Organization",
    name: "Revoba",
    url: "https://pinle.app",
    email: "info@revoba.net",
  },
};

const facts = [
  ["21 Temmuz 2026", "Android yayın tarihi"],
  ["Web + Android", "Kullanılabilir platformlar"],
  ["Hesapsız başlangıç", "Temel kullanım modeli"],
  ["Gör · ekle · doğrula", "Topluluk döngüsü"],
] as const;

const sources = [
  {
    label: "Canlı ürün",
    title: "Gerçek fiyat haritası",
    copy: "Ürünün web sürümünü aç; harita, pin ve fiyat akışını doğrudan dene.",
    href: "/",
  },
  {
    label: "Android",
    title: "Launch sayfası",
    copy: "Google Play bağlantısı, ürün vaadi, çalışma biçimi ve gizlilik özeti.",
    href: "/android",
  },
  {
    label: "Şeffaflık",
    title: "Veri yöntemi",
    copy: "Topluluk gözlemi, örneklem sınırı, tarih ve seed/kullanıcı ayrımı.",
    href: "/fiyatlar#veri-yontemi",
  },
  {
    label: "Canlı pilot",
    title: "İstanbul Fiyat Sprinti",
    copy: "Beyoğlu ve Kadıköy gerçek kullanıcı fiyat sinyallerinin canlı skoru.",
    href: "/sprint/istanbul",
  },
] as const;

export default function PressPage() {
  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(pressJsonLd) }}
      />
      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col gap-10">
        <nav className="flex items-center justify-between gap-4" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/android" className="text-sm font-bold underline underline-offset-4">
            Android uygulaması
          </Link>
        </nav>

        <header className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Basın ve medya kiti
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Gerçek fiyatı <span className="text-tomato">gitmeden gör.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
                Pinle, insanların çevrede gerçekten ne ödendiğini gördüğü; fiyat ekleyip
                güncelliğini birlikte doğruladığı topluluk destekli sokak fiyatı haritasıdır.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <PlayStoreLink
                source="basin_play"
                className="btn btn-tomato px-7 py-3 text-center"
                ariaLabel="Pinle Android uygulamasını Google Play'de aç"
              >
                Google Play’de aç ↗
              </PlayStoreLink>
              <a
                href="mailto:info@revoba.net?subject=Pinle%20bas%C4%B1n%20talebi"
                className="btn btn-cream px-7 py-3 text-center"
              >
                Basın iletişimi ✉️
              </a>
            </div>
          </div>

          <aside className="sticker sticker-mustard p-6 sm:p-7" aria-label="Kısa editoryal tanım">
            <p className="text-sm font-extrabold uppercase tracking-wide">Tek cümlede Pinle</p>
            <p className="mt-4 text-2xl font-extrabold leading-snug">
              “Gitmeden önce orada gerçekte ne ödendiğini gösteren topluluk fiyat haritası.”
            </p>
            <p className="mt-5 text-sm leading-relaxed opacity-75">
              Fiyatlar resmi tarife değil; tarihli kullanıcı gözlemidir. Güncellik ikinci
              kişinin “hâlâ bu fiyat” veya “zamlandı” sinyaliyle güçlenir.
            </p>
          </aside>
        </header>

        <section aria-labelledby="launch-notlari" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Doğrulanmış bilgiler</p>
            <h2 id="launch-notlari" className="text-3xl font-extrabold">Launch notları</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(([value, label], index) => (
              <article key={label} className={`sticker-flat p-5 ${index === 1 ? "sticker-mustard" : ""}`}>
                <p className="display text-2xl font-extrabold text-tomato">{value}</p>
                <p className="mt-2 text-sm font-bold opacity-70">{label}</p>
              </article>
            ))}
          </div>
          <p className="text-xs leading-relaxed opacity-60">
            Haritadaki ekip/OSM kapsamı gerçek kullanıcı katkısı gibi sunulmaz. Kullanıcı
            traksiyonu, fiyat sinyali ve doğrulama metrikleri seed veriden ayrı raporlanır.
          </p>
        </section>

        <section aria-labelledby="editoryal-kaynaklar" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Kaynağa git</p>
            <h2 id="editoryal-kaynaklar" className="text-3xl font-extrabold">Editoryal kaynaklar</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sources.map((source, index) => (
              <Link
                key={source.title}
                href={source.href}
                className={`sticker-flat block p-6 ${index === 3 ? "sticker-mint" : ""}`}
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-tomato">{source.label}</p>
                <h3 className="mt-1 text-2xl font-extrabold">{source.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{source.copy}</p>
                <span className="mt-4 inline-block text-sm font-extrabold underline underline-offset-4">
                  Aç →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="sticker-flat p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Yayına hazır boilerplate</p>
            <h2 className="mt-1 text-2xl font-extrabold">Pinle nedir?</h2>
            <blockquote className="mt-4 border-l-4 border-tomato pl-4 text-sm leading-relaxed opacity-80 sm:text-base">
              Pinle, yakındaki mekan, ürün ve hizmetlerde insanların gerçekten gördüğü veya
              ödediği tarihli fiyatları haritada buluşturur. Kullanıcılar yeni fiyat ekleyebilir;
              mevcut kayıtları “hâlâ bu fiyat” ya da “zamlandı” sinyaliyle güncel tutabilir.
              Temel kullanım zorunlu hesap gerektirmez. Pinle, 21 Temmuz 2026’da Android’de
              yayınlandı; web üzerinden de kullanılabilir.
            </blockquote>
          </article>
          <article className="sticker-flat sticker-tomato p-6 text-white sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-white/75">Kurucu yaklaşımı</p>
            <blockquote className="mt-4 text-xl font-extrabold leading-snug">
              “İndirme sayısından önce bir mahallede tekrar tekrar işe yarayan güncel fiyat
              yoğunluğu oluşturmak istiyoruz.”
            </blockquote>
            <p className="mt-5 text-sm font-bold text-white/80">Kerem Başbuğ · Pinle kurucusu</p>
          </article>
        </section>

        <section aria-labelledby="marka-dosyalari" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Kullanıma hazır</p>
            <h2 id="marka-dosyalari" className="text-3xl font-extrabold">Marka ve sosyal görseller</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/icons/icon-512.png" className="sticker-flat p-5" target="_blank" rel="noreferrer">
              <p className="text-2xl" aria-hidden>📍</p>
              <h3 className="mt-2 text-xl font-extrabold">Uygulama ikonu</h3>
              <p className="mt-2 text-sm opacity-70">512×512 PNG</p>
              <span className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Görseli aç ↗</span>
            </a>
            <a href="/android/opengraph-image" className="sticker-flat sticker-mustard p-5" target="_blank" rel="noreferrer">
              <p className="text-2xl" aria-hidden>🤖</p>
              <h3 className="mt-2 text-xl font-extrabold">Android launch görseli</h3>
              <p className="mt-2 text-sm opacity-70">1200×630 PNG</p>
              <span className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Görseli aç ↗</span>
            </a>
            <a href="/sprint/istanbul/opengraph-image" className="sticker-flat sticker-mint p-5" target="_blank" rel="noreferrer">
              <p className="text-2xl" aria-hidden>🏁</p>
              <h3 className="mt-2 text-xl font-extrabold">İstanbul sprint görseli</h3>
              <p className="mt-2 text-sm opacity-70">1200×630 PNG</p>
              <span className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Görseli aç ↗</span>
            </a>
          </div>
        </section>

        <section className="sticker sticker-mustard flex flex-col items-start gap-4 p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold">Röportaj, demo veya veri yöntemi sorusu?</h2>
          <p className="max-w-3xl text-sm leading-relaxed opacity-80 sm:text-base">
            Yayın adı, konu ve son teslim tarihini yaz. Kullanılabilir ürün görseli veya güncel
            metodoloji notu gerekiyorsa aynı e-postada belirt.
          </p>
          <a
            href="mailto:info@revoba.net?subject=Pinle%20bas%C4%B1n%20talebi"
            className="btn btn-cream px-7 py-3 text-center"
          >
            info@revoba.net ✉️
          </a>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Revoba · Son güncelleme: 21 Temmuz 2026</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/android">Android</Link>
            <Link href="/fiyatlar">Veri yöntemi</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
