@echo off

set REPOSITORYURL="https://raw.githubusercontent.com/e5r/env/migrate-to-javascript"
set CDPATH=%CD%
set SCRIPTNAME=%~n0
set E5RPATH=%USERPROFILE%\.e5r
set POSTFILE=%E5RPATH%\postfile.cmd

:: Local files path
set JSSYSUTILSFILE=%E5RPATH%\lib\sysutils.js
set JSFSUTILSFILE=%E5RPATH%\lib\fsutils.js
set JSWEBUTILSFILE=%E5RPATH%\lib\webutils.js
set JSINSTALLFILE=%E5RPATH%\bin\%SCRIPTNAME%.js

:: Web files URL
set JSSYSUTILSURL=%REPOSITORYURL%/scripts/sysutils.js
set JSFSUTILSURL=%REPOSITORYURL%/scripts/fsutils.js
set JSWEBUTILSURL=%REPOSITORYURL%/scripts/webutils.js
set JSINSTALLURL=%REPOSITORYURL%/scripts/%SCRIPTNAME%.js

if not exist %E5RPATH%\bin md %E5RPATH%\bin
if not exist %E5RPATH%\lib md %E5RPATH%\lib

:downloadinstall
    if exist %JSINSTALLFILE% goto downloadsysutils
    echo @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%JSINSTALLURL%', '%JSINSTALLFILE%')"

:downloadsysutils
    if exist %JSSYSUTILSFILE% goto downloadfsutils
    echo @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%JSSYSUTILSURL%', '%JSSYSUTILSFILE%')"

:downloadfsutils
    if exist %JSFSUTILSFILE% goto downloadwebutils
    echo @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%JSFSUTILSURL%', '%JSFSUTILSFILE%')"

:downloadwebutils
    if exist %JSWEBUTILSFILE% goto psrun
    echo @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%JSWEBUTILSURL%', '%JSWEBUTILSFILE%')"

:psrun
    echo @CScript "%JSINSTALLFILE%" //Nologo //H:CScript //U %*

    if exist %POSTFILE% (
        echo CALL %POSTFILE%
        echo DEL %POSTFILE%
    )

:gc
    if exist %JSINSTALLFILE% DEL %JSINSTALLFILE%
    if not exist %E5RPATH%\bin\e5r.cmd rd /s /q %E5RPATH%
