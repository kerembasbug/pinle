# PLAN B — Viral Yük Anında Ne Yapılır (Runbook)

Amaç: pinle.app aniden yüklenirse (viral an) siteyi AYAKTA tutmak. Aşağıdaki
kademeler sırayla; her biri tek başına da uygulanabilir. Hepsi dakikalar içinde.

## Zaten açık olan kalıcı korumalar (kod içinde, otomatik)
- `/api/pins` GET **15 sn mikro-cache** (kaba bbox superset) + `Cache-Control: public, max-age=10`
  → Aynı şehre bakan binlerce kişi DB'ye 15 sn'de 1 kez iner.
- `/api/live` 20 sn cache; SSR şehir/kategori sayfaları ISR (15 dk).
- Rate limit'ler (pin/fiyat/yorum/oy — kullanıcı başına günlük).
- SQLite WAL modu (okumalar yazmaları beklemez).

## KADEME 1 — Yazmaları kapat, harita açık kalsın (~2 dk)
Belirti: yanıtlar >2-3 sn, 5xx'ler, CPU %100.
Etki: herkes haritayı/fiyatları GÖRMEYE devam eder; pin/fiyat/yorum eklemek
"yoğunluk var, birazdan dene 🙏" mesajıyla 503 döner (Retry-After: 120).

```bash
TOKEN='30|P974mu9hZjaignjmPDRg8IFein9RHTYr3rz21KWRabd5de02'
APP='ewf74oxnji7dhs6jd1qk7zoj'
# env'i ekle/aç
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "http://77.42.34.247:8000/api/v1/applications/$APP/envs" \
  -d '{"key":"PINLE_READONLY","value":"1"}'
# restart (env'in yüklenmesi için şart)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://77.42.34.247:8000/api/v1/applications/$APP/restart"
```

Geri açmak: aynı env'i `"value":"0"` ile PATCH/POST edip tekrar restart.
(Env zaten varsa POST 409 dönebilir → `PATCH .../envs` aynı gövdeyle.)

## KADEME 2 — Cloudflare'ı öne al (~10 dk, DNS erişimi gerekir)
1. Cloudflare'da pinle.app zone'u aç (yoksa: add site → ücretsiz plan).
2. DNS A kaydını **Proxied (turuncu bulut)** yap.
3. Otomatik kazanım: statik asset'ler + `Cache-Control: public` başlıklı
   `/api/pins` yanıtları edge'de cache'lenir; TLS/HTTP2 offload; DDoS koruması.
4. İsteğe bağlı Cache Rule: `pinle.app/api/pins*` → "Cache eligible, TTL 15s".
5. Acil "Under Attack Mode" düğmesi de burada.

## KADEME 3 — Container'ı büyüt / restart (~2 dk)
```bash
# Basit restart (bellek şişmesi/leak şüphesi):
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://77.42.34.247:8000/api/v1/applications/$APP/restart"
```
Coolify UI → uygulama → Resources: CPU/RAM limitlerini yükselt (host: 77.42.34.247).
SQLite tek-yazar olduğu için YATAY ölçekleme (2. replika) YAPMA — önce Kademe 1+2.

## KADEME 4 — Statik "yoğunluk" sayfası (son çare, ~5 dk)
Uygulama tamamen çökerse: Coolify'da aynı domain'e geçici bir static site
(tek index.html: "Pinle şu an rekor yoğunlukta 🎉 birazdan dön") deploy et;
ya da Cloudflare varsa Workers ile 503 splash. Trafik düşünce geri al.

## İzleme (viral an boyunca açık tut)
```bash
while true; do
  printf "%s  " "$(date +%H:%M:%S)"
  curl -s -o /dev/null -w "/ %{http_code} %{time_total}s  " --max-time 10 https://pinle.app/
  curl -s -o /dev/null -w "pins %{http_code} %{time_total}s\n" --max-time 10 \
    "https://pinle.app/api/pins?minLat=40.9&maxLat=41.2&minLng=28.8&maxLng=29.2&kind=lezzet&categories=&deals="
  sleep 30
done
```
Eşikler: time_total > 2s VEYA 5xx görürsen → Kademe 1. Düzelmezse → Kademe 2.

## Veri güvenliği
- DB: `data/pinle.db` (container volume). Yoğunluk ÖNCESİ yedek almak istersen
  Coolify scheduled-task ile: `sqlite3 data/pinle.db ".backup data/yedek.db"`
  (komut 255 karakter sınırı; backtick kullanma — gerekirse base64 numarası,
  bkz. proje notları).
