// Play Store telefon ekran görüntüleri (1071x2132, ~9:18 ama ≤2:1) — sistem Chrome ile.
// Kullanım: node scripts/store-screenshots.mjs [baseUrl]   (varsayılan http://localhost:3211)
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3211";
const OUT = "store-assets/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({
  viewport: { width: 412, height: 820 },
  deviceScaleFactor: 2.6,
  locale: "tr-TR",
});

async function waitMapIdle() {
  // Dev modunda window.__map expose ediliyor; tile'lar inene kadar bekle
  await page.waitForFunction(() => window.__map, null, { timeout: 30000 });
  await page.evaluate(
    () =>
      new Promise((res) => {
        const m = window.__map;
        if (m.loaded()) return res(true);
        m.once("idle", () => res(true));
        setTimeout(() => res(true), 25000); // emniyet
      })
  );
  await page.waitForTimeout(800);
}

async function shot(url, file, opts = {}) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  if (opts.map) await waitMapIdle();
  if (opts.extraWait) await page.waitForTimeout(opts.extraWait);
  await page.screenshot({ path: `${OUT}/${file}` });
  console.log("✓", file);
}

// 1. Ana harita
await shot("/", "01-harita.png", { map: true });

// 2. Pin detay sayfası (harita + açık alt sayfa)
const pinId = await page.evaluate(async () => {
  const r = await fetch("/api/pins?minLat=40.9&maxLat=41.1&minLng=28.9&maxLng=29.1&kind=lezzet&category=");
  const { pins } = await r.json();
  return pins.find((p) => p.name.length < 22)?.id ?? pins[0].id;
});
await shot(`/?pin=${pinId}`, "02-pin-detay.png", { map: true, extraWait: 800 });

// 3. Liderlik / İlçe Ligi
await shot("/liderler", "03-ilce-ligi.png", { extraWait: 500 });

// 4. Anı katmanı
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await waitMapIdle();
await page.click("text=💌 Anı");
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/04-ani-katmani.png` });
console.log("✓ 04-ani-katmani.png");

await browser.close();
console.log("Bitti →", OUT);
