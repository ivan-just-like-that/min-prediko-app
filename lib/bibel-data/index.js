import { GT_PATRIARKER_PLATSER } from './gtPatriarker';
import { GT_MONARKI_PLATSER } from './gtMonarki';
import { NT_EVANGELIER_PLATSER } from './ntEvangelier';
import { NT_PAULUS_PLATSER } from './ntPaulus';
import { TIDIG_KYRKOHISTORIA_PLATSER } from './tidigKyrkohistoria';
import { STAM_OMRADEN, GT_STAMMAR_PLATSER } from './gtStammar';

export { STAM_OMRADEN };

export const EPOKER = [
  { id: 'gt_patriarker', namn: 'Patriarkerna & Uttåget (ca 2000–1200 f.Kr.)' },
  { id: 'gt_stammar', namn: 'Israels 12 stammar (ca 1200 f.Kr.)' },
  { id: 'gt_monarki', namn: 'Förenade & Delade riket (ca 1000–586 f.Kr.)' },
  { id: 'nt_evangelier', namn: 'Jesu tid & Evangelierna (ca 4 f.Kr.–30 e.Kr.)' },
  { id: 'nt_paulus', namn: 'Apostlagärningarna & Paulus resor (ca 30–65 e.Kr.)' },
  { id: 'kyrkohistoria', namn: 'Tidig kyrkohistoria & Koncilier (ca 100–451 e.Kr.)' },
];

export const PLATSER = [
  ...GT_PATRIARKER_PLATSER,
  ...GT_STAMMAR_PLATSER,
  ...GT_MONARKI_PLATSER,
  ...NT_EVANGELIER_PLATSER,
  ...NT_PAULUS_PLATSER,
  ...TIDIG_KYRKOHISTORIA_PLATSER,
];

export const RUTTER = [
  // --- GT I ---
  {
    id: 'abrahams_vandring',
    namn: 'Abrahams vandring (Ur -> Haran -> Kanaan)',
    epokId: 'gt_patriarker',
    farg: '#b91c1c',
    punkter: [
      [30.9628, 46.1031],
      [36.8633, 39.0258],
      [32.2133, 35.2847],
      [31.9281, 35.2428],
      [31.5326, 35.0998],
      [31.2447, 34.8467],
      [30.7878, 31.8214],
    ]
  },
  {
    id: 'okenvandringen',
    namn: 'Uttåget & Ökenvandringen',
    epokId: 'gt_patriarker',
    farg: '#d97706',
    punkter: [
      [30.7878, 31.8214],
      [30.5500, 32.1000],
      [29.3667, 32.9000],
      [29.2833, 32.9667],
      [28.7167, 33.6167],
      [28.5394, 33.9753],
      [30.6500, 34.4167],
      [30.3167, 35.4000],
      [31.7658, 35.7250],
    ]
  },

  // --- GT II ---
  {
    id: 'exil_resan',
    namn: 'Judiska exilen (Jerusalem -> Babylon)',
    epokId: 'gt_monarki',
    farg: '#7c3aed',
    punkter: [
      [31.7767, 35.2345],
      [34.5000, 38.3000],
      [32.5422, 44.4214],
    ]
  },

  // --- NT II: PAULUS RESOR ---
  {
    id: 'paulus_resa_1',
    namn: 'Paulus 1:a missionsresa (ca 46–48 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#c85a32',
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [34.7754, 32.4245], // Cypern / Pafos
      [36.9603, 30.8542], // Perge
      [38.2997, 31.3322], // Antiokia i Pisidien
      [37.8746, 32.4932], // Ikonion
      [37.2154, 32.3275], // Lystra
      [37.1833, 33.3833], // Derbe
      [36.2021, 36.1601], // Tillbaka till Antiokia
    ]
  },
  {
    id: 'paulus_resa_2',
    namn: 'Paulus 2:a missionsresa (ca 49–52 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#2563eb',
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [37.2154, 32.3275], // Lystra & Derbe
      [39.9208, 26.2386], // Troas
      [41.0131, 24.2869], // Filippi
      [40.6401, 22.9444], // Thessalonike
      [37.9755, 23.7257], // Aten
      [37.9386, 22.9322], // Korint
      [32.5000, 34.8900], // Cesarea
      [36.2021, 36.1601], // Antiokia
    ]
  },
  {
    id: 'paulus_resa_3',
    namn: 'Paulus 3:e missionsresa (ca 53–57 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#059669',
    punkter: [
      [36.2021, 36.1601], // Antiokia
      [38.2997, 31.3322], // Galatien / Frygien
      [37.9486, 27.3680], // Efesos
      [41.0131, 24.2869], // Makedonien
      [37.9386, 22.9322], // Korint
      [39.9208, 26.2386], // Troas
      [37.5406, 27.2764], // Miletos
      [32.5000, 34.8900], // Cesarea
      [31.7767, 35.2345], // Jerusalem
    ]
  },
  {
    id: 'paulus_romresa',
    namn: 'Paulus resa till Rom som fånge (ca 59–60 e.Kr.)',
    epokId: 'nt_paulus',
    farg: '#7c3aed',
    punkter: [
      [31.7767, 35.2345], // Jerusalem
      [32.5000, 34.8900], // Cesarea
      [34.7754, 32.4245], // Cypern-sidan / Myra
      [35.8997, 14.4426], // Malta (Skeppsbrottet)
      [41.9028, 12.4964], // Rom
    ]
  }
];