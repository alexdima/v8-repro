/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VIEWLET_ID = 'workbench.view.search';
    exports.FindInFilesActionId = 'workbench.action.findInFiles';
    exports.FocusActiveEditorCommandId = 'search.action.focusActiveEditor';
    exports.FocusSearchFromResults = 'search.action.focusSearchFromResults';
    exports.OpenMatchToSide = 'search.action.openResultToSide';
    exports.CancelActionId = 'search.action.cancel';
    exports.RemoveActionId = 'search.action.remove';
    exports.ReplaceActionId = 'search.action.replace';
    exports.ReplaceAllInFileActionId = 'search.action.replaceAllInFile';
    exports.ReplaceAllInFolderActionId = 'search.action.replaceAllInFolder';
    exports.CloseReplaceWidgetActionId = 'closeReplaceInFilesWidget';
    exports.ToggleCaseSensitiveCommandId = 'toggleSearchCaseSensitive';
    exports.ToggleWholeWordCommandId = 'toggleSearchWholeWord';
    exports.ToggleRegexCommandId = 'toggleSearchRegex';
    exports.SearchViewletVisibleKey = new contextkey_1.RawContextKey('searchViewletVisible', true);
    exports.InputBoxFocusedKey = new contextkey_1.RawContextKey('inputBoxFocus', false);
    exports.SearchInputBoxFocusedKey = new contextkey_1.RawContextKey('searchInputBoxFocus', false);
    exports.ReplaceInputBoxFocusedKey = new contextkey_1.RawContextKey('replaceInputBoxFocus', false);
    exports.PatternIncludesFocusedKey = new contextkey_1.RawContextKey('patternIncludesInputBoxFocus', false);
    exports.PatternExcludesFocusedKey = new contextkey_1.RawContextKey('patternExcludesInputBoxFocus', false);
    exports.ReplaceActiveKey = new contextkey_1.RawContextKey('replaceActive', false);
    exports.FirstMatchFocusKey = new contextkey_1.RawContextKey('firstMatchFocus', false);
    exports.FileMatchOrMatchFocusKey = new contextkey_1.RawContextKey('fileMatchOrMatchFocus', false);
    exports.FileFocusKey = new contextkey_1.RawContextKey('fileMatchFocus', false);
    exports.FolderFocusKey = new contextkey_1.RawContextKey('folderMatchFocus', false);
    exports.MatchFocusKey = new contextkey_1.RawContextKey('matchFocus', false);
});
