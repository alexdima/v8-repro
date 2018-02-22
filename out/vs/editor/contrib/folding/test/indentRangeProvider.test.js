/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/model/textModel", "vs/editor/contrib/folding/indentRangeProvider"], function (require, exports, assert, textModel_1, indentRangeProvider_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function assertRanges(lines, expected, offside, markers) {
        var model = textModel_1.TextModel.createFromString(lines.join('\n'));
        var actual = indentRangeProvider_1.computeRanges(model, offside, markers);
        var actualRanges = [];
        for (var i = 0; i < actual.length; i++) {
            actualRanges[i] = r(actual.getStartLineNumber(i), actual.getEndLineNumber(i), actual.getParentIndex(i));
        }
        assert.deepEqual(actualRanges, expected);
        model.dispose();
    }
    function r(startLineNumber, endLineNumber, parentIndex, marker) {
        if (marker === void 0) { marker = false; }
        return { startLineNumber: startLineNumber, endLineNumber: endLineNumber, parentIndex: parentIndex };
    }
    suite('Indentation Folding', function () {
        test('Fold one level', function () {
            var range = [
                'A',
                '  A',
                '  A',
                '  A'
            ];
            assertRanges(range, [r(1, 4, -1)], true);
            assertRanges(range, [r(1, 4, -1)], false);
        });
        test('Fold two levels', function () {
            var range = [
                'A',
                '  A',
                '  A',
                '    A',
                '    A'
            ];
            assertRanges(range, [r(1, 5, -1), r(3, 5, 0)], true);
            assertRanges(range, [r(1, 5, -1), r(3, 5, 0)], false);
        });
        test('Fold three levels', function () {
            var range = [
                'A',
                '  A',
                '    A',
                '      A',
                'A'
            ];
            assertRanges(range, [r(1, 4, -1), r(2, 4, 0), r(3, 4, 1)], true);
            assertRanges(range, [r(1, 4, -1), r(2, 4, 0), r(3, 4, 1)], false);
        });
        test('Fold decreasing indent', function () {
            var range = [
                '    A',
                '  A',
                'A'
            ];
            assertRanges(range, [], true);
            assertRanges(range, [], false);
        });
        test('Fold Java', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  void foo() {',
                /* 3*/ '    console.log();',
                /* 4*/ '    console.log();',
                /* 5*/ '  }',
                /* 6*/ '',
                /* 7*/ '  void bar() {',
                /* 8*/ '    console.log();',
                /* 9*/ '  }',
                /*10*/ '}',
                /*11*/ 'interface B {',
                /*12*/ '  void bar();',
                /*13*/ '}',
            ], [r(1, 9, -1), r(2, 4, 0), r(7, 8, 0), r(11, 12, -1)], false);
        });
        test('Fold Javadoc', function () {
            assertRanges([
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '  }',
                /* 7*/ '}',
            ], [r(1, 3, -1), r(4, 6, -1)], false);
        });
        test('Fold Whitespace Java', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '',
                /* 3*/ '  void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(3, 5, 0)], false);
        });
        test('Fold Whitespace Python', function () {
            assertRanges([
                /* 1*/ 'def a:',
                /* 2*/ '  pass',
                /* 3*/ '   ',
                /* 4*/ '  def b:',
                /* 5*/ '    pass',
                /* 6*/ '  ',
                /* 7*/ '      ',
                /* 8*/ 'def c: # since there was a deintent here'
            ], [r(1, 5, -1), r(4, 5, 0)], true);
        });
        test('Fold Tabs', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '\t\t',
                /* 3*/ '\tvoid foo() {',
                /* 4*/ '\t \t//hello',
                /* 5*/ '\t    return 0;',
                /* 6*/ '  \t}',
                /* 7*/ '      ',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(3, 5, 0)], false);
        });
    });
    var markers = {
        start: /^\s*#region\b/,
        end: /^\s*#endregion\b/
    };
    suite('Folding with regions', function () {
        test('Inside region, indented', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  #region',
                /* 3*/ '  void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '  #endregion',
                /* 8*/ '}',
            ], [r(1, 7, -1), r(2, 7, 0, true), r(3, 5, 1)], false, markers);
        });
        test('Inside region, not indented', function () {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ 'void foo() {',
                /* 4*/ '     ',
                /* 5*/ '     return 0;',
                /* 6*/ '  }',
                /* 7*/ '#endregion',
                /* 8*/ '',
            ], [r(2, 7, -1, true), r(3, 6, 0)], false, markers);
        });
        test('Empty Regions', function () {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ '#endregion',
                /* 4*/ '#region',
                /* 5*/ '',
                /* 6*/ '#endregion',
                /* 7*/ 'var y;',
            ], [r(2, 3, -1, true), r(4, 6, -1, true)], false, markers);
        });
        test('Nested Regions', function () {
            assertRanges([
                /* 1*/ 'var x;',
                /* 2*/ '#region',
                /* 3*/ '#region',
                /* 4*/ '',
                /* 5*/ '#endregion',
                /* 6*/ '#endregion',
                /* 7*/ 'var y;',
            ], [r(2, 6, -1, true), r(3, 5, 0, true)], false, markers);
        });
        test('Nested Regions 2', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '  #region',
                /* 3*/ '',
                /* 4*/ '  #region',
                /* 5*/ '',
                /* 6*/ '  #endregion',
                /* 7*/ '  // comment',
                /* 8*/ '  #endregion',
                /* 9*/ '}',
            ], [r(1, 8, -1), r(2, 8, 0, true), r(4, 6, 1, true)], false, markers);
        });
        test('Incomplete Regions', function () {
            assertRanges([
                /* 1*/ 'class A {',
                /* 2*/ '#region',
                /* 3*/ '  // comment',
                /* 4*/ '}',
            ], [r(2, 3, -1)], false, markers);
        });
        test('Incomplete Regions 2', function () {
            assertRanges([
                /* 1*/ '',
                /* 2*/ '#region',
                /* 3*/ '#region',
                /* 4*/ '#region',
                /* 5*/ '  // comment',
                /* 6*/ '#endregion',
                /* 7*/ '#endregion',
                /* 8*/ ' // hello',
            ], [r(3, 7, -1, true), r(4, 6, 0, true)], false, markers);
        });
        test('Indented region before', function () {
            assertRanges([
                /* 1*/ 'if (x)',
                /* 2*/ '  return;',
                /* 3*/ '',
                /* 4*/ '#region',
                /* 5*/ '  // comment',
                /* 6*/ '#endregion',
            ], [r(1, 3, -1), r(4, 6, -1, true)], false, markers);
        });
        test('Indented region before 2', function () {
            assertRanges([
                /* 1*/ 'if (x)',
                /* 2*/ '  log();',
                /* 3*/ '',
                /* 4*/ '    #region',
                /* 5*/ '      // comment',
                /* 6*/ '    #endregion',
            ], [r(1, 6, -1), r(2, 6, 0), r(4, 6, 1, true)], false, markers);
        });
        test('Indented region in-between', function () {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  // comment',
                /* 3*/ '  if (x)',
                /* 4*/ '    return;',
                /* 5*/ '',
                /* 6*/ '#endregion',
            ], [r(1, 6, -1, true), r(3, 5, 0)], false, markers);
        });
        test('Indented region after', function () {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  // comment',
                /* 3*/ '',
                /* 4*/ '#endregion',
                /* 5*/ '  if (x)',
                /* 6*/ '    return;',
            ], [r(1, 4, -1, true), r(5, 6, -1)], false, markers);
        });
        test('With off-side', function () {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  ',
                /* 3*/ '',
                /* 4*/ '#endregion',
                /* 5*/ '',
            ], [r(1, 4, -1, true)], true, markers);
        });
        test('Nested with off-side', function () {
            assertRanges([
                /* 1*/ '#region',
                /* 2*/ '  ',
                /* 3*/ '#region',
                /* 4*/ '',
                /* 5*/ '#endregion',
                /* 6*/ '',
                /* 7*/ '#endregion',
                /* 8*/ '',
            ], [r(1, 7, -1, true), r(3, 5, 0, true)], true, markers);
        });
        test('Issue 35981', function () {
            assertRanges([
                /* 1*/ 'function thisFoldsToEndOfPage() {',
                /* 2*/ '  const variable = []',
                /* 3*/ '    // #region',
                /* 4*/ '    .reduce((a, b) => a,[]);',
                /* 5*/ '}',
                /* 6*/ '',
                /* 7*/ 'function thisFoldsProperly() {',
                /* 8*/ '  const foo = "bar"',
                /* 9*/ '}',
            ], [r(1, 4, -1), r(2, 4, 0), r(7, 8, -1)], false, markers);
        });
        test('Misspelled Markers', function () {
            assertRanges([
                /* 1*/ '#Region',
                /* 2*/ '#endregion',
                /* 3*/ '#regionsandmore',
                /* 4*/ '#endregion',
                /* 5*/ '#region',
                /* 6*/ '#end region',
                /* 7*/ '#region',
                /* 8*/ '#endregionff',
            ], [], true, markers);
        });
    });
});
