'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { sanitizeCredits, hasNoCredits, syncCreditsFromResult } from '@/lib/credits';
import AuthModal from '@/components/AuthModal';
import { BOOK_INFO } from '@/data/bookInfo';
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
  X,
} from 'lucide-react';

// ---------------------------------------------------------
// TAHOT / STEPBIBLE MORFOLOGI- OCH GRAMMATIKTOLK
// ---------------------------------------------------------
const GENDER = {
  m: 'maskulinum',
  f: 'femininum',
  c: 'gemensamt genus',
  b: 'maskulinum och femininum',
};
const NUMBER = { s: 'singular', p: 'plural', d: 'dualis' };
const STATE = { a: 'absolutus', c: 'konstruktus', d: 'determinatus' };
const PERSON = { 1: '1:a person', 2: '2:e person', 3: '3:e person' };

const ASPECT = {
  p: 'perfekt',
  q: 'konsekutivt perfekt (waw-perfekt)',
  i: 'imperfekt',
  w: 'konsekutivt imperfekt (wayyiqtol)',
  h: 'kohortativ',
  j: 'jussiv',
  v: 'imperativ',
  r: 'aktivt particip',
  s: 'passivt particip',
  a: 'infinitivus absolutus',
  c: 'infinitivus constructus',
};
const PARTICIPLES = new Set(['r', 's']);
const INFINITIVES = new Set(['a', 'c']);

const STEMS = {
  H: {
    q: 'Qal',
    N: 'Nifal',
    p: 'Piel',
    P: 'Pual',
    h: 'Hifil',
    H: 'Hofal',
    t: 'Hitpael',
    o: 'Polel',
    O: 'Polal',
    r: 'Hitpolel',
    m: 'Poel',
    M: 'Poal',
    k: 'Palel',
    K: 'Pulal',
    Q: 'Qal passiv',
    l: 'Pilpel',
    L: 'Polpal',
    f: 'Hitpalpel',
    D: 'Nitpael',
    j: 'Pealal',
    i: 'Pilel',
    u: 'Hotpaal',
    c: 'Tifil',
    v: 'Hishtafel',
  },
  A: {
    q: 'Peal',
    Q: 'Peil',
    u: 'Hitpeel',
    p: 'Pael',
    P: 'Itpaal',
    M: 'Hitpaal',
    a: 'Afel',
    h: 'Hafel',
    s: 'Safel',
    e: 'Shafel',
    H: 'Hofal',
    i: 'Itpeal',
    v: 'Ishtafel',
    o: 'Polel',
  },
};

const POS = {
  A: {
    label: 'adjektiv',
    types: { a: 'adjektiv', c: 'kardinaltal', g: 'gentiliskt adjektiv', o: 'ordningstal' },
  },
  C: { label: 'konjunktion' },
  D: { label: 'adverb' },
  N: {
    label: 'substantiv',
    types: { c: 'substantiv', g: 'gentilnamn', p: 'egennamn' },
  },
  P: {
    label: 'pronomen',
    types: {
      d: 'demonstrativt pronomen',
      f: 'obestämt pronomen',
      i: 'frågande pronomen',
      p: 'personligt pronomen',
      r: 'relativt pronomen',
    },
  },
  R: {
    label: 'preposition',
    types: { d: 'preposition + bestämd artikel' },
  },
  S: {
    label: 'suffix',
    types: {
      d: 'riktnings-he (suffix)',
      h: 'paragogiskt he (suffix)',
      n: 'paragogiskt nun (suffix)',
      p: 'pronominellt suffix',
    },
  },
  T: {
    label: 'partikel',
    types: {
      a: 'bekräftande partikel',
      d: 'bestämd artikel',
      e: 'uppmanande partikel',
      i: 'frågepartikel',
      j: 'interjektion',
      m: 'demonstrativ partikel',
      n: 'negation',
      o: 'objektsmarkör',
      r: 'relativpartikel',
    },
  },
  V: { label: 'verb' },
};

const LANGUAGES = { H: 'hebreiska', A: 'arameiska' };

const HEBREW_BOOKS = [
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
  { id: 'Mal', altId: 'MAL', name_sv: 'Malaki', chapters: 4 },
  // Apokryferna (Bibel 2000 / Evangelieboken)
  { id: 'Wis', altId: 'WIS', name_sv: 'Salomos vishet (Apokryf)', chapters: 19, isApocrypha: true },
  { id: 'Sir', altId: 'SIR', name_sv: 'Jesus Syraks vishet (Apokryf)', chapters: 51, isApocrypha: true },
  { id: 'Tob', altId: 'TOB', name_sv: 'Tobit (Apokryf)', chapters: 14, isApocrypha: true },
  { id: 'Man', altId: 'MAN', name_sv: 'Manasses bön (Apokryf)', chapters: 1, isApocrypha: true },
];

// Kopplar HEBREW_BOOKS till nycklarna i /data/bookInfo.js
const HEBREW_BOOK_INFO_ALIASES = {
  '1 Samuelsboken': 'Första Samuelsboken',
  '2 Samuelsboken': 'Andra Samuelsboken',
  '1 Kungaboken': 'Första Kungaboken',
  '2 Kungaboken': 'Andra Kungaboken',
  '1 Krönikeboken': 'Första Krönikeboken',
  '2 Krönikeboken': 'Andra Krönikeboken',
  'Höga Visan': 'Höga visan',
};

function getHebrewBookInfo(bookObj) {
  if (!bookObj || !BOOK_INFO) return null;
  const cleanName = bookObj.name_sv.replace(' (Apokryf)', '');
  return (
    BOOK_INFO[bookObj.name_sv] ||
    BOOK_INFO[cleanName] ||
    BOOK_INFO[HEBREW_BOOK_INFO_ALIASES[bookObj.name_sv]] ||
    BOOK_INFO[HEBREW_BOOK_INFO_ALIASES[cleanName]] ||
    BOOK_INFO[bookObj.id] ||
    null
  );
}

// Normaliserar hebreiska/arameiska Strongs-koder (t.ex. "h430" -> "H0430")
function normalizeHebrewStrongCode(rawCode) {
  if (!rawCode) return '';
  const str = String(rawCode).trim();
  const braceMatch = str.match(/\{([^}]+)\}/);
  const target = (braceMatch ? braceMatch[1] : str).trim().replace(/^#/, '');
  const match = target.match(/^([HhAaGg])0*(\d+)([A-Za-z]*)$/);
  if (!match) return target.toUpperCase();
  const rawPrefix = match[1].toUpperCase();
  const prefix = rawPrefix === 'A' ? 'H' : rawPrefix;
  const digits = String(Number(match[2]));
  const suffix = (match[3] || '').toLowerCase();
  return `${prefix}${digits}${suffix}`;
}

const VERKTYG_LISTA = [
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

function lookup(table, ch, what, warnings, code) {
  if (ch === undefined || ch === '' || ch === 'x') return null;
  const v = table[ch];
  if (v === undefined) {
    warnings.push(`Okänt värde '${ch}' för ${what} i '${code}'`);
    return `[${what}: ${ch}]`;
  }
  return v;
}

const gnp = (...parts) => parts.filter(Boolean).join(' ');

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
    case 'A':
    case 'N': {
      const type = lookup(def.types, rest[0], 'typ', warnings, seg);
      groups.push(type || def.label);
      const g = lookup(GENDER, rest[1], 'genus', warnings, seg);
      const n = lookup(NUMBER, rest[2], 'numerus', warnings, seg);
      const s = lookup(STATE, rest[3], 'status', warnings, seg);
      groups.push(gnp(g, n, s));
      break;
    }
    case 'P':
    case 'S': {
      const type = lookup(def.types, rest[0], 'typ', warnings, seg);
      groups.push(type || def.label);
      const p = lookup(PERSON, rest[1], 'person', warnings, seg);
      const g = lookup(GENDER, rest[2], 'genus', warnings, seg);
      const n = lookup(NUMBER, rest[3], 'numerus', warnings, seg);
      groups.push(gnp(p, g, n));
      break;
    }
    case 'R':
    case 'T': {
      const type = lookup(def.types, rest[0], 'typ', warnings, seg);
      groups.push(type || def.label);
      break;
    }
    case 'V': {
      groups.push(def.label);
      const stem = lookup(STEMS[lang] || STEMS.H, rest[0], 'stam', warnings, seg);
      const aspectCh = rest[1];
      const aspect = lookup(ASPECT, aspectCh, 'aspekt', warnings, seg);
      if (stem) groups.push(stem);
      if (aspect) groups.push(aspect);

      if (PARTICIPLES.has(aspectCh)) {
        const g = lookup(GENDER, rest[2], 'genus', warnings, seg);
        const n = lookup(NUMBER, rest[3], 'numerus', warnings, seg);
        const s = lookup(STATE, rest[4], 'status', warnings, seg);
        groups.push(gnp(g, n, s));
      } else if (INFINITIVES.has(aspectCh)) {
        const s = lookup(STATE, rest[2], 'status', warnings, seg);
        groups.push(gnp(s));
      } else {
        const p = lookup(PERSON, rest[2], 'person', warnings, seg);
        const g = lookup(GENDER, rest[3], 'genus', warnings, seg);
        const n = lookup(NUMBER, rest[4], 'numerus', warnings, seg);
        groups.push(gnp(p, g, n));
      }
      break;
    }
    default:
      groups.push(def.label);
  }

  return { raw: seg, pos, text: groups.filter(Boolean).join(', ') };
}

function parseHebrewGrammar(code) {
  if (!code) return 'Ingen grammatisk data tillgänglig';
  const warnings = [];
  const input = String(code).trim();
  if (!input) return 'Ingen grammatisk data tillgänglig';

  const parts = input.split('/');
  let lang = 'H';
  if (LANGUAGES[parts[0][0]] && parts[0].length > 1 && POS[parts[0][1]]) {
    lang = parts[0][0];
    parts[0] = parts[0].slice(1);
  }

  const segments = parts.map((p) => parseSegment(p, lang, warnings));
  const text = segments.map((s) => s.text).join(' + ');
  return text || code;
}

// ---------------------------------------------------------
// LÖPANDE VERSÖVERSÄTTNING
// ---------------------------------------------------------
function RunningVerseTranslation({ book, chapter, verse, lang = 'sv', hasVerseZero = false }) {
  const [runningText, setRunningText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

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
          '1sa': 'I Samuel',
          '2sa': 'II Samuel',
          '1ki': 'I Kings',
          '2ki': 'II Kings',
          '1ch': 'I Chronicles',
          '2ch': 'II Chronicles',
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

        const res = await fetch(
          `/api/verse-translation?book=${encodeURIComponent(apiBookName)}&chapter=${chapter}&verse=${verse}&lang=${lang}&hasVerseZero=${hasVerseZero}`
        );
        const data = await res.json();
        if (!isCancelled) {
          setRunningText(data.text || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadVerse();
    return () => {
      isCancelled = true;
    };
  }, [book, chapter, verse, lang, hasVerseZero]);

  if (loading) {
    return <p className="text-xs text-slate-400 italic mt-3 animate-pulse">Laddar löpande översättning...</p>;
  }

  if (!runningText) return null;

  const labelMap = {
    sv: '1917 års kyrkobibel',
    en: 'English Standard Version (ESV)',
    es: 'Reina-Valera 1960',
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

function renderInlineClean(text) {
  if (!text) return null;

  const stripped = String(text)
    .replace(/^#{1,6}\s*/g, '')
    .replace(/^\s*[-*•]\s+/g, '');

  const tokens = stripped.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#1a1d1b]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <span key={idx}>{token.replace(/[*#]/g, '')}</span>;
  });
}

function FormattedAiExplanation({ content }) {
  if (!content) return null;

  const lines = String(content)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^-{3,}$/.test(line));

  return (
    <div className="pt-2.5 border-t border-[#e8e4df] space-y-2.5 text-xs text-[#2d312e] leading-relaxed">
      {lines.map((line, idx) => {
        const cleanLine = line.replace(/^#{1,6}\s*/, '').replace(/[*#]/g, (m, offset, str) => {
          return str.includes('**') || str.includes('*') ? m : '';
        });

        const isMainHeading = /^[1-4]\.\s+\S/.test(cleanLine.replace(/\*\*/g, ''));

        if (isMainHeading) {
          return (
            <h4 key={idx} className="text-[13px] font-bold text-[#1a1d1b] pt-2 first:pt-0 tracking-tight">
              {renderInlineClean(cleanLine)}
            </h4>
          );
        }

        const withoutBullet = cleanLine.replace(/^[-•]\s*/, '');
        const colonIndex = withoutBullet.indexOf(':');
        if (colonIndex > 0 && colonIndex <= 32) {
          const label = withoutBullet.slice(0, colonIndex + 1);
          const rest = withoutBullet.slice(colonIndex + 1).trim();

          return (
            <p key={idx} className="text-xs text-[#2d312e] leading-relaxed">
              <span className="font-bold italic text-[#1a1d1b]">{renderInlineClean(label)}</span>
              {rest ? <> {renderInlineClean(rest)}</> : null}
            </p>
          );
        }

        return (
          <p key={idx} className="text-xs text-[#2d312e] leading-relaxed">
            {renderInlineClean(cleanLine)}
          </p>
        );
      })}
    </div>
  );
}

function HebrewAnalysContent() {
  const searchParams = useSearchParams();
  const [runningTranslationLang, setRunningTranslationLang] = useState('sv');
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [bookInfoModalOpen, setBookInfoModalOpen] = useState(false);

  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState('Gen');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);

  const [chapterWords, setChapterWords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWord, setSelectedWord] = useState(null);
  const [showConcordance, setShowConcordance] = useState(false);
  const [occurrences, setOccurrences] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);

  const [lexiconEntry, setLexiconEntry] = useState(null);
  const [lexiconLoading, setLexiconLoading] = useState(false);
  const [deepLexiconOpen, setDeepLexiconOpen] = useState(false);
  const [lexiconHelpOpen, setLexiconHelpOpen] = useState(false);

  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [hoveredWord, setHoveredWord] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setUser(null);
        setCredits(0);
        setIsTester(false);
        setAuthLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUser(null);
      setCredits(0);
      setIsTester(false);
      setAuthLoading(false);
      return;
    }
    setUser(user);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits, is_tester')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Kunde inte hämta profil från Supabase:', error);
    }

    if (profile) {
      setCredits(sanitizeCredits(profile.credits));
      setIsTester(Boolean(profile.is_tester));
    } else {
      setCredits(0);
      setIsTester(false);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    const bookParam = searchParams.get('book');
    const chapterParam = searchParams.get('chapter');
    const verseParam = searchParams.get('verse');

    if (bookParam) {
      const found = HEBREW_BOOKS.find(
        (b) =>
          b.id.toLowerCase() === bookParam.toLowerCase() ||
          b.altId.toLowerCase() === bookParam.toLowerCase()
      );
      setSelectedBookId(found ? found.id : bookParam);
    }
    if (chapterParam) setSelectedChapter(Number(chapterParam) || 1);
    if (verseParam) setSelectedVerse(Number(verseParam) || 1);
  }, [searchParams]);

  const currentBookObj = HEBREW_BOOKS.find((b) => b.id === selectedBookId) || HEBREW_BOOKS[0];
  const currentBookInfo = getHebrewBookInfo(currentBookObj);
  const chapters = Array.from({ length: currentBookObj.chapters }, (_, i) => i + 1);

  useEffect(() => {
    let isCancelled = false;

    async function loadChapterWords() {
      const bookObj = HEBREW_BOOKS.find((b) => b.id === selectedBookId) || HEBREW_BOOKS[0];

      // Apokryfer finns inte i det masoretiska TAHOT-datasetet
      if (bookObj.isApocrypha) {
        if (!isCancelled) {
          setChapterWords([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const id1 = bookObj.id;
        const id2 = bookObj.altId;
        const id3 = selectedBookId;

        const { data, error } = await supabase
          .from('hebrew_verses')
          .select('*')
          .or(
            `reference.ilike.${id1}.${selectedChapter}.%,reference.ilike.${id2}.${selectedChapter}.%,reference.ilike.${id3}.${selectedChapter}.%,reference.ilike.${id1.toLowerCase()}.${selectedChapter}.%`
          )
          .order('id', { ascending: true });

        if (error) throw error;
        if (!isCancelled) {
          setChapterWords(data || []);
        }
      } catch (err) {
        console.error('Kunde inte hämta kapiteldata från Supabase:', err);
        if (!isCancelled) {
          setChapterWords([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadChapterWords();
    return () => {
      isCancelled = true;
    };
  }, [selectedBookId, selectedChapter]);

  const handleSelectWord = (word) => {
    setSelectedWord(word);
    setShowConcordance(false);
    setDeepLexiconOpen(false);
    setLexiconHelpOpen(false);
    setAiExplanation('');
    setAiError('');
    setOccurrences([]);
    setTotalCount(0);
    setVisibleLimit(50);
  };

  const arKrediterSlut = hasNoCredits(credits, isTester);

  const handleAnalyzeHebrewWordNuance = async () => {
    if (!selectedWord || aiLoading) return;

    setAiError('');
    setAiExplanation('');

    if (!user) {
      setModalMessage('Logga in eller skapa ett konto för att fördjupa ordets nyans med AI.');
      setShowAuthModal(true);
      return;
    }

    if (hasNoCredits(credits, isTester)) {
      setCredits(0);
      setAiError('Du har 0 krediter kvar. Fyll på krediter för att använda AI-nyansen.');
      return;
    }

    setAiLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const verseHebrewText = currentWords.map((w) => w.hebrew).filter(Boolean).join(' ');

      const res = await fetch('/api/word-nuance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          language: 'hebrew',
          bookName: currentBookObj.name_sv,
          chapter: selectedChapter,
          verse: selectedVerse,
          verseText: verseHebrewText,
          word: selectedWord,
          grammarText: parseHebrewGrammar(selectedWord.grammar),
          lexicon: lexiconEntry,
        }),
      });

      const data = await res.json().catch(() => ({}));
      syncCreditsFromResult(data, { setCredits, setIsTester });

      if (!res.ok) {
        setAiError(data.error || 'Kunde inte hämta AI-analys.');
        return;
      }

      setAiExplanation(data.explanation || '');
    } catch (err) {
      syncCreditsFromResult(err, { setCredits, setIsTester });
      console.error(err);
      setAiError('Nätverksfel vid anrop till AI-tjänsten.');
    } finally {
      setAiLoading(false);
    }
  };

 // Hämtar lexikonpost från strongs_lexicon för valt Strongs-nummer (med normaliserad kod + 4-siffrig form + grundkod)
  useEffect(() => {
    if (!selectedWord || !selectedWord.strongs) {
      setLexiconEntry(null);
      return;
    }

    let isCancelled = false;
    async function loadLexicon() {
      setLexiconLoading(true);
      const rawCode = String(selectedWord.strongs).trim();
      const normalizedCode = normalizeHebrewStrongCode(rawCode);
      const paddedMatch = normalizedCode.match(/^([A-Z]+)(\d+)([a-z]*)$/);
      const paddedCode = paddedMatch
        ? `${paddedMatch[1]}${paddedMatch[2].padStart(4, '0')}${paddedMatch[3]}`
        : '';
      const baseCode = normalizedCode.replace(/[a-z]+$/i, '');
      const paddedBaseCode = paddedCode.replace(/[a-z]+$/i, '');

      const candidates = Array.from(
        new Set([normalizedCode, paddedCode, baseCode, paddedBaseCode, rawCode].filter(Boolean))
      );

      const selectColumns =
        'strong_code, lemma, transliteration, short_definition, root_and_cognates, cognate_codes, deep_entry, parallel_passages, occurrence_count, source_notes';

      try {
        let foundEntry = null;

        for (const codeCandidate of candidates) {
          const { data, error } = await supabase
            .from('strongs_lexicon')
            .select(selectColumns)
            .eq('strong_code', codeCandidate)
            .maybeSingle();

          if (error) {
            console.error('Fel vid hämtning från strongs_lexicon:', codeCandidate, error);
          }

          if (data) {
            foundEntry = data;
            break;
          }
        }

        if (!isCancelled) {
          setLexiconEntry(foundEntry || null);
        }
      } catch (err) {
        console.error('Fel i loadLexicon:', err);
        if (!isCancelled) setLexiconEntry(null);
      } finally {
        if (!isCancelled) setLexiconLoading(false);
      }
    }

    loadLexicon();
    return () => {
      isCancelled = true;
    };
  }, [selectedWord]);

  // Konkordansen laddas först när användaren klickar på konkordansknappen
  useEffect(() => {
    if (!selectedWord || !selectedWord.strongs || !showConcordance) return;
    let isCancelled = false;

    async function fetchOccurrences() {
      setIsLoadingOccurrences(true);
      const rawCode = String(selectedWord.strongs).trim();
      const normalizedCode = normalizeHebrewStrongCode(rawCode);
      const codeCandidates = Array.from(new Set([rawCode, normalizedCode].filter(Boolean)));

      const { data, count, error } = await supabase
        .from('hebrew_verses')
        .select('reference, hebrew, translation, chapter_verse', { count: 'exact' })
        .in('strongs', codeCandidates)
        .limit(visibleLimit);

      if (!isCancelled && !error && data) {
        setOccurrences(data);
        setTotalCount(count || 0);
      }
      if (!isCancelled) {
        setIsLoadingOccurrences(false);
      }
    }

    fetchOccurrences();
    return () => {
      isCancelled = true;
    };
  }, [selectedWord, showConcordance, visibleLimit]);

  const hasPsalmHeader =
    selectedBookId === 'Psa' &&
    chapterWords.some((w) => {
      const cv = (w.chapter_verse || '').split('(')[0];
      const ref = (w.reference || '').split('(')[0];
      return cv.endsWith('.0') || ref.includes('.0#');
    });

  const getVerseNumber = (word) => {
    let rawVerse = 1;
    let cv = word.chapter_verse || '';
    if (cv.includes('(')) {
      cv = cv.split('(')[0];
    }
    if (cv && cv.includes('.')) {
      const num = Number(cv.split('.')[1]);
      rawVerse = isNaN(num) ? 1 : num;
    } else {
      const ref = word.reference || '';
      const cleanRef = ref.split('(')[0];
      const parts = cleanRef.split('.');
      if (parts.length >= 3) {
        const num = Number(parts[2].split('#')[0]);
        rawVerse = isNaN(num) ? 1 : num;
      }
    }

    if (hasPsalmHeader) {
      return rawVerse + 1;
    }

    return rawVerse;
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
    new Set(chapterWords.map(getVerseNumber).filter((v) => !isNaN(v)))
  ).sort((a, b) => a - b);

  const currentWords = chapterWords
    .filter((w) => getVerseNumber(w) === selectedVerse)
    .sort((a, b) => getWordIndex(a) - getWordIndex(b));

  const currentVerseIndex = verses.indexOf(selectedVerse);

  const handlePrevVerse = () => {
    if (currentVerseIndex > 0) setSelectedVerse(verses[currentVerseIndex - 1]);
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) setSelectedVerse(verses[currentVerseIndex + 1]);
  };

  const renderTranslationControls = () => (
    <div className="mt-5 pt-4 border-t border-[#e8e4df] flex flex-wrap items-center gap-2">
      <div className="flex items-center bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-0.5 text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setRunningTranslationLang('sv')}
          className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
            runningTranslationLang === 'sv'
              ? 'bg-white text-[#1a1d1b] shadow-sm font-bold'
              : 'text-[#8c918d]'
          }`}
        >
          1917
        </button>
        <button
          type="button"
          onClick={() => setRunningTranslationLang('en')}
          className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
            runningTranslationLang === 'en'
              ? 'bg-white text-[#1a1d1b] shadow-sm font-bold'
              : 'text-[#8c918d]'
          }`}
        >
          ESV
        </button>
        <button
          type="button"
          onClick={() => setRunningTranslationLang('es')}
          className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
            runningTranslationLang === 'es'
              ? 'bg-white text-[#1a1d1b] shadow-sm font-bold'
              : 'text-[#8c918d]'
          }`}
        >
          Reina-Valera
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowSourcesModal(true)}
        className="flex items-center gap-1 text-[11px] font-semibold bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] text-[#575c58] hover:text-[#1a1d1b] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
        title="Information om översättningskällor"
      >
        <Info className="w-3.5 h-3.5 text-[#2d3732]" />
        <span>Om källorna</span>
      </button>
    </div>
  );

  const displayedTransliteration =
    selectedWord?.transliteration || lexiconEntry?.transliteration || '—';

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
                    type="button"
                    onMouseEnter={() => setToolsOpen(true)}
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors"
                  >
                    Verktyg
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        toolsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {toolsOpen && (
                    <div
                      onMouseEnter={() => setToolsOpen(true)}
                      className="absolute top-full left-0 w-80 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {VERKTYG_LISTA.map((v) => {
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

                <Link
                  href="/om"
                  className="px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors"
                >
                  Om
                </Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {!authLoading && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#575c58]">
                    {isTester ? '✨ Testkonto' : `⚡ ${sanitizeCredits(credits)} krediter`}
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
              ) : (
                !authLoading && (
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
                )
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
                {VERKTYG_LISTA.map((v) => (
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

        {user && (
          <div className="bg-white border-b border-[#e8e4df] py-2 px-6">
            <div className="max-w-[1100px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
              <span className="truncate">
                Inloggad som: <strong className="text-[#1a1d1b]">{user.email}</strong>
              </span>
            </div>
          </div>
        )}

        <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-16">
          <div className="mb-8">
            <div className="bg-white p-5 sm:p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
              <div>
                <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                      <Languages className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1a1d1b] tracking-tight leading-snug">
                      Hebreisk interlinjär läsare
                    </h1>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
                 Studera Gamla testamentets hebreiska grundtext ord för ord med translitteration, glosa och grammatik – 
                 sida vid sida med löpande bibelöversättningar. Klicka på vilket ord som helst för att fördjupa dig i lexikondefinitioner, 
                 ordrot och parallella bibelställen. Texten bygger på den masoretiska traditionen genom Codex Leningradensis (1008 e.Kr.) 
                 via TAHOT-datasetet.
                </p>
              </div>

              {/* RULLGARDINER FÖR BOK, KAPITEL OCH VERS + KNAPP TILL BOKINFO */}
              <div className="flex flex-col items-start gap-2.5">
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
                      {HEBREW_BOOKS.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.name_sv}
                        </option>
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
                      {chapters.map((chap) => (
                        <option key={chap} value={chap}>
                          Kap {chap}
                        </option>
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
                      {verses.length > 0 ? (
                        verses.map((v) => (
                          <option key={v} value={v}>
                            Vers {v}
                          </option>
                        ))
                      ) : (
                        <option value={1}>Vers 1</option>
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#575c58] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {currentBookInfo && (
                  <button
                    type="button"
                    onClick={() => setBookInfoModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] text-[#575c58] hover:text-[#1a1d1b] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Om boken"
                  >
                    <Info className="w-3.5 h-3.5 text-[#2d3732]" />
                    <span>Om boken</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* VERSUS DISCLAIMERS (Job & Jonah) */}
          {(() => {
            const getVersificationNotice = () => {
              if (
                selectedBookId === 'Job' &&
                (selectedChapter === 38 ||
                  selectedChapter === 39 ||
                  selectedChapter === 40 ||
                  selectedChapter === 41)
              ) {
                return 'Versindelningen i detta kapitel skiljer sig mellan den masoretiska grundtexten och västerländska översättningar (som 1917 och ESV). Jämför gärna med en tryckt bibel om textraderna förskjuts.';
              }
              if (selectedBookId === 'Jon' && (selectedChapter === 1 || selectedChapter === 2)) {
                return 'Observera: Jona 1:17 i grundtexten motsvarar ofta Jona 2:1 i svenska och engelska översättningar, vilket gör att verserna i kapitel 2 ligger ett steg förskjutna.';
              }
              return null;
            };
            const notice = getVersificationNotice();
            return notice ? (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold block mb-0.5">Viktig notis om versindelning</span>
                  {notice}
                </div>
              </div>
            ) : null;
          })()}

          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-[#e8e4df] pb-3.5">
              <div className="text-xs font-bold text-[#1a1d1b] sm:text-[#8c918d] uppercase tracking-wider">
                <span>
                  {currentBookObj ? currentBookObj.name_sv : ''} {selectedChapter}:{selectedVerse}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#faf8f5] border border-[#e8e4df] rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevVerse}
                  disabled={currentVerseIndex <= 0}
                  className="p-1.5 rounded-md text-[#2d3732] hover:bg-white disabled:opacity-25"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-[#575c58] px-2">
                  {verses.length > 0 ? `${currentVerseIndex + 1} / ${verses.length}` : '0 / 0'}
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

            {/* PSALM DISCLAIMER FOR ESV / REINA-VALERA */}
            {selectedBookId === 'Psa' && runningTranslationLang !== 'sv' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  Obs! Den {runningTranslationLang === 'es' ? 'spanska' : 'engelska'} översättningen i Psaltaren kan ligga i otakt med grundtexten på grund av olika hantering av psalmöverskrifter (vers 0/1). Svenska 1917 är fullt synkad.
                </div>
              </div>
            )}

            {currentBookObj.isApocrypha ? (
              <div className="my-4 p-5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3.5">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1.5 leading-relaxed">
                  <strong className="font-bold block text-amber-950">
                    Apokryf skrift ({currentBookObj.name_sv.replace(' (Apokryf)', '')})
                  </strong>
                  <p>
                    Den hebreiska grundtextläsaren täcker i nuläget inte apokryferna (tilläggen till Gamla testamentet i Bibel 2000 och den svenska evangelieboken), utan bygger på den masoretiska kanon (<em>Codex Leningradensis</em>).
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="py-12 text-center text-xs text-[#8c918d]">Laddar hebreisk grundtext...</div>
            ) : currentWords.length > 0 ? (
              <div>
                <div dir="rtl" className="py-6 flex flex-wrap gap-x-6 gap-y-10 items-end justify-start">
                  {currentWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-[#f5f2ed] transition-colors relative group border border-transparent hover:border-[#e8e4df]"
                      onClick={() => handleSelectWord(word)}
                      onMouseEnter={(e) => {
                        setHoveredWord(word);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredWord(null)}
                    >
                      <span
                        className="text-3xl font-serif text-[#1a1d1b] font-medium group-hover:text-blue-700 transition-colors"
                        dir="rtl"
                      >
                        {word.hebrew}
                      </span>

                      <span className="text-[11px] font-mono text-amber-700 mt-1" dir="ltr">
                        {word.transliteration}
                      </span>

                      <span
                        className="text-xs font-semibold text-blue-800 mt-1 max-w-[120px] text-center truncate"
                        dir="ltr"
                      >
                        {word.translation || '—'}
                      </span>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400" dir="ltr">
                        {word.strongs && <span>#{word.strongs}</span>}
                        {word.grammar && <span>{word.grammar}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <RunningVerseTranslation
                  book={selectedBookId}
                  chapter={selectedChapter}
                  verse={selectedVerse}
                  lang={runningTranslationLang}
                  hasVerseZero={verses.includes(0)}
                />
                {renderTranslationControls()}
              </div>
            ) : (
              <div>
                <div className="py-12 text-center text-xs text-[#8c918d]">
                  Inga ord hittades för denna vers i databasen. Kontrollera att TAHOT-datasetet är laddat för denna bok.
                </div>
                {renderTranslationControls()}
              </div>
            )}
          </section>

          {/* MODAL / INFO-RUTA OM VALD BOK */}
          {bookInfoModalOpen && currentBookInfo && (
            <div
              onClick={() => setBookInfoModalOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-[#e8e4df] max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#e8e4df]">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1d1b]">{currentBookObj.name_sv}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-semibold text-[#2d3732] bg-[#faf8f5] px-2.5 py-0.5 rounded-md border border-[#e8e4df]">
                        {currentBookInfo.category}
                      </span>
                      <span className="text-xs text-[#575c58]">{currentBookInfo.period}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookInfoModalOpen(false)}
                    className="text-[#8c918d] hover:text-[#1a1d1b] p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-[#575c58] leading-relaxed">
                  <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df]">
                    <strong className="text-[#1a1d1b] block mb-1 text-xs uppercase tracking-wider">
                      Författare
                    </strong>
                    <span className="text-xs sm:text-sm text-[#2d312e]">{currentBookInfo.author}</span>
                  </div>

                  <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df]">
                    <strong className="text-[#1a1d1b] block mb-1 text-xs uppercase tracking-wider">
                      Innehåll &amp; sammanhang
                    </strong>
                    <p className="text-xs sm:text-sm text-[#2d312e]">{currentBookInfo.summary}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#e8e4df] flex items-center justify-between gap-3">
                  <Link
                    href={`/historik?book=${encodeURIComponent(currentBookObj.id)}&chapter=${selectedChapter}`}
                    onClick={() => setBookInfoModalOpen(false)}
                    className="text-xs font-semibold text-[#2d3732] hover:text-[#1a1d1b] underline underline-offset-4"
                  >
                    Utforska historisk kontext →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookInfoModalOpen(false)}
                    className="px-4 py-2 bg-[#2d3732] text-white rounded-xl text-xs font-semibold hover:bg-[#1f2723] transition-colors cursor-pointer"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    <strong className="text-[#1a1d1b] block mb-1">Grundtext &amp; TAHOT-datasetet</strong>
                    <span>
                      Grundtexten bygger på den masoretiska traditionen genom <em>Codex Leningradensis</em> (1008 e.Kr.) via TAHOT-datasetet, komplett med translitteration, glossor, Strongs-nummer och grammatisk analys.
                    </span>
                  </div>
                  <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df]">
                    <strong className="text-[#1a1d1b] block mb-1">Löpande översättningar &amp; copyright</strong>
                    <p className="mb-2">
                      Av upphovsrättsskäl används dessa etablerade bibelöversättningar för den löpande texten:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Svenska:</strong> 1917 års kyrkobibel
                      </li>
                      <li>
                        <strong>Engelska:</strong> English Standard Version (ESV)
                      </li>
                      <li>
                        <strong>Spanska:</strong> Reina-Valera 1960 (RV1960)
                      </li>
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

          {hoveredWord && (
            <div
              className="fixed z-50 bg-[#1a1d1b] text-white text-xs p-3.5 rounded-xl shadow-2xl pointer-events-none max-w-xs space-y-1.5 border border-white/10"
              style={{ top: mousePosition.y + 15, left: mousePosition.x + 15 }}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
                <span className="font-serif text-base text-amber-300 font-medium" dir="rtl">
                  {hoveredWord.hebrew}
                </span>
                <span className="text-white/60 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                  {hoveredWord.strongs}
                </span>
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

          {selectedWord && (
            <aside className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl border-l border-[#e8e4df] z-50 p-6 flex flex-col">
              <div className="flex justify-between items-start border-b border-[#e8e4df] pb-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-serif text-[#1a1d1b] font-medium" dir="rtl">
                      {selectedWord.hebrew}
                    </h3>
                    {selectedWord.strongs && (
                      <span className="text-xs font-mono bg-[#faf8f5] border border-[#e8e4df] text-[#575c58] px-2 py-0.5 rounded-md">
                        {selectedWord.strongs}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#575c58] font-serif mt-1">
                    Transliteration:{' '}
                    <span className="font-medium text-[#1a1d1b]">{displayedTransliteration}</span>
                    {lexiconEntry?.lemma && (
                      <span className="font-sans text-[#8c918d] ml-1.5">({lexiconEntry.lemma})</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWord(null)}
                  className="w-8 h-8 rounded-full bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] flex items-center justify-center text-xs text-[#575c58] hover:text-[#1a1d1b] transition-colors cursor-pointer"
                  aria-label="Stäng sidopanel"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
                {/* 1. BEFINTLIG GRUNDINFO */}
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c918d] block mb-0.5">
                      Betydelse
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {selectedWord.translation || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c918d] block mb-1">
                      Grammatisk analys
                    </span>
                    <span className="font-medium text-[#1a1d1b] bg-white px-2.5 py-1 rounded border border-[#e8e4df] inline-block">
                      {parseHebrewGrammar(selectedWord.grammar)}
                    </span>
                  </div>
                </div>

                {/* 2. EXTERN LEXIKONDATA (TBESH, ROTORD & UTFÄLLBAR BDB/TBESH) */}
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c918d]">
                      Lexikon &amp; ordnyans (TBESH)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {lexiconEntry?.occurrence_count != null && (
                        <span className="text-[10px] font-semibold text-[#575c58] bg-white px-2 py-0.5 rounded border border-[#e8e4df]">
                          {lexiconEntry.occurrence_count} förekomster
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setLexiconHelpOpen((prev) => !prev)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-[#575c58] hover:text-[#1a1d1b] bg-white hover:bg-[#f0ece6] border border-[#e8e4df] px-2 py-0.5 rounded transition-colors cursor-pointer"
                        title="Förklaring av lexikonförkortningar"
                      >
                        <Info className="w-3 h-3 text-[#2d3732]" />
                        <span>TBESH / BDB?</span>
                      </button>
                    </div>
                  </div>

                  {lexiconHelpOpen && (
                    <div className="bg-white p-3 rounded-lg border border-[#e8e4df] space-y-1.5 text-[11px] text-[#575c58] leading-relaxed">
                      <div className="font-bold text-[#1a1d1b] text-[10px] uppercase tracking-wider">
                        Förkortningar &amp; lexikonkällor
                      </div>
                      <p>
                        <strong className="text-[#1a1d1b]">TBESH:</strong>{' '}
                        <em>Translators Brief lexicon of Extended Strongs for Hebrew</em> – översiktliga glosor och betydelsenyanser för hebreiska och arameiska ord.
                      </p>
                      <p>
                        <strong className="text-[#1a1d1b]">TBESG:</strong>{' '}
                        <em>Translators Brief lexicon of Extended Strongs for Greek</em> – motsvarande översikt för grekiska ord.
                      </p>
                      <p>
                        <strong className="text-[#1a1d1b]">BDB:</strong>{' '}
                        <em>Brown–Driver–Briggs Hebrew and English Lexicon</em> – klassiskt uppslagsverk för biblisk hebreiska och arameiska.
                      </p>
                      <p>
                        <strong className="text-[#1a1d1b]">LSJ / TFLSJ:</strong>{' '}
                        <em>Liddell–Scott–Jones</em> (samt <em>Translators Formatted full LSJ</em>) – klassiska lexikon för grekiska ord och antika paralleller.
                      </p>
                    </div>
                  )}

                  {lexiconLoading ? (
                    <p className="text-xs text-[#8c918d] italic">Hämtar lexikonpost...</p>
                  ) : (
                    <>
                      <p className="text-xs text-[#2d312e] leading-relaxed whitespace-pre-line">
                        {lexiconEntry?.short_definition ||
                          'Ingen lexikondefinition hittades i strongs_lexicon för denna kod ännu.'}
                      </p>

                      {lexiconEntry?.root_and_cognates && (
                        <div className="pt-2 border-t border-[#e8e4df]/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c918d] block mb-1">
                            Rotord &amp; släktskap
                          </span>
                          <div className="text-xs text-[#2d312e] leading-relaxed whitespace-pre-line">
                            {lexiconEntry.root_and_cognates}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#e8e4df]/80">
                        <button
                          type="button"
                          onClick={() => setDeepLexiconOpen((prev) => !prev)}
                          className="flex items-center justify-between w-full text-left text-[11px] font-semibold text-[#575c58] hover:text-[#1a1d1b] transition-colors cursor-pointer"
                        >
                          <span>Djupare uppslagsverk (BDB / TBESH)</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              deepLexiconOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {deepLexiconOpen && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#e8e4df]/70 space-y-2.5 text-xs text-[#2d312e] leading-relaxed">
                            <div className="whitespace-pre-line">
                              {lexiconEntry?.deep_entry ||
                                'Ingen utförligare uppslagsverkstext registrerad för denna post.'}
                            </div>

                            {lexiconEntry?.parallel_passages && (
                              <p className="text-[11px] text-[#575c58] whitespace-pre-line">
                                <strong className="text-[#1a1d1b]">Parallella ställen:</strong>{' '}
                                {lexiconEntry.parallel_passages}
                              </p>
                            )}

                            {lexiconEntry?.source_notes && (
                              <p className="text-[11px] text-[#8c918d]">
                                <strong className="text-[#575c58]">Källor:</strong> {lexiconEntry.source_notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* 3. AI-KNAPP FÖR FÖRDJUPNING I VERSENS SAMMANHANG */}
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e4df] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c918d]">
                      Nyans i {currentBookObj.name_sv} {selectedChapter}:{selectedVerse}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      AI
                    </span>
                  </div>

                  {user && arKrediterSlut && (
                    <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                      Du har 0 krediter kvar. Fyll på krediter för att göra fler AI-analyser.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyzeHebrewWordNuance}
                    disabled={aiLoading || (Boolean(user) && arKrediterSlut)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold bg-white hover:bg-[#f0ece6] border border-[#e8e4df] text-[#1a1d1b] px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2d3732]" />
                    <span>
                      {aiLoading
                        ? 'Analyserar nyans...'
                        : 'Fördjupa ordets nyans i versen (1 kredit)'}
                    </span>
                  </button>

                  {aiError && <p className="text-[11px] text-red-700 leading-relaxed">{aiError}</p>}
                  {aiExplanation && <FormattedAiExplanation content={aiExplanation} />}
                </div>

                {/* 4. KONKORDANSKNAPP (SAMMA STIL SOM INFOKNAPPARNA, LADDAS VID KLICK) */}
                <div className="pt-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowConcordance((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-[#faf8f5] hover:bg-[#f0ece6] border border-[#e8e4df] text-[#575c58] hover:text-[#1a1d1b] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Visa fullständig konkordans"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#2d3732]" />
                    <span>{showConcordance ? 'Dölj konkordans' : 'Visa fullständig konkordans'}</span>
                  </button>

                  {showConcordance && (
                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8c918d]">
                        Förekomster ({occurrences.length} av {totalCount})
                      </h4>

                      {isLoadingOccurrences && occurrences.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#8c918d]">Hämtar konkordans...</div>
                      ) : (
                        occurrences.map((occ, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (occ.reference) {
                                const parts = occ.reference.split('.');
                                if (parts.length >= 2) {
                                  const bookRef = parts[0];
                                  const chapNum = Number(parts[1]);
                                  const versePart = parts[2] ? Number(parts[2].split('#')[0]) : 1;

                                  const matchedBook = HEBREW_BOOKS.find(
                                    (b) =>
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
                            className="p-3 bg-[#faf8f5] hover:bg-[#f0ece6] rounded-xl border border-[#e8e4df] text-xs cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold text-[#1a1d1b] uppercase text-[10px] mb-0.5">
                                {occ.reference || occ.chapter_verse}
                              </div>
                              <div className="text-[#575c58]">
                                <span className="text-base font-serif text-[#1a1d1b] mr-1.5" dir="rtl">
                                  {occ.hebrew}
                                </span>
                                <span className="text-blue-700 font-medium">
                                  ({occ.translation || '—'})
                                </span>
                              </div>
                            </div>
                            <div>→</div>
                          </div>
                        ))
                      )}

                      {occurrences.length < totalCount && (
                        <button
                          type="button"
                          onClick={() => setVisibleLimit((prev) => prev + 50)}
                          disabled={isLoadingOccurrences}
                          className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isLoadingOccurrences ? 'Laddar...' : `Visa fler (${occurrences.length} av ${totalCount})`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

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
              {VERKTYG_LISTA.map((v) => (
                <li key={v.href}>
                  <Link href={v.href} className="hover:text-[#1a1d1b] transition-colors">
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1d1b]">Information</h4>
            <ul className="space-y-2 text-xs text-[#575c58]">
              <li>
                <Link href="/om" className="hover:text-[#1a1d1b] transition-colors">
                  Om tjänsten
                </Link>
              </li>
              <li>
                <Link href="/pris" className="hover:text-[#1a1d1b] transition-colors">
                  Pris &amp; abonnemang
                </Link>
              </li>
              <li>
                <Link href="/integritet" className="hover:text-[#1a1d1b] transition-colors">
                  Integritetspolicy
                </Link>
              </li>
              <li>
                <Link href="/villkor" className="hover:text-[#1a1d1b] transition-colors">
                  Användarvillkor
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={modalMessage}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          fetchProfile();
        }}
      />
    </div>
  );
}

export default function HebrewAnalys() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-xs text-[#575c58]">
          Laddar hebreisk läsare...
        </div>
      }
    >
      <HebrewAnalysContent />
    </Suspense>
  );
}