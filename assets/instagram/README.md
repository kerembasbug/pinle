# Instagram launch carousel

Play Store çıkışı için 5 kareli carousel. **1080×1350 (4:5)** — feed'de en çok
dikey alanı kaplayan oran, 1:1'e göre belirgin avantaj.

| Sıra | Dosya | İşlev |
|---|---|---|
| 1 | `1-hook.png` | Kanca: ₺15 vs ₺60 çay karşılaştırması. Durduran kare. |
| 2 | `2-problem.png` | Problem + niyet beyanı (koyu kare, ritmi kırar) |
| 3 | `3-cozum.png` | Çözüm + gerçek rakamlar (3.297 mekan / 7 şehir / ücretsiz) |
| 4 | `4-nasil.png` | 3 adımda nasıl çalışıyor |
| 5 | `5-cta.png` | Slogan + Google Play CTA |

Üretici script: `scratchpad/gen_ig.py` (PIL). Fontlar Google Fonts'tan indiriliyor
(Baloo2 + Sora — markanın kendi fontları, `next/font` ile aynı aile).

## Dikkat — font glif tuzağı

**Sora'da `₺` ve `→` glifleri YOK.** Bu karakterler Sora ile basılırsa sessizce
`.notdef` kutusu (□) olarak render edilir — hata vermez, sadece çirkin çıkar.
Baloo2'de ikisi de var.

Script'teki `guard()` bunu yakalayıp exception atar. Yeni kare eklerken fiyat
veya ok içeren metni `B()` (Baloo2) ile bas, `T()` (Sora) ile değil.

Aynı sebeple **emoji hiç kullanılmıyor** — iki font da emoji render etmiyor.
Pin bir vektör şekli (`draw_pin`). `draw_pin`'in `hole` parametresi ZEMİN rengi
olmalı, yoksa delik kaybolur ve pin balona döner.

## İstatistikler

3. karedeki rakamlar 2026-07-21 tarihli canlı `/api/stats` verisidir. Bayat
görünmemesi için tekrar paylaşmadan önce güncelle:

```
curl -s "https://pinle.app/api/stats?token=$PINLE_ADMIN_TOKEN" | jq .totals
```

Not: 3.297 "mekan haritada" demek — bunların çoğu OSM'den gelen gerçek mekan,
**fiyatları henüz yok**. "3.297 fiyat" diye sunma; kare zaten "fiyatları
birlikte dolduruyoruz" diyerek bunu katkı çağrısına çeviriyor.

## Story

Story için `assets/video/kart-kapanis.png` (1080×1920) doğrudan kullanılabilir;
üstüne Instagram'ın kendi link sticker'ı eklenir.
