/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/base/common/paths", "vs/platform/configuration/common/configuration"], function (require, exports, nls_1, instantiation_1, contextkey_1, paths_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IPreferencesService = instantiation_1.createDecorator('preferencesService');
    function getSettingsTargetName(target, resource, workspaceContextService) {
        switch (target) {
            case configuration_1.ConfigurationTarget.USER:
                return nls_1.localize('userSettingsTarget', "User Settings");
            case configuration_1.ConfigurationTarget.WORKSPACE:
                return nls_1.localize('workspaceSettingsTarget', "Workspace Settings");
            case configuration_1.ConfigurationTarget.WORKSPACE_FOLDER:
                var folder = workspaceContextService.getWorkspaceFolder(resource);
                return folder ? folder.name : '';
        }
        return '';
    }
    exports.getSettingsTargetName = getSettingsTargetName;
    exports.IPreferencesSearchService = instantiation_1.createDecorator('preferencesSearchService');
    exports.CONTEXT_SETTINGS_EDITOR = new contextkey_1.RawContextKey('inSettingsEditor', false);
    exports.CONTEXT_SETTINGS_SEARCH_FOCUS = new contextkey_1.RawContextKey('inSettingsSearch', false);
    exports.CONTEXT_KEYBINDINGS_EDITOR = new contextkey_1.RawContextKey('inKeybindings', false);
    exports.CONTEXT_KEYBINDINGS_SEARCH_FOCUS = new contextkey_1.RawContextKey('inKeybindingsSearch', false);
    exports.CONTEXT_KEYBINDING_FOCUS = new contextkey_1.RawContextKey('keybindingFocus', false);
    exports.SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
    exports.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = 'settings.action.clearSearchResults';
    exports.SETTINGS_EDITOR_COMMAND_FOCUS_NEXT_SETTING = 'settings.action.focusNextSetting';
    exports.SETTINGS_EDITOR_COMMAND_FOCUS_PREVIOUS_SETTING = 'settings.action.focusPreviousSetting';
    exports.SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
    exports.SETTINGS_EDITOR_COMMAND_EDIT_FOCUSED_SETTING = 'settings.action.editFocusedSetting';
    exports.KEYBINDINGS_EDITOR_COMMAND_SEARCH = 'keybindings.editor.searchKeybindings';
    exports.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = 'keybindings.editor.clearSearchResults';
    exports.KEYBINDINGS_EDITOR_COMMAND_DEFINE = 'keybindings.editor.defineKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_REMOVE = 'keybindings.editor.removeKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_RESET = 'keybindings.editor.resetKeybinding';
    exports.KEYBINDINGS_EDITOR_COMMAND_COPY = 'keybindings.editor.copyKeybindingEntry';
    exports.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = 'keybindings.editor.copyCommandKeybindingEntry';
    exports.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = 'keybindings.editor.showConflicts';
    exports.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = 'keybindings.editor.focusKeybindings';
    exports.FOLDER_SETTINGS_PATH = paths_1.join('.vscode', 'settings.json');
    exports.DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
});
