/**
 * Integration tests for findTithiForDate — verified against Drik Panchang.
 * Source: https://www.drikpanchang.com/panchang/day-panchang.html?date=DD/MM/YYYY
 *
 * Requires: master_database.json generated via `npm run generate`.
 *
 * Run: node --test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTithiForDate } from '../src/index.js';

// ---------------------------------------------------------------------------
// yesterday: 14 Jun 2026
// Drik: Krishna Chaturdashi (ends 12:19 PM IST), Rohini (ends 10:14 PM IST)
// ---------------------------------------------------------------------------
test('14-Jun-2026: Krishna Chaturdashi, Rohini, Jyeshtha 1433', () => {
  const day = findTithiForDate(2026, 6, 14);

  assert.ok(day, 'entry for 14-06-2026 must exist');
  assert.equal(day.tithi.name,     'চতুর্দশী');
  assert.equal(day.tithi.paksha,   'কৃষ্ণ পক্ষ');
  assert.equal(day.nakshatra.name, 'রোহিণী');
  assert.equal(day.bengaliMonth,   'জ্যৈষ্ঠ');
  assert.equal(day.bengaliYear,    1433);
});

// ---------------------------------------------------------------------------
// today: 15 Jun 2026
// Drik: Krishna Amavasya (ends 08:23 AM IST), Mrigashira (ends 07:08 PM IST)
// Bengali month boundary — Ashadha starts on 15 Jun
// ---------------------------------------------------------------------------
test('15-Jun-2026: Krishna Amavasya, Mrigashira, Ashadha 1433', () => {
  const day = findTithiForDate(2026, 6, 15);

  assert.ok(day, 'entry for 15-06-2026 must exist');
  assert.equal(day.tithi.name,     'অমাবস্যা');
  assert.equal(day.tithi.paksha,   'কৃষ্ণ পক্ষ');
  assert.equal(day.nakshatra.name, 'মৃগশিরা');
  assert.equal(day.bengaliMonth,   'আষাঢ়');
  assert.equal(day.bengaliYear,    1433);
});

// ---------------------------------------------------------------------------
// two days from now: 17 Jun 2026
// Drik: Shukla Tritiya (ends 09:38 PM IST), Punarvasu (ends 01:37 PM IST)
// ---------------------------------------------------------------------------
test('17-Jun-2026: Shukla Tritiya, Punarvasu, Ashadha 1433', () => {
  const day = findTithiForDate(2026, 6, 17);

  assert.ok(day, 'entry for 17-06-2026 must exist');
  assert.equal(day.tithi.name,     'তৃতীয়া');
  assert.equal(day.tithi.paksha,   'শুক্ল পক্ষ');
  assert.equal(day.nakshatra.name, 'পুনর্বসু');
  assert.equal(day.bengaliMonth,   'আষাঢ়');
  assert.equal(day.bengaliYear,    1433);
});

// ---------------------------------------------------------------------------
// one year back: 15 Jun 2025
// Drik: Krishna Chaturthi (ends 03:51 PM IST), Shravana (ends 01:00 AM IST)
// ---------------------------------------------------------------------------
test('15-Jun-2025: Krishna Chaturthi, Shravana, Ashadha 1432', () => {
  const day = findTithiForDate(2025, 6, 15);

  assert.ok(day, 'entry for 15-06-2025 must exist');
  assert.equal(day.tithi.name,     'চতুর্থী');
  assert.equal(day.tithi.paksha,   'কৃষ্ণ পক্ষ');
  assert.equal(day.nakshatra.name, 'শ্রবণা');
  assert.equal(day.bengaliMonth,   'আষাঢ়');
  assert.equal(day.bengaliYear,    1432);
});

// ---------------------------------------------------------------------------
// five years later: 15 Jun 2031
// Drik: Krishna Ekadashi (ends 08:11 PM IST), Ashwini (ends 10:43 PM IST)
// ---------------------------------------------------------------------------
test('15-Jun-2031: Krishna Ekadashi, Ashwini, Ashadha 1438', () => {
  const day = findTithiForDate(2031, 6, 15);

  assert.ok(day, 'entry for 15-06-2031 must exist');
  assert.equal(day.tithi.name,     'একাদশী');
  assert.equal(day.tithi.paksha,   'কৃষ্ণ পক্ষ');
  assert.equal(day.nakshatra.name, 'অশ্বিনী');
  assert.equal(day.bengaliMonth,   'আষাঢ়');
  assert.equal(day.bengaliYear,    1438);
});

// ---------------------------------------------------------------------------
// Bengali day-of-month — verified against Drik Panchang and civil calendar rules
// ---------------------------------------------------------------------------

// 1 Baisakh = Apr 14 (Bengali New Year)
test('14-Apr-2026: 1 Baisakh 1433', () => {
  const d = findTithiForDate(2026, 4, 14);
  assert.equal(d.bengaliMonth, 'বৈশাখ');
  assert.equal(d.bengaliYear,  1433);
  assert.equal(d.bengaliDay,   1);
});

// Last day of Jyeshtha: Jun 14 = day 31 (May 15 = day 1, +30 days = Jun 14)
test('14-Jun-2026: 31 Jyeshtha 1433', () => {
  const d = findTithiForDate(2026, 6, 14);
  assert.equal(d.bengaliMonth, 'জ্যৈষ্ঠ');
  assert.equal(d.bengaliDay,   31);
});

// First day of Ashadha
test('15-Jun-2026: 1 Ashadha 1433', () => {
  const d = findTithiForDate(2026, 6, 15);
  assert.equal(d.bengaliMonth, 'আষাঢ়');
  assert.equal(d.bengaliDay,   1);
});

// Today
test('16-Jun-2026: 2 Ashadha 1433', () => {
  const d = findTithiForDate(2026, 6, 16);
  assert.equal(d.bengaliMonth, 'আষাঢ়');
  assert.equal(d.bengaliDay,   2);
});

// Mid-year: 1 Magh = Jan 15 (crosses into next Gregorian year)
test('15-Jan-2026: 1 Magh 1432', () => {
  const d = findTithiForDate(2026, 1, 15);
  assert.equal(d.bengaliMonth, 'মাঘ');
  assert.equal(d.bengaliYear,  1432);
  assert.equal(d.bengaliDay,   1);
});

// 1 Falgun = Feb 14
test('14-Feb-2026: 1 Falgun 1432', () => {
  const d = findTithiForDate(2026, 2, 14);
  assert.equal(d.bengaliMonth, 'ফাল্গুন');
  assert.equal(d.bengaliYear,  1432);
  assert.equal(d.bengaliDay,   1);
});
