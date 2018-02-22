/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/base/common/labels", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/platform/windows/common/windows", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/workspace/common/workspace", "vs/workbench/parts/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/group/common/groupService", "vs/platform/message/common/message", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/errorMessage", "vs/base/common/paths", "vs/platform/list/browser/listService", "vs/base/parts/tree/browser/treeImpl", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/workbench/services/untitled/common/untitledEditorService", "vs/editor/browser/services/codeEditorService", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/editor/common/services/resolverService", "vs/base/common/async", "vs/workbench/parts/files/browser/files", "vs/workbench/services/workspace/common/workspaceEditing", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/network"], function (require, exports, nls, paths, severity_1, winjs_base_1, labels, uri_1, editorService_1, editor_1, windows_1, instantiation_1, viewlet_1, workspace_1, files_1, clipboardService_1, groupService_1, message_1, textfiles_1, errorMessage_1, paths_1, listService_1, treeImpl_1, commands_1, contextkey_1, files_2, untitledEditorService_1, codeEditorService_1, keybindingsRegistry_1, keyCodes_1, platform_1, resolverService_1, async_1, files_3, workspaceEditing_1, editorCommands_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Commands
    exports.REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
    exports.REVEAL_IN_OS_LABEL = platform_1.isWindows ? nls.localize('revealInWindows', "Reveal in Explorer") : platform_1.isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder");
    exports.REVEAL_IN_EXPLORER_COMMAND_ID = 'revealInExplorer';
    exports.REVERT_FILE_COMMAND_ID = 'workbench.action.files.revert';
    exports.OPEN_TO_SIDE_COMMAND_ID = 'explorer.openToSide';
    exports.SELECT_FOR_COMPARE_COMMAND_ID = 'selectForCompare';
    exports.COMPARE_SELECTED_COMMAND_ID = 'compareSelected';
    exports.COMPARE_RESOURCE_COMMAND_ID = 'compareFiles';
    exports.COMPARE_WITH_SAVED_COMMAND_ID = 'workbench.files.action.compareWithSaved';
    exports.COPY_PATH_COMMAND_ID = 'copyFilePath';
    exports.SAVE_FILE_AS_COMMAND_ID = 'workbench.action.files.saveAs';
    exports.SAVE_FILE_AS_LABEL = nls.localize('saveAs', "Save As...");
    exports.SAVE_FILE_COMMAND_ID = 'workbench.action.files.save';
    exports.SAVE_FILE_LABEL = nls.localize('save', "Save");
    exports.SAVE_ALL_COMMAND_ID = 'saveAll';
    exports.SAVE_ALL_LABEL = nls.localize('saveAll', "Save All");
    exports.SAVE_ALL_IN_GROUP_COMMAND_ID = 'workbench.files.action.saveAllInGroup';
    exports.SAVE_FILES_COMMAND_ID = 'workbench.action.files.saveFiles';
    exports.OpenEditorsGroupContext = new contextkey_1.RawContextKey('groupFocusedInOpenEditors', false);
    exports.DirtyEditorContext = new contextkey_1.RawContextKey('dirtyEditor', false);
    exports.ResourceSelectedForCompareContext = new contextkey_1.RawContextKey('resourceSelectedForCompare', false);
    exports.REMOVE_ROOT_FOLDER_COMMAND_ID = 'removeRootFolder';
    exports.REMOVE_ROOT_FOLDER_LABEL = nls.localize('removeFolderFromWorkspace', "Remove Folder from Workspace");
    exports.openWindowCommand = function (accessor, paths, forceNewWindow) {
        var windowsService = accessor.get(windows_1.IWindowsService);
        windowsService.openWindow(paths, { forceNewWindow: forceNewWindow });
    };
    function save(resource, isSaveAs, editorService, fileService, untitledEditorService, textFileService, editorGroupService) {
        if (resource && (fileService.canHandleResource(resource) || resource.scheme === network_1.Schemas.untitled)) {
            // Save As (or Save untitled with associated path)
            if (isSaveAs || resource.scheme === network_1.Schemas.untitled) {
                var encodingOfSource_1;
                if (resource.scheme === network_1.Schemas.untitled) {
                    encodingOfSource_1 = untitledEditorService.getEncoding(resource);
                }
                else if (fileService.canHandleResource(resource)) {
                    var textModel = textFileService.models.get(resource);
                    encodingOfSource_1 = textModel && textModel.getEncoding(); // text model can be null e.g. if this is a binary file!
                }
                var viewStateOfSource_1;
                var activeEditor = editorService.getActiveEditor();
                var editor_2 = codeEditorService_1.getCodeEditor(activeEditor);
                if (editor_2) {
                    var activeResource = editor_1.toResource(activeEditor.input, { supportSideBySide: true });
                    if (activeResource && (fileService.canHandleResource(activeResource) || resource.scheme === network_1.Schemas.untitled) && activeResource.toString() === resource.toString()) {
                        viewStateOfSource_1 = editor_2.saveViewState();
                    }
                }
                // Special case: an untitled file with associated path gets saved directly unless "saveAs" is true
                var savePromise = void 0;
                if (!isSaveAs && resource.scheme === network_1.Schemas.untitled && untitledEditorService.hasAssociatedFilePath(resource)) {
                    savePromise = textFileService.save(resource).then(function (result) {
                        if (result) {
                            return uri_1.default.file(resource.fsPath);
                        }
                        return null;
                    });
                }
                else {
                    savePromise = textFileService.saveAs(resource);
                }
                return savePromise.then(function (target) {
                    if (!target || target.toString() === resource.toString()) {
                        return void 0; // save canceled or same resource used
                    }
                    var replaceWith = {
                        resource: target,
                        encoding: encodingOfSource_1,
                        options: {
                            pinned: true,
                            viewState: viewStateOfSource_1
                        }
                    };
                    return editorService.replaceEditors([{
                            toReplace: { resource: resource },
                            replaceWith: replaceWith
                        }]).then(function () { return true; });
                });
            }
            // Pin the active editor if we are saving it
            var editor = editorService.getActiveEditor();
            var activeEditorResource = editor && editor.input && editor.input.getResource();
            if (activeEditorResource && activeEditorResource.toString() === resource.toString()) {
                editorGroupService.pinEditor(editor.position, editor.input);
            }
            // Just save
            return textFileService.save(resource, { force: true /* force a change to the file to trigger external watchers if any */ });
        }
        return winjs_base_1.TPromise.as(false);
    }
    function saveAll(saveAllArguments, editorService, untitledEditorService, textFileService, editorGroupService) {
        var stacks = editorGroupService.getStacksModel();
        // Store some properties per untitled file to restore later after save is completed
        var mapUntitledToProperties = Object.create(null);
        untitledEditorService.getDirty().forEach(function (resource) {
            var activeInGroups = [];
            var indexInGroups = [];
            var encoding = untitledEditorService.getEncoding(resource);
            // For each group
            stacks.groups.forEach(function (group, groupIndex) {
                // Find out if editor is active in group
                var activeEditor = group.activeEditor;
                var activeResource = editor_1.toResource(activeEditor, { supportSideBySide: true });
                activeInGroups[groupIndex] = (activeResource && activeResource.toString() === resource.toString());
                // Find index of editor in group
                indexInGroups[groupIndex] = -1;
                group.getEditors().forEach(function (editor, editorIndex) {
                    var editorResource = editor_1.toResource(editor, { supportSideBySide: true });
                    if (editorResource && editorResource.toString() === resource.toString()) {
                        indexInGroups[groupIndex] = editorIndex;
                        return;
                    }
                });
            });
            mapUntitledToProperties[resource.toString()] = { encoding: encoding, indexInGroups: indexInGroups, activeInGroups: activeInGroups };
        });
        // Save all
        return textFileService.saveAll(saveAllArguments).then(function (results) {
            // Reopen saved untitled editors
            var untitledToReopen = [];
            results.results.forEach(function (result) {
                if (!result.success || result.source.scheme !== network_1.Schemas.untitled) {
                    return;
                }
                var untitledProps = mapUntitledToProperties[result.source.toString()];
                if (!untitledProps) {
                    return;
                }
                // For each position where the untitled file was opened
                untitledProps.indexInGroups.forEach(function (indexInGroup, index) {
                    if (indexInGroup >= 0) {
                        untitledToReopen.push({
                            input: {
                                resource: result.target,
                                encoding: untitledProps.encoding,
                                options: {
                                    pinned: true,
                                    index: indexInGroup,
                                    preserveFocus: true,
                                    inactive: !untitledProps.activeInGroups[index]
                                }
                            },
                            position: index
                        });
                    }
                });
            });
            if (untitledToReopen.length) {
                return editorService.openEditors(untitledToReopen).then(function () { return true; });
            }
            return void 0;
        });
    }
    // Command registration
    commands_1.CommandsRegistry.registerCommand({
        id: exports.REVERT_FILE_COMMAND_ID,
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var textFileService = accessor.get(textfiles_1.ITextFileService);
            var messageService = accessor.get(message_1.IMessageService);
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), editorService);
            if (resource && resource.scheme !== network_1.Schemas.untitled) {
                return textFileService.revertAll(resources, { force: true }).then(null, function (error) {
                    messageService.show(message_1.Severity.Error, nls.localize('genericRevertError', "Failed to revert '{0}': {1}", paths_1.basename(resource.fsPath), errorMessage_1.toErrorMessage(error, false)));
                });
            }
            return winjs_base_1.TPromise.as(true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: files_1.ExplorerFocusCondition,
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
            primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        id: exports.OPEN_TO_SIDE_COMMAND_ID, handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
            var listService = accessor.get(listService_1.IListService);
            var fileService = accessor.get(files_2.IFileService);
            var tree = listService.lastFocusedList;
            var resources = files_3.getMultiSelectedResources(resource, listService, editorService);
            var stacks = editorGroupService.getStacksModel();
            var activeGroup = stacks.activeGroup;
            // Remove highlight
            if (tree instanceof treeImpl_1.Tree) {
                tree.clearHighlight();
            }
            // Set side input
            if (resources.length) {
                return fileService.resolveFiles(resources.map(function (resource) { return ({ resource: resource }); })).then(function (resolved) {
                    var editors = resolved.filter(function (r) { return r.success && !r.stat.isDirectory; }).map(function (r) { return ({
                        input: {
                            resource: r.stat.resource,
                            options: { preserveFocus: false }
                        }
                    }); });
                    return editorService.openEditors(editors, true).then(function () {
                        if (activeGroup) {
                            editorGroupService.focusGroup(stacks.positionOfGroup(activeGroup) + 1);
                        }
                    });
                });
            }
            return winjs_base_1.TPromise.as(true);
        }
    });
    var COMPARE_WITH_SAVED_SCHEMA = 'showModifications';
    var provider;
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.COMPARE_WITH_SAVED_COMMAND_ID,
        when: undefined,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 34 /* KEY_D */),
        handler: function (accessor, resource) {
            if (!provider) {
                var instantiationService = accessor.get(instantiation_1.IInstantiationService);
                var textModelService = accessor.get(resolverService_1.ITextModelService);
                provider = instantiationService.createInstance(files_1.FileOnDiskContentProvider);
                textModelService.registerTextModelContentProvider(COMPARE_WITH_SAVED_SCHEMA, provider);
            }
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            resource = files_3.getResourceForCommand(resource, accessor.get(listService_1.IListService), editorService);
            if (resource && resource.scheme === network_1.Schemas.file /* only files on disk supported for now */) {
                var name_1 = paths.basename(resource.fsPath);
                var editorLabel = nls.localize('modifiedLabel', "{0} (on disk) ↔ {1}", name_1, name_1);
                return editorService.openEditor({ leftResource: uri_1.default.from({ scheme: COMPARE_WITH_SAVED_SCHEMA, path: resource.fsPath }), rightResource: resource, label: editorLabel });
            }
            return winjs_base_1.TPromise.as(true);
        }
    });
    var globalResourceToCompare;
    var resourceSelectedForCompareContext;
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SELECT_FOR_COMPARE_COMMAND_ID,
        handler: function (accessor, resource) {
            var listService = accessor.get(listService_1.IListService);
            var tree = listService.lastFocusedList;
            // Remove highlight
            if (tree instanceof treeImpl_1.Tree) {
                tree.clearHighlight();
                tree.DOMFocus();
            }
            globalResourceToCompare = files_3.getResourceForCommand(resource, listService, accessor.get(editorService_1.IWorkbenchEditorService));
            if (!resourceSelectedForCompareContext) {
                resourceSelectedForCompareContext = exports.ResourceSelectedForCompareContext.bindTo(accessor.get(contextkey_1.IContextKeyService));
            }
            resourceSelectedForCompareContext.set(true);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COMPARE_SELECTED_COMMAND_ID,
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), editorService);
            if (resources.length === 2) {
                return editorService.openEditor({
                    leftResource: resources[0],
                    rightResource: resources[1]
                });
            }
            return winjs_base_1.TPromise.as(true);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COMPARE_RESOURCE_COMMAND_ID,
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var listService = accessor.get(listService_1.IListService);
            var tree = listService.lastFocusedList;
            // Remove highlight
            if (tree instanceof treeImpl_1.Tree) {
                tree.clearHighlight();
            }
            return editorService.openEditor({
                leftResource: globalResourceToCompare,
                rightResource: files_3.getResourceForCommand(resource, listService, editorService)
            });
        }
    });
    function revealResourcesInOS(resources, windowsService, messageService) {
        if (resources.length) {
            async_1.sequence(resources.map(function (r) { return function () { return windowsService.showItemInFolder(paths.normalize(r.fsPath, true)); }; }));
        }
        else {
            messageService.show(severity_1.default.Info, nls.localize('openFileToReveal', "Open a file first to reveal"));
        }
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.REVEAL_IN_OS_COMMAND_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: files_1.ExplorerFocusCondition,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KEY_R */,
        win: {
            primary: 1024 /* Shift */ | 512 /* Alt */ | 48 /* KEY_R */
        },
        handler: function (accessor, resource) {
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IWorkbenchEditorService));
            revealResourcesInOS(resources, accessor.get(windows_1.IWindowsService), accessor.get(message_1.IMessageService));
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: undefined,
        primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 48 /* KEY_R */),
        id: 'workbench.action.files.revealActiveFileInWindows',
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var activeInput = editorService.getActiveEditorInput();
            var resources = activeInput && activeInput.getResource() ? [activeInput.getResource()] : [];
            revealResourcesInOS(resources, accessor.get(windows_1.IWindowsService), accessor.get(message_1.IMessageService));
        }
    });
    function resourcesToClipboard(resources, clipboardService, messageService) {
        if (resources.length) {
            var lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
            var text = resources.map(function (r) { return r.scheme === network_1.Schemas.file ? labels.getPathLabel(r) : r.toString(); }).join(lineDelimiter);
            clipboardService.writeText(text);
        }
        else {
            messageService.show(severity_1.default.Info, nls.localize('openFileToCopy', "Open a file first to copy its path"));
        }
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: files_1.ExplorerFocusCondition,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KEY_C */,
        win: {
            primary: 1024 /* Shift */ | 512 /* Alt */ | 33 /* KEY_C */
        },
        id: exports.COPY_PATH_COMMAND_ID,
        handler: function (accessor, resource) {
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IWorkbenchEditorService));
            resourcesToClipboard(resources, accessor.get(clipboardService_1.IClipboardService), accessor.get(message_1.IMessageService));
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: undefined,
        primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 46 /* KEY_P */),
        id: 'workbench.action.files.copyPathOfActiveFile',
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var activeInput = editorService.getActiveEditorInput();
            var resources = activeInput && activeInput.getResource() ? [activeInput.getResource()] : [];
            resourcesToClipboard(resources, accessor.get(clipboardService_1.IClipboardService), accessor.get(message_1.IMessageService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.REVEAL_IN_EXPLORER_COMMAND_ID,
        handler: function (accessor, resource) {
            var viewletService = accessor.get(viewlet_1.IViewletService);
            var contextService = accessor.get(workspace_1.IWorkspaceContextService);
            resource = files_3.getResourceForCommand(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IWorkbenchEditorService));
            viewletService.openViewlet(files_1.VIEWLET_ID, false).then(function (viewlet) {
                var isInsideWorkspace = contextService.isInsideWorkspace(resource);
                if (isInsideWorkspace) {
                    var explorerView = viewlet.getExplorerView();
                    if (explorerView) {
                        explorerView.setExpanded(true);
                        explorerView.select(resource, true);
                    }
                }
                else {
                    var openEditorsView = viewlet.getOpenEditorsView();
                    if (openEditorsView) {
                        openEditorsView.setExpanded(true);
                    }
                }
            });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: exports.SAVE_FILE_AS_COMMAND_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: undefined,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KEY_S */,
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            resource = files_3.getResourceForCommand(resource, accessor.get(listService_1.IListService), editorService);
            return save(resource, true, editorService, accessor.get(files_2.IFileService), accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        when: undefined,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        primary: 2048 /* CtrlCmd */ | 49 /* KEY_S */,
        id: exports.SAVE_FILE_COMMAND_ID,
        handler: function (accessor, resource) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), editorService);
            if (resources.length === 1) {
                // If only one resource is selected explictly call save since the behavior is a bit different than save all #41841
                return save(resources[0], false, editorService, accessor.get(files_2.IFileService), accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
            }
            return saveAll(resources, editorService, accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SAVE_ALL_COMMAND_ID,
        handler: function (accessor) {
            return saveAll(true, accessor.get(editorService_1.IWorkbenchEditorService), accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SAVE_ALL_IN_GROUP_COMMAND_ID,
        handler: function (accessor, resource, editorContext) {
            var contexts = editorCommands_1.getMultiSelectedEditorContexts(editorContext, accessor.get(listService_1.IListService));
            var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
            var saveAllArg;
            if (!contexts.length) {
                saveAllArg = true;
            }
            else {
                var fileService_1 = accessor.get(files_2.IFileService);
                saveAllArg = [];
                contexts.forEach(function (context) {
                    var editorGroup = editorGroupService.getStacksModel().getGroup(context.groupId);
                    editorGroup.getEditors().forEach(function (editor) {
                        var resource = editor_1.toResource(editor, { supportSideBySide: true });
                        if (resource && (resource.scheme === network_1.Schemas.untitled || fileService_1.canHandleResource(resource))) {
                            saveAllArg.push(resource);
                        }
                    });
                });
            }
            return saveAll(saveAllArg, accessor.get(editorService_1.IWorkbenchEditorService), accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SAVE_FILES_COMMAND_ID,
        handler: function (accessor) {
            return saveAll(false, accessor.get(editorService_1.IWorkbenchEditorService), accessor.get(untitledEditorService_1.IUntitledEditorService), accessor.get(textfiles_1.ITextFileService), accessor.get(groupService_1.IEditorGroupService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.REMOVE_ROOT_FOLDER_COMMAND_ID,
        handler: function (accessor, resource) {
            var workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            var contextService = accessor.get(workspace_1.IWorkspaceContextService);
            var workspace = contextService.getWorkspace();
            var resources = files_3.getMultiSelectedResources(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IWorkbenchEditorService)).filter(function (r) {
                // Need to verify resources are workspaces since multi selection can trigger this command on some non workspace resources
                return workspace.folders.some(function (f) { return f.uri.toString() === r.toString(); });
            });
            return workspaceEditingService.removeFolders(resources);
        }
    });
});
