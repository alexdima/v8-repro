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
define(["require", "exports", "vs/platform/log/common/log"], function (require, exports, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getLogFunction(logger, level) {
        switch (level) {
            case log_1.LogLevel.Trace: return logger.trace;
            case log_1.LogLevel.Debug: return logger.debug;
            case log_1.LogLevel.Info: return logger.info;
            case log_1.LogLevel.Warning: return logger.warn;
            case log_1.LogLevel.Error: return logger.error;
            case log_1.LogLevel.Critical: return logger.critical;
            default: throw new Error('Invalid log level');
        }
    }
    var BufferLogService = /** @class */ (function (_super) {
        __extends(BufferLogService, _super);
        function BufferLogService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.buffer = [];
            _this._logger = undefined;
            return _this;
        }
        Object.defineProperty(BufferLogService.prototype, "logger", {
            set: function (logger) {
                this._logger = logger;
                for (var _i = 0, _a = this.buffer; _i < _a.length; _i++) {
                    var _b = _a[_i], level = _b.level, args = _b.args;
                    var fn = getLogFunction(logger, level);
                    fn.apply(logger, args);
                }
                this.buffer = [];
            },
            enumerable: true,
            configurable: true
        });
        BufferLogService.prototype._log = function (level, args) {
            if (this._logger) {
                var fn = getLogFunction(this._logger, level);
                fn.apply(this._logger, args);
            }
            else if (this.getLevel() <= level) {
                this.buffer.push({ level: level, args: args });
            }
        };
        BufferLogService.prototype.trace = function () {
            this._log(log_1.LogLevel.Trace, arguments);
        };
        BufferLogService.prototype.debug = function () {
            this._log(log_1.LogLevel.Debug, arguments);
        };
        BufferLogService.prototype.info = function () {
            this._log(log_1.LogLevel.Info, arguments);
        };
        BufferLogService.prototype.warn = function () {
            this._log(log_1.LogLevel.Warning, arguments);
        };
        BufferLogService.prototype.error = function () {
            this._log(log_1.LogLevel.Error, arguments);
        };
        BufferLogService.prototype.critical = function () {
            this._log(log_1.LogLevel.Critical, arguments);
        };
        BufferLogService.prototype.dispose = function () {
            if (this._logger) {
                this._logger.dispose();
            }
        };
        return BufferLogService;
    }(log_1.AbstractLogService));
    exports.BufferLogService = BufferLogService;
});
