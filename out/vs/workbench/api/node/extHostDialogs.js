define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/node/extHost.protocol"], function (require, exports, uri_1, extHost_protocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtHostDialogs = /** @class */ (function () {
        function ExtHostDialogs(mainContext) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadDialogs);
        }
        ExtHostDialogs.prototype.showOpenDialog = function (options) {
            return this._proxy.$showOpenDialog(options).then(function (filepaths) {
                return filepaths && filepaths.map(uri_1.default.file);
            });
        };
        ExtHostDialogs.prototype.showSaveDialog = function (options) {
            return this._proxy.$showSaveDialog(options).then(function (filepath) {
                return filepath && uri_1.default.file(filepath);
            });
        };
        return ExtHostDialogs;
    }());
    exports.ExtHostDialogs = ExtHostDialogs;
});
