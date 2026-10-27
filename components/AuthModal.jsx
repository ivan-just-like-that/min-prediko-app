'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { KeyRound, X, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, message, onAuthSuccess }) {
  // Lägen: 'login' | 'signup' | 'verify-otp' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [acceptedGdpr, setAcceptedGdpr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Tvingar modalen att hållas öppen när användaren kommer via en lösenordslänk
  const [forceOpenReset, setForceOpenReset] = useState(false);

  // Lyssna på om användaren klickat på en "Återställ lösenord"-länk i e-posten
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setForceOpenReset(true);
      }
    });

    return () => authListener.subscription?.unsubscribe();
  }, []);

  const handleClose = () => {
    setForceOpenReset(false);
    setMode('login');
    setErrorMsg('');
    setInfoMsg('');
    if (onClose) onClose();
  };

  const switchMode = (newMode) => {
    setForceOpenReset(false);
    setMode(newMode);
    setErrorMsg('');
    setInfoMsg('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setAcceptedGdpr(false);
  };

  if (!isOpen && !forceOpenReset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      // 1. SKAPA KONTO
      if (mode === 'signup') {
        if (!acceptedGdpr) {
          setErrorMsg('Du måste godkänna integritetspolicyn för att skapa ett konto.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMsg('Lösenorden matchar inte. Kontrollera och försök igen.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMode('verify-otp');
        setInfoMsg('En 6-siffrig bekräftelsekod har skickats till din e-post. Skriv in den nedan.');
      } 

      // 2. VERIFIERA 6-SIFFRIG KOD (OTP)
      else if (mode === 'verify-otp') {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: 'signup',
        });

        if (error) {
          setErrorMsg('Felaktig eller utgången kod. Kontrollera koden i ditt mejl och försök igen.');
          setLoading(false);
          return;
        }

        fetch('/api/notify-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch((err) => console.error('Kunde inte skicka notis-mail:', err));

        setInfoMsg('E-postadressen bekräftad! Du är nu inloggad med 10 gratisanrop.');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          handleClose();
        }, 1200);
      }
      
      // 3. LOGGA IN
      else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (onAuthSuccess) onAuthSuccess();
        handleClose();
      }

      // 4. GLÖMT LÖSENORD
      else if (mode === 'forgot') {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Kunde inte skicka mail');

        setInfoMsg('Ett e-postmeddelande med en återställningslänk har skickats till din adress!');
      }

      // 5. SPARA NYTT LÖSENORD
      else if (mode === 'reset') {
        if (password !== confirmPassword) {
          setErrorMsg('Lösenorden matchar inte. Kontrollera och försök igen.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        setInfoMsg('Ditt lösenord har uppdaterats! Du är nu inloggad.');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ett fel uppstod. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: currentUrl },
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-[#1a1d1b]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e8e4df] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Stäng-knapp */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-5 right-5 text-[#8c918d] hover:text-[#1a1d1b] p-1.5 rounded-xl hover:bg-[#faf8f5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon & Rubrik */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#faf8f5] border border-[#e8e4df] rounded-2xl flex items-center justify-center text-[#2d3732] mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a1d1b] tracking-tight">
            {mode === 'signup' && 'Skapa ett konto'}
            {mode === 'verify-otp' && 'Ange bekräftelsekod'}
            {mode === 'login' && 'Logga in'}
            {mode === 'forgot' && 'Återställ lösenord'}
            {mode === 'reset' && 'Välj nytt lösenord'}
          </h2>
          <p className="text-xs sm:text-sm text-[#575c58] mt-2 bg-[#faf8f5] border border-[#e8e4df] p-3 rounded-xl leading-relaxed">
            {mode === 'verify-otp'
              ? `Vi har skickat en 6-siffrig kod till ${email}. Skriv in den nedan för att slutföra registreringen.`
              : mode === 'forgot' 
              ? 'Fyll i din e-postadress så skickar vi en länk för att återställa ditt lösenord.'
              : mode === 'reset'
              ? 'Skriv in ditt nya lösenord nedan.'
              : message || 'Skapa ett konto för att få 10 gratisanrop och tillgång till alla verktyg!'}
          </p>
        </div>

        {/* Google-inloggning */}
        {(mode === 'login' || mode === 'signup') && (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-[#e8e4df] rounded-xl text-xs sm:text-sm font-semibold text-[#1a1d1b] bg-white hover:bg-[#faf8f5] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Fortsätt med Google
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e8e4df]"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-white px-3 text-[#8c918d]">Eller med e-post</span></div>
            </div>
          </>
        )}

        {/* Felmeddelande */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span>{errorMsg}</span>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-left font-bold underline text-rose-900 hover:text-black mt-1"
                >
                  Glömt ditt lösenord? Klicka här för att återställa det.
                </button>
              )}
            </div>
          </div>
        )}

        {/* Infomeddelande */}
        {infoMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Formulär */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* E-postfält */}
          {mode !== 'reset' && mode !== 'verify-otp' && (
            <div>
              <label className="block text-[11px] font-bold text-[#1a1d1b] uppercase tracking-wider mb-1.5">
                E-postadress
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prast@svenskakyrkan.se"
                className="w-full px-3.5 py-2.5 border border-[#e8e4df] bg-[#faf8f5] rounded-xl focus:outline-none focus:border-[#2d3732] focus:bg-white text-xs sm:text-sm text-[#1a1d1b] transition-all placeholder:text-[#a09a90]"
              />
            </div>
          )}

          {/* Bekräftelsekod (OTP) */}
          {mode === 'verify-otp' && (
            <div>
              <label className="block text-[11px] font-bold text-[#1a1d1b] uppercase tracking-wider mb-1.5">
                Bekräftelsekod (6 siffror)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-lg py-2.5 border border-[#e8e4df] bg-[#faf8f5] rounded-xl focus:outline-none focus:border-[#2d3732] focus:bg-white text-[#1a1d1b] transition-all"
              />
            </div>
          )}

          {/* Lösenordsfält */}
          {mode !== 'forgot' && mode !== 'verify-otp' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-[#1a1d1b] uppercase tracking-wider">
                  {mode === 'reset' ? 'Nytt lösenord' : 'Lösenord'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] font-semibold text-[#575c58] hover:text-[#1a1d1b] hover:underline"
                  >
                    Glömt lösenord?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[#e8e4df] bg-[#faf8f5] rounded-xl focus:outline-none focus:border-[#2d3732] focus:bg-white text-xs sm:text-sm text-[#1a1d1b] transition-all"
              />
            </div>
          )}

          {/* Upprepa lösenord */}
          {(mode === 'signup' || mode === 'reset') && (
            <div>
              <label className="block text-[11px] font-bold text-[#1a1d1b] uppercase tracking-wider mb-1.5">
                Upprepa {mode === 'reset' ? 'nytt ' : ''}lösenord
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[#e8e4df] bg-[#faf8f5] rounded-xl focus:outline-none focus:border-[#2d3732] focus:bg-white text-xs sm:text-sm text-[#1a1d1b] transition-all"
              />
            </div>
          )}

          {/* GDPR-Kryssruta */}
          {mode === 'signup' && (
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="gdpr-checkbox"
                checked={acceptedGdpr}
                onChange={(e) => setAcceptedGdpr(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#e8e4df] text-[#2d3732] focus:ring-[#2d3732] cursor-pointer"
              />
              <label htmlFor="gdpr-checkbox" className="text-xs text-[#575c58] leading-relaxed cursor-pointer">
                Jag godkänner att min e-post sparas samt godkänner{' '}
                <Link href="/integritet" target="_blank" className="text-[#1a1d1b] font-semibold underline hover:text-black">
                  integritetspolicyn
                </Link>{' '}
                och{' '}
                <Link href="/villkor" target="_blank" className="text-[#1a1d1b] font-semibold underline hover:text-black">
                  användarvillkoren
                </Link>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#2d3732] hover:bg-[#1f2723] text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 text-xs sm:text-sm mt-2 active:scale-[0.99]"
          >
            {loading
              ? 'Bearbetar...'
              : mode === 'signup'
              ? 'Skapa konto & få 10 gratisanrop'
              : mode === 'verify-otp'
              ? 'Bekräfta kod & logga in'
              : mode === 'login'
              ? 'Logga in'
              : mode === 'forgot'
              ? 'Skicka återställningslänk'
              : 'Spara nytt lösenord'}
          </button>
        </form>

        {/* Länkar under formuläret */}
        <div className="mt-6 text-center border-t border-[#e8e4df] pt-4">
          {mode === 'signup' && (
            <p className="text-xs text-[#575c58]">
              Har du redan ett konto?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-[#1a1d1b] hover:underline ml-1"
              >
                Logga in här
              </button>
            </p>
          )}

          {mode === 'verify-otp' && (
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-xs font-bold text-[#1a1d1b] hover:underline"
            >
              ← Byt e-postadress eller börja om
            </button>
          )}

          {mode === 'login' && (
            <p className="text-xs text-[#575c58]">
              Har du inget konto än?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-bold text-[#1a1d1b] hover:underline ml-1"
              >
                Skapa ett konto och få 10 gratisanrop
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-bold text-[#1a1d1b] hover:underline"
            >
              ← Tillbaka till inloggningen
            </button>
          )}
        </div>

      </div>
    </div>
  );
}