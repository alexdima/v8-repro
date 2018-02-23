@echo off

set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

tmp\electron-snapshot\electron.exe . --js-flags="--no-lazy" index2.html %*
