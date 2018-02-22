define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/editor/browser/editorBrowser"], function (require, exports, instantiation_1, editorBrowser_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ICodeEditorService = instantiation_1.createDecorator('codeEditorService');
    /**
     * Uses `editor.getControl()` and returns either a `codeEditor` or a `diffEditor` or nothing.
     */
    function getCodeOrDiffEditor(editor) {
        if (editor) {
            var control = editor.getControl();
            if (control) {
                if (editorBrowser_1.isCodeEditor(control)) {
                    return {
                        codeEditor: control,
                        diffEditor: null
                    };
                }
                if (editorBrowser_1.isDiffEditor(control)) {
                    return {
                        codeEditor: null,
                        diffEditor: control
                    };
                }
            }
        }
        return {
            codeEditor: null,
            diffEditor: null
        };
    }
    exports.getCodeOrDiffEditor = getCodeOrDiffEditor;
    /**
     * Uses `editor.getControl()` and returns either the code editor, or the modified editor of a diff editor or nothing.
     */
    function getCodeEditor(editor) {
        var r = getCodeOrDiffEditor(editor);
        return r.codeEditor || (r.diffEditor && r.diffEditor.getModifiedEditor()) || null;
    }
    exports.getCodeEditor = getCodeEditor;
});
