/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/services/group/common/groupService", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/common/editor/editorStacksModel", "vs/base/common/keyCodes", "vs/base/common/winjs.base", "vs/platform/quickOpen/common/quickOpen", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays"], function (require, exports, nls, types, keybindingsRegistry_1, groupService_1, editor_1, editorService_1, editor_2, editorContextKeys_1, textDiffEditor_1, editorStacksModel_1, keyCodes_1, winjs_base_1, quickOpen_1, listService_1, listWidget_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID = 'workbench.action.closeUnmodifiedEditors';
    exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeEditorsInGroup';
    exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = 'workbench.action.closeEditorsToTheRight';
    exports.CLOSE_EDITOR_COMMAND_ID = 'workbench.action.closeActiveEditor';
    exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeOtherEditors';
    exports.KEEP_EDITOR_COMMAND_ID = 'workbench.action.keepEditor';
    exports.SHOW_EDITORS_IN_GROUP = 'workbench.action.showEditorsInGroup';
    exports.TOGGLE_DIFF_INLINE_MODE = 'toggle.diff.editorMode';
    exports.NAVIGATE_IN_GROUP_ONE_PREFIX = 'edt one ';
    exports.NAVIGATE_IN_GROUP_TWO_PREFIX = 'edt two ';
    exports.NAVIGATE_IN_GROUP_THREE_PREFIX = 'edt three ';
    exports.NAVIGATE_ALL_EDITORS_GROUP_PREFIX = 'edt ';
    function setup() {
        registerActiveEditorMoveCommand();
        registerDiffEditorCommands();
        registerOpenEditorAtIndexCommands();
        registerEditorCommands();
    }
    exports.setup = setup;
    var isActiveEditorMoveArg = function (arg) {
        if (!types.isObject(arg)) {
            return false;
        }
        var activeEditorMoveArg = arg;
        if (!types.isString(activeEditorMoveArg.to)) {
            return false;
        }
        if (!types.isUndefined(activeEditorMoveArg.by) && !types.isString(activeEditorMoveArg.by)) {
            return false;
        }
        if (!types.isUndefined(activeEditorMoveArg.value) && !types.isNumber(activeEditorMoveArg.value)) {
            return false;
        }
        return true;
    };
    function registerActiveEditorMoveCommand() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: editor_1.EditorCommands.MoveActiveEditor,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: null,
            handler: function (accessor, args) { return moveActiveEditor(args, accessor); },
            description: {
                description: nls.localize('editorCommand.activeEditorMove.description', "Move the active editor by tabs or groups"),
                args: [
                    {
                        name: nls.localize('editorCommand.activeEditorMove.arg.name', "Active editor move argument"),
                        description: nls.localize('editorCommand.activeEditorMove.arg.description', "Argument Properties:\n\t* 'to': String value providing where to move.\n\t* 'by': String value providing the unit for move. By tab or by group.\n\t* 'value': Number value providing how many positions or an absolute position to move."),
                        constraint: isActiveEditorMoveArg
                    }
                ]
            }
        });
    }
    function moveActiveEditor(args, accessor) {
        if (args === void 0) { args = {}; }
        args.to = args.to || editor_1.ActiveEditorMovePositioning.RIGHT;
        args.by = args.by || editor_1.ActiveEditorMovePositioningBy.TAB;
        args.value = types.isUndefined(args.value) ? 1 : args.value;
        var activeEditor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
        if (activeEditor) {
            switch (args.by) {
                case editor_1.ActiveEditorMovePositioningBy.TAB:
                    return moveActiveTab(args, activeEditor, accessor);
                case editor_1.ActiveEditorMovePositioningBy.GROUP:
                    return moveActiveEditorToGroup(args, activeEditor, accessor);
            }
        }
    }
    function moveActiveTab(args, activeEditor, accessor) {
        var editorGroupsService = accessor.get(groupService_1.IEditorGroupService);
        var editorGroup = editorGroupsService.getStacksModel().groupAt(activeEditor.position);
        var index = editorGroup.indexOf(activeEditor.input);
        switch (args.to) {
            case editor_1.ActiveEditorMovePositioning.FIRST:
                index = 0;
                break;
            case editor_1.ActiveEditorMovePositioning.LAST:
                index = editorGroup.count - 1;
                break;
            case editor_1.ActiveEditorMovePositioning.LEFT:
                index = index - args.value;
                break;
            case editor_1.ActiveEditorMovePositioning.RIGHT:
                index = index + args.value;
                break;
            case editor_1.ActiveEditorMovePositioning.CENTER:
                index = Math.round(editorGroup.count / 2) - 1;
                break;
            case editor_1.ActiveEditorMovePositioning.POSITION:
                index = args.value - 1;
                break;
        }
        index = index < 0 ? 0 : index >= editorGroup.count ? editorGroup.count - 1 : index;
        editorGroupsService.moveEditor(activeEditor.input, editorGroup, editorGroup, { index: index });
    }
    function moveActiveEditorToGroup(args, activeEditor, accessor) {
        var newPosition = activeEditor.position;
        switch (args.to) {
            case editor_1.ActiveEditorMovePositioning.LEFT:
                newPosition = newPosition - 1;
                break;
            case editor_1.ActiveEditorMovePositioning.RIGHT:
                newPosition = newPosition + 1;
                break;
            case editor_1.ActiveEditorMovePositioning.FIRST:
                newPosition = editor_2.Position.ONE;
                break;
            case editor_1.ActiveEditorMovePositioning.LAST:
                newPosition = editor_2.Position.THREE;
                break;
            case editor_1.ActiveEditorMovePositioning.CENTER:
                newPosition = editor_2.Position.TWO;
                break;
            case editor_1.ActiveEditorMovePositioning.POSITION:
                newPosition = args.value - 1;
                break;
        }
        newPosition = editor_2.POSITIONS.indexOf(newPosition) !== -1 ? newPosition : activeEditor.position;
        accessor.get(groupService_1.IEditorGroupService).moveEditor(activeEditor.input, activeEditor.position, newPosition);
    }
    function registerDiffEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'workbench.action.compareEditor.nextChange',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: editor_1.TextCompareEditorVisible,
            primary: null,
            handler: function (accessor) { return navigateInDiffEditor(accessor, true); }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'workbench.action.compareEditor.previousChange',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: editor_1.TextCompareEditorVisible,
            primary: null,
            handler: function (accessor) { return navigateInDiffEditor(accessor, false); }
        });
        function navigateInDiffEditor(accessor, next) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            var candidates = [editorService.getActiveEditor()].concat(editorService.getVisibleEditors()).filter(function (e) { return e instanceof textDiffEditor_1.TextDiffEditor; });
            if (candidates.length > 0) {
                next ? candidates[0].getDiffNavigator().next() : candidates[0].getDiffNavigator().previous();
            }
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.TOGGLE_DIFF_INLINE_MODE,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: void 0,
            handler: function (accessor, resource, context) {
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editor;
                if (context) {
                    var position = positionAndInput(editorGroupService, editorService, context).position;
                    editor = editorService.getVisibleEditors()[position];
                }
                else {
                    editor = editorService.getActiveEditor();
                }
                if (editor instanceof textDiffEditor_1.TextDiffEditor) {
                    var control = editor.getControl();
                    var isInlineMode = !control.renderSideBySide;
                    control.updateOptions({
                        renderSideBySide: isInlineMode
                    });
                }
            }
        });
    }
    function registerOpenEditorAtIndexCommands() {
        var _loop_1 = function (i) {
            var editorIndex = i;
            var visibleIndex = i + 1;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: 'workbench.action.openEditorAtIndex' + visibleIndex,
                weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
                when: void 0,
                primary: 512 /* Alt */ | toKeyCode(visibleIndex),
                mac: { primary: 256 /* WinCtrl */ | toKeyCode(visibleIndex) },
                handler: function (accessor) {
                    var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                    var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                    var active = editorService.getActiveEditor();
                    if (active) {
                        var group = editorGroupService.getStacksModel().groupAt(active.position);
                        var editor = group.getEditor(editorIndex);
                        if (editor) {
                            return editorService.openEditor(editor);
                        }
                    }
                    return void 0;
                }
            });
        };
        // Keybindings to focus a specific index in the tab folder if tabs are enabled
        for (var i = 0; i < 9; i++) {
            _loop_1(i);
        }
        function toKeyCode(index) {
            switch (index) {
                case 0: return 21 /* KEY_0 */;
                case 1: return 22 /* KEY_1 */;
                case 2: return 23 /* KEY_2 */;
                case 3: return 24 /* KEY_3 */;
                case 4: return 25 /* KEY_4 */;
                case 5: return 26 /* KEY_5 */;
                case 6: return 27 /* KEY_6 */;
                case 7: return 28 /* KEY_7 */;
                case 8: return 29 /* KEY_8 */;
                case 9: return 30 /* KEY_9 */;
            }
            return void 0;
        }
    }
    function registerEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 51 /* KEY_U */),
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var model = editorGroupService.getStacksModel();
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var contexts = getMultiSelectedEditorContexts(context, accessor.get(listService_1.IListService));
                if (contexts.length === 0 && model.activeGroup) {
                    // If command is triggered from the command palette use the active group
                    contexts.push({ groupId: model.activeGroup.id });
                }
                var positionOne = void 0;
                var positionTwo = void 0;
                var positionThree = void 0;
                contexts.forEach(function (c) {
                    switch (model.positionOfGroup(model.getGroup(c.groupId))) {
                        case editor_2.Position.ONE:
                            positionOne = { unmodifiedOnly: true };
                            break;
                        case editor_2.Position.TWO:
                            positionTwo = { unmodifiedOnly: true };
                            break;
                        case editor_2.Position.THREE:
                            positionThree = { unmodifiedOnly: true };
                            break;
                    }
                });
                return editorService.closeEditors({ positionOne: positionOne, positionTwo: positionTwo, positionThree: positionThree });
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 53 /* KEY_W */),
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var contexts = getMultiSelectedEditorContexts(context, accessor.get(listService_1.IListService));
                var distinctGroupIds = arrays_1.distinct(contexts.map(function (c) { return c.groupId; }));
                var model = editorGroupService.getStacksModel();
                if (distinctGroupIds.length) {
                    return editorService.closeEditors(distinctGroupIds.map(function (gid) { return model.positionOfGroup(model.getGroup(gid)); }));
                }
                var activeEditor = editorService.getActiveEditor();
                if (activeEditor) {
                    return editorService.closeEditors(activeEditor.position);
                }
                return winjs_base_1.TPromise.as(false);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITOR_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: 2048 /* CtrlCmd */ | 53 /* KEY_W */,
            win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KEY_W */] },
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var contexts = getMultiSelectedEditorContexts(context, accessor.get(listService_1.IListService));
                var groupIds = arrays_1.distinct(contexts.map(function (context) { return context.groupId; }));
                var model = editorGroupService.getStacksModel();
                var editorsToClose = new Map();
                groupIds.forEach(function (groupId) {
                    var group = model.getGroup(groupId);
                    var position = model.positionOfGroup(group);
                    if (position >= 0) {
                        var inputs = contexts.map(function (c) {
                            if (c && groupId === c.groupId && types.isNumber(c.editorIndex)) {
                                return group.getEditor(c.editorIndex);
                            }
                            return group.activeEditor;
                        }).filter(function (input) { return !!input; });
                        if (inputs.length) {
                            editorsToClose.set(position, inputs);
                        }
                    }
                });
                if (editorsToClose.size === 0) {
                    var activeEditor = editorService.getActiveEditor();
                    if (activeEditor) {
                        return editorService.closeEditor(activeEditor.position, activeEditor.input);
                    }
                }
                return editorService.closeEditors({
                    positionOne: editorsToClose.get(editor_2.Position.ONE),
                    positionTwo: editorsToClose.get(editor_2.Position.TWO),
                    positionThree: editorsToClose.get(editor_2.Position.THREE)
                });
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: void 0,
            mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 50 /* KEY_T */ },
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var contexts = getMultiSelectedEditorContexts(context, accessor.get(listService_1.IListService));
                var model = editorGroupService.getStacksModel();
                if (contexts.length === 0) {
                    // Cover the case when run from command palette
                    var activeGroup = model.activeGroup;
                    var activeEditor = editorService.getActiveEditorInput();
                    if (activeGroup && activeEditor) {
                        contexts.push({ groupId: activeGroup.id, editorIndex: activeGroup.indexOf(activeEditor) });
                    }
                }
                var groupIds = arrays_1.distinct(contexts.map(function (context) { return context.groupId; }));
                var editorsToClose = new Map();
                groupIds.forEach(function (groupId) {
                    var group = model.getGroup(groupId);
                    var inputsToSkip = contexts.map(function (c) {
                        if (c.groupId === groupId && types.isNumber(c.editorIndex)) {
                            return group.getEditor(c.editorIndex);
                        }
                        return void 0;
                    }).filter(function (input) { return !!input; });
                    var toClose = group.getEditors().filter(function (input) { return inputsToSkip.indexOf(input) === -1; });
                    editorsToClose.set(model.positionOfGroup(group), toClose);
                });
                return editorService.closeEditors({
                    positionOne: editorsToClose.get(editor_2.Position.ONE),
                    positionTwo: editorsToClose.get(editor_2.Position.TWO),
                    positionThree: editorsToClose.get(editor_2.Position.THREE)
                });
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: void 0,
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var _a = positionAndInput(editorGroupService, editorService, context), position = _a.position, input = _a.input;
                if (typeof position === 'number' && input) {
                    return editorService.closeEditors(position, { except: input, direction: editor_2.Direction.RIGHT });
                }
                return winjs_base_1.TPromise.as(false);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.KEEP_EDITOR_COMMAND_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 3 /* Enter */),
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var _a = positionAndInput(editorGroupService, editorService, context), position = _a.position, input = _a.input;
                if (typeof position === 'number' && input) {
                    return editorGroupService.pinEditor(position, input);
                }
                return winjs_base_1.TPromise.as(false);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.SHOW_EDITORS_IN_GROUP,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: void 0,
            primary: void 0,
            handler: function (accessor, resource, context) {
                var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
                var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
                var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
                var stacks = editorGroupService.getStacksModel();
                var groupCount = stacks.groups.length;
                if (groupCount <= 1) {
                    return quickOpenService.show(exports.NAVIGATE_ALL_EDITORS_GROUP_PREFIX);
                }
                var position = positionAndInput(editorGroupService, editorService, context).position;
                switch (position) {
                    case editor_2.Position.TWO:
                        return quickOpenService.show(exports.NAVIGATE_IN_GROUP_TWO_PREFIX);
                    case editor_2.Position.THREE:
                        return quickOpenService.show(exports.NAVIGATE_IN_GROUP_THREE_PREFIX);
                }
                return quickOpenService.show(exports.NAVIGATE_IN_GROUP_ONE_PREFIX);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: '_workbench.printStacksModel',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(0),
            handler: function (accessor) {
                console.log(accessor.get(groupService_1.IEditorGroupService).getStacksModel().toString() + "\n\n");
            },
            when: void 0,
            primary: void 0
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: '_workbench.validateStacksModel',
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(0),
            handler: function (accessor) {
                accessor.get(groupService_1.IEditorGroupService).getStacksModel().validate();
            },
            when: void 0,
            primary: void 0
        });
    }
    function positionAndInput(editorGroupService, editorService, context) {
        // Resolve from context
        var model = editorGroupService.getStacksModel();
        var group = context ? model.getGroup(context.groupId) : undefined;
        var position = group ? model.positionOfGroup(group) : undefined;
        var input = group && types.isNumber(context.editorIndex) ? group.getEditor(context.editorIndex) : undefined;
        // If position or input are not passed in take the position and input of the active editor.
        var active = editorService.getActiveEditor();
        if (active) {
            position = typeof position === 'number' ? position : active.position;
            input = input ? input : active.input;
        }
        return { position: position, input: input };
    }
    function getMultiSelectedEditorContexts(editorContext, listService) {
        // First check for a focused list to return the selected items from
        var list = listService.lastFocusedList;
        if (list instanceof listWidget_1.List && list.isDOMFocused()) {
            var elementToContext = function (element) {
                return element instanceof editorStacksModel_1.EditorGroup ? { groupId: element.id, editorIndex: undefined } : { groupId: element.group.id, editorIndex: element.group.indexOf(element.editor) };
            };
            var onlyEditorGroupAndEditor = function (e) { return e instanceof editorStacksModel_1.EditorGroup || ('editor' in e && 'group' in e); };
            var focusedElements = list.getFocusedElements().filter(onlyEditorGroupAndEditor);
            // need to take into account when editor context is { group: group }
            var focus_1 = editorContext ? editorContext : focusedElements.length ? focusedElements.map(elementToContext)[0] : undefined;
            if (focus_1) {
                var selection = list.getSelectedElements().filter(onlyEditorGroupAndEditor);
                // Only respect selection if it contains focused element
                if (selection && selection.some(function (s) { return s instanceof editorStacksModel_1.EditorGroup ? s.id === focus_1.groupId : s.group.id === focus_1.groupId && s.group.indexOf(s.editor) === focus_1.editorIndex; })) {
                    return selection.map(elementToContext);
                }
                return [focus_1];
            }
        }
        // Otherwise go with passed in context
        return !!editorContext ? [editorContext] : [];
    }
    exports.getMultiSelectedEditorContexts = getMultiSelectedEditorContexts;
});
