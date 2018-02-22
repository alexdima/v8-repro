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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/actions", "vs/base/common/objects", "vs/editor/browser/services/codeEditorService", "vs/workbench/common/editor", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/workbench/services/editor/common/editorService", "vs/platform/quickOpen/common/quickOpen", "vs/workbench/services/part/common/partService", "vs/platform/editor/common/editor", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/group/common/groupService", "vs/platform/commands/common/commands", "vs/workbench/services/textfile/common/textfiles", "vs/platform/windows/common/windows", "vs/workbench/browser/parts/editor/editorCommands"], function (require, exports, winjs_base_1, nls, actions_1, objects_1, codeEditorService_1, editor_1, quickOpenModel_1, quickopen_1, editorService_1, quickOpen_1, partService_1, editor_2, history_1, keybinding_1, groupService_1, commands_1, textfiles_1, windows_1, editorCommands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SplitEditorAction = /** @class */ (function (_super) {
        __extends(SplitEditorAction, _super);
        function SplitEditorAction(id, label, editorService, editorGroupService) {
            var _this = _super.call(this, id, label, 'split-editor-action') || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        SplitEditorAction.prototype.run = function (context) {
            var _this = this;
            var editorToSplit;
            if (context) {
                var stacks = this.editorGroupService.getStacksModel();
                editorToSplit = this.editorService.getVisibleEditors()[stacks.positionOfGroup(stacks.getGroup(context.groupId))];
            }
            else {
                editorToSplit = this.editorService.getActiveEditor();
            }
            // Can only split with target editor
            if (!editorToSplit) {
                return winjs_base_1.TPromise.as(true);
            }
            // Return if the editor to split does not support split editing
            if (editorToSplit.input instanceof editor_1.EditorInput && !editorToSplit.input.supportsSplitEditor()) {
                return winjs_base_1.TPromise.as(true);
            }
            // Options
            var options;
            var codeEditor = codeEditorService_1.getCodeEditor(editorToSplit);
            if (codeEditor) {
                options = editor_1.TextEditorOptions.fromEditor(codeEditor);
            }
            else {
                options = new editor_1.EditorOptions();
            }
            options.pinned = true;
            // Count editors
            var visibleEditors = this.editorService.getVisibleEditors();
            var editorCount = visibleEditors.length;
            var targetPosition;
            switch (editorCount) {
                // Open split editor to the right/bottom of left/top one
                case 1:
                    targetPosition = editor_2.Position.TWO;
                    break;
                // Special case two editors opened
                case 2:
                    // Continue splitting to the right/bottom
                    if (editorToSplit.position === editor_2.Position.TWO) {
                        targetPosition = editor_2.Position.THREE;
                    }
                    else if (editorToSplit.position === editor_2.Position.ONE) {
                        options.preserveFocus = true;
                        return this.editorService.openEditor(editorToSplit.input, options, editor_2.Position.THREE).then(function () {
                            _this.editorGroupService.moveGroup(editor_2.Position.THREE, editor_2.Position.TWO);
                            _this.editorGroupService.focusGroup(editor_2.Position.TWO);
                        });
                    }
            }
            // Only split if we have a target position to split to
            if (typeof targetPosition === 'number') {
                return this.editorService.openEditor(editorToSplit.input, options, targetPosition);
            }
            return winjs_base_1.TPromise.as(true);
        };
        SplitEditorAction.ID = 'workbench.action.splitEditor';
        SplitEditorAction.LABEL = nls.localize('splitEditor', "Split Editor");
        SplitEditorAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService)
        ], SplitEditorAction);
        return SplitEditorAction;
    }(actions_1.Action));
    exports.SplitEditorAction = SplitEditorAction;
    var JoinTwoGroupsAction = /** @class */ (function (_super) {
        __extends(JoinTwoGroupsAction, _super);
        function JoinTwoGroupsAction(id, label, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        JoinTwoGroupsAction.prototype.run = function (context) {
            var _this = this;
            var editorStacksModel = this.editorGroupService.getStacksModel();
            // Return if has no other group to join to
            if (editorStacksModel.groups.length < 2) {
                return winjs_base_1.TPromise.as(true);
            }
            var fromPosition;
            var toPosition;
            // Joining group is from context, or the active group
            if (context) {
                fromPosition = editorStacksModel.positionOfGroup(context.group);
            }
            else {
                fromPosition = editorStacksModel.positionOfGroup(editorStacksModel.activeGroup);
            }
            // Target group is next group if joining from position one, otherwise it is the previous group
            if (fromPosition === editor_2.Position.ONE) {
                toPosition = fromPosition + 1;
            }
            else {
                toPosition = fromPosition - 1;
            }
            var fromGroup = editorStacksModel.groupAt(fromPosition);
            var toGroup = editorStacksModel.groupAt(toPosition);
            var activeEditor = fromGroup.activeEditor;
            var fromGroupEditors = fromGroup.getEditors();
            // Insert the editors to the start if moving to the next group, otherwise insert to the end
            // If an editor exists in both groups, its index is respected as in the joining group
            var movingToNextGroup = fromPosition < toPosition;
            var index = movingToNextGroup ? 0 : toGroup.count;
            // Inactive and preserve focus options are used to prevent unnecessary switchings of active editor or group
            fromGroupEditors.forEach(function (e) {
                var inactive = e !== activeEditor;
                _this.editorGroupService.moveEditor(e, fromPosition, toPosition, { index: index, inactive: inactive, preserveFocus: inactive });
                index = movingToNextGroup ? index + 1 : toGroup.count;
            });
            // Focus may be lost when the joining group is closed, regain focus on the target group
            this.editorGroupService.focusGroup(toGroup);
            return winjs_base_1.TPromise.as(true);
        };
        JoinTwoGroupsAction.ID = 'workbench.action.joinTwoGroups';
        JoinTwoGroupsAction.LABEL = nls.localize('joinTwoGroups', "Join Editors of Two Groups");
        JoinTwoGroupsAction = __decorate([
            __param(2, groupService_1.IEditorGroupService)
        ], JoinTwoGroupsAction);
        return JoinTwoGroupsAction;
    }(actions_1.Action));
    exports.JoinTwoGroupsAction = JoinTwoGroupsAction;
    var NavigateBetweenGroupsAction = /** @class */ (function (_super) {
        __extends(NavigateBetweenGroupsAction, _super);
        function NavigateBetweenGroupsAction(id, label, editorService, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        NavigateBetweenGroupsAction.prototype.run = function () {
            // Can cycle split with active editor
            var activeEditor = this.editorService.getActiveEditor();
            if (!activeEditor) {
                return winjs_base_1.TPromise.as(false);
            }
            // Cycle to the left/top and use module to start at 0 again
            var visibleEditors = this.editorService.getVisibleEditors();
            var editorCount = visibleEditors.length;
            var newIndex = (activeEditor.position + 1) % editorCount;
            this.editorGroupService.focusGroup(newIndex);
            return winjs_base_1.TPromise.as(true);
        };
        NavigateBetweenGroupsAction.ID = 'workbench.action.navigateEditorGroups';
        NavigateBetweenGroupsAction.LABEL = nls.localize('navigateEditorGroups', "Navigate Between Editor Groups");
        NavigateBetweenGroupsAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService)
        ], NavigateBetweenGroupsAction);
        return NavigateBetweenGroupsAction;
    }(actions_1.Action));
    exports.NavigateBetweenGroupsAction = NavigateBetweenGroupsAction;
    var FocusActiveGroupAction = /** @class */ (function (_super) {
        __extends(FocusActiveGroupAction, _super);
        function FocusActiveGroupAction(id, label, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            return _this;
        }
        FocusActiveGroupAction.prototype.run = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor) {
                activeEditor.focus();
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusActiveGroupAction.ID = 'workbench.action.focusActiveEditorGroup';
        FocusActiveGroupAction.LABEL = nls.localize('focusActiveEditorGroup', "Focus Active Editor Group");
        FocusActiveGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService)
        ], FocusActiveGroupAction);
        return FocusActiveGroupAction;
    }(actions_1.Action));
    exports.FocusActiveGroupAction = FocusActiveGroupAction;
    var FocusFirstGroupAction = /** @class */ (function (_super) {
        __extends(FocusFirstGroupAction, _super);
        function FocusFirstGroupAction(id, label, editorService, editorGroupService, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.historyService = historyService;
            return _this;
        }
        FocusFirstGroupAction.prototype.run = function () {
            // Find left/top editor and focus it
            var editors = this.editorService.getVisibleEditors();
            for (var _i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                var editor = editors_1[_i];
                if (editor.position === editor_2.Position.ONE) {
                    this.editorGroupService.focusGroup(editor_2.Position.ONE);
                    return winjs_base_1.TPromise.as(true);
                }
            }
            // Since no editor is currently opened, try to open last history entry to the target side
            var history = this.historyService.getHistory();
            if (history.length > 0) {
                var input = history[0];
                if (input instanceof editor_1.EditorInput) {
                    return this.editorService.openEditor(input, null, editor_2.Position.ONE);
                }
                return this.editorService.openEditor(input, editor_2.Position.ONE);
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusFirstGroupAction.ID = 'workbench.action.focusFirstEditorGroup';
        FocusFirstGroupAction.LABEL = nls.localize('focusFirstEditorGroup', "Focus First Editor Group");
        FocusFirstGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, history_1.IHistoryService)
        ], FocusFirstGroupAction);
        return FocusFirstGroupAction;
    }(actions_1.Action));
    exports.FocusFirstGroupAction = FocusFirstGroupAction;
    var BaseFocusSideGroupAction = /** @class */ (function (_super) {
        __extends(BaseFocusSideGroupAction, _super);
        function BaseFocusSideGroupAction(id, label, editorService, editorGroupService, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.historyService = historyService;
            return _this;
        }
        BaseFocusSideGroupAction.prototype.run = function () {
            // Require at least the reference editor to be visible
            var editors = this.editorService.getVisibleEditors();
            var referenceEditor;
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                // Target editor exists so focus it
                if (editor.position === this.getTargetEditorSide()) {
                    this.editorGroupService.focusGroup(editor.position);
                    return winjs_base_1.TPromise.as(true);
                }
                // Remember reference editor
                if (editor.position === this.getReferenceEditorSide()) {
                    referenceEditor = editor;
                }
            }
            // Require the reference editor to be visible and supporting split editor
            if (referenceEditor && referenceEditor.input.supportsSplitEditor()) {
                // Options
                var options = void 0;
                var codeEditor = codeEditorService_1.getCodeEditor(referenceEditor);
                if (codeEditor) {
                    options = editor_1.TextEditorOptions.fromEditor(codeEditor, { pinned: true });
                }
                else {
                    options = editor_1.EditorOptions.create({ pinned: true });
                }
                return this.editorService.openEditor(referenceEditor.input, options, this.getTargetEditorSide());
            }
            else if (referenceEditor) {
                var history_2 = this.historyService.getHistory();
                for (var _i = 0, history_3 = history_2; _i < history_3.length; _i++) {
                    var input = history_3[_i];
                    if (input instanceof editor_1.EditorInput) {
                        if (input.supportsSplitEditor()) {
                            return this.editorService.openEditor(input, { pinned: true }, this.getTargetEditorSide());
                        }
                    }
                    else {
                        return this.editorService.openEditor({ resource: input.resource, options: { pinned: true } }, this.getTargetEditorSide());
                    }
                }
            }
            return winjs_base_1.TPromise.as(true);
        };
        BaseFocusSideGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, history_1.IHistoryService)
        ], BaseFocusSideGroupAction);
        return BaseFocusSideGroupAction;
    }(actions_1.Action));
    exports.BaseFocusSideGroupAction = BaseFocusSideGroupAction;
    var FocusSecondGroupAction = /** @class */ (function (_super) {
        __extends(FocusSecondGroupAction, _super);
        function FocusSecondGroupAction(id, label, editorService, editorGroupService, historyService) {
            return _super.call(this, id, label, editorService, editorGroupService, historyService) || this;
        }
        FocusSecondGroupAction.prototype.getReferenceEditorSide = function () {
            return editor_2.Position.ONE;
        };
        FocusSecondGroupAction.prototype.getTargetEditorSide = function () {
            return editor_2.Position.TWO;
        };
        FocusSecondGroupAction.ID = 'workbench.action.focusSecondEditorGroup';
        FocusSecondGroupAction.LABEL = nls.localize('focusSecondEditorGroup', "Focus Second Editor Group");
        FocusSecondGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, history_1.IHistoryService)
        ], FocusSecondGroupAction);
        return FocusSecondGroupAction;
    }(BaseFocusSideGroupAction));
    exports.FocusSecondGroupAction = FocusSecondGroupAction;
    var FocusThirdGroupAction = /** @class */ (function (_super) {
        __extends(FocusThirdGroupAction, _super);
        function FocusThirdGroupAction(id, label, editorService, editorGroupService, historyService) {
            return _super.call(this, id, label, editorService, editorGroupService, historyService) || this;
        }
        FocusThirdGroupAction.prototype.getReferenceEditorSide = function () {
            return editor_2.Position.TWO;
        };
        FocusThirdGroupAction.prototype.getTargetEditorSide = function () {
            return editor_2.Position.THREE;
        };
        FocusThirdGroupAction.ID = 'workbench.action.focusThirdEditorGroup';
        FocusThirdGroupAction.LABEL = nls.localize('focusThirdEditorGroup', "Focus Third Editor Group");
        FocusThirdGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, history_1.IHistoryService)
        ], FocusThirdGroupAction);
        return FocusThirdGroupAction;
    }(BaseFocusSideGroupAction));
    exports.FocusThirdGroupAction = FocusThirdGroupAction;
    var FocusPreviousGroup = /** @class */ (function (_super) {
        __extends(FocusPreviousGroup, _super);
        function FocusPreviousGroup(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        FocusPreviousGroup.prototype.run = function () {
            // Require an active editor
            var activeEditor = this.editorService.getActiveEditor();
            if (!activeEditor) {
                return winjs_base_1.TPromise.as(true);
            }
            var stacks = this.editorGroupService.getStacksModel();
            var groupCount = stacks.groups.length;
            // Nothing to do if the only group
            if (groupCount === 1) {
                return winjs_base_1.TPromise.as(true);
            }
            // Nevigate to the previous group or to the last group if the first group is active
            var newPositionIndex = (activeEditor.position + groupCount - 1) % groupCount;
            this.editorGroupService.focusGroup(newPositionIndex);
            return winjs_base_1.TPromise.as(true);
        };
        FocusPreviousGroup.ID = 'workbench.action.focusPreviousGroup';
        FocusPreviousGroup.LABEL = nls.localize('focusPreviousGroup', "Focus Previous Group");
        FocusPreviousGroup = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], FocusPreviousGroup);
        return FocusPreviousGroup;
    }(actions_1.Action));
    exports.FocusPreviousGroup = FocusPreviousGroup;
    var FocusNextGroup = /** @class */ (function (_super) {
        __extends(FocusNextGroup, _super);
        function FocusNextGroup(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        FocusNextGroup.prototype.run = function (event) {
            var activeEditor = this.editorService.getActiveEditor();
            if (!activeEditor) {
                return winjs_base_1.TPromise.as(true);
            }
            var stacks = this.editorGroupService.getStacksModel();
            var groupCount = stacks.groups.length;
            // Nowhere to switch if the only group
            if (groupCount === 1) {
                return winjs_base_1.TPromise.as(true);
            }
            // Nevigate to the next group or to the first group if the last group is active
            var newPositionIndex = (activeEditor.position + 1) % groupCount;
            this.editorGroupService.focusGroup(newPositionIndex);
            return winjs_base_1.TPromise.as(true);
        };
        FocusNextGroup.ID = 'workbench.action.focusNextGroup';
        FocusNextGroup.LABEL = nls.localize('focusNextGroup', "Focus Next Group");
        FocusNextGroup = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], FocusNextGroup);
        return FocusNextGroup;
    }(actions_1.Action));
    exports.FocusNextGroup = FocusNextGroup;
    var OpenToSideAction = /** @class */ (function (_super) {
        __extends(OpenToSideAction, _super);
        function OpenToSideAction(editorService, editorGroupService) {
            var _this = _super.call(this, OpenToSideAction.OPEN_TO_SIDE_ID, OpenToSideAction.OPEN_TO_SIDE_LABEL) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.updateEnablement();
            _this.updateClass();
            return _this;
        }
        OpenToSideAction.prototype.updateClass = function () {
            var editorGroupLayoutVertical = (this.editorGroupService.getGroupOrientation() !== 'horizontal');
            this.class = editorGroupLayoutVertical ? 'quick-open-sidebyside-vertical' : 'quick-open-sidebyside-horizontal';
        };
        OpenToSideAction.prototype.updateEnablement = function () {
            var activeEditor = this.editorService.getActiveEditor();
            this.enabled = (!activeEditor || activeEditor.position !== editor_2.Position.THREE);
        };
        OpenToSideAction.prototype.run = function (context) {
            var entry = toEditorQuickOpenEntry(context);
            if (entry) {
                var input = entry.getInput();
                if (input instanceof editor_1.EditorInput) {
                    return this.editorService.openEditor(input, entry.getOptions(), true);
                }
                var resourceInput = input;
                resourceInput.options = objects_1.mixin(resourceInput.options, entry.getOptions());
                return this.editorService.openEditor(resourceInput, true);
            }
            return winjs_base_1.TPromise.as(false);
        };
        OpenToSideAction.OPEN_TO_SIDE_ID = 'workbench.action.openToSide';
        OpenToSideAction.OPEN_TO_SIDE_LABEL = nls.localize('openToSide', "Open to the Side");
        OpenToSideAction = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, groupService_1.IEditorGroupService)
        ], OpenToSideAction);
        return OpenToSideAction;
    }(actions_1.Action));
    exports.OpenToSideAction = OpenToSideAction;
    function toEditorQuickOpenEntry(element) {
        // QuickOpenEntryGroup
        if (element instanceof quickOpenModel_1.QuickOpenEntryGroup) {
            var group = element;
            if (group.getEntry()) {
                element = group.getEntry();
            }
        }
        // EditorQuickOpenEntry or EditorQuickOpenEntryGroup both implement IEditorQuickOpenEntry
        if (element instanceof quickopen_1.EditorQuickOpenEntry || element instanceof quickopen_1.EditorQuickOpenEntryGroup) {
            return element;
        }
        return null;
    }
    exports.toEditorQuickOpenEntry = toEditorQuickOpenEntry;
    var CloseEditorAction = /** @class */ (function (_super) {
        __extends(CloseEditorAction, _super);
        function CloseEditorAction(id, label, commandService) {
            var _this = _super.call(this, id, label, 'close-editor-action') || this;
            _this.commandService = commandService;
            return _this;
        }
        CloseEditorAction.prototype.run = function (context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITOR_COMMAND_ID, void 0, context);
        };
        CloseEditorAction.ID = 'workbench.action.closeActiveEditor';
        CloseEditorAction.LABEL = nls.localize('closeEditor', "Close Editor");
        CloseEditorAction = __decorate([
            __param(2, commands_1.ICommandService)
        ], CloseEditorAction);
        return CloseEditorAction;
    }(actions_1.Action));
    exports.CloseEditorAction = CloseEditorAction;
    var RevertAndCloseEditorAction = /** @class */ (function (_super) {
        __extends(RevertAndCloseEditorAction, _super);
        function RevertAndCloseEditorAction(id, label, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            return _this;
        }
        RevertAndCloseEditorAction.prototype.run = function () {
            var _this = this;
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && activeEditor.input) {
                var input_1 = activeEditor.input;
                var position_1 = activeEditor.position;
                // first try a normal revert where the contents of the editor are restored
                return activeEditor.input.revert().then(function () { return _this.editorService.closeEditor(position_1, input_1); }, function (error) {
                    // if that fails, since we are about to close the editor, we accept that
                    // the editor cannot be reverted and instead do a soft revert that just
                    // enables us to close the editor. With this, a user can always close a
                    // dirty editor even when reverting fails.
                    return activeEditor.input.revert({ soft: true }).then(function () { return _this.editorService.closeEditor(position_1, input_1); });
                });
            }
            return winjs_base_1.TPromise.as(false);
        };
        RevertAndCloseEditorAction.ID = 'workbench.action.revertAndCloseActiveEditor';
        RevertAndCloseEditorAction.LABEL = nls.localize('revertAndCloseActiveEditor', "Revert and Close Editor");
        RevertAndCloseEditorAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService)
        ], RevertAndCloseEditorAction);
        return RevertAndCloseEditorAction;
    }(actions_1.Action));
    exports.RevertAndCloseEditorAction = RevertAndCloseEditorAction;
    var CloseLeftEditorsInGroupAction = /** @class */ (function (_super) {
        __extends(CloseLeftEditorsInGroupAction, _super);
        function CloseLeftEditorsInGroupAction(id, label, editorService, groupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.groupService = groupService;
            return _this;
        }
        CloseLeftEditorsInGroupAction.prototype.run = function (context) {
            var editor = getTarget(this.editorService, this.groupService, context);
            if (editor) {
                return this.editorService.closeEditors(editor.position, { except: editor.input, direction: editor_2.Direction.LEFT });
            }
            return winjs_base_1.TPromise.as(false);
        };
        CloseLeftEditorsInGroupAction.ID = 'workbench.action.closeEditorsToTheLeft';
        CloseLeftEditorsInGroupAction.LABEL = nls.localize('closeEditorsToTheLeft', "Close Editors to the Left");
        CloseLeftEditorsInGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService)
        ], CloseLeftEditorsInGroupAction);
        return CloseLeftEditorsInGroupAction;
    }(actions_1.Action));
    exports.CloseLeftEditorsInGroupAction = CloseLeftEditorsInGroupAction;
    var CloseAllEditorsAction = /** @class */ (function (_super) {
        __extends(CloseAllEditorsAction, _super);
        function CloseAllEditorsAction(id, label, textFileService, editorService) {
            var _this = _super.call(this, id, label, 'action-close-all-files') || this;
            _this.textFileService = textFileService;
            _this.editorService = editorService;
            return _this;
        }
        CloseAllEditorsAction.prototype.run = function () {
            var _this = this;
            // Just close all if there are no or one dirty editor
            if (this.textFileService.getDirty().length < 2) {
                return this.editorService.closeEditors();
            }
            // Otherwise ask for combined confirmation
            return this.textFileService.confirmSave().then(function (confirm) {
                if (confirm === editor_1.ConfirmResult.CANCEL) {
                    return void 0;
                }
                var saveOrRevertPromise;
                if (confirm === editor_1.ConfirmResult.DONT_SAVE) {
                    saveOrRevertPromise = _this.textFileService.revertAll(null, { soft: true }).then(function () { return true; });
                }
                else {
                    saveOrRevertPromise = _this.textFileService.saveAll(true).then(function (res) { return res.results.every(function (r) { return r.success; }); });
                }
                return saveOrRevertPromise.then(function (success) {
                    if (success) {
                        return _this.editorService.closeEditors();
                    }
                    return void 0;
                });
            });
        };
        CloseAllEditorsAction.ID = 'workbench.action.closeAllEditors';
        CloseAllEditorsAction.LABEL = nls.localize('closeAllEditors', "Close All Editors");
        CloseAllEditorsAction = __decorate([
            __param(2, textfiles_1.ITextFileService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], CloseAllEditorsAction);
        return CloseAllEditorsAction;
    }(actions_1.Action));
    exports.CloseAllEditorsAction = CloseAllEditorsAction;
    var CloseEditorsInOtherGroupsAction = /** @class */ (function (_super) {
        __extends(CloseEditorsInOtherGroupsAction, _super);
        function CloseEditorsInOtherGroupsAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        CloseEditorsInOtherGroupsAction.prototype.run = function (context) {
            var position = context ? this.editorGroupService.getStacksModel().positionOfGroup(context.group) : null;
            if (typeof position !== 'number') {
                var activeEditor = this.editorService.getActiveEditor();
                if (activeEditor) {
                    position = activeEditor.position;
                }
            }
            if (typeof position === 'number') {
                return this.editorService.closeEditors(editor_2.POSITIONS.filter(function (p) { return p !== position; }));
            }
            return winjs_base_1.TPromise.as(false);
        };
        CloseEditorsInOtherGroupsAction.ID = 'workbench.action.closeEditorsInOtherGroups';
        CloseEditorsInOtherGroupsAction.LABEL = nls.localize('closeEditorsInOtherGroups', "Close Editors in Other Groups");
        CloseEditorsInOtherGroupsAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], CloseEditorsInOtherGroupsAction);
        return CloseEditorsInOtherGroupsAction;
    }(actions_1.Action));
    exports.CloseEditorsInOtherGroupsAction = CloseEditorsInOtherGroupsAction;
    var MoveGroupLeftAction = /** @class */ (function (_super) {
        __extends(MoveGroupLeftAction, _super);
        function MoveGroupLeftAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        MoveGroupLeftAction.prototype.run = function (context) {
            var position = context ? this.editorGroupService.getStacksModel().positionOfGroup(context.group) : null;
            if (typeof position !== 'number') {
                var activeEditor = this.editorService.getActiveEditor();
                if (activeEditor && (activeEditor.position === editor_2.Position.TWO || activeEditor.position === editor_2.Position.THREE)) {
                    position = activeEditor.position;
                }
            }
            if (typeof position === 'number') {
                var newPosition = (position === editor_2.Position.TWO) ? editor_2.Position.ONE : editor_2.Position.TWO;
                // Move group
                this.editorGroupService.moveGroup(position, newPosition);
            }
            return winjs_base_1.TPromise.as(false);
        };
        MoveGroupLeftAction.ID = 'workbench.action.moveActiveEditorGroupLeft';
        MoveGroupLeftAction.LABEL = nls.localize('moveActiveGroupLeft', "Move Editor Group Left");
        MoveGroupLeftAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveGroupLeftAction);
        return MoveGroupLeftAction;
    }(actions_1.Action));
    exports.MoveGroupLeftAction = MoveGroupLeftAction;
    var MoveGroupRightAction = /** @class */ (function (_super) {
        __extends(MoveGroupRightAction, _super);
        function MoveGroupRightAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        MoveGroupRightAction.prototype.run = function (context) {
            var position = context ? this.editorGroupService.getStacksModel().positionOfGroup(context.group) : null;
            if (typeof position !== 'number') {
                var activeEditor = this.editorService.getActiveEditor();
                var editors = this.editorService.getVisibleEditors();
                if ((editors.length === 2 && activeEditor.position === editor_2.Position.ONE) || (editors.length === 3 && activeEditor.position !== editor_2.Position.THREE)) {
                    position = activeEditor.position;
                }
            }
            if (typeof position === 'number') {
                var newPosition = (position === editor_2.Position.ONE) ? editor_2.Position.TWO : editor_2.Position.THREE;
                // Move group
                this.editorGroupService.moveGroup(position, newPosition);
            }
            return winjs_base_1.TPromise.as(false);
        };
        MoveGroupRightAction.ID = 'workbench.action.moveActiveEditorGroupRight';
        MoveGroupRightAction.LABEL = nls.localize('moveActiveGroupRight', "Move Editor Group Right");
        MoveGroupRightAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveGroupRightAction);
        return MoveGroupRightAction;
    }(actions_1.Action));
    exports.MoveGroupRightAction = MoveGroupRightAction;
    var MinimizeOtherGroupsAction = /** @class */ (function (_super) {
        __extends(MinimizeOtherGroupsAction, _super);
        function MinimizeOtherGroupsAction(id, label, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        MinimizeOtherGroupsAction.prototype.run = function () {
            this.editorGroupService.arrangeGroups(groupService_1.GroupArrangement.MINIMIZE_OTHERS);
            return winjs_base_1.TPromise.as(false);
        };
        MinimizeOtherGroupsAction.ID = 'workbench.action.minimizeOtherEditors';
        MinimizeOtherGroupsAction.LABEL = nls.localize('minimizeOtherEditorGroups', "Minimize Other Editor Groups");
        MinimizeOtherGroupsAction = __decorate([
            __param(2, groupService_1.IEditorGroupService)
        ], MinimizeOtherGroupsAction);
        return MinimizeOtherGroupsAction;
    }(actions_1.Action));
    exports.MinimizeOtherGroupsAction = MinimizeOtherGroupsAction;
    var EvenGroupWidthsAction = /** @class */ (function (_super) {
        __extends(EvenGroupWidthsAction, _super);
        function EvenGroupWidthsAction(id, label, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        EvenGroupWidthsAction.prototype.run = function () {
            this.editorGroupService.arrangeGroups(groupService_1.GroupArrangement.EVEN);
            return winjs_base_1.TPromise.as(false);
        };
        EvenGroupWidthsAction.ID = 'workbench.action.evenEditorWidths';
        EvenGroupWidthsAction.LABEL = nls.localize('evenEditorGroups', "Even Editor Group Widths");
        EvenGroupWidthsAction = __decorate([
            __param(2, groupService_1.IEditorGroupService)
        ], EvenGroupWidthsAction);
        return EvenGroupWidthsAction;
    }(actions_1.Action));
    exports.EvenGroupWidthsAction = EvenGroupWidthsAction;
    var MaximizeGroupAction = /** @class */ (function (_super) {
        __extends(MaximizeGroupAction, _super);
        function MaximizeGroupAction(id, label, editorService, editorGroupService, partService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorService = editorService;
            _this.editorGroupService = editorGroupService;
            _this.partService = partService;
            return _this;
        }
        MaximizeGroupAction.prototype.run = function () {
            if (this.editorService.getActiveEditor()) {
                this.editorGroupService.arrangeGroups(groupService_1.GroupArrangement.MINIMIZE_OTHERS);
                return this.partService.setSideBarHidden(true);
            }
            return winjs_base_1.TPromise.as(false);
        };
        MaximizeGroupAction.ID = 'workbench.action.maximizeEditor';
        MaximizeGroupAction.LABEL = nls.localize('maximizeEditor', "Maximize Editor Group and Hide Sidebar");
        MaximizeGroupAction = __decorate([
            __param(2, editorService_1.IWorkbenchEditorService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, partService_1.IPartService)
        ], MaximizeGroupAction);
        return MaximizeGroupAction;
    }(actions_1.Action));
    exports.MaximizeGroupAction = MaximizeGroupAction;
    function getTarget(editorService, editorGroupService, context) {
        if (context) {
            return { input: context.editor, position: editorGroupService.getStacksModel().positionOfGroup(context.group) };
        }
        var activeEditor = editorService.getActiveEditor();
        if (activeEditor) {
            return { input: activeEditor.input, position: activeEditor.position };
        }
        return null;
    }
    var BaseNavigateEditorAction = /** @class */ (function (_super) {
        __extends(BaseNavigateEditorAction, _super);
        function BaseNavigateEditorAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        BaseNavigateEditorAction.prototype.run = function () {
            var model = this.editorGroupService.getStacksModel();
            var result = this.navigate();
            if (result) {
                return this.editorService.openEditor(result.editor, null, model.positionOfGroup(result.group));
            }
            return winjs_base_1.TPromise.as(false);
        };
        return BaseNavigateEditorAction;
    }(actions_1.Action));
    exports.BaseNavigateEditorAction = BaseNavigateEditorAction;
    var OpenNextEditor = /** @class */ (function (_super) {
        __extends(OpenNextEditor, _super);
        function OpenNextEditor(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editorGroupService, editorService) || this;
        }
        OpenNextEditor.prototype.navigate = function () {
            return this.editorGroupService.getStacksModel().next(true /* jump groups */);
        };
        OpenNextEditor.ID = 'workbench.action.nextEditor';
        OpenNextEditor.LABEL = nls.localize('openNextEditor', "Open Next Editor");
        OpenNextEditor = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenNextEditor);
        return OpenNextEditor;
    }(BaseNavigateEditorAction));
    exports.OpenNextEditor = OpenNextEditor;
    var OpenPreviousEditor = /** @class */ (function (_super) {
        __extends(OpenPreviousEditor, _super);
        function OpenPreviousEditor(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editorGroupService, editorService) || this;
        }
        OpenPreviousEditor.prototype.navigate = function () {
            return this.editorGroupService.getStacksModel().previous(true /* jump groups */);
        };
        OpenPreviousEditor.ID = 'workbench.action.previousEditor';
        OpenPreviousEditor.LABEL = nls.localize('openPreviousEditor', "Open Previous Editor");
        OpenPreviousEditor = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenPreviousEditor);
        return OpenPreviousEditor;
    }(BaseNavigateEditorAction));
    exports.OpenPreviousEditor = OpenPreviousEditor;
    var OpenNextEditorInGroup = /** @class */ (function (_super) {
        __extends(OpenNextEditorInGroup, _super);
        function OpenNextEditorInGroup(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editorGroupService, editorService) || this;
        }
        OpenNextEditorInGroup.prototype.navigate = function () {
            return this.editorGroupService.getStacksModel().next(false /* do NOT jump groups */);
        };
        OpenNextEditorInGroup.ID = 'workbench.action.nextEditorInGroup';
        OpenNextEditorInGroup.LABEL = nls.localize('nextEditorInGroup', "Open Next Editor in Group");
        OpenNextEditorInGroup = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenNextEditorInGroup);
        return OpenNextEditorInGroup;
    }(BaseNavigateEditorAction));
    exports.OpenNextEditorInGroup = OpenNextEditorInGroup;
    var OpenPreviousEditorInGroup = /** @class */ (function (_super) {
        __extends(OpenPreviousEditorInGroup, _super);
        function OpenPreviousEditorInGroup(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editorGroupService, editorService) || this;
        }
        OpenPreviousEditorInGroup.prototype.navigate = function () {
            return this.editorGroupService.getStacksModel().previous(false /* do NOT jump groups */);
        };
        OpenPreviousEditorInGroup.ID = 'workbench.action.previousEditorInGroup';
        OpenPreviousEditorInGroup.LABEL = nls.localize('openPreviousEditorInGroup', "Open Previous Editor in Group");
        OpenPreviousEditorInGroup = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenPreviousEditorInGroup);
        return OpenPreviousEditorInGroup;
    }(BaseNavigateEditorAction));
    exports.OpenPreviousEditorInGroup = OpenPreviousEditorInGroup;
    var OpenLastEditorInGroup = /** @class */ (function (_super) {
        __extends(OpenLastEditorInGroup, _super);
        function OpenLastEditorInGroup(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editorGroupService, editorService) || this;
        }
        OpenLastEditorInGroup.prototype.navigate = function () {
            return this.editorGroupService.getStacksModel().last();
        };
        OpenLastEditorInGroup.ID = 'workbench.action.lastEditorInGroup';
        OpenLastEditorInGroup.LABEL = nls.localize('lastEditorInGroup', "Open Last Editor in Group");
        OpenLastEditorInGroup = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenLastEditorInGroup);
        return OpenLastEditorInGroup;
    }(BaseNavigateEditorAction));
    exports.OpenLastEditorInGroup = OpenLastEditorInGroup;
    var NavigateForwardAction = /** @class */ (function (_super) {
        __extends(NavigateForwardAction, _super);
        function NavigateForwardAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        NavigateForwardAction.prototype.run = function () {
            this.historyService.forward();
            return winjs_base_1.TPromise.as(null);
        };
        NavigateForwardAction.ID = 'workbench.action.navigateForward';
        NavigateForwardAction.LABEL = nls.localize('navigateNext', "Go Forward");
        NavigateForwardAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], NavigateForwardAction);
        return NavigateForwardAction;
    }(actions_1.Action));
    exports.NavigateForwardAction = NavigateForwardAction;
    var NavigateBackwardsAction = /** @class */ (function (_super) {
        __extends(NavigateBackwardsAction, _super);
        function NavigateBackwardsAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        NavigateBackwardsAction.prototype.run = function () {
            this.historyService.back();
            return winjs_base_1.TPromise.as(null);
        };
        NavigateBackwardsAction.ID = 'workbench.action.navigateBack';
        NavigateBackwardsAction.LABEL = nls.localize('navigatePrevious', "Go Back");
        NavigateBackwardsAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], NavigateBackwardsAction);
        return NavigateBackwardsAction;
    }(actions_1.Action));
    exports.NavigateBackwardsAction = NavigateBackwardsAction;
    var NavigateLastAction = /** @class */ (function (_super) {
        __extends(NavigateLastAction, _super);
        function NavigateLastAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        NavigateLastAction.prototype.run = function () {
            this.historyService.last();
            return winjs_base_1.TPromise.as(null);
        };
        NavigateLastAction.ID = 'workbench.action.navigateLast';
        NavigateLastAction.LABEL = nls.localize('navigateLast', "Go Last");
        NavigateLastAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], NavigateLastAction);
        return NavigateLastAction;
    }(actions_1.Action));
    exports.NavigateLastAction = NavigateLastAction;
    var ReopenClosedEditorAction = /** @class */ (function (_super) {
        __extends(ReopenClosedEditorAction, _super);
        function ReopenClosedEditorAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        ReopenClosedEditorAction.prototype.run = function () {
            this.historyService.reopenLastClosedEditor();
            return winjs_base_1.TPromise.as(false);
        };
        ReopenClosedEditorAction.ID = 'workbench.action.reopenClosedEditor';
        ReopenClosedEditorAction.LABEL = nls.localize('reopenClosedEditor', "Reopen Closed Editor");
        ReopenClosedEditorAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], ReopenClosedEditorAction);
        return ReopenClosedEditorAction;
    }(actions_1.Action));
    exports.ReopenClosedEditorAction = ReopenClosedEditorAction;
    var ClearRecentFilesAction = /** @class */ (function (_super) {
        __extends(ClearRecentFilesAction, _super);
        function ClearRecentFilesAction(id, label, windowsService) {
            var _this = _super.call(this, id, label) || this;
            _this.windowsService = windowsService;
            return _this;
        }
        ClearRecentFilesAction.prototype.run = function () {
            this.windowsService.clearRecentlyOpened();
            return winjs_base_1.TPromise.as(false);
        };
        ClearRecentFilesAction.ID = 'workbench.action.clearRecentFiles';
        ClearRecentFilesAction.LABEL = nls.localize('clearRecentFiles', "Clear Recently Opened");
        ClearRecentFilesAction = __decorate([
            __param(2, windows_1.IWindowsService)
        ], ClearRecentFilesAction);
        return ClearRecentFilesAction;
    }(actions_1.Action));
    exports.ClearRecentFilesAction = ClearRecentFilesAction;
    var ShowEditorsInGroupOneAction = /** @class */ (function (_super) {
        __extends(ShowEditorsInGroupOneAction, _super);
        function ShowEditorsInGroupOneAction(actionId, actionLabel, quickOpenService) {
            var _this = _super.call(this, actionId, actionLabel, editorCommands_1.NAVIGATE_IN_GROUP_ONE_PREFIX, quickOpenService) || this;
            _this.class = 'show-group-editors-action';
            return _this;
        }
        ShowEditorsInGroupOneAction.ID = 'workbench.action.showEditorsInFirstGroup';
        ShowEditorsInGroupOneAction.LABEL = nls.localize('showEditorsInFirstGroup', "Show Editors in First Group");
        ShowEditorsInGroupOneAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService)
        ], ShowEditorsInGroupOneAction);
        return ShowEditorsInGroupOneAction;
    }(quickopen_1.QuickOpenAction));
    exports.ShowEditorsInGroupOneAction = ShowEditorsInGroupOneAction;
    var ShowEditorsInGroupTwoAction = /** @class */ (function (_super) {
        __extends(ShowEditorsInGroupTwoAction, _super);
        function ShowEditorsInGroupTwoAction(actionId, actionLabel, quickOpenService) {
            var _this = _super.call(this, actionId, actionLabel, editorCommands_1.NAVIGATE_IN_GROUP_TWO_PREFIX, quickOpenService) || this;
            _this.class = 'show-group-editors-action';
            return _this;
        }
        ShowEditorsInGroupTwoAction.ID = 'workbench.action.showEditorsInSecondGroup';
        ShowEditorsInGroupTwoAction.LABEL = nls.localize('showEditorsInSecondGroup', "Show Editors in Second Group");
        ShowEditorsInGroupTwoAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService)
        ], ShowEditorsInGroupTwoAction);
        return ShowEditorsInGroupTwoAction;
    }(quickopen_1.QuickOpenAction));
    exports.ShowEditorsInGroupTwoAction = ShowEditorsInGroupTwoAction;
    var ShowEditorsInGroupThreeAction = /** @class */ (function (_super) {
        __extends(ShowEditorsInGroupThreeAction, _super);
        function ShowEditorsInGroupThreeAction(actionId, actionLabel, quickOpenService) {
            var _this = _super.call(this, actionId, actionLabel, editorCommands_1.NAVIGATE_IN_GROUP_THREE_PREFIX, quickOpenService) || this;
            _this.class = 'show-group-editors-action';
            return _this;
        }
        ShowEditorsInGroupThreeAction.ID = 'workbench.action.showEditorsInThirdGroup';
        ShowEditorsInGroupThreeAction.LABEL = nls.localize('showEditorsInThirdGroup', "Show Editors in Third Group");
        ShowEditorsInGroupThreeAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService)
        ], ShowEditorsInGroupThreeAction);
        return ShowEditorsInGroupThreeAction;
    }(quickopen_1.QuickOpenAction));
    exports.ShowEditorsInGroupThreeAction = ShowEditorsInGroupThreeAction;
    var ShowAllEditorsAction = /** @class */ (function (_super) {
        __extends(ShowAllEditorsAction, _super);
        function ShowAllEditorsAction(actionId, actionLabel, quickOpenService) {
            return _super.call(this, actionId, actionLabel, editorCommands_1.NAVIGATE_ALL_EDITORS_GROUP_PREFIX, quickOpenService) || this;
        }
        ShowAllEditorsAction.ID = 'workbench.action.showAllEditors';
        ShowAllEditorsAction.LABEL = nls.localize('showAllEditors', "Show All Editors");
        ShowAllEditorsAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService)
        ], ShowAllEditorsAction);
        return ShowAllEditorsAction;
    }(quickopen_1.QuickOpenAction));
    exports.ShowAllEditorsAction = ShowAllEditorsAction;
    var BaseQuickOpenEditorInGroupAction = /** @class */ (function (_super) {
        __extends(BaseQuickOpenEditorInGroupAction, _super);
        function BaseQuickOpenEditorInGroupAction(id, label, quickOpenService, keybindingService, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.keybindingService = keybindingService;
            _this.editorGroupService = editorGroupService;
            return _this;
        }
        BaseQuickOpenEditorInGroupAction.prototype.run = function () {
            var keys = this.keybindingService.lookupKeybindings(this.id);
            var stacks = this.editorGroupService.getStacksModel();
            if (stacks.activeGroup) {
                var activePosition = stacks.positionOfGroup(stacks.activeGroup);
                var prefix = editorCommands_1.NAVIGATE_IN_GROUP_ONE_PREFIX;
                if (activePosition === editor_2.Position.TWO) {
                    prefix = editorCommands_1.NAVIGATE_IN_GROUP_TWO_PREFIX;
                }
                else if (activePosition === editor_2.Position.THREE) {
                    prefix = editorCommands_1.NAVIGATE_IN_GROUP_THREE_PREFIX;
                }
                this.quickOpenService.show(prefix, { quickNavigateConfiguration: { keybindings: keys } });
            }
            return winjs_base_1.TPromise.as(true);
        };
        BaseQuickOpenEditorInGroupAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, groupService_1.IEditorGroupService)
        ], BaseQuickOpenEditorInGroupAction);
        return BaseQuickOpenEditorInGroupAction;
    }(actions_1.Action));
    exports.BaseQuickOpenEditorInGroupAction = BaseQuickOpenEditorInGroupAction;
    var OpenPreviousRecentlyUsedEditorInGroupAction = /** @class */ (function (_super) {
        __extends(OpenPreviousRecentlyUsedEditorInGroupAction, _super);
        function OpenPreviousRecentlyUsedEditorInGroupAction(id, label, quickOpenService, keybindingService, editorGroupService) {
            return _super.call(this, id, label, quickOpenService, keybindingService, editorGroupService) || this;
        }
        OpenPreviousRecentlyUsedEditorInGroupAction.ID = 'workbench.action.openPreviousRecentlyUsedEditorInGroup';
        OpenPreviousRecentlyUsedEditorInGroupAction.LABEL = nls.localize('openPreviousRecentlyUsedEditorInGroup', "Open Previous Recently Used Editor in Group");
        OpenPreviousRecentlyUsedEditorInGroupAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, groupService_1.IEditorGroupService)
        ], OpenPreviousRecentlyUsedEditorInGroupAction);
        return OpenPreviousRecentlyUsedEditorInGroupAction;
    }(BaseQuickOpenEditorInGroupAction));
    exports.OpenPreviousRecentlyUsedEditorInGroupAction = OpenPreviousRecentlyUsedEditorInGroupAction;
    var OpenNextRecentlyUsedEditorInGroupAction = /** @class */ (function (_super) {
        __extends(OpenNextRecentlyUsedEditorInGroupAction, _super);
        function OpenNextRecentlyUsedEditorInGroupAction(id, label, quickOpenService, keybindingService, editorGroupService) {
            return _super.call(this, id, label, quickOpenService, keybindingService, editorGroupService) || this;
        }
        OpenNextRecentlyUsedEditorInGroupAction.ID = 'workbench.action.openNextRecentlyUsedEditorInGroup';
        OpenNextRecentlyUsedEditorInGroupAction.LABEL = nls.localize('openNextRecentlyUsedEditorInGroup', "Open Next Recently Used Editor in Group");
        OpenNextRecentlyUsedEditorInGroupAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService),
            __param(4, groupService_1.IEditorGroupService)
        ], OpenNextRecentlyUsedEditorInGroupAction);
        return OpenNextRecentlyUsedEditorInGroupAction;
    }(BaseQuickOpenEditorInGroupAction));
    exports.OpenNextRecentlyUsedEditorInGroupAction = OpenNextRecentlyUsedEditorInGroupAction;
    var OpenPreviousEditorFromHistoryAction = /** @class */ (function (_super) {
        __extends(OpenPreviousEditorFromHistoryAction, _super);
        function OpenPreviousEditorFromHistoryAction(id, label, quickOpenService, keybindingService) {
            var _this = _super.call(this, id, label) || this;
            _this.quickOpenService = quickOpenService;
            _this.keybindingService = keybindingService;
            return _this;
        }
        OpenPreviousEditorFromHistoryAction.prototype.run = function () {
            var keys = this.keybindingService.lookupKeybindings(this.id);
            this.quickOpenService.show(null, { quickNavigateConfiguration: { keybindings: keys } });
            return winjs_base_1.TPromise.as(true);
        };
        OpenPreviousEditorFromHistoryAction.ID = 'workbench.action.openPreviousEditorFromHistory';
        OpenPreviousEditorFromHistoryAction.LABEL = nls.localize('navigateEditorHistoryByInput', "Open Previous Editor from History");
        OpenPreviousEditorFromHistoryAction = __decorate([
            __param(2, quickOpen_1.IQuickOpenService),
            __param(3, keybinding_1.IKeybindingService)
        ], OpenPreviousEditorFromHistoryAction);
        return OpenPreviousEditorFromHistoryAction;
    }(actions_1.Action));
    exports.OpenPreviousEditorFromHistoryAction = OpenPreviousEditorFromHistoryAction;
    var OpenNextRecentlyUsedEditorAction = /** @class */ (function (_super) {
        __extends(OpenNextRecentlyUsedEditorAction, _super);
        function OpenNextRecentlyUsedEditorAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        OpenNextRecentlyUsedEditorAction.prototype.run = function () {
            this.historyService.forward(true);
            return winjs_base_1.TPromise.as(null);
        };
        OpenNextRecentlyUsedEditorAction.ID = 'workbench.action.openNextRecentlyUsedEditor';
        OpenNextRecentlyUsedEditorAction.LABEL = nls.localize('openNextRecentlyUsedEditor', "Open Next Recently Used Editor");
        OpenNextRecentlyUsedEditorAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], OpenNextRecentlyUsedEditorAction);
        return OpenNextRecentlyUsedEditorAction;
    }(actions_1.Action));
    exports.OpenNextRecentlyUsedEditorAction = OpenNextRecentlyUsedEditorAction;
    var OpenPreviousRecentlyUsedEditorAction = /** @class */ (function (_super) {
        __extends(OpenPreviousRecentlyUsedEditorAction, _super);
        function OpenPreviousRecentlyUsedEditorAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        OpenPreviousRecentlyUsedEditorAction.prototype.run = function () {
            this.historyService.back(true);
            return winjs_base_1.TPromise.as(null);
        };
        OpenPreviousRecentlyUsedEditorAction.ID = 'workbench.action.openPreviousRecentlyUsedEditor';
        OpenPreviousRecentlyUsedEditorAction.LABEL = nls.localize('openPreviousRecentlyUsedEditor', "Open Previous Recently Used Editor");
        OpenPreviousRecentlyUsedEditorAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], OpenPreviousRecentlyUsedEditorAction);
        return OpenPreviousRecentlyUsedEditorAction;
    }(actions_1.Action));
    exports.OpenPreviousRecentlyUsedEditorAction = OpenPreviousRecentlyUsedEditorAction;
    var ClearEditorHistoryAction = /** @class */ (function (_super) {
        __extends(ClearEditorHistoryAction, _super);
        function ClearEditorHistoryAction(id, label, historyService) {
            var _this = _super.call(this, id, label) || this;
            _this.historyService = historyService;
            return _this;
        }
        ClearEditorHistoryAction.prototype.run = function () {
            // Editor history
            this.historyService.clear();
            return winjs_base_1.TPromise.as(true);
        };
        ClearEditorHistoryAction.ID = 'workbench.action.clearEditorHistory';
        ClearEditorHistoryAction.LABEL = nls.localize('clearEditorHistory', "Clear Editor History");
        ClearEditorHistoryAction = __decorate([
            __param(2, history_1.IHistoryService)
        ], ClearEditorHistoryAction);
        return ClearEditorHistoryAction;
    }(actions_1.Action));
    exports.ClearEditorHistoryAction = ClearEditorHistoryAction;
    var FocusLastEditorInStackAction = /** @class */ (function (_super) {
        __extends(FocusLastEditorInStackAction, _super);
        function FocusLastEditorInStackAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        FocusLastEditorInStackAction.prototype.run = function () {
            var active = this.editorService.getActiveEditor();
            if (active) {
                var group = this.editorGroupService.getStacksModel().groupAt(active.position);
                var editor = group.getEditor(group.count - 1);
                if (editor) {
                    return this.editorService.openEditor(editor);
                }
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusLastEditorInStackAction.ID = 'workbench.action.openLastEditorInGroup';
        FocusLastEditorInStackAction.LABEL = nls.localize('focusLastEditorInStack', "Open Last Editor in Group");
        FocusLastEditorInStackAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], FocusLastEditorInStackAction);
        return FocusLastEditorInStackAction;
    }(actions_1.Action));
    exports.FocusLastEditorInStackAction = FocusLastEditorInStackAction;
    var MoveEditorLeftInGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorLeftInGroupAction, _super);
        function MoveEditorLeftInGroupAction(id, label, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.commandService = commandService;
            return _this;
        }
        MoveEditorLeftInGroupAction.prototype.run = function () {
            var args = {
                to: editor_1.ActiveEditorMovePositioning.LEFT
            };
            this.commandService.executeCommand(editor_1.EditorCommands.MoveActiveEditor, args);
            return winjs_base_1.TPromise.as(true);
        };
        MoveEditorLeftInGroupAction.ID = 'workbench.action.moveEditorLeftInGroup';
        MoveEditorLeftInGroupAction.LABEL = nls.localize('moveEditorLeft', "Move Editor Left");
        MoveEditorLeftInGroupAction = __decorate([
            __param(2, commands_1.ICommandService)
        ], MoveEditorLeftInGroupAction);
        return MoveEditorLeftInGroupAction;
    }(actions_1.Action));
    exports.MoveEditorLeftInGroupAction = MoveEditorLeftInGroupAction;
    var MoveEditorRightInGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorRightInGroupAction, _super);
        function MoveEditorRightInGroupAction(id, label, commandService) {
            var _this = _super.call(this, id, label) || this;
            _this.commandService = commandService;
            return _this;
        }
        MoveEditorRightInGroupAction.prototype.run = function () {
            var args = {
                to: editor_1.ActiveEditorMovePositioning.RIGHT
            };
            this.commandService.executeCommand(editor_1.EditorCommands.MoveActiveEditor, args);
            return winjs_base_1.TPromise.as(true);
        };
        MoveEditorRightInGroupAction.ID = 'workbench.action.moveEditorRightInGroup';
        MoveEditorRightInGroupAction.LABEL = nls.localize('moveEditorRight', "Move Editor Right");
        MoveEditorRightInGroupAction = __decorate([
            __param(2, commands_1.ICommandService)
        ], MoveEditorRightInGroupAction);
        return MoveEditorRightInGroupAction;
    }(actions_1.Action));
    exports.MoveEditorRightInGroupAction = MoveEditorRightInGroupAction;
    var MoveEditorToPreviousGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorToPreviousGroupAction, _super);
        function MoveEditorToPreviousGroupAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        MoveEditorToPreviousGroupAction.prototype.run = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && activeEditor.position !== editor_2.Position.ONE) {
                this.editorGroupService.moveEditor(activeEditor.input, activeEditor.position, activeEditor.position - 1);
            }
            return winjs_base_1.TPromise.as(true);
        };
        MoveEditorToPreviousGroupAction.ID = 'workbench.action.moveEditorToPreviousGroup';
        MoveEditorToPreviousGroupAction.LABEL = nls.localize('moveEditorToPreviousGroup', "Move Editor into Previous Group");
        MoveEditorToPreviousGroupAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveEditorToPreviousGroupAction);
        return MoveEditorToPreviousGroupAction;
    }(actions_1.Action));
    exports.MoveEditorToPreviousGroupAction = MoveEditorToPreviousGroupAction;
    var MoveEditorToNextGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorToNextGroupAction, _super);
        function MoveEditorToNextGroupAction(id, label, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        MoveEditorToNextGroupAction.prototype.run = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && activeEditor.position !== editor_2.Position.THREE) {
                this.editorGroupService.moveEditor(activeEditor.input, activeEditor.position, activeEditor.position + 1);
            }
            return winjs_base_1.TPromise.as(true);
        };
        MoveEditorToNextGroupAction.ID = 'workbench.action.moveEditorToNextGroup';
        MoveEditorToNextGroupAction.LABEL = nls.localize('moveEditorToNextGroup', "Move Editor into Next Group");
        MoveEditorToNextGroupAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveEditorToNextGroupAction);
        return MoveEditorToNextGroupAction;
    }(actions_1.Action));
    exports.MoveEditorToNextGroupAction = MoveEditorToNextGroupAction;
    var MoveEditorToSpecificGroup = /** @class */ (function (_super) {
        __extends(MoveEditorToSpecificGroup, _super);
        function MoveEditorToSpecificGroup(id, label, position, editorGroupService, editorService) {
            var _this = _super.call(this, id, label) || this;
            _this.position = position;
            _this.editorGroupService = editorGroupService;
            _this.editorService = editorService;
            return _this;
        }
        MoveEditorToSpecificGroup.prototype.run = function () {
            var activeEditor = this.editorService.getActiveEditor();
            if (activeEditor && activeEditor.position !== this.position) {
                this.editorGroupService.moveEditor(activeEditor.input, activeEditor.position, this.position);
            }
            return winjs_base_1.TPromise.as(true);
        };
        return MoveEditorToSpecificGroup;
    }(actions_1.Action));
    exports.MoveEditorToSpecificGroup = MoveEditorToSpecificGroup;
    var MoveEditorToFirstGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorToFirstGroupAction, _super);
        function MoveEditorToFirstGroupAction(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editor_2.Position.ONE, editorGroupService, editorService) || this;
        }
        MoveEditorToFirstGroupAction.ID = 'workbench.action.moveEditorToFirstGroup';
        MoveEditorToFirstGroupAction.LABEL = nls.localize('moveEditorToFirstGroup', "Move Editor into First Group");
        MoveEditorToFirstGroupAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveEditorToFirstGroupAction);
        return MoveEditorToFirstGroupAction;
    }(MoveEditorToSpecificGroup));
    exports.MoveEditorToFirstGroupAction = MoveEditorToFirstGroupAction;
    var MoveEditorToSecondGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorToSecondGroupAction, _super);
        function MoveEditorToSecondGroupAction(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editor_2.Position.TWO, editorGroupService, editorService) || this;
        }
        MoveEditorToSecondGroupAction.ID = 'workbench.action.moveEditorToSecondGroup';
        MoveEditorToSecondGroupAction.LABEL = nls.localize('moveEditorToSecondGroup', "Move Editor into Second Group");
        MoveEditorToSecondGroupAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveEditorToSecondGroupAction);
        return MoveEditorToSecondGroupAction;
    }(MoveEditorToSpecificGroup));
    exports.MoveEditorToSecondGroupAction = MoveEditorToSecondGroupAction;
    var MoveEditorToThirdGroupAction = /** @class */ (function (_super) {
        __extends(MoveEditorToThirdGroupAction, _super);
        function MoveEditorToThirdGroupAction(id, label, editorGroupService, editorService) {
            return _super.call(this, id, label, editor_2.Position.THREE, editorGroupService, editorService) || this;
        }
        MoveEditorToThirdGroupAction.ID = 'workbench.action.moveEditorToThirdGroup';
        MoveEditorToThirdGroupAction.LABEL = nls.localize('moveEditorToThirdGroup', "Move Editor into Third Group");
        MoveEditorToThirdGroupAction = __decorate([
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], MoveEditorToThirdGroupAction);
        return MoveEditorToThirdGroupAction;
    }(MoveEditorToSpecificGroup));
    exports.MoveEditorToThirdGroupAction = MoveEditorToThirdGroupAction;
});
