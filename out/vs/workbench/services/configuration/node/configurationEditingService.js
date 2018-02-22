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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/json", "vs/base/node/encoding", "vs/base/common/strings", "vs/base/common/jsonEdit", "vs/base/common/async", "vs/editor/common/core/editOperation", "vs/platform/registry/common/platform", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/workbench/services/textfile/common/textfiles", "vs/platform/configuration/common/configuration", "vs/workbench/services/configuration/common/configuration", "vs/platform/files/common/files", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configurationRegistry", "vs/platform/message/common/message", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls, winjs_base_1, uri_1, json, encoding, strings, jsonEdit_1, async_1, editOperation_1, platform_1, range_1, selection_1, workspace_1, environment_1, textfiles_1, configuration_1, configuration_2, files_1, resolverService_1, configurationRegistry_1, message_1, commands_1, editorService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConfigurationEditingErrorCode;
    (function (ConfigurationEditingErrorCode) {
        /**
         * Error when trying to write a configuration key that is not registered.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_UNKNOWN_KEY"] = 0] = "ERROR_UNKNOWN_KEY";
        /**
         * Error when trying to write an invalid folder configuration key to folder settings.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_CONFIGURATION"] = 1] = "ERROR_INVALID_FOLDER_CONFIGURATION";
        /**
         * Error when trying to write to user target but not supported for provided key.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_USER_TARGET"] = 2] = "ERROR_INVALID_USER_TARGET";
        /**
         * Error when trying to write to user target but not supported for provided key.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_TARGET"] = 3] = "ERROR_INVALID_WORKSPACE_TARGET";
        /**
         * Error when trying to write a configuration key to folder target
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_TARGET"] = 4] = "ERROR_INVALID_FOLDER_TARGET";
        /**
         * Error when trying to write to the workspace configuration without having a workspace opened.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_NO_WORKSPACE_OPENED"] = 5] = "ERROR_NO_WORKSPACE_OPENED";
        /**
         * Error when trying to write and save to the configuration file while it is dirty in the editor.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_CONFIGURATION_FILE_DIRTY"] = 6] = "ERROR_CONFIGURATION_FILE_DIRTY";
        /**
         * Error when trying to write to a configuration file that contains JSON errors.
         */
        ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_CONFIGURATION"] = 7] = "ERROR_INVALID_CONFIGURATION";
    })(ConfigurationEditingErrorCode = exports.ConfigurationEditingErrorCode || (exports.ConfigurationEditingErrorCode = {}));
    var ConfigurationEditingError = /** @class */ (function (_super) {
        __extends(ConfigurationEditingError, _super);
        function ConfigurationEditingError(message, code) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            return _this;
        }
        return ConfigurationEditingError;
    }(Error));
    exports.ConfigurationEditingError = ConfigurationEditingError;
    var ConfigurationEditingService = /** @class */ (function () {
        function ConfigurationEditingService(configurationService, contextService, environmentService, fileService, textModelResolverService, textFileService, choiceService, messageService, commandService, editorService) {
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.choiceService = choiceService;
            this.messageService = messageService;
            this.commandService = commandService;
            this.editorService = editorService;
            this.queue = new async_1.Queue();
        }
        ConfigurationEditingService.prototype.writeConfiguration = function (target, value, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var operation = this.getConfigurationEditOperation(target, value, options.scopes || {});
            return this.queue.queue(function () { return _this.doWriteConfiguration(operation, options) // queue up writes to prevent race conditions
                .then(function () { return null; }, function (error) {
                if (!options.donotNotifyError) {
                    _this.onError(error, operation, options.scopes);
                }
                return winjs_base_1.TPromise.wrapError(error);
            }); });
        };
        ConfigurationEditingService.prototype.doWriteConfiguration = function (operation, options) {
            var _this = this;
            var checkDirtyConfiguration = !(options.force || options.donotSave);
            var saveConfiguration = options.force || !options.donotSave;
            return this.resolveAndValidate(operation.target, operation, checkDirtyConfiguration, options.scopes || {})
                .then(function (reference) { return _this.writeToBuffer(reference.object.textEditorModel, operation, saveConfiguration)
                .then(function () { return reference.dispose(); }); });
        };
        ConfigurationEditingService.prototype.writeToBuffer = function (model, operation, save) {
            var edit = this.getEdits(model, operation)[0];
            if (edit && this.applyEditsToBuffer(edit, model) && save) {
                return this.textFileService.save(operation.resource, { skipSaveParticipants: true /* programmatic change */ });
            }
            return winjs_base_1.TPromise.as(null);
        };
        ConfigurationEditingService.prototype.applyEditsToBuffer = function (edit, model) {
            var startPosition = model.getPositionAt(edit.offset);
            var endPosition = model.getPositionAt(edit.offset + edit.length);
            var range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            var currentText = model.getValueInRange(range);
            if (edit.content !== currentText) {
                var editOperation = currentText ? editOperation_1.EditOperation.replace(range, edit.content) : editOperation_1.EditOperation.insert(startPosition, edit.content);
                model.pushEditOperations([new selection_1.Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], function () { return []; });
                return true;
            }
            return false;
        };
        ConfigurationEditingService.prototype.onError = function (error, operation, scopes) {
            switch (error.code) {
                case ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION:
                    this.onInvalidConfigurationError(error, operation);
                    break;
                case ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY:
                    this.onConfigurationFileDirtyError(error, operation, scopes);
                    break;
                default:
                    this.messageService.show(message_1.Severity.Error, error.message);
            }
        };
        ConfigurationEditingService.prototype.onInvalidConfigurationError = function (error, operation) {
            var _this = this;
            var openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_2.TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
                : operation.workspaceStandAloneConfigurationKey === configuration_2.LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.choiceService.choose(message_1.Severity.Error, error.message, [openStandAloneConfigurationActionLabel, nls.localize('close', "Close")], 1)
                    .then(function (option) {
                    switch (option) {
                        case 0:
                            _this.openFile(operation.resource);
                            break;
                    }
                });
            }
            else {
                this.choiceService.choose(message_1.Severity.Error, error.message, [nls.localize('open', "Open Settings"), nls.localize('close', "Close")], 1)
                    .then(function (option) {
                    switch (option) {
                        case 0:
                            _this.openSettings(operation);
                            break;
                    }
                });
            }
        };
        ConfigurationEditingService.prototype.onConfigurationFileDirtyError = function (error, operation, scopes) {
            var _this = this;
            var openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === configuration_2.TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
                : operation.workspaceStandAloneConfigurationKey === configuration_2.LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                    : null;
            if (openStandAloneConfigurationActionLabel) {
                this.choiceService.choose(message_1.Severity.Error, error.message, [nls.localize('saveAndRetry', "Save and Retry"), openStandAloneConfigurationActionLabel, nls.localize('close', "Close")], 2)
                    .then(function (option) {
                    switch (option) {
                        case 0:
                            var key = operation.key ? operation.workspaceStandAloneConfigurationKey + "." + operation.key : operation.workspaceStandAloneConfigurationKey;
                            _this.writeConfiguration(operation.target, { key: key, value: operation.value }, { force: true, scopes: scopes });
                            break;
                        case 1:
                            _this.openFile(operation.resource);
                            break;
                    }
                });
            }
            else {
                this.choiceService.choose(message_1.Severity.Error, error.message, [nls.localize('saveAndRetry', "Save and Retry"), nls.localize('open', "Open Settings"), nls.localize('close', "Close")], 2)
                    .then(function (option) {
                    switch (option) {
                        case 0:
                            _this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { force: true, scopes: scopes });
                            break;
                        case 1:
                            _this.openSettings(operation);
                            break;
                    }
                });
            }
        };
        ConfigurationEditingService.prototype.openSettings = function (operation) {
            switch (operation.target) {
                case configuration_1.ConfigurationTarget.USER:
                    this.commandService.executeCommand('workbench.action.openGlobalSettings');
                    break;
                case configuration_1.ConfigurationTarget.WORKSPACE:
                    this.commandService.executeCommand('workbench.action.openWorkspaceSettings');
                    break;
                case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                    if (operation.resource) {
                        var workspaceFolder = this.contextService.getWorkspaceFolder(operation.resource);
                        if (workspaceFolder) {
                            this.commandService.executeCommand('_workbench.action.openFolderSettings', workspaceFolder);
                        }
                    }
                    break;
            }
        };
        ConfigurationEditingService.prototype.openFile = function (resource) {
            this.editorService.openEditor({ resource: resource });
        };
        ConfigurationEditingService.prototype.wrapError = function (code, target, operation) {
            var message = this.toErrorMessage(code, target, operation);
            return winjs_base_1.TPromise.wrapError(new ConfigurationEditingError(message, code));
        };
        ConfigurationEditingService.prototype.toErrorMessage = function (error, target, operation) {
            switch (error) {
                // API constraints
                case ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY: return nls.localize('errorUnknownKey', "Unable to write to {0} because {1} is not a registered configuration.", this.stringifyTarget(target), operation.key);
                case ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION: return nls.localize('errorInvalidFolderConfiguration', "Unable to write to Folder Settings because {0} does not support the folder resource scope.", operation.key);
                case ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET: return nls.localize('errorInvalidUserTarget', "Unable to write to User Settings because {0} does not support for global scope.", operation.key);
                case ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET: return nls.localize('errorInvalidWorkspaceTarget', "Unable to write to Workspace Settings because {0} does not support for workspace scope in a multi folder workspace.", operation.key);
                case ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET: return nls.localize('errorInvalidFolderTarget', "Unable to write to Folder Settings because no resource is provided.");
                case ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED: return nls.localize('errorNoWorkspaceOpened', "Unable to write to {0} because no workspace is opened. Please open a workspace first and try again.", this.stringifyTarget(target));
                // User issues
                case ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_2.TASKS_CONFIGURATION_KEY) {
                        return nls.localize('errorInvalidTaskConfiguration', "Unable to write into tasks file. Please open **Tasks** file to correct errors/warnings in it and try again.");
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_2.LAUNCH_CONFIGURATION_KEY) {
                        return nls.localize('errorInvalidLaunchConfiguration', "Unable to write into launch file. Please open **Launch** file to correct errors/warnings in it and try again.");
                    }
                    switch (target) {
                        case configuration_1.ConfigurationTarget.USER:
                            return nls.localize('errorInvalidConfiguration', "Unable to write into user settings. Please open **User Settings** file to correct errors/warnings in it and try again.");
                        case configuration_1.ConfigurationTarget.WORKSPACE:
                            return nls.localize('errorInvalidConfigurationWorkspace', "Unable to write into workspace settings. Please open **Workspace Settings** file to correct errors/warnings in the file and try again.");
                        case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                            var workspaceFolderName = this.contextService.getWorkspaceFolder(operation.resource).name;
                            return nls.localize('errorInvalidConfigurationFolder', "Unable to write into folder settings. Please open **Folder Settings** file under **{0}** folder to correct errors/warnings in it and try again.", workspaceFolderName);
                    }
                    return '';
                }
                case ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY: {
                    if (operation.workspaceStandAloneConfigurationKey === configuration_2.TASKS_CONFIGURATION_KEY) {
                        return nls.localize('errorTasksConfigurationFileDirty', "Unable to write into tasks file because the file is dirty. Please save the **Tasks Configuration** file and try again.");
                    }
                    if (operation.workspaceStandAloneConfigurationKey === configuration_2.LAUNCH_CONFIGURATION_KEY) {
                        return nls.localize('errorLaunchConfigurationFileDirty', "Unable to write into launch file because the file is dirty. Please save the **Launch Configuration** file and try again.");
                    }
                    switch (target) {
                        case configuration_1.ConfigurationTarget.USER:
                            return nls.localize('errorConfigurationFileDirty', "Unable to write into user settings because the file is dirty. Please save the **User Settings** file and try again.");
                        case configuration_1.ConfigurationTarget.WORKSPACE:
                            return nls.localize('errorConfigurationFileDirtyWorkspace', "Unable to write into workspace settings because the file is dirty. Please save the **Workspace Settings** file and try again.");
                        case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                            var workspaceFolderName = this.contextService.getWorkspaceFolder(operation.resource).name;
                            return nls.localize('errorConfigurationFileDirtyFolder', "Unable to write into folder settings because the file is dirty. Please save the **Folder Settings** file under **{0}** folder and try again.", workspaceFolderName);
                    }
                    return '';
                }
            }
        };
        ConfigurationEditingService.prototype.stringifyTarget = function (target) {
            switch (target) {
                case configuration_1.ConfigurationTarget.USER:
                    return nls.localize('userTarget', "User Settings");
                case configuration_1.ConfigurationTarget.WORKSPACE:
                    return nls.localize('workspaceTarget', "Workspace Settings");
                case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                    return nls.localize('folderTarget', "Folder Settings");
            }
            return '';
        };
        ConfigurationEditingService.prototype.getEdits = function (model, edit) {
            var _a = model.getOptions(), tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
            var eol = model.getEOL();
            var value = edit.value, jsonPath = edit.jsonPath;
            // Without jsonPath, the entire configuration file is being replaced, so we just use JSON.stringify
            if (!jsonPath.length) {
                var content = JSON.stringify(value, null, insertSpaces ? strings.repeat(' ', tabSize) : '\t');
                return [{
                        content: content,
                        length: model.getValue().length,
                        offset: 0
                    }];
            }
            return jsonEdit_1.setProperty(model.getValue(), jsonPath, value, { tabSize: tabSize, insertSpaces: insertSpaces, eol: eol });
        };
        ConfigurationEditingService.prototype.resolveModelReference = function (resource) {
            var _this = this;
            return this.fileService.existsFile(resource)
                .then(function (exists) {
                var result = exists ? winjs_base_1.TPromise.as(null) : _this.fileService.updateContent(resource, '{}', { encoding: encoding.UTF8 });
                return result.then(function () { return _this.textModelResolverService.createModelReference(resource); });
            });
        };
        ConfigurationEditingService.prototype.hasParseErrors = function (model, operation) {
            // If we write to a workspace standalone file and replace the entire contents (no key provided)
            // we can return here because any parse errors can safely be ignored since all contents are replaced
            if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
                return false;
            }
            var parseErrors = [];
            json.parse(model.getValue(), parseErrors, { allowTrailingComma: true });
            return parseErrors.length > 0;
        };
        ConfigurationEditingService.prototype.resolveAndValidate = function (target, operation, checkDirty, overrides) {
            var _this = this;
            // Any key must be a known setting from the registry (unless this is a standalone config)
            if (!operation.workspaceStandAloneConfigurationKey) {
                var validKeys = this.configurationService.keys().default;
                if (validKeys.indexOf(operation.key) < 0 && !configurationRegistry_1.OVERRIDE_PROPERTY_PATTERN.test(operation.key)) {
                    return this.wrapError(ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY, target, operation);
                }
            }
            if (operation.workspaceStandAloneConfigurationKey) {
                // Global tasks and launches are not supported
                if (target === configuration_1.ConfigurationTarget.USER) {
                    return this.wrapError(ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET, target, operation);
                }
                // Workspace tasks are not supported
                if (operation.workspaceStandAloneConfigurationKey === configuration_2.TASKS_CONFIGURATION_KEY && this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE && operation.target === configuration_1.ConfigurationTarget.WORKSPACE) {
                    return this.wrapError(ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET, target, operation);
                }
            }
            // Target cannot be workspace or folder if no workspace opened
            if ((target === configuration_1.ConfigurationTarget.WORKSPACE || target === configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) && this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                return this.wrapError(ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED, target, operation);
            }
            if (target === configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) {
                if (!operation.resource) {
                    return this.wrapError(ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET, target, operation);
                }
                if (!operation.workspaceStandAloneConfigurationKey) {
                    var configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
                    if (configurationProperties[operation.key].scope !== configurationRegistry_1.ConfigurationScope.RESOURCE) {
                        return this.wrapError(ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION, target, operation);
                    }
                }
            }
            return this.resolveModelReference(operation.resource)
                .then(function (reference) {
                var model = reference.object.textEditorModel;
                if (_this.hasParseErrors(model, operation)) {
                    return _this.wrapError(ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION, target, operation);
                }
                // Target cannot be dirty if not writing into buffer
                if (checkDirty && _this.textFileService.isDirty(operation.resource)) {
                    return _this.wrapError(ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY, target, operation);
                }
                return reference;
            });
        };
        ConfigurationEditingService.prototype.getConfigurationEditOperation = function (target, config, overrides) {
            // Check for standalone workspace configurations
            if (config.key) {
                var standaloneConfigurationKeys = Object.keys(configuration_2.WORKSPACE_STANDALONE_CONFIGURATIONS);
                for (var i = 0; i < standaloneConfigurationKeys.length; i++) {
                    var key_1 = standaloneConfigurationKeys[i];
                    var resource_1 = this.getConfigurationFileResource(target, configuration_2.WORKSPACE_STANDALONE_CONFIGURATIONS[key_1], overrides.resource);
                    // Check for prefix
                    if (config.key === key_1) {
                        var jsonPath_1 = this.isWorkspaceConfigurationResource(resource_1) ? [key_1] : [];
                        return { key: jsonPath_1[jsonPath_1.length - 1], jsonPath: jsonPath_1, value: config.value, resource: resource_1, workspaceStandAloneConfigurationKey: key_1, target: target };
                    }
                    // Check for prefix.<setting>
                    var keyPrefix = key_1 + ".";
                    if (config.key.indexOf(keyPrefix) === 0) {
                        var jsonPath_2 = this.isWorkspaceConfigurationResource(resource_1) ? [key_1, config.key.substr(keyPrefix.length)] : [config.key.substr(keyPrefix.length)];
                        return { key: jsonPath_2[jsonPath_2.length - 1], jsonPath: jsonPath_2, value: config.value, resource: resource_1, workspaceStandAloneConfigurationKey: key_1, target: target };
                    }
                }
            }
            var key = config.key;
            var jsonPath = overrides.overrideIdentifier ? [configuration_1.keyFromOverrideIdentifier(overrides.overrideIdentifier), key] : [key];
            if (target === configuration_1.ConfigurationTarget.USER) {
                return { key: key, jsonPath: jsonPath, value: config.value, resource: uri_1.default.file(this.environmentService.appSettingsPath), target: target };
            }
            var resource = this.getConfigurationFileResource(target, configuration_2.FOLDER_SETTINGS_PATH, overrides.resource);
            if (this.isWorkspaceConfigurationResource(resource)) {
                jsonPath = ['settings'].concat(jsonPath);
            }
            return { key: key, jsonPath: jsonPath, value: config.value, resource: resource, target: target };
        };
        ConfigurationEditingService.prototype.isWorkspaceConfigurationResource = function (resource) {
            var workspace = this.contextService.getWorkspace();
            return workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath;
        };
        ConfigurationEditingService.prototype.getConfigurationFileResource = function (target, relativePath, resource) {
            if (target === configuration_1.ConfigurationTarget.USER) {
                return uri_1.default.file(this.environmentService.appSettingsPath);
            }
            var workbenchState = this.contextService.getWorkbenchState();
            if (workbenchState !== workspace_1.WorkbenchState.EMPTY) {
                var workspace = this.contextService.getWorkspace();
                if (target === configuration_1.ConfigurationTarget.WORKSPACE) {
                    if (workbenchState === workspace_1.WorkbenchState.WORKSPACE) {
                        return workspace.configuration;
                    }
                    if (workbenchState === workspace_1.WorkbenchState.FOLDER) {
                        return workspace.folders[0].toResource(relativePath);
                    }
                }
                if (target === configuration_1.ConfigurationTarget.WORKSPACE_FOLDER) {
                    if (resource) {
                        var folder = this.contextService.getWorkspaceFolder(resource);
                        if (folder) {
                            return folder.toResource(relativePath);
                        }
                    }
                }
            }
            return null;
        };
        ConfigurationEditingService = __decorate([
            __param(0, configuration_1.IConfigurationService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, files_1.IFileService),
            __param(4, resolverService_1.ITextModelService),
            __param(5, textfiles_1.ITextFileService),
            __param(6, message_1.IChoiceService),
            __param(7, message_1.IMessageService),
            __param(8, commands_1.ICommandService),
            __param(9, editorService_1.IWorkbenchEditorService)
        ], ConfigurationEditingService);
        return ConfigurationEditingService;
    }());
    exports.ConfigurationEditingService = ConfigurationEditingService;
});
