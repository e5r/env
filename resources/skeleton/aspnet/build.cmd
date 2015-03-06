:Build_EnvCheck
  call e5r 1>nul
  if "%ERRORLEVEL%"=="0" goto Build_Before
  echo.
  echo E5R Environment not installed!
  goto Build_Error

:Build_Before
  call e5r env boot
  call e5r env install
  call e5r env use

:Build_NugetCheck
  call nuget help 1>nul
  if "%ERRORLEVEL%"=="0" goto Build_SakeCheck
  echo.
  echo NuGet tool not installed!
  goto Build_Error

:Build_SakeCheck
  call sake --help 1>nul
  if "%ERRORLEVEL%"=="0" goto Build
  echo.
  echo Sake tool not installed!
  goto Build_Error

:Build
  echo Building...
  call sake -I "build" -f makefile.shade %*
  if "%ERRORLEVEL%"=="0" goto Build_Success
  exit /b %ERRORLEVEL%

:Build_Error
  exit /b 1

:Build_Success
  exit /b 0
