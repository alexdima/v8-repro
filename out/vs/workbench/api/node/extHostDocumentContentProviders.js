define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/api/node/extHostTypes", "vs/base/common/winjs.base", "vs/base/common/async", "./extHost.protocol", "vs/base/common/network"], function (require, exports, errors_1, uri_1, extHostTypes_1, winjs_base_1, async_1, extHost_protocol_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDocumentContentProvider = /** @class */ (function () {
        function ExtHostDocumentContentProvider(mainContext, documentsAndEditors) {
            this._documentContentProviders = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDocumentContentProviders);
            this._documentsAndEditors = documentsAndEditors;
        }
        ExtHostDocumentContentProvider.prototype.dispose = function () {
            // todo@joh
        };
        ExtHostDocumentContentProvider.prototype.registerTextDocumentContentProvider = function (scheme, provider) {
            var _this = this;
            // todo@remote
            // check with scheme from fs-providers!
            if (scheme === network_1.Schemas.file || scheme === network_1.Schemas.untitled) {
                throw new Error("scheme '" + scheme + "' already registered");
            }
            var handle = ExtHostDocumentContentProvider._handlePool++;
            this._documentContentProviders.set(handle, provider);
            this._proxy.$registerTextContentProvider(handle, scheme);
            var subscription;
            if (typeof provider.onDidChange === 'function') {
                subscription = provider.onDidChange(function (uri) {
                    if (_this._documentsAndEditors.getDocument(uri.toString())) {
                        _this.$provideTextDocumentContent(handle, uri).then(function (value) {
                            var document = _this._documentsAndEditors.getDocument(uri.toString());
                            if (!document) {
                                // disposed in the meantime
                                return;
                            }
                            // create lines and compare
                            var lines = value.split(/\r\n|\r|\n/);
                            // broadcast event when content changed
                            if (!document.equalLines(lines)) {
                                return _this._proxy.$onVirtualDocumentChange(uri, value);
                            }
                        }, errors_1.onUnexpectedError);
                    }
                });
            }
            return new extHostTypes_1.Disposable(function () {
                if (_this._documentContentProviders.delete(handle)) {
                    _this._proxy.$unregisterTextContentProvider(handle);
                }
                if (subscription) {
                    subscription.dispose();
                    subscription = undefined;
                }
            });
        };
        ExtHostDocumentContentProvider.prototype.$provideTextDocumentContent = function (handle, uri) {
            var provider = this._documentContentProviders.get(handle);
            if (!provider) {
                return winjs_base_1.TPromise.wrapError(new Error("unsupported uri-scheme: " + uri.scheme));
            }
            return async_1.asWinJsPromise(function (token) { return provider.provideTextDocumentContent(uri_1.default.revive(uri), token); });
        };
        ExtHostDocumentContentProvider._handlePool = 0;
        return ExtHostDocumentContentProvider;
    }());
    exports.ExtHostDocumentContentProvider = ExtHostDocumentContentProvider;
});
