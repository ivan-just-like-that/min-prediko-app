'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateContent } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

// Hjälp-komponent för kopiera-knapp
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
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
        kopierad
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-white hover:bg-[#f4f0eb] text-[#575c58] hover:text-[#1a1d1b] border-[#e8e4df]'
      }`}
      title="Kopiera text"
    >
      {kopierad ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Kopierat!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Kopiera</span>
        </>
      )}
    </button>
  );
}

export default function BibelstudieGuide() {
  const [bibelstalle, setBibelstalle] = useState('');
  const [studieSvar, setStudieSvar] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [historik, setHistorik] = useState([]);

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

  // Läs in sparad historik från localStorage
  useEffect(() => {
    try {
      const sparad = localStorage.getItem('bibelstudie_historik');
      if (sparad) {
        setHistorik(JSON.parse(sparad));
      }
    } catch (e) {
      console.error('Kunde inte läsa in historik:', e);
    }
  }, []);

  const hanteraGenerering = async (e) => {
    e?.preventDefault();
    if (!bibelstalle.trim()) return;

    setLaddar(true);

    const promptText = `
Du är en erfaren lärare i bibelkunskap, historia och livsåskådning, samt en god och varm själasörjare. Din uppgift är att skriva samtalsfrågor för en bibelstudiegrupp. Tonen ska vara vardaglig, inbjudande, varm och teologiskt genomtänkt.

VIKTIGT OM FORMULERINGEN: Alla frågor ska vara inkluderande och ställas ur ett gemensamt "vi/oss"-perspektiv (använd uttryck som "vad tänker vi", "vad säger det oss", "hur kan vi relatera till", "vilka i texten kan vi känna igen oss i"). Undvik att ställa direkt personliga frågor till en enskild individ (som "vad gör det med dig" eller "vad tycker du personligen").

Skapa ett komplett samtalsschema med exakt 10 frågor anpassade till följande bibelställe/kapitel: "${bibelstalle}".

Svaret SKALL struktureras och delas upp med följande rubriker och upplägg:

### 📖 Kort introduktion för samtalets ledare
Ge en kort (2-4 meningar) pedagogisk och varm introduktion till texten som ledaren kan läsa upp för gruppen.

---

### 💬 10 Samtalsfrågor för gruppen

1. **Vad handlar texten om?** (Observation & händelseförlopp)
2. **Mottagare & Ursprungskontext** (Vem skrevs texten till ursprungligen och varför?)
3. **Kulturell bakgrund** (Vilka samtida förhållanden eller traditioner är viktiga för oss att känna till?)
4. **Guds bild & Budskap** (Vad uppenbarar texten om Gud, Jesus eller människans relation till det heliga?)
5. **Identifikation** (Vilka personer eller roller i texten kan vi lättast känna igen oss i, och varför?)
6. **Utmaning i texten** (Vad i denna text kan kännas svårt, provokativt eller utmanande för oss idag?)
7. **Koppling till vår vardag** (Hur talar detta direkt in i våra relationer, gemenskaper eller vår vardagliga tro?)
8. **Gemensam reflektion** (Finns det en specifik vers eller tanke som stannar kvar hos oss extra mycket?)
9. **Livsåskådning & Samhälle** (Hur utmanar eller stöttar detta budskap den värld och det samhälle vi lever i nu?)
10. **Bön & Handling** (Vad skickar denna text med oss gemensamt för handling eller böneämne i veckan?)

---

### 🙏 Avslutande tanke / Böneförslag
Ge ett kort förslag på hur ledaren kan runda av samtalet i bön eller gemensam stund.
`;

    try {
      const payload = {
        prompt: promptText,
        sida: 'bibelstudium',
        verktyg: 'Bibelstudiefrågor',
        helgdag: 'Bibelstudium',
        tema: bibelstalle
      };

      const data = await generateContent(payload, () => {
        setModalMessage('Du måste vara inloggad för att använda verktyget.');
        setShowAuthModal(true);
      });

      const nyttSvar = data.text || 'Kunde inte generera samtalsfrågor.';

      if (data.tokensLeft !== undefined) {
        setCredits(data.tokensLeft);
      }

      setStudieSvar(nyttSvar);

      const nyPost = {
        id: Date.now(),
        bibelstalle: bibelstalle,
        svar: nyttSvar,
        tid: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };

      const uppdaterad = [nyPost, ...historik];
      setHistorik(uppdaterad);
      localStorage.setItem('bibelstudie_historik', JSON.stringify(uppdaterad));

    } catch (err) {
      alert(err.message || 'Det uppstod ett fel vid anropet.');
    } finally {
      setLaddar(false);
    }
  };

  const rensaHistorik = () => {
    if (confirm('Vill du rensa historiken för bibelstudiefrågor?')) {
      setHistorik([]);
      localStorage.removeItem('bibelstudie_historik');
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased">
      
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
              <span className="sm:hidden">Bibelstudium</span>
              <span className="hidden sm:inline">Bibelstudieguiden</span>
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
      <div className="max-w-[1000px] mx-auto px-6 pt-8 pb-16">
        
        {/* INTRO OCH SÖKFORMULÄR */}
        <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
              Frågor för bibelstudiegruppen
            </h2>
          </div>
          
          <p className="text-sm text-[#575c58] leading-relaxed mb-6">
            Skriv in ett kapitel eller ett bibelställe så skapar AI:n 10 anpassade samtalsfrågor. Frågorna täcker in textens innehåll, historiska mottagare och vardaglig tillämpning mm.
          </p>

          <form onSubmit={hanteraGenerering} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bibelstalle}
              onChange={(e) => setBibelstalle(e.target.value)}
              placeholder="T.ex. Markus 4, Romarbrevet 12, Fil 2:1-11..."
              className="flex-1 p-3.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732]"
            />
            <button
              type="submit"
              disabled={laddar}
              className="px-6 py-3.5 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {laddar ? 'Skapar frågor...' : 'Skapa samtalsfrågor'}
            </button>
          </form>
        </div>

        {/* SENASTE RESULTATET */}
        {studieSvar && (
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#e8e4df] mb-4">
              <h2 className="text-lg font-bold text-[#1a1d1b]">
                Samtalsfrågor för <span className="text-[#2563eb]">{bibelstalle}</span>:
              </h2>
              <KopieraKnapp text={studieSvar} />
            </div>
            <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
              {studieSvar}
            </div>
          </div>
        )}

        {/* HISTORIKSEKTION */}
        <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-6 border-b border-[#e8e4df] pb-4">
            <h2 className="text-lg font-bold text-[#1a1d1b] tracking-tight">
              📋 Sparade studiefrågor ({historik.length})
            </h2>
            {historik.length > 0 && (
              <button
                onClick={rensaHistorik}
                className="bg-[#faf8f5] hover:bg-[#f4f0eb] text-[#575c58] hover:text-[#1a1d1b] border border-[#e8e4df] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Rensa historik
              </button>
            )}
          </div>

          {historik.length === 0 ? (
            <p className="text-sm text-[#8c918d] italic py-2">
              Inga sparade samtalsfrågor än. Skriv in ett bibelställe ovan för att starta.
            </p>
          ) : (
            <div className="space-y-4">
              {historik.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#faf8f5] p-6 rounded-xl border border-[#e8e4df]"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-[#e8e4df] pb-2">
                    <span className="text-base font-bold text-[#2563eb]">
                      {item.bibelstalle}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8c918d] font-semibold">
                        Kl. {item.tid}
                      </span>
                      <KopieraKnapp text={item.svar} />
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
                    {item.svar}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
                    Dispositioner och vinklar.
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
                    Pepp, haikuer och humor.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/populart" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🔥</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Populärt bland kollegorna →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Se vad andra utforskar.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

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
        <footer className="mt-16 pt-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d]">
          © 2026 Patric Ivan. Innehåll genererat av användare mha AI.
        </footer>

      </div>
    </main>
  );
}