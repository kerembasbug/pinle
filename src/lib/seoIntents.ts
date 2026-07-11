// Long-tail arama niyeti haritası — her kategori/yer tipi için hedef sorgu
// kalıbı. Türkçe fiyat aramalarının çekirdeği: "[şehir] [X] fiyatları [yıl]",
// "en ucuz [X] [şehir]", "[X] ne kadar". Sayfa şablonları bunlarla kurulur.
//
// kw   → başlık/anchor'daki fiyat anahtar kelimesi ("Döner Fiyatları")
// what → soru kalıbındaki nesne ("döner", "serpme kahvaltı")
export type CatIntent = { kw: string; what: string };

export const YEAR = new Date().getFullYear();

export const CAT_INTENTS: Record<string, CatIntent> = {
  // Yeme-içme (mevcut ince kategoriler — OSM verisi bunları taşıyor)
  doner: { kw: "Döner Fiyatları", what: "döner" },
  kebap: { kw: "Kebap Fiyatları", what: "porsiyon kebap" },
  lokanta: { kw: "Esnaf Lokantası Fiyatları", what: "esnaf lokantasında yemek" },
  kahvalti: { kw: "Kahvaltı Fiyatları", what: "serpme kahvaltı" },
  pide: { kw: "Pide & Lahmacun Fiyatları", what: "pide" },
  cigkofte: { kw: "Çiğ Köfte Fiyatları", what: "çiğ köfte dürüm" },
  tost: { kw: "Tost & Büfe Fiyatları", what: "tost" },
  kokorec: { kw: "Kokoreç & Midye Fiyatları", what: "yarım ekmek kokoreç" },
  balik: { kw: "Balık Ekmek Fiyatları", what: "balık ekmek" },
  corba: { kw: "Çorba Fiyatları", what: "çorba" },
  tatli: { kw: "Tatlı Fiyatları", what: "tatlı" },
  dondurma: { kw: "Dondurma Fiyatları", what: "dondurma" },
  kafe: { kw: "Kafe & Çay Fiyatları", what: "çay ve kahve" },
  // Yer tipleri (yeni pinler + genişleyen niyetler)
  restoran: { kw: "Restoran Fiyatları", what: "restoranda yemek" },
  firin: { kw: "Fırın & Ekmek Fiyatları", what: "ekmek ve simit" },
  bar: { kw: "Bar & Meyhane Fiyatları", what: "bira ve meze" },
  beach: { kw: "Beach Club & Şezlong Fiyatları", what: "şezlong ve plaj girişi" },
  market: { kw: "Market & Manav Fiyatları", what: "temel gıda" },
  kuafor: { kw: "Berber & Kuaför Fiyatları", what: "saç kesimi" },
  hizmet: { kw: "Usta & Tamir Fiyatları", what: "usta servisi" },
  gezi: { kw: "Aktivite & Kiralama Fiyatları", what: "kano, bisiklet ve şezlong kiralama" },
};

export function intentFor(categoryId: string): CatIntent {
  return CAT_INTENTS[categoryId] ?? { kw: "Fiyatları", what: "ürün ve hizmet" };
}
