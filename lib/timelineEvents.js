// lib/timelineEvents.js

export const ERAS = [
  { id: "skapelsen", name: "Skapelsen & Urtiden", period: "Urtid" },
  { id: "patriarkerna", name: "Patriarktiden", period: "ca 2091–1500 f.Kr." },
  { id: "utvandringen", name: "Uttåget & Ökenvandringen", period: "ca 1446–1406 f.Kr." },
  { id: "domartiden", name: "Erövringen & Domartiden", period: "ca 1406–1050 f.Kr." },
  { id: "forenade_riket", name: "Förenade Kungariket", period: "ca 1050–930 f.Kr." },
  { id: "delade_riket", name: "Delade Rikets tid", period: "ca 930–586 f.Kr." },
  { id: "exilen_perser", name: "Exilen & Persisk tid", period: "ca 586–332 f.Kr." },
  { id: "nt_evangelier", name: "Evangelierna & Jesu liv", period: "ca 4 f.Kr.–30 e.Kr." },
  { id: "nt_tid", name: "Apostlagärningarna & Breven", period: "ca 30–60 e.Kr." },
  { id: "uppenbarelsen", name: "Uppenbarelseboken", period: "ca 95 e.Kr." }
];

export const TIMELINE_EVENTS = [
  // --- SKAPELSEN & URTIDEN ---
  {
    id: "skapelsen",
    year: "Urtid",
    title: "Skapelsen",
    era: "skapelsen",
    siteId: null,
    coordinates: null,
    zoom: 5,
    scripture: {
      reference: "1 Mos 1:1–31",
      quote: "I begynnelsen skapade Gud himmel och jord... Gud såg på allt som han hade gjort, och se, det var mycket gott.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.1"
    }
  },
  {
    id: "syndefallet",
    year: "Urtid",
    title: "Människans syndafall",
    era: "skapelsen",
    siteId: null,
    coordinates: null,
    zoom: 5,
    scripture: {
      reference: "1 Mos 3:1–24",
      quote: "Då öppnades ögonen på dem båda, och de märkte att de var nakna... Och Herren Gud förvisade människan från Edens trädgård.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.3"
    }
  },
  {
    id: "noas-flod",
    year: "ca 2400 f.Kr.",
    title: "Syndafloden och Noas ark",
    era: "skapelsen",
    siteId: "ararat",
    coordinates: [39.702, 44.298],
    zoom: 6,
    scripture: {
      reference: "1 Mos 7:1–24",
      quote: "Samma dag bröt alla det stora djupets källor fram, och himlens slussar öppnades. Och regnet föll över jorden i fyrtio dagar och fyrtio nätter.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.7"
    }
  },

  // --- PATRIARKTIDEN ---
  {
    id: "abraham-haran",
    year: "2091 f.Kr.",
    title: "Abraham bosätter sig i Haran",
    era: "patriarkerna",
    siteId: "haran",
    coordinates: [36.865, 39.025],
    zoom: 7,
    scripture: {
      reference: "1 Mos 11:31–32",
      quote: "De drog tillsammans ut från Ur i Kaldéen för att gå till Kanaans land. Men när de kom till Haran bosatte de sig där.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.11"
    }
  },
  {
    id: "gud-kallar-abraham",
    year: "2091 f.Kr.",
    title: "Gud kallar Abraham",
    era: "patriarkerna",
    siteId: "haran",
    coordinates: [36.865, 39.025],
    zoom: 7,
    scripture: {
      reference: "1 Mos 12:1–4",
      quote: "Herren sade till Abram: 'Lämna ditt land, din släkt och ditt fadershus, och gå till det land som jag skall visa dig.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.12"
    }
  },
  {
    id: "abraham-sikem",
    year: "2085 f.Kr.",
    title: "Abraham bygger ett altare i Sikem",
    era: "patriarkerna",
    siteId: "sikem",
    coordinates: [32.213, 35.282],
    zoom: 8,
    scripture: {
      reference: "1 Mos 12:6–7",
      quote: "Abram drog genom landet ända till den heliga platsen vid Sikem... Där byggde han ett altare åt Herren som hade uppenbarat sig för honom.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.12"
    }
  },
  {
    id: "jakob-galeed",
    year: "ca 1750 f.Kr.",
    title: "Jakob och Labans förbund vid Galeed",
    era: "patriarkerna",
    siteId: "galeed",
    coordinates: [32.350, 35.850],
    zoom: 8,
    scripture: {
      reference: "1 Mos 31:48–52",
      quote: "Laban sade: 'Detta stenröse är i dag vittne mellan mig och dig.' Därför fick det namnet Galeed.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/GEN.31"
    }
  },

  // --- UTVANDRINGEN & ÖKENVANDRINGEN ---
  {
    id: "israeliterna-slaveri",
    year: "1446 f.Kr.",
    title: "Israeliterna i slaveri i Egypten",
    era: "utvandringen",
    siteId: "gosen",
    coordinates: [30.850, 31.800],
    zoom: 7,
    scripture: {
      reference: "2 Mos 1:8–14",
      quote: "Det kom en ny kung i Egypten, en som inte kände till Josef... Egyptierna tvingade israeliterna till hårt arbete och gjorde deras liv bittert.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EXO.1"
    }
  },
  {
    id: "tio-plagorna",
    year: "1446 f.Kr.",
    title: "De tio plågorna över Egypten",
    era: "utvandringen",
    siteId: "tanis",
    coordinates: [30.977, 31.880],
    zoom: 7,
    scripture: {
      reference: "2 Mos 7:14–12:30",
      quote: "Herren sade till Mose: 'Säg till Aron: Ta din stav och sträck ut din hand över Egyptens vatten, så skall det förvandlas till blod.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EXO.7"
    }
  },
  {
    id: "roda-havet",
    year: "1446 f.Kr.",
    title: "Övergången av Röda havet",
    era: "utvandringen",
    siteId: "roda_havet",
    coordinates: [29.950, 32.550],
    zoom: 8,
    scripture: {
      reference: "2 Mos 14:21–31",
      quote: "Mose sträckte ut sin hand över havet... och vattnet delade sig. Israeliterna gick mitt igenom havet på torr mark.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EXO.14"
    }
  },
  {
    id: "tio-guds-bud",
    year: "1446 f.Kr.",
    title: "Tio Guds bud vid Sinaiberget",
    era: "utvandringen",
    siteId: "sinai",
    coordinates: [28.539, 33.975],
    zoom: 7,
    scripture: {
      reference: "2 Mos 20:1–17",
      quote: "Gud talade alla dessa ord: 'Jag är Herren, din Gud, som har fört dig ut ur Egyptens land, ur slavlägret. Du skall inte ha andra gudar vid sidan av mig.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EXO.20"
    }
  },
  {
    id: "sinoknen-manna",
    year: "1446 f.Kr.",
    title: "Manna och vaktlar i Sinöknen",
    era: "utvandringen",
    siteId: "sinoknen",
    coordinates: [28.850, 33.200],
    zoom: 7,
    scripture: {
      reference: "2 Mos 16:1–4",
      quote: "Hela Israels församling kom till Sinöknen... Då sade Herren till Mose: 'Se, jag skall låta bröd regna från himlen åt er.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EXO.16"
    }
  },
  {
    id: "mose-nebo",
    year: "1406 f.Kr.",
    title: "Mose skådar det utlovade landet från Neboberget",
    era: "utvandringen",
    siteId: "nebo",
    coordinates: [31.768, 35.725],
    zoom: 8,
    scripture: {
      reference: "5 Mos 34:1–8",
      quote: "Mose gick upp från Moabs hedar till berget Nebo... Och Herren visade honom hela landet.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/DEU.34"
    }
  },

  // --- ERÖVRINGEN & DOMARTIDEN ---
  {
    id: "jordanfloden-overgang",
    year: "1406 f.Kr.",
    title: "Övergången av Jordanfloden",
    era: "domartiden",
    siteId: "jordanfloden",
    coordinates: [31.850, 35.550],
    zoom: 9,
    scripture: {
      reference: "Jos 3:14–17",
      quote: "När prästerna som bar arken steg ner i Jordan och deras fötter nådde vattenbrynet, stannade vattnet som kom uppifrån.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/JOS.3"
    }
  },
  {
    id: "jeriko-erovring",
    year: "ca 1400 f.Kr.",
    title: "Intåget i Kanaan och Jerikos fall",
    era: "domartiden",
    siteId: "jeriko",
    coordinates: [31.870, 35.444],
    zoom: 9,
    scripture: {
      reference: "Jos 6:20",
      quote: "Folket ropade och prästerna blåste i hornen. När folket hörde hornstöten stötte de upp ett stort krigsrop, och muren rasade.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/JOS.6"
    }
  },
  {
    id: "hanna-samuel-shilo",
    year: "ca 1100 f.Kr.",
    title: "Hanna ber i helgedomen i Shilo",
    era: "domartiden",
    siteId: "shilo",
    coordinates: [32.055, 35.289],
    zoom: 9,
    scripture: {
      reference: "1 Sam 1:10–11",
      quote: "Fylld av bitterhet bad hon till Herren och grät bittert... 'Herre Sebaot, om du ser till din tjänarinna i hennes nöd... skall jag ge honom åt Herren för hela hans liv.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1SA.1"
    }
  },

  // --- FÖRENADE KUNGARIKET ---
  {
    id: "david-goliat",
    year: "1024 f.Kr.",
    title: "David besegrar Goljat i Elahdalen",
    era: "forenade_riket",
    siteId: "elahdalen",
    coordinates: [31.688, 34.990],
    zoom: 10,
    scripture: {
      reference: "1 Sam 17:1–58",
      quote: "David sade till filistén: 'Du kommer mot mig med svärd och spjut och lans, men jag kommer mot dig i Herren Sebaots namn.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1SA.17"
    }
  },
  {
    id: "david-jerusalem",
    year: "ca 1000 f.Kr.",
    title: "David gör Jerusalem till huvudstad",
    era: "forenade_riket",
    siteId: "jerusalem",
    coordinates: [31.777, 35.234],
    zoom: 9,
    scripture: {
      reference: "2 Sam 5:7–9",
      quote: "David intog Sionborgen, det som nu är Davids stad... David slog sig ner i borgen och kallade den Davids stad.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/2SA.5"
    }
  },
  {
    id: "salomo-tempel",
    year: "ca 966 f.Kr.",
    title: "Salomo bygger templet i Jerusalem",
    era: "forenade_riket",
    siteId: "jerusalem",
    coordinates: [31.778, 35.235],
    zoom: 10,
    scripture: {
      reference: "1 Kung 6:1–38",
      quote: "Under Salomos fjärde regeringsår... började han bygga Herrens hus.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1KI.6"
    }
  },
  {
    id: "salomo-megiddo",
    year: "ca 950 f.Kr.",
    title: "Salomo bygger vagnstäder i Megiddo",
    era: "forenade_riket",
    siteId: "megiddo",
    coordinates: [32.585, 35.184],
    zoom: 9,
    scripture: {
      reference: "1 Kung 9:15",
      quote: "Så förhöll det sig med dagsverket som kung Salomo skrev ut för att bygga Herrens hus... samt muren i Jerusalem och Hasor, Megiddo och Geser.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1KI.9"
    }
  },

  // --- DELADE RIKETS TID ---
  {
    id: "rikets-delning-sikem",
    year: "930 f.Kr.",
    title: "Rikets delning vid Sikem",
    era: "delade_riket",
    siteId: "sikem",
    coordinates: [32.213, 35.282],
    zoom: 8,
    scripture: {
      reference: "1 Kung 12:1–20",
      quote: "Rehabeam reste till Sikem, ty dit hade hela Israel kommit för att göra honom till kung... Men Israel gjorde uppror mot Davids ätt.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1KI.12"
    }
  },
  {
    id: "elia-karmel",
    year: "ca 860 f.Kr.",
    title: "Elia mot Baalsprofeterna på Karmelberget",
    era: "delade_riket",
    siteId: "karmel",
    coordinates: [32.673, 35.038],
    zoom: 9,
    scripture: {
      reference: "1 Kung 18:38–39",
      quote: "Då föll Herrens eld ned och förtärde offret... När allt folket såg det föll de ner på sina ansikten och sade: 'Herren är Gud!'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/1KI.18"
    }
  },

  // --- EXILEN & PERSISK TID ---
  {
    id: "babyloniska-exilen",
    year: "586 f.Kr.",
    title: "Jerusalems fall och den babyloniska exilen",
    era: "exilen_perser",
    siteId: "jerusalem",
    coordinates: [31.777, 35.234],
    zoom: 8,
    scripture: {
      reference: "2 Kung 25:1–21",
      quote: "Nebukadnessar, kungen i Babylon, kom med hela sin här mot Jerusalem... Han brände ner Herrens hus och kungahuset och alla hus i Jerusalem.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/2KI.25"
    }
  },
  {
    id: "aterkomst-exil",
    year: "538 f.Kr.",
    title: "Kyros edikt och återkomsten från exilen",
    era: "exilen_perser",
    siteId: "jerusalem",
    coordinates: [31.777, 35.234],
    zoom: 8,
    scripture: {
      reference: "Esra 1:1–4",
      quote: "Under sitt första regeringsår lät kung Kyros av Persien utfärda ett påbud... 'Herren, himlens Gud... har uppdragit åt mig att bygga ett hus åt honom i Jerusalem.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EZR.1"
    }
  },
  {
    id: "kyros-edikt-ekbatana",
    year: "ca 520 f.Kr.",
    title: "Kyros edikt återfinns i Ekbatana",
    era: "exilen_perser",
    siteId: "ekbatana",
    coordinates: [34.798, 48.514],
    zoom: 7,
    scripture: {
      reference: "Esra 6:1–3",
      quote: "Och i borgen Ekbatana i provinsen Medien fann man en skriftrulle... 'Under sitt första regeringsår gav kung Kyros denna befallning angående Guds hus i Jerusalem.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/EZR.6"
    }
  },

  // --- EVANGELIERNA & JESU LIV ---
  {
    id: "jesu-fodelse",
    year: "4 f.Kr.",
    title: "Jesu födelse i Betlehem",
    era: "nt_evangelier",
    siteId: "betlehem",
    coordinates: [31.705, 35.202],
    zoom: 10,
    scripture: {
      reference: "Luk 2:1–20",
      quote: "Och hon födde sin förstfödde son, lindade honom och lade honom i en krubba, eftersom det inte fanns plats för dem i härbärget.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/LUK.2"
    }
  },
  {
    id: "vattnet-till-vin",
    year: "27 e.Kr.",
    title: "Jesus förvandlar vatten till vin i Kana",
    era: "nt_evangelier",
    siteId: "kana",
    coordinates: [32.747, 35.338],
    zoom: 10,
    scripture: {
      reference: "Joh 2:1–11",
      quote: "Jesus sade till dem: 'Fyll krukorna med vatten.' Och de fyllde dem ända till bredden... Detta var det första av de tecken som Jesus gjorde.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/JHN.2"
    }
  },
  {
    id: "samariska-kvinnan",
    year: "27 e.Kr.",
    title: "Jesus möter den samariska kvinnan vid Jakobs källa",
    era: "nt_evangelier",
    siteId: "sykar",
    coordinates: [32.213, 35.282],
    zoom: 10,
    scripture: {
      reference: "Joh 4:1–42",
      quote: "Jesus sade till henne: 'Var och en som dricker av det här vattnet blir törstig igen. Men den som dricker av det vatten jag ger honom skall aldrig mer bli törstig.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/JHN.4"
    }
  },
  {
    id: "jesus-kapernaum",
    year: "27 e.Kr.",
    title: "Jesus gör Kapernaum till sitt centrum",
    era: "nt_evangelier",
    siteId: "kapernaum",
    coordinates: [32.880, 35.575],
    zoom: 10,
    scripture: {
      reference: "Matt 4:13–14",
      quote: "Han lämnade Nasaret och slog sig ner i Kapernaum, som ligger vid sjön... för att det som sagt genom profeten Jesaja skulle uppfyllas.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.4"
    }
  },
  {
    id: "bergspredikan",
    year: "28 e.Kr.",
    title: "Bergspredikan",
    era: "nt_evangelier",
    siteId: "saligprisningarnas_berg",
    coordinates: [32.881, 35.556],
    zoom: 10,
    scripture: {
      reference: "Matt 5:1–7:29",
      quote: "När han såg skadorna gick han upp på berget. Han satte sig ner och hans lärjungar kom fram till honom. Han började undervisa dem...",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.5"
    }
  },
  {
    id: "jesus-stillar-stormen",
    year: "28 e.Kr.",
    title: "Jesus stillar stormen på Gennesarets sjö",
    era: "nt_evangelier",
    siteId: "gennesarets_sjo",
    coordinates: [32.820, 35.580],
    zoom: 10,
    scripture: {
      reference: "Mark 4:35–41",
      quote: "Han reste sig och talade strängt till vinden och sade till sjön: 'Tig! Var tyst!' Och vinden lade sig och det blev alldeles lugnt.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MRK.4"
    }
  },
  {
    id: "jesus-gar-pa-vattnet",
    year: "29 e.Kr.",
    title: "Jesus går på vattnet",
    era: "nt_evangelier",
    siteId: "gennesarets_sjo",
    coordinates: [32.820, 35.580],
    zoom: 10,
    scripture: {
      reference: "Matt 14:22–33",
      quote: "I den fjärde nattväkten kom han till dem, gående på sjön. När lärjungarna fick se honom gå på sjön blev de förskräckta...",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.14"
    }
  },
  {
    id: "lassaros-uppvackande",
    year: "30 e.Kr.",
    title: "Lassaros uppväckande i Betania",
    era: "nt_evangelier",
    siteId: "betania",
    coordinates: [31.771, 35.260],
    zoom: 10,
    scripture: {
      reference: "Joh 11:1–44",
      quote: "När han hade sagt detta ropade han med hög röst: 'Lassaros, kom ut!' Och den döde kom ut.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/JHN.11"
    }
  },
  {
    id: "intaget-i-jerusalem",
    year: "30 e.Kr.",
    title: "Intåget i Jerusalem",
    era: "nt_evangelier",
    siteId: "jerusalem",
    coordinates: [31.777, 35.234],
    zoom: 10,
    scripture: {
      reference: "Matt 21:1–11",
      quote: "Det mesta av folket bredde ut sina mantlar på vägen... Och folket ropade: 'Hosianna Davids son! Välsignad är han som kommer i Herrens namn!'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.21"
    }
  },
  {
    id: "jesu-korsfastelse",
    year: "30 e.Kr.",
    title: "Jesu korsfästelse och död",
    era: "nt_evangelier",
    siteId: "golgata",
    coordinates: [31.778, 35.229],
    zoom: 10,
    scripture: {
      reference: "Matt 27:32–56",
      quote: "När de kom till en plats som kallas Golgata... korsfäste de honom.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.27"
    }
  },

  // --- APOSTLAGÄRNINGARNA & BREVEN ---
  {
    id: "jesu-uppstandelse",
    year: "30 e.Kr.",
    title: "Jesu uppståndelse",
    era: "nt_tid",
    siteId: "jerusalem",
    coordinates: [31.778, 35.229],
    zoom: 10,
    scripture: {
      reference: "Matt 28:1–10",
      quote: "Ängeln sade till kvinnorna: 'Var inte rädda. Jag vet att ni söker efter Jesus, som blev korsfäst. Han är inte här, han har uppstått.'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/MAT.28"
    }
  },
  {
    id: "jesu-himmelsfard",
    year: "30 e.Kr.",
    title: "Jesu himmelsfärd på Oljeberget",
    era: "nt_tid",
    siteId: "oljeberget",
    coordinates: [31.779, 35.244],
    zoom: 10,
    scripture: {
      reference: "Apg 1:9–12",
      quote: "När han hade sagt detta lyftes han upp medan de såg på, och ett moln tog honom ur deras åsyn.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.1"
    }
  },
  {
    id: "pingstdagen",
    year: "30 e.Kr.",
    title: "Den helige Ande utgjuts på Pingstdagen",
    era: "nt_tid",
    siteId: "jerusalem",
    coordinates: [31.777, 35.234],
    zoom: 10,
    scripture: {
      reference: "Apg 2:1–41",
      quote: "Då hördes plötsligt från himlen ett dån som av en stormvind... Alla fylldes av helig ande och började tala andra tungomål.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.2"
    }
  },
  {
    id: "paulus-antokia",
    year: "47 e.Kr.",
    title: "Församlingen i Antiochia växer",
    era: "nt_tid",
    siteId: "antiochia",
    coordinates: [36.202, 36.160],
    zoom: 8,
    scripture: {
      reference: "Apg 11:26",
      quote: "Det var i Antiochia som lärjungarna för första gången började kallas 'kristna'.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.11"
    }
  },
  {
    id: "paulus-filippi",
    year: "50 e.Kr.",
    title: "Paulus i Filippi",
    era: "nt_tid",
    siteId: "filippi",
    coordinates: [41.013, 24.286],
    zoom: 8,
    scripture: {
      reference: "Apg 16:11–40",
      quote: "Vi lade ut från Troas och seglade rakt över till Samothrake och nästa dag till Neapolis, och därifrån till Filippi.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.16"
    }
  },
  {
    id: "paulus-tessalonike",
    year: "50 e.Kr.",
    title: "Paulus i Tessalonike",
    era: "nt_tid",
    siteId: "tessalonike",
    coordinates: [40.640, 22.944],
    zoom: 8,
    scripture: {
      reference: "Apg 17:1–9",
      quote: "De tog vägen över Amfipolis och Apollonia och kom till Tessalonike, där judarna hade en synagoga.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.17"
    }
  },
  {
    id: "paulus-areopagen",
    year: "50 e.Kr.",
    title: "Paulus predikar på Areopagen i Aten",
    era: "nt_tid",
    siteId: "aten",
    coordinates: [37.975, 23.725],
    zoom: 8,
    scripture: {
      reference: "Apg 17:16–34",
      quote: "Paulus trädde fram inför Areopagen och sade: 'Atens män, jag ser av allt att ni är mycket religiösa...'",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.17"
    }
  },
  {
    id: "paulus-korint",
    year: "51 e.Kr.",
    title: "Paulus undervisar i Korint",
    era: "nt_tid",
    siteId: "korint",
    coordinates: [37.906, 22.879],
    zoom: 8,
    scripture: {
      reference: "Apg 18:1–18",
      quote: "Därefter lämnade Paulus Aten och kom till Korint. Där träffade han en jude vid namn Aquila...",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.18"
    }
  },
  {
    id: "paulus-efesos",
    year: "54 e.Kr.",
    title: "Paulus verkar i Efesos",
    era: "nt_tid",
    siteId: "efesos",
    coordinates: [37.940, 27.364],
    zoom: 8,
    scripture: {
      reference: "Apg 19:1–41",
      quote: "Medan Apollos var i Korint kom Paulus efter sin resa genom inlandet ner till Efesos.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.19"
    }
  },
  {
    id: "paulus-rom",
    year: "60 e.Kr.",
    title: "Paulus anländer som fånge till Rom",
    era: "nt_tid",
    siteId: "rom",
    coordinates: [41.902, 12.496],
    zoom: 8,
    scripture: {
      reference: "Apg 28:16–31",
      quote: "När vi kom till Rom fick Paulus tillstånd att bo för sig själv tillsammans med den soldat som bevakade honom.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/ACT.28"
    }
  },

  // --- UPPENBARELSEBOKEN ---
  {
    id: "uppenbarelsen-patmos",
    year: "95 e.Kr.",
    title: "Johannes får sina uppenbarelser på Patmos",
    era: "uppenbarelsen",
    siteId: "patmos",
    coordinates: [37.315, 26.542],
    zoom: 8,
    scripture: {
      reference: "Upp 1:1–20",
      quote: "Jag, Johannes, er broder... befann mig på den ö som kallas Patmos för Guds ords och Jesu vittnesbörds skull.",
      externalUrl: "https://www.bibeln.se/bibel/B2000/REV.1"
    }
  }
];