const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function verifyTactical() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9266',
    '--window-size=1600,1050',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9266/json/new', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(resolve => {
        const cur = id++;
        const h = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === cur) {
            ws.removeEventListener('message', h);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });
    }

    await send('Page.enable');

    // 1. Home page scroll to Tactical Pitch
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 880, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1500));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_home_psg.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_home_psg.png');

    // 2. Click a match to go to Match Detail View and check Lineups tab
    // Let's find a match ID from /api/matches
    const mRes = await fetch('http://localhost:3000/api/matches?limit=1');
    const mData = await mRes.json();
    const matchId = mData.data.matches[0].id;
    console.log('Testing match detail with id:', matchId);

    await send('Page.navigate', { url: `http://localhost:3000/?view=match-detail&id=${matchId}` });
    await new Promise(r => setTimeout(r, 3000));

    // Click "Lineups & Tactics" tab
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const lineupBtn = btns.find(b => b.textContent.includes('Lineups'));
        if (lineupBtn) lineupBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_match_detail.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_match_detail.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

verifyTactical().catch(console.error);
