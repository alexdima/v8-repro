#!/usr/bin/env bash

if [[ "$OSTYPE" == "darwin"* ]]; then
	CODE="./tmp/electron-snapshot/Electron.app/Contents/MacOS/Electron"
else
	CODE="tmp/electron-snapshot/electron"
fi

ELECTRON_ENABLE_LOGGING=1 \
ELECTRON_ENABLE_STACK_DUMPING=1 \
"$CODE" . --js-flags="--no-lazy" index2.html "$@"
