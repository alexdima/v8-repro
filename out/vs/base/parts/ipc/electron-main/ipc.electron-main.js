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
define(["require", "exports", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.electron", "electron"], function (require, exports, event_1, ipc_1, ipc_electron_1, electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createScopedOnMessageEvent(senderId) {
        var onMessage = event_1.fromNodeEventEmitter(electron_1.ipcMain, 'ipc:message', function (event, message) { return ({ event: event, message: message }); });
        var onMessageFromSender = event_1.filterEvent(onMessage, function (_a) {
            var event = _a.event;
            return event.sender.getId() === senderId;
        });
        return event_1.mapEvent(onMessageFromSender, function (_a) {
            var message = _a.message;
            return message;
        });
    }
    var Server = /** @class */ (function (_super) {
        __extends(Server, _super);
        function Server() {
            return _super.call(this, Server.getOnDidClientConnect()) || this;
        }
        Server.getOnDidClientConnect = function () {
            var onHello = event_1.fromNodeEventEmitter(electron_1.ipcMain, 'ipc:hello', function (_a) {
                var sender = _a.sender;
                return sender;
            });
            return event_1.mapEvent(onHello, function (webContents) {
                var onMessage = createScopedOnMessageEvent(webContents.getId());
                var protocol = new ipc_electron_1.Protocol(webContents, onMessage);
                var onDidClientDisconnect = event_1.fromNodeEventEmitter(webContents, 'destroyed');
                return { protocol: protocol, onDidClientDisconnect: onDidClientDisconnect };
            });
        };
        return Server;
    }(ipc_1.IPCServer));
    exports.Server = Server;
});
