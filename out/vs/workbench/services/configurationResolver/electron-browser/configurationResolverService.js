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
define(["require", "exports", "vs/base/common/paths", "vs/base/common/types", "vs/base/common/winjs.base", "vs/base/common/async", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "path", "vs/base/common/platform", "vs/base/common/labels", "vs/base/common/network"], function (require, exports, paths, types, winjs_base_1, async_1, environment_1, configuration_1, commands_1, workspace_1, editorService_1, editor_1, diffEditorInput_1, path_1, platform_1, labels_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var VariableResolver = /** @class */ (function () {
        function VariableResolver(envVariables, configurationService, editorService, environmentService, workspaceContextService) {
            var _this = this;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.workspaceContextService = workspaceContextService;
            if (platform_1.isWindows) {
                this.envVariables = Object.create(null);
                Object.keys(envVariables).forEach(function (key) {
                    _this.envVariables[key.toLowerCase()] = envVariables[key];
                });
            }
            else {
                this.envVariables = envVariables;
            }
        }
        VariableResolver.prototype.resolve = function (context, value) {
            var _this = this;
            var filePath = this.getFilePath();
            return value.replace(VariableResolver.VARIABLE_REGEXP, function (match, variable) {
                var parts = variable.split(':');
                var sufix;
                if (parts && parts.length > 1) {
                    variable = parts[0];
                    sufix = parts[1];
                }
                switch (variable) {
                    case 'env': {
                        if (sufix) {
                            if (platform_1.isWindows) {
                                sufix = sufix.toLowerCase();
                            }
                            var env = _this.envVariables[sufix];
                            if (types.isString(env)) {
                                return env;
                            }
                        }
                    }
                    case 'config': {
                        if (sufix) {
                            var config = _this.configurationService.getValue(sufix, context ? { resource: context.uri } : undefined);
                            if (!types.isUndefinedOrNull(config) && !types.isObject(config)) {
                                return config;
                            }
                        }
                    }
                    default: {
                        if (sufix) {
                            var folder = _this.workspaceContextService.getWorkspace().folders.filter(function (f) { return f.name === sufix; }).pop();
                            if (folder) {
                                context = folder;
                            }
                        }
                        switch (variable) {
                            case 'workspaceRoot':
                            case 'workspaceFolder':
                                return context ? labels_1.normalizeDriveLetter(context.uri.fsPath) : match;
                            case 'cwd':
                                return context ? labels_1.normalizeDriveLetter(context.uri.fsPath) : process.cwd();
                            case 'workspaceRootFolderName':
                            case 'workspaceFolderBasename':
                                return context ? paths.basename(context.uri.fsPath) : match;
                            case 'lineNumber':
                                return _this.getLineNumber() || match;
                            case 'selectedText':
                                return _this.getSelectedText() || match;
                            case 'file':
                                return filePath || match;
                            case 'relativeFile':
                                return context ? paths.normalize(path_1.relative(context.uri.fsPath, filePath)) : filePath || match;
                            case 'fileDirname':
                                return filePath ? paths.dirname(filePath) : match;
                            case 'fileExtname':
                                return filePath ? paths.extname(filePath) : match;
                            case 'fileBasename':
                                return filePath ? paths.basename(filePath) : match;
                            case 'fileBasenameNoExtension': {
                                if (!filePath) {
                                    return match;
                                }
                                var basename = paths.basename(filePath);
                                return basename.slice(0, basename.length - paths.extname(basename).length);
                            }
                            case 'execPath':
                                return _this.environmentService.execPath;
                            default:
                                return match;
                        }
                    }
                }
            });
        };
        VariableResolver.prototype.getSelectedText = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editorControl = activeEditor.getControl();
                if (editorControl) {
                    var editorModel = editorControl.getModel();
                    var editorSelection = editorControl.getSelection();
                    if (editorModel && editorSelection) {
                        return editorModel.getValueInRange(editorSelection);
                    }
                }
            }
            return undefined;
        };
        VariableResolver.prototype.getFilePath = function () {
            var input = this.editorService.getActiveEditorInput();
            if (input instanceof diffEditorInput_1.DiffEditorInput) {
                input = input.modifiedInput;
            }
            var fileResource = editor_1.toResource(input, { filter: network_1.Schemas.file });
            if (!fileResource) {
                return undefined;
            }
            return paths.normalize(fileResource.fsPath, true);
        };
        VariableResolver.prototype.getLineNumber = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                var editorControl = activeEditor.getControl();
                if (editorControl) {
                    var lineNumber = editorControl.getSelection().positionLineNumber;
                    return String(lineNumber);
                }
            }
            return undefined;
        };
        VariableResolver.VARIABLE_REGEXP = /\$\{(.*?)\}/g;
        return VariableResolver;
    }());
    var ConfigurationResolverService = /** @class */ (function () {
        function ConfigurationResolverService(envVariables, editorService, environmentService, configurationService, commandService, workspaceContextService) {
            this.commandService = commandService;
            this.resolver = new VariableResolver(envVariables, configurationService, editorService, environmentService, workspaceContextService);
        }
        ConfigurationResolverService.prototype.resolve = function (root, value) {
            var _this = this;
            if (types.isString(value)) {
                return this.resolver.resolve(root, value);
            }
            else if (types.isArray(value)) {
                return value.map(function (s) { return _this.resolver.resolve(root, s); });
            }
            else if (types.isObject(value)) {
                var result_1 = Object.create(null);
                Object.keys(value).forEach(function (key) {
                    result_1[key] = _this.resolve(root, value[key]);
                });
                return result_1;
            }
            return value;
        };
        ConfigurationResolverService.prototype.resolveAny = function (root, value) {
            var _this = this;
            if (types.isString(value)) {
                return this.resolver.resolve(root, value);
            }
            else if (types.isArray(value)) {
                return value.map(function (s) { return _this.resolveAny(root, s); });
            }
            else if (types.isObject(value)) {
                var result_2 = Object.create(null);
                Object.keys(value).forEach(function (key) {
                    result_2[key] = _this.resolveAny(root, value[key]);
                });
                return result_2;
            }
            return value;
        };
        /**
         * Resolve all interactive variables in configuration #6569
         */
        ConfigurationResolverService.prototype.resolveInteractiveVariables = function (configuration, interactiveVariablesMap) {
            var _this = this;
            if (!configuration) {
                return winjs_base_1.TPromise.as(null);
            }
            // We need a map from interactive variables to keys because we only want to trigger an command once per key -
            // even though it might occur multiple times in configuration #7026.
            var interactiveVariablesToSubstitutes = Object.create(null);
            var findInteractiveVariables = function (object) {
                Object.keys(object).forEach(function (key) {
                    if (object[key] && typeof object[key] === 'object') {
                        findInteractiveVariables(object[key]);
                    }
                    else if (typeof object[key] === 'string') {
                        var matches = /\${command:(.+)}/.exec(object[key]);
                        if (matches && matches.length === 2) {
                            var interactiveVariable = matches[1];
                            if (!interactiveVariablesToSubstitutes[interactiveVariable]) {
                                interactiveVariablesToSubstitutes[interactiveVariable] = [];
                            }
                            interactiveVariablesToSubstitutes[interactiveVariable].push({ object: object, key: key });
                        }
                    }
                });
            };
            findInteractiveVariables(configuration);
            var substitionCanceled = false;
            var factory = Object.keys(interactiveVariablesToSubstitutes).map(function (interactiveVariable) {
                return function () {
                    var commandId = null;
                    commandId = interactiveVariablesMap ? interactiveVariablesMap[interactiveVariable] : null;
                    if (!commandId) {
                        // Just launch any command if the interactive variable is not contributed by the adapter #12735
                        commandId = interactiveVariable;
                    }
                    return _this.commandService.executeCommand(commandId, configuration).then(function (result) {
                        if (result) {
                            interactiveVariablesToSubstitutes[interactiveVariable].forEach(function (substitute) {
                                if (substitute.object[substitute.key].indexOf("${command:" + interactiveVariable + "}") >= 0) {
                                    substitute.object[substitute.key] = substitute.object[substitute.key].replace("${command:" + interactiveVariable + "}", result);
                                }
                            });
                        }
                        else {
                            substitionCanceled = true;
                        }
                    });
                };
            });
            return async_1.sequence(factory).then(function () { return substitionCanceled ? null : configuration; });
        };
        ConfigurationResolverService = __decorate([
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, commands_1.ICommandService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], ConfigurationResolverService);
        return ConfigurationResolverService;
    }());
    exports.ConfigurationResolverService = ConfigurationResolverService;
});
