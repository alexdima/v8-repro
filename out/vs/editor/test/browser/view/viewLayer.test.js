define(["require", "exports", "assert", "vs/editor/browser/view/viewLayer"], function (require, exports, assert, viewLayer_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestLine = /** @class */ (function () {
        function TestLine(id) {
            this.id = id;
            this._pinged = false;
        }
        TestLine.prototype.onContentChanged = function () {
            this._pinged = true;
        };
        TestLine.prototype.onTokensChanged = function () {
            this._pinged = true;
        };
        return TestLine;
    }());
    function assertState(col, state) {
        var actualState = {
            startLineNumber: col.getStartLineNumber(),
            lines: [],
            pinged: []
        };
        for (var lineNumber = col.getStartLineNumber(); lineNumber <= col.getEndLineNumber(); lineNumber++) {
            actualState.lines.push(col.getLine(lineNumber).id);
            actualState.pinged.push(col.getLine(lineNumber)._pinged);
        }
        assert.deepEqual(actualState, state);
    }
    suite('RenderedLinesCollection onLinesDeleted', function () {
        function testOnModelLinesDeleted(deleteFromLineNumber, deleteToLineNumber, expectedDeleted, expectedState) {
            var col = new viewLayer_1.RenderedLinesCollection(function () { return new TestLine('new'); });
            col._set(6, [
                new TestLine('old6'),
                new TestLine('old7'),
                new TestLine('old8'),
                new TestLine('old9')
            ]);
            var actualDeleted1 = col.onLinesDeleted(deleteFromLineNumber, deleteToLineNumber);
            var actualDeleted = [];
            if (actualDeleted1) {
                actualDeleted = actualDeleted1.map(function (line) { return line.id; });
            }
            assert.deepEqual(actualDeleted, expectedDeleted);
            assertState(col, expectedState);
        }
        test('A1', function () {
            testOnModelLinesDeleted(3, 3, [], {
                startLineNumber: 5,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A2', function () {
            testOnModelLinesDeleted(3, 4, [], {
                startLineNumber: 4,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A3', function () {
            testOnModelLinesDeleted(3, 5, [], {
                startLineNumber: 3,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A4', function () {
            testOnModelLinesDeleted(3, 6, ['old6'], {
                startLineNumber: 3,
                lines: ['old7', 'old8', 'old9'],
                pinged: [false, false, false]
            });
        });
        test('A5', function () {
            testOnModelLinesDeleted(3, 7, ['old6', 'old7'], {
                startLineNumber: 3,
                lines: ['old8', 'old9'],
                pinged: [false, false]
            });
        });
        test('A6', function () {
            testOnModelLinesDeleted(3, 8, ['old6', 'old7', 'old8'], {
                startLineNumber: 3,
                lines: ['old9'],
                pinged: [false]
            });
        });
        test('A7', function () {
            testOnModelLinesDeleted(3, 9, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 3,
                lines: [],
                pinged: []
            });
        });
        test('A8', function () {
            testOnModelLinesDeleted(3, 10, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 3,
                lines: [],
                pinged: []
            });
        });
        test('B1', function () {
            testOnModelLinesDeleted(5, 5, [], {
                startLineNumber: 5,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B2', function () {
            testOnModelLinesDeleted(5, 6, ['old6'], {
                startLineNumber: 5,
                lines: ['old7', 'old8', 'old9'],
                pinged: [false, false, false]
            });
        });
        test('B3', function () {
            testOnModelLinesDeleted(5, 7, ['old6', 'old7'], {
                startLineNumber: 5,
                lines: ['old8', 'old9'],
                pinged: [false, false]
            });
        });
        test('B4', function () {
            testOnModelLinesDeleted(5, 8, ['old6', 'old7', 'old8'], {
                startLineNumber: 5,
                lines: ['old9'],
                pinged: [false]
            });
        });
        test('B5', function () {
            testOnModelLinesDeleted(5, 9, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 5,
                lines: [],
                pinged: []
            });
        });
        test('B6', function () {
            testOnModelLinesDeleted(5, 10, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 5,
                lines: [],
                pinged: []
            });
        });
        test('C1', function () {
            testOnModelLinesDeleted(6, 6, ['old6'], {
                startLineNumber: 6,
                lines: ['old7', 'old8', 'old9'],
                pinged: [false, false, false]
            });
        });
        test('C2', function () {
            testOnModelLinesDeleted(6, 7, ['old6', 'old7'], {
                startLineNumber: 6,
                lines: ['old8', 'old9'],
                pinged: [false, false]
            });
        });
        test('C3', function () {
            testOnModelLinesDeleted(6, 8, ['old6', 'old7', 'old8'], {
                startLineNumber: 6,
                lines: ['old9'],
                pinged: [false]
            });
        });
        test('C4', function () {
            testOnModelLinesDeleted(6, 9, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: [],
                pinged: []
            });
        });
        test('C5', function () {
            testOnModelLinesDeleted(6, 10, ['old6', 'old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: [],
                pinged: []
            });
        });
        test('D1', function () {
            testOnModelLinesDeleted(7, 7, ['old7'], {
                startLineNumber: 6,
                lines: ['old6', 'old8', 'old9'],
                pinged: [false, false, false]
            });
        });
        test('D2', function () {
            testOnModelLinesDeleted(7, 8, ['old7', 'old8'], {
                startLineNumber: 6,
                lines: ['old6', 'old9'],
                pinged: [false, false]
            });
        });
        test('D3', function () {
            testOnModelLinesDeleted(7, 9, ['old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6'],
                pinged: [false]
            });
        });
        test('D4', function () {
            testOnModelLinesDeleted(7, 10, ['old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6'],
                pinged: [false]
            });
        });
        test('E1', function () {
            testOnModelLinesDeleted(8, 8, ['old8'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old9'],
                pinged: [false, false, false]
            });
        });
        test('E2', function () {
            testOnModelLinesDeleted(8, 9, ['old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7'],
                pinged: [false, false]
            });
        });
        test('E3', function () {
            testOnModelLinesDeleted(8, 10, ['old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7'],
                pinged: [false, false]
            });
        });
        test('F1', function () {
            testOnModelLinesDeleted(9, 9, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8'],
                pinged: [false, false, false]
            });
        });
        test('F2', function () {
            testOnModelLinesDeleted(9, 10, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8'],
                pinged: [false, false, false]
            });
        });
        test('G1', function () {
            testOnModelLinesDeleted(10, 10, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('G2', function () {
            testOnModelLinesDeleted(10, 11, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('H1', function () {
            testOnModelLinesDeleted(11, 13, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
    });
    suite('RenderedLinesCollection onLineChanged', function () {
        function testOnModelLineChanged(changedLineNumber, expectedPinged, expectedState) {
            var col = new viewLayer_1.RenderedLinesCollection(function () { return new TestLine('new'); });
            col._set(6, [
                new TestLine('old6'),
                new TestLine('old7'),
                new TestLine('old8'),
                new TestLine('old9')
            ]);
            var actualPinged = col.onLinesChanged(changedLineNumber, changedLineNumber);
            assert.deepEqual(actualPinged, expectedPinged);
            assertState(col, expectedState);
        }
        test('3', function () {
            testOnModelLineChanged(3, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('4', function () {
            testOnModelLineChanged(4, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('5', function () {
            testOnModelLineChanged(5, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('6', function () {
            testOnModelLineChanged(6, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [true, false, false, false]
            });
        });
        test('7', function () {
            testOnModelLineChanged(7, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, true, false, false]
            });
        });
        test('8', function () {
            testOnModelLineChanged(8, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, true, false]
            });
        });
        test('9', function () {
            testOnModelLineChanged(9, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, true]
            });
        });
        test('10', function () {
            testOnModelLineChanged(10, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('11', function () {
            testOnModelLineChanged(11, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
    });
    suite('RenderedLinesCollection onLinesInserted', function () {
        function testOnModelLinesInserted(insertFromLineNumber, insertToLineNumber, expectedDeleted, expectedState) {
            var col = new viewLayer_1.RenderedLinesCollection(function () { return new TestLine('new'); });
            col._set(6, [
                new TestLine('old6'),
                new TestLine('old7'),
                new TestLine('old8'),
                new TestLine('old9')
            ]);
            var actualDeleted1 = col.onLinesInserted(insertFromLineNumber, insertToLineNumber);
            var actualDeleted = [];
            if (actualDeleted1) {
                actualDeleted = actualDeleted1.map(function (line) { return line.id; });
            }
            assert.deepEqual(actualDeleted, expectedDeleted);
            assertState(col, expectedState);
        }
        test('A1', function () {
            testOnModelLinesInserted(3, 3, [], {
                startLineNumber: 7,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A2', function () {
            testOnModelLinesInserted(3, 4, [], {
                startLineNumber: 8,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A3', function () {
            testOnModelLinesInserted(3, 5, [], {
                startLineNumber: 9,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A4', function () {
            testOnModelLinesInserted(3, 6, [], {
                startLineNumber: 10,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A5', function () {
            testOnModelLinesInserted(3, 7, [], {
                startLineNumber: 11,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A6', function () {
            testOnModelLinesInserted(3, 8, [], {
                startLineNumber: 12,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A7', function () {
            testOnModelLinesInserted(3, 9, [], {
                startLineNumber: 13,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('A8', function () {
            testOnModelLinesInserted(3, 10, [], {
                startLineNumber: 14,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B1', function () {
            testOnModelLinesInserted(5, 5, [], {
                startLineNumber: 7,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B2', function () {
            testOnModelLinesInserted(5, 6, [], {
                startLineNumber: 8,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B3', function () {
            testOnModelLinesInserted(5, 7, [], {
                startLineNumber: 9,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B4', function () {
            testOnModelLinesInserted(5, 8, [], {
                startLineNumber: 10,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B5', function () {
            testOnModelLinesInserted(5, 9, [], {
                startLineNumber: 11,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B6', function () {
            testOnModelLinesInserted(5, 10, [], {
                startLineNumber: 12,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C1', function () {
            testOnModelLinesInserted(6, 6, [], {
                startLineNumber: 7,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C2', function () {
            testOnModelLinesInserted(6, 7, [], {
                startLineNumber: 8,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C3', function () {
            testOnModelLinesInserted(6, 8, [], {
                startLineNumber: 9,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C4', function () {
            testOnModelLinesInserted(6, 9, [], {
                startLineNumber: 10,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C5', function () {
            testOnModelLinesInserted(6, 10, [], {
                startLineNumber: 11,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('D1', function () {
            testOnModelLinesInserted(7, 7, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'new', 'old7', 'old8'],
                pinged: [false, false, false, false]
            });
        });
        test('D2', function () {
            testOnModelLinesInserted(7, 8, ['old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6', 'new', 'new', 'old7'],
                pinged: [false, false, false, false]
            });
        });
        test('D3', function () {
            testOnModelLinesInserted(7, 9, ['old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6'],
                pinged: [false]
            });
        });
        test('D4', function () {
            testOnModelLinesInserted(7, 10, ['old7', 'old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6'],
                pinged: [false]
            });
        });
        test('E1', function () {
            testOnModelLinesInserted(8, 8, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'new', 'old8'],
                pinged: [false, false, false, false]
            });
        });
        test('E2', function () {
            testOnModelLinesInserted(8, 9, ['old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7'],
                pinged: [false, false]
            });
        });
        test('E3', function () {
            testOnModelLinesInserted(8, 10, ['old8', 'old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7'],
                pinged: [false, false]
            });
        });
        test('F1', function () {
            testOnModelLinesInserted(9, 9, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8'],
                pinged: [false, false, false]
            });
        });
        test('F2', function () {
            testOnModelLinesInserted(9, 10, ['old9'], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8'],
                pinged: [false, false, false]
            });
        });
        test('G1', function () {
            testOnModelLinesInserted(10, 10, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('G2', function () {
            testOnModelLinesInserted(10, 11, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('H1', function () {
            testOnModelLinesInserted(11, 13, [], {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
    });
    suite('RenderedLinesCollection onTokensChanged', function () {
        function testOnModelTokensChanged(changedFromLineNumber, changedToLineNumber, expectedPinged, expectedState) {
            var col = new viewLayer_1.RenderedLinesCollection(function () { return new TestLine('new'); });
            col._set(6, [
                new TestLine('old6'),
                new TestLine('old7'),
                new TestLine('old8'),
                new TestLine('old9')
            ]);
            var actualPinged = col.onTokensChanged([{ fromLineNumber: changedFromLineNumber, toLineNumber: changedToLineNumber }]);
            assert.deepEqual(actualPinged, expectedPinged);
            assertState(col, expectedState);
        }
        test('A', function () {
            testOnModelTokensChanged(3, 3, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('B', function () {
            testOnModelTokensChanged(3, 5, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('C', function () {
            testOnModelTokensChanged(3, 6, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [true, false, false, false]
            });
        });
        test('D', function () {
            testOnModelTokensChanged(6, 6, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [true, false, false, false]
            });
        });
        test('E', function () {
            testOnModelTokensChanged(5, 10, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [true, true, true, true]
            });
        });
        test('F', function () {
            testOnModelTokensChanged(8, 9, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, true, true]
            });
        });
        test('G', function () {
            testOnModelTokensChanged(8, 11, true, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, true, true]
            });
        });
        test('H', function () {
            testOnModelTokensChanged(10, 10, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
        test('I', function () {
            testOnModelTokensChanged(10, 11, false, {
                startLineNumber: 6,
                lines: ['old6', 'old7', 'old8', 'old9'],
                pinged: [false, false, false, false]
            });
        });
    });
});
