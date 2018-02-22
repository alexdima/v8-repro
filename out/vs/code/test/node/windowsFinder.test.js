var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "assert", "path", "vs/code/node/windowsFinder", "vs/platform/windows/common/windows", "vs/platform/workspace/common/workspace"], function (require, exports, assert, path, windowsFinder_1, windows_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var fixturesFolder = require.toUrl('./fixtures');
    var testWorkspace = {
        id: Date.now().toString(),
        configPath: path.join(fixturesFolder, 'workspaces.json')
    };
    function options(custom) {
        return __assign({ windows: [], newWindow: false, reuseWindow: false, context: windows_1.OpenContext.CLI, codeSettingsFolder: '_vscode', workspaceResolver: function (workspace) { return workspace === testWorkspace ? { id: testWorkspace.id, configPath: workspace.configPath, folders: workspace_1.toWorkspaceFolders([{ path: path.join(fixturesFolder, 'vscode_workspace_1_folder') }, { path: path.join(fixturesFolder, 'vscode_workspace_2_folder') }]) } : null; } }, custom);
    }
    var vscodeFolderWindow = { lastFocusTime: 1, openedFolderPath: path.join(fixturesFolder, 'vscode_folder') };
    var lastActiveWindow = { lastFocusTime: 3, openedFolderPath: null };
    var noVscodeFolderWindow = { lastFocusTime: 2, openedFolderPath: path.join(fixturesFolder, 'no_vscode_folder') };
    var windows = [
        vscodeFolderWindow,
        lastActiveWindow,
        noVscodeFolderWindow,
    ];
    suite('WindowsFinder', function () {
        test('New window without folder when no windows exist', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options()), null);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'no_vscode_folder', 'file.txt')
            })), null);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt'),
                newWindow: true // We assume this implies 'editor' work mode, might need separate CLI option later.
            })), null);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt'),
                reuseWindow: true // We assume this implies 'editor' work mode, might need separate CLI option later.
            })), null);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt'),
                context: windows_1.OpenContext.API
            })), null);
        });
        test('New window with folder when no windows exist', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt')
            })), path.join(fixturesFolder, 'vscode_folder'));
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'new_folder', 'new_file.txt')
            })), path.join(fixturesFolder, 'vscode_folder'));
        });
        test('New window without folder when windows exist', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows,
                filePath: path.join(fixturesFolder, 'no_vscode_folder', 'file.txt'),
                newWindow: true
            })), null);
        });
        test('Last active window', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows
            })), lastActiveWindow);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows,
                filePath: path.join(fixturesFolder, 'no_vscode_folder2', 'file.txt')
            })), lastActiveWindow);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [lastActiveWindow, noVscodeFolderWindow],
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt'),
                reuseWindow: true
            })), lastActiveWindow);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows,
                filePath: path.join(fixturesFolder, 'no_vscode_folder', 'file.txt'),
                context: windows_1.OpenContext.API
            })), lastActiveWindow);
        });
        test('Existing window with folder', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows,
                filePath: path.join(fixturesFolder, 'no_vscode_folder', 'file.txt')
            })), noVscodeFolderWindow);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: windows,
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt')
            })), vscodeFolderWindow);
        });
        test('Existing window wins over vscode folder if more specific', function () {
            var window = { lastFocusTime: 1, openedFolderPath: path.join(fixturesFolder, 'vscode_folder', 'nested_folder') };
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window],
                filePath: path.join(fixturesFolder, 'vscode_folder', 'nested_folder', 'subfolder', 'file.txt')
            })), window);
            // check
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window],
                filePath: path.join(fixturesFolder, 'vscode_folder', 'nested_folder2', 'subfolder', 'file.txt')
            })), path.join(fixturesFolder, 'vscode_folder'));
        });
        test('More specific existing window wins', function () {
            var window = { lastFocusTime: 2, openedFolderPath: path.join(fixturesFolder, 'no_vscode_folder') };
            var nestedFolderWindow = { lastFocusTime: 1, openedFolderPath: path.join(fixturesFolder, 'no_vscode_folder', 'nested_folder') };
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window, nestedFolderWindow],
                filePath: path.join(fixturesFolder, 'no_vscode_folder', 'nested_folder', 'subfolder', 'file.txt')
            })), nestedFolderWindow);
        });
        test('VSCode folder wins over existing window if more specific', function () {
            var window = { lastFocusTime: 1, openedFolderPath: path.join(fixturesFolder, 'vscode_folder') };
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window],
                filePath: path.join(fixturesFolder, 'vscode_folder', 'nested_vscode_folder', 'subfolder', 'file.txt')
            })), path.join(fixturesFolder, 'vscode_folder', 'nested_vscode_folder'));
            // check
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window],
                filePath: path.join(fixturesFolder, 'vscode_folder', 'nested_folder', 'subfolder', 'file.txt')
            })), window);
        });
        test('More specific VSCode folder wins', function () {
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'nested_vscode_folder', 'subfolder', 'file.txt')
            })), path.join(fixturesFolder, 'vscode_folder', 'nested_vscode_folder'));
        });
        test('VSCode folder in home folder needs settings.json', function () {
            // Because ~/.vscode/extensions is used for extensions, ~/.vscode is not enough as a hint.
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_folder', 'file.txt'),
                userHome: path.join(fixturesFolder, 'vscode_folder')
            })), null);
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                filePath: path.join(fixturesFolder, 'vscode_home_folder', 'file.txt'),
                userHome: path.join(fixturesFolder, 'vscode_home_folder')
            })), path.join(fixturesFolder, 'vscode_home_folder'));
        });
        test('Workspace folder wins', function () {
            var window = { lastFocusTime: 1, openedWorkspace: testWorkspace };
            assert.equal(windowsFinder_1.findBestWindowOrFolderForFile(options({
                windows: [window],
                filePath: path.join(fixturesFolder, 'vscode_workspace_2_folder', 'nested_vscode_folder', 'subfolder', 'file.txt')
            })), window);
        });
    });
});
