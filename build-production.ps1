# Export statique de production — Mission Cosmos
# Produit out/ a la racine du projet. N'envoie rien sur le VPS.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'package.json'))) {
  Write-Host 'ECHEC  package.json introuvable. Lance le script depuis la racine du projet.'
  exit 1
}

$buildId = Get-Date -Format 'yyyyMMdd-HHmmss'
$env:NEXT_PUBLIC_BUILD_ID = $buildId
$env:NEXT_PUBLIC_APP_URL = 'https://missioncosmos.fr'
$env:NEXT_PUBLIC_APP_ENV = 'production'
$env:NEXT_PUBLIC_BASE_PATH = ''
$env:GITHUB_PAGES = 'false'

$started = Get-Date
Write-Host ''
Write-Host ("[{0}] Debut du build  id={1}" -f $started.ToString('HH:mm:ss'), $buildId)

npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host ("[{0}] ECHEC  npm run build (code {1})" -f (Get-Date).ToString('HH:mm:ss'), $LASTEXITCODE)
  exit $(if ($LASTEXITCODE) { $LASTEXITCODE } else { 1 })
}

$swPath = Join-Path $PSScriptRoot 'out\sw.js'
if (-not (Test-Path -LiteralPath $swPath)) {
  Write-Host 'ECHEC  out/sw.js introuvable apres le build.'
  exit 1
}

$utf8 = New-Object System.Text.UTF8Encoding $false
$swText = [System.IO.File]::ReadAllText($swPath)
if ($swText -notmatch 'mc-build:source') {
  Write-Host 'ECHEC  marqueur mc-build:source absent de out/sw.js.'
  exit 1
}
$swText = $swText.Replace('/* mc-build:source */', "/* mc-build:$buildId */")
[System.IO.File]::WriteAllText($swPath, $swText, $utf8)

$required = @(
  'out\index.html',
  'out\missions\index.html',
  'out\collection\index.html',
  'out\profil\index.html',
  'out\settings\index.html',
  'out\a-propos\index.html',
  'out\confidentialite\index.html',
  'out\contact\index.html',
  'out\manifest.webmanifest',
  'out\sw.js',
  'out\robots.txt',
  'out\sitemap.xml',
  'out\404.html'
)

foreach ($index in 1..14) {
  $required += ('out\mission\mission-{0:d2}\index.html' -f $index)
}

$missing = @()
foreach ($relative in $required) {
  $full = Join-Path $PSScriptRoot $relative
  if (Test-Path -LiteralPath $full) {
    Write-Host "OK      $relative"
  } else {
    Write-Host "MANQUE  $relative"
    $missing += $relative
  }
}

$manifest = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'out\manifest.webmanifest'))
$manifestOk = $manifest -match '"name"\s*:\s*"Mission Cosmos"' `
  -and $manifest -match '"short_name"\s*:\s*"Cosmos"' `
  -and $manifest -match '"start_url"\s*:\s*"/"' `
  -and $manifest -match '"scope"\s*:\s*"/"' `
  -and $manifest -match '"display"\s*:\s*"standalone"'
if ($manifestOk) {
  Write-Host 'OK      manifest name/short_name/start_url/scope/display'
} else {
  Write-Host 'MANQUE  champs PWA attendus dans manifest.webmanifest'
  $missing += 'manifest-fields'
}

$swCheck = [System.IO.File]::ReadAllText($swPath)
if ($swCheck -match [regex]::Escape("mc-build:$buildId") -and $swCheck -match 'mc-runtime-\$\{VERSION\}') {
  Write-Host "OK      sw.js estampille $buildId et cache runtime versionne"
} else {
  Write-Host 'MANQUE  estampille ou cache runtime dans sw.js'
  $missing += 'sw-stamp'
}

$sitemap = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'out\sitemap.xml'))
foreach ($url in @(
    'https://missioncosmos.fr/',
    'https://missioncosmos.fr/missions/',
    'https://missioncosmos.fr/a-propos/',
    'https://missioncosmos.fr/confidentialite/',
    'https://missioncosmos.fr/contact/'
  )) {
  if ($sitemap -notlike "*$url*") {
    Write-Host "MANQUE  sitemap $url"
    $missing += "sitemap:$url"
  }
}
if (-not ($missing | Where-Object { $_ -like 'sitemap:*' })) {
  Write-Host 'OK      sitemap pages publiques'
}

$elapsed = [int]((Get-Date) - $started).TotalSeconds
Write-Host ''
if ($missing.Count -gt 0) {
  Write-Host ("[{0}] ECHEC  build {1} incomplet ({2} s)" -f (Get-Date).ToString('HH:mm:ss'), $buildId, $elapsed)
  exit 1
}

Write-Host ("[{0}] SUCCES  build {1} ({2} s)" -f (Get-Date).ToString('HH:mm:ss'), $buildId, $elapsed)
Write-Host 'Dossier pret : out\'
Write-Host 'Deploiement VPS : copie manuelle du contenu de out\ vers /home/ubuntu/missioncosmos/build/'
exit 0
