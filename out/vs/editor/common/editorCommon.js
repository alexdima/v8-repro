define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScrollType;
    (function (ScrollType) {
        ScrollType[ScrollType["Smooth"] = 0] = "Smooth";
        ScrollType[ScrollType["Immediate"] = 1] = "Immediate";
    })(ScrollType = exports.ScrollType || (exports.ScrollType = {}));
    /**
     * @internal
     */
    function isThemeColor(o) {
        return o && typeof o.id === 'string';
    }
    exports.isThemeColor = isThemeColor;
    /**
     * The type of the `IEditor`.
     */
    exports.EditorType = {
        ICodeEditor: 'vs.editor.ICodeEditor',
        IDiffEditor: 'vs.editor.IDiffEditor'
    };
    /**
     * Built-in commands.
     * @internal
     */
    exports.Handler = {
        ExecuteCommand: 'executeCommand',
        ExecuteCommands: 'executeCommands',
        Type: 'type',
        ReplacePreviousChar: 'replacePreviousChar',
        CompositionStart: 'compositionStart',
        CompositionEnd: 'compositionEnd',
        Paste: 'paste',
        Cut: 'cut',
        Undo: 'undo',
        Redo: 'redo',
    };
});
