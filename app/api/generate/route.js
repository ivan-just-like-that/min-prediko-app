import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

// Hjälpfunktion för att vänta ett antal millisekunder
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const body = await req.json();

    const promptText = body.prompt || body.message || body.question || '';
    const helgdag = body.helgdag || 'Ej angiven helgdag';
    const tema = body.tema || 'Ej angivet tema';
    const valdPredikotext = body.valdPredikotext || 'Ej angiven text';

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

    const systemInstruction = `
Du är en teologisk assistent och samtals- och predikopartner för präster i Svenska kyrkan.
Aktuell helgdag: ${helgdag}
Tema: ${tema}
Aktiv predikotext för tillfället: ${valdPredikotext}

Svara hjälpsamt, teologiskt genomtänkt och direkt på prästens önskemål utan att be dem upprepa texten eller helgdagen.

Ge teologiskt fördjupade men nutidsrelevanta perspektiv. Balansera exegetisk noggrannhet med själavårdande och praktisk tillämpning för församlingens vardag.

VIKTIGT: Använd INGA HTML-taggar (som <h3>, <p>, <b> osv.) i dina svar. Använd ren text och vanliga blankrader eller stjärnor/bindestreck för rubriker och listor.

Formatera texten med ren Markdown (t.ex. # eller **fetstil** för rubriker och markerat innehåll) men helt utan HTML-kod.

Avsluta alltid ditt svar med rubriken 'En reflekterande fråga för din förberedelse:' följt av en kort men fördjupande, existentiell eller praktisk fråga som kan hjälpa prästen vidare i sin egen tankeprocess och knyter an till församlingens vardag.


    `.trim();

    // Försök anropa AI:n upp till 3 gånger om den är överbelastad
    let response;
    let maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });
        break; // Om anropet lyckades, bryt loopen!
      } catch (err) {
        console.warn(`Försök ${attempt} misslyckades:`, err.message);
        if (attempt === maxRetries) throw err; // Kasta felet vidare om sista försöket misslyckades
        await delay(1500 * attempt); // Vänta 1.5s, sedan 3s inför nästa försök
      }
    }

    const aiSvar = response?.text || 'Inget svar genererades.';

    return NextResponse.json({ text: aiSvar });
  } catch (error) {
    console.error('Fel i API-route:', error);
    return NextResponse.json(
      { text: 'AI-tjänsten är för tillfället hårt belastad. Prova att trycka på knappen igen om några sekunder!' },
      { status: 500 }
    );
  }
}