/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/actions", "./webviewEditor", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "./webviewCommands"], function (require, exports, contextkey_1, keybindingsRegistry_1, actions_1, webviewEditor_1, actions_2, platform_1, webviewCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var category = 'Webview';
    var actionRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(webviewCommands_1.ShowWebViewEditorFindWidgetAction, webviewCommands_1.ShowWebViewEditorFindWidgetAction.ID, webviewCommands_1.ShowWebViewEditorFindWidgetAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */
    }, webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FOCUS), 'Webview: Focus Find Widget', category);
    var showNextFindTermCommand = new webviewCommands_1.ShowWebViewEditorFindTermCommand({
        id: 'editor.action.webvieweditor.showNextFindTerm',
        precondition: webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FIND_WIDGET_INPUT_FOCUSED,
        kbOpts: {
            primary: 512 /* Alt */ | 18 /* DownArrow */
        }
    }, true);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(showNextFindTermCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var showPreviousFindTermCommand = new webviewCommands_1.ShowWebViewEditorFindTermCommand({
        id: 'editor.action.webvieweditor.showPreviousFindTerm',
        precondition: webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FIND_WIDGET_INPUT_FOCUSED,
        kbOpts: {
            primary: 512 /* Alt */ | 16 /* UpArrow */
        }
    }, false);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(showPreviousFindTermCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
    var hideCommand = new webviewCommands_1.HideWebViewEditorFindCommand({
        id: 'editor.action.webvieweditor.hideFind',
        precondition: contextkey_1.ContextKeyExpr.and(webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEWEDITOR_FOCUS, webviewEditor_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE),
        kbOpts: {
            primary: 9 /* Escape */
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(hideCommand.toCommandAndKeybindingRule(keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib()));
});
