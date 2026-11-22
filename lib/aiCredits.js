import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const defaultGeminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export function normalizeModelName(modelName) {
  const cleaned = String(modelName || defaultGeminiModel).trim();
  return cleaned.startsWith('models/') ? cleaned.slice('models/'.length) : cleaned;
}

export function getServiceDbClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function refundProfileCredit(serviceDb, userId, amount = 1, isTester = false) {
  if (isTester || !serviceDb || !userId) return null;

  try {
    const { data, error } = await serviceDb.rpc('refund_profile_credit', {
      p_user_id: userId,
      p_amount: amount,
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row?.ok) {
      console.error('Kunde inte återbetala kredit:', error || row?.error_code);
      return null;
    }

    return typeof row.remaining_credits === 'number' ? row.remaining_credits : null;
  } catch (err) {
    console.error('Oväntat fel vid refund_profile_credit:', err);
    return null;
  }
}

/**
 * Verifierar Bearer-token, drar krediter atomärt via RPC före Gemini-anrop
 * och återbetalar automatiskt om nätverk, timeout eller Gemini fallerar.
 */
export async function runProtectedGeminiRequest({
  req,
  systemInstruction,
  userPrompt,
  creditCost = 1,
  model = defaultGeminiModel,
  temperature = 0.4,
  timeoutMs = 25000,
  parseText = (json) =>
    (json?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim(),
}) {
  if (!geminiApiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'GEMINI_API_KEY saknas på servern.' },
        { status: 500 }
      ),
    };
  }

  const serviceDb = getServiceDbClient();
  if (!serviceDb || !supabaseAnonKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Supabase-nycklar saknas på servern för kreditkontroll.' },
        { status: 500 }
      ),
    };
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Du behöver vara inloggad för att använda AI-funktionen.' },
        { status: 401 }
      ),
    };
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Ogiltig eller utgången session. Logga in på nytt.' },
        { status: 401 }
      ),
    };
  }

  const { data: creditData, error: creditError } = await serviceDb.rpc(
    'consume_profile_credit',
    {
      p_user_id: user.id,
      p_amount: creditCost,
    }
  );

  const creditRow = Array.isArray(creditData) ? creditData[0] : creditData;
  if (creditError || !creditRow) {
    console.error('Fel vid consume_profile_credit:', creditError);
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Kunde inte kontrollera eller dra kredit från profilen.' },
        { status: 500 }
      ),
    };
  }

  const isTester = Boolean(creditRow.is_tester);
  let remainingCredits =
    typeof creditRow.remaining_credits === 'number' ? creditRow.remaining_credits : 0;

  if (!creditRow.ok) {
    if (creditRow.error_code === 'INSUFFICIENT_CREDITS') {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: 'Du har inga krediter kvar för denna AI-funktion.',
            remainingCredits,
            isTester,
          },
          { status: 402 }
        ),
      };
    }

    if (creditRow.error_code === 'PROFILE_NOT_FOUND') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Användarprofilen hittades inte.' },
          { status: 404 }
        ),
      };
    }

    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Kreditavdraget kunde inte genomföras.' },
        { status: 400 }
      ),
    };
  }

  const activeModel = normalizeModelName(model);

  let geminiRes;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature,
          },
        }),
      }
    );
  } catch (fetchErr) {
    const refunded = await refundProfileCredit(serviceDb, user.id, creditCost, isTester);
    if (typeof refunded === 'number') remainingCredits = refunded;

    const isTimeout = fetchErr?.name === 'TimeoutError' || fetchErr?.name === 'AbortError';
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: isTimeout
            ? 'AI-tjänsten tog för lång tid att svara. Din kredit har återlämnats.'
            : 'Nätverksfel vid kontakt med AI-tjänsten. Din kredit har återlämnats.',
          remainingCredits,
          isTester,
        },
        { status: isTimeout ? 504 : 502 }
      ),
    };
  }

  const geminiJson = await geminiRes.json().catch(() => null);
  if (!geminiRes.ok) {
    const refunded = await refundProfileCredit(serviceDb, user.id, creditCost, isTester);
    if (typeof refunded === 'number') remainingCredits = refunded;

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: geminiJson?.error?.message
            ? `${geminiJson.error.message} (Krediten har återlämnats.)`
            : 'Kunde inte hämta svar från Gemini. Krediten har återlämnats.',
          remainingCredits,
          isTester,
        },
        { status: 502 }
      ),
    };
  }

  const text = parseText(geminiJson);
  if (!text) {
    const refunded = await refundProfileCredit(serviceDb, user.id, creditCost, isTester);
    if (typeof refunded === 'number') remainingCredits = refunded;

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'AI-tjänsten returnerade ett tomt svar. Din kredit har återlämnats.',
          remainingCredits,
          isTester,
        },
        { status: 502 }
      ),
    };
  }

  return {
    ok: true,
    text,
    rawJson: geminiJson,
    remainingCredits,
    isTester,
    userId: user.id,
    serviceDb,
  };
}