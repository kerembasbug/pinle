import type { Metadata } from "next";
import { jsonLdSafe } from "@/lib/jsonld";
import Link from "next/link";
import { db } from "@/lib/db";
import { CITIES } from "@/lib/cities";
import { YEAR } from "@/lib/seoIntents";
import { formatPrice } from "@/lib/types";

export const revalidate = 900; // 15 dk ISR — canlı fiyat endeksi

// "döner fiyatı ne kadar 2026", "çay fiyatı", "simit kaç TL" long-tail kümesinin
// tek güçlü merkezi: topluluk verisinden canlı sokak fiyat endeksi.
const title = `Türkiye Sokak Fiyatları ${YEAR} — Döner, Çay, Ekmek Ne Kadar? | Pinle`;
const description = `Döner, çay, ekmek, berber, şezlong... ${YEAR}'de sokakta gerçekte ne kadar ödeniyor? Topluluğun girdiği, mahalleli doğrulamalı canlı fiyat endeksi — menü fiyatı değil, ödenen fiyat.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fiyatlar" },
  openGraph: { title, description, type: "website", url: "/fiyatlar" },
  twitter: { card: "summary_large_image", title, description },
};

type Row = { item: string; price: number; city: string | null };

function priceIndex() {
  const rows = db()
    .prepare(
      `SELECT price_item AS item, price, city FROM pins
        WHERE status = 'active' AND price IS NOT NULL AND price_item IS NOT NULL AND price_item != ''`
    )
    .all() as Row[];
  const byItem = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.item.trim();
    if (!byItem.has(key)) byItem.set(key, []);
    byItem.get(key)!.push(r);
  }
  const items = [...byItem.entries()]
    .map(([item, rs]) => {
      const prices = rs.map((r) => r.price).sort((a, b) => a - b);
      const cheapest = rs.reduce((a, b) => (a.price <= b.price ? a : b));
      return {
        item,
        count: rs.length,
        min: prices[0],
        max: prices[prices.length - 1],
        median: prices[Math.floor(prices.length / 2)],
        cheapestCity: cheapest.city && cheapest.city !== "-" ? cheapest.city : null,
      };
    })
    .filter((x) => x.count >= 2) // tek kayıtlık kalemler endekse girmez (gürültü)
    .sort((a, b) => b.count - a.count)
    .slice(0, 60);
  return items;
}

export default function PricesPage() {
  const items = priceIndex();
  const observationCount = items.reduce((sum, item) => sum + item.count, 0);

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
        temporalCoverage: String(YEAR),
        variableMeasured: [
          "Ürün veya hizmet adı",
          "Ödenen fiyat",
          "Şehir",
          "Gözlem sayısı",
          "Ortanca, minimum ve maksimum fiyat",
          "Topluluk doğrulama durumu",
        ],
        measurementTechnique:
          "Topluluk tarafından girilen fiyat gözlemlerinin ürün veya hizmet adına göre gruplanması; en az iki gözlemi olan gruplarda ortanca ve fiyat aralığı hesabı.",
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
          liste fiyatı değil — <b>sokakta gerçekten ödenen</b>, topluluğun girdiği ve
          &quot;hâlâ bu fiyat / zamlandı&quot; oylarıyla doğruladığı fiyatlar. Endeks her
          15 dakikada tazelenir; ortanca değer, uç fiyatlardan etkilenmez.
        </p>
        {observationCount > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-teal">
              {items.length} karşılaştırılabilir kalemde {observationCount} fiyat gözlemi
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
      </header>

      {items.length === 0 ? (
        <p className="sticker-flat p-4 text-sm opacity-70">Endeks için henüz yeterli veri yok.</p>
      ) : (
        <section className="sticker-flat overflow-hidden p-0">
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
                  {x.count} kayıt
                  {x.cheapestCity ? ` · en ucuz: ${x.cheapestCity}` : ""}
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
          <li>Fiyatlar Pinle kullanıcılarının gerçekten ödediğini bildirdiği gözlemlerdir; resmi tarife veya işletme menüsü değildir.</li>
          <li>Tek kayda dayanan ürün ve hizmetler karşılaştırma tablosuna alınmaz.</li>
          <li>Ortanca değer kullanılır; böylece çok düşük veya çok yüksek tekil fiyatların etkisi azalır.</li>
          <li>“Hâlâ bu fiyat / zamlandı” oyları eskiyen kayıtların görünürlüğünü azaltmaya yardımcı olur.</li>
        </ul>
        <p className="text-sm leading-relaxed opacity-70">
          Haber, öğrenci bütçesi veya yerel fiyat karşılaştırması hazırlıyorsan bu sayfayı
          kaynak olarak gösterebilirsin. Veriyi kullanırken tarih ve “topluluk gözlemi”
          niteliğini belirtmeni öneririz.
        </p>
        <p className="text-sm leading-relaxed opacity-70">
          İndirilebilir CSV yalnızca en az iki gözlemi bulunan kalemlerin toplulaştırılmış
          sonuçlarını içerir. Kullanıcı kimliği, yorum, koordinat ve tekil mekan kaydı
          paylaşılmaz. Kaynak gösterirken <b>Pinle Türkiye Sokak Fiyatları</b>, erişim tarihi
          ve <code>https://pinle.app/fiyatlar</code> adresini belirt.
        </p>
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
