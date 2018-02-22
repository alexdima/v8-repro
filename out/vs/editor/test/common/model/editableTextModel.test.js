/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel", "vs/editor/common/model/mirrorTextModel", "vs/editor/test/common/model/editableTextModelTestUtils"], function (require, exports, assert, range_1, model_1, textModel_1, mirrorTextModel_1, editableTextModelTestUtils_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createEditableTextModelFromString(text) {
        return new textModel_1.TextModel(text, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null);
    }
    suite('EditorModel - EditableTextModel.applyEdits updates mightContainRTL', function () {
        function testApplyEdits(original, edits, before, after) {
            var model = createEditableTextModelFromString(original.join('\n'));
            model.setEOL(model_1.EndOfLineSequence.LF);
            assert.equal(model.mightContainRTL(), before);
            model.applyEdits(edits);
            assert.equal(model.mightContainRTL(), after);
            model.dispose();
        }
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n')
            };
        }
        test('start with RTL, insert LTR', function () {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 1, 1, ['hello'])], true, true);
        });
        test('start with RTL, delete RTL', function () {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 10, 10, [''])], true, true);
        });
        test('start with RTL, insert RTL', function () {
            testApplyEdits(['Hello,\nזוהי עובדה מבוססת שדעתו'], [editOp(1, 1, 1, 1, ['هناك حقيقة مثبتة منذ زمن طويل'])], true, true);
        });
        test('start with LTR, insert LTR', function () {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['hello'])], false, false);
        });
        test('start with LTR, insert RTL 1', function () {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['هناك حقيقة مثبتة منذ زمن طويل'])], false, true);
        });
        test('start with LTR, insert RTL 2', function () {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['זוהי עובדה מבוססת שדעתו'])], false, true);
        });
    });
    suite('EditorModel - EditableTextModel.applyEdits updates mightContainNonBasicASCII', function () {
        function testApplyEdits(original, edits, before, after) {
            var model = createEditableTextModelFromString(original.join('\n'));
            model.setEOL(model_1.EndOfLineSequence.LF);
            assert.equal(model.mightContainNonBasicASCII(), before);
            model.applyEdits(edits);
            assert.equal(model.mightContainNonBasicASCII(), after);
            model.dispose();
        }
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n')
            };
        }
        test('start with NON-ASCII, insert ASCII', function () {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 1, 1, ['hello', 'second line'])], true, true);
        });
        test('start with NON-ASCII, delete NON-ASCII', function () {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 10, 10, [''])], true, true);
        });
        test('start with NON-ASCII, insert NON-ASCII', function () {
            testApplyEdits(['Hello,\nZürich'], [editOp(1, 1, 1, 1, ['Zürich'])], true, true);
        });
        test('start with ASCII, insert ASCII', function () {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['hello', 'second line'])], false, false);
        });
        test('start with ASCII, insert NON-ASCII', function () {
            testApplyEdits(['Hello,\nworld!'], [editOp(1, 1, 1, 1, ['Zürich', 'Zürich'])], false, true);
        });
    });
    suite('EditorModel - EditableTextModel.applyEdits', function () {
        function editOp(startLineNumber, startColumn, endLineNumber, endColumn, text) {
            return {
                identifier: null,
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                text: text.join('\n'),
                forceMoveMarkers: false
            };
        }
        test('high-low surrogates 1', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 2, 1, 2, ['a'])
            ], [
                'a📚some',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 2', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 2, 1, 3, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 3', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 1, 1, 2, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('high-low surrogates 4', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '📚some',
                'very nice',
                'text'
            ], [
                editOp(1, 1, 1, 3, ['a'])
            ], [
                'asome',
                'very nice',
                'text'
            ], 
            /*inputEditsAreInvalid*/ true);
        });
        test('Bug 19872: Undo is funky', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'something',
                ' A',
                '',
                ' B',
                'something else'
            ], [
                editOp(2, 1, 2, 2, ['']),
                editOp(3, 1, 4, 2, [''])
            ], [
                'something',
                'A',
                'B',
                'something else'
            ]);
        });
        test('Bug 19872: Undo is funky', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'something',
                'A',
                'B',
                'something else'
            ], [
                editOp(2, 1, 2, 1, [' ']),
                editOp(3, 1, 3, 1, ['', ' '])
            ], [
                'something',
                ' A',
                '',
                ' B',
                'something else'
            ]);
        });
        test('insert empty text', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, [''])
            ], [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('last op is no-op', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(4, 1, 4, 1, [''])
            ], [
                'y First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text without newline 1', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, ['foo '])
            ], [
                'foo My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text without newline 2', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' foo'])
            ], [
                'My foo First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert one newline', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 1, 4, ['', ''])
            ], [
                'My ',
                'First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with one newline', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' new line', 'No longer'])
            ], [
                'My new line',
                'No longer First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with two newlines', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, [' new line', 'One more line in the middle', 'No longer'])
            ], [
                'My new line',
                'One more line in the middle',
                'No longer First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert text with many newlines', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, ['', '', '', '', ''])
            ], [
                'My',
                '',
                '',
                '',
                ' First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('insert multiple newlines', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 3, 1, 3, ['', '', '', '', '']),
                editOp(3, 15, 3, 15, ['a', 'b'])
            ], [
                'My',
                '',
                '',
                '',
                ' First Line',
                '\t\tMy Second Line',
                '    Third Linea',
                'b',
                '',
                '1'
            ]);
        });
        test('delete empty text', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 1, [''])
            ], [
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from one line', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 2, [''])
            ], [
                'y First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from one line 2', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 3, ['a'])
            ], [
                'a First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete all text from a line', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 1, 14, [''])
            ], [
                '',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from two lines', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 2, 6, [''])
            ], [
                'My Second Line',
                '    Third Line',
                '',
                '1'
            ]);
        });
        test('delete text from many lines', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 4, 3, 5, [''])
            ], [
                'My Third Line',
                '',
                '1'
            ]);
        });
        test('delete everything', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '1'
            ], [
                editOp(1, 1, 5, 2, [''])
            ], [
                ''
            ]);
        });
        test('two unrelated edits', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'My First Line',
                '\t\tMy Second Line',
                '    Third Line',
                '',
                '123'
            ], [
                editOp(2, 1, 2, 3, ['\t']),
                editOp(3, 1, 3, 5, [''])
            ], [
                'My First Line',
                '\tMy Second Line',
                'Third Line',
                '',
                '123'
            ]);
        });
        test('two edits on one line', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\t<!@#fifth#@!>\t\t'
            ], [
                editOp(5, 3, 5, 7, ['']),
                editOp(5, 12, 5, 16, [''])
            ], [
                '\t\tfirst\t    ',
                '\t\tsecond line',
                '\tthird line',
                'fourth line',
                '\t\tfifth\t\t'
            ]);
        });
        test('many edits', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '{"x" : 1}'
            ], [
                editOp(1, 2, 1, 2, ['\n  ']),
                editOp(1, 5, 1, 6, ['']),
                editOp(1, 9, 1, 9, ['\n'])
            ], [
                '{',
                '  "x": 1',
                '}'
            ]);
        });
        test('many edits reversed', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '{',
                '  "x": 1',
                '}'
            ], [
                editOp(1, 2, 2, 3, ['']),
                editOp(2, 6, 2, 6, [' ']),
                editOp(2, 9, 3, 1, [''])
            ], [
                '{"x" : 1}'
            ]);
        });
        test('replacing newlines 1', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '{',
                '"a": true,',
                '',
                '"b": true',
                '}'
            ], [
                editOp(1, 2, 2, 1, ['', '\t']),
                editOp(2, 11, 4, 1, ['', '\t'])
            ], [
                '{',
                '\t"a": true,',
                '\t"b": true',
                '}'
            ]);
        });
        test('replacing newlines 2', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'some text',
                'some more text',
                'now comes an empty line',
                '',
                'after empty line',
                'and the last line'
            ], [
                editOp(1, 5, 3, 1, [' text', 'some more text', 'some more text']),
                editOp(3, 2, 4, 1, ['o more lines', 'asd', 'asd', 'asd']),
                editOp(5, 1, 5, 6, ['zzzzzzzz']),
                editOp(5, 11, 6, 16, ['1', '2', '3', '4'])
            ], [
                'some text',
                'some more text',
                'some more textno more lines',
                'asd',
                'asd',
                'asd',
                'zzzzzzzz empt1',
                '2',
                '3',
                '4ne'
            ]);
        });
        test('advanced 1', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                ' {       "d": [',
                '             null',
                '        ] /*comment*/',
                '        ,"e": /*comment*/ [null] }',
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 3, 1, 10, ['', '  ']),
                editOp(1, 16, 2, 14, ['', '    ']),
                editOp(2, 18, 3, 9, ['', '  ']),
                editOp(3, 22, 4, 9, ['']),
                editOp(4, 10, 4, 10, ['', '  ']),
                editOp(4, 28, 4, 28, ['', '    ']),
                editOp(4, 32, 4, 32, ['', '  ']),
                editOp(4, 33, 4, 34, ['', ''])
            ], [
                '{',
                '  "d": [',
                '    null',
                '  ] /*comment*/,',
                '  "e": /*comment*/ [',
                '    null',
                '  ]',
                '}',
            ]);
        });
        test('advanced simplified', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                '   abc',
                ' ,def'
            ], [
                editOp(1, 1, 1, 4, ['']),
                editOp(1, 7, 2, 2, ['']),
                editOp(2, 3, 2, 3, ['', ''])
            ], [
                'abc,',
                'def'
            ]);
        });
        test('issue #144', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'package caddy',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ], [
                editOp(1, 1, 6, 1, [
                    'package caddy',
                    '',
                    'import "fmt"',
                    '',
                    'func main() {',
                    '\tfmt.Println("Hello World! :)")',
                    '}',
                    ''
                ])
            ], [
                'package caddy',
                '',
                'import "fmt"',
                '',
                'func main() {',
                '\tfmt.Println("Hello World! :)")',
                '}',
                ''
            ]);
        });
        test('issue #2586 Replacing selected end-of-line with newline locks up the document', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'something',
                'interesting'
            ], [
                editOp(1, 10, 2, 1, ['', ''])
            ], [
                'something',
                'interesting'
            ]);
        });
        test('issue #3980', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'class A {',
                '    someProperty = false;',
                '    someMethod() {',
                '    this.someMethod();',
                '    }',
                '}',
            ], [
                editOp(1, 8, 1, 9, ['', '']),
                editOp(3, 17, 3, 18, ['', '']),
                editOp(3, 18, 3, 18, ['    ']),
                editOp(4, 5, 4, 5, ['    ']),
            ], [
                'class A',
                '{',
                '    someProperty = false;',
                '    someMethod()',
                '    {',
                '        this.someMethod();',
                '    }',
                '}',
            ]);
        });
        function testApplyEditsFails(original, edits) {
            var model = createEditableTextModelFromString(original.join('\n'));
            var hasThrown = false;
            try {
                model.applyEdits(edits);
            }
            catch (err) {
                hasThrown = true;
            }
            assert.ok(hasThrown, 'expected model.applyEdits to fail.');
            model.dispose();
        }
        test('touching edits: two inserts at the same position', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['a']),
                editOp(1, 1, 1, 1, ['b']),
            ], [
                'abhello world'
            ]);
        });
        test('touching edits: insert and replace touching', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['b']),
                editOp(1, 1, 1, 3, ['ab']),
            ], [
                'babllo world'
            ]);
        });
        test('overlapping edits: two overlapping replaces', function () {
            testApplyEditsFails([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['b']),
                editOp(1, 1, 1, 3, ['ab']),
            ]);
        });
        test('overlapping edits: two overlapping deletes', function () {
            testApplyEditsFails([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 1, 1, 3, ['']),
            ]);
        });
        test('touching edits: two touching replaces', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['H']),
                editOp(1, 2, 1, 3, ['E']),
            ], [
                'HEllo world'
            ]);
        });
        test('touching edits: two touching deletes', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 2, ['']),
                editOp(1, 2, 1, 3, ['']),
            ], [
                'llo world'
            ]);
        });
        test('touching edits: insert and replace', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 1, ['H']),
                editOp(1, 1, 1, 3, ['e']),
            ], [
                'Hello world'
            ]);
        });
        test('touching edits: replace and insert', function () {
            editableTextModelTestUtils_1.testApplyEditsWithSyncedModels([
                'hello world'
            ], [
                editOp(1, 1, 1, 3, ['H']),
                editOp(1, 3, 1, 3, ['e']),
            ], [
                'Hello world'
            ]);
        });
        test('change while emitting events 1', function () {
            editableTextModelTestUtils_1.assertSyncedModels('Hello', function (model, assertMirrorModels) {
                model.applyEdits([{
                        range: new range_1.Range(1, 6, 1, 6),
                        text: ' world!',
                    }]);
                assertMirrorModels();
            }, function (model) {
                var isFirstTime = true;
                model.onDidChangeRawContent(function () {
                    if (!isFirstTime) {
                        return;
                    }
                    isFirstTime = false;
                    model.applyEdits([{
                            range: new range_1.Range(1, 13, 1, 13),
                            text: ' How are you?',
                        }]);
                });
            });
        });
        test('change while emitting events 2', function () {
            editableTextModelTestUtils_1.assertSyncedModels('Hello', function (model, assertMirrorModels) {
                model.applyEdits([{
                        range: new range_1.Range(1, 6, 1, 6),
                        text: ' world!',
                    }]);
                assertMirrorModels();
            }, function (model) {
                var isFirstTime = true;
                model.onDidChangeContent(function (e) {
                    if (!isFirstTime) {
                        return;
                    }
                    isFirstTime = false;
                    model.applyEdits([{
                            range: new range_1.Range(1, 13, 1, 13),
                            text: ' How are you?',
                        }]);
                });
            });
        });
        test('issue #1580: Changes in line endings are not correctly reflected in the extension host, leading to invalid offsets sent to external refactoring tools', function () {
            var model = createEditableTextModelFromString('Hello\nWorld!');
            assert.equal(model.getEOL(), '\n');
            var mirrorModel2 = new mirrorTextModel_1.MirrorTextModel(null, model.getLinesContent(), model.getEOL(), model.getVersionId());
            var mirrorModel2PrevVersionId = model.getVersionId();
            model.onDidChangeContent(function (e) {
                var versionId = e.versionId;
                if (versionId < mirrorModel2PrevVersionId) {
                    console.warn('Model version id did not advance between edits (2)');
                }
                mirrorModel2PrevVersionId = versionId;
                mirrorModel2.onEvents(e);
            });
            var assertMirrorModels = function () {
                assert.equal(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
                assert.equal(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
            };
            model.setEOL(model_1.EndOfLineSequence.CRLF);
            assertMirrorModels();
            model.dispose();
            mirrorModel2.dispose();
        });
    });
});
