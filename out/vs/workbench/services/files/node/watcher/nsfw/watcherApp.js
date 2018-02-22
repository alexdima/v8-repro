define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "vs/workbench/services/files/node/watcher/nsfw/watcherIpc", "vs/workbench/services/files/node/watcher/nsfw/nsfwWatcherService"], function (require, exports, ipc_cp_1, watcherIpc_1, nsfwWatcherService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var server = new ipc_cp_1.Server();
    var service = new nsfwWatcherService_1.NsfwWatcherService();
    var channel = new watcherIpc_1.WatcherChannel(service);
    server.registerChannel('watcher', channel);
});
