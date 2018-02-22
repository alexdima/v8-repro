var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "vs/nls", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "./moveCaretCommand"], function (require, exports, nls, editorContextKeys_1, editorExtensions_1, moveCaretCommand_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MoveCaretAction = /** @class */ (function (_super) {
        __extends(MoveCaretAction, _super);
        function MoveCaretAction(left, opts) {
            var _this = _super.call(this, opts) || this;
            _this.left = left;
            return _this;
        }
        MoveCaretAction.prototype.run = function (accessor, editor) {
            var commands = [];
            var selections = editor.getSelections();
            for (var i = 0; i < selections.length; i++) {
                commands.push(new moveCaretCommand_1.MoveCaretCommand(selections[i], this.left));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        };
        return MoveCaretAction;
    }(editorExtensions_1.EditorAction));
    var MoveCaretLeftAction = /** @class */ (function (_super) {
        __extends(MoveCaretLeftAction, _super);
        function MoveCaretLeftAction() {
            return _super.call(this, true, {
                id: 'editor.action.moveCarretLeftAction',
                label: nls.localize('caret.moveLeft', "Move Caret Left"),
                alias: 'Move Caret Left',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return MoveCaretLeftAction;
    }(MoveCaretAction));
    var MoveCaretRightAction = /** @class */ (function (_super) {
        __extends(MoveCaretRightAction, _super);
        function MoveCaretRightAction() {
            return _super.call(this, false, {
                id: 'editor.action.moveCarretRightAction',
                label: nls.localize('caret.moveRight', "Move Caret Right"),
                alias: 'Move Caret Right',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return MoveCaretRightAction;
    }(MoveCaretAction));
    editorExtensions_1.registerEditorAction(MoveCaretLeftAction);
    editorExtensions_1.registerEditorAction(MoveCaretRightAction);
});
