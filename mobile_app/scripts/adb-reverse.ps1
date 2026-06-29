$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (-not (Test-Path $adb)) {
  Write-Error "adb not found. Install Android SDK platform-tools or run from Android Studio."
  exit 1
}

& $adb reverse tcp:5000 tcp:5000
Write-Host "Port reverse active: phone 127.0.0.1:5000 -> PC localhost:5000"
& $adb devices
