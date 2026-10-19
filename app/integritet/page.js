import Link from 'next/link';

export const metadata = {
  title: 'Integritetspolicy | Predikoverktyg',
  description: 'Information om hur vi hanterar dina personuppgifter och värnar om din integritet.',
};

export default function Integritetspolicy() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1a1d1b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-8 sm:p-12">
        
        {/* Tillbaka-länk */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] transition-colors"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#1a1d1b] mb-4">
          Integritetspolicy
        </h1>
        <p className="text-xs text-[#8c918d] mb-8">
          Senast uppdaterad: Oktober 2026
        </p>

        <div className="space-y-6 text-sm text-[#575c58] leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">1. Inledning</h2>
            <p>
              Din integritet är av yttersta vikt för oss. Denna integritetspolicy beskriver vilka personuppgifter vi samlar in, varför vi samlar in dem, och hur vi hanterar dem när du använder vår tjänst (för predikoförberedelser, teologiska verktyg och assistans inom Svenska kyrkans kontext). Vi följer gällande dataskyddsförordning (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">2. Vilka uppgifter samlar vi in?</h2>
            <p className="mb-2">När du skapar ett konto eller använder tjänsten samlar vi in:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>E-postadress:</strong> Används för att hantera ditt inloggningskonto, skicka återställningslänkar för lösenord och hålla reda på dina tillgängliga anrop/krediter.</li>
              <li><strong>Kontodata & Krediter:</strong> Information om ditt saldo (antal kvarvarande anrop) samt om du är markerad som testkonto.</li>
              <li><strong>Sökdata (Anonymiserat):</strong> För att förbättra tjänsten sparar vi populära sökningar (t.ex. helgdagar och teman), men dessa kopplas aldrig till din personliga e-postadress.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">3. Hur vi använder uppgifterna</h2>
            <p>
              Dina uppgifter används uteslutande för att kunna tillhandahålla, säkra och administrera tjänsten. Vi säljer aldrig dina uppgifter vidare till tredje part och använder dem inte för marknadsföring eller profilering.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">4. Lagring och säkerhet</h2>
            <p>
              Dina kontouppgifter lagras säkert i vår databasleverantör <strong>Supabase</strong>, som uppfyller höga säkerhetskrav för datalagring inom EU/molntjänster. Endast nödvändig information för att hålla dig inloggad sparas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">5. AI-genererat innehåll</h2>
            <p>
              Tjänsten använder avancerad AI-teknologi (Google Gemini API) för att generera förslag på texter, dispositioner och reflektioner. Inmatade texter och frågor skickas till AI-tjänsten för bearbetning i stunden men lagras inte permanent för träning av externa modeller.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">6. Dina rättigheter</h2>
            <p>
              Du har när som helst rätt att begära ut ett utdrag över de uppgifter vi har sparat om dig, eller att få ditt konto och din e-postadress raderade permanent från vårt system. Kontakta oss om du önskar radera ditt konto.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">7. Kontakt</h2>
            <p>
              Om du har frågor kring denna integritetspolicy eller hur vi hanterar personuppgifter är du varmt välkommen att kontakta oss via e-post.
            </p>
          </section>

        </div>

        {/* Slutknapp */}
        <div className="mt-10 pt-6 border-t border-[#e8e4df] text-center">
          <Link 
            href="/" 
            className="inline-block bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Tillbaka till tjänsten
          </Link>
        </div>

      </div>
    </main>
  );
}