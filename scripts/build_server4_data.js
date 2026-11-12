const fs = require('fs');
const https = require('https');

function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
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
      const group = groupMatch ? groupMatch[1] : 'Live Event Sports';
      
      name = name.replace(/^[0-9]+\.\s*/, '').trim();
      
      if (url && !url.startsWith('#')) {
        list.push({
          id: 's4_' + Math.random().toString(36).substring(2, 9),
          name,
          url,
          logo,
          group,
          category: group.includes('Sports') || name.includes('vs') || name.includes('Match') ? 'Sports' : 'Entertainment'
        });
      }
    }
  }
  return list;
}

async function run() {
  const raw = await fetchText('https://raw.githubusercontent.com/sanjoykb/-KB-TV-Playlist/refs/heads/main/Github%20Auto%20Update%20Channel.m3u');
  const list = parseM3U(raw);
  fs.writeFileSync('src/data/server4_channels.json', JSON.stringify(list, null, 2));
  console.log('Saved Server 4 channels:', list.length);
}

run();
