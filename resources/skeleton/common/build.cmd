@echo off
cd %~dp0

call e5r help 2>nul

if "%ERRORLEVEL%"=="0" goto BuildCommon_End

:BuildCommon_Install
  echo E5R Environment Bootstrap...
  set E5RREPO=https://github.com/e5r/env/raw/v0.1.0-alpha2
  @powershell -NoProfile -ExecutionPolicy unrestricted -Command ^
    "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest '%E5RREPO%/e5r-install.cmd' -OutFile '%CD%\e5r-install.cmd'"
  call "%CD%\e5r-install.cmd"
  if exist "%CD%\e5r-install.cmd" del /F /Q "%CD%\e5r-install.cmd"
:BuildCommon_End
