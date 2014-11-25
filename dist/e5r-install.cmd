@echo off

set VERSION=0.1.0-alpha1
set REPOSITORYURL="https://raw.githubusercontent.com/e5r/env/v%VERSION%"
set CDPATH=%CD%
set SCRIPTNAME=%~n0
set E5RPATH=%USERPROFILE%\.e5r
set POSTFILE=%E5RPATH%\postfile.cmd
set PSCOMMONFILE=%E5RPATH%\lib\common.ps1
set PSINSTALLFILE=%E5RPATH%\bin\%SCRIPTNAME%.ps1
set PSCOMMONURL=%REPOSITORYURL%/scripts/common.ps1
set PSINSTALLURL=%REPOSITORYURL%/scripts/%SCRIPTNAME%.ps1

if not exist %E5RPATH%\bin md %E5RPATH%\bin
if not exist %E5RPATH%\lib md %E5RPATH%\lib

:downloadinstall
    if exist %PSINSTALLFILE% goto downloadcommon
    @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%PSINSTALLURL%', '%PSINSTALLFILE%')"

:downloadcommon
    if exist %PSCOMMONFILE% goto psrun
    @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -Command "(New-Object System.Net.WebClient).DownloadFile('%PSCOMMONURL%', '%PSCOMMONFILE%')"

:psrun
    @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted ^
        -File "%PSINSTALLFILE%" ^
        -Repository %REPOSITORYURL% %*

    if exist %POSTFILE% (
        CALL %POSTFILE%
        DEL %POSTFILE%
    )

:gc
    if exist %PSINSTALLFILE% DEL %PSINSTALLFILE%
    if not exist %E5RPATH%\bin\e5r.cmd rd /s /q %E5RPATH%
