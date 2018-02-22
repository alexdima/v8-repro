define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, contextkey_1, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TERMINAL_PANEL_ID = 'workbench.panel.terminal';
    exports.TERMINAL_SERVICE_ID = 'terminalService';
    /**  A context key that is set when the integrated terminal has focus. */
    exports.KEYBINDING_CONTEXT_TERMINAL_FOCUS = new contextkey_1.RawContextKey('terminalFocus', undefined);
    /**  A context key that is set when the integrated terminal does not have focus. */
    exports.KEYBINDING_CONTEXT_TERMINAL_NOT_FOCUSED = exports.KEYBINDING_CONTEXT_TERMINAL_FOCUS.toNegated();
    /** A keybinding context key that is set when the integrated terminal has text selected. */
    exports.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED = new contextkey_1.RawContextKey('terminalTextSelected', undefined);
    /** A keybinding context key that is set when the integrated terminal does not have text selected. */
    exports.KEYBINDING_CONTEXT_TERMINAL_TEXT_NOT_SELECTED = exports.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED.toNegated();
    /**  A context key that is set when the find widget in integrated terminal is visible. */
    exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE = new contextkey_1.RawContextKey('terminalFindWidgetVisible', undefined);
    /**  A context key that is set when the find widget in integrated terminal is not visible. */
    exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_NOT_VISIBLE = exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE.toNegated();
    /**  A context key that is set when the find widget find input in integrated terminal is focused. */
    exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED = new contextkey_1.RawContextKey('terminalFindWidgetInputFocused', false);
    /**  A context key that is set when the find widget find input in integrated terminal is not focused. */
    exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_NOT_FOCUSED = exports.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED.toNegated();
    exports.IS_WORKSPACE_SHELL_ALLOWED_STORAGE_KEY = 'terminal.integrated.isWorkspaceShellAllowed';
    exports.NEVER_SUGGEST_SELECT_WINDOWS_SHELL_STORAGE_KEY = 'terminal.integrated.neverSuggestSelectWindowsShell';
    exports.ITerminalService = instantiation_1.createDecorator(exports.TERMINAL_SERVICE_ID);
    exports.TerminalCursorStyle = {
        BLOCK: 'block',
        LINE: 'line',
        UNDERLINE: 'underline'
    };
    exports.TERMINAL_CONFIG_SECTION = 'terminal.integrated';
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Up"] = 2] = "Up";
        Direction[Direction["Down"] = 3] = "Down";
    })(Direction = exports.Direction || (exports.Direction = {}));
});
