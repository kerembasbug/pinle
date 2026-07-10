// Belediye "Kent Lokantası / Halk Lokantası" şubelerini ve "Halk Ekmek" büfelerini
// OSM'den çeker; GERÇEK, YAYINLANMIŞ güncel fiyatlarla priced-seed üretir.
// Bu mekanlar "ucuz lezzet"in kalbi — launch kancası.
//
// Fiyat kaynakları (doğrulanabilir, kamu):
//  - İBB Kent Lokantası: 100₺ (İstanbulkart 90₺) — eleman.net/İBB duyuru, Nis 2026
//  - İzmir BB Kent Lokantası: 50₺ (Yamanlar/Levent Mah. 25₺) — İBB haberleri, 2026
//  - Çankaya Kent Lokantası (Ankara): 75₺ — yeniankara, Ağu 2025
//  - İstanbul Halk Ekmek: normal ekmek 12,50₺ — resmi tarife, 4 May 2026
//  - Ankara Halk Ekmek: normal ekmek (250g) 12,50₺ — ankarahalkekmek.com.tr fiyat listesi
//
// Kullanım: node scripts/fetch-kentlokantasi.mjs → data/seed-priced.json

import fs from "node:fs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// ---- 1) Kent Lokantaları ----
const LOKANTA_CITIES = {
  İstanbul: {
    bboxes: ["40.80,28.50,41.25,29.40"],
    price: 100,
    item: "4 çeşit menü",
    note: "Belediye Kent Lokantası — 4 çeşit menü (çorba+ana yemek+pilav/makarna+tatlı/meyve). İstanbulkart ile 90₺. (Nis 2026)",
  },
  İzmir: {
    bboxes: ["38.25,26.90,38.75,27.45"],
    price: 50,
    item: "4 çeşit menü",
    note: "İzmir BB Kent Lokantası — 4 çeşit menü. Yamanlar ve Levent Mah. şubelerinde 25₺. (2026)",
    // şube adına göre fiyat istisnası
    overrides: [{ re: /yamanlar/i, price: 25 }],
  },
  Ankara: {
    bboxes: ["39.80,32.55,40.10,33.00"],
    price: 75,
    item: "4 çeşit menü",
    note: "Belediye Kent Lokantası — 4 çeşit sulu yemek, su+ekmek ücretsiz. (Ağu 2025)",
  },
};
const LOKANTA_RE = /kent lokanta|halk lokanta|millet k(ı|i)raat|kent restoran|halk restoran/i;

// ---- 2) Halk Ekmek büfeleri ----
const EKMEK_CITIES = {
  İstanbul: {
    bboxes: ["40.80,28.50,41.25,29.40"],
    price: 12.5,
    item: "Ekmek",
    note: "İstanbul Halk Ekmek büfesi — normal/kepekli ekmek 12,50₺ (resmi tarife, 4 May 2026).",
  },
  Ankara: {
    bboxes: ["39.80,32.55,40.10,33.00"],
    price: 12.5,
    item: "Ekmek (250g)",
    note: "Ankara Halk Ekmek — normal ekmek 250g 12,50₺, simit 14₺ (resmi fiyat listesi).",
  },
};
const EKMEK_RE = /halk ekmek/i;

async function overpass(bbox, extraSelectors = "") {
  const query = `[out:json][timeout:60];(
    node["amenity"~"restaurant|fast_food|cafe|social_facility"]["name"](${bbox});
    way["amenity"~"restaurant|fast_food|social_facility"]["name"](${bbox});
    node["shop"~"bakery|kiosk|convenience"]["name"](${bbox});
    ${extraSelectors}
  );out center 5000;`;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Pinle-Seed/3.0",
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

function collect(els, re, cfg, category, seen) {
  const rows = [];
  for (const el of els) {
    const name = (el.tags?.name ?? "").trim();
    if (!re.test(name)) continue;
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) continue;
    const key = name.toLowerCase() + Math.round(lat * 1000) + ":" + Math.round(lng * 1000);
    if (seen.has(key)) continue;
    seen.add(key);
    let price = cfg.price;
    for (const o of cfg.overrides ?? []) if (o.re.test(name)) price = o.price;
    rows.push({
      name: name.slice(0, 80),
      kind: "lezzet",
      category,
      price,
      price_item: cfg.item,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      note: cfg.note,
    });
  }
  return rows;
}

const out = [];
for (const [city, cfg] of Object.entries(LOKANTA_CITIES)) {
  const seen = new Set();
  for (const bbox of cfg.bboxes) {
    const els = await overpass(bbox);
    if (!els) {
      console.error(`${city} (lokanta): Overpass yanıt vermedi`);
      continue;
    }
    const rows = collect(els, LOKANTA_RE, cfg, "lokanta", seen);
    out.push(...rows);
    // Halk Ekmek aynı yanıttan (shop selector'ları da sorguda)
    const ek = EKMEK_CITIES[city];
    if (ek) {
      const ekRows = collect(els, EKMEK_RE, ek, "firin", seen);
      out.push(...ekRows);
      console.log(`${city}: ${rows.length} kent lokantası, ${ekRows.length} halk ekmek büfesi`);
    } else {
      console.log(`${city}: ${rows.length} kent lokantası`);
    }
  }
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/seed-priced.json", JSON.stringify(out, null, 1));
console.log(`\nTOPLAM ${out.length} gerçek fiyatlı nokta → data/seed-priced.json`);
if (out.length === 0) {
  console.log("NOT: OSM'de bu isimle kayıt bulunamadı olabilir — elle koordinat gerekebilir.");
}
