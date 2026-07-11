# Pinle — Google Play Store Yayın Rehberi

PWA, **TWA (Trusted Web Activity)** olarak paketlenir — Bubblewrap ile. Uygulama içeriği
web'den gelir; store'a bir kez `.aab` yüklenir, sonraki tüm güncellemeler sadece web deploy'udur.

## 0. Ön Koşullar

- [ ] Uygulama **HTTPS bir domain'de yayında** olmalı (TWA şartı). `NEXT_PUBLIC_SITE_URL` ayarlı.
- [ ] Google Play Console hesabı (tek seferlik ~25 USD).
- [ ] Makinede JDK 17+ ve Android SDK (Bubblewrap `bubblewrap doctor` ile kurulumu yönetir).

## 1. AAB Üretimi (Bubblewrap)

```bash
npm i -g @bubblewrap/cli
# twa-manifest.json domain'i pinle.app olarak ayarlı — hazır.
bubblewrap update   # twa-manifest.json'dan Android projesini üretir/günceller
bubblewrap build    # → app-release-signed.aab + android.keystore
```

- İlk `build` bir **keystore** üretir (`android.keystore`, alias `pinle`).
  **Bu dosyayı ve şifresini yedekleyin** — kaybederseniz uygulamayı bir daha güncelleyemezsiniz.
- `.gitignore`'a `android.keystore` ekleyin (commit etmeyin).

## 2. Digital Asset Links (adres çubuğunu gizleyen doğrulama)

```bash
keytool -list -printcert -keystore android.keystore -alias pinle
# "SHA256:" satırındaki parmak izini kopyalayın
```

`public/.well-known/assetlinks.json` içindeki placeholder'ı bu parmak iziyle değiştirip
**deploy edin**. Doğrulama: `https://pinle.app/.well-known/assetlinks.json` erişilebilir olmalı.
Play App Signing kullanıyorsanız (önerilir) Play Console → Setup → App integrity'deki
**Play tarafının SHA256'sını da** listeye ekleyin (iki parmak izi birden durabilir).

## 3. Play Console Adımları

1. **Uygulama oluştur:** Ad "Pinle: Ucuz Lezzet Haritası", Türkçe, Uygulama (oyun değil), ücretsiz.
2. **İç test** kanalına `app-release-signed.aab` yükleyin, kendinizi test kullanıcısı ekleyin.
3. **Store listing:** aşağıdaki metinler + `store-assets/` görselleri.
4. **İçerik derecelendirmesi anketi:** "Kullanıcı tarafından üretilen içerik (UGC) VAR" deyin
   (pinler/yorumlar). Şiddet/kumar vb. yok.
5. **Veri güvenliği formu:** aşağıdaki tablo.
6. **Hedef kitle:** 13+ önerilir (UGC nedeniyle çocuk hedeflemeyin).
7. İç testte sorun yoksa **Production**'a terfi ettirin.

## 4. Store Listing Metinleri (kopyala-yapıştır)

**Uygulama adı** (≤30):
```
Pinle: Ucuz Lezzet Haritası
```

**Kısa açıklama** (≤80):
```
Kazık yeme, Pinle. Olduğun yerin gerçek fiyat haritası — fiyatı bilerek git!
```

**Uzun açıklama:**
```
Şehrin en ucuz ve en iyi lezzet noktaları bu haritada — ve haritayı sen dolduruyorsun. 📌

Pinle, mahalleden mahalleye gerçek insanların eklediği yeme-içme noktalarını gösterir:
esnaf lokantaları, dönerciler, pideciler, tostçular, kahvaltıcılar… Fiyatıyla birlikte.

🍲 KEŞFET
Haritayı aç, çevrendeki uygun fiyatlı yerleri gör. Fiyatlar güncel mi? Topluluk
"✓ Hâlâ bu fiyat" veya "📈 Zamlandı" oylarıyla sürekli doğruluyor.

📌 PİNLE, PUAN KAZAN
Bildiğin ucuz ve iyi bir yer mi var? 10 saniyede pinle: kategori seç, fiyat yaz, gönder.
Her pin +10 puan, fotoğraf +5, doğrulama oyu +2.

👑 MAHALLENİN MUHTARI OL
Haftanın en çok katkı vereni "Haftanın Muhtarı" tacını takar. İlçe Ligi'nde
Kadıköy mü Beşiktaş mı önde, herkes görür.

💌 ANI HARİTASI
Şehirde iz bırak: bir bankta, bir iskelede yaşadığın anıyı anonim olarak o noktaya bırak,
başkalarının anılarını oku.

⚠️ SORUN BİLDİR
Çukur, bozuk kaldırım, yanmayan sokak lambası… Mahallendeki sorunu haritaya işle,
görünür olsun.

🔒 KAYIT YOK, HESAP YOK
E-posta, telefon, isim istemiyoruz. Anonim başla, anında kullan. Konumun takip edilmez —
sadece pinlediğin noktalar herkese açık haritada görünür.

Harita verisi: OpenStreetMap katkıcıları (ODbL).
```

**Kategori:** Yeme ve İçme (Food & Drink)
**Etiketler:** yemek, harita, ucuz, lokanta, sokak lezzetleri

**Görseller** (`store-assets/`):
| Dosya | Kullanım |
|---|---|
| `play-icon-512.png` | Uygulama simgesi (512×512) |
| `feature-graphic-1024x500.png` | Öne çıkan görsel |
| `screenshots/01-harita.png` | Telefon ekran görüntüsü 1 |
| `screenshots/02-pin-detay.png` | Telefon ekran görüntüsü 2 |
| `screenshots/03-ilce-ligi.png` | Telefon ekran görüntüsü 3 |
| `screenshots/04-ani-katmani.png` | (yedek — anı pinleri dolunca yeniden çekin: `node scripts/store-screenshots.mjs https://pinle.app`) |

## 5. Veri Güvenliği Formu Cevapları

| Soru | Cevap |
|---|---|
| Veri topluyor mu? | Evet |
| Konum | **Toplanmıyor** (cihaz konumu sunucuya gitmez; pin koordinatı kullanıcının gönderdiği içeriktir) |
| Kişisel bilgi (ad, e-posta…) | Toplanmıyor |
| Fotoğraflar | Toplanıyor — kullanıcı isteğe bağlı yükler, herkese açık, silme talebiyle kaldırılır |
| Diğer kimlikler (Device/other IDs) | Toplanıyor — anonim çerez kimliği (hesap işlevi için), üçüncü tarafla paylaşılmaz |
| Kullanıcı içeriği | Toplanıyor — pinler, yorumlar (herkese açık) |
| Veriler şifreli aktarılıyor mu? | Evet (HTTPS) |
| Silme talebi mekanizması var mı? | Evet (gizlilik sayfasındaki iletişim adresi) |

## 6. UGC Politikası Uyumu — ÖNEMLİ

Play'in kullanıcı içeriği politikası şunları İSTER — hepsi karşılandı:
- [x] İçerik bildirme mekanizması → her pinde "Bildir" var, eşikte otomatik gizlenir.
- [x] Kullanım kuralları → `/gizlilik` sayfasında "İçerik Kuralları" bölümü.
- [x] **Kötüye kullanan kullanıcıyı engelleme** → pin detayında "Kullanıcıyı gizle" butonu.
      O yazarın tüm pin ve yorumları bu cihazda görünmez olur (yerel gizleme listesi,
      opak yazar kimliğiyle — gerçek kimlik ifşa edilmez).

## 7. Yayın Sonrası

- Web'e her deploy otomatik olarak uygulamaya yansır (store güncellemesi gerekmez).
- Yalnızca ikon/isim/splash değişirse yeni AAB gerekir (`appVersionCode` artırın).
- Ekran görüntülerini canlı veriyle tazelemek için:
  `node scripts/store-screenshots.mjs https://pinle.app`
