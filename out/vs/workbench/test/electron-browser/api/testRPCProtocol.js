/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base"], function (require, exports, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function SingleProxyRPCProtocol(thing) {
        return {
            getProxy: function () {
                return thing;
            },
            set: function (identifier, value) {
                return value;
            },
            assertRegistered: undefined
        };
    }
    exports.SingleProxyRPCProtocol = SingleProxyRPCProtocol;
    var TestRPCProtocol = /** @class */ (function () {
        function TestRPCProtocol() {
            this._callCountValue = 0;
            this._locals = Object.create(null);
            this._proxies = Object.create(null);
        }
        Object.defineProperty(TestRPCProtocol.prototype, "_callCount", {
            get: function () {
                return this._callCountValue;
            },
            set: function (value) {
                this._callCountValue = value;
                if (this._callCountValue === 0) {
                    if (this._completeIdle) {
                        this._completeIdle();
                    }
                    this._idle = undefined;
                }
            },
            enumerable: true,
            configurable: true
        });
        TestRPCProtocol.prototype.sync = function () {
            var _this = this;
            return new Promise(function (c) {
                setTimeout(c, 0);
            }).then(function () {
                if (_this._callCount === 0) {
                    return undefined;
                }
                if (!_this._idle) {
                    _this._idle = new Promise(function (c, e) {
                        _this._completeIdle = c;
                    });
                }
                return _this._idle;
            });
        };
        TestRPCProtocol.prototype.getProxy = function (identifier) {
            if (!this._proxies[identifier.id]) {
                this._proxies[identifier.id] = this._createProxy(identifier.id);
            }
            return this._proxies[identifier.id];
        };
        TestRPCProtocol.prototype._createProxy = function (proxyId) {
            var _this = this;
            var handler = {
                get: function (target, name) {
                    if (!target[name] && name.charCodeAt(0) === 36 /* DollarSign */) {
                        target[name] = function () {
                            var myArgs = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                myArgs[_i] = arguments[_i];
                            }
                            return _this._remoteCall(proxyId, name, myArgs);
                        };
                    }
                    return target[name];
                }
            };
            return new Proxy(Object.create(null), handler);
        };
        TestRPCProtocol.prototype.set = function (identifier, value) {
            this._locals[identifier.id] = value;
            return value;
        };
        TestRPCProtocol.prototype._remoteCall = function (proxyId, path, args) {
            var _this = this;
            this._callCount++;
            return new winjs_base_1.TPromise(function (c) {
                setTimeout(c, 0);
            }).then(function () {
                var instance = _this._locals[proxyId];
                // pretend the args went over the wire... (invoke .toJSON on objects...)
                var wireArgs = simulateWireTransfer(args);
                var p;
                try {
                    var result = instance[path].apply(instance, wireArgs);
                    p = winjs_base_1.TPromise.is(result) ? result : winjs_base_1.TPromise.as(result);
                }
                catch (err) {
                    p = winjs_base_1.TPromise.wrapError(err);
                }
                return p.then(function (result) {
                    _this._callCount--;
                    // pretend the result went over the wire... (invoke .toJSON on objects...)
                    var wireResult = simulateWireTransfer(result);
                    return wireResult;
                }, function (err) {
                    _this._callCount--;
                    return winjs_base_1.TPromise.wrapError(err);
                });
            });
        };
        TestRPCProtocol.prototype.assertRegistered = function (identifiers) {
            throw new Error('Not implemented!');
        };
        return TestRPCProtocol;
    }());
    exports.TestRPCProtocol = TestRPCProtocol;
    function simulateWireTransfer(obj) {
        if (!obj) {
            return obj;
        }
        return JSON.parse(JSON.stringify(obj));
    }
});
