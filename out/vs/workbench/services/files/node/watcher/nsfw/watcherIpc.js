/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WatcherChannel = /** @class */ (function () {
        function WatcherChannel(service) {
            this.service = service;
        }
        WatcherChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'initialize': return this.service.initialize(arg);
                case 'setRoots': return this.service.setRoots(arg);
            }
            return undefined;
        };
        return WatcherChannel;
    }());
    exports.WatcherChannel = WatcherChannel;
    var WatcherChannelClient = /** @class */ (function () {
        function WatcherChannelClient(channel) {
            this.channel = channel;
        }
        WatcherChannelClient.prototype.initialize = function (verboseLogging) {
            return this.channel.call('initialize', verboseLogging);
        };
        WatcherChannelClient.prototype.setRoots = function (roots) {
            return this.channel.call('setRoots', roots);
        };
        return WatcherChannelClient;
    }());
    exports.WatcherChannelClient = WatcherChannelClient;
});
