# Pinle'ye katkı

Pinle, insanların gördüğü veya ödediği yerel fiyatları tarih ve topluluk sinyalleriyle güncel tutmaya çalışan açık bir üründür. Kod, ürün akışı ve veri-güven modeliyle ilgili eleştiri ve katkılar memnuniyetle karşılanır.

## Doğru kanalı seç

- Tekrarlanabilir ürün/kod hatası için **Bug report** issue şablonunu kullan.
- Bir kullanıcı problemini veya ürün önerisini anlatmak için **Product feedback** şablonunu kullan.
- Seed ayrımı, doğrulama, geçerlilik veya anonim ölçüm sözleşmesiyle ilgili konu için **Data trust / methodology** şablonunu kullan.
- Yanlış veya eski tekil fiyatı GitHub issue'su yapma. Pinle içindeki **Hâlâ bu fiyat / Zamlandı / Fiyatı güncelle** akışını kullan; böylece kayıt doğru pine ve tarihe bağlanır.
- Güvenlik açığını public issue olarak paylaşma; [SECURITY.md](SECURITY.md) içindeki özel bildirim yolunu kullan.

Kişisel veri, özel mesaj, tam adres, telefon, e-posta, erişim anahtarı veya başka birinin kimliğini issue/PR içine koyma.

## Büyük değişiklikten önce

Yeni veri kaynağı, authentication yöntemi, analytics alanı, puan/ödül değişikliği veya şema migrasyonu için önce issue aç. Şunları yaz:

1. Kullanıcı problemi ve mevcut davranış.
2. Önerilen değişiklik ve neden en küçük doğru kapsam olduğu.
3. Seed verisi, gerçek kullanıcı katkısı ve gizlilik üzerindeki etkisi.
4. Başarı/geri alma ölçütü.

## Yerel geliştirme

Gereksinim: güncel Node.js ve npm.

```bash
npm install
npm run dev
```

Varsayılan adres `http://localhost:3000`'dir. SQLite verisi ve yüklenen dosyalar yerel ortamda kalmalıdır; gerçek production verisini geliştirme ortamına kopyalama.

Göndermeden önce:

```bash
npm run build
npm run lint
```

Tam lint mevcut bir dosyada değişiklikten bağımsız hata verirse bunu PR açıklamasında tam komut ve dosya adıyla belirt; değiştirdiğin dosyalarda yeni lint hatası bırakma. UI değişikliğinde en az 390 px mobil görünümü ve ilgili masaüstü görünümünü kontrol et.

## Pull request sözleşmesi

- Tek PR'da tek problem çöz.
- Ne değiştiğini, nasıl doğrulandığını ve kullanıcı/gizlilik etkisini yaz.
- Görsel değişiklikte önce/sonra ekran görüntüsü ekle; kişisel veya hassas veri gösterme.
- Seed/OSM kayıtlarını kullanıcı traksiyonu gibi sayan metrik veya metin ekleme.
- Analytics'e kullanıcı, pin, koordinat, IP, referrer URL, paylaşım metni veya alıcı bilgisi ekleme.
- Yeni UTM/acquisition değeri ekliyorsan allowlist, privacy açıklaması ve sıfır sentetik production-event kuralını koru.
- Test amacıyla production'da gerçek katkı, paylaşım veya Play tıklaması üretme.

## Veri-güven ilkeleri

Detaylı mevcut sözleşme ve bilinen sınırlamalar: [docs/TRUST_MODEL.md](docs/TRUST_MODEL.md).

Özet:

- Seed kapsamı ile gerçek kullanıcı katkısı ayrı raporlanır.
- Tek gözlem “kesin fiyat” veya “en ucuz” kanıtı değildir.
- Tarih, güncellik ve ikinci-kişi sinyali görünür olmalıdır.
- Negatif güncellik sinyali alan veya süresi geçen fiyatlar özet/medya kullanımında dışarıda tutulur.
- Zorunlu hesap olmaması güven ve kötüye kullanım kontrollerini kaldırmaz.

## Davranış

Eleştiriyi kişiye değil probleme yönelt. Ayrımcı, tehditkâr, taciz edici veya kişisel veri ifşa eden içerik kabul edilmez. Moderasyon ve güvenlik gerekçesiyle issue/PR kapatılabilir veya düzenlenmesi istenebilir.
