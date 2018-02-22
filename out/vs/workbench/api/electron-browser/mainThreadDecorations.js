var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers", "vs/workbench/services/decorations/browser/decorations"], function (require, exports, uri_1, event_1, lifecycle_1, extHost_protocol_1, extHostCustomers_1, decorations_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DecorationRequestsQueue = /** @class */ (function () {
        function DecorationRequestsQueue(_proxy) {
            this._proxy = _proxy;
            this._idPool = 0;
            this._requests = [];
            this._resolver = Object.create(null);
            //
        }
        DecorationRequestsQueue.prototype.enqueue = function (handle, uri) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var id = ++_this._idPool;
                _this._requests.push({ id: id, handle: handle, uri: uri });
                _this._resolver[id] = resolve;
                _this._processQueue();
            });
        };
        DecorationRequestsQueue.prototype._processQueue = function () {
            var _this = this;
            if (typeof this._timer === 'number') {
                // already queued
                return;
            }
            this._timer = setTimeout(function () {
                // make request
                var requests = _this._requests;
                var resolver = _this._resolver;
                _this._proxy.$provideDecorations(requests).then(function (data) {
                    for (var id in resolver) {
                        resolver[id](data[id]);
                    }
                });
                // reset
                _this._requests = [];
                _this._resolver = [];
                _this._timer = void 0;
            }, 0);
        };
        return DecorationRequestsQueue;
    }());
    var MainThreadDecorations = /** @class */ (function () {
        function MainThreadDecorations(context, _decorationsService) {
            this._decorationsService = _decorationsService;
            this._provider = new Map();
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDecorations);
            this._requestQueue = new DecorationRequestsQueue(this._proxy);
        }
        MainThreadDecorations.prototype.dispose = function () {
            this._provider.forEach(function (value) { return lifecycle_1.dispose(value); });
            this._provider.clear();
        };
        MainThreadDecorations.prototype.$registerDecorationProvider = function (handle, label) {
            var _this = this;
            var emitter = new event_1.Emitter();
            var registration = this._decorationsService.registerDecorationsProvider({
                label: label,
                onDidChange: emitter.event,
                provideDecorations: function (uri) {
                    return _this._requestQueue.enqueue(handle, uri).then(function (data) {
                        if (!data) {
                            return undefined;
                        }
                        var weight = data[0], bubble = data[1], tooltip = data[2], letter = data[3], themeColor = data[4], source = data[5];
                        return {
                            weight: weight || 0,
                            bubble: bubble || false,
                            color: themeColor && themeColor.id,
                            tooltip: tooltip,
                            letter: letter,
                            source: source,
                        };
                    });
                }
            });
            this._provider.set(handle, [emitter, registration]);
        };
        MainThreadDecorations.prototype.$onDidChange = function (handle, resources) {
            var emitter = this._provider.get(handle)[0];
            emitter.fire(resources && resources.map(uri_1.default.revive));
        };
        MainThreadDecorations.prototype.$unregisterDecorationProvider = function (handle) {
            if (this._provider.has(handle)) {
                lifecycle_1.dispose(this._provider.get(handle));
                this._provider.delete(handle);
            }
        };
        MainThreadDecorations = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadDecorations),
            __param(1, decorations_1.IDecorationsService)
        ], MainThreadDecorations);
        return MainThreadDecorations;
    }());
    exports.MainThreadDecorations = MainThreadDecorations;
});
