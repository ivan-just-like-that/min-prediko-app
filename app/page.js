'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function StartSida() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased">
      
      {/* TOPPMENY / HEADER */}
      <header className="bg-white border-b border-[#e8e4df] py-5">
        <div className="max-w-[1000px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1d1b]">
              Predikoassistenten
            </h1>
            <span className="bg-[#f4f0eb] text-[#2d3732] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#e8e4df]">
              beta
            </span>
          </div>

          <nav className="flex items-center gap-5">
            <Link 
              href="/pris" 
              className="text-[#575c58] hover:text-[#1a1d1b] text-sm font-medium transition-colors"
            >
              Pris
            </Link>
            <Link 
              href="/login" 
              className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Logga in
            </Link>
          </nav>
        </div>
      </header>

      {/* HUVUDINNEHÅLL */}
      <div className="max-w-[1000px] mx-auto px-6 pt-10 pb-16">
        
      {/* ILLUSTRATION */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <Image
            src="/hero-illustration.jpeg"
            alt="Illustration av en präst som arbetar vid sin dator"
            width={1200}
            height={675}
            className="w-full h-auto object-cover block"
            priority
          />
        </div>

        {/* BETAINFORMATION & INTROTEXT */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8">
            <h2 className="text-2xl font-bold text-[#1a1d1b] mb-4 tracking-tight">
              Välkommen till beta-versionen av Predikoassistenten!
            </h2>
            
            <p className="text-[#575c58] text-base leading-relaxed mb-4">
              Så roligt att du vill vara med och testa Predikoassistenten! Det är en AI-driven tjänst vars idé är att
              ge dig som predikant idéer och uppslag till ditt viktiga arbete med Ordet. Tanken är alltså inte att den ska användas för
              att skriva fullständiga predikningar från början till slut, utan att ge dig förslag och inspiration. Ja, du kan iofs be denna AI:n att skriva en hel predikan, men som sagt,
              meningen är att du själv ska ha kontrollen och sätta samman slutprodukten med din personliga stil, de nyanser och det tonläge som är ditt.
            </p>

            <p className="text-[#575c58] text-base leading-relaxed mb-4">
              AI-modellen är instruerad att ge förslag och idéer som är teologiskt genomtänkta och relevanta för i första hand Svenska kyrkans präster. Jag tänker dock att även pastorer inom andra kristna samfund kan ha nytta av den.
            </p>

            <p className="text-[#575c58] text-base leading-relaxed mb-4">
              Då du är med i testgruppen får du såklart tillgång till alla funktioner utan kostnad under utvecklingsfasen. Sidan kommer kontinuerligt att uppdateras med nya funktioner och förbättringar under denna tid. T ex är sidan inte helt mobilanpassad än, inte heller är sidorna för &quot;pris&quot; och &quot;login&quot; aktiverade ännu.<br /><br />
              Jag är tacksam om du inte sprider denna sida ännu, jag vill att vi testar den ordentligt först.<br /><br />
              Bästa hälsningar, Patric.
            
            </p>

            <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e4df] text-sm text-[#575c58] leading-relaxed mb-6">
              <strong className="text-[#1a1d1b]">Viktigt om AI-modellen:</strong> Kom ihåg att alla funktioner drivs av en AI-modell (för närvarande gemini-3.8-flash) och ingen modell är perfekt, i meningen att allt blir 100% rätt. Det är t ex ett känt fenomen att modellerna ibland &quot;hallucinerar&quot; och hittar på egna svar, så glöm inte att faktakolla ev info du ska använda.
            </div>

            <div className="border-t border-[#e8e4df] pt-6">
              <h3 className="text-lg font-semibold text-[#1a1d1b] mb-3">
                Ok, sätt igång att pröva och kom med förslag på förbättringar!
              </h3>
              <p className="text-sm text-[#575c58] mb-3">
                Några frågor jag tänker på är bl a:
              </p>
              <ul className="space-y-2 text-sm text-[#575c58] list-disc list-inside bg-[#f4f0eb]/50 p-4 rounded-xl border border-[#e8e4df]">
                <li>Saknas någon funktion, isåfall vilken?</li>
                <li>Finns det intresse att ha med en funktion som ger idéer till kasualtal utifrån ett textställe?</li>
                <li>Känns svaren och förslagen du får från AI-modellen relevanta, eller känns de generellt för konstlade?</li>
                <li>Hur korrekt upplever du att denna AI-modell är, går det att lita på svaren?</li>
                <li>Hur fungerar sidan att navigera på, förstår man intuitivt vilka knappar man ska trycka på etc.</li>
                <li>Vad skulle du vara villig att betala per månad för en färdigutvecklad tjänst? 49:-, 79:- eller 99:-/mån? mer? mindre? (Jag är tvungen att ta ut någon avgift framåt för att betala för serverplats, få en AI-tjänst som är pålitlig mm...)</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-[#1a1d1b] font-medium text-lg">
            Välj ett av verktygen nedan för att påbörja din predikoförberedelse, utforska den historiska kontexten eller fördjupa dig i grundtexten.
          </p>
        </section>

        {/* VERKTYGSKORT (3 SPALTER) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KORT 1: PREDIKOIDÉER */}
          <Link href="/predikoideer" className="group block h-full">
            <div className="h-full p-8 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:border-[#d6d0c7] transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#f4f0eb] flex items-center justify-center text-2xl mb-5">
                  💡
                </div>
                <h3 className="text-xl font-semibold text-[#1a1d1b] mb-2 group-hover:text-[#2d3732] transition-colors">
                  Predikoidéer
                </h3>
                <p className="text-sm text-[#575c58] leading-relaxed">
                  Praktiska verktyg som förslag på disposition till din predikan. Här kan du också få psalmförslag till helgdagen.
                </p>
              </div>
              <span className="mt-7 text-sm font-semibold text-[#2d3732] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Öppna verktyget →
              </span>
            </div>
          </Link>

          {/* KORT 2: HISTORISKA KOMMENTARER */}
          <Link href="/historik" className="group block h-full">
            <div className="h-full p-8 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:border-[#d6d0c7] transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#f4f0eb] flex items-center justify-center text-2xl mb-5">
                  📜
                </div>
                <h3 className="text-xl font-semibold text-[#1a1d1b] mb-2 group-hover:text-[#2d3732] transition-colors">
                  Historiska kommentarer
                </h3>
                <p className="text-sm text-[#575c58] leading-relaxed">
                  Fördjupning i den historiska kontexten.
                </p>
              </div>
              <span className="mt-7 text-sm font-semibold text-[#2d3732] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Öppna verktyget →
              </span>
            </div>
          </Link>

          {/* KORT 3: RENA GREKISKAN */}
          <Link href="/grekiska" className="group block h-full">
            <div className="h-full p-8 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:border-[#d6d0c7] transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#f4f0eb] flex items-center justify-center text-2xl mb-5">
                  🇬🇷
                </div>
                <h3 className="text-xl font-semibold text-[#1a1d1b] mb-2 group-hover:text-[#2d3732] transition-colors">
                  Rena grekiskan
                </h3>
                <p className="text-sm text-[#575c58] leading-relaxed">
                  Varför inte damma av dina kunskaper i grekiska? Bästa sättet att komma nära textens betydelse.
                </p>
              </div>
              <span className="mt-7 text-sm font-semibold text-[#2d3732] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Öppna verktyget →
              </span>
            </div>
          </Link>

        </div>

{/* FEEDBACKSEKTION / FORMULÄR FÖR BETATESTARE */}
        <section className="mt-8 p-6 sm:p-8 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="max-w-xl mx-auto text-center mb-6">
            <span className="text-3xl mb-2 block">💬</span>
            <h3 className="text-xl font-bold text-[#1a1d1b] tracking-tight mb-1">
              Återkoppling eller idéer?
            </h3>
            <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
              Som betatestare är dina synpunkter ovärderliga! Skriv dina tankar, svar på frågorna eller andra förslag nedan så skickas det direkt till mig.
            </p>
          </div>

          <form
            action="https://api.web3forms.com/submit"
            method="POST"
            className="max-w-xl mx-auto space-y-4"
          >
            {/* Din Web3Forms Access Key */}
            <input
              type="hidden"
              name="access_key"
              value="cf6ed5dc-1549-4541-925b-3224203bdf57"
            />
            {/* Ämne i mejlet du får */}
            <input
              type="hidden"
              name="subject"
              value="Ny feedback för Predikoassistenten"
            />
            <input
              type="hidden"
              name="from_name"
              value="Predikoassistenten Beta"
            />

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#1a1d1b] mb-1.5"
              >
                Din e-postadress <span className="text-[#575c58] font-normal">(Valfritt, om du vill ha svar)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="namn@exempel.se"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b] placeholder:text-[#a09a90] focus:outline-none focus:border-[#2d3732] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-semibold text-[#1a1d1b] mb-1.5"
              >
                Dina synpunkter & feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Skriv dina svar på frågorna eller andra funderingar här..."
                className="w-full px-4 py-3 text-xs sm:text-sm bg-[#faf8f5] border border-[#e8e4df] rounded-xl text-[#1a1d1b] placeholder:text-[#a09a90] focus:outline-none focus:border-[#2d3732] focus:bg-white transition-all resize-y"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              ✉️ Skicka feedback
            </button>
          </form>

          <p className="text-[11px] text-[#88837a] text-center mt-4">
            Du kan även maila direkt till:{" "}
            <span className="font-medium text-[#1a1d1b]">ivan@patricivan.se</span>
          </p>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 pt-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d]">
          © 2026 Patric Ivan. Alla rättigheter förbehållna.
        </footer>

      </div>
    </main>
  );
}