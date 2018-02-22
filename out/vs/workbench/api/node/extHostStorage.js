define(["require", "exports", "./extHost.protocol"], function (require, exports, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostStorage = /** @class */ (function () {
        function ExtHostStorage(mainContext) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadStorage);
        }
        ExtHostStorage.prototype.getValue = function (shared, key, defaultValue) {
            return this._proxy.$getValue(shared, key).then(function (value) { return value || defaultValue; });
        };
        ExtHostStorage.prototype.setValue = function (shared, key, value) {
            return this._proxy.$setValue(shared, key, value);
        };
        return ExtHostStorage;
    }());
    exports.ExtHostStorage = ExtHostStorage;
});
