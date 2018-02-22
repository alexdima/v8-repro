define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/test/common/viewModel/testViewModel"], function (require, exports, assert, range_1, testViewModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ViewModelDecorations', function () {
        test('getDecorationsViewportData', function () {
            var text = [
                'hello world, this is a buffer that will be wrapped'
            ];
            var opts = {
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 13
            };
            testViewModel_1.testViewModel(text, opts, function (viewModel, model) {
                assert.equal(viewModel.getLineContent(1), 'hello world, ');
                assert.equal(viewModel.getLineContent(2), 'this is a ');
                assert.equal(viewModel.getLineContent(3), 'buffer that ');
                assert.equal(viewModel.getLineContent(4), 'will be ');
                assert.equal(viewModel.getLineContent(5), 'wrapped');
                model.changeDecorations(function (accessor) {
                    var createOpts = function (id) {
                        return {
                            className: id,
                            inlineClassName: 'i-' + id,
                            beforeContentClassName: 'b-' + id,
                            afterContentClassName: 'a-' + id
                        };
                    };
                    // VIEWPORT will be (1,14) -> (1,36)
                    // completely before viewport
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 3), createOpts('dec1'));
                    // starts before viewport, ends at viewport start
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 14), createOpts('dec2'));
                    // starts before viewport, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 15), createOpts('dec3'));
                    // starts before viewport, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 36), createOpts('dec4'));
                    // starts before viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 2, 1, 51), createOpts('dec5'));
                    // starts at viewport start, ends at viewport start
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 14), createOpts('dec6'));
                    // starts at viewport start, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 16), createOpts('dec7'));
                    // starts at viewport start, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 36), createOpts('dec8'));
                    // starts at viewport start, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 14, 1, 51), createOpts('dec9'));
                    // starts inside viewport, ends inside viewport
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 18), createOpts('dec10'));
                    // starts inside viewport, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 36), createOpts('dec11'));
                    // starts inside viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 16, 1, 51), createOpts('dec12'));
                    // starts at viewport end, ends at viewport end
                    accessor.addDecoration(new range_1.Range(1, 36, 1, 36), createOpts('dec13'));
                    // starts at viewport end, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 36, 1, 51), createOpts('dec14'));
                    // starts after viewport, ends after viewport
                    accessor.addDecoration(new range_1.Range(1, 40, 1, 51), createOpts('dec15'));
                });
                var actualDecorations = viewModel.getDecorationsInViewport(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))).map(function (dec) {
                    return dec.options.className;
                });
                assert.deepEqual(actualDecorations, [
                    'dec2',
                    'dec3',
                    'dec4',
                    'dec5',
                    'dec6',
                    'dec7',
                    'dec8',
                    'dec9',
                    'dec10',
                    'dec11',
                    'dec12',
                    'dec13',
                    'dec14',
                ]);
                var inlineDecorations1 = viewModel.getViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                // view line 2: (1,14 -> 1,24)
                assert.deepEqual(inlineDecorations1, [
                    {
                        range: new range_1.Range(1, 2, 2, 1),
                        inlineClassName: 'i-dec2',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'a-dec2',
                        type: 2 /* After */
                    },
                    {
                        range: new range_1.Range(1, 2, 2, 2),
                        inlineClassName: 'i-dec3',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 2, 2, 2),
                        inlineClassName: 'a-dec3',
                        type: 2 /* After */
                    },
                    {
                        range: new range_1.Range(1, 2, 4, 1),
                        inlineClassName: 'i-dec4',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(1, 2, 5, 8),
                        inlineClassName: 'i-dec5',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'i-dec6',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'b-dec6',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'a-dec6',
                        type: 2 /* After */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 3),
                        inlineClassName: 'i-dec7',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'b-dec7',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 3, 2, 3),
                        inlineClassName: 'a-dec7',
                        type: 2 /* After */
                    },
                    {
                        range: new range_1.Range(2, 1, 4, 1),
                        inlineClassName: 'i-dec8',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'b-dec8',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 1, 5, 8),
                        inlineClassName: 'i-dec9',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 2, 1),
                        inlineClassName: 'b-dec9',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 3, 2, 5),
                        inlineClassName: 'i-dec10',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 3, 2, 3),
                        inlineClassName: 'b-dec10',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 5, 2, 5),
                        inlineClassName: 'a-dec10',
                        type: 2 /* After */
                    },
                    {
                        range: new range_1.Range(2, 3, 4, 1),
                        inlineClassName: 'i-dec11',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 3, 2, 3),
                        inlineClassName: 'b-dec11',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(2, 3, 5, 8),
                        inlineClassName: 'i-dec12',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 3, 2, 3),
                        inlineClassName: 'b-dec12',
                        type: 1 /* Before */
                    },
                ]);
                var inlineDecorations2 = viewModel.getViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                // view line 3 (24 -> 36)
                assert.deepEqual(inlineDecorations2, [
                    {
                        range: new range_1.Range(1, 2, 4, 1),
                        inlineClassName: 'i-dec4',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(1, 2, 5, 8),
                        inlineClassName: 'i-dec5',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 4, 1),
                        inlineClassName: 'i-dec8',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 1, 5, 8),
                        inlineClassName: 'i-dec9',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 3, 4, 1),
                        inlineClassName: 'i-dec11',
                        type: 0 /* Regular */
                    },
                    {
                        range: new range_1.Range(2, 3, 5, 8),
                        inlineClassName: 'i-dec12',
                        type: 0 /* Regular */
                    },
                ]);
            });
        });
        test('issue #17208: Problem scrolling in 1.8.0', function () {
            var text = [
                'hello world, this is a buffer that will be wrapped'
            ];
            var opts = {
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 13
            };
            testViewModel_1.testViewModel(text, opts, function (viewModel, model) {
                assert.equal(viewModel.getLineContent(1), 'hello world, ');
                assert.equal(viewModel.getLineContent(2), 'this is a ');
                assert.equal(viewModel.getLineContent(3), 'buffer that ');
                assert.equal(viewModel.getLineContent(4), 'will be ');
                assert.equal(viewModel.getLineContent(5), 'wrapped');
                model.changeDecorations(function (accessor) {
                    accessor.addDecoration(new range_1.Range(1, 50, 1, 51), {
                        beforeContentClassName: 'dec1'
                    });
                });
                var decorations = viewModel.getDecorationsInViewport(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)));
                assert.deepEqual(decorations, []);
                var inlineDecorations1 = viewModel.getViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 2).inlineDecorations;
                assert.deepEqual(inlineDecorations1, []);
                var inlineDecorations2 = viewModel.getViewLineRenderingData(new range_1.Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)), 3).inlineDecorations;
                assert.deepEqual(inlineDecorations2, []);
            });
        });
        test('issue #37401: Allow both before and after decorations on empty line', function () {
            var text = [
                ''
            ];
            testViewModel_1.testViewModel(text, {}, function (viewModel, model) {
                model.changeDecorations(function (accessor) {
                    accessor.addDecoration(new range_1.Range(1, 1, 1, 1), {
                        beforeContentClassName: 'before1',
                        afterContentClassName: 'after1'
                    });
                });
                var inlineDecorations = viewModel.getViewLineRenderingData(new range_1.Range(1, 1, 1, 1), 1).inlineDecorations;
                assert.deepEqual(inlineDecorations, [
                    {
                        range: new range_1.Range(1, 1, 1, 1),
                        inlineClassName: 'before1',
                        type: 1 /* Before */
                    },
                    {
                        range: new range_1.Range(1, 1, 1, 1),
                        inlineClassName: 'after1',
                        type: 2 /* After */
                    }
                ]);
            });
        });
    });
});
