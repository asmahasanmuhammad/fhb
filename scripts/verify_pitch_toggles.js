const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testPitchToggles() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9273',
    '--window-size=1600,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9273/json/new', { method: 'PUT' });
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

    // 1. Home page
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3500));
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 880, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1200));

    // Click "PSG (4-3-3)" mode button specifically inside the pitch toolbar
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('PSG (4-3-3)'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_pitch_psg_433.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_pitch_psg_433.png');

    // Click "Le Havre (4-2-3-1)" mode button specifically inside the pitch toolbar
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Le Havre (4-2-3-1)'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_pitch_lehavre_4231.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_pitch_lehavre_4231.png');

    // Click a player to show Intelligence drawer
    await send('Runtime.evaluate', {
      expression: `(() => {
        const p = Array.from(document.querySelectorAll('.cursor-pointer')).find(el => el.textContent.includes('Bayo') || el.textContent.includes('Nego') || el.textContent.includes('Touré'));
        if (p) p.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_pitch_player_card.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_pitch_player_card.png');

    // 2. Visit Match Detail View and click "Lineups & Tactics" tab
    const mRes = await fetch('http://localhost:3000/api/matches?limit=1');
    const mData = await mRes.json();
    const matchId = mData.data.matches[0].id;
    await send('Page.navigate', { url: `http://localhost:3000/?view=match-detail&id=${matchId}` });
    await new Promise(r => setTimeout(r, 3000));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Lineups'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_match_detail_lineups_tab.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_match_detail_lineups_tab.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testPitchToggles().catch(console.error);
