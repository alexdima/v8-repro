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
define(["require", "exports", "vs/workbench/browser/parts/editor/webviewEditor", "vs/platform/contextkey/common/contextkey"], function (require, exports, webviewEditor_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**  A context key that is set when a webview editor has focus. */
    exports.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FOCUS = new contextkey_1.RawContextKey('webviewEditorFocus', false);
    /**  A context key that is set when the find widget find input in webview editor webview is focused. */
    exports.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FIND_WIDGET_INPUT_FOCUSED = new contextkey_1.RawContextKey('webviewEditorFindWidgetInputFocused', false);
    /**  A context key that is set when the find widget in a webview is visible. */
    exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new contextkey_1.RawContextKey('webviewFindWidgetVisible', false);
    /**
     * This class is only intended to be subclassed and not instantiated.
     */
    var WebviewEditor = /** @class */ (function (_super) {
        __extends(WebviewEditor, _super);
        function WebviewEditor(id, telemetryService, themeService, storageService, contextKeyService) {
            var _this = _super.call(this, id, telemetryService, themeService, storageService) || this;
            if (contextKeyService) {
                _this.contextKey = exports.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FOCUS.bindTo(contextKeyService);
                _this.findInputFocusContextKey = exports.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FIND_WIDGET_INPUT_FOCUSED.bindTo(contextKeyService);
                _this.findWidgetVisible = exports.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
            }
            return _this;
        }
        WebviewEditor.prototype.showFind = function () {
            if (this._webview) {
                this._webview.showFind();
                this.findWidgetVisible.set(true);
            }
        };
        WebviewEditor.prototype.hideFind = function () {
            this.findWidgetVisible.reset();
            if (this._webview) {
                this._webview.hideFind();
            }
        };
        WebviewEditor.prototype.showNextFindTerm = function () {
            if (this._webview) {
                this._webview.showNextFindTerm();
            }
        };
        WebviewEditor.prototype.showPreviousFindTerm = function () {
            if (this._webview) {
                this._webview.showPreviousFindTerm();
            }
        };
        WebviewEditor.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            if (this._webview) {
                this._webview.style(this.themeService.getTheme());
            }
        };
        Object.defineProperty(WebviewEditor.prototype, "isWebviewEditor", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        return WebviewEditor;
    }(webviewEditor_1.BaseWebviewEditor));
    exports.WebviewEditor = WebviewEditor;
});
