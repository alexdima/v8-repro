/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/workbench/browser/quickopen", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/parts/quickopen/browser/gotoSymbolHandler", "vs/workbench/parts/quickopen/browser/commandsHandler", "vs/workbench/parts/quickopen/browser/gotoLineHandler", "vs/workbench/parts/quickopen/browser/helpHandler", "vs/workbench/parts/quickopen/browser/viewPickerHandler", "vs/workbench/browser/parts/quickopen/quickopen", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, env, nls, quickopen_1, platform_1, actions_1, actions_2, gotoSymbolHandler_1, commandsHandler_1, gotoLineHandler_1, helpHandler_1, viewPickerHandler_1, quickopen_2, contextkey_1, keybindingsRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Actions
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(commandsHandler_1.ClearCommandHistoryAction, commandsHandler_1.ClearCommandHistoryAction.ID, commandsHandler_1.ClearCommandHistoryAction.LABEL), 'Clear Command History');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(commandsHandler_1.ShowAllCommandsAction, commandsHandler_1.ShowAllCommandsAction.ID, commandsHandler_1.ShowAllCommandsAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 46 /* KEY_P */,
        secondary: [59 /* F1 */]
    }), 'Show All Commands');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(gotoLineHandler_1.GotoLineAction, gotoLineHandler_1.GotoLineAction.ID, gotoLineHandler_1.GotoLineAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 37 /* KEY_G */,
        mac: { primary: 256 /* WinCtrl */ | 37 /* KEY_G */ }
    }), 'Go to Line...');
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(gotoSymbolHandler_1.GotoSymbolAction, gotoSymbolHandler_1.GotoSymbolAction.ID, gotoSymbolHandler_1.GotoSymbolAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KEY_O */
    }), 'Go to Symbol in File...');
    var inViewsPickerContextKey = 'inViewsPicker';
    var inViewsPickerContext = contextkey_1.ContextKeyExpr.and(quickopen_2.inQuickOpenContext, contextkey_1.ContextKeyExpr.has(inViewsPickerContextKey));
    var viewPickerKeybinding = { primary: 2048 /* CtrlCmd */ | 47 /* KEY_Q */, mac: { primary: 256 /* WinCtrl */ | 47 /* KEY_Q */ }, linux: { primary: null } };
    var viewCategory = nls.localize('view', "View");
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(viewPickerHandler_1.OpenViewPickerAction, viewPickerHandler_1.OpenViewPickerAction.ID, viewPickerHandler_1.OpenViewPickerAction.LABEL), 'View: Open View', viewCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(viewPickerHandler_1.QuickOpenViewPickerAction, viewPickerHandler_1.QuickOpenViewPickerAction.ID, viewPickerHandler_1.QuickOpenViewPickerAction.LABEL, viewPickerKeybinding), 'View: Quick Open View', viewCategory);
    var quickOpenNavigateNextInViewPickerId = 'workbench.action.quickOpenNavigateNextInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigateNextInViewPickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_2.getQuickNavigateHandler(quickOpenNavigateNextInViewPickerId, true),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary,
        linux: viewPickerKeybinding.linux,
        mac: viewPickerKeybinding.mac
    });
    var quickOpenNavigatePreviousInViewPickerId = 'workbench.action.quickOpenNavigatePreviousInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickOpenNavigatePreviousInViewPickerId,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(50),
        handler: quickopen_2.getQuickNavigateHandler(quickOpenNavigatePreviousInViewPickerId, false),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary | 1024 /* Shift */,
        linux: viewPickerKeybinding.linux,
        mac: {
            primary: viewPickerKeybinding.mac.primary | 1024 /* Shift */
        }
    });
    // Register Quick Open Handler
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(commandsHandler_1.CommandsHandler, commandsHandler_1.CommandsHandler.ID, commandsHandler_1.ALL_COMMANDS_PREFIX, 'inCommandsPicker', nls.localize('commandsHandlerDescriptionDefault', "Show and Run Commands")));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(gotoLineHandler_1.GotoLineHandler, gotoLineHandler_1.GotoLineHandler.ID, gotoLineHandler_1.GOTO_LINE_PREFIX, null, [
        {
            prefix: gotoLineHandler_1.GOTO_LINE_PREFIX,
            needsEditor: true,
            description: env.isMacintosh ? nls.localize('gotoLineDescriptionMac', "Go to Line") : nls.localize('gotoLineDescriptionWin', "Go to Line")
        },
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(gotoSymbolHandler_1.GotoSymbolHandler, gotoSymbolHandler_1.GotoSymbolHandler.ID, gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX, 'inFileSymbolsPicker', [
        {
            prefix: gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX,
            needsEditor: true,
            description: nls.localize('gotoSymbolDescription', "Go to Symbol in File")
        },
        {
            prefix: gotoSymbolHandler_1.GOTO_SYMBOL_PREFIX + gotoSymbolHandler_1.SCOPE_PREFIX,
            needsEditor: true,
            description: nls.localize('gotoSymbolDescriptionScoped', "Go to Symbol in File by Category")
        }
    ]));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(helpHandler_1.HelpHandler, helpHandler_1.HelpHandler.ID, helpHandler_1.HELP_PREFIX, null, nls.localize('helpDescription', "Show Help")));
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(viewPickerHandler_1.ViewPickerHandler, viewPickerHandler_1.ViewPickerHandler.ID, viewPickerHandler_1.VIEW_PICKER_PREFIX, inViewsPickerContextKey, [
        {
            prefix: viewPickerHandler_1.VIEW_PICKER_PREFIX,
            needsEditor: false,
            description: nls.localize('viewPickerDescription', "Open View")
        }
    ]));
});
