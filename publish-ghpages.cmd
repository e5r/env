@echo off

set CACHE=.\$$gh-pages$$
set DIST=.\dist

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

set BRANCH=
set /p BRANCH=Enter current branch/tag name: 

if "%BRANCH%"=="" goto end

:processing
echo Processing...

if exist "%CACHE%" rd /s /q "%CACHE%"
mkdir "%CACHE%"

xcopy /Y /Q ".\e5r-install.cmd" "%CACHE%"
xcopy /E /Y /Q ".\resources" "%CACHE%\resources\"
xcopy /E /Y /Q ".\scripts" "%CACHE%\scripts\"
rd /s /q "%CACHE%\resources\devtools"

git checkout gh-pages

xcopy /E /Y /Q "%CACHE%" "%DIST%"
rd /s /q "%CACHE%"

git status

set COMMIT=
set /p COMMIT=Commit now [Y/N] =N ?:
if not "%COMMIT%"=="Y" goto gc

git commit --all
git push origin gh-pages

git checkout %BRANCH%

:gc
if exist "%CACHE%" rd /s /q "%CACHE%"

:end