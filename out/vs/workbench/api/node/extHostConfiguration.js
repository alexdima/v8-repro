define(["require", "exports", "vs/base/common/objects", "vs/base/common/uri", "vs/base/common/event", "./extHostTypes", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configurationModels", "vs/base/common/map", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, objects_1, uri_1, event_1, extHostTypes_1, configuration_1, configurationModels_1, configurationModels_2, map_1, configurationRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function lookUp(tree, key) {
        if (key) {
            var parts = key.split('.');
            var node = tree;
            for (var i = 0; node && i < parts.length; i++) {
                node = node[parts[i]];
            }
            return node;
        }
    }
    var ExtHostConfiguration = /** @class */ (function () {
        function ExtHostConfiguration(proxy, extHostWorkspace, data) {
            this._onDidChangeConfiguration = new event_1.Emitter();
            this._proxy = proxy;
            this._extHostWorkspace = extHostWorkspace;
            this._configuration = configurationModels_1.Configuration.parse(data);
            this._configurationScopes = data.configurationScopes;
        }
        Object.defineProperty(ExtHostConfiguration.prototype, "onDidChangeConfiguration", {
            get: function () {
                return this._onDidChangeConfiguration && this._onDidChangeConfiguration.event;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostConfiguration.prototype.$acceptConfigurationChanged = function (data, eventData) {
            this._configuration = configurationModels_1.Configuration.parse(data);
            this._onDidChangeConfiguration.fire(this._toConfigurationChangeEvent(eventData));
        };
        ExtHostConfiguration.prototype.getConfiguration = function (section, resource, extensionId) {
            var _this = this;
            var config = objects_1.deepClone(section
                ? lookUp(this._configuration.getValue(null, { resource: resource }, this._extHostWorkspace.workspace), section)
                : this._configuration.getValue(null, { resource: resource }, this._extHostWorkspace.workspace));
            if (section) {
                this._validateConfigurationAccess(section, resource, extensionId);
            }
            function parseConfigurationTarget(arg) {
                if (arg === void 0 || arg === null) {
                    return null;
                }
                if (typeof arg === 'boolean') {
                    return arg ? configuration_1.ConfigurationTarget.USER : configuration_1.ConfigurationTarget.WORKSPACE;
                }
                switch (arg) {
                    case extHostTypes_1.ConfigurationTarget.Global: return configuration_1.ConfigurationTarget.USER;
                    case extHostTypes_1.ConfigurationTarget.Workspace: return configuration_1.ConfigurationTarget.WORKSPACE;
                    case extHostTypes_1.ConfigurationTarget.WorkspaceFolder: return configuration_1.ConfigurationTarget.WORKSPACE_FOLDER;
                }
            }
            var result = {
                has: function (key) {
                    return typeof lookUp(config, key) !== 'undefined';
                },
                get: function (key, defaultValue) {
                    _this._validateConfigurationAccess(section ? section + "." + key : key, resource, extensionId);
                    var result = lookUp(config, key);
                    if (typeof result === 'undefined') {
                        result = defaultValue;
                    }
                    return result;
                },
                update: function (key, value, arg) {
                    key = section ? section + "." + key : key;
                    var target = parseConfigurationTarget(arg);
                    if (value !== void 0) {
                        return _this._proxy.$updateConfigurationOption(target, key, value, resource);
                    }
                    else {
                        return _this._proxy.$removeConfigurationOption(target, key, resource);
                    }
                },
                inspect: function (key) {
                    key = section ? section + "." + key : key;
                    var config = objects_1.deepClone(_this._configuration.inspect(key, { resource: resource }, _this._extHostWorkspace.workspace));
                    if (config) {
                        return {
                            key: key,
                            defaultValue: config.default,
                            globalValue: config.user,
                            workspaceValue: config.workspace,
                            workspaceFolderValue: config.workspaceFolder
                        };
                    }
                    return undefined;
                }
            };
            if (typeof config === 'object') {
                objects_1.mixin(result, config, false);
            }
            return Object.freeze(result);
        };
        ExtHostConfiguration.prototype._validateConfigurationAccess = function (key, resource, extensionId) {
            var scope = this._configurationScopes[key];
            var extensionIdText = extensionId ? "[" + extensionId + "] " : '';
            if (configurationRegistry_1.ConfigurationScope.RESOURCE === scope) {
                if (resource === void 0) {
                    console.warn(extensionIdText + "Accessing a resource scoped configuration without providing a resource is not expected. To get the effective value for '" + key + "', provide the URI of a resource or 'null' for any resource.");
                }
                return;
            }
            if (configurationRegistry_1.ConfigurationScope.WINDOW === scope) {
                if (resource) {
                    console.warn(extensionIdText + "Accessing a window scoped configuration for a resource is not expected. To associate '" + key + "' to a resource, define its scope to 'resource' in configuration contributions in 'package.json'.");
                }
                return;
            }
        };
        ExtHostConfiguration.prototype._toConfigurationChangeEvent = function (data) {
            var changedConfiguration = new configurationModels_1.ConfigurationModel(data.changedConfiguration.contents, data.changedConfiguration.keys, data.changedConfiguration.overrides);
            var changedConfigurationByResource = new map_1.StrictResourceMap();
            for (var _i = 0, _a = Object.keys(data.changedConfigurationByResource); _i < _a.length; _i++) {
                var key = _a[_i];
                var resource = uri_1.default.parse(key);
                var model = data.changedConfigurationByResource[key];
                changedConfigurationByResource.set(resource, new configurationModels_1.ConfigurationModel(model.contents, model.keys, model.overrides));
            }
            var event = new configurationModels_2.WorkspaceConfigurationChangeEvent(new configurationModels_1.ConfigurationChangeEvent(changedConfiguration, changedConfigurationByResource), this._extHostWorkspace.workspace);
            return Object.freeze({
                affectsConfiguration: function (section, resource) { return event.affectsConfiguration(section, resource); }
            });
        };
        return ExtHostConfiguration;
    }());
    exports.ExtHostConfiguration = ExtHostConfiguration;
});
