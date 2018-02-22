/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/model/textModel", "vs/editor/contrib/folding/indentRangeProvider", "vs/editor/contrib/folding/foldingRanges"], function (require, exports, assert, textModel_1, indentRangeProvider_1, foldingRanges_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var markers = {
        start: /^\s*#region\b/,
        end: /^\s*#endregion\b/
    };
    suite('FoldingRanges', function () {
        test('test max folding regions', function () {
            var lines = [];
            var nRegions = foldingRanges_1.MAX_FOLDING_REGIONS;
            for (var i = 0; i < nRegions; i++) {
                lines.push('#region');
            }
            for (var i = 0; i < nRegions; i++) {
                lines.push('#endregion');
            }
            var model = textModel_1.TextModel.createFromString(lines.join('\n'));
            var actual = indentRangeProvider_1.computeRanges(model, false, markers, foldingRanges_1.MAX_FOLDING_REGIONS);
            assert.equal(actual.length, nRegions, 'len');
            for (var i = 0; i < nRegions; i++) {
                assert.equal(actual.getStartLineNumber(i), i + 1, 'start' + i);
                assert.equal(actual.getEndLineNumber(i), nRegions * 2 - i, 'end' + i);
                assert.equal(actual.getParentIndex(i), i - 1, 'parent' + i);
            }
        });
        test('findRange', function () {
            var lines = [
                /* 1*/ '#region',
                /* 2*/ '#endregion',
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
                var actual = indentRangeProvider_1.computeRanges(textModel, false, markers);
                // let r0 = r(1, 2);
                // let r1 = r(3, 12);
                // let r2 = r(4, 11);
                // let r3 = r(5, 6);
                // let r4 = r(9, 10);
                assert.equal(actual.findRange(1), 0, '1');
                assert.equal(actual.findRange(2), 0, '2');
                assert.equal(actual.findRange(3), 1, '3');
                assert.equal(actual.findRange(4), 2, '4');
                assert.equal(actual.findRange(5), 3, '5');
                assert.equal(actual.findRange(6), 3, '6');
                assert.equal(actual.findRange(7), 2, '7');
                assert.equal(actual.findRange(8), 2, '8');
                assert.equal(actual.findRange(9), 4, '9');
                assert.equal(actual.findRange(10), 4, '10');
                assert.equal(actual.findRange(11), 2, '11');
                assert.equal(actual.findRange(12), 1, '12');
                assert.equal(actual.findRange(13), -1, '13');
            }
            finally {
                textModel.dispose();
            }
        });
        test('setCollapsed', function () {
            var lines = [];
            var nRegions = 500;
            for (var i = 0; i < nRegions; i++) {
                lines.push('#region');
            }
            for (var i = 0; i < nRegions; i++) {
                lines.push('#endregion');
            }
            var model = textModel_1.TextModel.createFromString(lines.join('\n'));
            var actual = indentRangeProvider_1.computeRanges(model, false, markers, foldingRanges_1.MAX_FOLDING_REGIONS);
            assert.equal(actual.length, nRegions, 'len');
            for (var i = 0; i < nRegions; i++) {
                actual.setCollapsed(i, i % 3 === 0);
            }
            for (var i = 0; i < nRegions; i++) {
                assert.equal(actual.isCollapsed(i), i % 3 === 0, 'line' + i);
            }
        });
    });
});
