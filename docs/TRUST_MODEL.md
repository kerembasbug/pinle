# Pinle veri-güven modeli

Bu belge, Pinle'nin fiyat gözlemlerini nasıl yorumladığını, launch metriklerinde seed verisini nasıl ayırdığını ve bugün bilinen teknik sınırları açıklar. Ürün davranışının yerine geçen bir garanti veya resmî fiyat tarifesi değildir.

Son güncelleme: **22 Temmuz 2026**

Kullanıcı, medya ve veri kullananlar için sadeleştirilmiş canlı sürüm:
<https://pinle.app/metodoloji>

## 1. Veri türleri

### Seed kapsamı

Pinle Ekibi/OSM başlangıç kayıtları haritanın tamamen boş açılmamasını ve kullanıcıya yakın gözlemlenebilir görevler göstermeyi sağlar.

Seed kayıtları:

- aktif katkıcı sayısına,
- yeni gerçek kullanıcı fiyat sinyaline,
- ilçe sprint skoruna,
- topluluk traksiyonu veya earned-media başarısına

dahil edilmez.

### Gerçek kullanıcı gözlemi

Bir kullanıcının gördüğü veya ödediği fiyatı ürün/hizmet kalemi ve zaman bağlamıyla eklemesidir. Tek gözlem, tüm işletme veya bölge için “kesin”, “ortalama” ya da “en ucuz” fiyat kanıtı değildir.

### Topluluk güncellik sinyali

Başka kullanıcılar bir kaydı **Hâlâ bu fiyat** (`+1`) veya **Zamlandı** (`-1`) olarak işaretleyebilir. Bu sinyaller ayrı tutulur; aynı kullanıcı aynı pin için mevcut oyunu güncelleyebilir.

## 2. Güncellik

- Fiyatlar son güncelleme tarihini taşır.
- 60 günden eski kayıt arayüzde eski fiyat olarak değerlendirilir ve yeniden doğrulama ister.
- İsteğe bağlı geçerlilik tarihi geçmiş fiyatlar aktif fırsat/özet olarak kullanılmaz.
- En az bir `Zamlandı` sinyali bulunan fiyat, public veri özeti ve resmî sosyal içerik adaylığından çıkarılır.
- Resmî Pinle kanallarında tekil fiyat kartı için canlı, süresi geçmemiş, negatif sinyalsiz ve en az bir ikinci-kişi doğrulaması gerekir.

## 3. Launch ve sprint metriği

Launch KPI'ları seed kapsamını gerçek kullanıcı davranışından ayırır. Aktif katkıcı; launch penceresinde fiyat/pin ekleyen veya güncellik oyu veren seed dışı kullanıcıdır. Fiyat sinyali, doğrulama ve eski-fiyat bildirimi ayrı sayılır.

İstanbul Fiyat Sprinti yalnız sprint başlangıcından sonraki gerçek kullanıcı fiyat/oy sinyallerini sayar. Açık seed görev sayısı skor veya benimseme değildir.

## 4. Anonim acquisition → görev ölçümü

UTM değerleri serbest metin olarak kabul edilmez; source, medium, campaign ve content allowlist'ten geçer.

Geçerli landing olayı şunları tutar:

- surface,
- allowlisted UTM alanları,
- sunucu zaman damgası.

Landing tarayıcı oturumunda aynı bağlam için tekilleştirilir. Acquisition ve activation tabloları kullanıcı, pin, IP, koordinat, referrer URL, paylaşım metni veya alıcı kimliği tutmaz.

Bir landing:

- tekil kişi,
- mesaj teslimi,
- uygulama kurulumu,
- gerçek katkı

anlamına gelmez. Kanal kararı landing → exact-task start → gerçek completion zinciriyle verilir.

## 5. Kötüye kullanım kontrolleri

- Katkı, fiyat güncelleme ve oy akışlarında kullanıcı/eylem bazlı günlük limitler vardır.
- Kullanıcı zorunlu hesap olmadan başlayabilir; anonim kimlik daha sonra e-posta veya Google hesabına bağlanabilir.
- Yeni fiyat girildiğinde eski güncellik oyları sıfırlanır; doğrulamalar yeni fiyatı otomatik olarak devralmaz.
- Şüpheli fiyat/isim için ürün içi bildirim ve moderasyon akışları kullanılır.

Rate limit, tek başına doğruluk kanıtı değildir. Aynı kişinin farklı anonim oturumlar açması, koordineli oy ve sahte saha gözlemi tamamen çözülmüş kabul edilmez.

## 6. Bilinen sınırlamalar

### Seed provenance bugün yazar adına bağlı

Mevcut production sorguları seed kaydını `Pinle Ekibi 📌` yazar adıyla ayırır. Bu launch metriği için çalışır fakat provenance için değişmez bir veri alanı değildir. İsim değişikliği veya gelecekte birden fazla seed aktörü sınıflandırma sapması yaratabilir.

Planlanan sağlamlaştırma: pin/gözlem üzerinde immutable `origin` veya eşdeğer provenance alanı (`seed_osm`, `seed_editorial`, `user`) ve mevcut kayıtlar için idempotent migration. Bu değişiklik yapılmadan birden fazla seed editörü eklenmemelidir.

### Gözlem doğruluğu saha kanıtına bağlı

Fotoğraf ve not desteklenir fakat her fiyat için fiş/menü zorunlu değildir. Doğrulama sayısı kanıt kalitesini artırır; resmî tarife veya bağımsız denetim yerine geçmez.

### Attribution kişi düzeyinde değildir

Oturum içi tekilleştirme, aynı kişinin farklı cihaz/tarayıcı/oturumlarını birleştirmez. Bu bilinçli gizlilik sınırı nedeniyle install veya lifetime user attribution iddiası kurulmaz.

### SQLite ölçek sınırı

Tek production instance ve kalıcı disk mevcut launch hacmine uygundur. Birden fazla yazan instance, yüksek eşzamanlı katkı veya ağır analitik sorgu ihtiyacında transaction/locking ve yedekleme modeli yeniden değerlendirilmelidir.

## 7. Değişiklik ilkesi

Bu sözleşmeyi etkileyen kod değişikliği:

1. Seed ve kullanıcı metriklerini ayrı tutmalı.
2. Yeni analytics alanı için veri minimizasyonunu açıklamalı.
3. Production'da sentetik geçerli olay üretmeden doğrulanmalı.
4. Public metin, veri özeti ve kod davranışını birlikte güncellemelidir.

Sorular ve teknik itirazlar için **Data trust / methodology** GitHub issue şablonu kullanılabilir. Tekil yanlış fiyatlar GitHub yerine Pinle içindeki güncelleme/oy akışından düzeltilmelidir.
