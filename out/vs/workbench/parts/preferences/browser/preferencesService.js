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
define(["require", "exports", "vs/base/common/network", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/uri", "vs/base/common/labels", "vs/base/common/strings", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/services/group/common/groupService", "vs/platform/files/common/files", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environment", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/parts/preferences/common/preferencesModels", "vs/platform/telemetry/common/telemetry", "vs/workbench/parts/preferences/browser/preferencesEditor", "vs/workbench/parts/preferences/browser/keybindingsEditor", "vs/editor/common/services/resolverService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/platform/keybinding/common/keybinding", "vs/editor/common/services/modelService", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/editor/common/services/modeService", "vs/base/common/json", "vs/css!./media/preferences"], function (require, exports, network, winjs_base_1, nls, uri_1, labels, strings, lifecycle_1, event_1, editorService_1, workspace_1, configuration_1, editor_1, groupService_1, files_1, message_1, instantiation_1, environment_1, preferences_1, preferencesModels_1, telemetry_1, preferencesEditor_1, keybindingsEditor_1, resolverService_1, codeEditorService_1, editOperation_1, position_1, keybinding_1, modelService_1, jsonEditing_1, configurationRegistry_1, configuration_2, modeService_1, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var emptyEditableSettingsContent = '{\n}';
    var PreferencesService = /** @class */ (function (_super) {
        __extends(PreferencesService, _super);
        function PreferencesService(editorService, editorGroupService, fileService, configurationService, messageService, contextService, instantiationService, environmentService, telemetryService, textModelResolverService, keybindingService, modelService, jsonEditingService, modeService) {
            var _this = _super.call(this) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.fileService = fileService;
            _this.configurationService = configurationService;
            _this.messageService = messageService;
            _this.contextService = contextService;
            _this.instantiationService = instantiationService;
            _this.environmentService = environmentService;
            _this.telemetryService = telemetryService;
            _this.textModelResolverService = textModelResolverService;
            _this.modelService = modelService;
            _this.jsonEditingService = jsonEditingService;
            _this.modeService = modeService;
            _this.lastOpenedSettingsInput = null;
            _this._onDispose = new event_1.Emitter();
            _this._defaultSettingsUriCounter = 0;
            _this._defaultResourceSettingsUriCounter = 0;
            _this.defaultKeybindingsResource = uri_1.default.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/keybindings.json' });
            _this.defaultSettingsRawResource = uri_1.default.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/defaultSettings.json' });
            _this.editorGroupService.onEditorsChanged(function () {
                var activeEditorInput = _this.editorService.getActiveEditorInput();
                if (activeEditorInput instanceof preferencesEditor_1.PreferencesEditorInput) {
                    _this.lastOpenedSettingsInput = activeEditorInput;
                }
            });
            // The default keybindings.json updates based on keyboard layouts, so here we make sure
            // if a model has been given out we update it accordingly.
            keybindingService.onDidUpdateKeybindings(function () {
                var model = modelService.getModel(_this.defaultKeybindingsResource);
                if (!model) {
                    // model has not been given out => nothing to do
                    return;
                }
                modelService.updateModel(model, preferencesModels_1.defaultKeybindingsContents(keybindingService));
            });
            return _this;
        }
        Object.defineProperty(PreferencesService.prototype, "userSettingsResource", {
            get: function () {
                return this.getEditableSettingsURI(configuration_2.ConfigurationTarget.USER);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreferencesService.prototype, "workspaceSettingsResource", {
            get: function () {
                return this.getEditableSettingsURI(configuration_2.ConfigurationTarget.WORKSPACE);
            },
            enumerable: true,
            configurable: true
        });
        PreferencesService.prototype.getFolderSettingsResource = function (resource) {
            return this.getEditableSettingsURI(configuration_2.ConfigurationTarget.WORKSPACE_FOLDER, resource);
        };
        PreferencesService.prototype.resolveModel = function (uri) {
            var _this = this;
            if (this.isDefaultSettingsResource(uri) || this.isDefaultResourceSettingsResource(uri)) {
                var scope_1 = this.isDefaultSettingsResource(uri) ? configurationRegistry_1.ConfigurationScope.WINDOW : configurationRegistry_1.ConfigurationScope.RESOURCE;
                var mode = this.modeService.getOrCreateMode('jsonc');
                var model = this._register(this.modelService.createModel('', mode, uri));
                var defaultSettings_1;
                this.configurationService.onDidChangeConfiguration(function (e) {
                    if (e.source === configuration_2.ConfigurationTarget.DEFAULT) {
                        var model_1 = _this.modelService.getModel(uri);
                        if (!model_1) {
                            // model has not been given out => nothing to do
                            return;
                        }
                        defaultSettings_1 = _this.getDefaultSettings(scope_1);
                        _this.modelService.updateModel(model_1, defaultSettings_1.parse());
                        defaultSettings_1._onDidChange.fire();
                    }
                });
                // Check if Default settings is already created and updated in above promise
                if (!defaultSettings_1) {
                    defaultSettings_1 = this.getDefaultSettings(scope_1);
                    this.modelService.updateModel(model, defaultSettings_1.parse());
                }
                return winjs_base_1.TPromise.as(model);
            }
            if (this.defaultSettingsRawResource.toString() === uri.toString()) {
                var defaultSettings = this.getDefaultSettings(configurationRegistry_1.ConfigurationScope.WINDOW);
                var mode = this.modeService.getOrCreateMode('jsonc');
                var model = this._register(this.modelService.createModel(defaultSettings.raw, mode, uri));
                return winjs_base_1.TPromise.as(model);
            }
            if (this.defaultKeybindingsResource.toString() === uri.toString()) {
                var defaultKeybindingsEditorModel = this.instantiationService.createInstance(preferencesModels_1.DefaultKeybindingsEditorModel, uri);
                var mode = this.modeService.getOrCreateMode('jsonc');
                var model = this._register(this.modelService.createModel(defaultKeybindingsEditorModel.content, mode, uri));
                return winjs_base_1.TPromise.as(model);
            }
            return winjs_base_1.TPromise.as(null);
        };
        PreferencesService.prototype.createPreferencesEditorModel = function (uri) {
            if (this.isDefaultSettingsResource(uri) || this.isDefaultResourceSettingsResource(uri)) {
                return this.createDefaultSettingsEditorModel(uri);
            }
            if (this.getEditableSettingsURI(configuration_2.ConfigurationTarget.USER).toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(configuration_2.ConfigurationTarget.USER, uri);
            }
            var workspaceSettingsUri = this.getEditableSettingsURI(configuration_2.ConfigurationTarget.WORKSPACE);
            if (workspaceSettingsUri && workspaceSettingsUri.toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(configuration_2.ConfigurationTarget.WORKSPACE, workspaceSettingsUri);
            }
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                return this.createEditableSettingsEditorModel(configuration_2.ConfigurationTarget.WORKSPACE_FOLDER, uri);
            }
            return winjs_base_1.TPromise.wrap(null);
        };
        PreferencesService.prototype.openRawDefaultSettings = function () {
            return this.editorService.openEditor({ resource: this.defaultSettingsRawResource }, editor_1.Position.ONE);
        };
        PreferencesService.prototype.openGlobalSettings = function (options, position) {
            return this.doOpenSettings(configuration_2.ConfigurationTarget.USER, this.userSettingsResource, options, position);
        };
        PreferencesService.prototype.openWorkspaceSettings = function (options, position) {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                this.messageService.show(message_1.Severity.Info, nls.localize('openFolderFirst', "Open a folder first to create workspace settings"));
                return winjs_base_1.TPromise.as(null);
            }
            return this.doOpenSettings(configuration_2.ConfigurationTarget.WORKSPACE, this.workspaceSettingsResource, options, position);
        };
        PreferencesService.prototype.openFolderSettings = function (folder, options, position) {
            return this.doOpenSettings(configuration_2.ConfigurationTarget.WORKSPACE_FOLDER, this.getEditableSettingsURI(configuration_2.ConfigurationTarget.WORKSPACE_FOLDER, folder), options, position);
        };
        PreferencesService.prototype.switchSettings = function (target, resource) {
            var _this = this;
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && activeEditor.input instanceof preferencesEditor_1.PreferencesEditorInput) {
                return this.getOrCreateEditableSettingsEditorInput(target, this.getEditableSettingsURI(target, resource))
                    .then(function (toInput) {
                    var replaceWith = new preferencesEditor_1.PreferencesEditorInput(_this.getPreferencesEditorInputName(target, resource), toInput.getDescription(), _this.instantiationService.createInstance(preferencesEditor_1.DefaultPreferencesEditorInput, _this.getDefaultSettingsResource(target)), toInput);
                    return _this.editorService.replaceEditors([{
                            toReplace: _this.lastOpenedSettingsInput,
                            replaceWith: replaceWith
                        }], activeEditor.position).then(function () {
                        _this.lastOpenedSettingsInput = replaceWith;
                    });
                });
            }
            else {
                this.doOpenSettings(target, resource);
                return undefined;
            }
        };
        PreferencesService.prototype.openGlobalKeybindingSettings = function (textual) {
            var _this = this;
            /* __GDPR__
                "openKeybindings" : {
                    "textual" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('openKeybindings', { textual: textual });
            if (textual) {
                var emptyContents = '// ' + nls.localize('emptyKeybindingsHeader', "Place your key bindings in this file to overwrite the defaults") + '\n[\n]';
                var editableKeybindings_1 = uri_1.default.file(this.environmentService.appKeybindingsPath);
                // Create as needed and open in editor
                return this.createIfNotExists(editableKeybindings_1, emptyContents).then(function () {
                    return _this.editorService.openEditors([
                        { input: { resource: _this.defaultKeybindingsResource, options: { pinned: true }, label: nls.localize('defaultKeybindings', "Default Keybindings"), description: '' }, position: editor_1.Position.ONE },
                        { input: { resource: editableKeybindings_1, options: { pinned: true } }, position: editor_1.Position.TWO },
                    ]).then(function () {
                        _this.editorGroupService.focusGroup(editor_1.Position.TWO);
                    });
                });
            }
            return this.editorService.openEditor(this.instantiationService.createInstance(keybindingsEditor_1.KeybindingsEditorInput), { pinned: true }).then(function () { return null; });
        };
        PreferencesService.prototype.configureSettingsForLanguage = function (language) {
            var _this = this;
            this.openGlobalSettings()
                .then(function (editor) {
                var codeEditor = codeEditorService_1.getCodeEditor(editor);
                _this.getPosition(language, codeEditor)
                    .then(function (position) {
                    codeEditor.setPosition(position);
                    codeEditor.focus();
                });
            });
        };
        PreferencesService.prototype.doOpenSettings = function (configurationTarget, resource, options, position) {
            var _this = this;
            var openDefaultSettings = !!this.configurationService.getValue(preferences_1.DEFAULT_SETTINGS_EDITOR_SETTING);
            return this.getOrCreateEditableSettingsEditorInput(configurationTarget, resource)
                .then(function (editableSettingsEditorInput) {
                if (!options) {
                    options = { pinned: true };
                }
                else {
                    options.pinned = true;
                }
                if (openDefaultSettings) {
                    var defaultPreferencesEditorInput = _this.instantiationService.createInstance(preferencesEditor_1.DefaultPreferencesEditorInput, _this.getDefaultSettingsResource(configurationTarget));
                    var preferencesEditorInput = new preferencesEditor_1.PreferencesEditorInput(_this.getPreferencesEditorInputName(configurationTarget, resource), editableSettingsEditorInput.getDescription(), defaultPreferencesEditorInput, editableSettingsEditorInput);
                    _this.lastOpenedSettingsInput = preferencesEditorInput;
                    return _this.editorService.openEditor(preferencesEditorInput, options, position);
                }
                return _this.editorService.openEditor(editableSettingsEditorInput, options, position);
            });
        };
        PreferencesService.prototype.isDefaultSettingsResource = function (uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?settings\.json$/);
        };
        PreferencesService.prototype.isDefaultResourceSettingsResource = function (uri) {
            return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?resourceSettings\.json$/);
        };
        PreferencesService.prototype.getDefaultSettingsResource = function (configurationTarget) {
            if (configurationTarget === configuration_2.ConfigurationTarget.WORKSPACE_FOLDER) {
                return uri_1.default.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: "/" + this._defaultResourceSettingsUriCounter++ + "/resourceSettings.json" });
            }
            else {
                return uri_1.default.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: "/" + this._defaultSettingsUriCounter++ + "/settings.json" });
            }
        };
        PreferencesService.prototype.getPreferencesEditorInputName = function (target, resource) {
            var name = preferences_1.getSettingsTargetName(target, resource, this.contextService);
            return target === configuration_2.ConfigurationTarget.WORKSPACE_FOLDER ? nls.localize('folderSettingsName', "{0} (Folder Settings)", name) : name;
        };
        PreferencesService.prototype.getOrCreateEditableSettingsEditorInput = function (target, resource) {
            var _this = this;
            return this.createSettingsIfNotExists(target, resource)
                .then(function () { return _this.editorService.createInput({ resource: resource }); });
        };
        PreferencesService.prototype.createEditableSettingsEditorModel = function (configurationTarget, resource) {
            var _this = this;
            var settingsUri = this.getEditableSettingsURI(configurationTarget, resource);
            if (settingsUri) {
                var workspace = this.contextService.getWorkspace();
                if (workspace.configuration && workspace.configuration.toString() === settingsUri.toString()) {
                    return this.textModelResolverService.createModelReference(settingsUri)
                        .then(function (reference) { return _this.instantiationService.createInstance(preferencesModels_1.WorkspaceConfigurationEditorModel, reference, configurationTarget); });
                }
                return this.textModelResolverService.createModelReference(settingsUri)
                    .then(function (reference) { return _this.instantiationService.createInstance(preferencesModels_1.SettingsEditorModel, reference, configurationTarget); });
            }
            return winjs_base_1.TPromise.wrap(null);
        };
        PreferencesService.prototype.createDefaultSettingsEditorModel = function (defaultSettingsUri) {
            var _this = this;
            return this.textModelResolverService.createModelReference(defaultSettingsUri)
                .then(function (reference) {
                var scope = _this.isDefaultSettingsResource(defaultSettingsUri) ? configurationRegistry_1.ConfigurationScope.WINDOW : configurationRegistry_1.ConfigurationScope.RESOURCE;
                return _this.instantiationService.createInstance(preferencesModels_1.DefaultSettingsEditorModel, defaultSettingsUri, reference, scope, _this.getDefaultSettings(scope));
            });
        };
        PreferencesService.prototype.getDefaultSettings = function (scope) {
            switch (scope) {
                case configurationRegistry_1.ConfigurationScope.WINDOW:
                    if (!this._defaultSettingsContentModel) {
                        this._defaultSettingsContentModel = new preferencesModels_1.DefaultSettings(this.getMostCommonlyUsedSettings(), scope);
                    }
                    return this._defaultSettingsContentModel;
                case configurationRegistry_1.ConfigurationScope.RESOURCE:
                    if (!this._defaultResourceSettingsContentModel) {
                        this._defaultResourceSettingsContentModel = new preferencesModels_1.DefaultSettings(this.getMostCommonlyUsedSettings(), scope);
                    }
                    return this._defaultResourceSettingsContentModel;
            }
        };
        PreferencesService.prototype.getEditableSettingsURI = function (configurationTarget, resource) {
            switch (configurationTarget) {
                case configuration_2.ConfigurationTarget.USER:
                    return uri_1.default.file(this.environmentService.appSettingsPath);
                case configuration_2.ConfigurationTarget.WORKSPACE:
                    if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                        return null;
                    }
                    var workspace = this.contextService.getWorkspace();
                    return workspace.configuration || workspace.folders[0].toResource(preferences_1.FOLDER_SETTINGS_PATH);
                case configuration_2.ConfigurationTarget.WORKSPACE_FOLDER:
                    var folder = this.contextService.getWorkspaceFolder(resource);
                    return folder ? folder.toResource(preferences_1.FOLDER_SETTINGS_PATH) : null;
            }
            return null;
        };
        PreferencesService.prototype.createSettingsIfNotExists = function (target, resource) {
            var _this = this;
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && target === configuration_2.ConfigurationTarget.WORKSPACE) {
                return this.fileService.resolveContent(this.contextService.getWorkspace().configuration)
                    .then(function (content) {
                    if (Object.keys(json_1.parse(content.value)).indexOf('settings') === -1) {
                        return _this.jsonEditingService.write(resource, { key: 'settings', value: {} }, true).then(null, function () { });
                    }
                    return null;
                });
            }
            return this.createIfNotExists(resource, emptyEditableSettingsContent).then(function () { });
        };
        PreferencesService.prototype.createIfNotExists = function (resource, contents) {
            var _this = this;
            return this.fileService.resolveContent(resource, { acceptTextOnly: true }).then(null, function (error) {
                if (error.fileOperationResult === files_1.FileOperationResult.FILE_NOT_FOUND) {
                    return _this.fileService.updateContent(resource, contents).then(null, function (error) {
                        return winjs_base_1.TPromise.wrapError(new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", labels.getPathLabel(resource, _this.contextService, _this.environmentService), error)));
                    });
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        PreferencesService.prototype.getMostCommonlyUsedSettings = function () {
            return [
                'files.autoSave',
                'editor.fontSize',
                'editor.fontFamily',
                'editor.tabSize',
                'editor.renderWhitespace',
                'editor.cursorStyle',
                'editor.multiCursorModifier',
                'editor.insertSpaces',
                'editor.wordWrap',
                'files.exclude',
                'files.associations'
            ];
        };
        PreferencesService.prototype.getPosition = function (language, codeEditor) {
            var _this = this;
            return this.createPreferencesEditorModel(this.userSettingsResource)
                .then(function (settingsModel) {
                var languageKey = "[" + language + "]";
                var setting = settingsModel.getPreference(languageKey);
                var model = codeEditor.getModel();
                var configuration = _this.configurationService.getValue();
                var eol = configuration.files && configuration.files.eol;
                if (setting) {
                    if (setting.overrides.length) {
                        var lastSetting = setting.overrides[setting.overrides.length - 1];
                        var content = void 0;
                        if (lastSetting.valueRange.endLineNumber === setting.range.endLineNumber) {
                            content = ',' + eol + _this.spaces(2, configuration.editor) + eol + _this.spaces(1, configuration.editor);
                        }
                        else {
                            content = ',' + eol + _this.spaces(2, configuration.editor);
                        }
                        var editOperation = editOperation_1.EditOperation.insert(new position_1.Position(lastSetting.valueRange.endLineNumber, lastSetting.valueRange.endColumn), content);
                        model.pushEditOperations([], [editOperation], function () { return []; });
                        return { lineNumber: lastSetting.valueRange.endLineNumber + 1, column: model.getLineMaxColumn(lastSetting.valueRange.endLineNumber + 1) };
                    }
                    return { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.startColumn + 1 };
                }
                return _this.configurationService.updateValue(languageKey, {}, configuration_2.ConfigurationTarget.USER)
                    .then(function () {
                    setting = settingsModel.getPreference(languageKey);
                    var content = eol + _this.spaces(2, configuration.editor) + eol + _this.spaces(1, configuration.editor);
                    var editOperation = editOperation_1.EditOperation.insert(new position_1.Position(setting.valueRange.endLineNumber, setting.valueRange.endColumn - 1), content);
                    model.pushEditOperations([], [editOperation], function () { return []; });
                    var lineNumber = setting.valueRange.endLineNumber + 1;
                    settingsModel.dispose();
                    return { lineNumber: lineNumber, column: model.getLineMaxColumn(lineNumber) };
                });
            });
        };
        PreferencesService.prototype.spaces = function (count, _a) {
            var tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
            return insertSpaces ? strings.repeat(' ', tabSize * count) : strings.repeat('\t', count);
        };
        PreferencesService.prototype.dispose = function () {
            this._onDispose.fire();
            _super.prototype.dispose.call(this);
        };
        PreferencesService = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, files_1.IFileService),
            __param(3, configuration_1.IWorkspaceConfigurationService),
            __param(4, message_1.IMessageService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, environment_1.IEnvironmentService),
            __param(8, telemetry_1.ITelemetryService),
            __param(9, resolverService_1.ITextModelService),
            __param(10, keybinding_1.IKeybindingService),
            __param(11, modelService_1.IModelService),
            __param(12, jsonEditing_1.IJSONEditingService),
            __param(13, modeService_1.IModeService)
        ], PreferencesService);
        return PreferencesService;
    }(lifecycle_1.Disposable));
    exports.PreferencesService = PreferencesService;
});
