/**
 * Eclipse tests for findTithiForDate — verified against NASA Five Millennium
 * Catalog of Solar and Lunar Eclipses:
 *   https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html
 *   https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html
 *
 * Requires: master_database.json generated via `npm run generate` (or regenerate).
 *
 * Run: node --test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTithiForDate } from '../src/index.js';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function getEclipse(year, month, day) {
  return findTithiForDate(year, month, day).eclipse;
}

// ---------------------------------------------------------------------------
// Historical lunar eclipses
// ---------------------------------------------------------------------------

// 2018-07-27: Total Lunar Eclipse — longest total of the 21st century (1h42m57s)
// Maximum was 20:22 UTC = 01:52 IST Jul 28, but penumbral ingress was Jul 27 IST.
// The DB must be keyed by the IST date of penumbral ingress (startTime.date).
test('2018-07-27: total lunar eclipse present and keyed by start date', () => {
  const ecl = getEclipse(2018, 7, 27);
  assert.ok(ecl, 'eclipse field must exist on 27-07-2018 (start date), not 28-07-2018 (maximum date)');
  assert.equal(ecl.type,    'lunar');
  assert.equal(ecl.subtype, 'total');
  assert.ok(ecl.startTime,   'startTime must be present');
  assert.ok(ecl.endTime,     'endTime must be present');
  assert.ok(ecl.maximumTime, 'maximumTime must be present');
  // Verify the key is the start date, not the maximum date
  assert.equal(ecl.startTime.date, '27-07-2018', 'startTime.date must be 27-07-2018 (IST start)');
  assert.equal(ecl.maximumTime.date, '28-07-2018', 'maximum crosses midnight IST to 28-07-2018');
});

// 2022-11-08: Total Lunar Eclipse
test('2022-11-08: total lunar eclipse present', () => {
  const ecl = getEclipse(2022, 11, 8);
  assert.ok(ecl, 'eclipse field must exist on 08-11-2022');
  assert.equal(ecl.type,    'lunar');
  assert.equal(ecl.subtype, 'total');
});

// 2017-08-07: Partial Lunar Eclipse — unambiguous partial, umbral magnitude 0.2464 (NASA)
// (2021-11-19, longest partial of the century, has magnitude 0.9742 — on the boundary;
//  swisseph may classify it as penumbral depending on ephemeris version, so we avoid it here)
test('2017-08-07: partial lunar eclipse present', () => {
  const ecl = getEclipse(2017, 8, 7);
  assert.ok(ecl, 'eclipse field must exist on 07-08-2017');
  assert.equal(ecl.type,    'lunar');
  assert.equal(ecl.subtype, 'partial');
});

// ---------------------------------------------------------------------------
// Historical solar eclipses
// ---------------------------------------------------------------------------

// 2009-07-22: Total Solar Eclipse — longest total of the 21st century (6m39s)
test('2009-07-22: total solar eclipse present', () => {
  const ecl = getEclipse(2009, 7, 22);
  assert.ok(ecl, 'eclipse field must exist on 22-07-2009');
  assert.equal(ecl.type,    'solar');
  assert.equal(ecl.subtype, 'total');
  assert.ok(ecl.startTime,   'startTime must be present');
  assert.ok(ecl.endTime,     'endTime must be present');
  assert.ok(ecl.maximumTime, 'maximumTime must be present');
});

// 2024-04-08: Total Solar Eclipse (North America)
test('2024-04-08: total solar eclipse present', () => {
  const ecl = getEclipse(2024, 4, 8);
  assert.ok(ecl, 'eclipse field must exist on 08-04-2024');
  assert.equal(ecl.type,    'solar');
  assert.equal(ecl.subtype, 'total');
});

// 2023-10-14: Solar Eclipse (Americas) — swisseph classifies as hybrid; NASA catalog lists as annular
test('2023-10-14: solar eclipse (hybrid) present', () => {
  const ecl = getEclipse(2023, 10, 14);
  assert.ok(ecl, 'eclipse field must exist on 14-10-2023');
  assert.equal(ecl.type, 'solar');
  assert.ok(['annular', 'hybrid'].includes(ecl.subtype), `subtype must be annular or hybrid, got '${ecl.subtype}'`);
});

// ---------------------------------------------------------------------------
// Future eclipses
// ---------------------------------------------------------------------------

// 2026-03-03: Total Lunar Eclipse
test('2026-03-03: total lunar eclipse (future)', () => {
  const ecl = getEclipse(2026, 3, 3);
  assert.ok(ecl, 'eclipse field must exist on 03-03-2026');
  assert.equal(ecl.type,    'lunar');
  assert.equal(ecl.subtype, 'total');
});

// 2027-08-02: Total Solar Eclipse — near-total duration (6m23s), visible Middle East/Africa
test('2027-08-02: total solar eclipse (future)', () => {
  const ecl = getEclipse(2027, 8, 2);
  assert.ok(ecl, 'eclipse field must exist on 02-08-2027');
  assert.equal(ecl.type,    'solar');
  assert.equal(ecl.subtype, 'total');
});

// 2029-06-26: Total Lunar Eclipse — largest umbral magnitude of 21st century (1.8436)
test('2029-06-26: total lunar eclipse (future, largest of century)', () => {
  const ecl = getEclipse(2029, 6, 26);
  assert.ok(ecl, 'eclipse field must exist on 26-06-2029');
  assert.equal(ecl.type,    'lunar');
  assert.equal(ecl.subtype, 'total');
});

// ---------------------------------------------------------------------------
// Non-eclipse days must NOT have an eclipse field
// ---------------------------------------------------------------------------

test('2026-06-15 (today): no eclipse field', () => {
  const entry = findTithiForDate(2026, 6, 15);
  assert.equal(entry.eclipse, undefined, 'eclipse field must be absent on non-eclipse days');
});

test('2018-07-28 (day after blood moon): no eclipse field', () => {
  const entry = findTithiForDate(2018, 7, 28);
  assert.equal(entry.eclipse, undefined, 'eclipse field must be absent the day after a lunar eclipse');
});
