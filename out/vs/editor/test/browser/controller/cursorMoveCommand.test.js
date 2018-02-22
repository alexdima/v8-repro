define(["require", "exports", "assert", "vs/editor/common/controller/cursor", "vs/editor/common/core/position", "vs/editor/common/model/textModel", "vs/editor/test/common/mocks/testConfiguration", "vs/editor/common/controller/cursorMoveCommands", "vs/editor/common/core/range", "vs/editor/browser/controller/coreCommands", "vs/editor/common/viewModel/viewModelImpl"], function (require, exports, assert, cursor_1, position_1, textModel_1, testConfiguration_1, cursorMoveCommands_1, range_1, coreCommands_1, viewModelImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cursor move command test', function () {
        var thisModel;
        var thisConfiguration;
        var thisViewModel;
        var thisCursor;
        setup(function () {
            var text = [
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1'
            ].join('\n');
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
        test('move left should move to left character', function () {
            moveTo(thisCursor, 1, 8);
            moveLeft(thisCursor);
            cursorEqual(thisCursor, 1, 7);
        });
        test('move left should move to left by n characters', function () {
            moveTo(thisCursor, 1, 8);
            moveLeft(thisCursor, 3);
            cursorEqual(thisCursor, 1, 5);
        });
        test('move left should move to left by half line', function () {
            moveTo(thisCursor, 1, 8);
            moveLeft(thisCursor, 1, cursorMoveCommands_1.CursorMove.RawUnit.HalfLine);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move left moves to previous line', function () {
            moveTo(thisCursor, 2, 3);
            moveLeft(thisCursor, 10);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move right should move to right character', function () {
            moveTo(thisCursor, 1, 5);
            moveRight(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move right should move to right by n characters', function () {
            moveTo(thisCursor, 1, 2);
            moveRight(thisCursor, 6);
            cursorEqual(thisCursor, 1, 8);
        });
        test('move right should move to right by half line', function () {
            moveTo(thisCursor, 1, 4);
            moveRight(thisCursor, 1, cursorMoveCommands_1.CursorMove.RawUnit.HalfLine);
            cursorEqual(thisCursor, 1, 14);
        });
        test('move right moves to next line', function () {
            moveTo(thisCursor, 1, 8);
            moveRight(thisCursor, 100);
            cursorEqual(thisCursor, 2, 1);
        });
        test('move to first character of line from middle', function () {
            moveTo(thisCursor, 1, 8);
            moveToLineStart(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to first character of line from first non white space character', function () {
            moveTo(thisCursor, 1, 6);
            moveToLineStart(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to first character of line from first character', function () {
            moveTo(thisCursor, 1, 1);
            moveToLineStart(thisCursor);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move to first non white space character of line from middle', function () {
            moveTo(thisCursor, 1, 8);
            moveToLineFirstNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move to first non white space character of line from first non white space character', function () {
            moveTo(thisCursor, 1, 6);
            moveToLineFirstNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move to first non white space character of line from first character', function () {
            moveTo(thisCursor, 1, 1);
            moveToLineFirstNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move to end of line from middle', function () {
            moveTo(thisCursor, 1, 8);
            moveToLineEnd(thisCursor);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move to end of line from last non white space character', function () {
            moveTo(thisCursor, 1, 19);
            moveToLineEnd(thisCursor);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move to end of line from line end', function () {
            moveTo(thisCursor, 1, 21);
            moveToLineEnd(thisCursor);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move to last non white space character from middle', function () {
            moveTo(thisCursor, 1, 8);
            moveToLineLastNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 19);
        });
        test('move to last non white space character from last non white space character', function () {
            moveTo(thisCursor, 1, 19);
            moveToLineLastNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 19);
        });
        test('move to last non white space character from line end', function () {
            moveTo(thisCursor, 1, 21);
            moveToLineLastNonWhiteSpaceCharacter(thisCursor);
            cursorEqual(thisCursor, 1, 19);
        });
        test('move to center of line not from center', function () {
            moveTo(thisCursor, 1, 8);
            moveToLineCenter(thisCursor);
            cursorEqual(thisCursor, 1, 11);
        });
        test('move to center of line from center', function () {
            moveTo(thisCursor, 1, 11);
            moveToLineCenter(thisCursor);
            cursorEqual(thisCursor, 1, 11);
        });
        test('move to center of line from start', function () {
            moveToLineStart(thisCursor);
            moveToLineCenter(thisCursor);
            cursorEqual(thisCursor, 1, 11);
        });
        test('move to center of line from end', function () {
            moveToLineEnd(thisCursor);
            moveToLineCenter(thisCursor);
            cursorEqual(thisCursor, 1, 11);
        });
        test('move up by cursor move command', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 2);
            cursorEqual(thisCursor, 1, 5);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move up by model line cursor move command', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveUpByModelLine(thisCursor, 2);
            cursorEqual(thisCursor, 1, 5);
            moveUpByModelLine(thisCursor, 1);
            cursorEqual(thisCursor, 1, 1);
        });
        test('move down by model line cursor move command', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveDownByModelLine(thisCursor, 2);
            cursorEqual(thisCursor, 5, 2);
            moveDownByModelLine(thisCursor, 1);
            cursorEqual(thisCursor, 5, 2);
        });
        test('move up with selection by cursor move command', function () {
            moveTo(thisCursor, 3, 5);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 1, true);
            cursorEqual(thisCursor, 2, 2, 3, 5);
            moveUp(thisCursor, 1, true);
            cursorEqual(thisCursor, 1, 5, 3, 5);
        });
        test('move up and down with tabs by cursor move command', function () {
            moveTo(thisCursor, 1, 5);
            cursorEqual(thisCursor, 1, 5);
            moveDown(thisCursor, 4);
            cursorEqual(thisCursor, 5, 2);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 4, 1);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 3, 5);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 2, 2);
            moveUp(thisCursor, 1);
            cursorEqual(thisCursor, 1, 5);
        });
        test('move up and down with end of lines starting from a long one by cursor move command', function () {
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 21);
            moveToEndOfLine(thisCursor);
            cursorEqual(thisCursor, 1, 21);
            moveDown(thisCursor, 2);
            cursorEqual(thisCursor, 3, 17);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 4, 1);
            moveDown(thisCursor, 1);
            cursorEqual(thisCursor, 5, 2);
            moveUp(thisCursor, 4);
            cursorEqual(thisCursor, 1, 21);
        });
        test('move to view top line moves to first visible line if it is first line', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(1, 1, 10, 1); };
            moveTo(thisCursor, 2, 2);
            moveToTop(thisCursor);
            cursorEqual(thisCursor, 1, 6);
        });
        test('move to view top line moves to top visible line when first line is not visible', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(2, 1, 10, 1); };
            moveTo(thisCursor, 4, 1);
            moveToTop(thisCursor);
            cursorEqual(thisCursor, 2, 2);
        });
        test('move to view top line moves to nth line from top', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(1, 1, 10, 1); };
            moveTo(thisCursor, 4, 1);
            moveToTop(thisCursor, 3);
            cursorEqual(thisCursor, 3, 5);
        });
        test('move to view top line moves to last line if n is greater than last visible line number', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(1, 1, 3, 1); };
            moveTo(thisCursor, 2, 2);
            moveToTop(thisCursor, 4);
            cursorEqual(thisCursor, 3, 5);
        });
        test('move to view center line moves to the center line', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(3, 1, 3, 1); };
            moveTo(thisCursor, 2, 2);
            moveToCenter(thisCursor);
            cursorEqual(thisCursor, 3, 5);
        });
        test('move to view bottom line moves to last visible line if it is last line', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(1, 1, 5, 1); };
            moveTo(thisCursor, 2, 2);
            moveToBottom(thisCursor);
            cursorEqual(thisCursor, 5, 1);
        });
        test('move to view bottom line moves to last visible line when last line is not visible', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(2, 1, 3, 1); };
            moveTo(thisCursor, 2, 2);
            moveToBottom(thisCursor);
            cursorEqual(thisCursor, 3, 5);
        });
        test('move to view bottom line moves to nth line from bottom', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(1, 1, 5, 1); };
            moveTo(thisCursor, 4, 1);
            moveToBottom(thisCursor, 3);
            cursorEqual(thisCursor, 3, 5);
        });
        test('move to view bottom line moves to first line if n is lesser than first visible line number', function () {
            thisViewModel.getCompletelyVisibleViewRange = function () { return new range_1.Range(2, 1, 5, 1); };
            moveTo(thisCursor, 4, 1);
            moveToBottom(thisCursor, 5);
            cursorEqual(thisCursor, 2, 2);
        });
    });
    // Move command
    function move(cursor, args) {
        coreCommands_1.CoreNavigationCommands.CursorMove.runCoreEditorCommand(cursor, args);
    }
    function moveToLineStart(cursor) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineStart });
    }
    function moveToLineFirstNonWhiteSpaceCharacter(cursor) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineFirstNonWhitespaceCharacter });
    }
    function moveToLineCenter(cursor) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineColumnCenter });
    }
    function moveToLineEnd(cursor) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineEnd });
    }
    function moveToLineLastNonWhiteSpaceCharacter(cursor) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.WrappedLineLastNonWhitespaceCharacter });
    }
    function moveLeft(cursor, value, by, select) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Left, by: by, value: value, select: select });
    }
    function moveRight(cursor, value, by, select) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Right, by: by, value: value, select: select });
    }
    function moveUp(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Up, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, value: noOfLines, select: select });
    }
    function moveUpByModelLine(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Up, value: noOfLines, select: select });
    }
    function moveDown(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Down, by: cursorMoveCommands_1.CursorMove.RawUnit.WrappedLine, value: noOfLines, select: select });
    }
    function moveDownByModelLine(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.Down, value: noOfLines, select: select });
    }
    function moveToTop(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortTop, value: noOfLines, select: select });
    }
    function moveToCenter(cursor, select) {
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortCenter, select: select });
    }
    function moveToBottom(cursor, noOfLines, select) {
        if (noOfLines === void 0) { noOfLines = 1; }
        move(cursor, { to: cursorMoveCommands_1.CursorMove.RawDirection.ViewPortBottom, value: noOfLines, select: select });
    }
    function cursorEqual(cursor, posLineNumber, posColumn, selLineNumber, selColumn) {
        if (selLineNumber === void 0) { selLineNumber = posLineNumber; }
        if (selColumn === void 0) { selColumn = posColumn; }
        positionEqual(cursor.getPosition(), posLineNumber, posColumn);
        selectionEqual(cursor.getSelection(), posLineNumber, posColumn, selLineNumber, selColumn);
    }
    function positionEqual(position, lineNumber, column) {
        assert.deepEqual(position, new position_1.Position(lineNumber, column), 'position equal');
    }
    function selectionEqual(selection, posLineNumber, posColumn, selLineNumber, selColumn) {
        assert.deepEqual({
            selectionStartLineNumber: selection.selectionStartLineNumber,
            selectionStartColumn: selection.selectionStartColumn,
            positionLineNumber: selection.positionLineNumber,
            positionColumn: selection.positionColumn
        }, {
            selectionStartLineNumber: selLineNumber,
            selectionStartColumn: selColumn,
            positionLineNumber: posLineNumber,
            positionColumn: posColumn
        }, 'selection equal');
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
    function moveToEndOfLine(cursor, inSelectionMode) {
        if (inSelectionMode === void 0) { inSelectionMode = false; }
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(cursor, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorEnd.runCoreEditorCommand(cursor, {});
        }
    }
});
