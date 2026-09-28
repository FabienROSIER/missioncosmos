# Génère les icônes PWA à partir du logo AST-001 (fond opaque theme).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot '..\public\assets\icons\ast-001-mission-cosmos-logo.png'
$outDir = Join-Path $PSScriptRoot '..\public\assets\icons'
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
$bg = [System.Drawing.Color]::FromArgb(255, 11, 18, 32)

function Write-Icon([int]$size, [string]$fileName, [double]$contentRatio) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear($bg)
  $pad = [int]([math]::Floor($size * (1 - $contentRatio) / 2))
  $box = $size - (2 * $pad)
  $g.DrawImage($src, $pad, $pad, $box, $box)
  $dest = Join-Path $outDir $fileName
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Host "Wrote $dest"
}

Write-Icon 192 'icon-192.png' 0.72
Write-Icon 512 'icon-512.png' 0.72
Write-Icon 180 'apple-touch-icon.png' 0.78

$src.Dispose()
