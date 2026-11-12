const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Saknar Supabase URL eller nyckel i miljön!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const files = [
  'TAHOT-Gen-Deu.txt',
  'TAHOT-Jos-Est.txt',
  'TAHOT-Job-Sng.txt',
  'TAHOT-Isa-Mal.txt'
];

async function processFile(filePath) {
  console.log(`\n📂 Parsar och importerar: ${path.basename(filePath)}...`);
  
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let totalImported = 0;
  const BATCH_SIZE = 500;

  for await (const line of rl) {
    // TAHOT ord-rader slutar på '=L' i första kolumnen (t.ex. Gen.1.2#01=L)
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('\t');
    const rawRef = parts[0] || '';

    // Vi vill enbart ha rader som är på ordnivå och innehåller '=L'
    if (!rawRef.includes('=L')) continue;

    const reference = rawRef.replace('=L', ''); // t.ex. Gen.1.2#01
    const [bookAndChapter] = reference.split('#'); // t.ex. Gen.1.2

    const hebrew = parts[1] || '';
    const transliteration = parts[2] || '';
    const translation = parts[3] || '';
    const strongs = parts[4] || '';
    const grammar = parts[5] || '';
    const expanded_tags = parts[10] || parts[9] || ''; // Fångar upp expanded tags om de finns längre ut

    batch.push({
      reference,
      book: bookAndChapter ? bookAndChapter.split('.')[0] : '',
      chapter_verse: bookAndChapter ? bookAndChapter.split('.').slice(1).join('.') : '',
      hebrew,
      transliteration,
      translation,
      strongs,
      grammar,
      expanded_tags
    });

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      totalImported += batch.length;
      process.stdout.write(`\r   Importerat ${totalImported} ord...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
    totalImported += batch.length;
  }

  console.log(`\n✅ Klar med ${path.basename(filePath)}! Totalt ${totalImported} ord inlagda.`);
}

async function insertBatch(batch) {
  const { error } = await supabase.from('hebrew_verses').insert(batch);
  if (error) {
    console.error('\n❌ Fel vid insättning till Supabase:', error.message);
  }
}

async function runImport() {
  console.log('🚀 Startar fullständig TAHOT-import...');
  
  for (const file of files) {
    const fullPath = path.join(__dirname, '../data', file);
    if (fs.existsSync(fullPath)) {
      await processFile(fullPath);
    } else {
      console.log(`⚠️ Hittade inte filen: ${fullPath}`);
    }
  }
  
  console.log('\n🎉 All TAHOT-data är nu importerad till Supabase!');
}

runImport();