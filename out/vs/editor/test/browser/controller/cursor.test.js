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
define(["require", "exports", "assert", "vs/editor/common/controller/cursor", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorCommon", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/test/common/mocks/testConfiguration", "vs/editor/test/common/mocks/mockMode", "vs/editor/common/modes", "vs/editor/browser/controller/coreCommands", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/viewModel/viewModelImpl"], function (require, exports, assert, cursor_1, editOperation_1, position_1, range_1, selection_1, editorCommon_1, model_1, textModel_1, languageConfiguration_1, languageConfigurationRegistry_1, testConfiguration_1, mockMode_1, modes_1, coreCommands_1, testCodeEditor_1, viewModelImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var H = editorCommon_1.Handler;
    // --------- utils
    function cursorCommand(cursor, command, extraData, overwriteSource) {
        cursor.trigger(overwriteSource || 'tests', command, extraData);
    }
    function cursorCommandAndTokenize(model, cursor, command, extraData, overwriteSource) {
        cursor.trigger(overwriteSource || 'tests', command, extraData);
        model.forceTokenization(model.getLineCount());
    }
    function moveTo(cursor, lineNumber, column, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(cursor, {
                position: new position_1.Position(lineNumber, column)
            });
        }
        else {
            coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, {
                position: new position_1.Position(lineNumber, column)
            });
        }
    }
    function moveLeft(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorLeftSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(cursor, {});
        }
    }
    function moveRight(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorRightSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorRight.runCoreEditorCommand(cursor, {});
        }
    }
    function moveDown(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorDownSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorDown.runCoreEditorCommand(cursor, {});
        }
    }
    function moveUp(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorUpSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorUp.runCoreEditorCommand(cursor, {});
        }
    }
    function moveToBeginningOfLine(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorHomeSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorHome.runCoreEditorCommand(cursor, {});
        }
    }
    function moveToEndOfLine(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorEnd.runCoreEditorCommand(cursor, {});
        }
    }
    function moveToBeginningOfBuffer(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorTopSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorTop.runCoreEditorCommand(cursor, {});
        }
    }
    function moveToEndOfBuffer(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorBottomSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorBottom.runCoreEditorCommand(cursor, {});
        }
    }
    function assertCursor(cursor, what) {
        var selections;
        if (what instanceof position_1.Position) {
            selections = [new selection_1.Selection(what.lineNumber, what.column, what.lineNumber, what.column)];
        }
        else if (what instanceof selection_1.Selection) {
            selections = [what];
        }
        else {
            selections = what;
        }
        var actual = cursor.getSelections().map(function (s) { return s.toString(); });
        var expected = selections.map(function (s) { return s.toString(); });
        assert.deepEqual(actual, expected);
    }
    suite('Editor Controller - Cursor', function () {
        var LINE1 = '    \tMy First Line\t ';
        var LINE2 = '\tMy Second Line';
        var LINE3 = '    Third Line🐶';
        var LINE4 = '';
        var LINE5 = '1';
        var thisModel;
        var thisConfiguration;
        var thisViewModel;
        var thisCursor;
        setup(function () {
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = textModel_1.TextModel.createFromString(text);
            thisConfiguration = new testConfiguration_1.TestConfiguration(null);
            thisViewModel = new viewModelImpl_1.ViewModel(0, thisConfiguration, thisModel, null);
            thisCursor = new cursor_1.Cursor(thisConfiguration, thisModel, thisViewModel);
        });
        teardown(function () {
            thisCursor.dispose();
            thisViewModel.dispose();
            thisModel.dispose();
            thisConfiguration.dispose();
        });
        test('cursor initialized', function () {
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        // --------- absolute move
        test('no move', function () {
            moveTo(thisCursor, 1, 1);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move', function () {
            moveTo(thisCursor, 1, 2);
            assertCursor(thisCursor, new position_1.Position(1, 2));
        });
        test('move in selection mode', function () {
            moveTo(thisCursor, 1, 2, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 1, 2));
        });
        test('move beyond line end', function () {
            moveTo(thisCursor, 1, 25);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
        });
        test('move empty line', function () {
            moveTo(thisCursor, 4, 20);
            assertCursor(thisCursor, new position_1.Position(4, 1));
        });
        test('move one char line', function () {
            moveTo(thisCursor, 5, 20);
            assertCursor(thisCursor, new position_1.Position(5, 2));
        });
        test('selection down', function () {
            moveTo(thisCursor, 2, 1, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
        });
        test('move and then select', function () {
            moveTo(thisCursor, 2, 3);
            assertCursor(thisCursor, new position_1.Position(2, 3));
            moveTo(thisCursor, 2, 15, true);
            assertCursor(thisCursor, new selection_1.Selection(2, 3, 2, 15));
            moveTo(thisCursor, 1, 2, true);
            assertCursor(thisCursor, new selection_1.Selection(2, 3, 1, 2));
        });
        // --------- move left
        test('move left on top left position', function () {
            moveLeft(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move left', function () {
            moveTo(thisCursor, 1, 3);
            assertCursor(thisCursor, new position_1.Position(1, 3));
            moveLeft(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 2));
        });
        test('move left with surrogate pair', function () {
            moveTo(thisCursor, 3, 17);
            assertCursor(thisCursor, new position_1.Position(3, 17));
            moveLeft(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, 15));
        });
        test('move left goes to previous row', function () {
            moveTo(thisCursor, 2, 1);
            assertCursor(thisCursor, new position_1.Position(2, 1));
            moveLeft(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 21));
        });
        test('move left selection', function () {
            moveTo(thisCursor, 2, 1);
            assertCursor(thisCursor, new position_1.Position(2, 1));
            moveLeft(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(2, 1, 1, 21));
        });
        // --------- move right
        test('move right on bottom right position', function () {
            moveTo(thisCursor, 5, 2);
            assertCursor(thisCursor, new position_1.Position(5, 2));
            moveRight(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, 2));
        });
        test('move right', function () {
            moveTo(thisCursor, 1, 3);
            assertCursor(thisCursor, new position_1.Position(1, 3));
            moveRight(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 4));
        });
        test('move right with surrogate pair', function () {
            moveTo(thisCursor, 3, 15);
            assertCursor(thisCursor, new position_1.Position(3, 15));
            moveRight(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, 17));
        });
        test('move right goes to next row', function () {
            moveTo(thisCursor, 1, 21);
            assertCursor(thisCursor, new position_1.Position(1, 21));
            moveRight(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, 1));
        });
        test('move right selection', function () {
            moveTo(thisCursor, 1, 21);
            assertCursor(thisCursor, new position_1.Position(1, 21));
            moveRight(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 21, 2, 1));
        });
        // --------- move down
        test('move down', function () {
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(4, 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, 2));
        });
        test('move down with selection', function () {
            moveDown(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveDown(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 3, 1));
            moveDown(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 4, 1));
            moveDown(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, 1));
            moveDown(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, 2));
        });
        test('move down with tabs', function () {
            moveTo(thisCursor, 1, 5);
            assertCursor(thisCursor, new position_1.Position(1, 5));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, 2));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, 5));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(4, 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, 2));
        });
        // --------- move up
        test('move up', function () {
            moveTo(thisCursor, 3, 5);
            assertCursor(thisCursor, new position_1.Position(3, 5));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, 2));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 5));
        });
        test('move up with selection', function () {
            moveTo(thisCursor, 3, 5);
            assertCursor(thisCursor, new position_1.Position(3, 5));
            moveUp(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 2, 2));
            moveUp(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 1, 5));
        });
        test('move up and down with tabs', function () {
            moveTo(thisCursor, 1, 5);
            assertCursor(thisCursor, new position_1.Position(1, 5));
            moveDown(thisCursor);
            moveDown(thisCursor);
            moveDown(thisCursor);
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, 2));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(4, 1));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, 5));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, 2));
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 5));
        });
        test('move up and down with end of lines starting from a long one', function () {
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(2, LINE2.length + 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(3, LINE3.length + 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(4, LINE4.length + 1));
            moveDown(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, LINE5.length + 1));
            moveUp(thisCursor);
            moveUp(thisCursor);
            moveUp(thisCursor);
            moveUp(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
        });
        // --------- move to beginning of line
        test('move to beginning of line', function () {
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 6));
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of line from within line', function () {
            moveTo(thisCursor, 1, 8);
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 6));
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of line from whitespace at beginning of line', function () {
            moveTo(thisCursor, 1, 2);
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 6));
            moveToBeginningOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of line from within line selection', function () {
            moveTo(thisCursor, 1, 8);
            moveToBeginningOfLine(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 8, 1, 6));
            moveToBeginningOfLine(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 8, 1, 1));
        });
        test('move to beginning of line with selection multiline forward', function () {
            moveTo(thisCursor, 1, 8);
            moveTo(thisCursor, 3, 9, true);
            moveToBeginningOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 3, 5));
        });
        test('move to beginning of line with selection multiline backward', function () {
            moveTo(thisCursor, 3, 9);
            moveTo(thisCursor, 1, 8, true);
            moveToBeginningOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(1, 6, 1, 6));
        });
        test('move to beginning of line with selection single line forward', function () {
            moveTo(thisCursor, 3, 2);
            moveTo(thisCursor, 3, 9, true);
            moveToBeginningOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 3, 5));
        });
        test('move to beginning of line with selection single line backward', function () {
            moveTo(thisCursor, 3, 9);
            moveTo(thisCursor, 3, 2, true);
            moveToBeginningOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 3, 5));
        });
        test('issue #15401: "End" key is behaving weird when text is selected part 1', function () {
            moveTo(thisCursor, 1, 8);
            moveTo(thisCursor, 3, 9, true);
            moveToBeginningOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 5, 3, 5));
        });
        test('issue #17011: Shift+home/end now go to the end of the selection start\'s line, not the selection\'s end', function () {
            moveTo(thisCursor, 1, 8);
            moveTo(thisCursor, 3, 9, true);
            moveToBeginningOfLine(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 8, 3, 5));
        });
        // --------- move to end of line
        test('move to end of line', function () {
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
        });
        test('move to end of line from within line', function () {
            moveTo(thisCursor, 1, 6);
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
        });
        test('move to end of line from whitespace at end of line', function () {
            moveTo(thisCursor, 1, 20);
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
            moveToEndOfLine(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, LINE1.length + 1));
        });
        test('move to end of line from within line selection', function () {
            moveTo(thisCursor, 1, 6);
            moveToEndOfLine(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 6, 1, LINE1.length + 1));
            moveToEndOfLine(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 6, 1, LINE1.length + 1));
        });
        test('move to end of line with selection multiline forward', function () {
            moveTo(thisCursor, 1, 1);
            moveTo(thisCursor, 3, 9, true);
            moveToEndOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 17, 3, 17));
        });
        test('move to end of line with selection multiline backward', function () {
            moveTo(thisCursor, 3, 9);
            moveTo(thisCursor, 1, 1, true);
            moveToEndOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(1, 21, 1, 21));
        });
        test('move to end of line with selection single line forward', function () {
            moveTo(thisCursor, 3, 1);
            moveTo(thisCursor, 3, 9, true);
            moveToEndOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 17, 3, 17));
        });
        test('move to end of line with selection single line backward', function () {
            moveTo(thisCursor, 3, 9);
            moveTo(thisCursor, 3, 1, true);
            moveToEndOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 17, 3, 17));
        });
        test('issue #15401: "End" key is behaving weird when text is selected part 2', function () {
            moveTo(thisCursor, 1, 1);
            moveTo(thisCursor, 3, 9, true);
            moveToEndOfLine(thisCursor, false);
            assertCursor(thisCursor, new selection_1.Selection(3, 17, 3, 17));
        });
        // --------- move to beginning of buffer
        test('move to beginning of buffer', function () {
            moveToBeginningOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of buffer from within first line', function () {
            moveTo(thisCursor, 1, 3);
            moveToBeginningOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of buffer from within another line', function () {
            moveTo(thisCursor, 3, 3);
            moveToBeginningOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(1, 1));
        });
        test('move to beginning of buffer from within first line selection', function () {
            moveTo(thisCursor, 1, 3);
            moveToBeginningOfBuffer(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 3, 1, 1));
        });
        test('move to beginning of buffer from within another line selection', function () {
            moveTo(thisCursor, 3, 3);
            moveToBeginningOfBuffer(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(3, 3, 1, 1));
        });
        // --------- move to end of buffer
        test('move to end of buffer', function () {
            moveToEndOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, LINE5.length + 1));
        });
        test('move to end of buffer from within last line', function () {
            moveTo(thisCursor, 5, 1);
            moveToEndOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, LINE5.length + 1));
        });
        test('move to end of buffer from within another line', function () {
            moveTo(thisCursor, 3, 3);
            moveToEndOfBuffer(thisCursor);
            assertCursor(thisCursor, new position_1.Position(5, LINE5.length + 1));
        });
        test('move to end of buffer from within last line selection', function () {
            moveTo(thisCursor, 5, 1);
            moveToEndOfBuffer(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(5, 1, 5, LINE5.length + 1));
        });
        test('move to end of buffer from within another line selection', function () {
            moveTo(thisCursor, 3, 3);
            moveToEndOfBuffer(thisCursor, true);
            assertCursor(thisCursor, new selection_1.Selection(3, 3, 5, LINE5.length + 1));
        });
        // --------- misc
        test('select all', function () {
            coreCommands_1.CoreNavigationCommands.SelectAll.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
        });
        test('expandLineSelection', function () {
            //              0          1         2
            //              01234 56789012345678 0
            // let LINE1 = '    \tMy First Line\t ';
            moveTo(thisCursor, 1, 1);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveTo(thisCursor, 1, 2);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveTo(thisCursor, 1, 5);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveTo(thisCursor, 1, 19);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveTo(thisCursor, 1, 20);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            moveTo(thisCursor, 1, 21);
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 3, 1));
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 4, 1));
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, 1));
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
            coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(thisCursor, {});
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
        });
        // --------- eventing
        test('no move doesn\'t trigger event', function () {
            thisCursor.onDidChange(function (e) {
                assert.ok(false, 'was not expecting event');
            });
            moveTo(thisCursor, 1, 1);
        });
        test('move eventing', function () {
            var events = 0;
            thisCursor.onDidChange(function (e) {
                events++;
                assert.deepEqual(e.selections, [new selection_1.Selection(1, 2, 1, 2)]);
            });
            moveTo(thisCursor, 1, 2);
            assert.equal(events, 1, 'receives 1 event');
        });
        test('move in selection mode eventing', function () {
            var events = 0;
            thisCursor.onDidChange(function (e) {
                events++;
                assert.deepEqual(e.selections, [new selection_1.Selection(1, 1, 1, 2)]);
            });
            moveTo(thisCursor, 1, 2, true);
            assert.equal(events, 1, 'receives 1 event');
        });
        // --------- state save & restore
        test('saveState & restoreState', function () {
            moveTo(thisCursor, 2, 1, true);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
            var savedState = JSON.stringify(thisCursor.saveState());
            moveTo(thisCursor, 1, 1, false);
            assertCursor(thisCursor, new position_1.Position(1, 1));
            thisCursor.restoreState(JSON.parse(savedState));
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 1));
        });
        // --------- updating cursor
        test('Independent model edit 1', function () {
            moveTo(thisCursor, 2, 16, true);
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(2, 1, 2, 2))]);
            assertCursor(thisCursor, new selection_1.Selection(1, 1, 2, 15));
        });
        test('column select 1', function () {
            testCodeEditor_1.withTestCodeEditor([
                '\tprivate compute(a:number): boolean {',
                '\t\tif (a + 3 === 0 || a + 5 === 0) {',
                '\t\t\treturn false;',
                '\t\t}',
                '\t}'
            ], {}, function (editor, cursor) {
                moveTo(cursor, 1, 7, false);
                assertCursor(cursor, new position_1.Position(1, 7));
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(cursor, {
                    position: new position_1.Position(4, 4),
                    viewPosition: new position_1.Position(4, 4),
                    mouseColumn: 15
                });
                var expectedSelections = [
                    new selection_1.Selection(1, 7, 1, 12),
                    new selection_1.Selection(2, 4, 2, 9),
                    new selection_1.Selection(3, 3, 3, 6),
                    new selection_1.Selection(4, 4, 4, 4),
                ];
                assertCursor(cursor, expectedSelections);
            });
        });
        test('issue #4905 - column select is biased to the right', function () {
            var model = textModel_1.TextModel.createFromString([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'));
            var config = new testConfiguration_1.TestConfiguration(null);
            var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
            var cursor = new cursor_1.Cursor(config, model, viewModel);
            moveTo(cursor, 1, 4, false);
            assertCursor(cursor, new position_1.Position(1, 4));
            coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(cursor, {
                position: new position_1.Position(4, 1),
                viewPosition: new position_1.Position(4, 1),
                mouseColumn: 1
            });
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 1),
                new selection_1.Selection(2, 4, 2, 1),
                new selection_1.Selection(3, 4, 3, 1),
                new selection_1.Selection(4, 4, 4, 1),
            ]);
            cursor.dispose();
            viewModel.dispose();
            config.dispose();
            model.dispose();
        });
        test('issue #20087: column select with mouse', function () {
            var model = textModel_1.TextModel.createFromString([
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" Key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SoMEKEy" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" valuE="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="00X"/>',
            ].join('\n'));
            var config = new testConfiguration_1.TestConfiguration(null);
            var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
            var cursor = new cursor_1.Cursor(config, model, viewModel);
            moveTo(cursor, 10, 10, false);
            assertCursor(cursor, new position_1.Position(10, 10));
            coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(cursor, {
                position: new position_1.Position(1, 1),
                viewPosition: new position_1.Position(1, 1),
                mouseColumn: 1
            });
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 1),
                new selection_1.Selection(9, 10, 9, 1),
                new selection_1.Selection(8, 10, 8, 1),
                new selection_1.Selection(7, 10, 7, 1),
                new selection_1.Selection(6, 10, 6, 1),
                new selection_1.Selection(5, 10, 5, 1),
                new selection_1.Selection(4, 10, 4, 1),
                new selection_1.Selection(3, 10, 3, 1),
                new selection_1.Selection(2, 10, 2, 1),
                new selection_1.Selection(1, 10, 1, 1),
            ]);
            coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(cursor, {
                position: new position_1.Position(1, 1),
                viewPosition: new position_1.Position(1, 1),
                mouseColumn: 1
            });
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 1),
                new selection_1.Selection(9, 10, 9, 1),
                new selection_1.Selection(8, 10, 8, 1),
                new selection_1.Selection(7, 10, 7, 1),
                new selection_1.Selection(6, 10, 6, 1),
                new selection_1.Selection(5, 10, 5, 1),
                new selection_1.Selection(4, 10, 4, 1),
                new selection_1.Selection(3, 10, 3, 1),
                new selection_1.Selection(2, 10, 2, 1),
                new selection_1.Selection(1, 10, 1, 1),
            ]);
            cursor.dispose();
            viewModel.dispose();
            config.dispose();
            model.dispose();
        });
        test('issue #20087: column select with keyboard', function () {
            var model = textModel_1.TextModel.createFromString([
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" Key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SoMEKEy" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" valuE="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="00X"/>',
            ].join('\n'));
            var config = new testConfiguration_1.TestConfiguration(null);
            var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
            var cursor = new cursor_1.Cursor(config, model, viewModel);
            moveTo(cursor, 10, 10, false);
            assertCursor(cursor, new position_1.Position(10, 10));
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 9)
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 8)
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 9)
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectUp.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 9),
                new selection_1.Selection(9, 10, 9, 9),
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(10, 10, 10, 9)
            ]);
            cursor.dispose();
            viewModel.dispose();
            config.dispose();
            model.dispose();
        });
        test('column select with keyboard', function () {
            var model = textModel_1.TextModel.createFromString([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'));
            var config = new testConfiguration_1.TestConfiguration(null);
            var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
            var cursor = new cursor_1.Cursor(config, model, viewModel);
            moveTo(cursor, 1, 4, false);
            assertCursor(cursor, new position_1.Position(1, 4));
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 5)
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5)
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5),
                new selection_1.Selection(3, 4, 3, 5),
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 5),
                new selection_1.Selection(2, 4, 2, 5),
                new selection_1.Selection(3, 4, 3, 5),
                new selection_1.Selection(4, 4, 4, 5),
                new selection_1.Selection(5, 4, 5, 5),
                new selection_1.Selection(6, 4, 6, 5),
                new selection_1.Selection(7, 4, 7, 5),
            ]);
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 6),
                new selection_1.Selection(2, 4, 2, 6),
                new selection_1.Selection(3, 4, 3, 6),
                new selection_1.Selection(4, 4, 4, 6),
                new selection_1.Selection(5, 4, 5, 6),
                new selection_1.Selection(6, 4, 6, 6),
                new selection_1.Selection(7, 4, 7, 6),
            ]);
            // 10 times
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 16),
                new selection_1.Selection(2, 4, 2, 16),
                new selection_1.Selection(3, 4, 3, 16),
                new selection_1.Selection(4, 4, 4, 16),
                new selection_1.Selection(5, 4, 5, 16),
                new selection_1.Selection(6, 4, 6, 16),
                new selection_1.Selection(7, 4, 7, 16),
            ]);
            // 10 times
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 26),
                new selection_1.Selection(2, 4, 2, 26),
                new selection_1.Selection(3, 4, 3, 26),
                new selection_1.Selection(4, 4, 4, 26),
                new selection_1.Selection(5, 4, 5, 26),
                new selection_1.Selection(6, 4, 6, 26),
                new selection_1.Selection(7, 4, 7, 26),
            ]);
            // 2 times => reaching the ending of lines 1 and 2
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 28),
                new selection_1.Selection(4, 4, 4, 28),
                new selection_1.Selection(5, 4, 5, 28),
                new selection_1.Selection(6, 4, 6, 28),
                new selection_1.Selection(7, 4, 7, 28),
            ]);
            // 4 times => reaching the ending of line 3
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 32),
                new selection_1.Selection(5, 4, 5, 32),
                new selection_1.Selection(6, 4, 6, 32),
                new selection_1.Selection(7, 4, 7, 32),
            ]);
            // 2 times => reaching the ending of line 4
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 34),
                new selection_1.Selection(6, 4, 6, 34),
                new selection_1.Selection(7, 4, 7, 34),
            ]);
            // 1 time => reaching the ending of line 7
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 35),
                new selection_1.Selection(6, 4, 6, 35),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // 3 times => reaching the ending of lines 5 & 6
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // cannot go anywhere anymore
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // cannot go anywhere anymore even if we insist
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 37),
                new selection_1.Selection(6, 4, 6, 37),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            // can easily go back
            coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(cursor, {});
            assertCursor(cursor, [
                new selection_1.Selection(1, 4, 1, 28),
                new selection_1.Selection(2, 4, 2, 28),
                new selection_1.Selection(3, 4, 3, 32),
                new selection_1.Selection(4, 4, 4, 34),
                new selection_1.Selection(5, 4, 5, 36),
                new selection_1.Selection(6, 4, 6, 36),
                new selection_1.Selection(7, 4, 7, 35),
            ]);
            cursor.dispose();
            viewModel.dispose();
            config.dispose();
            model.dispose();
        });
    });
    var SurroundingMode = /** @class */ (function (_super) {
        __extends(SurroundingMode, _super);
        function SurroundingMode() {
            var _this = _super.call(this, SurroundingMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                autoClosingPairs: [{ open: '(', close: ')' }]
            }));
            return _this;
        }
        SurroundingMode._id = new modes_1.LanguageIdentifier('surroundingMode', 3);
        return SurroundingMode;
    }(mockMode_1.MockMode));
    var OnEnterMode = /** @class */ (function (_super) {
        __extends(OnEnterMode, _super);
        function OnEnterMode(indentAction, outdentCurrentLine) {
            var _this = _super.call(this, OnEnterMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                onEnterRules: [{
                        beforeText: /.*/,
                        action: {
                            indentAction: indentAction,
                            outdentCurrentLine: outdentCurrentLine
                        }
                    }]
            }));
            return _this;
        }
        OnEnterMode._id = new modes_1.LanguageIdentifier('onEnterMode', 3);
        return OnEnterMode;
    }(mockMode_1.MockMode));
    var IndentRulesMode = /** @class */ (function (_super) {
        __extends(IndentRulesMode, _super);
        function IndentRulesMode(indentationRules) {
            var _this = _super.call(this, IndentRulesMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                indentationRules: indentationRules
            }));
            return _this;
        }
        IndentRulesMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
        return IndentRulesMode;
    }(mockMode_1.MockMode));
    suite('Editor Controller - Regression tests', function () {
        test('issue Microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases', function () {
            var model = textModel_1.TextModel.createFromString([
                'Hello world!',
                'another line'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: false
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 1, 1, 13)]);
                // Check that indenting maintains the selection start at column 1
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(1, 1, 1, 14));
            });
            model.dispose();
        });
        test('Bug 9121: Auto indent + undo + redo is funky', function () {
            var model = textModel_1.TextModel.createFromString([
                ''
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: false
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n', 'assert1');
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t', 'assert2');
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\n\t', 'assert3');
                cursorCommand(cursor, H.Type, { text: 'x' });
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert4');
                coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(cursor, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert5');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\nx', 'assert6');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\tx', 'assert7');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert8');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), 'x', 'assert9');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert10');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\nx', 'assert11');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\n\tx', 'assert12');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t\nx', 'assert13');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert14');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), 'x', 'assert15');
            });
            model.dispose();
        });
        test('bug #16815:Shift+Tab doesn\'t go back to tabstop', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            var model = textModel_1.TextModel.createFromString([
                '     function baz() {'
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 1, 6, false);
                assertCursor(cursor, new selection_1.Selection(1, 6, 1, 6));
                coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    function baz() {');
                assertCursor(cursor, new selection_1.Selection(1, 5, 1, 5));
            });
            model.dispose();
            mode.dispose();
        });
        test('Bug #18293:[regression][editor] Can\'t outdent whitespace line', function () {
            var model = textModel_1.TextModel.createFromString([
                '      '
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 1, 7, false);
                assertCursor(cursor, new selection_1.Selection(1, 7, 1, 7));
                coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    ');
                assertCursor(cursor, new selection_1.Selection(1, 5, 1, 5));
            });
            model.dispose();
        });
        test('Bug #16657: [editor] Tab on empty line of zero indentation moves cursor to position (1,1)', function () {
            var model = textModel_1.TextModel.createFromString([
                'function baz() {',
                '\tfunction hello() { // something here',
                '\t',
                '',
                '\t}',
                '}',
                ''
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 7, 1, false);
                assertCursor(cursor, new selection_1.Selection(7, 1, 7, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(7), '\t');
                assertCursor(cursor, new selection_1.Selection(7, 2, 7, 2));
            });
            model.dispose();
        });
        test('bug #16740: [editor] Cut line doesn\'t quite cut the last line', function () {
            // Part 1 => there is text on the last line
            testCodeEditor_1.withTestCodeEditor([
                'asdasd',
                'qwerty'
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                moveTo(cursor, 2, 1, false);
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Cut, null, 'keyboard');
                assert.equal(model.getLineCount(), 1);
                assert.equal(model.getLineContent(1), 'asdasd');
            });
            // Part 2 => there is no text on the last line
            testCodeEditor_1.withTestCodeEditor([
                'asdasd',
                ''
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                moveTo(cursor, 2, 1, false);
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Cut, null, 'keyboard');
                assert.equal(model.getLineCount(), 1);
                assert.equal(model.getLineContent(1), 'asdasd');
                cursorCommand(cursor, H.Cut, null, 'keyboard');
                assert.equal(model.getLineCount(), 1);
                assert.equal(model.getLineContent(1), '');
            });
        });
        test('Bug #11476: Double bracket surrounding + undo is broken', function () {
            var mode = new SurroundingMode();
            usingCursor({
                text: [
                    'hello'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { tabSize: 4, insertSpaces: true, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 3, false);
                moveTo(cursor, 1, 5, true);
                assertCursor(cursor, new selection_1.Selection(1, 3, 1, 5));
                cursorCommand(cursor, H.Type, { text: '(' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(1, 4, 1, 6));
                cursorCommand(cursor, H.Type, { text: '(' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(1, 5, 1, 7));
            });
            mode.dispose();
        });
        test('issue #1140: Backspace stops prematurely', function () {
            var mode = new SurroundingMode();
            var model = textModel_1.TextModel.createFromString([
                'function baz() {',
                '  return 1;',
                '};'
            ].join('\n'), {
                tabSize: 4,
                insertSpaces: true,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 3, 2, false);
                moveTo(cursor, 1, 14, true);
                assertCursor(cursor, new selection_1.Selection(3, 2, 1, 14));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assertCursor(cursor, new selection_1.Selection(1, 14, 1, 14));
                assert.equal(model.getLineCount(), 1);
                assert.equal(model.getLineContent(1), 'function baz(;');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #10212: Pasting entire line does not replace selection', function () {
            usingCursor({
                text: [
                    'line1',
                    'line2'
                ],
            }, function (model, cursor) {
                moveTo(cursor, 2, 1, false);
                moveTo(cursor, 2, 6, true);
                cursorCommand(cursor, H.Paste, { text: 'line1\n', pasteOnNewLine: true });
                assert.equal(model.getLineContent(1), 'line1');
                assert.equal(model.getLineContent(2), 'line1');
                assert.equal(model.getLineContent(3), '');
            });
        });
        test('issue #4996: Multiple cursor paste pastes contents of all cursors', function () {
            usingCursor({
                text: [
                    'line1',
                    'line2',
                    'line3'
                ],
            }, function (model, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1)]);
                cursorCommand(cursor, H.Paste, {
                    text: 'a\nb\nc\nd',
                    pasteOnNewLine: false,
                    multicursorText: [
                        'a\nb',
                        'c\nd'
                    ]
                });
                assert.equal(model.getValue(), [
                    'a',
                    'bline1',
                    'c',
                    'dline2',
                    'line3'
                ].join('\n'));
            });
        });
        test('issue #16155: Paste into multiple cursors has edge case when number of lines equals number of cursors - 1', function () {
            usingCursor({
                text: [
                    'test',
                    'test',
                    'test',
                    'test'
                ],
            }, function (model, cursor) {
                cursor.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                ]);
                cursorCommand(cursor, H.Paste, {
                    text: 'aaa\nbbb\nccc\n',
                    pasteOnNewLine: false,
                    multicursorText: null
                });
                assert.equal(model.getValue(), [
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                ].join('\n'));
            });
        });
        test('issue #3071: Investigate why undo stack gets corrupted', function () {
            var model = textModel_1.TextModel.createFromString([
                'some lines',
                'and more lines',
                'just some text',
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 1, 1, false);
                moveTo(cursor, 3, 4, true);
                var isFirst = true;
                model.onDidChangeContent(function () {
                    if (isFirst) {
                        isFirst = false;
                        cursorCommand(cursor, H.Type, { text: '\t' }, 'keyboard');
                    }
                });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(), [
                    '\t just some text'
                ].join('\n'), '001');
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getValue(), [
                    '    some lines',
                    '    and more lines',
                    '    just some text',
                ].join('\n'), '002');
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '003');
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '004');
            });
            model.dispose();
        });
        test('issue #12950: Cannot Double Click To Insert Emoji Using OSX Emoji Panel', function () {
            usingCursor({
                text: [
                    'some lines',
                    'and more lines',
                    'just some text',
                ],
                languageIdentifier: null,
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 1, false);
                cursorCommand(cursor, H.Type, { text: '😍' }, 'keyboard');
                assert.equal(model.getValue(), [
                    'some lines',
                    'and more lines',
                    '😍just some text',
                ].join('\n'));
            });
        });
        test('issue #3463: pressing tab adds spaces, but not as many as for a tab', function () {
            var model = textModel_1.TextModel.createFromString([
                'function a() {',
                '\tvar a = {',
                '\t\tx: 3',
                '\t};',
                '}',
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 3, 2, false);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(3), '\t    \tx: 3');
            });
            model.dispose();
        });
        test('issue #4312: trying to type a tab character over a sequence of spaces results in unexpected behaviour', function () {
            var model = textModel_1.TextModel.createFromString([
                'var foo = 123;       // this is a comment',
                'var bar = 4;       // another comment'
            ].join('\n'), {
                insertSpaces: false,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 1, 15, false);
                moveTo(cursor, 1, 22, true);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), 'var foo = 123;\t// this is a comment');
            });
            model.dispose();
        });
        test('issue #832: word right', function () {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, function (model, cursor) {
                moveTo(cursor, 1, 1, false);
                function assertWordRight(col, expectedCol) {
                    var args = {
                        position: {
                            lineNumber: 1,
                            column: col
                        }
                    };
                    if (col === 1) {
                        coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(cursor, args);
                    }
                    else {
                        coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(cursor, args);
                    }
                    assert.equal(cursor.getSelection().startColumn, 1, 'TEST FOR ' + col);
                    assert.equal(cursor.getSelection().endColumn, expectedCol, 'TEST FOR ' + col);
                }
                assertWordRight(1, '   '.length + 1);
                assertWordRight(2, '   '.length + 1);
                assertWordRight(3, '   '.length + 1);
                assertWordRight(4, '   '.length + 1);
                assertWordRight(5, '   /'.length + 1);
                assertWordRight(6, '   /*'.length + 1);
                assertWordRight(7, '   /* '.length + 1);
                assertWordRight(8, '   /* Just'.length + 1);
                assertWordRight(9, '   /* Just'.length + 1);
                assertWordRight(10, '   /* Just'.length + 1);
                assertWordRight(11, '   /* Just'.length + 1);
                assertWordRight(12, '   /* Just '.length + 1);
                assertWordRight(13, '   /* Just some'.length + 1);
                assertWordRight(14, '   /* Just some'.length + 1);
                assertWordRight(15, '   /* Just some'.length + 1);
                assertWordRight(16, '   /* Just some'.length + 1);
                assertWordRight(17, '   /* Just some '.length + 1);
                assertWordRight(18, '   /* Just some  '.length + 1);
                assertWordRight(19, '   /* Just some   '.length + 1);
                assertWordRight(20, '   /* Just some   more'.length + 1);
                assertWordRight(21, '   /* Just some   more'.length + 1);
                assertWordRight(22, '   /* Just some   more'.length + 1);
                assertWordRight(23, '   /* Just some   more'.length + 1);
                assertWordRight(24, '   /* Just some   more '.length + 1);
                assertWordRight(25, '   /* Just some   more  '.length + 1);
                assertWordRight(26, '   /* Just some   more   '.length + 1);
                assertWordRight(27, '   /* Just some   more   text'.length + 1);
                assertWordRight(28, '   /* Just some   more   text'.length + 1);
                assertWordRight(29, '   /* Just some   more   text'.length + 1);
                assertWordRight(30, '   /* Just some   more   text'.length + 1);
                assertWordRight(31, '   /* Just some   more   text '.length + 1);
                assertWordRight(32, '   /* Just some   more   text a'.length + 1);
                assertWordRight(33, '   /* Just some   more   text a+'.length + 1);
                assertWordRight(34, '   /* Just some   more   text a+='.length + 1);
                assertWordRight(35, '   /* Just some   more   text a+= '.length + 1);
                assertWordRight(36, '   /* Just some   more   text a+= 3'.length + 1);
                assertWordRight(37, '   /* Just some   more   text a+= 3 '.length + 1);
                assertWordRight(38, '   /* Just some   more   text a+= 3 +'.length + 1);
                assertWordRight(39, '   /* Just some   more   text a+= 3 +5'.length + 1);
                assertWordRight(40, '   /* Just some   more   text a+= 3 +5-'.length + 1);
                assertWordRight(41, '   /* Just some   more   text a+= 3 +5-3'.length + 1);
                assertWordRight(42, '   /* Just some   more   text a+= 3 +5-3 '.length + 1);
                assertWordRight(43, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1);
                assertWordRight(44, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1);
                assertWordRight(45, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1);
                assertWordRight(46, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1);
                assertWordRight(47, '   /* Just some   more   text a+= 3 +5-3 + 7 *'.length + 1);
                assertWordRight(48, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1);
                assertWordRight(49, '   /* Just some   more   text a+= 3 +5-3 + 7 */ '.length + 1);
                assertWordRight(50, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1);
            });
        });
        test('issue #33788: Wrong cursor position when double click to select a word', function () {
            var model = textModel_1.TextModel.createFromString([
                'Just some text'
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(cursor, { position: new position_1.Position(1, 8) });
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(1, 6, 1, 10));
                coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(cursor, { position: new position_1.Position(1, 8) });
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(1, 6, 1, 10));
            });
            model.dispose();
        });
        test('issue #9675: Undo/Redo adds a stop in between CHN Characters', function () {
            usingCursor({
                text: []
            }, function (model, cursor) {
                assertCursor(cursor, new position_1.Position(1, 1));
                // Typing sennsei in Japanese - Hiragana
                cursorCommand(cursor, H.Type, { text: 'ｓ' }, 'keyboard');
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せ', replaceCharCnt: 1 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せｎ', replaceCharCnt: 1 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せん', replaceCharCnt: 2 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんｓ', replaceCharCnt: 2 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせ', replaceCharCnt: 3 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせ', replaceCharCnt: 3 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせい', replaceCharCnt: 3 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせい', replaceCharCnt: 4 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせい', replaceCharCnt: 4 });
                cursorCommand(cursor, H.ReplacePreviousChar, { text: 'せんせい', replaceCharCnt: 4 });
                assert.equal(model.getLineContent(1), 'せんせい');
                assertCursor(cursor, new position_1.Position(1, 5));
                cursorCommand(cursor, H.Undo);
                assert.equal(model.getLineContent(1), '');
                assertCursor(cursor, new position_1.Position(1, 1));
            });
        });
        test('issue #23913: Greater than 1000+ multi cursor typing replacement text appears inverted, lines begin to drop off selection', function () {
            this.timeout(10000);
            var LINE_CNT = 2000;
            var text = [];
            for (var i = 0; i < LINE_CNT; i++) {
                text[i] = 'asd';
            }
            usingCursor({
                text: text
            }, function (model, cursor) {
                var selections = [];
                for (var i = 0; i < LINE_CNT; i++) {
                    selections[i] = new selection_1.Selection(i + 1, 1, i + 1, 1);
                }
                cursor.setSelections('test', selections);
                cursorCommand(cursor, H.Type, { text: 'n' }, 'keyboard');
                cursorCommand(cursor, H.Type, { text: 'n' }, 'keyboard');
                for (var i = 0; i < LINE_CNT; i++) {
                    assert.equal(model.getLineContent(i + 1), 'nnasd', 'line #' + (i + 1));
                }
                assert.equal(cursor.getSelections().length, LINE_CNT);
                assert.equal(cursor.getSelections()[LINE_CNT - 1].startLineNumber, LINE_CNT);
            });
        });
        test('issue #23983: Calling model.setEOL does not reset cursor position', function () {
            usingCursor({
                text: [
                    'first line',
                    'second line'
                ]
            }, function (model, cursor) {
                model.setEOL(model_1.EndOfLineSequence.CRLF);
                cursor.setSelections('test', [new selection_1.Selection(2, 2, 2, 2)]);
                model.setEOL(model_1.EndOfLineSequence.LF);
                assertCursor(cursor, new selection_1.Selection(2, 2, 2, 2));
            });
        });
        test('issue #23983: Calling model.setValue() resets cursor position', function () {
            usingCursor({
                text: [
                    'first line',
                    'second line'
                ]
            }, function (model, cursor) {
                model.setEOL(model_1.EndOfLineSequence.CRLF);
                cursor.setSelections('test', [new selection_1.Selection(2, 2, 2, 2)]);
                model.setValue([
                    'different first line',
                    'different second line',
                    'new third line'
                ].join('\n'));
                assertCursor(cursor, new selection_1.Selection(1, 1, 1, 1));
            });
        });
        test('issue #36740: wordwrap creates an extra step / character at the wrapping point', function () {
            // a single model line => 4 view lines
            testCodeEditor_1.withTestCodeEditor([
                [
                    'Lorem ipsum ',
                    'dolor sit amet ',
                    'consectetur ',
                    'adipiscing elit',
                ].join('')
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 16 }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 7, 1, 7)]);
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 9, 1, 9));
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 10, 1, 10));
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 11, 1, 11));
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 13, 1, 13));
                // moving to view line 2
                moveRight(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 14, 1, 14));
                moveLeft(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 13, 1, 13));
                // moving back to view line 1
                moveLeft(cursor);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
            });
        });
        test('issue #41573 - delete across multiple lines does not shrink the selection when word wraps', function () {
            var model = textModel_1.TextModel.createFromString([
                'Authorization: \'Bearer pHKRfCTFSnGxs6akKlb9ddIXcca0sIUSZJutPHYqz7vEeHdMTMh0SGN0IGU3a0n59DXjTLRsj5EJ2u33qLNIFi9fk5XF8pK39PndLYUZhPt4QvHGLScgSkK0L4gwzkzMloTQPpKhqiikiIOvyNNSpd2o8j29NnOmdTUOKi9DVt74PD2ohKxyOrWZ6oZprTkb3eKajcpnS0LABKfaw2rmv4\','
            ].join('\n'));
            var config = new testConfiguration_1.TestConfiguration({
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 100
            });
            var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
            var cursor = new cursor_1.Cursor(config, model, viewModel);
            console.log(viewModel.getLineCount());
            moveTo(cursor, 1, 43, false);
            moveTo(cursor, 1, 147, true);
            assertCursor(cursor, new selection_1.Selection(1, 43, 1, 147));
            model.applyEdits([{
                    range: new range_1.Range(1, 1, 1, 43),
                    text: ''
                }]);
            assertCursor(cursor, new selection_1.Selection(1, 1, 1, 105));
            cursor.dispose();
            viewModel.dispose();
            config.dispose();
            model.dispose();
        });
    });
    suite('Editor Controller - Cursor Configuration', function () {
        test('Cursor honors insertSpaces configuration on new line', function () {
            usingCursor({
                text: [
                    '    \tMy First Line\t ',
                    '\tMy Second Line',
                    '    Third Line',
                    '',
                    '1'
                ],
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(1, 21), source: 'keyboard' });
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    \tMy First Line\t ');
                assert.equal(model.getLineContent(2), '        ');
            });
        });
        test('Cursor honors insertSpaces configuration on tab', function () {
            var model = textModel_1.TextModel.createFromString([
                '    \tMy First Line\t ',
                'My Second Line123',
                '    Third Line',
                '',
                '1'
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 13,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                // Tab on column 1
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 1) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '             My Second Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 2
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 2) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'M            y Second Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 3
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 3) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My            Second Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 4
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 4) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My           Second Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 5
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 5) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My S         econd Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 5
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 5) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My S         econd Line123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 13
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 13) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My Second Li ne123');
                cursorCommand(cursor, H.Undo, null, 'keyboard');
                // Tab on column 14
                assert.equal(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(cursor, { position: new position_1.Position(2, 14) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'My Second Lin             e123');
            });
            model.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 1', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.Indent);
            usingCursor({
                text: [
                    '\thello'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                assertCursor(cursor, new selection_1.Selection(1, 7, 1, 7));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.CRLF), '\thello\r\n        ');
            });
            mode.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 2', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.None);
            usingCursor({
                text: [
                    '\thello'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                assertCursor(cursor, new selection_1.Selection(1, 7, 1, 7));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.CRLF), '\thello\r\n    ');
            });
            mode.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 3', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            usingCursor({
                text: [
                    '\thell()'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 7, false);
                assertCursor(cursor, new selection_1.Selection(1, 7, 1, 7));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.CRLF), '\thell(\r\n        \r\n    )');
            });
            mode.dispose();
        });
        test('removeAutoWhitespace off', function () {
            usingCursor({
                text: [
                    '    some  line abc  '
                ],
                modelOpts: {
                    insertSpaces: true,
                    tabSize: 4,
                    detectIndentation: false,
                    defaultEOL: model_1.DefaultEndOfLine.LF,
                    trimAutoWhitespace: false
                }
            }, function (model, cursor) {
                // Move cursor to the end, verify that we do not trim whitespaces if line has values
                moveTo(cursor, 1, model.getLineContent(1).length + 1);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '    ');
                // Try to enter again, we should trimmed previous line
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '    ');
                assert.equal(model.getLineContent(3), '    ');
            });
        });
        test('removeAutoWhitespace on: removes only whitespace the cursor added 1', function () {
            usingCursor({
                text: [
                    '    '
                ],
                modelOpts: {
                    insertSpaces: true,
                    tabSize: 4,
                    detectIndentation: false,
                    defaultEOL: model_1.DefaultEndOfLine.LF,
                    trimAutoWhitespace: true
                }
            }, function (model, cursor) {
                moveTo(cursor, 1, model.getLineContent(1).length + 1);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    ');
                assert.equal(model.getLineContent(2), '    ');
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    ');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), '    ');
            });
        });
        test('issue #6862: Editor removes auto inserted indentation when formatting on type', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            usingCursor({
                text: [
                    'function foo (params: string) {}'
                ],
                modelOpts: {
                    insertSpaces: true,
                    tabSize: 4,
                    detectIndentation: false,
                    defaultEOL: model_1.DefaultEndOfLine.LF,
                    trimAutoWhitespace: true
                },
                languageIdentifier: mode.getLanguageIdentifier(),
            }, function (model, cursor) {
                moveTo(cursor, 1, 32);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), 'function foo (params: string) {');
                assert.equal(model.getLineContent(2), '    ');
                assert.equal(model.getLineContent(3), '}');
                var TestCommand = /** @class */ (function () {
                    function TestCommand() {
                        this._selectionId = null;
                    }
                    TestCommand.prototype.getEditOperations = function (model, builder) {
                        builder.addEditOperation(new range_1.Range(1, 13, 1, 14), '');
                        this._selectionId = builder.trackSelection(cursor.getSelection());
                    };
                    TestCommand.prototype.computeCursorState = function (model, helper) {
                        return helper.getTrackedSelection(this._selectionId);
                    };
                    return TestCommand;
                }());
                cursor.trigger('autoFormat', editorCommon_1.Handler.ExecuteCommand, new TestCommand());
                assert.equal(model.getLineContent(1), 'function foo(params: string) {');
                assert.equal(model.getLineContent(2), '    ');
                assert.equal(model.getLineContent(3), '}');
            });
            mode.dispose();
        });
        test('removeAutoWhitespace on: removes only whitespace the cursor added 2', function () {
            var model = textModel_1.TextModel.createFromString([
                '    if (a) {',
                '        ',
                '',
                '',
                '    }'
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 3, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    if (a) {');
                assert.equal(model.getLineContent(2), '        ');
                assert.equal(model.getLineContent(3), '    ');
                assert.equal(model.getLineContent(4), '');
                assert.equal(model.getLineContent(5), '    }');
                moveTo(cursor, 4, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    if (a) {');
                assert.equal(model.getLineContent(2), '        ');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), '    ');
                assert.equal(model.getLineContent(5), '    }');
                moveTo(cursor, 5, model.getLineMaxColumn(5));
                cursorCommand(cursor, H.Type, { text: 'something' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    if (a) {');
                assert.equal(model.getLineContent(2), '        ');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), '');
                assert.equal(model.getLineContent(5), '    }something');
            });
            model.dispose();
        });
        test('removeAutoWhitespace on: test 1', function () {
            var model = textModel_1.TextModel.createFromString([
                '    some  line abc  '
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                // Move cursor to the end, verify that we do not trim whitespaces if line has values
                moveTo(cursor, 1, model.getLineContent(1).length + 1);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '    ');
                // Try to enter again, we should trimmed previous line
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), '    ');
                // More whitespaces
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), '        ');
                // Enter and verify that trimmed again
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    some  line abc  ');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), '        ');
                // Trimmed if we will keep only text
                moveTo(cursor, 1, 5);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    ');
                assert.equal(model.getLineContent(2), '    some  line abc  ');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), '');
                assert.equal(model.getLineContent(5), '');
                // Trimmed if we will keep only text by selection
                moveTo(cursor, 2, 5);
                moveTo(cursor, 3, 1, true);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(1), '    ');
                assert.equal(model.getLineContent(2), '    ');
                assert.equal(model.getLineContent(3), '    ');
                assert.equal(model.getLineContent(4), '');
                assert.equal(model.getLineContent(5), '');
            });
            model.dispose();
        });
        test('UseTabStops is off', function () {
            var model = textModel_1.TextModel.createFromString([
                '    x',
                '        a    ',
                '    '
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model, useTabStops: false }, function (editor, cursor) {
                // DeleteLeft removes just one whitespace
                moveTo(cursor, 2, 9);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '       a    ');
            });
            model.dispose();
        });
        test('Backspace removes whitespaces with tab size', function () {
            var model = textModel_1.TextModel.createFromString([
                ' \t \t     x',
                '        a    ',
                '    '
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model, useTabStops: true }, function (editor, cursor) {
                // DeleteLeft does not remove tab size, because some text exists before
                moveTo(cursor, 2, model.getLineContent(2).length + 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '        a   ');
                // DeleteLeft removes tab size = 4
                moveTo(cursor, 2, 9);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '    a   ');
                // DeleteLeft removes tab size = 4
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'a   ');
                // Undo DeleteLeft - get us back to original indentation
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), '        a   ');
                // Nothing is broken when cursor is in (1,1)
                moveTo(cursor, 1, 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), ' \t \t     x');
                // DeleteLeft stops at tab stops even in mixed whitespace case
                moveTo(cursor, 1, 10);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), ' \t \t    x');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), ' \t \tx');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), ' \tx');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), 'x');
                // DeleteLeft on last line
                moveTo(cursor, 3, model.getLineContent(3).length + 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(3), '');
                // DeleteLeft with removing new line symbol
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), 'x\n        a   ');
                // In case of selection DeleteLeft only deletes selected text
                moveTo(cursor, 2, 3);
                moveTo(cursor, 2, 4, true);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '       a   ');
            });
            model.dispose();
        });
        test('PR #5423: Auto indent + undo + redo is funky', function () {
            var model = textModel_1.TextModel.createFromString([
                ''
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n', 'assert1');
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\t', 'assert2');
                cursorCommand(cursor, H.Type, { text: 'y' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty', 'assert2');
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\n\t', 'assert3');
                cursorCommand(cursor, H.Type, { text: 'x' });
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\n\tx', 'assert4');
                coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(cursor, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\n\tx', 'assert5');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\nx', 'assert6');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\tyx', 'assert7');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\tx', 'assert8');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert9');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), 'x', 'assert10');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert11');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\nx', 'assert12');
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\n\tx', 'assert13');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\n\ty\nx', 'assert14');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), '\nx', 'assert15');
                cursorCommand(cursor, H.Redo, {});
                assert.equal(model.getValue(model_1.EndOfLinePreference.LF), 'x', 'assert16');
            });
            model.dispose();
        });
    });
    suite('Editor Controller - Indentation Rules', function () {
        var mode = new IndentRulesMode({
            decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
            unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
        });
        test('Enter honors increaseIndentPattern', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 12, false);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                cursorCommandAndTokenize(model, cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 2, 2, 2));
                moveTo(cursor, 3, 13, false);
                assertCursor(cursor, new selection_1.Selection(3, 13, 3, 13));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Type honors decreaseIndentPattern', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 2, 2, false);
                assertCursor(cursor, new selection_1.Selection(2, 2, 2, 2));
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 2, 2, 2));
                assert.equal(model.getLineContent(2), '}', '001');
            });
        });
        test('Enter honors unIndentedLinePattern', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t\t\treturn true'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 2, 15, false);
                assertCursor(cursor, new selection_1.Selection(2, 15, 2, 15));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(3, 2, 3, 2));
            });
        });
        test('Enter honors indentNextLinePattern', function () {
            usingCursor({
                text: [
                    'if (true)',
                    '\treturn true;',
                    'if (true)',
                    '\t\t\t\treturn true'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 2, 14, false);
                assertCursor(cursor, new selection_1.Selection(2, 14, 2, 14));
                cursorCommandAndTokenize(model, cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(3, 1, 3, 1));
                moveTo(cursor, 5, 16, false);
                assertCursor(cursor, new selection_1.Selection(5, 16, 5, 16));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(6, 2, 6, 2));
            });
        });
        test('Enter honors indentNextLinePattern 2', function () {
            var model = textModel_1.TextModel.createFromString([
                'if (true)',
                '\tif (true)'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model, autoIndent: true }, function (editor, cursor) {
                moveTo(cursor, 2, 11, false);
                assertCursor(cursor, new selection_1.Selection(2, 11, 2, 11));
                cursorCommandAndTokenize(model, cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(3, 3, 3, 3));
                cursorCommand(cursor, H.Type, { text: 'console.log();' }, 'keyboard');
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
            });
            model.dispose();
        });
        test('Enter honors intential indent', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    'return true;',
                    '}}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 13, false);
                assertCursor(cursor, new selection_1.Selection(3, 13, 3, 13));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
                assert.equal(model.getLineContent(3), 'return true;', '001');
            });
        });
        test('Enter supports selection 1', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 4, 3, false);
                moveTo(cursor, 4, 4, true);
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 4));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(5, 1, 5, 1));
                assert.equal(model.getLineContent(4), '\t}', '001');
            });
        });
        test('Enter supports selection 2', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 2, 12, false);
                moveTo(cursor, 2, 13, true);
                assertCursor(cursor, new selection_1.Selection(2, 12, 2, 13));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(3, 3, 3, 3));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Enter honors tabSize and insertSpaces 1', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 12, false);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 5, 2, 5));
                model.forceTokenization(model.getLineCount());
                moveTo(cursor, 3, 13, false);
                assertCursor(cursor, new selection_1.Selection(3, 13, 3, 13));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 9, 4, 9));
            });
        });
        test('Enter honors tabSize and insertSpaces 2', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '    if (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 12, false);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                cursorCommandAndTokenize(model, cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 5, 2, 5));
                moveTo(cursor, 3, 16, false);
                assertCursor(cursor, new selection_1.Selection(3, 16, 3, 16));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(3), '    if (true) {');
                assertCursor(cursor, new selection_1.Selection(4, 9, 4, 9));
            });
        });
        test('Enter honors tabSize and insertSpaces 3', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '    if (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 1, 12, false);
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                cursorCommandAndTokenize(model, cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 2, 2, 2));
                moveTo(cursor, 3, 16, false);
                assertCursor(cursor, new selection_1.Selection(3, 16, 3, 16));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(3), '    if (true) {');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Enter supports intentional indentation', function () {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tswitch(true) {',
                    '\t\t\tcase true:',
                    '\t\t\t\tbreak;',
                    '\t\t}',
                    '\t}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 5, 4, false);
                assertCursor(cursor, new selection_1.Selection(5, 4, 5, 4));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(5), '\t\t}');
                assertCursor(cursor, new selection_1.Selection(6, 3, 6, 3));
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 1', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 9, false);
                assertCursor(cursor, new selection_1.Selection(3, 9, 3, 9));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
                assert.equal(model.getLineContent(4), '\t\t true;', '001');
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 2', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 3, false);
                assertCursor(cursor, new selection_1.Selection(3, 3, 3, 3));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
                assert.equal(model.getLineContent(4), '\t\treturn true;', '001');
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 3', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '  }a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 2, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 11, false);
                assertCursor(cursor, new selection_1.Selection(3, 11, 3, 11));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 5, 4, 5));
                assert.equal(model.getLineContent(4), '     true;', '001');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 1', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 2, false);
                assertCursor(cursor, new selection_1.Selection(3, 2, 3, 2));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 2, 4, 2));
                assert.equal(model.getLineContent(4), '\t\treturn true;', '001');
                moveTo(cursor, 4, 1, false);
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(5, 1, 5, 1));
                assert.equal(model.getLineContent(5), '\t\treturn true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 2', function () {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tif (true) {',
                    '\t    \treturn true;',
                    '\t\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 4, false);
                assertCursor(cursor, new selection_1.Selection(3, 4, 3, 4));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
                assert.equal(model.getLineContent(4), '\t\t\treturn true;', '001');
                moveTo(cursor, 4, 1, false);
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(5, 1, 5, 1));
                assert.equal(model.getLineContent(5), '\t\t\treturn true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 3', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 2, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 2, false);
                assertCursor(cursor, new selection_1.Selection(3, 2, 3, 2));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 2, 4, 2));
                assert.equal(model.getLineContent(4), '    return true;', '001');
                moveTo(cursor, 4, 3, false);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(5, 3, 5, 3));
                assert.equal(model.getLineContent(5), '    return true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 4', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '\t  return true;',
                    '}a}',
                    '',
                    'if (true) {',
                    '  if (true) {',
                    '\t  return true;',
                    '}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 2, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 3, false);
                assertCursor(cursor, new selection_1.Selection(3, 3, 3, 3));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 4, 4, 4));
                assert.equal(model.getLineContent(4), '    return true;', '001');
                moveTo(cursor, 9, 4, false);
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(10, 5, 10, 5));
                assert.equal(model.getLineContent(10), '    return true;', '001');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 5', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '    return true;',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: true, tabSize: 2, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 5, false);
                moveTo(cursor, 4, 3, true);
                assertCursor(cursor, new selection_1.Selection(3, 5, 4, 3));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
                assert.equal(model.getLineContent(4), '    return true;', '001');
            });
        });
        test('issue Microsoft/monaco-editor#108 part 1/2: Auto indentation on Enter with selection is half broken', function () {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tvar x = 1;',
                    '\t\t\t\t\t\t\treturn x;',
                    '}'
                ],
                modelOpts: {
                    defaultEOL: model_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4,
                    trimAutoWhitespace: true
                },
                languageIdentifier: mode.getLanguageIdentifier(),
            }, function (model, cursor) {
                moveTo(cursor, 3, 8, false);
                moveTo(cursor, 2, 12, true);
                assertCursor(cursor, new selection_1.Selection(3, 8, 2, 12));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(3), '\treturn x;');
                assertCursor(cursor, new position_1.Position(3, 2));
            });
        });
        test('issue Microsoft/monaco-editor#108 part 2/2: Auto indentation on Enter with selection is half broken', function () {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tvar x = 1;',
                    '\t\t\t\t\t\t\treturn x;',
                    '}'
                ],
                modelOpts: {
                    defaultEOL: model_1.DefaultEndOfLine.LF,
                    detectIndentation: false,
                    insertSpaces: false,
                    tabSize: 4,
                    trimAutoWhitespace: true
                },
                languageIdentifier: mode.getLanguageIdentifier(),
            }, function (model, cursor) {
                moveTo(cursor, 2, 12, false);
                moveTo(cursor, 3, 8, true);
                assertCursor(cursor, new selection_1.Selection(2, 12, 3, 8));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(3), '\treturn x;');
                assertCursor(cursor, new position_1.Position(3, 2));
            });
        });
        test('onEnter works if there are no indentation rules', function () {
            usingCursor({
                text: [
                    '<?',
                    '\tif (true) {',
                    '\t\techo $hi;',
                    '\t\techo $bye;',
                    '\t}',
                    '?>'
                ],
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 5, 3, false);
                assertCursor(cursor, new selection_1.Selection(5, 3, 5, 3));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getLineContent(6), '\t');
                assertCursor(cursor, new selection_1.Selection(6, 2, 6, 2));
                assert.equal(model.getLineContent(5), '\t}');
            });
        });
        test('onEnter works if there are no indentation rules 2', function () {
            usingCursor({
                text: [
                    '	if (5)',
                    '		return 5;',
                    '	'
                ],
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 2, false);
                assertCursor(cursor, new selection_1.Selection(3, 2, 3, 2));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(4, 2, 4, 2));
                assert.equal(model.getLineContent(4), '\t');
            });
        });
        test('bug #16543: Tab should indent to correct indentation spot immediately', function () {
            var model = textModel_1.TextModel.createFromString([
                'function baz() {',
                '\tfunction hello() { // something here',
                '\t',
                '',
                '\t}',
                '}'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 4, 1, false);
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(4), '\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (1): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', function () {
            var model = textModel_1.TextModel.createFromString([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 4, 2, false);
                assertCursor(cursor, new selection_1.Selection(4, 2, 4, 2));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(4), '\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (2): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', function () {
            var model = textModel_1.TextModel.createFromString([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '    ',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 4, 1, false);
                assertCursor(cursor, new selection_1.Selection(4, 1, 4, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(4), '\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (3): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', function () {
            var model = textModel_1.TextModel.createFromString([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t\t\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 4, 3, false);
                assertCursor(cursor, new selection_1.Selection(4, 3, 4, 3));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(4), '\t\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (4): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', function () {
            var model = textModel_1.TextModel.createFromString([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t\t\t\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 4, 4, false);
                assertCursor(cursor, new selection_1.Selection(4, 4, 4, 4));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(4), '\t\t\t\t\t');
            });
            model.dispose();
        });
        test('bug #31015: When pressing Tab on lines and Enter rules are avail, indent straight to the right spotTab', function () {
            var mode = new OnEnterMode(languageConfiguration_1.IndentAction.Indent);
            var model = textModel_1.TextModel.createFromString([
                '    if (a) {',
                '        ',
                '',
                '',
                '    }'
            ].join('\n'), {
                insertSpaces: true,
                tabSize: 4,
                detectIndentation: false,
                defaultEOL: model_1.DefaultEndOfLine.LF,
                trimAutoWhitespace: true
            }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                moveTo(cursor, 3, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '    if (a) {');
                assert.equal(model.getLineContent(2), '        ');
                assert.equal(model.getLineContent(3), '        ');
                assert.equal(model.getLineContent(4), '');
                assert.equal(model.getLineContent(5), '    }');
            });
            model.dispose();
        });
        test('type honors indentation rules: ruby keywords', function () {
            var rubyMode = new IndentRulesMode({
                increaseIndentPattern: /^\s*((begin|class|def|else|elsif|ensure|for|if|module|rescue|unless|until|when|while)|(.*\sdo\b))\b[^\{;]*$/,
                decreaseIndentPattern: /^\s*([}\]]([,)]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b)/
            });
            var model = textModel_1.TextModel.createFromString([
                'class Greeter',
                '  def initialize(name)',
                '    @name = name',
                '    en'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: true,
                tabSize: 2,
                trimAutoWhitespace: true
            }, rubyMode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model, autoIndent: true }, function (editor, cursor) {
                moveTo(cursor, 4, 7, false);
                assertCursor(cursor, new selection_1.Selection(4, 7, 4, 7));
                cursorCommand(cursor, H.Type, { text: 'd' }, 'keyboard');
                assert.equal(model.getLineContent(4), '  end');
            });
            rubyMode.dispose();
            model.dispose();
        });
        test('Auto indent on type: increaseIndentPattern has higher priority than decreaseIndent when inheriting', function () {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tconsole.log();',
                    '\t} else if {',
                    '\t\tconsole.log()',
                    '\t}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 5, 3, false);
                assertCursor(cursor, new selection_1.Selection(5, 3, 5, 3));
                cursorCommand(cursor, H.Type, { text: 'e' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(5, 4, 5, 4));
                assert.equal(model.getLineContent(5), '\t}e', 'This line should not decrease indent');
            });
        });
        test('type honors users indentation adjustment', function () {
            usingCursor({
                text: [
                    '\tif (true ||',
                    '\t ) {',
                    '\t}',
                    'if (true ||',
                    ') {',
                    '}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true }
            }, function (model, cursor) {
                moveTo(cursor, 2, 3, false);
                assertCursor(cursor, new selection_1.Selection(2, 3, 2, 3));
                cursorCommand(cursor, H.Type, { text: ' ' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(2, 4, 2, 4));
                assert.equal(model.getLineContent(2), '\t  ) {', 'This line should not decrease indent');
            });
        });
        test('bug 29972: if a line is line comment, open bracket should not indent next line', function () {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t// {',
                    '\t\t'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false, tabSize: 4, detectIndentation: false, defaultEOL: model_1.DefaultEndOfLine.LF, trimAutoWhitespace: true },
                editorOpts: { autoIndent: true }
            }, function (model, cursor) {
                moveTo(cursor, 3, 3, false);
                assertCursor(cursor, new selection_1.Selection(3, 3, 3, 3));
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assertCursor(cursor, new selection_1.Selection(3, 2, 3, 2));
                assert.equal(model.getLineContent(3), '}');
            });
        });
        test('issue #36090: JS: editor.autoIndent seems to be broken', function () {
            var JSMode = /** @class */ (function (_super) {
                __extends(JSMode, _super);
                function JSMode() {
                    var _this = _super.call(this, JSMode._id) || this;
                    _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                        brackets: [
                            ['{', '}'],
                            ['[', ']'],
                            ['(', ')']
                        ],
                        indentationRules: {
                            // ^(.*\*/)?\s*\}.*$
                            decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\]\)].*$/,
                            // ^.*\{[^}"']*$
                            increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/
                        },
                        onEnterRules: [
                            {
                                // e.g. /** | */
                                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                                afterText: /^\s*\*\/$/,
                                action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
                            }, {
                                // e.g. /** ...|
                                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                                action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
                            }, {
                                // e.g.  * ...|
                                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                                action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
                            }, {
                                // e.g.  */|
                                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                                action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                            },
                            {
                                // e.g.  *-----*/|
                                beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                                action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
                            }
                        ]
                    }));
                    return _this;
                }
                JSMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
                return JSMode;
            }(mockMode_1.MockMode));
            var mode = new JSMode();
            var model = textModel_1.TextModel.createFromString([
                'class ItemCtrl {',
                '    getPropertiesByItemId(id) {',
                '        return this.fetchItem(id)',
                '            .then(item => {',
                '                return this.getPropertiesOfItem(item);',
                '            });',
                '    }',
                '}',
            ].join('\n'), undefined, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model, autoIndent: false }, function (editor, cursor) {
                moveTo(cursor, 7, 6, false);
                assertCursor(cursor, new selection_1.Selection(7, 6, 7, 6));
                cursorCommand(cursor, H.Type, { text: '\n' }, 'keyboard');
                assert.equal(model.getValue(), [
                    'class ItemCtrl {',
                    '    getPropertiesByItemId(id) {',
                    '        return this.fetchItem(id)',
                    '            .then(item => {',
                    '                return this.getPropertiesOfItem(item);',
                    '            });',
                    '    }',
                    '    ',
                    '}',
                ].join('\n'));
                assertCursor(cursor, new selection_1.Selection(8, 5, 8, 5));
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #38261: TAB key results in bizarre indentation in C++ mode ', function () {
            var CppMode = /** @class */ (function (_super) {
                __extends(CppMode, _super);
                function CppMode() {
                    var _this = _super.call(this, CppMode._id) || this;
                    _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                        brackets: [
                            ['{', '}'],
                            ['[', ']'],
                            ['(', ')']
                        ],
                        indentationRules: {
                            increaseIndentPattern: new RegExp('^.*\\{[^}\"\\\']*$|^.*\\([^\\)\"\\\']*$|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$|^\\s*\\{\\}$'),
                            decreaseIndentPattern: new RegExp('^\\s*(\\s*/[*].*[*]/\\s*)*\\}|^\\s*(\\s*/[*].*[*]/\\s*)*\\)|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$'),
                        }
                    }));
                    return _this;
                }
                CppMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
                return CppMode;
            }(mockMode_1.MockMode));
            var mode = new CppMode();
            var model = textModel_1.TextModel.createFromString([
                'int main() {',
                '  return 0;',
                '}',
                '',
                'bool Foo::bar(const string &a,',
                '              const string &b) {',
                '  foo();',
                '',
                ')',
            ].join('\n'), { insertSpaces: true, detectIndentation: false, tabSize: 2, trimAutoWhitespace: false, defaultEOL: model_1.DefaultEndOfLine.LF }, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model, autoIndent: false }, function (editor, cursor) {
                moveTo(cursor, 8, 1, false);
                assertCursor(cursor, new selection_1.Selection(8, 1, 8, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(), [
                    'int main() {',
                    '  return 0;',
                    '}',
                    '',
                    'bool Foo::bar(const string &a,',
                    '              const string &b) {',
                    '  foo();',
                    '  ',
                    ')',
                ].join('\n'));
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(8, 3, 8, 3));
            });
            model.dispose();
            mode.dispose();
        });
    });
    function usingCursor(opts, callback) {
        var model = textModel_1.TextModel.createFromString(opts.text.join('\n'), opts.modelOpts, opts.languageIdentifier);
        model.forceTokenization(model.getLineCount());
        var config = new testConfiguration_1.TestConfiguration(opts.editorOpts);
        var viewModel = new viewModelImpl_1.ViewModel(0, config, model, null);
        var cursor = new cursor_1.Cursor(config, model, viewModel);
        callback(model, cursor);
        cursor.dispose();
        viewModel.dispose();
        config.dispose();
        model.dispose();
    }
    var ElectricCharMode = /** @class */ (function (_super) {
        __extends(ElectricCharMode, _super);
        function ElectricCharMode() {
            var _this = _super.call(this, ElectricCharMode._id) || this;
            _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                __electricCharacterSupport: {
                    docComment: { open: '/**', close: ' */' }
                },
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ]
            }));
            return _this;
        }
        ElectricCharMode._id = new modes_1.LanguageIdentifier('electricCharMode', 3);
        return ElectricCharMode;
    }(mockMode_1.MockMode));
    suite('ElectricCharacter', function () {
        test('does nothing if no electric char', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 1);
                cursorCommand(cursor, H.Type, { text: '*' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '*');
            });
            mode.dispose();
        });
        test('indents in order to match bracket', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 1);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('unindents in order to match bracket', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 5);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('matches with correct bracket', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    if (b) {',
                    '    }',
                    '    '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 4, 1);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(4), '  }    ');
            });
            mode.dispose();
        });
        test('does nothing if bracket does not match', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    if (b) {',
                    '    }',
                    '  }  '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 4, 6);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(4), '  }  }');
            });
            mode.dispose();
        });
        test('matches bracket even in line with content', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '// hello'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 1);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  }// hello');
            });
            mode.dispose();
        });
        test('is no-op if bracket is lined up', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '  '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 3);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('is no-op if there is non-whitespace text before', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    'a'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 2);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), 'a}');
            });
            mode.dispose();
        });
        test('is no-op if pairs are all matched before', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    'foo(() => {',
                    '  ( 1 + 2 ) ',
                    '})'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 13);
                cursorCommand(cursor, H.Type, { text: '*' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  ( 1 + 2 ) *');
            });
            mode.dispose();
        });
        test('is no-op if matching bracket is on the same line', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '(div',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 1, 5);
                var changeText = null;
                model.onDidChangeContent(function (e) {
                    changeText = e.changes[0].text;
                });
                cursorCommand(cursor, H.Type, { text: ')' }, 'keyboard');
                assert.deepEqual(model.getLineContent(1), '(div)');
                assert.deepEqual(changeText, ')');
            });
            mode.dispose();
        });
        test('is no-op if the line has other content', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    'Math.max(',
                    '\t2',
                    '\t3'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 3, 3);
                cursorCommand(cursor, H.Type, { text: ')' }, 'keyboard');
                assert.deepEqual(model.getLineContent(3), '\t3)');
            });
            mode.dispose();
        });
        test('appends text', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '/*'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 3);
                cursorCommand(cursor, H.Type, { text: '*' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '/** */');
            });
            mode.dispose();
        });
        test('appends text 2', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '  /*'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 5);
                cursorCommand(cursor, H.Type, { text: '*' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '  /** */');
            });
            mode.dispose();
        });
        test('issue #23711: Replacing selected text with )]} fails to delete old text with backwards-dragged selection', function () {
            var mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '{',
                    'word'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                moveTo(cursor, 2, 5);
                moveTo(cursor, 2, 1, true);
                cursorCommand(cursor, H.Type, { text: '}' }, 'keyboard');
                assert.deepEqual(model.getLineContent(2), '}');
            });
            mode.dispose();
        });
    });
    suite('autoClosingPairs', function () {
        var AutoClosingMode = /** @class */ (function (_super) {
            __extends(AutoClosingMode, _super);
            function AutoClosingMode() {
                var _this = _super.call(this, AutoClosingMode._id) || this;
                _this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(_this.getLanguageIdentifier(), {
                    autoClosingPairs: [
                        { open: '{', close: '}' },
                        { open: '[', close: ']' },
                        { open: '(', close: ')' },
                        { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                        { open: '\"', close: '\"', notIn: ['string'] },
                        { open: '`', close: '`', notIn: ['string', 'comment'] },
                        { open: '/**', close: ' */', notIn: ['string'] }
                    ],
                }));
                return _this;
            }
            AutoClosingMode._id = new modes_1.LanguageIdentifier('autoClosingMode', 5);
            return AutoClosingMode;
        }(mockMode_1.MockMode));
        var ColumnType;
        (function (ColumnType) {
            ColumnType[ColumnType["Normal"] = 0] = "Normal";
            ColumnType[ColumnType["Special1"] = 1] = "Special1";
            ColumnType[ColumnType["Special2"] = 2] = "Special2";
        })(ColumnType || (ColumnType = {}));
        function extractSpecialColumns(maxColumn, annotatedLine) {
            var result = [];
            for (var j = 1; j <= maxColumn; j++) {
                result[j] = 0 /* Normal */;
            }
            var column = 1;
            for (var j = 0; j < annotatedLine.length; j++) {
                if (annotatedLine.charAt(j) === '|') {
                    result[column] = 1 /* Special1 */;
                }
                else if (annotatedLine.charAt(j) === '!') {
                    result[column] = 2 /* Special2 */;
                }
                else {
                    column++;
                }
            }
            return result;
        }
        function assertType(model, cursor, lineNumber, column, chr, expectedInsert, message) {
            var lineContent = model.getLineContent(lineNumber);
            var expected = lineContent.substr(0, column - 1) + expectedInsert + lineContent.substr(column - 1);
            moveTo(cursor, lineNumber, column);
            cursorCommand(cursor, H.Type, { text: chr }, 'keyboard');
            assert.deepEqual(model.getLineContent(lineNumber), expected, message);
            cursorCommand(cursor, H.Undo);
        }
        test('open parens', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                var autoClosePositions = [
                    'var| a| =| [|];|',
                    'var| b| =| `asd`;|',
                    'var| c| =| \'asd\';|',
                    'var| d| =| "asd";|',
                    'var| e| =| /*3*/|	3;|',
                    'var| f| =| /**| 3| */3;|',
                    'var| g| =| (3+5|);|',
                    'var| h| =| {| a:| \'value\'| |};|',
                ];
                for (var i = 0, len = autoClosePositions.length; i < len; i++) {
                    var lineNumber = i + 1;
                    var autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (var column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(model, cursor, lineNumber, column, '(', '()', "auto closes @ (" + lineNumber + ", " + column + ")");
                        }
                        else {
                            assertType(model, cursor, lineNumber, column, '(', '(', "does not auto close @ (" + lineNumber + ", " + column + ")");
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('quote', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                var autoClosePositions = [
                    'var a =| [|];|',
                    'var b =| |`asd`;|',
                    'var c =| |\'asd!\';|',
                    'var d =| |"asd";|',
                    'var e =| /*3*/|	3;|',
                    'var f =| /**| 3 */3;|',
                    'var g =| (3+5);|',
                    'var h =| {| a:| |\'value!\'| |};|',
                ];
                for (var i = 0, len = autoClosePositions.length; i < len; i++) {
                    var lineNumber = i + 1;
                    var autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (var column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(model, cursor, lineNumber, column, '\'', '\'\'', "auto closes @ (" + lineNumber + ", " + column + ")");
                        }
                        else if (autoCloseColumns[column] === 2 /* Special2 */) {
                            assertType(model, cursor, lineNumber, column, '\'', '', "over types @ (" + lineNumber + ", " + column + ")");
                        }
                        else {
                            assertType(model, cursor, lineNumber, column, '\'', '\'', "does not auto close @ (" + lineNumber + ", " + column + ")");
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('issue #27937: Trying to add an item to the front of a list is cumbersome', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var arr = ["b", "c"];'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                assertType(model, cursor, 1, 12, '"', '""', "does not over type and will auto close");
            });
            mode.dispose();
        });
        test('issue #25658 - Do not auto-close single/double quotes after word characters', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                function typeCharacters(cursor, chars) {
                    for (var i = 0, len = chars.length; i < len; i++) {
                        cursorCommand(cursor, H.Type, { text: chars[i] }, 'keyboard');
                    }
                }
                // First gif
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste1 = teste\' ok');
                assert.equal(model.getLineContent(1), 'teste1 = teste\' ok');
                cursor.setSelections('test', [new selection_1.Selection(1, 1000, 1, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste2 = teste \'ok');
                assert.equal(model.getLineContent(2), 'teste2 = teste \'ok\'');
                cursor.setSelections('test', [new selection_1.Selection(2, 1000, 2, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste3 = teste" ok');
                assert.equal(model.getLineContent(3), 'teste3 = teste" ok');
                cursor.setSelections('test', [new selection_1.Selection(3, 1000, 3, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste4 = teste "ok');
                assert.equal(model.getLineContent(4), 'teste4 = teste "ok"');
                // Second gif
                cursor.setSelections('test', [new selection_1.Selection(4, 1000, 4, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste \'');
                assert.equal(model.getLineContent(5), 'teste \'\'');
                cursor.setSelections('test', [new selection_1.Selection(5, 1000, 5, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste "');
                assert.equal(model.getLineContent(6), 'teste ""');
                cursor.setSelections('test', [new selection_1.Selection(6, 1000, 6, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste\'');
                assert.equal(model.getLineContent(7), 'teste\'');
                cursor.setSelections('test', [new selection_1.Selection(7, 1000, 7, 1000)]);
                typeCharacters(cursor, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(cursor, 'teste"');
                assert.equal(model.getLineContent(8), 'teste"');
            });
            mode.dispose();
        });
        test('issue #15825: accents on mac US intl keyboard', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                assertCursor(cursor, new position_1.Position(1, 1));
                // Typing ` + e on the mac US intl kb layout
                cursorCommand(cursor, H.CompositionStart, null, 'keyboard');
                cursorCommand(cursor, H.Type, { text: '`' }, 'keyboard');
                cursorCommand(cursor, H.ReplacePreviousChar, { replaceCharCnt: 1, text: 'è' }, 'keyboard');
                cursorCommand(cursor, H.CompositionEnd, null, 'keyboard');
                assert.equal(model.getValue(), 'è');
            });
            mode.dispose();
        });
        test('issue #2773: Accents (´`¨^, others?) are inserted in the wrong position (Mac)', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'hello',
                    'world'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                assertCursor(cursor, new position_1.Position(1, 1));
                // Typing ` and pressing shift+down on the mac US intl kb layout
                // Here we're just replaying what the cursor gets
                cursorCommand(cursor, H.CompositionStart, null, 'keyboard');
                cursorCommand(cursor, H.Type, { text: '`' }, 'keyboard');
                moveDown(cursor, true);
                cursorCommand(cursor, H.ReplacePreviousChar, { replaceCharCnt: 1, text: '`' }, 'keyboard');
                cursorCommand(cursor, H.ReplacePreviousChar, { replaceCharCnt: 1, text: '`' }, 'keyboard');
                cursorCommand(cursor, H.CompositionEnd, null, 'keyboard');
                assert.equal(model.getValue(), '`hello\nworld');
                assertCursor(cursor, new selection_1.Selection(1, 2, 2, 2));
            });
            mode.dispose();
        });
        test('issue #20891: All cursors should do the same thing', function () {
            var mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, function (model, cursor) {
                cursor.setSelections('test', [
                    new selection_1.Selection(1, 9, 1, 9),
                    new selection_1.Selection(1, 12, 1, 12),
                ]);
                // type a `
                cursorCommand(cursor, H.Type, { text: '`' }, 'keyboard');
                assert.equal(model.getValue(), 'var a = `asd`');
            });
            mode.dispose();
        });
        test('All cursors should do the same thing when deleting left', function () {
            var mode = new AutoClosingMode();
            var model = textModel_1.TextModel.createFromString([
                'var a = ()'
            ].join('\n'), textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, mode.getLanguageIdentifier());
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [
                    new selection_1.Selection(1, 4, 1, 4),
                    new selection_1.Selection(1, 10, 1, 10),
                ]);
                // delete left
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getValue(), 'va a = )');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #7100: Mouse word selection is strange when non-word character is at the end of line', function () {
            var model = textModel_1.TextModel.createFromString([
                'before.a',
                'before',
                'hello:',
                'there:',
                'this is strange:',
                'here',
                'it',
                'is',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                coreCommands_1.CoreNavigationCommands.WordSelect.runEditorCommand(null, editor, {
                    position: new position_1.Position(3, 7)
                });
                assertCursor(cursor, new selection_1.Selection(3, 7, 3, 7));
                coreCommands_1.CoreNavigationCommands.WordSelectDrag.runEditorCommand(null, editor, {
                    position: new position_1.Position(4, 7)
                });
                assertCursor(cursor, new selection_1.Selection(3, 7, 4, 7));
            });
        });
    });
    suite('Undo stops', function () {
        test('there is an undo stop between typing and deleting left', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                cursorCommand(cursor, H.Type, { text: 'first' }, 'keyboard');
                assert.equal(model.getLineContent(1), 'A first line');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), 'A fir line');
                assertCursor(cursor, new selection_1.Selection(1, 6, 1, 6));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A first line');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A  line');
                assertCursor(cursor, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('there is an undo stop between typing and deleting right', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                cursorCommand(cursor, H.Type, { text: 'first' }, 'keyboard');
                assert.equal(model.getLineContent(1), 'A first line');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), 'A firstine');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A first line');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A  line');
                assertCursor(cursor, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('there is an undo stop between deleting left and typing', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(2, 8, 2, 8)]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), ' line');
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Type, { text: 'Second' }, 'keyboard');
                assert.equal(model.getLineContent(2), 'Second line');
                assertCursor(cursor, new selection_1.Selection(2, 7, 2, 7));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), ' line');
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another line');
                assertCursor(cursor, new selection_1.Selection(2, 8, 2, 8));
            });
        });
        test('there is an undo stop between deleting left and deleting right', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(2, 8, 2, 8)]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), ' line');
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), '');
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), ' line');
                assertCursor(cursor, new selection_1.Selection(2, 1, 2, 1));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another line');
                assertCursor(cursor, new selection_1.Selection(2, 8, 2, 8));
            });
        });
        test('there is an undo stop between deleting right and typing', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(2, 9, 2, 9)]);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'Another ');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
                cursorCommand(cursor, H.Type, { text: 'text' }, 'keyboard');
                assert.equal(model.getLineContent(2), 'Another text');
                assertCursor(cursor, new selection_1.Selection(2, 13, 2, 13));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another ');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another line');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
            });
        });
        test('there is an undo stop between deleting right and deleting left', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(2, 9, 2, 9)]);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'Another ');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(2), 'An');
                assertCursor(cursor, new selection_1.Selection(2, 3, 2, 3));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another ');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(2), 'Another line');
                assertCursor(cursor, new selection_1.Selection(2, 9, 2, 9));
            });
        });
        test('inserts undo stop when typing space', function () {
            var model = textModel_1.TextModel.createFromString([
                'A  line',
                'Another line',
            ].join('\n'));
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                cursor.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                cursorCommand(cursor, H.Type, { text: 'first and interesting' }, 'keyboard');
                assert.equal(model.getLineContent(1), 'A first and interesting line');
                assertCursor(cursor, new selection_1.Selection(1, 24, 1, 24));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A first and line');
                assertCursor(cursor, new selection_1.Selection(1, 12, 1, 12));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A first line');
                assertCursor(cursor, new selection_1.Selection(1, 8, 1, 8));
                cursorCommand(cursor, H.Undo, {});
                assert.equal(model.getLineContent(1), 'A  line');
                assertCursor(cursor, new selection_1.Selection(1, 3, 1, 3));
            });
        });
    });
});
