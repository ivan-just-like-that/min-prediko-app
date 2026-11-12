'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { useSearchParams } from 'next/navigation';
import { 
  Compass,
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Languages, 
  Smile, 
  Feather, 
  BookMarked, 
  Sprout, 
  TrendingUp, 
  LogOut,
  KeyRound,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

// ---------------------------------------------------------
// HJÄLPFUNKTION: ÖVERSÄTT OSHB MORFOLOGI-KOD TILL SVENSKA
// ---------------------------------------------------------
function parseHebrewMorphology(code) {
  if (!code) return 'Ingen morfologisk data tillgänglig';
  
  let result = [];
  const firstChar = code.charAt(0);

  // Ordklass
  if (firstChar === 'H') result.push('Substantiv / Egennamn');
  else if (firstChar === 'V') result.push('Verb');
  else if (firstChar === 'A') result.push('Adjektiv');
  else if (firstChar === 'R')result.push('Preposition');
  else if (firstChar === 'C') result.push('Konjunktion');
  else if (firstChar === 'D') result.push('Adverb');
  else if (firstChar === 'P') result.push('Pronomen');
  else if (firstChar === 'T') result.push('Partikel');
  else result.push(`Kod: ${code}`);

  // Verb-stammar (Stem)
  if (code.includes('q')) result.push('Qal (enkel aktiv)');
  if (code.includes('N')) result.push('Nifal (passiv/reflexiv)');
  if (code.includes('p')) result.push('Piel (intensiv aktiv)');
  if (code.includes('P')) result.push('Pual (intensiv passiv)');
  if (code.includes('h')) result.push('Hifil (kausativ aktiv)');
  if (code.includes('H')) result.push('Hofal (kausativ passiv)');
  if (code.includes('t')) result.push('Hitpael (reflexiv)');

  // Verb-tempus / aspekt
  if (code.includes('pf')) result.push('Perfekt (avslutad handling)');
  if (code.includes('im')) result.push('Imperfekt (pågående handling)');
  if (code.includes('im')) result.push('Imperfekt');
  if (code.includes('iv')) result.push('Imperativ (befallning)');
  if (code.includes('in')) result.push('Infinitiv');
  if (code.includes('pt')) result.push('Particip');

  // Person, genus, numerus
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

// ---------------------------------------------------------
// LÖPANDE VERSÖVERSÄTTNING (SERVER API PROXY)
// ---------------------------------------------------------
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [runningTranslationLang, setRunningTranslationLang] = useState('sv');

  const hebrewBooks = [
    { id: 'Genesis', name_sv: 'Första Moseboken', chapters: 50 },
    { id: 'Exodus', name_sv: 'Andra Moseboken', chapters: 40 },
    { id: 'Leviticus', name_sv: 'Tredje Moseboken', chapters: 27 },
    { id: 'Numbers', name_sv: 'Fjärde Moseboken', chapters: 36 },
    { id: 'Deuteronomy', name_sv: 'Femte Moseboken', chapters: 34 },
    { id: 'Joshua', name_sv: 'Josua', chapters: 24 },
    { id: 'Judges', name_sv: 'Domarboken', chapters: 21 },
    { id: 'Ruth', name_sv: 'Rut', chapters: 4 },
    { id: '1Samuel', name_sv: '1 Samuelsboken', chapters: 31 },
    { id: '2Samuel', name_sv: '2 Samuelsboken', chapters: 24 },
    { id: '1Kings', name_sv: '1 Kungaboken', chapters: 22 },
    { id: '2Kings', name_sv: '2 Kungaboken', chapters: 25 },
    { id: '1Chronicles', name_sv: '1 Krönikeboken', chapters: 29 },
    { id: '2Chronicles', name_sv: '2 Krönikeboken', chapters: 36 },
    { id: 'Ezra', name_sv: 'Esra', chapters: 10 },
    { id: 'Nehemiah', name_sv: 'Nehemja', chapters: 13 },
    { id: 'Esther', name_sv: 'Ester', chapters: 10 },
    { id: 'Job', name_sv: 'Job', chapters: 42 },
    { id: 'Psalms', name_sv: 'Psaltaren', chapters: 150 },
    { id: 'Proverbs', name_sv: 'Ordspråksboken', chapters: 31 },
    { id: 'Ecclesiastes', name_sv: 'Predikaren', chapters: 12 },
    { id: 'SongOfSolomon', name_sv: 'Höga Visan', chapters: 8 },
    { id: 'Isaiah', name_sv: 'Jesaja', chapters: 66 },
    { id: 'Jeremiah', name_sv: 'Jeremia', chapters: 52 },
    { id: 'Lamentations', name_sv: 'Klagovisorna', chapters: 5 },
    { id: 'Ezekiel', name_sv: 'Hesekiel', chapters: 48 },
    { id: 'Daniel', name_sv: 'Daniel', chapters: 12 },
    { id: 'Hosea', name_sv: 'Hosea', chapters: 14 },
    { id: 'Joel', name_sv: 'Joel', chapters: 3 },
    { id: 'Amos', name_sv: 'Amos', chapters: 9 },
    { id: 'Obadiah', name_sv: 'Obadja', chapters: 1 },
    { id: 'Jonah', name_sv: 'Jona', chapters: 4 },
    { id: 'Micah', name_sv: 'Mika', chapters: 7 },
    { id: 'Nahum', name_sv: 'Nahum', chapters: 3 },
    { id: 'Habakkuk', name_sv: 'Habackuk', chapters: 3 },
    { id: 'Zephaniah', name_sv: 'Sefanja', chapters: 3 },
    { id: 'Haggai', name_sv: 'Haggai', chapters: 2 },
    { id: 'Zechariah', name_sv: 'Sakarja', chapters: 14 },
    { id: 'Malachi', name_sv: 'Malaki', chapters: 4 }
  ];

  const [selectedBookId, setSelectedBookId] = useState('Genesis');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData] = useState({});
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedWord, setSelectedWord] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys av Nya testamentet', href: '/grekiska', icon: Languages },
    { name: 'Rena hebreiskan', desc: 'Grundtextanalys av Gamla testamentet', href: '/hebreiska', icon: Languages },
    { name: 'Bibelatlas', desc: 'Interaktiv karta & historisk tidslinje', href: '/karta', icon: Compass },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked },
    { name: 'Predikantpepp', desc: 'Uppmuntran, quiz, poesi mm', href: '/predikantpepp', icon: Sprout },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp },
  ];

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

  useEffect(() => {
    const currentBook = hebrewBooks.find(b => b.id === selectedBookId);
    if (currentBook) {
      const chapList = Array.from({ length: currentBook.chapters }, (_, i) => i + 1);
      setChapters(chapList);
      if (!chapList.includes(selectedChapter)) {
        setSelectedChapter(1);
      }
    }
  }, [selectedBookId]);

  useEffect(() => {
    async function loadStaticChapter() {
      setLoading(true);
      try {
        const res = await fetch(`/data/hebrew/${selectedBookId}/${selectedChapter}.json`);
        if (!res.ok) throw new Error('Kapitelfil saknas');
        const data = await res.json();
        setChapterData(data);

        const verseNumbers = Object.keys(data).map(Number).sort((a, b) => a - b);
        setVerses(verseNumbers);
        if (!verseNumbers.includes(selectedVerse)) {
          setSelectedVerse(verseNumbers[0] || 1);
        }
      } catch (err) {
        console.error('Kunde inte läsa statisk hebreisk text:', err);
        setChapterData({});
        setVerses([]);
      } finally {
        setLoading(false);
      }
    }

    loadStaticChapter();
  }, [selectedBookId, selectedChapter]);

  const currentWords = chapterData[selectedVerse] || [];
  const currentBookObj = hebrewBooks.find(b => b.id === selectedBookId);
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
                  Studera Gamla testamentets grundtext (Westminster Leningrad Codex) med Strongs-nummer och morfologi.
                </p>
              </div>

              {/* RULLGARDINER */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
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
                    value={selectedChapter || 1}
                    onChange={(e) => setSelectedChapter(Number(e.target.value) || 1)}
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
                    value={selectedVerse || 1}
                    onChange={(e) => setSelectedVerse(Number(e.target.value) || 1)}
                    className="appearance-none bg-[#faf8f5] border border-[#e8e4df] text-[#1a1d1b] text-xs font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#2d3732] cursor-pointer"
                  >
                    {verses.map(v => (
                      <option key={v} value={v}>Vers {v}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#575c58] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* AKTIV VERSVISNING */}
          <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#e8e4df] pb-3">
              <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-[#8c918d] uppercase tracking-wider">
                  <span>{currentBookObj ? currentBookObj.name_sv : ''} {selectedChapter}:{selectedVerse}</span>
                </div>
                <div className="flex items-center bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-0.5 text-[11px] font-medium">
                  <button type="button" onClick={() => setRunningTranslationLang('sv')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'sv' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>SFB 2015</button>
                  <button type="button" onClick={() => setRunningTranslationLang('en')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'en' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>ESV</button>
                  <button type="button" onClick={() => setRunningTranslationLang('es')} className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'es' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}>Reina-Valera</button>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-1">
                <button type="button" onClick={handlePrevVerse} disabled={currentVerseIndex <= 0} className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[11px] font-semibold text-[#575c58] px-2">{verses.length > 0 ? `${currentVerseIndex + 1} / ${verses.length}` : '0 / 0'}</span>
                <button type="button" onClick={handleNextVerse} disabled={currentVerseIndex >= verses.length - 1} className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

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
                      <span className="text-3xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-700 transition-colors">
                        {word.hebrew}
                      </span>
                      <span className="text-xs font-semibold text-blue-800 mt-1" dir="ltr">
                        {word.gloss || '—'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1" dir="ltr">
                        {word.strongs && (
                          <span className="text-[10px] font-mono text-slate-500 bg-[#faf8f5] px-1 rounded border border-[#e8e4df]">
                            {word.strongs}
                          </span>
                        )}
                        {word.morph && (
                          <span className="text-[9px] font-mono text-[#8c918d] bg-[#faf8f5] px-1 rounded border border-[#e8e4df]">
                            {word.morph}
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

      {/* KLICK-SIDOPANEL (DRAWER) MED UTRÄKNAD MORFOLOGI */}
      {selectedWord && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
          <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium">{selectedWord.hebrew}</h3>
                {selectedWord?.strongs && (
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-semibold">
                    {selectedWord.strongs}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#575c58] mt-2">
                Ordagrant val: <span className="font-semibold text-blue-800">{selectedWord.gloss || '—'}</span>
              </p>
            </div>
            <button type="button" onClick={() => setSelectedWord(null)} className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#575c58] hover:text-[#1a1d1b]">✕</button>
          </div>

          <div className="py-6 space-y-4 flex-1 overflow-y-auto text-xs text-[#575c58]">
            <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e4df] space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-1">Grammatisk analys</span>
                <p className="text-sm text-[#1a1d1b] leading-relaxed font-medium">
                  {parseHebrewMorphology(selectedWord.morph)}
                </p>
              </div>

              {selectedWord?.morph && (
                <div className="pt-3 border-t border-[#e8e4df]">
                  <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-1">Original morfologikod (OSHB)</span>
                  <span className="font-mono text-xs text-[#1a1d1b] bg-white px-2 py-1 rounded border border-[#e8e4df] inline-block">
                    {selectedWord.morph}
                  </span>
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