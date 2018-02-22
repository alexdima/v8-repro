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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/workbench/common/editor", "vs/base/common/uri"], function (require, exports, nls_1, winjs_base_1, editor_1, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionsInput = /** @class */ (function (_super) {
        __extends(ExtensionsInput, _super);
        function ExtensionsInput(_extension) {
            var _this = _super.call(this) || this;
            _this._extension = _extension;
            return _this;
        }
        Object.defineProperty(ExtensionsInput.prototype, "extension", {
            get: function () { return this._extension; },
            enumerable: true,
            configurable: true
        });
        ExtensionsInput.prototype.getTypeId = function () {
            return ExtensionsInput.ID;
        };
        ExtensionsInput.prototype.getName = function () {
            return nls_1.localize('extensionsInputName', "Extension: {0}", this.extension.displayName);
        };
        ExtensionsInput.prototype.matches = function (other) {
            if (!(other instanceof ExtensionsInput)) {
                return false;
            }
            var otherExtensionInput = other;
            // TODO@joao is this correct?
            return this.extension === otherExtensionInput.extension;
        };
        ExtensionsInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(null);
        };
        ExtensionsInput.prototype.supportsSplitEditor = function () {
            return false;
        };
        ExtensionsInput.prototype.getResource = function () {
            return uri_1.default.from({
                scheme: 'extension',
                path: this.extension.id
            });
        };
        ExtensionsInput.ID = 'workbench.extensions.input2';
        return ExtensionsInput;
    }(editor_1.EditorInput));
    exports.ExtensionsInput = ExtensionsInput;
});
