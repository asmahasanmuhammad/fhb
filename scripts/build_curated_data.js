const fs = require('fs');

const raw = fs.readFileSync('scripts/combined_live_tv.m3u', 'utf8');

function normalizeCategory(g, name) {
  const combined = ((g || '') + ' ' + (name || '')).toLowerCase();
  if (['bangla', 'bangladesh', 'indian bangla', 'inbangla', 'bnagla', 'bd'].some(x => combined.includes(x))) return 'Bangla';
  if (combined.includes('sport') || combined.includes('cricket') || combined.includes('football') || combined.includes('willow') || combined.includes('fifa') || combined.includes('espn') || combined.includes('t sports')) return 'Sports';
  if (combined.includes('news')) return 'News';
  if (combined.includes('movie') || combined.includes('cinema')) return 'Movies';
  if (combined.includes('music') || combined.includes('song')) return 'Music';
  if (combined.includes('kid') || combined.includes('cartoon') || combined.includes('anime')) return 'Kids';
  if (combined.includes('islam') || combined.includes('quran') || combined.includes('makkah') || combined.includes('madina')) return 'Islamic';
  if (['entertainment', 'drama', 'series', 'ott'].some(x => combined.includes(x))) return 'Entertainment';
  if (['english', 'hindi', 'discovery', 'nat geo', 'history'].some(x => combined.includes(x))) return 'International';
  return 'Others';
}

function parseM3U(data) {
  const list = [];
  const lines = data.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const info = lines[i];
      const url = lines[i + 1] ? lines[i + 1].trim() : '';
      const nameMatch = info.match(/,(.+)$/);
      let name = nameMatch ? nameMatch[1].trim() : '';
      const logoMatch = info.match(/tvg-logo="(.*?)"/);
      const logo = logoMatch ? logoMatch[1] : '';
      const groupMatch = info.match(/group-title="(.*?)"/i);
      const group = groupMatch ? groupMatch[1] : 'Others';
      
      // Clean up common bad names
      name = name.replace(/^[0-9]+\.\s*/, '').trim();
      
      if (url && !url.startsWith('#')) {
        list.push({
          id: 'ch_' + Math.random().toString(36).substring(2, 9),
          name,
          url,
          logo,
          group,
          category: normalizeCategory(group, name),
        });
      }
    }
  }
  return list;
}

const parsed = parseM3U(raw);

// Manual top channels from Rakib TV
const manualServer1 = [
  {
    id: "tsports_hd",
    name: "T Sports HD",
    url: "https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/tracks-v1a1/mono.ts.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
    group: "Sports",
    category: "Sports"
  },
  {
    id: "tsports_isp",
    name: "T Sports ISP",
    url: "https://tvex.easypecker.com/TSportsHD_sf_bdix/tracks-v1a1/mono.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
    group: "Sports",
    category: "Sports"
  },
  {
    id: "willow_sports",
    name: "Willow TV Sports",
    url: "https://tvsen7.aynaott.com/rEBp38Ax/tracks-v1a1/mono.ts.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/willow-tv.png",
    group: "Sports",
    category: "Sports"
  },
  {
    id: "asports_hd",
    name: "A Sports HD",
    url: "https://tvsen6.aynaott.com/zv68oqPDu7MZZwmHhRxt/tracks-v1a1/mono.ts.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/a-sports.png",
    group: "Sports",
    category: "Sports"
  },
  {
    id: "btv_national",
    name: "BTV National",
    url: "https://tvsen6.aynaott.com/TjGR1GcxKetHNVcMVxbq/index.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/btv-national-2db28e10.png",
    group: "Bangla",
    category: "Bangla"
  },
  {
    id: "peacetv_bangla",
    name: "Peace TV Bangla",
    url: "https://dzkyvlfyge.erbvr.com/PeaceTvBangla/tracks-v3a1/mono.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/peace-tv-bangla.png",
    group: "Islam",
    category: "Islamic"
  }
];

// Deduplicate and combine
const all = [...manualServer1];
const seenUrls = new Set(manualServer1.map(c => c.url));
for (const ch of parsed) {
  if (!seenUrls.has(ch.url)) {
    seenUrls.add(ch.url);
    all.push(ch);
  }
}

if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data', { recursive: true });
}

fs.writeFileSync('src/data/curated_channels.json', JSON.stringify(all, null, 2));
console.log('Saved src/data/curated_channels.json with', all.length, 'channels!');
