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
