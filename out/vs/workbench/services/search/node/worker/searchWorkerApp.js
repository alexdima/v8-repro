/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "./searchWorkerIpc", "./searchWorker"], function (require, exports, ipc_cp_1, searchWorkerIpc_1, searchWorker_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var server = new ipc_cp_1.Server();
    var worker = new searchWorker_1.SearchWorker();
    var channel = new searchWorkerIpc_1.SearchWorkerChannel(worker);
    server.registerChannel('searchWorker', channel);
});
