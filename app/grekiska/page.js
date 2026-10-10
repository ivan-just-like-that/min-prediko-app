'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GrekiskAnalys() {
  const [bibelstalle, setBibelstalle] = useState('');
  const [analysSvar, setAnalysSvar] = useState('');
  const [laddar, setLaddar] = useState(false);
  const [historik, setHistorik] = useState([]);

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
3. **Svensk översättning**: Ord-för-ord / nära översättning.
4. **Ordanalys & Grammatik**: Välj ut 3-5 viktiga nyckelord i texten. För varje ord ange:
- Ordets grundform (lexikonform)
- Grammatisk form (t.ex. Substantiv Akkusativ Maskulinum, eller Verb Aorist Indikativ Aktiv)
- Betydelsenyanser och teologisk relevans för predikan.
`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          helgdag: 'Grekisk analys',
          tema: bibelstalle
        }),
      });

      const data = await res.json();
      const nyttSvar = data.text || data.result || 'Kunde inte generera analys.';

      setAnalysSvar(nyttSvar);

      const nyPost = {
        id: Date.now(),
        bibelstalle: bibelstalle,
        svar: nyttSvar,
        tid: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };

      const uppdaterad = [nyPost, ...historik];
      setHistorik(uppdaterad);
      localStorage.setItem('grekisk_analys_historik', JSON.stringify(uppdaterad));

    } catch (err) {
      alert('Det uppstod ett fel vid anropet.');
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
              Rena grekiskan
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
            <span className="text-2xl">🇬🇷</span>
            <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
              Analys av den grekiska grundtexten (NT)
            </h2>
          </div>
          
          <p className="text-sm text-[#575c58] leading-relaxed mb-6">
            Skriv in vilket bibelställe som helst ur Nya testamentet för att få den grekiska grundtexten, uttalsguide, ord-för-ord-översättning och teologisk ordanalys.
            Märk att uttalsguiden är en förenklad translitterering och inte en exakt fonetisk representation; den följer också det erasmiska uttalet, vilket är omdiskuterat bland forskare.
          </p>

          <form onSubmit={hanteraAnalys} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bibelstalle}
              onChange={(e) => setBibelstalle(e.target.value)}
              placeholder="T.ex. Joh 1:1-5, Matt 5:3-10, Rom 8:28..."
              className="flex-1 p-3.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732]"
            />
            <button
              type="submit"
              disabled={laddar}
              className="px-6 py-3.5 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {laddar ? 'Analyserar...' : 'Analysera text'}
            </button>
          </form>
        </div>

        {/* SENASTE ANALYSEN */}
        {analysSvar && (
          <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <h2 className="text-lg font-bold text-[#1a1d1b] pb-3 border-b border-[#e8e4df] mb-4">
              Resultat för <span className="text-[#2563eb]">{bibelstalle}</span>:
            </h2>
            <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
              {analysSvar}
            </div>
          </div>
        )}

        {/* HISTORIKSEKTION */}
        <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-6 border-b border-[#e8e4df] pb-4">
            <h2 className="text-lg font-bold text-[#1a1d1b] tracking-tight">
              📜 Sparade analyser ({historik.length})
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
              Inga sparade analyser än. Skriv in ett bibelställe ovan för att starta.
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

{/* EN KOMMENTAR OM VERKTYGET */}
        <section className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] my-8">
          <h2 className="text-xl font-bold text-[#1a1d1b] tracking-tight mb-4 flex items-center gap-2">
            <span>ℹ️</span> En kommentar om verktyget
          </h2>
          
          <div className="text-sm text-[#2d312e] leading-relaxed space-y-4">
            <p>
              Som samtals- och predikopartner för exegetiskt arbete i Svenska kyrkan utgår denna AI-modell i första hand från de vedertagna vetenskapliga standardutgåvorna för Nya testamentets koinégrekiska:
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

            <div className="pt-2">
              <h3 className="font-bold text-[#1a1d1b] text-base mb-2">
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

            <p className="pt-2 italic text-[#575c58] border-t border-[#e8e4df]">
              När du anger ett specifikt bibelställe (bok, kapitel och vers) i din förberedelse inför söndagen, så görs alltså en fullständig analys utifrån NA28 med relevanta textkritiska anmärkningar.
            </p>
          </div>
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