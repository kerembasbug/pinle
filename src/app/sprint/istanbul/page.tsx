import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import TrackedShareLink from "@/components/TrackedShareLink";
import { getDistrictPriceTasks, type PriceTask } from "@/lib/priceTasks";
import {
  acquisitionContextFromValues,
  type AcquisitionContext,
} from "@/lib/acquisition";
import {
  DISTRICT_SIGNAL_GOAL,
  getIstanbulSprintMetrics,
  ISTANBUL_SPRINT_END,
  ISTANBUL_SPRINT_START,
} from "@/lib/sprint";

const title = "İstanbul Fiyat Sprinti — Beyoğlu mu Kadıköy mü?";
const description =
  "Beyoğlu ve Kadıköy'de kullanıcıların eklediği gerçek fiyat sinyallerini canlı takip et. Mahallenden bir fiyat ekle veya güncelliğini doğrula.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sprint/istanbul" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/sprint/istanbul",
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const dynamic = "force-dynamic";

const campaignUrl = "https://pinle.app/sprint/istanbul";
const whatsappText = `Beyoğlu mu Kadıköy mü? Pinle İstanbul Fiyat Sprinti'ne katıl: ${campaignUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=istanbul_price_sprint_2026_07`;
const xText = "Beyoğlu mu Kadıköy mü? Mahallenden bir gerçek fiyat ekle, İstanbul Fiyat Sprinti'ne katıl.";
const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(`${campaignUrl}?utm_source=x&utm_medium=share&utm_campaign=istanbul_price_sprint_2026_07`)}`;
const sprintCampaign = "istanbul_price_sprint_2026_07";

function taskHref(
  task: PriceTask,
  source: "sprint_beyoglu" | "sprint_kadikoy",
  incomingAcquisition: AcquisitionContext | null
) {
  const acquisition = incomingAcquisition ?? {
    source: "pinle",
    medium: "owned",
    campaign: sprintCampaign,
    content: source === "sprint_beyoglu" ? "beyoglu_task" : "kadikoy_task",
  } satisfies AcquisitionContext;
  const params = new URLSearchParams({
    sehir: task.citySlug,
    kategori: task.categoryId,
    pin: task.id,
    katki: source,
    utm_source: acquisition.source,
    utm_medium: acquisition.medium,
    utm_campaign: acquisition.campaign,
  });
  if (acquisition.content) params.set("utm_content", acquisition.content);
  return `/?${params.toString()}`;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export default async function IstanbulPriceSprintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const incomingAcquisition = acquisitionContextFromValues(
    first(query.utm_source),
    first(query.utm_medium),
    first(query.utm_campaign),
    first(query.utm_content)
  );
  const metrics = getIstanbulSprintMetrics();
  const districtTasks = getDistrictPriceTasks(
    "İstanbul",
    metrics.map((district) => district.district)
  );
  const totalSignals = metrics.reduce((sum, district) => sum + district.priceSignals, 0);
  const totalGoal = DISTRICT_SIGNAL_GOAL * metrics.length;
  const updatedAt = formatTimestamp(new Date());

  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <div className="relative z-[2] mx-auto flex max-w-5xl flex-col gap-10">
        <nav className="flex items-center justify-between gap-4" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/android" className="text-sm font-bold underline underline-offset-4">
            Android uygulaması
          </Link>
        </nav>

        <header className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Canlı sprint · 21 Temmuz–4 Ağustos
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Beyoğlu mu <span className="text-tomato">Kadıköy mü?</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
                İki ilçe, aynı hedef: kişi kişi eklenen 30 güncel fiyat sinyali. Mahallenden
                bir fiyat ekle veya mevcut kayda “hâlâ bu fiyat” de.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a href="#hemen-katil" className="btn btn-tomato px-7 py-3 text-center">
                İlçeni seç, tek görevi aç 🎯
              </a>
              <PlayStoreLink
                source="sprint_istanbul_hero"
                className="btn btn-cream px-7 py-3 text-center"
                ariaLabel="Pinle İstanbul Fiyat Sprinti için Android uygulamasını indir"
              >
                Android’de katıl ↗
              </PlayStoreLink>
            </div>
            <p className="text-xs leading-relaxed opacity-60">
              Skor yalnız gerçek kullanıcı katkısıdır · OSM/Pinle Ekibi seed pinleri sayılmaz
            </p>
          </div>

          <aside className="sticker sticker-mustard p-6 text-center" aria-label="Toplam sprint ilerlemesi">
            <p className="text-sm font-extrabold uppercase tracking-wide">Toplam ilerleme</p>
            <p className="display mt-3 text-6xl font-extrabold text-tomato">
              {totalSignals}<span className="text-3xl text-ink">/{totalGoal}</span>
            </p>
            <p className="mt-3 text-sm font-bold">21 Temmuz’dan beri gerçek fiyat sinyali</p>
            <p className="mt-4 text-xs opacity-65">Son güncelleme: {updatedAt}</p>
          </aside>
        </header>

        <section className="grid gap-5 md:grid-cols-2" aria-labelledby="ilce-skoru">
          <h2 id="ilce-skoru" className="sr-only">İlçe skorları</h2>
          {metrics.map((district, index) => {
            const progress = Math.min(100, Math.round((district.priceSignals / DISTRICT_SIGNAL_GOAL) * 100));
            return (
              <article
                key={district.district}
                className={`sticker-flat p-6 sm:p-7 ${index === 0 ? "sticker-mint" : "sticker-tomato text-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">İlçe takımı</p>
                    <h3 className="mt-1 text-3xl font-extrabold">{district.district}</h3>
                  </div>
                  <p className={`display text-4xl font-extrabold ${index === 0 ? "text-tomato" : "text-mustard"}`}>
                    {district.priceSignals}<span className="text-xl opacity-70">/{DISTRICT_SIGNAL_GOAL}</span>
                  </p>
                </div>
                <div className={`mt-6 h-4 overflow-hidden rounded-full border-2 ${index === 0 ? "border-ink bg-paper" : "border-white/70 bg-white/20"}`}>
                  <div
                    className={`h-full ${index === 0 ? "bg-tomato" : "bg-mustard"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                  <div className={`rounded-2xl border-2 p-3 ${index === 0 ? "border-ink/20 bg-paper/70" : "border-white/35 bg-white/10"}`}>
                    <p className="display text-2xl font-extrabold">{district.contributors}</p>
                    <p className="text-xs font-bold opacity-70">katkıcı</p>
                  </div>
                  <div className={`rounded-2xl border-2 p-3 ${index === 0 ? "border-ink/20 bg-paper/70" : "border-white/35 bg-white/10"}`}>
                    <p className="display text-2xl font-extrabold">{district.verifications}</p>
                    <p className="text-xs font-bold opacity-70">doğrulama</p>
                  </div>
                </div>
                <a
                  href="#hemen-katil"
                  className={`mt-6 inline-block text-sm font-extrabold underline underline-offset-4 ${index === 0 ? "text-ink" : "text-white"}`}
                >
                  {district.district} görevlerini seç →
                </a>
              </article>
            );
          })}
        </section>

        <section id="hemen-katil" className="scroll-mt-5 space-y-5" aria-labelledby="sprint-gorevleri">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Tek fiyatlık mikro görev</p>
            <h2 id="sprint-gorevleri" className="text-3xl font-extrabold">İlçeni seç, bildiğin yeri tamamla</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed opacity-70">
              Bağlantı doğru mekanı doğrudan açar. Fiyatı gerçekten bilmiyorsan başka göreve geç;
              tahmin veya eski fiyat ekleme. Açık görev sayısı başarı değil, tamamlanmayı bekleyen kapsamdır.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {districtTasks.map((district, districtIndex) => {
              const source = district.district === "Beyoğlu" ? "sprint_beyoglu" : "sprint_kadikoy";
              return (
                <article key={district.district} className="sticker-flat min-w-0 p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-tomato">{district.district} takımı</p>
                      <h3 className="text-2xl font-extrabold">Şimdi açılabilecek görevler</h3>
                    </div>
                    <p className="text-right text-xs font-bold opacity-60">
                      {district.missing.toLocaleString("tr-TR")} açık görev<br />
                      {district.seedMissing.toLocaleString("tr-TR")} başlangıç · {district.userMissing.toLocaleString("tr-TR")} kullanıcı
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {district.tasks.map((task, taskIndex) => (
                      <div
                        key={task.id}
                        className={`flex min-w-0 flex-col gap-3 rounded-2xl border-2 border-ink/15 p-4 sm:flex-row sm:items-center ${
                          districtIndex === 0 && taskIndex === 0 ? "bg-mint/35" : "bg-cream/65"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="text-2xl" aria-hidden>{task.emoji}</span>
                          <div className="min-w-0">
                            <h4 className="truncate font-extrabold">{task.name}</h4>
                            <p className="text-xs opacity-60">{task.categoryLabel} · fiyat bekliyor</p>
                            <p className="mt-1 text-[11px] leading-relaxed opacity-55">
                              {task.source === "seed"
                                ? "Pinle başlangıç noktası · henüz kullanıcı fiyatı yok"
                                : "Kullanıcının eklediği yer · fiyat bekliyor"}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={taskHref(task, source, incomingAcquisition)}
                          className="btn btn-tomato min-h-12 shrink-0 whitespace-normal px-4 py-3 text-center text-sm leading-tight"
                        >
                          Bu fiyatı tamamla →
                        </Link>
                      </div>
                    ))}
                  </div>
                  {district.tasks.length === 0 && (
                    <p className="mt-4 rounded-2xl bg-cream p-4 text-sm leading-relaxed opacity-70">
                      Bu ilçedeki seçili görevler şu anda tamamlandı. Yeni görevler için genel panoya geç.
                    </p>
                  )}
                  <Link
                    href="/gorevler#istanbul"
                    className="mt-4 inline-block text-sm font-bold underline underline-offset-4"
                  >
                    İstanbul’daki diğer görevleri gör →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-labelledby="nasil-sayiliyor">
          <div className="md:col-span-3">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Şeffaf skor</p>
            <h2 id="nasil-sayiliyor" className="text-3xl font-extrabold">Katkı nasıl sayılıyor?</h2>
          </div>
          {[
            ["1", "Fiyat ekle", "Bir mekan ve ürün için gerçekten gördüğün veya ödediğin tarihli fiyat."],
            ["2", "Doğrula", "Başkasının kaydına “hâlâ bu fiyat” diyerek güncelliği ikinci kişiyle güçlendir."],
            ["3", "Seed hariç", "Pinle Ekibi’nin OSM mekanları harita kapsamıdır; sprint başarısı olarak sayılmaz."],
          ].map(([number, heading, copy]) => (
            <article key={heading} className="sticker-flat p-5">
              <p className="display text-4xl font-extrabold text-tomato">{number}</p>
              <h3 className="mt-2 text-xl font-extrabold">{heading}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{copy}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat p-6">
            <h2 className="text-2xl font-extrabold">Arkadaşını takımına çağır</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              Tek bir fiyat bile ilçenin haritasını daha kullanışlı yapar. Bağlantıyı paylaş;
              arkadaşından indirme değil, bir fiyat eklemesini veya doğrulamasını iste.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <TrackedShareLink
                href={whatsappHref}
                source="sprint_whatsapp"
                className="btn btn-mint px-5 py-2.5"
                ariaLabel="İstanbul Fiyat Sprinti'ni WhatsApp'ta paylaş"
              >
                WhatsApp’ta paylaş
              </TrackedShareLink>
              <TrackedShareLink
                href={xHref}
                source="sprint_x"
                className="btn btn-cream px-5 py-2.5"
                ariaLabel="İstanbul Fiyat Sprinti'ni X'te paylaş"
              >
                X’te paylaş
              </TrackedShareLink>
            </div>
          </article>
          <article className="sticker-flat p-6">
            <h2 className="text-2xl font-extrabold">Medya eşiği</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              İlçe başına 30 fiyat sinyali ve en az 10 ikinci-kişi doğrulaması oluşmadan
              “Kadıköy/Beyoğlu fiyat haritası” sonucu diye medya iddiası kurmayacağız.
            </p>
            <Link href="/fiyatlar#veri-yontemi" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">
              Veri yöntemini incele →
            </Link>
          </article>
        </section>

        <section className="sticker sticker-tomato flex flex-col items-start gap-4 p-6 text-white sm:p-8">
          <h2 className="text-3xl font-extrabold">İlk fiyatı bekleme; ilk fiyatı ekle.</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            Hedef uygulama indirmesi değil, mahallede tekrar tekrar işe yarayan güncel fiyat yoğunluğu.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="#hemen-katil" className="btn btn-mustard px-7 py-3 text-center text-ink">
              Görev seç ve katıl 🎯
            </a>
            <PlayStoreLink
              source="sprint_istanbul_bottom"
              className="btn btn-cream px-7 py-3 text-center text-ink"
              ariaLabel="Pinle İstanbul Fiyat Sprinti için Android uygulamasını indir"
            >
              Google Play’den indir ↗
            </PlayStoreLink>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>
            Ölçüm aralığı: {ISTANBUL_SPRINT_START.slice(0, 10)}–{ISTANBUL_SPRINT_END.slice(0, 10)}
          </p>
          <div className="flex gap-4">
            <Link href="/android">Android</Link>
            <Link href="/basin">Basın</Link>
            <Link href="/fiyatlar">Veri yöntemi</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
