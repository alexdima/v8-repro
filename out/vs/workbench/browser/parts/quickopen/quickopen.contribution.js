define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/quickOpen/common/quickOpen", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/browser/parts/quickopen/quickOpenController", "vs/workbench/browser/parts/quickopen/quickopen"], function (require, exports, platform_1, quickOpen_1, actions_1, actions_2, keybindingsRegistry_1, quickOpenController_1, quickopen_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.closeQuickOpen',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: quickopen_1.inQuickOpenContext,
        primary: 9 /* Escape */, secondary: [1024 /* Shift */ | 9 /* Escape */],
        handler: function (accessor) {
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            quickOpenService.close();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.acceptSelectedQuickOpenItem',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: quickopen_1.inQuickOpenContext,
        primary: null,
        handler: function (accessor) {
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            quickOpenService.accept();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.focusQuickOpen',
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: quickopen_1.inQuickOpenContext,
        primary: null,
        handler: function (accessor) {
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            quickOpenService.focus();
        }
    });
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    var globalQuickOpenKeybinding = { primary: 2048 /* CtrlCmd */ | 46 /* KEY_P */, secondary: [2048 /* CtrlCmd */ | 35 /* KEY_E */], mac: { primary: 2048 /* CtrlCmd */ | 46 /* KEY_P */, secondary: null } };
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: quickopen_1.QUICKOPEN_ACTION_ID,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: undefined,
        primary: globalQuickOpenKeybinding.primary,
        secondary: globalQuickOpenKeybinding.secondary,
        mac: globalQuickOpenKeybinding.mac
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: { id: quickopen_1.QUICKOPEN_ACTION_ID, title: quickopen_1.QUICKOPEN_ACION_LABEL }
    });
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(quickopen_1.QuickOpenSelectNextAction, quickopen_1.QuickOpenSelectNextAction.ID, quickopen_1.QuickOpenSelectNextAction.LABEL, { primary: null, mac: { primary: 256 /* WinCtrl */ | 44 /* KEY_N */ } }, quickopen_1.inQuickOpenContext, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50)), 'Select Next in Quick Open');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(quickopen_1.QuickOpenSelectPreviousAction, quickopen_1.QuickOpenSelectPreviousAction.ID, quickopen_1.QuickOpenSelectPreviousAction.LABEL, { primary: null, mac: { primary: 256 /* WinCtrl */ | 46 /* KEY_P */ } }, quickopen_1.inQuickOpenContext, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50)), 'Select Previous in Quick Open');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(quickopen_1.QuickOpenNavigateNextAction, quickopen_1.QuickOpenNavigateNextAction.ID, quickopen_1.QuickOpenNavigateNextAction.LABEL), 'Navigate Next in Quick Open');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(quickopen_1.QuickOpenNavigatePreviousAction, quickopen_1.QuickOpenNavigatePreviousAction.ID, quickopen_1.QuickOpenNavigatePreviousAction.LABEL), 'Navigate Previous in Quick Open');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(quickOpenController_1.RemoveFromEditorHistoryAction, quickOpenController_1.RemoveFromEditorHistoryAction.ID, quickOpenController_1.RemoveFromEditorHistoryAction.LABEL), 'Remove From History');
    var quickOpenNavigateNextInFilePickerId = 'workbench.action.quickOpenNavigateNextInFilePicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigateNextInFilePickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigateNextInFilePickerId, true),
        when: quickopen_1.defaultQuickOpenContext,
        primary: globalQuickOpenKeybinding.primary,
        secondary: globalQuickOpenKeybinding.secondary,
        mac: globalQuickOpenKeybinding.mac
    });
    var quickOpenNavigatePreviousInFilePickerId = 'workbench.action.quickOpenNavigatePreviousInFilePicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigatePreviousInFilePickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_1.getQuickNavigateHandler(quickOpenNavigatePreviousInFilePickerId, false),
        when: quickopen_1.defaultQuickOpenContext,
        primary: globalQuickOpenKeybinding.primary | 1024 /* Shift */,
        secondary: [globalQuickOpenKeybinding.secondary[0] | 1024 /* Shift */],
        mac: {
            primary: globalQuickOpenKeybinding.mac.primary | 1024 /* Shift */,
            secondary: null
        }
    });
});
