/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/preferences/common/smartSnippetInserter", "vs/editor/common/model/textModel", "vs/editor/common/core/position"], function (require, exports, assert, smartSnippetInserter_1, textModel_1, position_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SmartSnippetInserter', function () {
        function testSmartSnippetInserter(text, runner) {
            var model = textModel_1.TextModel.createFromString(text.join('\n'));
            runner(function (desiredPos, pos, prepend, append) {
                var actual = smartSnippetInserter_1.SmartSnippetInserter.insertSnippet(model, desiredPos);
                var expected = {
                    position: pos,
                    prepend: prepend,
                    append: append
                };
                assert.deepEqual(actual, expected);
            });
            model.dispose();
        }
        test('empty text', function () {
            testSmartSnippetInserter([], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 1), '\n[', ']');
            });
            testSmartSnippetInserter([
                ' '
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 2), '\n[', ']');
                assert(new position_1.Position(1, 2), new position_1.Position(1, 2), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 18), '\n[', ']');
                assert(new position_1.Position(1, 18), new position_1.Position(1, 18), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text',
                ''
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 1), '\n[', ']');
                assert(new position_1.Position(1, 18), new position_1.Position(2, 1), '\n[', ']');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 1), '\n[', ']');
            });
        });
        test('empty array 1', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[]'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 3), new position_1.Position(2, 2), '', '');
            });
        });
        test('empty array 2', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                ']'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', '');
            });
        });
        test('empty array 3', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '// just some text',
                ']'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), '', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), '', '');
            });
        });
        test('one element array 1', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{}',
                ']'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), ',', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), ',', '');
            });
        });
        test('two elements array 1', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},',
                '{}',
                ']'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(3, 4), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), '', ',');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), '', ',');
                assert(new position_1.Position(4, 3), new position_1.Position(4, 3), ',', '');
                assert(new position_1.Position(5, 1), new position_1.Position(5, 1), ',', '');
                assert(new position_1.Position(5, 2), new position_1.Position(5, 1), ',', '');
            });
        });
        test('two elements array 2', function () {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},{}',
                ']'
            ], function (assert) {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(3, 4), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(3, 5), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(3, 6), new position_1.Position(3, 6), ',', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), ',', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), ',', '');
            });
        });
    });
});
