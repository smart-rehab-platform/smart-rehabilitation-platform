# Clears locked Flutter build artifacts (common on Windows + OneDrive) then runs the app.
param(
    [string]$Device = "chrome"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping leftover Dart processes..."
taskkill /F /IM dart.exe 2>$null | Out-Null
taskkill /F /IM dartaotruntime.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Removing build artifacts..."
Remove-Item -Path "build", ".dart_tool" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Fetching dependencies..."
flutter pub get
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Launching on $Device..."
flutter run -d $Device
