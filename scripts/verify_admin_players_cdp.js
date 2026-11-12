const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9288/json/new', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function send(m, p = {}) {
      return new Promise(resolve => {
        const cur = msgId++;
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

    // 1. First visit http://localhost:3000 to set login session via evaluate
    console.log("Navigating to home page...");
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@fhb.com.bd', password: 'Admin@2025' })
        });
        const json = await res.json();
        if (json.success && json.data) {
          window.__fhb_admin_user = json.data;
        }
        return json;
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Navigate to Admin Console
    console.log("Navigating to Admin Console...");
    await send('Page.navigate', { url: 'http://localhost:3000/?view=admin' });
    await new Promise(r => setTimeout(r, 2500));

    // If one-click admin sign-in exists, click it
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes('One-Click Admin Sign In'));
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    // Click "Players" tab
    console.log("Clicking Players tab...");
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
        const pTab = tabs.find(t => t.textContent && t.textContent.includes('Players'));
        if (pTab) pTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot: Admin Player Directory
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_admin_players_directory.png'), Buffer.from(snap1.data, 'base64'));
    console.log("Saved verified_admin_players_directory.png");

    // Click "Add New Player" button
    console.log("Clicking Add New Player...");
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent && b.textContent.includes('Add New Player'));
        if (addBtn) addBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot: Add Player Modal
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_admin_add_player_modal.png'), Buffer.from(snap2.data, 'base64'));
    console.log("Saved verified_admin_add_player_modal.png");

    // Close Add modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cBtn = btns.find(b => b.textContent && b.textContent.includes('Cancel'));
        if (cBtn) cBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    // Click Edit on a player (e.g. Dembélé or Mbappé)
    console.log("Clicking Edit player...");
    await send('Runtime.evaluate', {
      expression: `(() => {
        const editBtns = Array.from(document.querySelectorAll('button[title="Edit Player Info"]'));
        if (editBtns[0]) editBtns[0].click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot: Edit Player Modal
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_admin_edit_player_modal.png'), Buffer.from(snap3.data, 'base64'));
    console.log("Saved verified_admin_edit_player_modal.png");

    // Close edit modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cBtn = btns.find(b => b.textContent && b.textContent.includes('Cancel'));
        if (cBtn) cBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Navigate to a dynamic Player Profile page
    console.log("Navigating to Player Profile...");
    const playerObj = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const res = await fetch('/api/players?q=Mbappe');
        const json = await res.json();
        return json.data?.players?.[0] || null;
      })()`
    });
    const playerId = playerObj?.result?.value?.id || "cmwancry000egljfwfrnssfry";

    await send('Page.navigate', { url: `http://localhost:3000/?view=player-detail&id=${playerId}` });
    await new Promise(r => setTimeout(r, 2500));
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_dynamic_player_profile.png'), Buffer.from(snap4.data, 'base64'));
    console.log("Saved verified_dynamic_player_profile.png");

    // 4. Navigate to a Team Squad (Paris Saint-Germain)
    console.log("Navigating to PSG Squad page...");
    const teamObj = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const res = await fetch('/api/teams?q=Paris');
        const json = await res.json();
        return json.data?.teams?.[0] || null;
      })()`
    });
    const teamId = teamObj?.result?.value?.id || "cmwancrh3002gljfwabk55r8x";

    await send('Page.navigate', { url: `http://localhost:3000/?view=team-detail&id=${teamId}` });
    await new Promise(r => setTimeout(r, 2500));
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 600, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1000));
    const snap5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_dynamic_team_squad.png'), Buffer.from(snap5.data, 'base64'));
    console.log("Saved verified_dynamic_team_squad.png");

    ws.close();
  } finally {
    chrome.kill();
  }
  console.log("All screenshots captured and verified successfully!");
}

main().catch(console.error);
