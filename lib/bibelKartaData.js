// lib/bibelKartaData.js

export const EPOKER = [
  { id: 'gt_patriarker', namn: 'Patriarkerna & Uttåget (ca 2000–1200 f.Kr.)' },
  { id: 'gt_monarki', namn: 'Förenade & Delade riket (ca 1000–586 f.Kr.)' },
  { id: 'nt_evangelier', namn: 'Jesu tid & Evangelierna (ca 4 f.Kr.–30 e.Kr.)' },
  { id: 'nt_paulus', namn: 'Apostlagärningarna & Paulus resor (ca 30–65 e.Kr.)' },
  { id: 'kyrkohistoria', namn: 'Tidig kyrkohistoria & Koncilier (ca 100–451 e.Kr.)' },
];

export const PLATSER = [
  // ==========================================
  // 1. PATRIARKERNA & UTTÅGET
  // ==========================================
  {
    id: 'ur',
    namn: 'Ur i Kaldéen',
    idag: 'Tell el-Muqayyar, Irak',
    koordinater: [30.9628, 46.1031],
    epokId: 'gt_patriarker',
    kategori: 'Ursprungsort',
    beskrivning: 'Abrahams och hans familjs ursprungliga hemstad i södra Mesopotamien innan kallelsen att bryta upp mot Kanaans land.',
    bibelreferenser: ['1 Mos 11:28-31', '1 Mos 15:7', 'Neh 9:7'],
  },
  {
    id: 'baran',
    namn: 'Haran',
    idag: 'Harran, Turkiet',
    koordinater: [36.8633, 39.0258],
    epokId: 'gt_patriarker',
    kategori: 'Handelsstad',
    beskrivning: 'Platsen där Abraam (Abraham) bodde med sin far Tera innan vandringen fortsatte söderut mot Kanaan. Härifrån hämtades senare även Rebekka som hustru åt Isak.',
    bibelreferenser: ['1 Mos 11:31', '1 Mos 12:4-5', '1 Mos 24:10'],
  },
  {
    id: 'sikem_gt',
    namn: 'Sikem',
    idag: 'Nablus, Västbanken',
    koordinater: [32.2133, 35.2847],
    epokId: 'gt_patriarker',
    kategori: 'Helgedomsort',
    beskrivning: 'Första anhalten för Abraham i Kanaan där Herren uppenbarade sig och Abraham byggde ett altare. Här slog även Jakob läger och köpte ett stycke land.',
    bibelreferenser: ['1 Mos 12:6-7', '1 Mos 33:18-20', 'Jos 24:1'],
  },
  {
    id: 'sinai',
    namn: 'Sinai berg (Horeb)',
    idag: 'Jabal Musa, Egypten',
    koordinater: [28.5394, 33.9753],
    epokId: 'gt_patriarker',
    kategori: 'Heligt berg',
    beskrivning: 'Platsen för förbundsslutandet mellan Gud och Israels folk under ökenvandringen. Här tog Mose emot de tio budorden och lagens tavlor.',
    bibelreferenser: ['2 Mos 19:1-25', '2 Mos 20:1-17', '5 Mos 5:1-22'],
  },

  // ==========================================
  // 2. FÖRENADE & DELADE RIKET
  // ==========================================
  {
    id: 'hebron',
    namn: 'Hebron',
    idag: 'Al-Khalil, Västbanken',
    koordinater: [31.5326, 35.0998],
    epokId: 'gt_monarki',
    kategori: 'Kungastad / Gravplats',
    beskrivning: 'Davids första huvudstad där han smordes till konung över Juda och regerade i sju år och sex månader innan erövringen av Jerusalem. Här ligger även Makpela hula med patriarkgravarna.',
    bibelreferenser: ['2 Sam 2:1-4', '2 Sam 5:1-5', '1 Mos 23:19'],
  },
  {
    id: 'jerusalem_gt',
    namn: 'Jerusalem (Sions borg)',
    idag: 'Jerusalem',
    koordinater: [31.7767, 35.2345],
    epokId: 'gt_monarki',
    kategori: 'Huvudstad & Tempelstad',
    beskrivning: 'David intog staden från jebuséerna och gjorde den till förenade rikets politiska och religiösa centrum. Salomo uppförde det första templet på Moria berg.',
    bibelreferenser: ['2 Sam 5:6-10', '1 Kung 6:1-38', 'Ps 122:1-9'],
  },
  {
    id: 'samaria',
    namn: 'Samaria',
    idag: 'Sebastia, Västbanken',
    koordinater: [32.2764, 35.1903],
    epokId: 'gt_monarki',
    kategori: 'Huvudstad (Nordriket)',
    beskrivning: 'Grundades av kung Omri och fungerade som huvudstad i Nordriket (Israel) fram till stadens fall och assyriska deportationen år 722 f.Kr.',
    bibelreferenser: ['1 Kung 16:24', '2 Kung 17:5-6'],
  },

  // ==========================================
  // 3. JESU TID & EVANGELIERNA
  // ==========================================
  {
    id: 'nasaret',
    namn: 'Nasaret',
    idag: 'En-Nasira, Israel',
    koordinater: [32.7019, 35.3033],
    epokId: 'nt_evangelier',
    kategori: 'Uppväxtort',
    beskrivning: 'Byn i Galileen där Maria tog emot bebådelsen och där Jesus växte upp hos Josef och Maria fram till sin offentliga verksamhet.',
    bibelreferenser: ['Luk 1:26-38', 'Luk 2:39-40', 'Matt 2:23'],
  },
  {
    id: 'betlehem',
    namn: 'Betlehem',
    idag: 'Beit Lahm, Västbanken',
    koordinater: [31.7057, 35.2024],
    epokId: 'nt_evangelier',
    kategori: 'Födelseort',
    beskrivning: 'Konung Davids hemstad där Messias föddes i enlighet med Mika profetia.',
    bibelreferenser: ['Mika 5:2', 'Matt 2:1-12', 'Luk 2:1-20'],
  },
  {
    id: 'kapernaum',
    namn: 'Kapernaum',
    idag: 'Kfar Nahum, Israel',
    koordinater: [32.8811, 35.5750],
    epokId: 'nt_evangelier',
    kategori: 'Jesu bas i Galileen',
    beskrivning: 'Fiskebyn vid Genesarets sjö som utgjorde centrum för Jesu predikan, undervisning och underverk i Galileen.',
    bibelreferenser: ['Matt 4:13-17', 'Mark 1:21-34', 'Joh 6:24-59'],
  },
  {
    id: 'jerusalem_nt',
    namn: 'Jerusalem',
    idag: 'Jerusalem',
    koordinater: [31.7767, 35.2345],
    epokId: 'nt_evangelier',
    kategori: 'Helig stad',
    beskrivning: 'Platsen för Jesu sista vecka, den sista måltiden, korsfästelsen på Golgata, uppståndelsen samt Den Helige Andes utgjutande vid pingst.',
    bibelreferenser: ['Matt 21–28', 'Mark 11–16', 'Luk 19–24', 'Joh 12–20'],
  },

  // ==========================================
  // 4. PAULUS RESOR & APOSTLAGÄRNINGARNA
  // ==========================================
  {
    id: 'antiokia_syrien',
    namn: 'Antiokia vid Orontes',
    idag: 'Antakya, Turkiet',
    koordinater: [36.2021, 36.1601],
    epokId: 'nt_paulus',
    kategori: 'Missionscentrum',
    beskrivning: 'Utsändningsort för Paulus tre missionsresor. Det var här Jesus efterföljare för första gången benämndes "kristna".',
    bibelreferenser: ['Apg 11:19-26', 'Apg 13:1-3', 'Apg 15:30-41'],
  },
  {
    id: 'filippi',
    namn: 'Filippi',
    idag: 'Krenides, Grekland',
    koordinater: [41.0131, 24.2869],
    epokId: 'nt_paulus',
    kategori: 'Första församlingen i Europa',
    beskrivning: 'Första staden i Europa där Paulus predikade. Här döptes Lydia och en församling grundades som Paulus senare skrev sitt Brev till filipperna till.',
    bibelreferenser: ['Apg 16:11-40', 'Fil 1:1-11'],
  },
  {
    id: 'aten',
    namn: 'Aten',
    idag: 'Aten, Grekland',
    koordinater: [37.9755, 23.7257],
    epokId: 'nt_paulus',
    kategori: 'Kultur- och filosoficentrum',
    beskrivning: 'Platsen för Paulus berömda tal inför stoiska och epikureiska filosofer på Areopagen (Mars höjd).',
    bibelreferenser: ['Apg 17:16-34'],
  },
  {
    id: 'efesos',
    namn: 'Efesos',
    idag: 'Selçuk, Turkiet',
    koordinater: [37.9486, 27.3680],
    epokId: 'nt_paulus',
    kategori: 'Metropol & Missionsbas',
    beskrivning: 'Paulus bodde och undervisade här i närmare tre år under sin tredje missionsresa. Staden var känd för Artemistemplet.',
    bibelreferenser: ['Apg 19:1-41', 'Ef 1:1-2'],
  },
  {
    id: 'rom',
    namn: 'Rom',
    idag: 'Rom, Italien',
    koordinater: [41.9028, 12.4964],
    epokId: 'nt_paulus',
    kategori: 'Rikets huvudstad',
    beskrivning: 'Slutmålet för Paulus resa som fånge. Här satt han i husarrest och undervisade innan han enligt traditionen led martyrdöden under Nero.',
    bibelreferenser: ['Apg 28:14-31', 'Rom 1:1-15'],
  },

  // ==========================================
  // 5. TIDIG KYRKOHISTORIA & KONCILIER
  // ==========================================
  {
    id: 'nicea',
    namn: 'Nicea',
    idag: 'İznik, Turkiet',
    koordinater: [40.4286, 29.7215],
    epokId: 'kyrkohistoria',
    kategori: 'Ekumeniskt koncilium (325 e.Kr.)',
    beskrivning: 'Det 1:a ekumeniska konciliet sammankallat av kejsar Konstantin I. Bekräftade Kristi gudomlighet och avvisade arianismen.',
    kyrkohistoriskBetydelse: 'Skapade den första versionen av den niceanska trosbekännelsen.',
  },
  {
    id: 'konstantinopel',
    namn: 'Konstantinopel',
    idag: 'Istanbul, Turkiet',
    koordinater: [41.0082, 28.9784],
    epokId: 'kyrkohistoria',
    kategori: 'Ekumeniskt koncilium (381 e.Kr.)',
    beskrivning: 'Det 2:a ekumeniska konciliet. Kompletterade trosbekännelsen gällande Den Helige Andes gudomlighet.',
    kyrkohistoriskBetydelse: 'Definierade den slutgiltiga Niceansk-konstantinopolitanska trosbekännelsen som används än idag.',
  },
  {
    id: 'efesos_koncilium',
    namn: 'Efesos (Konciliet)',
    idag: 'Selçuk, Turkiet',
    koordinater: [37.9486, 27.3680],
    epokId: 'kyrkohistoria',
    kategori: 'Ekumeniskt koncilium (431 e.Kr.)',
    beskrivning: 'Det 3:e ekumeniska konciliet. Avvisade nestorianismen och slog fast att Maria kan kallas *Theotokos* (Gudaföderska) eftersom Kristi gudomliga och mänskliga natur är oseparabla.',
    kyrkohistoriskBetydelse: 'Kristologisk dogm om Kristi odelbara person.',
  },
  {
    id: 'kalkedon',
    namn: 'Kalkedon',
    idag: 'Kadıköy (Istanbul), Turkiet',
    koordinater: [40.9903, 29.0275],
    epokId: 'kyrkohistoria',
    kategori: 'Ekumeniskt koncilium (451 e.Kr.)',
    beskrivning: 'Det 4:e ekumeniska konciliet. Slog fast att Kristus har två naturer (sann Gud och sann människa) utan sammanblandning, förvandling, delning eller åtskillnad.',
    kyrkohistoriskBetydelse: 'Formulerade den kalkedoniska trosbekännelsen.',
  },
  {
    id: 'alexandria',
    namn: 'Alexandria',
    idag: 'Alexandria, Egypten',
    koordinater: [31.2001, 29.9187],
    epokId: 'kyrkohistoria',
    kategori: 'Patriarkat & Lärdomscentrum',
    beskrivning: 'Ett av den tidiga kyrkans viktigaste patriarkatsäten och teologiska kateket-skolor (med teologer som Athanasios, Klemens och Origenes).',
    kyrkohistoriskBetydelse: 'Centrum för alexandrinsk teologi och påskbrevens datering.',
  }
];

export const RUTTER = [
  // --- PATRIARKERNA & UTTÅGET ---
  {
    id: 'okenvandringen',
    namn: 'Uttåget & Ökenvandringen',
    epokId: 'gt_patriarker',
    farg: '#d97706', // Bärnstensgul / Ökensand
    punkter: [
      [30.05, 31.23],   // Rameses (Egypten)
      [29.97, 32.55],   // Röda havet / Sävhavet
      [28.5394, 33.9753], // Sinai berg (Horeb)
      [29.5, 34.9],     // Kadesh Barnea
      [30.5, 35.5],     // Edoms/Moabs gräns
      [31.7, 35.8],     // Nebo berg (Moabs slätter)
    ]
  },

  // --- PAULUS RESOR ---
  {
    id: 'paulus_resa_1',
    namn: 'Paulus 1:a missionsresa (ca 46–48 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#c85a32', // Terrakotta / Rustik röd
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [35.1264, 33.4299], // Cypern (Salamis/Pafos)
      [36.8848, 30.7056], // Perge / Attalia
      [38.2997, 31.3322], // Antiokia i Pisidien
      [37.8746, 32.4932], // Ikonion
      [37.2154, 32.3275], // Lystra & Derbe
      [36.2021, 36.1601], // Tillbaka till Antiokia
    ]
  },
  {
    id: 'paulus_resa_2',
    namn: 'Paulus 2:a missionsresa (ca 49–52 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#2563eb', // Blå
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [37.2154, 32.3275], // Derbe & Lystra
      [39.9208, 26.2386], // Troas
      [41.0131, 24.2869], // Filippi
      [40.6401, 22.9444], // Thessalonike
      [37.9755, 23.7257], // Aten
      [37.9386, 22.9322], // Korint
      [37.9486, 27.3680], // Efesos
      [31.7767, 35.2345], // Jerusalem
      [36.2021, 36.1601], // Antiokia
    ]
  },
  {
    id: 'paulus_resa_3',
    namn: 'Paulus 3:e missionsresa (ca 53–57 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#059669', // Grön
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [38.2997, 31.3322], // Galatiens/Frygiens område
      [37.9486, 27.3680], // Efesos (3 års vistelse)
      [41.0131, 24.2869], // Makedonien (Filippi)
      [37.9386, 22.9322], // Hellas / Korint
      [39.9208, 26.2386], // Troas
      [36.5436, 27.2883], // Miletos
      [32.8872, 35.0021], // Tyrus / Ptolemais
      [32.5000, 34.8900], // Cesarea
      [31.7767, 35.2345], // Jerusalem (Gripandet)
    ]
  },
  {
    id: 'paulus_romresa',
    namn: 'Paulus resa till Rom som fånge (ca 59–60 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#7c3aed', // Lila
    punkter: [
      [31.7767, 35.2345], // Jerusalem
      [32.5000, 34.8900], // Cesarea
      [33.5500, 35.3700], // Sidon
      [36.2500, 29.9800], // Myra i Lykien
      [34.9300, 24.7500], // Kreta (Goda hamnarna)
      [35.8997, 14.4426], // Malta (Skeppsbrottet)
      [37.0677, 15.2866], // Syrakusa (Sicilien)
      [40.8282, 14.1913], // Puteoli (Neapelbukten)
      [41.9028, 12.4964], // Rom
    ]
  }
];