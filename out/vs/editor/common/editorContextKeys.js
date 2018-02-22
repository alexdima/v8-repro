define(["require", "exports", "vs/platform/contextkey/common/contextkey"], function (require, exports, contextkey_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var EditorContextKeys;
    (function (EditorContextKeys) {
        /**
         * A context key that is set when the editor's text has focus (cursor is blinking).
         */
        EditorContextKeys.textFocus = new contextkey_1.RawContextKey('editorTextFocus', false);
        /**
         * A context key that is set when the editor's text or an editor's widget has focus.
         */
        EditorContextKeys.focus = new contextkey_1.RawContextKey('editorFocus', false);
        EditorContextKeys.readOnly = new contextkey_1.RawContextKey('editorReadonly', false);
        EditorContextKeys.writable = EditorContextKeys.readOnly.toNegated();
        EditorContextKeys.hasNonEmptySelection = new contextkey_1.RawContextKey('editorHasSelection', false);
        EditorContextKeys.hasOnlyEmptySelection = EditorContextKeys.hasNonEmptySelection.toNegated();
        EditorContextKeys.hasMultipleSelections = new contextkey_1.RawContextKey('editorHasMultipleSelections', false);
        EditorContextKeys.hasSingleSelection = EditorContextKeys.hasMultipleSelections.toNegated();
        EditorContextKeys.tabMovesFocus = new contextkey_1.RawContextKey('editorTabMovesFocus', false);
        EditorContextKeys.tabDoesNotMoveFocus = EditorContextKeys.tabMovesFocus.toNegated();
        EditorContextKeys.isInEmbeddedEditor = new contextkey_1.RawContextKey('isInEmbeddedEditor', undefined);
        // -- mode context keys
        EditorContextKeys.languageId = new contextkey_1.RawContextKey('editorLangId', undefined);
        EditorContextKeys.hasCompletionItemProvider = new contextkey_1.RawContextKey('editorHasCompletionItemProvider', undefined);
        EditorContextKeys.hasCodeActionsProvider = new contextkey_1.RawContextKey('editorHasCodeActionsProvider', undefined);
        EditorContextKeys.hasCodeLensProvider = new contextkey_1.RawContextKey('editorHasCodeLensProvider', undefined);
        EditorContextKeys.hasDefinitionProvider = new contextkey_1.RawContextKey('editorHasDefinitionProvider', undefined);
        EditorContextKeys.hasImplementationProvider = new contextkey_1.RawContextKey('editorHasImplementationProvider', undefined);
        EditorContextKeys.hasTypeDefinitionProvider = new contextkey_1.RawContextKey('editorHasTypeDefinitionProvider', undefined);
        EditorContextKeys.hasHoverProvider = new contextkey_1.RawContextKey('editorHasHoverProvider', undefined);
        EditorContextKeys.hasDocumentHighlightProvider = new contextkey_1.RawContextKey('editorHasDocumentHighlightProvider', undefined);
        EditorContextKeys.hasDocumentSymbolProvider = new contextkey_1.RawContextKey('editorHasDocumentSymbolProvider', undefined);
        EditorContextKeys.hasReferenceProvider = new contextkey_1.RawContextKey('editorHasReferenceProvider', undefined);
        EditorContextKeys.hasRenameProvider = new contextkey_1.RawContextKey('editorHasRenameProvider', undefined);
        EditorContextKeys.hasDocumentFormattingProvider = new contextkey_1.RawContextKey('editorHasDocumentFormattingProvider', undefined);
        EditorContextKeys.hasDocumentSelectionFormattingProvider = new contextkey_1.RawContextKey('editorHasDocumentSelectionFormattingProvider', undefined);
        EditorContextKeys.hasSignatureHelpProvider = new contextkey_1.RawContextKey('editorHasSignatureHelpProvider', undefined);
    })(EditorContextKeys = exports.EditorContextKeys || (exports.EditorContextKeys = {}));
});
