const fs = require('fs');
const path = require('path');

const PLAYERS_DIR = path.join(__dirname, '..', 'public', 'players');
if (!fs.existsSync(PLAYERS_DIR)) fs.mkdirSync(PLAYERS_DIR, { recursive: true });

const WIKI_PLAYERS = {
  // PSG
  'donnarumma.jpg': 'Gianluigi_Donnarumma',
  'hakimi.jpg': 'Achraf_Hakimi',
  'marquinhos.jpg': 'Marquinhos',
  'pacho.jpg': 'Willian_Pacho',
  'nuno_mendes.jpg': 'Nuno_Mendes_(footballer,_born_2002)',
  'vitinha.jpg': 'Vitinha_(footballer,_born_2000)',
  'zaire_emery.jpg': 'Warren_Za%C3%AFre-Emery',
  'fabian_ruiz.jpg': 'Fabi%C3%A1n_Ruiz',
  'barcola.jpg': 'Bradley_Barcola',
  'goncalo_ramos.jpg': 'Gon%C3%A7alo_Ramos',
  'dembele.jpg': 'Ousmane_Demb%C3%A9l%C3%A9',

  // Le Havre
  'desmas.jpg': 'Arthur_Desmas',
  'operi.jpg': 'Christopher_Operi',
  'lloris.jpg': 'Gautier_Lloris',
  'youte.jpg': '%C3%89tienne_Yout%C3%A9_Kinkou%C3%A9',
  'nego.jpg': 'Lo%C3%AFc_N%C3%A9go',
  'toure.jpg': 'Abdoulaye_Tour%C3%A9_(footballer)',
  'targhalline.jpg': 'Oussama_Targhalline',
  'kechta.jpg': 'Yassine_Kechta',
  'casimir.jpg': 'Josu%C3%A9_Casimir',
  'bayo.jpg': 'Mohamed_Bayo',
  'sabbi.jpg': 'Emmanuel_Sabbi',

  // Real Madrid
  'courtois.jpg': 'Thibaut_Courtois',
  'carvajal.jpg': 'Dani_Carvajal',
  'militao.jpg': '%C3%89der_Milit%C3%A3o',
  'rudiger.jpg': 'Antonio_R%C3%BCdiger',
  'mendy.jpg': 'Ferland_Mendy',
  'valverde.jpg': 'Federico_Valverde',
  'tchouameni.jpg': 'Aur%C3%A9lien_Tchouam%C3%A9ni',
  'rodrygo.jpg': 'Rodrygo',

  // Barcelona
  'ter_stegen.jpg': 'Marc-Andr%C3%A9_ter_Stegen',
  'kounde.jpg': 'Jules_Kound%C3%A9',
  'araujo.jpg': 'Ronald_Ara%C3%BAjo',
  'cubarsi.jpg': 'Pau_Cubars%C3%AD',
  'balde.jpg': 'Alejandro_Balde',
  'casado.jpg': 'Marc_Casad%C3%B3',
  'dani_olmo.jpg': 'Dani_Olmo',
  'lewandowski.jpg': 'Robert_Lewandowski',
  'raphinha.jpg': 'Raphinha',

  // Man City / Arsenal
  'de_bruyne.jpg': 'Kevin_De_Bruyne',
  'bernardo_silva.jpg': 'Bernardo_Silva',
  'gvardiol.jpg': 'Jo%C5%A1ko_Gvardiol',
  'ruben_dias.jpg': 'R%C3%BAben_Dias',
  'ederson.jpg': 'Ederson_(footballer,_born_1993)',
  'rice.jpg': 'Declan_Rice',
  'odegaard.jpg': 'Martin_%C3%98degaard',
  'saliba.jpg': 'William_Saliba',
  'havertz.jpg': 'Kai_Havertz',

  // Bangladesh & South Asia Stars
  'zico.jpg': 'Anisur_Rahman_Zico',
  'bishwanath_ghosh.jpg': 'Bishwanath_Ghosh_(footballer)',
  'rahmat_mia.jpg': 'Rahmat_Mia',
  'sohel_rana.jpg': 'Sohel_Rana_(footballer,_born_1995)',
  'rakib_hossain.jpg': 'Rakib_Hossain',
  'foysal_fahim.jpg': 'Foysal_Ahmed_Fahim',
  'diabate.jpg': 'Souleymane_Diabate_(Malian_footballer)',
  'robinho.jpg': 'Robinho_(footballer,_born_1995)',
  'shahinur.jpg': 'Topu_Barman', // fallback
};

async function downloadOne(filename, title) {
  const dest = path.join(PLAYERS_DIR, filename);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log(`Already exists: ${filename}`);
    return;
  }

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'FHB-DesignFetcher/1.0 (contact@fhb.com)' } });
    if (!res.ok) {
      console.warn(`Wiki page not found: ${title} (${res.status})`);
      return;
    }
    const data = await res.json();
    const imgUrl = data.thumbnail?.source;
    if (!imgUrl) {
      console.warn(`No thumbnail for: ${title}`);
      return;
    }

    const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'FHB-DesignFetcher/1.0' } });
    if (!imgRes.ok) {
      console.warn(`Failed image fetch: ${imgUrl}`);
      return;
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`Saved: ${filename} (${buf.length} bytes)`);
  } catch (err) {
    console.error(`Error downloading ${filename}:`, err.message);
  }
}

async function main() {
  for (const [file, title] of Object.entries(WIKI_PLAYERS)) {
    await downloadOne(file, title);
    await new Promise(r => setTimeout(r, 200)); // be nice to Wikimedia API
  }
  console.log('Download complete!');
}

main().catch(console.error);
