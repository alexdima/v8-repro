/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "electron", "vs/platform/log/common/log"], function (require, exports, instantiation_1, event_1, electron_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IBroadcastService = instantiation_1.createDecorator('broadcastService');
    var BroadcastService = /** @class */ (function () {
        function BroadcastService(windowId, logService) {
            this.windowId = windowId;
            this.logService = logService;
            this._onBroadcast = new event_1.Emitter();
            this.registerListeners();
        }
        BroadcastService.prototype.registerListeners = function () {
            var _this = this;
            electron_1.ipcRenderer.on('vscode:broadcast', function (event, b) {
                _this.logService.trace("Received broadcast from main in window " + _this.windowId + ": ", b);
                _this._onBroadcast.fire(b);
            });
        };
        Object.defineProperty(BroadcastService.prototype, "onBroadcast", {
            get: function () {
                return this._onBroadcast.event;
            },
            enumerable: true,
            configurable: true
        });
        BroadcastService.prototype.broadcast = function (b) {
            this.logService.trace("Sending broadcast to main from window " + this.windowId + ": ", b);
            electron_1.ipcRenderer.send('vscode:broadcast', this.windowId, {
                channel: b.channel,
                payload: b.payload
            });
        };
        BroadcastService = __decorate([
            __param(1, log_1.ILogService)
        ], BroadcastService);
        return BroadcastService;
    }());
    exports.BroadcastService = BroadcastService;
});
