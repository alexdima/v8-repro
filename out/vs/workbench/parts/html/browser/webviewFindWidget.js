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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/editor/contrib/find/simpleFindWidget", "vs/platform/contextview/browser/contextView"], function (require, exports, simpleFindWidget_1, contextView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WebviewFindWidget = /** @class */ (function (_super) {
        __extends(WebviewFindWidget, _super);
        function WebviewFindWidget(contextViewService, webview) {
            var _this = _super.call(this, contextViewService) || this;
            _this.webview = webview;
            return _this;
        }
        WebviewFindWidget.prototype.find = function (previous) {
            var val = this.inputValue;
            if (val) {
                this.webview.find(val, { findNext: true, forward: !previous });
            }
        };
        WebviewFindWidget.prototype.hide = function () {
            _super.prototype.hide.call(this);
            this.webview.stopFind(true);
            this.webview.focus();
        };
        WebviewFindWidget.prototype.onInputChanged = function () {
            var val = this.inputValue;
            if (val) {
                this.webview.startFind(val);
            }
            else {
                this.webview.stopFind(false);
            }
        };
        WebviewFindWidget.prototype.onFocusTrackerFocus = function () {
            this.webview.notifyFindWidgetFocusChanged(true);
        };
        WebviewFindWidget.prototype.onFocusTrackerBlur = function () {
            this.webview.notifyFindWidgetFocusChanged(false);
        };
        WebviewFindWidget.prototype.onFindInputFocusTrackerFocus = function () {
            this.webview.notifyFindWidgetInputFocusChanged(true);
        };
        WebviewFindWidget.prototype.onFindInputFocusTrackerBlur = function () {
            this.webview.notifyFindWidgetInputFocusChanged(false);
        };
        WebviewFindWidget = __decorate([
            __param(0, contextView_1.IContextViewService)
        ], WebviewFindWidget);
        return WebviewFindWidget;
    }(simpleFindWidget_1.SimpleFindWidget));
    exports.WebviewFindWidget = WebviewFindWidget;
});
