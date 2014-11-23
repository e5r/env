setlocal
set NUGETPATH=.nuget
set NUGET=%NUGETPATH%\nuget.exe

if exist %NUGET% goto bootstrap
echo Downloading NuGet...
if not exist "%NUGETPATH%" md "%NUGETPATH%"
@powershell -NoProfile -ExecutionPolicy unrestricted -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest 'https://www.nuget.org/nuget.exe' -OutFile '%NUGET%'"

:bootstrap
echo E5R Bootstrap...
e5r env boot
e5r env install 1.0.0-beta1 -runtime CLR -x86
e5r env use 1.0.0-beta1 -runtime CLR -x86

:build
echo Building...
"%NUGET%" install -OutputDirectory packages .\packages.config
"packages\Sake.0.2.0\tools\sake.exe" -I packages\KoreBuild.0.2.1-beta2-10047\build -f makefile.shade %*