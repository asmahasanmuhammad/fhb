#!/bin/bash
# QA screenshot pass v2 — reliable role-based navigation
mkdir -p /tmp/qa
B="agent-browser"

$B set viewport 1440 900 >/dev/null 2>&1
$B open http://localhost:3000 >/dev/null 2>&1
$B wait --load networkidle >/dev/null 2>&1
sleep 2.5
$B screenshot /tmp/qa/01-home.png --full >/dev/null 2>&1

nav() {
  $B find role button click --name "$1" >/dev/null 2>&1
  sleep 3
  $B wait --load networkidle >/dev/null 2>&1
  sleep 1
  $B screenshot "/tmp/qa/$2.png" --full >/dev/null 2>&1
  echo "captured $2"
}

nav "Live Scores" "02-scores"
nav "Live TV" "03-livetv"
nav "Tables" "04-standings"
nav "News" "05-news"
nav "Teams" "06-teams"
nav "Players" "07-players"
nav "Competitions" "08-competitions"
nav "Shorts" "09-shorts"
nav "Community" "10-community"
nav "Premium" "11-premium"
nav "Log In" "12-auth"

# match detail: go to scores, click a finished match
$B find role button click --name "Live Scores" >/dev/null 2>&1
sleep 3
$B find text "Match Centre" click >/dev/null 2>&1
sleep 3
$B screenshot /tmp/qa/13-matchdetail.png --full >/dev/null 2>&1
echo "captured 13-matchdetail"

# team detail
$B find role button click --name "Teams" >/dev/null 2>&1
sleep 3
$B find first "article button" click >/dev/null 2>&1 || $B find first "[data-team] button" click >/dev/null 2>&1 || $B eval "document.querySelectorAll('main button')[3]?.click()" >/dev/null 2>&1
sleep 3
$B screenshot /tmp/qa/14-teamdetail.png --full >/dev/null 2>&1
echo "captured 14-teamdetail"

echo "DONE"
