define(["require", "exports", "./extHost.protocol"], function (require, exports, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostLanguages = /** @class */ (function () {
        function ExtHostLanguages(mainContext) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadLanguages);
        }
        ExtHostLanguages.prototype.getLanguages = function () {
            return this._proxy.$getLanguages();
        };
        return ExtHostLanguages;
    }());
    exports.ExtHostLanguages = ExtHostLanguages;
});
