import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import { jsonLdSafe } from "@/lib/jsonld";

const title = "Pinle Android'de Yayında — Gerçek Fiyat Haritasını Cebine Al";
const description =
  "Pinle Android uygulamasını indir. Yakındaki gerçek fiyatları gör, fiyat ekle ve güncelliğini toplulukla doğrula. Zorunlu hesap yok.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/android",
    languages: { "tr-TR": "/android", en: "/en", "x-default": "/android" },
  },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: "website", url: "/android", locale: "tr_TR" },
  twitter: { card: "summary_large_image", title, description },
};

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Pinle: Ucuz Lezzet Haritası",
  operatingSystem: "Android",
  applicationCategory: "LifestyleApplication",
  description: "Kullanıcı bildirimleri ve başlangıç verilerini kaynak şeffaflığıyla gösteren yerel fiyat haritası.",
  url: "https://pinle.app/android",
  downloadUrl: "https://play.google.com/store/apps/details?id=app.pinle.twa",
  datePublished: "2026-07-21",
  offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  publisher: { "@type": "Organization", name: "Revoba", url: "https://pinle.app" },
  featureList: [
    "Yakındaki gerçek fiyat gözlemlerini haritada görme",
    "Fiyat ekleme ve güncelliğini doğrulama",
    "Zorunlu hesap olmadan temel kullanım",
  ],
};

const steps = [
  ["1", "Gör", "Yakındaki mekan, ürün ve hizmetlerdeki tarihli fiyat kayıtlarına bak."],
  ["2", "Ekle", "Gerçekte gördüğün ya da ödediğin fiyatı mekan ve ürün bilgisiyle haritaya ekle."],
  ["3", "Doğrula", "Bir kaydı “hâlâ bu fiyat” veya “zamlandı” sinyaliyle güncel tut."],
] as const;

export default function AndroidLaunchPage() {
  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(applicationJsonLd) }}
      />
      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col gap-10">
        <nav className="flex items-center justify-between gap-4" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/en" className="text-sm font-bold underline underline-offset-4">
            English
          </Link>
        </nav>

        <header className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Android’de yayında
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Gerçek fiyatı <span className="text-tomato">gitmeden gör.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
                Çaydan dönere, berberden şezlonga çevrende gerçekten ne ödendiğini gör;
                bildiğin fiyatı ekle, güncelliğini toplulukla birlikte doğrula.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <PlayStoreLink
                source="android_hero"
                className="btn btn-tomato px-7 py-3 text-center"
                ariaLabel="Pinle Android uygulamasını Google Play'den indir"
              >
                Google Play’den indir ↗
              </PlayStoreLink>
              <Link href="/" className="btn btn-cream px-7 py-3 text-center">
                Haritada dene 🗺️
              </Link>
            </div>
            <p className="text-xs leading-relaxed opacity-60">
              Ücretsiz · Temel kullanımda zorunlu hesap yok · Web ve Android
            </p>
          </div>

          <div className="sticker sticker-mustard mx-auto w-full max-w-sm p-4 sm:p-6" aria-label="Pinle uygulama özeti">
            <div className="rounded-[2rem] border-[3px] border-ink bg-cream p-3 shadow-[6px_6px_0_var(--ink)]">
              <div className="mb-3 flex items-center justify-between border-b-2 border-line pb-2">
                <span className="display font-extrabold text-tomato">📍 Pinle</span>
                <span className="text-xs font-bold">Örnek fiyat kartları</span>
              </div>
              <div className="relative min-h-72 overflow-hidden rounded-2xl border-2 border-ink bg-[#dcebea] p-4">
                <div className="absolute -right-10 top-8 h-28 w-44 rotate-12 rounded-full border-2 border-teal/40 bg-[#c8e3dc]" />
                <div className="absolute -left-8 bottom-8 h-28 w-40 -rotate-6 rounded-full border-2 border-mustard bg-[#fff1ba]" />
                <div className="relative flex flex-col gap-3">
                  <div className="sticker-flat self-start bg-cream px-3 py-2 text-sm font-bold">
                    ☕ Çay <span className="text-tomato">25 TL</span>
                  </div>
                  <div className="sticker-flat ml-auto mt-8 bg-cream px-3 py-2 text-sm font-bold">
                    🥙 Döner <span className="text-tomato">160 TL</span>
                  </div>
                  <div className="sticker-flat mt-5 self-start bg-cream px-3 py-2 text-sm font-bold">
                    ✂️ Berber <span className="text-tomato">450 TL</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-sm font-extrabold">Kazık yeme, Pinle.</p>
            </div>
          </div>
        </header>

        <section aria-labelledby="nasil-calisir" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Topluluk döngüsü</p>
            <h2 id="nasil-calisir" className="text-3xl font-extrabold">Fiyatı ekle, doğrulamayı birlikte büyüt</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([number, label, copy], index) => (
              <article key={label} className={`sticker-flat p-5 ${index === 1 ? "sticker-mustard" : ""}`}>
                <p className="display text-4xl font-extrabold text-tomato">{number}</p>
                <h3 className="mt-2 text-xl font-extrabold">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat p-6">
            <h2 className="text-2xl font-extrabold">Gözlem, resmi tarife değil</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              Pinle’deki kayıtlar kullanıcı bildirimleri ve Pinle başlangıç verilerinden
              oluşur. Tarihe ve doğrulama sinyallerine bak; değişen fiyatı güncelle.
            </p>
            <Link href="/fiyatlar#veri-yontemi" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
              Veri yöntemini incele →
            </Link>
          </article>
          <article className="sticker-flat sticker-mint p-6">
            <h2 className="text-2xl font-extrabold">Kayıt zorunluluğu yok</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              Telefon, isim veya zorunlu hesap olmadan başlayabilirsin. Konum izni yalnız
              haritayı cihazında bulunduğun yere getirmek için kullanılır.
            </p>
            <Link href="/gizlilik" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
              Gizlilik ve KVKK →
            </Link>
          </article>
        </section>

        <Link href="/sprint/istanbul" className="sticker-flat sticker-mustard block p-6 sm:p-7">
          <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Canlı yerel görev</p>
          <h2 className="mt-1 text-2xl font-extrabold">Beyoğlu mu Kadıköy mü?</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            İstanbul Fiyat Sprinti’nde iki ilçenin gerçek kullanıcı katkılarını canlı gör;
            mahallenden bir fiyat ekleyerek takımına katıl.
          </p>
          <span className="mt-4 inline-block text-sm font-extrabold underline underline-offset-4">
            Canlı skoru aç →
          </span>
        </Link>

        <Link href="/gorevler" className="sticker-flat sticker-mint block p-6 sm:p-7">
          <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Canlı mikro görevler</p>
          <h2 className="mt-1 text-2xl font-extrabold">Haritada hangi yerler fiyat bekliyor?</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            Şehir şehir eksik fiyatları gör; bildiğin mekanın görevini aç ve fiyat formuna
            doğrudan git. Başlangıç noktaları ile kullanıcı noktaları ayrı gösterilir.
          </p>
          <span className="mt-4 inline-block text-sm font-extrabold underline underline-offset-4">
            Fiyat görevlerini aç →
          </span>
        </Link>

        <section className="sticker sticker-tomato flex flex-col items-start gap-4 p-6 text-white sm:p-8">
          <h2 className="text-3xl font-extrabold">Mahallenden bir gerçek fiyat ekle.</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            Pinle’yi yararlı yapan yalnız indirme değil, güncel fiyat yoğunluğu. Uygulamayı
            açtıktan sonra çevrenden bir fiyat ekle veya mevcut bir kaydı doğrula.
          </p>
          <PlayStoreLink
            source="android_bottom"
            className="btn btn-mustard px-7 py-3 text-ink"
            ariaLabel="Pinle Android uygulamasını Google Play'den indir"
          >
            Android uygulamasını indir ↗
          </PlayStoreLink>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Revoba · 2026</p>
          <div className="flex gap-4">
            <Link href="/fiyatlar">Fiyatlar</Link>
            <Link href="/gorevler">Görevler</Link>
            <Link href="/basin">Basın</Link>
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/en">English</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
