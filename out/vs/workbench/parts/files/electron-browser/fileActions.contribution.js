define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/parts/files/electron-browser/fileActions", "vs/workbench/parts/files/electron-browser/saveErrorHandler", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/base/common/keyCodes", "vs/workbench/parts/files/electron-browser/fileCommands", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/platform", "vs/workbench/parts/files/common/files", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/parts/preferences/browser/preferencesActions", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/resources", "vs/platform/list/browser/listService", "vs/base/common/uri", "vs/base/common/network"], function (require, exports, nls, platform_1, fileActions_1, saveErrorHandler_1, actions_1, actions_2, keyCodes_1, fileCommands_1, commands_1, contextkey_1, keybindingsRegistry_1, platform_2, files_1, workspaceCommands_1, editorCommands_1, preferencesActions_1, textfiles_1, resources_1, listService_1, uri_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Contribute Global Actions
    var category = nls.localize('filesCategory', "File");
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.SaveAllAction, fileActions_1.SaveAllAction.ID, fileActions_1.SaveAllAction.LABEL, { primary: void 0, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 49 /* KEY_S */ }, win: { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 49 /* KEY_S */) } }), 'File: Save All', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.GlobalCompareResourcesAction, fileActions_1.GlobalCompareResourcesAction.ID, fileActions_1.GlobalCompareResourcesAction.LABEL), 'File: Compare Active File With...', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.FocusOpenEditorsView, fileActions_1.FocusOpenEditorsView.ID, fileActions_1.FocusOpenEditorsView.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 35 /* KEY_E */) }), 'File: Focus on Open Editors View', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.FocusFilesExplorer, fileActions_1.FocusFilesExplorer.ID, fileActions_1.FocusFilesExplorer.LABEL), 'File: Focus on Files Explorer', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.ShowActiveFileInExplorer, fileActions_1.ShowActiveFileInExplorer.ID, fileActions_1.ShowActiveFileInExplorer.LABEL), 'File: Reveal Active File in Side Bar', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.CollapseExplorerView, fileActions_1.CollapseExplorerView.ID, fileActions_1.CollapseExplorerView.LABEL), 'File: Collapse Folders in Explorer', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.RefreshExplorerView, fileActions_1.RefreshExplorerView.ID, fileActions_1.RefreshExplorerView.LABEL), 'File: Refresh Explorer', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.GlobalNewUntitledFileAction, fileActions_1.GlobalNewUntitledFileAction.ID, fileActions_1.GlobalNewUntitledFileAction.LABEL, { primary: 2048 /* CtrlCmd */ | 44 /* KEY_N */ }), 'File: New Untitled File', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.ShowOpenedFileInNewWindow, fileActions_1.ShowOpenedFileInNewWindow.ID, fileActions_1.ShowOpenedFileInNewWindow.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 45 /* KEY_O */) }), 'File: Open Active File in New Window', category);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(fileActions_1.CompareWithClipboardAction, fileActions_1.CompareWithClipboardAction.ID, fileActions_1.CompareWithClipboardAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 33 /* KEY_C */) }), 'File: Compare Active File with Clipboard', category);
    // Commands
    commands_1.CommandsRegistry.registerCommand('_files.windowOpen', fileCommands_1.openWindowCommand);
    var explorerCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    var RENAME_ID = 'renameFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: RENAME_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(explorerCommandsWeightBonus),
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 60 /* F2 */,
        mac: {
            primary: 3 /* Enter */
        },
        handler: fileActions_1.renameHandler
    });
    var MOVE_FILE_TO_TRASH_ID = 'moveFileToTrash';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: MOVE_FILE_TO_TRASH_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(explorerCommandsWeightBonus),
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
        },
        handler: fileActions_1.moveFileToTrashHandler
    });
    var DELETE_FILE_ID = 'deleteFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(explorerCommandsWeightBonus),
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 1024 /* Shift */ | 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1 /* Backspace */
        },
        handler: fileActions_1.deleteFileHandler
    });
    var COPY_FILE_ID = 'filesExplorer.copy';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COPY_FILE_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(explorerCommandsWeightBonus),
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        handler: fileActions_1.copyFileHandler,
    });
    var PASTE_FILE_ID = 'filesExplorer.paste';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: PASTE_FILE_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(explorerCommandsWeightBonus),
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition),
        primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
        handler: fileActions_1.pasteFileHandler
    });
    // Editor Title Context Menu
    appendEditorTitleContextMenuItem(fileCommands_1.REVEAL_IN_OS_COMMAND_ID, fileCommands_1.REVEAL_IN_OS_LABEL, resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file));
    appendEditorTitleContextMenuItem(fileCommands_1.COPY_PATH_COMMAND_ID, fileActions_1.CopyPathAction.LABEL, resources_1.ResourceContextKey.IsFile);
    appendEditorTitleContextMenuItem(fileCommands_1.REVEAL_IN_EXPLORER_COMMAND_ID, nls.localize('revealInSideBar', "Reveal in Side Bar"), resources_1.ResourceContextKey.IsFile);
    function appendEditorTitleContextMenuItem(id, title, when) {
        // Menu
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, {
            command: { id: id, title: title },
            when: when,
            group: '2_files'
        });
    }
    // Editor Title Menu for Conflict Resolution
    appendSaveConflictEditorTitleAction('workbench.files.action.acceptLocalChanges', nls.localize('acceptLocalChanges', "Use your changes and overwrite disk contents"), {
        light: uri_1.default.parse(require.toUrl("vs/workbench/parts/files/electron-browser/media/check.svg")).fsPath,
        dark: uri_1.default.parse(require.toUrl("vs/workbench/parts/files/electron-browser/media/check-inverse.svg")).fsPath
    }, -10, saveErrorHandler_1.acceptLocalChangesCommand);
    appendSaveConflictEditorTitleAction('workbench.files.action.revertLocalChanges', nls.localize('revertLocalChanges', "Discard your changes and revert to content on disk"), {
        light: uri_1.default.parse(require.toUrl("vs/workbench/parts/files/electron-browser/media/undo.svg")).fsPath,
        dark: uri_1.default.parse(require.toUrl("vs/workbench/parts/files/electron-browser/media/undo-inverse.svg")).fsPath
    }, -9, saveErrorHandler_1.revertLocalChangesCommand);
    function appendSaveConflictEditorTitleAction(id, title, iconPath, order, command) {
        // Command
        commands_1.CommandsRegistry.registerCommand(id, command);
        // Action
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
            command: { id: id, title: title, iconPath: iconPath },
            when: contextkey_1.ContextKeyExpr.equals(saveErrorHandler_1.CONFLICT_RESOLUTION_CONTEXT, true),
            group: 'navigation',
            order: order
        });
    }
    // Menu registration - command palette
    function appendToCommandPalette(id, title, category) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: id,
                title: title,
                category: category
            }
        });
    }
    appendToCommandPalette(fileCommands_1.COPY_PATH_COMMAND_ID, nls.localize('copyPathOfActive', "Copy Path of Active File"), category);
    appendToCommandPalette(fileCommands_1.SAVE_FILE_COMMAND_ID, fileCommands_1.SAVE_FILE_LABEL, category);
    appendToCommandPalette(fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID, nls.localize('saveAllInGroup', "Save All in Group"), category);
    appendToCommandPalette(fileCommands_1.SAVE_FILES_COMMAND_ID, nls.localize('saveFiles', "Save All Files"), category);
    appendToCommandPalette(fileCommands_1.REVERT_FILE_COMMAND_ID, nls.localize('revert', "Revert File"), category);
    appendToCommandPalette(fileCommands_1.COMPARE_WITH_SAVED_COMMAND_ID, nls.localize('compareActiveWithSaved', "Compare Active File with Saved"), category);
    appendToCommandPalette(fileCommands_1.REVEAL_IN_OS_COMMAND_ID, fileCommands_1.REVEAL_IN_OS_LABEL, category);
    appendToCommandPalette(fileCommands_1.SAVE_FILE_AS_COMMAND_ID, fileCommands_1.SAVE_FILE_AS_LABEL, category);
    appendToCommandPalette(editorCommands_1.CLOSE_EDITOR_COMMAND_ID, nls.localize('closeEditor', "Close Editor"), nls.localize('view', "View"));
    appendToCommandPalette(fileActions_1.NEW_FILE_COMMAND_ID, fileActions_1.NEW_FILE_LABEL, category);
    appendToCommandPalette(fileActions_1.NEW_FOLDER_COMMAND_ID, fileActions_1.NEW_FOLDER_LABEL, category);
    // Menu registration - open editors
    var openToSideCommand = {
        id: fileCommands_1.OPEN_TO_SIDE_COMMAND_ID,
        title: nls.localize('openToSide', "Open to the Side")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: resources_1.ResourceContextKey.HasResource
    });
    var revealInOsCommand = {
        id: fileCommands_1.REVEAL_IN_OS_COMMAND_ID,
        title: platform_2.isWindows ? nls.localize('revealInWindows', "Reveal in Explorer") : platform_2.isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file)
    });
    var copyPathCommand = {
        id: fileCommands_1.COPY_PATH_COMMAND_ID,
        title: nls.localize('copyPath', "Copy Path")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 40,
        command: copyPathCommand,
        when: resources_1.ResourceContextKey.IsFile
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 10,
        command: {
            id: fileCommands_1.SAVE_FILE_COMMAND_ID,
            title: fileCommands_1.SAVE_FILE_LABEL,
            precondition: fileCommands_1.DirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.IsFile, textfiles_1.AutoSaveContext.notEqualsTo('afterDelay'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 20,
        command: {
            id: fileCommands_1.REVERT_FILE_COMMAND_ID,
            title: nls.localize('revert', "Revert File"),
            precondition: fileCommands_1.DirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.IsFile, textfiles_1.AutoSaveContext.notEqualsTo('afterDelay'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        command: {
            id: fileCommands_1.SAVE_FILE_AS_COMMAND_ID,
            title: fileCommands_1.SAVE_FILE_AS_LABEL
        },
        when: resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.untitled)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        command: {
            id: fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID,
            title: nls.localize('saveAll', "Save All")
        },
        when: contextkey_1.ContextKeyExpr.and(fileCommands_1.OpenEditorsGroupContext, textfiles_1.AutoSaveContext.notEqualsTo('afterDelay'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 10,
        command: {
            id: fileCommands_1.COMPARE_WITH_SAVED_COMMAND_ID,
            title: nls.localize('compareWithSaved', "Compare with Saved"),
            precondition: fileCommands_1.DirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.IsFile, textfiles_1.AutoSaveContext.notEqualsTo('afterDelay'), listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    var compareResourceCommand = {
        id: fileCommands_1.COMPARE_RESOURCE_COMMAND_ID,
        title: nls.localize('compareWithSelected', "Compare with Selected")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, fileCommands_1.ResourceSelectedForCompareContext, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    var selectForCompareCommand = {
        id: fileCommands_1.SELECT_FOR_COMPARE_COMMAND_ID,
        title: nls.localize('compareSource', "Select for Compare")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    var compareSelectedCommand = {
        id: fileCommands_1.COMPARE_SELECTED_COMMAND_ID,
        title: nls.localize('compareSelected', "Compare Selected")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 10,
        command: {
            id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
            title: nls.localize('close', "Close")
        },
        when: fileCommands_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 20,
        command: {
            id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize('closeOthers', "Close Others")
        },
        when: fileCommands_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 30,
        command: {
            id: editorCommands_1.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID,
            title: nls.localize('closeUnmodified', "Close Unmodified")
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 40,
        command: {
            id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize('closeAll', "Close All")
        }
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 4,
        command: {
            id: fileActions_1.NEW_FILE_COMMAND_ID,
            title: fileActions_1.NEW_FILE_LABEL
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 6,
        command: {
            id: fileActions_1.NEW_FOLDER_COMMAND_ID,
            title: fileActions_1.NEW_FOLDER_LABEL
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.HasResource)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.IsFile, fileCommands_1.ResourceSelectedForCompareContext, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.IsFile, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.IsFile, listService_1.WorkbenchListDoubleSelection)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 10,
        command: {
            id: COPY_FILE_ID,
            title: fileActions_1.COPY_FILE_LABEL
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 20,
        command: {
            id: PASTE_FILE_ID,
            title: fileActions_1.PASTE_FILE_LABEL,
            precondition: fileActions_1.FileCopiedContext
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 30,
        command: copyPathCommand,
        when: resources_1.ResourceContextKey.IsFile
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 10,
        command: {
            id: workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID,
            title: workspaceCommands_1.ADD_ROOT_FOLDER_LABEL
        },
        when: files_1.ExplorerRootContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 20,
        command: {
            id: preferencesActions_1.OPEN_FOLDER_SETTINGS_COMMAND,
            title: preferencesActions_1.OPEN_FOLDER_SETTINGS_LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 30,
        command: {
            id: fileCommands_1.REMOVE_ROOT_FOLDER_COMMAND_ID,
            title: fileCommands_1.REMOVE_ROOT_FOLDER_LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 10,
        command: {
            id: RENAME_ID,
            title: fileActions_1.TRIGGER_RENAME_LABEL
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: MOVE_FILE_TO_TRASH_ID,
            title: fileActions_1.MOVE_FILE_TO_TRASH_LABEL
        },
        alt: {
            id: DELETE_FILE_ID,
            title: nls.localize('deleteFile', "Delete Permanently")
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
});
