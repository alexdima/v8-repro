/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/keyCodes", "vs/editor/common/modes/modesRegistry", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/extensions", "vs/workbench/common/actions", "vs/workbench/parts/output/electron-browser/outputServices", "vs/workbench/parts/output/browser/outputActions", "vs/workbench/parts/output/common/output", "vs/workbench/browser/panel", "vs/platform/commands/common/commands", "vs/workbench/parts/output/browser/outputPanel", "vs/workbench/browser/editor", "vs/workbench/parts/output/browser/logViewer", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contributions", "vs/platform/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls, keyCodes_1, modesRegistry_1, platform_1, actions_1, keybindingsRegistry_1, extensions_1, actions_2, outputServices_1, outputActions_1, output_1, panel_1, commands_1, outputPanel_1, editor_1, logViewer_1, descriptors_1, contributions_1, lifecycle_1, instantiation_1, resolverService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Service
    extensions_1.registerSingleton(output_1.IOutputService, outputServices_1.OutputService);
    // Register Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.OUTPUT_MODE_ID,
        extensions: [],
        aliases: [null],
        mimetypes: [output_1.OUTPUT_MIME]
    });
    // Register Output Panel
    platform_1.Registry.as(panel_1.Extensions.Panels).registerPanel(new panel_1.PanelDescriptor(outputPanel_1.OutputPanel, output_1.OUTPUT_PANEL_ID, nls.localize('output', "Output"), 'output', 20, outputActions_1.ToggleOutputAction.ID));
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(logViewer_1.LogViewer, logViewer_1.LogViewer.LOG_VIEWER_EDITOR_ID, nls.localize('logViewer', "Log Viewer")), [
        new descriptors_1.SyncDescriptor(logViewer_1.LogViewerInput)
    ]);
    var OutputContribution = /** @class */ (function () {
        function OutputContribution(instantiationService, textModelService) {
            textModelService.registerTextModelContentProvider(output_1.LOG_SCHEME, instantiationService.createInstance(outputServices_1.LogContentProvider));
        }
        OutputContribution = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, resolverService_1.ITextModelService)
        ], OutputContribution);
        return OutputContribution;
    }());
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(OutputContribution, lifecycle_1.LifecyclePhase.Running);
    // register toggle output action globally
    var actionRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(outputActions_1.ToggleOutputAction, outputActions_1.ToggleOutputAction.ID, outputActions_1.ToggleOutputAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 51 /* KEY_U */,
        linux: {
            primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 38 /* KEY_H */) // On Ubuntu Ctrl+Shift+U is taken by some global OS command
        }
    }), 'View: Toggle Output', nls.localize('viewCategory', "View"));
    actionRegistry.registerWorkbenchAction(new actions_1.SyncActionDescriptor(outputActions_1.ClearOutputAction, outputActions_1.ClearOutputAction.ID, outputActions_1.ClearOutputAction.LABEL), 'View: Clear Output', nls.localize('viewCategory', "View"));
    function registerAction(desc) {
        var id = desc.id, handler = desc.handler, title = desc.title, category = desc.category, f1 = desc.f1, menu = desc.menu, keybinding = desc.keybinding;
        // 1) register as command
        commands_1.CommandsRegistry.registerCommand(id, handler);
        // 2) command palette
        var command = { id: id, title: title, category: category };
        if (f1) {
            actions_1.MenuRegistry.addCommand(command);
        }
        // 3) menus
        if (menu) {
            var menuId = menu.menuId, when = menu.when, group = menu.group;
            actions_1.MenuRegistry.appendMenuItem(menuId, {
                command: command,
                when: when,
                group: group
            });
        }
        // 4) keybindings
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
    // Define clear command, contribute to editor context menu
    registerAction({
        id: 'editor.action.clearoutput',
        title: nls.localize('clearOutput.label', "Clear Output"),
        menu: {
            menuId: actions_1.MenuId.EditorContext,
            when: output_1.CONTEXT_IN_OUTPUT
        },
        handler: function (accessor) {
            accessor.get(output_1.IOutputService).getActiveChannel().clear();
        }
    });
    commands_1.CommandsRegistry.registerCommand(output_1.COMMAND_OPEN_LOG_VIEWER, function (accessor, file) {
        if (file) {
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            return editorService.openEditor(accessor.get(instantiation_1.IInstantiationService).createInstance(logViewer_1.LogViewerInput, file));
        }
        return null;
    });
});
