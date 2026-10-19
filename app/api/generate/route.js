import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- RATE LIMITING (Max 10 anrop per minut per IP) ---
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minut
  const maxRequests = 10;      // Max 10 anrop per minut per IP

  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return true;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return false;
}

export async function POST(req) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { text: 'Du har gjort för många anrop just nu. Vänta en minut och försök igen.' },
        { status: 429 }
      );
    }

    // 2. Autentisering via Supabase Header Token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { text: 'Du måste vara inloggad för att göra anrop.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { text: 'Din inloggningssession har gått ut. Vänligen logga in igen.' },
        { status: 401 }
      );
    }

    // 3. Hämta användarens profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Söker profil fel:', profileError);
      return NextResponse.json(
        { text: 'Kunde inte hämta din användarprofil och dina tokens.' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const promptText = body.prompt || body.message || body.question || '';
    const helgdag = body.helgdag || 'Ej angiven helgdag';
    const tema = body.tema || 'Ej angivet tema';
    const valdPredikotext = body.valdPredikotext || 'Ej angiven text';
    const sida = body.sida || 'standard';
    const argang = body.argang || 'argang1';
    const verktyg = body.verktyg || body.promptLabel || body.kategori || 'Sökning';

    const arPeppSida = sida === 'predikopepp' || sida === 'predikantpepp';
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const isTester = profile.is_tester || false;

    // Läs av nuvarande vanliga tokens/credits
    const nuvarandeTokens = profile.tokens ?? profile.credits ?? 0;

    // --- KREDIT- OCH GRÄNSKONTROLL ---
    if (arPeppSida) {
      // PREDIKANTPEPP: Dagsgräns på 10 anrop utan kreditavdrag
      let currentPeppCount = profile.pepp_count_today || 0;
      const lastPeppDate = profile.last_pepp_date;

      if (lastPeppDate !== todayStr) {
        currentPeppCount = 0;
      }

      if (!isTester && currentPeppCount >= 10) {
        return NextResponse.json(
          { text: 'Du har nått dagsgränsen på 10 pepp-anrop för idag. Välkommen åter imorgon!' },
          { status: 429 }
        );
      }

      // Uppdatera pepp-räknaren för dagen
      if (!isTester) {
        await supabaseAdmin
          .from('profiles')
          .update({
            pepp_count_today: currentPeppCount + 1,
            last_pepp_date: todayStr,
          })
          .eq('id', user.id);
      }
    } else {
      // ÖVRIGA SIDOR: Kräv och dra vanliga krediter
      if (!isTester && nuvarandeTokens <= 0) {
        return NextResponse.json(
          { text: 'Dina gratisanrop är slut! Skapa ett nytt konto eller uppgradera för att fortsätta.' },
          { status: 403 }
        );
      }
    }

    // 4. Spara anonyma sökdata (exkludera pepp-sidor)
    if (!arPeppSida && (helgdag !== 'Ej angiven helgdag' || valdPredikotext !== 'Ej angiven text')) {
      supabase
        .from('popular_searches')
        .insert([
          {
            sida,
            helgdag,
            tema,
            argang,
            predikotext: valdPredikotext,
            verktyg,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Fel vid sparning till Supabase:', error);
        });
    }

    const arGrekiskaEllerHistorik = 
      sida === 'grekiska' || 
      sida === 'historik' || 
      sida === 'historisk-kommentar' ||
      verktyg?.toLowerCase().includes('grekisk') ||
      verktyg?.toLowerCase().includes('historik');

    const valdTemp = arGrekiskaEllerHistorik ? 0.3 : 0.7;
    const valdThinkingLevel = arGrekiskaEllerHistorik ? 'medium' : 'low';
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

    const fragaInstruktion = inkluderaFraga
      ? "Avsluta alltid ditt svar med rubriken 'En reflekterande fråga för din förberedelse:' följt av en kort men fördjupande, existentiell eller praktisk fråga som kan hjälpa prästen vidare i sin egen tankeprocess."
      : "Avsluta INTE med någon reflekterande fråga.";

    const arPredikoideer = sida === 'predikoideer';
    const inledningsInstruktion = arPredikoideer
      ? `Inled ALLTID ditt svar med följande rad längst upp (bestäm den teologiskt korrekta liturgiska färgen enligt Svenska kyrkans kyrkoår baserat på helgdagen):\n**Tema:** ${tema} | **Liturgisk färg:** [FÄRG]`
      : `Gå direkt på svaret utan några inledande rader. Du får ABSOLUT INTE skriva ut 'Tema:' eller 'Liturgisk färg:'.`;

    const systemInstruction = `
Du är en teologisk assistent och samtals- och predikopartner för präster i Svenska kyrkan.
Aktuell helgdag: ${helgdag}
Tema: ${tema}
Aktiv predikotext för tillfället: ${valdPredikotext}

VIKTIGT OM INLEDNINGEN:
${inledningsInstruktion}

Svara därefter hjälpsamt, teologiskt genomtänkt, koncist och direkt på prästens önskemål utan att be dem upprepa texten eller helgdagen.

Ge teologiskt fördjupade men nutidsrelevanta perspektiv. Balansera exegetisk noggrannhet med själavårdande och praktisk tillämpning för församlingens vardag.

SÄRSKILT OM DISPOSITIONER OCH PREDIKOIDÉER:
När du ger förslag på dispositioner eller predikoingångar, se till att ALLTID inkludera minst ett förslag som är utpräglat själavårdande och vardagsnära. Det förslaget ska ta sin utgångspunkt i en konkret bild eller situation från en människas liv idag (t.ex. relationer, stress, ensamhet, förlåtelse eller hopp i vardagen) och koppla den mjukt till predikotextens budskap.

VIKTIGT:
- Håll svaret kärnfullt och välstrukturerat med tydliga rubriker och punkter. Undvik onödigt fyllnadsspråk.
- Använd INGA HTML-taggar. Använd ren Markdown (# eller **fetstil** för rubriker).
${fragaInstruktion}
    `.trim();

    let response;
    let maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            temperature: valdTemp,
            thinkingConfig: {
              thinkingLevel: valdThinkingLevel,
            },
          },
        });
        break;
      } catch (err) {
        console.warn(`Försök ${attempt} misslyckades:`, err.message);
        if (attempt === maxRetries) throw err;
        await delay(1500 * attempt);
      }
    }

    let aiSvar =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ||
      'Inget svar genererades.';

    if (!arPredikoideer) {
      aiSvar = aiSvar
        .replace(/^(\*\*|\*)?Tema:?.*?(Liturgisk färg:?.*?\n|\n)/gi, '')
        .trim();
    }

    // 5. Minska tokens med 1 om det inte är ett testkonto och inte gäller predikantpepp
    let nyTokenMängd = nuvarandeTokens;
    if (!isTester && !arPeppSida) {
      nyTokenMängd = Math.max(0, nuvarandeTokens - 1);
      
      const updateData = profile.tokens !== undefined 
        ? { tokens: nyTokenMängd } 
        : { credits: nyTokenMängd };

      await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
    }

    return NextResponse.json({ 
      text: aiSvar,
      tokensLeft: isTester ? 999 : nyTokenMängd
    });

  } catch (error) {
    console.error('DETALJERAT FEL I API-ROUTE:', error?.message || error);
    return NextResponse.json(
      { text: 'Ett oväntat fel uppstod vid genereringen.' },
      { status: 500 }
    );
  }
}