/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkspacesChannel = /** @class */ (function () {
        function WorkspacesChannel(service) {
            this.service = service;
        }
        WorkspacesChannel.prototype.call = function (command, arg) {
            switch (command) {
                case 'createWorkspace': {
                    var rawFolders = arg;
                    var folders = void 0;
                    if (Array.isArray(rawFolders)) {
                        folders = rawFolders.map(function (rawFolder) {
                            return {
                                uri: uri_1.default.revive(rawFolder.uri),
                                name: rawFolder.name
                            };
                        });
                    }
                    return this.service.createWorkspace(folders);
                }
            }
            return void 0;
        };
        return WorkspacesChannel;
    }());
    exports.WorkspacesChannel = WorkspacesChannel;
    var WorkspacesChannelClient = /** @class */ (function () {
        function WorkspacesChannelClient(channel) {
            this.channel = channel;
        }
        WorkspacesChannelClient.prototype.createWorkspace = function (folders) {
            return this.channel.call('createWorkspace', folders);
        };
        return WorkspacesChannelClient;
    }());
    exports.WorkspacesChannelClient = WorkspacesChannelClient;
});
