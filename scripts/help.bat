@echo off
set PSSCRIPT=%~dpn0.ps1
@PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" %*
