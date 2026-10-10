'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PredikantpeppPage() {
  // Tillstånd för de tre modulerna
  const [peppSvar, setPeppSvar] = useState('');
  const [loadingPepp, setLoadingPepp] = useState(false);

  const [haikuTema, setHaikuTema] = useState('');
  const [haikuSvar, setHaikuSvar] = useState('');
  const [loadingHaiku, setLoadingHaiku] = useState(false);

  const [historiaTema, setHistoriaTema] = useState('');
  const [historiaSvar, setHistoriaSvar] = useState('');
  const [loadingHistoria, setLoadingHistoria] = useState(false);

  // 1. Generera själavårdande pepp till prästen (hög variation & varierad ton)
  const genereraPepp = async () => {
    setLoadingPepp(true);
    setPeppSvar('');

    // Lista på olika vinklar för att tvinga fram variation vid varje klick
    const vinklar = [
      'Guds nåd och vila',
      'gemenskap och kollegialt stöd',
      'glädje och lekfullhet i tjänsten',
      'trygghet i att inte behöva vara perfekt',
      'tacksamhet för de små ögonblicken',
      'tröst och återhämtning',
      'vardagsmysterium och förundran'
    ];
    const slumpVinkel = vinklar[Math.floor(Math.random() * vinklar.length)];
    const slumpId = Math.random().toString(36).substring(7);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ge en kort, varm, genuint vardaglig och stöttande påminnelse till en präst.
            Fokusera på temat: "${slumpVinkel}". Unikt ID för denna generering: ${slumpId}.

            Tone of voice: Avslappnad, kamratlig, varm och helt utan klyschor, kyrkspråk eller upprepningar.
            Skriv 1–2 korta meningar som känns som ett helt nytt, fräscht och omtänksamt ord från en god vän. Skriv enbart själva påminnelsen och inget annat.`,
          inkluderaFraga: false,
          temperature: 0.95, // Högre temperatur ger mer varierade svar
        }),
      });

      const data = await res.json();
      setPeppSvar(data.text || 'Kunde inte hämta pepp just nu.');
    } catch (err) {
      console.error(err);
      setPeppSvar('Ett fel uppstod vid hämtning av pepp.');
    } finally {
      setLoadingPepp(false);
    }
  };

  // 2. Generera Haiku (utan extra fråga i slutet)
  const genereraHaiku = async (e) => {
    e.preventDefault();
    if (!haikuTema.trim()) return;

    setLoadingHaiku(true);
    setHaikuSvar('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Skriv en teologiskt fördjupad, poetisk och stämningsfull haiku (5-7-5 stavelser) baserat på följande tema eller bibelställe: "${haikuTema}". Svara enbart med själva haikudikten samt en kort rad om dess teologiska klangbotten.`,
          inkluderaFraga: false,
        }),
      });

      const data = await res.json();
      setHaikuSvar(data.text || 'Kunde inte generera haiku.');
    } catch (err) {
      console.error(err);
      setHaikuSvar('Ett fel uppstod vid generering av haiku.');
    } finally {
      setLoadingHaiku(false);
    }
  };

  // 3. Generera rolig historia (utan extra fråga i slutet)
  const genereraHistoria = async (e) => {
    e.preventDefault();
    if (!historiaTema.trim()) return;

    setLoadingHistoria(true);
    setHistoriaSvar('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Skriv en kort, varm, rumsren och mild humorfylld historia, anekdot eller uppvärmning som en präst kan inleda sin predikan med för att väcka församlingens leende. Den ska koppla an till temat eller bibelstället: "${historiaTema}". Den ska vara smakfull, avsedd för en kyrklig kontext och lätt να återge muntligt.`,
          inkluderaFraga: false,
        }),
      });

      const data = await res.json();
      setHistoriaSvar(data.text || 'Kunde inte generera historia.');
    } catch (err) {
      console.error(err);
      setHistoriaSvar('Ett fel uppstod vid generering av historien.');
    } finally {
      setLoadingHistoria(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased flex flex-col justify-between">
      <div>
        
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
                Predikantpepp
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
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
          
        {/* INTRO-RUTA (SAMMA STIL SOM KASUALTAL M.FL.) */}
        <div className="bg-white p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-2xl font-bold text-[#1a1d1b] tracking-tight">
              Predikantpepp
            </h2>
          </div>
          
          <p className="text-sm text-[#575c58] leading-relaxed">
            Ett ord på vägen, poetiska reflektioner och kanske ett leende.
          </p>
        </div>

          {/* MOP 1: Själavårdande pepp till prästen */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 text-center space-y-4">
            <div className="inline-block bg-[#f4f0eb] p-3 rounded-full text-2xl mb-1">
              🌱
            </div>
            <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
              Ett ord till dig som predikar
            </h2>
            <p className="text-sm text-[#575c58] max-w-lg mx-auto">
              Du är viktig, älskad och duger just som den du är.
            </p>
            <div>
              <button
                onClick={genereraPepp}
                disabled={loadingPepp}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50 shadow-sm"
              >
                {loadingPepp ? 'Hämtar uppmuntran...' : 'Nu behöver jag lite pepp'}
              </button>
            </div>

            {peppSvar && (
              <div className="mt-6 p-6 bg-[#f4f0eb] border border-[#e8e4df] rounded-xl text-[#1a1d1b] text-base md:text-lg italic font-serif leading-relaxed max-w-2xl mx-auto">
                ”{peppSvar}”
              </div>
            )}
          </section>

          {/* MOP 2: Haikugenerator */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl p-2 bg-[#f4f0eb] rounded-lg">✒️</span>
              <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
                Haikugenerator
              </h2>
            </div>
            <p className="text-sm text-[#575c58]">
              Få en poetisk haiku (5-7-5 stavelser) baserat på söndagens tema, ett bibelord, eller vad du vill.
            </p>
            <form onSubmit={genereraHaiku} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={haikuTema}
                onChange={(e) => setHaikuTema(e.target.value)}
                placeholder="T.ex. Johannes 3:16 eller 'Förlåtelse'"
                className="flex-1 px-4 py-3 border border-[#e8e4df] rounded-xl focus:ring-2 focus:ring-[#2d3732] focus:outline-none text-[#1a1d1b]"
              />
              <button
                type="submit"
                disabled={loadingHaiku || !haikuTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50"
              >
                {loadingHaiku ? 'Skapar...' : 'Generera Haiku'}
              </button>
            </form>

            {haikuSvar && (
              <div className="mt-4 p-5 bg-[#faf8f5] border border-[#e8e4df] rounded-xl whitespace-pre-wrap text-[#1a1d1b] font-serif leading-relaxed">
                {haikuSvar}
              </div>
            )}
          </section>

          {/* MOP 3: Rolig historia / Predikointro */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-6 md:p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl p-2 bg-[#f4f0eb] rounded-lg">😊</span>
              <h2 className="text-xl font-serif font-semibold text-[#1a1d1b]">
                En jätterolig historia..?
              </h2>
            </div>
            <p className="text-sm text-[#575c58]">
              Varning för denna alltså, AI:n har ingen jättebra känsla för humor... Men ibland så!
            </p>
            <form onSubmit={genereraHistoria} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={historiaTema}
                onChange={(e) => setHistoriaTema(e.target.value)}
                placeholder="T.ex. 'Tålamod', 'Skapelsen' eller 'Lukas 15'"
                className="flex-1 px-4 py-3 border border-[#e8e4df] rounded-xl focus:ring-2 focus:ring-[#2d3732] focus:outline-none text-[#1a1d1b]"
              />
              <button
                type="submit"
                disabled={loadingHistoria || !historiaTema.trim()}
                className="bg-[#2d3732] hover:bg-[#1a1d1b] text-white px-6 py-3 rounded-xl font-medium transition duration-200 disabled:opacity-50"
              >
                {loadingHistoria ? 'Skapar...' : 'Skapa historia'}
              </button>
            </form>

            {historiaSvar && (
              <div className="mt-4 p-5 bg-[#faf8f5] border border-[#e8e4df] rounded-xl whitespace-pre-wrap text-[#1a1d1b] leading-relaxed">
                {historiaSvar}
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
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-16 py-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d] bg-white">
        © 2026 Patric Ivan. Innehåll genererat av användare mha AI.
      </footer>
    </main>
  );
}