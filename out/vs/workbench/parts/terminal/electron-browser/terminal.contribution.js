/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/parts/debug/browser/debugActions", "vs/nls", "vs/workbench/browser/panel", "vs/base/common/platform", "vs/workbench/parts/terminal/electron-browser/terminalCommands", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/parts/terminal/common/terminal", "vs/workbench/parts/terminal/electron-browser/terminal", "vs/workbench/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/parts/terminal/electron-browser/terminalActions", "vs/platform/registry/common/platform", "vs/workbench/parts/quickopen/browser/commandsHandler", "vs/platform/actions/common/actions", "vs/workbench/parts/terminal/electron-browser/terminalService", "vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode", "vs/platform/instantiation/common/extensions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/browser/parts/editor/editorActions", "vs/editor/common/config/editorOptions", "./terminalColorRegistry", "vs/workbench/electron-browser/actions", "vs/workbench/browser/parts/quickopen/quickopen", "vs/workbench/browser/quickopen", "vs/workbench/browser/actions", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/panel/panelActions", "vs/workbench/parts/terminal/electron-browser/terminalPanel", "vs/workbench/parts/terminal/browser/terminalQuickOpen", "vs/css!./media/scrollbar", "vs/css!./media/terminal", "vs/css!./media/xterm", "vs/css!./media/widgets"], function (require, exports, debugActions, nls, panel, platform, terminalCommands, configurationRegistry_1, terminal_1, terminal_2, actions_1, contextkey_1, terminalActions_1, platform_1, commandsHandler_1, actions_2, terminalService_1, toggleTabFocusMode_1, extensions_1, keybindingsRegistry_1, editorActions_1, editorOptions_1, terminalColorRegistry_1, actions_3, quickopen_1, quickopen_2, actions_4, commands_1, panelActions_1, terminalPanel_1, terminalQuickOpen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var quickOpenRegistry = platform_1.Registry.as(quickopen_2.Extensions.Quickopen);
    var inTerminalsPicker = 'inTerminalPicker';
    quickOpenRegistry.registerQuickOpenHandler(new quickopen_2.QuickOpenHandlerDescriptor(terminalQuickOpen_1.TerminalPickerHandler, terminalQuickOpen_1.TerminalPickerHandler.ID, terminalActions_1.TERMINAL_PICKER_PREFIX, inTerminalsPicker, nls.localize('quickOpen.terminal', "Show All Opened Terminals")));
    var quickOpenNavigateNextInTerminalPickerId = 'workbench.action.quickOpenNavigateNextInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickOpenNavigateNextInTerminalPickerId, handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigateNextInTerminalPickerId, true) });
    var quickOpenNavigatePreviousInTerminalPickerId = 'workbench.action.quickOpenNavigatePreviousInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickOpenNavigatePreviousInTerminalPickerId, handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigatePreviousInTerminalPickerId, false) });
    var registry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.QuickOpenTermAction, terminalActions_1.QuickOpenTermAction.ID, terminalActions_1.QuickOpenTermAction.LABEL), 'Terminal: Switch Active Terminal', nls.localize('terminal', "Terminal"));
    var actionBarRegistry = platform_1.Registry.as(actions_4.Extensions.Actionbar);
    actionBarRegistry.registerActionBarContributor(actions_4.Scope.VIEWER, terminalActions_1.QuickOpenActionTermContributor);
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    var _initialize = function () {
        configurationRegistry.registerConfiguration({
            'id': 'terminal',
            'order': 100,
            'title': nls.localize('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
            'type': 'object',
            'properties': {
                'terminal.integrated.shell.linux': {
                    'description': nls.localize('terminal.integrated.shell.linux', "The path of the shell that the terminal uses on Linux."),
                    'type': 'string',
                    'default': terminal_2.getTerminalDefaultShellUnixLike()
                },
                'terminal.integrated.shellArgs.linux': {
                    'description': nls.localize('terminal.integrated.shellArgs.linux', "The command line arguments to use when on the Linux terminal."),
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'default': []
                },
                'terminal.integrated.shell.osx': {
                    'description': nls.localize('terminal.integrated.shell.osx', "The path of the shell that the terminal uses on OS X."),
                    'type': 'string',
                    'default': terminal_2.getTerminalDefaultShellUnixLike()
                },
                'terminal.integrated.shellArgs.osx': {
                    'description': nls.localize('terminal.integrated.shellArgs.osx', "The command line arguments to use when on the OS X terminal."),
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    // Unlike on Linux, ~/.profile is not sourced when logging into a macOS session. This
                    // is the reason terminals on macOS typically run login shells by default which set up
                    // the environment. See http://unix.stackexchange.com/a/119675/115410
                    'default': ['-l']
                },
                'terminal.integrated.shell.windows': {
                    'description': nls.localize('terminal.integrated.shell.windows', "The path of the shell that the terminal uses on Windows. When using shells shipped with Windows (cmd, PowerShell or Bash on Ubuntu)."),
                    'type': 'string',
                    'default': terminal_2.getTerminalDefaultShellWindows()
                },
                'terminal.integrated.shellArgs.windows': {
                    'description': nls.localize('terminal.integrated.shellArgs.windows', "The command line arguments to use when on the Windows terminal."),
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'default': []
                },
                'terminal.integrated.macOptionIsMeta': {
                    'description': nls.localize('terminal.integrated.macOptionIsMeta', "Treat the option key as the meta key in the terminal on macOS."),
                    'type': 'boolean',
                    'default': false
                },
                'terminal.integrated.copyOnSelection': {
                    'description': nls.localize('terminal.integrated.copyOnSelection', "When set, text selected in the terminal will be copied to the clipboard."),
                    'type': 'boolean',
                    'default': false
                },
                'terminal.integrated.fontFamily': {
                    'description': nls.localize('terminal.integrated.fontFamily', "Controls the font family of the terminal, this defaults to editor.fontFamily's value."),
                    'type': 'string'
                },
                // TODO: Support font ligatures
                // 'terminal.integrated.fontLigatures': {
                // 	'description': nls.localize('terminal.integrated.fontLigatures', "Controls whether font ligatures are enabled in the terminal."),
                // 	'type': 'boolean',
                // 	'default': false
                // },
                'terminal.integrated.fontSize': {
                    'description': nls.localize('terminal.integrated.fontSize', "Controls the font size in pixels of the terminal."),
                    'type': 'number',
                    'default': editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize
                },
                'terminal.integrated.lineHeight': {
                    'description': nls.localize('terminal.integrated.lineHeight', "Controls the line height of the terminal, this number is multiplied by the terminal font size to get the actual line-height in pixels."),
                    'type': 'number',
                    'default': 1
                },
                'terminal.integrated.fontWeight': {
                    'type': 'string',
                    'enum': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
                    'description': nls.localize('terminal.integrated.fontWeight', "The font weight to use within the terminal for non-bold text."),
                    'default': 'normal'
                },
                'terminal.integrated.fontWeightBold': {
                    'type': 'string',
                    'enum': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
                    'description': nls.localize('terminal.integrated.fontWeightBold', "The font weight to use within the terminal for bold text."),
                    'default': 'bold'
                },
                'terminal.integrated.cursorBlinking': {
                    'description': nls.localize('terminal.integrated.cursorBlinking', "Controls whether the terminal cursor blinks."),
                    'type': 'boolean',
                    'default': false
                },
                'terminal.integrated.cursorStyle': {
                    'description': nls.localize('terminal.integrated.cursorStyle', "Controls the style of terminal cursor."),
                    'enum': [terminal_1.TerminalCursorStyle.BLOCK, terminal_1.TerminalCursorStyle.LINE, terminal_1.TerminalCursorStyle.UNDERLINE],
                    'default': terminal_1.TerminalCursorStyle.BLOCK
                },
                'terminal.integrated.scrollback': {
                    'description': nls.localize('terminal.integrated.scrollback', "Controls the maximum amount of lines the terminal keeps in its buffer."),
                    'type': 'number',
                    'default': 1000
                },
                'terminal.integrated.setLocaleVariables': {
                    'description': nls.localize('terminal.integrated.setLocaleVariables', "Controls whether locale variables are set at startup of the terminal, this defaults to true on OS X, false on other platforms."),
                    'type': 'boolean',
                    'default': platform.isMacintosh
                },
                'terminal.integrated.rightClickBehavior': {
                    'type': 'string',
                    'enum': ['default', 'copyPaste', 'selectWord'],
                    default: platform.isMacintosh ? 'selectWord' : platform.isWindows ? 'copyPaste' : 'default',
                    description: nls.localize('terminal.integrated.rightClickBehavior', "Controls how terminal reacts to right click, possibilities are 'default', 'copyPaste', and 'selectWord'. 'default' will show the context menu, 'copyPaste' will copy when there is a selection otherwise paste, 'selectWord' will select the word under the cursor and show the context menu.")
                },
                'terminal.integrated.cwd': {
                    'description': nls.localize('terminal.integrated.cwd', "An explicit start path where the terminal will be launched, this is used as the current working directory (cwd) for the shell process. This may be particularly useful in workspace settings if the root directory is not a convenient cwd."),
                    'type': 'string',
                    'default': undefined
                },
                'terminal.integrated.confirmOnExit': {
                    'description': nls.localize('terminal.integrated.confirmOnExit', "Whether to confirm on exit if there are active terminal sessions."),
                    'type': 'boolean',
                    'default': false
                },
                'terminal.integrated.enableBell': {
                    'description': nls.localize('terminal.integrated.enableBell', "Whether the terminal bell is enabled or not."),
                    'type': 'boolean',
                    'default': false
                },
                'terminal.integrated.commandsToSkipShell': {
                    'description': nls.localize('terminal.integrated.commandsToSkipShell', "A set of command IDs whose keybindings will not be sent to the shell and instead always be handled by Code. This allows the use of keybindings that would normally be consumed by the shell to act the same as when the terminal is not focused, for example ctrl+p to launch Quick Open."),
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'default': [
                        toggleTabFocusMode_1.ToggleTabFocusModeAction.ID,
                        editorActions_1.FocusActiveGroupAction.ID,
                        quickopen_1.QUICKOPEN_ACTION_ID,
                        quickopen_1.QUICKOPEN_FOCUS_SECONDARY_ACTION_ID,
                        commandsHandler_1.ShowAllCommandsAction.ID,
                        terminalActions_1.CreateNewTerminalAction.ID,
                        terminalActions_1.CreateNewInActiveWorkspaceTerminalAction.ID,
                        terminalActions_1.CopyTerminalSelectionAction.ID,
                        terminalActions_1.KillTerminalAction.ID,
                        terminalActions_1.FocusActiveTerminalAction.ID,
                        terminalActions_1.FocusPreviousTerminalAction.ID,
                        terminalActions_1.FocusNextTerminalAction.ID,
                        'workbench.action.tasks.build',
                        'workbench.action.tasks.restartTask',
                        'workbench.action.tasks.runTask',
                        'workbench.action.tasks.showLog',
                        'workbench.action.tasks.showTasks',
                        'workbench.action.tasks.terminate',
                        'workbench.action.tasks.test',
                        'workbench.action.terminal.focusAtIndex1',
                        'workbench.action.terminal.focusAtIndex2',
                        'workbench.action.terminal.focusAtIndex3',
                        'workbench.action.terminal.focusAtIndex4',
                        'workbench.action.terminal.focusAtIndex5',
                        'workbench.action.terminal.focusAtIndex6',
                        'workbench.action.terminal.focusAtIndex7',
                        'workbench.action.terminal.focusAtIndex8',
                        'workbench.action.terminal.focusAtIndex9',
                        terminalActions_1.TerminalPasteAction.ID,
                        terminalActions_1.RunSelectedTextInTerminalAction.ID,
                        terminalActions_1.RunActiveFileInTerminalAction.ID,
                        terminalActions_1.ToggleTerminalAction.ID,
                        terminalActions_1.ScrollDownTerminalAction.ID,
                        terminalActions_1.ScrollDownPageTerminalAction.ID,
                        terminalActions_1.ScrollToBottomTerminalAction.ID,
                        terminalActions_1.ScrollUpTerminalAction.ID,
                        terminalActions_1.ScrollUpPageTerminalAction.ID,
                        terminalActions_1.ScrollToTopTerminalAction.ID,
                        terminalActions_1.ClearTerminalAction.ID,
                        debugActions.StartAction.ID,
                        debugActions.StopAction.ID,
                        debugActions.RunAction.ID,
                        debugActions.RestartAction.ID,
                        debugActions.ContinueAction.ID,
                        debugActions.PauseAction.ID,
                        debugActions.StepIntoAction.ID,
                        debugActions.StepOutAction.ID,
                        debugActions.StepOverAction.ID,
                        editorActions_1.OpenNextRecentlyUsedEditorInGroupAction.ID,
                        editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction.ID,
                        editorActions_1.FocusFirstGroupAction.ID,
                        editorActions_1.FocusSecondGroupAction.ID,
                        editorActions_1.FocusThirdGroupAction.ID,
                        terminalActions_1.SelectAllTerminalAction.ID,
                        terminalActions_1.FocusTerminalFindWidgetAction.ID,
                        terminalActions_1.HideTerminalFindWidgetAction.ID,
                        terminalActions_1.ShowPreviousFindTermTerminalFindWidgetAction.ID,
                        terminalActions_1.ShowNextFindTermTerminalFindWidgetAction.ID,
                        actions_3.NavigateUpAction.ID,
                        actions_3.NavigateDownAction.ID,
                        actions_3.NavigateRightAction.ID,
                        actions_3.NavigateLeftAction.ID,
                        terminalActions_1.DeleteWordLeftTerminalAction.ID,
                        terminalActions_1.DeleteWordRightTerminalAction.ID,
                        terminalActions_1.MoveToLineStartTerminalAction.ID,
                        terminalActions_1.MoveToLineEndTerminalAction.ID,
                        panelActions_1.TogglePanelAction.ID,
                        'workbench.action.quickOpenView',
                        terminalActions_1.SplitVerticalTerminalAction.ID,
                        terminalActions_1.FocusTerminalLeftAction.ID,
                        terminalActions_1.FocusTerminalRightAction.ID
                    ].sort()
                },
                'terminal.integrated.env.osx': {
                    'description': nls.localize('terminal.integrated.env.osx', "Object with environment variables that will be added to the VS Code process to be used by the terminal on OS X"),
                    'type': 'object',
                    'default': {}
                },
                'terminal.integrated.env.linux': {
                    'description': nls.localize('terminal.integrated.env.linux', "Object with environment variables that will be added to the VS Code process to be used by the terminal on Linux"),
                    'type': 'object',
                    'default': {}
                },
                'terminal.integrated.env.windows': {
                    'description': nls.localize('terminal.integrated.env.windows', "Object with environment variables that will be added to the VS Code process to be used by the terminal on Windows"),
                    'type': 'object',
                    'default': {}
                },
                'terminal.integrated.showExitAlert': {
                    'description': nls.localize('terminal.integrated.showExitAlert', "Show alert `The terminal process terminated with exit code` when exit code is non-zero."),
                    'type': 'boolean',
                    'default': true
                },
            }
        });
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
    extensions_1.registerSingleton(terminal_1.ITerminalService, terminalService_1.TerminalService);
    platform_1.Registry.as(panel.Extensions.Panels).registerPanel(new panel.PanelDescriptor(terminalPanel_1.TerminalPanel, terminal_1.TERMINAL_PANEL_ID, nls.localize('terminal', "Terminal"), 'terminal', 40, terminalActions_1.ToggleTerminalAction.ID));
    // On mac cmd+` is reserved to cycle between windows, that's why the keybindings use WinCtrl
    var category = nls.localize('terminalCategory', "Terminal");
    var actionRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.KillTerminalAction, terminalActions_1.KillTerminalAction.ID, terminalActions_1.KillTerminalAction.LABEL), 'Terminal: Kill the Active Terminal Instance', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.CopyTerminalSelectionAction, terminalActions_1.CopyTerminalSelectionAction.ID, terminalActions_1.CopyTerminalSelectionAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KEY_C */ }
    }, contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS)), 'Terminal: Copy Selection', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.CreateNewTerminalAction, terminalActions_1.CreateNewTerminalAction.ID, terminalActions_1.CreateNewTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 86 /* US_BACKTICK */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 86 /* US_BACKTICK */ }
    }), 'Terminal: Create New Integrated Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.CreateNewInActiveWorkspaceTerminalAction, terminalActions_1.CreateNewInActiveWorkspaceTerminalAction.ID, terminalActions_1.CreateNewInActiveWorkspaceTerminalAction.LABEL), 'Terminal: Create New Integrated Terminal (In Active Workspace)', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusActiveTerminalAction, terminalActions_1.FocusActiveTerminalAction.ID, terminalActions_1.FocusActiveTerminalAction.LABEL), 'Terminal: Focus Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusNextTerminalAction, terminalActions_1.FocusNextTerminalAction.ID, terminalActions_1.FocusNextTerminalAction.LABEL), 'Terminal: Focus Next Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusPreviousTerminalAction, terminalActions_1.FocusPreviousTerminalAction.ID, terminalActions_1.FocusPreviousTerminalAction.LABEL), 'Terminal: Focus Previous Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.TerminalPasteAction, terminalActions_1.TerminalPasteAction.ID, terminalActions_1.TerminalPasteAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KEY_V */ },
        // Don't apply to Mac since cmd+v works
        mac: { primary: null }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Paste into Active Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.SelectAllTerminalAction, terminalActions_1.SelectAllTerminalAction.ID, terminalActions_1.SelectAllTerminalAction.LABEL, {
        // Don't use ctrl+a by default as that would override the common go to start
        // of prompt shell binding
        primary: null,
        // Technically this doesn't need to be here as it will fall back to this
        // behavior anyway when handed to xterm.js, having this handled by VS Code
        // makes it easier for users to see how it works though.
        mac: { primary: 2048 /* CtrlCmd */ | 31 /* KEY_A */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Select All', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.RunSelectedTextInTerminalAction, terminalActions_1.RunSelectedTextInTerminalAction.ID, terminalActions_1.RunSelectedTextInTerminalAction.LABEL), 'Terminal: Run Selected Text In Active Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.RunActiveFileInTerminalAction, terminalActions_1.RunActiveFileInTerminalAction.ID, terminalActions_1.RunActiveFileInTerminalAction.LABEL), 'Terminal: Run Active File In Active Terminal', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ToggleTerminalAction, terminalActions_1.ToggleTerminalAction.ID, terminalActions_1.ToggleTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 86 /* US_BACKTICK */,
        mac: { primary: 256 /* WinCtrl */ | 86 /* US_BACKTICK */ }
    }), 'View: Toggle Integrated Terminal', nls.localize('viewCategory', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollDownTerminalAction, terminalActions_1.ScrollDownTerminalAction.ID, terminalActions_1.ScrollDownTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Down (Line)', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollDownPageTerminalAction, terminalActions_1.ScrollDownPageTerminalAction.ID, terminalActions_1.ScrollDownPageTerminalAction.LABEL, {
        primary: 1024 /* Shift */ | 12 /* PageDown */,
        mac: { primary: 12 /* PageDown */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Down (Page)', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollToBottomTerminalAction, terminalActions_1.ScrollToBottomTerminalAction.ID, terminalActions_1.ScrollToBottomTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 13 /* End */,
        linux: { primary: 1024 /* Shift */ | 13 /* End */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll to Bottom', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollUpTerminalAction, terminalActions_1.ScrollUpTerminalAction.ID, terminalActions_1.ScrollUpTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ },
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Up (Line)', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollUpPageTerminalAction, terminalActions_1.ScrollUpPageTerminalAction.ID, terminalActions_1.ScrollUpPageTerminalAction.LABEL, {
        primary: 1024 /* Shift */ | 11 /* PageUp */,
        mac: { primary: 11 /* PageUp */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Up (Page)', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ScrollToTopTerminalAction, terminalActions_1.ScrollToTopTerminalAction.ID, terminalActions_1.ScrollToTopTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 14 /* Home */,
        linux: { primary: 1024 /* Shift */ | 14 /* Home */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll to Top', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ClearTerminalAction, terminalActions_1.ClearTerminalAction.ID, terminalActions_1.ClearTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 41 /* KEY_K */,
        linux: { primary: null }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(1)), 'Terminal: Clear', category);
    if (platform.isWindows) {
        actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.SelectDefaultShellWindowsTerminalAction, terminalActions_1.SelectDefaultShellWindowsTerminalAction.ID, terminalActions_1.SelectDefaultShellWindowsTerminalAction.LABEL), 'Terminal: Select Default Shell', category);
    }
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.AllowWorkspaceShellTerminalCommand, terminalActions_1.AllowWorkspaceShellTerminalCommand.ID, terminalActions_1.AllowWorkspaceShellTerminalCommand.LABEL), 'Terminal: Allow Workspace Shell Configuration', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.DisallowWorkspaceShellTerminalCommand, terminalActions_1.DisallowWorkspaceShellTerminalCommand.ID, terminalActions_1.DisallowWorkspaceShellTerminalCommand.LABEL), 'Terminal: Disallow Workspace Shell Configuration', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.RenameTerminalAction, terminalActions_1.RenameTerminalAction.ID, terminalActions_1.RenameTerminalAction.LABEL), 'Terminal: Rename', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusTerminalFindWidgetAction, terminalActions_1.FocusTerminalFindWidgetAction.ID, terminalActions_1.FocusTerminalFindWidgetAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Find Widget', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.HideTerminalFindWidgetAction, terminalActions_1.HideTerminalFindWidgetAction.ID, terminalActions_1.HideTerminalFindWidgetAction.LABEL, {
        primary: 9 /* Escape */,
        secondary: [1024 /* Shift */ | 9 /* Escape */]
    }, contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE)), 'Terminal: Hide Find Widget', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ShowNextFindTermTerminalFindWidgetAction, terminalActions_1.ShowNextFindTermTerminalFindWidgetAction.ID, terminalActions_1.ShowNextFindTermTerminalFindWidgetAction.LABEL, {
        primary: 512 /* Alt */ | 18 /* DownArrow */
    }, contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE)), 'Terminal: Show Next Find Term', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.ShowPreviousFindTermTerminalFindWidgetAction, terminalActions_1.ShowPreviousFindTermTerminalFindWidgetAction.ID, terminalActions_1.ShowPreviousFindTermTerminalFindWidgetAction.LABEL, {
        primary: 512 /* Alt */ | 16 /* UpArrow */
    }, contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_INPUT_FOCUSED, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE)), 'Terminal: Show Previous Find Term', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.DeleteWordLeftTerminalAction, terminalActions_1.DeleteWordLeftTerminalAction.ID, terminalActions_1.DeleteWordLeftTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        mac: { primary: 512 /* Alt */ | 1 /* Backspace */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Delete Word Left', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.DeleteWordRightTerminalAction, terminalActions_1.DeleteWordRightTerminalAction.ID, terminalActions_1.DeleteWordRightTerminalAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
        mac: { primary: 512 /* Alt */ | 20 /* Delete */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Delete Word Right', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.MoveToLineStartTerminalAction, terminalActions_1.MoveToLineStartTerminalAction.ID, terminalActions_1.MoveToLineStartTerminalAction.LABEL, {
        primary: null,
        mac: { primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Move To Line Start', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.MoveToLineEndTerminalAction, terminalActions_1.MoveToLineEndTerminalAction.ID, terminalActions_1.MoveToLineEndTerminalAction.LABEL, {
        primary: null,
        mac: { primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Move To Line End', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.SplitVerticalTerminalAction, terminalActions_1.SplitVerticalTerminalAction.ID, terminalActions_1.SplitVerticalTerminalAction.LABEL, {
        primary: null,
        mac: { primary: 2048 /* CtrlCmd */ | 34 /* KEY_D */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Split Vertically', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusTerminalLeftAction, terminalActions_1.FocusTerminalLeftAction.ID, terminalActions_1.FocusTerminalLeftAction.LABEL, {
        primary: 512 /* Alt */ | 15 /* LeftArrow */,
        mac: { primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 15 /* LeftArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Terminal To Left', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusTerminalRightAction, terminalActions_1.FocusTerminalRightAction.ID, terminalActions_1.FocusTerminalRightAction.LABEL, {
        primary: 512 /* Alt */ | 17 /* RightArrow */,
        mac: { primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 17 /* RightArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Terminal To Right', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusTerminalDownAction, terminalActions_1.FocusTerminalDownAction.ID, terminalActions_1.FocusTerminalDownAction.LABEL, {
        primary: 512 /* Alt */ | 18 /* DownArrow */,
        mac: { primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Terminal Below', category);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(terminalActions_1.FocusTerminalUpAction, terminalActions_1.FocusTerminalUpAction.ID, terminalActions_1.FocusTerminalUpAction.LABEL, {
        primary: 512 /* Alt */ | 16 /* UpArrow */,
        mac: { primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 16 /* UpArrow */ }
    }, terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Terminal Above', category);
    terminalCommands.setup();
    terminalColorRegistry_1.registerColors();
});
