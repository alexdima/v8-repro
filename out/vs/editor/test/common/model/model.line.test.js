define(["require", "exports", "assert", "vs/editor/common/core/lineTokens", "vs/editor/common/modes", "vs/editor/common/core/range", "vs/editor/test/common/core/viewLineToken", "vs/editor/common/model/textModel"], function (require, exports, assert, lineTokens_1, modes_1, range_1, viewLineToken_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertLineTokens(__actual, _expected) {
        var tmp = TestToken.toTokens(_expected);
        lineTokens_1.LineTokens.convertToEndOffset(tmp, __actual.getLineContent().length);
        var expected = viewLineToken_1.ViewLineTokenFactory.inflateArr(tmp);
        var _actual = __actual.inflate();
        var actual = [];
        for (var i = 0, len = _actual.getCount(); i < len; i++) {
            actual[i] = {
                endIndex: _actual.getEndOffset(i),
                type: _actual.getClassName(i)
            };
        }
        var decode = function (token) {
            return {
                endIndex: token.endIndex,
                type: token.getType()
            };
        };
        assert.deepEqual(actual, expected.map(decode));
    }
    suite('ModelLine - getIndentLevel', function () {
        function assertIndentLevel(text, expected, tabSize) {
            if (tabSize === void 0) { tabSize = 4; }
            var actual = textModel_1.TextModel.computeIndentLevel(text, tabSize);
            assert.equal(actual, expected, text);
        }
        test('getIndentLevel', function () {
            assertIndentLevel('', -1);
            assertIndentLevel(' ', -1);
            assertIndentLevel('   \t', -1);
            assertIndentLevel('Hello', 0);
            assertIndentLevel(' Hello', 1);
            assertIndentLevel('   Hello', 3);
            assertIndentLevel('\tHello', 4);
            assertIndentLevel(' \tHello', 4);
            assertIndentLevel('  \tHello', 4);
            assertIndentLevel('   \tHello', 4);
            assertIndentLevel('    \tHello', 8);
            assertIndentLevel('     \tHello', 8);
            assertIndentLevel('\t Hello', 5);
            assertIndentLevel('\t \tHello', 8);
        });
    });
    var TestToken = /** @class */ (function () {
        function TestToken(startOffset, color) {
            this.startOffset = startOffset;
            this.color = color;
        }
        TestToken.toTokens = function (tokens) {
            if (tokens === null) {
                return null;
            }
            var tokensLen = tokens.length;
            var result = new Uint32Array((tokensLen << 1));
            for (var i = 0; i < tokensLen; i++) {
                var token = tokens[i];
                result[(i << 1)] = token.startOffset;
                result[(i << 1) + 1] = (token.color << 14 /* FOREGROUND_OFFSET */) >>> 0;
            }
            return result;
        };
        return TestToken;
    }());
    suite('ModelLinesTokens', function () {
        function testApplyEdits(initial, edits, expected) {
            var initialText = initial.map(function (el) { return el.text; }).join('\n');
            var model = new textModel_1.TextModel(initialText, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, new modes_1.LanguageIdentifier('test', 0));
            for (var lineIndex = 0; lineIndex < initial.length; lineIndex++) {
                var lineTokens = initial[lineIndex].tokens;
                var lineTextLength = model.getLineMaxColumn(lineIndex + 1) - 1;
                model._tokens._setTokens(0, lineIndex, lineTextLength, TestToken.toTokens(lineTokens));
            }
            model.applyEdits(edits.map(function (ed) { return ({
                identifier: null,
                range: ed.range,
                text: ed.text,
                forceMoveMarkers: false
            }); }));
            for (var lineIndex = 0; lineIndex < expected.length; lineIndex++) {
                var actualLine = model.getLineContent(lineIndex + 1);
                var actualTokens = model.getLineTokens(lineIndex + 1);
                assert.equal(actualLine, expected[lineIndex].text);
                assertLineTokens(actualTokens, expected[lineIndex].tokens);
            }
        }
        test('single delete 1', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 1, 1, 2), text: '' }], [{
                    text: 'ello world',
                    tokens: [new TestToken(0, 1), new TestToken(4, 2), new TestToken(5, 3)]
                }]);
        });
        test('single delete 2', function () {
            testApplyEdits([{
                    text: 'helloworld',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2)]
                }], [{ range: new range_1.Range(1, 3, 1, 8), text: '' }], [{
                    text: 'herld',
                    tokens: [new TestToken(0, 1), new TestToken(2, 2)]
                }]);
        });
        test('single delete 3', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 1, 1, 6), text: '' }], [{
                    text: ' world',
                    tokens: [new TestToken(0, 2), new TestToken(1, 3)]
                }]);
        });
        test('single delete 4', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 2, 1, 7), text: '' }], [{
                    text: 'hworld',
                    tokens: [new TestToken(0, 1), new TestToken(1, 3)]
                }]);
        });
        test('single delete 5', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 1, 1, 12), text: '' }], [{
                    text: '',
                    tokens: [new TestToken(0, 1)]
                }]);
        });
        test('multi delete 6', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 7), new TestToken(5, 8), new TestToken(6, 9)]
                }], [{ range: new range_1.Range(1, 6, 3, 6), text: '' }], [{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 8), new TestToken(6, 9)]
                }]);
        });
        test('multi delete 7', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 7), new TestToken(5, 8), new TestToken(6, 9)]
                }], [{ range: new range_1.Range(1, 12, 3, 12), text: '' }], [{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }]);
        });
        test('multi delete 8', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 7), new TestToken(5, 8), new TestToken(6, 9)]
                }], [{ range: new range_1.Range(1, 1, 3, 1), text: '' }], [{
                    text: 'hello world',
                    tokens: [new TestToken(0, 7), new TestToken(5, 8), new TestToken(6, 9)]
                }]);
        });
        test('multi delete 9', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 7), new TestToken(5, 8), new TestToken(6, 9)]
                }], [{ range: new range_1.Range(1, 12, 3, 1), text: '' }], [{
                    text: 'hello worldhello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3), new TestToken(11, 7), new TestToken(16, 8), new TestToken(17, 9)]
                }]);
        });
        test('single insert 1', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 1, 1, 1), text: 'xx' }], [{
                    text: 'xxhello world',
                    tokens: [new TestToken(0, 1), new TestToken(7, 2), new TestToken(8, 3)]
                }]);
        });
        test('single insert 2', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 2, 1, 2), text: 'xx' }], [{
                    text: 'hxxello world',
                    tokens: [new TestToken(0, 1), new TestToken(7, 2), new TestToken(8, 3)]
                }]);
        });
        test('single insert 3', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 6, 1, 6), text: 'xx' }], [{
                    text: 'helloxx world',
                    tokens: [new TestToken(0, 1), new TestToken(7, 2), new TestToken(8, 3)]
                }]);
        });
        test('single insert 4', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 7, 1, 7), text: 'xx' }], [{
                    text: 'hello xxworld',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(8, 3)]
                }]);
        });
        test('single insert 5', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 12, 1, 12), text: 'xx' }], [{
                    text: 'hello worldxx',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }]);
        });
        test('multi insert 6', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 1, 1, 1), text: '\n' }], [{
                    text: '',
                    tokens: [new TestToken(0, 1)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 1)]
                }]);
        });
        test('multi insert 7', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 12, 1, 12), text: '\n' }], [{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: '',
                    tokens: [new TestToken(0, 1)]
                }]);
        });
        test('multi insert 8', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }], [{ range: new range_1.Range(1, 7, 1, 7), text: '\n' }], [{
                    text: 'hello ',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2)]
                }, {
                    text: 'world',
                    tokens: [new TestToken(0, 1)]
                }]);
        });
        test('multi insert 9', function () {
            testApplyEdits([{
                    text: 'hello world',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2), new TestToken(6, 3)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }], [{ range: new range_1.Range(1, 7, 1, 7), text: 'xx\nyy' }], [{
                    text: 'hello xx',
                    tokens: [new TestToken(0, 1), new TestToken(5, 2)]
                }, {
                    text: 'yyworld',
                    tokens: [new TestToken(0, 1)]
                }, {
                    text: 'hello world',
                    tokens: [new TestToken(0, 4), new TestToken(5, 5), new TestToken(6, 6)]
                }]);
        });
        function testLineEditTokens(initialText, initialTokens, edits, expectedText, expectedTokens) {
            testApplyEdits([{
                    text: initialText,
                    tokens: initialTokens
                }], edits.map(function (ed) { return ({
                range: new range_1.Range(1, ed.startColumn, 1, ed.endColumn),
                text: ed.text
            }); }), [{
                    text: expectedText,
                    tokens: expectedTokens
                }]);
        }
        test('insertion on empty line', function () {
            var model = new textModel_1.TextModel('some text', textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, new modes_1.LanguageIdentifier('test', 0));
            model._tokens._setTokens(0, 0, model.getLineMaxColumn(1) - 1, TestToken.toTokens([new TestToken(0, 1)]));
            model.applyEdits([{
                    range: new range_1.Range(1, 1, 1, 10),
                    text: ''
                }]);
            model._tokens._setTokens(0, 0, model.getLineMaxColumn(1) - 1, new Uint32Array(0));
            model.applyEdits([{
                    range: new range_1.Range(1, 1, 1, 1),
                    text: 'a'
                }]);
            var actualTokens = model.getLineTokens(1);
            assertLineTokens(actualTokens, [new TestToken(0, 1)]);
        });
        test('updates tokens on insertion 1', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 1,
                    text: 'a',
                }], 'aabcd efgh', [
                new TestToken(0, 1),
                new TestToken(5, 2),
                new TestToken(6, 3)
            ]);
        });
        test('updates tokens on insertion 2', function () {
            testLineEditTokens('aabcd efgh', [
                new TestToken(0, 1),
                new TestToken(5, 2),
                new TestToken(6, 3)
            ], [{
                    startColumn: 2,
                    endColumn: 2,
                    text: 'x',
                }], 'axabcd efgh', [
                new TestToken(0, 1),
                new TestToken(6, 2),
                new TestToken(7, 3)
            ]);
        });
        test('updates tokens on insertion 3', function () {
            testLineEditTokens('axabcd efgh', [
                new TestToken(0, 1),
                new TestToken(6, 2),
                new TestToken(7, 3)
            ], [{
                    startColumn: 3,
                    endColumn: 3,
                    text: 'stu',
                }], 'axstuabcd efgh', [
                new TestToken(0, 1),
                new TestToken(9, 2),
                new TestToken(10, 3)
            ]);
        });
        test('updates tokens on insertion 4', function () {
            testLineEditTokens('axstuabcd efgh', [
                new TestToken(0, 1),
                new TestToken(9, 2),
                new TestToken(10, 3)
            ], [{
                    startColumn: 10,
                    endColumn: 10,
                    text: '\t',
                }], 'axstuabcd\t efgh', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(11, 3)
            ]);
        });
        test('updates tokens on insertion 5', function () {
            testLineEditTokens('axstuabcd\t efgh', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(11, 3)
            ], [{
                    startColumn: 12,
                    endColumn: 12,
                    text: 'dd',
                }], 'axstuabcd\t ddefgh', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(13, 3)
            ]);
        });
        test('updates tokens on insertion 6', function () {
            testLineEditTokens('axstuabcd\t ddefgh', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(13, 3)
            ], [{
                    startColumn: 18,
                    endColumn: 18,
                    text: 'xyz',
                }], 'axstuabcd\t ddefghxyz', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(13, 3)
            ]);
        });
        test('updates tokens on insertion 7', function () {
            testLineEditTokens('axstuabcd\t ddefghxyz', [
                new TestToken(0, 1),
                new TestToken(10, 2),
                new TestToken(13, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 1,
                    text: 'x',
                }], 'xaxstuabcd\t ddefghxyz', [
                new TestToken(0, 1),
                new TestToken(11, 2),
                new TestToken(14, 3)
            ]);
        });
        test('updates tokens on insertion 8', function () {
            testLineEditTokens('xaxstuabcd\t ddefghxyz', [
                new TestToken(0, 1),
                new TestToken(11, 2),
                new TestToken(14, 3)
            ], [{
                    startColumn: 22,
                    endColumn: 22,
                    text: 'x',
                }], 'xaxstuabcd\t ddefghxyzx', [
                new TestToken(0, 1),
                new TestToken(11, 2),
                new TestToken(14, 3)
            ]);
        });
        test('updates tokens on insertion 9', function () {
            testLineEditTokens('xaxstuabcd\t ddefghxyzx', [
                new TestToken(0, 1),
                new TestToken(11, 2),
                new TestToken(14, 3)
            ], [{
                    startColumn: 2,
                    endColumn: 2,
                    text: '',
                }], 'xaxstuabcd\t ddefghxyzx', [
                new TestToken(0, 1),
                new TestToken(11, 2),
                new TestToken(14, 3)
            ]);
        });
        test('updates tokens on insertion 10', function () {
            testLineEditTokens('', null, [{
                    startColumn: 1,
                    endColumn: 1,
                    text: 'a',
                }], 'a', [
                new TestToken(0, 1)
            ]);
        });
        test('delete second token 2', function () {
            testLineEditTokens('abcdefghij', [
                new TestToken(0, 1),
                new TestToken(3, 2),
                new TestToken(6, 3)
            ], [{
                    startColumn: 4,
                    endColumn: 7,
                    text: '',
                }], 'abcghij', [
                new TestToken(0, 1),
                new TestToken(3, 3)
            ]);
        });
        test('insert right before second token', function () {
            testLineEditTokens('abcdefghij', [
                new TestToken(0, 1),
                new TestToken(3, 2),
                new TestToken(6, 3)
            ], [{
                    startColumn: 4,
                    endColumn: 4,
                    text: 'hello',
                }], 'abchellodefghij', [
                new TestToken(0, 1),
                new TestToken(8, 2),
                new TestToken(11, 3)
            ]);
        });
        test('delete first char', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 2,
                    text: '',
                }], 'bcd efgh', [
                new TestToken(0, 1),
                new TestToken(3, 2),
                new TestToken(4, 3)
            ]);
        });
        test('delete 2nd and 3rd chars', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 2,
                    endColumn: 4,
                    text: '',
                }], 'ad efgh', [
                new TestToken(0, 1),
                new TestToken(2, 2),
                new TestToken(3, 3)
            ]);
        });
        test('delete first token', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 5,
                    text: '',
                }], ' efgh', [
                new TestToken(0, 2),
                new TestToken(1, 3)
            ]);
        });
        test('delete second token', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 5,
                    endColumn: 6,
                    text: '',
                }], 'abcdefgh', [
                new TestToken(0, 1),
                new TestToken(4, 3)
            ]);
        });
        test('delete second token + a bit of the third one', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 5,
                    endColumn: 7,
                    text: '',
                }], 'abcdfgh', [
                new TestToken(0, 1),
                new TestToken(4, 3)
            ]);
        });
        test('delete second and third token', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 5,
                    endColumn: 10,
                    text: '',
                }], 'abcd', [
                new TestToken(0, 1)
            ]);
        });
        test('delete everything', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 10,
                    text: '',
                }], '', [
                new TestToken(0, 1)
            ]);
        });
        test('noop', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 1,
                    text: '',
                }], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
        test('equivalent to deleting first two chars', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 1,
                    endColumn: 3,
                    text: '',
                }], 'cd efgh', [
                new TestToken(0, 1),
                new TestToken(2, 2),
                new TestToken(3, 3)
            ]);
        });
        test('equivalent to deleting from 5 to the end', function () {
            testLineEditTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], [{
                    startColumn: 5,
                    endColumn: 10,
                    text: '',
                }], 'abcd', [
                new TestToken(0, 1)
            ]);
        });
        test('updates tokens on replace 1', function () {
            testLineEditTokens('Hello world, ciao', [
                new TestToken(0, 1),
                new TestToken(5, 0),
                new TestToken(6, 2),
                new TestToken(11, 0),
                new TestToken(13, 0)
            ], [{
                    startColumn: 1,
                    endColumn: 6,
                    text: 'Hi',
                }], 'Hi world, ciao', [
                new TestToken(0, 0),
                new TestToken(3, 2),
                new TestToken(8, 0),
                new TestToken(10, 0),
            ]);
        });
        test('updates tokens on replace 2', function () {
            testLineEditTokens('Hello world, ciao', [
                new TestToken(0, 1),
                new TestToken(5, 0),
                new TestToken(6, 2),
                new TestToken(11, 0),
                new TestToken(13, 0),
            ], [{
                    startColumn: 1,
                    endColumn: 6,
                    text: 'Hi',
                }, {
                    startColumn: 8,
                    endColumn: 12,
                    text: 'my friends',
                }], 'Hi wmy friends, ciao', [
                new TestToken(0, 0),
                new TestToken(3, 2),
                new TestToken(14, 0),
                new TestToken(16, 0),
            ]);
        });
        function testLineSplitTokens(initialText, initialTokens, splitColumn, expectedText1, expectedText2, expectedTokens) {
            testApplyEdits([{
                    text: initialText,
                    tokens: initialTokens
                }], [{
                    range: new range_1.Range(1, splitColumn, 1, splitColumn),
                    text: '\n'
                }], [{
                    text: expectedText1,
                    tokens: expectedTokens
                }, {
                    text: expectedText2,
                    tokens: [new TestToken(0, 1)]
                }]);
        }
        test('split at the beginning', function () {
            testLineSplitTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 1, '', 'abcd efgh', [
                new TestToken(0, 1),
            ]);
        });
        test('split at the end', function () {
            testLineSplitTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 10, 'abcd efgh', '', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
        test('split inthe middle 1', function () {
            testLineSplitTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 5, 'abcd', ' efgh', [
                new TestToken(0, 1)
            ]);
        });
        test('split inthe middle 2', function () {
            testLineSplitTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 6, 'abcd ', 'efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2)
            ]);
        });
        function testLineAppendTokens(aText, aTokens, bText, bTokens, expectedText, expectedTokens) {
            testApplyEdits([{
                    text: aText,
                    tokens: aTokens
                }, {
                    text: bText,
                    tokens: bTokens
                }], [{
                    range: new range_1.Range(1, aText.length + 1, 2, 1),
                    text: ''
                }], [{
                    text: expectedText,
                    tokens: expectedTokens
                }]);
        }
        test('append empty 1', function () {
            testLineAppendTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], '', [], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
        test('append empty 2', function () {
            testLineAppendTokens('', [], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
        test('append 1', function () {
            testLineAppendTokens('abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ], 'abcd efgh', [
                new TestToken(0, 4),
                new TestToken(4, 5),
                new TestToken(5, 6)
            ], 'abcd efghabcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3),
                new TestToken(9, 4),
                new TestToken(13, 5),
                new TestToken(14, 6)
            ]);
        });
        test('append 2', function () {
            testLineAppendTokens('abcd ', [
                new TestToken(0, 1),
                new TestToken(4, 2)
            ], 'efgh', [
                new TestToken(0, 3)
            ], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
        test('append 3', function () {
            testLineAppendTokens('abcd', [
                new TestToken(0, 1),
            ], ' efgh', [
                new TestToken(0, 2),
                new TestToken(1, 3)
            ], 'abcd efgh', [
                new TestToken(0, 1),
                new TestToken(4, 2),
                new TestToken(5, 3)
            ]);
        });
    });
});
