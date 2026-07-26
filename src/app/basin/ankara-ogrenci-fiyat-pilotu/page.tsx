import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import { jsonLdSafe } from "@/lib/jsonld";

const title = "Ankara’da Öğrenci Fiyat Şeffaflığı Pilotu Başlıyor | Pinle Basın Bülteni";
const description =
  "Pinle, Bahçelievler, Maltepe ve Kızılay'da işletmelerin tarihli fiyat paylaşacağı, öğrencilerin güncelliği birlikte kontrol edeceği ilk Ankara pilotunun çağrısını açtı.";
const canonicalUrl = "https://pinle.app/basin/ankara-ogrenci-fiyat-pilotu";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/basin/ankara-ogrenci-fiyat-pilotu" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/basin/ankara-ogrenci-fiyat-pilotu",
    locale: "tr_TR",
    publishedTime: "2026-07-26T12:00:00+03:00",
  },
  twitter: { card: "summary_large_image", title, description },
};

const releaseFacts = [
  ["26 Temmuz 2026", "Bülten tarihi"],
  ["Ankara", "Pilot şehir"],
  ["15", "İlk dalga kapasitesi"],
  ["3", "İşletme başına tarihli fiyat hedefi"],
] as const;

export default function AnkaraPilotPressReleasePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: "Ankara’da öğrenci fiyat şeffaflığı pilotu başlıyor",
    description,
    datePublished: "2026-07-26T12:00:00+03:00",
    dateModified: "2026-07-26T12:00:00+03:00",
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Person", name: "Kerem Başbuğ" },
    publisher: {
      "@type": "Organization",
      name: "Revoba",
      url: "https://revoba.net",
      email: "info@revoba.net",
    },
    about: {
      "@type": "MobileApplication",
      name: "Pinle",
      operatingSystem: "Android",
      applicationCategory: "LifestyleApplication",
      downloadUrl: "https://play.google.com/store/apps/details?id=app.pinle.twa",
    },
  };

  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(articleJsonLd) }}
      />
      <article className="relative z-[2] mx-auto flex max-w-4xl flex-col gap-9">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Basın navigasyonu">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/basin" className="text-sm font-bold underline underline-offset-4">
            Basın ve medya kitine dön
          </Link>
        </nav>

        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-wide">
            <span className="btn btn-mustard pointer-events-none px-4 py-1.5">Basın bülteni</span>
            <span className="opacity-60">Ankara · 26 Temmuz 2026 · Hemen yayımlanabilir</span>
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.04] sm:text-6xl">
            Ankara’da öğrencilerin fiyatı gitmeden görmesi için{" "}
            <span className="text-tomato">işletme pilotu başlıyor.</span>
          </h1>
          <p className="max-w-3xl text-lg font-bold leading-relaxed opacity-75 sm:text-xl">
            Topluluk destekli fiyat haritası Pinle, Bahçelievler, Maltepe ve Kızılay’da
            işletmelerin tarihli fiyat paylaşacağı; öğrencilerin güncelliği birlikte
            kontrol edeceği ilk Ankara çağrısını açtı.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Bülten özeti">
          {releaseFacts.map(([value, label], index) => (
            <div key={label} className={`sticker-flat p-4 ${index === 2 ? "sticker-mint" : ""}`}>
              <p className="display text-2xl font-extrabold text-tomato">{value}</p>
              <p className="mt-1 text-xs font-bold opacity-65">{label}</p>
            </div>
          ))}
        </section>

        <section className="sticker-flat p-6 sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">ANKARA —</p>
          <div className="mt-4 space-y-5 text-base leading-relaxed opacity-85">
            <p>
              Android uygulaması 21 Temmuz 2026’da Google Play’de yayımlanan Pinle, çevredeki
              mekan, ürün ve hizmetlerde insanların gördüğü veya ödediği fiyatları tarihli
              biçimde haritada buluşturuyor. Kullanıcılar mevcut fiyatı “hâlâ bu fiyat” ya da
              “zamlandı” sinyaliyle güncel tutabiliyor.
            </p>
            <p>
              Ankara pilotunda ilk dalga Bahçelievler, Maltepe ve Kızılay’a odaklanacak.
              Pilot için en fazla 15 uygun işletme kabul edilecek. Katılan işletmelerden ürün
              veya hizmet adıyla birlikte üç güncel fiyat ve varsa kampanyanın bitiş tarihini
              açıkça paylaşması istenecek. Öğrenci indirimi sunmak zorunlu olmayacak.
            </p>
            <p>
              Uygun işletmelere ücretsiz “Kurucu 15 · Ankara” katılım işareti, tezgâh QR’ı ve
              WhatsApp Durum paylaşım kiti sağlanacak. Katılım işareti bir kalite tavsiyesi,
              bağımsız doğrulama ya da “en ucuz” iddiası anlamına gelmeyecek. Fiyat güncelliği,
              işletme beyanından ayrı olarak bağımsız kullanıcı sinyalleriyle güçlenecek.
            </p>
          </div>
        </section>

        <blockquote className="sticker sticker-tomato p-6 text-white sm:p-8">
          <p className="text-2xl font-extrabold leading-snug sm:text-3xl">
            “Bir işletmeden indirim sözü değil, fiyatını açık ve tarihli paylaşmasını istiyoruz.
            Öğrenci gitmeden bütçesini görsün; fiyat değiştiğinde de bunu birlikte düzeltelim.”
          </p>
          <footer className="mt-5 text-sm font-bold text-white/80">
            Kerem Başbuğ · Pinle kurucusu
          </footer>
        </blockquote>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat sticker-mint p-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Haber değeri</p>
            <h2 className="mt-1 text-2xl font-extrabold">Fiyat listesi değil, güncellik döngüsü</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-80">
              Haritadaki başlangıç noktaları gerçek kullanıcı katkısı sayılmıyor. İşletme
              beyanı, kullanıcı gözlemi ve ikinci kişi güncellik sinyali birbirine
              karıştırılmadan raporlanıyor.
            </p>
          </article>
          <article className="sticker-flat p-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Katılım</p>
            <h2 className="mt-1 text-2xl font-extrabold">İşletme ve öğrenciler için açık çağrı</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-80">
              İşletmeler izinli WhatsApp akışıyla şartları öğrenebilir. Öğrenciler uygulamada
              gördükleri gerçek bir fiyatı ekleyebilir, doğrulayabilir veya uygun bir işletmeyi
              pilota yönlendirebilir.
            </p>
          </article>
        </section>

        <section className="sticker-flat sticker-mustard p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Editör için bağlantılar</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/ankara/ogrenci-fiyatlari" className="btn btn-tomato px-6 py-3 text-center">
              Ankara pilot sayfası →
            </Link>
            <Link href="/metodoloji" className="btn btn-cream px-6 py-3 text-center">
              Veri yöntemi →
            </Link>
            <Link href="/basin" className="btn btn-cream px-6 py-3 text-center">
              Logo ve medya görselleri →
            </Link>
            <PlayStoreLink
              source="basin_play"
              className="btn btn-cream px-6 py-3 text-center"
              ariaLabel="Pinle Android uygulamasını Google Play'de aç"
            >
              Google Play ↗
            </PlayStoreLink>
          </div>
        </section>

        <section className="space-y-3 border-t border-ink/20 pt-7 text-sm leading-relaxed">
          <h2 className="text-2xl font-extrabold">Pinle hakkında</h2>
          <p className="opacity-80">
            Pinle, yakındaki mekan, ürün ve hizmetlerde insanların gördüğü veya ödediği tarihli
            fiyatları haritada buluşturan topluluk destekli bir web ve Android uygulamasıdır.
            Temel kullanım zorunlu hesap gerektirmez. Pinle, Revoba tarafından geliştirilir.
          </p>
          <p>
            <strong>Basın iletişimi:</strong>{" "}
            <a href="mailto:info@revoba.net?subject=Pinle%20Ankara%20%C3%B6%C4%9Frenci%20fiyat%20pilotu" className="underline underline-offset-4">
              info@revoba.net
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
