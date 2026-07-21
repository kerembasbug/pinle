import Link from "next/link";
import MapApp from "@/components/MapApp";
import { CITIES, cityBySlug } from "@/lib/cities";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string; sehir?: string; kategori?: string }>;
}) {
  const { pin, sehir, kategori } = await searchParams;
  const initialCenter = sehir ? cityBySlug(sehir)?.center : undefined;
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
      <script
        dangerouslySetInnerHTML={{
          __html:
            "setTimeout(function(){var s=document.querySelector('.splash');if(s){s.style.display='none'}},2600)",
        }}
      />

      <MapApp initialPinId={pin} initialCenter={initialCenter} initialCategory={kategori} />
      {/* Taranabilir SEO içeriği + şehir sayfalarına iç link akışı (harita SPA'sı istemci tarafı) */}
      <section className="sr-only">
        <h1>Pinle — Kazık Yeme, Pinle. Olduğun Yerin Gerçek Fiyat Haritası</h1>
        <p>
          Nereye gidersen git — tatilde, yeni bir semtte, kendi mahallende — döner, çay, şezlong,
          berber gerçekte kaça, oturmadan gör. Fiyatları oradakiler giriyor, &quot;hâlâ bu fiyat /
          zamlandı&quot; oylarıyla oradakiler doğruluyor. Esnaf lokantasından beach club&apos;a
          tüm fiyatlar haritada. Kayıt yok, anonim başla, fiyatı bilerek git.
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
