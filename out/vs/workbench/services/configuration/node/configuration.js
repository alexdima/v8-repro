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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/paths", "vs/base/common/winjs.base", "vs/base/common/event", "vs/base/node/pfs", "vs/base/common/errors", "vs/base/common/collections", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/files/common/files", "vs/base/common/platform", "vs/base/node/config", "vs/platform/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/base/node/extfs", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configurationRegistry", "path", "vs/base/common/objects"], function (require, exports, uri_1, paths, winjs_base_1, event_1, pfs_1, errors, collections, lifecycle_1, async_1, files_1, platform_1, config_1, configurationModels_1, configurationModels_2, configuration_1, extfs, workspace_1, configurationRegistry_1, path_1, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function resolveContents(resources) {
        var contents = [];
        return winjs_base_1.TPromise.join(resources.map(function (resource) {
            return resolveContent(resource).then(function (content) {
                contents.push(content);
            });
        })).then(function () { return contents; });
    }
    function resolveContent(resource) {
        return pfs_1.readFile(resource.fsPath).then(function (contents) { return ({ resource: resource, value: contents.toString() }); });
    }
    function resolveStat(resource) {
        return new winjs_base_1.TPromise(function (c, e) {
            extfs.readdir(resource.fsPath, function (error, children) {
                if (error) {
                    if (error.code === 'ENOTDIR') {
                        c({ resource: resource });
                    }
                    else {
                        e(error);
                    }
                }
                else {
                    c({
                        resource: resource,
                        isDirectory: true,
                        children: children.map(function (child) { return { resource: uri_1.default.file(paths.join(resource.fsPath, child)) }; })
                    });
                }
            });
        });
    }
    var WorkspaceConfiguration = /** @class */ (function (_super) {
        __extends(WorkspaceConfiguration, _super);
        function WorkspaceConfiguration() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._workspaceConfigurationWatcherDisposables = [];
            _this._onDidUpdateConfiguration = _this._register(new event_1.Emitter());
            _this.onDidUpdateConfiguration = _this._onDidUpdateConfiguration.event;
            _this._workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(_this._workspaceConfigPath ? _this._workspaceConfigPath.fsPath : '');
            _this._cache = new configurationModels_1.ConfigurationModel();
            return _this;
        }
        WorkspaceConfiguration.prototype.load = function (workspaceConfigPath) {
            var _this = this;
            if (this._workspaceConfigPath && this._workspaceConfigPath.fsPath === workspaceConfigPath.fsPath) {
                return this.reload();
            }
            this._workspaceConfigPath = workspaceConfigPath;
            this.stopListeningToWatcher();
            return new winjs_base_1.TPromise(function (c, e) {
                var defaultConfig = new configurationModels_2.WorkspaceConfigurationModelParser(_this._workspaceConfigPath.fsPath);
                defaultConfig.parse(JSON.stringify({ folders: [] }, null, '\t'));
                _this._workspaceConfigurationWatcher = new config_1.ConfigWatcher(_this._workspaceConfigPath.fsPath, {
                    changeBufferDelay: 300,
                    onError: function (error) { return errors.onUnexpectedError(error); },
                    defaultConfig: defaultConfig,
                    parse: function (content, parseErrors) {
                        _this._workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(_this._workspaceConfigPath.fsPath);
                        _this._workspaceConfigurationModelParser.parse(content);
                        parseErrors = _this._workspaceConfigurationModelParser.errors.slice();
                        _this.consolidate();
                        return _this._workspaceConfigurationModelParser;
                    }, initCallback: function () { return c(null); }
                });
                _this.listenToWatcher();
            });
        };
        WorkspaceConfiguration.prototype.reload = function () {
            var _this = this;
            this.stopListeningToWatcher();
            return new winjs_base_1.TPromise(function (c) { return _this._workspaceConfigurationWatcher.reload(function () {
                _this.listenToWatcher();
                c(null);
            }); });
        };
        WorkspaceConfiguration.prototype.getFolders = function () {
            return this._workspaceConfigurationModelParser.folders;
        };
        WorkspaceConfiguration.prototype.setFolders = function (folders, jsonEditingService) {
            var _this = this;
            return jsonEditingService.write(this._workspaceConfigPath, { key: 'folders', value: folders }, true)
                .then(function () { return _this.reload(); });
        };
        WorkspaceConfiguration.prototype.getConfiguration = function () {
            return this._cache;
        };
        WorkspaceConfiguration.prototype.getUnsupportedKeys = function () {
            return this._workspaceConfigurationModelParser.settingsModel.unsupportedKeys;
        };
        WorkspaceConfiguration.prototype.reprocessWorkspaceSettings = function () {
            this._workspaceConfigurationModelParser.reprocessWorkspaceSettings();
            this.consolidate();
            return this.getConfiguration();
        };
        WorkspaceConfiguration.prototype.listenToWatcher = function () {
            var _this = this;
            this._workspaceConfigurationWatcherDisposables.push(this._workspaceConfigurationWatcher);
            this._workspaceConfigurationWatcher.onDidUpdateConfiguration(function () { return _this._onDidUpdateConfiguration.fire(); }, this, this._workspaceConfigurationWatcherDisposables);
        };
        WorkspaceConfiguration.prototype.stopListeningToWatcher = function () {
            this._workspaceConfigurationWatcherDisposables = lifecycle_1.dispose(this._workspaceConfigurationWatcherDisposables);
        };
        WorkspaceConfiguration.prototype.consolidate = function () {
            this._cache = this._workspaceConfigurationModelParser.settingsModel.merge(this._workspaceConfigurationModelParser.launchModel);
        };
        WorkspaceConfiguration.prototype.dispose = function () {
            lifecycle_1.dispose(this._workspaceConfigurationWatcherDisposables);
            _super.prototype.dispose.call(this);
        };
        return WorkspaceConfiguration;
    }(lifecycle_1.Disposable));
    exports.WorkspaceConfiguration = WorkspaceConfiguration;
    var FolderConfiguration = /** @class */ (function (_super) {
        __extends(FolderConfiguration, _super);
        function FolderConfiguration(folder, configFolderRelativePath, workbenchState) {
            var _this = _super.call(this) || this;
            _this.folder = folder;
            _this.configFolderRelativePath = configFolderRelativePath;
            _this._standAloneConfigurations = [];
            _this._cache = new configurationModels_1.ConfigurationModel();
            _this.reloadConfigurationEventEmitter = new event_1.Emitter();
            _this._folderSettingsModelParser = new configurationModels_2.FolderSettingsModelParser(configuration_1.FOLDER_SETTINGS_PATH, workspace_1.WorkbenchState.WORKSPACE === workbenchState ? configurationRegistry_1.ConfigurationScope.RESOURCE : void 0);
            _this.workspaceFilePathToConfiguration = Object.create(null);
            _this.reloadConfigurationScheduler = _this._register(new async_1.RunOnceScheduler(function () { return _this.loadConfiguration().then(function (configuration) { return _this.reloadConfigurationEventEmitter.fire(configuration); }, errors.onUnexpectedError); }, FolderConfiguration.RELOAD_CONFIGURATION_DELAY));
            return _this;
        }
        FolderConfiguration.prototype.loadConfiguration = function () {
            var _this = this;
            // Load workspace locals
            return this.loadWorkspaceConfigFiles().then(function (workspaceConfigFiles) {
                _this._standAloneConfigurations = Object.keys(workspaceConfigFiles).filter(function (key) { return key !== configuration_1.FOLDER_SETTINGS_PATH; }).map(function (key) { return workspaceConfigFiles[key].configurationModel; });
                // Consolidate (support *.json files in the workspace settings folder)
                _this.consolidate();
                return _this._cache;
            });
        };
        FolderConfiguration.prototype.reprocess = function () {
            var oldContents = this._folderSettingsModelParser.settingsModel.contents;
            this._folderSettingsModelParser.reprocess();
            if (!objects_1.equals(oldContents, this._folderSettingsModelParser.settingsModel.contents)) {
                this.consolidate();
            }
            return this._cache;
        };
        FolderConfiguration.prototype.getUnsupportedKeys = function () {
            return this._folderSettingsModelParser.settingsModel.unsupportedKeys;
        };
        FolderConfiguration.prototype.consolidate = function () {
            this._cache = (_a = this._folderSettingsModelParser.settingsModel).merge.apply(_a, this._standAloneConfigurations);
            var _a;
        };
        FolderConfiguration.prototype.loadWorkspaceConfigFiles = function () {
            var _this = this;
            // once: when invoked for the first time we fetch json files that contribute settings
            if (!this.bulkFetchFromWorkspacePromise) {
                this.bulkFetchFromWorkspacePromise = resolveStat(this.toResource(this.configFolderRelativePath)).then(function (stat) {
                    if (!stat.isDirectory) {
                        return winjs_base_1.TPromise.as([]);
                    }
                    return resolveContents(stat.children.filter(function (stat) {
                        var isJson = paths.extname(stat.resource.fsPath) === '.json';
                        if (!isJson) {
                            return false; // only JSON files
                        }
                        return _this.isWorkspaceConfigurationFile(_this.toFolderRelativePath(stat.resource)); // only workspace config files
                    }).map(function (stat) { return stat.resource; }));
                }, function (err) { return []; } /* never fail this call */)
                    .then(function (contents) {
                    contents.forEach(function (content) { return _this.workspaceFilePathToConfiguration[_this.toFolderRelativePath(content.resource)] = winjs_base_1.TPromise.as(_this.createConfigurationModelParser(content)); });
                }, errors.onUnexpectedError);
            }
            // on change: join on *all* configuration file promises so that we can merge them into a single configuration object. this
            // happens whenever a config file changes, is deleted, or added
            return this.bulkFetchFromWorkspacePromise.then(function () { return winjs_base_1.TPromise.join(_this.workspaceFilePathToConfiguration); });
        };
        FolderConfiguration.prototype.handleWorkspaceFileEvents = function (event) {
            var _this = this;
            var events = event.changes;
            var affectedByChanges = false;
            // Find changes that affect workspace configuration files
            for (var i = 0, len = events.length; i < len; i++) {
                var resource = events[i].resource;
                var isJson = paths.extname(resource.fsPath) === '.json';
                var isDeletedSettingsFolder = (events[i].type === files_1.FileChangeType.DELETED && paths.isEqual(paths.basename(resource.fsPath), this.configFolderRelativePath));
                if (!isJson && !isDeletedSettingsFolder) {
                    continue; // only JSON files or the actual settings folder
                }
                var workspacePath = this.toFolderRelativePath(resource);
                if (!workspacePath) {
                    continue; // event is not inside workspace
                }
                // Handle case where ".vscode" got deleted
                if (workspacePath === this.configFolderRelativePath && events[i].type === files_1.FileChangeType.DELETED) {
                    this.workspaceFilePathToConfiguration = Object.create(null);
                    affectedByChanges = true;
                }
                // only valid workspace config files
                if (!this.isWorkspaceConfigurationFile(workspacePath)) {
                    continue;
                }
                // insert 'fetch-promises' for add and update events and
                // remove promises for delete events
                switch (events[i].type) {
                    case files_1.FileChangeType.DELETED:
                        affectedByChanges = collections.remove(this.workspaceFilePathToConfiguration, workspacePath);
                        break;
                    case files_1.FileChangeType.UPDATED:
                    case files_1.FileChangeType.ADDED:
                        this.workspaceFilePathToConfiguration[workspacePath] = resolveContent(resource).then(function (content) { return _this.createConfigurationModelParser(content); }, errors.onUnexpectedError);
                        affectedByChanges = true;
                }
            }
            if (!affectedByChanges) {
                return winjs_base_1.TPromise.as(null);
            }
            return new winjs_base_1.TPromise(function (c, e) {
                var disposable = _this.reloadConfigurationEventEmitter.event(function (configuration) {
                    disposable.dispose();
                    c(configuration);
                });
                // trigger reload of the configuration if we are affected by changes
                if (!_this.reloadConfigurationScheduler.isScheduled()) {
                    _this.reloadConfigurationScheduler.schedule();
                }
            });
        };
        FolderConfiguration.prototype.createConfigurationModelParser = function (content) {
            var path = this.toFolderRelativePath(content.resource);
            if (path === configuration_1.FOLDER_SETTINGS_PATH) {
                this._folderSettingsModelParser.parse(content.value);
                return this._folderSettingsModelParser;
            }
            else {
                var matches = /\/([^\.]*)*\.json/.exec(path);
                if (matches && matches[1]) {
                    var standAloneConfigurationModelParser = new configurationModels_2.StandaloneConfigurationModelParser(content.resource.toString(), matches[1]);
                    standAloneConfigurationModelParser.parse(content.value);
                    return standAloneConfigurationModelParser;
                }
            }
            return new configurationModels_1.ConfigurationModelParser(null);
        };
        FolderConfiguration.prototype.isWorkspaceConfigurationFile = function (folderRelativePath) {
            return [configuration_1.FOLDER_SETTINGS_PATH, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS[configuration_1.TASKS_CONFIGURATION_KEY], configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS[configuration_1.LAUNCH_CONFIGURATION_KEY]].some(function (p) { return p === folderRelativePath; });
        };
        FolderConfiguration.prototype.toResource = function (folderRelativePath) {
            if (typeof folderRelativePath === 'string') {
                return uri_1.default.file(paths.join(this.folder.fsPath, folderRelativePath));
            }
            return null;
        };
        FolderConfiguration.prototype.toFolderRelativePath = function (resource, toOSPath) {
            if (this.contains(resource)) {
                return paths.normalize(path_1.relative(this.folder.fsPath, resource.fsPath), toOSPath);
            }
            return null;
        };
        FolderConfiguration.prototype.contains = function (resource) {
            if (resource) {
                return paths.isEqualOrParent(resource.fsPath, this.folder.fsPath, !platform_1.isLinux /* ignorecase */);
            }
            return false;
        };
        FolderConfiguration.RELOAD_CONFIGURATION_DELAY = 50;
        return FolderConfiguration;
    }(lifecycle_1.Disposable));
    exports.FolderConfiguration = FolderConfiguration;
});
