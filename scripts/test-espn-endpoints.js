async function testLeagues() {
  const leagues = [
    { id: 'uefa.nations', name: 'UEFA Nations League' },
    { id: 'fifa.worldq.conmebol', name: 'CONMEBOL WC Qualifiers' },
    { id: 'fifa.worldq.afc', name: 'AFC WC Qualifiers' },
    { id: 'fifa.worldq.caf', name: 'CAF WC Qualifiers' },
    { id: 'caf.nations_qual', name: 'AFCON Qualifiers' },
    { id: 'concacaf.nations.league', name: 'Concacaf Nations League' },
    { id: 'fifa.friendly', name: 'International Friendlies' },
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'LaLiga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'fra.1', name: 'Ligue 1' },
    { id: 'uefa.champions', name: 'UEFA Champions League' },
    { id: 'uefa.europa', name: 'UEFA Europa League' },
    { id: 'esp.copa_del_rey', name: 'Copa del Rey' },
    { id: 'eng.fa', name: 'FA Cup' }
  ];

  for (const l of leagues) {
    try {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.id}/scoreboard`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[VALID] ${l.id.padEnd(25)} | ${l.name.padEnd(25)} | events: ${data.events?.length ?? 0}`);
        if (data.events?.length > 0) {
          const sample = data.events[0];
          console.log(`         Sample: ${sample.name} (${sample.date}) [${sample.status?.type?.detail}]`);
        }
      } else {
        console.log(`[HTTP ${res.status}] ${l.id} (${l.name})`);
      }
    } catch (e) {
      console.log(`[ERR] ${l.id}: ${e.message}`);
    }
  }
}

testLeagues();
