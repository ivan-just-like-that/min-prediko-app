'use client';
import Link from 'next/link';

export default function StartSida() {
  return (
    <main style={{ width: '85%', maxWidth: '1000px', minHeight: '100vh', margin: '0 auto', padding: '20px 40px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#000000', boxSizing: 'border-box' }}>
      
      {/* TOPPMENY / HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #000000', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: '#000000' }}>
          Predikoassistenten - beta
        </h1>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/pris" style={{ color: '#000000', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
            Pris
          </Link>
          <Link href="/login" style={{ padding: '8px 16px', backgroundColor: '#000000', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            Logga in
          </Link>
        </nav>
      </header>

      {/* INTROTEXT */}
      <section style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '#000000' }}>
          Välkommen till beta-versionen av Predikoassistenten!
        </h2>
        <p style={{ fontSize: '16px', color: '#555555', maxWidth: '650px', margin: '0 auto', lineHeight: '1.5' }}>
          Så roligt att du vill vara med och testa Predikoassistenten! Det är en AI-driven tjänst vars idé är att
        ge dig som predikant idéer och uppslag till ditt viktiga arbete med Ordet. Tanken är alltså inte att den ska användas för
        att skriva fullständiga predikningar från början till slut, utan att ge dig förslag och inspiration. Ja, du kan iofs be denna AI:n att skriva en hel predikan, men som sagt,
        meningen är att du själv ska ha kontrollen och sätta samman slutprodukten med 
        din personliga stil, de nyanser och det tonläge som är ditt. <br />
          Då du är med i testgruppen får du såklart tillgång till alla funktioner utan kostnad under utvecklingsfasen. <br />
          Sidan kommer kontinuerligt att uppdateras med nya funktioner och förbättringar under denna tid. T ex är sidan inte mobilanpassad än.<br /><br />
          
          Kom ihåg att alla funktioner drivs av en AI-modell (för närvarande gemini-3.8-flash) och ingen modell är perfekt, i meningen 
          att allt blir 100% rätt. Det är t ex ett känt fenomen att modellerna ibland 
          "hallucinerar" och hittar på egna svar, så glöm inte att faktakolla ev info du ska använda. <br /><br />
          
        Ok, sätt igång att pröva och kom med förslag på förbättringar, några frågor jag tänker på är bl a: <br />
        - saknas någon funktion, isåfall vilken? <br />
        - känns svaren och förslagen relevanta, eller känns de generellt för konstlade? <br />
        - hur korrekt upplever du att denna AI-modell är, går det att lita på svaren? <br />
        - hur fungerar sidan att navigera på, förstår man intuivit vilka knappar man ska trycka på etc. <br />
        - vad skulle du vara villig att betala per månad för en färdigutvecklad tjänst? 49:-, 79:- eller 99:-/mån? mer? mindre? (Jag är tvungen att ta ut någon avgift 
        framåt för att betala för serverplats, få en AI-tjänst som är pålitlig mm...)<br /><br />


          Välj ett av verktygen nedan för att påbörja din predikoförberedelse, fördjupa dig i grundtexten eller utforska den historiska kontexten. <br /><br />

        </p>
      </section>

      {/* VERKTYGSKORT (3 SPALTER) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
        
        {/* KORT 1: PREDIKOIDÉER */}
        <Link href="/predikoideer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            height: '100%',
            padding: '24px',
            border: '1px solid #000000',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease'
          }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>💡</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 10px 0', color: '#000000' }}>
                Predikoidéer
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#444444', margin: 0 }}>
                Praktiska verktyg som förslag på disposition till din predikan. Här kan du också få psalmförslag till helgdagen.
              </p>
            </div>
            <span style={{ marginTop: '20px', fontSize: '14px', fontWeight: 'bold', color: '#0070f3' }}>
              Öppna verktyget →
            </span>
          </div>
        </Link>

        {/* KORT 2: HISTORISKA KOMMENTARER */}
        <Link href="/historik" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            height: '100%',
            padding: '24px',
            border: '1px solid #000000',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>📜</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 10px 0', color: '#000000' }}>
                Historiska kommentarer
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#444444', margin: 0 }}>
                Fördjupning i den historiska kontexten.
              </p>
            </div>
            <span style={{ marginTop: '20px', fontSize: '14px', fontWeight: 'bold', color: '#0070f3' }}>
              Öppna verktyget →
            </span>
          </div>
        </Link>

        {/* KORT 3: RENA GREKISKAN */}
        <Link href="/grekiska" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            height: '100%',
            padding: '24px',
            border: '1px solid #000000',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🇬🇷</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 10px 0', color: '#000000' }}>
                Rena grekiskan
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#444444', margin: 0 }}>
                Varför inte damma av dina kunskaper i grekiska? Bästa sättet att komma nära textens betydelse.
              </p>
            </div>
            <span style={{ marginTop: '20px', fontSize: '14px', fontWeight: 'bold', color: '#0070f3' }}>
              Öppna verktyget →
            </span>
          </div>
        </Link>

      </div>

        {/* FOOTER */}
      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #cccccc', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
        © 2026 Patric Ivan. Alla rättigheter förbehållna. <br />
      </footer>

    </main>
  );
}