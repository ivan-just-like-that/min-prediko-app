'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { generateContent } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Clock, 
  Search, 
  X, 
  Route, 
  ChevronDown, 
  Sparkles, 
  Languages, 
  Smile, 
  Feather, 
  BookMarked, 
  Sprout, 
  TrendingUp, 
  ArrowUpRight,
  LogOut,
  KeyRound,
  Menu
} from 'lucide-react';
import { EPOKER, PLATSER, RUTTER } from '@/lib/bibel-data';
import TimelineBar from '@/components/TimelineBar';
import ScriptureModal from '@/components/ScriptureModal';

import dynamic from 'next/dynamic';
const BibelKartaKomponent = dynamic(() => import('@/components/BibelKartaKomponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-[#faf8f5] rounded-2xl border border-[#e8e4df] flex items-center justify-center text-[#737874] text-sm font-medium">
      Laddar den bibliska kartan...
    </div>
  )
});

export default function BibelKartaSida() {
  const [valdeEpok, setValdEpok] = useState('nt_evangelier');
  const [valdVard, setValdVard] = useState(null);
  const [sokfragor, setSokfragor] = useState('');
  const [valdRuttId, setValdRuttId] = useState(null);
  
  // Tillstånd för vald tidslinjehändelse och bibelmodal
  const [valdTidslinjeHandelseId, setValdTidslinjeHandelseId] = useState(null);
  const [aktivBibelSkrift, setAktivBibelSkrift] = useState(null);

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

  // Filtrera platser och rutter baserat på vald epok
  const epokPlatser = useMemo(() => {
    return PLATSER.filter(p => p.epokId === valdeEpok);
  }, [valdeEpok]);

  const filtreradeRutter = useMemo(() => {
    return RUTTER.filter(r => r.epokId === valdeEpok);
  }, [valdeEpok]);

  // Se till att den valda platsen (t.ex. från tidslinjen) alltid skickas med till kartan
  const visadePlatser = useMemo(() => {
    const finnsILista = epokPlatser.some((p) => p.id === valdVard?.id);
    if (valdVard && valdVard.koordinater && !finnsILista) {
      return [...epokPlatser, valdVard];
    }
    return epokPlatser;
  }, [epokPlatser, valdVard]);

  // Sökresultat (söker i alla platser oavsett epok så att användaren hittar rätt direkt)
  const sokResultat = useMemo(() => {
    if (!sokfragor.trim()) return [];
    const fraga = sokfragor.toLowerCase();
    return PLATSER.filter(
      p =>
        p.namn.toLowerCase().includes(fraga) ||
        p.idag.toLowerCase().includes(fraga) ||
        p.kategori.toLowerCase().includes(fraga)
    );
  }, [sokfragor]);

  const hanteraValjPlatsFransok = (plats) => {
    setValdEpok(plats.epokId); // Byt epok automatiskt om platsen tillhör en annan
    setValdVard(plats);
    setSokfragor(''); // Rensa sökfältet efter val
  };

  const hanteraEpokByte = (epokId) => {
    setValdEpok(epokId);
    setValdVard(null);
    setValdRuttId(null); // Nollställ vald rutt vid epokbyte
    setValdTidslinjeHandelseId(null);
  };

  // Hantera klick på en händelse i tidslinjen
  const hanteraValjTidslinjeHandelse = (handelse) => {
    setValdTidslinjeHandelseId(handelse.id);

    // Byt epok om händelsen tillhör en annan epok
    if (handelse.era && handelse.era !== valdeEpok) {
      setValdEpok(handelse.era);
    }

    // Om händelsen saknar koordinater (t.ex. Skapelsen)
    if (!handelse.coordinates) {
      setValdVard(null);
      return;
    }

    // Hitta motsvarande plats i PLATSER-registret eller skapa dynamiskt
    const hittadPlats = PLATSER.find(
      (p) => p.id === handelse.siteId || p.namn.toLowerCase() === handelse.title.toLowerCase()
    );

    if (hittadPlats) {
      setValdVard(hittadPlats);
    } else {
      const nyPlats = {
        id: handelse.siteId || handelse.id,
        namn: handelse.title,
        idag: "Historisk plats",
        kategori: "Händelse",
        beskrivning: handelse.scripture?.quote || handelse.title,
        koordinater: handelse.coordinates,
        epokId: handelse.era || valdeEpok,
        bibelreferenser: handelse.scripture ? [handelse.scripture.reference] : []
      };
      setValdVard(nyPlats);
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
            <div className="max-w-6xl mx-auto flex justify-between items-center text-xs text-[#575c58]">
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
        <main className="max-w-6xl mx-auto px-6 py-8">
          
          {/* HEADER & SÖKFÄLT */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                  <Compass className="w-5 h-5 text-[#2d3732]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                  Bibelatlas
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
                Utforska bibelns och den tidiga kyrkans platser. Välj en historisk epok, studera resrutter, följ tidslinjen eller sök efter platser.
              </p>
            </div>

            {/* SÖKRUTA */}
            <div className="relative w-full md:w-72 shrink-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#737874] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={sokfragor}
                  onChange={(e) => setSokfragor(e.target.value)}
                  placeholder="Sök ort (t.ex. Kapernaum, Nicea)..."
                  className="w-full pl-10 pr-9 py-2.5 bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-xs text-[#1a1d1b] placeholder-[#737874] focus:outline-none focus:border-[#2d3732] transition-all"
                />
                {sokfragor && (
                  <button
                    onClick={() => setSokfragor('')}
                    className="absolute right-3 text-[#737874] hover:text-[#1a1d1b]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* TRÄFFLISTA VID SÖKNING */}
              {sokResultat.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8e4df] rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 p-1">
                  {sokResultat.map((plats) => (
                    <button
                      key={plats.id}
                      onClick={() => hanteraValjPlatsFransok(plats)}
                      className="w-full text-left p-2.5 hover:bg-[#faf8f5] rounded-lg transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-xs font-semibold text-[#1a1d1b] block group-hover:text-[#2d3732]">
                          {plats.namn}
                        </span>
                        <span className="text-[10px] text-[#737874] block">
                          Idag: {plats.idag}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#faf8f5] border border-[#e8e4df] text-[#575c58] px-2 py-0.5 rounded-md">
                        {plats.kategori}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INTERAKTIV TIDSLINJE (Placerad ovanför kartan) */}
          <div className="mb-6 rounded-2xl overflow-hidden border border-[#e8e4df] shadow-sm">
            <TimelineBar
              selectedEventId={valdTidslinjeHandelseId}
              onSelectEvent={hanteraValjTidslinjeHandelse}
              onOpenScripture={(scripture) => setAktivBibelSkrift(scripture)}
            />
          </div>

          {/* EPOKVÄLJARE */}
          <div className="flex flex-wrap gap-2 mb-4">
            {EPOKER.map((epok) => {
              const [titel, period] = epok.namn.split(' (');
              const arVald = valdeEpok === epok.id;

              return (
                <button
                  key={epok.id}
                  onClick={() => hanteraEpokByte(epok.id)}
                  className={`px-3.5 py-2 rounded-xl text-left transition-all border shrink-0 flex flex-col justify-center ${
                    arVald
                      ? 'bg-[#2d3732] text-white border-[#2d3732] shadow-sm'
                      : 'bg-white text-[#575c58] border-[#e8e4df] hover:border-[#2d3732]/30 hover:bg-[#faf8f5]'
                  }`}
                >
                  <span className="text-xs font-semibold leading-snug">{titel}</span>
                  {period && (
                    <span
                      className={`text-[10px] leading-tight mt-0.5 ${
                        arVald ? 'text-[#e8e4df]' : 'text-[#737874]'
                      }`}
                    >
                      ({period}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RUTTVÄLJARE (Syns endast om epoken innehåller historiska rutter/linjer) */}
          {filtreradeRutter.length > 0 && (
            <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df] mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#2d3732] flex items-center gap-1.5 mr-1">
                <Route className="w-3.5 h-3.5 text-[#2d3732]" />
                Framhäv resrutt:
              </span>
              <button
                onClick={() => setValdRuttId(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  valdRuttId === null
                    ? 'bg-[#2d3732] text-white border-[#2d3732]'
                    : 'bg-white text-[#575c58] border-[#e8e4df] hover:bg-[#faf8f5]'
                }`}
              >
                Visa alla
              </button>
              {filtreradeRutter.map((rutt) => (
                <button
                  key={rutt.id}
                  onClick={() => setValdRuttId(rutt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    valdRuttId === rutt.id
                      ? 'bg-white text-[#1a1d1b] border-[#2d3732] shadow-sm font-semibold'
                      : 'bg-white/70 text-[#575c58] border-[#e8e4df] hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: rutt.farg }}
                  />
                  {rutt.namn}
                </button>
              ))}
            </div>
          )}

          {/* KARTAN & INFOPANELEN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KARTMOTOR */}
            <div className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden border border-[#e8e4df] shadow-sm bg-[#faf8f5]">
              <BibelKartaKomponent
                platser={visadePlatser}
                rutter={filtreradeRutter}
                valdVard={valdVard}
                onValjPlats={setValdVard}
                valdRuttId={valdRuttId}
              />
            </div>

            {/* INFOPANEL */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-sm flex flex-col justify-between">
              {valdVard ? (
                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-[#faf8f5] border border-[#e8e4df] text-[#2d3732] text-[11px] font-semibold rounded-lg mb-2">
                      {valdVard.kategori}
                    </span>
                    <h2 className="text-xl font-bold text-[#1a1d1b]">{valdVard.namn}</h2>
                    <p className="text-xs text-[#737874] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> Idag: {valdVard.idag}
                    </p>
                  </div>

                  <div className="text-xs text-[#575c58] leading-relaxed border-t border-[#e8e4df] pt-3">
                    {valdVard.beskrivning}
                  </div>

                  {valdVard.kyrkohistoriskBetydelse && (
                    <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e8e4df] text-xs">
                      <span className="font-semibold text-[#2d3732] block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Kyrkohistorisk kontext:
                      </span>
                      <p className="text-[#575c58]">{valdVard.kyrkohistoriskBetydelse}</p>
                    </div>
                  )}

                  {valdVard.bibelreferenser?.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold text-xs text-[#2d3732] block mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Bibelställen:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {valdVard.bibelreferenser.map((ref, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#faf8f5] border border-[#e8e4df] text-[11px] text-[#2d3732] font-medium rounded-md">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#737874]">
                  <MapPin className="w-8 h-8 mb-2 opacity-40 text-[#2d3732]" />
                  <p className="text-xs font-medium text-[#1a1d1b] mb-1">Ingen plats vald</p>
                  <p className="text-xs">
                    Klicka på en markör i kartan, använd tidslinjen eller sök i sökfältet ovan för att panorera direkt till orten.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NAVIGERA TILL ANDRA VERKTYG */}
          <section className="mt-16 pt-8 border-t border-[#e8e4df]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c918d] mb-6 text-center">
              Utforska fler verktyg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {verktygLista.filter(v => v.href !== '/karta').map((v) => {
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

      {/* POPUPMODAL FÖR BIBELTEXTER */}
      <ScriptureModal
        scripture={aktivBibelSkrift}
        onClose={() => setAktivBibelSkrift(null)}
      />

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