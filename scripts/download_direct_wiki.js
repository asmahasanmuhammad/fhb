const fs = require('fs');
const path = require('path');

const directUrls = {
  "cmwal598f00awlj28l4ve0axq": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Bangladesh_Women%27s_Football_team_in_Dhaka_after_winning_the_SAFF_Championship_2024.jpg",
  "cmwancsj4017mljfw7kbnsplh": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Bangabandhu_National_Stadium_in_2022.03.jpg",
  "cmwal598d00aulj281w58c7ml": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Javier_Fern%C3%A1ndez_Cabrera_with_Bangladesh_in_2023.jpg",
  "cmwancsix017cljfweoafqh2x": "https://upload.wikimedia.org/wikipedia/commons/6/67/Bashundhara_Kings_Arena.jpg",
  "cmwal597o00amlj28dfmpjzp0": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Bashundhara_Kings_Arena_1.jpg",
  "cmwancsim016yljfwwrjmv3sc": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Paris_FC_-_RC_Lens_2017-12-08_Stade_Charl%C3%A9ty_Paris_1.jpg",
  "cmwancsj3017kljfwlmgy4kmd": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Hamza_Choudhury_24082024_%281%29.jpg",
  "cmwancsio0170ljfw8e3n39f0": "https://upload.wikimedia.org/wikipedia/commons/3/39/Camp_Nou%2C_La_Liga_match_%28Ank_Kumar%29_02.jpg",
  "cmwancsif016oljfwmazllje9": "https://upload.wikimedia.org/wikipedia/commons/1/14/Fulham_vs_Brighton_%26_Hove_Albion_24012026_%282%29.jpg"
};

async function downloadDirect() {
  for (const [id, url] of Object.entries(directUrls)) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FHBNews/1.0' } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const dest = path.join(__dirname, '..', 'temp_posters_raw', `raw_${id}.jpg`);
        fs.writeFileSync(dest, buf);
        console.log(`[OK] ${id} -> ${Math.round(buf.length / 1024)}KB`);
      } else {
        console.log(`[FAIL ${res.status}] ${id} -> ${url}`);
      }
    } catch (e) {
      console.log(`[ERR] ${id}: ${e.message}`);
    }
  }
}

downloadDirect();
