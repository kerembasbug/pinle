// Belediye "Kent Lokantası / Halk Lokantası" şubelerini OSM'den çeker ve GERÇEK,
// YAYINLANMIŞ güncel menü fiyatıyla priced-seed üretir. Bu mekanlar "ucuz lezzet"in kalbi.
// Fiyat kaynağı (2026, kamu/haber): İBB 40₺, İzmir BB 50₺, Ankara/Çankaya 75₺ — 4 çeşit menü.
// Kullanım: node scripts/fetch-kentlokantasi.mjs → data/seed-priced.json

import fs from "node:fs";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

// Şehir → { bbox, price, note }  (gerçek yayınlanmış menü fiyatı)
const CITIES = {
  İstanbul: {
    bboxes: ["40.80,28.50,41.25,29.40"],
    price: 40,
    note: "Belediye Kent Lokantası — 4 çeşit menü (çorba+ana yemek+pilav+cacık+ekmek). İstanbulkart ile 35₺.",
  },
  İzmir: {
    bboxes: ["38.25,26.90,38.75,27.45"],
    price: 50,
    note: "İzmir BB Kent Lokantası — 4 çeşit menü. Bazı şubelerde 25₺.",
  },
  Ankara: {
    bboxes: ["39.80,32.55,40.10,33.00"],
    price: 75,
    note: "Belediye Kent Lokantası — 4 çeşit menü.",
  },
};

const NAME_RE = /kent lokanta|halk lokanta|millet k(ı|i)raat|kent restoran|halk restoran/i;

async function overpass(bbox) {
  const query = `[out:json][timeout:60];(
    node["amenity"~"restaurant|fast_food|cafe|social_facility"]["name"](${bbox});
    way["amenity"~"restaurant|fast_food|social_facility"]["name"](${bbox});
  );out center 3000;`;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Pinle-Seed/2.0",
        },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) continue;
      return (await res.json()).elements ?? [];
    } catch {
      /* sonraki */
    }
  }
  return null;
}

const out = [];
for (const [city, cfg] of Object.entries(CITIES)) {
  const seen = new Set();
  for (const bbox of cfg.bboxes) {
    const els = await overpass(bbox);
    if (!els) {
      console.error(`${city}: Overpass yanıt vermedi`);
      continue;
    }
    for (const el of els) {
      const name = (el.tags?.name ?? "").trim();
      if (!NAME_RE.test(name)) continue;
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) continue;
      const key = name.toLowerCase() + Math.round(lat * 1000);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        name: name.slice(0, 80),
        kind: "lezzet",
        category: "lokanta",
        price: cfg.price,
        lat: Math.round(lat * 1e6) / 1e6,
        lng: Math.round(lng * 1e6) / 1e6,
        note: cfg.note,
      });
    }
  }
  console.log(`${city}: ${out.filter((p) => p.note === cfg.note).length} kent lokantası`);
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/seed-priced.json", JSON.stringify(out, null, 1));
console.log(`\nTOPLAM ${out.length} gerçek fiyatlı belediye lokantası → data/seed-priced.json`);
if (out.length === 0) {
  console.log("NOT: OSM'de bu isimle kayıt bulunamadı olabilir — elle koordinat gerekebilir.");
}
