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
define(["require", "exports", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/modes", "vs/editor/test/common/mocks/mockMode"], function (require, exports, languageConfigurationRegistry_1, modes_1, mockMode_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CommentMode = /** @class */ (function (_super) {
        __extends(CommentMode, _super);
        function CommentMode(commentsConfig) {
            var _this = _super.call(this, CommentMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                comments: commentsConfig
            }));
            return _this;
        }
        CommentMode._id = new modes_1.LanguageIdentifier('commentMode', 3);
        return CommentMode;
    }(mockMode_1.MockMode));
    exports.CommentMode = CommentMode;
});
