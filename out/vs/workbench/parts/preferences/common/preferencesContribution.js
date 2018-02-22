var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/base/common/winjs.base", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/editor/common/services/resolverService", "vs/workbench/parts/preferences/common/preferences", "vs/base/common/lifecycle", "vs/workbench/services/group/common/groupService", "vs/base/common/strings", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration"], function (require, exports, modelService_1, modeService_1, winjs_base_1, JSONContributionRegistry, platform_1, resolverService_1, preferences_1, lifecycle_1, groupService_1, strings_1, environment_1, workspace_1, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var schemaRegistry = platform_1.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    var PreferencesContribution = /** @class */ (function () {
        function PreferencesContribution(modelService, textModelResolverService, preferencesService, modeService, editorGroupService, environmentService, workspaceService, configurationService) {
            var _this = this;
            this.modelService = modelService;
            this.textModelResolverService = textModelResolverService;
            this.preferencesService = preferencesService;
            this.modeService = modeService;
            this.editorGroupService = editorGroupService;
            this.environmentService = environmentService;
            this.workspaceService = workspaceService;
            this.configurationService = configurationService;
            this.settingsListener = this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING)) {
                    _this.handleSettingsEditorOverride();
                }
            });
            this.handleSettingsEditorOverride();
            this.start();
        }
        PreferencesContribution.prototype.handleSettingsEditorOverride = function () {
            var _this = this;
            // dispose any old listener we had
            this.editorOpeningListener = lifecycle_1.dispose(this.editorOpeningListener);
            // install editor opening listener unless user has disabled this
            if (!!this.configurationService.getValue(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING)) {
                this.editorOpeningListener = this.editorGroupService.onEditorOpening(function (e) { return _this.onEditorOpening(e); });
            }
        };
        PreferencesContribution.prototype.onEditorOpening = function (event) {
            var _this = this;
            var resource = event.input.getResource();
            if (!resource || resource.scheme !== 'file' || // require a file path opening
                !strings_1.endsWith(resource.fsPath, 'settings.json') || // file must end in settings.json
                !this.configurationService.getValue(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING) // user has not disabled default settings editor
            ) {
                return;
            }
            // If the file resource was already opened before in the group, do not prevent
            // the opening of that resource. Otherwise we would have the same settings
            // opened twice (https://github.com/Microsoft/vscode/issues/36447)
            var stacks = this.editorGroupService.getStacksModel();
            var group = stacks.groupAt(event.position);
            if (group && group.contains(event.input)) {
                return;
            }
            // Global User Settings File
            if (resource.fsPath === this.environmentService.appSettingsPath) {
                return event.prevent(function () { return _this.preferencesService.openGlobalSettings(event.options, event.position); });
            }
            // Single Folder Workspace Settings File
            var state = this.workspaceService.getWorkbenchState();
            if (state === workspace_1.WorkbenchState.FOLDER) {
                var folders = this.workspaceService.getWorkspace().folders;
                if (resource.fsPath === folders[0].toResource(preferences_1.FOLDER_SETTINGS_PATH).fsPath) {
                    return event.prevent(function () { return _this.preferencesService.openWorkspaceSettings(event.options, event.position); });
                }
            }
            else if (state === workspace_1.WorkbenchState.WORKSPACE) {
                var folders_1 = this.workspaceService.getWorkspace().folders;
                var _loop_1 = function (i) {
                    if (resource.fsPath === folders_1[i].toResource(preferences_1.FOLDER_SETTINGS_PATH).fsPath) {
                        return { value: event.prevent(function () { return _this.preferencesService.openFolderSettings(folders_1[i].uri, event.options, event.position); }) };
                    }
                };
                for (var i = 0; i < folders_1.length; i++) {
                    var state_1 = _loop_1(i);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
        };
        PreferencesContribution.prototype.start = function () {
            var _this = this;
            this.textModelResolverService.registerTextModelContentProvider('vscode', {
                provideTextContent: function (uri) {
                    if (uri.scheme !== 'vscode') {
                        return null;
                    }
                    if (uri.authority === 'schemas') {
                        var schemaModel = _this.getSchemaModel(uri);
                        if (schemaModel) {
                            return winjs_base_1.TPromise.as(schemaModel);
                        }
                    }
                    return _this.preferencesService.resolveModel(uri);
                }
            });
        };
        PreferencesContribution.prototype.getSchemaModel = function (uri) {
            var schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()];
            if (schema) {
                var modelContent = JSON.stringify(schema);
                var mode = this.modeService.getOrCreateMode('jsonc');
                var model_1 = this.modelService.createModel(modelContent, mode, uri);
                var disposables_1 = [];
                disposables_1.push(schemaRegistry.onDidChangeSchema(function (schemaUri) {
                    if (schemaUri === uri.toString()) {
                        schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()];
                        model_1.setValue(JSON.stringify(schema));
                    }
                }));
                disposables_1.push(model_1.onWillDispose(function () { return lifecycle_1.dispose(disposables_1); }));
                return model_1;
            }
            return null;
        };
        PreferencesContribution.prototype.dispose = function () {
            this.editorOpeningListener = lifecycle_1.dispose(this.editorOpeningListener);
            this.settingsListener = lifecycle_1.dispose(this.settingsListener);
        };
        PreferencesContribution = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, resolverService_1.ITextModelService),
            __param(2, preferences_1.IPreferencesService),
            __param(3, modeService_1.IModeService),
            __param(4, groupService_1.IEditorGroupService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, configuration_1.IConfigurationService)
        ], PreferencesContribution);
        return PreferencesContribution;
    }());
    exports.PreferencesContribution = PreferencesContribution;
});
