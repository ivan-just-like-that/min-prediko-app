const fs = require('fs');
const path = require('path');

const parts = [
  { name: 'Gen-Deu', url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/b99716b0cddb648ddb95cc786a197180f2f97d48/Translators%20Amalgamated%20OT%2BNT/TAHOT%20Gen-Deu%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt' },
  { name: 'Jos-Est', url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/b99716b0cddb648ddb95cc786a197180f2f97d48/Translators%20Amalgamated%20OT%2BNT/TAHOT%20Jos-Est%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt' },
  { name: 'Job-Sng', url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/b99716b0cddb648ddb95cc786a197180f2f97d48/Translators%20Amalgamated%20OT%2BNT/TAHOT%20Job-Sng%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt' },
  { name: 'Isa-Mal', url: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/b99716b0cddb648ddb95cc786a197180f2f97d48/Translators%20Amalgamated%20OT%2BNT/TAHOT%20Isa-Mal%20-%20Translators%20Amalgamated%20Hebrew%20OT%20-%20STEPBible.org%20CC%20BY.txt' }
];

async function downloadAll() {
  const dir = path.join(__dirname, '../data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  for (const part of parts) {
    console.log(`Laddar ner ${part.name}...`);
    try {
      const res = await fetch(part.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      
      const filePath = path.join(dir, `TAHOT-${part.name}.txt`);
      fs.writeFileSync(filePath, text, 'utf8');
      console.log(`✅ Sparad: ${filePath} (${Math.round(text.length / 1024)} KB)`);
    } catch (err) {
      console.error(`❌ Misslyckades med ${part.name}:`, err.message);
    }
  }
}

downloadAll();