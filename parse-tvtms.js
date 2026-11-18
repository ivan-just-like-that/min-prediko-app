import fs from 'fs';
import path from 'path';
import os from 'os';

const downloadsDir = path.join(os.homedir(), 'Downloads');
const files = fs.readdirSync(downloadsDir);
const tvtmsFile = files.find(f => f.toUpperCase().includes('TVTMS') && f.endsWith('.txt'));

if (!tvtmsFile) {
  console.error('Hittade ingen TVTMS-fil!');
  process.exit(1);
}

const filePath = path.join(downloadsDir, tvtmsFile);
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Analyserar ${lines.length} rader...`);

let foundHeader = false;
let count = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Leta efter den utökade versionen eller rader som innehåller bokmönster med verser
  if (line.includes('2) EXPANDED VERSION') || line.includes('Expanded Version')) {
    foundHeader = true;
    console.log(`Hittade Expanded Version på rad ${i + 1}`);
    continue;
  }

  if (foundHeader && line.includes('\t') && (line.includes('Jer.') || line.includes('Psa.') || line.includes('Gen.'))) {
    console.log(`Exempelrad ${i + 1}:`, JSON.stringify(line.split('\t').slice(0, 8)));
    count++;
    if (count > 10) break;
  }
}

if (!foundHeader) {
  console.log('Söker efter rader med kolumner för Hebrew och English direkt...');
  let shown = 0;
  for (let i = 90; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('\t') && /\b(Gen|Exod|Lev|Num|Deut|Jos|Jdg|Rut|Sam|Kgs|Chr|Psa|Jer|Hos|Jon)\./i.test(line)) {
      console.log(`Rad ${i + 1}:`, JSON.stringify(line.split('\t').slice(0, 8)));
      shown++;
      if (shown >= 10) break;
    }
  }
}