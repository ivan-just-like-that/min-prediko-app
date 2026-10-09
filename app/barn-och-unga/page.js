'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BarnOchUnga() {
  // Tillstånd för huvudläge, val och formulär
  const [huvudLage, setHuvudLage] = useState('andakt'); // 'andakt' eller 'lekar'
  const [alder, setAlder] = useState('14+'); // '6-9', '10-13', '14+'
  const [lekTyp, setLekTyp] = useState('samarbete'); // 'lara-kanna', 'samarbete', 'energi', 'reflektion'
  const [amneEllerText, setAmneEllerText] = useState('');
  
  const [svar, setSvar] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [historik, setHistorik] = useState([]);

  // Läs in sparad historik från localStorage
  useEffect(() => {
    try {
      const sparad = localStorage.getItem('barn_och_unga_historik');
      if (sparad) {
        setHistorik(JSON.parse(sparad));
      }
    } catch (e) {
      console.error('Kunde inte läsa in historik:', e);
    }
  }, []);

  const hanteraGenerering = async (e) => {
    e?.preventDefault();

    // Om det är andakt krävs ämne/text, men för lekar är det valfritt
    if (huvudLage === 'andakt' && !amneEllerText.trim()) {
      alert('Vänligen fyll i ett bibelställe eller tema för andakten.');
      return;
    }

    setLaddar(true);

    let promptText = '';

    // Beskrivning av åldersgrupp för AI:n
    let aldersBeskrivning = '';
    if (alder === '6-9') {
      aldersBeskrivning = 'barn i åldern 6–9 år (använd enkelt språk, konkret pedagogik och korta meningar)';
    } else if (alder === '10-13') {
      aldersBeskrivning = 'juniorer i åldern 10–13 år (engagerande, relaterbart till skola/kompisar, undvik barnslig ton)';
    } else {
      aldersBeskrivning = 'ungdomar och konfirmander (14+ år / Konfa) (fokus på ärlighet, existentiella frågor, identitet och djup, helt utan klyschor)';
    }

    if (huvudLage === 'andakt') {
      promptText = `
Du är en erfaren ungdomspräst och barn- och ungdomsledare i kyrkan.
Skapa ett komplett andakts- och samlingsförslag anpassat för: ${aldersBeskrivning}.
Tema/Bibelställe/Ämne: "${amneEllerText}".

Strukturera svaret tydligt enligt följande punkter:

1. **Inledning & Fysiskt föremål/Metafor**
   Förslag på ett konkret föremål att visa upp, eller en träffsäker metafor/öppningsfråga för att fånga intresset.

2. **Kort Budskap / Berättelse**
   Ett kärnfullt och pedagogiskt budskap knutet till ämnet. Anpassa språk och längd för åldersgruppen.

3. **Samtals- / Reflektionsfrågor**
   Ge 2–3 frågor anpassade för åldern som kan diskuteras i storgrupp, smågrupper eller tas med hem.

4. **Kort Bön**
   En enkel och samlande bön som knyter ihop andakten.
`;
    } else {
      // LEKAR & ÖVNINGAR
      let lekTypNamn = '';
      if (lekTyp === 'lara-kanna') lekTypNamn = 'Lära känna / Ice-breakers (namnlekar, avväpnande övningar)';
      else if (lekTyp === 'samarbete') lekTypNamn = 'Samarbete & Teambuilding (lösa problem i grupp, bygga laganda)';
      else if (lekTyp === 'energi') lekTypNamn = 'Energi & Rörelse (högt tempo, skratta ihop, spring/rörelse)';
      else if (lekTyp === 'reflektion') lekTypNamn = 'Reflektion, Tillit & Djup (skapa trygghet, lyssna på varandra)';

      promptText = `
Du är en erfaren fritids- och ungdomsledare i kyrkan.
Ge förslag på 2–3 roliga, varierade, genomförbara och trygga lekar/övningar för: ${aldersBeskrivning}.
Typ av lek: ${lekTypNamn}.
${amneEllerText.trim() ? `Tema/Koppling: "${amneEllerText}".` : 'Inget särskilt tema angivet, ge allmänna och populära exempel inom denna kategori.'}

För varje lek ska du tydligt ange:
1. **Lekens namn**
2. **Tidsåtgång & Material** (prioritera enkelt/inget material)
3. **Instruktioner steg-för-steg**
4. **Tips till ledaren** (t.ex. hur man skapar trygghet, anpassar leken eller knyter an till temat)
`;
    }

    try {
      const valttTemaHeader = amneEllerText.trim() ? amneEllerText : 'Allmänna lekar';

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          helgdag: huvudLage === 'andakt' ? 'Barn & Unga - Andakt' : 'Barn & Unga - Lekar',
          tema: `${alder} år | ${valttTemaHeader}`
        }),
      });

      const data = await res.json();
      const nyttSvar = data.text || data.result || 'Kunde inte generera förslag.';

      setSvar(nyttSvar);

      const nyPost = {
        id: Date.now(),
        typ: huvudLage === 'andakt' ? '🙏 Andakt' : '🪢 Lekar',
        alder: alder === '14+' ? '14+ / Konfa' : `${alder} år`,
        rubrik: amneEllerText.trim() ? amneEllerText : 'Allmänna lekar',
        svar: nyttSvar,
        tid: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };

      const uppdaterad = [nyPost, ...historik];
      setHistorik(uppdaterad);
      localStorage.setItem('barn_och_unga_historik', JSON.stringify(uppdaterad));

    } catch (err) {
      alert('Det uppstod ett fel vid anropet.');
    } finally {
      setLaddar(false);
    }
  };

  const rensaHistorik = () => {
    if (confirm('Vill du rensa historiken för Barn & Unga?')) {
      setHistorik([]);
      localStorage.removeItem('barn_och_unga_historik');
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
              Barn & unga
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
        
        {/* INTRO OCH FORMULÄR */}
        <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎈</span>
            <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
              Verktyg för barn, ungdom & konfa
            </h2>
          </div>
          
          <p className="text-sm text-[#575c58] leading-relaxed mb-6">
            Skapa anpassade andakter, budskap och roliga lekar för söndagsskola, konfirmation och ungdomssamlingar.
          </p>

          <form onSubmit={hanteraGenerering} className="space-y-6">
            
            {/* 1. VÄLJ HUVUDLÄGE (ANDAKT ELLER LEKAR) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#575c58] mb-2">
                1. Vad vill du skapa?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHuvudLage('andakt')}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    huvudLage === 'andakt'
                      ? 'bg-[#2d3732] border-[#2d3732] text-white shadow-sm'
                      : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                  }`}
                >
                  <span>🙏</span> Andakt & budskap
                </button>
                <button
                  type="button"
                  onClick={() => setHuvudLage('lekar')}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    huvudLage === 'lekar'
                      ? 'bg-[#2d3732] border-[#2d3732] text-white shadow-sm'
                      : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                  }`}
                >
                  <span>🪢</span> Lekar & övningar
                </button>
              </div>
            </div>

            {/* 2. VÄLJ ÅLDERSGRUPP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#575c58] mb-2">
                2. Välj åldersgrupp
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAlder('6-9')}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                    alder === '6-9'
                      ? 'bg-[#212529] border-[#212529] text-white shadow-sm'
                      : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                  }`}
                >
                  6–9 år
                </button>
                <button
                  type="button"
                  onClick={() => setAlder('10-13')}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                    alder === '10-13'
                      ? 'bg-[#212529] border-[#212529] text-white shadow-sm'
                      : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                  }`}
                >
                  10–13 år
                </button>
                <button
                  type="button"
                  onClick={() => setAlder('14+')}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                    alder === '14+'
                      ? 'bg-[#212529] border-[#212529] text-white shadow-sm'
                      : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                  }`}
                >
                  14+ / Konfa
                </button>
              </div>
            </div>

            {/* 3. VÄLJ LEKTYP (VISAS BARA OM LEKAR ÄR VALT) */}
            {huvudLage === 'lekar' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#575c58] mb-2">
                  3. Typ av lek / Syfte
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'lara-kanna', label: 'Lära känna' },
                    { id: 'samarbete', label: 'Samarbete' },
                    { id: 'energi', label: 'Energi & Rörelse' },
                    { id: 'reflektion', label: 'Reflektion & Tillit' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLekTyp(item.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-center ${
                        lekTyp === item.id
                          ? 'bg-[#2d3732] border-[#2d3732] text-white'
                          : 'bg-[#faf8f5] border-[#e8e4df] text-[#575c58] hover:border-[#d6d0c7]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TEMA OCH KNAPP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#575c58] mb-2">
                {huvudLage === 'andakt' ? '3. Bibelställe eller Tema' : '4. Tema eller Nyckelord (Valfritt)'}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={amneEllerText}
                  onChange={(e) => setAmneEllerText(e.target.value)}
                  placeholder={
                    huvudLage === 'andakt'
                      ? 'T.ex. Förlorade sonen, Förlåtelse, Mod, Luk 15...'
                      : 'T.ex. Tillit, Samarbete, Nystart eller lämna tomt...'
                  }
                  className="flex-1 p-3.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732]"
                />
                <button
                  type="submit"
                  disabled={laddar}
                  className="px-6 py-3.5 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
                >
                  {laddar
                    ? 'Skapar...'
                    : huvudLage === 'andakt'
                    ? 'Generera andakt'
                    : 'Hitta lekar'}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* RESULTATET */}
        {svar && (
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <h2 className="text-lg font-bold text-[#1a1d1b] pb-3 border-b border-[#e8e4df] mb-4 flex items-center justify-between">
              <span>
                {huvudLage === 'andakt' ? 'Förslag på andakt' : 'Förslag på lekar'} för{' '}
                <span className="text-[#2563eb]">
                  {alder === '14+' ? '14+ / Konfa' : `${alder} år`}
                </span>
              </span>
              <span className="text-xs bg-[#faf8f5] border border-[#e8e4df] px-3 py-1 rounded-full text-[#575c58] font-normal">
                {amneEllerText.trim() || 'Allmänna lekar'}
              </span>
            </h2>
            <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
              {svar}
            </div>
          </div>
        )}

        {/* HISTORIKSEKTION */}
        <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-6 border-b border-[#e8e4df] pb-4">
            <h2 className="text-lg font-bold text-[#1a1d1b] tracking-tight">
              📋 Sparade förslag ({historik.length})
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
              Inga sparade förslag än. Välj alternativ ovan och klicka på knappen för att starta.
            </p>
          ) : (
            <div className="space-y-4">
              {historik.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#faf8f5] p-6 rounded-xl border border-[#e8e4df]"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-[#e8e4df] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-[#2d3732] text-white px-2 py-0.5 rounded">
                        {item.typ}
                      </span>
                      <span className="text-xs font-bold text-[#2563eb]">
                        {item.alder}
                      </span>
                      <span className="text-xs text-[#575c58]">
                        • {item.rubrik}
                      </span>
                    </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/predikoideer" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">💡</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Predikoidéer →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Dispositioner och metaforer.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/historik" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">📜</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Historiska kommentarer →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Vetenskapliga kommentarer.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/grekiska" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
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