const fs = require('fs');
const path = require('path');

const BOOKS = [
  { xml: 'Gen', id: 'Genesis' }, { xml: 'Exod', id: 'Exodus' }, { xml: 'Lev', id: 'Leviticus' },
  { xml: 'Num', id: 'Numbers' }, { xml: 'Deut', id: 'Deuteronomy' }, { xml: 'Josh', id: 'Joshua' },
  { xml: 'Judg', id: 'Judges' }, { xml: 'Ruth', id: 'Ruth' }, { xml: '1Sam', id: '1Samuel' },
  { xml: '2Sam', id: '2Samuel' }, { xml: '1Kgs', id: '1Kings' }, { xml: '2Kgs', id: '2Kings' },
  { xml: '1Chr', id: '1Chronicles' }, { xml: '2Chr', id: '2Chronicles' }, { xml: 'Ezra', id: 'Ezra' },
  { xml: 'Neh', id: 'Nehemiah' }, { xml: 'Esth', id: 'Esther' }, { xml: 'Job', id: 'Job' },
  { xml: 'Ps', id: 'Psalms' }, { xml: 'Prov', id: 'Proverbs' }, { xml: 'Eccl', id: 'Ecclesiastes' },
  { xml: 'Song', id: 'SongOfSolomon' }, { xml: 'Isa', id: 'Isaiah' }, { xml: 'Jer', id: 'Jeremiah' },
  { xml: 'Lam', id: 'Lamentations' }, { xml: 'Ezek', id: 'Ezekiel' }, { xml: 'Dan', id: 'Daniel' },
  { xml: 'Hos', id: 'Hosea' }, { xml: 'Joel', id: 'Joel' }, { xml: 'Amos', id: 'Amos' },
  { xml: 'Obad', id: 'Obadiah' }, { xml: 'Jonah', id: 'Jonah' }, { xml: 'Mic', id: 'Micah' },
  { xml: 'Nah', id: 'Nahum' }, { xml: 'Hab', id: 'Habakkuk' }, { xml: 'Zeph', id: 'Zephaniah' },
  { xml: 'Hag', id: 'Haggai' }, { xml: 'Zech', id: 'Zechariah' }, { xml: 'Mal', id: 'Malachi' }
];

const BASE_URL = 'https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc';
// Officiell öppen Strongs-lexikonfil för hebreiska (Open Scriptures / STEPBible)
const STRONGS_DICT_URL = 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data', 'hebrew');

async function buildHebrewData() {
  console.log('Laddar ner komplett Strongs-lexikon...');
  let strongsDict = {};

  try {
    const dictRes = await fetch(STRONGS_DICT_URL);
    if (dictRes.ok) {
      const rawDict = await dictRes.json();
      // Bygg ett rent uppslagslexikon { H1: "father", H2: "perish", ... }
      for (const [key, val] of Object.entries(rawDict)) {
        // Rensa fram själva sifferdelen, ex "H0776" -> "H776"
        const cleanNum = key.replace(/[^0-9]/g, '');
        const strongsKey = `H${Number(cleanNum)}`;
        
        // Plocka ut bästa möjliga glosa (t.ex. 'lemma' eller 'definition')
        let glossText = val.gloss || val.definition || val.kjv_def || '';
        if (glossText) {
          // Ta bort onödig HTML eller långa utläggningar, behåll det kärnfulla
          glossText = glossText.replace(/<[^>]*>?/gm, '').split(';')[0].trim();
        }
        strongsDict[strongsKey] = glossText || strongsKey;
      }
      console.log(`✓ Hämtade ${Object.keys(strongsDict).length} Strongs-definitioner.`);
    } else {
      console.warn('Kunde inte hämta externa Strongs-lexikonet, använder fallback.');
    }
  } catch (err) {
    console.error('Fel vid hämtning av Strongs-lexikon:', err);
  }

  console.log('Startar generering av alla kapitel med inbakade glosor...');

  for (const book of BOOKS) {
    const url = `${BASE_URL}/${book.xml}.xml`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const xmlText = await res.text();
    const bookDir = path.join(OUTPUT_DIR, book.id);
    fs.mkdirSync(bookDir, { recursive: true });

    const chapterRegex = /<chapter osisID="[^.]+\.(\d+)">([\s\S]*?)<\/chapter>/g;
    let chapterMatch;

    while ((chapterMatch = chapterRegex.exec(xmlText)) !== null) {
      const chapterNum = Number(chapterMatch[1]);
      const chapterContent = chapterMatch[2];
      const versesData = {};

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

          // Hämta exakt glosa från vårt lexikon, annars lemma eller strongs-nummer
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

        versesData[verseNum] = words;
      }

      const filePath = path.join(bookDir, `${chapterNum}.json`);
      fs.writeFileSync(filePath, JSON.stringify(versesData));
    }
    console.log(`✓ ${book.id} klart.`);
  }
  console.log('\nAlla kapitelfiler har genererats med inbakade Strongs-glosor!');
}

buildHebrewData();