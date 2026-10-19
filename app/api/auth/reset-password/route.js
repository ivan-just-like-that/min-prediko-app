import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Extra säkerhetskoll så vi ser exakt vad som saknas i loggarna
    if (!apiKey) throw new Error("RESEND_API_KEY saknas!");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase-nycklar saknas!");

    const resend = new Resend(apiKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-postadress krävs.' }, { status: 400 });
    }

    // 1. Skapa återställningslänk via Supabase Admin
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin')}/`,
      },
    });

    if (error) throw error;

    const actionLink = data.properties.action_link;

    // 2. Skicka mailet via Resend
    const resendResponse = await resend.emails.send({
      from: 'Predikoassistenten <noreply@patricivan.se>',
      to: email,
      subject: 'Återställ ditt lösenord - Predikoassistenten',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e8e4df; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #1a1d1b; margin-top: 0;">Återställ ditt lösenord</h2>
          <p style="color: #575c58; font-size: 14px; line-height: 1.5;">Klicka på knappen nedan för att välja ett nytt lösenord:</p>
          <a href="${actionLink}" style="display: inline-block; background-color: #2d3732; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; margin-top: 10px; font-weight: bold; font-size: 14px;">Välj nytt lösenord</a>
        </div>
      `,
    });

    console.log('Resend skickat framgångsrikt:', resendResponse);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('FEL I RESET-PASSWORD ROUTEN:', err.message);
    return NextResponse.json({ error: err.message || 'Kunde inte skicka mail.' }, { status: 400 });
  }
}