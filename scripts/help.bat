@echo off
set PSSCRIPT=%~dp0help.ps1
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" %*
