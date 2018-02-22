define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/actions", "vs/workbench/common/editor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/base/common/keyCodes", "vs/platform/instantiation/common/descriptors", "vs/workbench/parts/preferences/browser/preferencesEditor", "vs/workbench/parts/preferences/browser/keybindingsEditor", "vs/workbench/parts/preferences/browser/preferencesActions", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/parts/preferences/browser/preferencesService", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/contributions", "vs/workbench/parts/preferences/common/preferencesContribution", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/workbench/browser/editor", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/parts/preferences/electron-browser/preferencesSearch"], function (require, exports, nls, uri_1, platform_1, keybindingsRegistry_1, actions_1, editor_1, actions_2, extensions_1, keyCodes_1, descriptors_1, preferencesEditor_1, keybindingsEditor_1, preferencesActions_1, preferences_1, preferencesService_1, instantiation_1, contributions_1, preferencesContribution_1, contextkey_1, editorService_1, commands_1, editor_2, lifecycle_1, preferencesSearch_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    extensions_1.registerSingleton(preferences_1.IPreferencesService, preferencesService_1.PreferencesService);
    extensions_1.registerSingleton(preferences_1.IPreferencesSearchService, preferencesSearch_1.PreferencesSearchService);
    platform_1.Registry.as(editor_2.Extensions.Editors).registerEditor(new editor_2.EditorDescriptor(preferencesEditor_1.PreferencesEditor, preferencesEditor_1.PreferencesEditor.ID, nls.localize('defaultPreferencesEditor', "Default Preferences Editor")), [
        new descriptors_1.SyncDescriptor(preferencesEditor_1.PreferencesEditorInput)
    ]);
    platform_1.Registry.as(editor_2.Extensions.Editors).registerEditor(new editor_2.EditorDescriptor(keybindingsEditor_1.KeybindingsEditor, keybindingsEditor_1.KeybindingsEditor.ID, nls.localize('keybindingsEditor', "Keybindings Editor")), [
        new descriptors_1.SyncDescriptor(keybindingsEditor_1.KeybindingsEditorInput)
    ]);
    // Register Preferences Editor Input Factory
    var PreferencesEditorInputFactory = /** @class */ (function () {
        function PreferencesEditorInputFactory() {
        }
        PreferencesEditorInputFactory.prototype.serialize = function (editorInput) {
            var input = editorInput;
            if (input.details && input.master) {
                var registry_1 = platform_1.Registry.as(editor_1.Extensions.EditorInputFactories);
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
        PreferencesEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            var deserialized = JSON.parse(serializedEditorInput);
            var registry = platform_1.Registry.as(editor_1.Extensions.EditorInputFactories);
            var detailsInputFactory = registry.getEditorInputFactory(deserialized.detailsTypeId);
            var masterInputFactory = registry.getEditorInputFactory(deserialized.masterTypeId);
            if (detailsInputFactory && masterInputFactory) {
                var detailsInput = detailsInputFactory.deserialize(instantiationService, deserialized.detailsSerialized);
                var masterInput = masterInputFactory.deserialize(instantiationService, deserialized.masterSerialized);
                if (detailsInput && masterInput) {
                    return new preferencesEditor_1.PreferencesEditorInput(deserialized.name, deserialized.description, detailsInput, masterInput);
                }
            }
            return null;
        };
        return PreferencesEditorInputFactory;
    }());
    var KeybindingsEditorInputFactory = /** @class */ (function () {
        function KeybindingsEditorInputFactory() {
        }
        KeybindingsEditorInputFactory.prototype.serialize = function (editorInput) {
            var input = editorInput;
            return JSON.stringify({
                name: input.getName(),
                typeId: input.getTypeId()
            });
        };
        KeybindingsEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(keybindingsEditor_1.KeybindingsEditorInput);
        };
        return KeybindingsEditorInputFactory;
    }());
    // Register Default Preferences Editor Input Factory
    var DefaultPreferencesEditorInputFactory = /** @class */ (function () {
        function DefaultPreferencesEditorInputFactory() {
        }
        DefaultPreferencesEditorInputFactory.prototype.serialize = function (editorInput) {
            var input = editorInput;
            var serialized = { resource: input.getResource().toString() };
            return JSON.stringify(serialized);
        };
        DefaultPreferencesEditorInputFactory.prototype.deserialize = function (instantiationService, serializedEditorInput) {
            var deserialized = JSON.parse(serializedEditorInput);
            return instantiationService.createInstance(preferencesEditor_1.DefaultPreferencesEditorInput, uri_1.default.parse(deserialized.resource));
        };
        return DefaultPreferencesEditorInputFactory;
    }());
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory(preferencesEditor_1.PreferencesEditorInput.ID, PreferencesEditorInputFactory);
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory(preferencesEditor_1.DefaultPreferencesEditorInput.ID, DefaultPreferencesEditorInputFactory);
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory(keybindingsEditor_1.KeybindingsEditorInput.ID, KeybindingsEditorInputFactory);
    // Contribute Global Actions
    var category = nls.localize('preferences', "Preferences");
    var registry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(preferencesActions_1.OpenRawDefaultSettingsAction, preferencesActions_1.OpenRawDefaultSettingsAction.ID, preferencesActions_1.OpenRawDefaultSettingsAction.LABEL), 'Preferences: Open Raw Default Settings', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(preferencesActions_1.OpenGlobalSettingsAction, preferencesActions_1.OpenGlobalSettingsAction.ID, preferencesActions_1.OpenGlobalSettingsAction.LABEL, { primary: 2048 /* CtrlCmd */ | 82 /* US_COMMA */ }), 'Preferences: Open User Settings', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(preferencesActions_1.OpenGlobalKeybindingsAction, preferencesActions_1.OpenGlobalKeybindingsAction.ID, preferencesActions_1.OpenGlobalKeybindingsAction.LABEL, { primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 49 /* KEY_S */) }), 'Preferences: Open Keyboard Shortcuts', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(preferencesActions_1.OpenGlobalKeybindingsFileAction, preferencesActions_1.OpenGlobalKeybindingsFileAction.ID, preferencesActions_1.OpenGlobalKeybindingsFileAction.LABEL, { primary: null }), 'Preferences: Open Keyboard Shortcuts File', category);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(preferencesActions_1.ConfigureLanguageBasedSettingsAction, preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID, preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL), 'Preferences: Configure Language Specific Settings...', category);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */),
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.defineKeybinding(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: 20 /* Delete */,
        mac: {
            primary: keyCodes_1.KeyChord(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1 /* Backspace */)
        },
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.removeKeybinding(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: null,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.resetKeybinding(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SEARCH,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */,
        handler: function (accessor, args) { return accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor().search(''); }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: null,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.showSimilarKeybindings(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.copyKeybinding(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
        primary: null,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.copyKeybindingCommand(editor.activeKeybindingEntry);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
        primary: 18 /* DownArrow */,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.focusKeybindings();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
        weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.workbenchContrib(),
        when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
        primary: 9 /* Escape */,
        handler: function (accessor, args) {
            var editor = accessor.get(editorService_1.IWorkbenchEditorService).getActiveEditor();
            editor.clearSearchResults();
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(preferencesContribution_1.PreferencesContribution, lifecycle_1.LifecyclePhase.Starting);
    commands_1.CommandsRegistry.registerCommand(preferencesActions_1.OPEN_FOLDER_SETTINGS_COMMAND, function (accessor, resource) {
        var preferencesService = accessor.get(preferences_1.IPreferencesService);
        return preferencesService.openFolderSettings(resource);
    });
    commands_1.CommandsRegistry.registerCommand(preferencesActions_1.OpenFolderSettingsAction.ID, function (serviceAccessor) {
        serviceAccessor.get(instantiation_1.IInstantiationService).createInstance(preferencesActions_1.OpenFolderSettingsAction, preferencesActions_1.OpenFolderSettingsAction.ID, preferencesActions_1.OpenFolderSettingsAction.LABEL).run();
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
        command: {
            id: preferencesActions_1.OpenFolderSettingsAction.ID,
            title: category + ": " + preferencesActions_1.OpenFolderSettingsAction.LABEL,
        },
        when: new contextkey_1.RawContextKey('workbenchState', '').isEqualTo('workspace')
    });
    commands_1.CommandsRegistry.registerCommand(preferencesActions_1.OpenWorkspaceSettingsAction.ID, function (serviceAccessor) {
        serviceAccessor.get(instantiation_1.IInstantiationService).createInstance(preferencesActions_1.OpenWorkspaceSettingsAction, preferencesActions_1.OpenWorkspaceSettingsAction.ID, preferencesActions_1.OpenWorkspaceSettingsAction.LABEL).run();
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
        command: {
            id: preferencesActions_1.OpenWorkspaceSettingsAction.ID,
            title: category + ": " + preferencesActions_1.OpenWorkspaceSettingsAction.LABEL,
        },
        when: new contextkey_1.RawContextKey('workbenchState', '').notEqualsTo('empty')
    });
});
