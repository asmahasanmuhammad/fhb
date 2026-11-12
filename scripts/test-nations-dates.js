async function testNationsLeagueDates() {
  const dates = ['20261112', '20261113', '20261114', '20261115', '20261116', '20261117'];
  for (const d of dates) {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.nations/scoreboard?dates=${d}`);
    const data = await res.json();
    console.log(`Date: ${d} | Matches: ${data.events?.length || 0}`);
    if (data.events?.length > 0) {
      data.events.forEach(e => {
        console.log(`   ${e.date} | ${e.name} | [${e.status?.type?.detail}]`);
      });
    }
  }
}

testNationsLeagueDates();
