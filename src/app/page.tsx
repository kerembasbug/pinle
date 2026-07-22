import Link from "next/link";
import Script from "next/script";
import MapApp from "@/components/MapApp";
import { CITIES, cityBySlug } from "@/lib/cities";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string; sehir?: string; kategori?: string; katki?: string }>;
}) {
  const { pin, sehir, kategori, katki } = await searchParams;
  const initialCenter = sehir ? cityBySlug(sehir)?.center : undefined;
  const initialMissionSource =
    katki === "seo_city" ||
    katki === "seo_city_category" ||
    katki === "task_board" ||
    katki === "campus" ||
    katki === "shared_task" ||
    katki === "sprint_beyoglu" ||
    katki === "sprint_kadikoy"
      ? katki
      : undefined;
  return (
    <>
      {/* Açılış splash'ı — ilk HTML'de, saf CSS ile ~1.7sn'de kendini kapatır.
          Harita arkada yüklenirken marka + slogan görünür (flash yok). */}
      <div className="splash" aria-hidden>
        <div className="splash-pin">📍</div>
        <div className="splash-brand">Pinle</div>
        <div className="splash-slogan">Kazık yeme, Pinle.</div>
      </div>
      {/* Failsafe: CSS animasyonu (eski tarayıcı/arka plan sekme) çalışmazsa bile
          splash 2.6sn sonra kesin kalksın — uygulama asla bloklanmasın. */}
      <Script id="pinle-splash-failsafe" strategy="afterInteractive">
        {"setTimeout(function(){var s=document.querySelector('.splash');if(s){s.style.display='none'}},2600)"}
      </Script>

      <MapApp
        initialPinId={pin}
        initialCenter={initialCenter}
        initialCategory={kategori}
        initialMissionSource={initialMissionSource}
      />
      {/* Taranabilir SEO içeriği + şehir sayfalarına iç link akışı (harita SPA'sı istemci tarafı) */}
      <section className="sr-only">
        <h1>Pinle — Kazık Yeme, Pinle. Olduğun Yerin Gerçek Fiyat Haritası</h1>
        <p>
          Nereye gidersen git — tatilde, yeni bir semtte, kendi mahallende — döner, çay, şezlong,
          berber gerçekte kaça, oturmadan gör. Fiyat kayıtları kullanıcı bildirimleri ve Pinle
          başlangıç verilerinden oluşur; eklenme tarihini ve &quot;hâlâ bu fiyat / zamlandı&quot;
          doğrulamalarını kontrol et. Esnaf lokantasından beach club&apos;a bilinen fiyatlar
          haritada. Kayıt yok, anonim başla, fiyatı bilerek git.
        </p>
        <nav aria-label="Şehirler">
          <ul>
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/sehir/${c.slug}`}>{c.name} ucuz yemek haritası — ucuza ne yenir</Link>
              </li>
            ))}
            <li>
              <Link href="/fiyatlar">Türkiye sokak fiyatları — döner, çay, ekmek ne kadar</Link>
            </li>
            <li>
              <Link href="/gorevler">Fiyat görevleri — haritadaki eksik fiyatları tamamla</Link>
            </li>
            <li>
              <Link href="/kampus">Kampüs fiyat pilotu — öğrenci kulüpleriyle yerel fiyat haritası</Link>
            </li>
            <li>
              <Link href="/liderler">Liderlik tablosu</Link>
            </li>
            <li>
              <Link href="/android">Pinle Android uygulaması — gerçek fiyat haritasını indir</Link>
            </li>
            <li>
              <Link href="/sprint/istanbul">İstanbul Fiyat Sprinti — Beyoğlu ve Kadıköy gerçek fiyat yarışı</Link>
            </li>
            <li>
              <Link href="/basin">Pinle basın ve medya kiti — ürün özeti, görseller ve iletişim</Link>
            </li>
            <li>
              <Link href="/en">Pinle in English — community-updated local price map</Link>
            </li>
          </ul>
        </nav>
      </section>
    </>
  );
}
