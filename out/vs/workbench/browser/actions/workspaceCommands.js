/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/windows/common/windows", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspace/common/workspaceEditing", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/services/viewlet/browser/viewlet", "vs/base/common/paths", "vs/platform/quickOpen/common/quickOpen", "vs/base/common/cancellation", "vs/base/common/labels", "vs/platform/commands/common/commands", "vs/workbench/services/history/common/history", "vs/platform/files/common/files", "vs/platform/environment/common/environment", "vs/base/common/platform"], function (require, exports, nls, windows_1, workspace_1, workspaceEditing_1, uri_1, resources, viewlet_1, paths_1, quickOpen_1, cancellation_1, labels_1, commands_1, history_1, files_1, environment_1, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADD_ROOT_FOLDER_COMMAND_ID = 'addRootFolder';
    exports.ADD_ROOT_FOLDER_LABEL = nls.localize('addFolderToWorkspace', "Add Folder to Workspace...");
    exports.PICK_WORKSPACE_FOLDER_COMMAND_ID = '_workbench.pickWorkspaceFolder';
    function pickFolders(buttonLabel, title, windowService, contextService, historyService) {
        return windowService.showOpenDialog({
            buttonLabel: buttonLabel,
            title: title,
            properties: ['multiSelections', 'openDirectory', 'createDirectory'],
            defaultPath: defaultFolderPath(contextService, historyService)
        });
    }
    function defaultFolderPath(contextService, historyService) {
        var candidate;
        // Check for last active file root first...
        candidate = historyService.getLastActiveWorkspaceRoot('file');
        // ...then for last active file
        if (!candidate) {
            candidate = historyService.getLastActiveFile();
        }
        return candidate ? paths_1.dirname(candidate.fsPath) : void 0;
    }
    exports.defaultFolderPath = defaultFolderPath;
    function services(accessor) {
        return {
            windowService: accessor.get(windows_1.IWindowService),
            historyService: accessor.get(history_1.IHistoryService),
            contextService: accessor.get(workspace_1.IWorkspaceContextService),
            environmentService: accessor.get(environment_1.IEnvironmentService)
        };
    }
    function defaultFilePath(contextService, historyService) {
        var candidate;
        // Check for last active file first...
        candidate = historyService.getLastActiveFile();
        // ...then for last active file root
        if (!candidate) {
            candidate = historyService.getLastActiveWorkspaceRoot('file');
        }
        return candidate ? paths_1.dirname(candidate.fsPath) : void 0;
    }
    exports.defaultFilePath = defaultFilePath;
    function defaultWorkspacePath(contextService, historyService, environmentService) {
        // Check for current workspace config file first...
        if (contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && !isUntitledWorkspace(contextService.getWorkspace().configuration.fsPath, environmentService)) {
            return paths_1.dirname(contextService.getWorkspace().configuration.fsPath);
        }
        // ...then fallback to default folder path
        return defaultFolderPath(contextService, historyService);
    }
    exports.defaultWorkspacePath = defaultWorkspacePath;
    function isUntitledWorkspace(path, environmentService) {
        return files_1.isParent(path, environmentService.workspacesHome, !platform_1.isLinux /* ignore case */);
    }
    // Command registration
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFileFolderInNewWindow',
        handler: function (accessor) {
            var _a = services(accessor), windowService = _a.windowService, historyService = _a.historyService, contextService = _a.contextService;
            windowService.pickFileFolderAndOpen({ forceNewWindow: true, dialogOptions: { defaultPath: defaultFilePath(contextService, historyService) } });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: '_files.pickFolderAndOpen',
        handler: function (accessor, forceNewWindow) {
            var _a = services(accessor), windowService = _a.windowService, historyService = _a.historyService, contextService = _a.contextService;
            windowService.pickFolderAndOpen({ forceNewWindow: forceNewWindow, dialogOptions: { defaultPath: defaultFolderPath(contextService, historyService) } });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFolderInNewWindow',
        handler: function (accessor) {
            var _a = services(accessor), windowService = _a.windowService, historyService = _a.historyService, contextService = _a.contextService;
            windowService.pickFolderAndOpen({ forceNewWindow: true, dialogOptions: { defaultPath: defaultFolderPath(contextService, historyService) } });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.files.openFileInNewWindow',
        handler: function (accessor) {
            var _a = services(accessor), windowService = _a.windowService, historyService = _a.historyService, contextService = _a.contextService;
            windowService.pickFileAndOpen({ forceNewWindow: true, dialogOptions: { defaultPath: defaultFilePath(contextService, historyService) } });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.openWorkspaceInNewWindow',
        handler: function (accessor) {
            var _a = services(accessor), windowService = _a.windowService, historyService = _a.historyService, contextService = _a.contextService, environmentService = _a.environmentService;
            windowService.pickWorkspaceAndOpen({ forceNewWindow: true, dialogOptions: { defaultPath: defaultWorkspacePath(contextService, historyService, environmentService) } });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.ADD_ROOT_FOLDER_COMMAND_ID,
        handler: function (accessor) {
            var viewletService = accessor.get(viewlet_1.IViewletService);
            var workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            return pickFolders(labels_1.mnemonicButtonLabel(nls.localize({ key: 'add', comment: ['&& denotes a mnemonic'] }, "&&Add")), nls.localize('addFolderToWorkspaceTitle', "Add Folder to Workspace"), accessor.get(windows_1.IWindowService), accessor.get(workspace_1.IWorkspaceContextService), accessor.get(history_1.IHistoryService)).then(function (folders) {
                if (!folders || !folders.length) {
                    return null;
                }
                // Add and show Files Explorer viewlet
                return workspaceEditingService.addFolders(folders.map(function (folder) { return ({ uri: uri_1.default.file(folder) }); })).then(function () { return viewletService.openViewlet(viewletService.getDefaultViewletId(), true); });
            });
        }
    });
    commands_1.CommandsRegistry.registerCommand(exports.PICK_WORKSPACE_FOLDER_COMMAND_ID, function (accessor, args) {
        var contextService = accessor.get(workspace_1.IWorkspaceContextService);
        var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
        var environmentService = accessor.get(environment_1.IEnvironmentService);
        var folders = contextService.getWorkspace().folders;
        if (!folders.length) {
            return void 0;
        }
        var folderPicks = folders.map(function (folder) {
            return {
                label: folder.name,
                description: labels_1.getPathLabel(resources.dirname(folder.uri), void 0, environmentService),
                folder: folder,
                resource: folder.uri,
                fileKind: files_1.FileKind.ROOT_FOLDER
            };
        });
        var options;
        if (args) {
            options = args[0];
        }
        if (!options) {
            options = Object.create(null);
        }
        if (!options.autoFocus) {
            options.autoFocus = { autoFocusFirstEntry: true };
        }
        if (!options.placeHolder) {
            options.placeHolder = nls.localize('workspaceFolderPickerPlaceholder', "Select workspace folder");
        }
        if (typeof options.matchOnDescription !== 'boolean') {
            options.matchOnDescription = true;
        }
        var token;
        if (args) {
            token = args[1];
        }
        if (!token) {
            token = cancellation_1.CancellationToken.None;
        }
        return quickOpenService.pick(folderPicks, options, token).then(function (pick) {
            if (!pick) {
                return void 0;
            }
            return folders[folderPicks.indexOf(pick)];
        });
    });
});
