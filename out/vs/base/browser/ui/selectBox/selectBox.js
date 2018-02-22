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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/ui/widget", "vs/base/common/color", "vs/base/common/objects", "vs/base/browser/ui/selectBox/selectBoxNative", "vs/base/browser/ui/selectBox/selectBoxCustom", "vs/base/common/platform", "vs/css!./selectBox"], function (require, exports, lifecycle_1, widget_1, color_1, objects_1, selectBoxNative_1, selectBoxCustom_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultStyles = {
        selectBackground: color_1.Color.fromHex('#3C3C3C'),
        selectForeground: color_1.Color.fromHex('#F0F0F0'),
        selectBorder: color_1.Color.fromHex('#3C3C3C')
    };
    var SelectBox = /** @class */ (function (_super) {
        __extends(SelectBox, _super);
        function SelectBox(options, selected, contextViewProvider, styles) {
            if (styles === void 0) { styles = objects_1.deepClone(exports.defaultStyles); }
            var _this = _super.call(this) || this;
            _this.toDispose = [];
            objects_1.mixin(_this.styles, exports.defaultStyles, false);
            // Instantiate select implementation based on platform
            if (platform_1.isMacintosh) {
                _this.selectBoxDelegate = new selectBoxNative_1.SelectBoxNative(options, selected, styles);
            }
            else {
                _this.selectBoxDelegate = new selectBoxCustom_1.SelectBoxList(options, selected, contextViewProvider, styles);
            }
            _this.toDispose.push(_this.selectBoxDelegate);
            return _this;
        }
        Object.defineProperty(SelectBox.prototype, "onDidSelect", {
            // Public SelectBox Methods - routed through delegate interface
            get: function () {
                return this.selectBoxDelegate.onDidSelect;
            },
            enumerable: true,
            configurable: true
        });
        SelectBox.prototype.setOptions = function (options, selected, disabled) {
            this.selectBoxDelegate.setOptions(options, selected, disabled);
        };
        SelectBox.prototype.select = function (index) {
            this.selectBoxDelegate.select(index);
        };
        SelectBox.prototype.focus = function () {
            this.selectBoxDelegate.focus();
        };
        SelectBox.prototype.blur = function () {
            this.selectBoxDelegate.blur();
        };
        // Public Widget Methods - routed through delegate interface
        SelectBox.prototype.render = function (container) {
            this.selectBoxDelegate.render(container);
        };
        SelectBox.prototype.style = function (styles) {
            this.selectBoxDelegate.style(styles);
        };
        SelectBox.prototype.applyStyles = function () {
            this.selectBoxDelegate.applyStyles();
        };
        SelectBox.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        return SelectBox;
    }(widget_1.Widget));
    exports.SelectBox = SelectBox;
});
