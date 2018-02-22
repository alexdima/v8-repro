/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "path", "vs/nls", "vs/base/common/arrays", "vs/base/common/strings", "vs/platform/state/common/state", "electron", "vs/platform/log/common/log", "vs/base/common/labels", "vs/base/common/event", "vs/base/common/platform", "vs/platform/workspaces/common/workspaces", "vs/platform/environment/common/environment", "vs/base/common/paths", "vs/base/common/async"], function (require, exports, path, nls, arrays, strings_1, state_1, electron_1, log_1, labels_1, event_1, platform_1, workspaces_1, environment_1, paths_1, async_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var HistoryMainService = /** @class */ (function () {
        function HistoryMainService(stateService, logService, workspacesMainService, environmentService) {
            var _this = this;
            this.stateService = stateService;
            this.logService = logService;
            this.workspacesMainService = workspacesMainService;
            this.environmentService = environmentService;
            this._onRecentlyOpenedChange = new event_1.Emitter();
            this.onRecentlyOpenedChange = this._onRecentlyOpenedChange.event;
            this.macOSRecentDocumentsUpdater = new async_1.RunOnceScheduler(function () { return _this.updateMacOSRecentDocuments(); }, 800);
            this.registerListeners();
        }
        HistoryMainService.prototype.registerListeners = function () {
            var _this = this;
            this.workspacesMainService.onWorkspaceSaved(function (e) { return _this.onWorkspaceSaved(e); });
        };
        HistoryMainService.prototype.onWorkspaceSaved = function (e) {
            // Make sure to add newly saved workspaces to the list of recent workspaces
            this.addRecentlyOpened([e.workspace], []);
        };
        HistoryMainService.prototype.addRecentlyOpened = function (workspaces, files) {
            var _this = this;
            if ((workspaces && workspaces.length > 0) || (files && files.length > 0)) {
                var mru_1 = this.getRecentlyOpened();
                // Workspaces
                workspaces.forEach(function (workspace) {
                    var isUntitledWorkspace = !workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) && _this.workspacesMainService.isUntitledWorkspace(workspace);
                    if (isUntitledWorkspace) {
                        return; // only store saved workspaces
                    }
                    mru_1.workspaces.unshift(workspace);
                    mru_1.workspaces = arrays.distinct(mru_1.workspaces, function (workspace) { return _this.distinctFn(workspace); });
                    // We do not add to recent documents here because on Windows we do this from a custom
                    // JumpList and on macOS we fill the recent documents in one go from all our data later.
                });
                // Files
                files.forEach(function (path) {
                    mru_1.files.unshift(path);
                    mru_1.files = arrays.distinct(mru_1.files, function (file) { return _this.distinctFn(file); });
                    // Add to recent documents (Windows only, macOS later)
                    if (platform_1.isWindows) {
                        electron_1.app.addRecentDocument(path);
                    }
                });
                // Make sure its bounded
                mru_1.workspaces = mru_1.workspaces.slice(0, HistoryMainService.MAX_TOTAL_RECENT_ENTRIES);
                mru_1.files = mru_1.files.slice(0, HistoryMainService.MAX_TOTAL_RECENT_ENTRIES);
                this.saveRecentlyOpened(mru_1);
                this._onRecentlyOpenedChange.fire();
                // Schedule update to recent documents on macOS dock
                if (platform_1.isMacintosh) {
                    this.macOSRecentDocumentsUpdater.schedule();
                }
            }
        };
        HistoryMainService.prototype.removeFromRecentlyOpened = function (pathsToRemove) {
            var mru = this.getRecentlyOpened();
            var update = false;
            pathsToRemove.forEach((function (pathToRemove) {
                // Remove workspace
                var index = arrays.firstIndex(mru.workspaces, function (workspace) { return paths_1.isEqual(workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? workspace : workspace.configPath, pathToRemove, !platform_1.isLinux /* ignorecase */); });
                if (index >= 0) {
                    mru.workspaces.splice(index, 1);
                    update = true;
                }
                // Remove file
                index = arrays.firstIndex(mru.files, function (file) { return paths_1.isEqual(file, pathToRemove, !platform_1.isLinux /* ignorecase */); });
                if (index >= 0) {
                    mru.files.splice(index, 1);
                    update = true;
                }
            }));
            if (update) {
                this.saveRecentlyOpened(mru);
                this._onRecentlyOpenedChange.fire();
                // Schedule update to recent documents on macOS dock
                if (platform_1.isMacintosh) {
                    this.macOSRecentDocumentsUpdater.schedule();
                }
            }
        };
        HistoryMainService.prototype.updateMacOSRecentDocuments = function () {
            if (!platform_1.isMacintosh) {
                return;
            }
            // macOS recent documents in the dock are behaving strangely. the entries seem to get
            // out of sync quickly over time. the attempted fix is to always set the list fresh
            // from our MRU history data. So we clear the documents first and then set the documents
            // again.
            electron_1.app.clearRecentDocuments();
            var mru = this.getRecentlyOpened();
            var maxEntries = HistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES;
            // Take up to maxEntries/2 workspaces
            for (var i = 0; i < mru.workspaces.length && i < HistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES / 2; i++) {
                var workspace = mru.workspaces[i];
                electron_1.app.addRecentDocument(workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? workspace : workspace.configPath);
                maxEntries--;
            }
            // Take up to maxEntries files
            for (var i = 0; i < mru.files.length && i < maxEntries; i++) {
                var file = mru.files[i];
                electron_1.app.addRecentDocument(file);
            }
        };
        HistoryMainService.prototype.clearRecentlyOpened = function () {
            this.saveRecentlyOpened({ workspaces: [], files: [] });
            electron_1.app.clearRecentDocuments();
            // Event
            this._onRecentlyOpenedChange.fire();
        };
        HistoryMainService.prototype.getRecentlyOpened = function (currentWorkspace, currentFiles) {
            var _this = this;
            var workspaces;
            var files;
            // Get from storage
            var storedRecents = this.stateService.getItem(HistoryMainService.recentlyOpenedStorageKey);
            if (storedRecents) {
                workspaces = storedRecents.workspaces || [];
                files = storedRecents.files || [];
            }
            else {
                workspaces = [];
                files = [];
            }
            // Add current workspace to beginning if set
            if (currentWorkspace) {
                workspaces.unshift(currentWorkspace);
            }
            // Add currently files to open to the beginning if any
            if (currentFiles) {
                files.unshift.apply(files, currentFiles.map(function (f) { return f.filePath; }));
            }
            // Clear those dupes
            workspaces = arrays.distinct(workspaces, function (workspace) { return _this.distinctFn(workspace); });
            files = arrays.distinct(files, function (file) { return _this.distinctFn(file); });
            // Hide untitled workspaces
            workspaces = workspaces.filter(function (workspace) { return workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) || !_this.workspacesMainService.isUntitledWorkspace(workspace); });
            return { workspaces: workspaces, files: files };
        };
        HistoryMainService.prototype.distinctFn = function (workspaceOrFile) {
            if (workspaces_1.isSingleFolderWorkspaceIdentifier(workspaceOrFile)) {
                return platform_1.isLinux ? workspaceOrFile : workspaceOrFile.toLowerCase();
            }
            return workspaceOrFile.id;
        };
        HistoryMainService.prototype.saveRecentlyOpened = function (recent) {
            this.stateService.setItem(HistoryMainService.recentlyOpenedStorageKey, recent);
        };
        HistoryMainService.prototype.updateWindowsJumpList = function () {
            var _this = this;
            if (!platform_1.isWindows) {
                return; // only on windows
            }
            var jumpList = [];
            // Tasks
            jumpList.push({
                type: 'tasks',
                items: [
                    {
                        type: 'task',
                        title: nls.localize('newWindow', "New Window"),
                        description: nls.localize('newWindowDesc', "Opens a new window"),
                        program: process.execPath,
                        args: '-n',
                        iconPath: process.execPath,
                        iconIndex: 0
                    }
                ]
            });
            // Recent Workspaces
            if (this.getRecentlyOpened().workspaces.length > 0) {
                // The user might have meanwhile removed items from the jump list and we have to respect that
                // so we need to update our list of recent paths with the choice of the user to not add them again
                // Also: Windows will not show our custom category at all if there is any entry which was removed
                // by the user! See https://github.com/Microsoft/vscode/issues/15052
                this.removeFromRecentlyOpened(electron_1.app.getJumpListSettings().removedItems.filter(function (r) { return !!r.args; }).map(function (r) { return strings_1.trim(r.args, '"'); }));
                // Add entries
                jumpList.push({
                    type: 'custom',
                    name: nls.localize('recentFolders', "Recent Workspaces"),
                    items: this.getRecentlyOpened().workspaces.slice(0, 7 /* limit number of entries here */).map(function (workspace) {
                        var title = workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? labels_1.getBaseLabel(workspace) : workspaces_1.getWorkspaceLabel(workspace, _this.environmentService);
                        var description = workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? nls.localize('folderDesc', "{0} {1}", labels_1.getBaseLabel(workspace), labels_1.getPathLabel(path.dirname(workspace))) : nls.localize('codeWorkspace', "Code Workspace");
                        return {
                            type: 'task',
                            title: title,
                            description: description,
                            program: process.execPath,
                            args: "\"" + (workspaces_1.isSingleFolderWorkspaceIdentifier(workspace) ? workspace : workspace.configPath) + "\"",
                            iconPath: 'explorer.exe',
                            iconIndex: 0
                        };
                    }).filter(function (i) { return !!i; })
                });
            }
            // Recent
            jumpList.push({
                type: 'recent' // this enables to show files in the "recent" category
            });
            try {
                electron_1.app.setJumpList(jumpList);
            }
            catch (error) {
                this.logService.warn('#setJumpList', error); // since setJumpList is relatively new API, make sure to guard for errors
            }
        };
        HistoryMainService.MAX_TOTAL_RECENT_ENTRIES = 100;
        HistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES = 10;
        HistoryMainService.recentlyOpenedStorageKey = 'openedPathsList';
        HistoryMainService = __decorate([
            __param(0, state_1.IStateService),
            __param(1, log_1.ILogService),
            __param(2, workspaces_1.IWorkspacesMainService),
            __param(3, environment_1.IEnvironmentService)
        ], HistoryMainService);
        return HistoryMainService;
    }());
    exports.HistoryMainService = HistoryMainService;
});
