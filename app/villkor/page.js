'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  Compass,
  Sparkles, 
  BookOpen, 
  Languages, 
  Smile, 
  Feather, 
  BookMarked, 
  Sprout, 
  TrendingUp,
  FileText,
  ChevronDown,
  LogOut,
  KeyRound,
  Menu,
  X
} from 'lucide-react';

export default function Villkor() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // States för menyer
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys för Nya Testamentet', href: '/grekiska', icon: Languages },
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

        {/* ANVÄNDARSTATUS & KREDITRÄKNARE */}
        {user && (
          <div className="bg-white border-b border-[#e8e4df] py-2 px-6">
            <div className="max-w-[1100px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
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
        <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-16">
          <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 sm:p-12">
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1d1b]">
                Användar- och köpvillkor
              </h1>
            </div>
            
            <p className="text-xs text-[#8c918d] mb-8 border-b border-[#e8e4df] pb-4">
              Senast uppdaterad: Oktober 2026
            </p>

            <div className="space-y-6 text-xs sm:text-sm text-[#575c58] leading-relaxed">
              
              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  1. Allmänna villkor
                </h2>
                <p>
                  Genom att skapa ett konto och använda tjänsten <strong>PREDIKA</strong> godkänner du dessa användarvillkor. Tjänsten tillhandahåller digitala verktyg och AI-baserat stöd för predikoförberedelser, teologiskt arbete och undervisning inom Svenska kyrkans kontext.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  2. Ansvarsfriskrivning för AI-innehåll
                </h2>
                <p>
                  Texter, dispositioner och idéer som genereras av plattformen produceras med hjälp av artificiell intelligens (Google Gemini API). Användaren (predikanten eller församlingsmedarbetaren) har alltid det fulla ansvaret att själv granska, teologiskt värdera och godkänna det material som sedan används i predikningar eller kyrkliga sammanhang.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  3. Konto och säkerhet
                </h2>
                <p>
                  Du ansvarar själv för att hålla dina inloggningsuppgifter (e-post och lösenord) säkra. Kontot är personligt och får inte delas med obehöriga. Vi förbehåller oss rätten att stänga av konton som missbrukar tjänsten.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  4. Köp- och betalningsvillkor
                </h2>
                <p className="mb-2">
                  När du köper krediter eller prenumerationer via våra betalningspartner (t.ex. Stripe) gäller följande:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#575c58]">
                  <li><strong className="text-[#1a1d1b]">Priser:</strong> Samtliga priser anges i svenska kronor (SEK) inklusive mervärdesskatt (moms) där så är tillämpligt.</li>
                  <li><strong className="text-[#1a1d1b]">Leverans av krediter:</strong> Krediter läggs till på ditt konto omedelbart efter genomförd och godkänd betalning.</li>
                  <li><strong className="text-[#1a1d1b]">Ångerrätt för digitala tjänster:</strong> Eftersom krediter och digitala anrop levereras omedelbart och förbrukas i realtid, godkänner du i samband med köp att ångerrätten upphör så snart leveransen har påbörjats.</li>
                  <li><strong className="text-[#1a1d1b]">Säkerhet vid betalning:</strong> Inga kortuppgifter lagras på våra servrar; alla betalningstransaktioner hanteras krypterat via certifierad betalningsleverantör.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  5. Ändringar av villkoren
                </h2>
                <p>
                  Vi förbehåller oss rätten att när som helst uppdatera dessa villkor. Vid väsentliga förändringar kommer information att lämnas på webbplatsen.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  6. Kontakt
                </h2>
                <p>
                  Vid frågor gällande villkoren eller dina köp är du varmt välkommen att kontakta oss via e-post på <span className="font-medium text-[#1a1d1b]">ivan@patricivan.se</span>.
                </p>
              </section>

            </div>

            {/* Slutknapp */}
            <div className="mt-10 pt-6 border-t border-[#e8e4df] text-center">
              <Link 
                href="/" 
                className="inline-block bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                Tillbaka till tjänsten
              </Link>
            </div>

          </div>
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