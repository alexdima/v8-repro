define(["require", "exports", "os", "vs/base/common/platform", "vs/base/node/processes", "vs/base/node/pfs"], function (require, exports, os, platform, processes, pfs_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
    function getTerminalDefaultShellUnixLike() {
        if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
            var unixLikeTerminal = 'sh';
            if (!platform.isWindows && process.env.SHELL) {
                unixLikeTerminal = process.env.SHELL;
                // Some systems have $SHELL set to /bin/false which breaks the terminal
                if (unixLikeTerminal === '/bin/false') {
                    unixLikeTerminal = '/bin/bash';
                }
            }
            _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
        }
        return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
    }
    exports.getTerminalDefaultShellUnixLike = getTerminalDefaultShellUnixLike;
    var _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
    function getTerminalDefaultShellWindows() {
        if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
            var isAtLeastWindows10 = platform.isWindows && parseFloat(os.release()) >= 10;
            var is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            var powerShellPath = process.env.windir + "\\" + (is32ProcessOn64Windows ? 'Sysnative' : 'System32') + "\\WindowsPowerShell\\v1.0\\powershell.exe";
            _TERMINAL_DEFAULT_SHELL_WINDOWS = isAtLeastWindows10 ? powerShellPath : processes.getWindowsShell();
        }
        return _TERMINAL_DEFAULT_SHELL_WINDOWS;
    }
    exports.getTerminalDefaultShellWindows = getTerminalDefaultShellWindows;
    if (platform.isLinux) {
        var file_1 = '/etc/os-release';
        pfs_1.fileExists(file_1).then(function (exists) {
            if (!exists) {
                return;
            }
            pfs_1.readFile(file_1).then(function (b) {
                var contents = b.toString();
                if (contents.indexOf('NAME=Fedora') >= 0) {
                    exports.isFedora = true;
                }
            });
        });
    }
    exports.isFedora = false;
});
