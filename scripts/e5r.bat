@echo off

set PSSCRIPT=%~dpn0.ps1
set POSTFILE=%USERPROFILE%\.e5r\postcmd.bat

@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -File "%PSSCRIPT%" %*

if exist %POSTFILE% (
    CALL %POSTFILE%
    DEL %POSTFILE%
)
