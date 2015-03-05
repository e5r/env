
setlocal

set BUILDSTAGE=build-stage
set NUGETPATH=%BUILDSTAGE%\.nuget
set NUGET=%NUGETPATH%\nuget.exe
set PACKAGESPATH=%NUGETPATH%\packages

:Build_EnvCheck
  call e5r 1>nul
  if "%ERRORLEVEL%"=="0" goto Build_NugetDownload
  echo.
  echo E5R Environment not installed!
  goto Build_End

:Build_NugetDownload
  if exist %NUGET% goto Build_Before
  echo Downloading NuGet...
  echo TODO: Move to E5R ENV BOOT --tech aspnet
  if not exist "%NUGETPATH%" md "%NUGETPATH%"
  @powershell -NoProfile -ExecutionPolicy unrestricted -Command ^
    "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest 'https://www.nuget.org/nuget.exe' -OutFile '%NUGET%'"

:Build_NugetCheck
  echo TODO: Move to Build_EnvCheck
  if exist %NUGET% goto Build_Before
  echo.
  echo NUGET not installed!
  goto Build_End

:Build_Before
    call e5r env boot
    call e5r env install
    call e5r env use
    echo TODO: Delete packages.config and use install Sake here
    call "%NUGET%" install -OutputDirectory %PACKAGESPATH%  -ExcludeVersion .\packages.config

:Build
  echo Building...
  call "%PACKAGESPATH%\Sake\tools\sake.exe" -I "build" -f makefile.shade %*

:Build_End
