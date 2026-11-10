#!/bin/bash
# Find logo image files on Wikipedia pages for FHB demo-ad brands
declare -A PAGES=(
  [bkash]="BKash"
  [grameenphone]="Grameenphone"
  [daraz]="Daraz"
  [walton]="Walton Hi-Tech Industries"
  [pathao]="Pathao"
  [samsung]="Samsung"
  [pran]="PRAN-RFL Group"
  [chaldal]="Chaldal"
  [citybank]="The City Bank (Bangladesh)"
  [foodpanda]="Foodpanda"
  [bata]="Bata Shoes"
  [teer]="City Group"
)

for key in "${!PAGES[@]}"; do
  page="${PAGES[$key]}"
  echo "=== $key ($page) ==="
  curl -sL --max-time 15 "https://en.wikipedia.org/w/api.php?action=query&titles=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$page")&prop=images&format=json&imlimit=60" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
pages=d.get('query',{}).get('pages',{})
for p in pages.values():
    imgs=[i['title'] for i in p.get('images',[])]
    logos=[t for t in imgs if 'logo' in t.lower() or 'wordmark' in t.lower() or t.lower().endswith(('.svg','.png')) and key in t.lower()]
    for t in imgs:
        tl=t.lower()
        if any(w in tl for w in ['logo','wordmark','icon']):
            print(' LOGOFILE:', t)
"
done
