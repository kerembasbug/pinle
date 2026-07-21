import type { Metadata } from "next";
import { jsonLdSafe } from "@/lib/jsonld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, cityBySlug, cityCatCombos, cityPins, cityStats } from "@/lib/cities";
import { categoryById, categoryIcon } from "@/lib/categories";
import { intentFor, YEAR } from "@/lib/seoIntents";
import { formatPrice } from "@/lib/types";

export const revalidate = 900; // 15 dk ISR — hızlı, taze yeterli

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) return { title: "Şehir bulunamadı — Pinle" };
  const stats = cityStats(city.name);
  // Long-tail: "[şehir]'de ucuza ne yenir", "[şehir] ucuz yemek", "öğrenci dostu"
  const title = `${city.name}'da Ucuza Ne Yenir? Ucuz Yemek & Fiyat Haritası ${YEAR} | Pinle`;
  const description = `${city.name}'da yeme-içme ve günlük hizmet fiyatlarını haritada incele. ${stats.pins > 0 ? `${stats.pins} nokta${stats.priced > 0 ? `, ${stats.priced} fiyatlı kayıt` : ""}. ` : ""}Eklenme tarihini ve topluluk doğrulamasını kontrol et; kayıt olmadan katkı ver.`;
  return {
    title,
    description,
    alternates: { canonical: `/sehir/${city.slug}` },
    openGraph: { title, description, type: "website", url: `/sehir/${city.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) notFound();

  const stats = cityStats(city.name);
  const pins = cityPins(city.name, 40);
  const others = CITIES.filter((c) => c.slug !== city.slug);
  const catLinks = cityCatCombos()
    .filter((c) => c.city === city.slug)
    .map((c) => c.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pinle", item: "https://pinle.app" },
          {
            "@type": "ListItem",
            position: 2,
            name: `${city.name} Fiyat Haritası`,
            item: `https://pinle.app/sehir/${city.slug}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${city.name} fiyat kayıtları`,
        numberOfItems: pins.length,
        itemListElement: pins.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: `https://pinle.app/pin/${p.id}`,
        })),
      },
    ],
  };

  return (
    <main className="paper-grain mx-auto flex min-h-dvh w-full min-w-0 max-w-2xl flex-col gap-5 p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />

      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">📍</span>
          <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="opacity-70">{city.name}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold leading-tight">
          {city.name}&apos;da Ucuza Ne Yenir? ({YEAR} Fiyat Haritası)
        </h1>
        <p className="text-[15px] leading-relaxed opacity-80">
          Esnaf lokantası, döner, kahvaltı ve çaydan berber, market ve şezlonga kadar
          bilinen fiyatları haritada incele. Kayıtlar kullanıcı bildirimleri ile Pinle
          başlangıç verilerinden oluşur; fiyatın eklenme tarihini ve &quot;hâlâ bu fiyat /
          zamlandı&quot; doğrulamalarını kontrol et. Kayıt olmadan anonim başla, gördüğün
          güncel fiyatı ekle.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <span className="sticker-flat px-3 py-1.5">📍 {stats.pins} nokta</span>
        {stats.priced > 0 && (
          <span className="sticker-flat px-3 py-1.5 text-tomato">🏷️ {stats.priced} fiyatlı</span>
        )}
        {stats.districts > 0 && (
          <span className="sticker-flat px-3 py-1.5 text-teal">📍 {stats.districts} ilçe</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/?sehir=${city.slug}&katki=seo_city&utm_source=seo_city&utm_medium=organic&utm_campaign=missing_price`}
          className="btn btn-tomato max-w-full whitespace-normal px-6 py-3 text-center text-lg leading-tight"
        >
          Eksik bir fiyatı tamamla 🏷️
        </Link>
        <Link href={`/?sehir=${city.slug}`} className="btn btn-cream px-5 py-3">
          Haritayı incele 🗺️
        </Link>
      </div>

      {catLinks.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-extrabold">Kategoriye göre</h2>
          <div className="flex flex-wrap gap-2">
            {catLinks.map((c) => {
              const m = categoryById(c);
              return (
                <Link
                  key={c}
                  href={`/sehir/${city.slug}/${c}`}
                  className="btn btn-cream px-3 py-1.5 text-sm"
                >
                  {m.emoji} {city.name} {intentFor(c).kw}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {pins.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="mt-2 text-lg font-extrabold">Öne çıkan noktalar</h2>
          <ul className="flex flex-col gap-2">
            {pins.map((p) => {
              const cat = categoryById(p.category);
              const price = formatPrice(p.price);
              return (
                <li key={p.id}>
                  <Link
                    href={`/pin/${p.id}`}
                    className="sticker-flat flex items-center gap-3 p-3 transition-transform hover:-translate-y-0.5"
                  >
                    {categoryIcon(p.category) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={categoryIcon(p.category)!} alt="" className="h-8 w-8 shrink-0" />
                    ) : (
                      <span className="text-2xl">{cat.emoji}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{p.name}</span>
                      <span className="block text-xs opacity-60">
                        {cat.label}
                        {p.district ? ` · ${p.district}` : ""}
                        {p.confirms > 0 ? ` · ✓ ${p.confirms} doğrulama` : ""}
                      </span>
                    </span>
                    {price && (
                      <span className="shrink-0 text-right">
                        {p.price_item && (
                          <span className="block text-[10px] opacity-60">{p.price_item}</span>
                        )}
                        <span className="display text-lg font-extrabold text-tomato">{price}</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <p className="sticker-flat p-4 text-sm opacity-70">
          {city.name}&apos;da henüz pin yok. İlk pinleyen sen ol —{" "}
          <Link
            href={`/?sehir=${city.slug}&katki=seo_city&utm_source=seo_city&utm_medium=organic&utm_campaign=first_pin`}
            className="underline"
          >
            ilk yeri ekle
          </Link>
          .
        </p>
      )}

      <Link href="/fiyatlar" className="sticker-flat p-3 text-sm font-bold">
        🏷️ Türkiye sokak fiyatları endeksi — döner, çay, ekmek {YEAR}&apos;de ne kadar? →
      </Link>

      <section className="mt-2 flex flex-col gap-2">
        <h2 className="text-lg font-extrabold">Diğer şehirler</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((c) => (
            <Link key={c.slug} href={`/sehir/${c.slug}`} className="btn btn-cream px-3 py-1.5 text-sm">
              🏙️ {c.name}
            </Link>
          ))}
          <Link href="/liderler" className="btn btn-cream px-3 py-1.5 text-sm">
            🏆 Liderlik Tablosu
          </Link>
        </div>
      </section>

      <Link href="/" className="btn btn-tomato mt-2 self-center px-8 py-3">
        Haritaya Dön 🗺️
      </Link>
    </main>
  );
}
