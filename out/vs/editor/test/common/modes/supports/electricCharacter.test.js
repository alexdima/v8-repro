define(["require", "exports", "assert", "vs/editor/common/modes/supports/electricCharacter", "vs/editor/test/common/modesTestUtils", "vs/editor/common/modes/supports/richEditBrackets", "vs/editor/common/modes"], function (require, exports, assert, electricCharacter_1, modesTestUtils_1, richEditBrackets_1, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var fakeLanguageIdentifier = new modes_1.LanguageIdentifier('test', 3);
    suite('Editor Modes - Auto Indentation', function () {
        function _testOnElectricCharacter(electricCharacterSupport, line, character, offset) {
            return electricCharacterSupport.onElectricCharacter(character, modesTestUtils_1.createFakeScopedLineTokens(line), offset);
        }
        function testDoesNothing(electricCharacterSupport, line, character, offset) {
            var actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
            assert.deepEqual(actual, null);
        }
        function testAppends(electricCharacterSupport, line, character, offset, appendText) {
            var actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
            assert.deepEqual(actual, { appendText: appendText });
        }
        function testMatchBracket(electricCharacterSupport, line, character, offset, matchOpenBracket) {
            var actual = _testOnElectricCharacter(electricCharacterSupport, line, character, offset);
            assert.deepEqual(actual, { matchOpenBracket: matchOpenBracket });
        }
        test('Doc comments', function () {
            var brackets = new electricCharacter_1.BracketElectricCharacterSupport(null, [{ open: '/**', close: ' */' }], null);
            testAppends(brackets, [
                { text: '/*', type: 0 /* Other */ },
            ], '*', 3, ' */');
            testDoesNothing(brackets, [
                { text: '/*', type: 0 /* Other */ },
                { text: ' ', type: 0 /* Other */ },
                { text: '*/', type: 0 /* Other */ },
            ], '*', 3);
        });
        test('getElectricCharacters uses all sources and dedups', function () {
            var sup = new electricCharacter_1.BracketElectricCharacterSupport(new richEditBrackets_1.RichEditBrackets(fakeLanguageIdentifier, [
                ['{', '}'],
                ['(', ')']
            ]), [
                { open: '{', close: '}', notIn: ['string', 'comment'] },
                { open: '"', close: '"', notIn: ['string', 'comment'] },
                { open: 'begin', close: 'end', notIn: ['string'] }
            ], { docComment: { open: '/**', close: ' */' } });
            assert.deepEqual(sup.getElectricCharacters(), ['}', ')', 'n', '*']);
        });
        test('auto-close', function () {
            var sup = new electricCharacter_1.BracketElectricCharacterSupport(new richEditBrackets_1.RichEditBrackets(fakeLanguageIdentifier, [
                ['{', '}'],
                ['(', ')']
            ]), [
                { open: '{', close: '}', notIn: ['string', 'comment'] },
                { open: '"', close: '"', notIn: ['string', 'comment'] },
                { open: 'begin', close: 'end', notIn: ['string'] }
            ], { docComment: { open: '/**', close: ' */' } });
            testDoesNothing(sup, [], 'a', 0);
            testDoesNothing(sup, [{ text: 'egi', type: 0 /* Other */ }], 'b', 1);
            testDoesNothing(sup, [{ text: 'bgi', type: 0 /* Other */ }], 'e', 2);
            testDoesNothing(sup, [{ text: 'bei', type: 0 /* Other */ }], 'g', 3);
            testDoesNothing(sup, [{ text: 'beg', type: 0 /* Other */ }], 'i', 4);
            testDoesNothing(sup, [{ text: 'egin', type: 0 /* Other */ }], 'b', 1);
            testDoesNothing(sup, [{ text: 'bgin', type: 0 /* Other */ }], 'e', 2);
            testDoesNothing(sup, [{ text: 'bein', type: 0 /* Other */ }], 'g', 3);
            testDoesNothing(sup, [{ text: 'begn', type: 0 /* Other */ }], 'i', 4);
            testAppends(sup, [{ text: 'begi', type: 0 /* Other */ }], 'n', 5, 'end');
            testDoesNothing(sup, [{ text: '3gin', type: 0 /* Other */ }], 'b', 1);
            testDoesNothing(sup, [{ text: 'bgin', type: 0 /* Other */ }], '3', 2);
            testDoesNothing(sup, [{ text: 'b3in', type: 0 /* Other */ }], 'g', 3);
            testDoesNothing(sup, [{ text: 'b3gn', type: 0 /* Other */ }], 'i', 4);
            testDoesNothing(sup, [{ text: 'b3gi', type: 0 /* Other */ }], 'n', 5);
            testDoesNothing(sup, [{ text: 'begi', type: 2 /* String */ }], 'n', 5);
            testAppends(sup, [{ text: '"', type: 2 /* String */ }, { text: 'begi', type: 0 /* Other */ }], 'n', 6, 'end');
            testDoesNothing(sup, [{ text: '"', type: 2 /* String */ }, { text: 'begi', type: 2 /* String */ }], 'n', 6);
            testAppends(sup, [{ text: '/*', type: 2 /* String */ }], '*', 3, ' */');
            testDoesNothing(sup, [{ text: 'begi', type: 0 /* Other */ }, { text: 'end', type: 0 /* Other */ }], 'n', 5);
        });
        test('matchOpenBracket', function () {
            var sup = new electricCharacter_1.BracketElectricCharacterSupport(new richEditBrackets_1.RichEditBrackets(fakeLanguageIdentifier, [
                ['{', '}'],
                ['(', ')']
            ]), [
                { open: '{', close: '}', notIn: ['string', 'comment'] },
                { open: '"', close: '"', notIn: ['string', 'comment'] },
                { open: 'begin', close: 'end', notIn: ['string'] }
            ], { docComment: { open: '/**', close: ' */' } });
            testDoesNothing(sup, [{ text: '\t{', type: 0 /* Other */ }], '\t', 1);
            testDoesNothing(sup, [{ text: '\t{', type: 0 /* Other */ }], '\t', 2);
            testDoesNothing(sup, [{ text: '\t\t', type: 0 /* Other */ }], '{', 3);
            testDoesNothing(sup, [{ text: '\t}', type: 0 /* Other */ }], '\t', 1);
            testDoesNothing(sup, [{ text: '\t}', type: 0 /* Other */ }], '\t', 2);
            testMatchBracket(sup, [{ text: '\t\t', type: 0 /* Other */ }], '}', 3, '}');
        });
    });
});
