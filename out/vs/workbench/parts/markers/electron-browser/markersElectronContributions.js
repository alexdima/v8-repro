/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "electron", "vs/workbench/parts/markers/common/markersModel", "vs/workbench/parts/markers/common/constants", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/services/panel/common/panelService", "vs/workbench/parts/markers/browser/markersPanel"], function (require, exports, nls_1, electron_1, markersModel_1, constants_1, commands_1, actions_1, keybindingsRegistry_1, panelService_1, markersPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function registerContributions() {
        registerAction({
            id: constants_1.default.MARKER_COPY_ACTION_ID,
            title: nls_1.localize('copyMarker', "Copy"),
            handler: function (accessor) {
                copyMarker(accessor.get(panelService_1.IPanelService));
            },
            menu: {
                menuId: actions_1.MenuId.ProblemsPanelContext,
                when: constants_1.default.MarkerFocusContextKey,
                group: 'navigation'
            },
            keybinding: {
                keys: {
                    primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */
                },
                when: constants_1.default.MarkerFocusContextKey
            }
        });
        registerAction({
            id: constants_1.default.MARKER_COPY_MESSAGE_ACTION_ID,
            title: nls_1.localize('copyMarkerMessage', "Copy Message"),
            handler: function (accessor) {
                copyMessage(accessor.get(panelService_1.IPanelService));
            },
            menu: {
                menuId: actions_1.MenuId.ProblemsPanelContext,
                when: constants_1.default.MarkerFocusContextKey,
                group: 'navigation'
            }
        });
    }
    exports.registerContributions = registerContributions;
    function copyMarker(panelService) {
        var activePanel = panelService.getActivePanel();
        if (activePanel instanceof markersPanel_1.MarkersPanel) {
            var element = activePanel.getFocusElement();
            if (element instanceof markersModel_1.Marker) {
                electron_1.clipboard.writeText("" + element);
            }
        }
    }
    function copyMessage(panelService) {
        var activePanel = panelService.getActivePanel();
        if (activePanel instanceof markersPanel_1.MarkersPanel) {
            var element = activePanel.getFocusElement();
            if (element instanceof markersModel_1.Marker) {
                electron_1.clipboard.writeText(element.marker.message);
            }
        }
    }
    function registerAction(desc) {
        var id = desc.id, handler = desc.handler, title = desc.title, category = desc.category, menu = desc.menu, keybinding = desc.keybinding;
        // 1) register as command
        commands_1.CommandsRegistry.registerCommand(id, handler);
        // 2) menus
        var command = { id: id, title: title, category: category };
        if (menu) {
            var menuId = menu.menuId, when = menu.when, group = menu.group;
            actions_1.MenuRegistry.appendMenuItem(menuId, {
                command: command,
                when: when,
                group: group
            });
        }
        // 3) keybindings
        if (keybinding) {
            var when = keybinding.when, weight = keybinding.weight, keys = keybinding.keys;
            keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
                id: id,
                when: when,
                weight: weight,
                primary: keys.primary,
                secondary: keys.secondary,
                linux: keys.linux,
                mac: keys.mac,
                win: keys.win
            });
        }
    }
});
