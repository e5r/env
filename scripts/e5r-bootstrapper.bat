@echo off

set EXEPATH=%~dp0
set PSSCRIPT='%EXEPATH%e5r-bootstrapper.ps1'
set PSSCRIPTURL='https://raw.githubusercontent.com/e5r/env/master/scripts/e5r-bootstrapper.ps1'
set PSSCRIPTDOWNLOAD="(New-Object System.Net.WebClient).DownloadFile(%PSSCRIPTURL%, %PSSCRIPT%)"

echo "EXEPATH=%EXEPATH%"
echo "PSSCRIPT=%PSSCRIPT%"
echo "PSSCRIPTURL=%PSSCRIPTURL%"
echo "PSSCRIPTDOWNLOAD=%PSSCRIPTDOWNLOAD%"

IF EXIST %PSSCRIPT% goto psrun
echo "Não existe %PSSCRIPT%"
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -Command %PSSCRIPTDOWNLOAD%

:psrun
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -Command "Invoke-Expression %PSSCRIPT%"
