/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/extensions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/actions", "vs/workbench/browser/viewlet", "vs/workbench/browser/panel", "vs/workbench/browser/parts/statusbar/statusbar", "vs/workbench/parts/debug/electron-browser/variablesView", "vs/workbench/parts/debug/browser/breakpointsView", "vs/workbench/parts/debug/electron-browser/watchExpressionsView", "vs/workbench/parts/debug/electron-browser/callStackView", "vs/workbench/common/contributions", "vs/workbench/parts/debug/common/debug", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "vs/workbench/parts/debug/browser/debugEditorModelManager", "vs/workbench/parts/debug/browser/debugActions", "vs/workbench/parts/debug/browser/debugActionsWidget", "vs/workbench/parts/debug/electron-browser/debugService", "vs/workbench/parts/debug/browser/debugContentProvider", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/editor/common/editorService", "vs/workbench/parts/debug/browser/debugCommands", "vs/workbench/browser/quickopen", "vs/workbench/parts/debug/browser/statusbarColorProvider", "vs/workbench/common/views", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/parts/debug/browser/debugViewlet", "vs/workbench/parts/debug/electron-browser/repl", "vs/workbench/parts/debug/browser/debugQuickOpen", "vs/workbench/parts/debug/browser/debugStatus", "vs/platform/lifecycle/common/lifecycle", "vs/css!../browser/media/debug.contribution", "vs/css!../browser/media/debugHover", "vs/workbench/parts/debug/electron-browser/debugEditorContribution"], function (require, exports, nls, actions_1, platform_1, extensions_1, keybindingsRegistry_1, configurationRegistry_1, actions_2, viewlet_1, panel_1, statusbar_1, variablesView_1, breakpointsView_1, watchExpressionsView_1, callStackView_1, contributions_1, debug_1, partService_1, panelService_1, debugEditorModelManager_1, debugActions_1, debugActionsWidget_1, service, debugContentProvider_1, viewlet_2, editorService_1, debugCommands_1, quickopen_1, statusbarColorProvider_1, views_1, platform_2, contextkey_1, uri_1, debugViewlet_1, repl_1, debugQuickOpen_1, debugStatus_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenDebugViewletAction = /** @class */ (function (_super) {
        __extends(OpenDebugViewletAction, _super);
        function OpenDebugViewletAction(id, label, viewletService, editorService) {
            return _super.call(this, id, label, debug_1.VIEWLET_ID, viewletService, editorService) || this;
        }
        OpenDebugViewletAction.ID = debug_1.VIEWLET_ID;
        OpenDebugViewletAction.LABEL = nls.localize('toggleDebugViewlet', "Show Debug");
        OpenDebugViewletAction = __decorate([
            __param(2, viewlet_2.IViewletService),
            __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenDebugViewletAction);
        return OpenDebugViewletAction;
    }(viewlet_1.ToggleViewletAction));
    var OpenDebugPanelAction = /** @class */ (function (_super) {
        __extends(OpenDebugPanelAction, _super);
        function OpenDebugPanelAction(id, label, panelService, partService) {
            return _super.call(this, id, label, debug_1.REPL_ID, panelService, partService) || this;
        }
        OpenDebugPanelAction.ID = 'workbench.debug.action.toggleRepl';
        OpenDebugPanelAction.LABEL = nls.localize('toggleDebugPanel', "Debug Console");
        OpenDebugPanelAction = __decorate([
            __param(2, panelService_1.IPanelService),
            __param(3, partService_1.IPartService)
        ], OpenDebugPanelAction);
        return OpenDebugPanelAction;
    }(panel_1.TogglePanelAction));
    // register viewlet
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(new viewlet_1.ViewletDescriptor(debugViewlet_1.DebugViewlet, debug_1.VIEWLET_ID, nls.localize('debug', "Debug"), 'debug', 40));
    var openViewletKb = {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 34 /* KEY_D */
    };
    var openPanelKb = {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 55 /* KEY_Y */
    };
    // register repl panel
    platform_1.Registry.as(panel_1.Extensions.Panels).registerPanel(new panel_1.PanelDescriptor(repl_1.Repl, debug_1.REPL_ID, nls.localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'debugPanel' }, 'Debug Console'), 'repl', 30, OpenDebugPanelAction.ID));
    platform_1.Registry.as(panel_1.Extensions.Panels).setDefaultPanelId(debug_1.REPL_ID);
    // Register default debug views
    views_1.ViewsRegistry.registerViews([{ id: debug_1.VARIABLES_VIEW_ID, name: nls.localize('variables', "Variables"), ctor: variablesView_1.VariablesView, order: 10, weight: 40, location: views_1.ViewLocation.Debug, canToggleVisibility: true }]);
    views_1.ViewsRegistry.registerViews([{ id: debug_1.WATCH_VIEW_ID, name: nls.localize('watch', "Watch"), ctor: watchExpressionsView_1.WatchExpressionsView, order: 20, weight: 10, location: views_1.ViewLocation.Debug, canToggleVisibility: true }]);
    views_1.ViewsRegistry.registerViews([{ id: debug_1.CALLSTACK_VIEW_ID, name: nls.localize('callStack', "Call Stack"), ctor: callStackView_1.CallStackView, order: 30, weight: 30, location: views_1.ViewLocation.Debug, canToggleVisibility: true }]);
    views_1.ViewsRegistry.registerViews([{ id: debug_1.BREAKPOINTS_VIEW_ID, name: nls.localize('breakpoints', "Breakpoints"), ctor: breakpointsView_1.BreakpointsView, order: 40, weight: 20, location: views_1.ViewLocation.Debug, canToggleVisibility: true }]);
    // register action to open viewlet
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenDebugPanelAction, OpenDebugPanelAction.ID, OpenDebugPanelAction.LABEL, openPanelKb), 'View: Debug Console', nls.localize('view', "View"));
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(OpenDebugViewletAction, OpenDebugViewletAction.ID, OpenDebugViewletAction.LABEL, openViewletKb), 'View: Show Debug', nls.localize('view', "View"));
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugEditorModelManager_1.DebugEditorModelManager, lifecycle_1.LifecyclePhase.Running);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugActionsWidget_1.DebugActionsWidget, lifecycle_1.LifecyclePhase.Running);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugContentProvider_1.DebugContentProvider, lifecycle_1.LifecyclePhase.Eventually);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(statusbarColorProvider_1.StatusBarColorProvider, lifecycle_1.LifecyclePhase.Eventually);
    var debugCategory = nls.localize('debugCategory', "Debug");
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.StartAction, debugActions_1.StartAction.ID, debugActions_1.StartAction.LABEL, { primary: 63 /* F5 */ }, debug_1.CONTEXT_NOT_IN_DEBUG_MODE), 'Debug: Start Debugging', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.StepOverAction, debugActions_1.StepOverAction.ID, debugActions_1.StepOverAction.LABEL, { primary: 68 /* F10 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Step Over', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.StepIntoAction, debugActions_1.StepIntoAction.ID, debugActions_1.StepIntoAction.LABEL, { primary: 69 /* F11 */ }, debug_1.CONTEXT_IN_DEBUG_MODE, keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(1)), 'Debug: Step Into', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.StepOutAction, debugActions_1.StepOutAction.ID, debugActions_1.StepOutAction.LABEL, { primary: 1024 /* Shift */ | 69 /* F11 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Step Out', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.RestartAction, debugActions_1.RestartAction.ID, debugActions_1.RestartAction.LABEL, { primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 63 /* F5 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Restart', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.StopAction, debugActions_1.StopAction.ID, debugActions_1.StopAction.LABEL, { primary: 1024 /* Shift */ | 63 /* F5 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Stop', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.DisconnectAction, debugActions_1.DisconnectAction.ID, debugActions_1.DisconnectAction.LABEL), 'Debug: Disconnect', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.ContinueAction, debugActions_1.ContinueAction.ID, debugActions_1.ContinueAction.LABEL, { primary: 63 /* F5 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Continue', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.PauseAction, debugActions_1.PauseAction.ID, debugActions_1.PauseAction.LABEL, { primary: 64 /* F6 */ }, debug_1.CONTEXT_IN_DEBUG_MODE), 'Debug: Pause', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.ConfigureAction, debugActions_1.ConfigureAction.ID, debugActions_1.ConfigureAction.LABEL), 'Debug: Open launch.json', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.AddFunctionBreakpointAction, debugActions_1.AddFunctionBreakpointAction.ID, debugActions_1.AddFunctionBreakpointAction.LABEL), 'Debug: Add Function Breakpoint', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.ReapplyBreakpointsAction, debugActions_1.ReapplyBreakpointsAction.ID, debugActions_1.ReapplyBreakpointsAction.LABEL), 'Debug: Reapply All Breakpoints', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.RunAction, debugActions_1.RunAction.ID, debugActions_1.RunAction.LABEL, { primary: 2048 /* CtrlCmd */ | 63 /* F5 */, mac: { primary: 256 /* WinCtrl */ | 63 /* F5 */ } }, debug_1.CONTEXT_NOT_IN_DEBUG_MODE), 'Debug: Start Without Debugging', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.RemoveAllBreakpointsAction, debugActions_1.RemoveAllBreakpointsAction.ID, debugActions_1.RemoveAllBreakpointsAction.LABEL), 'Debug: Remove All Breakpoints', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.EnableAllBreakpointsAction, debugActions_1.EnableAllBreakpointsAction.ID, debugActions_1.EnableAllBreakpointsAction.LABEL), 'Debug: Enable All Breakpoints', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.DisableAllBreakpointsAction, debugActions_1.DisableAllBreakpointsAction.ID, debugActions_1.DisableAllBreakpointsAction.LABEL), 'Debug: Disable All Breakpoints', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.ClearReplAction, debugActions_1.ClearReplAction.ID, debugActions_1.ClearReplAction.LABEL), 'Debug: Clear Console', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.FocusReplAction, debugActions_1.FocusReplAction.ID, debugActions_1.FocusReplAction.LABEL), 'Debug: Focus Debug Console', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugActions_1.SelectAndStartAction, debugActions_1.SelectAndStartAction.ID, debugActions_1.SelectAndStartAction.LABEL), 'Debug: Select and Start Debugging', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugViewlet_1.FocusVariablesViewAction, debugViewlet_1.FocusVariablesViewAction.ID, debugViewlet_1.FocusVariablesViewAction.LABEL), 'Debug: Focus Variables', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugViewlet_1.FocusWatchViewAction, debugViewlet_1.FocusWatchViewAction.ID, debugViewlet_1.FocusWatchViewAction.LABEL), 'Debug: Focus Watch', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugViewlet_1.FocusCallStackViewAction, debugViewlet_1.FocusCallStackViewAction.ID, debugViewlet_1.FocusCallStackViewAction.LABEL), 'Debug: Focus CallStack', debugCategory);
    registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(debugViewlet_1.FocusBreakpointsViewAction, debugViewlet_1.FocusBreakpointsViewAction.ID, debugViewlet_1.FocusBreakpointsViewAction.LABEL), 'Debug: Focus Breakpoints', debugCategory);
    // Register Quick Open
    platform_1.Registry.as(quickopen_1.Extensions.Quickopen).registerQuickOpenHandler(new quickopen_1.QuickOpenHandlerDescriptor(debugQuickOpen_1.DebugQuickOpenHandler, debugQuickOpen_1.DebugQuickOpenHandler.ID, 'debug ', 'inLaunchConfigurationsPicker', nls.localize('debugCommands', "Debug Configuration")));
    // register service
    extensions_1.registerSingleton(debug_1.IDebugService, service.DebugService);
    // Register configuration
    var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'debug',
        order: 20,
        title: nls.localize('debugConfigurationTitle', "Debug"),
        type: 'object',
        properties: {
            'debug.allowBreakpointsEverywhere': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'allowBreakpointsEverywhere' }, "Allows setting breakpoint in any file"),
                default: false
            },
            'debug.openExplorerOnEnd': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'openExplorerOnEnd' }, "Automatically open explorer view on the end of a debug session"),
                default: false
            },
            'debug.inlineValues': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'inlineValues' }, "Show variable values inline in editor while debugging"),
                default: false
            },
            'debug.hideActionBar': {
                type: 'boolean',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'hideActionBar' }, "Controls if the floating debug action bar should be hidden"),
                default: false
            },
            'debug.showInStatusBar': {
                enum: ['never', 'always', 'onFirstSessionStart'],
                enumDescriptions: [nls.localize('never', "Never show debug in status bar"), nls.localize('always', "Always show debug in status bar"), nls.localize('onFirstSessionStart', "Show debug in status bar only after debug was started for the first time")],
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'showInStatusBar' }, "Controls when the debug status bar should be visible"),
                default: 'onFirstSessionStart'
            },
            'debug.internalConsoleOptions': debug_1.INTERNAL_CONSOLE_OPTIONS_SCHEMA,
            'debug.openDebug': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
                default: 'openOnFirstSessionStart',
                description: nls.localize('openDebug', "Controls whether debug viewlet should be open on debugging session start.")
            },
            'launch': {
                type: 'object',
                description: nls.localize({ comment: ['This is the description for a setting'], key: 'launch' }, "Global debug launch configuration. Should be used as an alternative to 'launch.json' that is shared across workspaces"),
                default: {}
            }
        }
    });
    debugCommands_1.registerCommands();
    // Register Debug Status
    var statusBar = platform_1.Registry.as(statusbar_1.Extensions.Statusbar);
    statusBar.registerStatusbarItem(new statusbar_1.StatusbarItemDescriptor(debugStatus_1.DebugStatus, statusbar_1.StatusbarAlignment.LEFT, 30 /* Low Priority */));
    // Touch Bar
    if (platform_2.isMacintosh) {
        var registerTouchBarEntry = function (id, title, order, when, icon) {
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
                command: {
                    id: id, title: title, iconPath: { dark: uri_1.default.parse(require.toUrl("vs/workbench/parts/debug/electron-browser/media/" + icon)).fsPath }
                },
                when: when,
                group: '9_debug',
                order: order
            });
        };
        registerTouchBarEntry(debugActions_1.StartAction.ID, debugActions_1.StartAction.LABEL, 0, debug_1.CONTEXT_NOT_IN_DEBUG_MODE, 'continue-tb.png');
        registerTouchBarEntry(debugActions_1.ContinueAction.ID, debugActions_1.ContinueAction.LABEL, 0, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), 'continue-tb.png');
        registerTouchBarEntry(debugActions_1.PauseAction.ID, debugActions_1.PauseAction.LABEL, 1, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.notEquals('debugState', 'stopped')), 'pause-tb.png');
        registerTouchBarEntry(debugActions_1.StepOverAction.ID, debugActions_1.StepOverAction.LABEL, 2, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), 'stepover-tb.png');
        registerTouchBarEntry(debugActions_1.StepIntoAction.ID, debugActions_1.StepIntoAction.LABEL, 3, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), 'stepinto-tb.png');
        registerTouchBarEntry(debugActions_1.StepOutAction.ID, debugActions_1.StepOutAction.LABEL, 4, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), 'stepout-tb.png');
        registerTouchBarEntry(debugActions_1.RestartAction.ID, debugActions_1.RestartAction.LABEL, 5, debug_1.CONTEXT_IN_DEBUG_MODE, 'restart-tb.png');
        registerTouchBarEntry(debugActions_1.StopAction.ID, debugActions_1.StopAction.LABEL, 6, debug_1.CONTEXT_IN_DEBUG_MODE, 'stop-tb.png');
    }
});
