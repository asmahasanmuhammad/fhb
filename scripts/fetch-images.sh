#!/bin/bash
# Fetch football images for FHB platform via z-ai image-search
cd /home/z/my-project/scripts/images

z-ai image-search -q "football stadium at night with floodlights packed crowd" --count 3 --gl us --no-rank > stadium.json 2>/dev/null &
P1=$!
z-ai image-search -q "soccer player kicking ball action shot during match" --count 3 --gl us --no-rank > action.json 2>/dev/null &
P2=$!
z-ai image-search -q "football fans celebrating with flags in stadium" --count 3 --gl us --no-rank > fans.json 2>/dev/null &
P3=$!
z-ai image-search -q "soccer ball on green grass pitch close up" --count 3 --gl us --no-rank > ball.json 2>/dev/null &
P4=$!
z-ai image-search -q "golden football trophy cup on pitch" --count 3 --gl us --no-rank > trophy.json 2>/dev/null &
P5=$!
z-ai image-search -q "goalkeeper diving save during football match" --count 3 --gl us --no-rank > goalkeeper.json 2>/dev/null &
P6=$!
z-ai image-search -q "soccer player celebrating goal with teammates" --count 3 --gl us --no-rank > celebrate.json 2>/dev/null &
P7=$!
z-ai image-search -q "football training session players drills" --count 3 --gl us --no-rank > training.json 2>/dev/null &
P8=$!
z-ai image-search -q "soccer player dribbling the ball in stadium" --count 3 --gl us --no-rank > dribble.json 2>/dev/null &
P9=$!
z-ai image-search -q "football coach tactics board team talk" --count 3 --gl us --no-rank > coach.json 2>/dev/null &
P10=$!

wait $P1 $P2 $P3 $P4 $P5 $P6 $P7 $P8 $P9 $P10
echo "=== DONE ==="
for f in *.json; do echo "$f: $(rg -c 'original_url' $f 2>/dev/null || echo 0) urls"; done
