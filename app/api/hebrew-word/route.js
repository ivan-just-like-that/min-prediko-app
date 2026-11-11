import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const strongs = searchParams.get('strongs');

    if (!word) {
      return NextResponse.json({ error: 'Ord saknas' }, { status: 400 });
    }

    const cleanWord = word.replace(/[\u0591-\u05C7]/g, '').trim();

    return NextResponse.json({
      word: word,
      lemma: cleanWord,
      strongs: strongs || '—',
      transliteration: '—', // Kan fyllas på om du vill integrera translittererings-API
      gloss: strongs ? `Strongs-referens: ${strongs}` : 'Lexikonuppslag',
      definition: `Detta är grundtextordet "${word}" med tillhörande Strongs-nummer ${strongs || 'ej tillgängligt'}.`
    });

  } catch (error) {
    console.error('API-fel:', error);
    return NextResponse.json({ error: 'Kunde inte hämta data' }, { status: 500 });
  }
}