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
define(["require", "exports", "vs/nls", "vs/editor/browser/editorExtensions", "vs/workbench/services/editor/common/editorService", "vs/base/common/actions"], function (require, exports, nls, editorExtensions_1, editorService_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ShowWebViewEditorFindWidgetAction = /** @class */ (function (_super) {
        __extends(ShowWebViewEditorFindWidgetAction, _super);
        function ShowWebViewEditorFindWidgetAction(id, label, workbenchEditorService) {
            var _this = _super.call(this, id, label) || this;
            _this.workbenchEditorService = workbenchEditorService;
            return _this;
        }
        ShowWebViewEditorFindWidgetAction.prototype.run = function () {
            var webViewEditor = this.getWebViewEditor();
            if (webViewEditor) {
                webViewEditor.showFind();
            }
            return null;
        };
        ShowWebViewEditorFindWidgetAction.prototype.getWebViewEditor = function () {
            var activeEditor = this.workbenchEditorService.getActiveEditor();
            if (activeEditor.isWebviewEditor) {
                return activeEditor;
            }
            return null;
        };
        ShowWebViewEditorFindWidgetAction.ID = 'editor.action.webvieweditor.showFind';
        ShowWebViewEditorFindWidgetAction.LABEL = nls.localize('editor.action.webvieweditor.showFind', "Focus Find Widget");
        ShowWebViewEditorFindWidgetAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService)
        ], ShowWebViewEditorFindWidgetAction);
        return ShowWebViewEditorFindWidgetAction;
    }(actions_1.Action));
    exports.ShowWebViewEditorFindWidgetAction = ShowWebViewEditorFindWidgetAction;
    var HideWebViewEditorFindCommand = /** @class */ (function (_super) {
        __extends(HideWebViewEditorFindCommand, _super);
        function HideWebViewEditorFindCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HideWebViewEditorFindCommand.prototype.runCommand = function (accessor, args) {
            var webViewEditor = this.getWebViewEditor(accessor);
            if (webViewEditor) {
                webViewEditor.hideFind();
            }
        };
        HideWebViewEditorFindCommand.prototype.getWebViewEditor = function (accessor) {
            var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            if (activeEditor.isWebviewEditor) {
                return activeEditor;
            }
            return null;
        };
        return HideWebViewEditorFindCommand;
    }(editorExtensions_1.Command));
    exports.HideWebViewEditorFindCommand = HideWebViewEditorFindCommand;
    var ShowWebViewEditorFindTermCommand = /** @class */ (function (_super) {
        __extends(ShowWebViewEditorFindTermCommand, _super);
        function ShowWebViewEditorFindTermCommand(opts, _next) {
            var _this = _super.call(this, opts) || this;
            _this._next = _next;
            return _this;
        }
        ShowWebViewEditorFindTermCommand.prototype.runCommand = function (accessor, args) {
            var webViewEditor = this.getWebViewEditor(accessor);
            if (webViewEditor) {
                if (this._next) {
                    webViewEditor.showNextFindTerm();
                }
                else {
                    webViewEditor.showPreviousFindTerm();
                }
            }
        };
        ShowWebViewEditorFindTermCommand.prototype.getWebViewEditor = function (accessor) {
            var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            if (activeEditor.isWebviewEditor) {
                return activeEditor;
            }
            return null;
        };
        return ShowWebViewEditorFindTermCommand;
    }(editorExtensions_1.Command));
    exports.ShowWebViewEditorFindTermCommand = ShowWebViewEditorFindTermCommand;
});
