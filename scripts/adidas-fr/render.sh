#!/usr/bin/env bash
# Version française du reportage Al Jazeera sur les excuses d'adidas :
#   - retrait du logo Al Jazeera (delogo + flou local fondu)
#   - recouvrement de chaque bloc de texte arabe et incrustation de sa traduction
#
#   ./render.sh <source.mp4> [sortie.mp4]
#
# Dépendances : ffmpeg, python3 (Pillow).
set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:?usage: render.sh <source.mp4> [sortie.mp4]}"
OUT="${2:-adidas-fr.mp4}"
LOGO="delogo=x=82:y=198:w=110:h=166"

[ -d venv ] || { python3 -m venv venv; ./venv/bin/pip install --quiet Pillow; }

# Masque fondu du patch logo : adoucit la trace laissée par delogo.
./venv/bin/python - <<'PY'
from PIL import Image, ImageDraw, ImageFilter
m = Image.new("L", (1080, 1920), 0)
ImageDraw.Draw(m).rounded_rectangle([86, 202, 194, 350], radius=40, fill=255)
m.filter(ImageFilter.GaussianBlur(22)).convert("RGB").save("logomask.png")
PY

./venv/bin/python subs.py \
| ffmpeg -v error -stats -y \
    -i "$SRC" \
    -f rawvideo -pixel_format rgba -video_size 1080x1920 -framerate 30 -i - \
    -i logomask.png \
    -filter_complex "\
[0:v]fps=30,$LOGO[d];\
[d]split[d1][d2];[d2]gblur=sigma=10[bl];[bl][2:v]alphamerge[blm];\
[d1][blm]overlay=0:0[base];\
[base][1:v]overlay=0:0:format=auto[v]" \
    -map "[v]" -map 0:a \
    -c:v libx264 -crf 19 -preset medium -profile:v high -pix_fmt yuv420p \
    -c:a copy -movflags +faststart "$OUT"
echo "→ $OUT"
