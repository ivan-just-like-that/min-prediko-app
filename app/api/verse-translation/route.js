import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawBook = searchParams.get('book') || '';
    const book = rawBook.toLowerCase().trim();
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');
    const lang = searchParams.get('lang') || 'sv';

    if (!book || !chapter || !verse) {
      return NextResponse.json({ error: 'Parametrar saknas' }, { status: 400 });
    }

    // Fullständig mappning till det standardiserade boknamnet som sparas i databasen (swedish_verses)
    const bookNameMap = {
      // --- GAMLA TESTAMENTET ---
      'genesis': 'Genesis', 'gen': 'Genesis', 'första moseboken': 'Genesis',
      'exodus': 'Exodus', 'exod': 'Exodus', 'ex': 'Exodus', 'exo': 'Exodus', 'andra moseboken': 'Exodus',
      'leviticus': 'Leviticus', 'lev': 'Leviticus', 'tredje moseboken': 'Leviticus',
      'numbers': 'Numbers', 'num': 'Numbers', 'fjärde moseboken': 'Numbers',
      'deuteronomy': 'Deuteronomy', 'deut': 'Deuteronomy', 'dt': 'Deuteronomy', 'deu': 'Deuteronomy', 'femte moseboken': 'Deuteronomy',
      'joshua': 'Joshua', 'josh': 'Joshua', 'jos': 'Joshua', 'josua': 'Joshua',
      'judges': 'Judges', 'judg': 'Judges', 'jdg': 'Judges', 'domarboken': 'Judges',
      'ruth': 'Ruth', 'rut': 'Ruth',

      'i samuel': 'I Samuel', 'i_samuel': 'I Samuel', '1_samuel': 'I Samuel', '1samuel': 'I Samuel', '1sam': 'I Samuel', '1_sam': 'I Samuel', '1sa': 'I Samuel', '1 samuel': 'I Samuel', '1_samuelsboken': 'I Samuel', '1samuelsboken': 'I Samuel', '1 samuelsboken': 'I Samuel', 'första samuelsboken': 'I Samuel',
      'ii samuel': 'II Samuel', 'ii_samuel': 'II Samuel', '2_samuel': 'II Samuel', '2samuel': 'II Samuel', '2sam': 'II Samuel', '2_sam': 'II Samuel', '2sa': 'II Samuel', '2 samuel': 'II Samuel', '2_samuelsboken': 'II Samuel', '2samuelsboken': 'II Samuel', '2 samuelsboken': 'II Samuel', 'andra samuelsboken': 'II Samuel',

      'i kings': 'I Kings', 'i_kings': 'I Kings', '1_kings': 'I Kings', '1kings': 'I Kings', '1kgs': 'I Kings', '1_kgs': 'I Kings', '1ki': 'I Kings', '1 kings': 'I Kings', '1_kungaboken': 'I Kings', '1kungaboken': 'I Kings', '1 kungaboken': 'I Kings', 'första kungaboken': 'I Kings',
      'ii kings': 'II Kings', 'ii_kings': 'II Kings', '2_kings': 'II Kings', '2kings': 'II Kings', '2kgs': 'II Kings', '2_kgs': 'II Kings', '2ki': 'II Kings', '2 kings': 'II Kings', '2_kungaboken': 'II Kings', '2kungaboken': 'II Kings', '2 kungaboken': 'II Kings', 'andra kungaboken': 'II Kings',

      'i chronicles': 'I Chronicles', 'i_chronicles': 'I Chronicles', '1_chronicles': 'I Chronicles', '1chronicles': 'I Chronicles', '1chr': 'I Chronicles', '1_chr': 'I Chronicles', '1ch': 'I Chronicles', '1 chronicles': 'I Chronicles', '1_krönikeboken': 'I Chronicles', '1krönikeboken': 'I Chronicles', '1 krönikeboken': 'I Chronicles', 'första krönikeboken': 'I Chronicles',
      'ii chronicles': 'II Chronicles', 'ii_chronicles': 'II Chronicles', '2_chronicles': 'II Chronicles', '2chronicles': 'II Chronicles', '2chr': 'II Chronicles', '2_chr': 'II Chronicles', '2ch': 'II Chronicles', '2 chronicles': 'II Chronicles', '2_krönikeboken': 'II Chronicles', '2krönikeboken': 'II Chronicles', '2 krönikeboken': 'II Chronicles', 'andra krönikeboken': 'II Chronicles',

      'ezra': 'Ezra', 'ezr': 'Ezra', 'esra': 'Ezra',
      'nehemiah': 'Nehemiah', 'neh': 'Nehemiah', 'nehemja': 'Nehemiah',
      'esther': 'Esther', 'esth': 'Esther', 'est': 'Esther', 'ester': 'Esther',
      'job': 'Job',
      'psalms': 'Psalms', 'psalm': 'Psalms', 'ps': 'Psalms', 'psa': 'Psalms', 'psaltaren': 'Psalms',
      'proverbs': 'Proverbs', 'prov': 'Proverbs', 'prv': 'Proverbs', 'pro': 'Proverbs', 'ordspråksboken': 'Proverbs',
      'ecclesiastes': 'Ecclesiastes', 'eccl': 'Ecclesiastes', 'ecc': 'Ecclesiastes', 'predikaren': 'Ecclesiastes',
      'song of solomon': 'Song of Solomon', 'songofsolomon': 'Song of Solomon', 'song_of_solomon': 'Song of Solomon', 'song': 'Song of Solomon', 'höga visan': 'Song of Solomon', 'sng': 'Song of Solomon', 'song of songs': 'Song of Solomon',
      'isaiah': 'Isaiah', 'isa': 'Isaiah', 'jesaja': 'Isaiah',
      'jeremiah': 'Jeremiah', 'jer': 'Jeremiah', 'jeremia': 'Jeremiah',
      'lamentations': 'Lamentations', 'lam': 'Lamentations', 'klagovisorna': 'Lamentations',
      'ezekiel': 'Ezekiel', 'ezek': 'Ezekiel', 'eze': 'Ezekiel', 'ezk': 'Ezekiel', 'hesekiel': 'Ezekiel',
      'daniel': 'Daniel', 'dan': 'Daniel',
      'hosea': 'Hosea', 'hos': 'Hosea',
      'joel': 'Joel', 'joe': 'Joel', 'jol': 'Joel',
      'amos': 'Amos', 'amo': 'Amos',
      'obadiah': 'Obadiah', 'obad': 'Obadiah', 'oba': 'Obadiah', 'obadja': 'Obadiah',
      'jonah': 'Jonah', 'jon': 'Jonah', 'jona': 'Jonah',
      'micah': 'Micah', 'mic': 'Micah', 'mika': 'Micah',
      'nahum': 'Nahum', 'nah': 'Nahum', 'nam': 'Nahum',
      'habakkuk': 'Habakkuk', 'hab': 'Habakkuk', 'habackuk': 'Habakkuk',
      'zephaniah': 'Zephaniah', 'zeph': 'Zephaniah', 'zep': 'Zephaniah', 'sefanja': 'Zephaniah',
      'haggai': 'Haggai', 'hag': 'Haggai',
      'zechariah': 'Zechariah', 'zech': 'Zechariah', 'zec': 'Zechariah', 'sakarja': 'Zechariah',
      'malachi': 'Malachi', 'mal': 'Malachi', 'malaki': 'Malachi',

      // --- NYA TESTAMENTET ---
      'matthew': 'Matthew', 'matt': 'Matthew', 'mat': 'Matthew', 'matteusevangeliet': 'Matthew',
      'mark': 'Mark', 'mrk': 'Mark', 'markusevangeliet': 'Mark',
      'luke': 'Luke', 'luk': 'Luke', 'lukasevangeliet': 'Luke',
      'john': 'John', 'jhn': 'John', 'joh': 'John', 'johannesevangeliet': 'John',
      'acts': 'Acts', 'act': 'Acts', 'apg': 'Acts', 'apostlagärningarna': 'Acts',
      'romans': 'Romans', 'rom': 'Romans', 'romarbrevet': 'Romans',

      'i corinthians': 'I Corinthians', 'i_corinthians': 'I Corinthians', '1corinthians': 'I Corinthians', '1cor': 'I Corinthians', '1co': 'I Corinthians', '1 corinthians': 'I Corinthians', '1_korinthierbrevet': 'I Corinthians', '1korinthierbrevet': 'I Corinthians', '1 korinthierbrevet': 'I Corinthians',
      'ii corinthians': 'II Corinthians', 'ii_corinthians': 'II Corinthians', '2corinthians': 'II Corinthians', '2cor': 'II Corinthians', '2co': 'II Corinthians', '2 corinthians': 'II Corinthians', '2_korinthierbrevet': 'II Corinthians', '2korinthierbrevet': 'II Corinthians', '2 korinthierbrevet': 'II Corinthians',

      'galatians': 'Galatians', 'gal': 'Galatians', 'galaterbrevet': 'Galatians',
      'ephesians': 'Ephesians', 'eph': 'Ephesians', 'efesierbrevet': 'Ephesians',
      'philippians': 'Philippians', 'php': 'Philippians', 'phil': 'Philippians', 'filipperbrevet': 'Philippians',
      'colossians': 'Colossians', 'col': 'Colossians', 'kolosserbrevet': 'Colossians',

      'i thessalonians': 'I Thessalonians', 'i_thessalonians': 'I Thessalonians', '1thessalonians': 'I Thessalonians', '1thess': 'I Thessalonians', '1th': 'I Thessalonians', '1 thessalonians': 'I Thessalonians', '1_thessalonikerbrevet': 'I Thessalonians', '1thessalonikerbrevet': 'I Thessalonians',
      'ii thessalonians': 'II Thessalonians', 'ii_thessalonians': 'II Thessalonians', '2thessalonians': 'II Thessalonians', '2thess': 'II Thessalonians', '2th': 'II Thessalonians', '2 thessalonians': 'II Thessalonians', '2_thessalonikerbrevet': 'II Thessalonians', '2thessalonikerbrevet': 'II Thessalonians',

      'i timothy': 'I Timothy', 'i_timothy': 'I Timothy', '1timothy': 'I Timothy', '1tim': 'I Timothy', '1ti': 'I Timothy', '1 timothy': 'I Timothy', '1_timoteusbrevet': 'I Timothy', '1timoteusbrevet': 'I Timothy',
      'ii timothy': 'II Timothy', 'ii_timothy': 'II Timothy', '2timothy': 'II Timothy', '2tim': 'II Timothy', '2ti': 'II Timothy', '2 timothy': 'II Timothy', '2_timoteusbrevet': 'II Timothy', '2timoteusbrevet': 'II Timothy',

      'titus': 'Titus', 'tit': 'Titus', 'titusbrevet': 'Titus',
      'philemon': 'Philemon', 'philem': 'Philemon', 'phm': 'Philemon', 'filemon': 'Philemon',
      'hebrews': 'Hebrews', 'heb': 'Hebrews', 'hebreerbrevet': 'Hebrews',
      'james': 'James', 'jas': 'James', 'jakobs brev': 'James', 'jakobs_brev': 'James',

      'i peter': 'I Peter', 'i_peter': 'I Peter', '1peter': 'I Peter', '1pet': 'I Peter', '1pe': 'I Peter', '1 peter': 'I Peter', '1_petrusbrevet': 'I Peter', '1petrusbrevet': 'I Peter',
      'ii peter': 'II Peter', 'ii_peter': 'II Peter', '2peter': 'II Peter', '2pet': 'II Peter', '2pe': 'II Peter', '2 peter': 'II Peter', '2_petrusbrevet': 'II Peter', '2petrusbrevet': 'II Peter',

      'i john': 'I John', 'i_john': 'I John', '1john': 'I John', '1jhn': 'I John', '1jn': 'I John', '1 john': 'I John', '1_johannesbrevet': 'I John', '1johannesbrevet': 'I John',
      'ii john': 'II John', 'ii_john': 'II John', '2john': 'II John', '2jhn': 'II John', '2jn': 'II John', '2 john': 'II John', '2_johannesbrevet': 'II John', '2johannesbrevet': 'II John',
      'iii john': 'III John', 'iii_john': 'III John', '3john': 'III John', '3jhn': 'III John', '3jn': 'III John', '3 john': 'III John', '3_johannesbrevet': 'III John', '3johannesbrevet': 'III John',

      'jude': 'Jude', 'jud': 'Jude', 'judas brev': 'Jude',
      'revelation of john': 'Revelation of John', 'revelation': 'Revelation of John', 'rev': 'Revelation of John', 'uppenbarelseboken': 'Revelation of John'
    };

    const dbBookCodes = {
      'genesis': 'Gen', 'gen': 'Gen',
      'exodus': 'Exo', 'exod': 'Exo', 'exo': 'Exo',
      'leviticus': 'Lev', 'lev': 'Lev',
      'numbers': 'Num', 'num': 'Num',
      'deuteronomy': 'Deu', 'deut': 'Deu', 'deu': 'Deu',
      'joshua': 'Jos', 'josh': 'Jos', 'jos': 'Jos',
      'judges': 'Jdg', 'judg': 'Jdg', 'jdg': 'Jdg',
      'ruth': 'Rut', 'rut': 'Rut',
      'i samuel': '1Sa', 'i_samuel': '1Sa', '1sa': '1Sa',
      'ii samuel': '2Sa', 'ii_samuel': '2Sa', '2sa': '2Sa',
      'i kings': '1Ki', 'i_kings': '1Ki', '1ki': '1Ki',
      'ii kings': '2Ki', 'ii_kings': '2Ki', '2ki': '2Ki',
      'i chronicles': '1Ch', 'i_chronicles': '1Ch', '1ch': '1Ch',
      'ii chronicles': '2Ch', 'ii_chronicles': '2Ch', '2ch': '2Ch',
      'ezra': 'Ezr', 'ezr': 'Ezr',
      'nehemiah': 'Neh', 'neh': 'Neh',
      'esther': 'Est', 'est': 'Est',
      'job': 'Job',
      'psalms': 'Psa', 'ps': 'Psa', 'psa': 'Psa',
      'proverbs': 'Pro', 'pro': 'Pro',
      'ecclesiastes': 'Ecc', 'ecc': 'Ecc',
      'song of solomon': 'Sng', 'sng': 'Sng',
      'isaiah': 'Isa', 'isa': 'Isa',
      'jeremiah': 'Jer', 'jer': 'Jer',
      'lamentations': 'Lam', 'lam': 'Lam',
      'ezekiel': 'Ezk', 'eze': 'Ezk', 'ezk': 'Ezk',
      'daniel': 'Dan', 'dan': 'Dan',
      'hosea': 'Hos', 'hos': 'Hos',
      'joel': 'Jol', 'jol': 'Jol',
      'amos': 'Amo', 'amo': 'Amo',
      'obadiah': 'Oba', 'oba': 'Oba',
      'jonah': 'Jon', 'jon': 'Jon',
      'micah': 'Mic', 'mic': 'Mic',
      'nahum': 'Nam', 'nam': 'Nam',
      'habakkuk': 'Hab', 'hab': 'Hab',
      'zephaniah': 'Zep', 'zep': 'Zep',
      'haggai': 'Hag', 'hag': 'Hag',
      'zechariah': 'Zec', 'zec': 'Zec',
      'malachi': 'Mal', 'mal': 'Mal'
    };

    const standardBookName = bookNameMap[book];
    if (!standardBookName) {
      return NextResponse.json({ text: `Bok saknas i mappningen: ${book}` });
    }

    let verseText = '';

    if (lang === 'sv') {
      const shortBookCode = dbBookCodes[book] || book.substring(0, 3);
      const hasVerseZero = searchParams.get('hasVerseZero') === 'true';
      let targetSwedishVerse = Number(verse);

      if (shortBookCode === 'Psa' && hasVerseZero) {
        const { data: zeroRow } = await supabase
          .from('swedish_verses')
          .select('id')
          .eq('book', standardBookName)
          .eq('chapter', Number(chapter))
          .eq('verse', 0)
          .maybeSingle();

        if (!zeroRow) {
          targetSwedishVerse = Number(verse) + 1;
        }
      }

      const { data, error } = await supabase
        .from('swedish_verses')
        .select('text')
        .eq('book', standardBookName)
        .eq('chapter', Number(chapter))
        .eq('verse', targetSwedishVerse)
        .maybeSingle();

      if (error) {
        console.error('Supabase-fel:', error);
      }

      verseText = data?.text || 'Text saknas för denna vers.';
    } else {
      // Komplett mappning till boknummer (1-66) för bolls.life (ESV & Reina-Valera)
      const bookNumberMap = {
        // GT (1-39)
        'genesis': 1, 'gen': 1,
        'exodus': 2, 'exod': 2, 'ex': 2, 'exo': 2,
        'leviticus': 3, 'lev': 3,
        'numbers': 4, 'num': 4,
        'deuteronomy': 5, 'deut': 5, 'deu': 5,
        'joshua': 6, 'josh': 6, 'jos': 6,
        'judges': 7, 'judg': 7, 'jdg': 7,
        'ruth': 8, 'rut': 8,
        'i samuel': 9, 'i_samuel': 9, '1_samuel': 9, '1samuel': 9, '1sam': 9, '1sa': 9, '1 samuel': 9,
        'ii samuel': 10, 'ii_samuel': 10, '2_samuel': 10, '2samuel': 10, '2sam': 10, '2sa': 10, '2 samuel': 10,
        'i kings': 11, 'i_kings': 11, '1_kings': 11, '1kings': 11, '1kgs': 11, '1ki': 11, '1 kings': 11,
        'ii kings': 12, 'ii_kings': 12, '2_kings': 12, '2kings': 12, '2kgs': 12, '2ki': 12, '2 kings': 12,
        'i chronicles': 13, 'i_chronicles': 13, '1_chronicles': 13, '1chronicles': 13, '1chr': 13, '1ch': 13, '1 chronicles': 13,
        'ii chronicles': 14, 'ii_chronicles': 14, '2_chronicles': 14, '2chronicles': 14, '2chr': 14, '2ch': 14, '2 chronicles': 14,
        'ezra': 15, 'ezr': 15,
        'nehemiah': 16, 'neh': 16,
        'esther': 17, 'esth': 17, 'est': 17,
        'job': 18,
        'psalms': 19, 'psalm': 19, 'ps': 19, 'psa': 19,
        'proverbs': 20, 'prov': 20, 'pro': 20,
        'ecclesiastes': 21, 'eccl': 21, 'ecc': 21,
        'song of solomon': 22, 'songofsolomon': 22, 'song_of_solomon': 22, 'sng': 22, 'song': 22,
        'isaiah': 23, 'isa': 23,
        'jeremiah': 24, 'jer': 24,
        'lamentations': 25, 'lam': 25,
        'ezekiel': 26, 'ezek': 26, 'eze': 26, 'ezk': 26,
        'daniel': 27, 'dan': 27,
        'hosea': 28, 'hos': 28,
        'joel': 29, 'joe': 29, 'jol': 29,
        'amos': 30, 'amo': 30,
        'obadiah': 31, 'obad': 31, 'oba': 31,
        'jonah': 32, 'jon': 32,
        'micah': 33, 'mic': 33,
        'nahum': 34, 'nah': 34, 'nam': 34,
        'habakkuk': 35, 'hab': 35,
        'zephaniah': 36, 'zeph': 36, 'zep': 36,
        'haggai': 37, 'hag': 37,
        'zechariah': 38, 'zech': 38, 'zec': 38,
        'malachi': 39, 'mal': 39,

        // NT (40-66)
        'matthew': 40, 'matt': 40, 'mat': 40,
        'mark': 41, 'mrk': 41,
        'luke': 42, 'luk': 42,
        'john': 43, 'jhn': 43, 'joh': 43,
        'acts': 44, 'act': 44,
        'romans': 45, 'rom': 45,
        'i corinthians': 46, 'i_corinthians': 46, '1corinthians': 46, '1cor': 46, '1co': 46, '1 corinthians': 46,
        'ii corinthians': 47, 'ii_corinthians': 47, '2corinthians': 47, '2cor': 47, '2co': 47, '2 corinthians': 47,
        'galatians': 48, 'gal': 48,
        'ephesians': 49, 'eph': 49,
        'philippians': 50, 'phil': 50, 'php': 50,
        'colossians': 51, 'col': 51,
        'i thessalonians': 52, 'i_thessalonians': 52, '1thessalonians': 52, '1thess': 52, '1th': 52, '1 thessalonians': 52,
        'ii thessalonians': 53, 'ii_thessalonians': 53, '2thessalonians': 53, '2thess': 53, '2th': 53, '2 thessalonians': 53,
        'i timothy': 54, 'i_timothy': 54, '1timothy': 54, '1tim': 54, '1ti': 54, '1 timothy': 54,
        'ii timothy': 55, 'ii_timothy': 55, '2timothy': 55, '2tim': 55, '2ti': 55, '2 timothy': 55,
        'titus': 56, 'tit': 56,
        'philemon': 57, 'philem': 57, 'phm': 57,
        'hebrews': 58, 'heb': 58,
        'james': 59, 'jas': 59,
        'i peter': 60, 'i_peter': 60, '1peter': 60, '1pet': 60, '1pe': 60, '1 peter': 60,
        'ii peter': 61, 'ii_peter': 61, '2peter': 61, '2pet': 61, '2pe': 61, '2 peter': 61,
        'i john': 62, 'i_john': 62, '1john': 62, '1jhn': 62, '1jn': 62, '1 john': 62,
        'ii john': 63, 'ii_john': 63, '2john': 63, '2jhn': 63, '2jn': 63, '2 john': 63,
        'iii john': 64, 'iii_john': 64, '3john': 64, '3jhn': 64, '3jn': 64, '3 john': 64,
        'jude': 65, 'jud': 65,
        'revelation of john': 66, 'revelation': 66, 'rev': 66
      };

      const bookNum = bookNumberMap[book] || bookNumberMap[standardBookName.toLowerCase()];
      if (!bookNum) {
        return NextResponse.json({ text: `Bok saknas i mappningen: ${book}` });
      }

      const translationCodes = lang === 'es' ? ['RV1960', 'LBLA', 'NTV'] : ['ESV', 'WEB', 'KJV'];

      for (const code of translationCodes) {
        try {
          const apiUrl = `https://bolls.life/get-verse/${code}/${bookNum}/${chapter}/${verse}/`;
          const res = await fetch(apiUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.text) {
              verseText = data.text;
              break;
            }
          }
        } catch {}
      }

      if (!verseText) {
        verseText = lang === 'es' ? 'Texto no disponible.' : 'Text not available.';
      }
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