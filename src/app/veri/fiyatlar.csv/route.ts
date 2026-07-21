import { getPriceDataset, PRICE_DATASET_METHOD_VERSION } from "@/lib/priceDataset";
import { YEAR } from "@/lib/seoIntents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function csvCell(value: string | number): string {
  let text = String(value);
  // Kullanıcı tarafından girilen kalem adlarının tablo uygulamalarında formül
  // olarak çalışmasını engelle.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const header = [
    "urun_hizmet",
    "gozlem_sayisi",
    "ortanca_tl",
    "minimum_tl",
    "maksimum_tl",
    "en_ucuz_sehir",
    "gercek_kullanici_gozlemi",
    "ekip_baslangic_gozlemi",
    "ikinci_kisi_dogrulamali_gozlem",
    "son_gozlem_utc",
    "yontem_surumu",
    "kaynak",
  ];
  const source = "https://pinle.app/fiyatlar";
  const lines = getPriceDataset().items.map((row) =>
    [
      row.item,
      row.count,
      row.median,
      row.min,
      row.max,
      row.cheapestCity,
      row.userObservationCount,
      row.seedObservationCount,
      row.confirmedObservationCount,
      row.lastObservedAt,
      PRICE_DATASET_METHOD_VERSION,
      source,
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = `\uFEFF${header.map(csvCell).join(",")}\r\n${lines.join("\r\n")}\r\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pinle-turkiye-sokak-fiyatlari-${YEAR}.csv"`,
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
