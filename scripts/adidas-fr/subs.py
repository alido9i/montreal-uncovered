# -*- coding: utf-8 -*-
"""Piste d'incrustations françaises (RGBA brut sur stdout) pour le reportage
Al Jazeera « أديداس تعتذر » (1080×1920, 30 i/s, 110 s).

Chaque bloc de texte arabe incrusté a été mesuré image par image (position,
apparition, disparition). On recouvre exactement sa boîte d'origine puis on
dessine la traduction française par-dessus :

  - « white »  : cartouche blanc opaque, texte noir  (style majoritaire)
  - « red »    : cartouche rouge, texte blanc        (les intertitres d'alerte)
  - « scrim »  : voile noir dégradé, texte blanc     (là où le titre est nu)
  - « black »  : aplat noir (fonds strictement noirs)

Le communiqué d'adidas, qui défile à l'écran, est remplacé par sa traduction
dans un panneau de mêmes dimensions.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, DUR = 1080, 1920, 30, 110.0
FDIR = "/System/Library/Fonts/Supplemental/"
BOLD, REG = FDIR + "Arial Bold.ttf", FDIR + "Arial.ttf"

WHITE_BG = (253, 253, 253)
RED_BG   = (195, 0, 1)
INK      = (17, 17, 17)
CARD_BG  = (215, 220, 228)
CARD_INK = (58, 62, 68)

def font(path, size):
    return ImageFont.truetype(path, size)

# --------------------------------------------------------------- sous-titres
# rect = boîte arabe mesurée (x0, y0, x1, y1) ; le cache la recouvre à 6 px près.
SUBS = [
    dict(t=(0.20, 4.05), style="scrim", rect=(200, 876, 876, 1014),
         lines=["ADIDAS S'EXCUSE"]),
    dict(t=(4.18, 8.60), style="red", rect=(154, 1138, 930, 1422),
         lines=["ET UN ANCIEN SOLDAT ISRAÉLIEN", "AU CŒUR DES CRITIQUES"]),
    dict(t=(8.60, 10.95), style="black", rect=(220, 868, 1052, 1162),
         lines=["QUE S'EST-IL PASSÉ ?"]),
    dict(t=(11.25, 15.05), style="white", rect=(126, 1142, 958, 1422),
         lines=["UNE CAMPAGNE LOCALE EN ISRAËL", "POUR PROMOUVOIR LE SERVICE"]),
    dict(t=(15.18, 18.05), style="scrim", rect=(192, 838, 888, 978),
         lines=["« LA CHAUSSURE UNIQUE »"], credit="Anadolu",
         credit_rect=(384, 980, 706, 1078)),
    dict(t=(18.15, 22.75), style="white", rect=(154, 1146, 942, 1422),
         lines=["11 ATHLÈTES EN SITUATION", "DE HANDICAP Y ONT PRIS PART"]),
    dict(t=(22.75, 27.55), style="red", rect=(134, 1022, 950, 1426),
         lines=["DONT L'ANCIEN SOLDAT", "ISRAÉLIEN", "SHALEV PITON"]),
    dict(t=(27.58, 32.65), style="scrim", rect=(152, 1096, 924, 1468),
         lines=["AMPUTÉ DE LA JAMBE GAUCHE", "APRÈS AVOIR ÉTÉ BLESSÉ", "EN 2021"]),
    dict(t=(32.90, 37.15), style="white", rect=(182, 986, 906, 1316),
         lines=["MAIS POURQUOI CETTE", "CAMPAGNE A-T-ELLE INDIGNÉ ?"], qmark=(448, 1298, 632, 1480)),
    dict(t=(37.65, 43.05), style="red", rect=(118, 1026, 966, 1432),
         lines=["DES MILITANTS PRO-", "PALESTINIENS ONT DÉNONCÉ", "LA PARTICIPATION DE PITON"]),
    dict(t=(43.15, 46.95), style="white", rect=(230, 1146, 942, 1422),
         lines=["DANS UNE CAMPAGNE CENTRÉE", "SUR LES PERSONNES AMPUTÉES"]),
    dict(t=(46.95, 50.75), style="scrim", rect=(162, 936, 926, 1172),
         lines=["QUI IGNORE", "DES MILLIERS DE PALESTINIENS"]),
    dict(t=(50.68, 55.62), style="white", rect=(154, 1142, 922, 1422),
         lines=["AYANT PERDU UN MEMBRE", "PENDANT LA GUERRE À GAZA"]),
    dict(t=(55.62, 59.45), style="scrim", rect=(168, 1146, 908, 1382),
         lines=["À CAUSE DE", "L'ARMÉE ISRAÉLIENNE"]),
    dict(t=(59.55, 65.55), style="white", rect=(162, 1136, 902, 1424),
         lines=["GAZA A ENREGISTRÉ PLUS DE", "5 000 AMPUTATIONS"],
         credit="Organisation mondiale de la santé", credit_rect=(210, 1414, 870, 1516)),
    dict(t=(65.57, 71.25), style="white", rect=(118, 1030, 966, 1424),
         lines=["ET PLUS DE 22 000 BLESSURES", "GRAVES AUX MEMBRES", "DEPUIS OCTOBRE 2023"]),
    dict(t=(71.17, 76.84), style="white", rect=(178, 1030, 906, 1424),
         lines=["UN QUART DES BLESSÉS", "HANDICAPÉS À VIE", "ÉTAIENT DES ENFANTS"],
         credit="Organisation mondiale de la santé", credit_rect=(210, 1414, 870, 1496)),
    dict(t=(77.05, 83.20), style="white", rect=(226, 1032, 948, 1420),
         lines=["L'ÉQUIPEMENTIER SPORTIF", "ALLEMAND « ADIDAS »", "S'EST EXCUSÉ"]),
    dict(t=(83.20, 86.15), style="scrim", rect=(210, 1104, 874, 1382),
         lines=["APRÈS LE TOLLÉ SUSCITÉ"]),
    dict(t=(86.15, 90.25), style="white", rect=(198, 1096, 886, 1420),
         lines=["L'ENTREPRISE AFFIRME QU'IL", "S'AGIT D'UNE INITIATIVE LOCALE"]),
    dict(t=(90.25, 94.45), style="white", rect=(282, 1142, 946, 1452),
         lines=["ET NON D'UNE", "CAMPAGNE MONDIALE"]),
    dict(t=(94.45, 98.75), style="white", rect=(194, 1030, 890, 1424),
         lines=["DE SON CÔTÉ, L'ACTEUR", "ESPAGNOL JAVIER BARDEM", "A APPELÉ"]),
    dict(t=(98.75, 102.95), style="white", rect=(114, 1138, 970, 1424),
         lines=["LES CONSOMMATEURS À BOYCOTTER", "LA MARQUE APRÈS CETTE CAMPAGNE"]),
    dict(t=(102.95, 108.05), style="white", rect=(126, 986, 954, 1316),
         lines=["CES EXCUSES SUFFIRONT-ELLES", "À APAISER LA CRISE ?"], qmark=(448, 1298, 632, 1498)),
]

# ------------------------------------------------------ communiqué (panneau)
CARD_T = (76.85, 86.15)
CARD_FLASH_END, CARD_FLASH_BOTTOM = 76.94, 1190
CARD_RECT = (90, 385, 989, 1048)
CARD_TITLE = "COMMUNIQUÉ D'ADIDAS — TRADUCTION"
CARD_TEXT = [
    "Nous avons conscience qu'une image utilisée lors d'une opération locale "
    "récente a suscité des réserves et de vives réactions. Notre intention "
    "n'a jamais été de blesser qui que ce soit, et nous présentons nos "
    "excuses à toutes les personnes concernées. Nous prenons acte des "
    "réserves exprimées et examinons ces remarques avec le plus grand sérieux.",

    "L'inclusion est l'une des valeurs fondamentales d'adidas, et nous restons "
    "engagés à élargir l'accès au sport. Le service « Single Shoe » (chaussure "
    "à l'unité), lancé en Europe plus tôt cette année, s'inscrit dans cet "
    "engagement continu. Il a été conçu pour répondre aux besoins des "
    "personnes pour qui porter une paire de chaussures classique n'est pas "
    "adapté. Le service poursuit son déploiement en Europe, en Asie et au "
    "Moyen-Orient, notamment aux Émirats arabes unis, en Palestine, au Liban, "
    "en Arabie saoudite, au Koweït, au Qatar et en Égypte.",

    "À travers le Moyen-Orient, adidas s'engage depuis de nombreuses années à "
    "soutenir les communautés qu'elle sert, en travaillant aux côtés des "
    "athlètes, des équipes et des communautés sportives de la région, et en "
    "soutenant les personnes et les collectifs dans le besoin par des dons de "
    "produits.",
]

# ------------------------------------------------------------------ dessin

def fit_font(lines, maxw, maxh, path=BOLD, hi=64, lo=22):
    """Plus grande taille qui laisse tenir les lignes dans la boîte."""
    probe = Image.new("L", (10, 10))
    d = ImageDraw.Draw(probe)
    for size in range(hi, lo - 1, -1):
        f = font(path, size)
        widths = [d.textlength(t, font=f) for t in lines]
        lh = size * 1.30
        if max(widths) <= maxw and lh * len(lines) <= maxh:
            return f, lh
    f = font(path, lo)
    return f, lo * 1.30


def wrap(text, f, maxw, draw):
    out, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=f) <= maxw or not cur:
            cur = trial
        else:
            out.append(cur); cur = word
    if cur:
        out.append(cur)
    return out


def feather(box, radius, blur, core=None):
    """Masque à bords fondus ; `core` reste totalement opaque après le flou."""
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=radius, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(blur))
    if core:
        ImageDraw.Draw(m).rounded_rectangle(core, radius=max(0, radius - 12), fill=255)
    return m


def draw_lines(d, lines, f, lh, cx, top, fill, shadow=None):
    y = top
    for t in lines:
        w = d.textlength(t, font=f)
        x = cx - w / 2
        if shadow:
            d.text((x + 3, y + 3), t, font=f, fill=shadow)
        d.text((x, y), t, font=f, fill=fill)
        y += lh


def veil(im, box, radius, blur, core=None):
    """Ajoute un voile noir : cœur opaque (le texte arabe disparaît), bords fondus."""
    m = feather(box, radius, blur, core)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lay.paste((0, 0, 0, 255), (0, 0, W, H), m)
    return Image.alpha_composite(im, lay)


def build_sub(s):
    """Compose le calque RGBA d'un sous-titre."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = s["rect"]
    pad = 26

    if s["style"] in ("white", "red"):
        bg = WHITE_BG if s["style"] == "white" else RED_BG
        ink = INK if s["style"] == "white" else (255, 255, 255)
        f, lh = fit_font(s["lines"], (x1 - x0) - 2 * pad, (y1 - y0) - 24)
        need_w = max(d.textlength(t, font=f) for t in s["lines"]) + 2 * pad
        need_h = lh * len(s["lines"]) + 26
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        bx0 = min(x0 - 6, cx - need_w / 2); bx1 = max(x1 + 6, cx + need_w / 2)
        by0 = min(y0 - 6, cy - need_h / 2); by1 = max(y1 + 6, cy + need_h / 2)
        d.rectangle([bx0, by0, bx1, by1], fill=bg + (255,))
        draw_lines(d, s["lines"], f, lh, cx, (by0 + by1) / 2 - lh * len(s["lines"]) / 2, ink)
    else:
        if s["style"] == "black":          # fond strictement noir : aplat franc
            im = veil(im, (x0 - 30, y0 - 24, x1 + 30, y1 + 24), 20, 16,
                      core=(x0 - 16, y0 - 12, x1 + 16, y1 + 12))
        else:                              # sur image : voile opaque à bords fondus
            im = veil(im, (x0 - 46, y0 - 36, x1 + 46, y1 + 36), 56, 30,
                      core=(x0 - 12, y0 - 10, x1 + 12, y1 + 10))
        d = ImageDraw.Draw(im)
        f, lh = fit_font(s["lines"], (x1 - x0) - 2 * pad, (y1 - y0) - 20)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        draw_lines(d, s["lines"], f, lh, cx, cy - lh * len(s["lines"]) / 2,
                   (255, 255, 255), shadow=(0, 0, 0))

    if s.get("credit"):
        cr = s["credit_rect"]              # efface la source arabe
        im = veil(im, (cr[0] - 30, cr[1] - 24, cr[2] + 30, cr[3] + 24), 50, 30,
                  core=(cr[0], cr[1], cr[2], cr[3]))
        d = ImageDraw.Draw(im)
        fc = font(REG, 30)
        t = s["credit"]
        w = d.textlength(t, font=fc)
        cx, cy = (cr[0] + cr[2]) / 2, (cr[1] + cr[3]) / 2
        d.text((cx - w / 2 + 2, cy - 15 + 2), t, font=fc, fill=(0, 0, 0, 160))
        d.text((cx - w / 2, cy - 15), t, font=fc, fill=(255, 255, 255, 235))

    if s.get("qmark"):
        qx0, qy0, qx1, qy1 = s["qmark"]
        d.rectangle([qx0, qy0, qx1, qy1], fill=RED_BG + (255,))
        fq = font(BOLD, int((qy1 - qy0) * 0.72))
        w = d.textlength("?", font=fq)
        d.text(((qx0 + qx1) / 2 - w / 2, qy0 + (qy1 - qy0) * 0.06), "?", font=fq,
               fill=(255, 255, 255, 255))
    return im


def build_card():
    """Panneau du communiqué : fond opaque + traduction, éventuellement défilante."""
    x0, y0, x1, y1 = CARD_RECT
    cw, ch = x1 - x0, y1 - y0
    pad_x, pad_top = 42, 30
    maxw = cw - 2 * pad_x

    probe = ImageDraw.Draw(Image.new("L", (10, 10)))
    for size in range(24, 15, -1):
        f = font(REG, size)
        lh = size * 1.42
        blocks = [wrap(p, f, maxw, probe) for p in CARD_TEXT]
        total = sum(len(b) * lh for b in blocks) + (len(blocks) - 1) * lh * 0.8
        if total <= ch - pad_top - 70:
            break
    ft = font(BOLD, 21)

    inner = Image.new("RGBA", (cw, int(total) + pad_top + 80), CARD_BG + (255,))
    di = ImageDraw.Draw(inner)
    tw = di.textlength(CARD_TITLE, font=ft)
    di.text((cw / 2 - tw / 2, pad_top - 4), CARD_TITLE, font=ft, fill=(120, 126, 136, 255))
    di.line([(cw / 2 - tw / 2, pad_top + 32), (cw / 2 + tw / 2, pad_top + 32)],
            fill=(170, 176, 186, 255), width=2)
    y = pad_top + 60
    for b in blocks:
        for line in b:
            w = di.textlength(line, font=f)
            di.text((cw / 2 - w / 2, y), line, font=f, fill=CARD_INK + (255,))
            y += lh
        y += lh * 0.8
    return inner


CARD_INNER = build_card()
LAYERS = [(s["t"], build_sub(s)) for s in SUBS]


def card_layer(t):
    """Panneau composé à l'instant t (léger défilement du texte, comme l'original)."""
    x0, y0, x1, y1 = CARD_RECT
    cw, ch = x1 - x0, y1 - y0
    over = max(0, CARD_INNER.height - ch)
    p = (t - CARD_T[0] - 0.7) / max(0.1, (CARD_T[1] - CARD_T[0] - 1.6))
    p = 0.0 if p < 0 else 1.0 if p > 1 else p
    off = int(over * p)
    view = Image.new("RGBA", (cw, ch), CARD_BG + (255,))
    view.paste(CARD_INNER.crop((0, off, cw, off + ch)), (0, 0))
    frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    frame.paste(view, (x0, y0))
    # Pendant le fondu d'entrée (2-3 images en négatif), la carte d'origine
    # descend plus bas : on rallonge le panneau le temps de la transition.
    if t < CARD_FLASH_END:
        y1 = CARD_FLASH_BOTTOM
        frame.paste(Image.new("RGBA", (cw, y1 - y0 - ch), CARD_BG + (255,)), (x0, y0 + ch))
    # coins arrondis comme la carte d'origine
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([x0, y0, x1, y1], radius=26, fill=255)
    frame.putalpha(Image.composite(frame.getchannel("A"), Image.new("L", (W, H), 0), mask))
    return frame


def main():
    out = sys.stdout.buffer
    blank = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cache, last_key = None, None
    n = int(DUR * FPS)
    for i in range(n):
        t = i / FPS
        active = [im for (a, b), im in LAYERS if a <= t < b]
        card = CARD_T[0] <= t < CARD_T[1]
        key = (tuple(id(x) for x in active),
               (int((t - CARD_T[0]) * 6), t < CARD_FLASH_END) if card else None)
        if key != last_key:
            frame = blank.copy()
            if card:
                frame = Image.alpha_composite(frame, card_layer(t))
            for im in active:
                frame = Image.alpha_composite(frame, im)
            cache, last_key = frame.tobytes(), key
        out.write(cache)
    out.flush()


if __name__ == "__main__":
    main()
