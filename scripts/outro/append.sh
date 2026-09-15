#!/usr/bin/env bash
# Colle le générique de fin à la suite d'une vidéo, en l'adaptant à son format.
#
#   ./append.sh <video.mp4> [sortie.mp4]
#
# Le générique est mis à l'échelle et complété par des bandes noires si le
# format diffère, puis les deux plans sont réencodés d'un bloc (pas de risque
# de désynchro). Si la vidéo n'a pas de piste son, du silence est ajouté.
set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:?usage: append.sh <video.mp4> [sortie.mp4]}"
OUT="${2:-${SRC%.*}-outro.mp4}"
OUTRO="${OUTRO:-outro-mtl.mp4}"

read -r W H < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
                        -of csv=p=0 "$SRC" | tr ',' ' ')
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate \
              -of default=nw=1:nk=1 "$SRC")
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$SRC" | wc -l)

FIT="scale=$W:$H:force_original_aspect_ratio=decrease,pad=$W:$H:(ow-iw)/2:(oh-ih)/2:black"

if [ "$HAS_AUDIO" -gt 0 ]; then
  ffmpeg -v error -stats -y -i "$SRC" -i "$OUTRO" -filter_complex "\
[0:v]fps=$FPS,scale=$W:$H,setsar=1[v0];[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0];\
[1:v]fps=$FPS,$FIT,setsar=1[v1];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[a1];\
[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" \
    -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUT"
else
  ffmpeg -v error -stats -y -i "$SRC" -i "$OUTRO" \
    -f lavfi -t 0.1 -i anullsrc=r=48000:cl=stereo -filter_complex "\
[0:v]fps=$FPS,scale=$W:$H,setsar=1[v0];\
[2:a]aformat=sample_rates=48000:channel_layouts=stereo,apad[asil];\
[1:v]fps=$FPS,$FIT,setsar=1[v1];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[a1];\
[v0][asil][v1][a1]concat=n=2:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -shortest \
    -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUT"
fi
echo "→ $OUT"
