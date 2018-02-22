define(["require", "exports", "vs/base/common/winjs.base", "vs/base/parts/ipc/common/ipc", "vs/base/common/event"], function (require, exports, winjs_base_1, ipc_1, event_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestService = /** @class */ (function () {
        function TestService() {
            this._onMarco = new event_1.Emitter();
            this.onMarco = this._onMarco.event;
            this._data = 'abcdefghijklmnopqrstuvwxyz';
        }
        TestService.prototype.marco = function () {
            this._onMarco.fire({ answer: 'polo' });
            return winjs_base_1.TPromise.as('polo');
        };
        TestService.prototype.pong = function (ping) {
            return winjs_base_1.TPromise.as({ incoming: ping, outgoing: 'pong' });
        };
        TestService.prototype.cancelMe = function () {
            return winjs_base_1.TPromise.timeout(100).then(function () { return true; });
        };
        TestService.prototype.batchPerf = function (batches, size, dataSize) {
            while (this._data.length < dataSize) {
                this._data += this._data;
            }
            var self = this;
            return new winjs_base_1.PPromise(function (complete, error, progress) {
                var j = 0;
                function send() {
                    if (j >= batches) {
                        complete(null);
                        return;
                    }
                    j++;
                    var batch = [];
                    for (var i = 0; i < size; i++) {
                        batch.push({
                            prop: ("" + i + self._data).substr(0, dataSize)
                        });
                    }
                    progress(batch);
                    process.nextTick(send);
                }
                process.nextTick(send);
            });
        };
        return TestService;
    }());
    exports.TestService = TestService;
    var TestChannel = /** @class */ (function () {
        function TestChannel(testService) {
            this.testService = testService;
        }
        TestChannel.prototype.call = function (command) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            switch (command) {
                case 'pong': return this.testService.pong(args[0]);
                case 'cancelMe': return this.testService.cancelMe();
                case 'marco': return this.testService.marco();
                case 'event:marco': return ipc_1.eventToCall(this.testService.onMarco);
                case 'batchPerf': return this.testService.batchPerf(args[0].batches, args[0].size, args[0].dataSize);
                default: return winjs_base_1.TPromise.wrapError(new Error('command not found'));
            }
        };
        return TestChannel;
    }());
    exports.TestChannel = TestChannel;
    var TestServiceClient = /** @class */ (function () {
        function TestServiceClient(channel) {
            this.channel = channel;
            this._onMarco = ipc_1.eventFromCall(channel, 'event:marco');
        }
        Object.defineProperty(TestServiceClient.prototype, "onMarco", {
            get: function () { return this._onMarco; },
            enumerable: true,
            configurable: true
        });
        TestServiceClient.prototype.marco = function () {
            return this.channel.call('marco');
        };
        TestServiceClient.prototype.pong = function (ping) {
            return this.channel.call('pong', ping);
        };
        TestServiceClient.prototype.cancelMe = function () {
            return this.channel.call('cancelMe');
        };
        TestServiceClient.prototype.batchPerf = function (batches, size, dataSize) {
            return this.channel.call('batchPerf', { batches: batches, size: size, dataSize: dataSize });
        };
        return TestServiceClient;
    }());
    exports.TestServiceClient = TestServiceClient;
});
