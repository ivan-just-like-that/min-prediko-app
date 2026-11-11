import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book')?.toLowerCase() || '';
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');
    const lang = searchParams.get('lang') || 'sv';

    if (!book || !chapter || !verse) {
      return NextResponse.json({ error: 'Parametrar saknas' }, { status: 400 });
    }

    const bookNumberMap = {
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
      return NextResponse.json({ text: 'Bok saknas i mappningen' });
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