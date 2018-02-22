/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/base/common/event"], function (require, exports, ipc_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LocalizationsChannel = /** @class */ (function () {
        function LocalizationsChannel(service) {
            this.service = service;
            this.onDidLanguagesChange = event_1.buffer(service.onDidLanguagesChange, true);
        }
        LocalizationsChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'event:onDidLanguagesChange': return ipc_1.eventToCall(this.onDidLanguagesChange);
                case 'getLanguageIds': return this.service.getLanguageIds();
            }
            return undefined;
        };
        return LocalizationsChannel;
    }());
    exports.LocalizationsChannel = LocalizationsChannel;
    var LocalizationsChannelClient = /** @class */ (function () {
        function LocalizationsChannelClient(channel) {
            this.channel = channel;
            this._onDidLanguagesChange = ipc_1.eventFromCall(this.channel, 'event:onDidLanguagesChange');
        }
        Object.defineProperty(LocalizationsChannelClient.prototype, "onDidLanguagesChange", {
            get: function () { return this._onDidLanguagesChange; },
            enumerable: true,
            configurable: true
        });
        LocalizationsChannelClient.prototype.getLanguageIds = function () {
            return this.channel.call('getLanguageIds');
        };
        return LocalizationsChannelClient;
    }());
    exports.LocalizationsChannelClient = LocalizationsChannelClient;
});
