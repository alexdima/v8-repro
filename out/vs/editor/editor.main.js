/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/standalone/standaloneBase", "vs/editor/standalone/browser/standaloneEditor", "vs/editor/standalone/browser/standaloneLanguages", "vs/editor/common/config/editorOptions", "vs/base/common/winjs.polyfill.promise", "vs/editor/editor.all", "vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp", "vs/editor/standalone/browser/inspectTokens/inspectTokens", "vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard", "vs/editor/standalone/browser/quickOpen/quickOutline", "vs/editor/standalone/browser/quickOpen/gotoLine", "vs/editor/standalone/browser/quickOpen/quickCommand", "vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast"], function (require, exports, standaloneBase_1, standaloneEditor_1, standaloneLanguages_1, editorOptions_1, winjs_polyfill_promise_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var global = self;
    global.monaco = exports;
    if (typeof global.Promise === 'undefined') {
        global.Promise = winjs_polyfill_promise_1.PolyfillPromise;
    }
    // Set defaults for standalone editor
    editorOptions_1.EDITOR_DEFAULTS.wrappingIndent = editorOptions_1.WrappingIndent.None;
    editorOptions_1.EDITOR_DEFAULTS.contribInfo.folding = false;
    editorOptions_1.EDITOR_DEFAULTS.viewInfo.glyphMargin = false;
    editorOptions_1.EDITOR_DEFAULTS.autoIndent = false;
    var base = standaloneBase_1.createMonacoBaseAPI();
    for (var prop in base) {
        if (base.hasOwnProperty(prop)) {
            exports[prop] = base[prop];
        }
    }
    exports.editor = standaloneEditor_1.createMonacoEditorAPI();
    exports.languages = standaloneLanguages_1.createMonacoLanguagesAPI();
    if (typeof global.require !== 'undefined' && typeof global.require.config === 'function') {
        global.require.config({
            ignoreDuplicateModules: [
                'vscode-languageserver-types',
                'vscode-languageserver-types/main',
                'vscode-nls',
                'vscode-nls/vscode-nls',
                'jsonc-parser',
                'jsonc-parser/main',
                'vscode-uri',
                'vscode-uri/index'
            ]
        });
    }
});
