# 📍 Pinle — gerçek fiyat haritası

Pinle, insanların çevrede **gerçekte ne ödendiğini** gördüğü; fiyat ekleyip “hâlâ bu fiyat / zamlandı” sinyalleriyle güncelliğini doğruladığı topluluk destekli yerel fiyat haritasıdır.

**Kazık yeme, Pinle.**

- [Canlı web uygulaması](https://pinle.app)
- [Android uygulamasını Google Play'den indir](https://play.google.com/store/apps/details?id=app.pinle.twa)
- [İstanbul Fiyat Sprinti — ilçeni seç, tek görevi aç](https://pinle.app/sprint/istanbul?utm_source=github_repo&utm_medium=referral&utm_campaign=istanbul_price_sprint_2026_07&utm_content=readme_sprint)
- [Basın ve medya kiti](https://pinle.app/basin)
- [Gizlilik politikası](https://pinle.app/gizlilik)

## Nasıl çalışır?

1. Haritada dönerden çaya, berberden şezlonga kadar yerel fiyatları gör.
2. Ödediğin gerçek fiyatı ve ne için ödediğini birkaç saniyede ekle.
3. Yakındaki fiyatı “hâlâ bu fiyat” veya “zamlandı” diye doğrula.
4. Güncel fiyat kartını paylaş; çevrendekileri fiyatı doğrulamaya veya güncellemeye çağır.

Kayıt zorunlu değildir. Kullanıcı anonim başlayabilir; hesabını korumak isterse Google veya e-posta ile isteğe bağlı olarak bağlayabilir.

## Canlı İstanbul Fiyat Sprinti

Beyoğlu ve Kadıköy’de amaç seed mekan sayısını büyütmek değil, insanların gerçekten gördüğü güncel fiyatları ve ikinci-kişi doğrulamalarını çoğaltmak. Pinle Ekibi’nin başlangıç noktaları sprint skoruna dahil edilmez.

[İlçeni seç ve bildiğin tek fiyat görevini doğrudan aç →](https://pinle.app/sprint/istanbul?utm_source=github_repo&utm_medium=referral&utm_campaign=istanbul_price_sprint_2026_07&utm_content=readme_sprint)

## Ürün yüzeyleri

- Topluluk güncellemeli fiyat haritası
- Fiyat kalemi, geçerlilik tarihi, fotoğraf ve not desteği
- Güncellik doğrulaması ve eski fiyat bildirimi
- Şehir/ilçe liderlikleri ve katkı puanları
- Kişisel davet linki; davet edilen kişinin ilk gerçek pininden sonra ödül
- Şehir ve pin bazlı 1200×630 sosyal önizleme kartları
- [Türkiye sokak fiyatları endeksi](https://pinle.app/fiyatlar)
- Gömülebilir harita: `<iframe src="https://pinle.app/embed" width="100%" height="480"></iframe>`

## Teknoloji

- Next.js 16 App Router ve React 19
- MapLibre GL JS + [OpenFreeMap](https://openfreemap.org)
- SQLite (`better-sqlite3`) ve kalıcı dosya depolama
- PWA + Google Play için Trusted Web Activity
- Dinamik sitemap, şehir/pin sayfaları ve Open Graph kartları

## Yerel geliştirme

```bash
npm install
npm run dev
npm run build
```

Varsayılan geliştirme adresi `http://localhost:3000`'dir. OSM seed ve mağaza varlığı komutları için `scripts/` klasörüne; TWA ve Play Store notları için [PLAYSTORE.md](PLAYSTORE.md) dosyasına bakın.

## Ortam değişkenleri

| Değişken | Amaç |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap ve sosyal kartlar için canlı origin |
| `PINLE_ADMIN_TOKEN` | Korumalı iç KPI endpoint'i erişimi |
| `AUTH_SECRET` | İsteğe bağlı hesap bağlama akışının imzalama sırrı |
| `GOOGLE_CLIENT_ID` | Google hesap bağlama istemci kimliği |

Gerçek secret değerlerini repoya eklemeyin.

## Deploy

SQLite ve yüklenen fotoğraflar nedeniyle production ortamında kalıcı disk gerekir.

```bash
docker build -t pinle .
docker run -d -p 3000:3000 -v pinle-data:/app/data pinle
```

## Katkı ve iletişim

Kod, ürün akışı veya veri-güven modeliyle ilgili katkılar için [CONTRIBUTING.md](CONTRIBUTING.md) ve [GitHub issue şablonlarını](https://github.com/kerembasbug/pinle/issues/new/choose) kullanın. Mevcut seed, güncellik, doğrulama ve anonim ölçüm sözleşmesi [docs/TRUST_MODEL.md](docs/TRUST_MODEL.md) içinde; güvenlik bildirim yolu [SECURITY.md](SECURITY.md) içindedir.

Editoryal talepler için [canlı basın ve medya sayfasındaki](https://pinle.app/basin) iletişim kanalını kullanın. Yanlış veya eski tekil fiyatlar GitHub issue'su yerine uygulama içindeki doğrulama/güncelleme akışıyla düzeltilmelidir.

Kamuya açık launch ve iletişim ilkeleri: [PAZARLAMA.md](PAZARLAMA.md).
