#!/bin/bash
# VLM design critique of QA screenshots — parallel batches
OUT=/tmp/render/qa/critique
mkdir -p "$OUT"
PROMPT='You are a strict senior product designer reviewing a page of "Football Hub Bangladesh", a football media platform that must look as professional as FotMob/Sofascore/OneFootball/ESPN. Review this full-page screenshot honestly and concisely: (1) VERDICT: does it look professionally designed, or amateur/AI-generated? (2) DEFECTS: list concrete visual problems only if truly visible: misalignment, text overflow/cutoff, broken images, empty/broken areas, inconsistent spacing, illegible contrast, non-English or garbled text, duplicated blocks. (3) SCORE: rate professional polish out of 10. Format: VERDICT / DEFECTS / SCORE. Max 120 words.'

critique() {
  local f="$1"
  local name=$(basename "$f" .png)
  z-ai vision -p "$PROMPT" -i "$f" -o "$OUT/$name.json" 2>/dev/null && echo "OK $name" || echo "FAIL $name"
}

# Batch 1
for f in 01-home scores-day7 standings news; do critique "/tmp/render/qa/$f.png" & done
wait
# Batch 2
for f in teams players match-detail team-detail; do critique "/tmp/render/qa/$f.png" & done
wait
# Batch 3
for f in competition-detail shorts live-tv community-logged; do critique "/tmp/render/qa/$f.png" & done
wait
# Batch 4
for f in premium-logged auth earnings admin; do critique "/tmp/render/qa/$f.png" & done
wait
# Batch 5 (mobile)
for f in 01-home-mobile news-mobile shorts-mobile live-tv-mobile; do critique "/tmp/render/qa/$f.png" & done
wait
echo "ALL DONE"
