'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Quote, Calendar } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Beräknar rörliga svenska kyrkohelger för ett givet år
function getSwedishMovablesForYear(year) {
  const movables = {};

  // 1. Alla helgons dag: Lördagen mellan 31 okt och 6 nov
  for (let day = 31; day <= 37; day++) {
    const d = new Date(year, 9, day); // 9 = oktober
    if (d.getMonth() === 10 && d.getDay() === 6) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      movables[`${mm}-${dd}`] = {
        name: "Alla helgons dag",
        years: "Kyrklig storhelg",
        occasion: "Kyrklig helgdag",
        category: "Storhelg",
        role: "Minnesdag för kyrkans helgon och avlidna",
        bio: "Alla helgons dag firas i Sverige lördagen mellan 31 oktober och 6 november till minne av kyrkans helgon och för att hedra våra avlidna anhöriga.",
        quote: "Saliga de som sörjer, de skall bli tröstade.",
        image_url: ""
      };
      
      // Alla själars dag: Söndagen därefter
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      const nmm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const ndd = String(nextDay.getDate()).padStart(2, '0');
      movables[`${nmm}-${ndd}`] = {
        name: "Alla själars dag",
        years: "Kyrklig minnesdag",
        occasion: "Kyrklig minnesdag",
        category: "Minnesdag",
        role: "Minnesdag för avlidna",
        bio: "Alla själars dag infaller söndagen efter Alla helgons dag och är en stilla helg för att minnas och be för avlidna nära och kära.",
        quote: "Ingen av oss lever för egen skull, och ingen dör för egen skull.",
        image_url: ""
      };
      break;
    }
  }

  // 2. Första advent: Söndagen mellan 27 nov och 3 dec
  for (let day = 27; day <= 33; day++) {
    const d = new Date(year, 10, day); // 10 = november
    if ((d.getMonth() === 10 && day > 30) || (d.getMonth() === 11 && day <= 33)) {
      if (d.getDay() === 0) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        movables[`${mm}-${dd}`] = {
          name: "Första advent",
          years: "Kyrklig storhelg",
          occasion: "Adventssöndag",
          category: "Storhelg",
          role: "Inledningen på kyrkoåret",
          bio: "Första advent markerar början på det nya kyrkoåret och tändandet av det första ljuset i adventsstaken i väntan på julens budskap.",
          quote: "Se, din konung kommer till dig, saktmodig och ridande på en åsna.",
          image_url: ""
        };
        break;
      }
    }
  }

  // 3. Påskdagen & Påskserien (Meeus/Jones/Butcher-algoritmen)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easterDate = new Date(year, month - 1, day);
  const addDays = (dt, days) => {
    const res = new Date(dt);
    res.setDate(res.getDate() + days);
    return res;
  };
  const fmt = (dt) => `${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

  // Palmsöndagen (-7)
  movables[fmt(addDays(easterDate, -7))] = { name: "Palmsöndagen", years: "Kyrklig storhelg", occasion: "Kyrklig helgdag", category: "Storhelg", role: "Inledningen på stilla veckan", bio: "Palmsöndagen inleder stilla veckan till minne av Jesu intåg i Jerusalem.", quote: "Hosianna, välsignad är han som kommer i Herrens namn!", image_url: "" };
  // Dopdagen / Skärtorsdagen (-3)
  movables[fmt(addDays(easterDate, -3))] = { name: "Skärtorsdagen", years: "Kyrklig helgdag", occasion: "Kyrklig helgdag", category: "Storhelg", role: "Nattvardens stiftande", bio: "Skärtorsdagen firas till minne av Jesu sista måltid med lärjungarna och instiftandet av nattvarden.", quote: "Ett nytt bud ger jag er: att ni skall älska varandra.", image_url: "" };
  // Långfredagen (-2)
  movables[fmt(addDays(easterDate, -2))] = { name: "Långfredagen", years: "Kyrklig helgdag", occasion: "Kyrklig helgdag", category: "Storhelg", role: "Jesu lidande och död", bio: "Långfredagen är kyrkans sorgesammaste dag till minne av Jesu korsfästelse och död på Golgata.", quote: "Min Gud, min Gud, varför har du övergivit mig?", image_url: "" };
  // Påskdagen (0)
  movables[fmt(easterDate)] = { name: "Påskdagen", years: "Kyrklig storhelg", occasion: "Kyrklig storhelg", category: "Storhelg", role: "Jesu uppståndelse", bio: "Påskdagen är kristenhetens största högtid till minne av att Kristus har uppstått från de döda.", quote: "Han är inte här, han har uppstått!", image_url: "" };
  // Annandag påsk (+1)
  movables[fmt(addDays(easterDate, 1))] = { name: "Annandag påsk", years: "Kyrklig helgdag", occasion: "Kyrklig helgdag", category: "Storhelg", role: "Mötet i Emmaus", bio: "Annandag påsk uppmärksammar mötet med den uppståndne Herren på vägen till Emmaus.", quote: "Brann inte våra hjärtan när han talade med oss?", image_url: "" };
  // Kristi himmelsfärds dag (+39)
  movables[fmt(addDays(easterDate, 39))] = { name: "Kristi himmelsfärds dag", years: "Kyrklig helgdag", occasion: "Kyrklig helgdag", category: "Storhelg", role: "Jesu upptagande till himlen", bio: "Kristi himmelsfärds dag firas fyrtio dagar efter påsk till minne av Jesu avsked från lärjungarna.", quote: "Se, jag är med er alla dagar till tidens slut.", image_url: "" };
  // Pingstdagen (+49)
  movables[fmt(addDays(easterDate, 49))] = { name: "Pingstdagen", years: "Kyrklig storhelg", occasion: "Kyrklig storhelg", category: "Storhelg", role: "Den helige Andes utgjutelse", bio: "Pingstdagen är kyrkans födelsedag då den helige Ande sändes för att leda församlingen.", quote: "Ni skall få kraft när den helige Ande kommer över er.", image_url: "" };

  return movables;
}

export default function DailyFigureCard() {
  const [figure, setFigure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchFigure() {
      try {
        const params = new URLSearchParams(window.location.search);
        const previewDate = params.get('figure'); // t.ex. "11-07"

        const now = new Date();
        const currentYear = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const monthDay = previewDate || `${month}-${day}`;

        // 1. Kolla om datumet är en rörlig svensk storhelg för det aktuella året
        const movables = getSwedishMovablesForYear(currentYear);
        if (movables[monthDay]) {
          setFigure(movables[monthDay]);
          setLoading(false);
          return;
        }

        // 2. Om det inte är en rörlig storhelg, hämta från Supabase
        const { data, error } = await supabase
          .from('daily_figures')
          .select('*')
          .eq('month_day', monthDay)
          .maybeSingle();

        if (!error && data) {
          setFigure(data);
          setImgError(false);
        }
      } catch (err) {
        console.error('Kunde inte hämta dagens gestalt:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFigure();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-sm animate-pulse">
        <div className="h-3 w-28 bg-[#f0ece6] rounded mb-3"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#f0ece6] rounded-full shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-[#f0ece6] rounded"></div>
            <div className="h-3 w-24 bg-[#f0ece6] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!figure) return null;

  const formattedDate = new Date().toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
  });

  const showImage = Boolean(figure.image_url) && !imgError;

  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#faf8f5] text-[#2d3732] px-2.5 py-1 rounded-full border border-[#e8e4df]">
          <Calendar className="w-3 h-3" />
          Dagens helg / gestalt • {formattedDate}
        </span>
        <div className="flex items-center gap-2 text-xs text-[#8c918d]">
          {figure.occasion && (
            <span className="font-medium text-[#575c58] bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e8e4df]">
              {figure.occasion}
            </span>
          )}
          <span className="font-mono">{figure.years}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        {showImage ? (
          <img
            src={figure.image_url}
            alt={figure.name}
            onError={() => setImgError(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover object-top border-2 border-[#e8e4df] shadow-sm shrink-0 bg-[#faf8f5]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#e8e4df] bg-[#faf8f5] text-[#2d3732] flex items-center justify-center shrink-0 shadow-sm select-none"
          >
            <span className="text-lg sm:text-xl font-serif font-bold tracking-wider">
              {getInitials(figure.name)}
            </span>
          </div>
        )}

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1d1b] tracking-tight">
            {figure.name}
          </h2>
          <p className="text-xs font-medium text-[#8c918d] mt-0.5">
            {figure.role}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#575c58] leading-relaxed">
        {figure.bio}
      </p>

      {figure.quote && (
        <blockquote className="mt-4 pt-4 border-t border-[#e8e4df] flex items-start gap-3">
          <Quote className="w-4 h-4 text-[#8c918d] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm italic text-[#2d312e] leading-relaxed">
            &quot;{figure.quote}&quot;
          </p>
        </blockquote>
      )}
    </section>
  );
}