import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedShareLink from "@/components/TrackedShareLink";
import { acquisitionContextFromValues } from "@/lib/acquisition";
import { categoryById, isPriceable, placeTypeIdOf } from "@/lib/categories";
import { CITIES } from "@/lib/cityCenters";
import { jsonLdSafe } from "@/lib/jsonld";
import { getPin } from "@/lib/pins";
import { SEED_AUTHOR_NAME } from "@/lib/priceDataset";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pinContext(id: string) {
  const pin = getPin(id);
  if (!pin || pin.kind !== "lezzet" || !pin.city || !isPriceable("lezzet", pin.category)) {
    return null;
  }
  const city = CITIES.find((candidate) => candidate.name === pin.city);
  if (!city) return null;
  return { pin, city, category: categoryById(pin.category) };
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { id } = await params;
  const context = pinContext(id);
  if (!context) return { title: "Fiyat görevi bulunamadı — Pinle" };
  const { pin, category } = context;
  const completed = pin.price != null;
  const title = completed
    ? `${pin.name} fiyat görevi tamamlandı | Pinle`
    : `${pin.name} fiyat görevi — ${pin.district ?? pin.city} | Pinle`;
  const description = completed
    ? `${pin.name} için tarihli fiyat Pinle haritasına eklendi. Fiyatı ve güncellik sinyallerini incele.`
    : `${pin.name} (${category.label}, ${pin.district ?? pin.city}) henüz güncel fiyat bekliyor. Gerçekten gördüğün fiyatı kayıt olmadan ekle.`;

  return {
    title,
    description,
    alternates: { canonical: `/gorev/${id}` },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/gorev/${id}`,
      locale: "tr_TR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedPriceTaskPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const context = pinContext(id);
  if (!context) notFound();
  const { pin, city, category } = context;
  const completed = pin.price != null;
  const acquisition = acquisitionContextFromValues(
    first(query.utm_source),
    first(query.utm_medium),
    first(query.utm_campaign),
    first(query.utm_content)
  ) ?? {
    source: "shared_task" as const,
    medium: "referral" as const,
    campaign: "single_price_task" as const,
  };
  const taskParams = new URLSearchParams({
    sehir: city.slug,
    kategori: placeTypeIdOf(pin.category),
    pin: pin.id,
    katki: "shared_task",
    utm_source: acquisition.source,
    utm_medium: acquisition.medium,
    utm_campaign: acquisition.campaign,
  });
  if (acquisition.content) taskParams.set("utm_content", acquisition.content);
  const taskHref = `/?${taskParams.toString()}`;
  const canonicalUrl = `https://pinle.app/gorev/${pin.id}`;
  const location = [pin.district, pin.city].filter(Boolean).join(", ");
  const shareText = `${pin.name} (${location}) güncel fiyat bekliyor. Gerçekten gördüğün fiyatı ekler misin?`;
  const whatsappUrl = `${canonicalUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=single_price_task`;
  const xUrl = `${canonicalUrl}?utm_source=x&utm_medium=share&utm_campaign=single_price_task`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${whatsappUrl}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(xUrl)}`;
  const price = formatPrice(pin.price);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: completed ? `${pin.name} tamamlanan fiyat görevi` : `${pin.name} fiyat görevi`,
        url: canonicalUrl,
        description: completed
          ? "Görev tamamlandı; tarihli fiyat Pinle haritasında incelenebilir."
          : "Gerçekten görülen güncel fiyatı eklemek için tek mekânlık mikro görev.",
        isPartOf: { "@type": "WebSite", name: "Pinle", url: "https://pinle.app" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pinle", item: "https://pinle.app" },
          { "@type": "ListItem", position: 2, name: "Fiyat Görevleri", item: "https://pinle.app/gorevler" },
          { "@type": "ListItem", position: 3, name: pin.name, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/gorevler" className="text-sm font-bold underline underline-offset-4">
            Tüm görevler
          </Link>
        </nav>

        <article className="sticker p-5 sm:p-7">
          <p className={`btn pointer-events-none inline-flex px-4 py-1.5 text-xs ${completed ? "btn-teal" : "btn-mustard"}`}>
            {completed ? "Görev tamamlandı" : "Tek fiyat görevi"}
          </p>
          <div className="mt-5 flex min-w-0 items-start gap-3">
            <span className="text-4xl" aria-hidden>{category.emoji}</span>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{pin.name}</h1>
              <p className="mt-1 text-sm opacity-60">
                {category.label} · {location}
              </p>
            </div>
          </div>

          {completed ? (
            <div className="mt-6">
              <p className="text-sm font-extrabold uppercase tracking-wide text-teal">Tarihli fiyat eklendi</p>
              <p className="display mt-2 text-5xl font-extrabold text-tomato">
                {pin.price_item && <span className="mr-2 text-base opacity-60">{pin.price_item}</span>}
                {price}
              </p>
              <p className="mt-3 text-sm leading-relaxed opacity-70">
                Bu görev artık açık değildir. Fiyatın tarihini ve güncellik doğrulamalarını pin kartında inceleyebilirsin.
              </p>
              <Link href={`/pin/${pin.id}`} className="btn btn-teal mt-5 inline-flex px-6 py-3">
                Tamamlanan fiyatı aç →
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="text-2xl font-extrabold">Buradaki güncel fiyatı biliyor musun?</h2>
              <p className="mt-2 leading-relaxed opacity-75">
                Gerçekten gördüğün ürün veya hizmeti ve fiyatını ekle. Kayıt zorunlu değil;
                tahmin veya eski fiyat girme.
              </p>
              <p className="mt-3 text-xs leading-relaxed opacity-60">
                {pin.author === SEED_AUTHOR_NAME
                  ? "Bu bir Pinle başlangıç noktasıdır; kullanıcı katkısı veya doğrulanmış fiyat sayılmaz."
                  : "Bu yer bir kullanıcı tarafından eklendi; henüz görünür fiyatı yok."}
              </p>
              <Link href={taskHref} className="btn btn-tomato mt-5 flex min-h-13 w-full items-center justify-center px-6 py-3 text-center text-lg">
                Fiyat formunu aç →
              </Link>
            </div>
          )}
        </article>

        {!completed && (
          <section className="sticker-flat sticker-mustard p-5 sm:p-6" aria-labelledby="gorevi-paylas">
            <h2 id="gorevi-paylas" className="text-2xl font-extrabold">Bir arkadaşın biliyor olabilir.</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-75">
              Bu tek mekânlık görevi paylaş. Pinle yalnız paylaşım bağlantısına tıklama niyetini sayar;
              mesajı, alıcıyı veya gerçek teslimi izlemez.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedShareLink
                href={whatsappHref}
                source="task_detail_whatsapp"
                className="btn btn-teal px-5 py-2.5"
                ariaLabel={`${pin.name} fiyat görevini WhatsApp'ta paylaş`}
              >
                WhatsApp’ta paylaş ↗
              </TrackedShareLink>
              <TrackedShareLink
                href={xHref}
                source="task_detail_x"
                className="btn btn-cream px-5 py-2.5"
                ariaLabel={`${pin.name} fiyat görevini X'te paylaş`}
              >
                X’te paylaş ↗
              </TrackedShareLink>
            </div>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Görev kalite kuralları">
          <div className="sticker-flat p-4 text-sm"><b>1 · Gör</b><br /><span className="opacity-65">Fiyatı yerinde gör.</span></div>
          <div className="sticker-flat p-4 text-sm"><b>2 · Tarihle</b><br /><span className="opacity-65">Güncel gözlemi ekle.</span></div>
          <div className="sticker-flat p-4 text-sm"><b>3 · Doğrula</b><br /><span className="opacity-65">İkinci kişi güncellesin.</span></div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Tek fiyat görevi · 2026</p>
          <div className="flex gap-4">
            <Link href="/gorevler">Görevler</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
