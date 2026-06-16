/**
 * Deletes master_database.json and regenerates it from scratch for 1926–2126.
 * Usage: npm run regenerate
 */

import { unlinkSync, existsSync } from 'fs';
import { DB_PATH, generatePanchangaForRange } from '../src/generate.js';

const START_YEAR = 1926;
const END_YEAR   = 2126;

if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log(`Deleted ${DB_PATH}`);
}

const t0 = Date.now();
generatePanchangaForRange(START_YEAR, END_YEAR);
const elapsed = ((Date.now() - t0) / 60000).toFixed(1);
console.log(`\nDone. ${END_YEAR - START_YEAR + 1} years generated in ${elapsed} min.`);
