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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "events", "vs/base/parts/ipc/node/ipc.net"], function (require, exports, assert, winjs_base_1, events_1, ipc_net_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockDuplex = /** @class */ (function (_super) {
        __extends(MockDuplex, _super);
        function MockDuplex() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._cache = [];
            _this.destroyed = false;
            return _this;
        }
        MockDuplex.prototype._deliver = function () {
            if (this._cache.length) {
                var data = Buffer.concat(this._cache);
                this._cache.length = 0;
                this.emit('data', data);
            }
        };
        MockDuplex.prototype.write = function (data, cb) {
            var _this = this;
            this._cache.push(data);
            setImmediate(function () { return _this._deliver(); });
            return true;
        };
        return MockDuplex;
    }(events_1.EventEmitter));
    suite('IPC, Socket Protocol', function () {
        var stream;
        setup(function () {
            stream = new MockDuplex();
        });
        test('read/write', function () {
            var a = new ipc_net_1.Protocol(stream);
            var b = new ipc_net_1.Protocol(stream);
            return new winjs_base_1.TPromise(function (resolve) {
                var sub = b.onMessage(function (data) {
                    sub.dispose();
                    assert.equal(data, 'foobarfarboo');
                    resolve(null);
                });
                a.send('foobarfarboo');
            }).then(function () {
                return new winjs_base_1.TPromise(function (resolve) {
                    var sub = b.onMessage(function (data) {
                        sub.dispose();
                        assert.equal(data, 123);
                        resolve(null);
                    });
                    a.send(123);
                });
            });
        });
        test('read/write, object data', function () {
            var a = new ipc_net_1.Protocol(stream);
            var b = new ipc_net_1.Protocol(stream);
            var data = {
                pi: Math.PI,
                foo: 'bar',
                more: true,
                data: 'Hello World'.split('')
            };
            a.send(data);
            return new winjs_base_1.TPromise(function (resolve) {
                b.onMessage(function (msg) {
                    assert.deepEqual(msg, data);
                    resolve(null);
                });
            });
        });
    });
});
