define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/test/common/viewModel/testViewModel"], function (require, exports, assert, range_1, testViewModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ViewModel', function () {
        test('issue #21073: SplitLinesCollection: attempt to access a \'newer\' model', function () {
            var text = [''];
            var opts = {
                lineNumbersMinChars: 1
            };
            testViewModel_1.testViewModel(text, opts, function (viewModel, model) {
                assert.equal(viewModel.getLineCount(), 1);
                viewModel.setViewport(1, 1, 1);
                model.applyEdits([{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: [
                            'line01',
                            'line02',
                            'line03',
                            'line04',
                            'line05',
                            'line06',
                            'line07',
                            'line08',
                            'line09',
                            'line10',
                        ].join('\n')
                    }]);
                assert.equal(viewModel.getLineCount(), 10);
            });
        });
        function assertGetPlainTextToCopy(text, ranges, emptySelectionClipboard, expected) {
            testViewModel_1.testViewModel(text, {}, function (viewModel, model) {
                var actual = viewModel.getPlainTextToCopy(ranges, emptySelectionClipboard);
                assert.deepEqual(actual, expected);
            });
        }
        var USUAL_TEXT = [
            '',
            'line2',
            'line3',
            'line4',
            ''
        ];
        test('getPlainTextToCopy 0/1', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2)
            ], false, '');
        });
        test('getPlainTextToCopy 0/1 - emptySelectionClipboard', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2)
            ], true, 'line2\n');
        });
        test('getPlainTextToCopy 1/1', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6)
            ], false, 'ine2');
        });
        test('getPlainTextToCopy 1/1 - emptySelectionClipboard', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6)
            ], true, 'ine2');
        });
        test('getPlainTextToCopy 0/2', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(3, 2, 3, 2),
            ], false, '');
        });
        test('getPlainTextToCopy 0/2 - emptySelectionClipboard', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(3, 2, 3, 2),
            ], true, 'line2\nline3\n');
        });
        test('getPlainTextToCopy 1/2', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 2),
            ], false, 'ine2');
        });
        test('getPlainTextToCopy 1/2 - emptySelectionClipboard', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 2),
            ], true, 'ine2');
        });
        test('getPlainTextToCopy 2/2', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 6),
                new range_1.Range(3, 2, 3, 6),
            ], false, ['ine2', 'ine3']);
        });
        test('getPlainTextToCopy 2/2 reversed', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(3, 2, 3, 6),
                new range_1.Range(2, 2, 2, 6),
            ], false, ['ine2', 'ine3']);
        });
        test('getPlainTextToCopy 0/3 - emptySelectionClipboard', function () {
            assertGetPlainTextToCopy(USUAL_TEXT, [
                new range_1.Range(2, 2, 2, 2),
                new range_1.Range(2, 3, 2, 3),
                new range_1.Range(3, 2, 3, 2),
            ], true, 'line2\nline3\n');
        });
    });
});
