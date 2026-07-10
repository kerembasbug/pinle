// Pin seed aracı.
//
//   node scripts/seed.mjs                          → KURGUSAL demo verisi (sadece geliştirme!)
//   node scripts/seed.mjs data/seed-istanbul.json  → GERÇEK veri (fetch-osm.mjs çıktısı)
//   node scripts/seed.mjs pinler.csv               → GERÇEK veri (name,category,price,lat,lng,note)
//
// Gerçek veri modu: tüm pinler "Pinle Ekibi 📌" kullanıcısına yazılır,
// sahte oy/puan ÜRETİLMEZ (launch dürüstlüğü — doğrulamayı topluluk yapar).
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const dbPath = path.join(process.cwd(), "data", "pinle.db");
if (!fs.existsSync(dbPath)) {
  console.error("data/pinle.db yok — önce uygulamayı bir kez çalıştırın (npm run dev).");
  process.exit(1);
}
const db = new Database(dbPath);

function ensureUser(name) {
  const existing = db.prepare("SELECT id FROM users WHERE name = ?").get(name);
  if (existing) return existing.id;
  const id = randomUUID();
  db.prepare("INSERT INTO users (id, name) VALUES (?, ?)").run(id, name);
  return id;
}

const insertPin = db.prepare(
  `INSERT INTO pins (id, user_id, name, kind, category, price, price_item, note, lat, lng, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`
);
const insertVote = db.prepare(
  "INSERT OR IGNORE INTO votes (pin_id, user_id, value) VALUES (?, ?, ?)"
);
const award = db.prepare("UPDATE users SET points = points + ? WHERE id = ?");
const logEvent = db.prepare(
  "INSERT INTO points_events (user_id, points, reason) VALUES (?, ?, ?)"
);

function pinExists(name, lat) {
  return !!db.prepare("SELECT 1 FROM pins WHERE name = ? AND ABS(lat - ?) < 1e-6").get(name, lat);
}

// ---------- GERÇEK VERİ MODU ----------
const inputPath = process.argv[2];
if (inputPath) {
  let rows;
  if (inputPath.endsWith(".json")) {
    rows = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } else {
    const lines = fs.readFileSync(inputPath, "utf8").trim().split("\n");
    rows = lines
      .filter((l, i) => !(i === 0 && l.toLowerCase().startsWith("name,")))
      .map((l) => {
        const [name, category, price, lat, lng, ...note] = l.split(",");
        return {
          name: name.trim(),
          kind: "lezzet",
          category: category.trim(),
          price: price ? Number(price) : null,
          lat: Number(lat),
          lng: Number(lng),
          note: note.join(",").trim() || null,
        };
      });
  }

  const teamId = ensureUser("Pinle Ekibi 📌");
  const findPin = db.prepare(
    "SELECT id, user_id, price, price_item FROM pins WHERE name = ? AND ABS(lat - ?) < 1e-4 LIMIT 1"
  );
  const hasCommunityPrice = db.prepare(
    "SELECT 1 FROM price_reports WHERE pin_id = ? LIMIT 1"
  );
  const updatePrice = db.prepare(
    "UPDATE pins SET price = ?, price_item = ?, note = COALESCE(?, note) WHERE id = ?"
  );
  let added = 0;
  let priced = 0;
  db.transaction(() => {
    for (const r of rows) {
      if (!r.name || !r.lat || !r.lng) continue;
      const existing = findPin.get(r.name, r.lat);
      if (existing) {
        // Fiyatlı seed güncellemesi — YALNIZ ekip pinlerinde ve topluluk fiyat
        // bildirimi yoksa (topluluğun girdiği güncel fiyatın üzerine yazma!).
        const teamOwned = existing.user_id === teamId;
        const untouched = !hasCommunityPrice.get(existing.id);
        const differs =
          existing.price !== (r.price ?? null) ||
          (existing.price_item ?? null) !== (r.price_item ?? null);
        if (r.price != null && teamOwned && untouched && differs) {
          updatePrice.run(r.price, r.price_item ?? null, r.note ?? null, existing.id);
          priced++;
        }
        continue;
      }
      insertPin.run(
        randomUUID(), teamId, r.name, r.kind ?? "lezzet", r.category ?? "diger",
        r.price ?? null, r.price_item ?? null, r.note ?? null, r.lat, r.lng, "-0 day"
      );
      added++;
    }
  })();
  console.log(`GERÇEK VERİ: ${added} yeni pin, ${priced} pin fiyatı güncellendi. Sahibi: "Pinle Ekibi 📌".`);
  process.exit(0);
}

// ---------- KURGUSAL DEMO MODU (sadece geliştirme) ----------
const SEED_USERS = [
  "Acıkmış Martı #101", "Turşucu Kedi #212", "Çaycı Baykuş #333",
  "Gezgin Kirpi #404", "Tok Sincap #555",
];
const userIds = SEED_USERS.map(ensureUser);

const SAMPLE = [
  ["Hanımeli Ev Yemekleri", "lokanta", 145, 40.9903, 29.0281, "Kuru fasulye + pilav + ayran bu fiyata"],
  ["Çıtır Usta Döner", "doner", 90, 40.9887, 29.0253, "Yarım ekmek tombik, bol salatalı"],
  ["Moda Tostçusu", "tost", 75, 40.9832, 29.0334, "Kaşarlı karışık tost, dev boy"],
  ["Rıhtım Çiğköfte", "cigkofte", 60, 40.9921, 29.0224, "Dürüm + ayran menü"],
  ["Yeldeğirmeni Kahvaltıcısı", "kahvalti", 180, 40.9942, 29.0355, "Serpme değil ama tabak dolu"],
  ["Çarşı Pilavcısı", "lokanta", 110, 41.0421, 29.0057, "Tavuklu pilav + nohut duble"],
  ["Esnaf Sofrası", "lokanta", 150, 41.0163, 28.9573, "3 kap yemek + ekmek + su"],
  ["İstiklal Islak Burger", "diger", 65, 41.0336, 28.9772, "Gece 3'te kurtarıcı"],
];
const SAMPLE_OTHER = [
  ["Moda sahil bankı", "ani", "ask", 40.9791, 29.0264, "2019'da burada evlenme teklifi ettim. Evet dedi."],
  ["Galata Kulesi dibi", "ani", "nostalji", 41.0256, 28.9741, "Üniversitede her cuma burada buluşurduk."],
  ["Söğütlüçeşme alt geçit", "sorun", "isik", 40.9932, 29.037, "Lambalar 2 aydır yanmıyor."],
].map(([name, kind, category, lat, lng, note]) => ({ name, kind, category, price: null, lat, lng, note }));

let added = 0;
db.transaction(() => {
  const rows = SAMPLE.map(([name, category, price, lat, lng, note]) => ({
    name, kind: "lezzet", category, price, lat, lng, note,
  })).concat(SAMPLE_OTHER);
  rows.forEach((r, i) => {
    if (pinExists(r.name, r.lat)) return;
    const id = randomUUID();
    const owner = userIds[i % userIds.length];
    insertPin.run(id, owner, r.name, r.kind, r.category, r.price, r.note, r.lat, r.lng, `-${(i % 6) + 1} day`);
    award.run(10, owner);
    logEvent.run(owner, 10, "pin");
    for (const v of userIds.filter((u) => u !== owner).slice(0, Math.floor(Math.random() * 4))) {
      insertVote.run(id, v, Math.random() < 0.85 ? 1 : -1);
      award.run(2, v);
      logEvent.run(v, 2, "vote");
    }
    added++;
  });
})();
console.log(`DEMO: ${added} kurgusal pin eklendi. Launch veritabanında KULLANMAYIN.`);
