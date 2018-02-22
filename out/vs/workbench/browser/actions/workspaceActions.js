/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/nls", "vs/platform/windows/common/windows", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspace/common/workspaceEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/environment/common/environment", "vs/base/common/labels", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/workbench/services/history/common/history", "vs/workbench/browser/actions/workspaceCommands"], function (require, exports, winjs_base_1, actions_1, nls, windows_1, workspace_1, workspaceEditing_1, workspaces_1, environment_1, labels_1, editorService_1, commands_1, history_1, workspaceCommands_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenFileAction = /** @class */ (function (_super) {
        __extends(OpenFileAction, _super);
        function OpenFileAction(id, label, windowService, historyService, contextService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowService = windowService;
            _this.historyService = historyService;
            _this.contextService = contextService;
            return _this;
        }
        OpenFileAction.prototype.run = function (event, data) {
            return this.windowService.pickFileAndOpen({ telemetryExtraData: data, dialogOptions: { defaultPath: workspaceCommands_1.defaultFilePath(this.contextService, this.historyService) } });
        };
        OpenFileAction.ID = 'workbench.action.files.openFile';
        OpenFileAction.LABEL = nls.localize('openFile', "Open File...");
        OpenFileAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, history_1.IHistoryService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], OpenFileAction);
        return OpenFileAction;
    }(actions_1.Action));
    exports.OpenFileAction = OpenFileAction;
    var OpenFolderAction = /** @class */ (function (_super) {
        __extends(OpenFolderAction, _super);
        function OpenFolderAction(id, label, windowService, historyService, contextService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowService = windowService;
            _this.historyService = historyService;
            _this.contextService = contextService;
            return _this;
        }
        OpenFolderAction.prototype.run = function (event, data) {
            return this.windowService.pickFolderAndOpen({ telemetryExtraData: data, dialogOptions: { defaultPath: workspaceCommands_1.defaultFolderPath(this.contextService, this.historyService) } });
        };
        OpenFolderAction.ID = 'workbench.action.files.openFolder';
        OpenFolderAction.LABEL = nls.localize('openFolder', "Open Folder...");
        OpenFolderAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, history_1.IHistoryService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], OpenFolderAction);
        return OpenFolderAction;
    }(actions_1.Action));
    exports.OpenFolderAction = OpenFolderAction;
    var OpenFileFolderAction = /** @class */ (function (_super) {
        __extends(OpenFileFolderAction, _super);
        function OpenFileFolderAction(id, label, windowService, historyService, contextService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowService = windowService;
            _this.historyService = historyService;
            _this.contextService = contextService;
            return _this;
        }
        OpenFileFolderAction.prototype.run = function (event, data) {
            return this.windowService.pickFileFolderAndOpen({ telemetryExtraData: data, dialogOptions: { defaultPath: workspaceCommands_1.defaultFilePath(this.contextService, this.historyService) } });
        };
        OpenFileFolderAction.ID = 'workbench.action.files.openFileFolder';
        OpenFileFolderAction.LABEL = nls.localize('openFileFolder', "Open...");
        OpenFileFolderAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, history_1.IHistoryService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], OpenFileFolderAction);
        return OpenFileFolderAction;
    }(actions_1.Action));
    exports.OpenFileFolderAction = OpenFileFolderAction;
    var AddRootFolderAction = /** @class */ (function (_super) {
        __extends(AddRootFolderAction, _super);
        function AddRootFolderAction(id, label, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.commandService = commandService;
            return _this;
        }
        AddRootFolderAction.prototype.run = function () {
            return this.commandService.executeCommand(workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID);
        };
        AddRootFolderAction.ID = 'workbench.action.addRootFolder';
        AddRootFolderAction.LABEL = workspaceCommands_1.ADD_ROOT_FOLDER_LABEL;
        AddRootFolderAction = __decorate([
            __param(2, commands_1.ICommandService)
        ], AddRootFolderAction);
        return AddRootFolderAction;
    }(actions_1.Action));
    exports.AddRootFolderAction = AddRootFolderAction;
    var GlobalRemoveRootFolderAction = /** @class */ (function (_super) {
        __extends(GlobalRemoveRootFolderAction, _super);
        function GlobalRemoveRootFolderAction(id, label, workspaceEditingService, contextService, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.workspaceEditingService = workspaceEditingService;
            _this.contextService = contextService;
            _this.commandService = commandService;
            return _this;
        }
        GlobalRemoveRootFolderAction.prototype.run = function () {
            var _this = this;
            var state = this.contextService.getWorkbenchState();
            // Workspace / Folder
            if (state === workspace_1.WorkbenchState.WORKSPACE || state === workspace_1.WorkbenchState.FOLDER) {
                return this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID).then(function (folder) {
                    if (folder) {
                        return _this.workspaceEditingService.removeFolders([folder.uri]).then(function () { return true; });
                    }
                    return true;
                });
            }
            return winjs_base_1.TPromise.as(true);
        };
        GlobalRemoveRootFolderAction.ID = 'workbench.action.removeRootFolder';
        GlobalRemoveRootFolderAction.LABEL = nls.localize('globalRemoveFolderFromWorkspace', "Remove Folder from Workspace...");
        GlobalRemoveRootFolderAction = __decorate([
            __param(2, workspaceEditing_1.IWorkspaceEditingService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, commands_1.ICommandService)
        ], GlobalRemoveRootFolderAction);
        return GlobalRemoveRootFolderAction;
    }(actions_1.Action));
    exports.GlobalRemoveRootFolderAction = GlobalRemoveRootFolderAction;
    var SaveWorkspaceAsAction = /** @class */ (function (_super) {
        __extends(SaveWorkspaceAsAction, _super);
        function SaveWorkspaceAsAction(id, label, windowService, environmentService, contextService, workspaceEditingService, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowService = windowService;
            _this.environmentService = environmentService;
            _this.contextService = contextService;
            _this.workspaceEditingService = workspaceEditingService;
            _this.historyService = historyService;
            return _this;
        }
        SaveWorkspaceAsAction.prototype.run = function () {
            var _this = this;
            return this.getNewWorkspaceConfigPath().then(function (configPath) {
                if (configPath) {
                    switch (_this.contextService.getWorkbenchState()) {
                        case workspace_1.WorkbenchState.EMPTY:
                        case workspace_1.WorkbenchState.FOLDER:
                            var folders = _this.contextService.getWorkspace().folders.map(function (folder) { return ({ uri: folder.uri }); });
                            return _this.workspaceEditingService.createAndEnterWorkspace(folders, configPath);
                        case workspace_1.WorkbenchState.WORKSPACE:
                            return _this.workspaceEditingService.saveAndEnterWorkspace(configPath);
                    }
                }
                return null;
            });
        };
        SaveWorkspaceAsAction.prototype.getNewWorkspaceConfigPath = function () {
            return this.windowService.showSaveDialog({
                buttonLabel: labels_1.mnemonicButtonLabel(nls.localize({ key: 'save', comment: ['&& denotes a mnemonic'] }, "&&Save")),
                title: nls.localize('saveWorkspace', "Save Workspace"),
                filters: workspaces_1.WORKSPACE_FILTER,
                defaultPath: workspaceCommands_1.defaultWorkspacePath(this.contextService, this.historyService, this.environmentService)
            });
        };
        SaveWorkspaceAsAction.ID = 'workbench.action.saveWorkspaceAs';
        SaveWorkspaceAsAction.LABEL = nls.localize('saveWorkspaceAsAction', "Save Workspace As...");
        SaveWorkspaceAsAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, workspace_1.IWorkspaceContextService),
            __param(5, workspaceEditing_1.IWorkspaceEditingService),
            __param(6, history_1.IHistoryService)
        ], SaveWorkspaceAsAction);
        return SaveWorkspaceAsAction;
    }(actions_1.Action));
    exports.SaveWorkspaceAsAction = SaveWorkspaceAsAction;
    var OpenWorkspaceAction = /** @class */ (function (_super) {
        __extends(OpenWorkspaceAction, _super);
        function OpenWorkspaceAction(id, label, windowService, contextService, historyService, environmentService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowService = windowService;
            _this.contextService = contextService;
            _this.historyService = historyService;
            _this.environmentService = environmentService;
            return _this;
        }
        OpenWorkspaceAction.prototype.run = function (event, data) {
            return this.windowService.pickWorkspaceAndOpen({ telemetryExtraData: data, dialogOptions: { defaultPath: workspaceCommands_1.defaultWorkspacePath(this.contextService, this.historyService, this.environmentService) } });
        };
        OpenWorkspaceAction.ID = 'workbench.action.openWorkspace';
        OpenWorkspaceAction.LABEL = nls.localize('openWorkspaceAction', "Open Workspace...");
        OpenWorkspaceAction = __decorate([
            __param(2, windows_1.IWindowService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, history_1.IHistoryService),
            __param(5, environment_1.IEnvironmentService)
        ], OpenWorkspaceAction);
        return OpenWorkspaceAction;
    }(actions_1.Action));
    exports.OpenWorkspaceAction = OpenWorkspaceAction;
    var OpenWorkspaceConfigFileAction = /** @class */ (function (_super) {
        __extends(OpenWorkspaceConfigFileAction, _super);
        function OpenWorkspaceConfigFileAction(id, label, workspaceContextService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.editorService = editorService;
            _this.enabled = !!_this.workspaceContextService.getWorkspace().configuration;
            return _this;
        }
        OpenWorkspaceConfigFileAction.prototype.run = function () {
            return this.editorService.openEditor({ resource: this.workspaceContextService.getWorkspace().configuration });
        };
        OpenWorkspaceConfigFileAction.ID = 'workbench.action.openWorkspaceConfigFile';
        OpenWorkspaceConfigFileAction.LABEL = nls.localize('openWorkspaceConfigFile', "Open Workspace Configuration File");
        OpenWorkspaceConfigFileAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenWorkspaceConfigFileAction);
        return OpenWorkspaceConfigFileAction;
    }(actions_1.Action));
    exports.OpenWorkspaceConfigFileAction = OpenWorkspaceConfigFileAction;
    var OpenFolderAsWorkspaceInNewWindowAction = /** @class */ (function (_super) {
        __extends(OpenFolderAsWorkspaceInNewWindowAction, _super);
        function OpenFolderAsWorkspaceInNewWindowAction(id, label, workspaceContextService, workspaceEditingService, windowsService, commandService, workspacesService) {
            var _this = _super.call(this, id, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.workspaceEditingService = workspaceEditingService;
            _this.windowsService = windowsService;
            _this.commandService = commandService;
            _this.workspacesService = workspacesService;
            return _this;
        }
        OpenFolderAsWorkspaceInNewWindowAction.prototype.run = function () {
            var _this = this;
            var folders = this.workspaceContextService.getWorkspace().folders;
            var folderPromise;
            if (folders.length === 0) {
                folderPromise = winjs_base_1.TPromise.as(null);
            }
            else if (folders.length === 1) {
                folderPromise = winjs_base_1.TPromise.as(folders[0]);
            }
            else {
                folderPromise = this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            }
            return folderPromise.then(function (folder) {
                if (!folder) {
                    return void 0; // need at least one folder
                }
                return _this.workspacesService.createWorkspace([{ uri: folder.uri }]).then(function (newWorkspace) {
                    return _this.workspaceEditingService.copyWorkspaceSettings(newWorkspace).then(function () {
                        return _this.windowsService.openWindow([newWorkspace.configPath], { forceNewWindow: true });
                    });
                });
            });
        };
        OpenFolderAsWorkspaceInNewWindowAction.ID = 'workbench.action.openFolderAsWorkspaceInNewWindow';
        OpenFolderAsWorkspaceInNewWindowAction.LABEL = nls.localize('openFolderAsWorkspaceInNewWindow', "Open Folder as Workspace in New Window");
        OpenFolderAsWorkspaceInNewWindowAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, workspaceEditing_1.IWorkspaceEditingService),
            __param(4, windows_1.IWindowsService),
            __param(5, commands_1.ICommandService),
            __param(6, workspaces_1.IWorkspacesService)
        ], OpenFolderAsWorkspaceInNewWindowAction);
        return OpenFolderAsWorkspaceInNewWindowAction;
    }(actions_1.Action));
    exports.OpenFolderAsWorkspaceInNewWindowAction = OpenFolderAsWorkspaceInNewWindowAction;
});
