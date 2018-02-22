define(["require", "exports", "assert", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/core/selection", "vs/editor/contrib/multicursor/multicursor", "vs/editor/common/editorCommon", "vs/editor/common/model", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/serviceCollection", "vs/editor/contrib/find/findController"], function (require, exports, assert, testCodeEditor_1, selection_1, multicursor_1, editorCommon_1, model_1, storage_1, serviceCollection_1, findController_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Multicursor', function () {
        test('issue #2205: Multi-cursor pastes in reverse order', function () {
            testCodeEditor_1.withTestCodeEditor([
                'abc',
                'def'
            ], {}, function (editor, cursor) {
                var addCursorUpAction = new multicursor_1.InsertCursorAbove();
                editor.setSelection(new selection_1.Selection(2, 1, 2, 1));
                addCursorUpAction.run(null, editor, {});
                assert.equal(cursor.getSelections().length, 2);
                editor.trigger('test', editorCommon_1.Handler.Paste, {
                    text: '1\n2',
                    multicursorText: [
                        '1',
                        '2'
                    ]
                });
                // cursorCommand(cursor, H.Paste, { text: '1\n2' });
                assert.equal(editor.getModel().getLineContent(1), '1abc');
                assert.equal(editor.getModel().getLineContent(2), '2def');
            });
        });
        test('issue #1336: Insert cursor below on last line adds a cursor to the end of the current line', function () {
            testCodeEditor_1.withTestCodeEditor([
                'abc'
            ], {}, function (editor, cursor) {
                var addCursorDownAction = new multicursor_1.InsertCursorBelow();
                addCursorDownAction.run(null, editor, {});
                assert.equal(cursor.getSelections().length, 1);
            });
        });
    });
    function fromRange(rng) {
        return [rng.startLineNumber, rng.startColumn, rng.endLineNumber, rng.endColumn];
    }
    suite('Multicursor selection', function () {
        var queryState = {};
        var serviceCollection = new serviceCollection_1.ServiceCollection();
        serviceCollection.set(storage_1.IStorageService, {
            get: function (key) { return queryState[key]; },
            getBoolean: function (key) { return !!queryState[key]; },
            store: function (key, value) { queryState[key] = value; }
        });
        test('issue #8817: Cursor position changes when you cancel multicursor', function () {
            testCodeEditor_1.withTestCodeEditor([
                'var x = (3 * 5)',
                'var y = (3 * 5)',
                'var z = (3 * 5)',
            ], { serviceCollection: serviceCollection }, function (editor, cursor) {
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                var selectHighlightsAction = new multicursor_1.SelectHighlightsAction();
                editor.setSelection(new selection_1.Selection(2, 9, 2, 16));
                selectHighlightsAction.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [2, 9, 2, 16],
                    [1, 9, 1, 16],
                    [3, 9, 3, 16],
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepEqual(fromRange(editor.getSelection()), [2, 9, 2, 16]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #5400: "Select All Occurrences of Find Match" does not select all if find uses regex', function () {
            testCodeEditor_1.withTestCodeEditor([
                'something',
                'someething',
                'someeething',
                'nothing'
            ], { serviceCollection: serviceCollection }, function (editor, cursor) {
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                var selectHighlightsAction = new multicursor_1.SelectHighlightsAction();
                editor._isFocused = false;
                editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
                findController.getState().change({ searchString: 'some+thing', isRegex: true, isRevealed: true }, false);
                selectHighlightsAction.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 10],
                    [2, 1, 2, 11],
                    [3, 1, 3, 12],
                ]);
                assert.equal(findController.getState().searchString, 'some+thing');
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('AddSelectionToNextFindMatchAction can work with multiline', function () {
            testCodeEditor_1.withTestCodeEditor([
                '',
                'qwe',
                'rty',
                '',
                'qwe',
                '',
                'rty',
                'qwe',
                'rty'
            ], { serviceCollection: serviceCollection }, function (editor, cursor) {
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                var addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(2, 1, 3, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [2, 1, 3, 4],
                    [8, 1, 9, 4]
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepEqual(fromRange(editor.getSelection()), [2, 1, 3, 4]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #6661: AddSelectionToNextFindMatchAction can work with touching ranges', function () {
            testCodeEditor_1.withTestCodeEditor([
                'abcabc',
                'abc',
                'abcabc',
            ], { serviceCollection: serviceCollection }, function (editor, cursor) {
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                var addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(1, 1, 1, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 4],
                    [1, 4, 1, 7]
                ]);
                addSelectionToNextFindMatch.run(null, editor);
                addSelectionToNextFindMatch.run(null, editor);
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [1, 1, 1, 4],
                    [1, 4, 1, 7],
                    [2, 1, 2, 4],
                    [3, 1, 3, 4],
                    [3, 4, 3, 7]
                ]);
                editor.trigger('test', editorCommon_1.Handler.Type, { text: 'z' });
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [1, 2, 1, 2],
                    [1, 3, 1, 3],
                    [2, 2, 2, 2],
                    [3, 2, 3, 2],
                    [3, 3, 3, 3]
                ]);
                assert.equal(editor.getValue(), [
                    'zz',
                    'z',
                    'zz',
                ].join('\n'));
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        test('issue #23541: Multiline Ctrl+D does not work in CRLF files', function () {
            testCodeEditor_1.withTestCodeEditor([
                '',
                'qwe',
                'rty',
                '',
                'qwe',
                '',
                'rty',
                'qwe',
                'rty'
            ], { serviceCollection: serviceCollection }, function (editor, cursor) {
                editor.getModel().setEOL(model_1.EndOfLineSequence.CRLF);
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                var addSelectionToNextFindMatch = new multicursor_1.AddSelectionToNextFindMatchAction();
                editor.setSelection(new selection_1.Selection(2, 1, 3, 4));
                addSelectionToNextFindMatch.run(null, editor);
                assert.deepEqual(editor.getSelections().map(fromRange), [
                    [2, 1, 3, 4],
                    [8, 1, 9, 4]
                ]);
                editor.trigger('test', 'removeSecondaryCursors', null);
                assert.deepEqual(fromRange(editor.getSelection()), [2, 1, 3, 4]);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        });
        function testMulticursor(text, callback) {
            testCodeEditor_1.withTestCodeEditor(text, { serviceCollection: serviceCollection }, function (editor, cursor) {
                var findController = editor.registerAndInstantiateContribution(findController_1.CommonFindController);
                var multiCursorSelectController = editor.registerAndInstantiateContribution(multicursor_1.MultiCursorSelectionController);
                callback(editor, findController);
                multiCursorSelectController.dispose();
                findController.dispose();
            });
        }
        function testAddSelectionToNextFindMatchAction(text, callback) {
            testMulticursor(text, function (editor, findController) {
                var action = new multicursor_1.AddSelectionToNextFindMatchAction();
                callback(editor, action, findController);
            });
        }
        test('AddSelectionToNextFindMatchAction starting with single collapsed selection', function () {
            var text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with two selections, one being collapsed 1)', function () {
            var text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 2, 2, 2),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with two selections, one being collapsed 2)', function () {
            var text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with all collapsed selections', function () {
            var text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 2, 1, 2),
                    new selection_1.Selection(2, 2, 2, 2),
                    new selection_1.Selection(3, 1, 3, 1),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(2, 1, 2, 4),
                    new selection_1.Selection(3, 1, 3, 4),
                ]);
            });
        });
        test('AddSelectionToNextFindMatchAction starting with all collapsed selections on different words', function () {
            var text = [
                'abc pizza',
                'abc house',
                'abc bar'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 6, 1, 6),
                    new selection_1.Selection(2, 6, 2, 6),
                    new selection_1.Selection(3, 6, 3, 6),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 5, 1, 10),
                    new selection_1.Selection(2, 5, 2, 10),
                    new selection_1.Selection(3, 5, 3, 8),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 5, 1, 10),
                    new selection_1.Selection(2, 5, 2, 10),
                    new selection_1.Selection(3, 5, 3, 8),
                ]);
            });
        });
        test('issue #20651: AddSelectionToNextFindMatchAction case insensitive', function () {
            var text = [
                'test',
                'testte',
                'Test',
                'testte',
                'test'
            ];
            testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 5),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                    new selection_1.Selection(5, 1, 5, 5),
                ]);
                action.run(null, editor);
                assert.deepEqual(editor.getSelections(), [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                    new selection_1.Selection(5, 1, 5, 5),
                ]);
            });
        });
        suite('Find state disassociation', function () {
            var text = [
                'app',
                'apples',
                'whatsapp',
                'app',
                'App',
                ' app'
            ];
            test('enters mode', function () {
                testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                });
            });
            test('leaves mode when selection changes', function () {
                testAddSelectionToNextFindMatchAction(text, function (editor, action, findController) {
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                    ]);
                    // change selection
                    editor.setSelections([
                        new selection_1.Selection(1, 1, 1, 4),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(2, 1, 2, 4),
                    ]);
                });
            });
            test('Select Highlights respects mode ', function () {
                testMulticursor(text, function (editor, findController) {
                    var action = new multicursor_1.SelectHighlightsAction();
                    editor.setSelections([
                        new selection_1.Selection(1, 2, 1, 2),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                    action.run(null, editor);
                    assert.deepEqual(editor.getSelections(), [
                        new selection_1.Selection(1, 1, 1, 4),
                        new selection_1.Selection(4, 1, 4, 4),
                        new selection_1.Selection(6, 2, 6, 5),
                    ]);
                });
            });
        });
    });
});
