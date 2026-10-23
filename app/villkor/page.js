import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  Languages, 
  Smile, 
  Feather, 
  BookMarked, 
  Sprout, 
  TrendingUp,
  FileText,
  ChevronDown
} from 'lucide-react';

export const metadata = {
  title: 'Användar- och köpvillkor | PREDIKA',
  description: 'Allmänna villkor, regler för användning samt köp- och betalningsvillkor.',
};

export default function Villkor() {
  const verktygLista = [
    { name: 'Predikoidéer', desc: 'Dispositioner & uppslag till söndagen', href: '/predikoideer', icon: Sparkles },
    { name: 'Historiska kommentarer', desc: 'Teologisk kontext & bakgrund', href: '/historik', icon: BookOpen },
    { name: 'Rena grekiskan', desc: 'Grundtextanalys för Nya Testamentet', href: '/grekiska', icon: Languages },
    { name: 'Barn & unga', desc: 'Andakter, lektioner & konfa-material', href: '/barn-och-unga', icon: Smile },
    { name: 'Kasualtal', desc: 'Dop, vigsel & begravning', href: '/kasualtal', icon: Feather },
    { name: 'Bibelstudieguiden', desc: 'Samtalsfrågor för grupper', href: '/bibelstudium', icon: BookMarked },
    { name: 'Predikantpepp', desc: 'Inspiration & reflektion', href: '/predikantpepp', icon: Sprout },
    { name: 'Populärt', desc: 'Se vad andra utforskar', href: '/populart', icon: TrendingUp },
  ];

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
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors">
                    Verktyg
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-200" />
                  </button>

                  <div className="hidden group-hover:grid absolute top-full left-0 w-80 bg-white rounded-2xl border border-[#e8e4df] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {verktygLista.map((v) => {
                      const Icon = v.icon;
                      return (
                        <Link 
                          key={v.href} 
                          href={v.href}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8f5] transition-colors group/item"
                        >
                          <div className="p-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-[#2d3732] group-hover/item:bg-[#2d3732] group-hover/item:text-white transition-colors shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1a1d1b] group-hover/item:text-[#2d3732] transition-colors flex items-center gap-1">
                              {v.name}
                            </div>
                            <div className="text-[11px] text-[#8c918d] leading-snug">{v.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <Link href="/om" className="px-3 py-2 text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] rounded-lg transition-colors">
                  Om
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-xs font-semibold text-[#575c58] hover:text-[#1a1d1b] transition-colors"
              >
                ← Tillbaka till start
              </Link>
            </div>
          </div>
        </header>

        {/* HUVUDINNEHÅLL */}
        <main className="max-w-3xl mx-auto px-6 pt-12 pb-16">
          <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 sm:p-12">
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e8e4df] flex items-center justify-center text-[#2d3732] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1d1b]">
                Användar- och köpvillkor
              </h1>
            </div>
            
            <p className="text-xs text-[#8c918d] mb-8 border-b border-[#e8e4df] pb-4">
              Senast uppdaterad: Oktober 2026
            </p>

            <div className="space-y-6 text-xs sm:text-sm text-[#575c58] leading-relaxed">
              
              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  1. Allmänna villkor
                </h2>
                <p>
                  Genom att skapa ett konto och använda tjänsten <strong>PREDIKA</strong> godkänner du dessa användarvillkor. Tjänsten tillhandahåller digitala verktyg och AI-baserat stöd för predikoförberedelser, teologiskt arbete och undervisning inom Svenska kyrkans kontext.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  2. Ansvarsfriskrivning för AI-innehåll
                </h2>
                <p>
                  Texter, dispositioner och idéer som genereras av plattformen produceras med hjälp av artificiell intelligens (Google Gemini API). Användaren (predikanten eller församlingsmedarbetaren) har alltid det fulla ansvaret att själv granska, teologiskt värdera och godkänna det material som sedan används i predikningar eller kyrkliga sammanhang.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  3. Konto och säkerhet
                </h2>
                <p>
                  Du ansvarar själv för att hålla dina inloggningsuppgifter (e-post och lösenord) säkra. Kontot är personligt och får inte delas med obehöriga. Vi förbehåller oss rätten att stänga av konton som missbrukar tjänsten.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  4. Köp- och betalningsvillkor
                </h2>
                <p className="mb-2">
                  När du köper krediter eller prenumerationer via våra betalningspartner (t.ex. Stripe) gäller följande:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#575c58]">
                  <li><strong className="text-[#1a1d1b]">Priser:</strong> Samtliga priser anges i svenska kronor (SEK) inklusive mervärdesskatt (moms) där så är tillämpligt.</li>
                  <li><strong className="text-[#1a1d1b]">Leverans av krediter:</strong> Krediter läggs till på ditt konto omedelbart efter genomförd och godkänd betalning.</li>
                  <li><strong className="text-[#1a1d1b]">Ångerrätt för digitala tjänster:</strong> Eftersom krediter och digitala anrop levereras omedelbart och förbrukas i realtid, godkänner du i samband med köp att ångerrätten upphör så snart leveransen har påbörjats.</li>
                  <li><strong className="text-[#1a1d1b]">Säkerhet vid betalning:</strong> Inga kortuppgifter lagras på våra servrar; alla betalningstransaktioner hanteras krypterat via certifierad betalningsleverantör.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  5. Ändringar av villkoren
                </h2>
                <p>
                  Vi förbehåller oss rätten att när som helst uppdatera dessa villkor. Vid väsentliga förändringar kommer information att lämnas på webbplatsen.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-[#1a1d1b] mb-2">
                  6. Kontakt
                </h2>
                <p>
                  Vid frågor gällande villkoren eller dina köp är du varmt välkommen att kontakta oss via e-post på <span className="font-medium text-[#1a1d1b]">ivan@patricivan.se</span>.
                </p>
              </section>

            </div>

            {/* Slutknapp */}
            <div className="mt-10 pt-6 border-t border-[#e8e4df] text-center">
              <Link 
                href="/" 
                className="inline-block bg-[#2d3732] hover:bg-[#1f2723] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                Tillbaka till tjänsten
              </Link>
            </div>

          </div>
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

    </div>
  );
}