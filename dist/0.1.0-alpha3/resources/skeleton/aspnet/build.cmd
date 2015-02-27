setlocal
set BUILDSTAGE=build-stage
set NUGETPATH=%BUILDSTAGE%\.nuget
set NUGET=%NUGETPATH%\nuget.exe
set PACKAGESPATH=%NUGETPATH%\packages

if exist %NUGET% goto bootstrap
echo Downloading NuGet...
if not exist "%NUGETPATH%" md "%NUGETPATH%"
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest 'https://www.nuget.org/nuget.exe' -OutFile '%NUGET%'"

:bootstrap
echo E5R Bootstrap...
call e5r env boot
call e5r env install -version 1.0.0-beta1 -runtime CLR -x86

:build
echo Building...
call "%NUGET%" install -OutputDirectory %PACKAGESPATH% -ExcludeVersion .\packages.config
call "%PACKAGESPATH%\Sake\tools\sake.exe" -I "%PACKAGESPATH%\KoreBuild\build" -f makefile.shade %*