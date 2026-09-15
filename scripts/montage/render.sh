#!/usr/bin/env bash
# Rendu du discours augmenté de Mark Carney (Ottawa, 27 mars 2025) : incruste
# les cartes, les sous-titres animés et la carte finale dans le fichier vidéo.
#
#   ./scripts/montage/render.sh <source.mp4> [sortie.mp4]
#
# Dépendances : ffmpeg, python3. Les photos d'archive (Wikimedia Commons) sont
# téléchargées au premier lancement.
set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:?usage: render.sh <source.mp4> [sortie.mp4]}"
OUT="${2:-../../public/videos/carney-2025-03-27-monte.mp4}"
UA="montreal-uncovered/1.0 (editorial use)"

mkdir -p photos
fetch() { [ -s "photos/$1" ] || curl -sfL -A "$UA" -o "photos/$1" "$2"; }
fetch bretton.jpg "https://upload.wikimedia.org/wikipedia/commons/9/9d/Morgenthau_Bretton_Woods_opening_1944.jpg"
fetch pont.jpg    "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ambassador_Bridge_Between_Detroit%2C_Michigan_and_Windsor%2C_Ontario_%2814180773736%29.jpg"
fetch lesage.jpg  "https://upload.wikimedia.org/wikipedia/commons/4/45/Jean_Lesage.jpg"

[ -d venv ] || { python3 -m venv venv; ./venv/bin/pip install --quiet Pillow; }

# Zoom numérique très lent (1,00 → 1,035) puis resserrement sur la chute.
Z="(1+0.035*min(t/43\,1)+0.05*max(0\,min((t-52)/12\,1)))"
FG="[0:v]fps=30,tpad=stop_mode=clone:stop_duration=3,\
crop=w='2*floor(iw/$Z/2)':h='2*floor(ih/$Z/2)':x='(iw-ow)/2':y='(ih-oh)/2',\
scale=1280:720,setsar=1[base];[base][1:v]overlay=0:0:format=auto[v];[0:a]apad=whole_dur=69[a]"

./venv/bin/python overlay.py \
| ffmpeg -v error -y -i "$SRC" \
    -f rawvideo -pixel_format rgba -video_size 1280x720 -framerate 30 -i - \
    -filter_complex "$FG" -map "[v]" -map "[a]" -t 69 \
    -c:v libx264 -crf 19 -preset slow -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUT"
echo "→ $OUT"
