/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/uri", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "./worker/searchWorkerIpc"], function (require, exports, os, uri_1, ipc, ipc_cp_1, searchWorkerIpc_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextSearchWorkerProvider = /** @class */ (function () {
        function TextSearchWorkerProvider() {
            this.workers = [];
        }
        TextSearchWorkerProvider.prototype.getWorkers = function () {
            var numWorkers = os.cpus().length;
            while (this.workers.length < numWorkers) {
                this.createWorker();
            }
            return this.workers;
        };
        TextSearchWorkerProvider.prototype.createWorker = function () {
            var client = new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                serverName: 'Search Worker ' + this.workers.length,
                args: ['--type=searchWorker'],
                timeout: 30 * 1000,
                env: {
                    AMD_ENTRYPOINT: 'vs/workbench/services/search/node/worker/searchWorkerApp',
                    PIPE_LOGGING: 'true',
                    VERBOSE_LOGGING: process.env.VERBOSE_LOGGING
                },
                useQueue: true
            });
            var channel = ipc.getNextTickChannel(client.getChannel('searchWorker'));
            var channelClient = new searchWorkerIpc_1.SearchWorkerChannelClient(channel);
            this.workers.push(channelClient);
        };
        return TextSearchWorkerProvider;
    }());
    exports.TextSearchWorkerProvider = TextSearchWorkerProvider;
});
