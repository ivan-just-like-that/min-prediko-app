// lib/api.js
import { supabase } from '@/lib/supabase';

export async function generateContent(payload, onAuthRequired) {
  // 1. Hämta sessionen centralt
  const { data: { session } } = await supabase.auth.getSession();

  // Om användaren inte är inloggad -> trigga inloggningsmodalen
  if (!session) {
    if (onAuthRequired) onAuthRequired();
    throw new Error('Du måste vara inloggad för att generera.');
  }

  // 2. Skicka anropet med Authorization-headern
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.text || 'Ett fel uppstod vid genereringen.');
  }

  return data; // Returnerar { text, tokensLeft }
}