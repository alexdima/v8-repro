var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "vs/base/common/event", "./extHost.protocol"], function (require, exports, event_1, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostWindow = /** @class */ (function () {
        function ExtHostWindow(mainContext) {
            var _this = this;
            this._onDidChangeWindowState = new event_1.Emitter();
            this.onDidChangeWindowState = this._onDidChangeWindowState.event;
            this._state = ExtHostWindow.InitialState;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadWindow);
            this._proxy.$getWindowVisibility().then(function (isFocused) { return _this.$onDidChangeWindowFocus(isFocused); });
        }
        Object.defineProperty(ExtHostWindow.prototype, "state", {
            get: function () { return this._state; },
            enumerable: true,
            configurable: true
        });
        ExtHostWindow.prototype.$onDidChangeWindowFocus = function (focused) {
            if (focused === this._state.focused) {
                return;
            }
            this._state = __assign({}, this._state, { focused: focused });
            this._onDidChangeWindowState.fire(this._state);
        };
        ExtHostWindow.InitialState = {
            focused: true
        };
        return ExtHostWindow;
    }());
    exports.ExtHostWindow = ExtHostWindow;
});
