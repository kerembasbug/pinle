import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSafe } from "@/lib/jsonld";
import { PRICE_DATASET_METHOD_VERSION } from "@/lib/priceDataset";

const title = "Pinle Veri Güven Modeli — Fiyatlar Nasıl Doğrulanıyor?";
const description =
  "Pinle'deki fiyat gözlemlerinin kaynağı, güncelliği, ikinci kişi doğrulaması, seed veri ayrımı ve gizlilik sınırları açıkça nasıl yönetiliyor?";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/metodoloji" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/metodoloji",
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title, description },
};

const principles = [
  {
    icon: "🧾",
    title: "Bir kayıt, bir gözlemdir",
    copy: "Tek fiyat tüm mekanın, ilçenin veya Türkiye'nin kesin ortalaması değildir. Tarihli bir kullanıcı gözlemi olarak gösterilir.",
  },
  {
    icon: "🌱",
    title: "Başlangıç verisi ayrıdır",
    copy: "Pinle Ekibi/OSM kapsamı haritayı boş bırakmamak içindir; aktif katkıcı, gerçek kullanıcı fiyat sinyali veya topluluk başarısı sayılmaz.",
  },
  {
    icon: "🕒",
    title: "Güncellik görünürdür",
    copy: "60 günden eski fiyat yeniden doğrulama ister. Geçerlilik tarihi biten veya “zamlandı” sinyali alan kayıt güncel özetlerden çıkarılır.",
  },
  {
    icon: "✓",
    title: "İkinci kişi güçlendirir",
    copy: "“Doğrulamalı”, fiyatı ekleyen kişiden farklı en az bir kişinin “hâlâ bu fiyat” demesi anlamına gelir; resmî tarife garantisi değildir.",
  },
] as const;

const faqs = [
  {
    question: "Pinle'deki fiyatlar resmî tarife mi?",
    answer:
      "Hayır. Fiyatlar kullanıcıların gördüğü veya ödediği tarihli gözlemlerdir. Mekanın güncel resmî tarifesi yerine geçmez.",
  },
  {
    question: "Pinle Ekibi başlangıç verisi neden var?",
    answer:
      "Haritanın tamamen boş açılmaması ve gözlemlenebilir fiyat görevlerinin bulunabilmesi için kullanılır. Launch KPI'larına ve topluluk traksiyonuna dahil edilmez.",
  },
  {
    question: "Yanlış veya eski bir fiyatı nasıl düzeltirim?",
    answer:
      "Pin sayfasında “hâlâ bu fiyat” veya “zamlandı” sinyali verebilir ya da bildiğin yeni fiyatı ekleyebilirsin. Tekil fiyat düzeltmeleri GitHub yerine ürün içinde yapılır.",
  },
  {
    question: "Pinle ziyaretçiyi veya paylaşım alıcısını izliyor mu?",
    answer:
      "Launch attribution yalnız izin verilen kampanya etiketlerini ve anonim olay zamanını tutar; kullanıcı, pin, konum, IP, referrer URL veya paylaşım alıcısı saklamaz.",
  },
] as const;

const methodJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Pinle Veri Güven Modeli",
      description,
      url: "https://pinle.app/metodoloji",
      datePublished: "2026-07-22",
      dateModified: "2026-07-22",
      version: PRICE_DATASET_METHOD_VERSION,
      about: {
        "@type": "Dataset",
        name: "Pinle Türkiye Sokak Fiyatları",
        url: "https://pinle.app/fiyatlar",
      },
      publisher: {
        "@type": "Organization",
        name: "Pinle",
        url: "https://pinle.app",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Pinle", item: "https://pinle.app" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Veri Güven Modeli",
          item: "https://pinle.app/metodoloji",
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

export default function MethodologyPage() {
  return (
    <main className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(methodJsonLd) }}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/fiyatlar" className="underline underline-offset-4">Canlı fiyat verisi</Link>
            <Link href="/gorevler" className="underline underline-offset-4">Fiyat görevleri</Link>
          </div>
        </nav>

        <header className="grid items-center gap-7 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Sürüm {PRICE_DATASET_METHOD_VERSION}
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Bir fiyat neden <span className="text-tomato">güvenilir?</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
                Pinle kesin fiyat listesi yayımlamaz. İnsanların gördüğü veya ödediği tarihli
                gözlemleri; kaynağı, yaşı ve topluluk güncellik sinyalleriyle birlikte gösterir.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/fiyatlar" className="btn btn-tomato px-7 py-3 text-center">
                Kaynak ayrımlı veriyi gör →
              </Link>
              <Link
                href="/?katki=methodology&utm_source=pinle&utm_medium=owned&utm_campaign=missing_price&utm_content=founder_method_note"
                className="btn btn-cream px-7 py-3 text-center"
              >
                Bir fiyatı tamamla ✓
              </Link>
            </div>
          </div>

          <aside className="sticker sticker-mustard p-6 sm:p-7" aria-label="Güven modeli özeti">
            <p className="text-sm font-extrabold uppercase tracking-wide">Kısa sözleşme</p>
            <p className="mt-4 text-2xl font-extrabold leading-snug">
              Kaynağı bilinmeyen kapsamı kullanıcı başarısı diye sunma. Eski fiyatı güncel diye
              gösterme. Bir tıklamayı katkı sayma.
            </p>
            <p className="mt-5 text-sm leading-relaxed opacity-75">
              Bu ilkeler ürün metni, launch KPI&apos;ları, veri özeti ve resmî içerik seçimi için
              aynı anda geçerlidir.
            </p>
          </aside>
        </header>

        <section aria-labelledby="ilkeler" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Dört temel ilke</p>
            <h2 id="ilkeler" className="text-3xl font-extrabold">Fiyat kaydını nasıl yorumluyoruz?</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <article
                key={principle.title}
                className={`sticker-flat p-6 ${index === 2 ? "sticker-mint" : ""}`}
              >
                <span className="text-3xl" aria-hidden>{principle.icon}</span>
                <h3 className="mt-3 text-xl font-extrabold">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{principle.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="sticker-flat p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Launch ölçümü</p>
            <h2 className="mt-1 text-2xl font-extrabold">Neyi başarı sayıyoruz?</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed opacity-80">
              <li>Seed dışı kişinin eklediği yeni fiyat veya güncellik sinyali.</li>
              <li>İlk katkı görevini gerçekten tamamlayan kullanıcı.</li>
              <li>Fiyatı ekleyen kişiden bağımsız ikinci kişinin doğrulaması.</li>
              <li>Landing → görev başlangıcı → tamamlanma zinciri; yalnız UTM tıklaması değil.</li>
            </ul>
            <p className="mt-4 rounded-xl border border-ink/20 bg-paper p-3 text-xs leading-relaxed">
              İndirme bandı, ziyaret, paylaşım düğmesi tıklaması, star veya açık seed görev tek
              başına ürün katkısı değildir.
            </p>
          </article>

          <article className="sticker-flat p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Veri minimizasyonu</p>
            <h2 className="mt-1 text-2xl font-extrabold">Attribution ne tutmaz?</h2>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              Kampanya ölçümü yalnız allowlist&apos;ten geçen kaynak/kanal/kampanya etiketi, anonim
              olay türü ve sunucu zamanını tutar. Kullanıcı, pin, IP, koordinat, referrer URL,
              paylaşım metni veya alıcı kimliği acquisition tablosuna yazılmaz.
            </p>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              Aynı tarayıcı oturumundaki aynı landing tekilleştirilir. Bu yüzden sonuç tekil kişi,
              kurulum ya da yaşam boyu kullanıcı attribution&apos;ı değildir.
            </p>
            <Link href="/gizlilik" className="mt-4 inline-block text-sm font-extrabold underline underline-offset-4">
              Gizlilik ve KVKK metni →
            </Link>
          </article>
        </section>

        <section className="sticker sticker-tomato p-6 text-white sm:p-8" aria-labelledby="sinirlar">
          <p className="text-sm font-extrabold uppercase tracking-wide text-white/80">Bilinen sınırlar</p>
          <h2 id="sinirlar" className="mt-1 text-3xl font-extrabold">Neyi henüz çözdük demiyoruz?</h2>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/85 sm:text-base">
            <li>Seed kaynağı bugün değişmez bir provenance alanı yerine ekip yazar adına dayanıyor; birden fazla seed editöründen önce bu alan sağlamlaştırılmalı.</li>
            <li>Fotoğraf ve not desteklense de her fiyat için fiş veya menü kanıtı zorunlu değil.</li>
            <li>Rate limit, farklı anonim oturumları veya koordineli kötüye kullanımı tek başına tamamen çözmez.</li>
            <li>SQLite tek production instance için uygun; yüksek eşzamanlı katkı ve çoklu yazan instance öncesi veri katmanı yeniden değerlendirilmeli.</li>
          </ul>
        </section>

        <section aria-labelledby="sss" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Sık sorulanlar</p>
            <h2 id="sss" className="text-3xl font-extrabold">Yöntemi doğru okumak</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="sticker-flat p-5">
                <summary className="cursor-pointer font-extrabold">{faq.question}</summary>
                <p className="mt-3 text-sm leading-relaxed opacity-75">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="sticker sticker-mustard flex flex-col items-start gap-4 p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold">Veriyi kaynak göstermek mi istiyorsun?</h2>
          <p className="max-w-3xl text-sm leading-relaxed opacity-80 sm:text-base">
            Haber ve araştırmada veri sayfasını, erişim tarihini, yöntem sürümünü ve gerçek
            kullanıcı / ekip başlangıç dağılımını birlikte belirt. Toplulaştırılmış CSV kişisel
            veri, yorum, koordinat veya tekil mekan kaydı içermez.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/fiyatlar#veri-yontemi" className="btn btn-cream px-7 py-3 text-center">
              Atıf ve CSV bilgisi →
            </Link>
            <a
              href="https://github.com/kerembasbug/pinle/blob/main/docs/TRUST_MODEL.md"
              className="btn btn-cream px-7 py-3 text-center"
              rel="noreferrer"
            >
              Teknik sözleşme ↗
            </a>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Veri güven modeli · Son güncelleme: 22 Temmuz 2026</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/android">Android</Link>
            <Link href="/fiyatlar">Fiyatlar</Link>
            <Link href="/basin">Basın</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
