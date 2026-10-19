'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Anpassa sökvägen om det behövs
import AuthModal from '@/components/AuthModal';

export default function StartSida() {
  // --- 1. STATE FÖR ANVÄNDARE, MODAL OCH LADDNINGSTATUS ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isTester, setIsTester] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- 2. HÄMTA PROFIL OCH LYSSNA PÅ INLOGGNINGSÄNDRINGAR ---
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

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased">
      
      {/* TOPPMENY / HEADER */}
      <header className="bg-white border-b border-[#e8e4df] py-4">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex justify-between items-center gap-2">
          
          {/* VÄNSTER: Titel & Beta-tagg */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#1a1d1b]">
              Predikoassistenten
            </h1>
            <span className="bg-[#f4f0eb] text-[#2d3732] text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-[#e8e4df]">
              beta
            </span>
          </div>

         {/* HÖGER: Navigation */}
          <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link 
              href="/pris" 
              className="text-[#575c58] hover:text-[#1a1d1b] text-xs sm:text-sm font-medium transition-colors"
            >
              Pris
            </Link>
            
            {/* DYNAMISK LOGGA IN / LOGGA UT-KNAPP (Döljs under laddning för att undvika blinkning) */}
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

      {/* ANVÄNDARSTATUS & KREDITRÄKNARE (VISAS DIREKT UNDER HEADERN OM MAN ÄR INLOGGAD) */}
      {user && (
        <div className="bg-[#f4f0eb] border-b border-[#e8e4df] py-2 px-4">
          <div className="max-w-[1100px] mx-auto flex justify-between items-center text-xs text-[#575c58]">
            <span className="truncate">Inloggad som: <strong className="text-[#1a1d1b]">{user.email}</strong></span>
            <span className="bg-white border border-[#e8e4df] font-semibold px-2.5 py-1 rounded-full text-[#2d3732] shrink-0">
              {isTester ? '✨ Testkonto (Obegränsat)' : `⚡ ${credits ?? 0} sökningar kvar`}
            </span>
          </div>
        </div>
      )}

      {/* HUVUDINNEHÅLL */}
      <div className="max-w-[1100px] mx-auto px-6 pt-10 pb-16">
        
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
              ge dig som predikant idéer och uppslag till ditt viktiga arbete med Ordet.<br /><br />
              
              Grundidén med denna webbapp är att användaren själv ska ha den fulla kontrollen över sin predikan eller sitt tal. Det är 
              du som ska sätta samman din predikan från början till slut, med de språkliga nyanser och det tonläge som är ditt, inte AI:n. <br />
              
              Tanken är alltså inte att appen ska användas för att skriva fullständiga predikningar, utan att ge förslag och inspiration. Se det som att 
              appen hjälper dig att slå i bibelkommentarer, predikosamlingar och uppslagsverk precis som i ditt egna 
              fysiska bibliotek där hemma, men att du via denna tjänst nu har tillgång till långt många fler källor som kan ge uppslag och idéer.
            </p>

            <p className="text-[#575c58] text-base leading-relaxed mb-4">
              En annan stor fördel med tjänsten, är att AI-modellen är instruerad att ge förslag och idéer som är teologiskt genomtänkta och relevanta. 
              Instruktionerna har provats fram och tillbaka för att ge de bästa möjliga svaren i en god ton. Du slipper alltså skriva långa
              promtar på egen hand varje gång. Arbetet med att förfina instruktionerna är hela tiden igång.<br /> 
              AI-modellen är i första hand instruerad att passa en svenskkyrklig kontext, med variationer i svaren som tar hänsyn till den bredd som finns där. 
              Med detta sagt är min förhoppning också att pastorer inom andra kristna samfund kan ha nytta av tjänsten.
            </p>

            <p className="text-[#575c58] text-base leading-relaxed mb-4">
              Då du är med i testgruppen får du såklart tillgång till alla funktioner utan kostnad under utvecklingsfasen. Sidan kommer kontinuerligt att 
              uppdateras med nya funktioner och förbättringar under denna tid.
              (Bl a kommer sidan för "pris" fungera den dagen det är dags att lansera tjänsten på allvar.)<br /><br />
              Notera att du som testare först bara får 10 krediter/sökningar när du registrerar dig, men så fort jag får notis om att du är med i testgruppen så 
              justerar jag upp det. <br /><br />
              Jag är tacksam om du inte sprider denna sida till andra ännu, jag vill att vi testar den ordentligt först.<br /><br />
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
                <li>Känns svaren och förslagen du får från AI-modellen relevanta, eller upplever du dem generellt för konstlade?</li>
                <li>Hur korrekt upplever du att denna AI-modell är, går det att lita på svaren? Har du fått rena faktafel? Isåfall var?</li>
                <li>Hur fungerar sidan att navigera på, förstår man intuitivt vilka knappar man ska trycka på etc.</li>
                <li>Vad skulle du vara villig att betala per månad för en sådan här tjänst? 59:- för 30 anrop, 79:- för 60, 99:- för 100, 139:-/mån för 150 anrop? mer? mindre? (Jag måste ta ut någon avgift framåt för att betala för serverplats, få bästa AI-tjänst etc.)</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-[#1a1d1b] font-medium text-lg">
            Välj ett av verktygen nedan för att påbörja din predikoförberedelse, utforska den historiska kontexten, damma av grundtexten eller skapa material för barn och unga.
          </p>
        </section>

        {/* VERKTYGSKORT / HUVUDMENY */}
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#575c58] mb-4 text-center">
            Våra verktyg
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. PREDIKOIDÉER */}
            <Link href="/predikoideer" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">💡</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Predikoidéer →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Dispositioner, metaforer och psalmförslag kopplade till kyrkoårets alla helgdagar.
                  </p>
                </div>
              </div>
            </Link>

            {/* 2. HISTORISKA KOMMENTARER */}
            <Link href="/historik" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">📜</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Historiska kommentarer →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Vetenskapliga teologiska kommentarer och historisk kontext för söndagens texter.
                  </p>
                </div>
              </div>
            </Link>

            {/* 3. RENA GREKISKAN */}
            <Link href="/grekiska" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">🇬🇷</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Rena grekiskan →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Djupgående grundtextanalys och ordförklaringar direkt från nya testamentets grekiska.
                  </p>
                </div>
              </div>
            </Link>

            {/* 4. BARN & UNGA */}
            <Link href="/barn-och-unga" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">🎈</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Barn & unga →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Anpassade andakter, budskap och samarbetslekar för söndagsskola, juniorer och konfa.
                  </p>
                </div>
              </div>
            </Link>

            {/* 5. KASUALTAL */}
            <Link href="/kasualtal" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">🕊️</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Kasualtal →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Verktyg för dop, vigsel och begravning. Skapa personliga tal utifrån anonym kontext.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/predikantpepp" className="group block">
              <div className="p-6 bg-white rounded-2xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex items-start gap-4 h-full">
                <span className="text-3xl p-3 bg-[#f4f0eb] rounded-xl shrink-0">🌱</span>
                <div>
                  <h3 className="text-base font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors mb-1">
                    Predikantpepp →
                  </h3>
                  <p className="text-xs text-[#575c58] leading-relaxed">
                    Pepp, haikun o annat smått och gott.
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

        {/* FEEDBACKSEKTION / FORMULÄR FÖR BETATESTARE */}
        <section className="mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
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
            <input
              type="hidden"
              name="access_key"
              value="cf6ed5dc-1549-4541-925b-3224203bdf57"
            />
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
        <footer className="mt-16 pt-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d] flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <p>© 2026 Patric Ivan. Alla rättigheter förbehållna.</p>
          <div className="flex items-center gap-3">
            <Link href="/integritet" className="hover:text-[#1a1d1b] underline transition-colors">
              Integritetspolicy
            </Link>
            <span>•</span>
            <Link href="/villkor" className="hover:text-[#1a1d1b] underline transition-colors">
              Användar- och köpvillkor
            </Link>
          </div>
        </footer>

      </div>

      {/* MODALEN FÖR INLOGGNING / SKAPA KONTO */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={modalMessage}
        onAuthSuccess={() => fetchProfile()}
      />

    </main>
  );
}