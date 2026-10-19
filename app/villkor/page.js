import Link from 'next/link';

export const metadata = {
  title: 'Användar- och köpvillkor | Predikoverktyg',
  description: 'Allmänna villkor, regler för användning samt köp- och betalningsvillkor.',
};

export default function Villkor() {
  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1a1d1b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e8e4df] p-8 sm:p-12">
        
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] transition-colors"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#1a1d1b] mb-4">
          Användar- och köpvillkor
        </h1>
        <p className="text-xs text-[#8c918d] mb-8">
          Senast uppdaterad: Oktober 2026
        </p>

        <div className="space-y-6 text-sm text-[#575c58] leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">1. Allmänna villkor</h2>
            <p>
              Genom att skapa ett konto och använda denna tjänst godkänner du dessa användarvillkor. Tjänsten tillhandahåller digitala verktyg och AI-baserat stöd för predikoförberedelser och teologiskt arbete inom Svenska kyrkans kontext.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">2. Ansvarsfriskrivning för AI-innehåll</h2>
            <p>
              Texter, dispositioner och idéer som genereras av plattformen produceras med hjälp av artificiell intelligens (Google Gemini API). Användaren (predikanten/församlingsmedarbetaren) har alltid det fulla egna ansvaret att granska, teologiskt värdera och godkänna det material som sedan används i predikningar eller kyrkliga sammanhang.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">3. Konto och säkerhet</h2>
            <p>
              Du ansvarar själv för att hålla dina inloggningsuppgifter (e-post och lösenord) säkra. Kontot är personligt och får inte delas med obehöriga. Vi förbehåller oss rätten att stänga av konton som missbrukar tjänsten.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">4. Köp- och betalningsvillkor</h2>
            <p className="mb-2">
              När du köper krediter eller prenumerationer via våra betalningspartner (t.ex. Stripe) gäller följande:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Priser:</strong> Samtliga priser anges i svenska kronor (SEK) inklusive mervärdesskatt (moms) där så är tillämpligt.</li>
              <li><strong>Leverans av krediter:</strong> Krediter läggs till på ditt konto omedelbart efter genomförd och godkänd betalning.</li>
              <li><strong>Ångerrätt för digitala tjänster:</strong> Eftersom krediter och digitala anrop levereras omedelbart och förbrukas i realtid, godkänner du i samband med köp att ångerrätten upphör så snart leveransen har påbörjats.</li>
              <li><strong>Säkerhet vid betalning:</strong> Inga kortuppgifter lagras på våra servrar; alla betalningstransaktioner hanteras krypterat via certifierad betalningsleverantör.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">5. Ändringar av villkoren</h2>
            <p>
              Vi förbehåller oss rätten att när som helst uppdatera dessa villkor. Vid väsentliga förändringar kommer information att lämnas på webbplatsen.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d1b] mb-2">6. Kontakt</h2>
            <p>
              Vid frågor gällande villkoren eller dina köp är du välkommen att kontakta oss via e-post.
            </p>
          </section>

        </div>

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