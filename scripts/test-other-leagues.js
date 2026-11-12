async function testOtherLeagues() {
  const leagues = ['concacaf.nations.league', 'caf.nations_qual', 'fifa.friendly'];
  const dates = ['20261112', '20261113', '20261114', '20261115', '20261116', '20261117'];
  
  for (const l of leagues) {
    console.log(`\n=== LEAGUE: ${l} ===`);
    for (const d of dates) {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/scoreboard?dates=${d}`);
      const data = await res.json();
      if (data.events?.length > 0) {
        console.log(`Date: ${d} | Matches: ${data.events.length}`);
        data.events.forEach(e => {
          console.log(`   ${e.date} | ${e.name} | [${e.status?.type?.detail}]`);
        });
      }
    }
  }
}

testOtherLeagues();
