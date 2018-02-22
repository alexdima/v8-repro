/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/base/common/event", "vs/workbench/api/node/extHostTypeConverters"], function (require, exports, extHost_protocol_1, event_1, typeConverters) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostWebview = /** @class */ (function () {
        function ExtHostWebview(_proxy, _handle, viewColumn) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._isDisposed = false;
            this.onMessageEmitter = new event_1.Emitter();
            this.onMessage = this.onMessageEmitter.event;
            this.onBecameActiveEmitter = new event_1.Emitter();
            this.onBecameActive = this.onBecameActiveEmitter.event;
            this.onBecameInactiveEmitter = new event_1.Emitter();
            this.onBecameInactive = this.onBecameInactiveEmitter.event;
            this._viewColumn = viewColumn;
        }
        ExtHostWebview.prototype.dispose = function () {
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
            this._proxy.$disposeWebview(this._handle);
        };
        Object.defineProperty(ExtHostWebview.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                if (this._title !== value) {
                    this._title = value;
                    this._proxy.$setTitle(this._handle, value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostWebview.prototype, "html", {
            get: function () {
                return this._html;
            },
            set: function (value) {
                if (this._html !== value) {
                    this._html = value;
                    this._proxy.$setHtml(this._handle, value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostWebview.prototype, "options", {
            get: function () {
                return this._options;
            },
            set: function (value) {
                this._proxy.$setOptions(this._handle, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostWebview.prototype, "viewColumn", {
            get: function () {
                return this._viewColumn;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostWebview.prototype.postMessage = function (message) {
            return this._proxy.$sendMessage(this._handle, message);
        };
        return ExtHostWebview;
    }());
    var ExtHostWebviews = /** @class */ (function () {
        function ExtHostWebviews(mainContext) {
            this._webviews = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadWebview);
        }
        ExtHostWebviews.prototype.createWebview = function (title, viewColumn, options) {
            var handle = ExtHostWebviews._handlePool++;
            this._proxy.$createWebview(handle);
            var webview = new ExtHostWebview(this._proxy, handle, viewColumn);
            this._webviews.set(handle, webview);
            webview.title = title;
            webview.options = options;
            this._proxy.$show(handle, typeConverters.fromViewColumn(viewColumn));
            return webview;
        };
        ExtHostWebviews.prototype.$onMessage = function (handle, message) {
            var webview = this._webviews.get(handle);
            webview.onMessageEmitter.fire(message);
        };
        ExtHostWebviews.prototype.$onBecameActive = function (handle) {
            var webview = this._webviews.get(handle);
            webview.onBecameActiveEmitter.fire();
        };
        ExtHostWebviews.prototype.$onBecameInactive = function (handle) {
            var webview = this._webviews.get(handle);
            webview.onBecameInactiveEmitter.fire();
        };
        ExtHostWebviews._handlePool = 0;
        return ExtHostWebviews;
    }());
    exports.ExtHostWebviews = ExtHostWebviews;
});
