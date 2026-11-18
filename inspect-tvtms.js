import fs from 'fs';
import path from 'path';
import os from 'os';

const downloadsDir = path.join(os.homedir(), 'Downloads');
const files = fs.readdirSync(downloadsDir);
const tvtmsFile = files.find(f => f.toUpperCase().includes('TVTMS') && f.endsWith('.txt'));

if (!tvtmsFile) {
  console.error('Hittade ingen TVTMS .txt-fil i Hämtade filer!');
  process.exit(1);
}

const filePath = path.join(downloadsDir, tvtmsFile);
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Hitta första raden med en riktig bibelreferens (t.ex. Gen.1 eller Exod.21)
const firstDataIndex = lines.findIndex(line => /\b(Gen|Exod|Lev|Num|Deut|1Sam|Psa|Jer)\.\d+\.\d+/i.test(line));

if (firstDataIndex === -1) {
  console.log('Hittade inga bibelreferenser. Skriver ut rad 60-90:');
  lines.slice(60, 90).forEach((l, idx) => console.log(`Rad ${61 + idx}:`, JSON.stringify(l.split('\t').slice(0, 10))));
} else {
  // Skriv ut 5 rader före första dataraden (för att fånga rubrikerna) + 10 datarader
  const start = Math.max(0, firstDataIndex - 5);
  for (let i = start; i < Math.min(lines.length, firstDataIndex + 10); i++) {
    console.log(`Rad ${i + 1}:`, JSON.stringify(lines[i].split('\t').slice(0, 12)));
  }
}