@echo off

set PSSCRIPT=%~dpn0.ps1
set POSTFILE=%USERPROFILE%\.e5r\postfile.cmd

@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted -File "%PSSCRIPT%" %*

if exist %POSTFILE% (
    call %POSTFILE%
    del %POSTFILE%
)
