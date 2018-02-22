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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/platform/configuration/node/configuration"], function (require, exports, platform_1, configurationRegistry_1, lifecycle_1, configuration_1, configurationModels_1, event_1, environment_1, winjs_base_1, objects_1, configuration_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConfigurationService = /** @class */ (function (_super) {
        __extends(ConfigurationService, _super);
        function ConfigurationService(environmentService) {
            var _this = _super.call(this) || this;
            _this._onDidChangeConfiguration = _this._register(new event_1.Emitter());
            _this.onDidChangeConfiguration = _this._onDidChangeConfiguration.event;
            _this.userConfiguration = _this._register(new configuration_2.UserConfiguration(environmentService.appSettingsPath));
            _this.reset();
            // Listeners
            _this._register(_this.userConfiguration.onDidChangeConfiguration(function () { return _this.onDidChangeUserConfiguration(); }));
            _this._register(platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).onDidRegisterConfiguration(function (configurationProperties) { return _this.onDidRegisterConfiguration(configurationProperties); }));
            return _this;
        }
        Object.defineProperty(ConfigurationService.prototype, "configuration", {
            get: function () {
                return this._configuration;
            },
            enumerable: true,
            configurable: true
        });
        ConfigurationService.prototype.getConfigurationData = function () {
            return this.configuration.toData();
        };
        ConfigurationService.prototype.getValue = function (arg1, arg2) {
            var section = typeof arg1 === 'string' ? arg1 : void 0;
            var overrides = configuration_1.isConfigurationOverrides(arg1) ? arg1 : configuration_1.isConfigurationOverrides(arg2) ? arg2 : {};
            return this.configuration.getValue(section, overrides, null);
        };
        ConfigurationService.prototype.updateValue = function (key, value, arg3, arg4) {
            return winjs_base_1.TPromise.wrapError(new Error('not supported'));
        };
        ConfigurationService.prototype.inspect = function (key) {
            return this.configuration.inspect(key, {}, null);
        };
        ConfigurationService.prototype.keys = function () {
            return this.configuration.keys(null);
        };
        ConfigurationService.prototype.reloadConfiguration = function (folder) {
            var _this = this;
            return folder ? winjs_base_1.TPromise.as(null) :
                this.userConfiguration.reload().then(function () { return _this.onDidChangeUserConfiguration(); });
        };
        ConfigurationService.prototype.onDidChangeUserConfiguration = function () {
            var _this = this;
            var changedKeys = [];
            var _a = configuration_1.compare(this._configuration.user, this.userConfiguration.configurationModel), added = _a.added, updated = _a.updated, removed = _a.removed;
            changedKeys = added.concat(updated, removed);
            if (changedKeys.length) {
                var oldConfiguartion_1 = this._configuration;
                this.reset();
                changedKeys = changedKeys.filter(function (key) { return !objects_1.equals(oldConfiguartion_1.getValue(key, {}, null), _this._configuration.getValue(key, {}, null)); });
                if (changedKeys.length) {
                    this.trigger(changedKeys, configuration_1.ConfigurationTarget.USER);
                }
            }
        };
        ConfigurationService.prototype.onDidRegisterConfiguration = function (keys) {
            this.reset(); // reset our caches
            this.trigger(keys, configuration_1.ConfigurationTarget.DEFAULT);
        };
        ConfigurationService.prototype.reset = function () {
            var defaults = new configurationModels_1.DefaultConfigurationModel();
            var user = this.userConfiguration.configurationModel;
            this._configuration = new configurationModels_1.Configuration(defaults, user);
        };
        ConfigurationService.prototype.trigger = function (keys, source) {
            this._onDidChangeConfiguration.fire(new configurationModels_1.ConfigurationChangeEvent().change(keys).telemetryData(source, this.getTargetConfiguration(source)));
        };
        ConfigurationService.prototype.getTargetConfiguration = function (target) {
            switch (target) {
                case configuration_1.ConfigurationTarget.DEFAULT:
                    return this._configuration.defaults.contents;
                case configuration_1.ConfigurationTarget.USER:
                    return this._configuration.user.contents;
            }
            return {};
        };
        ConfigurationService = __decorate([
            __param(0, environment_1.IEnvironmentService)
        ], ConfigurationService);
        return ConfigurationService;
    }(lifecycle_1.Disposable));
    exports.ConfigurationService = ConfigurationService;
});
