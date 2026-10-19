'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateContent } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

// Hjälp-komponent för kopiera-knapp
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
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
        kopierad
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-white hover:bg-[#f4f0eb] text-[#575c58] hover:text-[#1a1d1b] border-[#e8e4df]'
      }`}
      title="Kopiera text"
    >
      {kopierad ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Kopierat!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Kopiera</span>
        </>
      )}
    </button>
  );
}

export default function PredikantpeppPage() {
  // Tillstånd för de tre modulerna
  const [peppSvar, setPeppSvar] = useState('');
  const [loadingPepp, setLoadingPepp] = useState(false);

  const [haikuTema, setHaikuTema] = useState('');
  const [haikuSvar, setHaikuSvar] = useState('');
  const [loadingHaiku, setLoadingHaiku] = useState(false);

  const [historiaTema, setHistoriaTema] = useState('');
  const [historiaSvar, setHistoriaSvar] = useState('');
  const [loadingHistoria, setLoadingHistoria] = useState(false);

  // --- STATE FÖR ANVÄNDARE OCH MODAL ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

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
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased flex flex-col justify-between">
      <div>
        
        {/* HEADER / TOPPMENY */}
        <header className="bg-white border-b border-[#e8e4df] py-4">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
            
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link 
                href="/" 
                className="text-[#575c58] hover:text-[#1a1d1b] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
              >
                <span>←</span>
                <span className="hidden sm:inline">Tillbaka till start</span>
                <span className="sm:hidden">Start</span>
              </Link>
              
              <span className="text-[#e8e4df]">|</span>
              
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#1a1d1b] truncate">
                Predikantpepp
              </h1>
            </div>

            <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
              <Link 
                href="/pris" 
                className="text-[#575c58] hover:text-[#1a1d1b] text-xs sm:text-sm font-medium transition-colors"
              >
                Pris
              </Link>
              
            {/* DYNAMISK LOGGA IN / LOGGA UT-KNAPP (Döljs under laddning för att undvika blinkning) */}
            {!authLoading && (
              user ? (
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="bg-[#e8e4df] hover:bg-[#d8d4cf] text-[#1a1d1b] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                >
                  Logga ut
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setModalMessage('Skapa ett konto för att få 10 gratisanrop!');
                    setShowAuthModal(true);
                  }}
                  className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                >
                  Logga in
                </button>
              )
            )}
          </nav>

          </div>
        </header>

        {/* ANVÄNDARSTATUS & KREDITRÄKNARE */}
        {user && (
          <div className="bg-[#f4f0eb] border-b border-[#e8e4df] py-2 px-4">
            <div className="max-w-[1100px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
              <span className="truncate">Inloggad som: <strong className="text-[#1a1d1b]">{user.email}</strong></span>
              {credits !== null && (
                <span className="bg-white border border-[#e8e4df] font-semibold px-2.5 py-1 rounded-full text-[#2d3732] shrink-0">
                  {isTester ? '✨ Testkonto (Obegränsat)' : `⚡ ${credits} sökningar kvar`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* HUVUDINNEHÅLL */}
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
          
          {/* INTRO-RUTA */}
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌱</span>
              <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Uppmuntran, poesi och kanske ett leende?
              </h2>
            </div>
            
            <p className="text-sm text-[#575c58] leading-relaxed">
              Denna sida ingår gratis i ditt medlemskap, inga krediter dras här.
            </p>
          </div>

          {/* MODUL 1: Själavårdande pepp till prästen */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 text-center space-y-4">
            <div className="inline-block bg-[#f4f0eb] p-3 rounded-full text-2xl mb-1">
              🌱
            </div>
            <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
              Pepp-o-mat
            </h2>
            <p className="text-sm text-[#575c58] max-w-lg mx-auto">
              Du är viktig, älskad och duger just som den du är.
            </p>
            <div>
              <button
                onClick={genereraPepp}
                disabled={loadingPepp}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50 shadow-sm"
              >
                {loadingPepp ? 'Hämtar uppmuntran...' : 'Nu behöver jag lite pepp'}
              </button>
            </div>

            {peppSvar && (
              <div className="mt-6 p-6 bg-[#f4f0eb] border border-[#e8e4df] rounded-xl text-[#1a1d1b] text-base md:text-lg italic font-serif leading-relaxed max-w-2xl mx-auto">
                ”{peppSvar}”
              </div>
            )}
          </section>

          {/* MODUL 2: Haikugenerator */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl p-2 bg-[#f4f0eb] rounded-lg">✒️</span>
              <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
                Haikugenerator
              </h2>
            </div>
            <p className="text-sm text-[#575c58]">
              Få en poetisk haiku (5-7-5 stavelser) baserat på söndagens tema, ett bibelord, eller vad du vill.
            </p>
            <form onSubmit={genereraHaiku} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={haikuTema}
                onChange={(e) => setHaikuTema(e.target.value)}
                placeholder="T.ex. Johannes 3:16 eller 'Förlåtelse'"
                className="flex-1 px-4 py-3 border border-[#e8e4df] rounded-xl focus:ring-2 focus:ring-[#2d3732] focus:outline-none text-[#1a1d1b]"
              />
              <button
                type="submit"
                disabled={loadingHaiku || !haikuTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50"
              >
                {loadingHaiku ? 'Skapar...' : 'Generera Haiku'}
              </button>
            </form>

            {haikuSvar && (
              <div className="mt-4 p-5 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b]">
                <div className="flex justify-between items-start gap-4 mb-2 border-b border-[#e8e4df] pb-2">
                  <span className="text-xs font-bold text-[#575c58] uppercase tracking-wider">
                    Genererad Haiku ({haikuTema})
                  </span>
                  <KopieraKnapp text={haikuSvar} />
                </div>
                <div className="whitespace-pre-wrap font-serif leading-relaxed">
                  {haikuSvar}
                </div>
              </div>
            )}
          </section>

          {/* MODUL 3: Rolig historia / Predikointro */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl p-2 bg-[#f4f0eb] rounded-lg">😊</span>
              <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
                En jätterolig historia..?
              </h2>
            </div>
            <p className="text-sm text-[#575c58]">
              AI:ns känsla för humor varierar... Men ibland blir det bra och då kan man ju ha användning av lustigheten i något sammanhang, 
              kanske som inledning till ett tal eller, i vissa fall, en andakt/predikan.
            </p>
            <form onSubmit={genereraHistoria} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={historiaTema}
                onChange={(e) => setHistoriaTema(e.target.value)}
                placeholder="T.ex. 'Tålamod', 'Skapelsen' eller 'Lukas 15'"
                className="flex-1 px-4 py-3 border border-[#e8e4df] rounded-xl focus:ring-2 focus:ring-[#2d3732] focus:outline-none text-[#1a1d1b]"
              />
              <button
                type="submit"
                disabled={loadingHistoria || !historiaTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50"
              >
                {loadingHistoria ? 'Skapar...' : 'Skapa historia'}
              </button>
            </form>

            {historiaSvar && (
              <div className="mt-4 p-5 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b]">
                <div className="flex justify-between items-start gap-4 mb-2 border-b border-[#e8e4df] pb-2">
                  <span className="text-xs font-bold text-[#575c58] uppercase tracking-wider">
                    Historia / Anekdot ({historiaTema})
                  </span>
                  <KopieraKnapp text={historiaSvar} />
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {historiaSvar}
                </div>
              </div>
            )}
          </section>

          {/* NAVIGERA TILL ANDRA VERKTYG */}
          <section className="mt-12 pt-8 border-t border-[#e8e4df]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#575c58] mb-4 text-center">
              Utforska fler verktyg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/predikoideer" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">💡</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Predikoidéer →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Dispositioner & vinklar.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/historik" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">📜</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Historiska kommentarer →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Djupdykning i historien.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/grekiska" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🇬🇷</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Rena grekiskan →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Grundtextanalys.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/barn-och-unga" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🎈</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Barn & unga →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Andakter och lekar.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/kasualtal" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🕊️</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Kasualtal →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Dop, vigsel och begravning.
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/populart" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🔥</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Populärt bland kollegorna →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Se vad andra utforskar.
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </section>

        </div>
      </div>

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

      {/* FOOTER */}
      <footer className="mt-16 py-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d] bg-white">
        © 2026 Patric Ivan. Innehåll genererat av användare mha AI.
      </footer>
    </main>
  );
}