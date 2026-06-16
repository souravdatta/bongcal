#!/usr/bin/env bash
# Downloads Swiss Ephemeris data files required by bongcal.
# Files cover dates 1800–2400 (Lahiri/sidereal, Kolkata).
set -euo pipefail

EPHE_DIR="$(cd "$(dirname "$0")/.." && pwd)/ephe"
BASE="https://github.com/aloistr/swisseph/raw/master/ephe/"
FILES="seas_18.se1 semo_18.se1 sepl_18.se1"

mkdir -p "$EPHE_DIR"

for f in $FILES; do
    dest="$EPHE_DIR/$f"
    if [ -f "$dest" ]; then
        echo "  [skip] $f already exists"
    else
        echo "  [get]  $f"
        curl -fsSL "$BASE$f" -o "$dest"
    fi
done

echo "Ephemeris files ready in: $EPHE_DIR"
