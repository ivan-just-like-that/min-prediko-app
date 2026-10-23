'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateContent } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
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
  Copy,
  Check,
  PenTool,
  Heart
} from 'lucide-react';

// Hjälp-komponent för kopiera-knapp i Attio-stil
function KopieraKnapp({ text }) {
  const [kopierad, setKopierad] = useState(false);

  const hanteraKopiera = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setKopierad(true);
      setTimeout(() => setKopierad(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera text:', err);
    }
  };

  return (
    <button
      onClick={hanteraKopiera}
      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border ${
        kopierad
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-white hover:bg-[#faf8f5] text-[#575c58] hover:text-[#1a1d1b] border-[#e8e4df]'
      }`}
      title="Kopiera text"
    >
      {kopierad ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kopierat!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Kopiera</span>
        </>
      )}
    </button>
  );
}

export default function PredikantpeppPage() {
  const [peppSvar, setPeppSvar] = useState('');
  const [loadingPepp, setLoadingPepp] = useState(false);

  const [haikuTema, setHaikuTema] = useState('');
  const [haikuSvar, setHaikuSvar] = useState('');
  const [loadingHaiku, setLoadingHaiku] = useState(false);

  const [historiaTema, setHistoriaTema] = useState('');
  const [historiaSvar, setHistoriaSvar] = useState('');
  const [loadingHistoria, setLoadingHistoria] = useState(false);

  // States för menyer
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- STATE FÖR ANVÄNDARE OCH MODAL ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys för Nya Testamentet', href: '/grekiska', icon: Languages },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked },
    { name: 'Predikantpepp', desc: 'Inspiration & reflektion', href: '/predikantpepp', icon: Sprout },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp },
  ];

  // --- HÄMTA PROFIL OCH LYSSNA PÅ INLOGGNINGSÄNDRINGAR ---
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

  // 1. Generera själavårdande pepp till prästen
  const genereraPepp = async () => {
    setLoadingPepp(true);
    setPeppSvar('');

    const vinklar = [
      'påminnelse om att du är älskad precis som du är',
      'att ditt värde inte sitter i hur bra din predikan blir',
      'någon som viskar att du duger precis med dina brister',
      'att du är buren, när du känner dig otillräcklig',
      'en varm påminnelse om att du är värdefull i dig själv',
      'att nåden gäller dig lika mycket som alla andra'
    ];
    const slumpVinkel = vinklar[Math.floor(Math.random() * vinklar.length)];
    const slumpId = Math.random().toString(36).substring(7);

    const promptText = `Du är en genuint varm, kärleksfull och trygg vän som skickar ett uppmuntrande meddelande.

Fokusera på detta tema: ${slumpVinkel}. (Unikt id: ${slumpId})

Regler för svaret:
- Skriv 1–2 korta meningar som förmedlar djup värme, uppskattning och villkorslös acceptans.
- Förbjudna ord och fraser som INTE får finnas med: "släpp ner axlarna", "andas ut", "ta ett djupt andetag", "klyschor".
- Låt det kännas äkta, personligt och innerligt, som en varm kram i textform.
- Skriv enbart själva påminnelsen, utan citationstecken.`;

    try {
      const payload = {
        prompt: promptText,
        sida: 'predikantpepp',
        verktyg: 'Pepp-o-mat',
        helgdag: 'Uppmuntran',
        tema: slumpVinkel,
        inkluderaFraga: false,
        temperature: 0.7,
      };

      const data = await generateContent(payload, () => {
        setModalMessage('Du måste vara inloggad för att använda verktyget.');
        setShowAuthModal(true);
      });

      setPeppSvar(data.text || 'Kunde inte hämta pepp just nu.');

      if (data.tokensLeft !== undefined) {
        setCredits(data.tokensLeft);
      }
    } catch (err) {
      console.error(err);
      setPeppSvar(err.message || 'Ett fel uppstod vid hämtning av pepp.');
    } finally {
      setLoadingPepp(false);
    }
  };

  // 2. Generera Haiku
  const genereraHaiku = async (e) => {
    e.preventDefault();
    if (!haikuTema.trim()) return;

    setLoadingHaiku(true);
    setHaikuSvar('');

    const promptText = `Skriv en teologiskt fördjupad, poetisk och stämningsfull haiku (5-7-5 stavelser) baserat på följande tema eller bibelställe: "${haikuTema}". Svara enbart med själva haikudikten samt en kort rad om dess teologiska klangbotten.`;

    try {
      const payload = {
        prompt: promptText,
        sida: 'predikantpepp',
        verktyg: 'Haikugenerator',
        helgdag: 'Haiku',
        tema: haikuTema,
        inkluderaFraga: false,
      };

      const data = await generateContent(payload, () => {
        setModalMessage('Du måste vara inloggad för att använda verktyget.');
        setShowAuthModal(true);
      });

      setHaikuSvar(data.text || 'Kunde inte generera haiku.');

      if (data.tokensLeft !== undefined) {
        setCredits(data.tokensLeft);
      }
    } catch (err) {
      console.error(err);
      setHaikuSvar(err.message || 'Ett fel uppstod vid generering av haiku.');
    } finally {
      setLoadingHaiku(false);
    }
  };

  // 3. Generera rolig historia
  const genereraHistoria = async (e) => {
    e.preventDefault();
    if (!historiaTema.trim()) return;

    setLoadingHistoria(true);
    setHistoriaSvar('');

    const promptText = `Skriv en kort, varm, rumsren och mild humorfylld historia, anekdot eller uppvärmning som en präst kan inleda sin predikan med för att väcka församlingens leende. Den ska koppla an till temat eller bibelstället: "${historiaTema}". Den ska vara smakfull, avsedd för en kyrklig kontext och lätt att återge muntligt.`;

    try {
      const payload = {
        prompt: promptText,
        sida: 'predikantpepp',
        verktyg: 'Predikointro / Humor',
        helgdag: 'Historia',
        tema: historiaTema,
        inkluderaFraga: false,
      };

      const data = await generateContent(payload, () => {
        setModalMessage('Du måste vara inloggad för att använda verktyget.');
        setShowAuthModal(true);
      });

      setHistoriaSvar(data.text || 'Kunde inte generera historia.');

      if (data.tokensLeft !== undefined) {
        setCredits(data.tokensLeft);
      }
    } catch (err) {
      console.error(err);
      setHistoriaSvar(err.message || 'Ett fel uppstod vid generering av historien.');
    } finally {
      setLoadingHistoria(false);
    }
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
                              <div className="text-xs font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors flex items-center gap-1">
                                {v.name}
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
                    {isTester ? '✨ Testkonto' : `⚡ ${credits ?? 0} sökningar`}
                  </span>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-3.5 py-2 text-xs font-semibold text-[#1a1d1b] bg-white border border-[#e8e4df] hover:bg-[#f0ece6] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logga ut
                  </button>
                </div>
              ) : !authLoading && (
                <button
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

            {/* MOBIL MENY-KNAPP */}
            <button 
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
                  <Link key={v.href} href={v.href} className="text-sm font-medium text-[#1a1d1b] py-1">
                    {v.name}
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t border-[#e8e4df]">
                <Link href="/om" className="block text-sm font-medium text-[#1a1d1b] mb-4">Om PREDIKA</Link>
                {user ? (
                  <button onClick={() => supabase.auth.signOut()} className="w-full py-2.5 bg-[#f0ece6] rounded-xl text-xs font-semibold">
                    Logga ut
                  </button>
                ) : (
                  <button onClick={() => setShowAuthModal(true)} className="w-full py-2.5 bg-[#2d3732] text-white rounded-xl text-xs font-semibold">
                    Logga in
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ANVÄNDARSTATUS & KREDITRÄKNARE */}
        {user && (
          <div className="bg-white border-b border-[#e8e4df] py-2 px-6">
            <div className="max-w-[1000px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
              <span className="truncate">Inloggad som: <strong className="text-[#1a1d1b]">{user.email}</strong></span>
              
              {credits !== null && (
                <span className="bg-[#faf8f5] border border-[#e8e4df] font-semibold px-3 py-1 rounded-full text-[#2d3732] shrink-0">
                  {isTester ? '✨ Testkonto (Obegränsat)' : `⚡ ${credits} sökningar kvar`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* HUVUDINNEHÅLL */}
        <main className="max-w-[1000px] mx-auto px-6 pt-12 pb-16">
          
          {/* INTRO-RUTA */}
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Predikantpepp
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Uppmuntran, poesi och kanske ett leende? Denna sida ingår utan att dra av dina krediter.
            </p>
          </div>

          {/* MODUL 1: Själavårdande pepp till prästen */}
          <section className="bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 text-center space-y-4 mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] mb-2">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1d1b]">
              Pepp-o-mat
            </h2>
            <p className="text-xs sm:text-sm text-[#575c58] max-w-lg mx-auto leading-relaxed">
              Du är viktig, älskad och duger just som den du är.
            </p>
            <div>
              <button
                onClick={genereraPepp}
                disabled={loadingPepp}
                className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {loadingPepp ? 'Hämtar uppmuntran...' : 'Nu behöver jag lite pepp'}
              </button>
            </div>

            {peppSvar && (
              <div className="mt-6 p-6 bg-[#faf8f5] border border-[#e8e4df] rounded-2xl text-[#1a1d1b] text-sm sm:text-base italic font-serif leading-relaxed max-w-xl mx-auto">
                ”{peppSvar}”
              </div>
            )}
          </section>

          {/* MODUL 2: Haikugenerator */}
          <section className="bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1a1d1b]">
                Haikugenerator
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Få en poetisk haiku (5-7-5 stavelser) baserat på söndagens tema, ett bibelord eller valfritt ämne.
            </p>
            <form onSubmit={genereraHaiku} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={haikuTema}
                onChange={(e) => setHaikuTema(e.target.value)}
                placeholder="T.ex. Johannes 3:16 eller 'Förlåtelse'"
                className="flex-1 px-4 py-3 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-xs sm:text-sm text-[#1a1d1b] placeholder:text-[#a09a90] focus:outline-none focus:border-[#2d3732]"
              />
              <button
                type="submit"
                disabled={loadingHaiku || !haikuTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {loadingHaiku ? 'Skapar...' : 'Generera Haiku'}
              </button>
            </form>

            {haikuSvar && (
              <div className="mt-4 p-6 bg-[#faf8f5] border border-[#e8e4df] rounded-2xl text-[#1a1d1b]">
                <div className="flex justify-between items-center gap-4 mb-3 border-b border-[#e8e4df] pb-3">
                  <span className="text-[11px] font-bold text-[#8c918d] uppercase tracking-wider">
                    Genererad Haiku ({haikuTema})
                  </span>
                  <KopieraKnapp text={haikuSvar} />
                </div>
                <div className="whitespace-pre-wrap font-serif text-xs sm:text-sm leading-relaxed text-[#2d312e]">
                  {haikuSvar}
                </div>
              </div>
            )}
          </section>

          {/* MODUL 3: Rolig historia / Predikointro */}
          <section className="bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1a1d1b]">
                En jätterolig historia..?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              AI:ns känsla för humor varierar, men ibland blir det en fin anekdot som kan väcka ett leende som inledning till predikan eller andakt.
            </p>
            <form onSubmit={genereraHistoria} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={historiaTema}
                onChange={(e) => setHistoriaTema(e.target.value)}
                placeholder="T.ex. 'Tålamod', 'Skapelsen' eller 'Lukas 15'"
                className="flex-1 px-4 py-3 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-xs sm:text-sm text-[#1a1d1b] placeholder:text-[#a09a90] focus:outline-none focus:border-[#2d3732]"
              />
              <button
                type="submit"
                disabled={loadingHistoria || !historiaTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {loadingHistoria ? 'Skapar...' : 'Skapa historia'}
              </button>
            </form>

            {historiaSvar && (
              <div className="mt-4 p-6 bg-[#faf8f5] border border-[#e8e4df] rounded-2xl text-[#1a1d1b]">
                <div className="flex justify-between items-center gap-4 mb-3 border-b border-[#e8e4df] pb-3">
                  <span className="text-[11px] font-bold text-[#8c918d] uppercase tracking-wider">
                    Historia / Anekdot ({historiaTema})
                  </span>
                  <KopieraKnapp text={historiaSvar} />
                </div>
                <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#2d312e] font-sans">
                  {historiaSvar}
                </div>
              </div>
            )}
          </section>

          {/* NAVIGERA TILL ANDRA VERKTYG */}
          <section className="mt-16 pt-8 border-t border-[#e8e4df]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c918d] mb-6 text-center">
              Utforska fler verktyg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {verktygLista.filter(v => v.href !== '/predikantpepp').map((v) => {
                const Icon = v.icon;
                return (
                  <Link key={v.href} href={v.href} className="group block">
                    <div className="p-5 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] group-hover:bg-[#2d3732] group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#c2beb6] group-hover:text-[#1a1d1b] transition-colors" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1a1d1b] mb-1 group-hover:text-[#2d3732] transition-colors">
                          {v.name}
                        </h4>
                        <p className="text-xs text-[#575c58] leading-relaxed">
                          {v.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </main>
      </div>

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

      {/* INLOGGNINGSMODAL */}
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