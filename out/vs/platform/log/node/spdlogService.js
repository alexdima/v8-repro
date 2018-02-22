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
define(["require", "exports", "path", "vs/platform/log/common/log", "spdlog"], function (require, exports, path, log_1, spdlog_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createSpdLogService(processName, logLevel, logsFolder) {
        try {
            spdlog_1.setAsyncMode(8192, 2000);
            var logfilePath = path.join(logsFolder, processName + ".log");
            var logger = new spdlog_1.RotatingLogger(processName, logfilePath, 1024 * 1024 * 5, 6);
            logger.setLevel(0);
            return new SpdLogService(logger, logLevel);
        }
        catch (e) {
            console.error(e);
        }
        return new log_1.NullLogService();
    }
    exports.createSpdLogService = createSpdLogService;
    var SpdLogService = /** @class */ (function (_super) {
        __extends(SpdLogService, _super);
        function SpdLogService(logger, level) {
            if (level === void 0) { level = log_1.LogLevel.Error; }
            var _this = _super.call(this) || this;
            _this.logger = logger;
            _this.setLevel(level);
            return _this;
        }
        SpdLogService.prototype.trace = function () {
            if (this.getLevel() <= log_1.LogLevel.Trace) {
                this.logger.trace(this.format(arguments));
            }
        };
        SpdLogService.prototype.debug = function () {
            if (this.getLevel() <= log_1.LogLevel.Debug) {
                this.logger.debug(this.format(arguments));
            }
        };
        SpdLogService.prototype.info = function () {
            if (this.getLevel() <= log_1.LogLevel.Info) {
                this.logger.info(this.format(arguments));
            }
        };
        SpdLogService.prototype.warn = function () {
            if (this.getLevel() <= log_1.LogLevel.Warning) {
                this.logger.warn(this.format(arguments));
            }
        };
        SpdLogService.prototype.error = function () {
            if (this.getLevel() <= log_1.LogLevel.Error) {
                var arg = arguments[0];
                if (arg instanceof Error) {
                    var array = Array.prototype.slice.call(arguments);
                    array[0] = arg.stack;
                    this.logger.error(this.format(array));
                }
                else {
                    this.logger.error(this.format(arguments));
                }
            }
        };
        SpdLogService.prototype.critical = function () {
            if (this.getLevel() <= log_1.LogLevel.Critical) {
                this.logger.critical(this.format(arguments));
            }
        };
        SpdLogService.prototype.dispose = function () {
            this.logger.drop();
        };
        SpdLogService.prototype.format = function (args) {
            var result = '';
            for (var i = 0; i < args.length; i++) {
                var a = args[i];
                if (typeof a === 'object') {
                    try {
                        a = JSON.stringify(a);
                    }
                    catch (e) { }
                }
                result += (i > 0 ? ' ' : '') + a;
            }
            return result;
        };
        return SpdLogService;
    }(log_1.AbstractLogService));
});
