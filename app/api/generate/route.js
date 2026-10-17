import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const body = await req.json();

    const promptText = body.prompt || body.message || body.question || '';
    const helgdag = body.helgdag || 'Ej angiven helgdag';
    const tema = body.tema || 'Ej angivet tema';
    const valdPredikotext = body.valdPredikotext || 'Ej angiven text';
    
    // Identifiera vilken sida anropet kommer ifrån
    const sida = body.sida || 'standard';
    
    // Sätt lägre temperatur för faktatunga/språkliga sidor (0.3) och 0.7 för övriga
    const arFaktasida = sida === 'grekiska' || sida === 'historik';
    const valdTemp = arFaktasida ? 0.3 : 0.7;

    // Ny flagga: sätts till true som standard, men kan stängas av per anrop
    const inkluderaFraga = body.inkluderaFraga ?? true;

    if (!promptText.trim()) {
      return NextResponse.json(
        { text: 'Ingen fråga skickades med.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { text: 'GEMINI_API_KEY saknas i miljövariablerna på Vercel.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Dynamisk instruktion beroende på om vi vill ha frågan i slutet eller inte
    const fragaInstruktion = inkluderaFraga
      ? "Avsluta alltid ditt svar med rubriken 'En reflekterande fråga för din förberedelse:' följt av en kort men fördjupande, existentiell eller praktisk fråga som kan hjälpa prästen vidare i sin egen tankeprocess."
      : "Avsluta INTE med någon reflekterande fråga.";

    const systemInstruction = `
Du är en teologisk assistent och samtals- och predikopartner för präster i Svenska kyrkan.
Aktuell helgdag: ${helgdag}
Tema: ${tema}
Aktiv predikotext för tillfället: ${valdPredikotext}

VIKTIGT OM INLEDNINGEN:
Inled ALLTID ditt svar med följande rad längst upp (bestäm den teologiskt korrekta liturgiska färgen enligt Svenska kyrkans kyrkoår baserat på helgdagen):
**Tema:** ${tema} | **Liturgisk färg:** [FÄRG]

Svara hjälpsamt, teologiskt genomtänkt, koncist och direkt på prästens önskemål utan att be dem upprepa texten eller helgdagen.

Ge teologiskt fördjupade men nutidsrelevanta perspektiv. Balansera exegetisk noggrannhet med själavårdande och praktisk tillämpning för församlingens vardag.

SÄRSKILT OM DISPOSITIONER OCH PREDIKOIDÉER:
När du ger förslag på dispositioner eller predikoingångar, se till att ALLTID inkludera minst ett förslag som är utpräglat själavårdande och vardagsnära. Det förslaget ska ta sin utgångspunkt i en konkret bild eller situation från en människas liv idag (t.ex. relationer, stress, ensamhet, förlåtelse eller hopp i vardagen) och koppla den mjukt till predikotextens budskap.

VIKTIGT:
- Håll svaret kärnfullt och välstrukturerat med tydliga rubriker och punkter. Undvik onödigt fyllnadsspråk.
- Använd INGA HTML-taggar (som <h3>, <p>, <b> osv.). Använd ren Markdown (# eller **fetstil** för rubriker).
- ${fragaInstruktion}
    `.trim();

    let response;
    let maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction: systemInstruction,
            temperature: valdTemp,
          },
        });
        break;
      } catch (err) {
        console.warn(`Försök ${attempt} misslyckades:`, err.message);
        if (attempt === maxRetries) throw err;
        await delay(1500 * attempt);
      }
    }

    const aiSvar = 
      response?.text || 
      response?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || 
      'Inget svar genererades.';

    return NextResponse.json({ text: aiSvar });
  } catch (error) {
    console.error('DETALJERAT FEL I API-ROUTE:', error?.message || error);

    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      return NextResponse.json(
        { text: 'Fel: AI-modellen kunde inte hittas.' },
        { status: 404 }
      );
    }

    if (error?.message?.includes('API key') || error?.message?.includes('403')) {
      return NextResponse.json(
        { text: 'Fel: Ogiltig API-nyckel eller saknad behörighet.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { text: 'AI-tjänsten är för tillfället hårt belastad. Prova att trycka på knappen igen om några sekunder!' },
      { status: 500 }
    );
  }
}