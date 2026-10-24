'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  Lightbulb
} from 'lucide-react';

const heroPhrases = [
  "Upptäck en ny form av förberedelse.",
  "Ditt nya teologiska bibliotek.",
  "Djupdyk i böckernas bok.",
  "Alla verktyg på ett ställe.",
  "Idétorka? Här finns inspiration."
];

export default function PredikaLandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // States för rotérande hero-rubrik
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);

  // States för menyer
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States för feedback-formuläret
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Effekt för att tona in/ut hero-meningarna
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroVisible(false);

      setTimeout(() => {
        setHeroIndex((prevIndex) => (prevIndex + 1) % heroPhrases.length);
        setHeroVisible(true);
      }, 1000); // 1000ms toningstid
    }, 5000); // Byter mening var 5:e sekund

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModalMessage('Skriv in ditt nya lösenord nedan:');
        setShowAuthModal(true);
      } else if (session?.user) {
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');

    try {
      // Hämta inloggnings-token från Supabase-sessionen
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Skicka med inloggad användares mail om fältet lämnas tomt
      const userEmail = feedbackEmail.trim() || user?.email || null;

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: userEmail,
          message: feedbackMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Kunde inte skicka feedback');
      }

      setFeedbackSubmitted(true);
      setFeedbackEmail('');
      setFeedbackMessage('');
    } catch (err) {
      console.error('Feedback error:', err);
      setFeedbackError('Kunde inte skicka återkopplingen. Försök igen.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Lightbulb },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys för Nya Testamentet', href: '/grekiska', icon: Languages },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked },
    { name: 'Predikantpepp', desc: 'Inspiration & reflektion', href: '/predikantpepp', icon: Sprout },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased selection:bg-[#2d3732] selection:text-white">
      
      {/* 1. HEADER (ATTIO-STYLE NAVIGATION) */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/80 backdrop-blur-md border-b border-[#e8e4df]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* LOGOTYP */}
          <div className="flex items-center gap-8">
            <Link href="/test-layout-2" className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-[#1a1d1b]">PREDIKA</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f0ece6] text-[#2d3732] px-2 py-0.5 rounded-full border border-[#e8e4df]">
                beta
              </span>
            </Link>

            {/* DESKTOP MENY */}
            <nav className="hidden md:flex items-center gap-1">
              
              {/* DROPDOWN VERKTYG */}
              <div className="relative" onMouseLeave={() => setToolsOpen(false)}>
                <button 
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

          {/* MOBIL KNAPP */}
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

{/* 2. HERO SEKTION (REN & TIGHT) */}
<section className="pt-20 pb-16 max-w-3xl mx-auto px-6 text-center">
  
  {/* 1. BADGE */}
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e8e4df] rounded-full text-xs font-semibold text-[#575c58] mb-8 shadow-sm">
    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    Utvecklad för präster & teologer
  </div>

  {/* 2. ROTERANDE RUBRIK */}
  <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1a1d1b] leading-[1.1] mb-6 min-h-[2.2em] sm:min-h-[1.2em] flex items-center justify-center">
    <span 
      className={`transition-opacity duration-1000 ease-in-out ${
        heroVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {heroPhrases[heroIndex]}
    </span>
  </h1>

  {/* 3. REN & ENKEL UNDERTEXT */}
  <p className="text-base sm:text-lg text-[#575c58] leading-relaxed font-normal max-w-xl mx-auto mb-10">
    Teologiska byggstenar och inspiration till församlingsarbetet.
  </p>

  {/* 4. CALL TO ACTION */}
  {!user ? (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        onClick={() => {
          setModalMessage('Skapa ett konto och få 10 gratis sökningar direkt!');
          setShowAuthModal(true);
        }}
        className="px-6 py-3.5 text-xs font-bold text-white bg-[#2d3732] hover:bg-[#1f2723] rounded-2xl transition-all shadow-sm hover:shadow flex items-center gap-2 active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        Påbörja testperiod
      </button>
      <span className="text-[11px] text-[#8c918d]">10 gratis anrop &bull; Inget kort krävs</span>
    </div>
  ) : (
    <div className="inline-block bg-white border border-[#e8e4df] px-4 py-2.5 rounded-2xl text-xs text-[#575c58] shadow-sm">
      Inloggad som <strong className="text-[#1a1d1b]">{user.email}</strong> &bull; {isTester ? '✨ Testkonto' : `⚡ ${credits ?? 0} sökningar kvar`}
    </div>
  )}

</section>

      {/* 3. VERKTYGSGRID (ATTIO CARD-DESIGN) */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-8 border-b border-[#e8e4df] pb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8c918d]">
            Utvalda verktyg
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verktygLista.map((v) => {
            const Icon = v.icon;
            return (
              <Link key={v.href} href={v.href} className="group block">
                <div className="p-5 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] group-hover:bg-[#2d3732] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#c2beb6] group-hover:text-[#1a1d1b] transition-colors" />
                    </div>

                    <h3 className="text-sm font-bold text-[#1a1d1b] mb-1 group-hover:text-[#2d3732] transition-colors">
                      {v.name}
                    </h3>
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

      {/* 4. FEEDBACK & BETATEXT */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-3xl p-8 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-lg font-bold text-[#1a1d1b] mb-2">Återkoppling</h3>
          <p className="text-xs text-[#575c58] leading-relaxed mb-6">
            PREDIKA är i testfasen. Har du förslag på hur verktyget kan bli ännu bättre för dig? Skriv gärna dina synpunkter nedan!
          </p>

          {feedbackSubmitted ? (
            <div className="p-4 bg-[#f0ece6] text-[#2d3732] rounded-xl text-xs font-semibold text-center border border-[#e8e4df] animate-in fade-in duration-200">
              Tack för din återkoppling! Dina synpunkter har sparats och skickats.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              {feedbackError && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {feedbackError}
                </div>
              )}

              <input
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="Din e-post (valfritt)"
                className="w-full px-4 py-2.5 text-xs bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b] focus:outline-none focus:border-[#2d3732] focus:bg-white transition-all"
              />
              <textarea
                required
                rows={3}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Vad fungerar bra? Vad saknas?"
                className="w-full px-4 py-2.5 text-xs bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b] focus:outline-none focus:border-[#2d3732] focus:bg-white transition-all resize-none"
              ></textarea>
              <button
                type="submit"
                disabled={feedbackLoading}
                className="w-full py-2.5 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {feedbackLoading ? 'Skickar...' : 'Skicka återkoppling'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 5. ATTIO-STYLE FOOTER NAVIGATION */}
      <footer className="border-t border-[#e8e4df] bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* KOLUMN 1: BRAND */}
          <div className="col-span-2 space-y-3">
            <span className="font-bold text-lg tracking-tight text-[#1a1d1b]">PREDIKA</span>
            <p className="text-xs text-[#8c918d] max-w-xs leading-relaxed">
              En modern plattform för teologisk fördjupning, predikoförberedelse och undervisning.
            </p>
            <p className="text-[11px] text-[#8c918d]">© 2026 Patric Ivan</p>
          </div>

          {/* KOLUMN 2: ALLA VERKTYG */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1d1b]">Verktyg</h4>
            <ul className="space-y-2 text-xs text-[#575c58]">
              <li><Link href="/predikoideer" className="hover:text-[#1a1d1b] transition-colors">Predikoidéer</Link></li>
              <li><Link href="/historik" className="hover:text-[#1a1d1b] transition-colors">Historiska kommentarer</Link></li>
              <li><Link href="/grekiska" className="hover:text-[#1a1d1b] transition-colors">Rena grekiskan</Link></li>
              <li><Link href="/barn-och-unga" className="hover:text-[#1a1d1b] transition-colors">Barn & unga</Link></li>
              <li><Link href="/kasualtal" className="hover:text-[#1a1d1b] transition-colors">Kasualtal</Link></li>
              <li><Link href="/bibelstudium" className="hover:text-[#1a1d1b] transition-colors">Bibelstudieguiden</Link></li>
              <li><Link href="/predikantpepp" className="hover:text-[#1a1d1b] transition-colors">Predikantpepp</Link></li>
              <li><Link href="/populart" className="hover:text-[#1a1d1b] transition-colors">Populärt</Link></li>
            </ul>
          </div>

          {/* KOLUMN 3: INFORMATION */}
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