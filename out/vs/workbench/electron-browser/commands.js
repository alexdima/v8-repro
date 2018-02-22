/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/services/part/common/partService", "vs/workbench/electron-browser/workbench", "vs/platform/windows/common/windows", "vs/base/browser/ui/list/listWidget", "vs/base/common/errors", "vs/platform/commands/common/commands", "vs/workbench/services/editor/common/editorService", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listPaging", "vs/base/common/arrays", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, keyCodes_1, keybindingsRegistry_1, partService_1, workbench_1, windows_1, listWidget_1, errors, commands_1, editorService_1, listService_1, listPaging_1, arrays_1, contextkey_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- List Commands
    function registerCommands() {
        function focusDown(accessor, arg2) {
            var focused = accessor.get(listService_1.IListService).lastFocusedList;
            var count = typeof arg2 === 'number' ? arg2 : 1;
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                var list = focused;
                list.focusNext(count);
                list.reveal(list.getFocus()[0]);
            }
            else if (focused) {
                var tree = focused;
                tree.focusNext(count, { origin: 'keyboard' });
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusDown',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 18 /* DownArrow */,
            mac: {
                primary: 18 /* DownArrow */,
                secondary: [256 /* WinCtrl */ | 44 /* KEY_N */]
            },
            handler: function (accessor, arg2) { return focusDown(accessor, arg2); }
        });
        function expandMultiSelection(focused, previousFocus) {
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                var list = focused;
                var focus_1 = list.getFocus() ? list.getFocus()[0] : void 0;
                var selection = list.getSelection();
                if (selection && selection.indexOf(focus_1) >= 0) {
                    list.setSelection(selection.filter(function (s) { return s !== previousFocus; }));
                }
                else {
                    list.setSelection(selection.concat(focus_1));
                }
            }
            else if (focused) {
                var tree = focused;
                var focus_2 = tree.getFocus();
                var selection = tree.getSelection();
                if (selection && selection.indexOf(focus_2) >= 0) {
                    tree.setSelection(selection.filter(function (s) { return s !== previousFocus; }));
                }
                else {
                    tree.setSelection(selection.concat(focus_2));
                }
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.expandSelectionDown',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 1024 /* Shift */ | 18 /* DownArrow */,
            handler: function (accessor, arg2) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    // Focus down first
                    var previousFocus = list.getFocus() ? list.getFocus()[0] : void 0;
                    focusDown(accessor, arg2);
                    // Then adjust selection
                    expandMultiSelection(focused, previousFocus);
                }
                else if (focused) {
                    var tree = focused;
                    // Focus down first
                    var previousFocus = tree.getFocus();
                    focusDown(accessor, arg2);
                    // Then adjust selection
                    expandMultiSelection(focused, previousFocus);
                }
            }
        });
        function focusUp(accessor, arg2) {
            var focused = accessor.get(listService_1.IListService).lastFocusedList;
            var count = typeof arg2 === 'number' ? arg2 : 1;
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                var list = focused;
                list.focusPrevious(count);
                list.reveal(list.getFocus()[0]);
            }
            else if (focused) {
                var tree = focused;
                tree.focusPrevious(count, { origin: 'keyboard' });
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusUp',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 16 /* UpArrow */,
            mac: {
                primary: 16 /* UpArrow */,
                secondary: [256 /* WinCtrl */ | 46 /* KEY_P */]
            },
            handler: function (accessor, arg2) { return focusUp(accessor, arg2); }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.expandSelectionUp',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 1024 /* Shift */ | 16 /* UpArrow */,
            handler: function (accessor, arg2) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    // Focus up first
                    var previousFocus = list.getFocus() ? list.getFocus()[0] : void 0;
                    focusUp(accessor, arg2);
                    // Then adjust selection
                    expandMultiSelection(focused, previousFocus);
                }
                else if (focused) {
                    var tree = focused;
                    // Focus up first
                    var previousFocus = tree.getFocus();
                    focusUp(accessor, arg2);
                    // Then adjust selection
                    expandMultiSelection(focused, previousFocus);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.collapse',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 15 /* LeftArrow */,
            mac: {
                primary: 15 /* LeftArrow */,
                secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */]
            },
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // Tree only
                if (focused && !(focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList)) {
                    var tree_1 = focused;
                    var focus_3 = tree_1.getFocus();
                    tree_1.collapse(focus_3).then(function (didCollapse) {
                        if (focus_3 && !didCollapse) {
                            tree_1.focusParent({ origin: 'keyboard' });
                            return tree_1.reveal(tree_1.getFocus());
                        }
                        return void 0;
                    }).done(null, errors.onUnexpectedError);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.expand',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 17 /* RightArrow */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // Tree only
                if (focused && !(focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList)) {
                    var tree_2 = focused;
                    var focus_4 = tree_2.getFocus();
                    tree_2.expand(focus_4).then(function (didExpand) {
                        if (focus_4 && !didExpand) {
                            tree_2.focusFirstChild({ origin: 'keyboard' });
                            return tree_2.reveal(tree_2.getFocus());
                        }
                        return void 0;
                    }).done(null, errors.onUnexpectedError);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusPageUp',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 11 /* PageUp */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    list.focusPreviousPage();
                    list.reveal(list.getFocus()[0]);
                }
                else if (focused) {
                    var tree = focused;
                    tree.focusPreviousPage({ origin: 'keyboard' });
                    tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusPageDown',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 12 /* PageDown */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    list.focusNextPage();
                    list.reveal(list.getFocus()[0]);
                }
                else if (focused) {
                    var tree = focused;
                    tree.focusNextPage({ origin: 'keyboard' });
                    tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusFirst',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 14 /* Home */,
            handler: function (accessor) { return listFocusFirst(accessor); }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusFirstChild',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: null,
            handler: function (accessor) { return listFocusFirst(accessor, { fromFocused: true }); }
        });
        function listFocusFirst(accessor, options) {
            var focused = accessor.get(listService_1.IListService).lastFocusedList;
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                var list = focused;
                list.setFocus([0]);
                list.reveal(0);
            }
            else if (focused) {
                var tree = focused;
                tree.focusFirst({ origin: 'keyboard' }, options && options.fromFocused ? tree.getFocus() : void 0);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusLast',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 13 /* End */,
            handler: function (accessor) { return listFocusLast(accessor); }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.focusLastChild',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: null,
            handler: function (accessor) { return listFocusLast(accessor, { fromFocused: true }); }
        });
        function listFocusLast(accessor, options) {
            var focused = accessor.get(listService_1.IListService).lastFocusedList;
            // List
            if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                var list = focused;
                list.setFocus([list.length - 1]);
                list.reveal(list.length - 1);
            }
            else if (focused) {
                var tree = focused;
                tree.focusLast({ origin: 'keyboard' }, options && options.fromFocused ? tree.getFocus() : void 0);
                tree.reveal(tree.getFocus()).done(null, errors.onUnexpectedError);
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.select',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 3 /* Enter */,
            mac: {
                primary: 3 /* Enter */,
                secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
            },
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    list.setSelection(list.getFocus());
                    list.open(list.getFocus());
                }
                else if (focused) {
                    var tree = focused;
                    var focus_5 = tree.getFocus();
                    if (focus_5) {
                        tree.setSelection([focus_5], { origin: 'keyboard' });
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.selectAll',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: contextkey_1.ContextKeyExpr.and(listService_1.WorkbenchListFocusContextKey, listService_1.WorkbenchListSupportsMultiSelectContextKey),
            primary: 2048 /* CtrlCmd */ | 31 /* KEY_A */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // List
                if (focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList) {
                    var list = focused;
                    list.setSelection(arrays_1.range(list.length));
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.toggleExpand',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 10 /* Space */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // Tree only
                if (focused && !(focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList)) {
                    var tree = focused;
                    var focus_6 = tree.getFocus();
                    if (focus_6) {
                        tree.toggleExpansion(focus_6);
                    }
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'list.clear',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: listService_1.WorkbenchListFocusContextKey,
            primary: 9 /* Escape */,
            handler: function (accessor) {
                var focused = accessor.get(listService_1.IListService).lastFocusedList;
                // Tree only
                if (focused && !(focused instanceof listWidget_1.List || focused instanceof listPaging_1.PagedList)) {
                    var tree = focused;
                    if (tree.getSelection().length) {
                        tree.clearSelection({ origin: 'keyboard' });
                        return void 0;
                    }
                    if (tree.getFocus()) {
                        tree.clearFocus({ origin: 'keyboard' });
                        return void 0;
                    }
                }
            }
        });
        // --- commands
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'workbench.action.closeWindow',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: workbench_1.NoEditorsVisibleContext,
            primary: 2048 /* CtrlCmd */ | 53 /* KEY_W */,
            handler: function (accessor) {
                var windowService = accessor.get(windows_1.IWindowService);
                windowService.closeWindow();
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'workbench.action.exitZenMode',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(-1000),
            handler: function (accessor, configurationOrName) {
                var partService = accessor.get(partService_1.IPartService);
                partService.toggleZenMode();
            },
            when: workbench_1.InZenModeContext,
            primary: keyCodes_1.KeyChord(9 /* Escape */, 9 /* Escape */)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'workbench.action.quit',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            handler: function (accessor) {
                var windowsService = accessor.get(windows_1.IWindowsService);
                windowsService.quit();
            },
            when: void 0,
            primary: 2048 /* CtrlCmd */ | 47 /* KEY_Q */,
            win: { primary: void 0 }
        });
        commands_1.CommandsRegistry.registerCommand('_workbench.diff', function (accessor, args) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var leftResource = args[0], rightResource = args[1], label = args[2], description = args[3], options = args[4], position = args[5];
            if (!options || typeof options !== 'object') {
                options = {
                    preserveFocus: false
                };
            }
            if (!label) {
                label = nls.localize('diffLeftRightLabel', "{0} ⟷ {1}", leftResource.toString(true), rightResource.toString(true));
            }
            return editorService.openEditor({ leftResource: leftResource, rightResource: rightResource, label: label, description: description, options: options }, position).then(function () {
                return void 0;
            });
        });
        commands_1.CommandsRegistry.registerCommand('_workbench.open', function (accessor, args) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var resource = args[0], options = args[1], column = args[2];
            return editorService.openEditor({ resource: resource, options: options }, column).then(function () {
                return void 0;
            });
        });
        commands_1.CommandsRegistry.registerCommand('_workbench.removeFromRecentlyOpened', function (accessor, path) {
            var windowsService = accessor.get(windows_1.IWindowsService);
            return windowsService.removeFromRecentlyOpened([path]).then(function () {
                return void 0;
            });
        });
    }
    exports.registerCommands = registerCommands;
});
