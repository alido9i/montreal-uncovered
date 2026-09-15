# -*- coding: utf-8 -*-
"""Planches de contrôle : compose les incrustations françaises sur les images
réelles (logo retiré) pour vérifier couverture et lisibilité avant rendu.

    ./venv/bin/python preview.py <source.mp4> <dossier_sortie>
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
import subs

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
LOGO = "delogo=x=82:y=198:w=110:h=166"
F = ImageFont.truetype(subs.BOLD, 30)


def base(t):
    p = f"{OUT}/base_{t:.2f}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", SRC,
                    "-frames:v", "1", "-vf", LOGO, p, "-y"], check=True)
    return Image.open(p).convert("RGBA")


def compose(t):
    im = base(t)
    if subs.CARD_T[0] <= t < subs.CARD_T[1]:
        im = Image.alpha_composite(im, subs.card_layer(t))
    for (a, b), lay in subs.LAYERS:
        if a <= t < b:
            im = Image.alpha_composite(im, lay)
    return im.convert("RGB")


tiles = []
for i, s in enumerate(subs.SUBS):
    t = (s["t"][0] + s["t"][1]) / 2
    im = compose(t)
    y0 = max(0, min(s["rect"][1], 380) - 60)
    im = im.crop((0, y0, 1080, min(1920, y0 + 1180))).resize((360, int(1180 * 360 / 1080)))
    lab = Image.new("RGB", (360, im.height + 34), (0, 60, 0))
    lab.paste(im, (0, 34))
    ImageDraw.Draw(lab).text((6, 2), f"#{i} t={t:.1f}", font=ImageFont.truetype(subs.BOLD, 22),
                             fill=(255, 255, 0))
    tiles.append(lab)

per = 6
for k in range(0, len(tiles), per):
    grp = tiles[k:k + per]
    sh = Image.new("RGB", (360 * 3, grp[0].height * ((len(grp) + 2) // 3)), (0, 0, 0))
    for i, tl in enumerate(grp):
        sh.paste(tl, ((i % 3) * 360, (i // 3) * tl.height))
    sh.save(f"{OUT}/prev_{k // per}.jpg", quality=90)
    print(f"prev_{k // per}.jpg")
