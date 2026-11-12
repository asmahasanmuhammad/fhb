const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";
const uploadedImgPath = path.join(ARTIFACT_DIR, '.user_uploaded/media_1794429538788_e42c9159.jpg');
const uploadedBase64 = fs.existsSync(uploadedImgPath) 
  ? `data:image/jpeg;base64,${fs.readFileSync(uploadedImgPath).toString('base64')}` 
  : '';

const fhbSvg = fs.readFileSync(path.join(__dirname, '../public/logos/concept-fhb-red.svg'), 'utf8');
const fbhSvg = fs.readFileSync(path.join(__dirname, '../public/logos/concept-fbh-red.svg'), 'utf8');
const fhbBadgeSvg = fs.readFileSync(path.join(__dirname, '../public/logos/concept-fhb-badge.svg'), 'utf8');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_logo_test_' + Date.now(),
    '--window-size=1560,1350',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9294/json/new', { method: 'PUT' });
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

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Logo Comparison</title>
  <style>
    body {
      background: #080C16;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 40px 48px;
      margin: 0;
    }
    .header-area {
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    h1 {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.03em;
      margin: 0 0 8px 0;
      color: #F8FAFC;
    }
    p {
      color: #94A3B8;
      font-size: 15px;
      margin: 0;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-bottom: 36px;
    }
    .card {
      background: #0F1626;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      flex-direction: column;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tag {
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 6px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tag-rec {
      background: #10B981;
      color: #042F2E;
    }
    .tag-user {
      background: #EF4444;
      color: #FFFFFF;
    }
    .tag-alt {
      background: #3B82F6;
      color: #FFFFFF;
    }
    .card-desc {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 16px;
      line-height: 1.4;
      min-height: 38px;
    }
    .img-wrap {
      width: 100%;
      height: 180px;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #030712;
      border: 1px solid rgba(255,255,255,0.06);
      padding: 12px;
      box-sizing: border-box;
    }
    .img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }
    .img-wrap svg {
      width: 100%;
      height: 100%;
    }
    .nav-preview {
      background: #0F1626;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
    }
    .navbar-mock {
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      gap: 32px;
      margin-top: 14px;
    }
    .nav-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="header-area">
    <h1>FHB New Logo Concept Evaluation</h1>
    <p>সরাসরি তুলনা: আপনার দেওয়া রেফারেন্স কনসেপ্ট বনাম Football Hub Bangladesh-এর সঠিক অ্যাক্রোনিম (FHB ও FBH)।</p>
  </div>

  <div class="grid">
    <!-- 1. User Uploaded Reference -->
    <div class="card">
      <div class="card-title">
        <span>১. আপনার আপলোড করা ছবি</span>
        <span class="tag tag-user">User Upload</span>
      </div>
      <div class="card-desc">লাল ব্যাকগ্রাউন্ডে স্পিড-কাট ও স্ল্যান্টেড অ্যাথলেটিক টাইপোগ্রাফি (FBH)।</div>
      <div class="img-wrap">
        <img src="${uploadedBase64}" />
      </div>
    </div>

    <!-- 2. Option A: FHB (Recommended) -->
    <div class="card" style="border-color: rgba(16,185,129,0.3); background: #0c1c22;">
      <div class="card-title">
        <span>২. কনসেপ্ট A: FHB (সুপারিশকৃত)</span>
        <span class="tag tag-rec">Recommended</span>
      </div>
      <div class="card-desc">একই স্পিড-কাট ও স্ল্যান্ট স্টাইল, তবে ব্র্যান্ডের পূর্ণ নাম <b>Football Hub Bangladesh (FHB)</b> অনুযায়ী।</div>
      <div class="img-wrap">
        ${fhbSvg}
      </div>
    </div>

    <!-- 3. Option B: FBH -->
    <div class="card">
      <div class="card-title">
        <span>৩. কনসেপ্ট B: FBH (হুবহু ছবি)</span>
        <span class="tag tag-alt">Exact Match</span>
      </div>
      <div class="card-desc">আপনার ছবির মতো হুবহু একই লেটারিং <b>Football Bangladesh Hub (FBH)</b> ভেক্টর ফরম্যাটে।</div>
      <div class="img-wrap">
        ${fbhSvg}
      </div>
    </div>
  </div>

  <div class="nav-preview">
    <div class="card-title">
      <span>লাইভ হেডার ও সাইট নেভিগেশন বার স্কেল টেস্ট</span>
      <span style="font-size: 12px; color: #10B981; font-weight: 600;">✓ রেজর শার্প ও পারফেক্ট রিডেবিলিটি</span>
    </div>
    <div class="card-desc">ওয়েবসাইটের বর্তমান ডার্ক থিম নেভবারে কম্প্যাক্ট ৩০px সাইজে কেমন ফুটে উঠবে:</div>
    <div class="navbar-mock">
      <!-- FHB Solid Red Badge -->
      <div>
        <div class="nav-label">Option A: Solid Red Badge</div>
        <div style="height: 34px; width: 88px; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #E10600; padding: 2px;">
          ${fhbSvg.replace('width="880" height="340"', 'width="100%" height="100%"').replace('<rect width="880" height="340" fill="#E10600" rx="16"/>', '')}
        </div>
      </div>

      <!-- FHB Transparent Vector Wordmark -->
      <div>
        <div class="nav-label">Option B: Transparent Vector + Wordmark</div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="height: 32px; width: 84px; display: flex; align-items: center; justify-content: center;">
            ${fhbBadgeSvg.replace('width="880" height="340"', 'width="100%" height="100%"')}
          </div>
          <div style="border-left: 1px solid rgba(255,255,255,0.15); padding-left: 10px;">
            <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.05em; line-height: 1.1;">FOOTBALL HUB</div>
            <div style="font-size: 9px; font-weight: 700; color: #EF4444; letter-spacing: 0.2em; text-transform: uppercase;">BANGLADESH</div>
          </div>
        </div>
      </div>

      <!-- Search mockup -->
      <div style="margin-left: auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 16px; font-size: 12px; color: #64748B; width: 220px;">
        Search teams, players...
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const tmpHtmlPath = path.join(ARTIFACT_DIR, 'logo_comparison.html');
    fs.writeFileSync(tmpHtmlPath, htmlContent);

    console.log("Navigating to logo comparison page...");
    await send('Page.navigate', { url: 'file:///' + tmpHtmlPath.replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 2000));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_logo_comparison.png'), Buffer.from(snap.data, 'base64'));
    console.log("Saved verified_logo_comparison.png");

    ws.close();
  } catch (err) {
    console.error("CDP Preview Error:", err);
  } finally {
    chrome.kill();
  }
}

main();
