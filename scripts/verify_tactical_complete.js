const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testTacticalComplete() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9270',
    '--window-size=1600,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9270/json/new', { method: 'PUT' });
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

    // 1. Home page scroll to Tactical Pitch (22-Man H2H with real photos)
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3500));
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 860, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1200));

    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_22man_real_photos.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_22man_real_photos.png');

    // 2. Click Home (PSG 4-3-3 single team view)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const psgBtn = btns.find(b => b.textContent.includes('PSG') || b.textContent.includes('Paris'));
        if (psgBtn) psgBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_psg_433_single.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_psg_433_single.png');

    // 3. Click Away (Le Havre 4-2-3-1 single team view)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const leHavreBtn = btns.find(b => b.textContent.includes('Le Havre') || b.textContent.includes('HAC'));
        if (leHavreBtn) leHavreBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_lehavre_4231_single.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_lehavre_4231_single.png');

    // 4. Click a player to trigger Tactical Intelligence card
    await send('Runtime.evaluate', {
      expression: `(() => {
        const players = Array.from(document.querySelectorAll('.cursor-pointer'));
        const p = players.find(el => el.textContent.includes('Bayo') || el.textContent.includes('Operi'));
        if (p) p.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_tactical_player_intelligence.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_tactical_player_intelligence.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testTacticalComplete().catch(console.error);
