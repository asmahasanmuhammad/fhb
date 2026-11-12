const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.match.findMany({
  where: { status: 'LIVE' },
  select: { 
    id: true, 
    homeScore: true, 
    awayScore: true,
    minute: true,
    homeTeam: { select: { name: true } }, 
    awayTeam: { select: { name: true } }, 
    competition: { select: { name: true } } 
  },
  take: 15
}).then(r => { 
  r.forEach(m => console.log(m.homeTeam.name, m.homeScore, '-', m.awayScore, m.awayTeam.name, '|', m.competition.name, '| min:', m.minute)); 
  db.$disconnect(); 
  process.exit(0); 
}).catch(e => { console.error(e.message); process.exit(1); });
