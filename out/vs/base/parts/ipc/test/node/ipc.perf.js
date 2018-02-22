/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/parts/ipc/node/ipc.cp", "vs/base/common/uri", "vs/base/common/async", "./testService"], function (require, exports, assert, ipc_cp_1, uri_1, async_1, testService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createClient() {
        return new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
            serverName: 'TestServer',
            env: { AMD_ENTRYPOINT: 'vs/base/parts/ipc/test/node/testApp', verbose: true }
        });
    }
    // Rename to ipc.perf.test.ts and run with ./scripts/test.sh --grep IPC.performance --timeout 60000
    suite('IPC performance', function () {
        test('increasing batch size', function () {
            var client = createClient();
            var channel = client.getChannel('test');
            var service = new testService_1.TestServiceClient(channel);
            var runs = [
                { batches: 250000, size: 1 },
                { batches: 2500, size: 100 },
                { batches: 500, size: 500 },
                { batches: 250, size: 1000 },
                { batches: 50, size: 5000 },
                { batches: 25, size: 10000 },
            ];
            var dataSizes = [
                100,
                250,
            ];
            var i = 0, j = 0;
            var result = measure(service, 10, 10, 250) // warm-up
                .then(function () {
                return (function nextRun() {
                    if (i >= runs.length) {
                        if (++j >= dataSizes.length) {
                            return;
                        }
                        i = 0;
                    }
                    var run = runs[i++];
                    return measure(service, run.batches, run.size, dataSizes[j])
                        .then(function () {
                        return nextRun();
                    });
                })();
            });
            return async_1.always(result, function () { return client.dispose(); });
        });
        test('increasing raw data size', function () {
            var client = createClient();
            var channel = client.getChannel('test');
            var service = new testService_1.TestServiceClient(channel);
            var runs = [
                { batches: 250000, dataSize: 100 },
                { batches: 25000, dataSize: 1000 },
                { batches: 2500, dataSize: 10000 },
                { batches: 1250, dataSize: 20000 },
                { batches: 500, dataSize: 50000 },
                { batches: 250, dataSize: 100000 },
                { batches: 125, dataSize: 200000 },
                { batches: 50, dataSize: 500000 },
                { batches: 25, dataSize: 1000000 },
            ];
            var i = 0;
            var result = measure(service, 10, 10, 250) // warm-up
                .then(function () {
                return (function nextRun() {
                    if (i >= runs.length) {
                        return;
                    }
                    var run = runs[i++];
                    return measure(service, run.batches, 1, run.dataSize)
                        .then(function () {
                        return nextRun();
                    });
                })();
            });
            return async_1.always(result, function () { return client.dispose(); });
        });
        function measure(service, batches, size, dataSize) {
            var start = Date.now();
            var hits = 0;
            var count = 0;
            return service.batchPerf(batches, size, dataSize)
                .then(function () {
                console.log("Batches: " + batches + ", size: " + size + ", dataSize: " + dataSize + ", n: " + batches * size * dataSize + ", duration: " + (Date.now() - start));
                assert.strictEqual(hits, batches);
                assert.strictEqual(count, batches * size);
            }, function (err) { return assert.fail(err); }, function (batch) {
                hits++;
                count += batch.length;
            });
        }
    });
});
