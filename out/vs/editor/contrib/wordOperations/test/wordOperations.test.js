define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/core/selection", "vs/editor/test/browser/testCodeEditor", "vs/editor/contrib/wordOperations/wordOperations"], function (require, exports, assert, position_1, selection_1, testCodeEditor_1, wordOperations_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WordOperations', function () {
        var _cursorWordStartLeft = new wordOperations_1.CursorWordStartLeft();
        var _cursorWordEndLeft = new wordOperations_1.CursorWordEndLeft();
        var _cursorWordLeft = new wordOperations_1.CursorWordLeft();
        var _cursorWordStartLeftSelect = new wordOperations_1.CursorWordStartLeftSelect();
        var _cursorWordEndLeftSelect = new wordOperations_1.CursorWordEndLeftSelect();
        var _cursorWordLeftSelect = new wordOperations_1.CursorWordLeftSelect();
        var _cursorWordStartRight = new wordOperations_1.CursorWordStartRight();
        var _cursorWordEndRight = new wordOperations_1.CursorWordEndRight();
        var _cursorWordRight = new wordOperations_1.CursorWordRight();
        var _cursorWordStartRightSelect = new wordOperations_1.CursorWordStartRightSelect();
        var _cursorWordEndRightSelect = new wordOperations_1.CursorWordEndRightSelect();
        var _cursorWordRightSelect = new wordOperations_1.CursorWordRightSelect();
        var _deleteWordLeft = new wordOperations_1.DeleteWordLeft();
        var _deleteWordStartLeft = new wordOperations_1.DeleteWordStartLeft();
        var _deleteWordEndLeft = new wordOperations_1.DeleteWordEndLeft();
        var _deleteWordRight = new wordOperations_1.DeleteWordRight();
        var _deleteWordStartRight = new wordOperations_1.DeleteWordStartRight();
        var _deleteWordEndRight = new wordOperations_1.DeleteWordEndRight();
        function runEditorCommand(editor, command) {
            command.runEditorCommand(null, editor, null);
        }
        function moveWordLeft(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordLeftSelect : _cursorWordLeft);
        }
        function moveWordStartLeft(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordStartLeftSelect : _cursorWordStartLeft);
        }
        function moveWordEndLeft(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordEndLeftSelect : _cursorWordEndLeft);
        }
        function moveWordRight(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordRightSelect : _cursorWordRight);
        }
        function moveWordEndRight(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordEndRightSelect : _cursorWordEndRight);
        }
        function moveWordStartRight(editor, inSelectionMode) {
            if (inSelectionMode === void 0) { inSelectionMode = false; }
            runEditorCommand(editor, inSelectionMode ? _cursorWordStartRightSelect : _cursorWordStartRight);
        }
        function deleteWordLeft(editor) {
            runEditorCommand(editor, _deleteWordLeft);
        }
        function deleteWordStartLeft(editor) {
            runEditorCommand(editor, _deleteWordStartLeft);
        }
        function deleteWordEndLeft(editor) {
            runEditorCommand(editor, _deleteWordEndLeft);
        }
        function deleteWordRight(editor) {
            runEditorCommand(editor, _deleteWordRight);
        }
        function deleteWordStartRight(editor) {
            runEditorCommand(editor, _deleteWordStartRight);
        }
        function deleteWordEndRight(editor) {
            runEditorCommand(editor, _deleteWordEndRight);
        }
        test('move word left', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(5, 2));
                var expectedStops = [
                    [5, 1],
                    [4, 1],
                    [3, 11],
                    [3, 5],
                    [3, 1],
                    [2, 12],
                    [2, 5],
                    [2, 2],
                    [2, 1],
                    [1, 15],
                    [1, 9],
                    [1, 6],
                    [1, 1],
                    [1, 1],
                ];
                var actualStops = [];
                for (var i = 0; i < expectedStops.length; i++) {
                    moveWordLeft(editor);
                    var pos = editor.getPosition();
                    actualStops.push([pos.lineNumber, pos.column]);
                }
                assert.deepEqual(actualStops, expectedStops);
            });
        });
        test('move word left selection', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(5, 2));
                moveWordLeft(editor, true);
                assert.deepEqual(editor.getSelection(), new selection_1.Selection(5, 2, 5, 1));
            });
        });
        test('issue #832: moveWordLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 50));
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '001');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '002');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '003');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '004');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '005');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '006');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '007');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '009');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text '.length + 1, '010');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   '.length + 1, '011');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   '.length + 1, '012');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just '.length + 1, '013');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   /* '.length + 1, '014');
                moveWordLeft(editor);
                assert.equal(editor.getPosition().column, '   '.length + 1, '015');
            });
        });
        test('moveWordStartLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 50));
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '001');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '002');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '003');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '004');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '005');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '006');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '007');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '009');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text '.length + 1, '010');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   '.length + 1, '011');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   '.length + 1, '012');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just '.length + 1, '013');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   /* '.length + 1, '014');
                moveWordStartLeft(editor);
                assert.equal(editor.getPosition().column, '   '.length + 1, '015');
            });
        });
        test('moveWordEndLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 50));
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '001');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '002');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '003');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '004');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '005');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '006');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '007');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '008');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '009');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '010');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text'.length + 1, '011');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more'.length + 1, '012');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just some'.length + 1, '013');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /* Just'.length + 1, '014');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, '   /*'.length + 1, '015');
                moveWordEndLeft(editor);
                assert.equal(editor.getPosition().column, ''.length + 1, '016');
            });
        });
        test('move word right', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 1));
                var expectedStops = [
                    [1, 8],
                    [1, 14],
                    [1, 19],
                    [1, 21],
                    [2, 4],
                    [2, 11],
                    [2, 16],
                    [3, 10],
                    [3, 17],
                    [4, 1],
                    [5, 2],
                    [5, 2],
                ];
                var actualStops = [];
                for (var i = 0; i < expectedStops.length; i++) {
                    moveWordRight(editor);
                    var pos = editor.getPosition();
                    actualStops.push([pos.lineNumber, pos.column]);
                }
                assert.deepEqual(actualStops, expectedStops);
            });
        });
        test('move word right selection', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 1));
                moveWordRight(editor, true);
                assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 1, 1, 8));
            });
        });
        test('issue #832: moveWordRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 1));
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /*'.length + 1, '001');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just'.length + 1, '003');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some'.length + 1, '004');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more'.length + 1, '005');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text'.length + 1, '006');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '008');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '009');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '013');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '014');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '015');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '016');
                moveWordRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('moveWordEndRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 1));
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /*'.length + 1, '001');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just'.length + 1, '003');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some'.length + 1, '004');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more'.length + 1, '005');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text'.length + 1, '006');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+='.length + 1, '008');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3'.length + 1, '009');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3'.length + 1, '013');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1, '014');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1, '015');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1, '016');
                moveWordEndRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('moveWordStartRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
            ], {}, function (editor, _) {
                editor.setPosition(new position_1.Position(1, 1));
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   '.length + 1, '001');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* '.length + 1, '002');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just '.length + 1, '003');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   '.length + 1, '004');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   '.length + 1, '005');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text '.length + 1, '006');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a'.length + 1, '007');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= '.length + 1, '008');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 '.length + 1, '009');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +'.length + 1, '010');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5'.length + 1, '011');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-'.length + 1, '012');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 '.length + 1, '013');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1, '014');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1, '015');
                moveWordStartRight(editor);
                assert.equal(editor.getPosition().column, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1, '016');
            });
        });
        test('delete word left for non-empty selection', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setSelection(new selection_1.Selection(3, 7, 3, 9));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(3), '    Thd Line🐶');
                assert.deepEqual(editor.getPosition(), new position_1.Position(3, 7));
            });
        });
        test('delete word left for caret at beginning of document', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 1));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '    \tMy First Line\t ');
                assert.deepEqual(editor.getPosition(), new position_1.Position(1, 1));
            });
        });
        test('delete word left for caret at end of whitespace', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(3, 11));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(3), '    Line🐶');
                assert.deepEqual(editor.getPosition(), new position_1.Position(3, 5));
            });
        });
        test('delete word left for caret just behind a word', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 11));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(2), '\tMy  Line');
                assert.deepEqual(editor.getPosition(), new position_1.Position(2, 5));
            });
        });
        test('delete word left for caret inside of a word', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 12));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '    \tMy st Line\t ');
                assert.deepEqual(editor.getPosition(), new position_1.Position(1, 9));
            });
        });
        test('delete word right for non-empty selection', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setSelection(new selection_1.Selection(3, 7, 3, 9));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(3), '    Thd Line🐶');
                assert.deepEqual(editor.getPosition(), new position_1.Position(3, 7));
            });
        });
        test('delete word right for caret at end of document', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(5, 3));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(5), '1');
                assert.deepEqual(editor.getPosition(), new position_1.Position(5, 2));
            });
        });
        test('delete word right for caret at beggining of whitespace', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(3, 1));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(3), 'Third Line🐶');
                assert.deepEqual(editor.getPosition(), new position_1.Position(3, 1));
            });
        });
        test('delete word right for caret just before a word', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 5));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(2), '\tMy  Line');
                assert.deepEqual(editor.getPosition(), new position_1.Position(2, 5));
            });
        });
        test('delete word right for caret inside of a word', function () {
            testCodeEditor_1.withTestCodeEditor([
                '    \tMy First Line\t ',
                '\tMy Second Line',
                '    Third Line🐶',
                '',
                '1',
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 11));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '    \tMy Fi Line\t ');
                assert.deepEqual(editor.getPosition(), new position_1.Position(1, 11));
            });
        });
        test('issue #832: deleteWordLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 37));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 */', '001');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 ', '002');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '003');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 ', '004');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= ', '005');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '006');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text ', '007');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some ', '008');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just ', '009');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   /* ', '010');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '   ', '011');
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '', '012');
            });
        });
        test('deleteWordStartLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 37));
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 ', '001');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '002');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 ', '003');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= ', '004');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '005');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text ', '006');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some ', '007');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just ', '008');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   /* ', '009');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '   ', '010');
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '', '011');
            });
        });
        test('deleteWordEndLeft', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 37));
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5 */', '001');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +5', '002');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3 +', '003');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+= 3', '004');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a+=', '005');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text a', '006');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some text', '007');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just some', '008');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /* Just', '009');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '   /*', '010');
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '', '011');
            });
        });
        test('issue #24947', function () {
            testCodeEditor_1.withTestCodeEditor([
                '{',
                '}'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 1));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), '{}');
            });
            testCodeEditor_1.withTestCodeEditor([
                '{',
                '}'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 1));
                deleteWordStartLeft(editor);
                assert.equal(model.getLineContent(1), '{}');
            });
            testCodeEditor_1.withTestCodeEditor([
                '{',
                '}'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 1));
                deleteWordEndLeft(editor);
                assert.equal(model.getLineContent(1), '{}');
            });
        });
        test('issue #832: deleteWordRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5-3 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 1));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '/* Just some text a+= 3 +5-3 */  ', '001');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' Just some text a+= 3 +5-3 */  ', '002');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' some text a+= 3 +5-3 */  ', '003');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' text a+= 3 +5-3 */  ', '004');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' a+= 3 +5-3 */  ', '005');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '006');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' 3 +5-3 */  ', '007');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' +5-3 */  ', '008');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '009');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '-3 */  ', '010');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '3 */  ', '011');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), ' */  ', '012');
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), '  ', '013');
            });
        });
        test('issue #3882: deleteWordRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                'public void Add( int x,',
                '                 int y )'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 24));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('issue #3882: deleteWordStartRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                'public void Add( int x,',
                '                 int y )'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 24));
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('issue #3882: deleteWordEndRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                'public void Add( int x,',
                '                 int y )'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 24));
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), 'public void Add( int x,int y )', '001');
            });
        });
        test('deleteWordStartRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5-3 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 1));
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '/* Just some text a+= 3 +5-3 */  ', '001');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), 'Just some text a+= 3 +5-3 */  ', '002');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), 'some text a+= 3 +5-3 */  ', '003');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), 'text a+= 3 +5-3 */  ', '004');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), 'a+= 3 +5-3 */  ', '005');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '006');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '3 +5-3 */  ', '007');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '+5-3 */  ', '008');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '009');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '-3 */  ', '010');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '3 */  ', '011');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '*/  ', '012');
                deleteWordStartRight(editor);
                assert.equal(model.getLineContent(1), '', '013');
            });
        });
        test('deleteWordEndRight', function () {
            testCodeEditor_1.withTestCodeEditor([
                '   /* Just some text a+= 3 +5-3 */  '
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 1));
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' Just some text a+= 3 +5-3 */  ', '001');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' some text a+= 3 +5-3 */  ', '002');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' text a+= 3 +5-3 */  ', '003');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' a+= 3 +5-3 */  ', '004');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), '+= 3 +5-3 */  ', '005');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' 3 +5-3 */  ', '006');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' +5-3 */  ', '007');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), '5-3 */  ', '008');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), '-3 */  ', '009');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), '3 */  ', '010');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), ' */  ', '011');
                deleteWordEndRight(editor);
                assert.equal(model.getLineContent(1), '  ', '012');
            });
        });
        test('issue #3882 (1): Ctrl+Delete removing entire line when used at the end of line', function () {
            testCodeEditor_1.withTestCodeEditor([
                'A line with text.',
                '   And another one'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(1, 18));
                deleteWordRight(editor);
                assert.equal(model.getLineContent(1), 'A line with text.And another one', '001');
            });
        });
        test('issue #3882 (2): Ctrl+Delete removing entire line when used at the end of line', function () {
            testCodeEditor_1.withTestCodeEditor([
                'A line with text.',
                '   And another one'
            ], {}, function (editor, _) {
                var model = editor.getModel();
                editor.setPosition(new position_1.Position(2, 1));
                deleteWordLeft(editor);
                assert.equal(model.getLineContent(1), 'A line with text.   And another one', '001');
            });
        });
    });
});
