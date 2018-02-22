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
define(["require", "exports", "vs/editor/browser/services/abstractCodeEditorService"], function (require, exports, abstractCodeEditorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestCodeEditorService = /** @class */ (function (_super) {
        __extends(TestCodeEditorService, _super);
        function TestCodeEditorService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestCodeEditorService.prototype.registerDecorationType = function (key, options, parentTypeKey) { };
        TestCodeEditorService.prototype.removeDecorationType = function (key) { };
        TestCodeEditorService.prototype.resolveDecorationOptions = function (decorationTypeKey, writable) { return null; };
        return TestCodeEditorService;
    }(abstractCodeEditorService_1.AbstractCodeEditorService));
    exports.TestCodeEditorService = TestCodeEditorService;
});
