const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RAW_DIR = path.join(__dirname, '..', 'temp_posters_raw');
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });

const FINAL_SOURCES = {
  "cmwancsis0176ljfw8il4v70e": "https://images.unsplash.com/photo-1516731415730-0c607149933a?w=1600&auto=format&fit=crop&q=90",
  "cmwancsj1017iljfw50iuxrfl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&auto=format&fit=crop&q=90",
  "cmwancsir0174ljfwsa79r3zu": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=90",
  "cmwancsig016qljfwkj6m28a1": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg/1280px-2023_07_31_arne_mueseler_00060-Verbessert-RR_%2853106651455%29.jpg",
  "cmwal597m00aklj28co16ekrn": "https://upload.wikimedia.org/wikipedia/commons/9/94/Hamza_Choudhury_24082024_%282%29.jpg",
  "cmwancsj6017oljfw76p19us9": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=90",
  "cmwancsid016mljfwpf37jxt7": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1600&auto=format&fit=crop&q=90",
  "cmwancsi6016iljfwi3fwg990": "https://upload.wikimedia.org/wikipedia/commons/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg",
  "cmwal597o00amlj28dfmpjzp0": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Bashundhara_Kings_Arena.jpg/1280px-Bashundhara_Kings_Arena.jpg",
  "cmwancsjb017uljfw1uzk7jcs": "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&auto=format&fit=crop&q=90",
  "cmwancsj3017kljfwlmgy4kmd": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Hamza_Choudhury_23082025_%28portrait%29.jpg/1280px-Hamza_Choudhury_23082025_%28portrait%29.jpg",
  "cmwancsiu0178ljfwuy1x8r48": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&auto=format&fit=crop&q=90",
  "cmwancsij016uljfwyeel4ayp": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=90",
  "cmwancsii016sljfwt3sh6uyu": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1600&auto=format&fit=crop&q=90",
  "cmwancsif016oljfwmazllje9": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=1600&auto=format&fit=crop&q=90",
  "cmwal597p00aolj2817zlt3qp": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1600&auto=format&fit=crop&q=90",
  "cmwancsj9017sljfwqkn6j0a3": "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1600&auto=format&fit=crop&q=90",
  "cmwancsip0172ljfwezkvayx1": "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=1600&auto=format&fit=crop&q=90",
  "cmwancsim016yljfwwrjmv3sc": "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?w=1600&auto=format&fit=crop&q=90",
  "cmwancsil016wljfw58uhu3cj": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=90",
  "cmwal598700aqlj28rrlgcbpk": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=90",
  "cmwancsjc017wljfws0ne91th": "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=1600&auto=format&fit=crop&q=90",
  "cmwancsiv017aljfw9hytsx2t": "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1600&auto=format&fit=crop&q=90",
  "cmwancsio0170ljfw8e3n39f0": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Camp_Nou_aerial.jpg/1280px-Camp_Nou_aerial.jpg",
  "cmwal598b00aslj282v41dbuv": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1600&auto=format&fit=crop&q=90",
  "cmwancsj7017qljfwnjrg8x4s": "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1600&auto=format&fit=crop&q=90",
  "cmwancsix017cljfweoafqh2x": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1600&auto=format&fit=crop&q=90",
  "cmwal598d00aulj281w58c7ml": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Javier_Fern%C3%A1ndez_Cabrera_with_Bangladesh_in_2023.jpg/1280px-Javier_Fern%C3%A1ndez_Cabrera_with_Bangladesh_in_2023.jpg",
  "cmwancsiz017eljfwq6uwojqd": "https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=1600&auto=format&fit=crop&q=90",
  "cmwal598f00awlj28l4ve0axq": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Bangladesh_Women%27s_Football_team_in_Dhaka_after_winning_the_SAFF_Championship_2024.jpg/1280px-Bangladesh_Women%27s_Football_team_in_Dhaka_after_winning_the_SAFF_Championship_2024.jpg",
  "cmwancsj0017gljfwc66gfb8j": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1600&auto=format&fit=crop&q=90",
  "cmwal598h00aylj28damawdvo": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=90",
  "cmwancsj4017mljfw7kbnsplh": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Bangladesh_National_Football_Stadium.jpg/1280px-Bangladesh_National_Football_Stadium.jpg",
  "cmwancsib016kljfwu4l0ybn5": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&auto=format&fit=crop&q=90"
};

async function main() {
  const ids = Object.keys(FINAL_SOURCES);
  console.log(`Downloading ${ids.length} high-res images...`);

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const url = FINAL_SOURCES[id];
    const dest = path.join(RAW_DIR, `raw_${id}.jpg`);

    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FHB/1.0' } });
      if (!res.ok) {
        console.error(`[FAIL ${res.status}] ${id} -> ${url}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`[${i + 1}/${ids.length}] Downloaded ${id} (${Math.round(buf.length / 1024)}KB)`);
    } catch (e) {
      console.error(`[ERR] ${id}: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log("Raw downloads done! Now running Python PIL processor...");
  const pyScript = path.join(__dirname, 'process_news_posters.py');
  spawnSync('python', [pyScript], { stdio: 'inherit' });
}

main();
