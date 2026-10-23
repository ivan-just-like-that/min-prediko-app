import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request) {
  try {
    const { email, message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Meddelande krävs' }, { status: 400 });
    }

    // 1. Hämta Authorization-header och initiera Supabase
    const authHeader = request.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { authorization: authHeader } : {},
      },
    });

    // 2. Spara i Supabase
    const { error: dbError } = await supabase
      .from('feedback')
      .insert([{ email, message }]);

    if (dbError) {
      console.error('Supabase DB-fel:', dbError);
      throw new Error(`Databasfel: ${dbError.message}`);
    }

    // 3. Skicka e-postnotis via Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY saknas i miljövariablerna!');
    } else {
      const resend = new Resend(resendApiKey);

      await resend.emails.send({
        from: 'PREDIKA Feedback <onboarding@resend.dev>', // Standard avsändare i Resend
        to: ['paposevic@gmail.com'], // <-- FYLL IN DIN EGEN E-POSTADRESS HÄR!
        subject: 'Ny PREDIKA Feedback (Sparad i Supabase)',
        html: `
          <h3>Ny feedback mottagen!</h3>
          <p><strong>Meddelande:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
            ${message}
          </blockquote>
          <p><strong>Avsändare:</strong> ${email || 'Ej angiven (Inloggad testare)'}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fel i /api/feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}