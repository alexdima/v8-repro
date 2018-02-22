/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "os", "vs/platform/node/package"], function (require, exports, path, os, package_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // TODO@snapshot: duplicated in paths.js
    function getAppDataPath(platform) {
        switch (platform) {
            case 'win32': return process.env['VSCODE_APPDATA'] || process.env['APPDATA'] || path.join(process.env['USERPROFILE'], 'AppData', 'Roaming');
            case 'darwin': return process.env['VSCODE_APPDATA'] || path.join(os.homedir(), 'Library', 'Application Support');
            case 'linux': return process.env['VSCODE_APPDATA'] || process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
            default: throw new Error('Platform not supported');
        }
    }
    exports.getAppDataPath = getAppDataPath;
    // TODO@snapshot: duplicated in paths.js
    function getDefaultUserDataPath(platform) {
        return path.join(getAppDataPath(platform), package_1.default.name);
    }
    exports.getDefaultUserDataPath = getDefaultUserDataPath;
});
