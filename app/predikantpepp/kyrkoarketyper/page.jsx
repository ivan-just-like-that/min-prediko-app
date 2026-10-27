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
  ChevronDown, 
  LogOut, 
  KeyRound, 
  Menu, 
  X,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

// --- KARAKTÄRSBESKRIVNINGAR (10 ST KYRKOARKETYPER) ---
const KARAKTARER = {
  bosse: {
    namn: "Bibeltrogne Bosse",
    titel: "Skriftens orubblige väktare",
    beskrivning: "Du har en varm men kompromisslös kärlek till Guds ord. Du drar dig inte för exegetisk fördjupning, föredrar Folkbibeln eller 1917 års översättning och påminner gärna om vad som faktiskt står skrivet.",
    styrkor: ["Bokstavlig texttrohet", "Exegetisk skärpa", "Principfasthet"],
    bild: "/bilder/karaktarer/bibeltrogne-bosse.png"
  },
  sussie: {
    namn: "Söndagsskole-Sussie",
    titel: "Barnens och flanellografens beskyddare",
    beskrivning: "Du ser gudsriket bäst genom barnens ögon. Med ett obegränsat tålamod, pysselguld och pedagogisk fingertoppskänsla gör du de allra största teologiska sanningarna begripliga för de minsta.",
    styrkor: ["Pedagogisk kreativitet", "Oändligt tålamod", "Varmt bemötande"],
    bild: "/bilder/karaktarer/sondagsskole-sussie.png"
  },
  doris: {
    namn: "Digitala Doris",
    titel: "Algoritmernas och flödets präst",
    beskrivning: "Du vet att teologi ska möta människor där de faktiskt befinner sig — på TikTok, Instagram och i livesändningar. Du har alltid en powerbank i fickan och skapar content med hög relevans.",
    styrkor: ["Kommunikativ fingertoppskänsla", "Trendkänslighet", "Bred räckvidd"],
    bild: "/bilder/karaktarer/digitala-doris.png"
  },
  kurt: {
    namn: "Karismatiske Kurt",
    titel: "Visionären och megakyrkopastorn",
    beskrivning: "Du tänker stort, pratar med hög energi och räds inte rökmaskiner eller ambitiösa expansionsplaner. Du tror på stundens andliga kraft och att Gud gör nya saker konstant.",
    styrkor: ["Inspirerande ledarskap", "Stort trons mod", "Visionärt tänkande"],
    bild: "/bilder/karaktarer/karismatiske-kurt.png"
  },
  hanna: {
    namn: "Högkyrkliga Hanna",
    titel: "Den mässafirande mystikern",
    beskrivning: "Du finner Guds närvaro i det sakrala rummet, liturgins skönhet och traditonens fasta grund. För dig är mässhaken, rökelsekaret och tystnaden inför mysteriet kyrkans verkliga hjärta.",
    styrkor: ["Liturgisk noggrannhet", "Andligt djup", "Vördnad för mysteriet"],
    bild: "/bilder/karaktarer/hogkyrkliga-hanna.png"
  },
  daniel: {
    namn: "Diakonala Daniel",
    titel: "Kaffetårens och själavårdens mästare",
    beskrivning: "Du vet att teologi i sin ädlaste form stavas närvaro, hembakat och tid att lyssna. Du möter människor i ögonhöjd och är övertygad om att ingen dogm slår ett varmt hjärta och en kopp kaffe.",
    styrkor: ["Ett lyssnande öra", "Diakonal omsorg", "Relationell trygghet"],
    bild: "/bilder/karaktarer/diakonala-daniel.png"
  },
  paula: {
    namn: "Professor Paula",
    titel: "Hermeneutikens och avhandlingarnas gigant",
    beskrivning: "Du vägrar enkla svar på svåra frågor. Med tweedkavaj och ett kritiskt sinnelag belyser du textens historiska kontext, källskrifter och Karl Barths alla nyanser innan du drar några slutsatser.",
    styrkor: ["Intellektuellt djup", "Kritiskt tänkande", "Bred akademisk kunskap"],
    bild: "/bilder/karaktarer/professor-paula.png"
  },
  folke: {
    namn: "Friluftsar’n Folke",
    titel: "Lägereldens och barfotaandaktens beskyddare",
    beskrivning: "För dig är skogen och gudsriket nästan samma sak. Du trivs bäst i gummistövlar vid en sjöbrink, med kaffepannan över öppen eld och en enkel andakt utan krångliga termer.",
    styrkor: ["Avskalad enkelhet", "Jordnära teologi", "Naturkänsla"],
    bild: "/bilder/karaktarer/friluftsarn-folke.png"
  },
  jocke: {
    namn: "Gitarrjocke",
    titel: "Väckelse med tre ackord",
    beskrivning: "Du står aldrig långt från din akustiska gitarr. Med capotastot redo och en smittande energi leder du församlingen i lovsång och allsång oavsett om det är i tältet eller på lägret.",
    styrkor: ["Smittsam glädje", "Engagerande musikalsk kraft", "Närvaro i stunden"],
    bild: "/bilder/karaktarer/gitarrjocke.png"
  },
  knut: {
    namn: "Kulturkyrko-Knut",
    titel: "Estetikens och Bachfugans vän",
    beskrivning: "Du ser konsten, orgelmusiken och poesin som de främsta vägarna till det gudomliga. Du föredrar en välklingande orgelkonsert och samtida konstutställningar i koret framför lovsånger med tre ackord.",
    styrkor: ["Estetisk fingertoppskänsla", "Kulturell bredd", "Sinne för kvalitet"],
    bild: "/bilder/karaktarer/kulturkyrko-knut.png"
  }
};

// --- DE 12 FRÅGORNA MED 4 SVARSALTERNATIV VAR ---
const FRAGOR = [
  {
    fraga: "1. Hur inleder du helst en söndagsgudstjänst?",
    alternativ: [
      { text: "Med en stämningsfull procession, klockklang och svängande rökelsekar.", poang: { hanna: 2, knut: 1 } },
      { text: "Med ett svängigt intro i D-dur och ett glatt klockrent \"Halleluja!\".", poang: { jocke: 2, kurt: 1 } },
      { text: "Med ett energiskt hopp upp på scenen, rörligt ljus och ett ”Welcome home!”.", poang: { kurt: 2, doris: 1 } },
      { text: "Genom att se till att kaffebryggaren står på och att alla har fått en kram.", poang: { daniel: 2, sussie: 1 } }
    ]
  },
  {
    fraga: "2. Vad lägger du helst överst i väskan inför församlingslägret?",
    alternativ: [
      { text: "Mässhake, gregorianska notblad och missale (afk:s!).", poang: { hanna: 2, knut: 1 } },
      { text: "Akustiska gitarren, capotasto och röda sångboken.", poang: { jocke: 2, folke: 1 } },
      { text: "iPhone på gimbal-stativ, trådlöst myggset och powerbank.", poang: { doris: 2, kurt: 1 } },
      { text: "Flanellografen, saftblandning och pysselguld.", poang: { sussie: 2, daniel: 1 } }
    ]
  },
  {
    fraga: "3. Hur tar du dig an en teologisk debatt på stiftsmötet?",
    alternativ: [
      { text: "Hänvisar till vad kyrkofäderna och traditionen har slagit fast i 2000 år.", poang: { hanna: 2, bosse: 1 } },
      { text: "Slår upp 1917 års översättning och påminner om Skriftens bokstavliga auktoritet.", poang: { bosse: 2, paula: 1 } },
      { text: "Citerar Karl Barth och förklarar varför hermeneutiken förblir komplex.", poang: { paula: 2, knut: 1 } },
      { text: "Bjuder på fika och konstaterar att kärleken alltid är större än alla dogmer.", poang: { daniel: 2, sussie: 1 } }
    ]
  },
  {
    fraga: "4. Vilken är din absoluta skräck under ett kyrkoår?",
    alternativ: [
      { text: "Att en nattvardsvinet spiller ut på de handbroderade altarduken.", poang: { hanna: 2, knut: 1 } },
      { text: "Att en sträng går av mitt i ett tre minuters gitarrsolo.", poang: { jocke: 2, kurt: 1 } },
      { text: "Att Wi-Fi:t ligger nere just när söndagens livestream och Reels ska sändas.", poang: { doris: 2, kurt: 1 } },
      { text: "Att kyrkkaffets bryggare lägger av fem minuter före postludiet.", poang: { daniel: 2, sussie: 1 } }
    ]
  },
  {
    fraga: "5. Vad gör du helst på en helt ledig lördag?",
    alternativ: [
      { text: "Går på orgelkonsert i domkyrkan och betraktar en samtida fotoutställning i koret.", poang: { knut: 2, hanna: 1 } },
      { text: "Snörar på kängorna och vandrar till en sjö för kokkaffe över öppen eld.", poang: { folke: 2, jocke: 1 } },
      { text: "Sätter mig på arbetsrummet och läser nyutkomna monografier om GT-exegetik.", poang: { paula: 2, bosse: 1 } },
      { text: "Skapar innehåll till TikTok och kollar vad som trendar bland unga.", poang: { doris: 2, kurt: 1 } }
    ]
  },
  {
    fraga: "6. Hur ser din idealiska plats för teologisk fördjupning ut?",
    alternativ: [
      { text: "Ett historiskt kyrkorum med kalkmålningar, sakral akustik är den bästa högtalaren.", poang: { hanna: 2, knut: 1 } },
      { text: "Ett enkelt lägerkapell i skogen eller en gudstjänst under bar himmel.", poang: { folke: 2, jocke: 1 } },
      { text: "En specialbyggd auditorium-arena med LED-skärmar och plats för tusentals.", poang: { kurt: 2, doris: 1 } },
      { text: "Barnhörnan i församlingshemmet där de stora frågorna ställs helt utan filter.", poang: { sussie: 2, daniel: 1 } }
    ]
  },
  {
    fraga: "7. Hur förbereder du söndagens predikan?",
    alternativ: [
      { text: "Genom att noggrant studera grundtexten på hebreiska och grekiska i djup ro.", poang: { bosse: 2, paula: 1 } },
      { text: "Genom att noga analysera tidstypiska sociologiska strömningar och textens kontext.", poang: { paula: 2, knut: 1 } },
      { text: "Jag spånar fram en vass punchline som gör sig snyggt i en Instagram-karusell.", poang: { doris: 2, kurt: 1 } },
      { text: "Jag ber om att få nå församlingen med evangeliets enkla kraft och en god refräng.", poang: { jocke: 2, folke: 1 } }
    ]
  },
  {
    fraga: "8. Om du fick välja ett enda bibelord som sammanfattar din tjänst:",
    alternativ: [
      { text: "”Prisa Gud i hans helgedom, lova honom i hans mäktiga fäste!”", poang: { hanna: 2, knut: 1 } },
      { text: "”Hela Skriften är utandad av Gud och nyttig till undervisning...”", poang: { bosse: 2, paula: 1 } },
      { text: "”Se, jag gör något helt nytt – det spirar redan, märker ni det inte?”", poang: { kurt: 2, doris: 1 } },
      { text: "”Låt barnen komma till mig och hindra dem inte...”", poang: { sussie: 2, daniel: 1 } }
    ]
  },
  {
    fraga: "9. Hur ser förhållandet till barnen och den uppväxande generationen ut i din teologi?",
    alternativ: [
      { text: "De är församlingens absoluta centrum och får lärjungaskap att levandegöras.", poang: { sussie: 2, daniel: 1 } },
      { text: "Vi tar med dem ut i skogen, bygger kojor och lär dem be under stjärnorna.", poang: { folke: 2, jocke: 1 } },
      { text: "Vi bygger en komplett produktion med rökmaskin, DJ och professionellt barnmöte.", poang: { kurt: 2, doris: 1 } },
      { text: "Vi ser till att det finns saft, bullar och ett öppet öra när livet känns svårt.", poang: { daniel: 2, sussie: 1 } }
    ]
  },
  {
    fraga: "10. Vad är ditt tydligaste signumet i församlingshemmets korridor?",
    alternativ: [
      { text: "En tweedkavaj med armbågslappar och en rejäl stapel avhandlingar.", poang: { paula: 2, bosse: 1 } },
      { text: "Att gitarren alltid hänger över axeln, redo att stämmas upp i A-dur.", poang: { jocke: 2, folke: 1 } },
      { text: "Att sprida värme, ställa fram porslin och stanna till för att lyssna på alla.", poang: { daniel: 2, sussie: 1 } },
      { text: "Att alltid nynna på en dänga av Mozart medan kyrkans konstutställning hängs om.", poang: { knut: 2, hanna: 1 } }
    ]
  },
  {
    fraga: "11. Hur ser din vision för kyrkans framtid ut?",
    alternativ: [
      { text: "Den vilar tryggt på traditionens fasta berggrund, Sakramenten och liturgin.", poang: { hanna: 2, knut: 1 } },
      { text: "Den blomstrar där människor samlas i enkelhet kring Ordet, bönen och lägerelden.", poang: { folke: 2, bosse: 1 } },
      { text: "Den finns där kulturen, konsten och teologin möts i djup klangbotten.", poang: { knut: 2, paula: 1 } },
      { text: "Den växer viralt och dynamiskt – vi ska nå miljontals via feeds och events!", poang: { doris: 2, kurt: 1 } }
    ]
  },
  {
    fraga: "12. Om din teologiska gärning blev en boktitel, vad heter den?",
    alternativ: [
      { text: "\"Mellan rökelsekar, mässhakar och mystik\"", poang: { hanna: 2, knut: 1 } },
      { text: "\"Sjunde koppen bryggkaffe – där själavården faktiskt sker\"", poang: { daniel: 2, sussie: 1 } },
      { text: "\"Från biblisk grundtext till exegetisk hermeneutik\"", poang: { paula: 2, bosse: 1 } },
      { text: "\"Tre ackord, en gitarr och en öppen himmel\"", poang: { jocke: 2, folke: 1 } }
    ]
  }
];

export default function KyrkoarketyperQuizSida() {
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
    let vinnandeNyckel = 'daniel';

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

            <button 
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
                <Compass className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Vilken kyrkoarketyp är du?
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Upptäck din sanna teologiska och kyrkliga hemvist. Svara på de 12 frågorna för att ta reda på vilken kyrkoarketyp du är!
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
              
              {/* BILD */}
              <div className="w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden border border-[#e8e4df] shadow-[0_4px_15px_rgba(0,0,0,0.06)] bg-[#faf8f5]">
                <img 
                  src={resultatKaraktar.bild} 
                  alt={resultatKaraktar.namn} 
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="inline-block px-3 py-1 bg-[#faf8f5] border border-[#e8e4df] text-[#2d3732] text-xs font-semibold rounded-lg mb-3">
                ✨ Din kyrkliga hemvist är:
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
                  <CheckCircle2 className="w-4 h-4 text-[#2d3732]" /> Dina främsta kännetecken:
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

      {/* FOOTER */}
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