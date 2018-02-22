/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "fs", "vs/base/common/platform", "vs/base/common/paths", "vs/platform/windows/common/windows", "vs/platform/workspaces/common/workspaces", "vs/base/common/network"], function (require, exports, path, fs, platform, paths, windows_1, workspaces_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function findBestWindowOrFolderForFile(_a) {
        var windows = _a.windows, newWindow = _a.newWindow, reuseWindow = _a.reuseWindow, context = _a.context, filePath = _a.filePath, userHome = _a.userHome, codeSettingsFolder = _a.codeSettingsFolder, workspaceResolver = _a.workspaceResolver;
        if (!newWindow && filePath && (context === windows_1.OpenContext.DESKTOP || context === windows_1.OpenContext.CLI || context === windows_1.OpenContext.DOCK)) {
            var windowOnFilePath = findWindowOnFilePath(windows, filePath, workspaceResolver);
            // 1) window wins if it has a workspace opened
            if (windowOnFilePath && !!windowOnFilePath.openedWorkspace) {
                return windowOnFilePath;
            }
            // 2) window wins if it has a folder opened that is more specific than settings folder
            var folderWithCodeSettings = !reuseWindow && findFolderWithCodeSettings(filePath, userHome, codeSettingsFolder);
            if (windowOnFilePath && !(folderWithCodeSettings && folderWithCodeSettings.length > windowOnFilePath.openedFolderPath.length)) {
                return windowOnFilePath;
            }
            // 3) finally return path to folder with settings
            if (folderWithCodeSettings) {
                return folderWithCodeSettings;
            }
        }
        return !newWindow ? getLastActiveWindow(windows) : null;
    }
    exports.findBestWindowOrFolderForFile = findBestWindowOrFolderForFile;
    function findWindowOnFilePath(windows, filePath, workspaceResolver) {
        // First check for windows with workspaces that have a parent folder of the provided path opened
        var workspaceWindows = windows.filter(function (window) { return !!window.openedWorkspace; });
        for (var i = 0; i < workspaceWindows.length; i++) {
            var window_1 = workspaceWindows[i];
            var resolvedWorkspace = workspaceResolver(window_1.openedWorkspace);
            if (resolvedWorkspace && resolvedWorkspace.folders.some(function (folder) { return folder.uri.scheme === network_1.Schemas.file && paths.isEqualOrParent(filePath, folder.uri.fsPath, !platform.isLinux /* ignorecase */); })) {
                return window_1;
            }
        }
        // Then go with single folder windows that are parent of the provided file path
        var singleFolderWindowsOnFilePath = windows.filter(function (window) { return typeof window.openedFolderPath === 'string' && paths.isEqualOrParent(filePath, window.openedFolderPath, !platform.isLinux /* ignorecase */); });
        if (singleFolderWindowsOnFilePath.length) {
            return singleFolderWindowsOnFilePath.sort(function (a, b) { return -(a.openedFolderPath.length - b.openedFolderPath.length); })[0];
        }
        return null;
    }
    function findFolderWithCodeSettings(filePath, userHome, codeSettingsFolder) {
        var folder = path.dirname(paths.normalize(filePath, true));
        var homeFolder = userHome && paths.normalize(userHome, true);
        if (!platform.isLinux) {
            homeFolder = homeFolder && homeFolder.toLowerCase();
        }
        var previous = null;
        while (folder !== previous) {
            if (hasCodeSettings(folder, homeFolder, codeSettingsFolder)) {
                return folder;
            }
            previous = folder;
            folder = path.dirname(folder);
        }
        return null;
    }
    function hasCodeSettings(folder, normalizedUserHome, codeSettingsFolder) {
        if (codeSettingsFolder === void 0) { codeSettingsFolder = '.vscode'; }
        try {
            if ((platform.isLinux ? folder : folder.toLowerCase()) === normalizedUserHome) {
                return fs.statSync(path.join(folder, codeSettingsFolder, 'settings.json')).isFile(); // ~/.vscode/extensions is used for extensions
            }
            return fs.statSync(path.join(folder, codeSettingsFolder)).isDirectory();
        }
        catch (err) {
            // assume impossible to access
        }
        return false;
    }
    function getLastActiveWindow(windows) {
        var lastFocusedDate = Math.max.apply(Math, windows.map(function (window) { return window.lastFocusTime; }));
        return windows.filter(function (window) { return window.lastFocusTime === lastFocusedDate; })[0];
    }
    exports.getLastActiveWindow = getLastActiveWindow;
    function findWindowOnWorkspace(windows, workspace) {
        return windows.filter(function (window) {
            // match on folder
            if (workspaces_1.isSingleFolderWorkspaceIdentifier(workspace)) {
                if (typeof window.openedFolderPath === 'string' && (paths.isEqual(window.openedFolderPath, workspace, !platform.isLinux /* ignorecase */))) {
                    return true;
                }
            }
            else {
                if (window.openedWorkspace && window.openedWorkspace.id === workspace.id) {
                    return true;
                }
            }
            return false;
        })[0];
    }
    exports.findWindowOnWorkspace = findWindowOnWorkspace;
    function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPath) {
        return windows.filter(function (window) {
            // match on extension development path
            if (paths.isEqual(window.extensionDevelopmentPath, extensionDevelopmentPath, !platform.isLinux /* ignorecase */)) {
                return true;
            }
            return false;
        })[0];
    }
    exports.findWindowOnExtensionDevelopmentPath = findWindowOnExtensionDevelopmentPath;
    function findWindowOnWorkspaceOrFolderPath(windows, path) {
        return windows.filter(function (window) {
            // check for workspace config path
            if (window.openedWorkspace && paths.isEqual(window.openedWorkspace.configPath, path, !platform.isLinux /* ignorecase */)) {
                return true;
            }
            // check for folder path
            if (window.openedFolderPath && paths.isEqual(window.openedFolderPath, path, !platform.isLinux /* ignorecase */)) {
                return true;
            }
            return false;
        })[0];
    }
    exports.findWindowOnWorkspaceOrFolderPath = findWindowOnWorkspaceOrFolderPath;
});
