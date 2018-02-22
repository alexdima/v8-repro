/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/parts/markers/common/messages", "vs/workbench/parts/markers/common/constants", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/actions", "vs/workbench/browser/panel", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/parts/markers/browser/markersPanelActions", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/panel/common/panelService", "vs/workbench/parts/markers/browser/markersPanel", "vs/platform/instantiation/common/extensions", "vs/workbench/parts/markers/common/markers"], function (require, exports, messages_1, constants_1, platform_1, actions_1, keybindingsRegistry_1, actions_2, panel_1, configurationRegistry_1, markersPanelActions_1, contextkey_1, panelService_1, markersPanel_1, extensions_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function registerContributions() {
        extensions_1.registerSingleton(markers_1.IMarkersWorkbenchService, markers_1.MarkersWorkbenchService);
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: constants_1.default.MARKER_OPEN_SIDE_ACTION_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: contextkey_1.ContextKeyExpr.and(constants_1.default.MarkerFocusContextKey),
            primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
            mac: {
                primary: 256 /* WinCtrl */ | 3 /* Enter */
            },
            handler: function (accessor, args) {
                var markersPanel = accessor.get(panelService_1.IPanelService).getActivePanel();
                markersPanel.openFileAtElement(markersPanel.getFocusElement(), false, true, true);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: constants_1.default.MARKER_SHOW_PANEL_ID,
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
            when: undefined,
            primary: undefined,
            handler: function (accessor, args) {
                accessor.get(panelService_1.IPanelService).openPanel(constants_1.default.MARKERS_PANEL_ID);
            }
        });
        // configuration
        platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
            'id': 'problems',
            'order': 101,
            'title': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_TITLE,
            'type': 'object',
            'properties': {
                'problems.autoReveal': {
                    'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
                    'type': 'boolean',
                    'default': true
                }
            }
        });
        // markers panel
        platform_1.Registry.as(panel_1.Extensions.Panels).registerPanel(new panel_1.PanelDescriptor(markersPanel_1.MarkersPanel, constants_1.default.MARKERS_PANEL_ID, messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS, 'markersPanel', 10, markersPanelActions_1.ToggleMarkersPanelAction.ID));
        // actions
        var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
        registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(markersPanelActions_1.ToggleMarkersPanelAction, markersPanelActions_1.ToggleMarkersPanelAction.ID, markersPanelActions_1.ToggleMarkersPanelAction.LABEL, {
            primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 43 /* KEY_M */
        }), 'View: Toggle Problems (Errors, Warnings, Infos)', messages_1.default.MARKERS_PANEL_VIEW_CATEGORY);
        registry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(markersPanelActions_1.ShowProblemsPanelAction, markersPanelActions_1.ShowProblemsPanelAction.ID, markersPanelActions_1.ShowProblemsPanelAction.LABEL), 'View: Focus Problems (Errors, Warnings, Infos)', messages_1.default.MARKERS_PANEL_VIEW_CATEGORY);
    }
    exports.registerContributions = registerContributions;
});
