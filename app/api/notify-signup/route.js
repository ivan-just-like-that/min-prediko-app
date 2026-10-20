import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-post saknas' }, { status: 400 });
    }

    // Skicka mailet till dig själv
    await resend.emails.send({
      from: 'PredikoAppen <notis@patricivan.se>', // eller din verifierade Resend-domän
      to: 'ivan@patricivan.se',         // Byt ut mot din e-postadress!
      subject: '🎉 Ny användare registrerad!',
      html: `<p>En ny användare har just skapat ett konto med e-post: <strong>${email}</strong></p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fel vid skickande av notis-mail:', error);
    return NextResponse.json({ error: 'Kunde inte skicka notis' }, { status: 500 });
  }
}