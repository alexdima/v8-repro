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
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/base/common/winjs.base", "vs/platform/log/common/log", "vs/base/common/event"], function (require, exports, ipc_1, winjs_base_1, log_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LogLevelSetterChannel = /** @class */ (function () {
        function LogLevelSetterChannel(service) {
            this.service = service;
            this.onDidChangeLogLevel = event_1.buffer(service.onDidChangeLogLevel, true);
        }
        LogLevelSetterChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'event:onDidChangeLogLevel': return ipc_1.eventToCall(this.onDidChangeLogLevel);
                case 'setLevel':
                    this.service.setLevel(arg);
                    return winjs_base_1.TPromise.as(null);
            }
            return undefined;
        };
        return LogLevelSetterChannel;
    }());
    exports.LogLevelSetterChannel = LogLevelSetterChannel;
    var LogLevelSetterChannelClient = /** @class */ (function () {
        function LogLevelSetterChannelClient(channel) {
            this.channel = channel;
            this._onDidChangeLogLevel = ipc_1.eventFromCall(this.channel, 'event:onDidChangeLogLevel');
        }
        Object.defineProperty(LogLevelSetterChannelClient.prototype, "onDidChangeLogLevel", {
            get: function () { return this._onDidChangeLogLevel; },
            enumerable: true,
            configurable: true
        });
        LogLevelSetterChannelClient.prototype.setLevel = function (level) {
            return this.channel.call('setLevel', level);
        };
        return LogLevelSetterChannelClient;
    }());
    exports.LogLevelSetterChannelClient = LogLevelSetterChannelClient;
    var FollowerLogService = /** @class */ (function (_super) {
        __extends(FollowerLogService, _super);
        function FollowerLogService(master, logService) {
            var _this = _super.call(this, logService) || this;
            _this.master = master;
            _this._register(master.onDidChangeLogLevel(function (level) { return logService.setLevel(level); }));
            return _this;
        }
        FollowerLogService.prototype.setLevel = function (level) {
            this.master.setLevel(level);
        };
        return FollowerLogService;
    }(log_1.DelegatedLogService));
    exports.FollowerLogService = FollowerLogService;
});
