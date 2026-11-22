import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCES_DIR = path.resolve('./data/sources');
const OUTPUT_FILE = path.resolve('./data/lexicon-merged.json');

function normalizeStrongCode(rawCode) {
  if (!rawCode) return null;
  const cleaned = String(rawCode).trim().replace(/^#/, '').replace(/,+$/, '');
  const match = cleaned.match(/^([GHgh])0*(\d+)([A-Za-z]*)$/);
  if (!match) return null;

  const prefix = match[1].toUpperCase();
  const digits = match[2].padStart(4, '0');
  const suffix = match[3] || '';
  return `${prefix}${digits}${suffix}`;
}

function inferLanguage(strongCode, explicitLang) {
  if (explicitLang === 'greek' || explicitLang === 'hebrew' || explicitLang === 'aramaic') {
    return explicitLang;
  }
  if (!strongCode) return 'greek';
  return strongCode.startsWith('G') ? 'greek' : 'hebrew';
}

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Gör HTML/LSJ/TBESG-text läsbar och bevarar information som ligger i title="..." på <a ...>-taggar.
 */
function stripHtmlToReadableText(htmlLike) {
  if (!htmlLike) return '';

  let text = String(htmlLike);

  // Bevara title-attribut på länkar (vanligt i TFLSJ) innan taggen tas bort
  text = text.replace(
    /<a\b[^>]*\btitle=(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_full, _q, titleText, innerText) => {
      const cleanTitle = decodeHtmlEntities(titleText).replace(/<[^>]+>/g, '').trim();
      const cleanInner = decodeHtmlEntities(innerText).replace(/<[^>]+>/g, '').trim();
      if (cleanTitle && cleanInner && !cleanTitle.includes(cleanInner)) {
        return `${cleanInner} [${cleanTitle}]`;
      }
      return cleanTitle || cleanInner;
    }
  );

  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?Level\d+>/gi, '\n')
    .replace(/<ref\b[^>]*>/gi, '')
    .replace(/<\/ref>/gi, '')
    .replace(/<[^>]+>/g, '');

  text = decodeHtmlEntities(text);

  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanInline(val) {
  if (val == null) return '';
  return stripHtmlToReadableText(val).replace(/\s+/g, ' ').trim();
}

function normalizeForCompare(str) {
  return String(str || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function mergeTextBlock(existing, incoming, label = '') {
  const nextClean = stripHtmlToReadableText(incoming);
  if (!nextClean) return existing || null;

  const currentClean = existing ? String(existing).trim() : '';
  if (!currentClean) {
    return label ? `${label}\n${nextClean}` : nextClean;
  }

  // Undvik att lägga till exakt samma text på nytt
  if (normalizeForCompare(currentClean).includes(normalizeForCompare(nextClean))) {
    return existing;
  }

  const formattedNext = label ? `${label}\n${nextClean}` : nextClean;
  return `${currentClean}\n\n---\n\n${formattedNext}`;
}

function extractCognateCodes(textOrArray) {
  if (Array.isArray(textOrArray)) {
    return Array.from(new Set(textOrArray.map(normalizeStrongCode).filter(Boolean)));
  }
  if (!textOrArray) return [];
  const matches = String(textOrArray).match(/\b[GHgh]0*\d+[A-Za-z]*\b/g) || [];
  return Array.from(new Set(matches.map(normalizeStrongCode).filter(Boolean)));
}

function extractGreekRootAndLinks(rawLexiconText, uStrong) {
  const plain = stripHtmlToReadableText(rawLexiconText);
  const parts = [];

  const hebMatch = plain.match(/\(Heb\.\s*([^)]+)\)/i);
  if (hebMatch) {
    parts.push(`Hebreisk motsvarighet: ${hebMatch[1].trim()}`);
  }

  const braceRefs = Array.from(
    new Set(
      (String(rawLexiconText || '').match(/\{([^}]+)\}/g) || [])
        .map((m) => cleanInline(m.slice(1, -1)))
        .filter(Boolean)
    )
  );
  if (braceRefs.length > 0) {
    parts.push(`LSJ-hänvisningar: ${braceRefs.join(', ')}`);
  }

  const normalizedU = normalizeStrongCode(uStrong);
  if (normalizedU && normalizedU.startsWith('H')) {
    parts.push(`Kopplad hebreisk kod: ${normalizedU}`);
  }

  return parts.length > 0 ? parts.join(' • ') : null;
}

function extractHebrewRootAndCognates(cleanMeaning, uStrong, morph) {
  const parts = [];
  const lines = cleanMeaning.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (/^(Aramaic\s+(of|equivalent)|Also\s+means|Combined\s+with)/i.test(line)) {
      parts.push(line);
    }
  }

  const stemMatches = Array.from(
    new Set(
      cleanMeaning.match(
        /\b(Qal|Niphal|Piel|Pual|Hithpael|Hiphil|Hophal|Pe'al|P'al|Pa'el|Ethpaal|Aphel|Haphel|Hithpe'el|Ishtaphel)\b/g
      ) || []
    )
  );
  if (stemMatches.length > 0) {
    parts.push(`Stammar/konjugationer: ${stemMatches.join(', ')}`);
  }

  const normalizedU = normalizeStrongCode(uStrong);
  if (normalizedU) {
    parts.push(`Utökad kod: ${normalizedU}`);
  }

  if (morph) {
    parts.push(`Morfologi: ${morph}`);
  }

  return parts.length > 0 ? parts.join(' • ') : null;
}

function createEmptyEntry(strongCode, language) {
  return {
    strong_code: strongCode,
    language,
    lemma: null,
    transliteration: null,
    short_definition: null,
    root_and_cognates: null,
    cognate_codes: [],
    deep_entry: null,
    parallel_passages: null,
    occurrence_count: null,
    source_notes: null,
  };
}

function mergeEntry(map, strongCode, partial, sourceName) {
  const normalizedCode = normalizeStrongCode(strongCode);
  if (!normalizedCode) return;

  const lang = inferLanguage(normalizedCode, partial.language);
  if (!map.has(normalizedCode)) {
    map.set(normalizedCode, createEmptyEntry(normalizedCode, lang));
  }

  const entry = map.get(normalizedCode);

  if (partial.language === 'aramaic') {
    entry.language = 'aramaic';
  } else if (!entry.language && lang) {
    entry.language = lang;
  }

  const lemmaClean = cleanInline(partial.lemma);
  if (lemmaClean && (!entry.lemma || lemmaClean.length > entry.lemma.length)) {
    entry.lemma = lemmaClean;
  }

  const translitClean = cleanInline(partial.transliteration);
  if (translitClean && (!entry.transliteration || translitClean.length > entry.transliteration.length)) {
    entry.transliteration = translitClean;
  }

  const shortDefClean = cleanInline(partial.short_definition);
  if (shortDefClean) {
    if (!entry.short_definition) {
      entry.short_definition = shortDefClean;
    } else if (!normalizeForCompare(entry.short_definition).includes(normalizeForCompare(shortDefClean))) {
      entry.short_definition = `${entry.short_definition} — ${shortDefClean}`;
    }
  }

  if (partial.root_and_cognates) {
    entry.root_and_cognates = mergeTextBlock(entry.root_and_cognates, partial.root_and_cognates);
  }

  const foundCognates = extractCognateCodes(
    partial.cognate_codes ||
      `${partial.uStrong || ''} ${partial.root_and_cognates || ''} ${partial.deep_entry || ''}`
  );
  if (foundCognates.length > 0) {
    entry.cognate_codes = Array.from(new Set([...entry.cognate_codes, ...foundCognates]));
  }

  if (partial.deep_entry) {
    entry.deep_entry = mergeTextBlock(entry.deep_entry, partial.deep_entry, partial.deep_label || '');
  }

  if (partial.parallel_passages) {
    entry.parallel_passages = mergeTextBlock(entry.parallel_passages, partial.parallel_passages);
  }

  if (typeof partial.occurrence_count === 'number' && !Number.isNaN(partial.occurrence_count)) {
    if (entry.occurrence_count == null || partial.occurrence_count > entry.occurrence_count) {
      entry.occurrence_count = partial.occurrence_count;
    }
  }

  if (sourceName) {
    const existingSources = entry.source_notes ? entry.source_notes.split(', ') : [];
    if (!existingSources.includes(sourceName)) {
      existingSources.push(sourceName);
      entry.source_notes = existingSources.join(', ');
    }
  }
}

async function processFile(filePath, map) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');

  if (ext === '.json') {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed)
      ? parsed
      : Object.entries(parsed).map(([k, v]) => ({
          strong_code: k,
          ...(typeof v === 'object' && v !== null ? v : { short_definition: String(v) }),
        }));

    for (const item of items) {
      const code = item.strong_code || item.strongs || item.code || item.id;
      mergeEntry(map, code, item, fileName);
    }
    return;
  }

  const lines = raw.split(/\r?\n/);
  let mode = 'generic';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || /^=+$/.test(trimmed)) continue;

    if (trimmed.includes('eStrong') && trimmed.includes('dStrong') && trimmed.includes('uStrong')) {
      if (trimmed.includes('LSJ Meaning') || /TFLSJ/i.test(fileName)) {
        mode = 'tflsj';
      } else if (trimmed.includes('Hebrew') || trimmed.includes('Meaning') || /TBESH/i.test(fileName)) {
        mode = 'tbesh';
      } else {
        mode = 'tbesg';
      }
      continue;
    }

    const cols = line.split('\t').map((c) => c.trim());

    if (mode === 'tbesg' && cols.length >= 7) {
      const eStrong = cols[0];
      const uStrong = cols[2];
      const greek = cols[3];
      const translit = cols[4];
      const gloss = cols[6];
      const fullLexiconRaw = cols.slice(7).join('\t');
      const fullLexiconClean = stripHtmlToReadableText(fullLexiconRaw);
      const rootHint = extractGreekRootAndLinks(fullLexiconRaw, uStrong);

      const firstLine = cleanInline(fullLexiconClean.split('\n')[0] || '');
      const shortDef =
        gloss && firstLine && !normalizeForCompare(firstLine).startsWith(normalizeForCompare(gloss))
          ? `${gloss} — ${firstLine.slice(0, 180)}`
          : gloss || firstLine.slice(0, 180);

      mergeEntry(
        map,
        eStrong,
        {
          language: 'greek',
          uStrong,
          lemma: greek,
          transliteration: translit,
          short_definition: shortDef,
          root_and_cognates: rootHint,
          deep_entry: fullLexiconClean,
          deep_label: 'Abbott-Smith / STEPBible (TBESG)',
        },
        'STEPBible TBESG (CC BY)'
      );
      continue;
    }

    if (mode === 'tflsj' && cols.length >= 7) {
      const eStrong = cols[0];
      const uStrong = cols[2];
      const greek = cols[3];
      const translit = cols[4];
      const gloss = cols[6];
      const lsjRaw = cols.slice(7).join('\t');
      const lsjClean = stripHtmlToReadableText(lsjRaw);
      const rootAndLinks = extractGreekRootAndLinks(lsjRaw, uStrong);

      mergeEntry(
        map,
        eStrong,
        {
          language: 'greek',
          uStrong,
          lemma: greek,
          transliteration: translit,
          short_definition: gloss || null,
          root_and_cognates: rootAndLinks,
          deep_entry: lsjClean,
          deep_label: 'LSJ / STEPBible (TFLSJ)',
        },
        'STEPBible TFLSJ (CC BY)'
      );
      continue;
    }

    if (mode === 'tbesh' && cols.length >= 7) {
      const eStrong = cols[0];
      const dStrong = cols[1] || '';
      const uStrong = cols[2] || '';
      const hebrew = cols[3] || '';
      const translit = cols[4] || '';
      const morph = cols[5] || '';
      const gloss = cols[6] || '';
      const meaningRaw = cols.slice(7).join('\t');
      const meaningClean = stripHtmlToReadableText(meaningRaw);

      const isAramaic = /^A:/i.test(morph) || /in\s+Aramaic\s+of/i.test(dStrong);
      const language = isAramaic ? 'aramaic' : 'hebrew';

      const firstMeaningLine = meaningClean.split('\n')[0] || '';
      const shortDef =
        gloss && firstMeaningLine && !normalizeForCompare(firstMeaningLine).startsWith(normalizeForCompare(gloss))
          ? `${gloss} — ${firstMeaningLine.slice(0, 180)}`
          : gloss || firstMeaningLine.slice(0, 180);

      const rootAndCognates = extractHebrewRootAndCognates(meaningClean, uStrong, morph);

      mergeEntry(
        map,
        eStrong,
        {
          language,
          uStrong,
          lemma: hebrew,
          transliteration: translit,
          short_definition: shortDef,
          root_and_cognates: rootAndCognates,
          deep_entry: meaningClean || gloss,
          deep_label: isAramaic ? 'STEPBible TBESH (Arameiska)' : 'STEPBible TBESH (Hebreiska)',
        },
        'STEPBible TBESH (CC BY)'
      );
      continue;
    }

    // Generell reserv för andra TSV/TXT-filer
    const codeIndex = cols.findIndex((c) => normalizeStrongCode(c) !== null);
    if (codeIndex === -1) continue;

    const strongCode = cols[codeIndex];
    const lemma = cols[codeIndex + 1] || null;
    const transliteration = cols[codeIndex + 2] || null;
    const shortDefinition = cols[codeIndex + 3] || null;
    const extraNotes = cols.slice(codeIndex + 4).filter(Boolean).join('\n') || null;

    mergeEntry(
      map,
      strongCode,
      {
        lemma,
        transliteration,
        short_definition: shortDefinition,
        deep_entry: extraNotes,
        deep_label: fileName,
      },
      fileName
    );
  }
}

async function run() {
  await fs.mkdir(SOURCES_DIR, { recursive: true });
  const files = await fs.readdir(SOURCES_DIR);
  const validFiles = files.filter((f) => {
    const lower = f.toLowerCase();
    return lower.endsWith('.json') || lower.endsWith('.txt') || lower.endsWith('.tsv');
  });

  if (validFiles.length === 0) {
    console.log('Inga .json-, .txt- eller .tsv-filer hittades i data/sources/ ännu.');
    return;
  }

  const lexiconMap = new Map();

  for (const file of validFiles) {
    const fullPath = path.join(SOURCES_DIR, file);
    console.log(`Läser källa: ${file}...`);
    await processFile(fullPath, lexiconMap);
  }

  const mergedList = Array.from(lexiconMap.values()).map((entry) => ({
    ...entry,
    cognate_codes: entry.cognate_codes.length > 0 ? entry.cognate_codes : null,
  }));

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(mergedList, null, 2), 'utf8');
  console.log(`Klart! Skrev ${mergedList.length} sammanslagna poster till ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error('Fel vid bygge av lexikon:', err);
  process.exit(1);
});