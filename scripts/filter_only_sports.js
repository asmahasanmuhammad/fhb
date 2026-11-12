const https = require('https');
const http = require('http');
const fs = require('fs');

const sources = {
  1: 'https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/refs/heads/main/Combined_Live_TV.m3u',
  2: 'https://raw.githubusercontent.com/shouravoo8/MyBd/refs/heads/main/tvchannelsnetwork.m3u',
  3: 'https://raw.githubusercontent.com/shidul100/Iptv/refs/heads/main/playlist.m3u',
  4: 'https://raw.githubusercontent.com/sanjoykb/-KB-TV-Playlist/refs/heads/main/Github%20Auto%20Update%20Channel.m3u',
  5: 'https://raw.githubusercontent.com/Rakib49/Rakibiptv/refs/heads/main/Rakib9july.m3u'
};

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function isSports(name, group) {
  const text = (name + ' ' + group).toLowerCase();
  // Filter out news, general, music, islamic, etc. even if they contain sports in some context
  if (text.includes('star news') || text.includes('sky news') || text.includes('autentic') || text.includes('history') || text.includes('comedy') || text.includes('movies') || text.includes('family movies') || text.includes('drama')) {
    return false;
  }
  return (
    text.includes('sport') ||
    text.includes('cricket') ||
    text.includes('football') ||
    text.includes('willow') ||
    text.includes('fifa') ||
    text.includes('espn') ||
    text.includes('t sports') ||
    text.includes('bein') ||
    text.includes('sony ten') ||
    text.includes('star sports') ||
    text.includes('ten sports') ||
    text.includes('ten cricket') ||
    text.includes('eurosport') ||
    text.includes('racing') ||
    text.includes('combat') ||
    text.includes('fight') ||
    text.includes('nhl') ||
    text.includes('pga') ||
    text.includes('rally') ||
    text.includes('wwe') ||
    text.includes('ufc') ||
    text.includes('vs ') ||
    text.includes(' vs') ||
    text.includes('match') ||
    text.includes('barcelona') ||
    text.includes('real madrid') ||
    text.includes('liverpool') ||
    text.includes('chelsea') ||
    text.includes('arsenal') ||
    text.includes('𝐬𝐩𝐨𝐫𝐭𝐬') ||
    group.toLowerCase().includes('sport') ||
    group.toLowerCase().includes('live event sports')
  );
}

function subCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('vs') || n.includes('match') || n.includes('barcelona') || n.includes('real madrid') || n.includes('arsenal') || n.includes('chelsea') || n.includes('liverpool')) {
    return 'Live Match';
  }
  if (n.includes('cricket') || n.includes('willow') || n.includes('ten cricket')) {
    return 'Cricket';
  }
  if (n.includes('football') || n.includes('fifa') || n.includes('real madrid tv') || n.includes('inter tv') || n.includes('bleav football')) {
    return 'Football';
  }
  if (n.includes('t sports') || n.includes('bangladesh') || n.includes('bd')) {
    return 'Bangladesh Sports';
  }
  return 'Sports Networks';
}

function parseSportsM3U(data, serverId) {
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
      const group = groupMatch ? groupMatch[1] : 'Sports';

      name = name.replace(/^[0-9]+\.\s*/, '').trim();

      if (url && !url.startsWith('#') && isSports(name, group)) {
        list.push({
          id: `sp_${serverId}_${list.length + 1}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          url,
          logo: logo || 'https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png',
          group: subCategory(name),
          category: 'Sports',
          subCat: subCategory(name)
        });
      }
    }
  }
  return list;
}

async function run() {
  const allSports = {};
  for (const [id, url] of Object.entries(sources)) {
    console.log(`Fetching Server ${id}...`);
    const txt = await fetchText(url);
    const sports = parseSportsM3U(txt, id);
    console.log(`Server ${id} sports count: ${sports.length}`);
    allSports[id] = sports;
  }

  // Pre-seed Server 1 with guaranteed curated sports channels
  const manualServer1Sports = [
    {
      id: "asports_hd",
      name: "A Sports HD",
      url: "https://tvsen6.aynaott.com/zv68oqPDu7MZZwmHhRxt/tracks-v1a1/mono.ts.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/a-sports.png",
      group: "Cricket & Football",
      category: "Sports",
      subCat: "Sports Networks"
    },
    {
      id: "tsports_hd",
      name: "T Sports HD",
      url: "https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/tracks-v1a1/mono.ts.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
      group: "Bangladesh Sports",
      category: "Sports",
      subCat: "Bangladesh Sports"
    },
    {
      id: "tsports_isp",
      name: "T Sports ISP",
      url: "https://tvex.easypecker.com/TSportsHD_sf_bdix/tracks-v1a1/mono.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
      group: "Bangladesh Sports",
      category: "Sports",
      subCat: "Bangladesh Sports"
    },
    {
      id: "willow_sports",
      name: "Willow TV Sports",
      url: "https://tvsen7.aynaott.com/rEBp38Ax/tracks-v1a1/mono.ts.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/willow-tv.png",
      group: "Cricket",
      category: "Sports",
      subCat: "Cricket"
    },
    {
      id: "realmadrid_tv",
      name: "Real Madrid TV",
      url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/real-madrid-tv.png",
      group: "Football",
      category: "Sports",
      subCat: "Football"
    },
    {
      id: "fifa_plus",
      name: "FIFA+",
      url: "https://4397879b.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWRlX0ZJRkFQbHVzR2VybWFuX0hMUw/playlist.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/fifa.png",
      group: "Football",
      category: "Sports",
      subCat: "Football"
    },
    {
      id: "bahrain_sports1",
      name: "Bahrain Sports 1",
      url: "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/bahrain-sports-1.png",
      group: "Sports Networks",
      category: "Sports",
      subCat: "Sports Networks"
    },
    {
      id: "redbull_tv",
      name: "Red Bull TV",
      url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8",
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/red-bull-tv.png",
      group: "Action Sports",
      category: "Sports",
      subCat: "Sports Networks"
    }
  ];

  // Merge server 1
  const s1Urls = new Set(manualServer1Sports.map(c => c.url));
  const s1Final = [...manualServer1Sports];
  for (const c of allSports[1]) {
    if (!s1Urls.has(c.url)) {
      s1Urls.add(c.url);
      s1Final.push(c);
    }
  }

  fs.writeFileSync('src/data/curated_sports.json', JSON.stringify(s1Final, null, 2));
  fs.writeFileSync('src/data/server4_sports.json', JSON.stringify(allSports[4], null, 2));
  fs.writeFileSync('src/data/all_sports.json', JSON.stringify(allSports, null, 2));
  console.log(`Saved curated_sports.json with ${s1Final.length} sports channels.`);
  console.log(`Saved server4_sports.json with ${allSports[4].length} sports channels.`);
}

run();
