#!/bin/bash
# Search crest candidates for BD clubs + national teams, download to /tmp/crest-cands/
mkdir -p /tmp/crest-cands
cd /tmp/crest-cands

declare -A QUERIES=(
  ["arambagh"]="Arambagh Krira Sangha football club logo crest"
  ["argentina"]="Argentina national football team AFA logo crest"
  ["bangladesh"]="Bangladesh national football team BFF logo crest"
  ["police"]="Bangladesh Police Football Club logo crest"
  ["bashundhara"]="Bashundhara Kings football club logo crest"
  ["brothers"]="Brothers Union football club Dhaka logo crest"
  ["chattogram"]="Chattogram City football club logo"
  ["cityclub"]="City Club Dhaka football logo crest"
  ["abahani"]="Abahani Limited Dhaka football club logo crest"
  ["wanderers"]="Dhaka Wanderers football club logo"
  ["fakirerpool"]="Fakirerpool Young Men's Club football logo"
  ["fortis"]="Fortis Football Club Bangladesh logo"
  ["india"]="India national football team AIFF logo crest"
  ["maldives"]="Maldives national football team logo crest"
  ["mohammedan"]="Mohammedan Sporting Club Dhaka football logo crest"
  ["nepal"]="Nepal national football team ANFA logo crest"
  ["pwd"]="PWD Sports Club Bangladesh football logo"
  ["rahmatganj"]="Rahmatganj MFS football club logo crest"
  ["spain"]="Spain national football team RFEF logo crest"
)

for key in "${!QUERIES[@]}"; do
  if [ -f "$key.done" ]; then continue; fi
  echo "=== $key ==="
  z-ai image-search -q "${QUERIES[$key]}" --count 4 --no-rank --gl us -o "$key.json" 2>&1 | grep -E "(Got|error|fail)" || true
  touch "$key.done"
  sleep 1
done
echo "ALL DONE"
