var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/platform/configuration/common/configuration"], function (require, exports, uri_1, platform_1, configurationRegistry_1, workspace_1, configuration_1, extHost_protocol_1, extHostCustomers_1, configuration_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadConfiguration = /** @class */ (function () {
        function MainThreadConfiguration(extHostContext, _workspaceContextService, configurationService) {
            var _this = this;
            this._workspaceContextService = _workspaceContextService;
            this.configurationService = configurationService;
            var proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostConfiguration);
            this._configurationListener = configurationService.onDidChangeConfiguration(function (e) {
                proxy.$acceptConfigurationChanged(configurationService.getConfigurationData(), _this.toConfigurationChangeEventData(e));
            });
        }
        MainThreadConfiguration.prototype.dispose = function () {
            this._configurationListener.dispose();
        };
        MainThreadConfiguration.prototype.$updateConfigurationOption = function (target, key, value, resourceUriComponenets) {
            var resource = resourceUriComponenets ? uri_1.default.revive(resourceUriComponenets) : null;
            return this.writeConfiguration(target, key, value, resource);
        };
        MainThreadConfiguration.prototype.$removeConfigurationOption = function (target, key, resourceUriComponenets) {
            var resource = resourceUriComponenets ? uri_1.default.revive(resourceUriComponenets) : null;
            return this.writeConfiguration(target, key, undefined, resource);
        };
        MainThreadConfiguration.prototype.writeConfiguration = function (target, key, value, resource) {
            target = target !== null && target !== undefined ? target : this.deriveConfigurationTarget(key, resource);
            return this.configurationService.updateValue(key, value, { resource: resource }, target, true);
        };
        MainThreadConfiguration.prototype.deriveConfigurationTarget = function (key, resource) {
            if (resource && this._workspaceContextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                var configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
                if (configurationProperties[key] && configurationProperties[key].scope === configurationRegistry_1.ConfigurationScope.RESOURCE) {
                    return configuration_2.ConfigurationTarget.WORKSPACE_FOLDER;
                }
            }
            return configuration_2.ConfigurationTarget.WORKSPACE;
        };
        MainThreadConfiguration.prototype.toConfigurationChangeEventData = function (event) {
            var _this = this;
            return {
                changedConfiguration: this.toJSONConfiguration(event.changedConfiguration),
                changedConfigurationByResource: event.changedConfigurationByResource.keys().reduce(function (result, resource) {
                    result[resource.toString()] = _this.toJSONConfiguration(event.changedConfigurationByResource.get(resource));
                    return result;
                }, Object.create({}))
            };
        };
        MainThreadConfiguration.prototype.toJSONConfiguration = function (_a) {
            var _b = _a === void 0 ? { contents: {}, keys: [], overrides: [] } : _a, contents = _b.contents, keys = _b.keys, overrides = _b.overrides;
            return {
                contents: contents,
                keys: keys,
                overrides: overrides
            };
        };
        MainThreadConfiguration = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadConfiguration),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, configuration_1.IWorkspaceConfigurationService)
        ], MainThreadConfiguration);
        return MainThreadConfiguration;
    }());
    exports.MainThreadConfiguration = MainThreadConfiguration;
});
