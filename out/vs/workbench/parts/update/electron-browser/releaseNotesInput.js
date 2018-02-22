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
    var ReleaseNotesInput = /** @class */ (function (_super) {
        __extends(ReleaseNotesInput, _super);
        function ReleaseNotesInput(_version, _text) {
            var _this = _super.call(this) || this;
            _this._version = _version;
            _this._text = _text;
            return _this;
        }
        Object.defineProperty(ReleaseNotesInput.prototype, "version", {
            get: function () { return this._version; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReleaseNotesInput.prototype, "text", {
            get: function () { return this._text; },
            enumerable: true,
            configurable: true
        });
        ReleaseNotesInput.prototype.getResource = function () {
            return uri_1.default.from({ scheme: 'release-notes', path: this._version + ".release-notes" });
        };
        ReleaseNotesInput.prototype.getTypeId = function () {
            return ReleaseNotesInput.ID;
        };
        ReleaseNotesInput.prototype.getName = function () {
            return nls_1.localize('releaseNotesInputName', "Release Notes: {0}", this.version);
        };
        ReleaseNotesInput.prototype.matches = function (other) {
            if (!(other instanceof ReleaseNotesInput)) {
                return false;
            }
            var otherInput = other;
            return this.version === otherInput.version;
        };
        ReleaseNotesInput.prototype.resolve = function (refresh) {
            return winjs_base_1.TPromise.as(null);
        };
        ReleaseNotesInput.prototype.supportsSplitEditor = function () {
            return false;
        };
        ReleaseNotesInput.ID = 'workbench.releaseNotes.input';
        return ReleaseNotesInput;
    }(editor_1.EditorInput));
    exports.ReleaseNotesInput = ReleaseNotesInput;
});
