const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { posterPlan } = require('./poster_plan');

const PUBLIC_NEWS_DIR = path.join(__dirname, '..', 'public', 'news');
const TEMP_DIR = path.join(__dirname, '..', 'temp_posters_raw');

if (!fs.existsSync(PUBLIC_NEWS_DIR)) fs.mkdirSync(PUBLIC_NEWS_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function getWikiUrl(title) {
  try {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url|size&format=json';
    const res = await fetch(url, { headers: { 'User-Agent': 'FHBNewsEditor/1.0 (contact@footballhub.com.bd)' } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages || {};
    const p = Object.values(pages)[0];
    return p?.imageinfo?.[0]?.url || null;
  } catch (e) {
    return null;
  }
}

async function downloadBuffer(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FHB/1.0' } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log(`Processing ${posterPlan.length} posters...`);

  for (let i = 0; i < posterPlan.length; i++) {
    const item = posterPlan[i];
    const rawDest = path.join(TEMP_DIR, `raw_${item.id}.jpg`);
    console.log(`[${i + 1}/${posterPlan.length}] Fetching for ${item.id}...`);

    let buf = null;

    if (item.type === "wiki" && item.wikiFile) {
      const wikiUrl = await getWikiUrl(item.wikiFile);
      if (wikiUrl) {
        buf = await downloadBuffer(wikiUrl);
        if (buf && buf.length > 20000) {
          console.log(`  -> Got Wiki image from ${item.wikiFile} (${Math.round(buf.length / 1024)}KB)`);
        } else {
          buf = null;
        }
      }
      if (!buf && item.fallbackWiki) {
        const fbUrl = await getWikiUrl(item.fallbackWiki);
        if (fbUrl) {
          buf = await downloadBuffer(fbUrl);
          if (buf && buf.length > 20000) console.log(`  -> Got fallback Wiki (${Math.round(buf.length / 1024)}KB)`);
        }
      }
    }

    if (!buf && item.unsplashUrl) {
      buf = await downloadBuffer(item.unsplashUrl);
      if (buf && buf.length > 20000) {
        console.log(`  -> Got Unsplash image (${Math.round(buf.length / 1024)}KB)`);
      } else {
        buf = null;
      }
    }

    // Secondary fallback to reliable Unsplash football IDs if needed
    if (!buf) {
      console.warn(`  -> Primary failed for ${item.id}, using high-res fallback...`);
      const fallbackUrl = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=90";
      buf = await downloadBuffer(fallbackUrl);
    }

    if (buf) {
      fs.writeFileSync(rawDest, buf);
    } else {
      console.error(`  -> COMPLETELY FAILED for ${item.id}`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log("All raw images fetched! Now running Python image processor...");

  const pyScript = path.join(__dirname, 'process_news_posters.py');
  const res = spawnSync('python', [pyScript], { stdio: 'inherit' });
  if (res.error) console.error("Python processing error:", res.error);
}

main();
