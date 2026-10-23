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
  LogOut,
  KeyRound,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

export default function OmPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // States för menyer
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States för feedback-formuläret
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

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
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys för Nya Testamentet', href: '/grekiska', icon: Languages },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked },
    { name: 'Predikantpepp', desc: 'Inspiration & reflektion', href: '/predikantpepp', icon: Sprout },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased selection:bg-[#2d3732] selection:text-white flex flex-col justify-between">
      
      {/* 1. HEADER (ATTIO-STYLE NAVIGATION) */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/80 backdrop-blur-md border-b border-[#e8e4df]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* LOGOTYP */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
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

              <Link href="/om" className="px-3 py-2 text-xs font-semibold text-[#1a1d1b] bg-[#f0ece6] rounded-lg transition-colors">
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

      {/* 2. INNEHÅLL */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16 flex-1 w-full space-y-8">
        
        {/* HUVUDKORT MED INTROTEXTER */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 text-[#575c58] text-sm sm:text-base leading-relaxed">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1d1b] tracking-tight">
            Välkommen till beta-versionen av PREDIKA - din predikoassistent!
          </h1>

          <p>
            Så roligt att du vill vara med och testa Predikoassistenten! Det är en AI-driven tjänst som är skapad för att ge dig byggstenar, 
            inspiration och teologiskt stöd – medan du behåller den fulla kontrollen över din predikan eller ditt tal. <span className="font-semibold text-[#1a1d1b]">Det är ditt budskap och dina teologiska reflektioner som ska stå i centrum. Med din erfarenhet, 
            ditt personliga tonläge och dina språkliga nyanser är du helt oersättlig.</span> Denna AI-tjänst kommer alltså aldrig ersätta dig eller ta ditt jobb.
          </p>

          <p>
            Jag som skapat appen heter Patric och är själv prästvigd i Svenska kyrkan, för Växjö stift 2004. De senaste åren har jag dock jobbat 
            heltid med min hobby inom fotografi, men tankarna på såväl prästeriet som kyrkan finns alltid med. <br />
            Just detta med förkunnelsen har alltid engagerat mig, allt från arbetet med texternas historia till retorik och framförande. Det är är bakgrunden till 
            att jag utvecklar denna tjänst, ett arbete som känns både roligt och angeläget.
          </p>

          <p>
            Utöver idéer till predikan utifrån helgdagens texter hittar du här verktyg som hjälper till med fördjupning i historia, grundtextanalys 
            (endast för NT än), idéer till arbetet med barn & unga mm. Appen har alltså blivit mycket mer än just en predikoassistent.
          </p>

          <p>
            I sin helhet kan man se det som att appen hjälper dig att slå i bibelkommentarer, predikosamlingar och uppslagsverk precis som i ditt eget 
            fysiska bibliotek där hemma, men att du via denna tjänst har tillgång till långt många fler källor som kan ge uppslag och idéer.
          </p>

          <p>
            Bland fördelarna med appen är att du får tillgång till en av de bästa AI-modeller som finns för dessa uppgifter, vilket är anledningen till 
            att den kostar en del att använda.
          </p>

          <p>
            AI-modellen är instruerad att ge förslag och idéer som är teologiskt genomtänkta och relevanta. Instruktionerna har provats fram och tillbaka 
            för att ge de bästa möjliga svaren i en god ton. Du slipper alltså skriva långa promptar på egen hand varje gång. Arbetet med att förfina 
            instruktionerna sker fortlöpande.
          </p>

          <p>
            AI-modellen är i första hand styrd att passa en svenskkyrklig kontext, med variationer i svaren som tar hänsyn till den bredd som finns. 
            Med detta sagt är min förhoppning att även pastorer inom andra kristna samfund kan ha nytta av tjänsten.
          </p>

          <p>
            Då du är med i testgruppen får du såklart tillgång till alla funktioner utan kostnad under utvecklingsfasen. Sidan kommer kontinuerligt att 
            uppdateras med nya funktioner och förbättringar under denna tid. (Bl.a. kommer sidan för &quot;pris&quot; fungera den dagen det är dags att 
            lansera tjänsten på allvar.)
          </p>

          <p>
            Notera att du som testare först bara får 10 krediter/sökningar när du registrerar dig, men så fort jag får notis om att du är med i testgruppen 
            så justerar jag upp det.
          </p>

          <p>
            <span className="font-semibold text-[#1a1d1b]">Jag är tacksam om du inte sprider denna sida till andra ännu, jag vill att vi testar den ordentligt först.</span>
          </p>

          <p>
            Och, till sist: Som många andra har jag haft mina dubier kring detta med AI, inte minst miljöasspekten. Är det verkligen vettigt att vi som förvaltare av 
            skapelsen överhuvudtaget ska hålla på med AI, som bl a drar mycket energi? Och vad händer med oss som människor? Det är stora frågor som verkligen
            är värda att diskutera och undersöka. Jag har själv försökt att räkna på hur mycket ett av de anrop som kräver mest datakraft här motsvarar i energi. 
            Det mest krävande verktyget är sidan med grekiska och språkanalys, ett anrop där visar sig motsvara en handfull sökningar på en helt vanlig sökmotor. Jag 
            tycker det verkar överkomligt, om man tänker på att man hur många sökningar man kan göra inför predikningar i vanliga fall. Hur tänker du? Skriv gärna
            en kommentar om det om du vill.
          </p>

          <p className="pt-2 font-medium text-[#1a1d1b]">
            Bästa hälsningar, Patric.
          </p>
        </section>

        {/* INRAMAD RUTA: VIKTIGT OM AI-MODELLEN */}
        <section className="bg-white border border-[#e8e4df] rounded-2xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[#1a1d1b] font-bold text-base sm:text-lg">
            <ShieldAlert className="w-5 h-5 text-[#2d3732] shrink-0" />
            <h3>Viktigt om AI-modellen</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
            Tänk på att AI-genererade svar alltid utgör underlag och förslag. Kontrollera alltid citat, fakta och bibelhänvisningar mot dina egna källor. Tjänsten är avsedd som en sparringpartner i förberedelsearbetet, inte en slutgiltig teologisk auktoritet.
          </p>
        </section>

        {/* 3. FEEDBACK-FORMULÄR */}
        <section className="bg-white rounded-3xl p-8 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-lg font-bold text-[#1a1d1b] mb-2">Återkoppling</h3>
          <p className="text-xs text-[#575c58] leading-relaxed mb-6">
            PREDIKA är skapat för att ge teologiska byggstenar och inspiration utan att ta över ditt eget budskap. 
            Skriv gärna dina synpunkter nedan så utvecklar vi tjänsten tillsammans!
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
        </section>

      </main>

      {/* 4. ATTIO-STYLE FOOTER NAVIGATION */}
      <footer className="border-t border-[#e8e4df] bg-white py-16 mt-16">
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