/**
 * Panchanga calculation and master database generation.
 * Requires swisseph native addon + ephemeris files in ./ephe/
 *
 * Usage:
 *   import { generatePanchangaForRange } from './generate.js';
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = resolve(__dirname, '..', 'master_database.json');

const require = createRequire(import.meta.url);
const swe = require('swisseph');

swe.swe_set_ephe_path(resolve(__dirname, '..', 'ephe'));
swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
swe.swe_set_topo(88.3639, 22.5726, 9); // longitude, latitude, elevation (Kolkata)

const SIDEREAL = swe.SEFLG_SIDEREAL;
const IST_OFFSET = 5.5 / 24;

// Solar eclipse bitmask constants (swe_sol_eclipse_when_glob rflag)
const SE_ECL_TOTAL         = 1;
const SE_ECL_ANNULAR       = 2;
const SE_ECL_PARTIAL       = 4;
const SE_ECL_ANNULAR_TOTAL = 8;   // hybrid

// Lunar eclipse bitmask constants (swe_lun_eclipse_when rflag)
// From swedef.h: SE_ECL_TOTAL=4, SE_ECL_PARTIAL=16, SE_ECL_PENUMBRAL=64
const LUN_ECL_TOTAL     = 4;
const LUN_ECL_PARTIAL   = 16;
const LUN_ECL_PENUMBRAL = 64;

export const TITHI_NAMES = [
  'প্রথমা', 'দ্বিতীয়া', 'তৃতীয়া', 'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী',
  'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী', 'একাদশী', 'দ্বাদশী',
  'ত্রয়োদশী', 'চতুর্দশী', 'পূর্ণিমা', 'প্রথমা', 'দ্বিতীয়া', 'তৃতীয়া',
  'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী', 'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী',
  'একাদশী', 'দ্বাদশী', 'ত্রয়োদশী', 'চতুর্দশী', 'অমাবস্যা',
];

export const NAKSHATRA_NAMES = [
  'অশ্বিনী', 'ভরণী', 'কৃত্তিকা', 'রোহিণী', 'মৃগশিরা', 'আর্দ্রা',
  'পুনর্বসু', 'পুষ্যা', 'আশ্লেষা', 'মঘা', 'পূর্বফাল্গুনী', 'উত্তরফাল্গুনী',
  'হস্ত', 'চিত্রা', 'স্বাতী', 'বিশাখা', 'অনুরাধা', 'জ্যেষ্ঠা',
  'মূলা', 'পূর্বাষাঢ়া', 'উত্তরাষাঢ়া', 'শ্রবণা', 'ধনিষ্ঠা', 'শতভিষা',
  'পূর্বভদ্র', 'উত্তরভদ্র', 'রেবতী',
];

export const BENGALI_MONTHS = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র',
];

function getLongitudes(jd) {
  const sun = swe.swe_calc_ut(jd, swe.SE_SUN, SIDEREAL);
  const moon = swe.swe_calc_ut(jd, swe.SE_MOON, SIDEREAL);
  return { sun: sun.longitude % 360, moon: moon.longitude % 360 };
}

function moonSunAngle(jd) {
  const { sun, moon } = getLongitudes(jd);
  return ((moon - sun) % 360 + 360) % 360;
}

function getTithiInfo(jd) {
  const angle = moonSunAngle(jd);
  const tithiNum = Math.floor(angle / 12);
  return {
    tithiNum,
    tithiName: TITHI_NAMES[tithiNum],
    paksha: tithiNum < 15 ? 'শুক্ল পক্ষ' : 'কৃষ্ণ পক্ষ',
  };
}

function findTithiTransition(jdStart, tithiNum) {
  const targetAngle = ((tithiNum + 1) * 12) % 360;
  let jdLow = jdStart;
  let jdHigh = jdStart + 2;
  let jdMid;
  while (jdHigh - jdLow > 1 / 1440) {
    jdMid = (jdLow + jdHigh) / 2;
    if (moonSunAngle(jdMid) < targetAngle) jdLow = jdMid;
    else jdHigh = jdMid;
  }
  return jdMid;
}

function findTithiStart(jdStart, tithiNum) {
  const prevTithi = ((tithiNum - 1) % 30 + 30) % 30;
  const targetAngle = ((prevTithi + 1) * 12) % 360;
  let jdLow = jdStart - 2;
  let jdHigh = jdStart;
  let jdMid;
  while (jdHigh - jdLow > 1 / 1440) {
    jdMid = (jdLow + jdHigh) / 2;
    if (moonSunAngle(jdMid) < targetAngle) jdLow = jdMid;
    else jdHigh = jdMid;
  }
  return jdMid;
}

function getNakshatra(jd) {
  const moon = swe.swe_calc_ut(jd + IST_OFFSET, swe.SE_MOON, SIDEREAL);
  const moonLong = moon.longitude % 360;
  const rawNum = Math.floor(moonLong / (360 / 27));
  return NAKSHATRA_NAMES[rawNum % 27];
}

function getBengaliMonthCivilKolkata(year, month, day) {
  const d = new Date(year, month - 1, day).getTime();
  const B = (y, m, day) => new Date(y, m - 1, day).getTime();
  const boundaries = [
    [B(year, 4, 14),     'বৈশাখ'],
    [B(year, 5, 15),     'জ্যৈষ্ঠ'],
    [B(year, 6, 15),     'আষাঢ়'],
    [B(year, 7, 16),     'শ্রাবণ'],
    [B(year, 8, 17),     'ভাদ্র'],
    [B(year, 9, 17),     'আশ্বিন'],
    [B(year, 10, 18),    'কার্তিক'],
    [B(year, 11, 17),    'অগ্রহায়ণ'],
    [B(year, 12, 16),    'পৌষ'],
    [B(year + 1, 1, 15), 'মাঘ'],
    [B(year + 1, 2, 14), 'ফাল্গুন'],
    [B(year + 1, 3, 15), 'চৈত্র'],
  ];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const [start, name] = boundaries[i];
    const [next] = boundaries[i + 1];
    if (d >= start && d < next) return name;
  }
  return 'চৈত্র';
}

function jdToDateTime(jd) {
  const { year, month, day, hour } = swe.swe_revjul(jd + IST_OFFSET, swe.SE_GREG_CAL);
  const totalMinutes = Math.floor(hour * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return {
    date: `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`,
    time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
}

function getBengaliYear(year, month, day) {
  const pohelaBoishakh = new Date(year, 3, 14).getTime(); // April 14
  const current = new Date(year, month - 1, day).getTime();
  return current >= pohelaBoishakh ? year - 593 : year - 594;
}

function solarEclipseSubtype(rflag) {
  if (rflag & SE_ECL_ANNULAR_TOTAL) return 'hybrid';
  if (rflag & SE_ECL_TOTAL)         return 'total';
  if (rflag & SE_ECL_ANNULAR)       return 'annular';
  return 'partial';
}

function lunarEclipseSubtype(rflag) {
  if (rflag & LUN_ECL_TOTAL)   return 'total';
  if (rflag & LUN_ECL_PARTIAL) return 'partial';
  return 'penumbral';
}

// Returns a map of { 'DD-MM-YYYY': eclipseObj } for all eclipses whose
// maximum falls within the given calendar year.
function findEclipsesForYear(year) {
  const jdStart = swe.swe_julday(year,     1, 1, 0.0, swe.SE_GREG_CAL);
  const jdEnd   = swe.swe_julday(year + 1, 1, 1, 0.0, swe.SE_GREG_CAL);
  const map = {};

  // Solar eclipses — keyed by IST date of first contact (r.begin)
  let jd = jdStart;
  while (true) {
    const r = swe.swe_sol_eclipse_when_glob(jd, 0, 0, 0);
    if (r.error || r.maximum >= jdEnd) break;
    const startDt = jdToDateTime(r.begin);
    const maxDt   = jdToDateTime(r.maximum);
    map[startDt.date] = {
      type: 'solar',
      subtype: solarEclipseSubtype(r.rflag),
      startTime:   startDt,
      endTime:     jdToDateTime(r.end),
      maximumTime: maxDt,
    };
    jd = r.maximum + 25;
  }

  // Lunar eclipses — keyed by IST date of penumbral ingress (r.penumbralBegin)
  jd = jdStart;
  while (true) {
    const r = swe.swe_lun_eclipse_when(jd, 0, 0, 0);
    if (r.error || r.maximum >= jdEnd) break;
    const startDt = jdToDateTime(r.penumbralBegin);
    const maxDt   = jdToDateTime(r.maximum);
    map[startDt.date] = {
      type: 'lunar',
      subtype: lunarEclipseSubtype(r.rflag),
      startTime:   startDt,
      endTime:     jdToDateTime(r.penumbralEnd),
      maximumTime: maxDt,
    };
    jd = r.maximum + 25;
  }

  return map;
}

export function calculatePanchanga(year, month, day) {
  const jd = swe.swe_julday(year, month, day, 0.0, swe.SE_GREG_CAL);
  const { tithiNum, tithiName, paksha } = getTithiInfo(jd);
  const nakshatra = getNakshatra(jd);
  const bengaliMonth = getBengaliMonthCivilKolkata(year, month, day);
  const bengaliYear = getBengaliYear(year, month, day);

  const start = jdToDateTime(findTithiStart(jd, tithiNum));
  const end = jdToDateTime(findTithiTransition(jd, tithiNum));

  const key = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  return {
    [key]: {
      date: key,
      tithi: {
        name: tithiName,
        paksha,
        startTime: { date: start.date, time: start.time },
        endTime:   { date: end.date,   time: end.time   },
      },
      nakshatra: { name: nakshatra },
      bengaliMonth,
      bengaliYear,
    },
  };
}

export function generatePanchangaForYear(year) {
  const panchanga = existsSync(DB_PATH)
    ? JSON.parse(readFileSync(DB_PATH, 'utf8'))
    : {};

  const eclipses = findEclipsesForYear(year);
  const eclipseCount = Object.keys(eclipses).length;
  if (eclipseCount > 0) {
    console.log(`   ${year}: found ${eclipseCount} eclipse(s): ${Object.entries(eclipses).map(([k, v]) => `${k}(${v.type}/${v.subtype})`).join(', ')}`);
  }

  for (let d = new Date(year, 0, 1); d < new Date(year + 1, 0, 1); d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    try {
      console.log(`++ ${y}/${m}/${day}`);
      const entry = calculatePanchanga(y, m, day);
      const key = Object.keys(entry)[0];
      if (eclipses[key]) {
        entry[key].eclipse = eclipses[key];
      }
      Object.assign(panchanga, entry);
    } catch (e) {
      console.error(`Error on ${y}-${m}-${day}: ${e.message}`);
    }
  }

  writeFileSync(DB_PATH, JSON.stringify(panchanga, null, 2), 'utf8');
  return panchanga;
}

export function generatePanchangaForRange(year1, year2) {
  for (let y = year1; y <= year2; y++) {
    generatePanchangaForYear(y);
  }
}
