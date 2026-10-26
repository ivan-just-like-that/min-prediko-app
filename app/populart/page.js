'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
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
  Flame
} from 'lucide-react';

export default function PopulartPage() {
  const [sokningar, setSokningar] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { name: 'Bibelatlas', desc: 'Interaktiv karta & historisk tidslinje', href: '/karta', icon: Compass },
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
        return { namn: 'Predikoidéer', url: '/predikoideer', icon: Sparkles };
      case 'historik':
        return { namn: 'Historiska kommentarer', url: '/historik', icon: BookOpen };
      case 'grekiska':
        return { namn: 'Rena grekiskan', url: '/grekiska', icon: Languages };
      case 'barn-unga':
      case 'barn-och-unga':
        return { namn: 'Barn & unga', url: '/barn-och-unga', icon: Smile };
      case 'kasualtal':
      case 'kasual':
        return { namn: 'Kasualtal', url: '/kasualtal', icon: Feather };
      default:
        return { namn: 'PREDIKA', url: '/', icon: Sparkles };
    }
  };

  // Bygger H2-rubriken för alla typer av verktygskort
  const getKortRubrik = (item) => {
    if (item.sida === 'barn-unga' || item.sida === 'barn-och-unga') {
      const inriktning = item.verktyg || 'Andakt & budskap';
      const alderskategori = item.helgdag || '';
      
      if (alderskategori) {
        return `${inriktning} (${alderskategori})`;
      }
      return inriktning;
    }

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

    return item.helgdag;
  };

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
                <TrendingUp className="w-5 h-5 text-[#2d3732]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Populärt bland kollegorna
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Se vad andra utforskar för helgdagar, teman och bibelställen just nu. Klicka på valfritt kort för att hoppa direkt in i förberedelsen.
            </p>
          </div>

          {/* SÖKNINGAR GRID */}
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] text-center text-[#575c58] text-xs sm:text-sm">
              Laddar senaste sökningarna...
            </div>
          ) : sokningar.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] text-center text-[#575c58] text-xs sm:text-sm">
              Inga sökningar har registrerats än.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sokningar.map((item) => {
                const info = getSidaInfo(item.sida);
                const Icon = info.icon;

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

                const renHelgdagNamn = (item.helgdag || '')
                  .replace(/^(doptal|vigseltal|griftetal|kasualtal)\s*\(/i, '').replace(/\)$/, '')
                  .replace(/doptal|vigseltal|griftetal|begravning/gi, '')
                  .replace(/[()•]/g, '')
                  .trim();

                const kombinerad = `${item.verktyg || ''} ${item.helgdag || ''}`.toLowerCase();
                const kasualTypParam = kombinerad.includes('vigsel') ? 'vigsel' 
                  : kombinerad.includes('begravning') || kombinerad.includes('grifte') ? 'begravning' 
                  : 'dop';

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
                    className="group block p-6 rounded-2xl border border-[#e8e4df] bg-white hover:border-[#d6d0c7] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#2d3732] font-semibold">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{info.namn}</span>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#faf8f5] text-[#575c58] border border-[#e8e4df]">
                        {getVerktygEtikett(item)}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors flex items-center justify-between">
                      <span>{getKortRubrik(item)}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#c2beb6] group-hover:text-[#1a1d1b] transition-colors shrink-0" />
                    </h2>

                    {item.tema && item.tema !== 'Ej angivet tema' && (
                      <p className="text-xs text-[#575c58] mt-2 leading-relaxed">
                        <span className="font-semibold text-[#1a1d1b]">Tema/Bibelställe:</span> {item.tema}
                      </p>
                    )}

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
          <section className="mt-16 pt-8 border-t border-[#e8e4df]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c918d] mb-6 text-center">
              Utforska fler verktyg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {verktygLista.filter(v => v.href !== '/populart').map((v) => {
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