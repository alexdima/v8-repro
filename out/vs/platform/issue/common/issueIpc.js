/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var IssueChannel = /** @class */ (function () {
        function IssueChannel(service) {
            this.service = service;
        }
        IssueChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'openIssueReporter':
                    return this.service.openReporter(arg);
            }
            return undefined;
        };
        return IssueChannel;
    }());
    exports.IssueChannel = IssueChannel;
    var IssueChannelClient = /** @class */ (function () {
        function IssueChannelClient(channel) {
            this.channel = channel;
        }
        IssueChannelClient.prototype.openReporter = function (data) {
            return this.channel.call('openIssueReporter', data);
        };
        return IssueChannelClient;
    }());
    exports.IssueChannelClient = IssueChannelClient;
});
