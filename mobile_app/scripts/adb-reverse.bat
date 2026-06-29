@echo off
set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe

if not exist "%ADB%" (
  echo adb not found at %ADB%
  exit /b 1
)

"%ADB%" reverse tcp:5000 tcp:5000
echo Port reverse active: phone 127.0.0.1:5000 -^> PC localhost:5000
"%ADB%" devices
