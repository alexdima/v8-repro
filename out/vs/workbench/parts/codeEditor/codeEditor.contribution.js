/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model/textModel", "./electron-browser/accessibility", "./electron-browser/inspectKeybindings", "./electron-browser/menuPreventer", "./electron-browser/selectionClipboard", "./electron-browser/textMate/inspectTMScopes", "./electron-browser/toggleMinimap", "./electron-browser/toggleMultiCursorModifier", "./electron-browser/toggleRenderControlCharacter", "./electron-browser/toggleRenderWhitespace", "./electron-browser/toggleWordWrap"], function (require, exports, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _initialize = function () {
        // Configure text buffer implementation
        if (process.env['VSCODE_PIECE_TREE']) {
            console.log("Using TextBufferType.PieceTree (env variable VSCODE_PIECE_TREE)");
            textModel_1.OPTIONS.TEXT_BUFFER_IMPLEMENTATION = textModel_1.TextBufferType.PieceTree;
        }
    };
    if (typeof MonacoSnapshotInitializeCallbacks !== 'undefined') {
        MonacoSnapshotInitializeCallbacks.push(_initialize);
    }
    else {
        _initialize();
    }
});
