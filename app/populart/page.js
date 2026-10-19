'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

export default function PopulartPage() {
  const [sokningar, setSokningar] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function hamtaSokningar() {
      // Hämtar de 20 senaste sökningarna (exkluderar predikopepp)
      const { data, error } = await supabase
        .from('popular_searches')
        .select('*')
        .neq('sida', 'predikopepp')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Fel vid hämtning:', error);
      } else {
        setSokningar(data || []);
      }
      setLoading(false);
    }

    hamtaSokningar();
  }, []);

  // Mappning för dina aktiva verktygssidor
  const getSidaInfo = (sidaKey) => {
    switch (sidaKey) {
      case 'predikoideer':
        return { namn: 'Predikoidéer', url: '/predikoideer', ikon: '💡' };
      case 'historik':
        return { namn: 'Historiska kommentarer', url: '/historik', ikon: '📜' };
      case 'grekiska':
        return { namn: 'Rena grekiskan', url: '/grekiska', ikon: '🏛️' };
      case 'barn-unga':
      case 'barn-och-unga':
        return { namn: 'Barn & unga', url: '/barn-och-unga', ikon: '🎈' };
      case 'kasualtal':
      case 'kasual':
        return { namn: 'Kasualtal', url: '/kasualtal', ikon: '🕊️' };
      default:
        return { namn: 'Predikoassistent', url: '/', ikon: '💡' };
    }
  };

  // Bygger H2-rubriken för alla typer av verktygskort
  const getKortRubrik = (item) => {
    // 1. Barn & unga
    if (item.sida === 'barn-unga' || item.sida === 'barn-och-unga') {
      const inriktning = item.verktyg || 'Andakt & budskap';
      const alderskategori = item.helgdag || '';
      
      if (alderskategori) {
        return `${inriktning} (${alderskategori})`;
      }
      return inriktning;
    }

    // 2. Kasualtal
    if (item.sida === 'kasualtal' || item.sida === 'kasual') {
      let tillfalle = 'Kasualtal';
      const kombineradText = `${item.verktyg || ''} ${item.helgdag || ''}`.toLowerCase();

      if (kombineradText.includes('dop')) {
        tillfalle = 'Doptal';
      } else if (kombineradText.includes('vigsel')) {
        tillfalle = 'Vigseltal';
      } else if (kombineradText.includes('begravning') || kombineradText.includes('grifte')) {
        tillfalle = 'Griftetal';
      }

      let renHelgdag = (item.helgdag || '')
        .replace(/doptal|vigseltal|griftetal|begravning/gi, '')
        .replace(/disposition|inledning|psalmförslag|egen fråga/gi, '')
        .replace(/[()•]/g, '')
        .trim();

      if (!renHelgdag) {
        renHelgdag = 'Egen text';
      }

      return `${tillfalle} (${renHelgdag})`;
    }

    // 3. Övriga verktyg
    return item.helgdag;
  };

  // Taggen i övre högra hörnet på kortet
  const getVerktygEtikett = (item) => {
    if (item.sida === 'barn-unga' || item.sida === 'barn-och-unga') {
      return 'Barn & unga';
    }
    if (item.sida === 'kasualtal' || item.sida === 'kasual') {
      return 'Kasualtal';
    }
    return item.verktyg || 'Sökning';
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased flex flex-col justify-between">
      <div>
        
        {/* HEADER / TOPPMENY */}
        <header className="bg-white border-b border-[#e8e4df] py-4">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
            
            {/* VÄNSTER: Tillbaka-länk + Sida/Logotyp */}
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
                <span className="sm:hidden">Populärt</span>
                <span className="hidden sm:inline">Populärt bland kollegorna</span>
              </h1>
            </div>

            {/* HÖGER: Navigation (Pris & Logga in/ut) */}
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
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Populärt bland kollegorna
              </h2>
            </div>
            
            <p className="text-sm text-[#575c58] leading-relaxed">
              Se vad andra utforskar för helgdagar, teman och bibelställen just nu. No more FOMO.
            </p>
          </div>

          {/* SÖKNINGAR GRID */}
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] text-center text-[#575c58] text-sm">
              Laddar senaste sökningarna...
            </div>
          ) : sokningar.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] text-center text-[#575c58] text-sm">
              Inga sökningar har registrerats än.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sokningar.map((item) => {
                const info = getSidaInfo(item.sida);

                // Identifiera om texten gäller GT, Epistel eller Evangelium
                const predikotextLower = (item.predikotext || '').toLowerCase();
                const valdTextTyp = 
                predikotextLower.includes('gammaltestamentlig') || 
                predikotextLower.includes('gt:') || 
                predikotextLower.startsWith('gt ') ||
                predikotextLower.startsWith('gt')
                    ? 'gt'
                    : predikotextLower.includes('epistel')
                    ? 'epistel'
                    : 'evangelium';

                // Rensa helgdagsnamnet för ren URL-hantering
                const renHelgdagNamn = (item.helgdag || '')
                  .replace(/^(doptal|vigseltal|griftetal|kasualtal)\s*\(/i, '').replace(/\)$/, '')
                  .replace(/doptal|vigseltal|griftetal|begravning/gi, '')
                  .replace(/[()•]/g, '')
                  .trim();

                // Ta reda på kasualtypen så att den kan skickas med i URL:en för Kasualtal
                const kombinerad = `${item.verktyg || ''} ${item.helgdag || ''}`.toLowerCase();
                const kasualTypParam = kombinerad.includes('vigsel') ? 'vigsel' 
                  : kombinerad.includes('begravning') || kombinerad.includes('grifte') ? 'begravning' 
                  : 'dop';

                // Bygg mållänk: Barn & unga leder rent till /barn-och-unga utan extra parametrar
                let malUrl = info.url;
                if (item.sida === 'barn-unga' || item.sida === 'barn-och-unga') {
                  malUrl = '/barn-och-unga';
                } else if (item.sida === 'kasualtal' || item.sida === 'kasual') {
                  malUrl = `${info.url}?helgdag=${encodeURIComponent(renHelgdagNamn)}&kasualTyp=${kasualTypParam}&textKalla=evangelieboken&textTyp=${valdTextTyp}&argang=${encodeURIComponent(item.argang || 'argang1')}`;
                } else {
                  malUrl = `${info.url}?helgdag=${encodeURIComponent(renHelgdagNamn)}&textKalla=evangelieboken&textTyp=${valdTextTyp}&argang=${encodeURIComponent(item.argang || 'argang1')}`;
                }

                return (
                  <Link
                    key={item.id}
                    href={malUrl}
                    className="group block p-5 rounded-2xl border border-[#e8e4df] bg-white hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#2563eb] font-semibold">
                        <span>{info.ikon}</span>
                        <span>{info.namn}</span>
                      </div>

                      {/* Taggen i övre högra hörnet */}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#faf8f5] text-[#575c58] border border-[#e8e4df]">
                        {getVerktygEtikett(item)}
                      </span>
                    </div>

                    {/* Rubriken */}
                    <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      {getKortRubrik(item)}
                    </h3>

                    {/* Tema / Bibelställe */}
                    {item.tema && item.tema !== 'Ej angivet tema' && (
                      <p className="text-xs text-[#575c58] mt-1.5 leading-relaxed">
                        <span className="font-semibold text-[#2d312e]">Tema/Bibelställe:</span> {item.tema}
                      </p>
                    )}

                    {/* Predikotext */}
                    {item.predikotext && item.predikotext !== 'Ej angiven text' && (
                      <p className="text-xs text-[#8c918d] mt-1 leading-relaxed">
                        <span className="font-medium">Text:</span> {item.predikotext}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

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

              <Link href="/predikantpepp" className="group block">
                <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                  <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🌱</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                      Predikantpepp →
                    </h4>
                    <p className="text-xs text-[#575c58]">
                      Pepp, haikuer & humor.
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