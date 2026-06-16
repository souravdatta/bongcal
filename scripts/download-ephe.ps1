# Downloads Swiss Ephemeris data files required by bongcal.
# Files cover dates 1800–2400 (Lahiri/sidereal, Kolkata).

$epheDir = Join-Path $PSScriptRoot ".." "ephe"
New-Item -ItemType Directory -Path $epheDir -Force | Out-Null

$base  = "https://github.com/aloistr/swisseph/raw/master/ephe/"
$files = "seas_18.se1", "semo_18.se1", "sepl_18.se1"

foreach ($f in $files) {
    $dest = Join-Path $epheDir $f
    if (Test-Path $dest) {
        Write-Host "  [skip] $f already exists"
    } else {
        Write-Host "  [get]  $f"
        Invoke-WebRequest "$base$f" -OutFile $dest
    }
}

Write-Host "Ephemeris files ready in: $epheDir"
