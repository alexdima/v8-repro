/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "../node/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/workbench/api/electron-browser/extHostCustomers", "vs/base/common/async", "util"], function (require, exports, extHost_protocol_1, instantiation_1, extensions_1, event_1, extHostCustomers_1, async_1, util_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IHeapService = instantiation_1.createDecorator('heapService');
    var HeapService = /** @class */ (function () {
        function HeapService() {
            this._onGarbageCollection = new event_1.Emitter();
            this.onGarbageCollection = this._onGarbageCollection.event;
            this._activeSignals = new WeakMap();
            this._activeIds = new Set();
            //
        }
        HeapService.prototype.dispose = function () {
            clearInterval(this._consumeHandle);
        };
        HeapService.prototype.trackRecursive = function (obj) {
            var _this = this;
            if (async_1.isThenable(obj)) {
                return obj.then(function (result) { return _this.trackRecursive(result); });
            }
            else {
                return this._doTrackRecursive(obj);
            }
        };
        HeapService.prototype._doTrackRecursive = function (obj) {
            var _this = this;
            if (util_1.isNullOrUndefined(obj)) {
                return Promise.resolve(obj);
            }
            return new Promise(function (resolve_1, reject_1) { require(['gc-signals'], resolve_1, reject_1); }).then(function (_a) {
                var GCSignal = _a.GCSignal, consumeSignals = _a.consumeSignals;
                if (_this._consumeHandle === void 0) {
                    // ensure that there is one consumer of signals
                    _this._consumeHandle = setInterval(function () {
                        var ids = consumeSignals();
                        if (ids.length > 0) {
                            // local book-keeping
                            for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                                var id = ids_1[_i];
                                _this._activeIds.delete(id);
                            }
                            // fire event
                            _this._onGarbageCollection.fire(ids);
                        }
                    }, 15 * 1000);
                }
                var stack = [obj];
                while (stack.length > 0) {
                    // remove first element
                    var obj_1 = stack.shift();
                    if (!obj_1 || typeof obj_1 !== 'object') {
                        continue;
                    }
                    for (var key in obj_1) {
                        if (!Object.prototype.hasOwnProperty.call(obj_1, key)) {
                            continue;
                        }
                        var value = obj_1[key];
                        // recurse -> object/array
                        if (typeof value === 'object') {
                            stack.push(value);
                        }
                        else if (key === extHost_protocol_1.ObjectIdentifier.name) {
                            // track new $ident-objects
                            if (typeof value === 'number' && !_this._activeIds.has(value)) {
                                _this._activeIds.add(value);
                                _this._activeSignals.set(obj_1, new GCSignal(value));
                            }
                        }
                    }
                }
                return obj;
            });
        };
        return HeapService;
    }());
    exports.HeapService = HeapService;
    var MainThreadHeapService = /** @class */ (function () {
        function MainThreadHeapService(extHostContext, heapService) {
            var proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostHeapService);
            this._toDispose = heapService.onGarbageCollection(function (ids) {
                // send to ext host
                proxy.$onGarbageCollection(ids);
            });
        }
        MainThreadHeapService.prototype.dispose = function () {
            this._toDispose.dispose();
        };
        MainThreadHeapService = __decorate([
            extHostCustomers_1.extHostCustomer,
            __param(1, exports.IHeapService)
        ], MainThreadHeapService);
        return MainThreadHeapService;
    }());
    exports.MainThreadHeapService = MainThreadHeapService;
    extensions_1.registerSingleton(exports.IHeapService, HeapService);
});
