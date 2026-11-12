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
const STRONGS_DICT_URL = 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'hebrew-bible.json');

async function testAndBuild() {
  console.log('Laddar ner Strongs-lexikon...');
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
    }
  } catch (err) {
    console.error('Lexikonfel:', err);
  }

  const completeBible = {};

  for (const book of BOOKS) {
    const url = `${BASE_URL}/${book.xml}.xml`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`❌ FEL: Kunde inte hämta ${book.id} från ${url} (Status: ${res.status})`);
      continue;
    }

    const xmlText = await res.text();
    completeBible[book.id] = {};

    // Stöd för både standard <chapter> och osisID-format i WLC
    const chapterRegex = /<chapter\b([^>]*)>([\s\S]*?)<\/chapter>/g;
    let chapterMatch;
    let chapterCount = 0;

    while ((chapterMatch = chapterRegex.exec(xmlText)) !== null) {
      const attrs = chapterMatch[1];
      const chapterContent = chapterMatch[2];
      
      const osisMatch = attrs.match(/osisID="[^.]+\.(\d+)"/) || attrs.match(/n="(\d+)"/);
      const chapterNum = osisMatch ? Number(osisMatch[1]) : (++chapterCount);
      
      completeBible[book.id][chapterNum] = {};

      const verseRegex = /<verse\b([^>]*)>([\s\S]*?)<\/verse>/g;
      let verseMatch;
      let verseCount = 0;

      while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
        const verseAttrs = verseMatch[1];
        const verseContent = verseMatch[2];

        const verseOsisMatch = verseAttrs.match(/osisID="[^.]+\.\d+\.(\d+)"/) || verseAttrs.match(/n="(\d+)"/);
        const verseNum = verseOsisMatch ? Number(verseOsisMatch[1]) : (++verseCount);

        const words = [];
        const wordRegex = /<w\b([^>]*)>([^<]+)<\/w>/g;
        let wordMatch;
        let wordIndex = 0;

        while ((wordMatch = wordRegex.exec(verseContent)) !== null) {
          const wAttrs = wordMatch[1];
          const hebrewText = wordMatch[2].replace(/\//g, '').trim();

          const lemmaMatch = wAttrs.match(/lemma="([^"]+)"/);
          const morphMatch = wAttrs.match(/morph="([^"]+)"/);

          let strongs = '';
          if (lemmaMatch) {
            const numMatch = lemmaMatch[1].match(/(\d+)/);
            if (numMatch) strongs = `H${numMatch[1]}`;
          }

          let gloss = '';
          if (strongs && strongsDict[strongs]) {
            gloss = strongsDict[strongs];
          } else if (lemmaMatch) {
            gloss = lemmaMatch[1].replace(/[\/\d]/g, '').trim();
          }

          if (!gloss || gloss.length <= 1) gloss = strongs || 'ord';

          words.push({
            id: wordIndex++,
            hebrew: hebrewText,
            strongs,
            morph: morphMatch ? morphMatch[1] : '',
            gloss
          });
        }

        completeBible[book.id][chapterNum][verseNum] = words;
      }
    }

    const totalChapters = Object.keys(completeBible[book.id]).length;
    console.log(`✓ ${book.id}: ${totalChapters} kapitel inlästa.`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(completeBible));
  console.log(`\n🎉 Klart! Sparade komplett bibel till ${OUTPUT_FILE}`);
}

testAndBuild();