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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/winjs.base", "path", "vs/base/common/assert", "vs/base/common/event", "vs/base/common/map", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/node/pfs", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configuration", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "crypto", "vs/platform/workspaces/common/workspaces", "vs/platform/extensions/common/extensions", "vs/platform/commands/common/commands", "vs/platform/node/product", "vs/workbench/services/configuration/node/configurationEditingService", "vs/workbench/services/configuration/node/configuration", "vs/workbench/services/configuration/node/jsonEditingService", "vs/base/common/network", "vs/platform/workspaces/node/workspaces", "vs/base/common/arrays", "vs/platform/configuration/node/configuration", "vs/base/common/labels"], function (require, exports, uri_1, winjs_base_1, path_1, assert, event_1, map_1, objects_1, lifecycle_1, async_1, pfs_1, jsonContributionRegistry_1, workspace_1, platform_1, environment_1, configurationModels_1, configuration_1, configurationModels_2, configuration_2, platform_2, configurationRegistry_1, crypto_1, workspaces_1, extensions_1, commands_1, product_1, configurationEditingService_1, configuration_3, jsonEditingService_1, network_1, workspaces_2, arrays_1, configuration_4, labels_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkspaceService = /** @class */ (function (_super) {
        __extends(WorkspaceService, _super);
        function WorkspaceService(environmentService, workspaceSettingsRootFolder) {
            if (workspaceSettingsRootFolder === void 0) { workspaceSettingsRootFolder = configuration_2.FOLDER_CONFIG_FOLDER_NAME; }
            var _this = _super.call(this) || this;
            _this.environmentService = environmentService;
            _this.workspaceSettingsRootFolder = workspaceSettingsRootFolder;
            _this._onDidChangeConfiguration = _this._register(new event_1.Emitter());
            _this.onDidChangeConfiguration = _this._onDidChangeConfiguration.event;
            _this._onDidChangeWorkspaceFolders = _this._register(new event_1.Emitter());
            _this.onDidChangeWorkspaceFolders = _this._onDidChangeWorkspaceFolders.event;
            _this._onDidChangeWorkspaceName = _this._register(new event_1.Emitter());
            _this.onDidChangeWorkspaceName = _this._onDidChangeWorkspaceName.event;
            _this._onDidChangeWorkbenchState = _this._register(new event_1.Emitter());
            _this.onDidChangeWorkbenchState = _this._onDidChangeWorkbenchState.event;
            _this.defaultConfiguration = new configurationModels_1.DefaultConfigurationModel();
            _this.userConfiguration = _this._register(new configuration_4.UserConfiguration(environmentService.appSettingsPath));
            _this.workspaceConfiguration = _this._register(new configuration_3.WorkspaceConfiguration());
            _this._register(_this.userConfiguration.onDidChangeConfiguration(function () { return _this.onUserConfigurationChanged(); }));
            _this._register(_this.workspaceConfiguration.onDidUpdateConfiguration(function () { return _this.onWorkspaceConfigurationChanged(); }));
            _this._register(platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidRegisterConfiguration(function (e) { return _this.registerConfigurationSchemas(); }));
            _this._register(platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidRegisterConfiguration(function (configurationProperties) { return _this.onDefaultConfigurationChanged(configurationProperties); }));
            _this.workspaceEditingQueue = new async_1.Queue();
            return _this;
        }
        // Workspace Context Service Impl
        WorkspaceService.prototype.getWorkspace = function () {
            return this.workspace;
        };
        WorkspaceService.prototype.getWorkbenchState = function () {
            // Workspace has configuration file
            if (this.workspace.configuration) {
                return workspace_1.WorkbenchState.WORKSPACE;
            }
            // Folder has single root
            if (this.workspace.folders.length === 1) {
                return workspace_1.WorkbenchState.FOLDER;
            }
            // Empty
            return workspace_1.WorkbenchState.EMPTY;
        };
        WorkspaceService.prototype.getWorkspaceFolder = function (resource) {
            return this.workspace.getFolder(resource);
        };
        WorkspaceService.prototype.addFolders = function (foldersToAdd, index) {
            return this.updateFolders(foldersToAdd, [], index);
        };
        WorkspaceService.prototype.removeFolders = function (foldersToRemove) {
            return this.updateFolders([], foldersToRemove);
        };
        WorkspaceService.prototype.updateFolders = function (foldersToAdd, foldersToRemove, index) {
            var _this = this;
            assert.ok(this.jsonEditingService, 'Workbench is not initialized yet');
            return this.workspaceEditingQueue.queue(function () { return _this.doUpdateFolders(foldersToAdd, foldersToRemove, index); });
        };
        WorkspaceService.prototype.isInsideWorkspace = function (resource) {
            return !!this.getWorkspaceFolder(resource);
        };
        WorkspaceService.prototype.isCurrentWorkspace = function (workspaceIdentifier) {
            switch (this.getWorkbenchState()) {
                case workspace_1.WorkbenchState.FOLDER:
                    return workspaces_1.isSingleFolderWorkspaceIdentifier(workspaceIdentifier) && this.pathEquals(this.workspace.folders[0].uri.fsPath, workspaceIdentifier);
                case workspace_1.WorkbenchState.WORKSPACE:
                    return workspaces_1.isWorkspaceIdentifier(workspaceIdentifier) && this.workspace.id === workspaceIdentifier.id;
            }
            return false;
        };
        WorkspaceService.prototype.doUpdateFolders = function (foldersToAdd, foldersToRemove, index) {
            var _this = this;
            if (this.getWorkbenchState() !== workspace_1.WorkbenchState.WORKSPACE) {
                return winjs_base_1.TPromise.as(void 0); // we need a workspace to begin with
            }
            if (foldersToAdd.length + foldersToRemove.length === 0) {
                return winjs_base_1.TPromise.as(void 0); // nothing to do
            }
            var foldersHaveChanged = false;
            // Remove first (if any)
            var currentWorkspaceFolders = this.getWorkspace().folders;
            var newStoredFolders = currentWorkspaceFolders.map(function (f) { return f.raw; }).filter(function (folder, index) {
                if (!workspaces_1.isStoredWorkspaceFolder(folder)) {
                    return true; // keep entries which are unrelated
                }
                return !_this.contains(foldersToRemove, currentWorkspaceFolders[index].uri); // keep entries which are unrelated
            });
            foldersHaveChanged = currentWorkspaceFolders.length !== newStoredFolders.length;
            // Add afterwards (if any)
            if (foldersToAdd.length) {
                // Recompute current workspace folders if we have folders to add
                var workspaceConfigFolder_1 = path_1.dirname(this.getWorkspace().configuration.fsPath);
                currentWorkspaceFolders = workspace_1.toWorkspaceFolders(newStoredFolders, uri_1.default.file(workspaceConfigFolder_1));
                var currentWorkspaceFolderUris_1 = currentWorkspaceFolders.map(function (folder) { return folder.uri; });
                var storedFoldersToAdd_1 = [];
                foldersToAdd.forEach(function (folderToAdd) {
                    if (_this.contains(currentWorkspaceFolderUris_1, folderToAdd.uri)) {
                        return; // already existing
                    }
                    var storedFolder;
                    // File resource: use "path" property
                    if (folderToAdd.uri.scheme === network_1.Schemas.file) {
                        storedFolder = {
                            path: workspaces_2.massageFolderPathForWorkspace(folderToAdd.uri.fsPath, workspaceConfigFolder_1, newStoredFolders)
                        };
                    }
                    else {
                        storedFolder = {
                            uri: folderToAdd.uri.toString(true)
                        };
                    }
                    if (folderToAdd.name) {
                        storedFolder.name = folderToAdd.name;
                    }
                    storedFoldersToAdd_1.push(storedFolder);
                });
                // Apply to array of newStoredFolders
                if (storedFoldersToAdd_1.length > 0) {
                    foldersHaveChanged = true;
                    if (typeof index === 'number' && index >= 0 && index < newStoredFolders.length) {
                        newStoredFolders = newStoredFolders.slice(0);
                        newStoredFolders.splice.apply(newStoredFolders, [index, 0].concat(storedFoldersToAdd_1));
                    }
                    else {
                        newStoredFolders = newStoredFolders.concat(storedFoldersToAdd_1);
                    }
                }
            }
            // Set folders if we recorded a change
            if (foldersHaveChanged) {
                return this.setFolders(newStoredFolders);
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        WorkspaceService.prototype.setFolders = function (folders) {
            var _this = this;
            return this.workspaceConfiguration.setFolders(folders, this.jsonEditingService)
                .then(function () { return _this.onWorkspaceConfigurationChanged(); });
        };
        WorkspaceService.prototype.contains = function (resources, toCheck) {
            return resources.some(function (resource) {
                if (platform_1.isLinux) {
                    return resource.toString() === toCheck.toString();
                }
                return resource.toString().toLowerCase() === toCheck.toString().toLowerCase();
            });
        };
        // Workspace Configuration Service Impl
        WorkspaceService.prototype.getConfigurationData = function () {
            return this._configuration.toData();
        };
        WorkspaceService.prototype.getValue = function (arg1, arg2) {
            var section = typeof arg1 === 'string' ? arg1 : void 0;
            var overrides = configuration_1.isConfigurationOverrides(arg1) ? arg1 : configuration_1.isConfigurationOverrides(arg2) ? arg2 : void 0;
            return this._configuration.getValue(section, overrides);
        };
        WorkspaceService.prototype.updateValue = function (key, value, arg3, arg4, donotNotifyError) {
            assert.ok(this.configurationEditingService, 'Workbench is not initialized yet');
            var overrides = configuration_1.isConfigurationOverrides(arg3) ? arg3 : void 0;
            var target = this.deriveConfigurationTarget(key, value, overrides, overrides ? arg4 : arg3);
            return target ? this.writeConfigurationValue(key, value, target, overrides, donotNotifyError)
                : winjs_base_1.TPromise.as(null);
        };
        WorkspaceService.prototype.reloadConfiguration = function (folder, key) {
            var _this = this;
            if (folder) {
                return this.reloadWorkspaceFolderConfiguration(folder, key);
            }
            return this.reloadUserConfiguration()
                .then(function () { return _this.reloadWorkspaceConfiguration(); })
                .then(function () { return _this.loadConfiguration(); });
        };
        WorkspaceService.prototype.inspect = function (key, overrides) {
            return this._configuration.inspect(key, overrides);
        };
        WorkspaceService.prototype.keys = function () {
            return this._configuration.keys();
        };
        WorkspaceService.prototype.getUnsupportedWorkspaceKeys = function () {
            var unsupportedWorkspaceKeys = this.workspaceConfiguration.getUnsupportedKeys().slice();
            for (var _i = 0, _a = this.workspace.folders; _i < _a.length; _i++) {
                var folder = _a[_i];
                unsupportedWorkspaceKeys.push.apply(unsupportedWorkspaceKeys, this.cachedFolderConfigs.get(folder.uri).getUnsupportedKeys());
            }
            return arrays_1.distinct(unsupportedWorkspaceKeys);
        };
        WorkspaceService.prototype.initialize = function (arg) {
            var _this = this;
            return this.createWorkspace(arg)
                .then(function (workspace) { return _this.updateWorkspaceAndInitializeConfiguration(workspace); });
        };
        WorkspaceService.prototype.setInstantiationService = function (instantiationService) {
            this.configurationEditingService = instantiationService.createInstance(configurationEditingService_1.ConfigurationEditingService);
            this.jsonEditingService = instantiationService.createInstance(jsonEditingService_1.JSONEditingService);
        };
        WorkspaceService.prototype.handleWorkspaceFileEvents = function (event) {
            switch (this.getWorkbenchState()) {
                case workspace_1.WorkbenchState.FOLDER:
                    return this.onSingleFolderFileChanges(event);
                case workspace_1.WorkbenchState.WORKSPACE:
                    return this.onWorkspaceFileChanges(event);
            }
            return winjs_base_1.TPromise.as(void 0);
        };
        WorkspaceService.prototype.createWorkspace = function (arg) {
            if (workspaces_1.isWorkspaceIdentifier(arg)) {
                return this.createMulitFolderWorkspace(arg);
            }
            if (workspaces_1.isSingleFolderWorkspaceIdentifier(arg)) {
                return this.createSingleFolderWorkspace(arg);
            }
            return this.createEmptyWorkspace(arg);
        };
        WorkspaceService.prototype.createMulitFolderWorkspace = function (workspaceIdentifier) {
            var _this = this;
            var workspaceConfigPath = uri_1.default.file(workspaceIdentifier.configPath);
            return this.workspaceConfiguration.load(workspaceConfigPath)
                .then(function () {
                var workspaceFolders = workspace_1.toWorkspaceFolders(_this.workspaceConfiguration.getFolders(), uri_1.default.file(path_1.dirname(workspaceConfigPath.fsPath)));
                var workspaceId = workspaceIdentifier.id;
                var workspaceName = workspaces_1.getWorkspaceLabel({ id: workspaceId, configPath: workspaceConfigPath.fsPath }, _this.environmentService);
                return new workspace_1.Workspace(workspaceId, workspaceName, workspaceFolders, workspaceConfigPath);
            });
        };
        WorkspaceService.prototype.createSingleFolderWorkspace = function (singleFolderWorkspaceIdentifier) {
            var folderPath = uri_1.default.file(singleFolderWorkspaceIdentifier);
            return pfs_1.stat(folderPath.fsPath)
                .then(function (workspaceStat) {
                var ctime = platform_1.isLinux ? workspaceStat.ino : workspaceStat.birthtime.getTime(); // On Linux, birthtime is ctime, so we cannot use it! We use the ino instead!
                var id = crypto_1.createHash('md5').update(folderPath.fsPath).update(ctime ? String(ctime) : '').digest('hex');
                var folder = uri_1.default.file(folderPath.fsPath);
                return new workspace_1.Workspace(id, labels_1.getBaseLabel(folder), workspace_1.toWorkspaceFolders([{ path: folder.fsPath }]), null, ctime);
            });
        };
        WorkspaceService.prototype.createEmptyWorkspace = function (configuration) {
            var id = configuration.backupPath ? uri_1.default.from({ path: path_1.basename(configuration.backupPath), scheme: 'empty' }).toString() : '';
            return winjs_base_1.TPromise.as(new workspace_1.Workspace(id));
        };
        WorkspaceService.prototype.updateWorkspaceAndInitializeConfiguration = function (workspace) {
            var _this = this;
            var hasWorkspaceBefore = !!this.workspace;
            var previousState;
            var previousWorkspacePath;
            var previousFolders;
            if (hasWorkspaceBefore) {
                previousState = this.getWorkbenchState();
                previousWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : void 0;
                previousFolders = this.workspace.folders;
                this.workspace.update(workspace);
            }
            else {
                this.workspace = workspace;
            }
            return this.initializeConfiguration().then(function () {
                // Trigger changes after configuration initialization so that configuration is up to date.
                if (hasWorkspaceBefore) {
                    var newState = _this.getWorkbenchState();
                    if (previousState && newState !== previousState) {
                        _this._onDidChangeWorkbenchState.fire(newState);
                    }
                    var newWorkspacePath = _this.workspace.configuration ? _this.workspace.configuration.fsPath : void 0;
                    if (previousWorkspacePath && newWorkspacePath !== previousWorkspacePath || newState !== previousState) {
                        _this._onDidChangeWorkspaceName.fire();
                    }
                    var folderChanges = _this.compareFolders(previousFolders, _this.workspace.folders);
                    if (folderChanges && (folderChanges.added.length || folderChanges.removed.length || folderChanges.changed.length)) {
                        _this._onDidChangeWorkspaceFolders.fire(folderChanges);
                    }
                }
            });
        };
        WorkspaceService.prototype.compareFolders = function (currentFolders, newFolders) {
            var result = { added: [], removed: [], changed: [] };
            result.added = newFolders.filter(function (newFolder) { return !currentFolders.some(function (currentFolder) { return newFolder.uri.toString() === currentFolder.uri.toString(); }); });
            for (var currentIndex = 0; currentIndex < currentFolders.length; currentIndex++) {
                var currentFolder = currentFolders[currentIndex];
                var newIndex = 0;
                for (newIndex = 0; newIndex < newFolders.length && currentFolder.uri.toString() !== newFolders[newIndex].uri.toString(); newIndex++) { }
                if (newIndex < newFolders.length) {
                    if (currentIndex !== newIndex || currentFolder.name !== newFolders[newIndex].name) {
                        result.changed.push(currentFolder);
                    }
                }
                else {
                    result.removed.push(currentFolder);
                }
            }
            return result;
        };
        WorkspaceService.prototype.initializeConfiguration = function () {
            this.registerConfigurationSchemas();
            return this.loadConfiguration();
        };
        WorkspaceService.prototype.reloadUserConfiguration = function (key) {
            return this.userConfiguration.reload();
        };
        WorkspaceService.prototype.reloadWorkspaceConfiguration = function (key) {
            var _this = this;
            var workbenchState = this.getWorkbenchState();
            if (workbenchState === workspace_1.WorkbenchState.FOLDER) {
                return this.onWorkspaceFolderConfigurationChanged(this.workspace.folders[0], key);
            }
            if (workbenchState === workspace_1.WorkbenchState.WORKSPACE) {
                return this.workspaceConfiguration.reload().then(function () { return _this.onWorkspaceConfigurationChanged(); });
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkspaceService.prototype.reloadWorkspaceFolderConfiguration = function (folder, key) {
            return this.onWorkspaceFolderConfigurationChanged(folder, key);
        };
        WorkspaceService.prototype.loadConfiguration = function () {
            var _this = this;
            // reset caches
            this.cachedFolderConfigs = new map_1.StrictResourceMap();
            var folders = this.workspace.folders;
            return this.loadFolderConfigurations(folders)
                .then(function (folderConfigurations) {
                var workspaceConfiguration = _this.getWorkspaceConfigurationModel(folderConfigurations);
                var folderConfigurationModels = new map_1.StrictResourceMap();
                folderConfigurations.forEach(function (folderConfiguration, index) { return folderConfigurationModels.set(folders[index].uri, folderConfiguration); });
                var currentConfiguration = _this._configuration;
                _this._configuration = new configurationModels_2.Configuration(_this.defaultConfiguration, _this.userConfiguration.configurationModel, workspaceConfiguration, folderConfigurationModels, new configurationModels_1.ConfigurationModel(), new map_1.StrictResourceMap(), _this.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY ? _this.workspace : null); //TODO: Sandy Avoid passing null
                if (currentConfiguration) {
                    var changedKeys = _this._configuration.compare(currentConfiguration);
                    _this.triggerConfigurationChange(new configurationModels_1.ConfigurationChangeEvent().change(changedKeys), configuration_1.ConfigurationTarget.WORKSPACE);
                }
                else {
                    _this._onDidChangeConfiguration.fire(new configurationModels_2.AllKeysConfigurationChangeEvent(_this._configuration, configuration_1.ConfigurationTarget.WORKSPACE, _this.getTargetConfiguration(configuration_1.ConfigurationTarget.WORKSPACE)));
                }
            });
        };
        WorkspaceService.prototype.getWorkspaceConfigurationModel = function (folderConfigurations) {
            switch (this.getWorkbenchState()) {
                case workspace_1.WorkbenchState.FOLDER:
                    return folderConfigurations[0];
                case workspace_1.WorkbenchState.WORKSPACE:
                    return this.workspaceConfiguration.getConfiguration();
                default:
                    return new configurationModels_1.ConfigurationModel();
            }
        };
        WorkspaceService.prototype.onDefaultConfigurationChanged = function (keys) {
            var _this = this;
            this.defaultConfiguration = new configurationModels_1.DefaultConfigurationModel();
            this.registerConfigurationSchemas();
            if (this.workspace && this._configuration) {
                this._configuration.updateDefaultConfiguration(this.defaultConfiguration);
                if (this.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                    this._configuration.updateWorkspaceConfiguration(this.cachedFolderConfigs.get(this.workspace.folders[0].uri).reprocess());
                }
                else {
                    this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reprocessWorkspaceSettings());
                    this.workspace.folders.forEach(function (folder) { return _this._configuration.updateFolderConfiguration(folder.uri, _this.cachedFolderConfigs.get(folder.uri).reprocess()); });
                }
                this.triggerConfigurationChange(new configurationModels_1.ConfigurationChangeEvent().change(keys), configuration_1.ConfigurationTarget.DEFAULT);
            }
        };
        WorkspaceService.prototype.registerConfigurationSchemas = function () {
            if (this.workspace) {
                var jsonRegistry = platform_2.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
                jsonRegistry.registerSchema(configuration_2.defaultSettingsSchemaId, configurationRegistry_1.settingsSchema);
                jsonRegistry.registerSchema(configuration_2.userSettingsSchemaId, configurationRegistry_1.settingsSchema);
                if (workspace_1.WorkbenchState.WORKSPACE === this.getWorkbenchState()) {
                    jsonRegistry.registerSchema(configuration_2.workspaceSettingsSchemaId, configurationRegistry_1.settingsSchema);
                    jsonRegistry.registerSchema(configuration_2.folderSettingsSchemaId, configurationRegistry_1.resourceSettingsSchema);
                }
                else {
                    jsonRegistry.registerSchema(configuration_2.workspaceSettingsSchemaId, configurationRegistry_1.settingsSchema);
                    jsonRegistry.registerSchema(configuration_2.folderSettingsSchemaId, configurationRegistry_1.settingsSchema);
                }
            }
        };
        WorkspaceService.prototype.onUserConfigurationChanged = function () {
            var keys = this._configuration.compareAndUpdateUserConfiguration(this.userConfiguration.configurationModel);
            this.triggerConfigurationChange(keys, configuration_1.ConfigurationTarget.USER);
        };
        WorkspaceService.prototype.onWorkspaceConfigurationChanged = function () {
            var _this = this;
            if (this.workspace && this.workspace.configuration && this._configuration) {
                var workspaceConfigurationChangeEvent_1 = this._configuration.compareAndUpdateWorkspaceConfiguration(this.workspaceConfiguration.getConfiguration());
                var configuredFolders = workspace_1.toWorkspaceFolders(this.workspaceConfiguration.getFolders(), uri_1.default.file(path_1.dirname(this.workspace.configuration.fsPath)));
                var changes_1 = this.compareFolders(this.workspace.folders, configuredFolders);
                if (changes_1.added.length || changes_1.removed.length || changes_1.changed.length) {
                    this.workspace.folders = configuredFolders;
                    return this.onFoldersChanged()
                        .then(function (foldersConfigurationChangeEvent) {
                        _this.triggerConfigurationChange(foldersConfigurationChangeEvent.change(workspaceConfigurationChangeEvent_1), configuration_1.ConfigurationTarget.WORKSPACE_FOLDER);
                        _this._onDidChangeWorkspaceFolders.fire(changes_1);
                    });
                }
                else {
                    this.triggerConfigurationChange(workspaceConfigurationChangeEvent_1, configuration_1.ConfigurationTarget.WORKSPACE);
                }
            }
            return winjs_base_1.TPromise.as(null);
        };
        WorkspaceService.prototype.onWorkspaceFileChanges = function (event) {
            var _this = this;
            return winjs_base_1.TPromise.join(this.workspace.folders.map(function (folder) {
                // handle file event for each folder
                return _this.cachedFolderConfigs.get(folder.uri).handleWorkspaceFileEvents(event)
                    .then(function (folderConfiguration) { return folderConfiguration ? _this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration) : new configurationModels_1.ConfigurationChangeEvent(); });
            })).then(function (changeEvents) {
                var consolidateChangeEvent = changeEvents.reduce(function (consolidated, e) { return consolidated.change(e); }, new configurationModels_1.ConfigurationChangeEvent());
                _this.triggerConfigurationChange(consolidateChangeEvent, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER);
            });
        };
        WorkspaceService.prototype.onSingleFolderFileChanges = function (event) {
            var _this = this;
            var folder = this.workspace.folders[0];
            return this.cachedFolderConfigs.get(folder.uri).handleWorkspaceFileEvents(event)
                .then(function (folderConfiguration) {
                if (folderConfiguration) {
                    // File change handled
                    _this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
                    var workspaceChangedKeys = _this._configuration.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
                    _this.triggerConfigurationChange(workspaceChangedKeys, configuration_1.ConfigurationTarget.WORKSPACE);
                }
            });
        };
        WorkspaceService.prototype.onWorkspaceFolderConfigurationChanged = function (folder, key) {
            var _this = this;
            this.disposeFolderConfiguration(folder);
            return this.loadFolderConfigurations([folder])
                .then(function (_a) {
                var folderConfiguration = _a[0];
                var folderChangedKeys = _this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
                if (_this.getWorkbenchState() === workspace_1.WorkbenchState.FOLDER) {
                    var workspaceChangedKeys = _this._configuration.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
                    _this.triggerConfigurationChange(workspaceChangedKeys, configuration_1.ConfigurationTarget.WORKSPACE);
                }
                else {
                    _this.triggerConfigurationChange(folderChangedKeys, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER);
                }
            });
        };
        WorkspaceService.prototype.onFoldersChanged = function () {
            var _this = this;
            var changeEvent = new configurationModels_1.ConfigurationChangeEvent();
            var _loop_1 = function (key) {
                if (!this_1.workspace.folders.filter(function (folder) { return folder.uri.toString() === key.toString(); })[0]) {
                    this_1.cachedFolderConfigs.delete(key);
                    changeEvent = changeEvent.change(this_1._configuration.compareAndDeleteFolderConfiguration(key));
                }
            };
            var this_1 = this;
            // Remove the configurations of deleted folders
            for (var _i = 0, _a = this.cachedFolderConfigs.keys(); _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_1(key);
            }
            var toInitialize = this.workspace.folders.filter(function (folder) { return !_this.cachedFolderConfigs.has(folder.uri); });
            if (toInitialize.length) {
                return this.loadFolderConfigurations(toInitialize)
                    .then(function (folderConfigurations) {
                    folderConfigurations.forEach(function (folderConfiguration, index) {
                        changeEvent = changeEvent.change(_this._configuration.compareAndUpdateFolderConfiguration(toInitialize[index].uri, folderConfiguration));
                    });
                    return changeEvent;
                });
            }
            return winjs_base_1.TPromise.as(changeEvent);
        };
        WorkspaceService.prototype.loadFolderConfigurations = function (folders) {
            var _this = this;
            return winjs_base_1.TPromise.join(folders.map(function (folder) {
                var folderConfiguration = new configuration_3.FolderConfiguration(folder.uri, _this.workspaceSettingsRootFolder, _this.getWorkbenchState());
                _this.cachedFolderConfigs.set(folder.uri, _this._register(folderConfiguration));
                return folderConfiguration.loadConfiguration();
            }).slice());
        };
        WorkspaceService.prototype.writeConfigurationValue = function (key, value, target, overrides, donotNotifyError) {
            var _this = this;
            if (target === configuration_1.ConfigurationTarget.DEFAULT) {
                return winjs_base_1.TPromise.wrapError(new Error('Invalid configuration target'));
            }
            if (target === configuration_1.ConfigurationTarget.MEMORY) {
                this._configuration.updateValue(key, value, overrides);
                this.triggerConfigurationChange(new configurationModels_1.ConfigurationChangeEvent().change(overrides.overrideIdentifier ? [configuration_1.keyFromOverrideIdentifier(overrides.overrideIdentifier)] : [key], overrides.resource), target);
                return winjs_base_1.TPromise.as(null);
            }
            return this.configurationEditingService.writeConfiguration(target, { key: key, value: value }, { scopes: overrides, donotNotifyError: donotNotifyError })
                .then(function () {
                switch (target) {
                    case configuration_1.ConfigurationTarget.USER:
                        return _this.reloadUserConfiguration();
                    case configuration_1.ConfigurationTarget.WORKSPACE:
                        return _this.reloadWorkspaceConfiguration();
                    case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                        var workspaceFolder = overrides && overrides.resource ? _this.workspace.getFolder(overrides.resource) : null;
                        if (workspaceFolder) {
                            return _this.reloadWorkspaceFolderConfiguration(_this.workspace.getFolder(overrides.resource), key);
                        }
                }
                return null;
            });
        };
        WorkspaceService.prototype.deriveConfigurationTarget = function (key, value, overrides, target) {
            if (target) {
                return target;
            }
            if (value === void 0) {
                // Ignore. But expected is to remove the value from all targets
                return void 0;
            }
            var inspect = this.inspect(key, overrides);
            if (objects_1.equals(value, inspect.value)) {
                // No change. So ignore.
                return void 0;
            }
            if (inspect.workspaceFolder !== void 0) {
                return configuration_1.ConfigurationTarget.WORKSPACE_FOLDER;
            }
            if (inspect.workspace !== void 0) {
                return configuration_1.ConfigurationTarget.WORKSPACE;
            }
            return configuration_1.ConfigurationTarget.USER;
        };
        WorkspaceService.prototype.triggerConfigurationChange = function (configurationEvent, target) {
            if (configurationEvent.affectedKeys.length) {
                configurationEvent.telemetryData(target, this.getTargetConfiguration(target));
                this._onDidChangeConfiguration.fire(new configurationModels_2.WorkspaceConfigurationChangeEvent(configurationEvent, this.workspace));
            }
        };
        WorkspaceService.prototype.getTargetConfiguration = function (target) {
            switch (target) {
                case configuration_1.ConfigurationTarget.DEFAULT:
                    return this._configuration.defaults.contents;
                case configuration_1.ConfigurationTarget.USER:
                    return this._configuration.user.contents;
                case configuration_1.ConfigurationTarget.WORKSPACE:
                    return this._configuration.workspace.contents;
            }
            return {};
        };
        WorkspaceService.prototype.pathEquals = function (path1, path2) {
            if (!platform_1.isLinux) {
                path1 = path1.toLowerCase();
                path2 = path2.toLowerCase();
            }
            return path1 === path2;
        };
        WorkspaceService.prototype.disposeFolderConfiguration = function (folder) {
            var folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
            if (folderConfiguration) {
                folderConfiguration.dispose();
            }
        };
        return WorkspaceService;
    }(lifecycle_1.Disposable));
    exports.WorkspaceService = WorkspaceService;
    var DefaultConfigurationExportHelper = /** @class */ (function () {
        function DefaultConfigurationExportHelper(environmentService, extensionService, commandService) {
            this.extensionService = extensionService;
            this.commandService = commandService;
            if (environmentService.args['export-default-configuration']) {
                this.writeConfigModelAndQuit(environmentService.args['export-default-configuration']);
            }
        }
        DefaultConfigurationExportHelper.prototype.writeConfigModelAndQuit = function (targetPath) {
            var _this = this;
            return this.extensionService.whenInstalledExtensionsRegistered()
                .then(function () { return _this.writeConfigModel(targetPath); })
                .then(function () { return _this.commandService.executeCommand('workbench.action.quit'); })
                .then(function () { });
        };
        DefaultConfigurationExportHelper.prototype.writeConfigModel = function (targetPath) {
            var config = this.getConfigModel();
            var resultString = JSON.stringify(config, undefined, '  ');
            return pfs_1.writeFile(targetPath, resultString);
        };
        DefaultConfigurationExportHelper.prototype.getConfigModel = function () {
            var configRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
            var configurations = configRegistry.getConfigurations().slice();
            var settings = [];
            var processProperty = function (name, prop) {
                var propDetails = {
                    name: name,
                    description: prop.description,
                    default: prop.default,
                    type: prop.type
                };
                if (prop.enum) {
                    propDetails.enum = prop.enum;
                }
                if (prop.enumDescriptions) {
                    propDetails.enumDescriptions = prop.enumDescriptions;
                }
                settings.push(propDetails);
            };
            var processConfig = function (config) {
                if (config.properties) {
                    for (var name_1 in config.properties) {
                        processProperty(name_1, config.properties[name_1]);
                    }
                }
                if (config.allOf) {
                    config.allOf.forEach(processConfig);
                }
            };
            configurations.forEach(processConfig);
            var excludedProps = configRegistry.getExcludedConfigurationProperties();
            for (var name_2 in excludedProps) {
                processProperty(name_2, excludedProps[name_2]);
            }
            var result = {
                settings: settings.sort(function (a, b) { return a.name.localeCompare(b.name); }),
                buildTime: Date.now(),
                commit: product_1.default.commit,
                buildNumber: product_1.default.settingsSearchBuildId
            };
            return result;
        };
        DefaultConfigurationExportHelper = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, extensions_1.IExtensionService),
            __param(2, commands_1.ICommandService)
        ], DefaultConfigurationExportHelper);
        return DefaultConfigurationExportHelper;
    }());
    exports.DefaultConfigurationExportHelper = DefaultConfigurationExportHelper;
});
