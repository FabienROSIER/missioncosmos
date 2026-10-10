# Recompile out/ quand les sources changent.
# Fenetre ouverte uniquement. Aucun envoi vers le VPS. Arret : Ctrl+C.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'package.json'))) {
  Write-Host 'ECHEC  package.json introuvable.'
  exit 1
}

$state = [hashtable]::Synchronized(@{
  Pending = $false
  Building = $false
  LastChange = [datetime]::MinValue
})

$rootPrefix = $PSScriptRoot.TrimEnd('\') + '\'
$sourceExt = @(
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json',
  '.html', '.svg', '.png', '.webp', '.jpg', '.jpeg', '.gif', '.ico',
  '.glb', '.gltf', '.mp3', '.ogg', '.wav', '.txt', '.webmanifest', '.woff2'
)
$rootConfigs = @(
  'next.config.ts', 'next.config.mjs', 'next.config.js',
  'package.json', 'package-lock.json', 'tsconfig.json',
  '.env', '.env.local', '.env.production'
)

$onSourceChange = {
  $full = $Event.SourceEventArgs.FullPath
  if ([string]::IsNullOrWhiteSpace($full)) { return }
  $prefix = $using:rootPrefix
  if (-not $full.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) { return }
  $name = [System.IO.Path]::GetFileName($full)
  if ($name -match '(^~|\.tmp$|\.temp$|~$|thumbs\.db$|desktop\.ini$)') { return }
  $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
  $allowed = $using:sourceExt
  if ($allowed -notcontains $ext) { return }
  $flag = $using:state
  $flag.LastChange = Get-Date
  $flag.Pending = $true
}

$onRootChange = {
  $full = $Event.SourceEventArgs.FullPath
  if ([string]::IsNullOrWhiteSpace($full)) { return }
  $name = [System.IO.Path]::GetFileName($full)
  $configs = $using:rootConfigs
  if ($configs -notcontains $name) { return }
  $flag = $using:state
  $flag.LastChange = Get-Date
  $flag.Pending = $true
}

function New-FolderWatcher {
  param(
    [string]$Path,
    [bool]$Deep,
    [scriptblock]$Action
  )
  $watcher = New-Object System.IO.FileSystemWatcher
  $watcher.Path = $Path
  $watcher.Filter = '*'
  $watcher.IncludeSubdirectories = $Deep
  $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, DirectoryName'
  $watcher.InternalBufferSize = 65536
  $watcher.EnableRaisingEvents = $true
  foreach ($eventName in @('Changed', 'Created', 'Deleted', 'Renamed')) {
    Register-ObjectEvent -InputObject $watcher -EventName $eventName -Action $Action | Out-Null
  }
  return $watcher
}

function Invoke-WatchedBuild {
  $mark = Get-Date
  $state.Pending = $false
  $state.Building = $true
  $hostPath = (Get-Process -Id $PID).Path
  $scriptPath = Join-Path $PSScriptRoot 'build-production.ps1'
  Write-Host ''
  Write-Host ("[{0}] Debut du build" -f $mark.ToString('HH:mm:ss'))
  & $hostPath -NoProfile -ExecutionPolicy Bypass -File $scriptPath
  $code = $LASTEXITCODE
  $elapsed = [int]((Get-Date) - $mark).TotalSeconds
  if ($code -eq 0) {
    Write-Host ("[{0}] SUCCES  ({1} s)" -f (Get-Date).ToString('HH:mm:ss'), $elapsed)
  } else {
    Write-Host ("[{0}] ECHEC  code {1} ({2} s)" -f (Get-Date).ToString('HH:mm:ss'), $code, $elapsed)
  }
  if ($state.LastChange -gt $mark) {
    $state.Pending = $true
  }
  $state.Building = $false
}

$watchers = @()
try {
  $watchers += New-FolderWatcher -Path (Join-Path $PSScriptRoot 'src') -Deep $true -Action $onSourceChange
  $watchers += New-FolderWatcher -Path (Join-Path $PSScriptRoot 'public') -Deep $true -Action $onSourceChange
  $watchers += New-FolderWatcher -Path $PSScriptRoot -Deep $false -Action $onRootChange

  Write-Host 'Mission Cosmos — recompilation locale'
  Write-Host 'Surveille : src\, public\, next.config.*, package.json, tsconfig.json'
  Write-Host 'Ignore : out\, .next\, node_modules\, .git\'
  Write-Host 'Aucun deploiement. Arret : Ctrl+C'
  Write-Host ''

  Invoke-WatchedBuild
  Write-Host 'Surveillance active. Les prochains builds partent 2 s apres la derniere modification.'
  Write-Host 'Arret : Ctrl+C'
  Write-Host ''

  $announced = $false
  while ($true) {
    Start-Sleep -Milliseconds 400
    if (-not $state.Pending) {
      $announced = $false
      continue
    }
    if (-not $announced) {
      Write-Host ("[{0}] Modifications detectees, build apres 2 s de calme" -f (Get-Date).ToString('HH:mm:ss'))
      $announced = $true
    }
    $idle = ((Get-Date) - [datetime]$state.LastChange).TotalSeconds
    if ($idle -lt 2) { continue }
    $announced = $false
    Invoke-WatchedBuild
  }
} finally {
  Write-Host ''
  Write-Host 'Arret de la surveillance.'
  foreach ($watcher in $watchers) {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
  }
  Get-EventSubscriber | Unregister-Event -ErrorAction SilentlyContinue
}
