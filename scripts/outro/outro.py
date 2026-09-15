# -*- coding: utf-8 -*-
"""Générique de fin Montréal Uncovered (1080×1920, 30 i/s, ~6 s).

Le logo s'allume par à-coups, comme un néon qui amorce ; le bloc « abonnez-vous »
apparaît ensuite ; puis l'image s'éteint comme une vieille télé cathodique :
elle s'écrase en une ligne, la ligne se rétracte en un point, le point s'éteint.

    ./venv/bin/python outro.py [sortie.mp4]

Pour utiliser le fichier logo d'origine plutôt que la reconstitution vectorielle,
poser son chemin dans LOGO_FILE (PNG à fond transparent de préférence).
"""
import math, os, random, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1920, 30, 6.0
SR = 48000

FDIR = "/System/Library/Fonts/Supplemental/"
BLACK_F, BOLD_F, REG_F = FDIR + "Arial Black.ttf", FDIR + "Arial Bold.ttf", FDIR + "Arial.ttf"

ORANGE = (244, 96, 16)
ORANGE_HI = (255, 150, 74)
ORANGE_LO = (198, 62, 6)
BG = (7, 7, 8)

LOGO_FILE = None          # ex. "/Users/macali/Pictures/mtl-logo.png"
ICONS = os.path.join(HERE, "icons")

COMPTES = ["facebook", "instagram", "tiktok"]

# ------------------------------------------------------------------ le logo

def cone(w, h):
    """Cône de chantier : corps orange, deux bandes réfléchissantes, socle noir."""
    S = 3                                     # suréchantillonnage
    cw, ch = w * S, h * S
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))

    base_h = int(ch * 0.17)                   # socle
    body_h = ch - base_h
    cx = cw / 2
    top_w, bot_w = cw * 0.15, cw * 0.70

    # silhouette du corps (trapèze à sommet arrondi)
    mask = Image.new("L", (cw, ch), 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(cx - top_w / 2, body_h * 0.09), (cx + top_w / 2, body_h * 0.09),
                (cx + bot_w / 2, body_h), (cx - bot_w / 2, body_h)], fill=255)
    md.ellipse([cx - top_w / 2, body_h * 0.005, cx + top_w / 2, body_h * 0.175], fill=255)

    # dégradé orange + reflet spéculaire
    xs = np.linspace(0, 1, cw)[None, :, None]
    g = (np.array(ORANGE_LO, np.float32) * xs ** 1.3
         + np.array(ORANGE_HI, np.float32) * (1 - xs ** 1.3))
    spec = np.exp(-((np.linspace(0, 1, cw) - 0.36) ** 2) / 0.004)[None, :, None]
    g = np.broadcast_to(g * 0.94 + 255 * spec * 0.30, (ch, cw, 3)).copy()
    body = Image.fromarray(np.clip(g, 0, 255).astype("uint8"))

    # bandes réfléchissantes
    bd = ImageDraw.Draw(body)
    for y0, y1 in ((0.32, 0.47), (0.60, 0.76)):
        bd.rectangle([0, body_h * y0, cw, body_h * y1], fill=(236, 236, 232))
        bd.rectangle([0, body_h * y0, cw, body_h * y0 + 3 * S], fill=(255, 255, 255))
        bd.rectangle([0, body_h * y1 - 3 * S, cw, body_h * y1], fill=(206, 206, 202))

    im.paste(body, (0, 0), mask)

    d = ImageDraw.Draw(im)
    # collerette au pied du cône
    d.rounded_rectangle([cx - bot_w / 2 - 9 * S, body_h - 16 * S,
                         cx + bot_w / 2 + 9 * S, body_h + 8 * S],
                        radius=10 * S, fill=ORANGE)
    d.rounded_rectangle([cx - bot_w / 2 - 9 * S, body_h - 16 * S,
                         cx + bot_w / 2 + 9 * S, body_h - 10 * S],
                        radius=6 * S, fill=ORANGE_HI)
    # socle
    d.rounded_rectangle([cw * 0.03, ch - base_h, cw * 0.97, ch - 3 * S],
                        radius=12 * S, fill=(24, 24, 26))
    d.rounded_rectangle([cw * 0.03, ch - base_h, cw * 0.97, ch - base_h + 6 * S],
                        radius=8 * S, fill=(58, 58, 62))
    return im.resize((w, h), Image.LANCZOS)


def build_logo(width=980):
    """Bloc logo : « MTL » en blanc, le cône posé par-dessus (comme la marque)."""
    if LOGO_FILE and os.path.exists(LOGO_FILE):
        im = Image.open(LOGO_FILE).convert("RGBA")
        r = width / im.width
        return im.resize((width, int(im.height * r)), Image.LANCZOS)

    # Le cône prend la place du milieu du mot : les trois lettres restent
    # entièrement lisibles, la marque garde sa lecture « M-cône-TL ».
    h = int(width * 0.66)
    im = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BLACK_F, int(width * 0.34))

    gap = int(width * 0.30)                       # réserve pour le cône
    wm, wtl = d.textlength("M", font=f), d.textlength("TL", font=f)
    x = (width - (wm + gap + wtl)) / 2
    base = h * 0.88
    d.text((x, base), "M", font=f, fill=(255, 255, 255, 255), anchor="ls")
    d.text((x + wm + gap, base), "TL", font=f, fill=(255, 255, 255, 255), anchor="ls")

    c = cone(int(gap * 1.02), int(h * 0.86))
    im.alpha_composite(c, (int(x + wm + (gap - c.width) / 2), int(h * 0.95) - c.height))
    return im


# ------------------------------------------------------------ mise en page

def texte(d, xy, s, f, fill, spacing=0, anchor_center=True, shadow=None):
    total = sum(d.textlength(ch, font=f) for ch in s) + spacing * (len(s) - 1)
    x = xy[0] - total / 2 if anchor_center else xy[0]
    for ch in s:
        if shadow:
            d.text((x + shadow[0], xy[1] + shadow[1]), ch, font=f, fill=shadow[2])
        d.text((x, xy[1]), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + spacing
    return total


def build_elements():
    """Chaque élément est un calque RGBA plein cadre, allumé indépendamment."""
    el = {}

    logo = build_logo(980)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lay.alpha_composite(logo, ((W - logo.width) // 2, 470))
    glow = lay.filter(ImageFilter.GaussianBlur(26))
    glow.putalpha(glow.getchannel("A").point(lambda v: int(v * 0.45)))
    base = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    base.alpha_composite(glow); base.alpha_composite(lay)
    el["logo"] = base

    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    f = ImageFont.truetype(BLACK_F, 92)
    texte(d, (W / 2, 1180), "ABONNEZ-VOUS", f, (255, 255, 255, 255), spacing=4)
    d.rounded_rectangle([W / 2 - 130, 1310, W / 2 + 130, 1317], radius=4, fill=ORANGE + (255,))
    el["titre"] = lay

    # les trois icônes seules, alignées, sans pseudo
    taille, ecart = 150, 130
    total = len(COMPTES) * taille + (len(COMPTES) - 1) * ecart
    for i, nom in enumerate(COMPTES):
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ic = Image.open(os.path.join(ICONS, nom + ".png")).convert("RGBA")
        ic = ic.resize((taille, taille), Image.LANCZOS)
        x0 = int((W - total) / 2 + i * (taille + ecart))
        lay.alpha_composite(ic, (x0, 1400))
        el["c%d" % i] = lay

    return el


def fond():
    """Fond quasi noir, vignette et lignes de balayage."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    v = np.clip(1.25 - 0.55 * r ** 2, 0, 1)[..., None]
    img = np.array(BG, np.float32)[None, None, :] * v + 6 * v
    img[::3] *= 0.82                                   # scanlines
    return Image.fromarray(np.clip(img, 0, 255).astype("uint8")).convert("RGBA")


# ------------------------------------------------------------- l'animation

# amorçage type néon : (instant, intensité) tenus jusqu'au suivant
AMORCE = [(0.00, 0), (0.20, .85), (0.26, .05), (0.31, 1), (0.36, 0), (0.45, .45),
          (0.50, 0), (0.58, 1), (0.63, .15), (0.70, 1), (0.76, .5), (0.82, 1)]
T_TITRE, T_C0, T_C1, T_C2 = 1.05, 1.45, 1.72, 1.99
T_OFF = 4.90
MICRO = [1.95, 2.62, 3.34, 4.05, 4.61]      # micro-coupures pendant la tenue


def niveau(t, start, ignition=True):
    if t < start:
        return 0.0
    u = t - start
    if ignition:
        for (a, v), (b, _) in zip(AMORCE, AMORCE[1:] + [(9e9, 0)]):
            if a <= u < b:
                return v
        return 1.0
    return min(1.0, u / 0.10)


def scintille(t):
    """Micro-coupures d'ensemble, 1 = normal."""
    k = 1.0
    for m in MICRO:
        if 0 <= t - m < 0.09:
            u = (t - m) / 0.09
            k *= 0.35 + 0.65 * abs(math.sin(u * math.pi * 3))
    return k


def compose(t, bg, el):
    im = bg.copy()
    lv = {
        "logo": niveau(t, 0.18),
        "titre": niveau(t, T_TITRE, False),
        "c0": niveau(t, T_C0, False), "c1": niveau(t, T_C1, False),
        "c2": niveau(t, T_C2, False),
    }
    k = scintille(t)
    for name, a in lv.items():
        a *= k
        if a <= 0.01:
            continue
        lay = el[name]
        if a < 0.999:
            lay = lay.copy()
            lay.putalpha(lay.getchannel("A").point(lambda v, a=a: int(v * a)))
        im.alpha_composite(lay)
    return im.convert("RGB"), k


def extinction(img, u):
    """u de 0 à 1 sur l'extinction cathodique."""
    out = Image.new("RGB", (W, H), (0, 0, 0))
    if u < 0.34:                                   # écrasement vertical
        p = u / 0.34
        hh = max(2, int(H * (1 - p) ** 2.4))
        ww = int(W * (1 + 0.05 * p))
        sq = img.resize((ww, hh), Image.BILINEAR)
        sq = Image.fromarray(np.clip(np.asarray(sq, np.float32) * (1 + 2.6 * p), 0, 255).astype("uint8"))
        out.paste(sq, ((W - ww) // 2, (H - hh) // 2))
    elif u < 0.62:                                 # la ligne se rétracte
        p = (u - 0.34) / 0.28
        lw = int(W * (1 - p) ** 1.6) + 16
        d = ImageDraw.Draw(out)
        d.rectangle([(W - lw) // 2, H // 2 - 3, (W + lw) // 2, H // 2 + 3], fill=(255, 255, 255))
        d.rectangle([(W - lw) // 2, H // 2 - 1, (W + lw) // 2, H // 2 + 1], fill=(255, 255, 255))
        out = out.filter(ImageFilter.GaussianBlur(2.2))
    else:                                          # le point s'éteint
        p = (u - 0.62) / 0.38
        r = max(1.0, 9 * (1 - p))
        a = int(255 * (1 - p) ** 1.7)
        d = ImageDraw.Draw(out)
        d.ellipse([W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r], fill=(a, a, a))
        out = out.filter(ImageFilter.GaussianBlur(3 + 6 * p))
    return out


def rgb_split(img, dx):
    a = np.asarray(img, np.int16)
    o = a.copy()
    o[:, :, 0] = np.roll(a[:, :, 0], dx, axis=1)
    o[:, :, 2] = np.roll(a[:, :, 2], -dx, axis=1)
    return Image.fromarray(o.astype("uint8"))


# ------------------------------------------------------------------- son

def piste_son():
    n = int(DUR * SR)
    t = np.arange(n) / SR
    s = np.zeros(n, np.float32)
    rng = np.random.default_rng(7)

    def at(sec):
        return int(sec * SR)

    # grésillement électrique à chaque coup de l'amorçage
    for a, v in AMORCE[1:]:
        if v < 0.3:
            continue
        i = at(0.18 + a)
        d = at(0.05)
        env = np.exp(-np.linspace(0, 9, d))
        buzz = rng.normal(0, 1, d) * 0.35 + np.sin(2 * np.pi * 120 * np.arange(d) / SR) * 0.5
        s[i:i + d] += (buzz * env * 0.16 * v).astype(np.float32)

    # ronflement de tube pendant la tenue
    i0, i1 = at(0.9), at(T_OFF)
    hum = (np.sin(2 * np.pi * 120 * t[i0:i1]) * 0.5 + np.sin(2 * np.pi * 60 * t[i0:i1]) * 0.5)
    s[i0:i1] += (hum * 0.012).astype(np.float32)
    for m in MICRO:
        i = at(m); d = at(0.06)
        s[i:i + d] += (rng.normal(0, 1, d) * np.exp(-np.linspace(0, 10, d)) * 0.05).astype(np.float32)

    # extinction : clac sourd + sifflement descendant + souffle
    i = at(T_OFF)
    d = at(0.32)
    e = np.exp(-np.linspace(0, 7, d))
    tt = np.arange(d) / SR
    freq = 2600 * np.exp(-tt * 14) + 90
    whine = np.sin(2 * np.pi * np.cumsum(freq) / SR) * e * 0.20
    thump = np.sin(2 * np.pi * 74 * tt) * np.exp(-np.linspace(0, 16, d)) * 0.55
    hiss = rng.normal(0, 1, d) * np.exp(-np.linspace(0, 22, d)) * 0.22
    s[i:i + d] += (whine + thump + hiss).astype(np.float32)

    s = s / max(1e-6, np.abs(s).max()) * 0.72
    fade = at(0.05)
    s[:fade] *= np.linspace(0, 1, fade)
    s[-fade:] *= np.linspace(1, 0, fade)
    st = np.stack([s, s], 1)
    return (st * 32767).astype("<i2").tobytes()


# ------------------------------------------------------------------ rendu

def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "outro-mtl.mp4")
    wav = os.path.join(HERE, "outro.wav")

    import wave
    with wave.open(wav, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes(piste_son())

    bg, el = fond(), build_elements()
    rng = random.Random(11)

    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{W}x{H}",
         "-framerate", str(FPS), "-i", "-",
         "-i", wav,
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
         "-movflags", "+faststart", out],
        stdin=subprocess.PIPE)

    for i in range(int(DUR * FPS)):
        t = i / FPS
        img, k = compose(min(t, T_OFF - 0.01), bg, el)
        if t >= T_OFF:
            img = extinction(img, min(1.0, (t - T_OFF) / 0.72))
        elif k < 0.9:                      # décalage RVB sur les sautes
            img = rgb_split(img, rng.choice((-6, -4, 4, 6)))
        p.stdin.write(img.tobytes())
    p.stdin.close()
    p.wait()
    print("→", out)


if __name__ == "__main__":
    main()
