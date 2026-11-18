import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Läs in .env.local explicit från projektets rot
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Kunde inte läsa in miljövariabler från .env.local!');
  console.log('URL:', supabaseUrl ? 'Hittades' : 'Saknas');
  console.log('Key:', supabaseKey ? 'Hittades' : 'Saknas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const downloadsDir = path.join(os.homedir(), 'Downloads');
const files = fs.readdirSync(downloadsDir);
const tvtmsFile = files.find(f => f.toUpperCase().includes('TVTMS') && f.endsWith('.txt'));

if (!tvtmsFile) {
  console.error('Hittade ingen TVTMS .txt-fil i Hämtade filer!');
  process.exit(1);
}

const filePath = path.join(downloadsDir, tvtmsFile);
console.log(`Läser TVTMS-fil: ${filePath}`);

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

function parseRef(refStr) {
  if (!refStr) return null;
  const clean = refStr.trim().replace('!', '.').replace(':', '.');
  const parts = clean.split('.');
  if (parts.length < 3) return null;
  
  const book = parts[0];
  const chapter = parseInt(parts[1], 10);
  const verseStr = parts[2];
  const verse = parseInt(verseStr, 10);

  if (isNaN(chapter) || isNaN(verse)) return null;

  return {
    book,
    chapter,
    verse,
    raw: clean
  };
}

let inExpandedSection = false;
const mappings = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.includes('2) EXPANDED VERSION') || line.includes('Expanded Version')) {
    inExpandedSection = true;
    continue;
  }

  if (line.startsWith('$')) {
    continue;
  }

  if (inExpandedSection && line.includes('\t')) {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length >= 3) {
      const stdCol = cols[1];
      const hebCol = cols[2];

      const stdRef = parseRef(stdCol);
      const hebRef = parseRef(hebCol);

      if (stdRef && hebRef && stdRef.raw !== hebRef.raw) {
        mappings.push({
          standard_ref: stdRef.raw,
          hebrew_ref: hebRef.raw,
          book: stdRef.book,
          chapter: stdRef.chapter,
          verse: stdRef.verse
        });
      }
    }
  }
}

// Filtrera bort dubbletter baserat på standard_ref för att förhindra konflikter vid upsert
const uniqueMappings = Array.from(
  new Map(mappings.map(m => [m.standard_ref, m])).values()
);

console.log(`Hittade ${mappings.length} totalt, varav ${uniqueMappings.length} unika avvikelser att importera till Supabase.`);

async function uploadMappings() {
  const batchSize = 500;
  for (let i = 0; i < uniqueMappings.length; i += batchSize) {
    const batch = uniqueMappings.slice(i, i + batchSize);
    const { error } = await supabase.from('versification_map').upsert(batch, { onConflict: 'standard_ref' });
    
    if (error) {
      console.error(`Fel vid uppladdning av batch ${i}:`, error.message);
    } else {
      console.log(`Laddade upp rader ${i} till ${Math.min(i + batchSize, uniqueMappings.length)}`);
    }
  }
  console.log('Importen till versification_map är klar!');
}

uploadMappings();