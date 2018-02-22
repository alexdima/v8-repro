define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/core/position"], function (require, exports, assert, range_1, position_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Core - Range', function () {
        test('empty range', function () {
            var s = new range_1.Range(1, 1, 1, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), true);
        });
        test('swap start and stop same line', function () {
            var s = new range_1.Range(1, 2, 1, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 2);
            assert.equal(s.isEmpty(), false);
        });
        test('swap start and stop', function () {
            var s = new range_1.Range(2, 1, 1, 2);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 2);
            assert.equal(s.endLineNumber, 2);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), false);
        });
        test('no swap same line', function () {
            var s = new range_1.Range(1, 1, 1, 2);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 1);
            assert.equal(s.endColumn, 2);
            assert.equal(s.isEmpty(), false);
        });
        test('no swap', function () {
            var s = new range_1.Range(1, 1, 2, 1);
            assert.equal(s.startLineNumber, 1);
            assert.equal(s.startColumn, 1);
            assert.equal(s.endLineNumber, 2);
            assert.equal(s.endColumn, 1);
            assert.equal(s.isEmpty(), false);
        });
        test('compareRangesUsingEnds', function () {
            var a, b;
            a = new range_1.Range(1, 1, 1, 3);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end < b.end');
            a = new range_1.Range(1, 1, 1, 3);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start = b.start, a.end < b.end');
            a = new range_1.Range(1, 2, 1, 3);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start > b.start, a.end < b.end');
            a = new range_1.Range(1, 1, 1, 4);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) < 0, 'a.start < b.start, a.end = b.end');
            a = new range_1.Range(1, 1, 1, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) === 0, 'a.start = b.start, a.end = b.end');
            a = new range_1.Range(1, 2, 1, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start > b.start, a.end = b.end');
            a = new range_1.Range(1, 1, 1, 5);
            b = new range_1.Range(1, 2, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start < b.start, a.end > b.end');
            a = new range_1.Range(1, 1, 2, 4);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start = b.start, a.end > b.end');
            a = new range_1.Range(1, 1, 5, 1);
            b = new range_1.Range(1, 1, 1, 4);
            assert.ok(range_1.Range.compareRangesUsingEnds(a, b) > 0, 'a.start = b.start, a.end > b.end');
        });
        test('containsPosition', function () {
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(1, 3)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(2, 1)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(2, 2)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(2, 3)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(3, 1)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(5, 9)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(5, 10)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(5, 11)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsPosition(new position_1.Position(6, 1)), false);
        });
        test('containsRange', function () {
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(1, 3, 2, 2)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(2, 1, 2, 2)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(2, 2, 5, 11)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(2, 2, 6, 1)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(5, 9, 6, 1)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(5, 10, 6, 1)), false);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(2, 2, 5, 10)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(2, 3, 5, 9)), true);
            assert.equal(new range_1.Range(2, 2, 5, 10).containsRange(new range_1.Range(3, 100, 4, 100)), true);
        });
    });
});
