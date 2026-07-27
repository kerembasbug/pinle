import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jsonLdSafe } from "@/lib/jsonld";
import { VENUE_TAGS, tagBySlug } from "@/lib/venueTags";
import { tagCount, tagCitiesFor, taggedVenues } from "@/lib/pinTags";
import { CITIES } from "@/lib/cityCenters";
import { categoryById } from "@/lib/categories";
import { formatPrice } from "@/lib/types";
import { YEAR } from "@/lib/seoIntents";

// "köpek kabul eden kafe", "engelsiz erişimli restoran", "mama sandalyesi olan
// mekan" — çok aranan ama güvenilir cevabı olmayan sorular. Cevap topluluğun
// doğruladığı listede; sayfa canlı veriden üretilir.
export const revalidate = 900;

const SITE = "https://pinle.app";
// Bu sayının altında liste "ince içerik" — sayfa çalışır ama dizine girmez.
const MIN_INDEX = 3;

export function generateStaticParams() {
  return VENUE_TAGS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = tagBySlug(slug);
  if (!tag) return {};
  const count = tagCount(tag.id);
  const title = `${tag.seoTitle} ${YEAR} — Topluluğun Doğruladığı Liste`;
  const description =
    count >= MIN_INDEX
      ? `${tag.question} Türkiye'de ${count} mekan için cevabı orada bulunanlar verdi. ${tag.detail} Fiyatlarıyla birlikte haritada.`
      : `${tag.question} Cevabı orada olanlar giriyor. ${tag.detail} Bildiğin bir yeri işaretle, listeyi birlikte kuralım.`;
  return {
    title,
    description,
    alternates: { canonical: `/ozellik/${tag.slug}` },
    openGraph: { title, description, type: "website", url: `/ozellik/${tag.slug}` },
    twitter: { card: "summary_large_image", title, description },
    // Liste dolmadan dizine girmesin (ince içerik cezası)
    robots: count >= MIN_INDEX ? undefined : { index: false, follow: true },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = tagBySlug(slug);
  if (!tag) notFound();

  const count = tagCount(tag.id);
  const cities = tagCitiesFor(tag.id);
  const venues = taggedVenues(tag.id, null, 60);
  const citySlug = (name: string) => CITIES.find((c) => c.name === name)?.slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pinle", item: SITE },
          { "@type": "ListItem", position: 2, name: tag.seoTitle, item: `${SITE}/ozellik/${tag.slug}` },
        ],
      },
      ...(venues.length
        ? [
            {
              "@type": "ItemList",
              name: tag.seoTitle,
              numberOfItems: venues.length,
              itemListElement: venues.slice(0, 25).map((v, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: v.name,
                url: `${SITE}/pin/${v.id}`,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }} />

      <nav className="text-xs opacity-60">
        <Link href="/" className="underline">
          Pinle
        </Link>{" "}
        › {tag.seoTitle}
      </nav>

      <h1 className="display mt-2 text-3xl font-extrabold leading-tight">
        <span aria-hidden className="mr-1">
          {tag.emoji}
        </span>
        {tag.seoTitle}
      </h1>
      <p className="mt-2 text-[15px] leading-snug opacity-80">
        <b>{tag.question}</b>{" "}
        Bu soruya internette güvenilir cevap bulmak zor — mekanın kendi
        sayfasında yazmaz, yorumlar eskimiştir. Pinle&apos;de cevabı <b>oraya giden</b> veriyor,
        başkaları da doğruluyor. {tag.detail}
      </p>

      {count >= MIN_INDEX ? (
        <p className="mt-3 sticker-flat inline-block bg-[#e7f5f1] px-3 py-1.5 text-sm font-bold">
          ✅ {count} mekan doğrulandı
        </p>
      ) : (
        <div className="mt-3 sticker-flat bg-cream p-3">
          <p className="text-sm font-extrabold">Bu liste yeni kuruluyor 🌱</p>
          <p className="mt-1 text-sm opacity-70">
            Bildiğin bir yeri işaretlemen 10 saniye sürüyor ve bu soruyu soran herkese yardım
            ediyor. Haritada bir mekan aç, &quot;{tag.question}&quot; sorusunu cevapla.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/?ozellik=${tag.id}`} className="btn btn-tomato px-4 py-2.5 text-sm">
          Haritada göster 🗺️
        </Link>
        <Link href="/fiyatlar" className="btn btn-cream px-4 py-2.5 text-sm">
          Sokak fiyatları
        </Link>
      </div>

      {cities.length > 0 && (
        <>
          <h2 className="mt-7 text-lg font-extrabold">Şehre göre</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cities.map((c) => {
              const s = citySlug(c.city);
              const label = `${c.city} (${c.count})`;
              return s ? (
                <Link key={c.city} href={`/sehir/${s}`} className="btn btn-cream px-3 py-1.5 text-sm">
                  {label}
                </Link>
              ) : (
                <span key={c.city} className="sticker-flat bg-cream px-3 py-1.5 text-sm">
                  {label}
                </span>
              );
            })}
          </div>
        </>
      )}

      {venues.length > 0 && (
        <>
          <h2 className="mt-7 text-lg font-extrabold">Doğrulanan mekanlar</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {venues.map((v) => {
              const price = formatPrice(v.price);
              return (
                <li key={v.id}>
                  <Link
                    href={`/pin/${v.id}`}
                    className="sticker-flat flex items-center gap-3 bg-cream px-3 py-2"
                  >
                    <span className="text-xl" aria-hidden>
                      {categoryById(v.category).emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{v.name}</span>
                      <span className="block text-xs opacity-60">
                        {[v.district, v.city].filter(Boolean).join(", ") ||
                          categoryById(v.category).label}
                        {v.votes > 1 && ` · ${v.votes} kişi doğruladı`}
                      </span>
                    </span>
                    {price && (
                      <span className="display shrink-0 text-right font-extrabold text-tomato">
                        {price}
                        {v.price_item && (
                          <span className="block text-[10px] font-normal opacity-60">
                            {v.price_item}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2 className="mt-7 text-lg font-extrabold">Diğer özellikler</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {VENUE_TAGS.filter((t) => t.id !== tag.id).map((t) => (
          <Link key={t.id} href={`/ozellik/${t.slug}`} className="btn btn-cream px-3 py-1.5 text-sm">
            {t.emoji} {t.label}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs opacity-50">
        Bu bilgiler topluluk tarafından girilir ve oylanır; çoğunluk kazanır. Yanlış gördüğün bir
        işareti mekanın sayfasından düzeltebilirsin. Mekanlar zamanla değişir — güncel tutan sensin.
      </p>
    </main>
  );
}
