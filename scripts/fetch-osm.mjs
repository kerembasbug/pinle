// OpenStreetMap (Overpass) üzerinden pilot şehirlerdeki GERÇEK mekanları çeker
// (yeme-içme + market + hizmet + sağlık + akaryakıt + gezi) ve seed formatında JSON üretir.
// Kullanım: node scripts/fetch-osm.mjs
// Kaynak: OpenStreetMap katkıcıları (ODbL). Fiyat yok — topluluk/kürasyon ekler.

import fs from "node:fs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

// Şehir bbox'ları (güney,batı,kuzey,doğu) — metropol merkez + yayılık ilçeler için ek kutular
const CITY_BBOXES = {
  İstanbul: ["40.95,28.85,41.15,29.20"],
  Ankara: ["39.84,32.58,40.06,32.96"],
  İzmir: ["38.30,26.95,38.55,27.32"],
  Muğla: [
    "37.10,28.28,37.30,28.45", // Menteşe
    "36.98,27.30,37.10,27.55", // Bodrum
    "36.58,29.00,36.72,29.20", // Fethiye
    "36.80,28.20,36.90,28.35", // Marmaris
  ],
  Aydın: [
    "37.66,27.19,37.78,27.40", // Davutlar–Güzelçamlı sahili (Kuşadası güneyi)
    "37.78,27.20,37.92,27.35", // Kuşadası merkez (genişletildi)
    "37.78,27.78,37.92,27.92", // Efeler
  ],
  Manisa: ["38.56,27.36,38.68,27.50"],
  Denizli: ["37.72,29.00,37.85,29.20"],
};

// OSM etiketi → Pinle kategorisi
function mapCategory(tags) {
  const cuisine = (tags.cuisine ?? "").toLowerCase();
  const amenity = tags.amenity ?? "";
  const shop = tags.shop ?? "";
  const leisure = tags.leisure ?? "";
  const tourism = tags.tourism ?? "";

  // Yeme-içme (amenity=restaurant/fast_food, cuisine'e göre)
  if (amenity === "restaurant" || amenity === "fast_food") {
    if (/d(ö|o)ner|kebab|kebap|d(ü|u)r(ü|u)m/.test(cuisine)) return "doner";
    if (/kokore(c|ç)|midye|mussel/.test(cuisine)) return "kokorec";
    if (/pide|lahmacun|flatbread/.test(cuisine)) return "pide";
    if (/(ç|c)i(ğ|g)[_ ]?k(ö|o)fte/.test(cuisine)) return "cigkofte";
    if (/breakfast|kahvalt/.test(cuisine)) return "kahvalti";
    if (/fish|bal(ı|i)k|seafood/.test(cuisine)) return "balik";
    if (/soup|(ç|c)orba/.test(cuisine)) return "corba";
    if (/sandwich|tost|burger|b(ü|u)fe/.test(cuisine)) return "tost";
    if (/dessert|baklava|pastry|k(ü|u)nefe|muhallebi|b(ö|o)rek|f(ı|i)r(ı|i)n|simit/.test(cuisine)) return "tatli";
    if (/ice_cream|dondurma/.test(cuisine)) return "dondurma";
    if (/kebab|(ı|i)zgara|grill|k(ö|o)fte|steak|mangal/.test(cuisine)) return "kebap";
    if (/turkish|regional|lokanta|home|pilav|esnaf|anatolian/.test(cuisine)) return "lokanta";
    if (amenity === "fast_food") return "tost";
    return "lokanta";
  }
  // Kafe
  if (amenity === "cafe" || amenity === "coffee_shop") return "kafe";
  if (shop === "coffee" || shop === "tea") return "kahveci";
  if (amenity === "ice_cream") return "dondurma";
  if (amenity === "pub" || amenity === "bar") return null; // konsept dışı

  // Market & alışveriş
  if (shop === "supermarket" || shop === "convenience" || amenity === "marketplace") return "market";
  if (shop === "greengrocer") return "manav";
  if (shop === "butcher") return "kasap";
  if (shop === "bakery" || shop === "pastry") return "firin";
  if (shop === "deli" || shop === "cheese") return "sarkuteri";
  if (shop === "nuts" || shop === "spices" || shop === "confectionery") return "kuruyemis";
  if (shop === "clothes" || shop === "shoes" || shop === "boutique") return "giyim";
  if (shop === "stationery" || shop === "books") return "kirtasiye";
  if (shop === "electronics" || shop === "mobile_phone" || shop === "computer") return "teknoloji";
  if (shop === "gift" || shop === "florist") return "hediyelik";

  // Hizmet
  if (shop === "hairdresser" || shop === "beauty" || amenity === "hairdresser") {
    return shop === "beauty" ? "guzellik" : "kuafor";
  }
  if (shop === "tailor") return "terzi";
  if (shop === "laundry" || shop === "dry_cleaning") return "kurutemizleme";
  if (shop === "hardware" || shop === "doityourself" || shop === "paint") return "nalbur";
  if (shop === "car_repair" || shop === "tyres") return "tamir";

  // Akaryakıt & oto
  if (amenity === "fuel") return "benzinlik";
  if (amenity === "parking") return "otopark";
  if (shop === "car") return "otogaleri";

  // Sağlık
  if (amenity === "pharmacy") return "eczane";
  if (amenity === "hospital" || amenity === "clinic" || amenity === "doctors") return "klinik";
  if (amenity === "dentist") return "dishekimi";
  if (shop === "optician") return "optik";
  if (amenity === "veterinary") return "veteriner";

  // Gezi & eğlence
  if (leisure === "park" || leisure === "garden") return "park";
  if (tourism === "museum" || tourism === "gallery") return "muze";
  if (amenity === "cinema" || amenity === "theatre") return "sinema";
  if (leisure === "fitness_centre" || leisure === "sports_centre") return "spor";

  return null;
}

const CHAIN_RE =
  /mcdonald|burger king|kfc|domino|pizza hut|starbucks|popeyes|subway|little caesar|carrefour|migros|bim|a101|\bşok\b|watsons|gratis|teknosa|mediamarkt/i;

const QUERY_TAGS = `
  node["amenity"~"^(restaurant|fast_food|cafe|pharmacy|fuel|cinema|theatre|hospital|clinic|doctors|dentist|veterinary|marketplace|ice_cream)$"]["name"](BBOX);
  way["amenity"~"^(restaurant|fast_food|cafe|pharmacy|fuel|cinema|theatre|hospital|clinic|doctors|dentist|veterinary|marketplace)$"]["name"](BBOX);
  node["shop"~"^(supermarket|convenience|greengrocer|butcher|bakery|pastry|deli|cheese|nuts|spices|confectionery|clothes|shoes|boutique|stationery|books|electronics|mobile_phone|computer|gift|florist|hairdresser|beauty|tailor|laundry|dry_cleaning|hardware|doityourself|paint|car_repair|tyres|car|optician|coffee|tea)$"]["name"](BBOX);
  way["shop"~"^(supermarket|convenience|butcher|bakery|clothes|electronics|hardware|car)$"]["name"](BBOX);
  node["leisure"~"^(park|garden|fitness_centre|sports_centre)$"]["name"](BBOX);
  node["tourism"~"^(museum|gallery)$"]["name"](BBOX);
`;

async function overpass(bbox) {
  const query = `[out:json][timeout:90];(${QUERY_TAGS.replaceAll("BBOX", bbox)});out center 2000;`;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Pinle-Seed/2.0 (harita uygulamasi seed araci)",
        },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) continue;
      return (await res.json()).elements ?? [];
    } catch {
      /* sonraki endpoint */
    }
  }
  return null;
}

// Hedefli mod: `node scripts/fetch-osm.mjs Aydın data/seed-aydin.json`
// → yalnız o şehir, daha yüksek kategori tavanı, özel çıktı dosyası.
const cityFilter = process.argv[2] || null;
const outPath = process.argv[3] || "data/seed-places.json";
const PER_CATEGORY_PER_CITY = cityFilter ? 60 : 25; // kategori başına şehir başına üst sınır
const out = [];

const targets = cityFilter
  ? Object.entries(CITY_BBOXES).filter(([c]) => c === cityFilter)
  : Object.entries(CITY_BBOXES);
if (cityFilter && targets.length === 0) {
  console.error(`Şehir bulunamadı: ${cityFilter} — mevcut: ${Object.keys(CITY_BBOXES).join(", ")}`);
  process.exit(1);
}

for (const [city, boxes] of targets) {
  const seen = new Set();
  const byCat = {};
  let cityCount = 0;
  for (const bbox of boxes) {
    const elements = await overpass(bbox);
    if (!elements) {
      console.error(`${city} (${bbox}): Overpass yanıt vermedi, atlanıyor`);
      continue;
    }
    for (const el of elements) {
      const tags = el.tags ?? {};
      const name = (tags.name ?? "").trim();
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!name || name.length < 3 || !lat || !lng) continue;
      if (CHAIN_RE.test(name)) continue;
      // KÜRASYON: kapanmış/terk edilmiş yerleri alma (OSM işaretleri)
      if (
        tags.disused === "yes" ||
        tags.abandoned === "yes" ||
        tags["opening_hours"] === "closed" ||
        Object.keys(tags).some((k) => k.startsWith("disused:") || k.startsWith("abandoned:") || k.startsWith("was:"))
      )
        continue;
      const category = mapCategory(tags);
      if (!category) continue;
      const key = (name + category).toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) continue;
      byCat[category] = (byCat[category] ?? 0) + 1;
      if (byCat[category] > PER_CATEGORY_PER_CITY) continue;
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
      cityCount++;
    }
  }
  console.log(`${city}: ${cityCount} mekan`);
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
const catCounts = {};
for (const p of out) catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
console.log(`\nTOPLAM ${out.length} gerçek mekan → ${outPath}`);
console.log("Kategori dağılımı:", catCounts);
