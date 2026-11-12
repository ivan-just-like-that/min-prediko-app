import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getChapterWords(book, chapter) {
  const prefix = `${book}.${chapter}.`;
  
  const { data, error } = await supabase
    .from('hebrew_verses')
    .select('*')
    .ilike('reference', `${prefix}%`)
    .order('id', { ascending: true });

  if (error) {
    console.error('Fel vid hämtning av kapitel:', error.message);
    return [];
  }

  return data || [];
}

export default async function HebrewReaderPage({ params }) {
  // Pakera upp params direkt (fungerar i Next.js)
  const { book, chapter } = params;

  const words = await getChapterWords(book, chapter);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Huvudyta för läsning */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="mb-8 border-b border-zinc-800 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-500">
              {book} kapitel {chapter}
            </h1>
            <p className="text-sm text-zinc-400">Interlinear Hebrew Reader – TAHOT Dataset</p>
          </div>
          <Link
            href="/reader"
            className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Tillbaka / Byt kapitel
          </Link>
        </header>

        {words.length === 0 ? (
          <div className="text-zinc-500 text-center py-12">
            Inga ord hittades för {book} {chapter}. Kontrollera att databasen är importerad.
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-8 dir-rtl text-right leading-loose">
            {words.map((word) => (
              <div
                key={word.id}
                className="inline-flex flex-col items-center p-2 rounded-lg hover:bg-zinc-900/80 transition-colors group cursor-default"
              >
                {/* Originalhebreiska */}
                <span className="text-2xl font-serif text-amber-200 tracking-wide mb-1" dir="rtl">
                  {word.hebrew}
                </span>
                {/* Transliteration */}
                <span className="text-xs text-zinc-400 font-mono tracking-tight">
                  {word.transliteration}
                </span>
                {/* Engelsk översättning direkt under */}
                <span className="text-xs font-medium text-emerald-400 mt-1 max-w-[120px] text-center truncate">
                  {word.translation}
                </span>
                {/* Strongs / Morfologi info vid hover */}
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  {word.strongs}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sidopanel med översikt */}
      <aside className="w-96 border-l border-zinc-800 bg-zinc-900/50 p-6 overflow-y-auto flex flex-col hidden lg:flex">
        <h2 className="text-lg font-semibold text-amber-400 mb-4 border-b border-zinc-800 pb-2">
          Kapitelöversikt
        </h2>
        <div className="space-y-4 text-sm text-zinc-400">
          <p>
            Visar komplett interlinear data för <strong className="text-zinc-200">{book} {chapter}</strong> direkt från Supabase.
          </p>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2 font-mono text-xs">
            <div>Totalt antal ord: <span className="text-amber-400">{words.length}</span></div>
            <div>Dataset: <span className="text-emerald-400">TAHOT (STEPBible)</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}