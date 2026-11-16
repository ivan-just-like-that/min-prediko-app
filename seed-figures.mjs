import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Saknar Supabase-nycklar. Kontrollera din .env.local-fil!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedFigures() {
  const figuresDir = path.join(process.cwd(), 'data', 'figures');

  if (!fs.existsSync(figuresDir)) {
    console.error(`Hittade inte mappen ${figuresDir}. Skapa den och lägg in dina JSON-filer där.`);
    return;
  }

  const files = fs.readdirSync(figuresDir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.error("Inga .json-filer hittades i data/figures/!");
    return;
  }

  let allFigures = [];

for (const file of files) {
    const filePath = path.join(figuresDir, file);
    const rawData = fs.readFileSync(filePath, 'utf8').trim();

    // Hoppa över tomma filer som ännu inte fyllts på
    if (!rawData) {
      console.log(`Hoppar över tom fil: ${file}`);
      continue;
    }

    try {
      const parsed = JSON.parse(rawData);
      allFigures = allFigures.concat(parsed);
      console.log(`Läste in ${parsed.length} poster från ${file}`);
    } catch (err) {
      console.error(`JSON-fel i filen ${file}:`, err.message);
      return;
    }
  }

  // Kontrollera så att inga dubbla month_day råkat hamna i olika filer
  const seenDates = new Set();
  for (const fig of allFigures) {
    if (seenDates.has(fig.month_day)) {
      console.error(`VARNING: Dubblett hittad för datumet ${fig.month_day} (${fig.name})! Rätta detta innan uppladdning.`);
      return;
    }
    seenDates.add(fig.month_day);
  }

  console.log(`\nLaddar upp totalt ${allFigures.length} gestalter till Supabase...`);

  const { error } = await supabase
    .from('daily_figures')
    .upsert(allFigures, { onConflict: 'month_day' });

  if (error) {
    console.error('Fel vid uppladdning:', error.message);
  } else {
    console.log('Alla gestalter har laddats upp framgångsrikt!');
  }
}

seedFigures();