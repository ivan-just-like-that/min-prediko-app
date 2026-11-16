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
  Info,
  Compass,
  Sparkles,
  BookOpen,
  Smile,
  Feather,
  BookMarked,
  Sprout,
  TrendingUp,
  LogOut,
  KeyRound,
  Menu,
  X
} from 'lucide-react';

// ---------------------------------------------------------
// TAHOT / STEPBIBLE MORFOLOGI- OCH GRAMMATIKTOLK
// ---------------------------------------------------------
const GENDER = {
  m: "maskulinum",
  f: "femininum",
  c: "gemensamt genus",
  b: "maskulinum och femininum",
};
const NUMBER = { s: "singular", p: "plural", d: "dualis" };
const STATE = { a: "absolutus", c: "konstruktus", d: "determinatus" };
const PERSON = { 1: "1:a person", 2: "2:e person", 3: "3:e person" };

const ASPECT = {
  p: "perfekt",
  q: "konsekutivt perfekt (waw-perfekt)",
  i: "imperfekt",
  w: "konsekutivt imperfekt (wayyiqtol)",
  h: "kohortativ",
  j: "jussiv",
  v: "imperativ",
  r: "aktivt particip",
  s: "passivt particip",
  a: "infinitivus absolutus",
  c: "infinitivus constructus",
};
const PARTICIPLES = new Set(["r", "s"]);
const INFINITIVES = new Set(["a", "c"]);

const STEMS = {
  H: {
    q: "Qal", N: "Nifal", p: "Piel", P: "Pual", h: "Hifil", H: "Hofal",
    t: "Hitpael", o: "Polel", O: "Polal", r: "Hitpolel", m: "Poel", M: "Poal",
    k: "Palel", K: "Pulal", Q: "Qal passiv", l: "Pilpel", L: "Polpal",
    f: "Hitpalpel", D: "Nitpael", j: "Pealal", i: "Pilel", u: "Hotpaal",
    c: "Tifil", v: "Hishtafel",
  },
  A: {
    q: "Peal", Q: "Peil", u: "Hitpeel", p: "Pael", P: "Itpaal",
    M: "Hitpaal", a: "Afel", h: "Hafel", s: "Safel", e: "Shafel",
    H: "Hofal", i: "Itpeal", v: "Ishtafel", o: "Polel",
  },
};

const POS = {
  A: {
    label: "adjektiv",
    types: { a: "adjektiv", c: "kardinaltal", g: "gentiliskt adjektiv", o: "ordningstal" },
  },
  C: { label: "konjunktion" },
  D: { label: "adverb" },
  N: {
    label: "substantiv",
    types: { c: "substantiv", g: "gentilnamn", p: "egennamn" },
  },
  P: {
    label: "pronomen",
    types: {
      d: "demonstrativt pronomen",
      f: "obestämt pronomen",
      i: "frågande pronomen",
      p: "personligt pronomen",
      r: "relativt pronomen",
    },
  },
  R: {
    label: "preposition",
    types: { d: "preposition + bestämd artikel" },
  },
  S: {
    label: "suffix",
    types: {
      d: "riktnings-he (suffix)",
      h: "paragogiskt he (suffix)",
      n: "paragogiskt nun (suffix)",
      p: "pronominellt suffix",
    },
  },
  T: {
    label: "partikel",
    types: {
      a: "bekräftande partikel",
      d: "bestämd artikel",
      e: "uppmanande partikel",
      i: "frågepartikel",
      j: "interjektion",
      m: "demonstrativ partikel",
      n: "negation",
      o: "objektsmarkör",
      r: "relativpartikel",
    },
  },
  V: { label: "verb" },
};

const LANGUAGES = { H: "hebreiska", A: "arameiska" };

function lookup(table, ch, what, warnings, code) {
  if (ch === undefined || ch === "" || ch === "x") return null;
  const v = table[ch];
  if (v === undefined) {
    warnings.push(`Okänt värde '${ch}' för ${what} i '${code}'`);
    return `[${what}: ${ch}]`;
  }
  return v;
}

const gnp = (...parts) => parts.filter(Boolean).join(" ");

function parseSegment(seg, lang, warnings) {
  const pos = seg[0];
  const rest = seg.slice(1);
  const def = POS[pos];

  if (!def) {
    warnings.push(`Okänd ordklass '${pos}' i '${seg}'`);
    return { raw: seg, pos, text: `[okänd kod: ${seg}]` };
  }

  const groups = [];

  switch (pos) {
    case "A":
    case "N": {
      const type = lookup(def.types, rest[0], "typ", warnings, seg);
      groups.push(type || def.label);
      const g = lookup(GENDER, rest[1], "genus", warnings, seg);
      const n = lookup(NUMBER, rest[2], "numerus", warnings, seg);
      const s = lookup(STATE, rest[3], "status", warnings, seg);
      groups.push(gnp(g, n, s));
      break;
    }
    case "P":
    case "S": {
      const type = lookup(def.types, rest[0], "typ", warnings, seg);
      groups.push(type || def.label);
      const p = lookup(PERSON, rest[1], "person", warnings, seg);
      const g = lookup(GENDER, rest[2], "genus", warnings, seg);
      const n = lookup(NUMBER, rest[3], "numerus", warnings, seg);
      groups.push(gnp(p, g, n));
      break;
    }
    case "R":
    case "T": {
      const type = lookup(def.types, rest[0], "typ", warnings, seg);
      groups.push(type || def.label);
      break;
    }
    case "V": {
      groups.push(def.label);
      const stem = lookup(STEMS[lang] || STEMS.H, rest[0], "stam", warnings, seg);
      const aspectCh = rest[1];
      const aspect = lookup(ASPECT, aspectCh, "aspekt", warnings, seg);
      if (stem) groups.push(stem);
      if (aspect) groups.push(aspect);

      if (PARTICIPLES.has(aspectCh)) {
        const g = lookup(GENDER, rest[2], "genus", warnings, seg);
        const n = lookup(NUMBER, rest[3], "numerus", warnings, seg);
        const s = lookup(STATE, rest[4], "status", warnings, seg);
        groups.push(gnp(g, n, s));
      } else if (INFINITIVES.has(aspectCh)) {
        const s = lookup(STATE, rest[2], "status", warnings, seg);
        groups.push(gnp(s));
      } else {
        const p = lookup(PERSON, rest[2], "person", warnings, seg);
        const g = lookup(GENDER, rest[3], "genus", warnings, seg);
        const n = lookup(NUMBER, rest[4], "numerus", warnings, seg);
        groups.push(gnp(p, g, n));
      }
      break;
    }
    default:
      groups.push(def.label);
  }

  return { raw: seg, pos, text: groups.filter(Boolean).join(", ") };
}

function parseHebrewGrammar(code) {
  if (!code) return 'Ingen grammatisk data tillgänglig';
  const warnings = [];
  const input = String(code).trim();
  if (!input) return 'Ingen grammatisk data tillgänglig';

  const parts = input.split("/");
  let lang = "H";
  if (LANGUAGES[parts[0][0]] && parts[0].length > 1 && POS[parts[0][1]]) {
    lang = parts[0][0];
    parts[0] = parts[0].slice(1);
  }

  const segments = parts.map((p) => parseSegment(p, lang, warnings));
  const text = segments.map((s) => s.text).join(" + ");
  return text || code;
}

// ---------------------------------------------------------
// LÖPANDE VERSÖVERSÄTTNING (MED UPPSTÄDAD BOKMAPPNING)
// ---------------------------------------------------------
function RunningVerseTranslation({ book, chapter, verse, lang = 'sv' }) {
  const [runningText, setRunningText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVerse() {
      if (!book || !chapter || !verse) return;
      setLoading(true);
      try {
        const translationBookMap = {
          gen: 'Genesis',
          exo: 'Exodus',
          lev: 'Leviticus',
          num: 'Numbers',
          deu: 'Deuteronomy',
          jos: 'Joshua',
          jdg: 'Judges',
          rut: 'Ruth',
          '1sa': '1 Samuel',
          '2sa': '2 Samuel',
          '1ki': '1 Kings',
          '2ki': '2 Kings',
          '1ch': '1 Chronicles',
          '2ch': '2 Chronicles',
          ezr: 'Ezra',
          neh: 'Nehemiah',
          est: 'Esther',
          job: 'Job',
          psa: 'Psalms',
          pro: 'Proverbs',
          ecc: 'Ecclesiastes',
          sng: 'Song of Solomon',
          isa: 'Isaiah',
          jer: 'Jeremiah',
          lam: 'Lamentations',
          eze: 'Ezekiel',
          ezk: 'Ezekiel',
          dan: 'Daniel',
          hos: 'Hosea',
          joe: 'Joel',
          jol: 'Joel',
          amo: 'Amos',
          oba: 'Obadiah',
          jon: 'Jonah',
          mic: 'Micah',
          nah: 'Nahum',
          nam: 'Nahum',
          hab: 'Habakkuk',
          zep: 'Zephaniah',
          hag: 'Haggai',
          zec: 'Zechariah',
          mal: 'Malachi',
        };

        const cleanBook = String(book || '').trim().toLowerCase();
        const apiBookName = translationBookMap[cleanBook] || cleanBook;

        const res = await fetch(`/api/verse-translation?book=${encodeURIComponent(apiBookName)}&chapter=${chapter}&verse=${verse}&lang=${lang}`);
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
  const [showSourcesModal, setShowSourcesModal] = useState(false);

  // States för menyer
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles, isAi: true },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather, isAi: true },   
    { name: 'Grekisk interlinjär läsare', desc: 'Grundtextanalys av Nya testamentet', href: '/grekiska', icon: Languages, isAi: false },
    { name: 'Hebreisk interlinjär läsare', desc: 'Grundtextanalys av Gamla testamentet', href: '/hebreiska', icon: Languages, isAi: false },
    { name: 'Historiska kommentarer', desc: 'Historisk & kulturell kontext', href: '/historik', icon: BookOpen, isAi: true },
    { name: 'Bibelatlas', desc: 'Interaktiv karta & historisk tidslinje', href: '/karta', icon: Compass, isAi: false },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked, isAi: true },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile, isAi: true },
    { name: 'Predikantpepp', desc: 'Uppmuntran, quiz, poesi mm', href: '/predikantpepp', icon: Sprout, isAi: true },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp, isAi: false },
  ];

  const hebrewBooks = [
    { id: 'Gen', altId: 'GEN', name_sv: 'Första Moseboken', chapters: 50 },
    { id: 'Exo', altId: 'EXO', name_sv: 'Andra Moseboken', chapters: 40 },
    { id: 'Lev', altId: 'LEV', name_sv: 'Tredje Moseboken', chapters: 27 },
    { id: 'Num', altId: 'NUM', name_sv: 'Fjärde Moseboken', chapters: 36 },
    { id: 'Deu', altId: 'DEU', name_sv: 'Femte Moseboken', chapters: 34 },
    { id: 'Jos', altId: 'JOS', name_sv: 'Josua', chapters: 24 },
    { id: 'Jdg', altId: 'JDG', name_sv: 'Domarboken', chapters: 21 },
    { id: 'Rut', altId: 'RUT', name_sv: 'Rut', chapters: 4 },
    { id: '1Sa', altId: '1SA', name_sv: '1 Samuelsboken', chapters: 31 },
    { id: '2Sa', altId: '2SA', name_sv: '2 Samuelsboken', chapters: 24 },
    { id: '1Ki', altId: '1KI', name_sv: '1 Kungaboken', chapters: 22 },
    { id: '2Ki', altId: '2KI', name_sv: '2 Kungaboken', chapters: 25 },
    { id: '1Ch', altId: '1CH', name_sv: '1 Krönikeboken', chapters: 29 },
    { id: '2Ch', altId: '2CH', name_sv: '2 Krönikeboken', chapters: 36 },
    { id: 'Ezr', altId: 'EZR', name_sv: 'Esra', chapters: 10 },
    { id: 'Neh', altId: 'NEH', name_sv: 'Nehemja', chapters: 13 },
    { id: 'Est', altId: 'EST', name_sv: 'Ester', chapters: 10 },
    { id: 'Job', altId: 'JOB', name_sv: 'Job', chapters: 42 },
    { id: 'Psa', altId: 'PSA', name_sv: 'Psaltaren', chapters: 150 },
    { id: 'Pro', altId: 'PRO', name_sv: 'Ordspråksboken', chapters: 31 },
    { id: 'Ecc', altId: 'ECC', name_sv: 'Predikaren', chapters: 12 },
    { id: 'Sng', altId: 'SNG', name_sv: 'Höga Visan', chapters: 8 },
    { id: 'Isa', altId: 'ISA', name_sv: 'Jesaja', chapters: 66 },
    { id: 'Jer', altId: 'JER', name_sv: 'Jeremia', chapters: 52 },
    { id: 'Lam', altId: 'LAM', name_sv: 'Klagovisorna', chapters: 5 },
    { id: 'Eze', altId: 'EZK', name_sv: 'Hesekiel', chapters: 48 },
    { id: 'Dan', altId: 'DAN', name_sv: 'Daniel', chapters: 12 },
    { id: 'Hos', altId: 'HOS', name_sv: 'Hosea', chapters: 14 },
    { id: 'Joe', altId: 'JOL', name_sv: 'Joel', chapters: 3 },
    { id: 'Amo', altId: 'AMO', name_sv: 'Amos', chapters: 9 },
    { id: 'Oba', altId: 'OBA', name_sv: 'Obadja', chapters: 1 },
    { id: 'Jon', altId: 'JON', name_sv: 'Jona', chapters: 4 },
    { id: 'Mic', altId: 'MIC', name_sv: 'Mika', chapters: 7 },
    { id: 'Nah', altId: 'NAM', name_sv: 'Nahum', chapters: 3 },
    { id: 'Hab', altId: 'HAB', name_sv: 'Habackuk', chapters: 3 },
    { id: 'Zep', altId: 'ZEP', name_sv: 'Sefanja', chapters: 3 },
    { id: 'Hag', altId: 'HAG', name_sv: 'Haggai', chapters: 2 },
    { id: 'Zec', altId: 'ZEC', name_sv: 'Sakarja', chapters: 14 },
    { id: 'Mal', altId: 'MAL', name_sv: 'Malaki', chapters: 4 }
  ];

  const [selectedBookId, setSelectedBookId] = useState('Gen');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  
  const [chapterWords, setChapterWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // States för sidopanel / drawer vid klick
  const [selectedWord, setSelectedWord] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);

  // States för hover tooltip
  const [hoveredWord, setHoveredWord] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        const targetCode = currentBookObj.altId || selectedBookId;
        let { data, error } = await supabase
          .from('hebrew_verses')
          .select('*')
          .ilike('reference', `${targetCode}.${selectedChapter}.%`)
          .order('id', { ascending: true });

        if ((!data || data.length === 0) && targetCode !== selectedBookId) {
          const res2 = await supabase
            .from('hebrew_verses')
            .select('*')
            .ilike('reference', `${selectedBookId}.${selectedChapter}.%`)
            .order('id', { ascending: true });
          data = res2.data;
          error = res2.error;
        }

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

  // Återställ limit vid nytt valt ord
  useEffect(() => {
    if (!selectedWord || !selectedWord.strongs) return;
    setVisibleLimit(50);
  }, [selectedWord?.strongs]);

  // Hämta förekomster (konkordans) med paginering
  useEffect(() => {
    if (!selectedWord || !selectedWord.strongs) return;

    async function fetchOccurrences() {
      setIsLoadingOccurrences(true);
      const { data, count, error } = await supabase
        .from('hebrew_verses')
        .select('reference, hebrew, translation, chapter_verse', { count: 'exact' })
        .eq('strongs', selectedWord.strongs)
        .limit(visibleLimit);

      if (!error && data) {
        setOccurrences(data);
        setTotalCount(count || 0);
      }
      setIsLoadingOccurrences(false);
    }

    fetchOccurrences();
  }, [selectedWord, visibleLimit]);

  const getVerseNumber = (word) => {
    if (word.chapter_verse && word.chapter_verse.includes('.')) {
      return Number(word.chapter_verse.split('.')[1]);
    }
    const parts = (word.reference || '').split('.');
    if (parts.length >= 3) {
      return Number(parts[2].split('#')[0]);
    }
    return 1;
  };

  const getWordIndex = (word) => {
    const ref = word.reference || '';
    if (ref.includes('#')) {
      const parts = ref.split('#');
      return Number(parts[1]) || 0;
    }
    return 0;
  };

  const verses = Array.from(
    new Set(chapterWords.map(getVerseNumber).filter(v => !isNaN(v)))
  ).sort((a, b) => a - b);

  const currentWords = chapterWords
    .filter(w => getVerseNumber(w) === selectedVerse)
    .sort((a, b) => getWordIndex(a) - getWordIndex(b));

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
            
            {/* LOGOTYP & MENY */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#1a1d1b]">PREDIKA</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f0ece6] text-[#2d3732] px-2 py-0.5 rounded-full border border-[#e8e4df]">
                  beta
                </span>
              </Link>

              {/* DESKTOP MENY */}
              <nav className="hidden md:flex items-center gap-1">
                <div className="relative" onMouseLeave={() => setToolsOpen(false)}>
                  <button 
                    type="button"
                    onMouseEnter={() => setToolsOpen(true)}
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors"
                  >
                    Verktyg
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* DROPDOWN MENYPANEL */}
                  {toolsOpen && (
                    <div 
                      onMouseEnter={() => setToolsOpen(true)}
                      className="absolute top-full left-0 w-80 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {verktygLista.map((v) => {
                        const Icon = v.icon;
                        return (
                          <Link 
                            key={v.href} 
                            href={v.href}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors group"
                          >
                            <div className="p-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-[#2d3732] group-hover:bg-[#2d3732] group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1a1d1b] flex items-center gap-1.5">
                                {v.name}
                                {v.isAi && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                    AI
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8c918d] leading-snug">{v.desc}</div>
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

            {/* HÖGER NAVIGATION (LOGIN / KONTO) */}
            <div className="hidden md:flex items-center gap-4">
              {!authLoading && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#575c58]">
                    {isTester ? '✨ Testkonto' : `⚡ ${credits ?? 0} krediter`}
                  </span>
                  <button
                    type="button"
                    onClick={() => supabase.auth.signOut()}
                    className="px-3.5 py-2 text-xs font-semibold text-[#1a1d1b] bg-white border border-[#e8e4df] hover:bg-[#f0ece6] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logga ut
                  </button>
                </div>
              ) : !authLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setModalMessage('Skapa ett konto för att få 10 gratisanrop!');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2d3732] hover:bg-[#1f2723] rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
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
                    className="text-sm font-medium text-[#1a1d1b] py-1 flex items-center justify-between"
                  >
                    <span>{v.name}</span>
                    {v.isAi && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        AI
                      </span>
                    )}
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
                    type="button"
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
                    type="button"
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
                    Hebreisk interlinjär läsare
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed max-w-2xl">
                  Studera Gamla testamentets hebreiska grundtext ord för ord med translitteration, glosa, Strongs-nummer och grammatik – sida vid sida med löpande bibelöversättningar. Texten bygger på den masoretiska traditionen genom <strong>Codex Leningradensis</strong> (1008 e.Kr.) via TAHOT-datasetet.
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
                    onClick={() => setShowSourcesModal(true)}
                    className="flex items-center gap-1 text-[11px] font-medium bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] text-[#575c58] px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Information om översättningskällor"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Om källorna</span>
                  </button>
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
                      onMouseEnter={(e) => {
                        setHoveredWord(word);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredWord(null)}
                    >
                      {/* 1. Originalhebreiska */}
                      <span className="text-3xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-700 transition-colors" dir="rtl">
                        {word.hebrew}
                      </span>
                      
                      {/* 2. Transliteration */}
                      <span className="text-[11px] font-mono text-amber-700 mt-1" dir="ltr">
                        {word.transliteration}
                      </span>

                      {/* 3. Glosa */}
                      <span className="text-xs font-semibold text-blue-800 mt-1 max-w-[120px] text-center truncate" dir="ltr">
                        {word.translation || '—'}
                      </span>

                      {/* 4. Strongs / Grammar */}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400" dir="ltr">
                        {word.strongs && <span>#{word.strongs}</span>}
                        {word.grammar && <span>• {word.grammar}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Löpande versöversättning */}
                <RunningVerseTranslation 
                  book={selectedBookId} 
                  chapter={selectedChapter} 
                  verse={selectedVerse} 
                  lang={runningTranslationLang} 
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#8c918d]">
                Inga ord hittades för denna vers i databasen. Kontrollera att TAHOT-datasetet är laddat för denna bok.
              </div>
            )}
          </section>

          {/* KÄLL- OCH INFO-MODAL (FÖR INFO-KNAPPEN) */}
          {showSourcesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-[#e8e4df] max-w-lg w-full p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e8e4df]">
                  <h3 className="text-base font-bold text-[#1a1d1b]">Om bibelöversättningar och källor</h3>
                  <button
                    type="button"
                    onClick={() => setShowSourcesModal(false)}
                    className="text-[#8c918d] hover:text-[#1a1d1b] p-1 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-[#575c58] leading-relaxed">
                  <p>
                    Denna plattform är utformad för djupstudier av Gamla testamentets hebreiska grundtext.
                  </p>
                  <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                    <strong className="text-[#1a1d1b] block mb-1">
                      Grundtext & TAHOT-datasetet
                    </strong>
                    <span>
                      Grundtexten bygger på den masoretiska traditionen genom <em>Codex Leningradensis</em> (1008 e.Kr.) via TAHOT-datasetet, komplett med translitteration, glossor, Strongs-nummer och grammatisk analys.
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
                <div className="mt-6 pt-4 border-t border-[#e8e4df] text-right">
                  <button
                    type="button"
                    onClick={() => setShowSourcesModal(false)}
                    className="px-4 py-2 bg-[#2d3732] text-white rounded-xl text-xs font-semibold hover:bg-[#1f2723] transition-colors"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HOVER TOOLTIP */}
          {hoveredWord && (
            <div 
              className="fixed z-50 bg-[#1a1d1b] text-white text-xs p-3.5 rounded-xl shadow-2xl pointer-events-none max-w-xs space-y-1.5 border border-white/10"
              style={{ top: mousePosition.y + 15, left: mousePosition.x + 15 }}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
                <span className="font-serif text-base text-amber-300 font-medium" dir="rtl">{hoveredWord.hebrew}</span>
                <span className="text-white/60 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{hoveredWord.strongs}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Transliteration:</span>
                <span className="font-serif font-medium">{hoveredWord.transliteration || '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Betydelse:</span>
                <span className="font-medium text-blue-300">{hoveredWord.translation || '—'}</span>
              </div>
              <div className="text-[11px] text-white/80 pt-1 border-t border-white/10">
                {parseHebrewGrammar(hoveredWord.grammar)}
              </div>
            </div>
          )}

          {/* KLICK-SIDOPANEL (DRAWER) FÖR ORDANALYS & KONKORDANS */}
          {selectedWord && (
            <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
              <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium" dir="rtl">{selectedWord.hebrew}</h3>
                    <span className="text-xs font-mono bg-[#faf8f5] border border-[#e8e4df] text-[#575c58] px-2 py-0.5 rounded-md">
                      {selectedWord.strongs}
                    </span>
                  </div>
                  <p className="text-xs text-[#575c58] font-serif mt-1">Transliteration: <span className="font-medium text-[#1a1d1b]">{selectedWord.transliteration || '—'}</span></p>
                </div>
                <button type="button" onClick={() => setSelectedWord(null)} className="w-8 h-8 rounded-full bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center">✕</button>
              </div>

              <div className="py-4 space-y-3 border-b border-[#e8e4df] text-xs">
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-0.5">Betydelse</span>
                    <span className="text-sm font-semibold text-blue-700">{selectedWord.translation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8c918d] block mb-0.5">Grammatisk analys</span>
                    <span className="font-medium text-[#1a1d1b] bg-white px-2.5 py-1 rounded border border-[#e8e4df] inline-block">
                      {parseHebrewGrammar(selectedWord.grammar)}
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
                      if (occ.reference) {
                        const parts = occ.reference.split('.');
                        if (parts.length >= 2) {
                          const bookRef = parts[0];
                          const chapNum = Number(parts[1]);
                          const versePart = parts[2] ? Number(parts[2].split('#')[0]) : 1;
                          
                          const matchedBook = hebrewBooks.find(b => 
                            b.id.toLowerCase() === bookRef.toLowerCase() || 
                            (b.altId && b.altId.toLowerCase() === bookRef.toLowerCase())
                          );
                          if (matchedBook) {
                            setSelectedBookId(matchedBook.id);
                          } else {
                            setSelectedBookId(bookRef);
                          }
                          if (!isNaN(chapNum)) setSelectedChapter(chapNum);
                          if (!isNaN(versePart)) setSelectedVerse(versePart);
                          setSelectedWord(null);
                        }
                      }
                    }}
                    className="p-3 bg-[#faf8f5] hover:bg-[#f0ece6] rounded-xl border border-[#e8e4df] text-xs cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#1a1d1b] uppercase text-[10px] mb-0.5">{occ.reference || occ.chapter_verse}</div>
                      <div className="text-[#575c58]">
                        <span className="text-base font-serif text-[#1a1d1b] mr-1.5" dir="rtl">{occ.hebrew}</span> 
                        <span className="text-blue-700 font-medium">({occ.translation || '—'})</span>
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

        </main>
      </div>

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

      {/* AUTH MODAL */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        message={modalMessage}
        onAuthSuccess={() => fetchProfile()} 
      />

    </div>
  );
}

export default function HebrewAnalysSida() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs text-[#8c918d]">Laddar...</div>}>
      <HebrewAnalysContent />
    </Suspense>
  );
}