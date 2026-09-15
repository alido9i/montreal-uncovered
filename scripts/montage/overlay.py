# -*- coding: utf-8 -*-
"""Génère la piste d'incrustations (RGBA brut sur stdout) du discours de Mark
Carney, Ottawa, 27 mars 2025. Composée ensuite sur la vidéo par ffmpeg.

Trois familles d'éléments :
  - « IL FAIT RÉFÉRENCE À » : ce que Carney évoque sans le nommer (Bretton
    Woods, les traités commerciaux, les alliances).
  - « LE CHIFFRE » : une statistique sourcée, compteur animé.
  - Les sous-titres français, révélés mot à mot au rythme de la parole.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, DUR = 1280, 720, 30, 69.0
SPEECH_END = 66.0
ACCENT = (255, 0, 51)
WHITE = (255, 255, 255)

HERE = os.path.dirname(os.path.abspath(__file__))
FDIR = "/System/Library/Fonts/Supplemental/"
def font(name, size):
    for cand in (FDIR + name, FDIR + "Arial.ttf", "/Library/Fonts/Arial.ttf"):
        if os.path.exists(cand):
            return ImageFont.truetype(cand, size)
    return ImageFont.load_default()

F_NUM    = font("Arial Black.ttf", 88)
F_SUF    = font("Arial Black.ttf", 42)
F_NAME   = font("Arial Black.ttf", 38)
F_STAMP  = font("Arial Black.ttf", 33)
F_YEAR   = font("Arial Black.ttf", 30)
F_KICK   = font("Arial Black.ttf", 13)
F_LABEL  = font("Arial Bold.ttf", 20)
F_ROW    = font("Arial Bold.ttf", 19)
F_CAP    = font("Arial Bold.ttf", 17)
F_NOTE   = font("Arial.ttf", 15)
F_CRED   = font("Arial.ttf", 12)
F_SUB    = font("Arial Bold.ttf", 28)
F_QUOTE  = font("Arial Black.ttf", 44)
F_QSUB   = font("Arial.ttf", 18)

# ---------------------------------------------------------------- utilitaires

def clamp(v, a=0.0, b=1.0): return a if v < a else b if v > b else v
def ease_out(p):  return 1 - (1 - p) ** 3
def ease_expo(p): return 1 if p >= 1 else 1 - 2 ** (-9 * p)

def envelope(t, start, end, fin=0.45, fout=0.35):
    """(alpha, progression d'entrée 0→1). alpha=0 hors de l'intervalle."""
    if t < start or t >= end + fout:
        return 0.0, 0.0
    pin = clamp((t - start) / fin)
    a = ease_out(pin)
    if t > end:
        a *= 1 - clamp((t - end) / fout)
    return a, pin

def fr_num(v, dec=0):
    s = f"{v:,.{dec}f}".replace(",", " ").replace(".", ",")
    return s

def tracked(d, xy, s, f, fill, track=2):
    """Texte avec interlettrage (PIL ne le gère pas nativement)."""
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + track
    return x

def wrap(d, s, f, maxw):
    lines, cur = [], ""
    for word in s.split():
        trial = (cur + " " + word).strip()
        if d.textlength(trial, font=f) <= maxw or not cur:
            cur = trial
        else:
            lines.append(cur); cur = word
    if cur: lines.append(cur)
    return lines

def paste(frame, layer, x, y, alpha):
    if alpha <= 0.003: return
    if alpha < 0.997:
        layer = layer.copy()
        layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    frame.alpha_composite(layer, (int(x), int(y)))

_D0M = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
CARD_W, PAD = 360, 20
INNER = CARD_W - 2 * PAD

def build_card(blocks, width=CARD_W):
    """blocks : liste de callables (draw, y, width) -> nouvelle valeur de y."""
    content = Image.new("RGBA", (width, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(content)
    y = PAD
    for b in blocks:
        y = b(d, y, width - 2 * PAD)
    h = int(y + PAD)
    card = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle(
        (0, 0, width - 1, h - 1), radius=4, fill=(8, 8, 8, 214),
        outline=(255, 255, 255, 48), width=1)
    card.alpha_composite(content.crop((0, 0, width, h)))
    return card

def b_kicker(text, color=ACCENT):
    def f(d, y, w):
        tracked(d, (PAD, y), text.upper(), F_KICK, color + (255,), track=1.8)
        return y + 24
    return f

def b_gap(n):
    return lambda d, y, w: y + n

def b_lines(text, f, color, lh, size_w=None):
    def fn(d, y, w):
        for ln in wrap(d, text, f, size_w or w):
            d.text((PAD, y), ln, font=f, fill=color)
            y += lh
        return y
    return fn

# ------------------------------------------------------------------- photos

def load_photo(name, box):
    im = Image.open(os.path.join(HERE, "photos", name)).convert("RGB")
    tw, th = box
    sc = max(tw / im.width, th / im.height)
    im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
    left = (im.width - tw) // 2
    top = max(0, (im.height - th) // 6)          # cadrage haut : on garde les visages
    return im.crop((left, top, left + tw, top + th)).convert("RGBA")

PH_BRETTON = load_photo("bretton.jpg", (INNER, 224))
PH_PONT    = load_photo("pont.jpg", (INNER, 224))
PH_LESAGE  = load_photo("lesage.jpg", (132, 165))

def b_photo(img):
    def f(d, y, w):
        return y  # dessiné à part (voir card_photo)
    return f

# --------------------------------------------------------------- constructeurs

_NUMF = {}
def fit_num(final_text, suffix):
    """Plus grand corps où le nombre final tient dans la carte."""
    key = (final_text, suffix)
    if key not in _NUMF:
        for size in (88, 78, 68, 60, 54):
            fn = font("Arial Black.ttf", size)
            fs = font("Arial Black.ttf", int(size * 0.48))
            wtot = _D0M.textlength(final_text, font=fn)
            if suffix:
                wtot += _D0M.textlength(suffix, font=fs) + 4
            if wtot <= INNER:
                _NUMF[key] = (fn, fs, size); break
        else:
            _NUMF[key] = (font("Arial Black.ttf", 54), font("Arial Black.ttf", 26), 54)
    return _NUMF[key]

def card_stat(value, dec, suffix, label, note, source, prog):
    shown = value * ease_expo(prog)
    fn, fs, size = fit_num(fr_num(value, dec), suffix)
    def num(d, y, w):
        s = fr_num(shown, dec)
        d.text((PAD, y), s, font=fn, fill=WHITE + (255,))
        if suffix:
            d.text((PAD + d.textlength(s, font=fn) + 4, y + size * 0.46), suffix,
                   font=fs, fill=ACCENT + (255,))
        return y + size + 8
    return build_card([
        b_kicker("Le chiffre"), num, b_gap(4),
        b_lines(label, F_LABEL, WHITE + (240,), 25),
        b_gap(6), b_lines(note, F_NOTE, WHITE + (150,), 20),
        b_gap(8), b_lines("Source : " + source, F_CRED, WHITE + (115,), 16),
    ])

def card_photo(photo, caption, credit, kicker="Il fait référence à"):
    def ph(d, y, w):
        return y + 224 + 12
    card = build_card([
        b_kicker(kicker), ph,
        b_lines(caption, F_CAP, WHITE + (240,), 22),
        b_gap(7), b_lines(credit, F_CRED, WHITE + (115,), 16),
    ])
    card.alpha_composite(photo, (PAD, PAD + 24))
    return card

def card_rows(kicker, title, rows, note, prog):
    """Liste chronologique dont les lignes apparaissent une à une."""
    def body(d, y, w):
        for i, (year, text) in enumerate(rows):
            p = clamp((prog - i * 0.13) / 0.3)
            if p <= 0:
                y += 27; continue
            a = int(255 * ease_out(p))
            dx = int((1 - ease_out(p)) * 14)
            d.text((PAD + dx, y), year, font=F_ROW, fill=ACCENT + (a,))
            d.text((PAD + 54 + dx, y), text, font=F_ROW, fill=WHITE + (a,))
            y += 27
        return y
    return build_card([
        b_kicker(kicker), b_lines(title, F_LABEL, WHITE + (240,), 24),
        b_gap(10), body, b_gap(6),
        b_lines(note, F_NOTE, WHITE + (140,), 19),
    ])

def card_years(a_year, b_year, label, note, prog):
    def band(d, y, w):
        d.text((PAD, y), str(a_year), font=F_YEAR, fill=WHITE + (255,))
        wa = d.textlength(str(a_year), font=F_YEAR)
        wb = d.textlength(str(b_year), font=F_YEAR)
        x0 = PAD + wa + 12
        x1 = PAD + w - wb - 12
        d.line((x0, y + 18, x1, y + 18), fill=WHITE + (70,), width=2)
        d.line((x0, y + 18, x0 + (x1 - x0) * ease_out(prog), y + 18),
               fill=ACCENT + (255,), width=2)
        d.text((PAD + w - wb, y), str(b_year), font=F_YEAR, fill=WHITE + (255,))
        return y + 44
    return build_card([
        b_kicker(label), band, b_gap(6),
        b_lines(note, F_NOTE, WHITE + (150,), 20),
    ])

def card_lower_third():
    def name(d, y, w):
        d.text((PAD, y), "Mark Carney", font=F_NAME, fill=WHITE + (255,))
        return y + 54
    card = build_card([
        name,
        b_lines("Premier ministre du Canada", F_LABEL, WHITE + (225,), 24),
        b_gap(4),
        b_lines("Ottawa · 27 mars 2025 · CPAC", F_NOTE, WHITE + (140,), 19),
    ], width=430)
    ImageDraw.Draw(card).rectangle((0, 0, 3, card.height), fill=ACCENT + (255,))
    return card

def stamp(index, total, prog):
    txt = "C'EST TERMINÉ"
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tw = d0.textlength(txt, font=F_STAMP)
    w = int(tw + 40 + 74)
    h = 62
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=4, fill=(8, 8, 8, 224),
                        outline=(255, 255, 255, 48), width=1)
    d.rectangle((0, 0, 4, h), fill=ACCENT + (255,))          # liseré rouge
    d.text((22, 15), txt, font=F_STAMP, fill=WHITE + (255,))
    d.line((tw + 36, 16, tw + 36, h - 16), fill=(255, 255, 255, 55), width=1)
    d.text((tw + 50, 20), f"{index}", font=F_LABEL, fill=ACCENT + (255,))
    d.text((tw + 50 + d.textlength(str(index), font=F_LABEL), 20),
           f" / {total}", font=F_LABEL, fill=(255, 255, 255, 95))
    # Balayage rouge à l'apparition, plutôt qu'un effet de zoom.
    wipe = int(w * (1 - ease_out(prog)))
    if wipe > 0:
        d.rectangle((w - wipe, 0, w, h), fill=(0, 0, 0, 0))
    return card

# ------------------------------------------------------------- sous-titres FR
# Les timings au mot viennent de la piste anglaise ; pour la traduction on
# répartit la durée du segment sur les mots au prorata de leur longueur. Le
# dernier mot se révèle à 85 % du segment pour que la ligne soit complète avant
# de changer.
SUBS = [
    (0.00,  5.32, "L'économie mondiale est fondamentalement différente aujourd'hui de ce qu'elle était hier."),
    (5.32, 11.04, "Le système commercial mondial ancré sur les États-Unis, sur lequel le Canada s'appuie"),
    (11.04,18.04, "depuis la fin de la Seconde Guerre mondiale — un système qui, sans être parfait,"),
    (18.04,24.36, "a nourri la prospérité de notre pays pendant des décennies — est terminé."),
    (24.36,30.54, "Notre ancienne relation d'intégration toujours plus poussée avec les États-Unis est terminée."),
    (30.54,35.30, "Les 80 ans durant lesquels les États-Unis ont endossé le rôle de chef de file de l'économie mondiale,"),
    (35.30,41.14, "forgé des alliances fondées sur la confiance et le respect mutuel et défendu l'échange"),
    (41.14,47.00, "libre et ouvert des biens et des services : c'est terminé."),
    (47.00,52.58, "C'est une tragédie, mais c'est aussi la nouvelle réalité."),
    (52.58,58.60, "Nous devons répondre avec détermination et avec force."),
    (58.60,63.48, "Nous sommes un pays libre, souverain et ambitieux."),
    (63.48,66.00, "Nous sommes maîtres chez nous."),
]

_D0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))

def _sub_layout(text):
    """Lignes centrées, positions figées : la révélation ne décale rien."""
    lines = wrap(_D0, text, F_SUB, 980)
    out, widths = [], []
    for ln in lines:
        words = ln.split()
        w_total = _D0.textlength(ln, font=F_SUB)
        pos, x = [], 0.0
        for wd in words:
            pos.append((wd, x))
            x += _D0.textlength(wd + " ", font=F_SUB)
        out.append(pos); widths.append(w_total)
    return out, widths

SUB_CACHE = {}
def sub_layout(text):
    if text not in SUB_CACHE:
        lay, wd = _sub_layout(text)
        n = sum(len(l) for l in lay)
        chars = sum(len(w) for l in lay for w, _ in l) or 1
        times, acc = [], 0
        for l in lay:
            for w, _ in l:
                times.append(acc / chars)
                acc += len(w)
        SUB_CACHE[text] = (lay, wd, times)
    return SUB_CACHE[text]

SCRIM = Image.new("RGBA", (W, 240), (0, 0, 0, 0))
_sd = ImageDraw.Draw(SCRIM)
for i in range(240):
    _sd.line((0, i, W, i), fill=(0, 0, 0, int(165 * (i / 239) ** 1.7)))

def draw_subtitle(frame, t):
    seg = next((s for s in SUBS if s[0] <= t < s[1]), None)
    if not seg: return
    start, end, text = seg
    lay, widths, times = sub_layout(text)
    span = (end - start) * 0.85
    base_y = 596 - (len(lay) - 1) * 38
    layer = Image.new("RGBA", (W, 200), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    k = 0
    for li, line in enumerate(lay):
        x0 = (W - widths[li]) / 2
        y = (base_y - 596 + 60) + li * 38
        for word, dx in line:
            reveal = start + times[k] * span
            k += 1
            p = clamp((t - reveal) / 0.16)
            if p <= 0: continue
            a = int(255 * ease_out(p))
            rise = int((1 - ease_out(p)) * 5)
            d.text((x0 + dx + 2, y + rise + 2), word, font=F_SUB, fill=(0, 0, 0, int(a * 0.75)))
            d.text((x0 + dx, y + rise), word, font=F_SUB, fill=WHITE + (a,))
    frame.alpha_composite(layer, (0, 536))

# -------------------------------------------------------------- carte de fin
OUTRO_SOURCES = ("Sources : Statistique Canada · CVMA · Cabinet du premier ministre · "
                 "Finances Canada — Extrait : CPAC, 27 mars 2025")

def end_band():
    card = Image.new("RGBA", (1168, 210), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, 1167, 209), radius=4, fill=(8, 8, 8, 226),
                        outline=(255, 255, 255, 48), width=1)
    d.rectangle((0, 0, 4, 210), fill=ACCENT + (255,))
    card.alpha_composite(PH_LESAGE.convert("L").convert("RGBA"), (26, 22))
    x = 186
    tracked(d, (x, 24), "L'ÉCHO QUÉBÉCOIS", F_KICK, ACCENT + (255,), track=1.8)
    d.text((x, 48), "« Nous sommes maîtres chez nous. »", font=F_QUOTE, fill=WHITE + (255,))
    d.text((x, 104), "« We are masters in our own home. »", font=F_QSUB, fill=(255, 255, 255, 150))
    for i, ln in enumerate(wrap(d, "Carney reprend mot pour mot le slogan de Jean Lesage à la "
                                   "campagne de 1962 — celui de la nationalisation de l'électricité "
                                   "et de la Révolution tranquille.", F_NOTE, 940)):
        d.text((x, 134 + i * 20), ln, font=F_NOTE, fill=(255, 255, 255, 205))
    d.text((x, 186), "Photo : Jean Lesage · Wikimedia Commons · Domaine public",
           font=F_CRED, fill=(255, 255, 255, 110))
    return card

END_BAND = end_band()

def draw_outro(frame, t):
    """Scrim plein cadre après la fin de la parole, puis signature."""
    if t < SPEECH_END: return
    a = clamp((t - SPEECH_END) / 0.7)
    frame.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(198 * a))))
    d = ImageDraw.Draw(frame)
    p = ease_out(clamp((t - SPEECH_END - 0.25) / 0.5))
    if p <= 0: return
    al = int(255 * p)
    d.text((W / 2, 300 - (1 - p) * 8), "« Maîtres chez nous »", font=F_QUOTE,
           fill=WHITE + (al,), anchor="mm")
    d.line((W / 2 - 60, 348, W / 2 + 60, 348), fill=ACCENT + (al,), width=3)
    d.text((W / 2, 388), "Mark Carney · Ottawa · 27 mars 2025", font=F_LABEL,
           fill=(255, 255, 255, int(205 * p)), anchor="mm")
    d.text((W / 2, 420), "Jean Lesage · campagne de 1962", font=F_NOTE,
           fill=(255, 255, 255, int(150 * p)), anchor="mm")
    d.text((W / 2, 664), OUTRO_SOURCES, font=F_CRED,
           fill=(255, 255, 255, int(130 * p)), anchor="mm")

# Cartes statiques — construites une seule fois (elles ne dépendent pas de t).
CARD_LOWER = card_lower_third()
CARD_BRETTON = card_photo(
    PH_BRETTON,
    "Bretton Woods, juillet 1944 — le FMI, la Banque mondiale, puis le GATT en 1947.",
    "Photo : Wikimedia Commons · Domaine public")
CARD_PONT = card_photo(
    PH_PONT,
    "Pont Ambassador, Windsor–Detroit : le principal corridor commercial terrestre.",
    "Photo : Ken Lund · CC BY-SA 2.0", kicker="La nouvelle réalité")

# ------------------------------------------------------------------ scénario
RX, RY = 884, 64          # emplacement droit (hors visage, sur les drapeaux)
LX, LY = 56, 400          # emplacement bas-gauche

def render(frame, t):
    frame.alpha_composite(SCRIM, (0, H - 240))

    a, p = envelope(t, 0.8, 6.0)
    if a: paste(frame, CARD_LOWER, LX - (1 - ease_out(p)) * 24, LY, a)

    a, p = envelope(t, 6.6, 17.6)
    if a: paste(frame, CARD_BRETTON,
        RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 18.0, 22.3)
    if a: paste(frame, card_stat(
        75.9, 1, " %", "des exportations canadiennes partent aux États-Unis",
        "2024 — et 62,2 % des importations en viennent",
        "Statistique Canada", p), RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 24.6, 30.3)
    if a: paste(frame, card_rows(
        "Il fait référence à", "L'intégration Canada–États-Unis",
        [("1965", "Pacte de l'auto"), ("1989", "Libre-échange Canada–É.-U."),
         ("1994", "ALENA"), ("2020", "ACEUM")],
        "Quatre traités en 55 ans.", p), RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 30.9, 35.2)
    if a: paste(frame, card_years(
        1945, 2025, "80 ans",
        "De la fin de la Seconde Guerre mondiale à ce discours.", p),
        RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 35.7, 43.2)
    if a: paste(frame, card_rows(
        "Il fait référence à", "Les alliances d'après-guerre",
        [("1947", "GATT — 23 pays signataires"), ("1949", "OTAN — Canada fondateur"),
         ("1958", "NORAD")],
        "L'architecture bâtie avec Washington.", p),
        RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 47.4, 52.4)
    if a: paste(frame, CARD_PONT,
        RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 53.0, 58.4)
    if a: paste(frame, card_stat(
        25, 0, " %", "de tarifs américains sur les automobiles canadiennes",
        "Annoncé la veille — en vigueur le 3 avril 2025",
        "Cabinet du premier ministre", p), RX + (1 - ease_out(p)) * 26, RY, a)

    a, p = envelope(t, 58.9, 63.3)
    if a: paste(frame, card_stat(
        105600, 0, "", "emplois directs dans la fabrication automobile",
        "603 500 emplois directs et indirects · 1,294 M de véhicules en 2024",
        "CVMA", p), RX + (1 - ease_out(p)) * 26, RY, a)

    for i, (s, e) in enumerate(((22.44, 26.2), (28.5, 32.2), (43.44, 47.2)), start=1):
        a, p = envelope(t, s, e)
        if a: paste(frame, stamp(i, 3, p), LX, 470, a)

    if t < 63.5:
        draw_subtitle(frame, t)
    if t < SPEECH_END:
        a, p = envelope(t, 63.5, SPEECH_END, fin=0.5, fout=0.01)
        if a: paste(frame, END_BAND, 56, 470 - (1 - ease_out(p)) * 14, a)
    draw_outro(frame, t)

def main():
    out = sys.stdout.buffer
    total = int(DUR * FPS)
    for i in range(total):
        frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        render(frame, i / FPS)
        out.write(frame.tobytes())
    out.flush()

if __name__ == "__main__":
    main()
