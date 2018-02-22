/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, instantiation_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VIEWLET_ID = 'workbench.view.debug';
    exports.VARIABLES_VIEW_ID = 'workbench.debug.variablesView';
    exports.WATCH_VIEW_ID = 'workbench.debug.watchExpressionsView';
    exports.CALLSTACK_VIEW_ID = 'workbench.debug.callStackView';
    exports.BREAKPOINTS_VIEW_ID = 'workbench.debug.breakPointsView';
    exports.REPL_ID = 'workbench.panel.repl';
    exports.DEBUG_SERVICE_ID = 'debugService';
    exports.CONTEXT_DEBUG_TYPE = new contextkey_1.RawContextKey('debugType', undefined);
    exports.CONTEXT_DEBUG_STATE = new contextkey_1.RawContextKey('debugState', undefined);
    exports.CONTEXT_IN_DEBUG_MODE = new contextkey_1.RawContextKey('inDebugMode', false);
    exports.CONTEXT_NOT_IN_DEBUG_MODE = exports.CONTEXT_IN_DEBUG_MODE.toNegated();
    exports.CONTEXT_IN_DEBUG_REPL = new contextkey_1.RawContextKey('inDebugRepl', false);
    exports.CONTEXT_NOT_IN_DEBUG_REPL = exports.CONTEXT_IN_DEBUG_REPL.toNegated();
    exports.CONTEXT_ON_FIRST_DEBUG_REPL_LINE = new contextkey_1.RawContextKey('onFirsteDebugReplLine', false);
    exports.CONTEXT_ON_LAST_DEBUG_REPL_LINE = new contextkey_1.RawContextKey('onLastDebugReplLine', false);
    exports.CONTEXT_BREAKPOINT_WIDGET_VISIBLE = new contextkey_1.RawContextKey('breakpointWidgetVisible', false);
    exports.CONTEXT_BREAKPOINTS_FOCUSED = new contextkey_1.RawContextKey('breakpointsFocused', true);
    exports.CONTEXT_WATCH_EXPRESSIONS_FOCUSED = new contextkey_1.RawContextKey('watchExpressionsFocused', true);
    exports.CONTEXT_VARIABLES_FOCUSED = new contextkey_1.RawContextKey('variablesFocused', true);
    exports.CONTEXT_EXPRESSION_SELECTED = new contextkey_1.RawContextKey('expressionSelected', false);
    exports.EDITOR_CONTRIBUTION_ID = 'editor.contrib.debug';
    exports.DEBUG_SCHEME = 'debug';
    exports.INTERNAL_CONSOLE_OPTIONS_SCHEMA = {
        enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
        default: 'openOnFirstSessionStart',
        description: nls.localize('internalConsoleOptions', "Controls behavior of the internal debug console.")
    };
    var ProcessState;
    (function (ProcessState) {
        ProcessState[ProcessState["INACTIVE"] = 0] = "INACTIVE";
        ProcessState[ProcessState["ATTACH"] = 1] = "ATTACH";
        ProcessState[ProcessState["LAUNCH"] = 2] = "LAUNCH";
    })(ProcessState = exports.ProcessState || (exports.ProcessState = {}));
    // Debug enums
    var State;
    (function (State) {
        State[State["Inactive"] = 0] = "Inactive";
        State[State["Initializing"] = 1] = "Initializing";
        State[State["Stopped"] = 2] = "Stopped";
        State[State["Running"] = 3] = "Running";
    })(State = exports.State || (exports.State = {}));
    // Debug service interfaces
    exports.IDebugService = instantiation_1.createDecorator(exports.DEBUG_SERVICE_ID);
    // utils
    var _formatPIIRegexp = /{([^}]+)}/g;
    function formatPII(value, excludePII, args) {
        return value.replace(_formatPIIRegexp, function (match, group) {
            if (excludePII && group.length > 0 && group[0] !== '_') {
                return match;
            }
            return args && args.hasOwnProperty(group) ?
                args[group] :
                match;
        });
    }
    exports.formatPII = formatPII;
});
