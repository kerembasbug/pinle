# Login Kurulumu — 2 kimlik bilgisi gerekiyor

Login kodu hazır ve canlı. Ama Google ve e-posta *dış hesap* gerektirdiği için, çalışması
için aşağıdaki env değişkenlerini Coolify'a eklemek gerekiyor. Ben ekleyebilirim — sen
değerleri ver, ya da panelden ekle.

Env → Coolify: pinle uygulaması → **Environment Variables**.

## 1. Google ile Giriş

1. https://console.cloud.google.com → (SEO için kullandığın proje olur) → **APIs & Services → Credentials**
2. **Create Credentials → OAuth client ID → Web application**
3. **Authorized JavaScript origins**: `https://pinle.app`
4. (Redirect gerekmiyor — Google Identity Services token flow kullanıyoruz)
5. Oluşan **Client ID**'yi (…apps.googleusercontent.com) al.

Coolify env (İKİ değişken, aynı değer):
```
GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
```
> `NEXT_PUBLIC_` olan build-time olmalı (butonun görünmesi için). Ekledikten sonra redeploy şart.

## 2. E-posta sihirli link (Resend)

1. https://resend.com → ücretsiz hesap (3.000 e-posta/ay bedava)
2. **Domains → Add Domain → pinle.app** → gösterdiği DNS kayıtlarını Cloudflare'e ekle → doğrula
3. **API Keys → Create** → anahtarı al

Coolify env:
```
RESEND_API_KEY=re_xxxxxxxx
AUTH_FROM_EMAIL=giris@pinle.app
```
> Domain doğrulanana kadar Resend'in `onboarding@resend.dev` from adresiyle test edebilirsin.

## 3. Zaten ayarlı (ben ekledim)

```
AUTH_SECRET=<64 hex>   # sihirli link imzası — /tmp/pinle_auth_secret.txt'te de var
```

## Anahtarlar hazır olunca

Bunları Coolify'a ekleyip **redeploy** et (ya da bana ver, eklerim). Sonrası otomatik:
- Profilde "🔐 Hesabımı koru / Giriş yap" → Google butonu + e-posta kutusu.
- Google/e-posta ile giriş → anonim kimlik o hesaba terfi eder; başka cihazda aynı hesapla
  girince puanlar gelir (kod uçtan uca test edildi).

## Notlar

- Anonim kullanım hiç bozulmadı — login tamamen isteğe bağlı ("kayıt yok" hunısı korunuyor).
- Google client id yoksa: buton gizli, sadece e-posta görünür.
- Resend yoksa (prod): e-posta kutusu "henüz aktif değil" der (yanıltıcı "gönderildi" yok).
