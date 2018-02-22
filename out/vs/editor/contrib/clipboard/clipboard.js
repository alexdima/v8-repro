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
define(["require", "exports", "vs/nls", "vs/base/browser/browser", "vs/base/common/platform", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/editorExtensions", "vs/editor/browser/controller/textAreaInput", "vs/editor/common/editorContextKeys", "vs/css!./clipboard"], function (require, exports, nls, browser, platform, codeEditorService_1, editorExtensions_1, textAreaInput_1, editorContextKeys_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
    var supportsCut = (platform.isNative || document.queryCommandSupported('cut'));
    var supportsCopy = (platform.isNative || document.queryCommandSupported('copy'));
    // IE and Edge have trouble with setting html content in clipboard
    var supportsCopyWithSyntaxHighlighting = (supportsCopy && !browser.isEdgeOrIE);
    // Chrome incorrectly returns true for document.queryCommandSupported('paste')
    // when the paste feature is available but the calling script has insufficient
    // privileges to actually perform the action
    var supportsPaste = (platform.isNative || (!browser.isChrome && document.queryCommandSupported('paste')));
    var ExecCommandAction = /** @class */ (function (_super) {
        __extends(ExecCommandAction, _super);
        function ExecCommandAction(browserCommand, opts) {
            var _this = _super.call(this, opts) || this;
            _this.browserCommand = browserCommand;
            return _this;
        }
        ExecCommandAction.prototype.runCommand = function (accessor, args) {
            var focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            // Only if editor text focus (i.e. not if editor has widget focus).
            if (focusedEditor && focusedEditor.isFocused()) {
                focusedEditor.trigger('keyboard', this.id, args);
                return;
            }
            document.execCommand(this.browserCommand);
        };
        ExecCommandAction.prototype.run = function (accessor, editor) {
            editor.focus();
            document.execCommand(this.browserCommand);
        };
        return ExecCommandAction;
    }(editorExtensions_1.EditorAction));
    var ExecCommandCutAction = /** @class */ (function (_super) {
        __extends(ExecCommandCutAction, _super);
        function ExecCommandCutAction() {
            var _this = this;
            var kbOpts = {
                kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */,
                win: { primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */, secondary: [1024 /* Shift */ | 20 /* Delete */] }
            };
            // Do not bind cut keybindings in the browser,
            // since browsers do that for us and it avoids security prompts
            if (!platform.isNative) {
                kbOpts = null;
            }
            _this = _super.call(this, 'cut', {
                id: 'editor.action.clipboardCutAction',
                label: nls.localize('actions.clipboard.cutLabel', "Cut"),
                alias: 'Cut',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: kbOpts,
                menuOpts: {
                    group: CLIPBOARD_CONTEXT_MENU_GROUP,
                    order: 1
                }
            }) || this;
            return _this;
        }
        ExecCommandCutAction.prototype.run = function (accessor, editor) {
            var emptySelectionClipboard = editor.getConfiguration().emptySelectionClipboard;
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            _super.prototype.run.call(this, accessor, editor);
        };
        return ExecCommandCutAction;
    }(ExecCommandAction));
    var ExecCommandCopyAction = /** @class */ (function (_super) {
        __extends(ExecCommandCopyAction, _super);
        function ExecCommandCopyAction() {
            var _this = this;
            var kbOpts = {
                kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
                win: { primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] }
            };
            // Do not bind copy keybindings in the browser,
            // since browsers do that for us and it avoids security prompts
            if (!platform.isNative) {
                kbOpts = null;
            }
            _this = _super.call(this, 'copy', {
                id: 'editor.action.clipboardCopyAction',
                label: nls.localize('actions.clipboard.copyLabel', "Copy"),
                alias: 'Copy',
                precondition: null,
                kbOpts: kbOpts,
                menuOpts: {
                    group: CLIPBOARD_CONTEXT_MENU_GROUP,
                    order: 2
                }
            }) || this;
            return _this;
        }
        ExecCommandCopyAction.prototype.run = function (accessor, editor) {
            var emptySelectionClipboard = editor.getConfiguration().emptySelectionClipboard;
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            _super.prototype.run.call(this, accessor, editor);
        };
        return ExecCommandCopyAction;
    }(ExecCommandAction));
    var ExecCommandPasteAction = /** @class */ (function (_super) {
        __extends(ExecCommandPasteAction, _super);
        function ExecCommandPasteAction() {
            var _this = this;
            var kbOpts = {
                kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
                win: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [1024 /* Shift */ | 19 /* Insert */] }
            };
            // Do not bind paste keybindings in the browser,
            // since browsers do that for us and it avoids security prompts
            if (!platform.isNative) {
                kbOpts = null;
            }
            _this = _super.call(this, 'paste', {
                id: 'editor.action.clipboardPasteAction',
                label: nls.localize('actions.clipboard.pasteLabel', "Paste"),
                alias: 'Paste',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: kbOpts,
                menuOpts: {
                    group: CLIPBOARD_CONTEXT_MENU_GROUP,
                    order: 3
                }
            }) || this;
            return _this;
        }
        return ExecCommandPasteAction;
    }(ExecCommandAction));
    var ExecCommandCopyWithSyntaxHighlightingAction = /** @class */ (function (_super) {
        __extends(ExecCommandCopyWithSyntaxHighlightingAction, _super);
        function ExecCommandCopyWithSyntaxHighlightingAction() {
            return _super.call(this, 'copy', {
                id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
                label: nls.localize('actions.clipboard.copyWithSyntaxHighlightingLabel', "Copy With Syntax Highlighting"),
                alias: 'Copy With Syntax Highlighting',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: null
                }
            }) || this;
        }
        ExecCommandCopyWithSyntaxHighlightingAction.prototype.run = function (accessor, editor) {
            var emptySelectionClipboard = editor.getConfiguration().emptySelectionClipboard;
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = true;
            _super.prototype.run.call(this, accessor, editor);
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = false;
        };
        return ExecCommandCopyWithSyntaxHighlightingAction;
    }(ExecCommandAction));
    if (supportsCut) {
        editorExtensions_1.registerEditorAction(ExecCommandCutAction);
    }
    if (supportsCopy) {
        editorExtensions_1.registerEditorAction(ExecCommandCopyAction);
    }
    if (supportsPaste) {
        editorExtensions_1.registerEditorAction(ExecCommandPasteAction);
    }
    if (supportsCopyWithSyntaxHighlighting) {
        editorExtensions_1.registerEditorAction(ExecCommandCopyWithSyntaxHighlightingAction);
    }
});
