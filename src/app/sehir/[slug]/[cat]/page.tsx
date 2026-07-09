import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CITIES,
  cityBySlug,
  cityCatCombos,
  cityCatCount,
  cityCatPins,
  CITYCAT_MIN_PINS,
  SEO_CATEGORIES,
} from "@/lib/cities";
import { categoryById } from "@/lib/categories";
import { formatPrice } from "@/lib/types";

export const revalidate = 900;

export function generateStaticParams() {
  return cityCatCombos().map((c) => ({ slug: c.city, cat: c.category }));
}

function valid(slug: string, cat: string) {
  const city = cityBySlug(slug);
  if (!city) return null;
  if (!(SEO_CATEGORIES as readonly string[]).includes(cat)) return null;
  const { pins, priced } = cityCatCount(city.name, cat);
  if (pins < CITYCAT_MIN_PINS) return null;
  return { city, pins, priced };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; cat: string }>;
}): Promise<Metadata> {
  const { slug, cat } = await params;
  const v = valid(slug, cat);
  if (!v) return { title: "Sayfa bulunamadı — Pinle" };
  const label = categoryById(cat).label;
  const title = `${v.city.name} ${label} — Ucuz ve İyi ${label} Noktaları | Pinle`;
  const description = `${v.city.name}'da uygun fiyatlı ${label.toLowerCase()} arıyorsan doğru yerdesin. ${v.pins} nokta, fiyatları toplulukça doğrulanmış. Sen de bildiğin yeri pinle.`;
  return {
    title,
    description,
    alternates: { canonical: `/sehir/${slug}/${cat}` },
    openGraph: { title, description, type: "website", url: `/sehir/${slug}/${cat}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityCatPage({
  params,
}: {
  params: Promise<{ slug: string; cat: string }>;
}) {
  const { slug, cat } = await params;
  const v = valid(slug, cat);
  if (!v) notFound();
  const { city, pins: count, priced } = v;
  const meta = categoryById(cat);
  const label = meta.label;
  const list = cityCatPins(city.name, cat, 40);

  // Çapraz link ağı: bu şehirdeki diğer kategoriler + bu kategorinin diğer şehirleri
  const combos = cityCatCombos();
  const otherCatsHere = combos
    .filter((c) => c.city === slug && c.category !== cat)
    .map((c) => c.category);
  const otherCitiesForCat = combos
    .filter((c) => c.category === cat && c.city !== slug)
    .map((c) => c.city);

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
            name: `${city.name} Ucuz Lezzet Haritası`,
            item: `https://pinle.app/sehir/${city.slug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${city.name} ${label}`,
            item: `https://pinle.app/sehir/${city.slug}/${cat}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${city.name} ${label} noktaları`,
        numberOfItems: list.length,
        itemListElement: list.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: `https://pinle.app/pin/${p.id}`,
        })),
      },
    ],
  };

  return (
    <main className="paper-grain mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl">📍</span>
          <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href={`/sehir/${city.slug}`} className="opacity-70 underline">
          {city.name}
        </Link>
        <span className="opacity-40">/</span>
        <span className="opacity-70">{label}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold leading-tight">
          {city.name}&apos;da Ucuz {label} {meta.emoji}
        </h1>
        <p className="text-[15px] leading-relaxed opacity-80">
          {city.name}&apos;da uygun fiyatlı ve iyi {label.toLowerCase()} arayanlar için topluluk
          haritası. Fiyatlar mahalleliler tarafından &quot;hâlâ bu fiyat / zamlandı&quot; oylarıyla
          güncel tutulur. Kayıt yok; anonim başla, bildiğin yeri pinle.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <span className="sticker-flat px-3 py-1.5">
          {meta.emoji} {count} nokta
        </span>
        {priced > 0 && (
          <span className="sticker-flat px-3 py-1.5 text-tomato">🏷️ {priced} fiyatlı</span>
        )}
      </div>

      <Link
        href={`/?sehir=${city.slug}&kategori=${cat}`}
        className="btn btn-tomato self-start px-7 py-3 text-lg"
      >
        Haritada Gör 🗺️
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="mt-2 text-lg font-extrabold">Noktalar</h2>
        <ul className="flex flex-col gap-2">
          {list.map((p) => {
            const price = formatPrice(p.price);
            return (
              <li key={p.id}>
                <Link
                  href={`/pin/${p.id}`}
                  className="sticker-flat flex items-center gap-3 p-3 transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.name}</span>
                    <span className="block text-xs opacity-60">
                      {p.district ? p.district : label}
                      {p.confirms > 0 ? ` · ✓ ${p.confirms} doğrulama` : ""}
                    </span>
                  </span>
                  {price && (
                    <span className="display shrink-0 text-lg font-extrabold text-tomato">
                      {price}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {otherCatsHere.length > 0 && (
        <section className="mt-2 flex flex-col gap-2">
          <h2 className="text-lg font-extrabold">{city.name}&apos;da diğer lezzetler</h2>
          <div className="flex flex-wrap gap-2">
            {otherCatsHere.map((c) => {
              const m = categoryById(c);
              return (
                <Link
                  key={c}
                  href={`/sehir/${city.slug}/${c}`}
                  className="btn btn-cream px-3 py-1.5 text-sm"
                >
                  {m.emoji} {m.label}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {otherCitiesForCat.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-extrabold">Diğer şehirlerde {label.toLowerCase()}</h2>
          <div className="flex flex-wrap gap-2">
            {otherCitiesForCat.map((cs) => {
              const oc = CITIES.find((c) => c.slug === cs)!;
              return (
                <Link
                  key={cs}
                  href={`/sehir/${cs}/${cat}`}
                  className="btn btn-cream px-3 py-1.5 text-sm"
                >
                  🏙️ {oc.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Link href={`/sehir/${city.slug}`} className="btn btn-tomato mt-2 self-center px-8 py-3">
        {city.name} Haritası 🗺️
      </Link>
    </main>
  );
}
