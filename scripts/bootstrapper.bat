@echo off

set CDPATH=%CD%
set EXEPATH=%~dp0
set PSSCRIPT=%EXEPATH%bootstrapper.ps1
set PSSCRIPTURL="https://raw.githubusercontent.com/e5r/env/master/scripts/bootstrapper.ps1"
set PSSCRIPTDOWNLOAD="(New-Object System.Net.WebClient).DownloadFile('%PSSCRIPTURL%', '%PSSCRIPT%')"

IF EXIST %PSSCRIPT% goto psrun
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -Command %PSSCRIPTDOWNLOAD%

:psrun
echo.%* | findstr /C:"-workdir" 1> nul

if errorlevel 1 (
  @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" -workdir %CDPATH% %*
) ELSE (
  @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" %*
)
