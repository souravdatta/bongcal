# bongcal

Bengali Panchanga (Hindu almanac) for Node.js. Given a Gregorian date, returns Tithi, Paksha, Nakshatra, Bengali month, Bengali year, Bengali day-of-month, and any solar or lunar eclipse — all calibrated for Kolkata (Lahiri ayanamsha, IST).

Coverage: **1926 – 2126**.

---

## Usage

### Use case 1 — install from GitHub (no compiler needed)

The pre-generated database ships with the package. No ephemeris files or native build step required at install time.

```bash
npm install github:your-username/bongcal
```

```js
import { findTithiForDate } from 'bongcal';

const entry = findTithiForDate(2026, 6, 15);
console.log(entry);
```

**Output:**

```json
{
  "date": "15-06-2026",
  "tithi": {
    "name": "অমাবস্যা",
    "paksha": "কৃষ্ণ পক্ষ",
    "startTime": { "date": "14-06-2026", "time": "12:19" },
    "endTime":   { "date": "15-06-2026", "time": "08:23" }
  },
  "nakshatra": { "name": "মৃগশিরা" },
  "bengaliMonth": "আষাঢ়",
  "bengaliYear": 1433,
  "bengaliDay": 1
}
```

On eclipse days the entry also contains an `eclipse` field:

```json
{
  "date": "27-07-2018",
  "tithi": { "..." },
  "nakshatra": { "..." },
  "bengaliMonth": "শ্রাবণ",
  "bengaliYear": 1425,
  "bengaliDay": 11,
  "eclipse": {
    "type": "lunar",
    "subtype": "total",
    "startTime":   { "date": "27-07-2018", "time": "22:44" },
    "maximumTime": { "date": "28-07-2018", "time": "01:51" },
    "endTime":     { "date": "28-07-2018", "time": "04:58" }
  }
}
```

`eclipse` is absent (not `null`) on non-eclipse days.

All times are **IST (UTC+5:30)**. The eclipse is keyed by its **IST start date** (first contact / penumbral ingress), which may differ from the date of maximum.

---

### Use case 2 — local development (regenerate the database)

Use this when you want to rebuild the database, extend the date range, or modify the calculation engine.

#### Prerequisites

- Node.js 18+
- A C++ compiler for the native `swisseph` addon:
  - **Windows:** [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **"Desktop development with C++"** workload, then `npm install -g node-gyp`
  - **Linux/WSL:** `sudo apt install build-essential`

```bash
git clone https://github.com/your-username/bongcal
cd bongcal
npm install          # compiles swisseph + downloads ephemeris files
npm run regenerate   # rebuilds master_database.json (takes ~10 min)
npm test
```

To extend or change the date range, edit `scripts/generate-master.js`:

```js
const START_YEAR = 1926;
const END_YEAR   = 2126;
```

Then run `npm run regenerate`.

---

## API

### `findTithiForDate(year, month, day)`

| Parameter | Type | Description |
|---|---|---|
| `year` | `number` | Gregorian year |
| `month` | `number` | Month 1–12 |
| `day` | `number` | Day 1–31 |

Returns the panchanga entry object for that date. Throws `RangeError` if the date is outside the generated range.

**Return fields:**

| Field | Type | Description |
|---|---|---|
| `date` | `string` | `"DD-MM-YYYY"` |
| `tithi.name` | `string` | Bengali tithi name |
| `tithi.paksha` | `string` | `"শুক্ল পক্ষ"` or `"কৃষ্ণ পক্ষ"` |
| `tithi.startTime` | `{date, time}` | IST start of this tithi |
| `tithi.endTime` | `{date, time}` | IST end of this tithi |
| `nakshatra.name` | `string` | Bengali nakshatra name |
| `bengaliMonth` | `string` | Bengali month name |
| `bengaliYear` | `number` | Bengali Saka year |
| `bengaliDay` | `number` | Day-of-month in the Bengali civil calendar (1-based) |
| `eclipse` | `object\|undefined` | Present only on eclipse days (see above) |

---

## Running tests

```bash
npm test
```

Panchanga tests are verified against [Drik Panchang](https://www.drikpanchang.com/). Eclipse tests are verified against the [NASA Five Millennium Catalog](https://eclipse.gsfc.nasa.gov/SEcat5/SEcatalog.html).
