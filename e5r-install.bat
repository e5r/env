@echo off

set VERSION=0.1-alpha1
set CDPATH=%CD%
set SCRIPTPATH=%~dp0
set SCRIPTNAME=%~n0
set POSTSETUPFILE=%USERPROFILE%\.e5r\postsetup.bat
set PSSCRIPT=%SCRIPTPATH%%SCRIPTNAME%.ps1
set PSSCRIPTURL="https://raw.githubusercontent.com/e5r/env/%VERSION%/scripts/%SCRIPTNAME%.ps1"
set PSSCRIPTDOWNLOAD="(New-Object System.Net.WebClient).DownloadFile('%PSSCRIPTURL%', '%PSSCRIPT%')"

if exist %PSSCRIPT% goto psrun
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -Command %PSSCRIPTDOWNLOAD%

:psrun
echo.%* | findstr /C:"-workdir" 1> nul

if errorlevel 1 (
    @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" -workdir %CDPATH% %*
) else (
    @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" %*
)

if exist %POSTSETUPFILE% (
    CALL %POSTSETUPFILE%
    DEL %POSTSETUPFILE%
)
