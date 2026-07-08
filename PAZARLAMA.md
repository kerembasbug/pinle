# Pinle — Launch & Viral Pazarlama Planı

Strateji: **tek platform, üç kampanya dalgası.** Aynı pin+yorum+oylama çekirdeği üzerinde
sırayla Ucuz Lezzet → Anı Haritası → Mahalle Sorun Haritası dalgaları.

## Launch Öncesi Checklist

- [x] **Gerçek seed verisi:** OpenStreetMap'ten 144 gerçek mekan yüklendi
      (`node scripts/fetch-osm.mjs` → `node scripts/seed.mjs data/seed-istanbul.json`,
      sahibi "Pinle Ekibi 📌", sahte oy/puan yok). **Kalan iş:** listeyi gözden geçir
      (`data/seed-istanbul.json` — konsept dışı kalanları sil) ve bildiğin mekanlara
      fiyat işle; fiyatlı pinler haritada çok daha çekici görünüyor.
- [ ] Domain + deploy (SQLite kullanıldığı için kalıcı diskli host: Hetzner/Fly.io/Railway.
      Vercel istenirse veritabanını Supabase/Turso'ya taşımak gerekir).
      Env: `NEXT_PUBLIC_SITE_URL` + `PINLE_ADMIN_TOKEN` ayarla.
- [ ] KVKK metnindeki [ŞİRKET ADI]/[e-posta] alanlarını doldur, hukuki kontrol ettir
      (`/gizlilik` — taslak hazır).
- [x] ~~Küfür listesini genişlet~~ (yapıldı; yayın sonrası gelen içeriğe göre beslemeye devam).
- [ ] Twitter/X + TikTok + Instagram hesapları, 10 hazır içerik.
- [x] ~~Analytics~~ — iç analytics hazır: `/api/stats?token=…` günlük ziyaretçi, pin, oy,
      katkı oranı (launch KPI'sı) veriyor. İsterseniz üstüne Plausible/Umami eklenebilir.

## Hazır Pazarlama Araçları (üründe)

- **İlçe Ligi** (`/liderler`): "Kadıköy 47, Beşiktaş 12 — Beşiktaş uyuyor mu?" tweet'lerinin
  verisi buradan; ekran görüntüsü paylaşmaya uygun tasarlandı.
- **Embed widget**: gazeteci/blogger'lara verilecek kod:
  `<iframe src="https://pinle.app/embed?kind=lezzet" width="100%" height="480"></iframe>`
- **OG görselli pin linkleri**: WhatsApp gruplarına link atmak yeterli.
- **Sitemap/robots**: yayında Google Search Console'a sitemap.xml gönder.

## Ateşleme (Launch Haftası)

1. **Viral video formatı:** "Haritadaki en ucuz döneri test ettim" —
   3-5 mikro-influencer (10-50K, gıda/İstanbul nişi) haritadan pin seçip fiyatı test eder.
   CTA: "senin mahallende ucuz bir yer varsa pinle." Format taklit edilebilir olmalı —
   kullanıcılar kendi videosunu çeksin.
2. **Twitter/X thread'i:** "İstanbul'un 150 TL altı doyma haritası — tamamını siz dolduruyorsunuz"
   + harita ekran görüntüsü + link. Ekşi Sözlük başlığı + Reddit r/Turkey paralel.
3. **Mahalle rekabeti:** "Kadıköy 47 pin, Beşiktaş 12 pin. Beşiktaş uyuyor mu?" —
   bölgesel rekabet en ucuz organik yayılım mekaniği.
4. Her pinin paylaşım linki OG görselli (`/pin/[id]`) — WhatsApp gruplarında
   önizlemeli yayılım için tasarlandı; linki paylaşmak yeterli.

## Sürdürme (Launch + 2-4 hafta)

- Haftalık "haritadan seçkiler" (en çok doğrulanan 10 pin) — basın alıntılayabilsin.
- Şehir liderlik tabloları ile şehirler arası rekabet içerikleri.
- **Dalga 2 duyurusu:** Anı Haritası 💌 (üründe hazır, launch'ta gizlemek isterseniz
  `src/lib/categories.ts` içindeki KINDS listesinden çıkarmak yeterli) — ikinci viral döngü.
  Duyuru öncesi moderasyonu güçlendir. Kampanya fikri: "şehrine bir anı bırak" +
  Sevgililer Günü / yılbaşı zamanlaması.
- **Dalga 3 (traction sonrası):** Mahalle Sorun Haritası ⚠️ (üründe hazır) — yerel basın
  kancası. İlçe bazlı "çözülmemiş sorun skorboardu" için ilçe eşleme (reverse geocoding)
  eklenmesi gerekiyor.

## KPI'lar

- Launch haftası: 1.000 ziyaretçi → 100 pin ekleyen (%10 katkı oranı)
- Paylaşım linki CTR'ı · pin başına doğrulama sayısı · haftalık geri dönen kullanıcı

## Gamification Özeti (uygulamada canlı)

Pin +10 · fotoğraflı +15 · doğrulama oyu +2 · pinin doğrulanması +5 · yorum +3.
Rozetler: Kaşif (5 pin), Fiyat Avcısı (10 doğrulanmış pin), Dedektif (25 oy).
Haftalık + tüm zamanlar liderlik tablosu: `/liderler`.
Sıradaki: "Mahalle Muhtarı" (mahallesinde haftanın en çok katkı vereni — el değiştiren rozet).
