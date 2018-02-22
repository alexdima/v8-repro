/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IJSONEditingService = instantiation_1.createDecorator('jsonEditingService');
    var JSONEditingErrorCode;
    (function (JSONEditingErrorCode) {
        /**
         * Error when trying to write and save to the file while it is dirty in the editor.
         */
        JSONEditingErrorCode[JSONEditingErrorCode["ERROR_FILE_DIRTY"] = 0] = "ERROR_FILE_DIRTY";
        /**
         * Error when trying to write to a file that contains JSON errors.
         */
        JSONEditingErrorCode[JSONEditingErrorCode["ERROR_INVALID_FILE"] = 1] = "ERROR_INVALID_FILE";
    })(JSONEditingErrorCode = exports.JSONEditingErrorCode || (exports.JSONEditingErrorCode = {}));
    var JSONEditingError = /** @class */ (function (_super) {
        __extends(JSONEditingError, _super);
        function JSONEditingError(message, code) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            return _this;
        }
        return JSONEditingError;
    }(Error));
    exports.JSONEditingError = JSONEditingError;
});
