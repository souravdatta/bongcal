import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '..', 'master_database.json');

let _db = null;

function loadDb() {
  if (_db) return _db;
  if (!existsSync(DB_PATH)) {
    throw new Error(
      `master_database.json not found at ${DB_PATH}. Run "npm run generate" first.`
    );
  }
  _db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  return _db;
}

/**
 * Returns the panchanga entry for the given Gregorian date.
 * Throws if the date is outside the generated range.
 *
 * @param {number} year  - Gregorian year (e.g. 2026)
 * @param {number} month - Month 1–12
 * @param {number} day   - Day 1–31
 * @returns {{ date, tithi, nakshatra, bengaliMonth, bengaliYear }}
 */
export function findTithiForDate(year, month, day) {
  const db = loadDb();
  const key = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const entry = db[key];
  if (!entry) {
    throw new RangeError(
      `No data for ${key}. Date may be outside the generated range. Run "npm run generate" to extend coverage.`
    );
  }
  return entry;
}
