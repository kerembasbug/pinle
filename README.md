# 📍 Pinle

Türkiye için harita tabanlı pin + yorum uygulaması. Üç katman: **Lezzet** 🍲 (ucuz yemek
noktaları + fiyat doğrulama), **Anı** 💌 (anonim anı/itiraf pinleri), **Sorun** ⚠️ (mahalle
sorun bildirimi). Puan, rozet, haftalık "Muhtar" ve liderlik tablosuyla oyunlaştırılmış.

Launch stratejisi ve viral pazarlama planı: [PAZARLAMA.md](PAZARLAMA.md)

## Stack

- Next.js 16 (App Router, Turbopack) — Web/PWA
- MapLibre GL JS + [OpenFreeMap](https://openfreemap.org) tile'ları (API anahtarı yok, ücretsiz)
- SQLite (better-sqlite3) — `data/pinle.db`; fotoğraflar `data/uploads/`
- Anonim çerez kimliği — kayıt/e-posta yok

## Geliştirme

```bash
npm install
npm run dev                                # http://localhost:3000
node scripts/fetch-osm.mjs                 # OSM'den gerçek İstanbul mekanları → data/seed-istanbul.json
node scripts/seed.mjs data/seed-istanbul.json   # gerçek veriyi yükle (Pinle Ekibi 📌, oy/puan üretmez)
node scripts/seed.mjs pinler.csv           # kendi CSV'n: name,category,price,lat,lng,note
npm run seed                               # KURGUSAL demo verisi (sadece geliştirme)
node scripts/gen-assets.mjs                # PWA ikonları + Play feature graphic
node scripts/store-screenshots.mjs         # Play Store ekran görüntüleri (sistem Chrome ile)
```

## Google Play

TWA (Bubblewrap) ile paketlenir — adım adım rehber, mağaza metinleri ve veri güvenliği
cevapları: [PLAYSTORE.md](PLAYSTORE.md). Hazır görseller: `store-assets/`.

## Ortam Değişkenleri

| Değişken | Amaç |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canlı URL (sitemap, robots, OG linkleri için) — örn. `https://pinle.app` |
| `PINLE_ADMIN_TOKEN` | `/api/stats?token=…` iç analytics erişimi (ayarlanmazsa endpoint kapalı) |

## Özellikler

- 3 katman: Lezzet (fiyat doğrulama), Anı (❤️), Sorun (hâlâ duruyor/çözüldü)
- 🏙️ **İlçe Ligi**: pin→ilçe ataması otomatik (en yakın merkez, İstanbul 39 ilçe) — `/liderler`
- 📊 İç analytics: `/api/stats?token=…` (günlük ziyaretçi/pin/oy, katkı oranı KPI'sı)
- Embed widget: `<iframe src="…/embed?kind=lezzet" width="100%" height="480"></iframe>`
- SEO: dinamik sitemap (son 1000 pin), robots.txt, OG görselleri

## Deploy

SQLite kullanıldığı için **kalıcı diskli** bir host gerekir (Fly.io, Railway, Hetzner, herhangi bir VPS):

```bash
docker build -t pinle .
docker run -d -p 3000:3000 -v pinle-data:/app/data pinle
# seed (opsiyonel): docker exec <container> node scripts/seed.mjs
```

Vercel/serverless istenirse veritabanının Supabase veya Turso'ya taşınması gerekir —
tüm SQL tek dosyada: `src/lib/db.ts`.

## Launch öncesi checklist

[PAZARLAMA.md](PAZARLAMA.md) içinde: gerçek seed verisi, KVKK metni, küfür listesi,
analytics, sosyal hesaplar.
