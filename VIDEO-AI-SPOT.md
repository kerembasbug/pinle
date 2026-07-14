# Pinle — AI Reklam Spotu Üretim Paketi (2026-07-14)

> Konsept: **"İki Turist"** — aynı sahilde biri kazık yer, öteki fiyatı bilerek gider.
> Süre: ~25 sn = 5 AI sahne (4-5 sn) + 1 GERÇEK ekran kaydı + kapanış kartı.
> Format: 9:16 dikey. Üretim aracı önerisi: **Veo 3 (Gemini)** — diyalog+ses üretir.
> Alternatif: Kling 2 / Runway Gen-4 / (fal.ai bakiye yüklenince Veo/Kling oradan).

## Neden bu kurgu?
- AI video modellerinde EN BÜYÜK sorun karakter tutarlılığı → her sahnede karakteri
  AYNI cümleyle tanımlıyoruz (aşağıdaki prompt'larda sabit blok).
- Uygulama ekranını AI'ya ÇİZDİRMİYORUZ (uydurur, güven kırar) → 5. sahne gerçek
  ekran kaydı. AI = duygu/hikâye, gerçek UI = güven.

---

## Sabit karakter blokları (her prompt'a aynen girecek)
- KAZIK YİYEN: "a sweaty middle-aged Turkish tourist man with a bushy mustache,
  red polo shirt, straw hat, sunburned face"
- BİLEN: "a relaxed young Turkish woman with sunglasses, light blue linen shirt,
  calm confident smile"
- ORTAM: "a Turkish Aegean beach cafe, turquoise sea, white plastic tables,
  string lights, bright summer afternoon, cinematic, shallow depth of field,
  vertical 9:16"

---

## SAHNE 1 (4 sn) — Kanca: hesap şoku
**Veo 3 prompt:**
"Vertical 9:16 cinematic shot. A sweaty middle-aged Turkish tourist man with a
bushy mustache, red polo shirt, straw hat, sunburned face sits at a Turkish
Aegean beach cafe, turquoise sea behind, white plastic tables. A waiter hands
him a small bill paper. He reads it, his eyes go wide in shock, he nearly drops
his tea glass. Comic zoom-in on his face. Audio: seagulls, soft chatter, a
dramatic comedic sting."
**Overlay (kurguda):** "ÇAY + TOST: ₺480 😱"

## SAHNE 2 (4 sn) — Tepki
**Prompt:**
"Vertical 9:16. Same sweaty middle-aged Turkish tourist man with bushy mustache,
red polo shirt, straw hat, slumps back in his chair at the beach cafe, fanning
himself with the bill, muttering angrily in Turkish 'Dört yüz seksen lira?!'.
Handheld documentary feel. Audio: his frustrated mutter, seagulls."
**Not:** Veo 3 Türkçe repliği söyletebiliyor; olmazsa sessiz üret, repliği TTS ile bindir.

## SAHNE 3 (4 sn) — Bilen karakter girer
**Prompt:**
"Vertical 9:16 cinematic. A relaxed young Turkish woman with sunglasses, light
blue linen shirt, calm confident smile walks along the same Aegean beach
promenade, looks at her phone once, nods knowingly, and walks past the expensive
beach cafe without sitting. Smooth tracking shot. Audio: light summer music,
flip-flop footsteps."
**Overlay:** "O ÖNCE HARİTAYA BAKTI 📍"

## SAHNE 4 (4-5 sn) — Ödül: aynı keyif, gerçek fiyat
**Prompt:**
"Vertical 9:16. The relaxed young Turkish woman with sunglasses and light blue
linen shirt sits at a modest authentic Turkish tea garden two streets behind the
beach, same turquoise sea visible between buildings, raises a tulip-shaped tea
glass to the camera and smiles. Warm golden light. Audio: tea glass clink,
seagulls far away, cheerful music swell."
**Overlay:** "AYNI DENİZ. ÇAY: ₺15."

## SAHNE 5 (5 sn) — GERÇEK ekran kaydı (AI DEĞİL)
Telefonda: harita aç → sahildeki pine dokun → fiyat hero'su görünsün (örn. Ete
cafe "1 bira 1 çay ₺250") → ikinci pine dokun. (VIDEO-S1E1.md akışının kısaltılmışı.)
**Overlay:** "Fiyatları millet giriyor. Gerçek fiyat."

## SAHNE 6 (3 sn) — Kapanış kartı (statik, kurguda)
Paper zemin (#fbf5ea) + 📍 + büyük tomato yazı:
**KAZIK YEME, PİNLE.**  · pinle.app · alt satır: "Olduğun yerin gerçek fiyat haritası"
Audio: pinleme "pop" sesi (uygulamadaki iki notalı ses — ekran kaydından al).

---

## Seslendirme (TTS — ElevenLabs/Play.ht, "genç erkek, samimi, hafif muzip")
Sahne 2-5 üstüne tek parça VO (~11 sn):
"Tatilde en pahalı şey, bilmemek. O yüzden millet ödediği fiyatı haritaya
giriyor: çay kaça, şezlong kaça, döner kaça... Oturmadan bak, bilerek git.
Kazık yeme — Pinle."

## Montaj (CapCut)
1. Sıra: S1→S2→S3→S4→S5→S6; kesmeler sert (whip değil, düz cut).
2. S1 sonunda 0.3sn beyaz flaş (şok vurgusu). S4→S5 geçişinde "telefon ekranına dalış" hissi için hızlı zoom-in.
3. Overlay yazıları: kalın, beyaz + siyah kontur, ekranın üst 1/3'ünde.
4. Müzik: platform trend'lerinden hafif komik/yaz havalı bir ses; VO'nun altında -12dB.
5. Kapanışta 1 sn sessizlik + "pop" sesi → akılda kalır.

## Üretim notları / tuzaklar
- Her sahneyi 2-3 varyasyon üret, en iyisini seç (AI video kumar; ilk çıktıya güvenme).
- Karakter blokunu prompt'larda AYNEN koru; yine de küçük farklar olur — kabul,
  sahneler arası kıyafet aynı kaldığı sürece izleyici yutar.
- El/parmak yakın planlarından kaçın (AI'nın zayıf noktası) — fatura sahnesinde
  kağıt geniş planda kalsın.
- Metin/yazı AI sahnesinde ASLA üretme (bozuk çıkar) — tüm yazılar kurguda overlay.
- 8 sn'lik TEK SAHNELİK ucuz varyant (test için): sadece S1 + kapanış kartı;
  hook postu olarak at, tutarsa tam spotu üret.

## Yayın
- İlk yükleme: TikTok + Reels + Shorts (aynı dosya), caption:
  "Tatilde en pahalı şey: bilmemek 🏖️ #kazıkyeme #tatil2026 #davutlar #kuşadası"
- X'e de at ama X'te ekran kaydılı S1 serisi daha iyi performans verir; spot marka bilinirliği için.
