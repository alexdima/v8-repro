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
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MockMode = /** @class */ (function (_super) {
        __extends(MockMode, _super);
        function MockMode(languageIdentifier) {
            var _this = _super.call(this) || this;
            _this._languageIdentifier = languageIdentifier;
            return _this;
        }
        MockMode.prototype.getId = function () {
            return this._languageIdentifier.language;
        };
        MockMode.prototype.getLanguageIdentifier = function () {
            return this._languageIdentifier;
        };
        return MockMode;
    }(lifecycle_1.Disposable));
    exports.MockMode = MockMode;
});
