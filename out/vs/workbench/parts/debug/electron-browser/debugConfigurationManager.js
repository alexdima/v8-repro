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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/common/strings", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/paths", "vs/platform/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/extensions/common/extensionsRegistry", "vs/platform/registry/common/platform", "vs/platform/extensions/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/parts/debug/node/debugAdapter", "vs/workbench/services/editor/common/editorService", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/editor/browser/editorBrowser", "vs/workbench/services/configuration/common/configuration", "vs/workbench/parts/preferences/common/preferences"], function (require, exports, nls, lifecycle_1, event_1, winjs_base_1, strings, arrays_1, platform_1, objects, uri_1, paths, lifecycle_2, storage_1, extensionsRegistry, platform_2, extensions_1, jsonContributionRegistry_1, configuration_1, files_1, workspace_1, instantiation_1, commands_1, debugAdapter_1, editorService_1, quickOpen_1, configurationResolver_1, editorBrowser_1, configuration_2, preferences_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // debuggers extension point
    exports.debuggersExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint('debuggers', [], {
        description: nls.localize('vscode.extension.contributes.debuggers', 'Contributes debug adapters.'),
        type: 'array',
        defaultSnippets: [{ body: [{ type: '', extensions: [] }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { type: '', program: '', runtime: '', enableBreakpointsFor: { languageIds: [''] } } }],
            properties: {
                type: {
                    description: nls.localize('vscode.extension.contributes.debuggers.type', "Unique identifier for this debug adapter."),
                    type: 'string'
                },
                label: {
                    description: nls.localize('vscode.extension.contributes.debuggers.label', "Display name for this debug adapter."),
                    type: 'string'
                },
                program: {
                    description: nls.localize('vscode.extension.contributes.debuggers.program', "Path to the debug adapter program. Path is either absolute or relative to the extension folder."),
                    type: 'string'
                },
                args: {
                    description: nls.localize('vscode.extension.contributes.debuggers.args', "Optional arguments to pass to the adapter."),
                    type: 'array'
                },
                runtime: {
                    description: nls.localize('vscode.extension.contributes.debuggers.runtime', "Optional runtime in case the program attribute is not an executable but requires a runtime."),
                    type: 'string'
                },
                runtimeArgs: {
                    description: nls.localize('vscode.extension.contributes.debuggers.runtimeArgs', "Optional runtime arguments."),
                    type: 'array'
                },
                variables: {
                    description: nls.localize('vscode.extension.contributes.debuggers.variables', "Mapping from interactive variables (e.g ${action.pickProcess}) in `launch.json` to a command."),
                    type: 'object'
                },
                initialConfigurations: {
                    description: nls.localize('vscode.extension.contributes.debuggers.initialConfigurations', "Configurations for generating the initial \'launch.json\'."),
                    type: ['array', 'string'],
                },
                languages: {
                    description: nls.localize('vscode.extension.contributes.debuggers.languages', "List of languages for which the debug extension could be considered the \"default debugger\"."),
                    type: 'array'
                },
                adapterExecutableCommand: {
                    description: nls.localize('vscode.extension.contributes.debuggers.adapterExecutableCommand', "If specified VS Code will call this command to determine the executable path of the debug adapter and the arguments to pass."),
                    type: 'string'
                },
                configurationSnippets: {
                    description: nls.localize('vscode.extension.contributes.debuggers.configurationSnippets', "Snippets for adding new configurations in \'launch.json\'."),
                    type: 'array'
                },
                configurationAttributes: {
                    description: nls.localize('vscode.extension.contributes.debuggers.configurationAttributes', "JSON schema configurations for validating \'launch.json\'."),
                    type: 'object'
                },
                windows: {
                    description: nls.localize('vscode.extension.contributes.debuggers.windows', "Windows specific settings."),
                    type: 'object',
                    properties: {
                        runtime: {
                            description: nls.localize('vscode.extension.contributes.debuggers.windows.runtime', "Runtime used for Windows."),
                            type: 'string'
                        }
                    }
                },
                osx: {
                    description: nls.localize('vscode.extension.contributes.debuggers.osx', "macOS specific settings."),
                    type: 'object',
                    properties: {
                        runtime: {
                            description: nls.localize('vscode.extension.contributes.debuggers.osx.runtime', "Runtime used for macOS."),
                            type: 'string'
                        }
                    }
                },
                linux: {
                    description: nls.localize('vscode.extension.contributes.debuggers.linux', "Linux specific settings."),
                    type: 'object',
                    properties: {
                        runtime: {
                            description: nls.localize('vscode.extension.contributes.debuggers.linux.runtime', "Runtime used for Linux."),
                            type: 'string'
                        }
                    }
                }
            }
        }
    });
    // breakpoints extension point #9037
    var breakpointsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint('breakpoints', [], {
        description: nls.localize('vscode.extension.contributes.breakpoints', 'Contributes breakpoints.'),
        type: 'array',
        defaultSnippets: [{ body: [{ language: '' }] }],
        items: {
            type: 'object',
            defaultSnippets: [{ body: { language: '' } }],
            properties: {
                language: {
                    description: nls.localize('vscode.extension.contributes.breakpoints.language', "Allow breakpoints for this language."),
                    type: 'string'
                },
            }
        }
    });
    // debug general schema
    var defaultCompound = { name: 'Compound', configurations: [] };
    var schema = {
        id: configuration_2.launchSchemaId,
        type: 'object',
        title: nls.localize('app.launch.json.title', "Launch"),
        required: [],
        default: { version: '0.2.0', configurations: [], compounds: [] },
        properties: {
            version: {
                type: 'string',
                description: nls.localize('app.launch.json.version', "Version of this file format."),
                default: '0.2.0'
            },
            configurations: {
                type: 'array',
                description: nls.localize('app.launch.json.configurations', "List of configurations. Add new configurations or edit existing ones by using IntelliSense."),
                items: {
                    defaultSnippets: [],
                    'type': 'object',
                    oneOf: []
                }
            },
            compounds: {
                type: 'array',
                description: nls.localize('app.launch.json.compounds', "List of compounds. Each compound references multiple configurations which will get launched together."),
                items: {
                    type: 'object',
                    required: ['name', 'configurations'],
                    properties: {
                        name: {
                            type: 'string',
                            description: nls.localize('app.launch.json.compound.name', "Name of compound. Appears in the launch configuration drop down menu.")
                        },
                        configurations: {
                            type: 'array',
                            default: [],
                            items: {
                                oneOf: [{
                                        enum: [],
                                        description: nls.localize('useUniqueNames', "Please use unique configuration names.")
                                    }, {
                                        type: 'object',
                                        required: ['name'],
                                        properties: {
                                            name: {
                                                enum: [],
                                                description: nls.localize('app.launch.json.compound.name', "Name of compound. Appears in the launch configuration drop down menu.")
                                            },
                                            folder: {
                                                enum: [],
                                                description: nls.localize('app.launch.json.compound.folder', "Name of folder in which the compound is located.")
                                            }
                                        }
                                    }]
                            },
                            description: nls.localize('app.launch.json.compounds.configurations', "Names of configurations that will be started as part of this compound.")
                        }
                    },
                    default: defaultCompound
                },
                default: [
                    defaultCompound
                ]
            }
        }
    };
    var jsonRegistry = platform_2.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    jsonRegistry.registerSchema(configuration_2.launchSchemaId, schema);
    var DEBUG_SELECTED_CONFIG_NAME_KEY = 'debug.selectedconfigname';
    var DEBUG_SELECTED_ROOT = 'debug.selectedroot';
    var ConfigurationManager = /** @class */ (function () {
        function ConfigurationManager(contextService, editorService, configurationService, quickOpenService, instantiationService, commandService, storageService, lifecycleService, extensionService) {
            this.contextService = contextService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.quickOpenService = quickOpenService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.breakpointModeIdsSet = new Set();
            this._onDidSelectConfigurationName = new event_1.Emitter();
            this.providers = [];
            this.adapters = [];
            this.toDispose = [];
            this.registerListeners(lifecycleService);
            this.initLaunches();
            var previousSelectedRoot = this.storageService.get(DEBUG_SELECTED_ROOT, storage_1.StorageScope.WORKSPACE);
            var filtered = this.launches.filter(function (l) { return l.uri.toString() === previousSelectedRoot; });
            this.selectConfiguration(filtered.length ? filtered[0] : undefined, this.storageService.get(DEBUG_SELECTED_CONFIG_NAME_KEY, storage_1.StorageScope.WORKSPACE));
        }
        ConfigurationManager.prototype.registerDebugConfigurationProvider = function (handle, debugConfigurationProvider) {
            if (!debugConfigurationProvider) {
                return;
            }
            debugConfigurationProvider.handle = handle;
            this.providers = this.providers.filter(function (p) { return p.handle !== handle; });
            this.providers.push(debugConfigurationProvider);
            var adapter = this.getAdapter(debugConfigurationProvider.type);
            // Check if the provider contributes provideDebugConfigurations method
            if (adapter && debugConfigurationProvider.provideDebugConfigurations) {
                adapter.hasConfigurationProvider = true;
            }
        };
        ConfigurationManager.prototype.unregisterDebugConfigurationProvider = function (handle) {
            this.providers = this.providers.filter(function (p) { return p.handle !== handle; });
        };
        ConfigurationManager.prototype.resolveConfigurationByProviders = function (folderUri, type, debugConfiguration) {
            // pipe the config through the promises sequentially. append at the end the '*' types
            var providers = this.providers.filter(function (p) { return p.type === type && p.resolveDebugConfiguration; })
                .concat(this.providers.filter(function (p) { return p.type === '*' && p.resolveDebugConfiguration; }));
            return providers.reduce(function (promise, provider) {
                return promise.then(function (config) {
                    if (config) {
                        return provider.resolveDebugConfiguration(folderUri, config);
                    }
                    else {
                        return Promise.resolve(config);
                    }
                });
            }, winjs_base_1.TPromise.as(debugConfiguration));
        };
        ConfigurationManager.prototype.provideDebugConfigurations = function (folderUri, type) {
            return winjs_base_1.TPromise.join(this.providers.filter(function (p) { return p.type === type && p.provideDebugConfigurations; }).map(function (p) { return p.provideDebugConfigurations(folderUri); }))
                .then(function (results) { return results.reduce(function (first, second) { return first.concat(second); }, []); });
        };
        ConfigurationManager.prototype.debugAdapterExecutable = function (folderUri, type) {
            var providers = this.providers.filter(function (p) { return p.type === type && p.debugAdapterExecutable; });
            if (providers.length === 1) {
                return providers[0].debugAdapterExecutable(folderUri);
            }
            return winjs_base_1.TPromise.as(undefined);
        };
        ConfigurationManager.prototype.registerListeners = function (lifecycleService) {
            var _this = this;
            exports.debuggersExtPoint.setHandler(function (extensions) {
                extensions.forEach(function (extension) {
                    extension.value.forEach(function (rawAdapter) {
                        if (!rawAdapter.type || (typeof rawAdapter.type !== 'string')) {
                            extension.collector.error(nls.localize('debugNoType', "Debug adapter 'type' can not be omitted and must be of type 'string'."));
                        }
                        if (rawAdapter.enableBreakpointsFor) {
                            rawAdapter.enableBreakpointsFor.languageIds.forEach(function (modeId) {
                                _this.breakpointModeIdsSet.add(modeId);
                            });
                        }
                        var duplicate = _this.adapters.filter(function (a) { return a.type === rawAdapter.type; }).pop();
                        if (duplicate) {
                            duplicate.merge(rawAdapter, extension.description);
                        }
                        else {
                            _this.adapters.push(new debugAdapter_1.Adapter(_this, rawAdapter, extension.description, _this.configurationService, _this.commandService));
                        }
                    });
                });
                // update the schema to include all attributes, snippets and types from extensions.
                _this.adapters.forEach(function (adapter) {
                    var items = schema.properties['configurations'].items;
                    var schemaAttributes = adapter.getSchemaAttributes();
                    if (schemaAttributes) {
                        (_a = items.oneOf).push.apply(_a, schemaAttributes);
                    }
                    var configurationSnippets = adapter.configurationSnippets;
                    if (configurationSnippets) {
                        (_b = items.defaultSnippets).push.apply(_b, configurationSnippets);
                    }
                    var _a, _b;
                });
                _this.setCompoundSchemaValues();
            });
            breakpointsExtPoint.setHandler(function (extensions) {
                extensions.forEach(function (ext) {
                    ext.value.forEach(function (breakpoints) {
                        _this.breakpointModeIdsSet.add(breakpoints.language);
                    });
                });
            });
            this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(function () {
                _this.initLaunches();
                _this.selectConfiguration();
                _this.setCompoundSchemaValues();
            }));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('launch')) {
                    _this.selectConfiguration();
                    _this.setCompoundSchemaValues();
                }
            }));
            this.toDispose.push(lifecycleService.onShutdown(this.store, this));
        };
        ConfigurationManager.prototype.initLaunches = function () {
            var _this = this;
            this.launches = this.contextService.getWorkspace().folders.map(function (folder) { return _this.instantiationService.createInstance(Launch, _this, folder); });
            this.launches.push(this.instantiationService.createInstance(UserLaunch, this));
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                this.launches.push(this.instantiationService.createInstance(WorkspaceLaunch, this));
            }
            if (this.launches.indexOf(this.selectedLaunch) === -1) {
                this.selectedLaunch = undefined;
            }
        };
        ConfigurationManager.prototype.setCompoundSchemaValues = function () {
            var compoundConfigurationsSchema = schema.properties['compounds'].items.properties['configurations'];
            var launchNames = this.launches.map(function (l) {
                return l.getConfigurationNames(false);
            }).reduce(function (first, second) { return first.concat(second); }, []);
            compoundConfigurationsSchema.items.oneOf[0].enum = launchNames;
            compoundConfigurationsSchema.items.oneOf[1].properties.name.enum = launchNames;
            var folderNames = this.contextService.getWorkspace().folders.map(function (f) { return f.name; });
            compoundConfigurationsSchema.items.oneOf[1].properties.folder.enum = folderNames;
            jsonRegistry.registerSchema(configuration_2.launchSchemaId, schema);
        };
        ConfigurationManager.prototype.getLaunches = function () {
            return this.launches;
        };
        ConfigurationManager.prototype.getLaunch = function (workspaceUri) {
            if (!uri_1.default.isUri(workspaceUri)) {
                return undefined;
            }
            return this.launches.filter(function (l) { return l.workspace && l.workspace.uri.toString() === workspaceUri.toString(); }).pop();
        };
        Object.defineProperty(ConfigurationManager.prototype, "selectedConfiguration", {
            get: function () {
                return {
                    launch: this.selectedLaunch,
                    name: this.selectedName
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConfigurationManager.prototype, "onDidSelectConfiguration", {
            get: function () {
                return this._onDidSelectConfigurationName.event;
            },
            enumerable: true,
            configurable: true
        });
        ConfigurationManager.prototype.getWorkspaceLaunch = function () {
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                return this.launches[this.launches.length - 1];
            }
            return undefined;
        };
        ConfigurationManager.prototype.selectConfiguration = function (launch, name, debugStarted) {
            var previousLaunch = this.selectedLaunch;
            var previousName = this.selectedName;
            if (!launch) {
                launch = this.selectedLaunch && this.selectedLaunch.getConfigurationNames().length ? this.selectedLaunch : arrays_1.first(this.launches, function (l) { return !!l.getConfigurationNames().length; }, this.launches.length ? this.launches[0] : undefined);
            }
            this.selectedLaunch = launch;
            var names = launch ? launch.getConfigurationNames() : [];
            if (name && names.indexOf(name) >= 0) {
                this.selectedName = name;
            }
            if (names.indexOf(this.selectedName) === -1) {
                this.selectedName = names.length ? names[0] : undefined;
            }
            if (this.selectedLaunch !== previousLaunch || this.selectedName !== previousName) {
                this._onDidSelectConfigurationName.fire();
            }
        };
        ConfigurationManager.prototype.canSetBreakpointsIn = function (model) {
            var modeId = model ? model.getLanguageIdentifier().language : null;
            if (!modeId || modeId === 'jsonc' || modeId === 'log') {
                // do not allow breakpoints in our settings files and output
                return false;
            }
            if (this.configurationService.getValue('debug').allowBreakpointsEverywhere) {
                return true;
            }
            return this.breakpointModeIdsSet.has(modeId);
        };
        ConfigurationManager.prototype.getAdapter = function (type) {
            return this.adapters.filter(function (adapter) { return strings.equalsIgnoreCase(adapter.type, type); }).pop();
        };
        ConfigurationManager.prototype.guessAdapter = function (type) {
            var _this = this;
            return this.extensionService.activateByEvent('onDebugInitialConfigurations').then(function () { return _this.extensionService.activateByEvent('onDebug').then(function () {
                if (type) {
                    var adapter = _this.getAdapter(type);
                    return winjs_base_1.TPromise.as(adapter);
                }
                var editor = _this.editorService.getActiveEditor();
                var candidates;
                if (editor) {
                    var codeEditor = editor.getControl();
                    if (editorBrowser_1.isCodeEditor(codeEditor)) {
                        var model = codeEditor.getModel();
                        var language_1 = model ? model.getLanguageIdentifier().language : undefined;
                        var adapters = _this.adapters.filter(function (a) { return a.languages && a.languages.indexOf(language_1) >= 0; });
                        if (adapters.length === 1) {
                            return winjs_base_1.TPromise.as(adapters[0]);
                        }
                        if (adapters.length > 1) {
                            candidates = adapters;
                        }
                    }
                }
                if (!candidates) {
                    candidates = _this.adapters.filter(function (a) { return a.hasInitialConfiguration() || a.hasConfigurationProvider; });
                }
                return _this.quickOpenService.pick(candidates.concat([{ label: 'More...', separator: { border: true } }]), { placeHolder: nls.localize('selectDebug', "Select Environment") })
                    .then(function (picked) {
                    if (picked instanceof debugAdapter_1.Adapter) {
                        return picked;
                    }
                    if (picked) {
                        _this.commandService.executeCommand('debug.installAdditionalDebuggers');
                    }
                    return undefined;
                });
            }); });
        };
        ConfigurationManager.prototype.store = function () {
            this.storageService.store(DEBUG_SELECTED_CONFIG_NAME_KEY, this.selectedName, storage_1.StorageScope.WORKSPACE);
            if (this.selectedLaunch) {
                this.storageService.store(DEBUG_SELECTED_ROOT, this.selectedLaunch.uri.toString(), storage_1.StorageScope.WORKSPACE);
            }
        };
        ConfigurationManager.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        ConfigurationManager = __decorate([
            __param(0, workspace_1.IWorkspaceContextService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, configuration_1.IConfigurationService),
            __param(3, quickOpen_1.IQuickOpenService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, commands_1.ICommandService),
            __param(6, storage_1.IStorageService),
            __param(7, lifecycle_2.ILifecycleService),
            __param(8, extensions_1.IExtensionService)
        ], ConfigurationManager);
        return ConfigurationManager;
    }());
    exports.ConfigurationManager = ConfigurationManager;
    var Launch = /** @class */ (function () {
        function Launch(configurationManager, workspace, fileService, editorService, configurationService, configurationResolverService) {
            this.configurationManager = configurationManager;
            this.workspace = workspace;
            this.fileService = fileService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.configurationResolverService = configurationResolverService;
            // noop
        }
        Object.defineProperty(Launch.prototype, "uri", {
            get: function () {
                return this.workspace.uri.with({ path: paths.join(this.workspace.uri.path, '/.vscode/launch.json') });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Launch.prototype, "name", {
            get: function () {
                return this.workspace.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Launch.prototype, "hidden", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Launch.prototype.getConfig = function () {
            return this.configurationService.inspect('launch', { resource: this.workspace.uri }).workspaceFolder;
        };
        Launch.prototype.getCompound = function (name) {
            var config = this.getConfig();
            if (!config || !config.compounds) {
                return null;
            }
            return config.compounds.filter(function (compound) { return compound.name === name; }).pop();
        };
        Launch.prototype.getConfigurationNames = function (includeCompounds) {
            if (includeCompounds === void 0) { includeCompounds = true; }
            var config = this.getConfig();
            if (!config || !config.configurations || !Array.isArray(config.configurations)) {
                return [];
            }
            else {
                var names = config.configurations.filter(function (cfg) { return cfg && typeof cfg.name === 'string'; }).map(function (cfg) { return cfg.name; });
                if (includeCompounds && config.compounds) {
                    if (config.compounds) {
                        names.push.apply(names, config.compounds.filter(function (compound) { return typeof compound.name === 'string' && compound.configurations && compound.configurations.length; })
                            .map(function (compound) { return compound.name; }));
                    }
                }
                return names;
            }
        };
        Launch.prototype.getConfiguration = function (name) {
            // We need to clone the configuration in order to be able to make changes to it #42198
            var config = objects.deepClone(this.getConfig());
            if (!config || !config.configurations) {
                return null;
            }
            return config.configurations.filter(function (config) { return config && config.name === name; }).shift();
        };
        Launch.prototype.resolveConfiguration = function (config) {
            var _this = this;
            var result = objects.deepClone(config);
            // Set operating system specific properties #1873
            var setOSProperties = function (flag, osConfig) {
                if (flag && osConfig) {
                    Object.keys(osConfig).forEach(function (key) {
                        result[key] = osConfig[key];
                    });
                }
            };
            setOSProperties(platform_1.isWindows, result.windows);
            setOSProperties(platform_1.isMacintosh, result.osx);
            setOSProperties(platform_1.isLinux, result.linux);
            // massage configuration attributes - append workspace path to relatvie paths, substitute variables in paths.
            Object.keys(result).forEach(function (key) {
                result[key] = _this.configurationResolverService.resolveAny(_this.workspace, result[key]);
            });
            var adapter = this.configurationManager.getAdapter(result.type);
            return this.configurationResolverService.resolveInteractiveVariables(result, adapter ? adapter.variables : null);
        };
        Launch.prototype.openConfigFile = function (sideBySide, type) {
            var _this = this;
            var resource = this.uri;
            var pinned = false;
            return this.fileService.resolveContent(resource).then(function (content) { return content.value; }, function (err) {
                // launch.json not found: create one by collecting launch configs from debugConfigProviders
                return _this.configurationManager.guessAdapter(type).then(function (adapter) {
                    if (adapter) {
                        return _this.configurationManager.provideDebugConfigurations(_this.workspace.uri, adapter.type).then(function (initialConfigs) {
                            return adapter.getInitialConfigurationContent(initialConfigs);
                        });
                    }
                    else {
                        return undefined;
                    }
                }).then(function (content) {
                    if (!content) {
                        return undefined;
                    }
                    pinned = true; // pin only if config file is created #8727
                    return _this.fileService.updateContent(resource, content).then(function () {
                        // convert string into IContent; see #32135
                        return content;
                    });
                });
            }).then(function (content) {
                if (!content) {
                    return undefined;
                }
                var index = content.indexOf("\"" + _this.configurationManager.selectedConfiguration.name + "\"");
                var startLineNumber = 1;
                for (var i = 0; i < index; i++) {
                    if (content.charAt(i) === '\n') {
                        startLineNumber++;
                    }
                }
                var selection = startLineNumber > 1 ? { startLineNumber: startLineNumber, startColumn: 4 } : undefined;
                return _this.editorService.openEditor({
                    resource: resource,
                    options: {
                        forceOpen: true,
                        selection: selection,
                        pinned: pinned,
                        revealIfVisible: true
                    },
                }, sideBySide);
            }, function (error) {
                throw new Error(nls.localize('DebugConfig.failed', "Unable to create 'launch.json' file inside the '.vscode' folder ({0}).", error));
            });
        };
        Launch = __decorate([
            __param(2, files_1.IFileService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, configurationResolver_1.IConfigurationResolverService)
        ], Launch);
        return Launch;
    }());
    var WorkspaceLaunch = /** @class */ (function (_super) {
        __extends(WorkspaceLaunch, _super);
        function WorkspaceLaunch(configurationManager, fileService, editorService, configurationService, configurationResolverService, workspaceContextService) {
            var _this = _super.call(this, configurationManager, undefined, fileService, editorService, configurationService, configurationResolverService) || this;
            _this.workspaceContextService = workspaceContextService;
            return _this;
        }
        Object.defineProperty(WorkspaceLaunch.prototype, "uri", {
            get: function () {
                return this.workspaceContextService.getWorkspace().configuration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkspaceLaunch.prototype, "name", {
            get: function () {
                return nls.localize('workspace', "workspace");
            },
            enumerable: true,
            configurable: true
        });
        WorkspaceLaunch.prototype.getConfig = function () {
            return this.configurationService.inspect('launch').workspace;
        };
        WorkspaceLaunch.prototype.openConfigFile = function (sideBySide, type) {
            return this.editorService.openEditor({ resource: this.workspaceContextService.getWorkspace().configuration });
        };
        WorkspaceLaunch = __decorate([
            __param(1, files_1.IFileService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, configurationResolver_1.IConfigurationResolverService),
            __param(5, workspace_1.IWorkspaceContextService)
        ], WorkspaceLaunch);
        return WorkspaceLaunch;
    }(Launch));
    var UserLaunch = /** @class */ (function (_super) {
        __extends(UserLaunch, _super);
        function UserLaunch(configurationManager, fileService, editorService, configurationService, configurationResolverService, preferencesService) {
            var _this = _super.call(this, configurationManager, undefined, fileService, editorService, configurationService, configurationResolverService) || this;
            _this.preferencesService = preferencesService;
            return _this;
        }
        Object.defineProperty(UserLaunch.prototype, "uri", {
            get: function () {
                return this.preferencesService.userSettingsResource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserLaunch.prototype, "name", {
            get: function () {
                return nls.localize('user settings', "user settings");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserLaunch.prototype, "hidden", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        UserLaunch.prototype.getConfig = function () {
            return this.configurationService.inspect('launch').user;
        };
        UserLaunch.prototype.openConfigFile = function (sideBySide, type) {
            return this.preferencesService.openGlobalSettings();
        };
        UserLaunch = __decorate([
            __param(1, files_1.IFileService),
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, configuration_1.IConfigurationService),
            __param(4, configurationResolver_1.IConfigurationResolverService),
            __param(5, preferences_1.IPreferencesService)
        ], UserLaunch);
        return UserLaunch;
    }(Launch));
});
