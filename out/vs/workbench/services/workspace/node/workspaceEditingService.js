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
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/base/common/winjs.base", "vs/platform/workspace/common/workspace", "vs/platform/windows/common/windows", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/configuration/common/configuration", "vs/platform/storage/common/migration", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/extensions/common/extensions", "vs/workbench/services/backup/common/backup", "vs/platform/message/common/message", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/resources"], function (require, exports, uri_1, nls, winjs_base_1, workspace_1, windows_1, jsonEditing_1, configuration_1, migration_1, storage_1, configurationRegistry_1, platform_1, extensions_1, backup_1, message_1, commands_1, arrays_1, platform_2, resources_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkspaceEditingService = /** @class */ (function () {
        function WorkspaceEditingService(jsonEditingService, contextService, windowService, workspaceConfigurationService, storageService, extensionService, backupFileService, choiceService, messageService, commandService) {
            this.jsonEditingService = jsonEditingService;
            this.contextService = contextService;
            this.windowService = windowService;
            this.workspaceConfigurationService = workspaceConfigurationService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.backupFileService = backupFileService;
            this.choiceService = choiceService;
            this.messageService = messageService;
            this.commandService = commandService;
        }
        WorkspaceEditingService.prototype.updateFolders = function (index, deleteCount, foldersToAdd, donotNotifyError) {
            var folders = this.contextService.getWorkspace().folders;
            var foldersToDelete = [];
            if (typeof deleteCount === 'number') {
                foldersToDelete = folders.slice(index, index + deleteCount).map(function (f) { return f.uri; });
            }
            var wantsToDelete = foldersToDelete.length > 0;
            var wantsToAdd = Array.isArray(foldersToAdd) && foldersToAdd.length > 0;
            if (!wantsToAdd && !wantsToDelete) {
                return winjs_base_1.TPromise.as(void 0); // return early if there is nothing to do
            }
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                return this.doAddFolders(foldersToAdd, index, donotNotifyError);
            }
            // Delete Folders
            if (wantsToDelete && !wantsToAdd) {
                return this.removeFolders(foldersToDelete);
            }
            else {
                // if we are in single-folder state and the folder is replaced with
                // other folders, we handle this specially and just enter workspace
                // mode with the folders that are being added.
                if (this.includesSingleFolderWorkspace(foldersToDelete)) {
                    return this.createAndEnterWorkspace(foldersToAdd);
                }
                // if we are not in workspace-state, we just add the folders
                if (this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.WORKSPACE) {
                    return this.doAddFolders(foldersToAdd, index, donotNotifyError);
                }
                // finally, update folders within the workspace
                return this.doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError);
            }
        };
        WorkspaceEditingService.prototype.doUpdateFolders = function (foldersToAdd, foldersToDelete, index, donotNotifyError) {
            var _this = this;
            if (donotNotifyError === void 0) { donotNotifyError = false; }
            return this.contextService.updateFolders(foldersToAdd, foldersToDelete, index)
                .then(function () { return null; }, function (error) { return donotNotifyError ? winjs_base_1.TPromise.wrapError(error) : _this.handleWorkspaceConfigurationEditingError(error); });
        };
        WorkspaceEditingService.prototype.addFolders = function (foldersToAdd, donotNotifyError) {
            if (donotNotifyError === void 0) { donotNotifyError = false; }
            return this.doAddFolders(foldersToAdd, void 0, donotNotifyError);
        };
        WorkspaceEditingService.prototype.doAddFolders = function (foldersToAdd, index, donotNotifyError) {
            var _this = this;
            if (donotNotifyError === void 0) { donotNotifyError = false; }
            var state = this.contextService.getWorkbenchState();
            // If we are in no-workspace or single-folder workspace, adding folders has to
            // enter a workspace.
            if (state !== workspace_1.WorkbenchState.WORKSPACE) {
                var newWorkspaceFolders = this.contextService.getWorkspace().folders.map(function (folder) { return ({ uri: folder.uri }); });
                newWorkspaceFolders.splice.apply(newWorkspaceFolders, [typeof index === 'number' ? index : newWorkspaceFolders.length, 0].concat(foldersToAdd));
                newWorkspaceFolders = arrays_1.distinct(newWorkspaceFolders, function (folder) { return platform_2.isLinux ? folder.uri.toString() : folder.uri.toString().toLowerCase(); });
                if (state === workspace_1.WorkbenchState.EMPTY && newWorkspaceFolders.length === 0 || state === workspace_1.WorkbenchState.FOLDER && newWorkspaceFolders.length === 1) {
                    return winjs_base_1.TPromise.as(void 0); // return if the operation is a no-op for the current state
                }
                return this.createAndEnterWorkspace(newWorkspaceFolders);
            }
            // Delegate addition of folders to workspace service otherwise
            return this.contextService.addFolders(foldersToAdd, index)
                .then(function () { return null; }, function (error) { return donotNotifyError ? winjs_base_1.TPromise.wrapError(error) : _this.handleWorkspaceConfigurationEditingError(error); });
        };
        WorkspaceEditingService.prototype.removeFolders = function (foldersToRemove, donotNotifyError) {
            var _this = this;
            if (donotNotifyError === void 0) { donotNotifyError = false; }
            // If we are in single-folder state and the opened folder is to be removed,
            // we create an empty workspace and enter it.
            if (this.includesSingleFolderWorkspace(foldersToRemove)) {
                return this.createAndEnterWorkspace([]);
            }
            // Delegate removal of folders to workspace service otherwise
            return this.contextService.removeFolders(foldersToRemove)
                .then(function () { return null; }, function (error) { return donotNotifyError ? winjs_base_1.TPromise.wrapError(error) : _this.handleWorkspaceConfigurationEditingError(error); });
        };
        WorkspaceEditingService.prototype.includesSingleFolderWorkspace = function (folders) {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                var workspaceFolder_1 = this.contextService.getWorkspace().folders[0];
                return (folders.some(function (folder) { return resources_1.isEqual(folder, workspaceFolder_1.uri, !platform_2.isLinux); }));
            }
            return false;
        };
        WorkspaceEditingService.prototype.createAndEnterWorkspace = function (folders, path) {
            var _this = this;
            return this.doEnterWorkspace(function () { return _this.windowService.createAndEnterWorkspace(folders, path); });
        };
        WorkspaceEditingService.prototype.saveAndEnterWorkspace = function (path) {
            var _this = this;
            return this.doEnterWorkspace(function () { return _this.windowService.saveAndEnterWorkspace(path); });
        };
        WorkspaceEditingService.prototype.handleWorkspaceConfigurationEditingError = function (error) {
            switch (error.code) {
                case jsonEditing_1.JSONEditingErrorCode.ERROR_INVALID_FILE:
                    return this.onInvalidWorkspaceConfigurationFileError();
                case jsonEditing_1.JSONEditingErrorCode.ERROR_FILE_DIRTY:
                    return this.onWorkspaceConfigurationFileDirtyError();
            }
            this.messageService.show(message_1.Severity.Error, error.message);
            return winjs_base_1.TPromise.as(void 0);
        };
        WorkspaceEditingService.prototype.onInvalidWorkspaceConfigurationFileError = function () {
            var message = nls.localize('errorInvalidTaskConfiguration', "Unable to write into workspace configuration file. Please open the file to correct errors/warnings in it and try again.");
            return this.askToOpenWorkspaceConfigurationFile(message);
        };
        WorkspaceEditingService.prototype.onWorkspaceConfigurationFileDirtyError = function () {
            var message = nls.localize('errorWorkspaceConfigurationFileDirty', "Unable to write into workspace configuration file because the file is dirty. Please save it and try again.");
            return this.askToOpenWorkspaceConfigurationFile(message);
        };
        WorkspaceEditingService.prototype.askToOpenWorkspaceConfigurationFile = function (message) {
            var _this = this;
            return this.choiceService.choose(message_1.Severity.Error, message, [nls.localize('openWorkspaceConfigurationFile', "Open Workspace Configuration File"), nls.localize('close', "Close")], 1)
                .then(function (option) {
                switch (option) {
                    case 0:
                        _this.commandService.executeCommand('workbench.action.openWorkspaceConfigFile');
                        break;
                }
            });
        };
        WorkspaceEditingService.prototype.doEnterWorkspace = function (mainSidePromise) {
            var _this = this;
            // Stop the extension host first to give extensions most time to shutdown
            this.extensionService.stopExtensionHost();
            var startExtensionHost = function () {
                _this.extensionService.startExtensionHost();
            };
            return mainSidePromise().then(function (result) {
                // Migrate storage and settings if we are to enter a workspace
                if (result) {
                    return _this.migrate(result.workspace).then(function () {
                        // TODO@Ben TODO@Sandeep the following requires ugly casts and should probably have a service interface
                        // Reinitialize backup service
                        var backupFileService = _this.backupFileService;
                        backupFileService.initialize(result.backupPath);
                        // Reinitialize configuration service
                        var workspaceImpl = _this.contextService;
                        return workspaceImpl.initialize(result.workspace);
                    });
                }
                return winjs_base_1.TPromise.as(void 0);
            }).then(startExtensionHost, function (error) {
                startExtensionHost(); // in any case start the extension host again!
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        WorkspaceEditingService.prototype.migrate = function (toWorkspace) {
            // Storage (UI State) migration
            this.migrateStorage(toWorkspace);
            // Settings migration (only if we come from a folder workspace)
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                return this.copyWorkspaceSettings(toWorkspace);
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        WorkspaceEditingService.prototype.migrateStorage = function (toWorkspace) {
            // TODO@Ben revisit this when we move away from local storage to a file based approach
            var storageImpl = this.storageService;
            var newWorkspaceId = migration_1.migrateStorageToMultiRootWorkspace(storageImpl.workspaceId, toWorkspace, storageImpl.workspaceStorage);
            storageImpl.setWorkspaceId(newWorkspaceId);
        };
        WorkspaceEditingService.prototype.copyWorkspaceSettings = function (toWorkspace) {
            var configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            var targetWorkspaceConfiguration = {};
            for (var _i = 0, _a = this.workspaceConfigurationService.keys().workspace; _i < _a.length; _i++) {
                var key = _a[_i];
                if (configurationProperties[key] && !configurationProperties[key].notMultiRootAdopted && configurationProperties[key].scope === configurationRegistry_1.ConfigurationScope.WINDOW) {
                    targetWorkspaceConfiguration[key] = this.workspaceConfigurationService.inspect(key).workspace;
                }
            }
            return this.jsonEditingService.write(uri_1.default.file(toWorkspace.configPath), { key: 'settings', value: targetWorkspaceConfiguration }, true);
        };
        WorkspaceEditingService = __decorate([
            __param(0, jsonEditing_1.IJSONEditingService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, windows_1.IWindowService),
            __param(3, configuration_1.IWorkspaceConfigurationService),
            __param(4, storage_1.IStorageService),
            __param(5, extensions_1.IExtensionService),
            __param(6, backup_1.IBackupFileService),
            __param(7, message_1.IChoiceService),
            __param(8, message_1.IMessageService),
            __param(9, commands_1.ICommandService)
        ], WorkspaceEditingService);
        return WorkspaceEditingService;
    }());
    exports.WorkspaceEditingService = WorkspaceEditingService;
});
