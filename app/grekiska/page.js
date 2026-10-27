'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateContent } from '@/lib/api';
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
  Copy,
  Check,
  Trash2,
  Info
} from 'lucide-react';

// Hjälp-komponent för kopiera-knapp i Attio-stil
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
      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border ${
        kopierad
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-white hover:bg-[#faf8f5] text-[#575c58] hover:text-[#1a1d1b] border-[#e8e4df]'
      }`}
      title="Kopiera text"
    >
      {kopierad ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kopierat!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Kopiera</span>
        </>
      )}
    </button>
  );
}

export default function GrekiskAnalys() {
  const [bibelstalle, setBibelstalle] = useState('');
  const [analysSvar, setAnalysSvar] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [historik, setHistorik] = useState([]);

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

  // Läs in sparad historik för grekiska sökningar
  useEffect(() => {
    try {
      const sparad = localStorage.getItem('grekisk_analys_historik');
      if (sparad) {
        setHistorik(JSON.parse(sparad));
      }
    } catch (e) {
      console.error('Kunde inte läsa in historik:', e);
    }
  }, []);

  const hanteraAnalys = async (e) => {
    e?.preventDefault();
    if (!bibelstalle.trim()) return;

    setLaddar(true);

const promptText = `
Ge en noggrann grekisk grundtextanalys (koinégrekiska) för följande bibelställe: "${bibelstalle}".

Strukturera svaret så här:
1. **Grekisk grundtext**: Skriv versen/texten på grekiska med accentuerade tecken.
2. **Translitterering**: Hur ord och uttal utläses på svenska/latinska bokstäver.
3. **Textnära översättning**: En ord-för-ord-översättning som ligger så nära grundtexten som möjligt.
4. **Ordanalys & Grammatik**: Välj ut 3-5 viktiga nyckelord i texten. 
   Formatera varje punkt exakt så här:
   1. Translitterering (Grekiska) = Svensk översättning (t.ex. 1. Makarios (μακάριος) = Saliga / Lyckliga)
   - Grundform: ...
   - Grammatisk form: ...
   - Betydelsenyans och teologisk relevans: ...
`;

    try {
      const payload = {
        prompt: promptText,
        sida: 'grekiska',
        verktyg: 'Grekisk analys',
        helgdag: 'Grekisk analys',
        tema: bibelstalle,
      };

      const data = await generateContent(payload, () => {
        setModalMessage('Du måste vara inloggad för att använda verktyget.');
        setShowAuthModal(true);
      });

      const nyttSvar = data.text || 'Kunde inte generera analys.';

      if (data.tokensLeft !== undefined) {
        setCredits(data.tokensLeft);
      }

      setAnalysSvar(nyttSvar);

      const nyPost = {
        id: Date.now(),
        bibelstalle: bibelstalle,
        svar: nyttSvar,
        tid: new Date().toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' min' // Resulterar i t.ex. "24 okt. 14:57"
      };

      const uppdaterad = [nyPost, ...historik];
      setHistorik(uppdaterad);
      localStorage.setItem('grekisk_analys_historik', JSON.stringify(uppdaterad));

    } catch (err) {
      alert(err.message || 'Det uppstod ett fel vid anropet.');
    } finally {
      setLaddar(false);
    }
  };

  const rensaHistorik = () => {
    if (confirm('Vill du rensa historiken för grekiska analyser?')) {
      setHistorik([]);
      localStorage.removeItem('grekisk_analys_historik');
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
        <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-16">
          
          {/* INTRO OCH SÖKFORMULÄR */}
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
                Rena grekiskan
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed mb-6">
              Skriv in vilket bibelställe som helst ur Nya testamentet för att få den grekiska grundtexten, uttalsguide, ord-för-ord-översättning och teologisk ordanalys. 
              Märk att uttalsguiden är en förenklad translitterering och inte en exakt fonetisk representation; den följer också det erasmiska uttalet, vilket är omdiskuterat bland forskare.
            </p>

            <form onSubmit={hanteraAnalys} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={bibelstalle}
                onChange={(e) => setBibelstalle(e.target.value)}
                placeholder="T.ex. Joh 1:1-5, Matt 5:3-10, Rom 8:28..."
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b] placeholder:text-[#a09a90] focus:outline-none focus:border-[#2d3732] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={laddar}
                className="px-6 py-3 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {laddar ? 'Analyserar...' : 'Analysera text'}
              </button>
            </form>
          </div>

          {/* SENASTE ANALYSEN */}
          {analysSvar && (
            <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-[#e8e4df] mb-6">
                <h2 className="text-sm font-bold text-[#1a1d1b]">
                  Resultat för <span className="text-[#2d3732] underline decoration-[#e8e4df]">{bibelstalle}</span>:
                </h2>
                <KopieraKnapp text={analysSvar} />
              </div>
              <div className="text-xs sm:text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
                {analysSvar}
              </div>
            </div>
          )}

          {/* HISTORIKSEKTION */}
          <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6 border-b border-[#e8e4df] pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c918d]">
                Sparade analyser ({historik.length})
              </h2>
              {historik.length > 0 && (
                <button
                  onClick={rensaHistorik}
                  className="bg-white hover:bg-[#faf8f5] text-[#575c58] hover:text-[#1a1d1b] border border-[#e8e4df] rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Rensa historik
                </button>
              )}
            </div>

            {historik.length === 0 ? (
              <p className="text-xs text-[#8c918d] italic py-2">
                Inga sparade analyser än. Skriv in ett bibelställe ovan för att starta.
              </p>
            ) : (
              <div className="space-y-4">
                {historik.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#faf8f5] p-6 rounded-2xl border border-[#e8e4df]"
                  >
                    <div className="flex justify-between items-center mb-3 border-b border-[#e8e4df] pb-3">
                      <span className="text-xs sm:text-sm font-bold text-[#1a1d1b]">
                        {item.bibelstalle}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#8c918d] font-semibold">
                          Kl. {item.tid}
                        </span>
                        <KopieraKnapp text={item.svar} />
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
                      {item.svar}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* EN KOMMENTAR OM VERKTYGET */}
          <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] my-8">
            <h2 className="text-base font-bold text-[#1a1d1b] tracking-tight mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#2d3732]" />
              En kommentar om verktyget
            </h2>
            
            <div className="text-xs sm:text-sm text-[#2d312e] leading-relaxed space-y-4">
              <p className="text-[#575c58]">
                Till det exegetiska arbetet använder denna AI-modell i första hand de vedertagna vetenskapliga standardutgåvorna för Nya testamentets koinégrekiska:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-[#575c58]">
                <li>
                  <strong className="text-[#1a1d1b]">Primär grundtext:</strong> Nestle-Aland (NA28 / NA27) samt United Bible Societies (UBS5 / UBS4). Detta är den ekumeniskt och akademiskt etablerade kritiska texten (<em>editio critica</em>), vilken även utgör grunden för Bibel 2000.
                </li>
                <li>
                  <strong className="text-[#1a1d1b]">Sekundära texttraditioner:</strong> Vid behov och på begäran kan AI:n även analysera och jämföra läsarter från:
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>Textus Receptus (TR) (den texttradition som låg till grund för reformationsbiblarna och Karl XII:s bibel, samt delvis 1917 års kyrkobibel).</li>
                    <li>Den bysantinska majoritetstexten (Robinson-Pierpont).</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-[#1a1d1b]">Lexikografisk och grammatisk referens:</strong> Morfologiska analyser och semantiska nyanser följer standardverken inom bibelgrekisk exegetik, främst BDAG (Bauer-Danker-Arndt-Gingrich: <em>A Greek-English Lexicon of the New Testament and Other Early Christian Literature</em>).
                </li>
              </ul>

              <div className="pt-2 border-t border-[#e8e4df]">
                <h3 className="font-bold text-[#1a1d1b] text-xs sm:text-sm mb-2">
                  Hur textkritiska skillnader hanteras i predikoförberedelsen
                </h3>
                <p className="mb-3 text-[#575c58]">
                  När en predikotext uppvisar betydande textkritiska varianter (där t.ex. NA28 skiljer sig från Textus Receptus eller äldre svenska bibelöversättningar):
                </p>

                <ol className="list-decimal pl-5 space-y-1.5 text-[#575c58]">
                  <li>
                    <strong className="text-[#1a1d1b]">Textkritisk notering:</strong> Belysning av vilka handskrifter som stöder respektive läsart (t.ex. Codex Sinaiticus, Codex Vaticanus kontra yngre minuskler).
                  </li>
                  <li>
                    <strong className="text-[#1a1d1b]">Teologisk relevans:</strong> Analys av om en specifik läsart förändrar perikopens teologiska tyngdpunkt eller församlingens förståelse.
                  </li>
                  <li>
                    <strong className="text-[#1a1d1b]">Översättningsjämförelse:</strong> Relatering av den grekiska texten till skillnaderna mellan Bibel 2000, 1917 års kyrkobibel och Svenska Folkbibeln.
                  </li>
                </ol>
              </div>

              <p className="pt-3 italic text-[#8c918d] text-[11px] sm:text-xs border-t border-[#e8e4df]">
                När du anger ett specifikt bibelställe (bok, kapitel och vers) i din förberedelse inför söndagen, så görs alltså en fullständig analys utifrån NA28 med relevanta textkritiska anmärkningar.
              </p>
            </div>
          </section>

          {/* NAVIGERA TILL ANDRA VERKTYG */}
          <section className="mt-16 pt-8 border-t border-[#e8e4df]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8c918d] mb-6 text-center">
              Utforska fler verktyg
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {verktygLista.filter(v => v.href !== '/grekiska').map((v) => {
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