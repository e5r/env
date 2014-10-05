@echo off

set PSSCRIPT=%~dpn0.ps1
echo @PowerShell -NoProfile -NoLogo -ExecutionPolicy unrestricted "%PSSCRIPT%" %*