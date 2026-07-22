import type { Metadata } from "next";
import Link from "next/link";
import TrackedShareLink from "@/components/TrackedShareLink";
import { jsonLdSafe } from "@/lib/jsonld";
import { getPriceTaskBoard, type PriceTask } from "@/lib/priceTasks";

const title = "Fiyat Görevleri — Haritadaki Eksik Fiyatları Tamamla | Pinle";
const description =
  "Pinle haritasında fiyat bekleyen yerleri şehir şehir gör. Bildiğin güncel fiyatı kayıt olmadan ekle; kullanıcı katkısı ile başlangıç verisi ayrımını açıkça incele.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gorevler" },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: "website", url: "/gorevler", locale: "tr_TR" },
  twitter: { card: "summary_large_image", title, description },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CAMPUS_SOURCES = new Set(["campus", "gsu_gastronomi", "ozu_cuisine", "yeditepe_gastroyunica"]);

type TaskContext = {
  activationSource: "task_board" | "campus";
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

function taskHref(task: PriceTask, context: TaskContext) {
  const params = new URLSearchParams({
    sehir: task.citySlug,
    kategori: task.categoryId,
    pin: task.id,
    katki: context.activationSource,
    utm_source: context.utmSource,
    utm_medium: context.utmMedium,
    utm_campaign: context.utmCampaign,
  });
  return `/?${params.toString()}`;
}

function taskLandingHref(task: PriceTask, context: TaskContext) {
  const params = new URLSearchParams({
    utm_source: context.utmSource,
    utm_medium: context.utmMedium,
    utm_campaign: context.utmCampaign,
  });
  return `/gorev/${task.id}?${params.toString()}`;
}

export default async function PriceTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const incomingSource = typeof query.utm_source === "string" ? query.utm_source : "";
  const incomingMedium = typeof query.utm_medium === "string" ? query.utm_medium : "";
  const incomingCampaign = typeof query.utm_campaign === "string" ? query.utm_campaign : "";
  const fromCampus =
    incomingCampaign === "campus_price_tasks_2026_07" && CAMPUS_SOURCES.has(incomingSource);
  const taskContext: TaskContext = fromCampus
    ? {
        activationSource: "campus",
        utmSource: incomingSource,
        utmMedium: incomingMedium === "outreach_email" ? "outreach_email" : "owned",
        utmCampaign: "campus_price_tasks_2026_07",
      }
    : {
        activationSource: "task_board",
        utmSource: "task_board",
        utmMedium: "owned",
        utmCampaign: "missing_price_tasks",
      };
  const board = getPriceTaskBoard();
  const formattedTotal = board.totalMissing.toLocaleString("tr-TR");
  const campaignUrl = "https://pinle.app/gorevler";
  const shareText = `Pinle haritasında ${formattedTotal} yer fiyat bekliyor. Bildiğin bir mekanın güncel fiyatını tamamlar mısın?`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${campaignUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=price_tasks`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(`${campaignUrl}?utm_source=x&utm_medium=share&utm_campaign=price_tasks`)}`;

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
            name: "Fiyat Görevleri",
            item: "https://pinle.app/gorevler",
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Pinle fiyat bekleyen yerler",
        numberOfItems: board.tasks.length,
        itemListElement: board.tasks.slice(0, 20).map((task, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${task.name} — fiyat bekliyor`,
          url: `https://pinle.app/pin/${task.id}`,
        })),
      },
    ],
  };

  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <div className="flex gap-4 text-sm font-bold">
            <Link href="/fiyatlar" className="underline underline-offset-4">Fiyat verisi</Link>
            <Link href="/kampus" className="underline underline-offset-4">Kampüs</Link>
            <Link href="/android" className="underline underline-offset-4">Android</Link>
          </div>
        </nav>

        <header className="flex flex-col items-start gap-4">
          <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
            Canlı katkı panosu
          </p>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
              Haritada <span className="text-tomato">{formattedTotal} yer</span> fiyat bekliyor.
            </h1>
            <p className="max-w-3xl text-base leading-relaxed opacity-80 sm:text-lg">
              Bildiğin bir yeri seç; güncel ürün veya hizmet fiyatını ekle. Görev bağlantısı
              doğru şehir, kategori ve mekanı açar. Kayıt zorunlu değil.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="sticker-flat px-3 py-1.5">🎯 {formattedTotal} açık görev</span>
            <span className="sticker-flat px-3 py-1.5 text-mustard-dark">
              📌 {board.seedMissing.toLocaleString("tr-TR")} başlangıç noktası
            </span>
            <span className="sticker-flat px-3 py-1.5 text-teal">
              🙋 {board.userMissing.toLocaleString("tr-TR")} kullanıcı noktası
            </span>
          </div>
        </header>

        <section className="sticker-flat sticker-mustard p-5 sm:p-6" aria-labelledby="kaynak-notu">
          <h2 id="kaynak-notu" className="text-xl font-extrabold">Bu sayı neyi anlatıyor?</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-80">
            Açık görevler, fiyatı olmayan ve fiyat eklenmesi anlamlı olan aktif mekanlardır.
            <b> Pinle başlangıç noktaları kullanıcı katkısı değildir.</b> Kullanıcıların eklediği
            fiyat bekleyen yerler ayrı sayılır. Görev sayısı başarı veya doğrulanmış fiyat
            sayısı olarak sunulmaz.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="sehirler">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Yoğunluk haritası</p>
            <h2 id="sehirler" className="text-3xl font-extrabold">Şehir seç</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {board.cities.map((city) => (
              <a key={city.citySlug} href={`#${city.citySlug}`} className="sticker-flat p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-lg font-extrabold">🏙️ {city.city}</span>
                  <span className="display text-xl font-extrabold text-tomato">
                    {city.missing.toLocaleString("tr-TR")}
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-60">fiyat bekleyen yer</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {city.topCategories.map((category) => (
                    <span key={category.id} className="rounded-full bg-cream px-2 py-1 text-[11px] font-bold">
                      {category.emoji} {category.label} · {category.count}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="hemen-tamamla">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Mikro görevler</p>
            <h2 id="hemen-tamamla" className="text-3xl font-extrabold">Bildiğin bir yeri tamamla</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed opacity-70">
              Her şehirden farklı ilçe ve kategoriler seçildi. Fiyatı bilmiyorsan başka göreve
              geç; tahmin veya eski fiyat ekleme.
            </p>
          </div>

          {board.cities.map((city) => (
            <section key={city.citySlug} id={city.citySlug} className="scroll-mt-5 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h3 className="text-2xl font-extrabold">{city.city}</h3>
                <span className="text-xs font-bold opacity-60">
                  {city.missing.toLocaleString("tr-TR")} açık görev
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {city.tasks.map((task) => (
                  <article key={task.id} className="sticker-flat flex min-w-0 flex-col gap-3 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="text-2xl" aria-hidden>{task.emoji}</span>
                      <div className="min-w-0">
                        <h4 className="truncate font-extrabold">{task.name}</h4>
                        <p className="text-xs opacity-60">
                          {task.categoryLabel}{task.district ? ` · ${task.district}` : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed opacity-65">
                      {task.source === "seed"
                        ? "Pinle başlangıç noktası · henüz kullanıcı fiyatı yok"
                        : "Kullanıcının eklediği yer · fiyat bekliyor"}
                    </p>
                    <Link
                      href={taskHref(task, taskContext)}
                      className="btn btn-tomato mt-auto w-full whitespace-normal px-4 py-2.5 text-center text-sm leading-tight"
                    >
                      Bu fiyatı tamamla →
                    </Link>
                    <Link
                      href={taskLandingHref(task, taskContext)}
                      className="text-center text-xs font-bold underline underline-offset-4"
                    >
                      Görev paylaşım kartı →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="sticker sticker-tomato flex flex-col gap-4 p-6 text-white sm:p-8">
          <div>
            <h2 className="text-3xl font-extrabold">Bir arkadaşın bir fiyat bilir.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">
              Görev panosunu paylaş; gerçek paylaşım veya teslim değil, yalnız anonim paylaşım
              bağlantısı tıklaması ölçülür.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TrackedShareLink
              href={whatsappHref}
              source="task_board_whatsapp"
              className="btn btn-mustard px-5 py-2.5 text-ink"
              ariaLabel="Fiyat görevleri panosunu WhatsApp'ta paylaş"
            >
              WhatsApp’ta paylaş ↗
            </TrackedShareLink>
            <TrackedShareLink
              href={xHref}
              source="task_board_x"
              className="btn btn-cream px-5 py-2.5 text-ink"
              ariaLabel="Fiyat görevleri panosunu X'te paylaş"
            >
              X’te paylaş ↗
            </TrackedShareLink>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Fiyat görevleri · 2026</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/">Harita</Link>
            <Link href="/fiyatlar">Fiyat verisi</Link>
            <Link href="/sprint/istanbul">İstanbul sprinti</Link>
            <Link href="/kampus">Kampüs pilotu</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
