// Geografiska polygoner för Israels 12 stamområden (ca Josua bok 13–21)
export const STAM_OMRADEN = [
  {
    id: 'juda_stam',
    namn: 'Juda',
    farg: '#2563eb', // Blå
    polygon: [
      [31.20, 34.50],
      [31.80, 34.80],
      [31.80, 35.40],
      [31.20, 35.30]
    ]
  },
  {
    id: 'benjamin_stam',
    namn: 'Benjamin',
    farg: '#7c3aed', // Lila
    polygon: [
      [31.80, 35.00],
      [31.95, 35.00],
      [31.95, 35.45],
      [31.80, 35.45]
    ]
  },
  {
    id: 'efraim_stam',
    namn: 'Efraim',
    farg: '#059669', // Grön
    polygon: [
      [31.95, 34.90],
      [32.25, 34.95],
      [32.25, 35.50],
      [31.95, 35.45]
    ]
  },
  {
    id: 'manasse_vast_stam',
    namn: 'Manasse (Väst)',
    farg: '#d97706', // Bärnsten
    polygon: [
      [32.25, 34.85],
      [32.60, 34.90],
      [32.60, 35.55],
      [32.25, 35.50]
    ]
  },
  {
    id: 'manasse_ost_stam',
    namn: 'Manasse (Öst/Bashan)',
    farg: '#b45309', // Mörk Bärnsten
    polygon: [
      [32.60, 35.60],
      [33.30, 35.60],
      [33.30, 36.20],
      [32.60, 36.00]
    ]
  },
  {
    id: 'sebulon_stam',
    namn: 'Sebulon',
    farg: '#dc2626', // Röd
    polygon: [
      [32.60, 35.10],
      [32.80, 35.10],
      [32.80, 35.35],
      [32.60, 35.35]
    ]
  },
  {
    id: 'isaskar_stam',
    namn: 'Isaskar',
    farg: '#ea580c', // Orange
    polygon: [
      [32.50, 35.30],
      [32.70, 35.30],
      [32.70, 35.55],
      [32.50, 35.55]
    ]
  },
  {
    id: 'aser_stam',
    namn: 'Aser',
    farg: '#0891b2', // Cyan
    polygon: [
      [32.70, 35.00],
      [33.25, 35.10],
      [33.25, 35.30],
      [32.70, 35.20]
    ]
  },
  {
    id: 'naftali_stam',
    namn: 'Naftali',
    farg: '#4f46e5', // Indigo
    polygon: [
      [32.75, 35.30],
      [33.30, 35.30],
      [33.30, 35.60],
      [32.75, 35.55]
    ]
  },
  {
    id: 'ruben_stam',
    namn: 'Ruben',
    farg: '#9333ea', // Violett
    polygon: [
      [31.30, 35.55],
      [31.80, 35.55],
      [31.80, 36.10],
      [31.30, 36.10]
    ]
  },
  {
    id: 'gad_stam',
    namn: 'Gad',
    farg: '#16a34a', // Ljusgrön
    polygon: [
      [31.80, 35.55],
      [32.60, 35.55],
      [32.60, 36.10],
      [31.80, 36.10]
    ]
  },
  {
    id: 'dan_stam',
    namn: 'Dan',
    farg: '#e11d48', // Rosa/Röd
    polygon: [
      [33.20, 35.60],
      [33.35, 35.60],
      [33.35, 35.70],
      [33.20, 35.70]
    ]
  }
];

export const GT_STAMMAR_PLATSER = [
  {
    id: 'hebron_stam',
    namn: 'Hebron (Juda huvudort)',
    idag: 'Al-Khalil, Västbanken',
    koordinater: [31.5326, 35.0998],
    epokId: 'gt_stammar',
    kategori: 'Stam-huvudort / Tillflyktsstad',
    prioritet: 1,
    beskrivning: 'Juda stams viktigaste huvudort i bergsbygden och en av de tre tillflyktsstäderna väster om Jordanfloden.',
    bibelreferenser: ['Jos 15:13', 'Jos 20:7']
  },
  {
    id: 'shilo_stam',
    namn: 'Shilo (Efraim)',
    idag: 'Khirbet Seilun, Västbanken',
    koordinater: [32.0528, 35.2917],
    epokId: 'gt_stammar',
    kategori: 'Kultcentrum',
    prioritet: 1,
    beskrivning: 'Huvudort i Efraim där tabernaklet upprättades och där Josua kastade lott om landets fördelning bland stammarna.',
    bibelreferenser: ['Jos 18:1-10']
  },
  {
    id: 'gibeon_stam',
    namn: 'Gibeon (Benjamin)',
    idag: 'El-Jib, Västbanken',
    koordinater: [31.8500, 35.1833],
    epokId: 'gt_stammar',
    kategori: 'Levitstad',
    prioritet: 1,
    beskrivning: 'En av Benjamins stams mest framstående städer, senare tilldelad aronsönerna som levitstad.',
    bibelreferenser: ['Jos 18:25', 'Jos 21:17']
  },
  {
    id: 'sikem_stam',
    namn: 'Sikem (Manasse/Efraim)',
    idag: 'Nablus, Västbanken',
    koordinater: [32.2133, 35.2847],
    epokId: 'gt_stammar',
    kategori: 'Tillflyktsstad',
    prioritet: 1,
    beskrivning: 'Central samlingsort i Efraims bergsbygd och tillflyktsstad för den som av misstag råkat döda någon.',
    bibelreferenser: ['Jos 20:7', 'Jos 24:1']
  },
  {
    id: 'kadesh_galileen',
    namn: 'Kadesh i Galileen (Naftali)',
    idag: 'Tel Kedesh, Israel',
    koordinater: [33.1114, 35.5286],
    epokId: 'gt_stammar',
    kategori: 'Tillflyktsstad',
    prioritet: 1,
    beskrivning: 'Naftalis stams befästa tillflyktsstad i Galiléns bergsbygd.',
    bibelreferenser: ['Jos 20:7', 'Jos 21:32']
  },
  {
    id: 'ramot_gilead_stam',
    namn: 'Ramot i Gilead (Gad)',
    idag: 'Ar-Ramtha, Jordanien',
    koordinater: [32.5583, 36.0083],
    epokId: 'gt_stammar',
    kategori: 'Tillflyktsstad (Öst)',
    prioritet: 1,
    beskrivning: 'Gads stams viktigaste tillflyktsstad öster om Jordanfloden.',
    bibelreferenser: ['Jos 20:8']
  },
  {
    id: 'bezer_ruben',
    namn: 'Bezer (Ruben)',
    idag: 'Umm al-Amad, Jordanien',
    koordinater: [31.6333, 35.9667],
    epokId: 'gt_stammar',
    kategori: 'Tillflyktsstad (Öst)',
    prioritet: 1,
    beskrivning: 'Rubens stams tillflyktsstad belägen på högslätten öster om Döda havet.',
    bibelreferenser: ['Jos 20:8']
  },
  {
    id: 'golan_manasse',
    namn: 'Golan i Bashan (Östra Manasse)',
    idag: 'Golanhöjderna',
    koordinater: [32.9000, 35.7500],
    epokId: 'gt_stammar',
    kategori: 'Tillflyktsstad (Öst)',
    prioritet: 1,
    beskrivning: 'Östra Manasses tillflyktsstad i det bördiga Bashan-området.',
    bibelreferenser: ['Jos 20:8']
  }
];