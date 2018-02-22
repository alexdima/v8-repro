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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls", "vs/base/common/uri", "vs/workbench/browser/quickopen", "vs/workbench/browser/parts/statusbar/statusbar", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/untitledEditorInput", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/browser/parts/editor/editorStatus", "vs/workbench/common/actions", "vs/workbench/browser/actions", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/base/common/keyCodes", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/quickopen/quickopen", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform", "vs/workbench/browser/parts/editor/editorPicker", "vs/base/common/network"], function (require, exports, platform_1, nls, uri_1, quickopen_1, statusbar_1, editor_1, editor_2, textResourceEditor_1, sideBySideEditor_1, diffEditorInput_1, untitledEditorInput_1, resourceEditorInput_1, instantiation_1, textDiffEditor_1, textfiles_1, binaryDiffEditor_1, editorStatus_1, actions_1, actions_2, actions_3, descriptors_1, keyCodes_1, editorActions_1, editorCommands, editorService_1, quickopen_2, keybindingsRegistry_1, contextkey_1, platform_2, editorPicker_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register String Editor
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(textResourceEditor_1.TextResourceEditor, textResourceEditor_1.TextResourceEditor.ID, nls.localize('textEditor', "Text Editor")), [
        new descriptors_1.SyncDescriptor(untitledEditorInput_1.UntitledEditorInput),
        new descriptors_1.SyncDescriptor(resourceEditorInput_1.ResourceEditorInput)
    ]);
    // Register Text Diff Editor
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(textDiffEditor_1.TextDiffEditor, textDiffEditor_1.TextDiffEditor.ID, nls.localize('textDiffEditor', "Text Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    // Register Binary Resource Diff Editor
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(binaryDiffEditor_1.BinaryResourceDiffEditor, binaryDiffEditor_1.BinaryResourceDiffEditor.ID, nls.localize('binaryDiffEditor', "Binary Diff Editor")), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, nls.localize('sideBySideEditor', "Side by Side Editor")), [
        new descriptors_1.SyncDescriptor(editor_2.SideBySideEditorInput)
    ]);
    // Register Editor Input Factory
    var UntitledEditorInputFactory = /** @class */ (function () {
        function UntitledEditorInputFactory(textFileService) {
            this.textFileService = textFileService;
        }
        UntitledEditorInputFactory.prototype.serialize = function (editorInput) {
            if (!this.textFileService.isHotExitEnabled) {
                return null; // never restore untitled unless hot exit is enabled
            }
            var untitledEditorInput = editorInput;
            var resource = untitledEditorInput.getResource();
            if (untitledEditorInput.hasAssociatedFilePath) {
                resource = uri_1.default.file(resource.fsPath); // untitled with associated file path use the file schema
            }
            var serialized = {
                resource: resource.toString(),
                resourceJSON: resource.toJSON(),
                modeId: untitledEditorInput.getModeId(),
                encoding: untitledEditorInput.getEncoding()
            };
            return JSON.stringify(serialized);
        };
        UntitledEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(function (accessor) {
                var deserialized = JSON.parse(serializedEditorInput);
                var resource = !!deserialized.resourceJSON ? uri_1.default.revive(deserialized.resourceJSON) : uri_1.default.parse(deserialized.resource);
                var filePath = resource.scheme === network_1.Schemas.file ? resource.fsPath : void 0;
                var language = deserialized.modeId;
                var encoding = deserialized.encoding;
                return accessor.get(editorService_1.IWorkbenchEditorService).createInput({ resource: resource, filePath: filePath, language: language, encoding: encoding });
            });
        };
        UntitledEditorInputFactory = __decorate([
            __param(0, textfiles_1.ITextFileService)
        ], UntitledEditorInputFactory);
        return UntitledEditorInputFactory;
    }());
    platform_1.Registry.as(editor_2.Extensions.EditorInputFactories).registerEditorInputFactory(untitledEditorInput_1.UntitledEditorInput.ID, UntitledEditorInputFactory);
    // Register Side by Side Editor Input Factory
    var SideBySideEditorInputFactory = /** @class */ (function () {
        function SideBySideEditorInputFactory() {
        }
        SideBySideEditorInputFactory.prototype.serialize = function (editorInput) {
            var input = editorInput;
            if (input.details && input.master) {
                var registry_1 = platform_1.Registry.as(editor_2.Extensions.EditorInputFactories);
                var detailsInputFactory = registry_1.getEditorInputFactory(input.details.getTypeId());
                var masterInputFactory = registry_1.getEditorInputFactory(input.master.getTypeId());
                if (detailsInputFactory && masterInputFactory) {
                    var detailsSerialized = detailsInputFactory.serialize(input.details);
                    var masterSerialized = masterInputFactory.serialize(input.master);
                    if (detailsSerialized && masterSerialized) {
                        return JSON.stringify({
                            name: input.getName(),
                            description: input.getDescription(),
                            detailsSerialized: detailsSerialized,
                            masterSerialized: masterSerialized,
                            detailsTypeId: input.details.getTypeId(),
                            masterTypeId: input.master.getTypeId()
                        });
                    }
                }
            }
            return null;
        };
        SideBySideEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            var deserialized = JSON.parse(serializedEditorInput);
            var registry = platform_1.Registry.as(editor_2.Extensions.EditorInputFactories);
            var detailsInputFactory = registry.getEditorInputFactory(deserialized.detailsTypeId);
            var masterInputFactory = registry.getEditorInputFactory(deserialized.masterTypeId);
            if (detailsInputFactory && masterInputFactory) {
                var detailsInput = detailsInputFactory.deserialize(instantiationService, deserialized.detailsSerialized);
                var masterInput = masterInputFactory.deserialize(instantiationService, deserialized.masterSerialized);
                if (detailsInput && masterInput) {
                    return new editor_2.SideBySideEditorInput(deserialized.name, deserialized.description, detailsInput, masterInput);
                }
            }
            return null;
        };
        return SideBySideEditorInputFactory;
    }());
    platform_1.Registry.as(editor_2.Extensions.EditorInputFactories).registerEditorInputFactory(editor_2.SideBySideEditorInput.ID, SideBySideEditorInputFactory);
    // Register Editor Status
    var statusBar = platform_1.Registry.as(statusbar_1.Extensions.Statusbar);
    statusBar.registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(editorStatus_1.EditorStatus, statusbar_1.StatusbarAlignment.RIGHT, 100 /* High Priority */));
    // Register Status Actions
    var registry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorStatus_1.ChangeModeAction, editorStatus_1.ChangeModeAction.ID, editorStatus_1.ChangeModeAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 43 /* KEY_M */) }), 'Change Language Mode');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorStatus_1.ChangeEOLAction, editorStatus_1.ChangeEOLAction.ID, editorStatus_1.ChangeEOLAction.LABEL), 'Change End of Line Sequence');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorStatus_1.ChangeEncodingAction, editorStatus_1.ChangeEncodingAction.ID, editorStatus_1.ChangeEncodingAction.LABEL), 'Change File Encoding');
    var QuickOpenActionContributor = /** @class */ (function (_super) {
        __extends(QuickOpenActionContributor, _super);
        function QuickOpenActionContributor(instantiationService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            return _this;
        }
        QuickOpenActionContributor.prototype.hasActions = function (context) {
            var entry = this.getEntry(context);
            return !!entry;
        };
        QuickOpenActionContributor.prototype.getActions = function (context) {
            var actions = [];
            var entry = this.getEntry(context);
            if (entry) {
                if (!this.openToSideActionInstance) {
                    this.openToSideActionInstance = this.instantiationService.createInstance(editorActions_1.OpenToSideAction);
                }
                else {
                    this.openToSideActionInstance.updateClass();
                }
                actions.push(this.openToSideActionInstance);
            }
            return actions;
        };
        QuickOpenActionContributor.prototype.getEntry = function (context) {
            if (!context || !context.element) {
                return null;
            }
            return editorActions_1.toEditorQuickOpenEntry(context.element);
        };
        QuickOpenActionContributor = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], QuickOpenActionContributor);
        return QuickOpenActionContributor;
    }(actions_2.ActionBarContributor));
    exports.QuickOpenActionContributor = QuickOpenActionContributor;
    var actionBarRegistry = platform_1.Registry.as(actions_2.Extensions.Actionbar);
    actionBarRegistry.registerActionBarContributor(actions_2.Scope.VIEWER, QuickOpenActionContributor);
    var editorPickerContextKey = 'inEditorsPicker';
    var editorPickerContext = contextkey_1.ContextKeyExpr.and(quickopen_2.inQuickOpenContext, contextkey_1.ContextKeyExpr.has(editorPickerContextKey));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(editorPicker_1.GroupOnePicker, editorPicker_1.GroupOnePicker.ID, editorCommands.NAVIGATE_IN_GROUP_ONE_PREFIX, editorPickerContextKey, [
        {
            prefix: editorCommands.NAVIGATE_IN_GROUP_ONE_PREFIX,
            needsEditor: false,
            description: nls.localize('groupOnePicker', "Show Editors in First Group")
        },
        {
            prefix: editorCommands.NAVIGATE_IN_GROUP_TWO_PREFIX,
            needsEditor: false,
            description: nls.localize('groupTwoPicker', "Show Editors in Second Group")
        },
        {
            prefix: editorCommands.NAVIGATE_IN_GROUP_THREE_PREFIX,
            needsEditor: false,
            description: nls.localize('groupThreePicker', "Show Editors in Third Group")
        }
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(editorPicker_1.GroupTwoPicker, editorPicker_1.GroupTwoPicker.ID, editorCommands.NAVIGATE_IN_GROUP_TWO_PREFIX, editorPickerContextKey, []));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(editorPicker_1.GroupThreePicker, editorPicker_1.GroupThreePicker.ID, editorCommands.NAVIGATE_IN_GROUP_THREE_PREFIX, editorPickerContextKey, []));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(editorPicker_1.AllEditorsPicker, editorPicker_1.AllEditorsPicker.ID, editorCommands.NAVIGATE_ALL_EDITORS_GROUP_PREFIX, editorPickerContextKey, [
        {
            prefix: editorCommands.NAVIGATE_ALL_EDITORS_GROUP_PREFIX,
            needsEditor: false,
            description: nls.localize('allEditorsPicker', "Show All Opened Editors")
        }
    ]));
    // Register Editor Actions
    var category = nls.localize('view', "View");
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenNextEditorInGroup, editorActions_1.OpenNextEditorInGroup.ID, editorActions_1.OpenNextEditorInGroup.LABEL), 'View: Open Next Editor in Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenPreviousEditorInGroup, editorActions_1.OpenPreviousEditorInGroup.ID, editorActions_1.OpenPreviousEditorInGroup.LABEL), 'View: Open Previous Editor in Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenLastEditorInGroup, editorActions_1.OpenLastEditorInGroup.ID, editorActions_1.OpenLastEditorInGroup.LABEL, { primary: 2048 /* CtrlCmd */ | 30 /* KEY_9 */ }), 'View: Open Last Editor in Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenNextRecentlyUsedEditorAction, editorActions_1.OpenNextRecentlyUsedEditorAction.ID, editorActions_1.OpenNextRecentlyUsedEditorAction.LABEL), 'View: Open Next Recently Used Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenPreviousRecentlyUsedEditorAction, editorActions_1.OpenPreviousRecentlyUsedEditorAction.ID, editorActions_1.OpenPreviousRecentlyUsedEditorAction.LABEL), 'View: Open Previous Recently Used Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ShowAllEditorsAction, editorActions_1.ShowAllEditorsAction.ID, editorActions_1.ShowAllEditorsAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 46 /* KEY_P */), mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 2 /* Tab */ } }), 'View: Show All Editors', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ShowEditorsInGroupOneAction, editorActions_1.ShowEditorsInGroupOneAction.ID, editorActions_1.ShowEditorsInGroupOneAction.LABEL), 'View: Show Editors in First Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ShowEditorsInGroupTwoAction, editorActions_1.ShowEditorsInGroupTwoAction.ID, editorActions_1.ShowEditorsInGroupTwoAction.LABEL), 'View: Show Editors in Second Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ShowEditorsInGroupThreeAction, editorActions_1.ShowEditorsInGroupThreeAction.ID, editorActions_1.ShowEditorsInGroupThreeAction.LABEL), 'View: Show Editors in Third Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenNextEditor, editorActions_1.OpenNextEditor.ID, editorActions_1.OpenNextEditor.LABEL, { primary: 2048 /* CtrlCmd */ | 12 /* PageDown */, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */] } }), 'View: Open Next Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenPreviousEditor, editorActions_1.OpenPreviousEditor.ID, editorActions_1.OpenPreviousEditor.LABEL, { primary: 2048 /* CtrlCmd */ | 11 /* PageUp */, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 87 /* US_OPEN_SQUARE_BRACKET */] } }), 'View: Open Previous Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ReopenClosedEditorAction, editorActions_1.ReopenClosedEditorAction.ID, editorActions_1.ReopenClosedEditorAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KEY_T */ }), 'View: Reopen Closed Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ClearRecentFilesAction, editorActions_1.ClearRecentFilesAction.ID, editorActions_1.ClearRecentFilesAction.LABEL), 'File: Clear Recently Opened', nls.localize('file', "File"));
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.CloseAllEditorsAction, editorActions_1.CloseAllEditorsAction.ID, editorActions_1.CloseAllEditorsAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 53 /* KEY_W */) }), 'View: Close All Editors', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.CloseLeftEditorsInGroupAction, editorActions_1.CloseLeftEditorsInGroupAction.ID, editorActions_1.CloseLeftEditorsInGroupAction.LABEL), 'View: Close Editors to the Left', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.CloseEditorsInOtherGroupsAction, editorActions_1.CloseEditorsInOtherGroupsAction.ID, editorActions_1.CloseEditorsInOtherGroupsAction.LABEL), 'View: Close Editors in Other Groups', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.SplitEditorAction, editorActions_1.SplitEditorAction.ID, editorActions_1.SplitEditorAction.LABEL, { primary: 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */ }), 'View: Split Editor', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.JoinTwoGroupsAction, editorActions_1.JoinTwoGroupsAction.ID, editorActions_1.JoinTwoGroupsAction.LABEL), 'View: Join Editors of Two Groups', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.NavigateBetweenGroupsAction, editorActions_1.NavigateBetweenGroupsAction.ID, editorActions_1.NavigateBetweenGroupsAction.LABEL), 'View: Navigate Between Editor Groups', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusActiveGroupAction, editorActions_1.FocusActiveGroupAction.ID, editorActions_1.FocusActiveGroupAction.LABEL), 'View: Focus Active Editor Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusFirstGroupAction, editorActions_1.FocusFirstGroupAction.ID, editorActions_1.FocusFirstGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 22 /* KEY_1 */ }), 'View: Focus First Editor Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusSecondGroupAction, editorActions_1.FocusSecondGroupAction.ID, editorActions_1.FocusSecondGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 23 /* KEY_2 */ }), 'View: Focus Second Editor Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusThirdGroupAction, editorActions_1.FocusThirdGroupAction.ID, editorActions_1.FocusThirdGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 24 /* KEY_3 */ }), 'View: Focus Third Editor Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusLastEditorInStackAction, editorActions_1.FocusLastEditorInStackAction.ID, editorActions_1.FocusLastEditorInStackAction.LABEL, { primary: 512 /* Alt */ | 21 /* KEY_0 */, mac: { primary: 256 /* WinCtrl */ | 21 /* KEY_0 */ } }), 'View: Open Last Editor in Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.EvenGroupWidthsAction, editorActions_1.EvenGroupWidthsAction.ID, editorActions_1.EvenGroupWidthsAction.LABEL), 'View: Even Editor Group Widths', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MaximizeGroupAction, editorActions_1.MaximizeGroupAction.ID, editorActions_1.MaximizeGroupAction.LABEL), 'View: Maximize Editor Group and Hide Sidebar', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MinimizeOtherGroupsAction, editorActions_1.MinimizeOtherGroupsAction.ID, editorActions_1.MinimizeOtherGroupsAction.LABEL), 'View: Minimize Other Editor Groups', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorLeftInGroupAction, editorActions_1.MoveEditorLeftInGroupAction.ID, editorActions_1.MoveEditorLeftInGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 11 /* PageUp */, mac: { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */) } }), 'View: Move Editor Left', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorRightInGroupAction, editorActions_1.MoveEditorRightInGroupAction.ID, editorActions_1.MoveEditorRightInGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 12 /* PageDown */, mac: { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */) } }), 'View: Move Editor Right', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveGroupLeftAction, editorActions_1.MoveGroupLeftAction.ID, editorActions_1.MoveGroupLeftAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 15 /* LeftArrow */) }), 'View: Move Editor Group Left', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveGroupRightAction, editorActions_1.MoveGroupRightAction.ID, editorActions_1.MoveGroupRightAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 17 /* RightArrow */) }), 'View: Move Editor Group Right', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorToPreviousGroupAction, editorActions_1.MoveEditorToPreviousGroupAction.ID, editorActions_1.MoveEditorToPreviousGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 15 /* LeftArrow */ } }), 'View: Move Editor into Previous Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorToNextGroupAction, editorActions_1.MoveEditorToNextGroupAction.ID, editorActions_1.MoveEditorToNextGroupAction.LABEL, { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 17 /* RightArrow */ } }), 'View: Move Editor into Next Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorToFirstGroupAction, editorActions_1.MoveEditorToFirstGroupAction.ID, editorActions_1.MoveEditorToFirstGroupAction.LABEL, { primary: 1024 /* Shift */ | 512 /* Alt */ | 22 /* KEY_1 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 22 /* KEY_1 */ } }), 'View: Move Editor into First Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorToSecondGroupAction, editorActions_1.MoveEditorToSecondGroupAction.ID, editorActions_1.MoveEditorToSecondGroupAction.LABEL, { primary: 1024 /* Shift */ | 512 /* Alt */ | 23 /* KEY_2 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 23 /* KEY_2 */ } }), 'View: Move Editor into Second Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.MoveEditorToThirdGroupAction, editorActions_1.MoveEditorToThirdGroupAction.ID, editorActions_1.MoveEditorToThirdGroupAction.LABEL, { primary: 1024 /* Shift */ | 512 /* Alt */ | 24 /* KEY_3 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 24 /* KEY_3 */ } }), 'View: Move Editor into Third Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusPreviousGroup, editorActions_1.FocusPreviousGroup.ID, editorActions_1.FocusPreviousGroup.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 15 /* LeftArrow */) }), 'View: Focus Previous Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.FocusNextGroup, editorActions_1.FocusNextGroup.ID, editorActions_1.FocusNextGroup.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 17 /* RightArrow */) }), 'View: Focus Next Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.NavigateForwardAction, editorActions_1.NavigateForwardAction.ID, editorActions_1.NavigateForwardAction.LABEL, { primary: null, win: { primary: 512 /* Alt */ | 17 /* RightArrow */ }, mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 83 /* US_MINUS */ }, linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 83 /* US_MINUS */ } }), 'Go Forward');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.NavigateBackwardsAction, editorActions_1.NavigateBackwardsAction.ID, editorActions_1.NavigateBackwardsAction.LABEL, { primary: null, win: { primary: 512 /* Alt */ | 15 /* LeftArrow */ }, mac: { primary: 256 /* WinCtrl */ | 83 /* US_MINUS */ }, linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 83 /* US_MINUS */ } }), 'Go Back');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.NavigateLastAction, editorActions_1.NavigateLastAction.ID, editorActions_1.NavigateLastAction.LABEL), 'Go Last');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenPreviousEditorFromHistoryAction, editorActions_1.OpenPreviousEditorFromHistoryAction.ID, editorActions_1.OpenPreviousEditorFromHistoryAction.LABEL), 'Open Previous Editor from History');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.ClearEditorHistoryAction, editorActions_1.ClearEditorHistoryAction.ID, editorActions_1.ClearEditorHistoryAction.LABEL), 'Clear Editor History');
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.RevertAndCloseEditorAction, editorActions_1.RevertAndCloseEditorAction.ID, editorActions_1.RevertAndCloseEditorAction.LABEL), 'View: Revert and Close Editor', category);
    // Register Editor Picker Actions including quick navigate support
    var openNextEditorKeybinding = { primary: 2048 /* CtrlCmd */ | 2 /* Tab */, mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ } };
    var openPreviousEditorKeybinding = { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */, mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ } };
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenNextRecentlyUsedEditorInGroupAction, editorActions_1.OpenNextRecentlyUsedEditorInGroupAction.ID, editorActions_1.OpenNextRecentlyUsedEditorInGroupAction.LABEL, openNextEditorKeybinding), 'View: Open Next Recently Used Editor in Group', category);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction, editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction.ID, editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction.LABEL, openPreviousEditorKeybinding), 'View: Open Previous Recently Used Editor in Group', category);
    var quickOpenNavigateNextInEditorPickerId = 'workbench.action.quickOpenNavigateNextInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigateNextInEditorPickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_2.getQuickNavigateHandler(quickOpenNavigateNextInEditorPickerId, true),
        when: editorPickerContext,
        primary: openNextEditorKeybinding.primary,
        mac: openNextEditorKeybinding.mac
    });
    var quickOpenNavigatePreviousInEditorPickerId = 'workbench.action.quickOpenNavigatePreviousInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigatePreviousInEditorPickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_2.getQuickNavigateHandler(quickOpenNavigatePreviousInEditorPickerId, false),
        when: editorPickerContext,
        primary: openPreviousEditorKeybinding.primary,
        mac: openPreviousEditorKeybinding.mac
    });
    // Editor Commands
    editorCommands.setup();
    // Touch Bar
    if (platform_2.isMacintosh) {
        actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateBackwardsAction.ID, title: editorActions_1.NavigateBackwardsAction.LABEL, iconPath: { dark: uri_1.default.parse(require.toUrl('vs/workbench/browser/parts/editor/media/back-tb.png')).fsPath } },
            group: 'navigation'
        });
        actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateForwardAction.ID, title: editorActions_1.NavigateForwardAction.LABEL, iconPath: { dark: uri_1.default.parse(require.toUrl('vs/workbench/browser/parts/editor/media/forward-tb.png')).fsPath } },
            group: 'navigation'
        });
    }
    // Editor Title Context Menu
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.CLOSE_EDITOR_COMMAND_ID, title: nls.localize('close', "Close") }, group: '1_close', order: 10 });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: nls.localize('closeOthers', "Close Others") }, group: '1_close', order: 20 });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: nls.localize('closeRight', "Close to the Right") }, group: '1_close', order: 30, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID, title: nls.localize('closeAllUnmodified', "Close Unmodified") }, group: '1_close', order: 40 });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: nls.localize('closeAll', "Close All") }, group: '1_close', order: 50 });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitleContext, { command: { id: editorCommands.KEEP_EDITOR_COMMAND_ID, title: nls.localize('keepOpen', "Keep Open") }, group: '3_preview', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    // Editor Title Menu
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitle, { command: { id: editorCommands.TOGGLE_DIFF_INLINE_MODE, title: nls.localize('toggleInlineView', "Toggle Inline View") }, group: '1_diff', order: 10, when: contextkey_1.ContextKeyExpr.has('isInDiffEditor') });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitle, { command: { id: editorCommands.SHOW_EDITORS_IN_GROUP, title: nls.localize('showOpenedEditors', "Show Opened Editors") }, group: '3_open', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitle, { command: { id: editorCommands.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: nls.localize('closeAll', "Close All") }, group: '5_close', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.EditorTitle, { command: { id: editorCommands.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID, title: nls.localize('closeAllUnmodified', "Close Unmodified") }, group: '5_close', order: 20, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') });
    // Editor Commands for Command Palette
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.CommandPalette, { command: { id: editorCommands.KEEP_EDITOR_COMMAND_ID, title: nls.localize('keepEditor', "Keep Editor"), category: category }, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.CommandPalette, { command: { id: editorCommands.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: nls.localize('closeEditorsInGroup', "Close All Editors in Group"), category: category } });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.CommandPalette, { command: { id: editorCommands.CLOSE_UNMODIFIED_EDITORS_COMMAND_ID, title: nls.localize('closeUnmodifiedEditors', "Close Unmodified Editors in Group"), category: category } });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.CommandPalette, { command: { id: editorCommands.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: nls.localize('closeOtherEditors', "Close Other Editors"), category: category } });
    actions_3.MenuRegistry.appendMenuItem(actions_3.MenuId.CommandPalette, { command: { id: editorCommands.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: nls.localize('closeRightEditors', "Close Editors to the Right"), category: category } });
});
