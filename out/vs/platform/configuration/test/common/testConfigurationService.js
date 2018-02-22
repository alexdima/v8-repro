/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/winjs.base", "vs/platform/configuration/common/configuration"], function (require, exports, map_1, winjs_base_1, configuration_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestConfigurationService = /** @class */ (function () {
        function TestConfigurationService() {
            this.configuration = Object.create(null);
            this.configurationByRoot = map_1.TernarySearchTree.forPaths();
        }
        TestConfigurationService.prototype.reloadConfiguration = function () {
            return winjs_base_1.TPromise.as(this.getValue());
        };
        TestConfigurationService.prototype.getValue = function (arg1, arg2) {
            if (arg1 && typeof arg1 === 'string') {
                return this.inspect(arg1).value;
            }
            var overrides = configuration_1.isConfigurationOverrides(arg1) ? arg1 : configuration_1.isConfigurationOverrides(arg2) ? arg2 : void 0;
            if (overrides && overrides.resource) {
                var configForResource = this.configurationByRoot.findSubstr(overrides.resource.fsPath);
                return configForResource || this.configuration;
            }
            return this.configuration;
        };
        TestConfigurationService.prototype.updateValue = function (key, overrides) {
            return winjs_base_1.TPromise.as(null);
        };
        TestConfigurationService.prototype.setUserConfiguration = function (key, value, root) {
            if (root) {
                var configForRoot = this.configurationByRoot.get(root.fsPath) || Object.create(null);
                configForRoot[key] = value;
                this.configurationByRoot.set(root.fsPath, configForRoot);
            }
            else {
                this.configuration[key] = value;
            }
            return winjs_base_1.TPromise.as(null);
        };
        TestConfigurationService.prototype.onDidChangeConfiguration = function () {
            return { dispose: function () { } };
        };
        TestConfigurationService.prototype.inspect = function (key, overrides) {
            var config = this.getValue(undefined, overrides);
            return {
                value: configuration_1.getConfigurationValue(config, key),
                default: configuration_1.getConfigurationValue(config, key),
                user: configuration_1.getConfigurationValue(config, key),
                workspace: null,
                workspaceFolder: null
            };
        };
        TestConfigurationService.prototype.keys = function () {
            return {
                default: configuration_1.getConfigurationKeys(),
                user: Object.keys(this.configuration),
                workspace: [],
                workspaceFolder: []
            };
        };
        TestConfigurationService.prototype.getConfigurationData = function () {
            return null;
        };
        return TestConfigurationService;
    }());
    exports.TestConfigurationService = TestConfigurationService;
});
