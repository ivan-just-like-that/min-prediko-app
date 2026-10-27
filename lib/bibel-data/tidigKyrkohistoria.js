export const TIDIG_KYRKOHISTORIA_PLATSER = [
  // --- PRIMÄRA PLATSER (Syns vid alla zoomnivåer) ---
  {
    id: "nicea",
    namn: "Nicea",
    epokId: "kyrkohistoria",
    kategori: "Koncilium",
    prioritet: 1, // Primär
    idag: "Iznik, Turkiet",
    koordinater: [40.4286, 29.7215],
    beskrivning: "Platsen för det första ekumeniska konciliet år 325. Här samlades biskoparna för att bemöta arianismen, vilket resulterade i formuleringen av den nicenska trosbekännelsen och fastställandet av Sonens väsensenhet med Fadern."
  },
  {
    id: "konstantinopel",
    namn: "Konstantinopel",
    epokId: "kyrkohistoria",
    kategori: "Koncilium / Patriarkat",
    prioritet: 1,
    idag: "Istanbul, Turkiet",
    koordinater: [41.0082, 28.9784],
    beskrivning: "Det romerska rikets nya huvudstad och säte för det andra ekumeniska konciliet år 381. Konciliet bekräftade den nicenska tron, fördjupade teologin om Den helige ande samt slutgiltigt formade den nicenska trosbekännelsen."
  },
  {
    id: "efesos-koncilium",
    namn: "Efesos",
    epokId: "kyrkohistoria",
    kategori: "Koncilium",
    prioritet: 1,
    idag: "Selçuk, Turkiet",
    koordinater: [37.9484, 27.3680],
    beskrivning: "Säte för det tredje ekumeniska konciliet år 431. Här bemöttes nestorianismen, och konciliet slog fast att Kristus är en enda person samt bekräftade Maria som Theotokos (Gudsföderska)."
  },
  {
    id: "chalkedon",
    namn: "Chalkedon",
    epokId: "kyrkohistoria",
    kategori: "Koncilium",
    prioritet: 1,
    idag: "Kadıköy (Istanbul), Turkiet",
    koordinater: [40.9903, 29.0275],
    beskrivning: "Platsen för det fjärde ekumeniska konciliet år 451. Här formulerades läran om Kristi två naturer – sann Gud och sann människa – förenade i en person, utan sammanblandning, utan förvandling, utan delning och utan åtskillnad."
  },
  {
    id: "alexandria",
    namn: "Alexandria",
    epokId: "kyrkohistoria",
    kategori: "Patriarkat / Teologisk skola",
    prioritet: 1,
    idag: "Alexandria, Egypten",
    koordinater: [31.2001, 29.9187],
    beskrivning: "Det teologiska och intellektuella centrat i Egypten, känt för sin teologiska skola och allegoriska bibeltolkning. Hemort för kyrkofäder som Athanasios och Kyrillos."
  },
  {
    id: "antiochia-syrien",
    namn: "Antiochia (i Syrien)",
    epokId: "kyrkohistoria",
    kategori: "Patriarkat / Teologisk skola",
    prioritet: 1,
    idag: "Antakya, Turkiet",
    koordinater: [36.2021, 36.1604],
    beskrivning: "Ett av den tidiga kyrkans främsta patriarkat, känt för sin teologiska skola med fokus på bibeltextens historiska och bokstavliga mening. Utgjorde en viktig motpol till Alexandrias teologi."
  },
  {
    id: "rom_kyrkohistoria",
    namn: "Rom",
    epokId: "kyrkohistoria",
    kategori: "Patriarkat / Biskopssäte",
    prioritet: 1,
    idag: "Rom, Italien",
    koordinater: [41.9028, 12.4964],
    beskrivning: "Västerlandets främsta patriarkat och biskopssäte. Här led apostlarna Petrus och Paulus martyrdöden, och staden utgjorde centrum för martyrskap, tidiga katakomber och teologisk auktoritet."
  },
  {
    id: "jerusalem_kyrkohistoria",
    namn: "Jerusalem",
    epokId: "kyrkohistoria",
    kategori: "Patriarkat / Pilgrimsort",
    prioritet: 1,
    idag: "Jerusalem, Israel/Palestina",
    koordinater: [31.7767, 35.2345],
    beskrivning: "Moderkyrkan och ursprungsorten för kristendomen. Blev under 300-talet under kejsarinnan Helena ett världscentrum för kristen pilgrimsvandring och upphöjdes till patriarkat vid konciliet i Chalkedon 451."
  },

  // --- SEKUNDÄRA PLATSER (Syns när man zoomar in: prioritet 2 / minZoom: 6) ---
  {
    id: "hippos_regius",
    namn: "Hippo Regius",
    epokId: "kyrkohistoria",
    kategori: "Biskopssäte",
    prioritet: 2,
    minZoom: 6,
    idag: "Annaba, Algeriet",
    koordinater: [36.9000, 7.7667],
    beskrivning: "Biskopssäte för kyrkofadern Augustinus (354–430 e.Kr.), en av västerländsk teologis mest inflytelserika tänkare kring nåden, arvsynden och Guds stad."
  },
  {
    id: "kartago",
    namn: "Kartago",
    epokId: "kyrkohistoria",
    kategori: "Teologiskt centrum",
    prioritet: 2,
    minZoom: 6,
    idag: "Tunis, Tunisien",
    koordinater: [36.8528, 10.3233],
    beskrivning: "Nordafrikas latinska teologiska centrum. Hemort för Tertullianus (som myntade begreppet Treenighet) och martyren/biskopen Cyprianus. Här hölls viktiga regionala koncilier om kyrkans enhet och dopet."
  },
  {
    id: "kaisarea_kappadokien",
    namn: "Caesarea (i Kappadokien)",
    epokId: "kyrkohistoria",
    kategori: "Teologiskt centrum",
    prioritet: 2,
    minZoom: 6,
    idag: "Kayseri, Turkiet",
    koordinater: [38.7312, 35.4787],
    beskrivning: "Säte för Basileios den store, en av de 'kappadokiska fäderna' (tillsammans med Gregorios av Nazianzos och Gregorios av Nyssa) som formulerade och fördjupade treenighetsläran inför konciliet i Konstantinopel 381."
  },
  {
    id: "kaisarea_maritima_kh",
    namn: "Caesarea Maritima",
    epokId: "kyrkohistoria",
    kategori: "Lärdomscentrum & Bibliotek",
    prioritet: 2,
    minZoom: 6,
    idag: "Kaisarea, Israel",
    koordinater: [32.5000, 34.8900],
    beskrivning: "Känt för sitt enorma teologiska bibliotek, grundat av Origenes och utbyggt av Eusebios av Kaisarea – kyrkohistoriens fader och kejsar Konstantins biograf."
  },
  {
    id: "edessa",
    namn: "Edessa",
    epokId: "kyrkohistoria",
    kategori: "Syrisk teologi",
    prioritet: 2,
    minZoom: 6,
    idag: "Şanlıurfa, Turkiet",
    koordinater: [37.1674, 38.7938],
    beskrivning: "Huvudort för den syrisktalande kristendomen vid det romerska rikets östra gräns. Känd för sin teologiska skola och diktarteologen Efrem Syren."
  },
  {
    id: "nisibis",
    namn: "Nisibis",
    epokId: "kyrkohistoria",
    kategori: "Teologisk skola",
    prioritet: 2,
    minZoom: 6,
    idag: "Nusaybin, Turkiet",
    koordinater: [37.0778, 41.2178],
    beskrivning: "En av de viktigaste teologiska akademierna i den östsyriska traditionen, belägen i gränslandet mot det persiska sassanidriket."
  },
  {
    id: "wadi_natrun",
    namn: "Sketis (Wadi El Natrun)",
    epokId: "kyrkohistoria",
    kategori: "Klostercentrum",
    prioritet: 2,
    minZoom: 6,
    idag: "Wadi El Natrun, Egypten",
    koordinater: [30.4300, 30.3400],
    beskrivning: "Väster om Nildeltat ligger vaggan för den tidiga koptiska klosterrörelsen och ökenfäderna (t.ex. Antonios den store och Makarios), som lade grunden för det kristna munkväsendet."
  },
  {
    id: "milan_kyrkohistoria",
    namn: "Mailand (Milano)",
    epokId: "kyrkohistoria",
    kategori: "Biskopssäte",
    prioritet: 2,
    minZoom: 6,
    idag: "Milano, Italien",
    koordinater: [45.4642, 9.1900],
    beskrivning: "Platsen där ediktet i Milano utfärdades år 313 (religionsfrihet i Romarriket). Biskopssäte för Ambrosius av Milano, som döpte Augustinus och hävdade kyrkans självständighet mot kejsarmakten."
  },
  {
    id: "nis_naissus",
    namn: "Naissus",
    epokId: "kyrkohistoria",
    kategori: "Kejsarstad",
    prioritet: 2,
    minZoom: 6,
    idag: "Niš, Serbien",
    koordinater: [43.3209, 21.8958],
    beskrivning: "Födelseort för kejsar Konstantin den store (ca 272 e.Kr.), kejsaren som sammankallade konciliet i Nicea och legaliserade kristendomen."
  },
  {
    id: "tours",
    namn: "Tours",
    epokId: "kyrkohistoria",
    kategori: "Klosterort",
    prioritet: 2,
    minZoom: 6,
    idag: "Tours, Frankrike",
    koordinater: [47.3941, 0.6848],
    beskrivning: "Säte för Martin av Tours (316–397 e.Kr.), en av Västeuropas viktigaste tidiga klostergrundare och helgon."
  }
];