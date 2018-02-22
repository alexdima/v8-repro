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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/common/services/modeService", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/parts/preferences/common/preferences", "vs/platform/workspace/common/workspace", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/workspaceCommands"], function (require, exports, nls, uri_1, actions_1, lifecycle_1, modeService_1, quickOpen_1, preferences_1, workspace_1, commands_1, workspaceCommands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenRawDefaultSettingsAction = /** @class */ (function (_super) {
        __extends(OpenRawDefaultSettingsAction, _super);
        function OpenRawDefaultSettingsAction(id, label, preferencesService) {
            var _this = _super.call(this, id, label) || this;
            _this.preferencesService = preferencesService;
            return _this;
        }
        OpenRawDefaultSettingsAction.prototype.run = function (event) {
            return this.preferencesService.openRawDefaultSettings();
        };
        OpenRawDefaultSettingsAction.ID = 'workbench.action.openRawDefaultSettings';
        OpenRawDefaultSettingsAction.LABEL = nls.localize('openRawDefaultSettings', "Open Raw Default Settings");
        OpenRawDefaultSettingsAction = __decorate([
            __param(2, preferences_1.IPreferencesService)
        ], OpenRawDefaultSettingsAction);
        return OpenRawDefaultSettingsAction;
    }(actions_1.Action));
    exports.OpenRawDefaultSettingsAction = OpenRawDefaultSettingsAction;
    var OpenGlobalSettingsAction = /** @class */ (function (_super) {
        __extends(OpenGlobalSettingsAction, _super);
        function OpenGlobalSettingsAction(id, label, preferencesService) {
            var _this = _super.call(this, id, label) || this;
            _this.preferencesService = preferencesService;
            return _this;
        }
        OpenGlobalSettingsAction.prototype.run = function (event) {
            return this.preferencesService.openGlobalSettings();
        };
        OpenGlobalSettingsAction.ID = 'workbench.action.openGlobalSettings';
        OpenGlobalSettingsAction.LABEL = nls.localize('openGlobalSettings', "Open User Settings");
        OpenGlobalSettingsAction = __decorate([
            __param(2, preferences_1.IPreferencesService)
        ], OpenGlobalSettingsAction);
        return OpenGlobalSettingsAction;
    }(actions_1.Action));
    exports.OpenGlobalSettingsAction = OpenGlobalSettingsAction;
    var OpenGlobalKeybindingsAction = /** @class */ (function (_super) {
        __extends(OpenGlobalKeybindingsAction, _super);
        function OpenGlobalKeybindingsAction(id, label, preferencesService) {
            var _this = _super.call(this, id, label) || this;
            _this.preferencesService = preferencesService;
            return _this;
        }
        OpenGlobalKeybindingsAction.prototype.run = function (event) {
            return this.preferencesService.openGlobalKeybindingSettings(false);
        };
        OpenGlobalKeybindingsAction.ID = 'workbench.action.openGlobalKeybindings';
        OpenGlobalKeybindingsAction.LABEL = nls.localize('openGlobalKeybindings', "Open Keyboard Shortcuts");
        OpenGlobalKeybindingsAction = __decorate([
            __param(2, preferences_1.IPreferencesService)
        ], OpenGlobalKeybindingsAction);
        return OpenGlobalKeybindingsAction;
    }(actions_1.Action));
    exports.OpenGlobalKeybindingsAction = OpenGlobalKeybindingsAction;
    var OpenGlobalKeybindingsFileAction = /** @class */ (function (_super) {
        __extends(OpenGlobalKeybindingsFileAction, _super);
        function OpenGlobalKeybindingsFileAction(id, label, preferencesService) {
            var _this = _super.call(this, id, label) || this;
            _this.preferencesService = preferencesService;
            return _this;
        }
        OpenGlobalKeybindingsFileAction.prototype.run = function (event) {
            return this.preferencesService.openGlobalKeybindingSettings(true);
        };
        OpenGlobalKeybindingsFileAction.ID = 'workbench.action.openGlobalKeybindingsFile';
        OpenGlobalKeybindingsFileAction.LABEL = nls.localize('openGlobalKeybindingsFile', "Open Keyboard Shortcuts File");
        OpenGlobalKeybindingsFileAction = __decorate([
            __param(2, preferences_1.IPreferencesService)
        ], OpenGlobalKeybindingsFileAction);
        return OpenGlobalKeybindingsFileAction;
    }(actions_1.Action));
    exports.OpenGlobalKeybindingsFileAction = OpenGlobalKeybindingsFileAction;
    var OpenWorkspaceSettingsAction = /** @class */ (function (_super) {
        __extends(OpenWorkspaceSettingsAction, _super);
        function OpenWorkspaceSettingsAction(id, label, preferencesService, workspaceContextService) {
            var _this = _super.call(this, id, label) || this;
            _this.preferencesService = preferencesService;
            _this.workspaceContextService = workspaceContextService;
            _this.disposables = [];
            _this.update();
            _this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        OpenWorkspaceSettingsAction.prototype.update = function () {
            this.enabled = this.workspaceContextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY;
        };
        OpenWorkspaceSettingsAction.prototype.run = function (event) {
            return this.preferencesService.openWorkspaceSettings();
        };
        OpenWorkspaceSettingsAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        OpenWorkspaceSettingsAction.ID = 'workbench.action.openWorkspaceSettings';
        OpenWorkspaceSettingsAction.LABEL = nls.localize('openWorkspaceSettings', "Open Workspace Settings");
        OpenWorkspaceSettingsAction = __decorate([
            __param(2, preferences_1.IPreferencesService),
            __param(3, workspace_1.IWorkspaceContextService)
        ], OpenWorkspaceSettingsAction);
        return OpenWorkspaceSettingsAction;
    }(actions_1.Action));
    exports.OpenWorkspaceSettingsAction = OpenWorkspaceSettingsAction;
    exports.OPEN_FOLDER_SETTINGS_COMMAND = '_workbench.action.openFolderSettings';
    exports.OPEN_FOLDER_SETTINGS_LABEL = nls.localize('openFolderSettings', "Open Folder Settings");
    var OpenFolderSettingsAction = /** @class */ (function (_super) {
        __extends(OpenFolderSettingsAction, _super);
        function OpenFolderSettingsAction(id, label, workspaceContextService, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.workspaceContextService = workspaceContextService;
            _this.commandService = commandService;
            _this.disposables = [];
            _this.update();
            _this.workspaceContextService.onDidChangeWorkbenchState(function () { return _this.update(); }, _this, _this.disposables);
            _this.workspaceContextService.onDidChangeWorkspaceFolders(function () { return _this.update(); }, _this, _this.disposables);
            return _this;
        }
        OpenFolderSettingsAction.prototype.update = function () {
            this.enabled = this.workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && this.workspaceContextService.getWorkspace().folders.length > 0;
        };
        OpenFolderSettingsAction.prototype.run = function () {
            var _this = this;
            return this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID)
                .then(function (workspaceFolder) {
                if (workspaceFolder) {
                    return _this.commandService.executeCommand(exports.OPEN_FOLDER_SETTINGS_COMMAND, workspaceFolder.uri);
                }
                return null;
            });
        };
        OpenFolderSettingsAction.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        OpenFolderSettingsAction.ID = 'workbench.action.openFolderSettings';
        OpenFolderSettingsAction.LABEL = exports.OPEN_FOLDER_SETTINGS_LABEL;
        OpenFolderSettingsAction = __decorate([
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, commands_1.ICommandService)
        ], OpenFolderSettingsAction);
        return OpenFolderSettingsAction;
    }(actions_1.Action));
    exports.OpenFolderSettingsAction = OpenFolderSettingsAction;
    var ConfigureLanguageBasedSettingsAction = /** @class */ (function (_super) {
        __extends(ConfigureLanguageBasedSettingsAction, _super);
        function ConfigureLanguageBasedSettingsAction(id, label, modeService, quickOpenService, preferencesService) {
            var _this = _super.call(this, id, label) || this;
            _this.modeService = modeService;
            _this.quickOpenService = quickOpenService;
            _this.preferencesService = preferencesService;
            return _this;
        }
        ConfigureLanguageBasedSettingsAction.prototype.run = function () {
            var _this = this;
            var languages = this.modeService.getRegisteredLanguageNames();
            var picks = languages.sort().map(function (lang, index) {
                var description = nls.localize('languageDescriptionConfigured', "({0})", _this.modeService.getModeIdForLanguageName(lang.toLowerCase()));
                // construct a fake resource to be able to show nice icons if any
                var fakeResource;
                var extensions = _this.modeService.getExtensions(lang);
                if (extensions && extensions.length) {
                    fakeResource = uri_1.default.file(extensions[0]);
                }
                else {
                    var filenames = _this.modeService.getFilenames(lang);
                    if (filenames && filenames.length) {
                        fakeResource = uri_1.default.file(filenames[0]);
                    }
                }
                return {
                    label: lang,
                    resource: fakeResource,
                    description: description
                };
            });
            return this.quickOpenService.pick(picks, { placeHolder: nls.localize('pickLanguage', "Select Language") })
                .then(function (pick) {
                if (pick) {
                    return _this.modeService.getOrCreateModeByLanguageName(pick.label)
                        .then(function (mode) { return _this.preferencesService.configureSettingsForLanguage(mode.getLanguageIdentifier().language); });
                }
                return undefined;
            });
        };
        ConfigureLanguageBasedSettingsAction.ID = 'workbench.action.configureLanguageBasedSettings';
        ConfigureLanguageBasedSettingsAction.LABEL = nls.localize('configureLanguageBasedSettings', "Configure Language Specific Settings...");
        ConfigureLanguageBasedSettingsAction = __decorate([
            __param(2, modeService_1.IModeService),
            __param(3, quickOpen_1.IQuickOpenService),
            __param(4, preferences_1.IPreferencesService)
        ], ConfigureLanguageBasedSettingsAction);
        return ConfigureLanguageBasedSettingsAction;
    }(actions_1.Action));
    exports.ConfigureLanguageBasedSettingsAction = ConfigureLanguageBasedSettingsAction;
});
