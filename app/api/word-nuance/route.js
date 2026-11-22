import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

function normalizeModelName(modelName) {
  const cleaned = String(modelName || 'gemini-3.8-flash').trim();
  return cleaned.startsWith('models/') ? cleaned.slice('models/'.length) : cleaned;
}

function getServiceDbClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function buildSystemInstruction(language) {
  const langLabel =
    language === 'hebrew'
      ? 'hebreiska/arameiska (TAHOT / TBESH)'
      : 'koine-grekiska (SBLGNT / TBESG / LSJ)';

  return [
    `Du är en kvalificerad språklig och teologisk assistent för bibelstudium och predikoförberedelse i plattformen PREDIKA.`,
    `Analysera det valda ordet på ${langLabel} utifrån dess exakta grammatiska form i den aktuella versen, dess lexikala bakgrund och versens sammanhang.`,
    `Skriv på tydlig, saklig och levande svenska utan krystad jargong.`,
    `VIKTIGA FORMATERINGSREGLER:`,
    `- Börja direkt med första numrerade rubriken utan inledningsfras som "Här är en analys..." och använd inga "---" avdelare.`,
    `- Använd aldrig markdown-symboler som "#" eller "*" i svaret. Använd vanliga dubbla citattecken ("...") runt citat och översättningar.`,
    `- Skriv varje huvudrubrik som en egen rad med nummer och titel, till exempel: "1. Form och funktion i versen".`,
    `- Under varje rubrik kan du skriva löpande stycken eller korta rader med "Etikett: text" där etiketten står före kolon.`,
    `Strukturera svaret kort och överskådligt i fyra delar:`,
    `1. Form och funktion i versen`,
    `2. Semantisk nyans och rot`,
    `3. Sammanhanget i versen`,
    `4. Prediko- och studieperspektiv`,
    `Var noggrann med att inte påstå saker som inte stöds av underlaget. Om lexikon- eller grammatikdata saknar viss detalj, nämn det kort utan att gissa.`,
  ].join('\n');
}

function buildUserPrompt(payload) {
  const {
    language,
    bookName,
    chapter,
    verse,
    verseText,
    runningTranslation,
    word,
    grammarText,
    lexicon,
  } = payload;

  const surfaceForm = word?.greek || word?.hebrew || '—';
  const transliteration = word?.transliteration || lexicon?.transliteration || '—';
  const lemma = word?.lemma || lexicon?.lemma || '—';
  const gloss = word?.gloss_sv || word?.gloss_en || word?.translation || '—';
  const strongCode = word?.strong_code || word?.strongs || lexicon?.strong_code || '—';

  return [
    `Språk: ${language}`,
    `Bibelställe: ${bookName} ${chapter}:${verse}`,
    verseText ? `Grundtext i versen: ${verseText}` : null,
    runningTranslation ? `Löpande referensöversättning: ${runningTranslation}` : null,
    `Valt ord i texten: ${surfaceForm}`,
    `Lemma: ${lemma}`,
    `Translitteration: ${transliteration}`,
    `Strong-kod: ${strongCode}`,
    `Ord-för-ord-glosa: ${gloss}`,
    `Grammatisk/morfologisk tolkning: ${grammarText || '—'}`,
    lexicon?.short_definition ? `Lexikon (kort definition): ${lexicon.short_definition}` : null,
    lexicon?.root_and_cognates ? `Lexikon (rotord & släktskap): ${lexicon.root_and_cognates}` : null,
    lexicon?.deep_entry
      ? `Lexikon (fördjupad artikel): ${String(lexicon.deep_entry).slice(0, 2500)}`
      : null,
    lexicon?.parallel_passages ? `Parallella ställen: ${lexicon.parallel_passages}` : null,
    `Förklara ordets nyans i just denna vers.`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function refundCreditSafely(serviceClient, userId, isTester) {
  if (isTester || !serviceClient || !userId) return null;

  try {
    const { data, error } = await serviceClient.rpc('refund_profile_credit', {
      p_user_id: userId,
      p_amount: 1,
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.ok) {
      console.error('Kunde inte återbetala kredit:', error || row?.error_code);
      return null;
    }

    return typeof row.remaining_credits === 'number' ? row.remaining_credits : null;
  } catch (err) {
    console.error('Oväntat fel vid kreditåterbetalning:', err);
    return null;
  }
}

export async function POST(req) {
  let serviceDb = null;
  let userId = null;
  let isTester = false;
  let creditConsumed = false;

  try {
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY saknas på servern.' },
        { status: 500 }
      );
    }

    serviceDb = getServiceDbClient();
    if (!serviceDb) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY eller NEXT_PUBLIC_SUPABASE_URL saknas på servern.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return NextResponse.json(
        { error: 'Du behöver vara inloggad för att använda AI-fördjupningen.' },
        { status: 401 }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Ogiltig eller utgången session. Logga in på nytt.' },
        { status: 401 }
      );
    }

    userId = user.id;

    // 1. Dra 1 kredit atomärt i databasen innan AI-anropet
    const { data: creditData, error: creditError } = await serviceDb.rpc(
      'consume_profile_credit',
      {
        p_user_id: userId,
        p_amount: 1,
      }
    );

    const creditRow = Array.isArray(creditData) ? creditData[0] : creditData;
    if (creditError || !creditRow) {
      console.error('Fel vid consume_profile_credit:', creditError);
      return NextResponse.json(
        { error: 'Kunde inte kontrollera eller dra kredit från profilen.' },
        { status: 500 }
      );
    }

    isTester = Boolean(creditRow.is_tester);

    if (!creditRow.ok) {
      if (creditRow.error_code === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json(
          {
            error: 'Du har inga krediter kvar för AI-analys.',
            remainingCredits: creditRow.remaining_credits ?? 0,
            isTester,
          },
          { status: 402 }
        );
      }

      if (creditRow.error_code === 'PROFILE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Användarprofilen hittades inte.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Kreditavdraget kunde inte genomföras.' },
        { status: 400 }
      );
    }

    creditConsumed = !isTester;
    let remainingCredits =
      typeof creditRow.remaining_credits === 'number' ? creditRow.remaining_credits : 0;

    // 2. Läs begäran och anropa Gemini med timeout
    const body = await req.json();
    const activeModel = normalizeModelName(geminiModel);

    let geminiRes;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: buildSystemInstruction(body.language || 'greek') }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: buildUserPrompt(body) }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
            },
          }),
        }
      );
    } catch (fetchErr) {
      const refundedCredits = await refundCreditSafely(serviceDb, userId, isTester);
      if (typeof refundedCredits === 'number') {
        remainingCredits = refundedCredits;
      }
      creditConsumed = false;

      const isTimeout = fetchErr?.name === 'TimeoutError' || fetchErr?.name === 'AbortError';
      return NextResponse.json(
        {
          error: isTimeout
            ? 'AI-tjänsten tog för lång tid att svara. Din kredit har återlämnats.'
            : 'Nätverksfel vid kontakt med AI-tjänsten. Din kredit har återlämnats.',
          remainingCredits,
          isTester,
        },
        { status: isTimeout ? 504 : 502 }
      );
    }

    const geminiJson = await geminiRes.json().catch(() => null);
    if (!geminiRes.ok) {
      const refundedCredits = await refundCreditSafely(serviceDb, userId, isTester);
      if (typeof refundedCredits === 'number') {
        remainingCredits = refundedCredits;
      }
      creditConsumed = false;

      return NextResponse.json(
        {
          error:
            (geminiJson?.error?.message
              ? `${geminiJson.error.message} (Krediten har återlämnats.)`
              : 'Kunde inte hämta svar från Gemini. Krediten har återlämnats.'),
          remainingCredits,
          isTester,
        },
        { status: 502 }
      );
    }

    const parts = geminiJson?.candidates?.[0]?.content?.parts || [];
    const explanation = parts
      .map((p) => p?.text || '')
      .join('')
      .trim();

    if (!explanation) {
      const refundedCredits = await refundCreditSafely(serviceDb, userId, isTester);
      if (typeof refundedCredits === 'number') {
        remainingCredits = refundedCredits;
      }
      creditConsumed = false;

      return NextResponse.json(
        {
          error: 'AI-tjänsten returnerade ett tomt svar. Din kredit har återlämnats.',
          remainingCredits,
          isTester,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      explanation,
      remainingCredits,
      isTester,
    });
  } catch (err) {
    if (creditConsumed) {
      await refundCreditSafely(serviceDb, userId, isTester);
    }
    console.error('Fel i /api/word-nuance:', err);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod vid AI-fördjupningen.' },
      { status: 500 }
    );
  }
}