define(["require", "exports", "assert", "vs/editor/common/core/selection", "vs/editor/common/core/position", "vs/editor/common/editorCommon", "vs/editor/common/model", "vs/editor/test/browser/testCodeEditor", "vs/editor/contrib/linesOperations/linesOperations", "vs/editor/common/model/textModel", "vs/editor/browser/controller/coreCommands"], function (require, exports, assert, selection_1, position_1, editorCommon_1, model_1, testCodeEditor_1, linesOperations_1, textModel_1, coreCommands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Contrib - Line Operations', function () {
        suite('SortLinesAscendingAction', function () {
            test('should sort selected lines in ascending order', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'omicron',
                    'beta',
                    'alpha'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var sortLinesAscendingAction = new linesOperations_1.SortLinesAscendingAction();
                    editor.setSelection(new selection_1.Selection(1, 1, 3, 5));
                    sortLinesAscendingAction.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron'
                    ]);
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 3, 7).toString());
                });
            });
            test('should sort multiple selections in ascending order', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'omicron',
                    'beta',
                    'alpha',
                    '',
                    'omicron',
                    'beta',
                    'alpha'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var sortLinesAscendingAction = new linesOperations_1.SortLinesAscendingAction();
                    editor.setSelections([new selection_1.Selection(1, 1, 3, 5), new selection_1.Selection(5, 1, 7, 5)]);
                    sortLinesAscendingAction.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), [
                        'alpha',
                        'beta',
                        'omicron',
                        '',
                        'alpha',
                        'beta',
                        'omicron'
                    ]);
                    var expectedSelections = [
                        new selection_1.Selection(1, 1, 3, 7),
                        new selection_1.Selection(5, 1, 7, 7)
                    ];
                    editor.getSelections().forEach(function (actualSelection, index) {
                        assert.deepEqual(actualSelection.toString(), expectedSelections[index].toString());
                    });
                });
            });
        });
        suite('SortLinesDescendingAction', function () {
            test('should sort selected lines in descending order', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'alpha',
                    'beta',
                    'omicron'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var sortLinesDescendingAction = new linesOperations_1.SortLinesDescendingAction();
                    editor.setSelection(new selection_1.Selection(1, 1, 3, 7));
                    sortLinesDescendingAction.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), [
                        'omicron',
                        'beta',
                        'alpha'
                    ]);
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 3, 5).toString());
                });
            });
            test('should sort multiple selections in descending order', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'alpha',
                    'beta',
                    'omicron',
                    '',
                    'alpha',
                    'beta',
                    'omicron'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var sortLinesDescendingAction = new linesOperations_1.SortLinesDescendingAction();
                    editor.setSelections([new selection_1.Selection(1, 1, 3, 7), new selection_1.Selection(5, 1, 7, 7)]);
                    sortLinesDescendingAction.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), [
                        'omicron',
                        'beta',
                        'alpha',
                        '',
                        'omicron',
                        'beta',
                        'alpha'
                    ]);
                    var expectedSelections = [
                        new selection_1.Selection(1, 1, 3, 5),
                        new selection_1.Selection(5, 1, 7, 5)
                    ];
                    editor.getSelections().forEach(function (actualSelection, index) {
                        assert.deepEqual(actualSelection.toString(), expectedSelections[index].toString());
                    });
                });
            });
        });
        suite('DeleteAllLeftAction', function () {
            test('should delete to the left of the cursor', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'one',
                    'two',
                    'three'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var deleteAllLeftAction = new linesOperations_1.DeleteAllLeftAction();
                    editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(1), 'ne', '001');
                    editor.setSelections([new selection_1.Selection(2, 2, 2, 2), new selection_1.Selection(3, 2, 3, 2)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(2), 'wo', '002');
                    assert.equal(model.getLineContent(3), 'hree', '003');
                });
            });
            test('should work in multi cursor mode', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world',
                    'hello world',
                    'hello',
                    'bonjour',
                    'hola',
                    'world',
                    'hello world',
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var deleteAllLeftAction = new linesOperations_1.DeleteAllLeftAction();
                    editor.setSelections([new selection_1.Selection(1, 2, 1, 2), new selection_1.Selection(1, 4, 1, 4)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(1), 'lo', '001');
                    editor.setSelections([new selection_1.Selection(2, 2, 2, 2), new selection_1.Selection(2, 4, 2, 5)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(2), 'ord', '002');
                    editor.setSelections([new selection_1.Selection(3, 2, 3, 5), new selection_1.Selection(3, 7, 3, 7)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(3), 'world', '003');
                    editor.setSelections([new selection_1.Selection(4, 3, 4, 3), new selection_1.Selection(4, 5, 5, 4)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(4), 'lljour', '004');
                    editor.setSelections([new selection_1.Selection(5, 3, 6, 3), new selection_1.Selection(6, 5, 7, 5), new selection_1.Selection(7, 7, 7, 7)]);
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(5), 'horlworld', '005');
                });
            });
            test('issue #36234: should push undo stop', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'one',
                    'two',
                    'three'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var deleteAllLeftAction = new linesOperations_1.DeleteAllLeftAction();
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: 'Typing some text here on line ' });
                    assert.equal(model.getLineContent(1), 'Typing some text here on line one');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 31, 1, 31));
                    deleteAllLeftAction.run(null, editor);
                    assert.equal(model.getLineContent(1), 'one');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 1, 1, 1));
                    editor.trigger('keyboard', editorCommon_1.Handler.Undo, {});
                    assert.equal(model.getLineContent(1), 'Typing some text here on line one');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 31, 1, 31));
                });
            });
        });
        suite('JoinLinesAction', function () {
            test('should join lines and insert space if necessary', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world',
                    'hello ',
                    'world',
                    'hello		',
                    '	world',
                    'hello   ',
                    '	world',
                    '',
                    '',
                    'hello world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var joinLinesAction = new linesOperations_1.JoinLinesAction();
                    editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(1), 'hello world', '001');
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 6, 1, 6).toString(), '002');
                    editor.setSelection(new selection_1.Selection(2, 2, 2, 2));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(2), 'hello world', '003');
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 7, 2, 7).toString(), '004');
                    editor.setSelection(new selection_1.Selection(3, 2, 3, 2));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(3), 'hello world', '005');
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(3, 7, 3, 7).toString(), '006');
                    editor.setSelection(new selection_1.Selection(4, 2, 5, 3));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(4), 'hello world', '007');
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(4, 2, 4, 8).toString(), '008');
                    editor.setSelection(new selection_1.Selection(5, 1, 7, 3));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(5), 'hello world', '009');
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(5, 1, 5, 3).toString(), '010');
                });
            });
            test('should work in multi cursor mode', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world',
                    'hello ',
                    'world',
                    'hello		',
                    '	world',
                    'hello   ',
                    '	world',
                    '',
                    '',
                    'hello world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var joinLinesAction = new linesOperations_1.JoinLinesAction();
                    editor.setSelections([
                        /** primary cursor */
                        new selection_1.Selection(5, 2, 5, 2),
                        new selection_1.Selection(1, 2, 1, 2),
                        new selection_1.Selection(3, 2, 4, 2),
                        new selection_1.Selection(5, 4, 6, 3),
                        new selection_1.Selection(7, 5, 8, 4),
                        new selection_1.Selection(10, 1, 10, 1)
                    ]);
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLinesContent().join('\n'), 'hello world\nhello world\nhello world\nhello world\n\nhello world', '001');
                    assert.deepEqual(editor.getSelections().toString(), [
                        /** primary cursor */
                        new selection_1.Selection(3, 4, 3, 8),
                        new selection_1.Selection(1, 6, 1, 6),
                        new selection_1.Selection(2, 2, 2, 8),
                        new selection_1.Selection(4, 5, 4, 9),
                        new selection_1.Selection(6, 1, 6, 1)
                    ].toString(), '002');
                    /** primary cursor */
                    assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(3, 4, 3, 8).toString(), '003');
                });
            });
            test('should push undo stop', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var joinLinesAction = new linesOperations_1.JoinLinesAction();
                    editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
                    editor.trigger('keyboard', editorCommon_1.Handler.Type, { text: ' my dear' });
                    assert.equal(model.getLineContent(1), 'hello my dear');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 14, 1, 14));
                    joinLinesAction.run(null, editor);
                    assert.equal(model.getLineContent(1), 'hello my dear world');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 14, 1, 14));
                    editor.trigger('keyboard', editorCommon_1.Handler.Undo, {});
                    assert.equal(model.getLineContent(1), 'hello my dear');
                    assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 14, 1, 14));
                });
            });
        });
        test('transpose', function () {
            testCodeEditor_1.withTestCodeEditor([
                'hello world',
                '',
                '',
                '   ',
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                var transposeAction = new linesOperations_1.TransposeAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'hello world', '001');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 2, 1, 2).toString(), '002');
                editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'hell oworld', '003');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 7, 1, 7).toString(), '004');
                editor.setSelection(new selection_1.Selection(1, 12, 1, 12));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'hell oworl', '005');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 2, 2, 2).toString(), '006');
                editor.setSelection(new selection_1.Selection(3, 1, 3, 1));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(3), '', '007');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(4, 1, 4, 1).toString(), '008');
                editor.setSelection(new selection_1.Selection(4, 2, 4, 2));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(4), '   ', '009');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(4, 3, 4, 3).toString(), '010');
            });
            // fix #16633
            testCodeEditor_1.withTestCodeEditor([
                '',
                '',
                'hello',
                'world',
                '',
                'hello world',
                '',
                'hello world'
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                var transposeAction = new linesOperations_1.TransposeAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(2), '', '011');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 1, 2, 1).toString(), '012');
                editor.setSelection(new selection_1.Selection(3, 6, 3, 6));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(4), 'oworld', '013');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(4, 2, 4, 2).toString(), '014');
                editor.setSelection(new selection_1.Selection(6, 12, 6, 12));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(7), 'd', '015');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(7, 2, 7, 2).toString(), '016');
                editor.setSelection(new selection_1.Selection(8, 12, 8, 12));
                transposeAction.run(null, editor);
                assert.equal(model.getLineContent(8), 'hello world', '019');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(8, 12, 8, 12).toString(), '020');
            });
        });
        test('toggle case', function () {
            testCodeEditor_1.withTestCodeEditor([
                'hello world',
                'öçşğü'
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                var uppercaseAction = new linesOperations_1.UpperCaseAction();
                var lowercaseAction = new linesOperations_1.LowerCaseAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 12));
                uppercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'HELLO WORLD', '001');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 1, 12).toString(), '002');
                editor.setSelection(new selection_1.Selection(1, 1, 1, 12));
                lowercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'hello world', '003');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 1, 12).toString(), '004');
                editor.setSelection(new selection_1.Selection(1, 3, 1, 3));
                uppercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'HELLO world', '005');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 3, 1, 3).toString(), '006');
                editor.setSelection(new selection_1.Selection(1, 4, 1, 4));
                lowercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), 'hello world', '007');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 4, 1, 4).toString(), '008');
                editor.setSelection(new selection_1.Selection(2, 1, 2, 6));
                uppercaseAction.run(null, editor);
                assert.equal(model.getLineContent(2), 'ÖÇŞĞÜ', '009');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 1, 2, 6).toString(), '010');
                editor.setSelection(new selection_1.Selection(2, 1, 2, 6));
                lowercaseAction.run(null, editor);
                assert.equal(model.getLineContent(2), 'öçşğü', '011');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 1, 2, 6).toString(), '012');
            });
            testCodeEditor_1.withTestCodeEditor([
                '',
                '   '
            ], {}, function (editor, cursor) {
                var model = editor.getModel();
                var uppercaseAction = new linesOperations_1.UpperCaseAction();
                var lowercaseAction = new linesOperations_1.LowerCaseAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                uppercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), '', '013');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 1, 1).toString(), '014');
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                lowercaseAction.run(null, editor);
                assert.equal(model.getLineContent(1), '', '015');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(1, 1, 1, 1).toString(), '016');
                editor.setSelection(new selection_1.Selection(2, 2, 2, 2));
                uppercaseAction.run(null, editor);
                assert.equal(model.getLineContent(2), '   ', '017');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 2, 2, 2).toString(), '018');
                editor.setSelection(new selection_1.Selection(2, 2, 2, 2));
                lowercaseAction.run(null, editor);
                assert.equal(model.getLineContent(2), '   ', '019');
                assert.deepEqual(editor.getSelection().toString(), new selection_1.Selection(2, 2, 2, 2).toString(), '020');
            });
        });
        suite('DeleteAllRightAction', function () {
            test('should be noop on empty', function () {
                testCodeEditor_1.withTestCodeEditor([''], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 1, 1, 1)]);
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 1, 1, 1)]);
                    editor.setSelections([new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(1, 1, 1, 1)]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 1, 1, 1)]);
                });
            });
            test('should delete selected range', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    editor.setSelection(new selection_1.Selection(1, 2, 1, 5));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['ho', 'world']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 2, 1, 2)]);
                    editor.setSelection(new selection_1.Selection(1, 1, 2, 4));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['ld']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 1, 1, 1)]);
                    editor.setSelection(new selection_1.Selection(1, 1, 1, 3));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 1, 1, 1)]);
                });
            });
            test('should delete to the right of the cursor', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    editor.setSelection(new selection_1.Selection(1, 3, 1, 3));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['he', 'world']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 3, 1, 3)]);
                    editor.setSelection(new selection_1.Selection(2, 1, 2, 1));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['he', '']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(2, 1, 2, 1)]);
                });
            });
            test('should join two lines, if at the end of the line', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['helloworld']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 6, 1, 6)]);
                    editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['hello']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 6, 1, 6)]);
                    editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['hello']);
                    assert.deepEqual(editor.getSelections(), [new selection_1.Selection(1, 6, 1, 6)]);
                });
            });
            test('should work with multiple cursors', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'there',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    editor.setSelections([
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(1, 6, 1, 6),
                        new selection_1.Selection(3, 4, 3, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['hethere', 'wor']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(2, 4, 2, 4)
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['he', 'wor']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(2, 4, 2, 4)
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['hewor']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(1, 6, 1, 6)
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['he']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3)
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['he']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3)
                    ]);
                });
            });
            test('should work with undo/redo', function () {
                testCodeEditor_1.withTestCodeEditor([
                    'hello',
                    'there',
                    'world'
                ], {}, function (editor, cursor) {
                    var model = editor.getModel();
                    var action = new linesOperations_1.DeleteAllRightAction();
                    editor.setSelections([
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(1, 6, 1, 6),
                        new selection_1.Selection(3, 4, 3, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(model.getLinesContent(), ['hethere', 'wor']);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(2, 4, 2, 4)
                    ]);
                    editor.trigger('tests', editorCommon_1.Handler.Undo, {});
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(1, 6, 1, 6),
                        new selection_1.Selection(3, 4, 3, 4)
                    ]);
                    editor.trigger('tests', editorCommon_1.Handler.Redo, {});
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 3, 1, 3),
                        new selection_1.Selection(2, 4, 2, 4)
                    ]);
                });
            });
        });
        test('InsertLineBeforeAction', function () {
            function testInsertLineBefore(lineNumber, column, callback) {
                var TEXT = [
                    'First line',
                    'Second line',
                    'Third line'
                ];
                testCodeEditor_1.withTestCodeEditor(TEXT, {}, function (editor, cursor) {
                    editor.setPosition(new position_1.Position(lineNumber, column));
                    var insertLineBeforeAction = new linesOperations_1.InsertLineBeforeAction();
                    insertLineBeforeAction.run(null, editor);
                    callback(editor.getModel(), cursor);
                });
            }
            testInsertLineBefore(1, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(1, 1, 1, 1));
                assert.equal(model.getLineContent(1), '');
                assert.equal(model.getLineContent(2), 'First line');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(2, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(2, 1, 2, 1));
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineBefore(3, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(3, 1, 3, 1));
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), 'Third line');
            });
        });
        test('InsertLineAfterAction', function () {
            function testInsertLineAfter(lineNumber, column, callback) {
                var TEXT = [
                    'First line',
                    'Second line',
                    'Third line'
                ];
                testCodeEditor_1.withTestCodeEditor(TEXT, {}, function (editor, cursor) {
                    editor.setPosition(new position_1.Position(lineNumber, column));
                    var insertLineAfterAction = new linesOperations_1.InsertLineAfterAction();
                    insertLineAfterAction.run(null, editor);
                    callback(editor.getModel(), cursor);
                });
            }
            testInsertLineAfter(1, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(2, 1, 2, 1));
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), '');
                assert.equal(model.getLineContent(3), 'Second line');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(2, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(3, 1, 3, 1));
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), '');
                assert.equal(model.getLineContent(4), 'Third line');
            });
            testInsertLineAfter(3, 3, function (model, cursor) {
                assert.deepEqual(cursor.getSelection(), new selection_1.Selection(4, 1, 4, 1));
                assert.equal(model.getLineContent(1), 'First line');
                assert.equal(model.getLineContent(2), 'Second line');
                assert.equal(model.getLineContent(3), 'Third line');
                assert.equal(model.getLineContent(4), '');
            });
        });
        test('Bug 18276:[editor] Indentation broken when selection is empty', function () {
            var model = textModel_1.TextModel.createFromString([
                'function baz() {'
            ].join('\n'), {
                defaultEOL: model_1.DefaultEndOfLine.LF,
                detectIndentation: false,
                insertSpaces: false,
                tabSize: 4,
                trimAutoWhitespace: true
            });
            testCodeEditor_1.withTestCodeEditor(null, { model: model }, function (editor, cursor) {
                var indentLinesAction = new linesOperations_1.IndentLinesAction();
                editor.setPosition(new position_1.Position(1, 2));
                indentLinesAction.run(null, editor);
                assert.equal(model.getLineContent(1), '\tfunction baz() {');
                assert.deepEqual(editor.getSelection(), new selection_1.Selection(1, 3, 1, 3));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.equal(model.getLineContent(1), '\tf\tunction baz() {');
            });
            model.dispose();
        });
    });
});
