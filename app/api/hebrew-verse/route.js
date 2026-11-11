import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: 'Saknade parametrar' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://bolls.life/verse/WLC/${book}/${chapter}/${verse}/`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Kunde inte hämta från Bolls Life' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Serverfel vid hämtning av vers:', error);
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
  }
}