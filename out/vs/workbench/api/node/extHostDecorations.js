define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/node/extHost.protocol", "vs/base/common/winjs.base", "vs/workbench/api/node/extHostTypes", "vs/base/common/async"], function (require, exports, uri_1, extHost_protocol_1, winjs_base_1, extHostTypes_1, async_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDecorations = /** @class */ (function () {
        function ExtHostDecorations(mainContext) {
            this._provider = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDecorations);
        }
        ExtHostDecorations.prototype.registerDecorationProvider = function (provider, label) {
            var _this = this;
            var handle = ExtHostDecorations._handlePool++;
            this._provider.set(handle, provider);
            this._proxy.$registerDecorationProvider(handle, label);
            var listener = provider.onDidChangeDecorations(function (e) {
                _this._proxy.$onDidChange(handle, !e ? null : Array.isArray(e) ? e : [e]);
            });
            return new extHostTypes_1.Disposable(function () {
                listener.dispose();
                _this._proxy.$unregisterDecorationProvider(handle);
                _this._provider.delete(handle);
            });
        };
        ExtHostDecorations.prototype.$provideDecorations = function (requests) {
            var _this = this;
            var result = Object.create(null);
            return winjs_base_1.TPromise.join(requests.map(function (request) {
                var handle = request.handle, uri = request.uri, id = request.id;
                var provider = _this._provider.get(handle);
                return async_1.asWinJsPromise(function (token) { return provider.provideDecoration(uri_1.default.revive(uri), token); }).then(function (data) {
                    result[id] = data && [data.priority, data.bubble, data.title, data.abbreviation, data.color, data.source];
                }, function (err) {
                    console.error(err);
                });
            })).then(function () {
                return result;
            });
        };
        ExtHostDecorations._handlePool = 0;
        return ExtHostDecorations;
    }());
    exports.ExtHostDecorations = ExtHostDecorations;
});
