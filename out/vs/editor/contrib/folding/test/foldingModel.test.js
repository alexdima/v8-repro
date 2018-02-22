define(["require", "exports", "assert", "vs/editor/contrib/folding/foldingModel", "vs/editor/common/model/textModel", "vs/editor/contrib/folding/indentRangeProvider", "vs/editor/common/model", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/strings"], function (require, exports, assert, foldingModel_1, textModel_1, indentRangeProvider_1, model_1, editOperation_1, position_1, range_1, strings_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestDecorationProvider = /** @class */ (function () {
        function TestDecorationProvider(model) {
            this.model = model;
            this.testDecorator = textModel_1.ModelDecorationOptions.register({
                stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                linesDecorationsClassName: 'folding'
            });
        }
        TestDecorationProvider.prototype.getDecorationOption = function (isCollapsed) {
            return this.testDecorator;
        };
        TestDecorationProvider.prototype.deltaDecorations = function (oldDecorations, newDecorations) {
            return this.model.deltaDecorations(oldDecorations, newDecorations);
        };
        TestDecorationProvider.prototype.changeDecorations = function (callback) {
            return this.model.changeDecorations(callback);
        };
        return TestDecorationProvider;
    }());
    exports.TestDecorationProvider = TestDecorationProvider;
    suite('Folding Model', function () {
        function r(startLineNumber, endLineNumber, isCollapsed) {
            if (isCollapsed === void 0) { isCollapsed = false; }
            return { startLineNumber: startLineNumber, endLineNumber: endLineNumber, isCollapsed: isCollapsed };
        }
        function assertRegion(actual, expected, message) {
            assert.equal(!!actual, !!expected, message);
            if (actual) {
                assert.equal(actual.startLineNumber, expected.startLineNumber, message);
                assert.equal(actual.endLineNumber, expected.endLineNumber, message);
                assert.equal(actual.isCollapsed, expected.isCollapsed, message);
            }
        }
        function assertFoldedRanges(foldingModel, expectedRegions, message) {
            var actualRanges = [];
            var actual = foldingModel.ranges;
            for (var i = 0; i < actual.length; i++) {
                if (actual.isCollapsed(i)) {
                    actualRanges.push(r(actual.getStartLineNumber(i), actual.getEndLineNumber(i)));
                }
            }
            assert.deepEqual(actualRanges, expectedRegions, message);
        }
        function assertRanges(foldingModel, expectedRegions, message) {
            var actualRanges = [];
            var actual = foldingModel.ranges;
            for (var i = 0; i < actual.length; i++) {
                actualRanges.push(r(actual.getStartLineNumber(i), actual.getEndLineNumber(i), actual.isCollapsed(i)));
            }
            assert.deepEqual(actualRanges, expectedRegions, message);
        }
        function assertRegions(actual, expectedRegions, message) {
            assert.deepEqual(actual.map(function (r) { return ({ startLineNumber: r.startLineNumber, endLineNumber: r.endLineNumber, isCollapsed: r.isCollapsed }); }), expectedRegions, message);
        }
        test('getRegionAtLine', function () {
            var lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, null);
                foldingModel.update(ranges);
                var r1 = r(1, 3, false);
                var r2 = r(4, 7, false);
                var r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                assertRegion(foldingModel.getRegionAtLine(1), r1, '1');
                assertRegion(foldingModel.getRegionAtLine(2), r1, '2');
                assertRegion(foldingModel.getRegionAtLine(3), r1, '3');
                assertRegion(foldingModel.getRegionAtLine(4), r2, '4');
                assertRegion(foldingModel.getRegionAtLine(5), r3, '5');
                assertRegion(foldingModel.getRegionAtLine(6), r3, '5');
                assertRegion(foldingModel.getRegionAtLine(7), r2, '6');
                assertRegion(foldingModel.getRegionAtLine(8), null, '7');
            }
            finally {
                textModel.dispose();
            }
        });
        test('collapse', function () {
            var lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, null);
                foldingModel.update(ranges);
                var r1 = r(1, 3, false);
                var r2 = r(4, 7, false);
                var r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(5)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r2, r(5, 6, true)]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(7)]);
                foldingModel.update(ranges);
                assertRanges(foldingModel, [r(1, 3, true), r(4, 7, true), r(5, 6, true)]);
                textModel.dispose();
            }
            finally {
                textModel.dispose();
            }
        });
        test('update', function () {
            var lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, null);
                foldingModel.update(ranges);
                var r1 = r(1, 3, false);
                var r2 = r(4, 7, false);
                var r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(2), foldingModel.getRegionAtLine(5)]);
                textModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(4, 1), '//hello\n')]);
                foldingModel.update(indentRangeProvider_1.computeRanges(textModel, false, null));
                assertRanges(foldingModel, [r(1, 3, true), r(5, 8, false), r(6, 7, true)]);
            }
            finally {
                textModel.dispose();
            }
        });
        test('delete', function () {
            var lines = [
                /* 1*/ 'function foo() {',
                /* 2*/ '  switch (x) {',
                /* 3*/ '    case 1:',
                /* 4*/ '      //hello1',
                /* 5*/ '      break;',
                /* 6*/ '    case 2:',
                /* 7*/ '      //hello2',
                /* 8*/ '      break;',
                /* 9*/ '    case 3:',
                /* 10*/ '      //hello3',
                /* 11*/ '      break;',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, null);
                foldingModel.update(ranges);
                var r1 = r(1, 12, false);
                var r2 = r(2, 11, false);
                var r3 = r(3, 5, false);
                var r4 = r(6, 8, false);
                var r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(6)]);
                textModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(6, 11, 9, 0))]);
                foldingModel.update(indentRangeProvider_1.computeRanges(textModel, false, null));
                assertRanges(foldingModel, [r(1, 9, false), r(2, 8, false), r(3, 5, false), r(6, 8, false)]);
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionsInside', function () {
            var lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    // comment {',
                /* 7*/ '  }',
                /* 8*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, null);
                foldingModel.update(ranges);
                var r1 = r(1, 3, false);
                var r2 = r(4, 7, false);
                var r3 = r(5, 6, false);
                assertRanges(foldingModel, [r1, r2, r3]);
                var region1 = foldingModel.getRegionAtLine(r1.startLineNumber);
                var region2 = foldingModel.getRegionAtLine(r2.startLineNumber);
                var region3 = foldingModel.getRegionAtLine(r3.startLineNumber);
                assertRegions(foldingModel.getRegionsInside(null), [r1, r2, r3], '1');
                assertRegions(foldingModel.getRegionsInside(region1), [], '2');
                assertRegions(foldingModel.getRegionsInside(region2), [r3], '3');
                assertRegions(foldingModel.getRegionsInside(region3), [], '4');
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionsInsideWithLevel', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '    if (true) {',
                /* 9*/ '      return;',
                /* 10*/ '    }',
                /* 11*/ '  }',
                /* 12*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 2, false);
                var r2 = r(3, 11, false);
                var r3 = r(4, 10, false);
                var r4 = r(5, 6, false);
                var r5 = r(8, 9, false);
                var region1 = foldingModel.getRegionAtLine(r1.startLineNumber);
                var region2 = foldingModel.getRegionAtLine(r2.startLineNumber);
                var region3 = foldingModel.getRegionAtLine(r3.startLineNumber);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                assertRegions(foldingModel.getRegionsInside(null, function (r, level) { return level === 1; }), [r1, r2], '1');
                assertRegions(foldingModel.getRegionsInside(null, function (r, level) { return level === 2; }), [r3], '2');
                assertRegions(foldingModel.getRegionsInside(null, function (r, level) { return level === 3; }), [r4, r5], '3');
                assertRegions(foldingModel.getRegionsInside(region2, function (r, level) { return level === 1; }), [r3], '4');
                assertRegions(foldingModel.getRegionsInside(region2, function (r, level) { return level === 2; }), [r4, r5], '5');
                assertRegions(foldingModel.getRegionsInside(region3, function (r, level) { return level === 1; }), [r4, r5], '6');
                assertRegions(foldingModel.getRegionsInside(region2, function (r, level) { return r.hidesLine(9); }), [r3, r5], '7');
                assertRegions(foldingModel.getRegionsInside(region1, function (r, level) { return level === 1; }), [], '8');
            }
            finally {
                textModel.dispose();
            }
        });
        test('getRegionAtLine', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ 'class A {',
                /* 3*/ '  void foo() {',
                /* 4*/ '    if (true) {',
                /* 5*/ '      //hello',
                /* 6*/ '    }',
                /* 7*/ '',
                /* 8*/ '  }',
                /* 9*/ '}',
                /* 10*/ '//#endregion',
                /* 11*/ ''
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 10, false);
                var r2 = r(2, 8, false);
                var r3 = r(3, 7, false);
                var r4 = r(4, 5, false);
                assertRanges(foldingModel, [r1, r2, r3, r4]);
                assertRegions(foldingModel.getAllRegionsAtLine(1), [r1], '1');
                assertRegions(foldingModel.getAllRegionsAtLine(2), [r1, r2].reverse(), '2');
                assertRegions(foldingModel.getAllRegionsAtLine(3), [r1, r2, r3].reverse(), '3');
                assertRegions(foldingModel.getAllRegionsAtLine(4), [r1, r2, r3, r4].reverse(), '4');
                assertRegions(foldingModel.getAllRegionsAtLine(5), [r1, r2, r3, r4].reverse(), '5');
                assertRegions(foldingModel.getAllRegionsAtLine(6), [r1, r2, r3].reverse(), '6');
                assertRegions(foldingModel.getAllRegionsAtLine(7), [r1, r2, r3].reverse(), '7');
                assertRegions(foldingModel.getAllRegionsAtLine(8), [r1, r2].reverse(), '8');
                assertRegions(foldingModel.getAllRegionsAtLine(9), [r1], '9');
                assertRegions(foldingModel.getAllRegionsAtLine(10), [r1], '10');
                assertRegions(foldingModel.getAllRegionsAtLine(11), [], '10');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateRecursivly', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 2, false);
                var r2 = r(3, 12, false);
                var r3 = r(4, 11, false);
                var r4 = r(5, 6, false);
                var r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, Number.MAX_VALUE, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '1');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, Number.MAX_VALUE, [8]);
                assertFoldedRanges(foldingModel, [], '2');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, Number.MAX_VALUE, [12]);
                assertFoldedRanges(foldingModel, [r2, r3, r4, r5], '1');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, Number.MAX_VALUE, [7]);
                assertFoldedRanges(foldingModel, [r2], '1');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false);
                assertFoldedRanges(foldingModel, [], '1');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true);
                assertFoldedRanges(foldingModel, [r1, r2, r3, r4, r5], '1');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateAtLevel', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '  //#region',
                /* 14*/ '  const bar = 9;',
                /* 15*/ '  //#endregion',
                /* 16*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\s*\/\/#region$/, end: /^\s*\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 2, false);
                var r2 = r(3, 15, false);
                var r3 = r(4, 11, false);
                var r4 = r(5, 6, false);
                var r5 = r(9, 10, false);
                var r6 = r(13, 15, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5, r6]);
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 1, true, []);
                assertFoldedRanges(foldingModel, [r1, r2], '1');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 1, false, [5]);
                assertFoldedRanges(foldingModel, [r2], '2');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 1, false, [1]);
                assertFoldedRanges(foldingModel, [], '3');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 2, true, []);
                assertFoldedRanges(foldingModel, [r3, r6], '4');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 2, false, [5, 6]);
                assertFoldedRanges(foldingModel, [r3], '5');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 3, true, [4, 9]);
                assertFoldedRanges(foldingModel, [r3, r4], '6');
                foldingModel_1.setCollapseStateAtLevel(foldingModel, 3, false, [4, 9]);
                assertFoldedRanges(foldingModel, [r3], '7');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateLevelsDown', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 2, false);
                var r2 = r(3, 12, false);
                var r3 = r(4, 11, false);
                var r4 = r(5, 6, false);
                var r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r3, r4, r5], '2');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, 2, [3]);
                assertFoldedRanges(foldingModel, [r4, r5], '3');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, 2, [2]);
                assertFoldedRanges(foldingModel, [r4, r5], '4');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, true, 4, [2]);
                assertFoldedRanges(foldingModel, [r1, r4, r5], '5');
                foldingModel_1.setCollapseStateLevelsDown(foldingModel, false, 4, [2, 3]);
                assertFoldedRanges(foldingModel, [], '6');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateLevelsUp', function () {
            var lines = [
                /* 1*/ '//#region',
                /* 2*/ '//#endregion',
                /* 3*/ 'class A {',
                /* 4*/ '  void foo() {',
                /* 5*/ '    if (true) {',
                /* 6*/ '        return;',
                /* 7*/ '    }',
                /* 8*/ '',
                /* 9*/ '    if (true) {',
                /* 10*/ '      return;',
                /* 11*/ '    }',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 2, false);
                var r2 = r(3, 12, false);
                var r3 = r(4, 11, false);
                var r4 = r(5, 6, false);
                var r5 = r(9, 10, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, true, 1, [4]);
                assertFoldedRanges(foldingModel, [r3], '1');
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, true, 2, [4]);
                assertFoldedRanges(foldingModel, [r2, r3], '2');
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, false, 4, [1, 3, 4]);
                assertFoldedRanges(foldingModel, [], '3');
                foldingModel_1.setCollapseStateLevelsUp(foldingModel, true, 2, [10]);
                assertFoldedRanges(foldingModel, [r3, r5], '4');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapseStateForMatchingLines', function () {
            var lines = [
                /* 1*/ '/**',
                /* 2*/ ' * the class',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  /**',
                /* 6*/ '   * the foo',
                /* 7*/ '   */',
                /* 8*/ '  void foo() {',
                /* 9*/ '    /*',
                /* 10*/ '     * the comment',
                /* 11*/ '     */',
                /* 12*/ '  }',
                /* 13*/ '}'
            ];
            var textModel = textModel_1.TextModel.createFromString(lines.join('\n'));
            try {
                var foldingModel = new foldingModel_1.FoldingModel(textModel, new TestDecorationProvider(textModel));
                var ranges = indentRangeProvider_1.computeRanges(textModel, false, { start: /^\/\/#region$/, end: /^\/\/#endregion$/ });
                foldingModel.update(ranges);
                var r1 = r(1, 3, false);
                var r2 = r(4, 12, false);
                var r3 = r(5, 7, false);
                var r4 = r(8, 11, false);
                var r5 = r(9, 11, false);
                assertRanges(foldingModel, [r1, r2, r3, r4, r5]);
                var regExp = new RegExp('^\\s*' + strings_1.escapeRegExpCharacters('/*'));
                foldingModel_1.setCollapseStateForMatchingLines(foldingModel, regExp, true);
                assertFoldedRanges(foldingModel, [r1, r3, r5], '1');
            }
            finally {
                textModel.dispose();
            }
        });
    });
});
