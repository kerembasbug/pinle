# Instagram Story — 3 slayt (1080×1920)

Suno jingle'ı üstüne bindirilecek dikey story serisi.

| # | Dosya | Rol | Ekranda kalma |
|---|---|---|---|
| 1 | `1-harita.png` | Kanca — "çay kaç para?" + harita | ~3 sn |
| 2 | `2-mekan.png` | Değer — fiyat + özellik rozetleri | ~4 sn |
| 3 | `3-cta.png` | CTA — Play Store + web | ~4 sn |

Üretici: `gen_story.py` (PIL). Ekran görüntüleri playwright + **sistem Chrome**
ile alındı — MapLibre tile'ları headless shell'de render olmuyor.

## Slayt 3'te link çıkartması

CTA slaytında ortada boş bırakılmış çerçeve var ("linke dokun"). Instagram'ın
**kendi link çıkartması** oraya konur — görseldeki yazılar tıklanabilir değildir.

- Android hedefliyorsan: `https://play.google.com/store/apps/details?id=app.pinle.twa`
- Herkese açık tek link istersen: `https://pinle.app` (site zaten Android'de
  Play'e yönlendiriyor)

Tek çıkartma hakkın varsa **pinle.app** koy — iPhone'dan bakan da açabilir.

## Dikkat — üretim notları

**Sora fontunda `₺` ve `→` YOK.** Bu karakterler Sora ile basılırsa sessizce
`.notdef` kutusu (□) çıkar. `gen_story.py` içindeki `guard()` bunu exception'a
çevirir; fiyat/ok içeren metni `B()` (Baloo2) ile bas.

**`draw_pin`'in `hole` parametresi zemin rengi olmalı**, yoksa pin balona döner.

**Slayt 2'deki mekan gerçek değil.** "Sahil Kahvesi" jenerik adlı bir demo
pindir ve ekran görüntüsü alındıktan sonra yerel veritabanından silinmiştir —
gerçek bir işletmeye doğrulanmamış özellik (içkili/pati dostu) atfetmemek için.
Yeniden çekim gerekirse aynı yöntemi kullan, prodüksiyon verisine dokunma.

**Slayt 1'deki 3.297 sayısı** 2026-07-28 tarihli canlı `/api/stats` değeridir.
Tekrar paylaşmadan önce güncelle.
