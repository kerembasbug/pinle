import type { Metadata } from "next";
import { jsonLdSafe } from "@/lib/jsonld";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import {
  getPriceDataset,
  PRICE_DATASET_METHOD_RELEASED_AT,
  PRICE_DATASET_METHOD_VERSION,
  sqliteUtcToIso,
} from "@/lib/priceDataset";
import { YEAR } from "@/lib/seoIntents";
import { formatPrice } from "@/lib/types";

// Build konteynerinde production veritabanı bağlı olmadığı için bu sayfa statik
// üretilmemeli; CSV ve sayfa her zaman aynı canlı veri kaynağını okumalı.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "döner fiyatı ne kadar 2026", "çay fiyatı", "simit kaç TL" long-tail kümesinin
// tek güçlü merkezi: kaynağı açıkça ayrılmış canlı sokak fiyat endeksi.
const title = `Türkiye Sokak Fiyatları ${YEAR} — Döner, Çay, Ekmek Ne Kadar?`;
const description = `Döner, çay, ekmek, berber ve şezlong için ${YEAR} tarihli Pinle fiyat kayıtları. Kullanıcı ve ekip başlangıç verisi ayrı; eski kayıtlar dışarıda; yöntem ve CSV açık.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fiyatlar" },
  openGraph: { title, description, type: "website", url: "/fiyatlar" },
  twitter: { card: "summary_large_image", title, description },
};

export default function PricesPage() {
  const dataset = getPriceDataset();
  const items = dataset.items;
  const lastObservedIso = sqliteUtcToIso(dataset.lastObservedAt);
  const firstObservedIso = sqliteUtcToIso(dataset.firstObservedAt);
  const citation = `Pinle Türkiye Sokak Fiyatları ${YEAR}, yöntem ${PRICE_DATASET_METHOD_VERSION}, erişim ${new Date().toISOString().slice(0, 10)}, https://pinle.app/fiyatlar`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pinle", item: "https://pinle.app" },
          { "@type": "ListItem", position: 2, name: `Sokak Fiyatları ${YEAR}`, item: "https://pinle.app/fiyatlar" },
        ],
      },
      {
        "@type": "Dataset",
        name: `Türkiye Sokak Fiyatları ${YEAR}`,
        description,
        url: "https://pinle.app/fiyatlar",
        dateModified:
          lastObservedIso && lastObservedIso > PRICE_DATASET_METHOD_RELEASED_AT
            ? lastObservedIso
            : PRICE_DATASET_METHOD_RELEASED_AT,
        version: PRICE_DATASET_METHOD_VERSION,
        keywords: ["Türkiye sokak fiyatları", "gerçek fiyat", "fiyat veri seti", "yerel fiyat"],
        creator: {
          "@type": "Organization",
          name: "Pinle",
          url: "https://pinle.app",
        },
        isAccessibleForFree: true,
        distribution: {
          "@type": "DataDownload",
          contentUrl: "https://pinle.app/veri/fiyatlar.csv",
          encodingFormat: "text/csv",
          name: `Toplulaştırılmış Türkiye Sokak Fiyatları ${YEAR} CSV`,
        },
        spatialCoverage: { "@type": "Country", name: "Türkiye" },
        temporalCoverage:
          firstObservedIso && lastObservedIso
            ? `${firstObservedIso.slice(0, 10)}/${lastObservedIso.slice(0, 10)}`
            : String(YEAR),
        citation,
        variableMeasured: [
          "Ürün veya hizmet adı",
          "Ödenen fiyat",
          "Şehir",
          "Gözlem sayısı",
          "Ortanca, minimum ve maksimum fiyat",
          "Gerçek kullanıcı ve Pinle Ekibi başlangıç gözlemi sayısı",
          "En az bir ikinci-kişi doğrulaması bulunan gözlem sayısı",
        ],
        measurementTechnique:
          "Güncel Pinle fiyat kayıtlarının ürün veya hizmet adına göre gruplanması; eski diye işaretlenmiş kayıtların dışlanması; gerçek kullanıcı ve Pinle Ekibi başlangıç kaynağının ayrılması; en az iki gözlemi olan gruplarda çift örneklem için iki orta değerin ortalamasıyla medyan ve fiyat aralığı hesabı.",
      },
    ],
  };

  return (
    <main className="paper-grain mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }} />

      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">📍</span>
          <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="opacity-70">Sokak Fiyatları</span>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold leading-tight">
          Türkiye Sokak Fiyatları {YEAR} 🏷️
        </h1>
        <p className="text-[15px] leading-relaxed opacity-80">
          Döner ne kadar, çay kaç TL, berber kaça tıraş ediyor? Buradaki rakamlar menü ya da
          liste fiyatı değil — Pinle&apos;de tarihli fiyat kaydı olarak tutulan gözlemler.
          Gerçek kullanıcı katkısı ile Pinle Ekibi&apos;nin başlangıç kapsamı ayrı gösterilir;
          &quot;zamlandı&quot; denmiş kayıtlar endeksten çıkarılır. Endeks her 15 dakikada
          tazelenir; medyan değer uç fiyatlardan daha az etkilenir.
        </p>
        {dataset.observationCount > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-teal">
              {items.length} karşılaştırılabilir kalemde {dataset.observationCount} fiyat gözlemi
            </p>
            <a
              href="/veri/fiyatlar.csv"
              download
              className="btn btn-cream px-3 py-1.5 text-sm"
            >
              Toplulaştırılmış CSV’yi indir ⭳
            </a>
          </div>
        )}
        {dataset.observationCount > 0 && (
          <div className="sticker-flat sticker-mustard mt-2 p-4 text-sm leading-relaxed">
            <p className="font-extrabold">Kaynak ayrımı</p>
            <p className="mt-1 opacity-80">
              Bu tabloda <b>{dataset.userObservationCount} gerçek kullanıcı</b> ve{" "}
              <b>{dataset.seedObservationCount} Pinle Ekibi başlangıç</b> gözlemi var.
              {dataset.userObservationCount === 0
                ? " Henüz bu tabloyu topluluk traksiyonu veya kullanıcı fiyat endeksi olarak sunmuyoruz."
                : ` ${dataset.confirmedObservationCount} gözlem en az bir ikinci kişi tarafından doğrulandı.`}
            </p>
          </div>
        )}
      </header>

      {items.length === 0 ? (
        <p className="sticker-flat p-4 text-sm opacity-70">Endeks için henüz yeterli veri yok.</p>
      ) : (
        <section className="sticker-flat shrink-0 overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b-2 border-ink/70 bg-paper px-4 py-2 text-xs font-extrabold opacity-70">
            <span>Ürün / Hizmet</span>
            <span className="text-right">Ortanca</span>
            <span className="text-right">Aralık</span>
          </div>
          {items.map((x) => (
            <div
              key={x.item}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-line px-4 py-2.5 last:border-0"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{x.item}</span>
                <span className="text-[11px] opacity-55">
                  {x.count} kayıt · {x.userObservationCount} kullanıcı · {x.seedObservationCount} başlangıç
                  {x.confirmedObservationCount > 0 ? ` · ${x.confirmedObservationCount} doğrulamalı` : ""}
                  {x.cheapestCity !== "Belirtilmedi" ? ` · en ucuz: ${x.cheapestCity}` : ""}
                </span>
              </span>
              <span className="display text-right text-lg font-extrabold text-tomato">
                {formatPrice(x.median)}
              </span>
              <span className="text-right text-xs opacity-60">
                {formatPrice(x.min)}–{formatPrice(x.max)}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-extrabold">Şehrine göre bak</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/sehir/${c.slug}`} className="btn btn-cream px-3 py-1.5 text-sm">
              🏙️ {c.name} ucuz yemek haritası
            </Link>
          ))}
        </div>
      </section>

      <section id="veri-yontemi" className="sticker-flat flex flex-col gap-2 p-4">
        <h2 className="text-lg font-extrabold">Veri nasıl hesaplanıyor?</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed opacity-80">
          <li>Fiyatlar, Pinle&apos;de tutulan güncel fiyat kayıtlarıdır; gerçek kullanıcı ve Pinle Ekibi başlangıç kaynağı ayrı sayılır.</li>
          <li>“Zamlandı” sinyali taşıyan kayıtlar mevcut endekse alınmaz.</li>
          <li>Tek kayda dayanan ürün ve hizmetler karşılaştırma tablosuna alınmaz.</li>
          <li>Medyan kullanılır; çift sayılı örneklemde ortadaki iki fiyatın aritmetik ortalaması alınır.</li>
          <li>“Doğrulamalı” sayısı, fiyatı en az bir ikinci kişinin “hâlâ bu fiyat” diye onayladığı kayıtları gösterir.</li>
        </ul>
        <p className="text-sm leading-relaxed opacity-70">
          Haber, öğrenci bütçesi veya yerel fiyat karşılaştırması hazırlıyorsan bu sayfayı
          kaynak olarak gösterebilirsin. Veriyi kullanırken erişim tarihini ve gerçek kullanıcı /
          ekip başlangıç kaynağı dağılımını belirtmeni öneririz.
        </p>
        <p className="text-sm leading-relaxed opacity-70">
          İndirilebilir CSV yalnızca en az iki gözlemi bulunan kalemlerin toplulaştırılmış
          sonuçlarını içerir. Kullanıcı kimliği, yorum, koordinat ve tekil mekan kaydı
          paylaşılmaz. Kaynak gösterirken <b>Pinle Türkiye Sokak Fiyatları</b>, erişim tarihi
          ve <code>https://pinle.app/fiyatlar</code> adresini belirt.
        </p>
        <Link href="/metodoloji" className="text-sm font-extrabold underline underline-offset-4">
          Kaynak, güncellik ve doğrulama sözleşmesini oku →
        </Link>
        <div className="mt-1 rounded-xl border border-ink/20 bg-paper p-3 text-xs leading-relaxed">
          <p className="font-extrabold">Önerilen atıf</p>
          <code className="mt-1 block break-words">{citation}</code>
        </div>
      </section>

      <p className="text-sm leading-relaxed opacity-70">
        Bir fiyat mı biliyorsun? Haritayı aç, mekanı bul (ya da pinle), ne aldığını ve kaç
        ödediğini yaz — endeks herkes için güncellensin. İndirim/kampanyaysa geçerlilik
        tarihi de ekleyebilirsin.
      </p>
      <Link href="/" className="btn btn-tomato self-center px-8 py-3">
        Haritayı Aç 🗺️
      </Link>
    </main>
  );
}
