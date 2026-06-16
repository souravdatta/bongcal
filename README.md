# bongcal

Bengali Panchanga (Hindu almanac) calculator. Computes Tithi, Nakshatra, Paksha, Bengali month, and Bengali year for any Gregorian date, calibrated for Kolkata (Lahiri ayanamsha, sidereal).

## Prerequisites

### Node.js

Node.js 18 or later.

### Native build tools (for `swisseph`)

`swisseph` compiles a native C addon. Install the Visual C++ build tools first.

**Option A — windows-build-tools (automated):**
```powershell
npm install --global --production windows-build-tools
```

**Option B — manual:** Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), selecting the **"Desktop development with C++"** workload.

Then install node-gyp globally:
```powershell
npm install --global node-gyp
```

## Installation

```powershell
cd C:\Work\bongcal
npm install
```

## Ephemeris files

The Swiss Ephemeris data files are not bundled with the npm package. They must be placed in an `ephe/` directory at the project root.

Create the directory and download the three files that cover 1800–2400:

```powershell
New-Item -ItemType Directory -Path C:\Work\bongcal\ephe -Force

$base = "https://github.com/aloistr/swisseph/raw/master/ephe/"
$files = "seas_18.se1", "semo_18.se1", "sepl_18.se1"
foreach ($f in $files) {
    Invoke-WebRequest "$base$f" -OutFile "C:\Work\bongcal\ephe\$f"
}
```

| File | Contents |
|---|---|
| `seas_18.se1` | Main planets 1800–2400 |
| `semo_18.se1` | Moon 1800–2400 |
| `sepl_18.se1` | Outer planets 1800–2400 |

## Usage

```js
import { calculatePanchanga, generatePanchangaForYear } from 'bongcal';

// Single date
const result = calculatePanchanga(2026, 6, 15);
console.log(result['15-06-2026']);

// Full year (writes/updates master_database.json)
generatePanchangaForYear(2026);
```

### Output shape

```json
{
  "15-06-2026": {
    "date": "15-06-2026",
    "tithi": {
      "name": "অমাবস্যা",
      "paksha": "কৃষ্ণ পক্ষ",
      "startTime": { "date": "14-06-2026", "time": "12:19" },
      "endTime":   { "date": "15-06-2026", "time": "08:23" }
    },
    "nakshatra": { "name": "মৃগশিরা" },
    "bengaliMonth": "আষাঢ়",
    "bengaliYear": 1433
  }
}
```

## Running tests

```powershell
npm test
```

Tests are verified against [Drik Panchang](https://www.drikpanchang.com/panchang/day-panchang.html) for five dates spanning 2025–2031.

## Configuration

The library is hardcoded for Kolkata coordinates and Lahiri ayanamsha. To change location, edit the top of `src/index.js`:

```js
swe.swe_set_topo(88.3639, 22.5726, 9); // longitude, latitude, elevation
```
