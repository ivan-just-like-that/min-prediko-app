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
  ArrowUpRight,
  LogOut,
  KeyRound,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Library
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

// ---------------------------------------------------------
// SVENSK MORFOLOGI-TOLK
// ---------------------------------------------------------
function translateMorphology(code) {
  if (!code) return 'Ingen morfologi';

  const parts = code.split('-');
  const pos = parts[0]; 
  const details = parts.slice(1).join('-'); 

  if (pos === 'P' || pos === 'PRON') {
    const pronLabel = 'Pronomen';
    const subParts = details.split('-');
    const codeStr = subParts[0] || details;
    
    const detailsList = [];
    for (const char of codeStr) {
      if (char === '1') detailsList.push('1 pers');
      if (char === '2') detailsList.push('2 pers');
      if (char === '3') detailsList.push('3 pers');
      if (char === 'N') detailsList.push('nom');
      if (char === 'G') detailsList.push('gen');
      if (char === 'D') detailsList.push('dat');
      if (char === 'A') detailsList.push('ack');
      if (char === 'V') detailsList.push('vok');
      if (char === 'S') detailsList.push('sing');
      if (char === 'P') detailsList.push('plur');
      if (char === 'M') detailsList.push('mask');
      if (char === 'F') detailsList.push('fem');
      if (char === 'N' && !codeStr.includes('NOM')) detailsList.push('neutr');
    }

    const desc = detailsList.join(', ');
    return desc ? `${pronLabel} (${desc})` : pronLabel;
  }

  if (pos === 'N') {
    const cases = { 'N': 'nom', 'G': 'gen', 'D': 'dat', 'A': 'ack', 'V': 'vok' };
    const numbers = { 'S': 'sing', 'P': 'plur' };
    const genders = { 'M': 'mask', 'F': 'fem', 'N': 'neutr' };

    const c = cases[details[0]] || '';
    const n = numbers[details[1]] || '';
    const g = genders[details[2]] || '';

    const desc = [c, n, g].filter(Boolean).join(', ');
    const nounLabel = 'Substantiv';
    return desc ? `${nounLabel} (${desc})` : nounLabel;
  }

  if (pos === 'V') {
    const tMap = {
      'P': 'presens', 'I': 'imperfekt', 'F': 'futurum', 'A': 'aorist', 'X': 'perfekt', 'R': 'perfekt', 'L': 'pluskvamperfekt'
    };
    const mMap = {
      'I': 'indikativ', 'M': 'imperativ', 'S': 'konjunktiv', 'O': 'optativ', 'N': 'infinitiv', 'P': 'particip'
    };
    const vVoice = {
      'A': 'aktiv', 'M': 'medium', 'P': 'passiv', 'D': 'medium/passiv'
    };

    const subParts = details.split('-');
    const codePart = subParts[0] || ''; 
    const persPart = subParts[1] || ''; 

    const tense = tMap[codePart[0]] || '';
    const voice = vVoice[codePart[1]] || '';
    const mood = mMap[codePart[2]] || '';

    const verbDesc = [tense, voice, mood].filter(Boolean).join(', ');
    
    let persDesc = '';
    if (persPart === '1S') persDesc = '1 pers sing';
    if (persPart === '2S') persDesc = '2 pers sing';
    if (persPart === '3S') persDesc = '3 pers sing';
    if (persPart === '1P') persDesc = '1 pers plur';
    if (persPart === '2P') persDesc = '2 pers plur';
    if (persPart === '3P') persDesc = '3 pers plur';

    const fullVerb = [verbDesc, persDesc].filter(Boolean).join(', ');
    const verbLabel = 'Verb';
    return fullVerb ? `${verbLabel} (${fullVerb})` : verbLabel;
  }

  const posMap = {
    'PREP': 'Preposition',
    'CONJ': 'Konjunktion',
    'ADV': 'Adverb',
    'T': 'Partikel',
    'INJ': 'Interjektion'
  };

  return posMap[pos] ? posMap[pos] : code;
}

function GrekiskAnalysContent() {
  const searchParams = useSearchParams();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [runningTranslationLang, setRunningTranslationLang] = useState('sv');

  // Databas-states
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(1);
  
  const [currentWords, setCurrentWords] = useState([]);
  const [currentVerseText, setCurrentVerseText] = useState(''); 
  const [loading, setLoading] = useState(true);

  // Hover & Konkordans drawer
  const [hoveredWord, setHoveredWord] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedWord, setSelectedWord] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);

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
      const startCredits = profile.credits ?? profile.tokens ?? 0;
      setCredits(startCredits);
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
    if (chapterParam) {
      const parsedChap = Number(chapterParam);
      if (!isNaN(parsedChap)) setSelectedChapter(parsedChap);
    }
    if (verseParam) {
      const parsedVerse = Number(verseParam);
      if (!isNaN(parsedVerse)) setSelectedVerse(parsedVerse);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setBooks(data);
        if (!searchParams.get('book')) {
          setSelectedBookId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Kunde inte hämta böcker:', err);
    }
  };

  useEffect(() => {
    if (!selectedBookId) return;
    fetchChapters(selectedBookId);
  }, [selectedBookId]);

  const fetchChapters = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('verses')
        .select('chapter')
        .eq('book_id', bookId);

      if (error) throw error;
      if (data) {
        const uniqueChapters = Array.from(new Set(data.map(item => item.chapter))).sort((a, b) => a - b);
        setChapters(uniqueChapters);
        if (uniqueChapters.length > 0 && !searchParams.get('chapter')) {
          setSelectedChapter(uniqueChapters[0]);
        }
      }
    } catch (err) {
      console.error('Kunde inte hämta kapitel:', err);
    }
  };

  useEffect(() => {
    if (!selectedBookId || !selectedChapter) return;
    fetchVerses(selectedBookId, selectedChapter);
  }, [selectedBookId, selectedChapter]);

  const fetchVerses = async (bookId, chapterNum) => {
    try {
      const { data, error } = await supabase
        .from('verses')
        .select('verse')
        .eq('book_id', bookId)
        .eq('chapter', chapterNum)
        .order('verse', { ascending: true });

      if (error) throw error;
      if (data) {
        const verseList = data.map(item => item.verse);
        setVerses(verseList);
        if (verseList.length > 0 && !searchParams.get('verse')) {
          setSelectedVerse(verseList[0]);
        }
      }
    } catch (err) {
      console.error('Kunde inte hämta verser:', err);
    }
  };

  useEffect(() => {
    if (!selectedBookId || !selectedChapter || !selectedVerse) return;
    fetchVerseData(selectedBookId, selectedChapter, selectedVerse);
  }, [selectedBookId, selectedChapter, selectedVerse]);

  const fetchVerseData = async (bookId, chapterNum, verseNum) => {
    setLoading(true);
    try {
      const { data: wordsData, error: wordsError } = await supabase
        .from('interlinear_words')
        .select('*')
        .eq('book_id', bookId)
        .eq('chapter', chapterNum)
        .eq('verse', verseNum)
        .order('word_order', { ascending: true });

      if (wordsError) throw wordsError;

      if (wordsData && wordsData.length > 0) {
        setCurrentWords(wordsData);
        setCurrentVerseText('');
      } else {
        setCurrentWords([]);
        const { data: verseData } = await supabase
          .from('verses')
          .select('text')
          .eq('book_id', bookId)
          .eq('chapter', chapterNum)
          .eq('verse', verseNum)
          .maybeSingle();

        setCurrentVerseText(verseData?.text || '');
      }
    } catch (err) {
      console.error('Kunde inte hämta versdata:', err);
      setCurrentWords([]);
      setCurrentVerseText('');
    } finally {
      setLoading(false);
    }
  };

  // Nollställ visibleLimit till 50 när användaren klickar på ett nytt ord
  useEffect(() => {
    if (!selectedWord || !selectedWord.strong_code) return;
    setVisibleLimit(50);
  }, [selectedWord?.strong_code]);

  // Hämta förekomster med stöd för pagination via visibleLimit
  useEffect(() => {
    if (!selectedWord || !selectedWord.strong_code) return;

    async function fetchOccurrences() {
      setIsLoadingOccurrences(true);
      
      const { data, count, error } = await supabase
        .from('interlinear_words')
        .select('book_id, chapter, verse, greek, gloss_en, gloss_sv', { count: 'exact' })
        .eq('strong_code', selectedWord.strong_code)
        .limit(visibleLimit);

      if (!error && data) {
        setOccurrences(data);
        setTotalCount(count || 0);
      }
      setIsLoadingOccurrences(false);
    }

    fetchOccurrences();
  }, [selectedWord, visibleLimit]);

  const getBookName = (bookId) => {
    if (!bookId) return '';
    const cleanId = bookId.trim().toLowerCase();
    const bookTranslations = {
      'matthew': 'Matteusevangeliet',
      'matt': 'Matteusevangeliet',
      'mark': 'Markusevangeliet',
      'mrk': 'Markusevangeliet',
      'luke': 'Lukasevangeliet',
      'luk': 'Lukasevangeliet',
      'john': 'Johannesevangeliet',
      'jhn': 'Johannesevangeliet',
      'acts': 'Apostlagärningarna',
      'romans': 'Romarbrevet',
      '1corinthians': '1 Korinthierbrevet',
      '1cor': '1 Korinthierbrevet',
      'galatians': 'Galaterbrevet',
      'ephesians': 'Efesierbrevet',
      'philippians': 'Filipperbrevet',
      'colossians': 'Kolosserbrevet',
      '1thessalonians': '1 Thessalonikerbrevet',
      '2thessalonians': '2 Thessalonikerbrevet',
      '1timothy': '1 Timoteusbrevet',
      '2timothy': '2 Timoteusbrevet',
      'titus': 'Titusbrevet',
      'hebrews': 'Hebreerbrevet',
      'james': 'Jakobs brev',
      '1peter': '1 Petrusbrevet',
      '2peter': '2 Petrusbrevet',
      'revelation': 'Uppenbarelseboken'
    };
    return bookTranslations[cleanId] || bookId;
  };

  const currentBookObj = books.find(b => b.id.toLowerCase() === selectedBookId.toLowerCase());
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
        
       {/* HEADER (ATTIO-STYLE NAVIGATION) */}
        <header className="sticky top-0 z-50 bg-[#faf8f5]/85 backdrop-blur-md border-b border-[#e8e4df]/80">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* LOGOTYP & DESKTOP-MENY */}
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

            {/* DESKTOP HÖGER-NAVIGATION */}
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

            {/* MOBIL KNAPP */}
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-[#575c58] hover:text-[#1a1d1b]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* MOBIL MENY */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-[#e8e4df] px-6 py-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8c918d]">Verktyg</div>
              <div className="grid grid-cols-1 gap-2">
                {verktygLista.map((v) => (
                  <Link 
                    key={v.href} 
                    href={v.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-[#1a1d1b] py-1"
                  >
                    {v.name}
                  </Link>
                ))}
              </div>
              
              <div className="pt-4 border-t border-[#e8e4df]">
                <Link 
                  href="/om" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-[#1a1d1b] mb-4"
                >
                  Om PREDIKA
                </Link>
                {user ? (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      supabase.auth.signOut();
                    }} 
                    className="w-full py-2.5 bg-[#f0ece6] rounded-xl text-xs font-semibold text-[#1a1d1b]"
                  >
                    Logga ut
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }} 
                    className="w-full py-2.5 bg-[#2d3732] text-white rounded-xl text-xs font-semibold"
                  >
                    Logga in
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ANVÄNDARSTATUS */}
        {user && (
          <div className="bg-white border-b border-[#e8e4df] py-2 px-6">
            <div className="max-w-[1100px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
              <span className="truncate">Inloggad som: <strong className="text-[#1a1d1b]">{user.email}</strong></span>
            </div>
          </div>
        )}

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
                    Rena grekiskan
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
                  Studera grundtexten med ord för ord-översättning, hovra över orden för morfologisk analys och klicka för konkordans.
                </p>
              </div>

              {/* RULLGARDINER FÖR BOK, KAPITEL OCH VERS */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="appearance-none bg-[#faf8f5] border border-[#e8e4df] text-[#1a1d1b] text-xs font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-[#2d3732] cursor-pointer"
                  >
                    {books.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.name_sv || book.name_en}
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

          {/* AKTIV VERSVISNING (INTERLINJÄR) */}
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

                  {/* INFO-KNAPP */}
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
              <div className="py-12 text-center text-xs text-[#8c918d]">Laddar vers från databasen...</div>
            ) : currentWords.length > 0 ? (
              <div>
                <div className="py-6 flex flex-wrap gap-x-5 gap-y-6 items-end">
                  {currentWords.map((word) => (
                    <div 
                      key={word.id || word.word_order} 
                      className="flex flex-col items-center cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors relative group"
                      onMouseEnter={(e) => {
                        setHoveredWord(word);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredWord(null)}
                      onClick={() => setSelectedWord(word)}
                    >
                      <span className="text-2xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-600 transition-colors">
                        {word.greek}
                      </span>
                      <span className="text-[13px] font-sans text-blue-700 mt-1 font-medium">
                        {word.gloss_sv || word.gloss_en || '—'}
                      </span>
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
            ) : currentVerseText ? (
              <div className="py-4">
                <p className="text-2xl font-serif text-[#1a1d1b] leading-relaxed mb-4">{currentVerseText}</p>
                <RunningVerseTranslation 
                  book={selectedBookId} 
                  chapter={selectedChapter} 
                  verse={selectedVerse} 
                  lang={runningTranslationLang} 
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8c918d]">Ingen text hittades för denna vers.</div>
            )}
          </section>

        </main>
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredWord && (
        <div 
          className="fixed z-50 bg-[#1a1d1b] text-white text-xs p-3.5 rounded-xl shadow-2xl pointer-events-none max-w-xs space-y-1.5 border border-white/10"
          style={{ top: mousePosition.y + 15, left: mousePosition.x + 15 }}
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
            <span className="font-serif text-base text-amber-300 font-medium">{hoveredWord.greek}</span>
            <span className="text-white/60 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{hoveredWord.strong_code}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Lemma:</span>
            <span className="font-serif font-medium">{hoveredWord.lemma || '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Betydelse:</span>
            <span className="font-medium text-blue-300">{hoveredWord.gloss_sv || hoveredWord.gloss_en || '—'}</span>
          </div>
          <div className="text-[11px] text-white/80 pt-1 border-t border-white/10">
            {translateMorphology(hoveredWord.morphology)}
          </div>
        </div>
      )}

      {/* KLICK-SIDOPANEL FÖR KONKORDANS */}
      {selectedWord && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
          <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium">{selectedWord.greek}</h3>
                <span className="text-xs font-mono bg-[#faf8f5] border border-[#e8e4df] text-[#575c58] px-2 py-0.5 rounded-md">
                  {selectedWord.strong_code}
                </span>
              </div>
              <p className="text-xs text-[#575c58] font-serif mt-1">Lemma: <span className="font-medium text-[#1a1d1b]">{selectedWord.lemma || '—'}</span></p>
            </div>
            <button type="button" onClick={() => setSelectedWord(null)} className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center">✕</button>
          </div>

          <div className="py-4 space-y-3 border-b border-[#e8e4df] text-xs">
            <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-0.5">Betydelse</span>
                <span className="text-sm font-semibold text-blue-700">{selectedWord.gloss_sv || selectedWord.gloss_en || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-0.5">Morfologisk analys</span>
                <span className="font-medium text-[#1a1d1b] bg-white px-2.5 py-1 rounded border border-[#e8e4df] inline-block">
                  {translateMorphology(selectedWord.morphology)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8c918d]">Förekomster ({occurrences.length} av {totalCount})</h4>
            {occurrences.map((occ, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if (occ.book_id) {
                    setSelectedBookId(occ.book_id);
                    if (occ.chapter) setSelectedChapter(occ.chapter);
                    if (occ.verse) setSelectedVerse(occ.verse);
                    setSelectedWord(null);
                  }
                }}
                className="p-3 bg-[#faf8f5] hover:bg-[#f0ece6] rounded-xl border border-[#e8e4df] text-xs cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#1a1d1b] uppercase text-[10px] mb-0.5">{getBookName(occ.book_id)} {occ.chapter}:{occ.verse}</div>
                  <div className="text-[#575c58]">
                    <span className="text-base font-serif text-[#1a1d1b] mr-1.5">{occ.greek}</span> 
                    <span className="text-blue-700 font-medium">({occ.gloss_sv || occ.gloss_en})</span>
                  </div>
                </div>
                <div>→</div>
              </div>
            ))}

            {/* "VISA FLER"-KNAPP FÖR PAGINERINGS-LIMIT */}
            {occurrences.length < totalCount && (
              <button 
                type="button"
                onClick={() => setVisibleLimit(prev => prev + 50)}
                disabled={isLoadingOccurrences}
                className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isLoadingOccurrences ? 'Laddar...' : `Visa fler (${occurrences.length} av ${totalCount})`}
              </button>
            )}
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
                Denna plattform är utformad för djupstudier av Nya testamentets grekiska grundtext.
              </p>

              <div className="space-y-2 pt-1">
                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                  <strong className="text-[#1a1d1b] block mb-1">
                    Ord-för-ord-översättning & Strongs
                  </strong>
                  <span>
                    Ordanalysen och grundordsglosorna bygger på Strongs konkordans (Strong&apos;s Concordance) för exakt koppling till det grekiska ordförrådet.
                  </span>
                </div>

                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                  <strong className="text-[#1a1d1b] block mb-1">
                    Löpande översättningar & Copyright
                  </strong>
                  <p className="mb-2">
                    Av upphovsrättsskäl så används dessa etablerade bibelöversättningar för den löpande texten:
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

      {/* ATTIO-STYLE FOOTER */}
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

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1d1b]">Information</h4>
            <ul className="space-y-2 text-xs text-[#575c58]">
              <li><Link href="/om" className="hover:text-[#1a1d1b] transition-colors">Om tjänsten</Link></li>
              <li><Link href="/pris" className="hover:text-[#1a1d1b] transition-colors">Pris & abonnemang</Link></li>
              <li><Link href="/integritet" className="hover:text-[#1a1d1b] transition-colors">Integritetspolicy</Link></li>
              <li><Link href="/villkor" className="hover:text-[#1a1d1b] transition-colors">Användarvillkor</Link></li>
            </ul>
          </div>

        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message={modalMessage}
        onAuthSuccess={() => { setShowAuthModal(false); fetchProfile(); }} 
      />
    </div>
  );
}

export default function GrekiskAnalys() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs text-[#575c58]">Laddar läsare...</div>}>
      <GrekiskAnalysContent />
    </Suspense>
  );
}