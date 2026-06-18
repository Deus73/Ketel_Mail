$ErrorActionPreference = "Stop"

function Write-Step($message) {
  Write-Host ""
  Write-Host "== $message ==" -ForegroundColor Magenta
}

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Split-Path -Parent $scriptRoot
$installRoot = Join-Path $env:LOCALAPPDATA "Ketel Mail"
$installApp = Join-Path $installRoot "app"
$launcher = Join-Path $installRoot "Ketel Mail starten.cmd"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "Ketel Mail.lnk"
$startMenuDir = Join-Path ([Environment]::GetFolderPath("Programs")) "Ketel Mail"
$startMenuShortcut = Join-Path $startMenuDir "Ketel Mail.lnk"

Write-Host "Ketel Mail magische installer" -ForegroundColor Cyan
Write-Host "Installatiemap: $installApp"

if (-not (Test-Command "node")) {
  Write-Host ""
  Write-Host "Node.js is nog niet geinstalleerd. Installeer Node.js 20 LTS of nieuwer en start deze installer opnieuw." -ForegroundColor Red
  Write-Host "Download: https://nodejs.org/"
  exit 1
}

if (-not (Test-Command "npm")) {
  Write-Host "npm ontbreekt. Installeer Node.js opnieuw met npm ingeschakeld." -ForegroundColor Red
  exit 1
}

$nodeMajor = (& node -p "process.versions.node.split('.')[0]") -as [int]
if ($nodeMajor -lt 20) {
  Write-Host "Node.js 20 of nieuwer is nodig. Huidige versie: $(& node -v)" -ForegroundColor Red
  exit 1
}

Write-Step "Bestanden naar je pc installeren"
New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
New-Item -ItemType Directory -Force -Path $installApp | Out-Null

$excludeDirs = @(".git", "node_modules", "release")
$excludeFiles = @(".env")
$robocopyArgs = @(
  $sourceRoot,
  $installApp,
  "/MIR",
  "/XD"
) + $excludeDirs + @(
  "/XF"
) + $excludeFiles + @(
  "/NFL",
  "/NDL",
  "/NJH",
  "/NJS",
  "/NP"
)

& robocopy @robocopyArgs | Out-Null
if ($LASTEXITCODE -gt 7) {
  throw "Kopieren naar de installatiemap is mislukt."
}

Write-Step "Pakketten en desktopvenster voorbereiden"
Push-Location $installApp
try {
  & npm install
  if ($LASTEXITCODE -ne 0) { throw "npm install is mislukt." }

  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build is mislukt." }
} finally {
  Pop-Location
}

Write-Step "Startknop en snelkoppelingen maken"
@"
@echo off
cd /d "$installApp"
npm run desktop:fast
"@ | Set-Content -Encoding ASCII -Path $launcher

function New-Shortcut($path, $target, $workingDirectory, $description) {
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $target
  $shortcut.WorkingDirectory = $workingDirectory
  $shortcut.Description = $description
  $iconPath = Join-Path $workingDirectory "public\icons\ketel-mail-icon.png"
  if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
  }
  $shortcut.Save()
}

New-Shortcut -path $desktopShortcut -target $launcher -workingDirectory $installApp -description "Start Ketel Mail"
New-Item -ItemType Directory -Force -Path $startMenuDir | Out-Null
New-Shortcut -path $startMenuShortcut -target $launcher -workingDirectory $installApp -description "Start Ketel Mail"

Write-Step "Ketel Mail starten"
Start-Process -FilePath $launcher -WorkingDirectory $installApp

Write-Host ""
Write-Host "Klaar. Ketel Mail staat op je pc." -ForegroundColor Green
Write-Host "Snelkoppeling: $desktopShortcut"
Write-Host "Startmenu: $startMenuShortcut"
Write-Host ""
Write-Host "Taakbalk vastmaken: klik met rechts op Ketel Mail in de taakbalk zodra hij open is en kies 'Aan taakbalk vastmaken'. Windows laat apps dit niet betrouwbaar stilletjes zelf doen." -ForegroundColor Yellow
