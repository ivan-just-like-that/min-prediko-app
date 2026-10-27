'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  UserCheck,
  Compass, 
  Sparkles, 
  BookOpen, 
  Languages, 
  Smile, 
  Feather, 
  BookMarked, 
  Sprout, 
  TrendingUp, 
  ArrowUpRight, 
  ChevronDown, 
  LogOut, 
  KeyRound, 
  Menu, 
  X,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

// --- KARAKTÄRSBESKRIVNINGAR (10 ST) MED BILDER ---
const KARAKTARER = {
  moses: {
    namn: "Moses",
    titel: "Den motvillige ledaren",
    beskrivning: "Du drivs av djup ödmjukhet och ett tungt ansvar. Du tvekar hellre en gång för mycket än för lite, men när det verkligen gäller kliver du fram i motvinden och för folket vidare.",
    styrkor: ["Uthållighet i prövningar", "Äkta ödmjukhet", "Lojalitet mot kallelsen"],
    bild: "/bilder/karaktarer/moses.png"
  },
  david: {
    namn: "David",
    titel: "Hjärtats tillbedjare",
    beskrivning: "Du lever med hjärtat utanpå. Du rör dig fritt mellan djupaste glädje och smärtsam ånger, och du vet att hela det mänskliga registret av känslor rymms inför Gud.",
    styrkor: ["Emotionellt djup", "Passionerad tillbedjan", "Resiliens efter fall"],
    bild: "/bilder/karaktarer/david.png"
  },
  ester: {
    namn: "Ester",
    titel: "Den strategiske förespråkaren",
    beskrivning: "Du har fingertoppskänsla och en enorm strategisk förmåga. Du vet exakt när det är dags att tala och när det är dags att vara tyst, och du tvekar inte när situationen kräver rådighet.",
    styrkor: ["Taktisk klokskap", "Mod under press", "Diplomati"],
    bild: "/bilder/karaktarer/ester.png"
  },
  rut: {
    namn: "Rut",
    titel: "Den trogna följeslagaren",
    beskrivning: "Du står kvar när alla andra går. Din styrka ligger i den uthålliga lojaliteten i det lilla formatet, där du genom praktisk godhet skapar trygghet för dem omkring dig.",
    styrkor: ["Odebatterad lojalitet", "Praktisk kärlek", "Uthållighet i vardagen"],
    bild: "/bilder/karaktarer/rut.png"
  },
  petrus: {
    namn: "Petrus",
    titel: "Den impulsive pionjären",
    beskrivning: "Du kastar dig ut i hetluften först av alla! Du brinner för sakens skull, och även om det ibland blir fel reser du dig snabbt upp och provar igen med nytt mod.",
    styrkor: ["Handlingskraft", "Mod att hoppa", "Snabb återhämtning"],
    bild: "/bilder/karaktarer/petrus.png"
  },
  paulus: {
    namn: "Paulus",
    titel: "Den intellektuelle strategen",
    beskrivning: "Du har en skarp teologisk och logisk kompass. Du drivs av att förstå helheten, bygga strukturer och föra ut ett bärande budskap med kompromisslös kraft.",
    styrkor: ["Analytisk skärpa", "Drivkraft", "Visionärt tänkande"],
    bild: "/bilder/karaktarer/paulus.png"
  },
  marta: {
    namn: "Marta",
    titel: "Den strävsamme organisatören",
    beskrivning: "Ingenting blir gjort utan dig! Du kavlar upp ärmarna, ordnar logistiken och ser till att allt fungerar i praktiken medan andra fortfarande sitter och funderar.",
    styrkor: ["Praktisk handlingskraft", "Ansvarskänsla", "Strukturerad"],
    bild: "/bilder/karaktarer/marta.png"
  },
  maria: {
    namn: "Maria från Betania",
    titel: "Den reflekterande mystikern",
    beskrivning: "Du förstår värdet av att sitta ner i stället för att springa iväg. Du söker djupet, närvaron och det väsentliga bortom alla krav på yttre prestationer.",
    styrkor: ["Inre närvaro", "Lyhördhet", "Andligt djup"],
    bild: "/bilder/karaktarer/maria.png"
  },
  nehemja: {
    namn: "Nehemja",
    titel: "Den metodiske byggaren",
    beskrivning: "Du är visionären som också har tumstocken med dig. Du bryter ner stora utmaningar i konkreta steg, organiserar teamet och bygger murarna bit för bit.",
    styrkor: ["Projektledning", "Målmedvetenhet", "Strategisk planering"],
    bild: "/bilder/karaktarer/nehemja.png"
  },
  jona: {
    namn: "Jona",
    titel: "Den motsträvige sökaren",
    beskrivning: "Du är en självständig tänkare som gärna ifrågasätter normer och tar dig tid för reflektion. Du väjer inte för de svåra frågorna och uppskattar din frihet.",
    styrkor: ["Kritiskt tänkande", "Självständighet", "Djup ärlighet"],
    bild: "/bilder/karaktarer/jona.png"
  }
};

// --- DE 12 FRÅGORNA MED 4 KORTA SVARSALTERNATIV ---
const FRAGOR = [
  {
    fraga: "1. När en oväntad kris dyker upp, vad gör du först?",
    alternativ: [
      { text: "Tar ett kliv tillbaka och funderar på om det ens är mitt bord.", poang: { moses: 2, jona: 1 } },
      { text: "Dyker rakt in i hetluften och tar kommandot.", poang: { petrus: 2, paulus: 1 } },
      { text: "Observerar läget tyst och lägger upp en strategi.", poang: { ester: 2, nehemja: 1 } },
      { text: "Kavlar upp ärmarna och börjar lösa det praktiska direkt.", poang: { marta: 2, rut: 1 } }
    ]
  },
  {
    fraga: "2. Hur reagerar du på kritik mot ditt arbete?",
    alternativ: [
      { text: "Går i försvar – jag brinner för min sak och kan bli hetlevrad.", poang: { petrus: 2, paulus: 1 } },
      { text: "Tar det personligt, men biter ihop och gör min plikt.", poang: { rut: 2, marta: 1 } },
      { text: "Sväljer förargelsen och bemöter det med diplomati och fakta.", poang: { ester: 2, nehemja: 1 } },
      { text: "Drar mig undan och känner mig otillräcklig.", poang: { moses: 2, jona: 1 } }
    ]
  },
  {
    fraga: "3. Vad är din största styrka i en grupp?",
    alternativ: [
      { text: "Struktur och förmågan att faktiskt få saker genomförda.", poang: { nehemja: 2, marta: 1 } },
      { text: "Osviklig lojalitet – jag överger ingen när det blåser.", poang: { rut: 2, moses: 1 } },
      { text: "Intellektuell skärpa och blick för det stora sammanhanget.", poang: { paulus: 2, ester: 1 } },
      { text: "Smittsam energi, mod och stark inre passion.", poang: { petrus: 2, david: 1 } }
    ]
  },
  {
    fraga: "4. Hur ser du på regler och ramverk?",
    alternativ: [
      { text: "Helt nödvändiga! Utan ordning blir ingenting gjort.", poang: { nehemja: 2, marta: 1 } },
      { text: "Intressanta att analysera, men jag ifrågasätter dem gärna.", poang: { paulus: 2, jona: 1 } },
      { text: "Jag navigerar smidigt inom dem för att nå målet.", poang: { ester: 2, rut: 1 } },
      { text: "De får inte stå i vägen när stunden kräver handling eller nåd.", poang: { petrus: 2, david: 1 } }
    ]
  },
  {
    fraga: "5. Vad händer med dig under hård stress?",
    alternativ: [
      { text: "Blir överarbetad och bitter för att ingen hjälper till.", poang: { marta: 2, jona: 1 } },
      { text: "Blir för impulsiv, säger saker för snabbt och får städa efteråt.", poang: { petrus: 2, david: 1 } },
      { text: "Blir överkontrollerande och kan framstå som kompromisslös.", poang: { paulus: 2, nehemja: 1 } },
      { text: "Drar mig undan och vill helst bara fly från allt.", poang: { moses: 2, jona: 1 } }
    ]
  },
  {
    fraga: "6. Vad gör du helst på en helt ledig dag?",
    alternativ: [
      { text: "Organiserar och fixar i hemmet eller trädgården.", poang: { marta: 2, nehemja: 1 } },
      { text: "Fördjupar mig i en djup bok, studier eller teologi.", poang: { paulus: 2, jona: 1 } },
      { text: "Skapar något kreativt eller tillbringar tid i naturen och bön.", poang: { david: 2, maria: 1 } },
      { text: "Umgås med nära vänner eller hjälper någon som behöver det.", poang: { rut: 2, petrus: 1 } }
    ]
  },
  {
    fraga: "7. Hur tar du dig an ett enormt, svårt projekt?",
    alternativ: [
      { text: "Delar upp det i delmål och sätter igång metodiskt.", poang: { nehemja: 2, ester: 1 } },
      { text: "Kastar mig ut direkt och litar på att det löser sig längs vägen.", poang: { petrus: 2, paulus: 1 } },
      { text: "Känner mig dränerad i starten och önskar att någon annan tog täten.", poang: { moses: 2, jona: 1 } },
      { text: "Fokuserar enbart på det första praktiska steget framför näsan.", poang: { marta: 2, rut: 1 } }
    ]
  },
  {
    fraga: "8. Vad värdesätter du högst i nära relationer?",
    alternativ: [
      { text: "Äkthet – att vi kan visa både svaghet och känslor.", poang: { david: 2, moses: 1 } },
      { text: "Djup gemenskap där vi utmanar varandra i tanke och tro.", poang: { paulus: 2, maria: 1 } },
      { text: "Trogen närvaro, trygghet och vardaglig gemenskap.", poang: { rut: 2, marta: 1 } },
      { text: "Ömsesidig lojalitet och att vi stöttar varandras mål.", poang: { ester: 2, nehemja: 1 } }
    ]
  },
  {
    fraga: "9. Hur förbereder du dig inför en viktig uppgift eller presentation?",
    alternativ: [
      { text: "Noggrann research och stenhård koll på alla detaljer.", poang: { paulus: 2, nehemja: 1 } },
      { text: "Övar in timingen och anpassar budskapet strategiskt.", poang: { ester: 2, moses: 1 } },
      { text: "Har en grundidé, men litar på stundens ingivelse.", poang: { petrus: 2, david: 1 } },
      { text: "Grundar mig i tystnad och reflektion för att landa i det väsentliga.", poang: { maria: 2, jona: 1 } }
    ]
  },
  {
    fraga: "10. Om någon i din närhet mår dåligt, vad gör du?",
    alternativ: [
      { text: "Lagar mat eller hjälper till med praktiska saker direkt.", poang: { marta: 2, rut: 1 } },
      { text: "Sätter mig bredvid i tystnad och bara finns där.", poang: { maria: 2, david: 1 } },
      { text: "Ger dem nya perspektiv och hjälper till att finna en lösning.", poang: { paulus: 2, nehemja: 1 } },
      { text: "Peppar dem och försöker få dem på andra tankar.", poang: { petrus: 2, ester: 1 } }
    ]
  },
  {
    fraga: "11. Vilken typ av uppgifter ger dig mest energi?",
    alternativ: [
      { text: "Att få lösa ett svårt problem eller förstå ett komplext sammanhang.", poang: { paulus: 2, jona: 1 } },
      { text: "Att få bygga upp något från grunden och se mätbara resultat.", poang: { nehemja: 2, marta: 1 } },
      { text: "Att få uttrycka mig kreativt och inspirera andra från hjärtat.", poang: { david: 2, petrus: 1 } },
      { text: "Att få hjälpa en enskild människa i det tysta.", poang: { rut: 2, maria: 1 } }
    ]
  },
  {
    fraga: "12. Om ditt liv var en bok, vad skulle undertiteln vara?",
    alternativ: [
      { text: "\"Mellan tvivel och tro – en resa i öknen\"", poang: { moses: 2, jona: 1 } },
      { text: "\"Med hjärtat utanpå och nära till tårar\"", poang: { david: 2, maria: 1 } },
      { text: "\"Rätt plats, rätt tid, rätt beslut\"", poang: { ester: 2, nehemja: 1 } },
      { text: "\"Full fart framåt – med nåd för varje fall\"", poang: { petrus: 2, paulus: 1 } }
    ]
  }
];

export default function BibelQuizSida() {
  const [aktivFragaIndex, setAktivFragaIndex] = useState(0);
  const [poangSamling, setPoangSamling] = useState({});
  const [resultatKaraktar, setResultatKaraktar] = useState(null);

  // States för menyer och inloggning
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { name: 'Predikantpepp', desc: 'Uppmuntran, quiz, poesi mm', href: '/predikantpepp', icon: Sprout },
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

  // Hantera val av svar
  const hanteraSvar = (alternativPoang) => {
    const nyaPoang = { ...poangSamling };
    Object.entries(alternativPoang).forEach(([karaktar, poang]) => {
      nyaPoang[karaktar] = (nyaPoang[karaktar] || 0) + poang;
    });
    setPoangSamling(nyaPoang);

    if (aktivFragaIndex + 1 < FRAGOR.length) {
      setAktivFragaIndex(aktivFragaIndex + 1);
    } else {
      raknaUtResultat(nyaPoang);
    }
  };

  const raknaUtResultat = (slutPoang) => {
    let hogstaPoang = -1;
    let vinnandeNyckel = 'moses';

    Object.entries(slutPoang).forEach(([nyckel, poang]) => {
      if (poang > hogstaPoang) {
        hogstaPoang = poang;
        vinnandeNyckel = nyckel;
      }
    });

    setResultatKaraktar(KARAKTARER[vinnandeNyckel]);
  };

  const startaOmQuiz = () => {
    setAktivFragaIndex(0);
    setPoangSamling({});
    setResultatKaraktar(null);
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
                      className="absolute top-full left-0 w-80 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-[9999]"
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
        <main className="max-w-[700px] mx-auto px-6 pt-12 pb-20">
          
          {/* INTRO-RUTA */}
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Vilken biblisk person är du?
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              PREDIKAs personlighetstest! Svara på frågorna och upptäck ditt bibliska alter ego — komplett med toppar, dalar och allmän mänsklighet.
              Givetvis 100% tillförlitligt!         
            </p>
          </div>

          {!resultatKaraktar ? (
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold text-[#8c918d] mb-2">
                  <span>Fråga {aktivFragaIndex + 1} av {FRAGOR.length}</span>
                  <span>{Math.round(((aktivFragaIndex + 1) / FRAGOR.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-[#faf8f5] border border-[#e8e4df] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2d3732] transition-all duration-300 rounded-full"
                    style={{ width: `${((aktivFragaIndex + 1) / FRAGOR.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Fråga */}
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1d1b] mb-6 leading-snug">
                {FRAGOR[aktivFragaIndex].fraga}
              </h2>

              {/* Svarsalternativ */}
              <div className="space-y-3">
                {FRAGOR[aktivFragaIndex].alternativ.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => hanteraSvar(alt.poang)}
                    className="w-full text-left p-4 rounded-xl border border-[#e8e4df] bg-[#faf8f5]/50 hover:bg-[#faf8f5] hover:border-[#2d3732] text-xs sm:text-sm font-medium text-[#2d312e] transition-all duration-150 flex items-center justify-between group"
                  >
                    <span>{alt.text}</span>
                    <span className="w-5 h-5 rounded-full border border-[#e8e4df] flex items-center justify-center text-[10px] group-hover:bg-[#2d3732] group-hover:text-white transition-colors shrink-0 ml-3">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* RESULTATVY */
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 sm:p-10 shadow-lg text-center animate-in fade-in duration-300">
              
              {/* KARAKTÄRSBILD */}
              <div className="w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden border border-[#e8e4df] shadow-[0_4px_15px_rgba(0,0,0,0.06)] bg-[#faf8f5]">
                <img 
                  src={resultatKaraktar.bild} 
                  alt={resultatKaraktar.namn} 
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="inline-block px-3 py-1 bg-[#faf8f5] border border-[#e8e4df] text-[#2d3732] text-xs font-semibold rounded-lg mb-3">
                ✨ Ditt bibliska alter ego är:
              </span>
              
              <h2 className="text-3xl font-bold text-[#1a1d1b] mb-1">
                {resultatKaraktar.namn}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[#8c918d] mb-6">
                {resultatKaraktar.titel}
              </p>

              <p className="text-sm text-[#575c58] leading-relaxed max-w-lg mx-auto mb-8 bg-[#faf8f5] p-5 rounded-2xl border border-[#e8e4df]">
                {resultatKaraktar.beskrivning}
              </p>

              <div className="mb-8 text-left max-w-md mx-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1d1b] mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2d3732]" /> Dina nyckelstyrkor:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {resultatKaraktar.styrkor.map((styrka, i) => (
                    <div key={i} className="px-3 py-2 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-xs font-medium text-[#2d3732]">
                      • {styrka}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={startaOmQuiz}
                  className="px-5 py-2.5 bg-[#2d3732] text-white rounded-xl text-xs font-semibold hover:bg-[#1f2723] transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Gör quizet igen
                </button>
                <Link
                  href="/predikantpepp"
                  className="px-5 py-2.5 bg-white border border-[#e8e4df] text-[#1a1d1b] rounded-xl text-xs font-semibold hover:bg-[#faf8f5] transition-all flex items-center justify-center"
                >
                  Tillbaka till Predikantpepp
                </Link>
              </div>

            </div>
          )}

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