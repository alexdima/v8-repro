/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vscode-ripgrep", "vs/base/common/platform", "vs/base/common/strings", "./ripgrepTextSearch"], function (require, exports, cp, vscode_ripgrep_1, platform_1, strings_1, ripgrepTextSearch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // If vscode-ripgrep is in an .asar file, then the binary is unpacked.
    var rgDiskPath = vscode_ripgrep_1.rgPath.replace(/\bnode_modules\.asar\b/, 'node_modules.asar.unpacked');
    function spawnRipgrepCmd(config, folderQuery, includePattern, excludePattern) {
        var rgArgs = getRgArgs(config, folderQuery, includePattern, excludePattern);
        var cwd = folderQuery.folder;
        return {
            cmd: cp.spawn(rgDiskPath, rgArgs.args, { cwd: cwd }),
            siblingClauses: rgArgs.siblingClauses,
            rgArgs: rgArgs,
            cwd: cwd
        };
    }
    exports.spawnRipgrepCmd = spawnRipgrepCmd;
    function getRgArgs(config, folderQuery, includePattern, excludePattern) {
        var args = ['--files', '--hidden', '--case-sensitive'];
        // includePattern can't have siblingClauses
        ripgrepTextSearch_1.foldersToIncludeGlobs([folderQuery], includePattern, false).forEach(function (globArg) {
            args.push('-g', anchor(platform_1.isMacintosh ? strings_1.normalizeNFD(globArg) : globArg));
        });
        var siblingClauses;
        var rgGlobs = ripgrepTextSearch_1.foldersToRgExcludeGlobs([folderQuery], excludePattern, undefined, false);
        rgGlobs.globArgs
            .forEach(function (rgGlob) { return args.push('-g', "!" + anchor(platform_1.isMacintosh ? strings_1.normalizeNFD(rgGlob) : rgGlob)); });
        siblingClauses = rgGlobs.siblingClauses;
        if (folderQuery.disregardIgnoreFiles !== false) {
            // Don't use .gitignore or .ignore
            args.push('--no-ignore');
        }
        else {
            args.push('--no-ignore-parent');
        }
        // Follow symlinks
        if (!config.ignoreSymlinks) {
            args.push('--follow');
        }
        if (config.exists) {
            args.push('--quiet');
        }
        // Folder to search
        args.push('--');
        args.push('.');
        return { args: args, siblingClauses: siblingClauses };
    }
    function anchor(glob) {
        return strings_1.startsWith(glob, '**') || strings_1.startsWith(glob, '/') ? glob : "/" + glob;
    }
});
