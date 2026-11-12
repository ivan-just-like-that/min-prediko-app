import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book')?.toLowerCase().trim() || '';
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');
    const lang = searchParams.get('lang') || 'sv';

    if (!book || !chapter || !verse) {
      return NextResponse.json({ error: 'Parametrar saknas' }, { status: 400 });
    }

    const bookNumberMap = {
      // --- GAMLA TESTAMENTET (1 - 39) ---
      'genesis': 1, 'gen': 1,
      'exodus': 2, 'exod': 2, 'ex': 2,
      'leviticus': 3, 'lev': 3,
      'numbers': 4, 'num': 4,
      'deuteronomy': 5, 'deut': 5, 'dt': 5,
      'joshua': 6, 'josh': 6,
      'judges': 7, 'judg': 7,
      'ruth': 8, // Observera: Rut är bok 8 i ordningen i Bolls Life
      '1_samuel': 9, '1samuel': 9, '1sam': 9, '1_sam': 9,
      '2_samuel': 10, '2samuel': 10, '2sam': 10, '2_sam': 10,
      '1_kings': 11, '1kings': 11, '1kgs': 11, '1_kgs': 11,
      '2_kings': 12, '2kings': 12, '2kgs': 12, '2_kgs': 12,
      '1_chronicles': 13, '1chronicles': 13, '1chr': 13, '1_chr': 13,
      '2_chronicles': 14, '2chronicles': 14, '2chr': 14, '2_chr': 14,
      'ezra': 15,
      'nehemiah': 16, 'neh': 16,
      'esther': 17, 'esth': 17,
      'job': 18,
      'psalms': 19, 'psalm': 19, 'ps': 19,
      'proverbs': 20, 'prov': 20, 'prv': 20,
      'ecclesiastes': 21, 'eccl': 21,
      'songofsolomon': 22, 'song_of_solomon': 22, 'song': 22, 'höga visan': 22,
      'isaiah': 23, 'isa': 23,
      'jeremiah': 24, 'jer': 24,
      'lamentations': 25, 'lam': 25,
      'ezekiel': 26, 'ezek': 26,
      'daniel': 27, 'dan': 27,
      'hosea': 28, 'hos': 28,
      'joel': 29,
      'amos': 30,
      'obadiah': 31, 'obad': 31,
      'jonah': 32,
      'micah': 33, 'mic': 33,
      'nahum': 34, 'nah': 34,
      'habakkuk': 35, 'hab': 35,
      'zephaniah': 36, 'zeph': 36,
      'haggai': 37, 'hag': 37,
      'zechariah': 38, 'zech': 38,
      'malachi': 39, 'mal': 39,

      // --- NYA TESTAMENTET (40 - 66) [Oförändrat] ---
      'matthew': 40, 'matt': 40, 'mat': 40,
      'mark': 41, 'mrk': 41,
      'luke': 42, 'luk': 42,
      'john': 43, 'jhn': 43, 'joh': 43,
      'acts': 44, 'act': 44, 'apg': 44,
      'romans': 45, 'rom': 45,
      '1corinthians': 46, '1cor': 46, '1co': 46,
      '2corinthians': 47, '2cor': 47, '2co': 47,
      'galatians': 48, 'gal': 48,
      'ephesians': 49, 'eph': 49,
      'philippians': 50, 'php': 50, 'phil': 50,
      'colossians': 51, 'col': 51,
      '1thessalonians': 52, '1thess': 52,
      '2thessalonians': 53, '2thess': 53,
      '1timothy': 54, '1tim': 54,
      '2timothy': 55, '2tim': 55,
      'titus': 56, 'tit': 56,
      'philemon': 57, 'phm': 57,
      'hebrews': 58, 'heb': 58,
      'james': 59, 'jas': 59,
      '1peter': 60, '1pet': 60,
      '2peter': 61, '2pet': 61,
      '1john': 62, '1jhn': 62,
      '2john': 63, '2jhn': 63,
      '3john': 64, '3jhn': 64,
      'jude': 65, 'jud': 65,
      'revelation': 66, 'rev': 66
    };

    const bookNum = bookNumberMap[book];
    if (!bookNum) {
      return NextResponse.json({ text: `Bok saknas i mappningen: ${book}` });
    }

    let translationCodes = [];
    if (lang === 'sv') {
      translationCodes = ['SFB2015'];
    } else if (lang === 'es') {
      translationCodes = ['RV1960', 'LBLA', 'NTV'];
    } else {
      translationCodes = ['ESV', 'WEB', 'KJV'];
    }

    let verseText = '';

    for (const code of translationCodes) {
      try {
        const apiUrl = `https://bolls.life/get-verse/${code}/${bookNum}/${chapter}/${verse}/`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.text && !data.text.includes('me prohibió usar')) {
            verseText = data.text;
            break;
          }
        }
      } catch {}
    }

    if (!verseText) {
      verseText = lang === 'sv' ? 'Kunde inte hämta svensk översättning.' : 'Texto no disponible.';
    }

    const cleanText = verseText
      .replace(/<[^>]*>?/gm, '')
      .replace(/[\u24B6-\u24E9]/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({ text: cleanText });
  } catch (error) {
    console.error('API-fel i verse-translation:', error);
    return NextResponse.json({ text: '' }, { status: 500 });
  }
}