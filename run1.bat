@echo off

set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

tmp\electron-original\electron.exe . --js-flags="--no-lazy" index1.html %*
