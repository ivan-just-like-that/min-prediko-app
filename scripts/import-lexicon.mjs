import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const raw = await fs.readFile('./data/lexicon-merged.json', 'utf8');
  const rows = JSON.parse(raw);

  const batchSize = 250;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map((item) => ({
      strong_code: String(item.strong_code).trim(),
      language: item.language,
      lemma: item.lemma ?? null,
      transliteration: item.transliteration ?? null,
      short_definition: item.short_definition ?? null,
      root_and_cognates: item.root_and_cognates ?? null,
      cognate_codes: Array.isArray(item.cognate_codes) ? item.cognate_codes : null,
      deep_entry: item.deep_entry ?? null,
      parallel_passages: item.parallel_passages ?? null,
      occurrence_count: typeof item.occurrence_count === 'number' ? item.occurrence_count : null,
      source_notes: item.source_notes ?? null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('strongs_lexicon')
      .upsert(batch, { onConflict: 'strong_code' });

    if (error) {
      console.error('Fel vid import:', error.message);
      process.exit(1);
    }
  }

  console.log(`Klart! Importerade ${rows.length} poster till strongs_lexicon.`);
}

run();