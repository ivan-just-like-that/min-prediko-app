'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { useSearchParams } from 'next/navigation';
import { 
  ChevronDown, 
  Languages, 
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

function parseHebrewMorphology(code) {
  if (!code) return 'Ingen morfologisk data tillgänglig';
  
  let result = [];
  const firstChar = code.charAt(0);

  if (firstChar === 'H') result.push('Substantiv / Egennamn');
  else if (firstChar === 'V') result.push('Verb');
  else if (firstChar === 'A') result.push('Adjektiv');
  else if (firstChar === 'R') result.push('Preposition');
  else if (firstChar === 'C') result.push('Konjunktion');
  else if (firstChar === 'D') result.push('Adverb');
  else if (firstChar === 'P') result.push('Pronomen');
  else if (firstChar === 'T') result.push('Partikel');
  else result.push(`Kod: ${code}`);

  if (code.includes('q')) result.push('Qal (enkel aktiv)');
  if (code.includes('N')) result.push('Nifal (passiv/reflexiv)');
  if (code.includes('p')) result.push('Piel (intensiv aktiv)');
  if (code.includes('P')) result.push('Pual (intensiv passiv)');
  if (code.includes('h')) result.push('Hifil (kausativ aktiv)');
  if (code.includes('H')) result.push('Hofal (kausativ passiv)');
  if (code.includes('t')) result.push('Hitpael (reflexiv)');

  if (code.includes('pf')) result.push('Perfekt (avslutad handling)');
  if (code.includes('im')) result.push('Imperfekt (pågående handling)');
  if (code.includes('iv')) result.push('Imperativ (befallning)');
  if (code.includes('in')) result.push('Infinitiv');
  if (code.includes('pt')) result.push('Particip');

  if (code.includes('1s')) result.push('1:a personen singular (jag)');
  if (code.includes('1p')) result.push('1:a personen plural (vi)');
  if (code.includes('2ms')) result.push('2:a personen maskulin singular (du)');
  if (code.includes('2fs')) result.push('2:a personen feminin singular (du)');
  if (code.includes('3ms')) result.push('3:e personen maskulin singular (han/den)');
  if (code.includes('3fs')) result.push('3:e personen feminin singular (hon/den)');
  if (code.includes('3mp')) result.push('3:e personen maskulin plural (de)');
  if (code.includes('3fp')) result.push('3:e personen feminin plural (de)');

  return result.length > 0 ? result.join(' • ') : code;
}

function RunningVerseTranslation({ book, chapter, verse, lang = 'sv' }) {
  const [runningText, setRunningText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVerse() {
      if (!book || !chapter || !verse) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/verse-translation?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}&lang=${lang}`);
        const data = await res.json();
        setRunningText(data.text || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadVerse();
  }, [book, chapter, verse, lang]);

  if (loading) {
    return <p className="text-xs text-slate-400 italic mt-3 animate-pulse">Laddar löpande översättning...</p>;
  }

  if (!runningText) return null;

  const labelMap = {
    sv: 'SFB 2015',
    en: 'English Standard Version (ESV)',
    es: 'Reina-Valera 1960'
  };

  return (
    <div className="mt-4 pt-3 border-t border-[#e8e4df]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8c918d]">
          {labelMap[lang]}
        </span>
      </div>
      <p className="text-sm text-[#2d312e] italic leading-relaxed pl-3 border-l-2 border-[#2d3732]">
        &quot;{runningText}&quot;
      </p>
    </div>
  );
}

function HebrewAnalysContent() {
  const searchParams = useSearchParams();
  const [runningTranslationLang, setRunningTranslationLang] = useState('sv');
  const [showSourceInfo, setShowSourceInfo] = useState(false);

  const hebrewBooks = [
    { id: 'Gen', name_sv: 'Första Moseboken', chapters: 50 },
    { id: 'Exo', name_sv: 'Andra Moseboken', chapters: 40 },
    { id: 'Lev', name_sv: 'Tredje Moseboken', chapters: 27 },
    { id: 'Num', name_sv: 'Fjärde Moseboken', chapters: 36 },
    { id: 'Deu', name_sv: 'Femte Moseboken', chapters: 34 },
    { id: 'Jos', name_sv: 'Josua', chapters: 24 },
    { id: 'Jdg', name_sv: 'Domarboken', chapters: 21 },
    { id: 'Rut', name_sv: 'Rut', chapters: 4 },
    { id: '1Sa', name_sv: '1 Samuelsboken', chapters: 31 },
    { id: '2Sa', name_sv: '2 Samuelsboken', chapters: 24 },
    { id: '1Ki', name_sv: '1 Kungaboken', chapters: 22 },
    { id: '2Ki', name_sv: '2 Kungaboken', chapters: 25 },
    { id: '1Ch', name_sv: '1 Krönikeboken', chapters: 29 },
    { id: '2Ch', name_sv: '2 Krönikeboken', chapters: 36 },
    { id: 'Ezr', name_sv: 'Esra', chapters: 10 },
    { id: 'Neh', name_sv: 'Nehemja', chapters: 13 },
    { id: 'Est', name_sv: 'Ester', chapters: 10 },
    { id: 'Job', name_sv: 'Job', chapters: 42 },
    { id: 'Psa', name_sv: 'Psaltaren', chapters: 150 },
    { id: 'Pro', name_sv: 'Ordspråksboken', chapters: 31 },
    { id: 'Ecc', name_sv: 'Predikaren', chapters: 12 },
    { id: 'Sng', name_sv: 'Höga Visan', chapters: 8 },
    { id: 'Isa', name_sv: 'Jesaja', chapters: 66 },
    { id: 'Jer', name_sv: 'Jeremia', chapters: 52 },
    { id: 'Lam', name_sv: 'Klagovisorna', chapters: 5 },
    { id: 'Eze', name_sv: 'Hesekiel', chapters: 48 },
    { id: 'Dan', name_sv: 'Daniel', chapters: 12 },
    { id: 'Hos', name_sv: 'Hosea', chapters: 14 },
    { id: 'Joe', name_sv: 'Joel', chapters: 3 },
    { id: 'Amo', name_sv: 'Amos', chapters: 9 },
    { id: 'Oba', name_sv: 'Obadja', chapters: 1 },
    { id: 'Jon', name_sv: 'Jona', chapters: 4 },
    { id: 'Mic', name_sv: 'Mika', chapters: 7 },
    { id: 'Nah', name_sv: 'Nahum', chapters: 3 },
    { id: 'Hab', name_sv: 'Habackuk', chapters: 3 },
    { id: 'Zep', name_sv: 'Sefanja', chapters: 3 },
    { id: 'Hag', name_sv: 'Haggai', chapters: 2 },
    { id: 'Zec', name_sv: 'Sakarja', chapters: 14 },
    { id: 'Mal', name_sv: 'Malaki', chapters: 4 }
  ];

  const [selectedBookId, setSelectedBookId] = useState('Gen');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  
  const [chapterWords, setChapterWords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWord, setSelectedWord] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setUser(null);
        setCredits(null);
        setIsTester(false);
        setAuthLoading(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthLoading(false);
      return;
    }
    setUser(user);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      setCredits(profile.credits ?? profile.tokens ?? 0);
      setIsTester(profile.is_tester);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    const bookParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    if (bookParam) setSelectedBookId(bookParam);
    if (chapterParam) setSelectedChapter(Number(chapterParam) || 1);
    if (verseParam) setSelectedVerse(Number(verseParam) || 1);
  }, [searchParams]);

  const currentBookObj = hebrewBooks.find(b => b.id === selectedBookId) || hebrewBooks[0];
  const chapters = Array.from({ length: currentBookObj.chapters }, (_, i) => i + 1);

  useEffect(() => {
    async function loadChapterWords() {
      setLoading(true);
      try {
        const prefix = `${selectedBookId}.${selectedChapter}.`;
        const { data, error } = await supabase
          .from('hebrew_verses')
          .select('*')
          .ilike('reference', `${prefix}%`)
          .order('id', { ascending: true });

        if (error) throw error;
        setChapterWords(data || []);
      } catch (err) {
        console.error('Kunde inte hämta kapiteldata från Supabase:', err);
        setChapterWords([]);
      } finally {
        setLoading(false);
      }
    }

    loadChapterWords();
  }, [selectedBookId, selectedChapter]);

  const verses = Array.from(
    new Set(
      chapterWords.map(w => {
        const parts = w.reference.split('.');
        if (parts.length >= 2) {
          const versePart = parts[1].split('#')[0];
          return Number(versePart);
        }
        return 1;
      }).filter(v => !isNaN(v))
    )
  ).sort((a, b) => a - b);

  const currentWords = chapterWords.filter(w => {
    const parts = w.reference.split('.');
    if (parts.length >= 2) {
      const versePart = Number(parts[1].split('#')[0]);
      return versePart === selectedVerse;
    }
    return false;
  });

  const currentVerseIndex = verses.indexOf(selectedVerse);

  const handlePrevVerse = () => {
    if (currentVerseIndex > 0) setSelectedVerse(verses[currentVerseIndex - 1]);
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) setSelectedVerse(verses[currentVerseIndex + 1]);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased selection:bg-[#2d3732] selection:text-white flex flex-col justify-between">
      <div>
        
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#faf8f5]/85 backdrop-blur-md border-b border-[#e8e4df]/80">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#1a1d1b]">PREDIKA</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f0ece6] text-[#2d3732] px-2 py-0.5 rounded-full border border-[#e8e4df]">
                  beta
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* HUVUDINNEHÅLL */}
        <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-16">
          
          <div className="mb-8">
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                    <Languages className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                    Rena hebreiskan
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
                  Studera Gamla testamentets grundtext (TAHOT Dataset) med translitteration, glosa, Strongs-nummer och morfologi.
                </p>
              </div>

              {/* RULLGARDINER */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={selectedBookId}
                    onChange={(e) => {
                      setSelectedBookId(e.target.value);
                      setSelectedChapter(1);
                      setSelectedVerse(1);
                    }}
                    className="appearance-none bg-[#faf8f5] border border-[#e8e4df] text-[#1a1d1b] text-xs font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#2d3732] cursor-pointer"
                  >
                    {hebrewBooks.map(book => (
                      <option key={book.id} value={book.id}>{book.name_sv}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#575c58] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => {
                      setSelectedChapter(Number(e.target.value) || 1);
                      setSelectedVerse(1);
                    }}
                    className="appearance-none bg-[#faf8f5] border border-[#e8e4df] text-[#1a1d1b] text-xs font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#2d3732] cursor-pointer"
                  >
                    {chapters.map(chap => (
                      <option key={chap} value={chap}>Kap {chap}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#575c58] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedVerse}
                    onChange={(e) => setSelectedVerse(Number(e.target.value) || 1)}
                    className="appearance-none bg-[#faf8f5] border border-[#e8e4df] text-[#1a1d1b] text-xs font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#2d3732] cursor-pointer"
                  >
                    {verses.length > 0 ? verses.map(v => (
                      <option key={v} value={v}>Vers {v}</option>
                    )) : <option value={1}>Vers 1</option>}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#575c58] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* AKTIV VERSVISNING */}
          <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#e8e4df] pb-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-xs font-bold text-[#8c918d] uppercase tracking-wider">
                  <span>{currentBookObj ? currentBookObj.name_sv : ''} {selectedChapter}:{selectedVerse}</span>
                </div>
                
                {/* Val av löpande översättning + Info-knapp */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-0.5 text-[11px] font-medium">
                    <button type="button" onClick={() => setRunningTranslationLang('sv')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'sv' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>SFB 2015</button>
                    <button type="button" onClick={() => setRunningTranslationLang('en')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'en' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>ESV</button>
                    <button type="button" onClick={() => setRunningTranslationLang('es')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'es' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>Reina-Valera</button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSourceInfo(!showSourceInfo)}
                    className="flex items-center gap-1 text-[11px] font-medium bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] text-[#575c58] px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Information om översättningskällor"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Info</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-1">
                <button type="button" onClick={handlePrevVerse} disabled={currentVerseIndex <= 0} className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[11px] font-semibold text-[#575c58] px-2">{verses.length > 0 ? `${currentVerseIndex + 1} / ${verses.length}` : '0 / 0'}</span>
                <button type="button" onClick={handleNextVerse} disabled={currentVerseIndex >= verses.length - 1} className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* INFO-BOX OM KÄLLOR */}
            {showSourceInfo && (
              <div className="mb-6 p-4 bg-[#faf8f5] rounded-xl border border-[#e8e4df] text-xs text-[#575c58] space-y-2">
                <div className="font-bold text-[#1a1d1b] flex items-center justify-between">
                  <span>Om översättningskällorna</span>
                  <button onClick={() => setShowSourceInfo(false)} className="text-[10px] text-[#8c918d] hover:text-[#1a1d1b]">Stäng ✕</button>
                </div>
                <p>• <strong>SFB 2015:</strong> Svenska Folkbibeln 2015, utgiven av Svenska Bibelsällskapet / Bibeltrogna Vänner.</p>
                <p>• <strong>ESV (English Standard Version):</strong> En ordagrann och pålitlig engelsk bibelöversättning som balanserar bokstavstrogenhet med god läsbarhet.</p>
                <p>• <strong>Reina-Valera 1960:</strong> En av de mest spridda och historiska spanska bibelöversättningarna.</p>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-xs text-[#8c918d]">Laddar hebreisk grundtext...</div>
            ) : currentWords.length > 0 ? (
              <div>
                <div dir="rtl" className="py-6 flex flex-wrap gap-x-6 gap-y-10 items-end justify-start">
                  {currentWords.map((word) => (
                    <div 
                      key={word.id} 
                      className="flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-[#f5f2ed] transition-colors relative group border border-transparent hover:border-[#e8e4df]"
                      onClick={() => setSelectedWord(word)}
                    >
                      {/* 1. Originalhebreiska */}
                      <span className="text-3xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-700 transition-colors" dir="rtl">
                        {word.hebrew}
                      </span>
                      
                      {/* 2. Transliteration (uttal direkt under hebreiskan) */}
                      <span className="text-[11px] font-mono text-amber-700 mt-1" dir="ltr">
                        {word.transliteration}
                      </span>

                      {/* 3. Engelsk glosa (från kolumnen "translation") */}
                      <span className="text-xs font-semibold text-blue-800 mt-1 max-w-[120px] text-center truncate" dir="ltr">
                        {word.translation || '—'}
                      </span>

                      {/* 4. Strongs och grammatik */}
                      <div className="flex items-center gap-1.5 mt-1" dir="ltr">
                        {word.strongs && (
                          <span className="text-[10px] font-mono text-slate-500 bg-[#faf8f5] px-1 rounded border border-[#e8e4df]">
                            {word.strongs}
                          </span>
                        )}
                        {word.grammar && (
                          <span className="text-[9px] font-mono text-[#8c918d] bg-[#faf8f5] px-1 rounded border border-[#e8e4df] max-w-[80px] truncate">
                            {word.grammar}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <RunningVerseTranslation book={selectedBookId} chapter={selectedChapter} verse={selectedVerse} lang={runningTranslationLang} />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8c918d]">Ingen hebreisk text hittades för denna vers.</div>
            )}
          </section>
        </main>
      </div>

      {/* KLICK-SIDOPANEL (DRAWER) FÖR FULLSTÄNDIG MORFOLOGI & LEXIKON */}
      {selectedWord && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
          <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium" dir="rtl">{selectedWord.hebrew}</h3>
                {selectedWord?.strongs && (
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                    {selectedWord.strongs}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#575c58] mt-2">
                Transliteration: <span className="font-mono text-amber-700 font-semibold">{selectedWord.transliteration}</span>
              </p>
              <p className="text-xs text-[#575c58] mt-1">
                Glosa: <span className="font-semibold text-blue-800">{selectedWord.translation || '—'}</span>
              </p>
            </div>
            <button type="button" onClick={() => setSelectedWord(null)} className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#575c58] hover:text-[#1a1d1b]">✕</button>
          </div>

          <div className="py-6 space-y-4 flex-1 overflow-y-auto text-xs text-[#575c58]">
            <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e4df] space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-1">Grammatisk analys</span>
                <p className="text-sm text-[#1a1d1b] leading-relaxed font-medium">
                  {parseHebrewMorphology(selectedWord.grammar)}
                </p>
              </div>

              {selectedWord?.grammar && (
                <div className="pt-3 border-t border-[#e8e4df]">
                  <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-1">Original morfologikod (TAHOT)</span>
                  <span className="font-mono text-xs text-[#1a1d1b] bg-white px-2 py-1 rounded border border-[#e8e4df] inline-block">
                    {selectedWord.grammar}
                  </span>
                </div>
              )}

              {selectedWord?.expanded_tags && (
                <div className="pt-3 border-t border-[#e8e4df]">
                  <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-1">Lexikoninformation & Rot</span>
                  <div className="font-mono text-[11px] text-[#1a1d1b] bg-white p-2.5 rounded border border-[#e8e4df] whitespace-pre-wrap leading-relaxed">
                    {selectedWord.expanded_json || selectedWord.expanded_tags}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} message={modalMessage} onAuthSuccess={() => fetchProfile()} />
    </div>
  );
}

export default function HebrewAnalys() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs text-[#575c58]">Laddar hebreisk läsare...</div>}>
      <HebrewAnalysContent />
    </Suspense>
  );
}