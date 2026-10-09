'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export const HELGDAGAR = [
  {
    namn: '1:a söndagen i advent',
    tema: 'Ett nådens år',
    psaltarpsalm: 'Ps 24',
    argang1: { gt: 'Sak 9:9-10', epistel: 'Rom 13:11-14', evangelium: 'Matt 21:1-9' },
    argang2: { gt: 'Sak 9:9-10', epistel: 'Upp 3:20-22', evangelium: 'Joh 18:36-37' },
    argang3: { gt: 'Sak 9:9-10', epistel: 'Upp 5:1-5', evangelium: 'Luk 4:16-23' }
  },
  {
    namn: '2:a söndagen i advent',
    tema: 'Guds rike är nära',
    psaltarpsalm: 'Ps 85:9-14',
    argang1: { gt: 'Mik 4:1-4', epistel: 'Rom 15:4-7', evangelium: 'Luk 21:25-36' },
    argang2: { gt: 'Jes 35:1-10', epistel: 'Jak 5:7-11', evangelium: 'Matt 13:31-34' },
    argang3: { gt: 'Jer 33:14-16', epistel: 'Heb 10:32-39', evangelium: 'Mark 1:14-15' }
  },
  {
    namn: '3:e söndagen i advent',
    tema: 'Bana väg för Herren',
    psaltarpsalm: 'Ps 146:3-9',
    argang1: { gt: 'Jes 29:17-21', epistel: '1 Kor 4:1-5', evangelium: 'Matt 11:2-11' },
    argang2: { gt: 'Mal 4:4-6', epistel: '2 Pet 1:19-21', evangelium: 'Matt 11:12-19' },
    argang3: { gt: 'Jes 40:1-8', epistel: 'Gal 3:21-29', evangelium: 'Luk 3:1-15' }
  },
  {
    namn: '4:e söndagen i advent',
    tema: 'Herrens moder',
    psaltarpsalm: 'Ps 145:8-13',
    argang1: { gt: 'Jes 40:9-11', epistel: 'Rom 10:4-8', evangelium: 'Luk 1:46-55' },
    argang2: { gt: 'Sef 3:14-17', epistel: 'Fil 4:4-7', evangelium: 'Luk 1:30-35' },
    argang3: { gt: 'Jes 52:7-10', epistel: '2 Kor 1:17-22', evangelium: 'Luk 1:39-45' }
  },
  {
    namn: 'Julnatten',
    tema: 'Den heliga natten',
    psaltarpsalm: 'Ps 108:2-7',
    argang1: { gt: 'Jes 9:1a, 2-7', epistel: 'Heb 1:1-6', evangelium: 'Luk 2:1-20' },
    argang2: { gt: 'Jes 9:1a, 2-7', epistel: 'Heb 1:1-6', evangelium: 'Luk 2:1-20' },
    argang3: { gt: 'Jes 9:1a, 2-7', epistel: 'Heb 1:1-6', evangelium: 'Luk 2:1-20' }
  },
  {
    namn: 'Juldagen',
    tema: 'Jesu födelse',
    psaltarpsalm: 'Ps 72:1-7',
    argang1: { gt: 'Jes 9:2-7', epistel: '1 Tim 3:16', evangelium: 'Luk 2:1-20' },
    argang2: { gt: 'Jes 9:2-7', epistel: '1 Joh 1:1-4', evangelium: 'Joh 1:1-14' },
    argang3: { gt: 'Jes 9:2-7', epistel: 'Heb 1:1-3', evangelium: 'Matt 1:18-25' }
  },
  {
    namn: 'Annandag jul / Den Helige Stefanos dag',
    tema: 'Martyrerna',
    psaltarpsalm: 'Ps 46:1-8',
    argang1: { gt: 'Jer 1:17-19', epistel: 'Apg 6:8-15', evangelium: 'Matt 10:16-22' },
    argang2: { gt: 'Jer 20:7-11', epistel: 'Apg 7:55-8:8', evangelium: 'Luk 12:49-53' },
    argang3: { gt: 'Mik 7:1-6', epistel: 'Apg 4:18-31', evangelium: 'Matt 10:32-39' }
  },
  {
    namn: 'Söndagen e. jul',
    tema: 'Guds barn',
    psaltarpsalm: 'Ps 71:2-6',
    argang1: { gt: 'Jer 31:15-17', epistel: 'Gal 4:4-7', evangelium: 'Matt 2:13-23' },
    argang2: { gt: '2 Mos 1:15-21', epistel: '2 Tim 3:14-15', evangelium: 'Mark 10:13-16' },
    argang3: { gt: 'Jes 11:1-9', epistel: 'Apg 7:17-22', evangelium: 'Matt 18:1-5' }
  },
  {
    namn: 'Nyårsdagen',
    tema: 'I Jesu namn',
    psaltarpsalm: 'Ps 121',
    argang1: { gt: '4 Mos 6:22-27', epistel: 'Rom 10:9-13', evangelium: 'Luk 2:21' },
    argang2: { gt: 'Jes 49:13-16', epistel: 'Heb 13:5-8', evangelium: 'Luk 13:6-9' },
    argang3: { gt: 'Klag 3:22-26', epistel: 'Apg 10:42-43', evangelium: 'Joh 2:23-25' }
  },
  {
    namn: 'Söndagen e. nyår',
    tema: 'Guds hus',
    psaltarpsalm: 'Ps 84:2-5',
    argang1: { gt: '1 Sam 3:1-10', epistel: 'Heb 3:1-6', evangelium: 'Luk 2:42-52' },
    argang2: { gt: 'Jes 55:5-7', epistel: 'Rom 12:1-2', evangelium: 'Mark 11:15-19' },
    argang3: { gt: '1 Kung 8:20, 27-30', epistel: 'Fil 2:1-4', evangelium: 'Joh 2:13-22' }
  },
  {
    namn: 'Trettondedag jul',
    tema: 'Guds härlighet i Kristus',
    psaltarpsalm: 'Ps 72:10-15',
    argang1: { gt: 'Jes 60:1-6', epistel: 'Kol 1:11-14', evangelium: 'Matt 2:1-12' },
    argang2: { gt: 'Jes 49:5-7', epistel: '2 Kor 4:3-6', evangelium: 'Joh 8:12' },
    argang3: { gt: '1 Kung 10:1-7', epistel: 'Ef 2:17-19', evangelium: 'Luk 11:29-32' }
  },
  {
    namn: '1:a söndagen e. trettondedagen',
    tema: 'Jesu dop',
    psaltarpsalm: 'Ps 89:20-29',
    argang1: { gt: 'Jes 42:1-7', epistel: 'Apg 18:24-19:6', evangelium: 'Matt 3:13-17' },
    argang2: { gt: '2 Mos 1:22-2:10', epistel: '1 Joh 5:6-12', evangelium: 'Luk 3:15-17, 21-22' },
    argang3: { gt: 'Jes 43:1-4', epistel: 'Apg 8:14-17', evangelium: 'Mark 1:9-11' }
  },
  {
    namn: '2:a söndagen e. trettondedagen',
    tema: 'Livets källa',
    psaltarpsalm: 'Ps 19:2-7',
    argang1: { gt: '2 Mos 33:18-23', epistel: 'Ef 1:7-14', evangelium: 'Joh 2:1-11' },
    argang2: { gt: 'Jes 55:1-4', epistel: 'Upp 22:16-17', evangelium: 'Joh 4:5-26' },
    argang3: { gt: '5 Mos 5:23-27', epistel: 'Heb 2:9-10', evangelium: 'Joh 5:31-36' }
  },
  {
    namn: '3:e söndagen e. trettondedagen',
    tema: 'Jesus skapar tro',
    psaltarpsalm: 'Ps 36:6-10',
    argang1: { gt: '1 Kung 8:41-43', epistel: 'Rom 1:16-17', evangelium: 'Matt 8:5-13' },
    argang2: { gt: 'Jes 45:22-24', epistel: 'Gal 2:16-21', evangelium: 'Joh 4:27-42' },
    argang3: { gt: '2 Kung 5:1-4, 9-15', epistel: '2 Kor 1:3-7', evangelium: 'Joh 4:46-54' }
  },
  {
    namn: '4:e söndagen e. trettondedagen',
    tema: 'Jesus är vårt hopp',
    psaltarpsalm: 'Ps 107:28-32',
    argang1: { gt: 'Job:38:1-11', epistel: '2 Kor 1:8-11', evangelium: 'Mark 4:35-41' },
    argang2: { gt: 'Jes 40:26-31', epistel: 'Jak 5:13-16', evangelium: 'Joh 5:1-9' },
    argang3: { gt: '1 Kung 17:1-6', epistel: '2 Tim 1:7-10', evangelium: 'Matt 14:22-33' }
  },
  {
    namn: '5:e söndagen e. trettondedagen',
    tema: 'Sådd och skörd',
    psaltarpsalm: 'Ps 37:1-7',
    argang1: { gt: 'Hes 34:17-23', epistel: 'Kol 3:12-16', evangelium: 'Matt 13:24-30'},
    argang2: { gt: '4 Mos 11:24-30', epistel: 'Fil 1:12-18', evangelium: 'Mark 9:38-41' },
    argang3: { gt: 'Hes 33:10-16', epistel: 'Rom 2:12-16', evangelium: 'Luk 13:22-30' }
  },
  {
    namn: '6:e söndagen e. trettondedagen',
    tema: 'Gud verkar nu',
    psaltarpsalm: 'Ps 63:2-5',
    argang1: { gt: 'Jes 43:15-21', epistel: 'Fil 2:12-13', evangelium: 'Joh 5:16-23' },
    argang2: { gt: 'Jes 43:15-21', epistel: 'Fil 2:12-13', evangelium: 'Joh 5:16-23' },
    argang3: { gt: 'Jes 43:15-21', epistel: 'Fil 2:12-13', evangelium: 'Joh 5:16-23' }
  },
  {
    namn: 'Septuagesima',
    tema: 'Nåd och tjänst',
    psaltarpsalm: 'Ps 25:4-11',
    argang1: { gt: 'Jer 9:23-24', epistel: '1 Kor 1:1-3', evangelium: 'Matt 20:1-16' },
    argang2: { gt: 'Jon 3:10-4:11', epistel: 'Fil 1:3-11', evangelium: 'Luk 17:7-10' },
    argang3: { gt: 'Vish 11:22-26', epistel: 'Fil 3:7-14', evangelium: 'Matt 19:27-30' }
  },
  {
    namn: 'Sexagesima',
    tema: 'Det levande ordet',
    psaltarpsalm: 'Ps 33:4-9',
    argang1: { gt: 'Jes 55:8-11', epistel: '1 Kor 1:18-25', evangelium: 'Luk 8:4-15' },
    argang2: { gt: 'Ps 119:129-135', epistel: 'Rom 10:13-17', evangelium: 'Joh 7:40-52' },
    argang3: { gt: 'Jer 23:23-29', epistel: 'Rom 4:12-13', evangelium: 'Joh 6:60-69' }
  },
  {
    namn: 'Fastlagssöndagen',
    tema: 'Kärlekens väg',
    psaltarpsalm: 'Ps 86:5-11',
    argang1: { gt: 'Jes 52:13-15', epistel: '1 Kor 13:1-13', evangelium: 'Luk 18:31-43' },
    argang2: { gt: 'Est 4:12-17', epistel: '1 Tim 2:4-6', evangelium: 'Joh 12:20-33' },
    argang3: { gt: 'Höga v 8:6-7', epistel: '2 Kor 5:14-21', evangelium: 'Mark 10:32-45' }
  },
  {
    namn: 'Askonsdagen',
    tema: 'Bön och fasta',
    psaltarpsalm: 'Ps 32:1-5',
    argang1: { gt: 'Jes 58:4-9', epistel: 'Jak 2:14-17', evangelium: 'Matt 6:16-18' },
    argang2: { gt: 'Joel 2:12-19', epistel: 'Apg 13:1-3', evangelium: 'Mark 2:18-20' },
    argang3: { gt: 'Man 11-15', epistel: '2 Kor 7:8-13', evangelium: 'Luk 5:33-39' }
  },
  {
    namn: '1:a söndagen i fastan',
    tema: 'Prövningens stund',
    psaltarpsalm: 'Ps 31:2-6',
    argang1: { gt: '1 Mos 16:1-13', epistel: 'Heb 4:14-16', evangelium: 'Matt 4:1-11' },
    argang2: { gt: '1 Mos 4:3-7', epistel: 'Jak 1:12-15', evangelium: 'Matt 16:21-23' },
    argang3: { gt: '1 Mos 3:1-13', epistel: 'Heb 5:7-10', evangelium: 'Mark 1:12-13' }
  },
  {
    namn: '2:a söndagen i fastan',
    tema: 'Den kämpande tron',
    psaltarpsalm: 'Ps 130',
    argang1: { gt: '1 Mos 32:22-31', epistel: '2 Kor 6:1-10', evangelium: 'Matt 15:21-28' },
    argang2: { gt: '1 Kung 19:1-8', epistel: '1 Kor 10:12-13', evangelium: 'Luk 7:36-8:3' },
    argang3: { gt: 'Jes 61:1-3', epistel: 'Heb 11:23-27', evangelium: 'Mark 14:3-9' }
  },
  {
    namn: '3:e söndagen i fastan',
    tema: 'Kampen mot ondskan',
    psaltarpsalm: 'Ps 25:12-22',
    argang1: { gt: '1 Sam 17:40-50', epistel: 'Ef 5:1-9', evangelium: 'Luk 11:14-26' },
    argang2: { gt: 'Jes 59:14-17', epistel: 'Ef 6:10-18', evangelium: 'Mark 5:24-34' },
    argang3: { gt: '1 Kung 18:26-29, 36-39', epistel: 'Upp 3:14-19', evangelium: 'Mark 9:14-32' }
  },
  {
    namn: 'Midfastosöndagen',
    tema: 'Livets bröd',
    psaltarpsalm: 'Ps 107:1-9',
    argang1: { gt: '2 Kung 4:42-44', epistel: '2 Kor 9:8-10', evangelium: 'Joh 6:1-15' },
    argang2: { gt: '2 Mos 16:11-18', epistel: '1 Pet 2:1-3', evangelium: 'Joh 6:24-35' },
    argang3: { gt: 'Ords 9:1-6', epistel: '1 Kor 10:1-6', evangelium: 'Joh 6:48-59' }
  },
  {
    namn: '5:e söndagen i fastan',
    tema: 'Försonaren',
    psaltarpsalm: 'Ps 103:8-14',
    argang1: { gt: 'Jes 53:1-12', epistel: 'Heb 10:19-25', evangelium: 'Joh 19:17-37' },
    argang2: { gt: '1 Mos 22:1-14', epistel: 'Apg 4:1-12', evangelium: 'Mark 12:1-12' },
    argang3: { gt: '4 Mos 21:4-9 ', epistel: '1 Joh 1:8-2:2', evangelium: 'Joh 3:11-21' }
  },
  {
    namn: 'Palmsöndagen',
    tema: 'Vägen till korset',
    psaltarpsalm: 'Ps 118:19-29',
    argang1: { gt: 'Sak 2:10-13', epistel: 'Fil 2:5-11', evangelium: 'Joh 12:1-16' },
    argang2: { gt: 'Jes 56:6-8', epistel: 'Ef 2:12-16', evangelium: 'Matt 21:1-11' },
    argang3: { gt: 'Jes 50:5-10', epistel: 'Rom 5:1-5', evangelium: 'Luk 19:28-40' }
  },
  {
    namn: 'Skärtorsdagen',
    tema: 'Det nya förbundet',
    psaltarpsalm: 'Ps 111:1-5',
    argang1: { gt: 'Jer 31:31-34', epistel: 'Heb 10:12-18', evangelium: 'Joh 13:1-17' },
    argang2: { gt: '2 Mos 12:1-14', epistel: '1 Kor 11:20-25', evangelium: 'Matt 26:17-30' },
    argang3: { gt: '2 Mos 12:15-20', epistel: '1 Kor 5:6-8', evangelium: 'Luk 22:7-23' }
  },
  {
    namn: 'Långfredagen',
    tema: 'Korset',
    psaltarpsalm: 'Ps 22',
    argang1: { gt: 'Jes 53:1-12', epistel: 'Heb 10:19-25', evangelium: 'Joh 19:17-37' },
    argang2: { gt: 'Jes 53:1-12', epistel: '1 Pet 3:18-20', evangelium: 'Matt 27:32-56' },
    argang3: { gt: 'Jes 53:1-12', epistel: 'Fil 2:6-8', evangelium: 'Luk 23:26-49' }
  },
  {
    namn: 'Påsknatten',
    tema: 'Genom död till liv',
    psaltarpsalm: 'Ps 114',
    argang1: { gt: 'Job 19:25-27', epistel: 'Ef 2:1-6', evangelium: 'Joh 20:1-10' },
    argang2: { gt: '2 Mos 14:10-16, 21-22', epistel: 'Rom 6:3-11', evangelium: 'Matt 28:1-8' },
    argang3: { gt: '2 Mos 12:21-28', epistel: 'Kol 2:6-15', evangelium: 'Luk 23:55-24:12' }
  },
  {
    namn: 'Påskdagen',
    tema: 'Kristus är uppstånden',
    psaltarpsalm: 'Ps 118:15-24',
    argang1: { gt: 'Jon 2:1-11', epistel: 'Apg 13:32-37', evangelium: 'Joh 20:1-18' },
    argang2: { gt: 'Jes 25:6-9', epistel: '1 Kor 15:53-57', evangelium: 'Matt 28:1-20' },
    argang3: { gt: 'Hos 6:1-3', epistel: 'Apg 3:14-16', evangelium: 'Luk 24:1-12' }
  },
  {
    namn: 'Annandag påsk',
    tema: 'Möte med den uppståndne',
    psaltarpsalm: 'Ps 16:6-11',
    argang1: { gt: 'Hes 37:1-10', epistel: 'Apg 10:34-43', evangelium: 'Luk 24:13-35' },
    argang2: { gt: '5 Mos 18:15-18', epistel: 'Kol 3:1-4', evangelium: 'Luk 24:36-49' },
    argang3: { gt: 'Jer 31:9-13', epistel: '1 Pet 1:18-23', evangelium: 'Joh 20:19-23' }
  },
  {
    namn: '2:a söndagen i påsktiden',
    tema: 'Påskens vittnen',
    psaltarpsalm: 'Ps 145:1-7',
    argang1: { gt: 'Jes 43:10-13', epistel: '1 Kor 15:1-11', evangelium: 'Joh 21:1-14' },
    argang2: { gt: 'Jer 18:1-6', epistel: '1 Joh 5:1-5', evangelium: 'Joh 21:15-19' },
    argang3: { gt: 'Sak 8:6-8', epistel: '1 Pet 1:3-9', evangelium: 'Joh 20:24-31' }
  },
  {
    namn: '3:e söndagen i påsktiden',
    tema: 'Den gode herden',
    psaltarpsalm: 'Ps 23',
    argang1: { gt: 'Hes 34:11-16', epistel: '1 Pet 2:22-25', evangelium: 'Joh 10:1-10' },
    argang2: { gt: 'Hes 34:23-31', epistel: 'Heb 13:20-21', evangelium: 'Joh 10:11-16' },
    argang3: { gt: 'Jer 23:3-8', epistel: '1 Pet 5:1-4', evangelium: 'Joh 10:22-30' }
  },
  {
    namn: '4:e söndagen i påsktiden',
    tema: 'Vägen till livet',
    psaltarpsalm: 'Ps 147:1-7',
    argang1: { gt: 'Jes 54:7-10', epistel: 'Heb 13:12-16', evangelium: 'Joh 16:16-22' },
    argang2: { gt: 'Syr 28:3-7', epistel: '2 Kor 4:16-18', evangelium: 'Joh 14:1-14' },
    argang3: { gt: '2 Mos 13:20-22', epistel: '1 Thess 5:9-11', evangelium: 'Joh 13:31-35' }
  },
  {
    namn: '5:e söndagen i påsktiden',
    tema: 'Att växa i tro',
    psaltarpsalm: 'Ps 98:1-8',
    argang1: { gt: 'Hos 11:1-4', epistel: '1 Joh 4:10-16', evangelium: 'Joh 16:5-11' },
    argang2: { gt: 'Hos 14:5-9', epistel: '1 Joh 3:18-24', evangelium: 'Joh 15:10-17' },
    argang3: { gt: 'Jes 57:15-16', epistel: 'Gal 5:13-18', evangelium: 'Joh 17:9-17' }
  },
  {
    namn: 'Bönsöndagen',
    tema: 'Bönen',
    psaltarpsalm: 'Ps 13',
    argang1: { gt: '1 Mos 18:26-32', epistel: 'Ef 3:14-21', evangelium: 'Luk 18:1-8' },
    argang2: { gt: 'Jer 29:11-14', epistel: '1 Joh 5:13-15', evangelium: 'Luk 11:1-13' },
    argang3: { gt: '1 Kung 3:5-14', epistel: 'Rom 8:24-27', evangelium: 'Matt 6:5-8' }
  },
  {
    namn: 'Kristi himmelsfärds dag',
    tema: 'Herre över allting',
    psaltarpsalm: 'Ps 110',
    argang1: { gt: '2 Kung 2:11-14', epistel: 'Apg 1:1-11', evangelium: 'Mark 16:19-20' },
    argang2: { gt: 'Jes 61:10-11', epistel: 'Ef 1:17-23', evangelium: 'Luk 24:49-53' },
    argang3: { gt: 'Dan 7:13-14', epistel: 'Ef 4:7-13', evangelium: 'Joh 17:1-8' }
  },
  {
    namn: 'Söndagen före pingst',
    tema: 'Hjälparen kommer',
    psaltarpsalm: 'Ps 33:18-22',
    argang1: { gt: 'Sak 14:6-9', epistel: 'Rom 8:16-18', evangelium: 'Joh 15:26-16:4' },
    argang2: { gt: '5 Mos 31:6-8', epistel: 'Rom 8:31-39', evangelium: 'Joh 16:23-33' },
    argang3: { gt: '1 Kung 19:9-16', epistel: 'Apg 1:12-14', evangelium: 'Joh 16:12-15' }
  },
  {
    namn: 'Pingstdagen',
    tema: 'Den Helige Anden',
    psaltarpsalm: 'Ps 104:27-31',
    argang1: { gt: '1 Mos 11:1-9', epistel: 'Apg 2:1-11', evangelium: 'Joh 14:25-29' },
    argang2: { gt: 'Joel 2:28-29', epistel: 'Apg 2:14-21', evangelium: 'Joh 14:15-21' },
    argang3: { gt: 'Jes 12', epistel: 'Ef 2:17-22', evangelium: 'Joh 7:37-39' }
  },
  {
    namn: 'Annandag pingst',
    tema: 'Andens vind över världen',
    psaltarpsalm: 'Ps 68:10-14, 20-21',
    argang1: { gt: '2 Mos 17:1-7', epistel: 'Apg 10:42-48', evangelium: 'Joh 6:44-47' },
    argang2: { gt: 'Hes 11:17-20', epistel: 'Apg 11:19-26', evangelium: 'Joh 3:31-36' },
    argang3: { gt: 'Jes 44:1-8', epistel: 'Apg 2:36-41', evangelium: 'Joh 12:44-50' }
  },
  {
    namn: 'Heliga trefaldighets dag eller Missionsdagen',
    tema: 'Gud - Fader, Son och Ande',
    psaltarpsalm: 'Ps 113:1-6',
    argang1: { gt: '5 Mos 6:4-9', epistel: 'Apg 2:24-35', evangelium: 'Matt 11:25-27' },
    argang2: { gt: '2 Mos 3:1-15', epistel: 'Rom 11:33-36', evangelium: 'Matt 28:16-20' },
    argang3: { gt: '1 Mos 18:1-8', epistel: 'Apg 4:5-12', evangelium: 'Joh 11:18-27' }
  },
  {
    namn: '1:a söndagen e. trefaldighet',
    tema: 'Vårt dop',
    psaltarpsalm: 'Ps 66:5-12',
    argang1: { gt: 'Hes 36:25-28', epistel: 'Rom 6:3-11', evangelium: 'Joh 3:1-8' },
    argang2: { gt: '2 Mos 14:21-22', epistel: 'Tit 3:4-8', evangelium: 'Joh 1:29-34' },
    argang3: { gt: '1 Mos 7:11-23', epistel: 'Apg 8:26-39', evangelium: 'Matt 3:11-12' }
  },
  {
    namn: '2:a söndagen e. trefaldighet',
    tema: 'Kallelsen till Guds rike',
    psaltarpsalm: 'Ps 65:2-5',
    argang1: { gt: 'Sak 3:1-7', epistel: 'Upp 19:5-9', evangelium: 'Luk 14:15-24' },
    argang2: { gt: '5 Mos 7:6-9', epistel: 'Rom 8:28-30', evangelium: 'Joh 1:35-46' },
    argang3: { gt: 'Dom 6:7-16', epistel: '1 Kor 1:26-31', evangelium: 'Mark 2:13-17' }
  },
  {
    namn: '3:e söndagen e. trefaldighet',
    tema: 'Förlorad och återfunnen',
    psaltarpsalm: 'Ps 119:170-176',
    argang1: { gt: 'Mik 7:18-20', epistel: 'Rom 5:6-11', evangelium: 'Luk 15:1-7' },
    argang2: { gt: 'Jes 51:1-3', epistel: 'Ef 2:1-10', evangelium: 'Luk 15:8-10' },
    argang3: { gt: 'Jes 66:12-14', epistel: '1 Pet 5:5-11', evangelium: 'Luk 15:11-32'}
  },
  {
    namn: '4:e söndagen e. trefaldighet',
    tema: 'Att inte döma',
    psaltarpsalm: 'Ps 62:2-9',
    argang1: { gt: '2 Sam 12:1-7', epistel: 'Rom 2:1-4', evangelium: 'Matt 7:1-5' },
    argang2: { gt: 'Sak 7:8-10', epistel: 'Rom 14:11-14', evangelium: 'Joh 8:1-11' },
    argang3: { gt: 'Hes 18:30-32', epistel: 'Gal 6:1-7', evangelium: 'Luk 6:36-42' }
  },
  {
    namn: 'Apostladagen',
    tema: 'Sänd mig',
    psaltarpsalm: 'Ps 40:6-12',
    argang1: { gt: 'Hes 1:26-2:3, 8-10', epistel: '1 Tim 1:12-17', evangelium: 'Luk 5:1-11' },
    argang2: { gt: 'Jes 6:1-8', epistel: '1 Pet 2:4-10', evangelium: 'Matt 16:13-20' },
    argang3: { gt: 'Jer 1:4-10', epistel: 'Rom 16:1-7', evangelium: 'Mark 3:7-19' }
  },
  {
    namn: '6:e söndagen e. trefaldighet',
    tema: 'Efterföljelse',
    psaltarpsalm: 'Ps 15',
    argang1: { gt: '3 Mos 19:1-2, 13-18', epistel: '1 Pet 1:13-16', evangelium: 'Matt 5:20-26' },
    argang2: { gt: 'Amos 7:10-15', epistel: '1 Thess 2:1-8', evangelium: 'Matt 16:24-27' },
    argang3: { gt: '1 Kung 19:19-21', epistel: '1 Kor 9:19-26', evangelium: 'Luk 9:51-62' }
  },
  {
    namn: 'Kristi förklarings dag',
    tema: 'Jesus förhärligad',
    psaltarpsalm: 'Ps 89:12-18',
    argang1: { gt: '2 Mos 24:12-18', epistel: '2 Pet 1:16-18', evangelium: 'Matt 17:1-8' },
    argang2: { gt: '2 Mos 34:27-35', epistel: '2 Kor 3:9-18', evangelium: 'Mark 9:1-13' },
    argang3: { gt: '2 Mos 40:34-38', epistel: 'Upp 1:9-18', evangelium: 'Luk 9:28-36' }
  },
  {
    namn: '8:e söndagen e. trefaldighet',
    tema: 'Andlig klarsyn',
    psaltarpsalm: 'Ps 119:30-35',
    argang1: { gt: 'Mik 3:5-8', epistel: '1 Joh 4:1-6', evangelium: 'Matt 7:15-21' },
    argang2: { gt: 'Ords 7:1-3', epistel: '1 Kor 3:10-15', evangelium: 'Matt 7:22-29' },
    argang3: { gt: 'Jer 7:1-7', epistel: 'Rom 8:14-17', evangelium: 'Matt 7:13-14' }
  },
  {
    namn: '9:e söndagen e. trefaldighet',
    tema: 'Goda förvaltare',
    psaltarpsalm: 'Ps 8',
    argang1: { gt: '1 Mos 1:24-2:3', epistel: '1 Pet 4:7-11', evangelium: 'Matt 25:14-30' },
    argang2: { gt: 'Ords 3:27-32', epistel: 'Ef 4:20-28', evangelium: 'Luk 12:42-48' },
    argang3: { gt: 'Amos 8:4-7', epistel: '2 Tim 4:1-7', evangelium: 'Luk 16:1-13' }
  },
  {
    namn: '10:e söndagen e. trefaldighet',
    tema: 'Nådens gåvor',
    psaltarpsalm: 'Ps 28:6-9',
    argang1: { gt: 'Jes 27:2-6', epistel: '1 Kor 12:12-26', evangelium: 'Joh 15:1-9' },
    argang2: { gt: '2 Mos 19:3-8', epistel: 'Rom 12:3-8', evangelium: 'Matt 18:18-22' },
    argang3: { gt: 'Jos 24:16-18', epistel: '1 Kor 12:4-11', evangelium: 'Luk 9:46-48' }
  },
  {
    namn: '11:e söndagen e. trefaldighet',
    tema: 'Tro och liv',
    psaltarpsalm: 'Ps 143:6-10',
    argang1: { gt: 'Jes 2:12-17', epistel: 'Rom 3:21-28', evangelium: 'Luk 18:9-14' },
    argang2: { gt: 'Amos 5:21-24', epistel: 'Rom 7:14-25', evangelium: 'Matt 21:28-31' },
    argang3: { gt: 'Jes 1:10-17', epistel: 'Jak 1:22-25', evangelium: 'Matt 23:1-12' }
  },
  {
    namn: '12:e söndagen e. trefaldighet',
    tema: 'Friheten i Kristus',
    psaltarpsalm: 'Ps 145:13b-18',
    argang1: { gt: '2 Mos 4:10-17', epistel: '2 Kor 3:4-8', evangelium: 'Mark 7:31-37' },
    argang2: { gt: 'Jes 38:1-6', epistel: 'Rom 8:18-23', evangelium: 'Luk 13:10-17' },
    argang3: { gt: '2 Mos 23:10-12', epistel: 'Gal 4:31-5:6', evangelium: 'Mark 2:23-28' }
  },
  {
    namn: '13:e söndagen e. trefaldighet',
    tema: 'Medmänniskan',
    psaltarpsalm: 'Ps 103:1-6',
    argang1: { gt: '1 Mos 4:8-12', epistel: '1 Joh 4:7-10', evangelium: 'Luk 10:23-37' },
    argang2: { gt: '5 Mos 15:7-11', epistel: 'Rom 13:8-10', evangelium: 'Matt 5:38-48' },
    argang3: { gt: 'Jer 38:7-13', epistel: 'Rom 12:16-21', evangelium: 'Matt 7:12' }
  },
  {
    namn: '14:e söndagen e. trefaldighet',
    tema: 'Enheten i Kristus',
    psaltarpsalm: 'Ps 95:1-7',
    argang1: { gt: 'Hes 37:15-22', epistel: 'Ef 4:1-6', evangelium: 'Joh 17:9-11' },
    argang2: { gt: 'Jes 11:10-13', epistel: 'Fil 2:1-5', evangelium: 'Luk 22:24-27' },
    argang3: { gt: 'Amos 9:11-15', epistel: '1 Kor 1:10-13', evangelium: 'Joh 17:18-23' }
  },
  {
    namn: '15:e söndagen e. trefaldighet',
    tema: 'Ett är nödvändigt',
    psaltarpsalm: 'Ps 123',
    argang1: { gt: 'Neh 9:19-21', epistel: 'Apg 20:32-36', evangelium: 'Matt 6:31-34' },
    argang2: { gt: '1 Kung 17:8-16', epistel: 'Apg 4:32-35', evangelium: 'Matt 11:28-30' },
    argang3: { gt: '5 Mos 4:29-31', epistel: 'Fil 4:10-13', evangelium: 'Luk 10:38-42' }
  },
  {
    namn: '16:e söndagen e. trefaldighet',
    tema: 'Döden och livet',
    psaltarpsalm: 'Ps 107:18-22',
    argang1: { gt: 'Jes 26:19', epistel: '2 Kor 4:7-14', evangelium: 'Joh 11:28-44' },
    argang2: { gt: '1 Kon 17:17-24', epistel: 'Upp 2:8-11', evangelium: 'Luk 7:11-17' },
    argang3: { gt: 'Job 14:13-15', epistel: 'Fil 1:20-26', evangelium: 'Mark 5:35-43' }
  },
  {
    namn: '17:e söndagen e. trefaldighet',
    tema: 'Rik inför Gud',
    psaltarpsalm: 'Ps 49:6-12',
    argang1: { gt: '2 Mos 32:1-4, 30-35', epistel: '1 Joh 2:15-17', evangelium: 'Matt 6:19-24' },
    argang2: { gt: 'Pred 5:9-15', epistel: '1 Tim 6:7-11', evangelium: 'Luk 12:13-21' },
    argang3: { gt: 'Pred 12:1-7', epistel: '1 Joh 4:16-21', evangelium: 'Luk 16:19-31' }
  },
  {
    namn: '18:e söndagen e. trefaldighet',
    tema: 'Att lyssna i tro',
    psaltarpsalm: 'Ps 19:8-15',
    argang1: { gt: 'Mik 6:6-8', epistel: 'Apg 16:11-15', evangelium: 'Joh 7:14-18' },
    argang2: { gt: '5 Mos 30:11-16', epistel: 'Jak 2:8-13', evangelium: 'Mark 10:17-27' },
    argang3: { gt: 'Ords 8:32-36', epistel: 'Apg 5:27-29', evangelium: 'Matt 13:44-46' }
  },
  {
    namn: '19:e söndagen e. trefaldighet',
    tema: 'Trons kraft',
    psaltarpsalm: 'Ps 73:23-26',
    argang1: { gt: '1 Mos 6:13-22', epistel: 'Heb 11:1-7', evangelium: 'Mark 12:41-44' },
    argang2: { gt: '1 Mos 15:5-6', epistel: '1 Tim 6:11-12', evangelium: 'Joh 9:1-7, 24-39' },
    argang3: { gt: 'Jos 2:1-15', epistel: 'Hebr 11:29-33', evangelium: 'Mark 2:1-12' }
  },
  {
    namn: '20:e söndagen e. trefaldighet',
    tema: 'Att leva tillsammans',
    psaltarpsalm: 'Ps 68:5-7',
    argang1: { gt: 'Rut 2:8-12', epistel: 'Apg 9:36-43', evangelium: 'Mark 3:31-35' },
    argang2: { gt: 'Rut 1:6-19', epistel: 'Heb 13:2-3', evangelium: 'Joh 11:1-7' },
    argang3: { gt: 'Tob 10:7-13', epistel: '2 Tim 1:3-5', evangelium: 'Matt 13:53-57' }
  },
  {
    namn: '21:a söndagen e. trefaldighet',
    tema: 'Samhällsansvar',
    psaltarpsalm: 'Ps 40:14-18',
    argang1: { gt: 'Jer 29:4-7', epistel: 'Rom 13:7-10', evangelium: 'Matt 22:15-22' },
    argang2: { gt: '1 Mos 24:17-22', epistel: 'Jak 2:1-8', evangelium: 'Luk 19:1-10' },
    argang3: { gt: '2 Mos 23:1-9', epistel: '2 Kor 8:9-15', evangelium: 'Matt 12:15-21' }
  },
  {
    namn: '22:a söndagen e. trefaldighet',
    tema: 'Frälsningen',
    psaltarpsalm: 'Ps 62:10-13',
    argang1: { gt: '1 Mos 45:4-8', epistel: '1 Pet 4:12-19', evangelium: 'Matt 23:37-24:2' },
    argang2: { gt: 'Neh 2:11-20', epistel: 'Rom 5:15-21', evangelium: 'Mark 4:26-29' },
    argang3: { gt: 'Jes 2:2-5', epistel: '2 Pet 1:2-8', evangelium: 'Joh 12:35-43' }
  },
  {
    namn: '23:e söndagen e. trefaldighet',
    tema: 'Förlåtelse utan gräns',
    psaltarpsalm: 'Ps 78:35-39',
    argang1: { gt: '1 Mos 50:15-21', epistel: '2 Thess 3:1-5', evangelium: 'Matt 18:15-20' },
    argang2: { gt: 'Jes 64:6-9', epistel: 'Ef 4:29-35', evangelium: 'Matt 18:21-35' },
    argang3: { gt: 'Hos 11:8-9', epistel: '1 Thess 5:13-15', evangelium: 'Matt 6:9-15' }
  },
  {
    namn: '24:e söndagen e. trefaldighet',
    tema: 'Den yttersta tiden',
    psaltarpsalm: 'Ps 39:5-8',
    argang1: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' },
    argang2: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' },
    argang3: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' }
  },
  {
    namn: '25:e söndagen e. trefaldighet',
    tema: 'Den yttersta tiden',
    psaltarpsalm: 'Ps 39:5-8',
    argang1: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' },
    argang2: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' },
    argang3: { gt: 'Sef 3:8-13', epistel: '1 Joh 2:28-3:3', evangelium: 'Matt 24:3-14' }
  },
  {
    namn: 'Söndagen före domssöndagen',
    tema: 'Vaksamhet och väntan',
    psaltarpsalm: 'Ps 139:1-18',
    argang1: { gt: 'Sef 3:8-13', epistel: 'Upp 3:10-13', evangelium: 'Matt 25:1-13' },
    argang2: { gt: 'Jes 51:4-6', epistel: '2 Kor 13:5-9', evangelium: 'Luk 12:35-40' },
    argang3: { gt: 'Amos 8:9-12', epistel: 'Fil 3:20-4:1', evangelium: 'Luk 17:20-30' }
  },
  {
    namn: 'Domssöndagen',
    tema: 'Kristi återkomst',
    psaltarpsalm: 'Ps 102:26-29',
    argang1: { gt: 'Jes 65:17-19', epistel: '2 Pet 3:8-13', evangelium: 'Matt 25:31-46' },
    argang2: { gt: 'Dan 7:9-10', epistel: 'Upp 20:11-21:5', evangelium: 'Joh 5:22-30' },
    argang3: { gt: 'Hes 47:6-12', epistel: '1 Kor 15:22-28', evangelium: 'Matt 13:47-50' }
  },
  {
    namn: 'Kyndelsmässodagen eller Jungfru Marie Kyrkogångsdag',
    tema: 'Uppenbarelsens ljus',
    psaltarpsalm: 'Ps 138',
    argang1: { gt: '1 Sam 1:21-28', epistel: '1 Joh 1:5-7', evangelium: 'Luk 2:22-40' },
    argang2: { gt: 'Mal 3:1-4', epistel: '1 Tim 6:13-16', evangelium: 'Joh 1:14-18' },
    argang3: { gt: 'Mik 7:7-8', epistel: 'Apg 2:42-46', evangelium: 'Matt 13:31-33' }
  },
  {
    namn: 'Jungfru Marie bebådelsedag',
    tema: 'Guds mäktiga verk',
    psaltarpsalm: 'Ps 147:7-15',
    argang1: { gt: 'Jes 7:10-14', epistel: 'Rom 8:1-4', evangelium: 'Luk 1:26-38' },
    argang2: { gt: 'Mik 5:2-4', epistel: 'Rom 4:18-21', evangelium: 'Luk 1:39-45' },
    argang3: { gt: '1 Sam 2:1-10', epistel: 'Kol 1:15-20', evangelium: 'Luk 1:46-55' }
  },
  {
    namn: 'Midsommardagen',
    tema: 'Skapelsen',
    psaltarpsalm: 'Ps 104:1-13',
    argang1: { gt: '1 Mos 1:1-13', epistel: 'Apg 14:15-17', evangelium: 'Joh 1:1-5' },
    argang2: { gt: 'Job 12:7-13', epistel: 'Apg 17:22-31', evangelium: 'Matt 6:25-30' },
    argang3: { gt: '1 Mos 9:8-17', epistel: 'Kol 1:21-23', evangelium: 'Mark 6:30-44' }
  },
  {
    namn: 'Den helige Johannes döp. dag',
    tema: 'Den Högstes profet',
    psaltarpsalm: 'Ps 96',
    argang1: { gt: 'Jes 49:1-2', epistel: 'Apg 19:4', evangelium: 'Luk 1:5-17' },
    argang2: { gt: 'Jer 22:1-4', epistel: 'Apg 13:16-25', evangelium: 'Luk 1:57-66' },
    argang3: { gt: 'Jes 42:5-9', epistel: 'Apg 10:37-38', evangelium: 'Luk 1:67-80' }
  },
  {
    namn: 'Den helige Mikaels dag',
    tema: 'Änglarna',
    psaltarpsalm: 'Ps 103:19-22',
    argang1: { gt: 'Dan 6:16-22', epistel: 'Upp 12:7-12', evangelium: 'Luk 10:17-20' },
    argang2: { gt: 'Dan 10:15-19', epistel: 'Apg 12:6-17', evangelium: 'Matt 18:7-10' },
    argang3: { gt: '1 Mos 28:10-17', epistel: 'Upp 5:11-14', evangelium: 'Joh 1:47-51' }
  },
  {
    namn: 'Tacksägelsedagen',
    tema: 'Lovsång',
    psaltarpsalm: 'Ps 65:9-14',
    argang1: { gt: '1 Krön 29:10-14', epistel: '1 Thess 5:16-24', evangelium: 'Luk 17:11-19' },
    argang2: { gt: 'Jer 31:3-6', epistel: 'Upp 4:8-11', evangelium: 'Matt 15:29-31' },
    argang3: { gt: 'Vish 7:15-22', epistel: 'Kol 3:16-17', evangelium: 'Luk 19:37-40' }
  },
  {
    namn: 'Alla helgons dag',
    tema: 'Helgonen',
    psaltarpsalm: 'Ps 126',
    argang1: { gt: 'Jes 49:8-10', epistel: 'Upp 7:9-17', evangelium: 'Matt 5:1-12' },
    argang2: { gt: 'Jes 60:18-22', epistel: 'Heb 12:1-3', evangelium: 'Matt 5:13-16' },
    argang3: { gt: '5 Mos 34:1-5', epistel: 'Heb 12:22-24', evangelium: 'Luk 6:20-26' }
  },
  {
    namn: 'Söndagen e. Alla helgons dag eller Alla själars dag',
    tema: 'Vårt evighetshopp',
    psaltarpsalm: 'Ps 116:1-9',
    argang1: { gt: 'Hes 37:12-14', epistel: 'Upp 22:1-5', evangelium: 'Luk 12:4-7' },
    argang2: { gt: 'Job 17:15-16', epistel: '1 Kor 15:35-49', evangelium: 'Joh 6:37-40' },
    argang3: { gt: 'Jos 1:10-11', epistel: 'Heb 11:13-16', evangelium: 'Luk 20:37-38' }
  },
];

export default function Home() {
  const [valdHelgdagNamn, setValdHelgdagNamn] = useState(HELGDAGAR[0]?.namn || '');
  const [valdArgang, setValdArgang] = useState('argang1');
  const [valdTextTyp, setValdTextTyp] = useState('evangelium');

  const [anteckningar, setAnteckningar] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHistorik, setAiHistorik] = useState([]);
  const [laddarAi, setLaddarAi] = useState(false);

  // Läs in sparad AI-historik från localStorage
  useEffect(() => {
    try {
      const sparadHistorik = localStorage.getItem('prediko_ai_historik');
      if (sparadHistorik) {
        setAiHistorik(JSON.parse(sparadHistorik));
      }
    } catch (e) {
      console.error('Kunde inte läsa in historik:', e);
    }
  }, []);

  // Läs in sparade anteckningar för vald helgdag
  useEffect(() => {
    if (valdHelgdagNamn) {
      const sparadText = localStorage.getItem(`anteckningar_${valdHelgdagNamn}`);
      setAnteckningar(sparadText || '');
    }
  }, [valdHelgdagNamn]);

  const valdHelgdag = HELGDAGAR.find((h) => h.namn === valdHelgdagNamn);
  const valdaTexter = valdHelgdag ? valdHelgdag[valdArgang] : null;
  const valdPredikotext = valdaTexter ? valdaTexter[valdTextTyp] : '';

  const textTypNamn = {
    gt: 'Gammaltestamentlig text',
    epistel: 'Epistel',
    evangelium: 'Evangelium'
  }[valdTextTyp];

  const hanteraAiAnrop = async (instruktion, etikett) => {
    const textAttSkicka = instruktion || aiPrompt;
    const rubrik = etikett || aiPrompt || 'Egen fråga';

    if (!textAttSkicka.trim()) return;

    setLaddarAi(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textAttSkicka,
          helgdag: valdHelgdag?.namn,
          tema: valdHelgdag?.tema,
          texter: valdaTexter,
          valdPredikotext: `${textTypNamn}: ${valdPredikotext}`,
        }),
      });

      const data = await res.json();
      const nyttSvar = data.text || data.result || 'Inga förslag kunde genereras.';

      // Skapa nytt historikobjekt
      const nyPost = {
        id: Date.now(),
        titel: rubrik,
        svar: nyttSvar,
        helgdag: valdHelgdag?.namn || 'Allmänt',
        tid: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      };

      // Uppdatera state och localStorage
      const uppdateradHistorik = [nyPost, ...aiHistorik];
      setAiHistorik(uppdateradHistorik);
      localStorage.setItem('prediko_ai_historik', JSON.stringify(uppdateradHistorik));

      if (!instruktion) {
        setAiPrompt(''); // Rensa rutan vid manuell fråga
      }
    } catch (err) {
      alert('Det uppstod ett fel vid anropet till AI-assistenten.');
    } finally {
      setLaddarAi(false);
    }
  };

  const rensaHistorik = () => {
    if (confirm('Är du säker på att du vill rensa hela AI-historiken?')) {
      setAiHistorik([]);
      localStorage.removeItem('prediko_ai_historik');
    }
  };

  const hanteraAnteckningsÄndring = (e) => {
    const nyText = e.target.value;
    setAnteckningar(nyText);
    if (valdHelgdagNamn) {
      localStorage.setItem(`anteckningar_${valdHelgdagNamn}`, nyText);
    }
  };

  const sparaAnteckningarSomFil = () => {
    if (!anteckningar.trim()) {
      alert('Det finns inga anteckningar att spara än!');
      return;
    }

    const filnamn = `Predikoanteckningar_${valdHelgdag?.namn || 'Ospecificerad'}.txt`;
    const blob = new Blob([anteckningar], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filnamn;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d312e] font-sans antialiased">
      
      {/* HEADER / TOPPMENY */}
      <header className="bg-white border-b border-[#e8e4df] py-5">
        <div className="max-w-[1100px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-[#575c58] hover:text-[#1a1d1b] text-sm font-medium transition-colors flex items-center gap-1"
            >
              ← Tillbaka till start
            </Link>
            <span className="text-[#e8e4df]">|</span>
            <h1 className="text-xl font-bold tracking-tight text-[#1a1d1b]">
              Predikoidéer
            </h1>
          </div>

          <nav className="flex items-center gap-5">
            <Link href="/pris" className="text-[#575c58] hover:text-[#1a1d1b] text-sm font-medium transition-colors">
              Pris
            </Link>
            <Link href="/login" className="bg-[#2d3732] hover:bg-[#1f2723] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Logga in
            </Link>
          </nav>
        </div>
      </header>

      {/* HUVUDINNEHÅLL */}
      <div className="max-w-[1100px] mx-auto px-6 pt-8 pb-16">

        {/* 2-SPALTSLAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* VÄNSTER SPALT: Kyrkoår & Bibeltexter */}
          <section className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-[#1a1d1b] mb-5 tracking-tight border-b border-[#e8e4df] pb-3">
              1. Välj helgdag, årgång & predikotext
            </h2>
            
            {/* VÄLJ HELGDAG */}
            <div className="mb-5">
              <label htmlFor="helgdag-select" className="block text-sm font-semibold text-[#1a1d1b] mb-2">
                Helgdag:
              </label>
              <select
                id="helgdag-select"
                value={valdHelgdagNamn}
                onChange={(e) => setValdHelgdagNamn(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732]"
              >
                {HELGDAGAR.map((h) => (
                  <option key={h.namn} value={h.namn}>
                    {h.namn}
                  </option>
                ))}
              </select>
            </div>

            {/* VÄLJ ÅRGÅNG */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1d1b] mb-2">Årgång:</label>
              <div className="flex gap-2">
                {[
                  { id: 'argang1', label: 'Årgång 1' },
                  { id: 'argang2', label: 'Årgång 2' },
                  { id: 'argang3', label: 'Årgång 3' },
                ].map((arg) => (
                  <button
                    key={arg.id}
                    onClick={() => setValdArgang(arg.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      valdArgang === arg.id
                        ? 'bg-[#2d3732] text-white shadow-sm'
                        : 'bg-[#faf8f5] text-[#575c58] border border-[#e8e4df] hover:border-[#d6d0c7]'
                    }`}
                  >
                    {arg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TEXTVALS-RUTA */}
            {valdHelgdag && valdaTexter && (
              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e8e4df]">
                <h3 className="text-lg font-bold text-[#1a1d1b] mb-1">{valdHelgdag.namn}</h3>
                <p className="text-sm text-[#575c58] mb-4">
                  <strong className="text-[#1a1d1b]">Tema:</strong> {valdHelgdag.tema}
                </p>
                <hr className="border-t border-[#e8e4df] my-3" />
                
                <p className="text-xs font-semibold uppercase tracking-wider text-[#575c58] mb-3">
                  Klicka på den text du vill utgå från i din predikan:
                </p>

                <div className="space-y-3">
                  {[
                    { key: 'gt', label: 'Gammaltestamentlig text', text: valdaTexter.gt },
                    { key: 'epistel', label: 'Epistel', text: valdaTexter.epistel },
                    { key: 'evangelium', label: 'Evangelium', text: valdaTexter.evangelium },
                  ].map((t) => (
                    <div
                      key={t.key}
                      onClick={() => setValdTextTyp(t.key)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        valdTextTyp === t.key
                          ? 'border-[#2d3732] bg-white shadow-sm ring-1 ring-[#2d3732]'
                          : 'border-[#e8e4df] bg-white hover:border-[#d6d0c7]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase text-[#575c58] tracking-wider">
                          {t.label}
                        </span>
                        {valdTextTyp === t.key && (
                          <span className="text-[11px] font-semibold bg-[#2d3732] text-white px-2 py-0.5 rounded-md">
                            Vald predikotext
                          </span>
                        )}
                      </div>
                      <div className="text-base font-semibold text-[#1a1d1b]">
                        {t.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* HÖGER SPALT: Anteckningar & AI-assistent */}
          <section className="space-y-6">
            
            {/* MINA ANTECKNINGAR */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[#1a1d1b] mb-4 tracking-tight">
                2. Mina predikoanteckningar
              </h2>
              <textarea
                value={anteckningar}
                onChange={hanteraAnteckningsÄndring}
                placeholder="Skriv dina egna tankar, idéer och utkast här..."
                rows={8}
                className="w-full p-3.5 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-sm text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732] leading-relaxed"
              />

              <button
                type="button"
                onClick={sparaAnteckningarSomFil}
                className="mt-3 w-full sm:w-auto px-4 py-2.5 bg-[#f4f0eb] hover:bg-[#e8e4df] text-[#2d3732] border border-[#e8e4df] rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                💾 Spara anteckningar till datorn
              </button>
            </div>

            {/* AI-ASSISTENT */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h2 className="text-lg font-bold text-[#1a1d1b] mb-2 tracking-tight">
                3. AI-assistent
              </h2>
              
              <p className="text-xs text-[#575c58] mb-4 bg-[#faf8f5] p-2.5 rounded-lg border border-[#e8e4df]">
                Aktiv predikotext: <strong className="text-[#1a1d1b]">{textTypNamn} ({valdPredikotext})</strong>
              </p>

              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => hanteraAiAnrop(`Ge mig 3-4 olika förslag på disposition/upplägg för en predikan utifrån den valda texten (${textTypNamn}: ${valdPredikotext}) för ${valdHelgdag?.namn} med temat "${valdHelgdag?.tema}".`, 'Disposition')}
                    disabled={laddarAi}
                    className="p-3 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Generera disposition
                  </button>
                  
                  <button
                    onClick={() => hanteraAiAnrop(`Ge mig några olika förslag på bilder, illustrationer, metaforer eller liknelser som passar för en predikan utifrån den valda texten (${textTypNamn}: ${valdPredikotext}) för ${valdHelgdag?.namn} med temat "${valdHelgdag?.tema}".`, 'Predikobilder & liknelser')}
                    disabled={laddarAi}
                    className="p-3 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Predikobilder & liknelser
                  </button>
                </div>

                <button
                  onClick={() => hanteraAiAnrop(`Ge mig 5 passande psalmförslag ur Den svenska psalmboken för ${valdHelgdag?.namn} med temat "${valdHelgdag?.tema}" och den valda texten (${textTypNamn}: ${valdPredikotext}). Motivera kort varför varje psalm passar.`, 'Psalmförslag')}
                  disabled={laddarAi}
                  className="w-full p-3 bg-[#2d3732] hover:bg-[#1f2723] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  Ge psalmförslag för dagen
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Eller skriv en egen fråga till AI-assistenten..."
                  className="w-full p-3 rounded-xl border border-[#e8e4df] bg-[#faf8f5] text-xs text-[#1a1d1b] focus:outline-none focus:ring-2 focus:ring-[#2d3732] mb-2"
                />
                <button
                  onClick={() => hanteraAiAnrop(null, null)}
                  disabled={laddarAi}
                  className="w-full p-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {laddarAi ? 'Genererar förslag...' : 'Fråga AI-assistenten'}
                </button>
              </div>
            </div>

          </section>
        </div>

        {/* AI-HISTORIK LÄNGST NER */}
        <section className="mt-8 bg-white p-6 rounded-2xl border border-[#e8e4df] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-4 border-b border-[#e8e4df] pb-3">
            <h2 className="text-lg font-bold text-[#1a1d1b] tracking-tight">
              📋 AI-assistentens förslag ({aiHistorik.length})
            </h2>
            {aiHistorik.length > 0 && (
              <button
                onClick={rensaHistorik}
                className="bg-[#faf8f5] hover:bg-[#f4f0eb] text-[#575c58] hover:text-[#1a1d1b] border border-[#e8e4df] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Rensa historik
              </button>
            )}
          </div>

          {aiHistorik.length === 0 ? (
            <p className="text-sm text-[#8c918d] italic py-2">
              Ingen historik än. När du klickar på knapparna för AI-assistenten kommer svaren att sparas och visas i denna ruta.
            </p>
          ) : (
            <div className="space-y-4">
              {aiHistorik.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#faf8f5] p-5 rounded-xl border border-[#e8e4df]"
                >
                  <div className="flex justify-between items-center mb-3 border-b border-[#e8e4df] pb-2">
                    <span className="text-sm font-bold text-[#2563eb]">
                      {item.titel} ({item.helgdag})
                    </span>
                    <span className="text-xs text-[#8c918d] font-semibold">
                      Kl. {item.tid}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed text-[#2d312e] whitespace-pre-wrap font-sans">
                    {item.svar}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

{/* NAVIGERA TILL ANDRA VERKTYG */}
        <section className="mt-12 pt-8 border-t border-[#e8e4df]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#575c58] mb-4 text-center">
            Utforska fler verktyg
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/historik" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">📜</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Historiska kommentarer →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Djupdykning i historien.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/grekiska" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🇬🇷</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Rena grekiskan →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Grundtextanalys.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/barn-och-unga" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🎈</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Barn & unga →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Andakter och lekar.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/kasualtal" className="group block">
              <div className="p-5 bg-white rounded-xl border border-[#e8e4df] hover:border-[#d6d0c7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-center gap-4">
                <span className="text-2xl p-2.5 bg-[#f4f0eb] rounded-lg">🕊️</span>
                <div>
                  <h4 className="text-sm font-bold text-[#1a1d1b] group-hover:text-[#2d3732] transition-colors">
                    Kasualtal →
                  </h4>
                  <p className="text-xs text-[#575c58]">
                    Dop, vigsel och begravning.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 pt-6 border-t border-[#e8e4df] text-center text-xs text-[#8c918d]">
          Kyrkoårets bibeltexter är hämtade från Svenska kyrkans evangeliebok (2002). <br />
          © 2026 Patric Ivan. Innehåll genererat av användare mha AI.
        </footer>

      </div>
    </main>
  );
}