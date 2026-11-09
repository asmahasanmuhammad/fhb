#!/bin/bash
cd /home/z/my-project/scripts/images
z-ai image-search -q "soccer player kicking ball action shot during match" --count 3 --gl us --no-rank > action.json 2>&1 &
P1=$!
z-ai image-search -q "soccer ball on green grass pitch close up" --count 3 --gl us --no-rank > ball.json 2>&1 &
P2=$!
wait $P1 $P2
echo "batch1 done"
z-ai image-search -q "golden football trophy cup on pitch" --count 3 --gl us --no-rank > trophy.json 2>&1 &
P3=$!
z-ai image-search -q "goalkeeper diving save during football match" --count 3 --gl us --no-rank > goalkeeper.json 2>&1 &
P4=$!
wait $P3 $P4
echo "batch2 done"
z-ai image-search -q "football training session players drills" --count 3 --gl us --no-rank > training.json 2>&1 &
P5=$!
z-ai image-search -q "soccer player dribbling the ball in stadium" --count 3 --gl us --no-rank > dribble.json 2>&1 &
P6=$!
wait $P5 $P6
echo "batch3 done"
z-ai image-search -q "football coach tactics board team talk" --count 3 --gl us --no-rank > coach.json 2>&1
echo "batch4 done"
for f in *.json; do echo "$f: $(rg -c 'original_url' $f 2>/dev/null || echo 0) urls"; done
