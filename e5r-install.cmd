@echo off

set REPOSITORYURL="https://raw.githubusercontent.com/e5r/env/migrate-to-javascript"
set SCRIPTNAME=%~n0
set E5RPATH=%USERPROFILE%\.e5r
set POSTFILE=%E5RPATH%\postfile.cmd
set INSTALLFILE=%E5RPATH%\bin\%SCRIPTNAME%.js

if not exist %E5RPATH%\bin md %E5RPATH%\bin
if not exist %E5RPATH%\lib md %E5RPATH%\lib

:download
  @powershell -noprofile -nologo -executionpolicy unrestricted ^
      -command "$a=('sysutils','lib'),('fsutils','lib'),('webutils','lib'),('%SCRIPTNAME%','bin');$c=new-object system.net.webclient;foreach($i in $a){$u='%REPOSITORYURL%/scripts/{0}.js'-f$i[0];$f='%E5RPATH%\{1}\{0}.js'-f$i[0],$i[1];$c.downloadfile($u,$f);}"

:run
  @cscript "%INSTALLFILE%" //nologo %*

  if exist "%POSTFILE%" (
      call "%POSTFILE%"
      del "%POSTFILE%"
  )

:gc
    if exist "%INSTALLFILE%" del "%INSTALLFILE%"
    if not exist "%E5RPATH%\bin\e5r.cmd" rd /s /q "%E5RPATH%"
