#!/usr/bin/env bash

if [[ "$OSTYPE" == "darwin"* ]]; then
	CODE="./tmp/electron-original/Electron.app/Contents/MacOS/Electron"
else
	CODE="tmp/electron-original/electron"
fi

ELECTRON_ENABLE_LOGGING=1 \
ELECTRON_ENABLE_STACK_DUMPING=1 \
"$CODE" . --js-flags="--no-lazy" index1.html "$@"
