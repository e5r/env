@echo off

set VERSION=master
set CDPATH=%CD%
set EXEPATH=%~dp0
set POSTBOOTSTRAPPERFILE=%USERPROFILE%\.e5r\postbootstrapper.bat
set PSSCRIPT=%EXEPATH%bootstrapper.ps1
set PSSCRIPTURL="https://raw.githubusercontent.com/e5r/env/%VERSION%/scripts/bootstrapper.ps1"
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

if exist %POSTBOOTSTRAPPERFILE% (
    CALL %POSTBOOTSTRAPPERFILE%
    DEL %POSTBOOTSTRAPPERFILE%
)
