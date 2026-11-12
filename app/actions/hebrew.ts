import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getChapterWords(book: string, chapter: string) {
  // TAHOT-referenser i databasen ser ut som "Gen.1.1#01", "Gen.1.2#01" osv.
  // Vi söker därför efter alla rader som börjar med t.ex. "Gen.1."
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

  return data;
}