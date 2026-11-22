import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeNonNegativeInt(val, fallback = 0) {
  const num = Number(val);
  if (!Number.isFinite(num)) return Math.max(0, fallback);
  return Math.max(0, Math.floor(num));
}

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

async function syncTokensColumnIfNeeded(supabaseAdmin, userId, profile, creditsValue) {
  if (!supabaseAdmin || !userId || !profile) return;
  if (Object.prototype.hasOwnProperty.call(profile, 'tokens')) {
    const safeCredits = sanitizeNonNegativeInt(creditsValue, 0);
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ tokens: safeCredits })
      .eq('id', userId);
    if (error) {
      console.error('Kunde inte synka tokens-kolumnen:', error);
    }
  }
}

async function refundCreditViaRpc(supabaseAdmin, userId, profile, amount = 1) {
  if (!supabaseAdmin || !userId) return null;

  try {
    const { data, error } = await supabaseAdmin.rpc('refund_profile_credit', {
      p_user_id: userId,
      p_amount: amount,
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.ok) {
      console.error('Kunde inte återbetala kredit via RPC:', error || row?.error_code);
      return null;
    }

    const updatedCredits = sanitizeNonNegativeInt(row.remaining_credits, 0);
    await syncTokensColumnIfNeeded(supabaseAdmin, userId, profile, updatedCredits);
    return updatedCredits;
  } catch (err) {
    console.error('Oväntat fel vid refund_profile_credit:', err);
    return null;
  }
}

export async function POST(req) {
  let supabaseAdmin = null;
  let userId = null;
  let profile = null;
  let isTester = false;
  let arPeppSida = false;
  let creditConsumed = false;
  let currentCredits = 0;

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
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { text: 'Din inloggningssession har gått ut. Vänligen logga in igen.' },
        { status: 401 }
      );
    }

    userId = user.id;

    // 3. Hämta användarens profil
    const { data: fetchedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !fetchedProfile) {
      console.error('Söker profil fel:', profileError);
      return NextResponse.json(
        { text: 'Kunde inte hämta din användarprofil och dina tokens.' },
        { status: 400 }
      );
    }

    profile = fetchedProfile;

    const body = await req.json();

    const promptText = body.prompt || body.message || body.question || '';
    const helgdag = body.helgdag || 'Ej angiven helgdag';
    const tema = body.tema || 'Ej angivet tema';
    const valdPredikotext = body.valdPredikotext || 'Ej angiven text';
    const sida = body.sida || 'standard';
    const argang = body.argang || 'argang1';
    const verktyg = body.verktyg || body.promptLabel || body.kategori || 'Sökning';

    arPeppSida = sida === 'predikopepp' || sida === 'predikantpepp';
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    isTester = Boolean(profile.is_tester);

    // Läs av nuvarande vanliga tokens/credits (aldrig under 0)
    const nuvarandeTokens = sanitizeNonNegativeInt(profile.tokens ?? profile.credits ?? 0, 0);
    currentCredits = nuvarandeTokens;

    if (!promptText.trim()) {
      return NextResponse.json(
        { text: 'Ingen fråga skickades med.' },
        { status: 400 }
      );
    }

    // --- KREDIT- OCH GRÄNSKONTROLL ---
    if (arPeppSida) {
      // PREDIKANTPEPP: Dagsgräns på 10 anrop utan kreditavdrag
      let currentPeppCount = sanitizeNonNegativeInt(profile.pepp_count_today || 0, 0);
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
    } else if (!isTester) {
      // ÖVRIGA SIDOR: Atomärt kreditavdrag via RPC innan AI-anrop (aldrig under 0)
      if (nuvarandeTokens <= 0) {
        return NextResponse.json(
          {
            text: 'Dina gratisanrop är slut! Skapa ett nytt konto eller uppgradera för att fortsätta.',
            remainingCredits: 0,
            tokensLeft: 0,
          },
          { status: 403 }
        );
      }

      const { data: creditData, error: creditError } = await supabaseAdmin.rpc(
        'consume_profile_credit',
        {
          p_user_id: user.id,
          p_amount: 1,
        }
      );

      const creditRow = Array.isArray(creditData) ? creditData[0] : creditData;
      if (creditError || !creditRow) {
        console.error('Fel vid consume_profile_credit i /api/generate:', creditError);
        return NextResponse.json(
          {
            text: 'Kunde inte kontrollera eller dra kredit just nu. Försök igen.',
            remainingCredits: nuvarandeTokens,
            tokensLeft: nuvarandeTokens,
          },
          { status: 500 }
        );
      }

      currentCredits = sanitizeNonNegativeInt(creditRow.remaining_credits, nuvarandeTokens);

      if (!creditRow.ok) {
        return NextResponse.json(
          {
            text: 'Dina gratisanrop är slut! Skapa ett nytt konto eller uppgradera för att fortsätta.',
            remainingCredits: currentCredits,
            tokensLeft: currentCredits,
          },
          { status: 403 }
        );
      }

      creditConsumed = true;
      await syncTokensColumnIfNeeded(supabaseAdmin, user.id, profile, currentCredits);
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      if (creditConsumed) {
        const refunded = await refundCreditViaRpc(supabaseAdmin, user.id, profile, 1);
        if (typeof refunded === 'number') currentCredits = refunded;
        creditConsumed = false;
      }
      return NextResponse.json(
        {
          text: 'GEMINI_API_KEY saknas i miljövariablerna på Vercel.',
          remainingCredits: currentCredits,
          tokensLeft: currentCredits,
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const fragaInstruktion = inkluderaFraga
      ? "Avsluta alltid ditt svar med rubriken 'EN REFLEKTERANDE FRÅGA FÖR DIN FÖRBEREDELSE:' följt av en kort, fördjupande och existentiell fråga som kan hjälpa prästen vidare i sin egen tankeprocess."
      : "Avsluta INTE med någon reflekterande fråga.";

    const arPredikoideer = sida === 'predikoideer';
    const inledningsInstruktion = arPredikoideer
      ? `Inled ALLTID ditt svar med följande rad längst upp (bestäm den teologiskt korrekta liturgiska färgen enligt Svenska kyrkans kyrkoår baserat på helgdagen):\nTema: ${tema} | Liturgisk färg: [FÄRG]`
      : `Gå direkt på svaret utan några inledande rader. Du får ABSOLUT INTE skriva ut 'Tema:' eller 'Liturgisk färg:'.`;

    const systemInstruction = `
    Du är en teologisk assistent, samtals- och predikopartner för präster i Svenska kyrkan (med utrymme för en bredare ekumenisk kontext).
    Aktuell helgdag: ${helgdag}
    Tema: ${tema}
    Aktiv predikotext: ${valdPredikotext}

    VIKTIGT OM INLEDNINGEN:
    ${inledningsInstruktion}

    ROLL OCH TONLÄGE:
- Agera som en kollegial, lyhörd och teologiskt skarp sparringpartner för prästen.
- Möt prästen med respekt för det teologiska hantverket. Anpassa tonen så att den ger trygghet och struktur åt den nyutexaminerade prästen, och samtidigt erbjuder teologiskt djup och nya ingångar för den erfarne predikanten.
- Språket ska vara varmt, levande, direkt och anpassat för att tala högt inför en församling. Undvik tung akademisk jargon utan att förlora teologisk skärpa.
- Spegla Svenska kyrkans teologiska tradition med fokus på nåd, befrielse, skapelse och tillit. Undvik moraliserande eller dömande språk.

    TEOLOGISK OCH MÄNSKLIG BREDD:
- Erbjud varierade perspektiv som möter olika teologiska traditioner och församlingskontexter inom Svenska kyrkan (från klassiskt liturgiskt och exegetiskt till kontextuellt, själavårdande och nyskapande).
- Ge utrymme för både det teologiska/existentiella djupet och den konkreta mänskliga vardagen (stress, relationer, sorg, hopp och försoning).
- Se till att exempel, bilder och liknelser speglar hela mänskligheten och fungerar i skiftande församlingsmiljöer.

    SÄRSKILT OM DISPOSITIONER OCH PREDIKOIDÉER:
    När du ger förslag på dispositioner eller predikoingångar, inkludera alltid minst en ingång som är utpräglat själavårdande och vardagsnära. Den ska utgå från en konkret bild eller situation ur en människas liv idag och mjukt koppla den till textens teologiska kärna.

    FORMATERINGSREGLER FÖR SVARET:
- Använd ALDRIG Markdown-symboler eller kodtecken såsom stjärnor (* eller **), brädgårdar (# eller ##), understreck (_) eller citationstecken kring hela svar.
- Håll svaret kärnfullt och välstrukturerat med dubbla radbrytningar mellan stycken för maximal läsbarhet.
- För rubriker: Använd rena VERSALER på en egen rad (t.ex. INLEDNING OCH ANSLAG).
- För listor: Använd enbart enkla siffror (1., 2., 3.) eller rena bindestreck (-).
- Svaret ska levereras som helt ren och städad klartext, redo att kopieras direkt.
    ${fragaInstruktion}
    `.trim();

    let response;
    const maxRetries = 3;

    try {
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
    } catch (geminiErr) {
      if (creditConsumed) {
        const refunded = await refundCreditViaRpc(supabaseAdmin, user.id, profile, 1);
        if (typeof refunded === 'number') currentCredits = refunded;
        creditConsumed = false;
      }
      console.error('Gemini-anropet misslyckades efter återförsök:', geminiErr?.message || geminiErr);
      return NextResponse.json(
        {
          text: 'AI-tjänsten svarade inte som väntat. Din kredit har återlämnats.',
          remainingCredits: currentCredits,
          tokensLeft: isTester ? 999 : currentCredits,
        },
        { status: 502 }
      );
    }

    let aiSvar =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ||
      '';

    if (!aiSvar.trim()) {
      if (creditConsumed) {
        const refunded = await refundCreditViaRpc(supabaseAdmin, user.id, profile, 1);
        if (typeof refunded === 'number') currentCredits = refunded;
        creditConsumed = false;
      }
      return NextResponse.json(
        {
          text: 'AI-tjänsten returnerade ett tomt svar. Din kredit har återlämnats.',
          remainingCredits: currentCredits,
          tokensLeft: isTester ? 999 : currentCredits,
        },
        { status: 502 }
      );
    }

    if (!arPredikoideer) {
      aiSvar = aiSvar
        .replace(/^(\*\*|\*)?Tema:?.*?(Liturgisk färg:?.*?\n|\n)/gi, '')
        .trim();
    }

    return NextResponse.json({
      text: aiSvar,
      remainingCredits: currentCredits,
      tokensLeft: isTester ? 999 : currentCredits,
    });
  } catch (error) {
    if (creditConsumed && !isTester && !arPeppSida) {
      const refunded = await refundCreditViaRpc(supabaseAdmin, userId, profile, 1);
      if (typeof refunded === 'number') currentCredits = refunded;
    }
    console.error('DETALJERAT FEL I API-ROUTE:', error?.message || error);
    return NextResponse.json(
      {
        text: 'Ett oväntat fel uppstod vid genereringen.',
        remainingCredits: currentCredits,
        tokensLeft: isTester ? 999 : currentCredits,
      },
      { status: 500 }
    );
  }
}