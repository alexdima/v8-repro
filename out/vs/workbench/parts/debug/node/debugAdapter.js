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
define(["require", "exports", "fs", "path", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/strings", "vs/base/common/objects", "vs/base/common/paths", "vs/base/common/platform", "vs/workbench/parts/debug/common/debug", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands"], function (require, exports, fs, path, nls, winjs_base_1, strings, objects, paths, platform, debug_1, configuration_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Adapter = /** @class */ (function () {
        function Adapter(configurationManager, rawAdapter, extensionDescription, configurationService, commandService) {
            this.configurationManager = configurationManager;
            this.rawAdapter = rawAdapter;
            this.extensionDescription = extensionDescription;
            this.configurationService = configurationService;
            this.commandService = commandService;
            this.hasConfigurationProvider = false;
            if (rawAdapter.windows) {
                rawAdapter.win = rawAdapter.windows;
            }
        }
        Adapter.prototype.getAdapterExecutable = function (root, verifyAgainstFS) {
            var _this = this;
            if (verifyAgainstFS === void 0) { verifyAgainstFS = true; }
            return this.configurationManager.debugAdapterExecutable(root ? root.uri : undefined, this.rawAdapter.type).then(function (adapterExecutable) {
                if (adapterExecutable) {
                    return _this.verifyAdapterDetails(adapterExecutable, verifyAgainstFS);
                }
                // try deprecated command based extension API
                if (_this.rawAdapter.adapterExecutableCommand && root) {
                    return _this.commandService.executeCommand(_this.rawAdapter.adapterExecutableCommand, root.uri.toString()).then(function (ad) {
                        return _this.verifyAdapterDetails(ad, verifyAgainstFS);
                    });
                }
                // fallback: executable contribution specified in package.json
                adapterExecutable = {
                    command: _this.getProgram(),
                    args: _this.getAttributeBasedOnPlatform('args')
                };
                var runtime = _this.getRuntime();
                if (runtime) {
                    var runtimeArgs = _this.getAttributeBasedOnPlatform('runtimeArgs');
                    adapterExecutable.args = (runtimeArgs || []).concat([adapterExecutable.command]).concat(adapterExecutable.args || []);
                    adapterExecutable.command = runtime;
                }
                return _this.verifyAdapterDetails(adapterExecutable, verifyAgainstFS);
            });
        };
        Adapter.prototype.verifyAdapterDetails = function (details, verifyAgainstFS) {
            if (details.command) {
                if (verifyAgainstFS) {
                    if (path.isAbsolute(details.command)) {
                        return new winjs_base_1.TPromise(function (c, e) {
                            fs.exists(details.command, function (exists) {
                                if (exists) {
                                    c(details);
                                }
                                else {
                                    e(new Error(nls.localize('debugAdapterBinNotFound', "Debug adapter executable '{0}' does not exist.", details.command)));
                                }
                            });
                        });
                    }
                    else {
                        // relative path
                        if (details.command.indexOf('/') < 0 && details.command.indexOf('\\') < 0) {
                            // no separators: command looks like a runtime name like 'node' or 'mono'
                            return winjs_base_1.TPromise.as(details); // TODO: check that the runtime is available on PATH
                        }
                    }
                }
                else {
                    return winjs_base_1.TPromise.as(details);
                }
            }
            return winjs_base_1.TPromise.wrapError(new Error(nls.localize({ key: 'debugAdapterCannotDetermineExecutable', comment: ['Adapter executable file not found'] }, "Cannot determine executable for debug adapter '{0}'.", this.type)));
        };
        Adapter.prototype.getRuntime = function () {
            var runtime = this.getAttributeBasedOnPlatform('runtime');
            if (runtime && runtime.indexOf('./') === 0) {
                runtime = paths.join(this.extensionDescription.extensionFolderPath, runtime);
            }
            return runtime;
        };
        Adapter.prototype.getProgram = function () {
            var program = this.getAttributeBasedOnPlatform('program');
            if (program) {
                program = paths.join(this.extensionDescription.extensionFolderPath, program);
            }
            return program;
        };
        Object.defineProperty(Adapter.prototype, "aiKey", {
            get: function () {
                return this.rawAdapter.aiKey;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Adapter.prototype, "label", {
            get: function () {
                return this.rawAdapter.label || this.rawAdapter.type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Adapter.prototype, "type", {
            get: function () {
                return this.rawAdapter.type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Adapter.prototype, "variables", {
            get: function () {
                return this.rawAdapter.variables;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Adapter.prototype, "configurationSnippets", {
            get: function () {
                return this.rawAdapter.configurationSnippets;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Adapter.prototype, "languages", {
            get: function () {
                return this.rawAdapter.languages;
            },
            enumerable: true,
            configurable: true
        });
        Adapter.prototype.merge = function (secondRawAdapter, extensionDescription) {
            // Give priority to built in debug adapters
            if (extensionDescription.isBuiltin) {
                this.extensionDescription = extensionDescription;
            }
            objects.mixin(this.rawAdapter, secondRawAdapter, extensionDescription.isBuiltin);
        };
        Adapter.prototype.hasInitialConfiguration = function () {
            return !!this.rawAdapter.initialConfigurations;
        };
        Adapter.prototype.getInitialConfigurationContent = function (initialConfigs) {
            // at this point we got some configs from the package.json and/or from registered DebugConfigurationProviders
            var initialConfigurations = this.rawAdapter.initialConfigurations || [];
            if (initialConfigs) {
                initialConfigurations = initialConfigurations.concat(initialConfigs);
            }
            var configs = JSON.stringify(initialConfigurations, null, '\t').split('\n').map(function (line) { return '\t' + line; }).join('\n').trim();
            var comment1 = nls.localize('launch.config.comment1', "Use IntelliSense to learn about possible attributes.");
            var comment2 = nls.localize('launch.config.comment2', "Hover to view descriptions of existing attributes.");
            var comment3 = nls.localize('launch.config.comment3', "For more information, visit: {0}", 'https://go.microsoft.com/fwlink/?linkid=830387');
            var content = [
                '{',
                "\t// " + comment1,
                "\t// " + comment2,
                "\t// " + comment3,
                "\t\"version\": \"0.2.0\",",
                "\t\"configurations\": " + configs,
                '}'
            ].join('\n');
            // fix formatting
            var editorConfig = this.configurationService.getValue();
            if (editorConfig.editor && editorConfig.editor.insertSpaces) {
                content = content.replace(new RegExp('\t', 'g'), strings.repeat(' ', editorConfig.editor.tabSize));
            }
            return winjs_base_1.TPromise.as(content);
        };
        Adapter.prototype.getSchemaAttributes = function () {
            var _this = this;
            if (!this.rawAdapter.configurationAttributes) {
                return null;
            }
            // fill in the default configuration attributes shared by all adapters.
            return Object.keys(this.rawAdapter.configurationAttributes).map(function (request) {
                var attributes = _this.rawAdapter.configurationAttributes[request];
                var defaultRequired = ['name', 'type', 'request'];
                attributes.required = attributes.required && attributes.required.length ? defaultRequired.concat(attributes.required) : defaultRequired;
                attributes.additionalProperties = false;
                attributes.type = 'object';
                if (!attributes.properties) {
                    attributes.properties = {};
                }
                var properties = attributes.properties;
                properties['type'] = {
                    enum: [_this.type],
                    description: nls.localize('debugType', "Type of configuration."),
                    pattern: '^(?!node2)',
                    errorMessage: nls.localize('debugTypeNotRecognised', "The debug type is not recognized. Make sure that you have a corresponding debug extension installed and that it is enabled."),
                    patternErrorMessage: nls.localize('node2NotSupported', "\"node2\" is no longer supported, use \"node\" instead and set the \"protocol\" attribute to \"inspector\".")
                };
                properties['name'] = {
                    type: 'string',
                    description: nls.localize('debugName', "Name of configuration; appears in the launch configuration drop down menu."),
                    default: 'Launch'
                };
                properties['request'] = {
                    enum: [request],
                    description: nls.localize('debugRequest', "Request type of configuration. Can be \"launch\" or \"attach\"."),
                };
                properties['debugServer'] = {
                    type: 'number',
                    description: nls.localize('debugServer', "For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode"),
                    default: 4711
                };
                properties['preLaunchTask'] = {
                    type: ['string', 'null'],
                    default: null,
                    description: nls.localize('debugPrelaunchTask', "Task to run before debug session starts.")
                };
                properties['internalConsoleOptions'] = debug_1.INTERNAL_CONSOLE_OPTIONS_SCHEMA;
                var osProperties = objects.deepClone(properties);
                properties['windows'] = {
                    type: 'object',
                    description: nls.localize('debugWindowsConfiguration', "Windows specific launch configuration attributes."),
                    properties: osProperties
                };
                properties['osx'] = {
                    type: 'object',
                    description: nls.localize('debugOSXConfiguration', "OS X specific launch configuration attributes."),
                    properties: osProperties
                };
                properties['linux'] = {
                    type: 'object',
                    description: nls.localize('debugLinuxConfiguration', "Linux specific launch configuration attributes."),
                    properties: osProperties
                };
                Object.keys(attributes.properties).forEach(function (name) {
                    // Use schema allOf property to get independent error reporting #21113
                    attributes.properties[name].pattern = attributes.properties[name].pattern || '^(?!.*\\$\\{(env|config|command)\\.)';
                    attributes.properties[name].patternErrorMessage = attributes.properties[name].patternErrorMessage ||
                        nls.localize('deprecatedVariables', "'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead.");
                });
                return attributes;
            });
        };
        Adapter.prototype.getAttributeBasedOnPlatform = function (key) {
            var result;
            if (platform.isWindows && !process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432') && this.rawAdapter.winx86) {
                result = this.rawAdapter.winx86[key];
            }
            else if (platform.isWindows && this.rawAdapter.win) {
                result = this.rawAdapter.win[key];
            }
            else if (platform.isMacintosh && this.rawAdapter.osx) {
                result = this.rawAdapter.osx[key];
            }
            else if (platform.isLinux && this.rawAdapter.linux) {
                result = this.rawAdapter.linux[key];
            }
            return result || this.rawAdapter[key];
        };
        Adapter = __decorate([
            __param(3, configuration_1.IConfigurationService),
            __param(4, commands_1.ICommandService)
        ], Adapter);
        return Adapter;
    }());
    exports.Adapter = Adapter;
});
