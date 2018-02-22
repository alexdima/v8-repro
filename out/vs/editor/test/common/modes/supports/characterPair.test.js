define(["require", "exports", "assert", "vs/editor/common/modes/supports/characterPair", "vs/editor/test/common/modesTestUtils"], function (require, exports, assert, characterPair_1, modesTestUtils_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CharacterPairSupport', function () {
        test('only autoClosingPairs', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: 'a', close: 'b' }] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), [{ open: 'a', close: 'b', _standardTokenMask: 0 }]);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), [{ open: 'a', close: 'b', _standardTokenMask: 0 }]);
        });
        test('only empty autoClosingPairs', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('only brackets', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ brackets: [['a', 'b']] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), [{ open: 'a', close: 'b', _standardTokenMask: 0 }]);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), [{ open: 'a', close: 'b', _standardTokenMask: 0 }]);
        });
        test('only empty brackets', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ brackets: [] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('only surroundingPairs', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ surroundingPairs: [{ open: 'a', close: 'b' }] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), [{ open: 'a', close: 'b' }]);
        });
        test('only empty surroundingPairs', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ surroundingPairs: [] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('brackets is ignored when having autoClosingPairs', function () {
            var characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [], brackets: [['a', 'b']] });
            assert.deepEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        function testShouldAutoClose(characterPairSupport, line, character, column) {
            return characterPairSupport.shouldAutoClosePair(character, modesTestUtils_1.createFakeScopedLineTokens(line), column);
        }
        test('shouldAutoClosePair in empty line', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.equal(testShouldAutoClose(sup, [], 'a', 1), false);
            assert.equal(testShouldAutoClose(sup, [], '{', 1), true);
        });
        test('shouldAutoClosePair in not interesting line 1', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.equal(testShouldAutoClose(sup, [{ text: 'do', type: 0 /* Other */ }], '{', 3), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'do', type: 0 /* Other */ }], 'a', 3), false);
        });
        test('shouldAutoClosePair in not interesting line 2', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}' }] });
            assert.equal(testShouldAutoClose(sup, [{ text: 'do', type: 2 /* String */ }], '{', 3), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'do', type: 2 /* String */ }], 'a', 3), false);
        });
        test('shouldAutoClosePair in interesting line 1', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 1), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 1), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 2), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 2), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 3), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 3), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 4), false);
            assert.equal(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 4), false);
        });
        test('shouldAutoClosePair in interesting line 2', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 1), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 1), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 2), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 2), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 3), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 3), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 4), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 4), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 5), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 5), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 6), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 6), false);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 7), true);
            assert.equal(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 7), false);
        });
        test('shouldAutoClosePair in interesting line 3', function () {
            var sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 1), true);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 1), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 2), true);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 2), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 3), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 3), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 4), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 4), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 5), false);
            assert.equal(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 5), false);
        });
    });
});
