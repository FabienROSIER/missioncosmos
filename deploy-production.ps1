# Deploiement manuel du build statique vers le VPS.
# Outils : PowerShell, ssh.exe, scp.exe. Pas de WSL, pas de secret dans ce fichier.
# Connexion : alias SSH Windows « rosierdigital » (hote, port, utilisateur, cle dans ~/.ssh/config).
# Seuls dossiers distants touches :
#   /home/ubuntu/missioncosmos/.deploy-temp
#   /home/ubuntu/missioncosmos/build
[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

# Alias du fichier config SSH. Ne pas remplacer par user@ip : le port n'est pas 22.
$SshTarget = 'rosierdigital'
$RemoteRoot = '/home/ubuntu/missioncosmos'
$RemoteTemp = '/home/ubuntu/missioncosmos/.deploy-temp'
$RemoteBuild = '/home/ubuntu/missioncosmos/build'
$RemoteBuildSlash = '/home/ubuntu/missioncosmos/build/'
$RemoteOut = '/home/ubuntu/missioncosmos/.deploy-temp/out'
$RsyncLine = 'rsync -a --delete /home/ubuntu/missioncosmos/.deploy-temp/out/ /home/ubuntu/missioncosmos/build/'
$PublicUrl = 'https://missioncosmos.fr/'

function Write-Banner {
  Write-Host '========================================'
  Write-Host 'MISSION COSMOS - DEPLOIEMENT PRODUCTION'
  Write-Host '========================================'
  Write-Host ''
}

function Stop-Deploy {
  param([string]$Message)
  Write-Host ''
  Write-Host "ECHEC  $Message"
  exit 1
}

function Assert-AllowedPaths {
  if ($RemoteRoot -ne '/home/ubuntu/missioncosmos') {
    Stop-Deploy 'chemin racine distant inattendu.'
  }
  if ($RemoteTemp -ne '/home/ubuntu/missioncosmos/.deploy-temp') {
    Stop-Deploy 'chemin temporaire inattendu.'
  }
  if ($RemoteBuildSlash -ne '/home/ubuntu/missioncosmos/build/') {
    Stop-Deploy 'destination rsync inattendue.'
  }
  $blocked = @(
    '/home/ubuntu',
    '/home/ubuntu/',
    '/home/ubuntu/missioncosmos',
    '/home/ubuntu/missioncosmos/'
  )
  if ($blocked -contains $RemoteBuild -or $blocked -contains $RemoteBuildSlash -or $blocked -contains $RemoteTemp) {
    Stop-Deploy 'un chemin trop large a ete refuse.'
  }
}

function Assert-RemoteScript {
  param(
    [string]$Script,
    [switch]$AllowRsync,
    [switch]$AllowTempDelete
  )
  $lower = $Script.ToLowerInvariant()
  foreach ($word in @('nginx', 'certbot', 'systemctl', 'pm2', 'gunicorn', 'astropoulpe', 'batireport', 'rosier')) {
    if ($lower.Contains($word)) {
      Stop-Deploy "script distant refuse (mention $word)."
    }
  }
  $removals = [regex]::Matches($Script, 'rm\s+-rf\s+--\s+(\S+)')
  foreach ($match in $removals) {
    if ($match.Groups[1].Value -ne $RemoteTemp) {
      Stop-Deploy 'suppression distante refusee.'
    }
  }
  if (-not $AllowTempDelete -and $removals.Count -gt 0) {
    Stop-Deploy 'suppression distante non prevue a cette etape.'
  }
  if ($AllowRsync) {
    if (-not $Script.Contains($RsyncLine)) {
      Stop-Deploy 'ligne rsync absente ou differente de la destination autorisee.'
    }
    if (([regex]::Matches($Script, '--delete')).Count -ne 1) {
      Stop-Deploy 'nombre de --delete inattendu.'
    }
  } elseif ($Script.Contains('rsync') -or $Script.Contains('--delete')) {
    Stop-Deploy 'rsync refuse a cette etape.'
  }
}

function Invoke-Vps {
  param(
    [string]$Script,
    [switch]$AllowRsync,
    [switch]$AllowTempDelete
  )
  Assert-AllowedPaths
  Assert-RemoteScript -Script $Script -AllowRsync:$AllowRsync -AllowTempDelete:$AllowTempDelete
  $normalized = $Script.Replace("`r", '')
  if (-not $normalized.EndsWith("`n")) {
    $normalized += "`n"
  }
  $b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($normalized))
  # base64 sans apostrophe : le mot de passe SSH, s'il est demande, reste sur la console.
  $remote = "printf '%s' '$b64' | base64 -d | bash"
  $output = & $script:SshExe -o ConnectTimeout=20 $SshTarget $remote 2>&1
  $code = $LASTEXITCODE
  if ($output) {
    $output | ForEach-Object { Write-Host "$_" }
  }
  return @{
    Code = $code
    Text = (($output | ForEach-Object { "$_" }) -join "`n")
  }
}

Write-Banner
Assert-AllowedPaths

Write-Host '[1/6] Build local...'
if ($SkipBuild) {
  Write-Host 'Build ignore (-SkipBuild). Le dossier out/ existant sera envoye.'
} else {
  $psHost = (Get-Process -Id $PID).Path
  $buildScript = Join-Path $PSScriptRoot 'build-production.ps1'
  if (-not (Test-Path -LiteralPath $buildScript)) {
    Stop-Deploy 'build-production.ps1 introuvable.'
  }
  & $psHost -NoProfile -ExecutionPolicy Bypass -File $buildScript
  if ($LASTEXITCODE -ne 0) {
    Stop-Deploy "build-production.ps1 a echoue (code $LASTEXITCODE). Deploiement interrompu. Production non modifiee."
  }
}

Write-Host ''
Write-Host '[2/6] Vérification du build...'
$requiredLocal = @(
  'out\index.html',
  'out\_next',
  'out\manifest.webmanifest',
  'out\sw.js'
)
foreach ($relative in $requiredLocal) {
  $full = Join-Path $PSScriptRoot $relative
  if (-not (Test-Path -LiteralPath $full)) {
    Stop-Deploy "$relative est absent. Deploiement interrompu. Production non modifiee."
  }
  Write-Host "OK      $relative"
}
$swText = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'out\sw.js'))
$buildId = 'inconnu'
if ($swText -match 'mc-build:([0-9]{8}-[0-9]{6})') {
  $buildId = $Matches[1]
}
Write-Host "Build   $buildId"

Write-Host ''
Write-Host '[3/6] Connexion VPS...'
$sshCmd = Get-Command ssh.exe -ErrorAction SilentlyContinue
$scpCmd = Get-Command scp.exe -ErrorAction SilentlyContinue
if (-not $sshCmd -or -not $scpCmd) {
  Stop-Deploy 'ssh.exe ou scp.exe est introuvable. Installe le client OpenSSH Windows (Parametres > Applications > Fonctionnalites facultatives > Client OpenSSH).'
}
$script:SshExe = $sshCmd.Source
$scpExe = $scpCmd.Source
Write-Host "ssh     $($sshCmd.Source)"
Write-Host "scp     $($scpCmd.Source)"

$checkScript = @'
set -euo pipefail
ROOT="/home/ubuntu/missioncosmos"
DEST="/home/ubuntu/missioncosmos/build"
if [ "$ROOT" != "/home/ubuntu/missioncosmos" ]; then
  echo "REFUS racine" >&2
  exit 1
fi
if [ "$DEST" != "/home/ubuntu/missioncosmos/build" ]; then
  echo "REFUS destination" >&2
  exit 1
fi
if [ ! -d "$ROOT" ]; then
  echo "ABSENT /home/ubuntu/missioncosmos" >&2
  exit 1
fi
resolved="$(readlink -f "$ROOT")"
if [ "$resolved" != "/home/ubuntu/missioncosmos" ]; then
  echo "REFUS resolution $resolved" >&2
  exit 1
fi
if [ -L "$DEST" ]; then
  echo "REFUS build est un lien symbolique" >&2
  exit 1
fi
if [ -d "$DEST" ]; then
  dest_resolved="$(readlink -f "$DEST")"
  if [ "$dest_resolved" != "/home/ubuntu/missioncosmos/build" ]; then
    echo "REFUS resolution build $dest_resolved" >&2
    exit 1
  fi
fi
echo "CONNECT_OK"
echo "DEST_OK /home/ubuntu/missioncosmos/build"
'@

$check = Invoke-Vps -Script $checkScript
if ($check.Code -ne 0 -or $check.Text -notmatch 'DEST_OK /home/ubuntu/missioncosmos/build') {
  Stop-Deploy "connexion ou destination refusee ($SshTarget). Production non modifiee."
}
Write-Host "Connecte a $SshTarget"
Write-Host "Destination autorisee : $RemoteBuildSlash"

Write-Host ''
Write-Host '[4/6] Upload...'
$prepareScript = @'
set -euo pipefail
TEMP="/home/ubuntu/missioncosmos/.deploy-temp"
if [ "$TEMP" != "/home/ubuntu/missioncosmos/.deploy-temp" ]; then
  echo "REFUS temp" >&2
  exit 1
fi
rm -rf -- /home/ubuntu/missioncosmos/.deploy-temp
mkdir -- /home/ubuntu/missioncosmos/.deploy-temp
echo "TEMP_OK"
'@
$prepare = Invoke-Vps -Script $prepareScript -AllowTempDelete
if ($prepare.Code -ne 0 -or $prepare.Text -notmatch 'TEMP_OK') {
  Stop-Deploy 'impossible de preparer .deploy-temp. Production non modifiee.'
}

$outDir = Join-Path $PSScriptRoot 'out'
& $scpExe -r $outDir "${SshTarget}:${RemoteTemp}/"
if ($LASTEXITCODE -ne 0) {
  Stop-Deploy "scp a echoue (code $LASTEXITCODE). Production non modifiee."
}

$uploadScript = @'
set -euo pipefail
if [ ! -f /home/ubuntu/missioncosmos/.deploy-temp/out/index.html ]; then
  echo "UPLOAD_ABSENT" >&2
  exit 1
fi
echo "UPLOAD_OK"
'@
$upload = Invoke-Vps -Script $uploadScript
if ($upload.Code -ne 0 -or $upload.Text -notmatch 'UPLOAD_OK') {
  Stop-Deploy "out/index.html absent dans ${RemoteTemp}/out. Production non modifiee."
}
Write-Host "OK      ${RemoteOut}/index.html"

Write-Host ''
Write-Host '[5/6] Mise en production...'
$rsyncScript = @'
set -euo pipefail
SRC="/home/ubuntu/missioncosmos/.deploy-temp/out/"
DEST="/home/ubuntu/missioncosmos/build/"
if [ "$DEST" != "/home/ubuntu/missioncosmos/build/" ]; then
  echo "REFUS destination" >&2
  exit 1
fi
if [ ! -f /home/ubuntu/missioncosmos/.deploy-temp/out/index.html ]; then
  echo "UPLOAD_ABSENT" >&2
  exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
  echo "RSYNC_ABSENT" >&2
  exit 2
fi
if [ -L /home/ubuntu/missioncosmos/build ]; then
  echo "REFUS build est un lien symbolique" >&2
  exit 1
fi
if [ -d /home/ubuntu/missioncosmos/build ]; then
  dest_resolved="$(readlink -f /home/ubuntu/missioncosmos/build)"
  if [ "$dest_resolved" != "/home/ubuntu/missioncosmos/build" ]; then
    echo "REFUS resolution build $dest_resolved" >&2
    exit 1
  fi
fi
rsync -a --delete /home/ubuntu/missioncosmos/.deploy-temp/out/ /home/ubuntu/missioncosmos/build/
echo "RSYNC_OK"
'@
$rsync = Invoke-Vps -Script $rsyncScript -AllowRsync
if ($rsync.Text -match 'RSYNC_ABSENT') {
  Stop-Deploy @"
rsync n'est pas installe sur le VPS. Aucun paquet n'a ete installe.
La production n'a pas ete modifiee.
Sur le VPS, en tant qu'utilisateur autorise :
  sudo apt-get update
  sudo apt-get install -y rsync
Puis relance .\deploy-production.ps1 -SkipBuild
"@
}
if ($rsync.Code -ne 0 -or $rsync.Text -notmatch 'RSYNC_OK') {
  Stop-Deploy 'mise en production interrompue. Le dossier build/ n''a pas ete confirme.'
}
Write-Host 'OK      rsync vers /home/ubuntu/missioncosmos/build/'

Write-Host ''
Write-Host '[6/6] Vérifications...'
$verifyScript = @'
set -euo pipefail
DEST="/home/ubuntu/missioncosmos/build"
if [ "$DEST" != "/home/ubuntu/missioncosmos/build" ]; then
  echo "REFUS destination" >&2
  exit 1
fi
missing=0
for item in index.html manifest.webmanifest sw.js _next; do
  if [ ! -e "/home/ubuntu/missioncosmos/build/$item" ]; then
    echo "PROD_ABSENT $item" >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi
rm -rf -- /home/ubuntu/missioncosmos/.deploy-temp
echo "PROD_OK"
'@
$verify = Invoke-Vps -Script $verifyScript -AllowTempDelete
if ($verify.Code -ne 0 -or $verify.Text -notmatch 'PROD_OK') {
  Stop-Deploy 'fichiers de production incomplets. .deploy-temp a ete laisse en place. build/ n''a pas ete supprime.'
}
Write-Host 'OK      /home/ubuntu/missioncosmos/build/index.html'
Write-Host 'OK      /home/ubuntu/missioncosmos/build/manifest.webmanifest'
Write-Host 'OK      /home/ubuntu/missioncosmos/build/sw.js'
Write-Host 'OK      /home/ubuntu/missioncosmos/build/_next/'
Write-Host 'OK      .deploy-temp supprime'

Write-Host ''
Write-Host "Controle HTTP  $PublicUrl"
$curl = Get-Command curl.exe -ErrorAction SilentlyContinue
if (-not $curl) {
  Write-Host 'AVERTISSEMENT  curl.exe est introuvable. Le build copie sur le VPS est conserve.'
} else {
  & $curl.Source -I --max-time 20 $PublicUrl
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'AVERTISSEMENT  le controle HTTP a echoue. Le build copie sur le VPS est conserve.'
  }
}

Write-Host ''
Write-Host 'DEPLOIEMENT REUSSI'
Write-Host ''
Write-Host "Build : $buildId"
Write-Host "Serveur : $SshTarget"
Write-Host "Destination : $RemoteBuild"
Write-Host "URL : https://missioncosmos.fr"
exit 0
