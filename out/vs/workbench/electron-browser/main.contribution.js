/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls", "vs/platform/node/product", "os", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/actions", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/workbench/electron-browser/actions", "vs/workbench/electron-browser/workbench", "vs/workbench/electron-browser/commands", "vs/workbench/browser/actions/workspaceActions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/quickopen/quickopen", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, platform_1, nls, product_1, os, actions_1, configurationRegistry_1, actions_2, keyCodes_1, platform_2, actions_3, workbench_1, commands_1, workspaceActions_1, contextkey_1, quickopen_1, keybindingsRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Contribute Commands
    commands_1.registerCommands();
    // Contribute Global Actions
    var viewCategory = nls.localize('view', "View");
    var helpCategory = nls.localize('help', "Help");
    var fileCategory = nls.localize('file', "File");
    var workbenchActionsRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.NewWindowAction, actions_3.NewWindowAction.ID, actions_3.NewWindowAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KEY_N */ }), 'New Window');
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.CloseCurrentWindowAction, actions_3.CloseCurrentWindowAction.ID, actions_3.CloseCurrentWindowAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KEY_W */ }), 'Close Window');
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.SwitchWindow, actions_3.SwitchWindow.ID, actions_3.SwitchWindow.LABEL, { primary: null, mac: { primary: 256 /* WinCtrl */ | 53 /* KEY_W */ } }), 'Switch Window...');
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.QuickSwitchWindow, actions_3.QuickSwitchWindow.ID, actions_3.QuickSwitchWindow.LABEL), 'Quick Switch Window...');
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.QuickOpenRecentAction, actions_3.QuickOpenRecentAction.ID, actions_3.QuickOpenRecentAction.LABEL), 'File: Quick Open Recent...', fileCategory);
    if (platform_2.isMacintosh) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenFileFolderAction, workspaceActions_1.OpenFileFolderAction.ID, workspaceActions_1.OpenFileFolderAction.LABEL, { primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */ }), 'File: Open...', fileCategory);
    }
    else {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenFileAction, workspaceActions_1.OpenFileAction.ID, workspaceActions_1.OpenFileAction.LABEL, { primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */ }), 'File: Open File...', fileCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenFolderAction, workspaceActions_1.OpenFolderAction.ID, workspaceActions_1.OpenFolderAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 45 /* KEY_O */) }), 'File: Open Folder...', fileCategory);
    }
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.CloseWorkspaceAction, actions_3.CloseWorkspaceAction.ID, actions_3.CloseWorkspaceAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 36 /* KEY_F */) }), 'File: Close Workspace', fileCategory);
    if (!!product_1.default.reportIssueUrl) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.OpenIssueReporterAction, actions_3.OpenIssueReporterAction.ID, actions_3.OpenIssueReporterAction.LABEL), 'Help: Open Issue Reporter', helpCategory);
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ReportPerformanceIssueUsingReporterAction, actions_3.ReportPerformanceIssueUsingReporterAction.ID, actions_3.ReportPerformanceIssueUsingReporterAction.LABEL), 'Help: Report Performance Issue', helpCategory);
    }
    if (actions_3.KeybindingsReferenceAction.AVAILABLE) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.KeybindingsReferenceAction, actions_3.KeybindingsReferenceAction.ID, actions_3.KeybindingsReferenceAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 48 /* KEY_R */) }), 'Help: Keyboard Shortcuts Reference', helpCategory);
    }
    if (actions_3.OpenDocumentationUrlAction.AVAILABLE) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.OpenDocumentationUrlAction, actions_3.OpenDocumentationUrlAction.ID, actions_3.OpenDocumentationUrlAction.LABEL), 'Help: Documentation', helpCategory);
    }
    if (actions_3.OpenIntroductoryVideosUrlAction.AVAILABLE) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.OpenIntroductoryVideosUrlAction, actions_3.OpenIntroductoryVideosUrlAction.ID, actions_3.OpenIntroductoryVideosUrlAction.LABEL), 'Help: Introductory Videos', helpCategory);
    }
    if (actions_3.OpenTipsAndTricksUrlAction.AVAILABLE) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.OpenTipsAndTricksUrlAction, actions_3.OpenTipsAndTricksUrlAction.ID, actions_3.OpenTipsAndTricksUrlAction.LABEL), 'Help: Tips and Tricks', helpCategory);
    }
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ShowAboutDialogAction, actions_3.ShowAboutDialogAction.ID, actions_3.ShowAboutDialogAction.LABEL), 'Help: About', helpCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ZoomInAction, actions_3.ZoomInAction.ID, actions_3.ZoomInAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 81 /* US_EQUAL */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 81 /* US_EQUAL */, 2048 /* CtrlCmd */ | 104 /* NUMPAD_ADD */]
    }), 'View: Zoom In', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ZoomOutAction, actions_3.ZoomOutAction.ID, actions_3.ZoomOutAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 83 /* US_MINUS */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 83 /* US_MINUS */, 2048 /* CtrlCmd */ | 106 /* NUMPAD_SUBTRACT */],
        linux: { primary: 2048 /* CtrlCmd */ | 83 /* US_MINUS */, secondary: [2048 /* CtrlCmd */ | 106 /* NUMPAD_SUBTRACT */] }
    }), 'View: Zoom Out', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ZoomResetAction, actions_3.ZoomResetAction.ID, actions_3.ZoomResetAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */
    }), 'View: Reset Zoom', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.CloseMessagesAction, actions_3.CloseMessagesAction.ID, actions_3.CloseMessagesAction.LABEL, { primary: 9 /* Escape */, secondary: [1024 /* Shift */ | 9 /* Escape */] }, workbench_1.MessagesVisibleContext), 'Close Notification Messages');
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ToggleFullScreenAction, actions_3.ToggleFullScreenAction.ID, actions_3.ToggleFullScreenAction.LABEL, { primary: 69 /* F11 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 36 /* KEY_F */ } }), 'View: Toggle Full Screen', viewCategory);
    if (platform_2.isWindows || platform_2.isLinux) {
        workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ToggleMenuBarAction, actions_3.ToggleMenuBarAction.ID, actions_3.ToggleMenuBarAction.LABEL), 'View: Toggle Menu Bar', viewCategory);
    }
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.NavigateUpAction, actions_3.NavigateUpAction.ID, actions_3.NavigateUpAction.LABEL, null), 'View: Navigate to the View Above', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.NavigateDownAction, actions_3.NavigateDownAction.ID, actions_3.NavigateDownAction.LABEL, null), 'View: Navigate to the View Below', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.NavigateLeftAction, actions_3.NavigateLeftAction.ID, actions_3.NavigateLeftAction.LABEL, null), 'View: Navigate to the View on the Left', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.NavigateRightAction, actions_3.NavigateRightAction.ID, actions_3.NavigateRightAction.LABEL, null), 'View: Navigate to the View on the Right', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.IncreaseViewSizeAction, actions_3.IncreaseViewSizeAction.ID, actions_3.IncreaseViewSizeAction.LABEL, null), 'View: Increase Current View Size', viewCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.DecreaseViewSizeAction, actions_3.DecreaseViewSizeAction.ID, actions_3.DecreaseViewSizeAction.LABEL, null), 'View: Decrease Current View Size', viewCategory);
    var workspacesCategory = nls.localize('workspaces', "Workspaces");
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.AddRootFolderAction, workspaceActions_1.AddRootFolderAction.ID, workspaceActions_1.AddRootFolderAction.LABEL), 'Workspaces: Add Folder to Workspace...', workspacesCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.GlobalRemoveRootFolderAction, workspaceActions_1.GlobalRemoveRootFolderAction.ID, workspaceActions_1.GlobalRemoveRootFolderAction.LABEL), 'Workspaces: Remove Folder from Workspace...', workspacesCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenWorkspaceAction, workspaceActions_1.OpenWorkspaceAction.ID, workspaceActions_1.OpenWorkspaceAction.LABEL), 'Workspaces: Open Workspace...', workspacesCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.SaveWorkspaceAsAction, workspaceActions_1.SaveWorkspaceAsAction.ID, workspaceActions_1.SaveWorkspaceAsAction.LABEL), 'Workspaces: Save Workspace As...', workspacesCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenWorkspaceConfigFileAction, workspaceActions_1.OpenWorkspaceConfigFileAction.ID, workspaceActions_1.OpenWorkspaceConfigFileAction.LABEL), 'Workspaces: Open Workspace Configuration File', workspacesCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(workspaceActions_1.OpenFolderAsWorkspaceInNewWindowAction, workspaceActions_1.OpenFolderAsWorkspaceInNewWindowAction.ID, workspaceActions_1.OpenFolderAsWorkspaceInNewWindowAction.LABEL), 'Workspaces: Open Folder as Workspace in New Window', workspacesCategory);
    // Developer related actions
    var developerCategory = nls.localize('developer', "Developer");
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ShowStartupPerformance, actions_3.ShowStartupPerformance.ID, actions_3.ShowStartupPerformance.LABEL), 'Developer: Startup Performance', developerCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.ToggleSharedProcessAction, actions_3.ToggleSharedProcessAction.ID, actions_3.ToggleSharedProcessAction.LABEL), 'Developer: Toggle Shared Process', developerCategory);
    workbenchActionsRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(actions_3.InspectContextKeysAction, actions_3.InspectContextKeysAction.ID, actions_3.InspectContextKeysAction.LABEL), 'Developer: Inspect Context Keys', developerCategory);
    var recentFilesPickerContext = contextkey_1.ContextKeyExpr.and(quickopen_1.inQuickOpenContext, contextkey_1.ContextKeyExpr.has(actions_3.inRecentFilesPickerContextKey));
    var quickOpenNavigateNextInRecentFilesPickerId = 'workbench.action.quickOpenNavigateNextInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigateNextInRecentFilesPickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigateNextInRecentFilesPickerId, true),
        when: recentFilesPickerContext,
        primary: 2048 /* CtrlCmd */ | 48 /* KEY_R */,
        mac: { primary: 256 /* WinCtrl */ | 48 /* KEY_R */ }
    });
    var quickOpenNavigatePreviousInRecentFilesPicker = 'workbench.action.quickOpenNavigatePreviousInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigatePreviousInRecentFilesPicker,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigatePreviousInRecentFilesPicker, false),
        when: recentFilesPickerContext,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KEY_R */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KEY_R */ }
    });
    // Configuration: Workbench
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'workbench',
        'order': 7,
        'title': nls.localize('workbenchConfigurationTitle', "Workbench"),
        'type': 'object',
        'properties': {
            'workbench.editor.showTabs': {
                'type': 'boolean',
                'description': nls.localize('showEditorTabs', "Controls if opened editors should show in tabs or not."),
                'default': true
            },
            'workbench.editor.labelFormat': {
                'type': 'string',
                'enum': ['default', 'short', 'medium', 'long'],
                'enumDescriptions': [
                    nls.localize('workbench.editor.labelFormat.default', "Show the name of the file. When tabs are enabled and two files have the same name in one group the distinguinshing sections of each file's path are added. When tabs are disabled, the path relative to the workspace folder is shown if the editor is active."),
                    nls.localize('workbench.editor.labelFormat.short', "Show the name of the file followed by it's directory name."),
                    nls.localize('workbench.editor.labelFormat.medium', "Show the name of the file followed by it's path relative to the workspace folder."),
                    nls.localize('workbench.editor.labelFormat.long', "Show the name of the file followed by it's absolute path.")
                ],
                'default': 'default',
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by parenthesis are not to be translated.'], key: 'tabDescription' }, "Controls the format of the label for an editor. Changing this setting can for example make it easier to understand the location of a file:\n- short:   'parent'\n- medium:  'workspace/src/parent'\n- long:    '/home/user/workspace/src/parent'\n- default: '.../parent', when another tab shares the same title, or the relative workspace path if tabs are disabled"),
            },
            'workbench.editor.tabCloseButton': {
                'type': 'string',
                'enum': ['left', 'right', 'off'],
                'default': 'right',
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'editorTabCloseButton' }, "Controls the position of the editor's tabs close buttons or disables them when set to 'off'.")
            },
            'workbench.editor.tabSizing': {
                'type': 'string',
                'enum': ['fit', 'shrink'],
                'default': 'fit',
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'tabSizing' }, "Controls the sizing of editor tabs. Set to 'fit' to keep tabs always large enough to show the full editor label. Set to 'shrink' to allow tabs to get smaller when the available space is not enough to show all tabs at once.")
            },
            'workbench.editor.showIcons': {
                'type': 'boolean',
                'description': nls.localize('showIcons', "Controls if opened editors should show with an icon or not. This requires an icon theme to be enabled as well."),
                'default': true
            },
            'workbench.editor.enablePreview': {
                'type': 'boolean',
                'description': nls.localize('enablePreview', "Controls if opened editors show as preview. Preview editors are reused until they are kept (e.g. via double click or editing) and show up with an italic font style."),
                'default': true
            },
            'workbench.editor.enablePreviewFromQuickOpen': {
                'type': 'boolean',
                'description': nls.localize('enablePreviewFromQuickOpen', "Controls if opened editors from Quick Open show as preview. Preview editors are reused until they are kept (e.g. via double click or editing)."),
                'default': true
            },
            'workbench.editor.closeOnFileDelete': {
                'type': 'boolean',
                'description': nls.localize('closeOnFileDelete', "Controls if editors showing a file should close automatically when the file is deleted or renamed by some other process. Disabling this will keep the editor open as dirty on such an event. Note that deleting from within the application will always close the editor and that dirty files will never close to preserve your data."),
                'default': true
            },
            'workbench.editor.openPositioning': {
                'type': 'string',
                'enum': ['left', 'right', 'first', 'last'],
                'default': 'right',
                'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'editorOpenPositioning' }, "Controls where editors open. Select 'left' or 'right' to open editors to the left or right of the currently active one. Select 'first' or 'last' to open editors independently from the currently active one.")
            },
            'workbench.editor.revealIfOpen': {
                'type': 'boolean',
                'description': nls.localize('revealIfOpen', "Controls if an editor is revealed in any of the visible groups if opened. If disabled, an editor will prefer to open in the currently active editor group. If enabled, an already opened editor will be revealed instead of opened again in the currently active editor group. Note that there are some cases where this setting is ignored, e.g. when forcing an editor to open in a specific group or to the side of the currently active group."),
                'default': false
            },
            'workbench.editor.swipeToNavigate': {
                'type': 'boolean',
                'description': nls.localize('swipeToNavigate', "Navigate between open files using three-finger swipe horizontally."),
                'default': false,
                'included': platform_2.isMacintosh
            },
            'workbench.commandPalette.history': {
                'type': 'number',
                'description': nls.localize('commandHistory', "Controls the number of recently used commands to keep in history for the command palette. Set to 0 to disable command history."),
                'default': 50
            },
            'workbench.commandPalette.preserveInput': {
                'type': 'boolean',
                'description': nls.localize('preserveInput', "Controls if the last typed input to the command palette should be restored when opening it the next time."),
                'default': false
            },
            'workbench.quickOpen.closeOnFocusLost': {
                'type': 'boolean',
                'description': nls.localize('closeOnFocusLost', "Controls if Quick Open should close automatically once it loses focus."),
                'default': true
            },
            'workbench.settings.openDefaultSettings': {
                'type': 'boolean',
                'description': nls.localize('openDefaultSettings', "Controls if opening settings also opens an editor showing all default settings."),
                'default': true
            },
            'workbench.sideBar.location': {
                'type': 'string',
                'enum': ['left', 'right'],
                'default': 'left',
                'description': nls.localize('sideBarLocation', "Controls the location of the sidebar. It can either show on the left or right of the workbench.")
            },
            'workbench.panel.defaultLocation': {
                'type': 'string',
                'enum': ['bottom', 'right'],
                'default': 'bottom',
                'description': nls.localize('panelDefaultLocation', "Controls the default location of the panel. It can either show at the bottom or on the right of the workbench.")
            },
            'workbench.statusBar.visible': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('statusBarVisibility', "Controls the visibility of the status bar at the bottom of the workbench.")
            },
            'workbench.activityBar.visible': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('activityBarVisibility', "Controls the visibility of the activity bar in the workbench.")
            },
            'workbench.panel.alwaysShowActions': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('panelActionVisibility', "Controls the visibility of side panel tree view actions. Panel actions may either be always visible, or only visible when that panel is focused or hovered over.")
            },
            'workbench.fontAliasing': {
                'type': 'string',
                'enum': ['default', 'antialiased', 'none', 'auto'],
                'default': 'default',
                'description': nls.localize('fontAliasing', "Controls font aliasing method in the workbench.\n- default: Sub-pixel font smoothing. On most non-retina displays this will give the sharpest text\n- antialiased: Smooth the font on the level of the pixel, as opposed to the subpixel. Can make the font appear lighter overall\n- none: Disables font smoothing. Text will show with jagged sharp edges\n- auto: Applies `default` or `antialiased` automatically based on the DPI of displays."),
                'enumDescriptions': [
                    nls.localize('workbench.fontAliasing.default', "Sub-pixel font smoothing. On most non-retina displays this will give the sharpest text."),
                    nls.localize('workbench.fontAliasing.antialiased', "Smooth the font on the level of the pixel, as opposed to the subpixel. Can make the font appear lighter overall."),
                    nls.localize('workbench.fontAliasing.none', "Disables font smoothing. Text will show with jagged sharp edges."),
                    nls.localize('workbench.fontAliasing.auto', "Applies `default` or `antialiased` automatically based on the DPI of displays.")
                ],
                'included': platform_2.isMacintosh
            },
            'workbench.settings.enableNaturalLanguageSearch': {
                'type': 'boolean',
                'description': nls.localize('enableNaturalLanguageSettingsSearch', "Controls whether to enable the natural language search mode for settings."),
                'default': true
            }
        }
    });
    // Configuration: Window
    var _initialize = function () {
        configurationRegistry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': nls.localize('windowConfigurationTitle', "Window"),
            'type': 'object',
            'properties': {
                'window.openFilesInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        nls.localize('window.openFilesInNewWindow.on', "Files will open in a new window"),
                        nls.localize('window.openFilesInNewWindow.off', "Files will open in the window with the files' folder open or the last active window"),
                        nls.localize('window.openFilesInNewWindow.default', "Files will open in the window with the files' folder open or the last active window unless opened via the dock or from finder (macOS only)")
                    ],
                    'default': 'off',
                    'description': nls.localize('openFilesInNewWindow', "Controls if files should open in a new window.\n- default: files will open in the window with the files' folder open or the last active window unless opened via the dock or from finder (macOS only)\n- on: files will open in a new window\n- off: files will open in the window with the files' folder open or the last active window\nNote that there can still be cases where this setting is ignored (e.g. when using the -new-window or -reuse-window command line option).")
                },
                'window.openFoldersInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        nls.localize('window.openFoldersInNewWindow.on', "Folders will open in a new window"),
                        nls.localize('window.openFoldersInNewWindow.off', "Folders will replace the last active window"),
                        nls.localize('window.openFoldersInNewWindow.default', "Folders will open in a new window unless a folder is picked from within the application (e.g. via the File menu)")
                    ],
                    'default': 'default',
                    'description': nls.localize('openFoldersInNewWindow', "Controls if folders should open in a new window or replace the last active window.\n- default: folders will open in a new window unless a folder is picked from within the application (e.g. via the File menu)\n- on: folders will open in a new window\n- off: folders will replace the last active window\nNote that there can still be cases where this setting is ignored (e.g. when using the -new-window or -reuse-window command line option).")
                },
                'window.restoreWindows': {
                    'type': 'string',
                    'enum': ['all', 'folders', 'one', 'none'],
                    'enumDescriptions': [
                        nls.localize('window.reopenFolders.all', "Reopen all windows."),
                        nls.localize('window.reopenFolders.folders', "Reopen all folders. Empty workspaces will not be restored."),
                        nls.localize('window.reopenFolders.one', "Reopen the last active window."),
                        nls.localize('window.reopenFolders.none', "Never reopen a window. Always start with an empty one.")
                    ],
                    'default': 'one',
                    'description': nls.localize('restoreWindows', "Controls how windows are being reopened after a restart. Select 'none' to always start with an empty workspace, 'one' to reopen the last window you worked on, 'folders' to reopen all windows that had folders opened or 'all' to reopen all windows of your last session.")
                },
                'window.restoreFullscreen': {
                    'type': 'boolean',
                    'default': false,
                    'description': nls.localize('restoreFullscreen', "Controls if a window should restore to full screen mode if it was exited in full screen mode.")
                },
                'window.zoomLevel': {
                    'type': 'number',
                    'default': 0,
                    'description': nls.localize('zoomLevel', "Adjust the zoom level of the window. The original size is 0 and each increment above (e.g. 1) or below (e.g. -1) represents zooming 20% larger or smaller. You can also enter decimals to adjust the zoom level with a finer granularity.")
                },
                'window.title': {
                    'type': 'string',
                    'default': platform_2.isMacintosh ? '${activeEditorShort}${separator}${rootName}' : '${dirty}${activeEditorShort}${separator}${rootName}${separator}${appName}',
                    'description': nls.localize({ comment: ['This is the description for a setting. Values surrounded by parenthesis are not to be translated.'], key: 'title' }, "Controls the window title based on the active editor. Variables are substituted based on the context:\n\${activeEditorShort}: the file name (e.g. myFile.txt)\n\${activeEditorMedium}: the path of the file relative to the workspace folder (e.g. myFolder/myFile.txt)\n\${activeEditorLong}: the full path of the file (e.g. /Users/Development/myProject/myFolder/myFile.txt)\n\${folderName}: name of the workspace folder the file is contained in (e.g. myFolder)\n\${folderPath}: file path of the workspace folder the file is contained in (e.g. /Users/Development/myFolder)\n\${rootName}: name of the workspace (e.g. myFolder or myWorkspace)\n\${rootPath}: file path of the workspace (e.g. /Users/Development/myWorkspace)\n\${appName}: e.g. VS Code\n\${dirty}: a dirty indicator if the active editor is dirty\n\${separator}: a conditional separator (\" - \") that only shows when surrounded by variables with values")
                },
                'window.newWindowDimensions': {
                    'type': 'string',
                    'enum': ['default', 'inherit', 'maximized', 'fullscreen'],
                    'enumDescriptions': [
                        nls.localize('window.newWindowDimensions.default', "Open new windows in the center of the screen."),
                        nls.localize('window.newWindowDimensions.inherit', "Open new windows with same dimension as last active one."),
                        nls.localize('window.newWindowDimensions.maximized', "Open new windows maximized."),
                        nls.localize('window.newWindowDimensions.fullscreen', "Open new windows in full screen mode.")
                    ],
                    'default': 'default',
                    'description': nls.localize('newWindowDimensions', "Controls the dimensions of opening a new window when at least one window is already opened. By default, a new window will open in the center of the screen with small dimensions. When set to 'inherit', the window will get the same dimensions as the last window that was active. When set to 'maximized', the window will open maximized and fullscreen if configured to 'fullscreen'. Note that this setting does not have an impact on the first window that is opened. The first window will always restore the size and location as you left it before closing.")
                },
                'window.closeWhenEmpty': {
                    'type': 'boolean',
                    'default': false,
                    'description': nls.localize('closeWhenEmpty', "Controls if closing the last editor should also close the window. This setting only applies for windows that do not show folders.")
                },
                'window.menuBarVisibility': {
                    'type': 'string',
                    'enum': ['default', 'visible', 'toggle', 'hidden'],
                    'enumDescriptions': [
                        nls.localize('window.menuBarVisibility.default', "Menu is only hidden in full screen mode."),
                        nls.localize('window.menuBarVisibility.visible', "Menu is always visible even in full screen mode."),
                        nls.localize('window.menuBarVisibility.toggle', "Menu is hidden but can be displayed via Alt key."),
                        nls.localize('window.menuBarVisibility.hidden', "Menu is always hidden.")
                    ],
                    'default': 'default',
                    'description': nls.localize('menuBarVisibility', "Control the visibility of the menu bar. A setting of 'toggle' means that the menu bar is hidden and a single press of the Alt key will show it. By default, the menu bar will be visible, unless the window is full screen."),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.enableMenuBarMnemonics': {
                    'type': 'boolean',
                    'default': true,
                    'description': nls.localize('enableMenuBarMnemonics', "If enabled, the main menus can be opened via Alt-key shortcuts. Disabling mnemonics allows to bind these Alt-key shortcuts to editor commands instead."),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.autoDetectHighContrast': {
                    'type': 'boolean',
                    'default': true,
                    'description': nls.localize('autoDetectHighContrast', "If enabled, will automatically change to high contrast theme if Windows is using a high contrast theme, and to dark theme when switching away from a Windows high contrast theme."),
                    'included': platform_2.isWindows
                },
                'window.titleBarStyle': {
                    'type': 'string',
                    'enum': ['native', 'custom'],
                    'default': 'custom',
                    'description': nls.localize('titleBarStyle', "Adjust the appearance of the window title bar. Changes require a full restart to apply."),
                    'included': platform_2.isMacintosh
                },
                'window.nativeTabs': {
                    'type': 'boolean',
                    'default': false,
                    'description': nls.localize('window.nativeTabs', "Enables macOS Sierra window tabs. Note that changes require a full restart to apply and that native tabs will disable a custom title bar style if configured."),
                    'included': platform_2.isMacintosh && parseFloat(os.release()) >= 16 // Minimum: macOS Sierra (10.12.x = darwin 16.x)
                }
            }
        });
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
    // Configuration: Zen Mode
    configurationRegistry.registerConfiguration({
        'id': 'zenMode',
        'order': 9,
        'title': nls.localize('zenModeConfigurationTitle', "Zen Mode"),
        'type': 'object',
        'properties': {
            'zenMode.fullScreen': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('zenMode.fullScreen', "Controls if turning on Zen Mode also puts the workbench into full screen mode.")
            },
            'zenMode.hideTabs': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('zenMode.hideTabs', "Controls if turning on Zen Mode also hides workbench tabs.")
            },
            'zenMode.hideStatusBar': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('zenMode.hideStatusBar', "Controls if turning on Zen Mode also hides the status bar at the bottom of the workbench.")
            },
            'zenMode.hideActivityBar': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('zenMode.hideActivityBar', "Controls if turning on Zen Mode also hides the activity bar at the left of the workbench.")
            },
            'zenMode.restore': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('zenMode.restore', "Controls if a window should restore to zen mode if it was exited in zen mode.")
            }
        }
    });
});
