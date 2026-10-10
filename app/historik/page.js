'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistoriskKontext() {
  const [bibelstalle, setBibelstalle] = useState('');
  const [kommentarSvar, setKommentarSvar] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [historik, setHistorik] = useState([]);

  // Läs in sparad historik från localStorage
  useEffect(() => {
    try {
      const sparad = localStorage.getItem('historiska_kommentarer_historik');
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
Ge en fördjupad historisk och vetenskaplig kommentar för följande bibelställe: "${bibelstalle}".

Svaret SKALL struktureras och delas upp i exakt följande punkter och underrubriker:

1. **Historisk kontext**
   a. **Tidsperiod**: När skrevs texten eller när utspelar sig händelsen?
   b. **Författare**: Vem anses ha skrivit texten utifrån traditionella och moderna forskningsperspektiv?
   c. **Avsedda åhörare**: Vilka var de ursprungliga mottagarna och vad var deras situation?

2. **Kulturell och social kontext**
   Ge en beskrivning av de samtida kulturella, sociala och religiösa förhållandena, traditionerna samt samhällsstrukturen som påverkar förståelsen av texten.

3. **Vetenskapliga perspektiv**
   a. **Samsyn**: Beskriv kort vad den moderna bibelvetenskapen och forskare i huvudsak är ense om gällande texten.
   b. **Debatt**: Ta upp olika infallsvinklar och teologiska debatter där teologer och forskare tycker olika eller där åsikterna går isär.

4. **Förslag på vidare läsning**
   Ge upp till maximalt 10 förslag på kända böcker, bibelkommentarer eller vetenskapliga skrifter som behandlar bibelstället. Prioritera svensk litteratur (t.ex. Svenskt Bibliskt Uppslagsverk, NT:s budskap, kommentarserier), men inkludera även kända internationella teologers skrifter.
`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          helgdag: 'Historisk kommentar',
          tema: bibelstalle
        }),
      });

      const data = await res.json();
      const nyttSvar = data.text || data.result || 'Kunde inte generera historisk kommentar.';

      setKommentarSvar(nyttSvar);

      const nyPost = {
        id: Date.now(),
        bibelstalle: bibelstalle,
        svar: nyttSvar,
        tid: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };

      const uppdaterad = [nyPost, ...historik];
      setHistorik(uppdaterad);
      localStorage.setItem('historiska_kommentarer_historik', JSON.stringify(uppdaterad));

    } catch (err) {
      alert('Det uppstod ett fel vid anropet.');
    } finally {
      setLaddar(false);
    }
  };

  const rensaHistorik = () => {
    if (confirm('Vill du rensa historiken för historiska kommentarer?')) {
      setHistorik([]);
      localStorage.removeItem('historiska_kommentarer_historik');
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased">
      
      {/* HEADER / TOPPMENY */}
      <header className="bg-white border-b border-[#e8e4df] py-5">
        <div className="max-w-[1000px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-[#575c58] hover:text-[#1a1d1b] text-sm font-medium transition-colors flex items-center gap-1"
            >
              ← Tillbaka till start
            </Link>
            <span className="text-[#e8e4df]">|</span>
            <h1 className="text-xl font-bold tracking-tight text-[#1a1d1b]">
              Historiska kommentarer
            </h1>
          </div>

          <nav className="flex items-center gap-5">
            <Link href="/pris" className="text-[#575c58] hover:text-[#1a1d1b] text-sm font-medium transition-colors">
              Pris
            </Link>
            <Link href="/login" className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Logga in
            </Link>
          </nav>
        </div>
      </header>

      {/* HUVUDINNEHÅLL */}
      <div className="max-w-[1000px] mx-auto px-6 pt-8 pb-16">
        
        {/* INTRO OCH SÖKFORMULÄR */}
        <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
              Historiska kommentarer & kontext
            </h2>
          </div>
          
          <p className="text-sm text-[#575c58] leading-relaxed mb-6">
            Skriv in ett bibelställe ur Gamla eller Nya testamentet för att få en historisk, kulturell och vetenskaplig analys samt litteraturförslag.
          </p>

          <form onSubmit={hanteraAnalys} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bibelstalle}
              onChange={(e) => setBibelstalle(e.target.value)}
              placeholder="T.ex. Jes 9:1-7, Luk 2:1-20, Rom 13:1-7..."
              className="flex-1 p-3.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732]"
            />
            <button
              type="submit"
              disabled={laddar}
              className="px-6 py-3.5 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {laddar ? 'Hämtar kommentar...' : 'Hämta kommentar'}
            </button>
          </form>
        </div>

        {/* SENASTE RESULTATET */}
        {kommentarSvar && (
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <h2 className="text-lg font-bold text-[#1a1d1b] pb-3 border-b border-[#e8e4df] mb-4">
              Historisk analys för <span className="text-[#2563eb]">{bibelstalle}</span>:
            </h2>
            <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
              {kommentarSvar}
            </div>
          </div>
        )}

        {/* HISTORIKSEKTION */}
        <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-6 border-b border-[#e8e4df] pb-4">
            <h2 className="text-lg font-bold text-[#1a1d1b] tracking-tight">
              📋 Sparade historiska kommentarer ({historik.length})
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
              Inga sparade kommentarer än. Skriv in ett bibelställe ovan för att starta.
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
                    <span className="text-xs text-[#8c918d] font-semibold">
                      Kl. {item.tid}
                    </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link href="/predikoideer" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4 h-full">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">💡</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Predikoidéer →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Dispositioner & vinklar.
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
                    Pepp, haikuer & humor.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 pt-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d]">
          © 2026 Patric Ivan. Innehåll genererat av användare mha AI.
        </footer>

      </div>
    </main>
  );
}