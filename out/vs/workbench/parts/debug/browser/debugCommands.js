/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/severity", "vs/base/browser/ui/list/listWidget", "vs/base/common/errors", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/message/common/message", "vs/platform/workspace/common/workspace", "vs/workbench/parts/debug/common/debug", "vs/workbench/parts/debug/common/debugModel", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/workbench/parts/debug/browser/breakpointsView"], function (require, exports, nls, winjs_base_1, severity_1, listWidget_1, errors, keybindingsRegistry_1, listService_1, message_1, workspace_1, debug_1, debugModel_1, extensions_1, viewlet_1, commands_1, actions_1, editorService_1, editorContextKeys_1, contextkey_1, breakpointsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function registerCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.toggleBreakpoint',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(5),
            when: debug_1.CONTEXT_BREAKPOINTS_FOCUSED,
            primary: 10 /* Space */,
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var debugService = accessor.get(debug_1.IDebugService);
                var focused = listService.lastFocusedList;
                // Tree only
                if (!(focused instanceof listWidget_1.List)) {
                    var tree = focused;
                    var element = tree.getFocus();
                    debugService.enableOrDisableBreakpoints(!element.enabled, element).done(null, errors.onUnexpectedError);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.renameWatchExpression',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(5),
            when: debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED,
            primary: 60 /* F2 */,
            mac: { primary: 3 /* Enter */ },
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var debugService = accessor.get(debug_1.IDebugService);
                var focused = listService.lastFocusedList;
                // Tree only
                if (!(focused instanceof listWidget_1.List)) {
                    var element = focused.getFocus();
                    if (element instanceof debugModel_1.Expression) {
                        debugService.getViewModel().setSelectedExpression(element);
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.setVariable',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(5),
            when: debug_1.CONTEXT_VARIABLES_FOCUSED,
            primary: 60 /* F2 */,
            mac: { primary: 3 /* Enter */ },
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var debugService = accessor.get(debug_1.IDebugService);
                var focused = listService.lastFocusedList;
                // Tree only
                if (!(focused instanceof listWidget_1.List)) {
                    var element = focused.getFocus();
                    if (element instanceof debugModel_1.Variable) {
                        debugService.getViewModel().setSelectedExpression(element);
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.removeWatchExpression',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_WATCH_EXPRESSIONS_FOCUSED, debug_1.CONTEXT_EXPRESSION_SELECTED.toNegated()),
            primary: 20 /* Delete */,
            mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var debugService = accessor.get(debug_1.IDebugService);
                var focused = listService.lastFocusedList;
                // Tree only
                if (!(focused instanceof listWidget_1.List)) {
                    var element = focused.getFocus();
                    if (element instanceof debugModel_1.Expression) {
                        debugService.removeWatchExpressions(element.getId());
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.removeBreakpoint',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: debug_1.CONTEXT_BREAKPOINTS_FOCUSED,
            primary: 20 /* Delete */,
            mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var debugService = accessor.get(debug_1.IDebugService);
                var focused = listService.lastFocusedList;
                // Tree only
                if (!(focused instanceof listWidget_1.List)) {
                    var element = focused.getFocus();
                    if (element instanceof debugModel_1.Breakpoint) {
                        debugService.removeBreakpoints(element.getId()).done(null, errors.onUnexpectedError);
                    }
                    else if (element instanceof debugModel_1.FunctionBreakpoint) {
                        debugService.removeFunctionBreakpoints(element.getId()).done(null, errors.onUnexpectedError);
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.installAdditionalDebuggers',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: undefined,
            primary: undefined,
            handler: function (accessor) {
                var viewletService = accessor.get(viewlet_1.IViewletService);
                return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                    .then(function (viewlet) { return viewlet; })
                    .then(function (viewlet) {
                    viewlet.search('tag:debuggers @sort:installs');
                    viewlet.focus();
                });
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.addConfiguration',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: undefined,
            primary: undefined,
            handler: function (accessor, launchUri) {
                var manager = accessor.get(debug_1.IDebugService).getConfigurationManager();
                if (accessor.get(workspace_1.IWorkspaceContextService).getWorkbenchState() === workspace_1.WorkbenchState.EMPTY) {
                    accessor.get(message_1.IMessageService).show(severity_1.default.Info, nls.localize('noFolderDebugConfig', "Please first open a folder in order to do advanced debug configuration."));
                    return winjs_base_1.TPromise.as(null);
                }
                var launch = manager.getLaunches().filter(function (l) { return l.uri.toString() === launchUri; }).pop() || manager.selectedConfiguration.launch;
                return launch.openConfigFile(false).done(function (editor) {
                    if (editor) {
                        var codeEditor = editor.getControl();
                        if (codeEditor) {
                            return codeEditor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).addLaunchConfiguration();
                        }
                    }
                    return undefined;
                });
            }
        });
        var COLUMN_BREAKPOINT_COMMAND_ID = 'editor.debug.action.toggleColumnBreakpoint';
        commands_1.CommandsRegistry.registerCommand({
            id: COLUMN_BREAKPOINT_COMMAND_ID,
            handler: function (accessor) {
                var debugService = accessor.get(debug_1.IDebugService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var editor = editorService.getActiveEditor();
                var control = editor && editor.getControl();
                if (control) {
                    var position_1 = control.getPosition();
                    var modelUri_1 = control.getModel().uri;
                    var bp = debugService.getModel().getBreakpoints()
                        .filter(function (bp) { return bp.lineNumber === position_1.lineNumber && bp.column === position_1.column && bp.uri.toString() === modelUri_1.toString(); }).pop();
                    if (bp) {
                        return winjs_base_1.TPromise.as(null);
                    }
                    if (debugService.getConfigurationManager().canSetBreakpointsIn(control.getModel())) {
                        return debugService.addBreakpoints(modelUri_1, [{ lineNumber: position_1.lineNumber, column: position_1.column }]);
                    }
                }
                return winjs_base_1.TPromise.as(null);
            }
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: COLUMN_BREAKPOINT_COMMAND_ID,
                title: nls.localize('columnBreakpoint', "Column Breakpoint"),
                category: nls.localize('debug', "Debug")
            }
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
            command: {
                id: COLUMN_BREAKPOINT_COMMAND_ID,
                title: nls.localize('addColumnBreakpoint', "Add Column Breakpoint")
            },
            when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_NOT_IN_DEBUG_REPL, editorContextKeys_1.EditorContextKeys.writable),
            group: 'debug',
            order: 1
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'debug.openBreakpointToSide',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: debug_1.CONTEXT_BREAKPOINTS_FOCUSED,
            primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
            secondary: [512 /* Alt */ | 3 /* Enter */],
            handler: function (accessor) {
                var listService = accessor.get(listService_1.IListService);
                var list = listService.lastFocusedList;
                if (list instanceof listWidget_1.List) {
                    var focus_1 = list.getFocusedElements();
                    if (focus_1.length && focus_1[0] instanceof debugModel_1.Breakpoint) {
                        return breakpointsView_1.openBreakpointSource(focus_1[0], true, false, accessor.get(debug_1.IDebugService), accessor.get(editorService_1.IWorkbenchEditorService));
                    }
                }
                return winjs_base_1.TPromise.as(undefined);
            }
        });
    }
    exports.registerCommands = registerCommands;
});
