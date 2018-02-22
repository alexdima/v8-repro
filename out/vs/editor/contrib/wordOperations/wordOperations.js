/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/editor/common/core/selection", "vs/editor/browser/editorExtensions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/controller/cursorWordOperations", "vs/editor/common/commands/replaceCommand", "vs/editor/common/controller/wordCharacterClassifier", "vs/editor/common/controller/cursorCommon", "vs/editor/common/controller/cursorEvents"], function (require, exports, editorContextKeys_1, selection_1, editorExtensions_1, position_1, range_1, cursorWordOperations_1, replaceCommand_1, wordCharacterClassifier_1, cursorCommon_1, cursorEvents_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MoveWordCommand = /** @class */ (function (_super) {
        __extends(MoveWordCommand, _super);
        function MoveWordCommand(opts) {
            var _this = _super.call(this, opts) || this;
            _this._inSelectionMode = opts.inSelectionMode;
            _this._wordNavigationType = opts.wordNavigationType;
            return _this;
        }
        MoveWordCommand.prototype.runEditorCommand = function (accessor, editor, args) {
            var _this = this;
            var config = editor.getConfiguration();
            var wordSeparators = wordCharacterClassifier_1.getMapForWordSeparators(config.wordSeparators);
            var model = editor.getModel();
            var selections = editor.getSelections();
            var result = selections.map(function (sel) {
                var inPosition = new position_1.Position(sel.positionLineNumber, sel.positionColumn);
                var outPosition = _this._move(wordSeparators, model, inPosition, _this._wordNavigationType);
                return _this._moveTo(sel, outPosition, _this._inSelectionMode);
            });
            editor._getCursors().setStates('moveWordCommand', cursorEvents_1.CursorChangeReason.NotSet, result.map(function (r) { return cursorCommon_1.CursorState.fromModelSelection(r); }));
            if (result.length === 1) {
                var pos = new position_1.Position(result[0].positionLineNumber, result[0].positionColumn);
                editor.revealPosition(pos, 0 /* Smooth */);
            }
        };
        MoveWordCommand.prototype._moveTo = function (from, to, inSelectionMode) {
            if (inSelectionMode) {
                // move just position
                return new selection_1.Selection(from.selectionStartLineNumber, from.selectionStartColumn, to.lineNumber, to.column);
            }
            else {
                // move everything
                return new selection_1.Selection(to.lineNumber, to.column, to.lineNumber, to.column);
            }
        };
        return MoveWordCommand;
    }(editorExtensions_1.EditorCommand));
    exports.MoveWordCommand = MoveWordCommand;
    var WordLeftCommand = /** @class */ (function (_super) {
        __extends(WordLeftCommand, _super);
        function WordLeftCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WordLeftCommand.prototype._move = function (wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordLeft(wordSeparators, model, position, wordNavigationType);
        };
        return WordLeftCommand;
    }(MoveWordCommand));
    exports.WordLeftCommand = WordLeftCommand;
    var WordRightCommand = /** @class */ (function (_super) {
        __extends(WordRightCommand, _super);
        function WordRightCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WordRightCommand.prototype._move = function (wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordRight(wordSeparators, model, position, wordNavigationType);
        };
        return WordRightCommand;
    }(MoveWordCommand));
    exports.WordRightCommand = WordRightCommand;
    var CursorWordStartLeft = /** @class */ (function (_super) {
        __extends(CursorWordStartLeft, _super);
        function CursorWordStartLeft() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartLeft',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
                    mac: { primary: 512 /* Alt */ | 15 /* LeftArrow */ }
                }
            }) || this;
        }
        return CursorWordStartLeft;
    }(WordLeftCommand));
    exports.CursorWordStartLeft = CursorWordStartLeft;
    var CursorWordEndLeft = /** @class */ (function (_super) {
        __extends(CursorWordEndLeft, _super);
        function CursorWordEndLeft() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordEndLeft',
                precondition: null
            }) || this;
        }
        return CursorWordEndLeft;
    }(WordLeftCommand));
    exports.CursorWordEndLeft = CursorWordEndLeft;
    var CursorWordLeft = /** @class */ (function (_super) {
        __extends(CursorWordLeft, _super);
        function CursorWordLeft() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordLeft',
                precondition: null
            }) || this;
        }
        return CursorWordLeft;
    }(WordLeftCommand));
    exports.CursorWordLeft = CursorWordLeft;
    var CursorWordStartLeftSelect = /** @class */ (function (_super) {
        __extends(CursorWordStartLeftSelect, _super);
        function CursorWordStartLeftSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartLeftSelect',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */,
                    mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 15 /* LeftArrow */ }
                }
            }) || this;
        }
        return CursorWordStartLeftSelect;
    }(WordLeftCommand));
    exports.CursorWordStartLeftSelect = CursorWordStartLeftSelect;
    var CursorWordEndLeftSelect = /** @class */ (function (_super) {
        __extends(CursorWordEndLeftSelect, _super);
        function CursorWordEndLeftSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordEndLeftSelect',
                precondition: null
            }) || this;
        }
        return CursorWordEndLeftSelect;
    }(WordLeftCommand));
    exports.CursorWordEndLeftSelect = CursorWordEndLeftSelect;
    var CursorWordLeftSelect = /** @class */ (function (_super) {
        __extends(CursorWordLeftSelect, _super);
        function CursorWordLeftSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordLeftSelect',
                precondition: null
            }) || this;
        }
        return CursorWordLeftSelect;
    }(WordLeftCommand));
    exports.CursorWordLeftSelect = CursorWordLeftSelect;
    var CursorWordStartRight = /** @class */ (function (_super) {
        __extends(CursorWordStartRight, _super);
        function CursorWordStartRight() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartRight',
                precondition: null
            }) || this;
        }
        return CursorWordStartRight;
    }(WordRightCommand));
    exports.CursorWordStartRight = CursorWordStartRight;
    var CursorWordEndRight = /** @class */ (function (_super) {
        __extends(CursorWordEndRight, _super);
        function CursorWordEndRight() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordEndRight',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */,
                    mac: { primary: 512 /* Alt */ | 17 /* RightArrow */ }
                }
            }) || this;
        }
        return CursorWordEndRight;
    }(WordRightCommand));
    exports.CursorWordEndRight = CursorWordEndRight;
    var CursorWordRight = /** @class */ (function (_super) {
        __extends(CursorWordRight, _super);
        function CursorWordRight() {
            return _super.call(this, {
                inSelectionMode: false,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordRight',
                precondition: null
            }) || this;
        }
        return CursorWordRight;
    }(WordRightCommand));
    exports.CursorWordRight = CursorWordRight;
    var CursorWordStartRightSelect = /** @class */ (function (_super) {
        __extends(CursorWordStartRightSelect, _super);
        function CursorWordStartRightSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartRightSelect',
                precondition: null
            }) || this;
        }
        return CursorWordStartRightSelect;
    }(WordRightCommand));
    exports.CursorWordStartRightSelect = CursorWordStartRightSelect;
    var CursorWordEndRightSelect = /** @class */ (function (_super) {
        __extends(CursorWordEndRightSelect, _super);
        function CursorWordEndRightSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordEndRightSelect',
                precondition: null,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */,
                    mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 17 /* RightArrow */ }
                }
            }) || this;
        }
        return CursorWordEndRightSelect;
    }(WordRightCommand));
    exports.CursorWordEndRightSelect = CursorWordEndRightSelect;
    var CursorWordRightSelect = /** @class */ (function (_super) {
        __extends(CursorWordRightSelect, _super);
        function CursorWordRightSelect() {
            return _super.call(this, {
                inSelectionMode: true,
                wordNavigationType: 1 /* WordEnd */,
                id: 'cursorWordRightSelect',
                precondition: null
            }) || this;
        }
        return CursorWordRightSelect;
    }(WordRightCommand));
    exports.CursorWordRightSelect = CursorWordRightSelect;
    var DeleteWordCommand = /** @class */ (function (_super) {
        __extends(DeleteWordCommand, _super);
        function DeleteWordCommand(opts) {
            var _this = _super.call(this, opts) || this;
            _this._whitespaceHeuristics = opts.whitespaceHeuristics;
            _this._wordNavigationType = opts.wordNavigationType;
            return _this;
        }
        DeleteWordCommand.prototype.runEditorCommand = function (accessor, editor, args) {
            var _this = this;
            var config = editor.getConfiguration();
            var wordSeparators = wordCharacterClassifier_1.getMapForWordSeparators(config.wordSeparators);
            var model = editor.getModel();
            var selections = editor.getSelections();
            var commands = selections.map(function (sel) {
                var deleteRange = _this._delete(wordSeparators, model, sel, _this._whitespaceHeuristics, _this._wordNavigationType);
                return new replaceCommand_1.ReplaceCommand(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        };
        return DeleteWordCommand;
    }(editorExtensions_1.EditorCommand));
    exports.DeleteWordCommand = DeleteWordCommand;
    var DeleteWordLeftCommand = /** @class */ (function (_super) {
        __extends(DeleteWordLeftCommand, _super);
        function DeleteWordLeftCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeleteWordLeftCommand.prototype._delete = function (wordSeparators, model, selection, whitespaceHeuristics, wordNavigationType) {
            var r = cursorWordOperations_1.WordOperations.deleteWordLeft(wordSeparators, model, selection, whitespaceHeuristics, wordNavigationType);
            if (r) {
                return r;
            }
            return new range_1.Range(1, 1, 1, 1);
        };
        return DeleteWordLeftCommand;
    }(DeleteWordCommand));
    exports.DeleteWordLeftCommand = DeleteWordLeftCommand;
    var DeleteWordRightCommand = /** @class */ (function (_super) {
        __extends(DeleteWordRightCommand, _super);
        function DeleteWordRightCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeleteWordRightCommand.prototype._delete = function (wordSeparators, model, selection, whitespaceHeuristics, wordNavigationType) {
            var r = cursorWordOperations_1.WordOperations.deleteWordRight(wordSeparators, model, selection, whitespaceHeuristics, wordNavigationType);
            if (r) {
                return r;
            }
            var lineCount = model.getLineCount();
            var maxColumn = model.getLineMaxColumn(lineCount);
            return new range_1.Range(lineCount, maxColumn, lineCount, maxColumn);
        };
        return DeleteWordRightCommand;
    }(DeleteWordCommand));
    exports.DeleteWordRightCommand = DeleteWordRightCommand;
    var DeleteWordStartLeft = /** @class */ (function (_super) {
        __extends(DeleteWordStartLeft, _super);
        function DeleteWordStartLeft() {
            return _super.call(this, {
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordStartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return DeleteWordStartLeft;
    }(DeleteWordLeftCommand));
    exports.DeleteWordStartLeft = DeleteWordStartLeft;
    var DeleteWordEndLeft = /** @class */ (function (_super) {
        __extends(DeleteWordEndLeft, _super);
        function DeleteWordEndLeft() {
            return _super.call(this, {
                whitespaceHeuristics: false,
                wordNavigationType: 1 /* WordEnd */,
                id: 'deleteWordEndLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return DeleteWordEndLeft;
    }(DeleteWordLeftCommand));
    exports.DeleteWordEndLeft = DeleteWordEndLeft;
    var DeleteWordLeft = /** @class */ (function (_super) {
        __extends(DeleteWordLeft, _super);
        function DeleteWordLeft() {
            return _super.call(this, {
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
                    mac: { primary: 512 /* Alt */ | 1 /* Backspace */ }
                }
            }) || this;
        }
        return DeleteWordLeft;
    }(DeleteWordLeftCommand));
    exports.DeleteWordLeft = DeleteWordLeft;
    var DeleteWordStartRight = /** @class */ (function (_super) {
        __extends(DeleteWordStartRight, _super);
        function DeleteWordStartRight() {
            return _super.call(this, {
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordStartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return DeleteWordStartRight;
    }(DeleteWordRightCommand));
    exports.DeleteWordStartRight = DeleteWordStartRight;
    var DeleteWordEndRight = /** @class */ (function (_super) {
        __extends(DeleteWordEndRight, _super);
        function DeleteWordEndRight() {
            return _super.call(this, {
                whitespaceHeuristics: false,
                wordNavigationType: 1 /* WordEnd */,
                id: 'deleteWordEndRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        return DeleteWordEndRight;
    }(DeleteWordRightCommand));
    exports.DeleteWordEndRight = DeleteWordEndRight;
    var DeleteWordRight = /** @class */ (function (_super) {
        __extends(DeleteWordRight, _super);
        function DeleteWordRight() {
            return _super.call(this, {
                whitespaceHeuristics: true,
                wordNavigationType: 1 /* WordEnd */,
                id: 'deleteWordRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
                    mac: { primary: 512 /* Alt */ | 20 /* Delete */ }
                }
            }) || this;
        }
        return DeleteWordRight;
    }(DeleteWordRightCommand));
    exports.DeleteWordRight = DeleteWordRight;
    editorExtensions_1.registerEditorCommand(new CursorWordStartLeft());
    editorExtensions_1.registerEditorCommand(new CursorWordEndLeft());
    editorExtensions_1.registerEditorCommand(new CursorWordLeft());
    editorExtensions_1.registerEditorCommand(new CursorWordStartLeftSelect());
    editorExtensions_1.registerEditorCommand(new CursorWordEndLeftSelect());
    editorExtensions_1.registerEditorCommand(new CursorWordLeftSelect());
    editorExtensions_1.registerEditorCommand(new CursorWordStartRight());
    editorExtensions_1.registerEditorCommand(new CursorWordEndRight());
    editorExtensions_1.registerEditorCommand(new CursorWordRight());
    editorExtensions_1.registerEditorCommand(new CursorWordStartRightSelect());
    editorExtensions_1.registerEditorCommand(new CursorWordEndRightSelect());
    editorExtensions_1.registerEditorCommand(new CursorWordRightSelect());
    editorExtensions_1.registerEditorCommand(new DeleteWordStartLeft());
    editorExtensions_1.registerEditorCommand(new DeleteWordEndLeft());
    editorExtensions_1.registerEditorCommand(new DeleteWordLeft());
    editorExtensions_1.registerEditorCommand(new DeleteWordStartRight());
    editorExtensions_1.registerEditorCommand(new DeleteWordEndRight());
    editorExtensions_1.registerEditorCommand(new DeleteWordRight());
});
