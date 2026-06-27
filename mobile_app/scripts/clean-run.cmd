@echo off
echo Stopping leftover Dart processes...
taskkill /F /IM dart.exe >nul 2>&1
taskkill /F /IM dartaotruntime.exe >nul 2>&1
timeout /t 2 /nobreak >nul

cd /d "%~dp0.."
echo Removing build artifacts...
if exist build rmdir /s /q build
if exist .dart_tool rmdir /s /q .dart_tool

echo Fetching dependencies...
flutter pub get
if errorlevel 1 exit /b 1

echo Launching on Chrome...
flutter run -d chrome
