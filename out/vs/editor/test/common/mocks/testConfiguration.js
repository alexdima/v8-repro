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
define(["require", "exports", "vs/editor/common/config/commonEditorConfig", "vs/editor/common/config/fontInfo"], function (require, exports, commonEditorConfig_1, fontInfo_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestConfiguration = /** @class */ (function (_super) {
        __extends(TestConfiguration, _super);
        function TestConfiguration(opts) {
            var _this = _super.call(this, opts) || this;
            _this._recomputeOptions();
            return _this;
        }
        TestConfiguration.prototype._getEnvConfiguration = function () {
            return {
                extraEditorClassName: '',
                outerWidth: 100,
                outerHeight: 100,
                emptySelectionClipboard: true,
                pixelRatio: 1,
                zoomLevel: 0,
                accessibilitySupport: 0 /* Unknown */
            };
        };
        TestConfiguration.prototype.readConfiguration = function (styling) {
            return new fontInfo_1.FontInfo({
                zoomLevel: 0,
                fontFamily: 'mockFont',
                fontWeight: 'normal',
                fontSize: 14,
                lineHeight: 19,
                letterSpacing: 1.5,
                isMonospace: true,
                typicalHalfwidthCharacterWidth: 10,
                typicalFullwidthCharacterWidth: 20,
                spaceWidth: 10,
                maxDigitWidth: 10,
            }, true);
        };
        return TestConfiguration;
    }(commonEditorConfig_1.CommonEditorConfiguration));
    exports.TestConfiguration = TestConfiguration;
});
