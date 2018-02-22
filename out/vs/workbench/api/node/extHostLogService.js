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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/paths", "vs/base/node/pfs", "vs/platform/log/common/log", "vs/platform/log/node/spdlogService", "vs/base/common/decorators"], function (require, exports, winjs_base_1, paths_1, pfs_1, log_1, spdlogService_1, decorators_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostLogService = /** @class */ (function (_super) {
        __extends(ExtHostLogService, _super);
        function ExtHostLogService(_windowId, logLevel, _environmentService) {
            var _this = _super.call(this, spdlogService_1.createSpdLogService("exthost" + _windowId, logLevel, _environmentService.logsPath)) || this;
            _this._windowId = _windowId;
            _this._environmentService = _environmentService;
            _this._loggers = new Map();
            return _this;
        }
        ExtHostLogService.prototype.$setLevel = function (level) {
            this.setLevel(level);
        };
        ExtHostLogService.prototype.getExtLogger = function (extensionID) {
            var logger = this._loggers.get(extensionID);
            if (!logger) {
                logger = this.createLogger(extensionID);
                this._loggers.set(extensionID, logger);
            }
            return logger;
        };
        ExtHostLogService.prototype.createLogger = function (extensionID) {
            var logsDirPath = paths_1.join(this._environmentService.logsPath, extensionID + "_" + this._windowId);
            var logService = spdlogService_1.createSpdLogService(extensionID, this.getLevel(), logsDirPath);
            this._register(this.onDidChangeLogLevel(function (level) { return logService.setLevel(level); }));
            return new ExtHostLogger(logService, logsDirPath);
        };
        return ExtHostLogService;
    }(log_1.DelegatedLogService));
    exports.ExtHostLogService = ExtHostLogService;
    var ExtHostLogger = /** @class */ (function () {
        function ExtHostLogger(_logService, _logDirectory) {
            this._logService = _logService;
            this._logDirectory = _logDirectory;
        }
        Object.defineProperty(ExtHostLogger.prototype, "onDidChangeLogLevel", {
            get: function () {
                return this._logService.onDidChangeLogLevel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostLogger.prototype, "currentLevel", {
            get: function () { return this._logService.getLevel(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostLogger.prototype, "logDirectory", {
            get: function () {
                var _this = this;
                return pfs_1.dirExists(this._logDirectory).then(function (exists) {
                    if (exists) {
                        return winjs_base_1.TPromise.wrap(null);
                    }
                    else {
                        return pfs_1.mkdirp(_this._logDirectory);
                    }
                }).then(function () {
                    return _this._logDirectory;
                });
            },
            enumerable: true,
            configurable: true
        });
        ExtHostLogger.prototype.trace = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).trace.apply(_a, [message].concat(args));
            var _a;
        };
        ExtHostLogger.prototype.debug = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).debug.apply(_a, [message].concat(args));
            var _a;
        };
        ExtHostLogger.prototype.info = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).info.apply(_a, [message].concat(args));
            var _a;
        };
        ExtHostLogger.prototype.warn = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).warn.apply(_a, [message].concat(args));
            var _a;
        };
        ExtHostLogger.prototype.error = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).error.apply(_a, [message].concat(args));
            var _a;
        };
        ExtHostLogger.prototype.critical = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this._logService).critical.apply(_a, [message].concat(args));
            var _a;
        };
        __decorate([
            decorators_1.memoize
        ], ExtHostLogger.prototype, "logDirectory", null);
        return ExtHostLogger;
    }());
    exports.ExtHostLogger = ExtHostLogger;
});
