const fs = require('fs');
const path = require('path');

const BOOKS = [
  { xml: 'Gen', id: 'Genesis' }, { xml: 'Exod', id: 'Exodus' }, { xml: 'Lev', id: 'Leviticus' },
  { xml: 'Num', id: 'Numbers' }, { xml: 'Deut', id: 'Deuteronomy' }, { xml: 'Josh', id: 'Joshua' },
  { xml: 'Judg', id: 'Domarboken' }, { xml: 'Ruth', id: 'Rut' }, { xml: '1Sam', id: '1Samuel' },
  { xml: '2Sam', id: '2Samuel' }, { xml: '1Kgs', id: '1Kungaboken' }, { xml: '2Kgs', id: '2Kungaboken' },
  { xml: '1Chr', id: '1Chronicles' }, { xml: '2Chr', id: '2Chronicles' }, { xml: 'Ezra', id: 'Esra' },
  { xml: 'Neh', id: 'Nehemja' }, { xml: 'Esth', id: 'Ester' }, { xml: 'Job', id: 'Job' },
  { xml: 'Ps', id: 'Psalms' }, { xml: 'Prov', id: 'Ordspråksboken' }, { xml: 'Eccl', id: 'Predikaren' },
  { xml: 'Song', id: 'Höga Visan' }, { xml: 'Isa', id: 'Jesaja' }, { xml: 'Jer', id: 'Jeremia' },
  { xml: 'Lam', id: 'Klagovisorna' }, { xml: 'Ezek', id: 'Hesekiel' }, { xml: 'Dan', id: 'Daniel' },
  { xml: 'Hos', id: 'Hosea' }, { xml: 'Joel', id: 'Joel' }, { xml: 'Amos', id: 'Amos' },
  { xml: 'Obad', id: 'Obadja' }, { xml: 'Jonah', id: 'Jona' }, { xml: 'Mic', id: 'Mika' },
  { xml: 'Nah', id: 'Nahum' }, { xml: 'Hab', id: 'Habackuk' }, { xml: 'Zeph', id: 'Sefanja' },
  { xml: 'Hag', id: 'Haggai' }, { xml: 'Zech', id: 'Sakarja' }, { xml: 'Mal', id: 'Malaki' }
];

const BASE_URL = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc';
const STRONGS_DICT_URL = 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'hebrew-bible.json');

async function buildSingleHebrewFile() {
  console.log('Laddar ner komplett Strongs-lexikon...');
  let strongsDict = {};

  try {
    const dictRes = await fetch(STRONGS_DICT_URL);
    if (dictRes.ok) {
      const rawDict = await dictRes.json();
      for (const [key, val] of Object.entries(rawDict)) {
        const cleanNum = key.replace(/[^0-9]/g, '');
        const strongsKey = `H${Number(cleanNum)}`;
        let glossText = val.gloss || val.definition || val.kjv_def || '';
        if (glossText) {
          glossText = glossText.replace(/<[^>]*>?/gm, '').split(';')[0].trim();
        }
        strongsDict[strongsKey] = glossText || strongsKey;
      }
      console.log(`✓ Hämtade ${Object.keys(strongsDict).length} Strongs-definitioner.`);
    }
  } catch (err) {
    console.error('Kunde inte hämta Strongs-lexikon:', err);
  }

  const completeBible = {};

  console.log('Hämtar och parsar alla böcker...');

  for (const book of BOOKS) {
    const url = `${BASE_URL}/${book.xml}.xml`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const xmlText = await res.text();
    completeBible[book.id] = {};

    const chapterRegex = /<chapter osisID="[^.]+\.(\d+)">([\s\S]*?)<\/chapter>/g;
    let chapterMatch;

    while ((chapterMatch = chapterRegex.exec(xmlText)) !== null) {
      const chapterNum = Number(chapterMatch[1]);
      const chapterContent = chapterMatch[2];
      completeBible[book.id][chapterNum] = {};

      const verseRegex = /<verse osisID="[^.]+\.\d+\.(\d+)">([\s\S]*?)<\/verse>/g;
      let verseMatch;

      while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
        const verseNum = Number(verseMatch[1]);
        const verseContent = verseMatch[2];
        const words = [];

        const wordRegex = /<w\b([^>]*)>([^<]+)<\/w>/g;
        let wordMatch;
        let wordIndex = 0;

        while ((wordMatch = wordRegex.exec(verseContent)) !== null) {
          const attrs = wordMatch[1];
          const hebrewText = wordMatch[2].replace(/\//g, '').trim();

          const lemmaMatch = attrs.match(/lemma="([^"]+)"/);
          const morphMatch = attrs.match(/morph="([^"]+)"/);

          let strongs = '';
          if (lemmaMatch) {
            const numMatch = lemmaMatch[1].match(/(\d+)/);
            if (numMatch) {
              strongs = `H${numMatch[1]}`;
            }
          }

          let gloss = '';
          if (strongs && strongsDict[strongs]) {
            gloss = strongsDict[strongs];
          } else if (lemmaMatch) {
            gloss = lemmaMatch[1].replace(/[\/\d]/g, '').trim();
          }

          if (!gloss || gloss.length <= 1) {
            gloss = strongs || 'ord';
          }

          words.push({
            id: wordIndex++,
            hebrew: hebrewText,
            strongs: strongs,
            morph: morphMatch ? morphMatch[1] : '',
            gloss: gloss
          });
        }

        completeBible[book.id][chapterNum][verseNum] = words;
      }
    }
    console.log(`✓ ${book.id} inläst.`);
  }

  // Skapa mappen om den inte finns
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(completeBible));
  console.log(`\n🎉 Klart! All data sparades till ${OUTPUT_FILE}`);
}

buildSingleHebrewFile();