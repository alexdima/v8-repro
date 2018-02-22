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
    var Client = /** @class */ (function (_super) {
        __extends(Client, _super);
        function Client(id) {
            return _super.call(this, Client.createProtocol(), id) || this;
        }
        Client.createProtocol = function () {
            var onMessage = event_1.fromNodeEventEmitter(electron_1.ipcRenderer, 'ipc:message', function (_, message) { return message; });
            electron_1.ipcRenderer.send('ipc:hello');
            return new ipc_electron_1.Protocol(electron_1.ipcRenderer, onMessage);
        };
        return Client;
    }(ipc_1.IPCClient));
    exports.Client = Client;
});
