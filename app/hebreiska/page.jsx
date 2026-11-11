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

  // Gamla testamentets böcker anpassade för Bolls Life API (inga understreck)
  const hebrewBooks = [
    { id: 'Genesis', name_sv: 'Första Moseboken', chapters: 50 },
    { id: 'Exodus', name_sv: 'Andra Moseboken', chapters: 40 },
    { id: 'Leviticus', name_sv: 'Tredje Moseboken', chapters: 27 },
    { id: 'Numbers', name_sv: 'Fjärde Moseboken', chapters: 36 },
    { id: 'Deuteronomy', name_sv: 'Femte Moseboken', chapters: 34 },
    { id: 'Joshua', name_sv: 'Josua', chapters: 24 },
    { id: 'Judges', name_sv: 'Domarboken', chapters: 21 },
    { id: '1Samuel', name_sv: '1 Samuelsboken', chapters: 31 },
    { id: '2Samuel', name_sv: '2 Samuelsboken', chapters: 24 },
    { id: '1Kings', name_sv: '1 Kungaboken', chapters: 22 },
    { id: '2Kings', name_sv: '2 Kungaboken', chapters: 25 },
    { id: 'Isaiah', name_sv: 'Jesaja', chapters: 66 },
    { id: 'Jeremiah', name_sv: 'Jeremia', chapters: 52 },
    { id: 'Ezekiel', name_sv: 'Hesekiel', chapters: 48 },
    { id: 'Psalms', name_sv: 'Psaltaren', chapters: 150 },
    { id: 'Proverbs', name_sv: 'Ordspråksboken', chapters: 31 },
    { id: 'Job', name_sv: 'Job', chapters: 42 }
  ];

  const [selectedBookId, setSelectedBookId] = useState('Genesis');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(1);
  
  const [currentWords, setCurrentWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Klick & Sidopanel (Lexikon)
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordDetails, setWordDetails] = useState(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);

  // Auth-states från Predika
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

  // URL-parametrar
  useEffect(() => {
    const bookParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    if (bookParam) setSelectedBookId(bookParam);
    if (chapterParam) setSelectedChapter(Number(chapterParam) || 1);
    if (verseParam) setSelectedVerse(Number(verseParam) || 1);
  }, [searchParams]);

  // Uppdatera kapitel när bok ändras
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

  // Generera en rimlig verslista (t.ex. 60 verser som standard eller beroende på kapitel)
  useEffect(() => {
    const verseList = Array.from({ length: 60 }, (_, i) => i + 1);
    setVerses(verseList);
  }, [selectedBookId, selectedChapter]);


// Hämta vers via din egna server-route (löser CORS)
  useEffect(() => {
    async function fetchVerse() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hebrew-verse?book=${selectedBookId}&chapter=${selectedChapter}&verse=${selectedVerse}`);
        const data = await res.json();

        const verseObj = Array.isArray(data) ? data[0] : data;

        if (verseObj && verseObj.text) {
          const rawText = verseObj.text;
          
          const regex = /<w\s+strong="([^"]+)">([^<]+)<\/w>/g;
          let match;
          let wordsArray = [];
          let idx = 0;

          while ((match = regex.exec(rawText)) !== null) {
            wordsArray.push({
              id: idx++,
              strongs: match[1],
              hebrew: match[2].trim()
            });
          }

          if (wordsArray.length === 0) {
            const cleanText = rawText.replace(/<[^>]*>/g, '');
            wordsArray = cleanText.trim().split(/\s+/).filter(Boolean).map((w, i) => ({
              id: i,
              hebrew: w,
              strongs: ''
            }));
          }

          setCurrentWords(wordsArray);
        } else {
          setCurrentWords([]);
        }
      } catch (err) {
        console.error('Kunde inte hämta vers:', err);
        setCurrentWords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [selectedBookId, selectedChapter, selectedVerse]);

  // Hantera klick på ord för lexikonuppslag och Strongs
  const handleWordClick = async (wordObj) => {
    setSelectedWord(wordObj);
    setIsLoadingWord(true);

    try {
      const res = await fetch(`/api/hebrew-word?word=${encodeURIComponent(wordObj.hebrew)}&strongs=${encodeURIComponent(wordObj.strongs || '')}`);
      const data = await res.json();
      setWordDetails(data);
    } catch (err) {
      console.error('Kunde inte hämta orddata:', err);
    } finally {
      setIsLoadingWord(false);
    }
  };

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

              <nav className="hidden md:flex items-center gap-1">
                <div className="relative" onMouseLeave={() => setToolsOpen(false)}>
                  <button 
                    onMouseEnter={() => setToolsOpen(true)}
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors"
                  >
                    Verktyg
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {toolsOpen && (
                    <div 
                      onMouseEnter={() => setToolsOpen(true)}
                      className="absolute top-full left-0 w-80 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 grid grid-cols-1 gap-1"
                    >
                      {verktygLista.map((v) => {
                        const Icon = v.icon;
                        return (
                          <Link key={v.href} href={v.href} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors group">
                            <div className="p-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-[#2d3732] group-hover:bg-[#2d3732] group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1a1d1b]">{v.name}</div>
                              <div className="text-[11px] text-[#8c918d]">{v.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link href="/om" className="px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors">
                  Om
                </Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!authLoading && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#575c58]">{isTester ? '✨ Testkonto' : `⚡ ${credits ?? 0} krediter`}</span>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-3 py-2 text-xs font-semibold text-[#1a1d1b] bg-white border border-[#e8e4df] hover:bg-[#f0ece6] rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logga ut
                  </button>
                </div>
              ) : !authLoading && (
                <button
                  onClick={() => {
                    setModalMessage('Skapa ett konto för att få tillgång!');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2d3732] hover:bg-[#1f2723] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Logga in
                </button>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-[#575c58] hover:text-[#1a1d1b]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-[#e8e4df] px-6 py-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8c918d]">Verktyg</div>
              <div className="grid grid-cols-1 gap-2">
                {verktygLista.map((v) => (
                  <Link key={v.href} href={v.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#1a1d1b] py-1">
                    {v.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
                  Studera Gamla testamentets grundtext med ord-för-ord-översättning och Strongs-nummer via Bolls Life API (WLC).
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
                      <option key={book.id} value={book.id}>
                        {book.name_sv}
                      </option>
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

          {/* AKTIV VERSVISNING (HEBREISKA / RTL) */}
          <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#e8e4df] pb-3">
              <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-[#8c918d] uppercase tracking-wider">
                  <span>
                    {currentBookObj ? currentBookObj.name_sv : ''} {selectedChapter}:{selectedVerse}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-0.5 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setRunningTranslationLang('sv')}
                      className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'sv' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}
                    >
                      SFB 2015
                    </button>
                    <button
                      type="button"
                      onClick={() => setRunningTranslationLang('en')}
                      className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'en' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}
                    >
                      ESV
                    </button>
                    <button
                      type="button"
                      onClick={() => setRunningTranslationLang('es')}
                      className={`px-2 py-1 rounded-md transition-colors ${runningTranslationLang === 'es' ? 'bg-white text-[#1a1d1b] shadow-sm font-bold' : 'text-[#8c918d]'}`}
                    >
                      Reina-Valera
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#575c58] hover:text-[#1a1d1b] bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Om källor"
                  >
                    <Info className="w-3.5 h-3.5 text-[#2d3732]" />
                    <span className="hidden sm:inline">Om källorna</span>
                  </button>
                </div>
              </div>

              {/* BLÄDDRINGSPILAR */}
              <div className="flex items-center gap-1 bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-1">
                <button
                  type="button"
                  onClick={handlePrevVerse}
                  disabled={currentVerseIndex <= 0}
                  className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-[#575c58] px-2">
                  {currentVerseIndex + 1} / {verses.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextVerse}
                  disabled={currentVerseIndex >= verses.length - 1}
                  className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#8c918d]">Hämtar hebreisk text från Bolls Life API (WLC)...</div>
            ) : currentWords.length > 0 ? (
              <div>
                {/* HEBREISK TEXT (RTL) */}
                <div dir="rtl" className="py-6 flex flex-wrap gap-x-6 gap-y-8 items-end justify-start">
                  {currentWords.map((word) => (
                    <div 
                      key={word.id} 
                      className="flex flex-col items-center cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors relative group"
                      onClick={() => handleWordClick(word)}
                    >
                      <span className="text-3xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-600 transition-colors">
                        {word.hebrew}
                      </span>
                      {word.strongs && (
                        <span className="text-[10px] font-mono text-blue-600 mt-1">
                          {word.strongs}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <RunningVerseTranslation 
                  book={selectedBookId} 
                  chapter={selectedChapter} 
                  verse={selectedVerse} 
                  lang={runningTranslationLang} 
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8c918d]">Ingen hebreisk text hittades för denna vers.</div>
            )}
          </section>

        </main>
      </div>

      {/* KLICK-SIDOPANEL FÖR LEXIKON (DRAWER) */}
      {selectedWord && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
          <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium">{selectedWord.hebrew}</h3>
                {selectedWord?.strongs && (
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {selectedWord.strongs}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#575c58] font-serif mt-1">
                Rot: <span className="font-medium text-[#1a1d1b]">{wordDetails?.lemma || '—'}</span>
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedWord(null)} 
              className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#575c58] hover:text-[#1a1d1b]"
            >
              ✕
            </button>
          </div>

          <div className="py-4 space-y-3 border-b border-[#e8e4df] text-xs">
            <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-0.5">Lexikal betydelse (Glosa)</span>
                <span className="text-sm font-semibold text-blue-700">
                  {isLoadingWord ? 'Hämtar data...' : (wordDetails?.gloss || '—')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs text-[#575c58]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8c918d]">Lexikal översikt & Definition</h4>
            <p className="leading-relaxed">
              {isLoadingWord ? 'Laddar definition...' : (wordDetails?.definition || 'Ingen extra information tillgänglig för detta ord.')}
            </p>
          </div>
        </div>
      )}

      {/* MODAL / INFO-RUTA OM ÖVERSÄTTNINGAR */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e8e4df] space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#e8e4df] pb-3">
              <h3 className="text-lg font-bold text-[#1a1d1b]">
                Om bibelöversättningar och källor
              </h3>
              <button 
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#575c58] hover:text-[#1a1d1b] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#575c58] leading-relaxed">
              <p>
                Denna plattform är utformad för djupstudier av Gamla testamentets hebreiska grundtext.
              </p>

              <div className="space-y-2 pt-1">
                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                  <strong className="text-[#1a1d1b] block mb-1">
                    Grundtext & Strongs (Bolls Life API)
                  </strong>
                  <span>
                    Den hebreiska grundtexten (WLC) med tillhörande Strongs-nummer hämtas dynamiskt via Bolls Life API.
                  </span>
                </div>

                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                  <strong className="text-[#1a1d1b] block mb-1">
                    Löpande översättningar & copyright
                  </strong>
                  <p className="mb-2">
                    Av upphovsrättsskäl används dessa etablerade bibelöversättningar för den löpande texten:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Svenska:</strong> Svenska Folkbibeln 2015 (SFB 2015)</li>
                    <li><strong>Engelska:</strong> English Standard Version (ESV)</li>
                    <li><strong>Spanska:</strong> Reina-Valera 1960 (RV1960)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-[#2d3732] text-white text-xs font-semibold rounded-xl hover:bg-[#1f2723] transition-colors"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#e8e4df] bg-white py-16 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-3">
            <span className="font-bold text-lg tracking-tight text-[#1a1d1b]">PREDIKA</span>
            <p className="text-xs text-[#8c918d] max-w-xs leading-relaxed">
              En modern plattform för teologisk fördjupning, predikoförberedelse och undervisning.
            </p>
            <p className="text-[11px] text-[#8c918d]">© 2026 Patric Ivan</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1d1b]">Verktyg</h4>
            <ul className="space-y-2 text-xs text-[#575c58]">
              {verktygLista.map((v) => (
                <li key={v.href}>
                  <Link href={v.href} className="hover:text-[#1a1d1b] transition-colors">{v.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message={modalMessage}
        onAuthSuccess={() => fetchProfile()} 
      />
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