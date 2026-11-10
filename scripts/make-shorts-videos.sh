#!/bin/bash
# Turn football posters into 12s vertical Ken Burns videos for the Shorts feed.
set -e
cd /home/z/my-project/public/shorts

# (file, motion) — motion: zi = zoom in, zo = zoom out, pl = pan left→right
make_video() {
  local base="$1" motion="$2"
  local fps=25 dur=12 frames=$(( dur * fps ))
  case "$motion" in
    zi) VF="scale=2160:-2,zoompan=z='min(1+0.0012*on,1.36)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=720x1280:fps=$fps" ;;
    zo) VF="scale=2160:-2,zoompan=z='max(1.36-0.0012*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$frames:s=720x1280:fps=$fps" ;;
    pl) VF="scale=2160:-2,zoompan=z='1.22':x='(iw-iw/zoom)*(on/$frames)':y='ih/2-(ih/zoom/2)':d=$frames:s=720x1280:fps=$fps" ;;
  esac
  ffmpeg -y -loglevel error -loop 1 -i "${base}.png" \
    -vf "$VF" -t $dur \
    -c:v libx264 -pix_fmt yuv420p -preset medium -crf 24 -movflags +faststart \
    "${base}.mp4"
  echo "built ${base}.mp4 ($motion)"
}

make_video fk1 zi
make_video sg1 pl
make_video fans1 zo
make_video gk1 zi
make_video tr1 pl
make_video nt1 zo
make_video ce1 zi
make_video tq1 pl

# Web-optimized poster copies for thumbnails (480px wide)
for f in fk1 sg1 fans1 gk1 tr1 nt1 ce1 tq1; do
  ffmpeg -y -loglevel error -i "${f}.png" -vf scale=480:-2 "${f}-thumb.jpg"
done
ls -la *.mp4 *.jpg | head -20
