/**
 * Generates Panchanga for 1926–2126 (100 years back + 100 years forward
 * from 2026) and writes everything into master_database.json.
 *
 * Usage:
 *   node scripts/generate-master.js
 *
 * Resumes from where it left off — dates already in master_database.json
 * are skipped automatically by generatePanchangaForYear.
 *
 * Progress is printed as:  ++ YYYY/M/D
 * Estimated time: ~5–15 min depending on hardware.
 */

import { generatePanchangaForRange } from '../src/generate.js';

const START_YEAR = 1926;
const END_YEAR   = 2126;
const TOTAL      = END_YEAR - START_YEAR + 1;

console.log(`Generating Panchanga for ${START_YEAR}–${END_YEAR} (${TOTAL} years)…`);
console.log('Output: master_database.json\n');

const t0 = Date.now();
generatePanchangaForRange(START_YEAR, END_YEAR);
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`\nDone. ${TOTAL} years processed in ${elapsed}s.`);
