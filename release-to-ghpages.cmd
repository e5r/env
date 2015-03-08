@echo off

set CACHE=.\$$gh-pages$$
set DIST=.\dist

set BRANCH=%1
if "%BRANCH%"=="" goto usage

set VERSION=%2
if "%VERSION%"=="" goto usage

:prerequisites

git --version 1>nul
if not "%errorlevel%"=="0" (
    echo.
    echo Git is required!
    echo ----------------
    goto end
)

xcopy /? 1>nul
if not "%errorlevel%"=="0" (
    echo.
    echo XCopy is required!
    echo ------------------
    goto end
)

:processing
echo Make release...

if exist "%CACHE%" rd /s /q "%CACHE%"
mkdir "%CACHE%"

xcopy /Y /Q ".\e5r-install.cmd" "%CACHE%" 1>nul
xcopy /E /Y /Q ".\resources" "%CACHE%\resources\" 1>nul
xcopy /E /Y /Q ".\scripts" "%CACHE%\scripts\" 1>nul
xcopy /E /Y /Q ".\third-party-lib" "%CACHE%\third-party-lib\" 1>nul
rd /s /q "%CACHE%\resources\devtools" 1>nul

git checkout gh-pages 2>nul

if exist "%DIST%\%VERSION%" (
  echo.
  echo Version [%VERSION%] already exists.
  echo.
  goto checkout
)

mkdir "%DIST%\%VERSION%"

xcopy /E /Y /Q "%CACHE%" "%DIST%\%VERSION%" 1>nul
rd /s /q "%CACHE%"

set COMMIT=
set /p COMMIT=Commit now [Y/N] =N ?:
if not "%COMMIT%"=="Y" goto gc

git add "%DIST%\%VERSION%" 1>nul
git commit "%DIST%\%VERSION%" -m "Auto release version %VERSION%" 1>nul

set PUSHGITHUB=
set /p PUSHGITHUB=Push to GitHub [Y/N] =N ?:
if not "%PUSHGITHUB%"=="Y" goto checkout

git push origin gh-pages 1>nul

:checkout
git checkout %BRANCH% 1>nul

:gc
if exist "%CACHE%" rd /s /q "%CACHE%"
goto end


:usage
echo.
echo Usage: release-to-ghpages [current branch name] [version number]
echo.

:end
