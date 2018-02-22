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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/keyCodes", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/parts/debug/common/debug", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls, winjs_base_1, keyCodes_1, range_1, editorContextKeys_1, editorExtensions_1, contextkey_1, debug_1, panelService_1, viewlet_1, keybindingsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleBreakpointAction = /** @class */ (function (_super) {
        __extends(ToggleBreakpointAction, _super);
        function ToggleBreakpointAction() {
            return _super.call(this, {
                id: 'editor.debug.action.toggleBreakpoint',
                label: nls.localize('toggleBreakpointAction', "Debug: Toggle Breakpoint"),
                alias: 'Debug: Toggle Breakpoint',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 67 /* F9 */
                }
            }) || this;
        }
        ToggleBreakpointAction.prototype.run = function (accessor, editor) {
            var debugService = accessor.get(debug_1.IDebugService);
            var position = editor.getPosition();
            var modelUri = editor.getModel().uri;
            var bps = debugService.getModel().getBreakpoints()
                .filter(function (bp) { return bp.lineNumber === position.lineNumber && bp.uri.toString() === modelUri.toString(); });
            if (bps.length) {
                return winjs_base_1.TPromise.join(bps.map(function (bp) { return debugService.removeBreakpoints(bp.getId()); }));
            }
            if (debugService.getConfigurationManager().canSetBreakpointsIn(editor.getModel())) {
                return debugService.addBreakpoints(modelUri, [{ lineNumber: position.lineNumber }]);
            }
            return winjs_base_1.TPromise.as(null);
        };
        return ToggleBreakpointAction;
    }(editorExtensions_1.EditorAction));
    var ConditionalBreakpointAction = /** @class */ (function (_super) {
        __extends(ConditionalBreakpointAction, _super);
        function ConditionalBreakpointAction() {
            return _super.call(this, {
                id: 'editor.debug.action.conditionalBreakpoint',
                label: nls.localize('conditionalBreakpointEditorAction', "Debug: Add Conditional Breakpoint..."),
                alias: 'Debug: Add Conditional Breakpoint...',
                precondition: null
            }) || this;
        }
        ConditionalBreakpointAction.prototype.run = function (accessor, editor) {
            var debugService = accessor.get(debug_1.IDebugService);
            var _a = editor.getPosition(), lineNumber = _a.lineNumber, column = _a.column;
            if (debugService.getConfigurationManager().canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showBreakpointWidget(lineNumber, column);
            }
        };
        return ConditionalBreakpointAction;
    }(editorExtensions_1.EditorAction));
    var RunToCursorAction = /** @class */ (function (_super) {
        __extends(RunToCursorAction, _super);
        function RunToCursorAction() {
            return _super.call(this, {
                id: 'editor.debug.action.runToCursor',
                label: nls.localize('runToCursor', "Run to Cursor"),
                alias: 'Debug: Run to Cursor',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_NOT_IN_DEBUG_REPL, editorContextKeys_1.EditorContextKeys.writable, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')),
                menuOpts: {
                    group: 'debug',
                    order: 2
                }
            }) || this;
        }
        RunToCursorAction.prototype.run = function (accessor, editor) {
            var debugService = accessor.get(debug_1.IDebugService);
            if (debugService.state !== debug_1.State.Stopped) {
                return winjs_base_1.TPromise.as(null);
            }
            var position = editor.getPosition();
            var uri = editor.getModel().uri;
            var oneTimeListener = debugService.getViewModel().focusedProcess.session.onDidEvent(function (event) {
                if (event.event === 'stopped' || event.event === 'exit') {
                    var toRemove = debugService.getModel().getBreakpoints()
                        .filter(function (bp) { return bp.lineNumber === position.lineNumber && bp.uri.toString() === uri.toString(); }).pop();
                    if (toRemove) {
                        debugService.removeBreakpoints(toRemove.getId());
                    }
                    oneTimeListener.dispose();
                }
            });
            var bpExists = !!(debugService.getModel().getBreakpoints().filter(function (bp) { return bp.column === position.column && bp.lineNumber === position.lineNumber && bp.uri.toString() === uri.toString(); }).pop());
            return (bpExists ? winjs_base_1.TPromise.as(null) : debugService.addBreakpoints(uri, [{ lineNumber: position.lineNumber, column: position.column }])).then(function () {
                debugService.getViewModel().focusedThread.continue();
            });
        };
        return RunToCursorAction;
    }(editorExtensions_1.EditorAction));
    var SelectionToReplAction = /** @class */ (function (_super) {
        __extends(SelectionToReplAction, _super);
        function SelectionToReplAction() {
            return _super.call(this, {
                id: 'editor.debug.action.selectionToRepl',
                label: nls.localize('debugEvaluate', "Debug: Evaluate"),
                alias: 'Debug: Evaluate',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_NOT_IN_DEBUG_REPL),
                menuOpts: {
                    group: 'debug',
                    order: 0
                }
            }) || this;
        }
        SelectionToReplAction.prototype.run = function (accessor, editor) {
            var debugService = accessor.get(debug_1.IDebugService);
            var panelService = accessor.get(panelService_1.IPanelService);
            var text = editor.getModel().getValueInRange(editor.getSelection());
            return debugService.addReplExpression(text)
                .then(function () { return panelService.openPanel(debug_1.REPL_ID, true); })
                .then(function (_) { return void 0; });
        };
        return SelectionToReplAction;
    }(editorExtensions_1.EditorAction));
    var SelectionToWatchExpressionsAction = /** @class */ (function (_super) {
        __extends(SelectionToWatchExpressionsAction, _super);
        function SelectionToWatchExpressionsAction() {
            return _super.call(this, {
                id: 'editor.debug.action.selectionToWatch',
                label: nls.localize('debugAddToWatch', "Debug: Add to Watch"),
                alias: 'Debug: Add to Watch',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_NOT_IN_DEBUG_REPL),
                menuOpts: {
                    group: 'debug',
                    order: 1
                }
            }) || this;
        }
        SelectionToWatchExpressionsAction.prototype.run = function (accessor, editor) {
            var debugService = accessor.get(debug_1.IDebugService);
            var viewletService = accessor.get(viewlet_1.IViewletService);
            var text = editor.getModel().getValueInRange(editor.getSelection());
            return viewletService.openViewlet(debug_1.VIEWLET_ID).then(function () { return debugService.addWatchExpression(text); });
        };
        return SelectionToWatchExpressionsAction;
    }(editorExtensions_1.EditorAction));
    var ShowDebugHoverAction = /** @class */ (function (_super) {
        __extends(ShowDebugHoverAction, _super);
        function ShowDebugHoverAction() {
            return _super.call(this, {
                id: 'editor.debug.action.showDebugHover',
                label: nls.localize('showDebugHover', "Debug: Show Hover"),
                alias: 'Debug: Show Hover',
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 39 /* KEY_I */)
                }
            }) || this;
        }
        ShowDebugHoverAction.prototype.run = function (accessor, editor) {
            var position = editor.getPosition();
            var word = editor.getModel().getWordAtPosition(position);
            if (!word) {
                return winjs_base_1.TPromise.as(null);
            }
            var range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, word.endColumn);
            return editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showHover(range, true);
        };
        return ShowDebugHoverAction;
    }(editorExtensions_1.EditorAction));
    var CloseBreakpointWidgetCommand = /** @class */ (function (_super) {
        __extends(CloseBreakpointWidgetCommand, _super);
        function CloseBreakpointWidgetCommand() {
            return _super.call(this, {
                id: 'closeBreakpointWidget',
                precondition: debug_1.CONTEXT_BREAKPOINT_WIDGET_VISIBLE,
                kbOpts: {
                    weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(8),
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 9 /* Escape */,
                    secondary: [1024 /* Shift */ | 9 /* Escape */]
                }
            }) || this;
        }
        CloseBreakpointWidgetCommand.prototype.runEditorCommand = function (accessor, editor, args) {
            return editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).closeBreakpointWidget();
        };
        return CloseBreakpointWidgetCommand;
    }(editorExtensions_1.EditorCommand));
    editorExtensions_1.registerEditorAction(ToggleBreakpointAction);
    editorExtensions_1.registerEditorAction(ConditionalBreakpointAction);
    editorExtensions_1.registerEditorAction(RunToCursorAction);
    editorExtensions_1.registerEditorAction(SelectionToReplAction);
    editorExtensions_1.registerEditorAction(SelectionToWatchExpressionsAction);
    editorExtensions_1.registerEditorAction(ShowDebugHoverAction);
    editorExtensions_1.registerEditorCommand(new CloseBreakpointWidgetCommand());
});
