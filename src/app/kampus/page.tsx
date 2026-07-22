import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import { jsonLdSafe } from "@/lib/jsonld";
import { getPriceTaskBoard } from "@/lib/priceTasks";

const title = "Kampüs Fiyat Pilotu — Öğrencilerle Gerçek Fiyat Haritası | Pinle";
const description =
  "Kampüs çevresindeki yemek, kahve ve günlük hizmet fiyatlarını 7 günlük öğrenci pilotuyla haritalayın. Seed ve kullanıcı katkısı ayrı, yöntem ve başarı kapıları açık.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/kampus" },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: "website", url: "/kampus", locale: "tr_TR" },
  twitter: { card: "summary_large_image", title, description },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CAMPUS_SOURCES = new Set(["campus", "gsu_gastronomi", "ozu_cuisine", "yeditepe_gastroyunica"]);

const steps = [
  {
    number: "1",
    title: "Tek kampüs seç",
    copy: "Kulüp bir kampüs ve yürünebilir çevre belirler. Aynı anda birden çok pilot açılmaz.",
  },
  {
    number: "2",
    title: "5–10 gönüllüyle başla",
    copy: "Her gönüllü gerçekten gördüğü en az bir fiyatı ekler veya mevcut fiyatı doğrular.",
  },
  {
    number: "3",
    title: "Kanıt oluşursa yayınla",
    copy: "30 gerçek fiyat sinyali ve 10 ikinci-kişi doğrulamasından sonra yöntemli sonuç kartı çıkar.",
  },
] as const;

const faqs = [
  {
    question: "Kulüp için ücret veya zorunlu paylaşım var mı?",
    answer:
      "Hayır. Pilot ücretsizdir; paylaşım ve katılım gönüllüdür. Bir içerik yayınlanırsa işbirliği niteliği açıkça belirtilir.",
  },
  {
    question: "Katılımcı listesi veya telefon numarası isteniyor mu?",
    answer:
      "Hayır. Kulüpten katılımcı listesi istenmez. Pinle temel kullanımda zorunlu hesap veya telefon istemez; isteğe bağlı hesap koruma ayrı bir tercihtir.",
  },
  {
    question: "Haritadaki mevcut noktalar pilot sonucu mu?",
    answer:
      "Hayır. Pinle başlangıç noktaları kullanıcı katkısından ayrı gösterilir ve pilot hedeflerine dahil edilmez.",
  },
  {
    question: "Sonuç kartı ne zaman hazırlanır?",
    answer:
      "En az 30 gerçek kullanıcı fiyat sinyali ve 10 bağımsız ikinci-kişi doğrulaması oluştuğunda; örneklem, tarih aralığı ve sınırlamalarla hazırlanır.",
  },
] as const;

export default async function CampusPilotPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const incomingSource = typeof query.utm_source === "string" ? query.utm_source : "";
  const utmSource = CAMPUS_SOURCES.has(incomingSource) ? incomingSource : "campus";
  const utmMedium = utmSource === "campus" ? "owned" : "outreach_email";
  const taskBoardParams = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: "campus_price_tasks_2026_07",
  });
  const taskBoardHref = `/gorevler?${taskBoardParams.toString()}`;
  const board = getPriceTaskBoard();
  const totalTasks = board.totalMissing.toLocaleString("tr-TR");
  const seedTasks = board.seedMissing.toLocaleString("tr-TR");
  const userTasks = board.userMissing.toLocaleString("tr-TR");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pinle Kampüs Fiyat Pilotu",
        description,
        url: "https://pinle.app/kampus",
        datePublished: "2026-07-22",
        dateModified: "2026-07-22",
        publisher: { "@type": "Organization", name: "Revoba", url: "https://pinle.app" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Pinle", item: "https://pinle.app" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Kampüs Fiyat Pilotu",
            item: "https://pinle.app/kampus",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
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
      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col gap-10">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/gorevler" className="underline underline-offset-4">Görevler</Link>
            <Link href="/android" className="underline underline-offset-4">Android</Link>
          </div>
        </nav>

        <header className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Öğrenci kulüpleri için
            </p>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Kampüs çevresinin <span className="text-tomato">gerçek fiyat haritasını</span> birlikte çıkarın.
              </h1>
              <p className="max-w-3xl text-base leading-relaxed opacity-80 sm:text-lg">
                7 günlük küçük bir pilotla yemek, kahve ve günlük hizmet fiyatlarını ekleyin;
                güncelliğini ikinci kişiyle doğrulayın. İndirme değil, kullanılabilir fiyat
                yoğunluğu hedeflenir.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href={taskBoardHref} className="btn btn-tomato px-7 py-3 text-center">
                Canlı görevleri incele →
              </Link>
              <PlayStoreLink
                source="campus_play"
                className="btn btn-cream px-7 py-3 text-center"
                ariaLabel="Pinle Android uygulamasını Google Play'de aç"
              >
                Android uygulaması ↗
              </PlayStoreLink>
            </div>
            <p className="text-xs leading-relaxed opacity-60">
              Ücretsiz · Zorunlu hesap yok · Katılımcı listesi istenmez
            </p>
          </div>

          <aside className="sticker sticker-mustard p-6 sm:p-7" aria-label="Canlı görev kapsamı">
            <p className="text-sm font-extrabold uppercase tracking-wide">Bugünkü açık kapsam</p>
            <p className="display mt-3 text-6xl font-extrabold text-tomato">{totalTasks}</p>
            <p className="text-lg font-extrabold">fiyat bekleyen görev</p>
            <div className="mt-5 flex flex-col gap-2 text-sm font-bold">
              <span className="sticker-flat bg-cream px-3 py-2">📌 {seedTasks} başlangıç noktası</span>
              <span className="sticker-flat sticker-mint px-3 py-2">🙋 {userTasks} kullanıcı noktası</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed opacity-65">
              Başlangıç noktaları pilot sonucu veya topluluk traksiyonu değildir. Pilot skoru
              yalnız pilot başladıktan sonraki gerçek kullanıcı sinyallerinden oluşur.
            </p>
          </aside>
        </header>

        <section aria-labelledby="pilot-akisi" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Küçük başla, kanıtla</p>
            <h2 id="pilot-akisi" className="text-3xl font-extrabold">7 günlük pilot nasıl işler?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.number} className={`sticker-flat p-5 ${index === 1 ? "sticker-mint" : ""}`}>
                <p className="display text-4xl font-extrabold text-tomato">{step.number}</p>
                <h3 className="mt-2 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat sticker-mint p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Kulübün aldığı</p>
            <h2 className="mt-1 text-2xl font-extrabold">Hazır operasyon paketi</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed opacity-80">
              <li>kampüse göre uyarlanmış kısa duyuru metni,</li>
              <li>tek görev bağlantısı ve ölçümlü QR,</li>
              <li>15 dakikalık çevrim içi demo,</li>
              <li>kapı geçilirse kaynak ve yöntem notlu sonuç kartı.</li>
            </ul>
          </article>
          <article className="sticker-flat p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Koruma kuralları</p>
            <h2 className="mt-1 text-2xl font-extrabold">Başarı uydurulmaz</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed opacity-80">
              <li>tahmin veya eski fiyat eklenmez,</li>
              <li>seed noktalar öğrenci katkısı sayılmaz,</li>
              <li>katılımcı adı/telefon listesi tutulmaz,</li>
              <li>örneklem oluşmadan “en ucuz kampüs” denmez.</li>
            </ul>
          </article>
        </section>

        <section aria-labelledby="sss" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Açık yöntem</p>
            <h2 id="sss" className="text-3xl font-extrabold">Sık sorulanlar</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="sticker-flat p-5">
                <h3 className="font-extrabold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sticker sticker-tomato flex flex-col items-start gap-4 p-6 text-white sm:p-8">
          <h2 className="text-3xl font-extrabold">Kulübünle tek kampüste başlayalım.</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            Üniversite/kampüs adını, yaklaşık gönüllü sayısını ve düşündüğünüz yürüyüş
            çevresini yazın. Uygunsa önce 15 dakikalık demo yapalım; gönderim veya paylaşım
            sözü vermeniz gerekmez.
          </p>
          <a
            href="mailto:info@revoba.net?subject=Pinle%20kamp%C3%BCs%20fiyat%20pilotu&body=%C3%9Cniversite%20%2F%20kamp%C3%BCs%3A%0AG%C3%B6n%C3%BCll%C3%BC%20say%C4%B1s%C4%B1%3A%0AD%C3%BC%C5%9F%C3%BCn%C3%BClen%20%C3%A7evre%3A"
            className="btn btn-mustard px-7 py-3 text-ink"
          >
            Kampüs pilotunu öner ✉️
          </a>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Kampüs Fiyat Pilotu · 2026</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/gorevler">Görevler</Link>
            <Link href="/fiyatlar">Veri yöntemi</Link>
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/android">Android</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
