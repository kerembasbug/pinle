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
      <MapApp initialPinId={pin} initialCenter={initialCenter} initialCategory={kategori} />
      {/* Taranabilir SEO içeriği + şehir sayfalarına iç link akışı (harita SPA'sı istemci tarafı) */}
      <section className="sr-only">
        <h1>Pinle — Türkiye Ucuz Lezzet Haritası</h1>
        <p>
          Şehrindeki ucuz ve iyi yemek noktalarını haritada pinle, fiyatları doğrula, mahallenin
          muhtarı ol. Esnaf lokantaları, dönerciler, kebapçılar, pideciler, kahvaltıcılar ve daha
          fazlası — fiyatlarıyla birlikte, toplulukça güncel tutuluyor. Kayıt yok, anonim başla.
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
          </ul>
        </nav>
      </section>
    </>
  );
}
