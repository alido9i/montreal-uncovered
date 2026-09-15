# -*- coding: utf-8 -*-
"""Planches de contrôle des bords : première et dernière image de chaque
incrustation (là où le texte arabe apparaît/disparaît en animation).

    ./venv/bin/python edges.py <source.mp4> <dossier_sortie>
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
import subs

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
LOGO = "delogo=x=82:y=198:w=110:h=166"
FL = ImageFont.truetype(subs.BOLD, 20)


def compose(t):
    p = f"{OUT}/b_{t:.2f}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", SRC,
                    "-frames:v", "1", "-vf", LOGO, p, "-y"], check=True)
    im = Image.open(p).convert("RGBA")
    if subs.CARD_T[0] <= t < subs.CARD_T[1]:
        im = Image.alpha_composite(im, subs.card_layer(t))
    for (a, b), lay in subs.LAYERS:
        if a <= t < b:
            im = Image.alpha_composite(im, lay)
    os.remove(p)
    return im.convert("RGB")


tiles = []
for i, s in enumerate(subs.SUBS):
    a, b = s["t"]
    for tag, t in (("in", a + 0.10), ("out", b - 0.10)):
        y0 = max(0, min(s["rect"][1], 700) - 120)
        im = compose(t).crop((0, y0, 1080, min(1920, y0 + 1000))).resize((300, int(1000 * 300 / 1080)))
        lab = Image.new("RGB", (300, im.height + 26), (0, 60, 0))
        lab.paste(im, (0, 26))
        ImageDraw.Draw(lab).text((5, 3), f"#{i} {tag} {t:.2f}", font=FL, fill=(255, 255, 0))
        tiles.append(lab)

per = 8
for k in range(0, len(tiles), per):
    grp = tiles[k:k + per]
    sh = Image.new("RGB", (300 * 4, grp[0].height * ((len(grp) + 3) // 4)), (0, 0, 0))
    for i, tl in enumerate(grp):
        sh.paste(tl, ((i % 4) * 300, (i // 4) * tl.height))
    sh.save(f"{OUT}/edge_{k // per}.jpg", quality=88)
    print(f"edge_{k // per}.jpg")
