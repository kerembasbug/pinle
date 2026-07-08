// OpenStreetMap (Overpass API) üzerinden merkezi İstanbul'daki GERÇEK yeme-içme
// mekanlarını çeker ve seed formatında JSON üretir.
// Kullanım: node scripts/fetch-osm.mjs        → data/seed-istanbul.json
// Sonra:    node scripts/seed.mjs data/seed-istanbul.json
//
// Veri kaynağı: OpenStreetMap katkıcıları (ODbL lisansı) — gerçek işletme adları ve konumları.
// Fiyat bilgisi OSM'de yok; pinler fiyatsız açılır, fiyatı topluluk ekler/doğrular.

import fs from "node:fs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

// Merkezi İstanbul: Fatih–Beyoğlu–Beşiktaş–Şişli–Kadıköy–Üsküdar hattı
const BBOX = "40.95,28.92,41.09,29.10"; // güney,batı,kuzey,doğu

const QUERY = `
[out:json][timeout:90];
(
  node["amenity"~"^(restaurant|fast_food)$"]["name"]["cuisine"](${BBOX});
  way["amenity"~"^(restaurant|fast_food)$"]["name"]["cuisine"](${BBOX});
);
out center 4000;
`;

// OSM cuisine → Pinle kategorisi
function mapCategory(cuisine) {
  const c = cuisine.toLowerCase();
  if (/d(ö|o)ner|kebab|kebap|d(ü|u)r(ü|u)m|kokore(c|ç)/.test(c)) return "doner";
  if (/pide|lahmacun|flatbread/.test(c)) return "pide";
  if (/(ç|c)i(ğ|g)[_ ]?k(ö|o)fte/.test(c)) return "cigkofte";
  if (/breakfast|kahvalt(ı|i)|menemen/.test(c)) return "kahvalti";
  if (/sandwich|tost|burger|b(ü|u)fe/.test(c)) return "tost";
  if (/dessert|baklava|pastry|k(ü|u)nefe|muhallebi|dondurma|ice_cream|simit|b(ö|o)rek/.test(c)) return "tatli";
  if (/turkish|regional|lokanta|home[_ ]?cooking|k(ö|o)fte|çorba|corba|soup|esnaf|pilav|balik|balık|fish|midye/.test(c)) return "lokanta";
  return null; // pizza, sushi, cafe vb. — ucuz lezzet konsepti dışı, atla
}

// Konsept dışı mekanlar (içkili/gece mekanı/kafe ağırlıklı) isimden ayıkla
const OFF_CONCEPT_RE =
  /meyhane|lounge|\bbar\b|\bpub\b|bistro|şarap|wine|cocktail|kokteyl|nargile|shisha|club|kulüp|\bcafe\b|\bcafé\b|kahvesi|coffee|kahve dünyası/i;

// Zincirler seed'e girmesin — konsept esnaf/yerel
const CHAIN_RE =
  /mcdonald|burger king|kfc|domino|pizza hut|starbucks|popeyes|subway|usta d(ö|o)nerci|d(ö|o)nerci [şs]ef|maydonoz|pasaport pizza|little caesar|arby|carl's|baydöner|bay d(ö|o)ner|kasap d(ö|o)ner|hd (i|İ)skender|k(ö|o)fteci yusuf|tavuk d(ü|u)nyas(ı|i)|simit saray(ı|i)|komagene/i;

let json = null;
for (const endpoint of ENDPOINTS) {
  try {
    console.log("Deneniyor:", endpoint);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Pinle-Seed/1.0 (harita uygulamasi seed araci)",
      },
      body: "data=" + encodeURIComponent(QUERY),
    });
    if (!res.ok) {
      console.error("  hata:", res.status);
      continue;
    }
    json = await res.json();
    break;
  } catch (e) {
    console.error("  hata:", e.message);
  }
}
if (!json) {
  console.error("Hiçbir Overpass endpoint'i yanıt vermedi.");
  process.exit(1);
}
console.log(`OSM'den ${json.elements.length} mekan geldi, süzülüyor…`);

const seen = new Set();
const out = [];
for (const el of json.elements) {
  const tags = el.tags ?? {};
  const name = (tags.name ?? "").trim();
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!name || name.length < 3 || !lat || !lng) continue;
  if (CHAIN_RE.test(name) || OFF_CONCEPT_RE.test(name)) continue;
  const category = mapCategory(tags.cuisine ?? "");
  if (!category) continue;
  const key = name.toLowerCase().replace(/\s+/g, " ");
  if (seen.has(key)) continue; // aynı isimli şubelerden ilkini al
  seen.add(key);
  out.push({
    name: name.slice(0, 80),
    kind: "lezzet",
    category,
    price: null,
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
    note: null,
  });
}

// Kategori başına makul sayı: harita çeşitli görünsün, tek kategori boğmasın
const PER_CATEGORY = 40;
const byCat = {};
const finalOut = [];
for (const p of out) {
  byCat[p.category] = (byCat[p.category] ?? 0) + 1;
  if (byCat[p.category] <= PER_CATEGORY) finalOut.push(p);
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/seed-istanbul.json", JSON.stringify(finalOut, null, 1));
console.log(`${finalOut.length} gerçek mekan yazıldı → data/seed-istanbul.json`);
console.log("Kategori dağılımı:", byCat);
