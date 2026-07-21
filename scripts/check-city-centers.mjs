#!/usr/bin/env node
// Her şehir/destinasyon çipi GERÇEKTEN pin olan bir yere iniyor mu?
//
// Neden var: merkez koordinatları elle yazılıyor ve veri zamanla kayıyor.
// Muğla'nın merkezi hiç pin olmayan bir noktayı gösteriyordu; kullanıcı şehri
// seçince bomboş harita görüyordu ("şehir seçimi çalışmıyor"). Denizli'nin
// merkezi de şehrin ~8km kuzeyinde boşluktaydı (19 pin / doğrusu 389).
//
// Kullanım:  node scripts/check-city-centers.mjs [https://pinle.app]
// Çıkış kodu 1 = en az bir çip boş ekrana iniyor.

import { readFileSync } from "node:fs";

const BASE = process.argv[2] ?? "https://pinle.app";
const MIN_PINS = 10; // bu sayının altı "boş harita" sayılır

// cityCenters.ts'i parse et (TS import etmemek için — script bağımsız kalsın)
const src = readFileSync(new URL("../src/lib/cityCenters.ts", import.meta.url), "utf8");
const chips = [...src.matchAll(
  /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*center:\s*\[([-\d.]+),\s*([-\d.]+)\](?:,\s*zoom:\s*([\d.]+))?/g
)].map(([, slug, name, lng, lat, zoom]) => ({
  slug, name, lng: +lng, lat: +lat, zoom: zoom ? +zoom : 12.5,
}));

if (!chips.length) {
  console.error("cityCenters.ts parse edilemedi — regex dosyayla uyumsuz olabilir");
  process.exit(1);
}

// Telefon ekranının kapsadığı derece aralığı (kabaca, Web Mercator)
const span = (zoom) => {
  const degPerPx = 360 / (256 * 2 ** zoom);
  return { dLng: (390 * degPerPx) / 2, dLat: (800 * degPerPx * 0.6) / 2 };
};

let fail = 0;
console.log(`Kontrol: ${BASE}  (eşik: ekranda ≥${MIN_PINS} pin)\n`);
for (const c of chips) {
  const { dLat, dLng } = span(c.zoom);
  const url = `${BASE}/api/pins?minLat=${c.lat - dLat}&maxLat=${c.lat + dLat}` +
              `&minLng=${c.lng - dLng}&maxLng=${c.lng + dLng}&kind=lezzet`;
  const res = await fetch(url, { headers: { "User-Agent": "pinle-check/1.0" } });
  if (!res.ok) {
    console.log(`  ✗ ${c.name.padEnd(10)} istek başarısız (${res.status})`);
    fail++;
    continue;
  }
  const n = (await res.json()).pins.length;
  const ok = n >= MIN_PINS;
  if (!ok) fail++;
  console.log(`  ${ok ? "✓" : "✗"} ${c.name.padEnd(10)} z${String(c.zoom).padEnd(5)} → ${String(n).padStart(3)} pin`);
}

console.log();
if (fail) {
  console.error(`${fail} çip boş/az pinli bir yere iniyor — merkezi düzelt.`);
  process.exit(1);
}
console.log("Tüm çipler dolu bölgeye iniyor.");
