@echo off

set RUNNER=%~dp0..\lib\cmdrunner.js
set POSTFILE=%~dp0..\postfile.cmd

@cscript "%RUNNER%" //nologo //h:cscript //u %*

if exist %POSTFILE% (
    call %POSTFILE%
    del %POSTFILE%
)
