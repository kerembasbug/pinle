#!/usr/bin/env python3
"""Pinle — Instagram launch carousel (1080x1350, 4:5 feed)."""
from PIL import Image, ImageDraw, ImageFont
import os

S = os.path.dirname(os.path.abspath(__file__))
OUT = "/Volumes/MAINBACKUP/claude/genel/pinle/assets/instagram"
os.makedirs(OUT, exist_ok=True)

W, H = 1080, 1350

# Marka paleti
PAPER = (251, 245, 234)
INK = (34, 27, 21)
TOMATO = (232, 68, 46)
MUSTARD = (255, 193, 69)
TEAL = (14, 124, 102)
CREAM = (255, 253, 247)
MUTED = (138, 125, 112)


def font(name, size, weight=400):
    f = ImageFont.truetype(os.path.join(S, "assets", name), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def B(size, w=700):   # Baloo2 — başlık (₺ ve → glifleri VAR)
    return font("Baloo2.ttf", size, w)


def T(size, w=400):   # Sora — metin (DİKKAT: ₺ ve → glifleri YOK)
    f = font("Sora.ttf", size, w)
    f._no_glyph = "₺→"   # guard için işaretle
    return f


def guard(txt, f):
    """Font'ta olmayan karakter .notdef kutusu olarak basılır — sessizce geçme."""
    bad = [c for c in getattr(f, "_no_glyph", "") if c in txt]
    if bad:
        raise ValueError(f"Sora'da olmayan glif {bad} kullanıldı: {txt!r} "
                         f"→ Baloo2 (B) kullan veya metni değiştir")
    return txt


def tw(d, txt, f):
    b = d.textbbox((0, 0), txt, font=f)
    return b[2] - b[0], b[3] - b[1]


def center(d, txt, f, y, fill, cx=W // 2):
    guard(txt, f)
    b = d.textbbox((0, 0), txt, font=f)
    d.text((cx - (b[2] - b[0]) / 2 - b[0], y), txt, font=f, fill=fill)
    return b[3] - b[1]


def wrap(d, txt, f, maxw):
    words, lines, cur = txt.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if tw(d, t, f)[0] <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def block(d, txt, f, y, fill, maxw=880, lh=1.28, cx=W // 2):
    guard(txt, f)
    for ln in wrap(d, txt, f, maxw):
        b = d.textbbox((0, 0), ln, font=f)
        d.text((cx - (b[2] - b[0]) / 2 - b[0], y), ln, font=f, fill=fill)
        y += int(f.size * lh)
    return y


def draw_pin(d, cx, cy, r, fill=TOMATO, ring=None, hole=CREAM):
    """Vektör harita pini (emoji yok — fontlar emoji render etmiyor).
    `hole` ZEMİN rengi olmalı; aksi halde delik kaybolur ve pin balona döner."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
    d.polygon([(cx - r * 0.62, cy + r * 0.55), (cx + r * 0.62, cy + r * 0.55),
               (cx, cy + r * 1.75)], fill=fill)
    hr = r * 0.36
    d.ellipse([cx - hr, cy - hr, cx + hr, cy + hr], fill=hole)
    if ring:
        d.ellipse([cx - r * 1.5, cy - r * 1.5, cx + r * 1.5, cy + r * 1.5],
                  outline=ring, width=6)


def tag(d, x, y, w, h, r, fill, outline=None, width=0):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill,
                        outline=outline, width=width)


def badge(d, dark=False):
    """Sol altta ince marka imzası."""
    draw_pin(d, 62, H - 74, 15)
    d.text((92, H - 92), "pinle.app", font=T(26, 600),
           fill=(150, 136, 122) if dark else MUTED)


def dots(d, i, n=5, dark=False):
    """Carousel ilerleme noktaları. Koyu zeminde açık renk kullan."""
    on = CREAM if dark else INK
    off = (110, 96, 84) if dark else MUTED
    r, gap = 7, 26
    x = W / 2 - (n * (r * 2) + (n - 1) * (gap - r * 2)) / 2
    for k in range(n):
        d.ellipse([x, 42, x + r * 2, 42 + r * 2],
                  fill=on if k == i else None, outline=on if k == i else off,
                  width=2)
        x += gap


# ---------------------------------------------------------------- SLIDE 1
def slide1():
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    dots(d, 0)

    center(d, "AYNI SAHİL. 200 METRE.", T(30, 700), 130, MUTED)

    # İki fiyat kartı
    cw, ch, gap = 400, 400, 40
    x1 = W / 2 - cw - gap / 2
    x2 = W / 2 + gap / 2
    y = 240

    tag(d, x1, y, cw, ch, 34, CREAM, outline=TEAL, width=5)
    center(d, "ÇAY", T(30, 700), y + 48, TEAL, cx=x1 + cw / 2)
    center(d, "₺15", B(150, 800), y + 110, TEAL, cx=x1 + cw / 2)
    center(d, "esnaf kahvesi", T(24), y + 310, MUTED, cx=x1 + cw / 2)

    tag(d, x2, y, cw, ch, 34, CREAM, outline=TOMATO, width=5)
    center(d, "ÇAY", T(30, 700), y + 48, TOMATO, cx=x2 + cw / 2)
    center(d, "₺60", B(150, 800), y + 110, TOMATO, cx=x2 + cw / 2)
    center(d, "sahildeki mekan", T(24), y + 310, MUTED, cx=x2 + cw / 2)

    # Ortadaki "vs" rozeti
    d.ellipse([W / 2 - 44, y + ch / 2 - 44, W / 2 + 44, y + ch / 2 + 44],
              fill=INK)
    center(d, "vs", B(46, 700), y + ch / 2 - 42, CREAM)

    block(d, "İkisi de aynı çay.", B(76, 700), 730, INK)
    block(d, "Hangisi olduğunu hesap gelene kadar bilemiyorsun.",
          T(38), 850, MUTED, maxw=800, lh=1.42)

    tag(d, W / 2 - 210, 1105, 420, 84, 42, MUSTARD)
    center(d, "kaydır →", B(40, 700), 1118, INK)  # → yalnız Baloo2'de var
    badge(d)
    im.save(f"{OUT}/1-hook.png")


# ---------------------------------------------------------------- SLIDE 2
def slide2():
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    dots(d, 1, dark=True)

    draw_pin(d, W / 2, 260, 52, fill=TOMATO, ring=(78, 64, 52), hole=INK)

    y = block(d, "Türkiye’de fiyat", B(92, 700), 440, CREAM)
    y = block(d, "sürpriz olmaktan", B(92, 700), y + 4, CREAM)
    y = block(d, "çıksın istedik.", B(92, 700), y + 4, MUSTARD)

    block(d,
          "Gittiğin yerin fiyatını önceden bilmenin bir yolu yoktu. "
          "Şimdi var.",
          T(38), y + 80, (196, 186, 175), maxw=820, lh=1.45)

    badge(d, dark=True)
    im.save(f"{OUT}/2-problem.png")


# ---------------------------------------------------------------- SLIDE 3
def slide3():
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    dots(d, 2)

    draw_pin(d, W / 2, 210, 54, fill=TOMATO)
    block(d, "Bir harita yaptık.", B(88, 700), 330, INK)
    block(d, "Olduğun yerin gerçek fiyat haritası.",
          T(36), 460, MUTED, maxw=760, lh=1.4)

    # İstatistik kartları (gerçek veriler)
    stats = [("3.297", "mekan haritada"), ("7", "şehir"), ("₺0", "ücretsiz")]
    cw, gap = 300, 24
    total = len(stats) * cw + (len(stats) - 1) * gap
    x = W / 2 - total / 2
    for val, lab in stats:
        tag(d, x, 600, cw, 220, 30, CREAM, outline=(232, 224, 210), width=3)
        center(d, val, B(76, 800), 640, TOMATO, cx=x + cw / 2)
        center(d, lab, T(24), 752, MUTED, cx=x + cw / 2)
        x += cw + gap

    block(d, "Fiyatları birlikte dolduruyoruz.", B(52, 700), 900, TEAL)
    block(d, "Bildiğin bir fiyatı eklemek 10 saniye sürüyor.",
          T(34), 985, MUTED, maxw=800, lh=1.4)
    badge(d)
    im.save(f"{OUT}/3-cozum.png")


# ---------------------------------------------------------------- SLIDE 4
def slide4():
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    dots(d, 3)

    block(d, "Nasıl çalışıyor?", B(80, 700), 150, INK)

    steps = [
        ("1", "Haritayı aç", "Bulunduğun yerdeki mekanlar ve fiyatları önünde.", None),
        ("2", "Fiyatı gör", "Ne, kaça, ne zaman girilmiş — hepsi açık.", "Döner ₺180"),
        ("3", "Sen de ekle", "Bildiğin fiyatı pinle, puan kazan, mahallenin muhtarı ol.", None),
    ]
    y = 330
    for num, title, desc, chip in steps:
        tag(d, 100, y, 880, 200, 28, CREAM, outline=(232, 224, 210), width=3)
        d.ellipse([140, y + 56, 228, y + 144], fill=TOMATO)
        center(d, num, B(54, 800), y + 68, CREAM, cx=184)
        d.text((260, y + 46), title, font=B(46, 700), fill=INK)
        # Fiyat çipi uygulamadaki marker dilini taşır — ₺ için Baloo2 şart
        dw = 660
        if chip:
            cf = B(34, 700)
            cwid = tw(d, chip, cf)[0] + 56
            tag(d, 980 - 40 - cwid, y + 62, cwid, 76, 38, MUSTARD)
            center(d, chip, cf, y + 74, INK, cx=980 - 40 - cwid / 2)
            dw = 460
        for i, ln in enumerate(wrap(d, desc, T(28), dw)):
            d.text((260, y + 112 + i * 38), ln, font=T(28), fill=MUTED)
        y += 232

    block(d, "Kayıt yok. Anonim başlıyorsun.", T(32, 600), 1090, TEAL)
    badge(d)
    im.save(f"{OUT}/4-nasil.png")


# ---------------------------------------------------------------- SLIDE 5
def slide5():
    im = Image.new("RGB", (W, H), TOMATO)
    d = ImageDraw.Draw(im)
    dots(d, 4, dark=True)

    draw_pin(d, W / 2, 300, 72, fill=CREAM, ring=(255, 150, 135), hole=TOMATO)
    block(d, "Kazık yeme,", B(110, 800), 480, CREAM)
    block(d, "Pinle.", B(110, 800), 610, MUSTARD)

    block(d, "Bugün Google Play’de yayında.", T(38, 600), 790,
          (255, 226, 220), maxw=800, lh=1.4)

    tag(d, W / 2 - 290, 900, 580, 110, 55, INK)
    center(d, "Google Play’den indir", T(36, 700), 930, CREAM)

    block(d, "pinle.app", T(34, 700), 1070, (255, 205, 196))
    block(d, "Ücretsiz  ·  Reklamsız  ·  Kayıt gerekmez",
          T(26), 1130, (255, 192, 181))
    im.save(f"{OUT}/5-cta.png")


for fn in (slide1, slide2, slide3, slide4, slide5):
    fn()
print("Üretildi:", sorted(os.listdir(OUT)))
