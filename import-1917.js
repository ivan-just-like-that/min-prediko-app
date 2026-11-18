import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importBible() {
  // Pekar direkt på Hämtade filer (Downloads)
  const filePath = path.join(os.homedir(), 'Downloads', 'Swe1917.json');
  
  console.log(`Läser fil från: ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.error('Hittade inte Swe1917.json i Hämtade filer. Kontrollera att filnamnet exakt stämmer!');
    return;
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  let allVerses = [];

  for (const book of data.books) {
    const bookName = book.name; // T.ex. "Genesis", "Proverbs"
    
    for (const chapterObj of book.chapters) {
      const chapterNum = chapterObj.chapter;

      for (const verseObj of chapterObj.verses) {
        if (!verseObj.text || verseObj.text.trim() === '') continue;

        allVerses.push({
          book: bookName,
          chapter: chapterNum,
          verse: verseObj.verse,
          text: verseObj.text
        });
      }
    }
  }

  console.log(`Hittade totalt ${allVerses.length} verser. Laddar upp till Supabase...`);

  // Skicka upp i omgångar om 500 rader
  const batchSize = 500;
  for (let i = 0; i < allVerses.length; i += batchSize) {
    const batch = allVerses.slice(i, i + batchSize);
    const { error } = await supabase.from('swedish_verses').insert(batch);

    if (error) {
      console.error(`Fel vid batch ${i}-${i + batchSize}:`, error.message);
    } else {
      console.log(`Laddade upp rader ${i} till ${Math.min(i + batchSize, allVerses.length)}`);
    }
  }

  console.log('Import klar!');
}

importBible();