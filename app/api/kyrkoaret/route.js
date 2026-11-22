import { NextResponse } from 'next/server';

const LITURGICAL_COLORS = {
  vit: { label: 'Vit', dot: 'bg-white border border-stone-300' },
  grön: { label: 'Grön', dot: 'bg-emerald-600' },
  violett: { label: 'Violett', dot: 'bg-purple-700' },
  blå: { label: 'Blå', dot: 'bg-blue-700' },
  röd: { label: 'Röd', dot: 'bg-red-700' },
  rosa: { label: 'Rosa', dot: 'bg-pink-300' },
};

function ordinalSv(n) {
  const num = Number(n);
  if (num === 1 || num === 2) return `${num}:a`;
  return `${num}:e`;
}

// UTC-hjälpfunktioner så sommar-/vintertid aldrig förskjuter datum
function makeDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toIsoDate(date) {
  return date.toISOString().split('T')[0];
}

// Gregoriansk påskdag för ett givet kalenderår
function getEasterSunday(year) {
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
  return makeDate(year, month, day);
}

// 1:a söndagen i advent = söndagen närmast 30 november (27 nov – 3 dec)
function getFirstAdvent(year) {
  const nov27 = makeDate(year, 11, 27);
  const dow = nov27.getUTCDay(); // 0 = söndag
  const offset = (7 - dow) % 7;
  return addDays(nov27, offset);
}

// Årgång (1, 2, 3) för kyrkoåret som inleds med 1:a advent `adventYear`
function getLectionarySeriesInfo(adventYear) {
  const cycle = (((adventYear - 2023) % 3) + 3) % 3; // 2023 -> 1, 2024 -> 2, 2025 -> 3, 2026 -> 1
  const seriesNumber = cycle + 1;
  return {
    seriesNumber,
    series: `${ordinalSv(seriesNumber)} årgången`,
  };
}

// Bygg hela kyrkoåret som börjar 1:a advent `adventYear` och slutar lördagen före nästa 1:a advent
function buildChurchYear(adventYear) {
  const nextYear = adventYear + 1;
  const advent1 = getFirstAdvent(adventYear);
  const nextAdvent1 = getFirstAdvent(nextYear);
  const easter = getEasterSunday(nextYear);
  const { series, seriesNumber } = getLectionarySeriesInfo(adventYear);

  const byDate = new Map();

  const setDay = (date, name, colorKey, { overwrite = true } = {}) => {
    const iso = toIsoDate(date);
    if (!overwrite && byDate.has(iso)) return;
    byDate.set(iso, {
      date: iso,
      ts: date.getTime(),
      name,
      color: LITURGICAL_COLORS[colorKey] || LITURGICAL_COLORS.grön,
      series,
      seriesNumber,
    });
  };

  // 1. Adventstiden
  setDay(advent1, `${ordinalSv(1)} söndagen i advent`, 'vit');
  setDay(addDays(advent1, 7), `${ordinalSv(2)} söndagen i advent`, 'violett');
  setDay(addDays(advent1, 14), `${ordinalSv(3)} söndagen i advent`, 'violett');
  setDay(addDays(advent1, 21), `${ordinalSv(4)} söndagen i advent`, 'violett');

  // 2. Jul & Nyår
  setDay(makeDate(adventYear, 12, 25), 'Juldagen', 'vit');
  setDay(makeDate(adventYear, 12, 26), 'Annandag jul / Den Helige Stefanos dag', 'röd');
  setDay(makeDate(nextYear, 1, 1), 'Nyårsdagen', 'vit');
  setDay(makeDate(nextYear, 1, 6), 'Trettondedag jul', 'vit');

  // 3. Söndagar mellan advent, jul, nyår och trettondedag fram till Septuagesima
  const septuagesima = addDays(easter, -63);
  const newYearDay = makeDate(nextYear, 1, 1);
  const epiphanyDay = makeDate(nextYear, 1, 6);

  let cursor = addDays(advent1, 28);
  let afterEpiphanyCount = 0;

  while (cursor.getTime() < septuagesima.getTime()) {
    const iso = toIsoDate(cursor);
    if (!byDate.has(iso)) {
      if (cursor.getTime() < newYearDay.getTime()) {
        setDay(cursor, 'Söndagen e. jul', 'vit', { overwrite: false });
      } else if (cursor.getTime() < epiphanyDay.getTime()) {
        setDay(cursor, 'Söndagen e. nyår', 'vit', { overwrite: false });
      } else {
        afterEpiphanyCount += 1;
        setDay(
          cursor,
          `${ordinalSv(afterEpiphanyCount)} söndagen e. trettondedagen`,
          afterEpiphanyCount === 1 ? 'vit' : 'grön',
          { overwrite: false }
        );
      }
    }
    cursor = addDays(cursor, 7);
  }

  // Kyndelsmässodagen (söndagen 2 feb – 8 feb)
  const feb2 = makeDate(nextYear, 2, 2);
  const candlemasOffset = (7 - feb2.getUTCDay()) % 7;
  const candlemasDate = addDays(feb2, candlemasOffset);
  if (candlemasDate.getTime() < septuagesima.getTime()) {
    setDay(candlemasDate, 'Kyndelsmässodagen eller Jungfru Marie Kyrkogångsdag', 'vit');
  }

  // 4. Förfastan, Askonsdagen & Fastan
  setDay(septuagesima, 'Septuagesima', 'grön');
  setDay(addDays(easter, -56), 'Sexagesima', 'grön');
  setDay(addDays(easter, -49), 'Fastlagssöndagen', 'grön');
  setDay(addDays(easter, -46), 'Askonsdagen', 'violett');
  setDay(addDays(easter, -42), `${ordinalSv(1)} söndagen i fastan`, 'violett');
  setDay(addDays(easter, -35), `${ordinalSv(2)} söndagen i fastan`, 'violett');
  setDay(addDays(easter, -28), `${ordinalSv(3)} söndagen i fastan`, 'violett');
  setDay(addDays(easter, -21), 'Midfastosöndagen', 'violett');
  setDay(addDays(easter, -14), `${ordinalSv(5)} söndagen i fastan`, 'violett');
  setDay(addDays(easter, -7), 'Palmsöndagen', 'violett');

  // Jungfru Marie bebådelsedag (söndagen 22 mar – 28 mar om den inte sammanfaller med påskdagen)
  const mar22 = makeDate(nextYear, 3, 22);
  const annunciationOffset = (7 - mar22.getUTCDay()) % 7;
  const annunciationDate = addDays(mar22, annunciationOffset);
  if (toIsoDate(annunciationDate) !== toIsoDate(easter)) {
    setDay(annunciationDate, 'Jungfru Marie bebådelsedag', 'vit');
  }

  // 5. Stilla veckan & Påsktiden
  setDay(addDays(easter, -3), 'Skärtorsdagen', 'vit');
  setDay(addDays(easter, -2), 'Långfredagen', 'violett');
  setDay(easter, 'Påskdagen', 'vit');
  setDay(addDays(easter, 1), 'Annandag påsk', 'vit');
  setDay(addDays(easter, 7), `${ordinalSv(2)} söndagen i påsktiden`, 'vit');
  setDay(addDays(easter, 14), `${ordinalSv(3)} söndagen i påsktiden`, 'vit');
  setDay(addDays(easter, 21), `${ordinalSv(4)} söndagen i påsktiden`, 'vit');
  setDay(addDays(easter, 28), `${ordinalSv(5)} söndagen i påsktiden`, 'vit');
  setDay(addDays(easter, 35), 'Bönsöndagen', 'vit');
  setDay(addDays(easter, 39), 'Kristi himmelsfärds dag', 'vit');
  setDay(addDays(easter, 42), 'Söndagen före pingst', 'vit');

// 6. Pingst & Trefaldighetstiden
  const pentecost = addDays(easter, 49);
  setDay(pentecost, 'Pingstdagen', 'röd');
  setDay(addDays(pentecost, 1), 'Annandag pingst', 'röd');
  setDay(addDays(pentecost, 7), 'Heliga trefaldighets dag eller Missionsdagen', 'vit');

  const domssondagen = addDays(nextAdvent1, -7);
  const firstTrinity = addDays(pentecost, 14);

  // Grundserie: fasta ordningstal (1:a, 2:a, 3:e...) baserat på söndagens plats efter Heliga trefaldighets dag
  let trinCursor = new Date(firstTrinity.getTime());
  let trinNumber = 1;

  while (trinCursor.getTime() < domssondagen.getTime()) {
    setDay(trinCursor, `${ordinalSv(trinNumber)} söndagen e. trefaldighet`, 'grön', {
      overwrite: true,
    });
    trinNumber += 1;
    trinCursor = addDays(trinCursor, 7);
  }

  // Särskilda dagar som infaller under trefaldighetstiden/hösten (skriver över grundnumret på det datumet)
  // 5:e söndagen e. trefaldighet i din lista är Apostladagen
  const fifthTrinity = addDays(firstTrinity, 4 * 7);
  if (fifthTrinity.getTime() < domssondagen.getTime()) {
    setDay(fifthTrinity, 'Apostladagen', 'vit', { overwrite: true });
  }

  // Kristi förklarings dag (7:e söndagen e. trefaldighet)
  const transfiguration = addDays(firstTrinity, 6 * 7);
  if (transfiguration.getTime() < domssondagen.getTime()) {
    setDay(transfiguration, 'Kristi förklarings dag', 'vit', { overwrite: true });
  }

  // Midsommardagen (söndagen 20 jun – 26 jun) & Den helige Johannes döp. dag (söndagen efter)
  const jun20 = makeDate(nextYear, 6, 20);
  const midsummerOffset = (7 - jun20.getUTCDay()) % 7;
  const midsummerDate = addDays(jun20, midsummerOffset);
  if (midsummerDate.getTime() >= firstTrinity.getTime() && midsummerDate.getTime() < domssondagen.getTime()) {
    setDay(midsummerDate, 'Midsommardagen', 'vit', { overwrite: true });
    const johannesBaptistDate = addDays(midsummerDate, 7);
    if (johannesBaptistDate.getTime() < domssondagen.getTime()) {
      setDay(johannesBaptistDate, 'Den helige Johannes döp. dag', 'vit', { overwrite: true });
    }
  }

  // Den helige Mikaels dag (söndagen 29 sep – 5 okt) & Tacksägelsedagen (söndagen efter)
  const sep29 = makeDate(nextYear, 9, 29);
  const mikaelOffset = (7 - sep29.getUTCDay()) % 7;
  const mikaelDate = addDays(sep29, mikaelOffset);
  if (mikaelDate.getTime() < domssondagen.getTime()) {
    setDay(mikaelDate, 'Den helige Mikaels dag', 'vit', { overwrite: true });
  }

  const thanksgivingDate = addDays(mikaelDate, 7);
  if (thanksgivingDate.getTime() < domssondagen.getTime()) {
    setDay(thanksgivingDate, 'Tacksägelsedagen', 'grön', { overwrite: true });
  }

  // Alla helgons dag (lördagen 31 okt – 6 nov) & Söndagen e. Alla helgons dag eller Alla själars dag
  const oct31 = makeDate(nextYear, 10, 31);
  const allSaintsOffset = (6 - oct31.getUTCDay() + 7) % 7;
  const allSaintsSat = addDays(oct31, allSaintsOffset);
  setDay(allSaintsSat, 'Alla helgons dag', 'vit', { overwrite: true });

  const allSaintsSun = addDays(allSaintsSat, 1);
  if (allSaintsSun.getTime() < domssondagen.getTime()) {
    setDay(allSaintsSun, 'Söndagen e. Alla helgons dag eller Alla själars dag', 'vit', {
      overwrite: true,
    });
  }

  // Söndagen före domssöndagen (när det finns en ledig söndag direkt före domssöndagen)
  const beforeDom = addDays(domssondagen, -7);
  if (
    beforeDom.getTime() > allSaintsSun.getTime() &&
    beforeDom.getTime() > thanksgivingDate.getTime()
  ) {
    setDay(beforeDom, 'Söndagen före domssöndagen', 'grön', { overwrite: true });
  }

  // Domssöndagen (söndagen närmast före 1:a advent)
  setDay(domssondagen, 'Domssöndagen / Kristus konungens dag', 'vit', { overwrite: true });

  return Array.from(byDate.values()).sort((a, b) => a.ts - b.ts);
}

export async function GET() {
  const stockholmStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [y, m, d] = stockholmStr.split('-').map(Number);
  const todayUtc = makeDate(y, m, d);
  const todayTs = todayUtc.getTime();

  // Bygg flera kyrkoår runt aktuellt datum så gränserna vid advent och årsskifte alltid täcks
  const allDays = [
    ...buildChurchYear(y - 2),
    ...buildChurchYear(y - 1),
    ...buildChurchYear(y),
    ...buildChurchYear(y + 1),
  ].sort((a, b) => a.ts - b.ts);

  // Deduplicera på datum så senare/mer specifika poster aldrig skuggas av äldre år
  const dedupedByDate = new Map();
  for (const item of allDays) {
    dedupedByDate.set(item.date, item);
  }
  const sortedDays = Array.from(dedupedByDate.values()).sort((a, b) => a.ts - b.ts);

  const nextHoliday = sortedDays.find((item) => item.ts >= todayTs);
  const passedOrToday = sortedDays.filter((item) => item.ts <= todayTs);
  const currentPeriodHoliday =
    passedOrToday.length > 0 ? passedOrToday[passedOrToday.length - 1] : nextHoliday;

  if (!nextHoliday && !currentPeriodHoliday) {
    return NextResponse.json({ holiday: null });
  }

  const target = nextHoliday || currentPeriodHoliday;
  const isToday = target.date === stockholmStr;
  const activeColorSource = isToday ? target : currentPeriodHoliday || target;
  const activeSeriesSource = currentPeriodHoliday || target;

  return NextResponse.json({
    holiday: {
      name: target.name,
      date: target.date,
      isToday,
      color: activeColorSource.color,
      colorSourceName: activeColorSource.name,
      series: activeSeriesSource.series,
      seriesNumber: activeSeriesSource.seriesNumber,
    },
  });
}