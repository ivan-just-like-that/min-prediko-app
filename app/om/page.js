'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

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
        <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-16 space-y-6">
          
          {/* HUVUDKORT MED INTROTEXTER */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 text-[#575c58] text-sm sm:text-base leading-relaxed">
            
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1d1b] tracking-tight">
              Välkommen till betaversionen av PREDIKA – din predikoassistent!
            </h1>

            <p>
              Så roligt att du vill vara med och testa PREDIKA! Det är en delvis AI-driven tjänst som är skapad för att ge dig byggstenar, 
              inspiration och teologiskt stöd – medan du behåller den fulla kontrollen över din predikan eller ditt tal.{' '}
              <span className="font-semibold text-[#1a1d1b]">Det är ditt budskap och dina teologiska reflektioner som ska stå i centrum. Med din erfarenhet, 
              ditt personliga tonläge och dina språkliga nyanser är du helt oersättlig.</span> Denna AI-tjänst kommer alltså aldrig ersätta dig eller ta ditt jobb.
            </p>

            <h2 className="text-lg sm:text-xl font-semibold italic text-[#1a1d1b] pt-2">
              Bakgrund &amp; innehåll
            </h2>

            <p>
              Jag som skapat appen heter Patric och är prästvigd i Svenska kyrkan för Växjö stift 2004. De senaste åren har jag dock jobbat 
              heltid med min hobby inom fotografi, men tankarna på såväl prästämbetet som kyrkan finns alltid med. <br />
              Som präst är jag extra intresserad av förkunnelsen – allt från arbetet med texternas historia till retorik och framförande. Att nå fram till 
              människor. Men jag tycker samtidigt att det är svårt och har våndats många sena lördagar, haha. Det här är bakgrunden till 
              att jag utvecklar den här tjänsten, dels för att det är mitt stora intresse, dels för att jag gärna skulle vilja ha dessa verktyg själv i tjänsten.
            </p>

            <p>
              Utöver idéer till predikan utifrån helgdagens texter hittar du här verktyg som hjälper till med fördjupning i historia, grundtextanalys, 
              idéer till arbetet med barn och unga med mera. Appen har alltså blivit mycket mer än bara en predikoassistent.
            </p>

            <p>
              I sin helhet kan man se det som att appen hjälper dig att slå i bibelkommentarer, predikosamlingar och uppslagsverk precis som i ditt eget 
              fysiska bibliotek där hemma – men att du via den här tjänsten har tillgång till betydligt fler källor som kan ge uppslag och idéer.
            </p>

            <p>
              Bland fördelarna med appen är att du får tillgång till en av de bästa AI-modellerna som finns för dessa uppgifter, vilket också är anledningen till 
              att den kostar en del att driva.
            </p>

            <h2 className="text-lg sm:text-xl font-semibold italic text-[#1a1d1b] pt-2">
              AI – hur ska en förhålla sig till det egentligen?
            </h2>

            <p>
              Ja, detta har ju blivit lite av tiotusenkronorsfrågan idag. Hur mycket AI ska jag använda? Är det överhuvudtaget vettigt att använda det 
              alls med tanke på alla datacenter som byggs och som drar enorma mängder energi? Och vad händer med våra hjärnor om vi hela tiden frågar 
              en AI om hjälp med allt? Vi skulle kunna prata om detta länge, men jag vill kort redogöra för hur jag ser på saken.
            </p>

            <p>
              Jag är helt inne på linjen att utvecklingen av AI måste begränsas, av flera anledningar. Miljöaspekten är en. Det jag först tänker på här 
              är techjättarnas byggen av enorma datacenter, där bara en av de anläggningar som planeras i Sverige förväntas förbruka 1 000 MW – vilket 
              i runda tal motsvarar en hel kärnkraftsreaktor. Det är helt bisarra tal. Men är det mina frågor till AI:n om bästa receptet på banankaka, eller 
              som här frågor om den historiska kontexten till Matt 4:1–10, som driver detta? Nej, så är det inte. Dessa sökningar utgör en försvinnande liten del i det hela. 
              När jag räknat på det motsvarar en sökning på till exempel den historiska sidan bara något mer än en sökning på en vanlig sökmotor. De bakar ju 
              dessutom in allt mer AI-svar i de vanliga sökresultaten, så där är det mer eller mindre jämnt skägg.
            </p>

            <p>
              Men dessa datacenter då, vad är de till för? Jo, när företag och techjättar tränar och kör gigantiska AI-modeller 
              krävs en helt annan typ av datorkraft än för traditionell webbtrafik, streaming eller molnlagring. De nya datacenter som byggs är så 
              kallade &quot;hyperscale&quot;-anläggningar fullproppade med tiotusentals avancerade AI-acceleratorer (som NVIDIA-grafikkort). 
              Eftersom dessa chip drar enorma mängder el och utvecklar extrem hetta krävs massiva elanslutningar och tunga kylsystem.
            </p>

            <p>
              Det är alltså enorma beräkningar som kräver dessa mängder energi. När en AI-modell skapas från grunden matas den med hundratals 
              miljarder dataparametrar. Det tar månader av oavbruten beräkning för tusentals sammankopplade superdatorer, vilket såklart drar enorma mängder 
              elektricitet. När modellerna väl används – särskilt när de utför avancerade resonemang i flera steg, så kallade <em>agentic workflows</em> – 
              krävs betydligt mer beräkningskraft per fråga än vid en vanlig, enkel Google-sökning.
            </p>

            <p>
              Den här appen är ett skräddarsytt verktyg för sitt specifika syfte, med mycket avgränsade frågor. Den körs på standardinfrastruktur och 
              drar minimalt med resurser i det stora hela. De datacenter som slukar lika mycket el som hela städer byggs för att driva de globala 
              techjättarnas massiva språkmodeller, bild- och videogeneratorer som betjänar industrin och hundratals miljoner användare samtidigt, 
              dygnet runt.
            </p>
            
            <p>
              Vid sidan av miljöaspekten finns frågan om vad som händer med oss som människor och med våra hjärnor om vi allt mer lägger över 
              vårt tänkande på språkmodeller. Tänk om vi måste fråga AI om råd vid varje vägval? Eller, som man kan tänka kring verktygen här, att låta 
              en språkmodell skriva hela sina predikningar. Just detta har jag verkligen velat motverka, och jag tycker att det är en styrka 
              med den här appen: du får inte färdiga predikningar, utan idéer och uppslag. Inspiration. Kanske en tanke som får fart på din egen kreativa process.
            </p>

            <p>
              Så rätt använt tycker jag att AI är ett jättebra verktyg som verkligen kan tjäna oss, men det måste absolut finnas gränser också.
              Hur tänker du kring det hela? Hör gärna av dig med dina tankar om du vill!
            </p>

            <h2 className="text-lg sm:text-xl font-semibold italic text-[#1a1d1b] pt-2">
              Val av AI-modell
            </h2>

            <p>
              Den AI-modell som för närvarande används i den här appen är Gemini-3.8-flash. Jag provade helt enkelt några olika modeller och kände att denna 
              var mycket väl lämpad för ändamålet. Jag använder ett par andra modeller för andra ändamål, men just för appen kör vi på Gemini ett tag till.
            </p>
            
            <p>
              Modellen är instruerad att ge förslag och idéer som är teologiskt genomtänkta och relevanta. Instruktionerna har provats fram och tillbaka 
              för att ge bästa möjliga svar i en god ton. Du slipper alltså skriva långa promptar på egen hand varje gång, och arbetet med att förfina 
              instruktionerna sker fortlöpande.
            </p>

            <p>
              Modellen är i första hand styrd att passa en svenskkyrklig kontext, med variationer i svaren som tar hänsyn till den bredd som finns. 
              Med detta sagt är min förhoppning att även pastorer och förkunnare inom andra kristna samfund kan ha god nytta av tjänsten.
            </p>

            <h2 className="text-lg sm:text-xl font-semibold italic text-[#1a1d1b] pt-2">
              Testare
            </h2>

            <p>
              Eftersom du är med i testgruppen får du såklart tillgång till alla funktioner utan kostnad under utvecklingsfasen. Sidan kommer kontinuerligt att 
              uppdateras med nya funktioner och förbättringar under den här tiden. (Bland annat kommer sidan för &quot;pris&quot; att aktiveras den dagen det är dags att 
              lansera tjänsten på allvar.)
            </p>

            <p>
              Notera att du som testare först bara får 10 krediter/sökningar när du registrerar dig, men så fort jag får en notis om att du har gått med 
              så justerar jag upp det.
            </p>

            <p>
              <span className="font-semibold text-[#1a1d1b]">Jag är tacksam om du inte sprider den här sidan till andra ännu – jag vill att vi testar den ordentligt först.</span>
            </p>

            <p className="pt-2 font-medium text-[#1a1d1b]">
              Bästa hälsningar, Patric
            </p>
          </section>

          {/* INRAMAD RUTA: VIKTIGT OM AI-MODELLEN */}
          <section className="bg-white border border-[#e8e4df] rounded-2xl p-6 sm:p-8 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#1a1d1b] font-bold text-base sm:text-lg">
              <ShieldAlert className="w-5 h-5 text-[#2d3732] shrink-0" />
              <h3>Viktigt om AI-modellen</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Tänk på att AI-genererade svar alltid utgör underlag och förslag. Kontrollera alltid citat, fakta och bibelhänvisningar mot dina egna källor. Tjänsten är avsedd som en sparringpartner i förberedelsearbetet, inte en slutgiltig teologisk auktoritet.
            </p>
          </section>

          {/* FEEDBACK-FORMULÄR */}
          <section className="bg-white rounded-3xl p-8 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-[#1a1d1b] mb-2">Återkoppling</h3>
            <p className="text-xs text-[#575c58] leading-relaxed mb-6">
              PREDIKA är i en testfas. Har du förslag på hur verktyget kan bli ännu bättre för dig? Skriv gärna dina synpunkter nedan!
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
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e4df] bg-white py-16 mt-16">
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