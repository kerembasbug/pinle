import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import TrackedShareLink from "@/components/TrackedShareLink";
import { jsonLdSafe } from "@/lib/jsonld";

const title = "Ankara Öğrenci Fiyat Dostu İşletme Pilotu | Pinle";
const description =
  "Bahçelievler, Maltepe ve Kızılay'da öğrencilerin güncel fiyatı gitmeden görmesi için işletmelerle şeffaf fiyat pilotu. İlk 15 işletmeye ücretsiz katılım ve paylaşım kiti.";
const canonicalUrl = "https://pinle.app/ankara/ogrenci-fiyatlari";
const businessOptInText =
  "Merhaba, ben [İŞLETME ADI] adına yazıyorum. Pinle Ankara Öğrenci Fiyat Dostu İşletme Pilotu'nun katılım şartlarını öğrenmek istiyorum. Bu sohbet kapsamında pilotla ilgili WhatsApp mesajları almayı kabul ediyorum.";
const businessWhatsappUrl = `https://wa.me/13024459836?text=${encodeURIComponent(businessOptInText)}`;
const studentShareText =
  "Ankara'da bir gerçek fiyat ekle, görev kartını bir arkadaşına gönder; o da güncelliğini sınasın. Bahçelievler, Maltepe ve Kızılay öğrenci fiyat pilotu:";
const studentWhatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${studentShareText} ${canonicalUrl}?utm_source=whatsapp&utm_medium=share&utm_campaign=ankara_student_price_pilot_2026_07&utm_content=student_challenge`)}`;
const studentChallengeUrl =
  "/gorevler?utm_source=pinle&utm_medium=owned&utm_campaign=ankara_student_price_pilot_2026_07&utm_content=student_challenge#ankara";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ankara/ogrenci-fiyatlari" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/ankara/ogrenci-fiyatlari",
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title, description },
};

const districts = [
  {
    name: "Bahçelievler",
    detail: "7. Cadde ve yürünebilir çevresi",
    emoji: "🥪",
  },
  {
    name: "Maltepe",
    detail: "Anıttepe–Tandoğan bağlantısı",
    emoji: "🍲",
  },
  {
    name: "Kızılay",
    detail: "Konur–Karanfil ve çevresi",
    emoji: "☕",
  },
] as const;

const businessSteps = [
  {
    number: "1",
    title: "İşletme kendi isteğiyle yazar",
    copy: "WhatsApp düğmesi hazır izin metniyle Revoba hattında sohbet açar. Toplu veya izinsiz mesaj listesi kullanılmaz.",
  },
  {
    number: "2",
    title: "Üç güncel fiyat paylaşır",
    copy: "Ürün/hizmet adı, tutar ve gözlem tarihi açık olur. İndirim varsa bitiş tarihi ayrıca yazılır.",
  },
  {
    number: "3",
    title: "Kurucu 15 kitini alır",
    copy: "Ücretsiz katılım işareti, tezgâh QR'ı ve WhatsApp Durum görseli verilir. İşaret tavsiye veya “en ucuz” iddiası değildir.",
  },
  {
    number: "4",
    title: "Öğrenci güncelliği sınar",
    copy: "Bağımsız kullanıcılar fiyatı “hâlâ bu fiyat” ya da “zamlandı” sinyaliyle güncel tutar.",
  },
] as const;

const studentBenefits = [
  "Gitmeden önce ürün adıyla birlikte tarihli fiyatı görür.",
  "Gerçek bir öğrenci fırsatının son geçerlilik tarihini kontrol eder.",
  "Yanlış veya eski fiyatı tek dokunuşla güncelliğini yitirmiş olarak işaretler.",
  "Kendi mahallesine fiyat ekleyerek puan ve mevcut Pinle rozetlerine ilerler.",
] as const;

const businessRewards = [
  "İlk 15 uygun işletme için ücretsiz pilot katılımı",
  "“Kurucu 15 · Ankara” paylaşım işareti ve QR kiti",
  "Üç güncel fiyat tamamlanınca pilot sayfasında yer alma değerlendirmesi",
  "Yeterli bağımsız sinyal oluşursa kaynak ve yöntem notlu öğrenci fiyat seçkisine adaylık",
] as const;

const faqs = [
  {
    question: "İşletmeden ücret veya indirim zorunluluğu var mı?",
    answer:
      "Hayır. Pilot katılımı ücretsizdir; öğrenci indirimi zorunlu değildir. Varsa indirim gerçek koşulu ve bitiş tarihiyle yayımlanır.",
  },
  {
    question: "Kurucu 15 işareti doğrulanmış veya en ucuz demek mi?",
    answer:
      "Hayır. Yalnız pilot katılımını gösterir. Fiyat güncelliği, işletme beyanından ayrı olarak kullanıcı sinyalleriyle güçlenir.",
  },
  {
    question: "Öğrenciden telefon veya katılımcı listesi istenir mi?",
    answer:
      "Hayır. Haritayı görmek ve temel katkı akışını başlatmak için telefon numarası zorunlu değildir.",
  },
  {
    question: "Hangi işletmelerle başlanıyor?",
    answer:
      "İlk dalga Bahçelievler, Maltepe ve Kızılay'da öğrencilerin sık kullandığı yemek, kahve ve günlük hizmet noktalarına açıktır.",
  },
] as const;

export default function AnkaraStudentPricePilotPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description,
        url: canonicalUrl,
        datePublished: "2026-07-26",
        dateModified: "2026-07-27",
        publisher: { "@type": "Organization", name: "Revoba", url: "https://revoba.net" },
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
            <Link href="/gorevler" className="underline underline-offset-4">Fiyat görevleri</Link>
            <Link href="/basin/ankara-ogrenci-fiyat-pilotu" className="underline underline-offset-4">
              Basın bülteni
            </Link>
          </div>
        </nav>

        <header className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
              Ankara · Kurucu 15 işletme çağrısı
            </p>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
                Öğrenci fiyatı <span className="text-tomato">gitmeden görsün.</span>
              </h1>
              <p className="max-w-3xl text-base leading-relaxed opacity-80 sm:text-lg">
                Bahçelievler, Maltepe ve Kızılay’daki işletmeler üç güncel fiyatını açıyor;
                öğrenciler “hâlâ bu fiyat” veya “zamlandı” diyerek haritayı birlikte güncel tutuyor.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <TrackedShareLink
                href={businessWhatsappUrl}
                source="ankara_business_whatsapp"
                className="btn btn-tomato px-7 py-3 text-center"
                ariaLabel="Ankara işletme pilotu için Revoba WhatsApp hattında izinli sohbet başlat"
              >
                İşletmemle katıl · WhatsApp ↗
              </TrackedShareLink>
              <PlayStoreLink
                source="ankara_pilot_play"
                className="btn btn-cream px-7 py-3 text-center"
                ariaLabel="Pinle Android uygulamasını Google Play'de aç"
              >
                Öğrenci olarak katıl ↗
              </PlayStoreLink>
            </div>
            <p className="text-xs leading-relaxed opacity-60">
              İlk 15 uygun işletme · Ücretsiz · İndirim zorunlu değil · Olumlu yorum karşılığı ödül yok
            </p>
          </div>

          <aside className="sticker sticker-mustard p-6 sm:p-7" aria-label="Pilotun ölçülebilir hedefi">
            <p className="text-sm font-extrabold uppercase tracking-wide">İlk dalga hedefi</p>
            <p className="display mt-3 text-7xl font-extrabold text-tomato">15</p>
            <p className="text-xl font-extrabold">uygun işletme</p>
            <div className="mt-5 flex flex-col gap-2 text-sm font-bold">
              <span className="sticker-flat bg-cream px-3 py-2">🏷️ İşletme başına 3 tarihli fiyat</span>
              <span className="sticker-flat sticker-mint px-3 py-2">🙋 Bağımsız öğrenci güncellik sinyali</span>
              <span className="sticker-flat bg-cream px-3 py-2">📲 İşletmeden WhatsApp Durum + QR yayılımı</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed opacity-65">
              15 bir başarı iddiası değil, pilot kapasitesidir. Başvuru sayısı ve gerçek
              fiyat sinyalleri başlangıç harita noktalarından ayrı raporlanır.
            </p>
          </aside>
        </header>

        <section aria-labelledby="pilot-bolgeleri" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Yürünebilir üç çekirdek</p>
            <h2 id="pilot-bolgeleri" className="text-3xl font-extrabold">İlk nerede başlıyor?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {districts.map((district, index) => (
              <article key={district.name} className={`sticker-flat p-5 ${index === 1 ? "sticker-mint" : ""}`}>
                <p className="text-3xl" aria-hidden>{district.emoji}</p>
                <h3 className="mt-2 text-2xl font-extrabold">{district.name}</h3>
                <p className="mt-1 text-sm opacity-70">{district.detail}</p>
              </article>
            ))}
          </div>
          <p className="text-xs leading-relaxed opacity-60">
            Beşevler, Tandoğan, Anıttepe ve Cebeci ikinci dalga adaylarıdır; ilk üç çekirdekte
            gerçek kullanım yoğunluğu oluşmadan kapsam genişletilmez.
          </p>
        </section>

        <section aria-labelledby="viral-dongu" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">İşletmeden öğrenciye, öğrenciden haritaya</p>
            <h2 id="viral-dongu" className="text-3xl font-extrabold">Yayılım döngüsü nasıl çalışır?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {businessSteps.map((step, index) => (
              <article key={step.number} className={`sticker-flat p-5 ${index === 2 ? "sticker-mustard" : ""}`}>
                <p className="display text-4xl font-extrabold text-tomato">{step.number}</p>
                <h3 className="mt-2 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat sticker-mint p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Öğrencinin kazancı</p>
            <h2 className="mt-1 text-2xl font-extrabold">Bütçeyi gitmeden kontrol et</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed opacity-80">
              {studentBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </article>
          <article className="sticker-flat p-6 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">İşletmenin kazancı</p>
            <h2 className="mt-1 text-2xl font-extrabold">Fiyat şeffaflığını görünürlüğe çevir</h2>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed opacity-80">
              {businessRewards.map((reward) => <li key={reward}>{reward}</li>)}
            </ul>
          </article>
        </section>

        <section
          id="ankara-fiyat-pasi"
          className="sticker sticker-mustard grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto]"
          aria-labelledby="ankara-fiyat-pasi-baslik"
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">
              Ankara Fiyat Pası
            </p>
            <h2 id="ankara-fiyat-pasi-baslik" className="mt-1 text-3xl font-extrabold">
              Bir fiyat ekle. Görev kartını bir arkadaşına pasla.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed opacity-80">
              Ankara’dan gerçekten bildiğin bir yeri seç, tarihli fiyatı tamamla ve ortaya
              çıkan tekil görev kartını bir arkadaşına gönder. Arkadaşının işi yeni bir
              yorum yazmak değil; fiyat hâlâ geçerliyse doğrulamak, değiştiyse güncellemek.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="sticker-flat bg-cream px-3 py-1.5">1 gerçek fiyat</span>
              <span className="sticker-flat bg-cream px-3 py-1.5">1 görev kartı</span>
              <span className="sticker-flat sticker-mint px-3 py-1.5">1 bağımsız kontrol</span>
            </div>
          </div>
          <Link
            href={studentChallengeUrl}
            className="btn btn-tomato px-7 py-3 text-center"
          >
            Ankara görevini seç →
          </Link>
        </section>

        <section className="sticker-flat sticker-tomato p-6 text-white sm:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-white/75">Öğrenci yayılımı</p>
              <h2 className="mt-1 text-3xl font-extrabold">Bu çağrıyı Ankara’daki bir arkadaşına gönder.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85">
                Paylaşım indirme istemek yerine tek bir işe yarar eyleme çağırır: gördüğün
                bir fiyatı eklemek, güncellemek veya uygun bir işletmeyi pilota yönlendirmek.
              </p>
            </div>
            <TrackedShareLink
              href={studentWhatsappUrl}
              source="ankara_pilot_whatsapp"
              className="btn btn-mustard px-7 py-3 text-center text-ink"
              ariaLabel="Ankara öğrenci fiyat pilotunu WhatsApp'ta paylaş"
            >
              WhatsApp’ta paylaş ↗
            </TrackedShareLink>
          </div>
        </section>

        <section aria-labelledby="sss" className="space-y-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">Açık kurallar</p>
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

        <section className="sticker sticker-mustard flex flex-col items-start gap-4 p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold">İşletmen üç güncel fiyatını açmaya hazır mı?</h2>
          <p className="max-w-3xl text-sm leading-relaxed opacity-80 sm:text-base">
            Hazır metin işletme adını senden ister ve pilotla ilgili mesaj iznini açıkça
            kaydeder. Revoba, Pinle’nin geliştirici ve işletme iletişim kanalı olarak yanıt verir.
          </p>
          <TrackedShareLink
            href={businessWhatsappUrl}
            source="ankara_business_whatsapp"
            className="btn btn-tomato px-7 py-3 text-center"
            ariaLabel="Revoba WhatsApp hattında Ankara işletme pilotu sohbetini başlat"
          >
            Katılım şartlarını öğren · WhatsApp ↗
          </TrackedShareLink>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Ankara Öğrenci Fiyat Pilotu · 2026</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/metodoloji">Yöntem</Link>
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/basin">Basın kiti</Link>
            <Link href="/android">Android</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
