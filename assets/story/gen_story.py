#!/usr/bin/env python3
"""Pinle — Instagram STORY slaytları (1080x1920, 9:16)."""
from PIL import Image, ImageDraw, ImageFilter
import os

S = os.path.dirname(os.path.abspath(__file__))
SHOTS = f"{S}/shots"
OUT = "/Volumes/MAINBACKUP/claude/genel/pinle/assets/story"
os.makedirs(OUT, exist_ok=True)

W, H = 1080, 1920

PAPER = (251, 245, 234)
INK = (34, 27, 21)
TOMATO = (232, 68, 46)
MUSTARD = (255, 193, 69)
TEAL = (14, 124, 102)
CREAM = (255, 253, 247)
MUTED = (138, 125, 112)

from PIL import ImageFont


def _f(name, size, weight):
    f = ImageFont.truetype(os.path.join(S, "assets", name), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def B(size, w=700):  # Baloo2 — ₺ ve → glifleri VAR
    return _f("Baloo2.ttf", size, w)


def T(size, w=400):  # Sora — DİKKAT: ₺ ve → YOK (.notdef kutusu basar)
    f = _f("Sora.ttf", size, w)
    f._no_glyph = "₺→"
    return f


def guard(txt, f):
    bad = [c for c in getattr(f, "_no_glyph", "") if c in txt]
    if bad:
        raise ValueError(f"Sora'da olmayan glif {bad}: {txt!r} → B() kullan")


def tw(d, txt, f):
    b = d.textbbox((0, 0), txt, font=f)
    return b[2] - b[0], b[3] - b[1]


def center(d, txt, f, y, fill, cx=W // 2):
    guard(txt, f)
    b = d.textbbox((0, 0), txt, font=f)
    d.text((cx - (b[2] - b[0]) / 2 - b[0], y), txt, font=f, fill=fill)
    return y + (b[3] - b[1])


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


def block(d, txt, f, y, fill, maxw=920, lh=1.18, cx=W // 2):
    guard(txt, f)
    for ln in wrap(d, txt, f, maxw):
        b = d.textbbox((0, 0), ln, font=f)
        d.text((cx - (b[2] - b[0]) / 2 - b[0], y), ln, font=f, fill=fill)
        y += int(f.size * lh)
    return y


def draw_pin(d, cx, cy, r, fill=TOMATO, hole=PAPER, ring=None):
    """hole ZEMİN rengi olmalı, yoksa pin balona döner."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
    d.polygon(
        [(cx - r * 0.62, cy + r * 0.55), (cx + r * 0.62, cy + r * 0.55), (cx, cy + r * 1.75)],
        fill=fill,
    )
    hr = r * 0.36
    d.ellipse([cx - hr, cy - hr, cx + hr, cy + hr], fill=hole)
    if ring:
        d.ellipse([cx - r * 1.5, cy - r * 1.5, cx + r * 1.5, cy + r * 1.5], outline=ring, width=6)


def tag(d, x, y, w, h, r, fill, outline=None, width=0):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=width)


def phone(im, shot_path, box_w, box_h, top):
    """Ekran görüntüsünü yuvarlak köşeli telefon çerçevesinde yerleştir."""
    sh = Image.open(shot_path).convert("RGB")
    # hedef orana göre ÜSTTEN kırp (alt bar/atıf yazısı gitsin)
    tgt = box_w / box_h
    src = sh.width / sh.height
    if src > tgt:  # çok geniş → yanlardan kırp
        nw = int(sh.height * tgt)
        sh = sh.crop(((sh.width - nw) // 2, 0, (sh.width + nw) // 2, sh.height))
    else:  # çok uzun → alttan kırp (üst bar korunsun)
        nh = int(sh.width / tgt)
        sh = sh.crop((0, 0, sh.width, nh))
    sh = sh.resize((box_w, box_h), Image.LANCZOS)

    R = 46
    mask = Image.new("L", (box_w, box_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, box_w, box_h], radius=R, fill=255)

    x = (W - box_w) // 2
    # gölge
    sh_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh_layer).rounded_rectangle(
        [x + 6, top + 14, x + box_w + 6, top + box_h + 14], radius=R, fill=(34, 27, 21, 70)
    )
    im.alpha_composite(sh_layer.filter(ImageFilter.GaussianBlur(14)))

    im.paste(sh, (x, top), mask)
    # ink çerçeve
    ImageDraw.Draw(im).rounded_rectangle(
        [x, top, x + box_w, top + box_h], radius=R, outline=INK, width=7
    )


def base(bg=PAPER):
    return Image.new("RGBA", (W, H), bg)


def brandbar(d, y, dark=False):
    """Alt marka imzası."""
    draw_pin(d, 372, y, 20, fill=TOMATO if not dark else CREAM,
             hole=PAPER if not dark else TOMATO)
    d.text((404, y - 26), "pinle.app", font=B(46, 700), fill=INK if not dark else CREAM)


# --------------------------------------------------------------- SLAYT 1
def slide1():
    im = base()
    d = ImageDraw.Draw(im)
    y = block(d, "Bu mahallede", B(96, 800), 96, INK)
    y = block(d, "çay kaç para?", B(96, 800), y + 2, TOMATO)
    block(d, "Menüye bakmadan, oturmadan önce gör.", T(38), y + 22, MUTED, maxw=900, lh=1.3)

    phone(im, f"{SHOTS}/01-harita-temiz.png", 700, 1240, 400)

    d2 = ImageDraw.Draw(im)
    tag(d2, W / 2 - 300, 1706, 600, 92, 46, MUSTARD)
    center(d2, "3.297 mekan haritada", B(48, 700), 1722, INK)
    brandbar(d2, 1862)
    im.convert("RGB").save(f"{OUT}/1-harita.png")


# --------------------------------------------------------------- SLAYT 2
def slide2():
    im = base()
    d = ImageDraw.Draw(im)
    y = block(d, "Fiyatı da, özelliği de", B(84, 800), 96, INK)
    y = block(d, "orada olan yazıyor", B(84, 800), y + 2, TEAL)
    block(d, "İçkili mi? Pati dostu mu? Bahçesi var mı?", T(36), y + 22, MUTED, maxw=920, lh=1.3)

    phone(im, f"{SHOTS}/02-pin.png", 700, 1240, 392)

    d2 = ImageDraw.Draw(im)
    tag(d2, W / 2 - 330, 1698, 660, 92, 46, CREAM, outline=INK, width=5)
    center(d2, "Sen de bir soru cevapla", B(48, 700), 1714, INK)
    brandbar(d2, 1862)
    im.convert("RGB").save(f"{OUT}/2-mekan.png")


# --------------------------------------------------------------- SLAYT 3 (CTA)
def slide3():
    im = base(TOMATO)
    d = ImageDraw.Draw(im)

    draw_pin(d, W / 2, 300, 88, fill=CREAM, hole=TOMATO, ring=(255, 150, 135))

    y = block(d, "Kazık yeme,", B(118, 800), 500, CREAM)
    y = block(d, "Pinle.", B(118, 800), y + 4, MUSTARD)

    block(d, "Ücretsiz · Reklamsız · Kayıt yok", T(38, 600), y + 30, (255, 214, 205))

    # İki link kartı
    cy = 930
    for label, sub in [("Google Play", "Android uygulaması"), ("pinle.app", "tarayıcıda aç")]:
        tag(d, W / 2 - 340, cy, 680, 150, 40, INK)
        center(d, label, B(60, 800), cy + 22, CREAM)
        center(d, sub, T(30), cy + 100, (188, 176, 165))
        cy += 190

    # Instagram link çıkartması BU BOŞ ALANA konur (kapatılmazsa da anlamlı durur)
    tag(d, W / 2 - 330, 1380, 660, 140, 40, None, outline=(255, 170, 158), width=6)
    center(d, "linke dokun", B(56, 700), 1408, (255, 205, 196))

    block(d, "Türkiye'nin gerçek fiyat haritasını", T(34), 1620, (255, 214, 205))
    block(d, "birlikte dolduruyoruz", T(34), 1670, (255, 214, 205))
    im.convert("RGB").save(f"{OUT}/3-cta.png")


for fn in (slide1, slide2, slide3):
    fn()
print("Üretildi:", sorted(os.listdir(OUT)))
