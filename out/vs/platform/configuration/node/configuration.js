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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/platform/configuration/common/configurationModels", "vs/base/node/config", "vs/base/common/event", "vs/base/common/winjs.base"], function (require, exports, lifecycle_1, errors_1, configurationModels_1, config_1, event_1, winjs_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UserConfiguration = /** @class */ (function (_super) {
        __extends(UserConfiguration, _super);
        function UserConfiguration(settingsPath) {
            var _this = _super.call(this) || this;
            _this._onDidChangeConfiguration = _this._register(new event_1.Emitter());
            _this.onDidChangeConfiguration = _this._onDidChangeConfiguration.event;
            _this.userConfigModelWatcher = new config_1.ConfigWatcher(settingsPath, {
                changeBufferDelay: 300, onError: function (error) { return errors_1.onUnexpectedError(error); }, defaultConfig: new configurationModels_1.ConfigurationModelParser(settingsPath), parse: function (content, parseErrors) {
                    var userConfigModelParser = new configurationModels_1.ConfigurationModelParser(settingsPath);
                    userConfigModelParser.parse(content);
                    parseErrors = userConfigModelParser.errors.slice();
                    return userConfigModelParser;
                }
            });
            _this._register(_this.userConfigModelWatcher);
            // Listeners
            _this._register(_this.userConfigModelWatcher.onDidUpdateConfiguration(function () { return _this._onDidChangeConfiguration.fire(_this.configurationModel); }));
            return _this;
        }
        Object.defineProperty(UserConfiguration.prototype, "configurationModel", {
            get: function () {
                return this.userConfigModelWatcher.getConfig().configurationModel;
            },
            enumerable: true,
            configurable: true
        });
        UserConfiguration.prototype.reload = function () {
            var _this = this;
            return new winjs_base_1.TPromise(function (c) { return _this.userConfigModelWatcher.reload(function () { return c(null); }); });
        };
        return UserConfiguration;
    }(lifecycle_1.Disposable));
    exports.UserConfiguration = UserConfiguration;
});
