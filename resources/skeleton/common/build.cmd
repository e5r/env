@echo off
cd %~dp0

e5r help 2>nul

if "%ERRORLEVEL%"=="0" goto BuildCommon_Install
goto BuildCommon_End

:BuildCommon_Install
  echo E5R Environment Bootstrap...

  set E5RREPO=https://github.com/e5r/env/raw/migrate-to-javascript

  bitsadmin /TRANSFER "Downloading installer..." "%E5RREPO%/e5r-install.cmd" "%CD%\e5r-install.cmd"
  "%CD%\e5r-install.cmd"

  if exist "%CD%\e5r-install.cmd" del /F /Q "%CD%\e5r-install.cmd"

:BuildCommon_End
