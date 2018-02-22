define(["require", "exports", "assert", "vs/editor/common/commands/trimTrailingWhitespaceCommand", "vs/editor/common/core/selection", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/test/browser/testCommand", "vs/editor/test/common/editorTestUtils"], function (require, exports, assert, trimTrailingWhitespaceCommand_1, selection_1, position_1, range_1, testCommand_1, editorTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Create single edit operation
     */
    function createInsertDeleteSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber, selectionColumn) {
        if (selectionLineNumber === void 0) { selectionLineNumber = positionLineNumber; }
        if (selectionColumn === void 0) { selectionColumn = positionColumn; }
        return {
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text
        };
    }
    /**
     * Create single edit operation
     */
    function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber, selectionColumn) {
        if (selectionLineNumber === void 0) { selectionLineNumber = positionLineNumber; }
        if (selectionColumn === void 0) { selectionColumn = positionColumn; }
        return {
            range: new range_1.Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
            text: text
        };
    }
    exports.createSingleEditOp = createSingleEditOp;
    function assertTrimTrailingWhitespaceCommand(text, expected) {
        return editorTestUtils_1.withEditorModel(text, function (model) {
            var op = new trimTrailingWhitespaceCommand_1.TrimTrailingWhitespaceCommand(new selection_1.Selection(1, 1, 1, 1), []);
            var actual = testCommand_1.getEditOperation(model, op);
            assert.deepEqual(actual, expected);
        });
    }
    function assertTrimTrailingWhitespace(text, cursors, expected) {
        return editorTestUtils_1.withEditorModel(text, function (model) {
            var actual = trimTrailingWhitespaceCommand_1.trimTrailingWhitespace(model, cursors);
            assert.deepEqual(actual, expected);
        });
    }
    suite('Editor Commands - Trim Trailing Whitespace Command', function () {
        test('remove trailing whitespace', function () {
            assertTrimTrailingWhitespaceCommand([''], []);
            assertTrimTrailingWhitespaceCommand(['text'], []);
            assertTrimTrailingWhitespaceCommand(['text   '], [createSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespaceCommand(['text\t   '], [createSingleEditOp(null, 1, 5, 1, 9)]);
            assertTrimTrailingWhitespaceCommand(['\t   '], [createSingleEditOp(null, 1, 1, 1, 5)]);
            assertTrimTrailingWhitespaceCommand(['text\t'], [createSingleEditOp(null, 1, 5, 1, 6)]);
            assertTrimTrailingWhitespaceCommand([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [
                createSingleEditOp(null, 1, 10, 1, 11),
                createSingleEditOp(null, 3, 1, 3, 4),
                createSingleEditOp(null, 4, 15, 4, 17),
                createSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 2), new position_1.Position(1, 3)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 5)], [createInsertDeleteSingleEditOp(null, 1, 5, 1, 8)]);
            assertTrimTrailingWhitespace(['text   '], [new position_1.Position(1, 1), new position_1.Position(1, 5), new position_1.Position(1, 6)], [createInsertDeleteSingleEditOp(null, 1, 6, 1, 8)]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [], [
                createInsertDeleteSingleEditOp(null, 1, 10, 1, 11),
                createInsertDeleteSingleEditOp(null, 3, 1, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
            assertTrimTrailingWhitespace([
                'some text\t',
                'some more text',
                '\t  ',
                'even more text  ',
                'and some mixed\t   \t'
            ], [new position_1.Position(1, 11), new position_1.Position(3, 2), new position_1.Position(5, 1), new position_1.Position(4, 1), new position_1.Position(5, 10)], [
                createInsertDeleteSingleEditOp(null, 3, 2, 3, 4),
                createInsertDeleteSingleEditOp(null, 4, 15, 4, 17),
                createInsertDeleteSingleEditOp(null, 5, 15, 5, 20)
            ]);
        });
    });
});
