define(["require", "exports", "assert", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/textModel"], function (require, exports, assert, editOperation_1, position_1, range_1, model_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function modelHasDecorations(model, decorations) {
        var modelDecorations = [];
        var actualDecorations = model.getAllDecorations();
        for (var i = 0, len = actualDecorations.length; i < len; i++) {
            modelDecorations.push({
                range: actualDecorations[i].range,
                className: actualDecorations[i].options.className
            });
        }
        modelDecorations.sort(function (a, b) { return range_1.Range.compareRangesUsingStarts(a.range, b.range); });
        assert.deepEqual(modelDecorations, decorations);
    }
    function modelHasDecoration(model, startLineNumber, startColumn, endLineNumber, endColumn, className) {
        modelHasDecorations(model, [{
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn),
                className: className
            }]);
    }
    function modelHasNoDecorations(model) {
        assert.equal(model.getAllDecorations().length, 0, 'Model has no decoration');
    }
    function addDecoration(model, startLineNumber, startColumn, endLineNumber, endColumn, className) {
        return model.changeDecorations(function (changeAccessor) {
            return changeAccessor.addDecoration(new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn), {
                className: className
            });
        });
    }
    function lineHasDecorations(model, lineNumber, decorations) {
        var lineDecorations = [];
        var decs = model.getLineDecorations(lineNumber);
        for (var i = 0, len = decs.length; i < len; i++) {
            lineDecorations.push({
                start: decs[i].range.startColumn,
                end: decs[i].range.endColumn,
                className: decs[i].options.className
            });
        }
        assert.deepEqual(lineDecorations, decorations, 'Line decorations');
    }
    function lineHasNoDecorations(model, lineNumber) {
        lineHasDecorations(model, lineNumber, []);
    }
    function lineHasDecoration(model, lineNumber, start, end, className) {
        lineHasDecorations(model, lineNumber, [{
                start: start,
                end: end,
                className: className
            }]);
    }
    suite('Editor Model - Model Decorations', function () {
        var LINE1 = 'My First Line';
        var LINE2 = '\t\tMy Second Line';
        var LINE3 = '    Third Line';
        var LINE4 = '';
        var LINE5 = '1';
        // --------- Model Decorations
        var thisModel;
        setup(function () {
            var text = LINE1 + '\r\n' +
                LINE2 + '\n' +
                LINE3 + '\n' +
                LINE4 + '\r\n' +
                LINE5;
            thisModel = textModel_1.TextModel.createFromString(text);
        });
        teardown(function () {
            thisModel.dispose();
            thisModel = null;
        });
        test('single character decoration', function () {
            addDecoration(thisModel, 1, 1, 1, 2, 'myType');
            lineHasDecoration(thisModel, 1, 1, 2, 'myType');
            lineHasNoDecorations(thisModel, 2);
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('line decoration', function () {
            addDecoration(thisModel, 1, 1, 1, 14, 'myType');
            lineHasDecoration(thisModel, 1, 1, 14, 'myType');
            lineHasNoDecorations(thisModel, 2);
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('full line decoration', function () {
            addDecoration(thisModel, 1, 1, 2, 1, 'myType');
            var line1Decorations = thisModel.getLineDecorations(1);
            assert.equal(line1Decorations.length, 1);
            assert.equal(line1Decorations[0].options.className, 'myType');
            var line2Decorations = thisModel.getLineDecorations(1);
            assert.equal(line2Decorations.length, 1);
            assert.equal(line2Decorations[0].options.className, 'myType');
            lineHasNoDecorations(thisModel, 3);
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        test('multiple line decoration', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            var line1Decorations = thisModel.getLineDecorations(1);
            assert.equal(line1Decorations.length, 1);
            assert.equal(line1Decorations[0].options.className, 'myType');
            var line2Decorations = thisModel.getLineDecorations(1);
            assert.equal(line2Decorations.length, 1);
            assert.equal(line2Decorations[0].options.className, 'myType');
            var line3Decorations = thisModel.getLineDecorations(1);
            assert.equal(line3Decorations.length, 1);
            assert.equal(line3Decorations[0].options.className, 'myType');
            lineHasNoDecorations(thisModel, 4);
            lineHasNoDecorations(thisModel, 5);
        });
        // --------- removing, changing decorations
        test('decoration gets removed', function () {
            var decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.removeDecoration(decId);
            });
            modelHasNoDecorations(thisModel);
        });
        test('decorations get removed', function () {
            var decId1 = addDecoration(thisModel, 1, 2, 3, 2, 'myType1');
            var decId2 = addDecoration(thisModel, 1, 2, 3, 1, 'myType2');
            modelHasDecorations(thisModel, [
                {
                    range: new range_1.Range(1, 2, 3, 1),
                    className: 'myType2'
                },
                {
                    range: new range_1.Range(1, 2, 3, 2),
                    className: 'myType1'
                }
            ]);
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.removeDecoration(decId1);
            });
            modelHasDecorations(thisModel, [
                {
                    range: new range_1.Range(1, 2, 3, 1),
                    className: 'myType2'
                }
            ]);
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.removeDecoration(decId2);
            });
            modelHasNoDecorations(thisModel);
        });
        test('decoration range can be changed', function () {
            var decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.changeDecoration(decId, new range_1.Range(1, 1, 1, 2));
            });
            modelHasDecoration(thisModel, 1, 1, 1, 2, 'myType');
        });
        // --------- eventing
        test('decorations emit event on add', function () {
            var listenerCalled = 0;
            thisModel.onDidChangeDecorations(function (e) {
                listenerCalled++;
            });
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            assert.equal(listenerCalled, 1, 'listener called');
        });
        test('decorations emit event on change', function () {
            var listenerCalled = 0;
            var decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.onDidChangeDecorations(function (e) {
                listenerCalled++;
            });
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.changeDecoration(decId, new range_1.Range(1, 1, 1, 2));
            });
            assert.equal(listenerCalled, 1, 'listener called');
        });
        test('decorations emit event on remove', function () {
            var listenerCalled = 0;
            var decId = addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.onDidChangeDecorations(function (e) {
                listenerCalled++;
            });
            thisModel.changeDecorations(function (changeAccessor) {
                changeAccessor.removeDecoration(decId);
            });
            assert.equal(listenerCalled, 1, 'listener called');
        });
        test('decorations emit event when inserting one line text before it', function () {
            var listenerCalled = 0;
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.onDidChangeDecorations(function (e) {
                listenerCalled++;
            });
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'Hallo ')]);
            assert.equal(listenerCalled, 1, 'listener called');
        });
        test('decorations do not emit event on no-op deltaDecorations', function () {
            var listenerCalled = 0;
            thisModel.onDidChangeDecorations(function (e) {
                listenerCalled++;
            });
            thisModel.deltaDecorations([], []);
            thisModel.changeDecorations(function (accessor) {
                accessor.deltaDecorations([], []);
            });
            assert.equal(listenerCalled, 0, 'listener not called');
        });
        // --------- editing text & effects on decorations
        test('decorations are updated when inserting one line text before it', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 8, 3, 2, 'myType');
        });
        test('decorations are updated when inserting one line text before it 2', function () {
            addDecoration(thisModel, 1, 1, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.replace(new range_1.Range(1, 1, 1, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
        });
        test('decorations are updated when inserting multiple lines text before it', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'Hallo\nI\'m inserting multiple\nlines')]);
            modelHasDecoration(thisModel, 3, 7, 5, 2, 'myType');
        });
        test('decorations change when inserting text after them', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(3, 2), 'Hallo')]);
            modelHasDecoration(thisModel, 1, 2, 3, 7, 'myType');
        });
        test('decorations are updated when inserting text inside', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
        });
        test('decorations are updated when inserting text inside 2', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(3, 1), 'Hallo ')]);
            modelHasDecoration(thisModel, 1, 2, 3, 8, 'myType');
        });
        test('decorations are updated when inserting text inside 3', function () {
            addDecoration(thisModel, 1, 1, 2, 16, 'myType');
            modelHasDecoration(thisModel, 1, 1, 2, 16, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(2, 2), '\n')]);
            modelHasDecoration(thisModel, 1, 1, 3, 15, 'myType');
        });
        test('decorations are updated when inserting multiple lines text inside', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 3), 'Hallo\nI\'m inserting multiple\nlines')]);
            modelHasDecoration(thisModel, 1, 2, 5, 2, 'myType');
        });
        test('decorations are updated when deleting one line text before it', function () {
            addDecoration(thisModel, 1, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 1, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2))]);
            modelHasDecoration(thisModel, 1, 1, 3, 2, 'myType');
        });
        test('decorations are updated when deleting multiple lines text before it', function () {
            addDecoration(thisModel, 2, 2, 3, 2, 'myType');
            modelHasDecoration(thisModel, 2, 2, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 2, 1))]);
            modelHasDecoration(thisModel, 1, 2, 2, 2, 'myType');
        });
        test('decorations are updated when deleting multiple lines text before it 2', function () {
            addDecoration(thisModel, 2, 3, 3, 2, 'myType');
            modelHasDecoration(thisModel, 2, 3, 3, 2, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 2, 2))]);
            modelHasDecoration(thisModel, 1, 2, 2, 2, 'myType');
        });
        test('decorations are updated when deleting text inside', function () {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 3, 2, 1))]);
            modelHasDecoration(thisModel, 1, 2, 3, 1, 'myType');
        });
        test('decorations are updated when deleting text inside 2', function () {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([
                editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 1, 2)),
                editOperation_1.EditOperation.delete(new range_1.Range(4, 1, 4, 1))
            ]);
            modelHasDecoration(thisModel, 1, 1, 4, 1, 'myType');
        });
        test('decorations are updated when deleting multiple lines text', function () {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType');
            modelHasDecoration(thisModel, 1, 2, 4, 1, 'myType');
            thisModel.applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(1, 1, 3, 1))]);
            modelHasDecoration(thisModel, 1, 1, 2, 1, 'myType');
        });
        test('decorations are updated when changing EOL', function () {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType1');
            addDecoration(thisModel, 1, 3, 4, 1, 'myType2');
            addDecoration(thisModel, 1, 4, 4, 1, 'myType3');
            addDecoration(thisModel, 1, 5, 4, 1, 'myType4');
            addDecoration(thisModel, 1, 6, 4, 1, 'myType5');
            addDecoration(thisModel, 1, 7, 4, 1, 'myType6');
            addDecoration(thisModel, 1, 8, 4, 1, 'myType7');
            addDecoration(thisModel, 1, 9, 4, 1, 'myType8');
            addDecoration(thisModel, 1, 10, 4, 1, 'myType9');
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'x')]);
            thisModel.setEOL(model_1.EndOfLineSequence.CRLF);
            thisModel.applyEdits([editOperation_1.EditOperation.insert(new position_1.Position(1, 1), 'x')]);
            modelHasDecorations(thisModel, [
                { range: new range_1.Range(1, 4, 4, 1), className: 'myType1' },
                { range: new range_1.Range(1, 5, 4, 1), className: 'myType2' },
                { range: new range_1.Range(1, 6, 4, 1), className: 'myType3' },
                { range: new range_1.Range(1, 7, 4, 1), className: 'myType4' },
                { range: new range_1.Range(1, 8, 4, 1), className: 'myType5' },
                { range: new range_1.Range(1, 9, 4, 1), className: 'myType6' },
                { range: new range_1.Range(1, 10, 4, 1), className: 'myType7' },
                { range: new range_1.Range(1, 11, 4, 1), className: 'myType8' },
                { range: new range_1.Range(1, 12, 4, 1), className: 'myType9' },
            ]);
        });
        test('an apparently simple edit', function () {
            addDecoration(thisModel, 1, 2, 4, 1, 'myType1');
            thisModel.applyEdits([editOperation_1.EditOperation.replace(new range_1.Range(1, 14, 2, 1), 'x')]);
            modelHasDecorations(thisModel, [
                { range: new range_1.Range(1, 2, 3, 1), className: 'myType1' },
            ]);
        });
        test('removeAllDecorationsWithOwnerId can be called after model dispose', function () {
            var model = textModel_1.TextModel.createFromString('asd');
            model.dispose();
            model.removeAllDecorationsWithOwnerId(1);
        });
        test('removeAllDecorationsWithOwnerId works', function () {
            thisModel.deltaDecorations([], [{ range: new range_1.Range(1, 2, 4, 1), options: { className: 'myType1' } }], 1);
            thisModel.removeAllDecorationsWithOwnerId(1);
            modelHasNoDecorations(thisModel);
        });
    });
    suite('Decorations and editing', function () {
        function _runTest(decRange, stickiness, editRange, editText, editForceMoveMarkers, expectedDecRange, msg) {
            var model = textModel_1.TextModel.createFromString([
                'My First Line',
                'My Second Line',
                'Third Line'
            ].join('\n'));
            var id = model.deltaDecorations([], [{ range: decRange, options: { stickiness: stickiness } }])[0];
            model.applyEdits([{
                    range: editRange,
                    text: editText,
                    forceMoveMarkers: editForceMoveMarkers
                }]);
            var actual = model.getDecorationRange(id);
            assert.deepEqual(actual, expectedDecRange, msg);
            model.dispose();
        }
        function runTest(decRange, editRange, editText, expectedDecRange) {
            _runTest(decRange, 0, editRange, editText, false, expectedDecRange[0][0], 'no-0-AlwaysGrowsWhenTypingAtEdges');
            _runTest(decRange, 1, editRange, editText, false, expectedDecRange[0][1], 'no-1-NeverGrowsWhenTypingAtEdges');
            _runTest(decRange, 2, editRange, editText, false, expectedDecRange[0][2], 'no-2-GrowsOnlyWhenTypingBefore');
            _runTest(decRange, 3, editRange, editText, false, expectedDecRange[0][3], 'no-3-GrowsOnlyWhenTypingAfter');
            _runTest(decRange, 0, editRange, editText, true, expectedDecRange[1][0], 'force-0-AlwaysGrowsWhenTypingAtEdges');
            _runTest(decRange, 1, editRange, editText, true, expectedDecRange[1][1], 'force-1-NeverGrowsWhenTypingAtEdges');
            _runTest(decRange, 2, editRange, editText, true, expectedDecRange[1][2], 'force-2-GrowsOnlyWhenTypingBefore');
            _runTest(decRange, 3, editRange, editText, true, expectedDecRange[1][3], 'force-3-GrowsOnlyWhenTypingAfter');
        }
        suite('insert', function () {
            suite('collapsed dec', function () {
                test('before', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 3, 1, 3), 'xx', [
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                    ]);
                });
                test('equal', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), 'xx', [
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 6, 1, 6)],
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                    ]);
                });
                test('after', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 5, 1, 5), 'xx', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', function () {
                test('before', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 3), 'xx', [
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                    ]);
                });
                test('start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 4), 'xx', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 6, 1, 11)],
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                    ]);
                });
                test('inside', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 5), 'xx', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                    ]);
                });
                test('end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 9, 1, 9), 'xx', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 11)],
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                    ]);
                });
                test('after', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 10, 1, 10), 'xx', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('delete', function () {
            suite('collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 1, 1, 3), '', [
                        [new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2)],
                        [new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 2, 1, 4), '', [
                        [new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2)],
                        [new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 2, 1, 2)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 3, 1, 5), '', [
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start >= range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 6), '', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 5, 1, 7), '', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 1, 1, 3), '', [
                        [new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7)],
                        [new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 2, 1, 4), '', [
                        [new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7)],
                        [new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7), new range_1.Range(1, 2, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 5), '', [
                        [new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7)],
                        [new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 3, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 9), '', [
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 10), '', [
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 6), '', [
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), '', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 10), '', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 7), '', [
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 9), '', [
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 10), '', [
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                    ]);
                });
                test('edit.start == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 9, 1, 11), '', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 10, 1, 11), '', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('replace short', function () {
            suite('collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 1, 1, 3), 'c', [
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 2, 1, 4), 'c', [
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                        [new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3), new range_1.Range(1, 3, 1, 3)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 3, 1, 5), 'c', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start >= range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 6), 'c', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 5, 1, 7), 'c', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 1, 1, 3), 'c', [
                        [new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8)],
                        [new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 2, 1, 4), 'c', [
                        [new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8)],
                        [new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8), new range_1.Range(1, 3, 1, 8)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 5), 'c', [
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 9), 'c', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 10), 'c', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 6), 'c', [
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                        [new range_1.Range(1, 5, 1, 8), new range_1.Range(1, 5, 1, 8), new range_1.Range(1, 5, 1, 8), new range_1.Range(1, 5, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), 'c', [
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                        [new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 10), 'c', [
                        [new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5), new range_1.Range(1, 4, 1, 5)],
                        [new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5), new range_1.Range(1, 5, 1, 5)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 7), 'c', [
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 9), 'c', [
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6)],
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 10), 'c', [
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6)],
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 4, 1, 6)],
                    ]);
                });
                test('edit.start == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 9, 1, 11), 'c', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 10), new range_1.Range(1, 4, 1, 10), new range_1.Range(1, 4, 1, 10), new range_1.Range(1, 4, 1, 10)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 10, 1, 11), 'c', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
            });
        });
        suite('replace long', function () {
            suite('collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 1, 1, 3), 'cccc', [
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 2, 1, 4), 'cccc', [
                        [new range_1.Range(1, 4, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 6, 1, 6)],
                        [new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 6, 1, 6)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 3, 1, 5), 'cccc', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start >= range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 6), 'cccc', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 5, 1, 7), 'cccc', [
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                        [new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4), new range_1.Range(1, 4, 1, 4)],
                    ]);
                });
            });
            suite('non-collapsed dec', function () {
                test('edit.end < range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 1, 1, 3), 'cccc', [
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                    ]);
                });
                test('edit.end <= range.start', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 2, 1, 4), 'cccc', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 6, 1, 11)],
                        [new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 6, 1, 11)],
                    ]);
                });
                test('edit.start < range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 5), 'cccc', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                        [new range_1.Range(1, 7, 1, 11), new range_1.Range(1, 7, 1, 11), new range_1.Range(1, 7, 1, 11), new range_1.Range(1, 7, 1, 11)],
                    ]);
                });
                test('edit.start < range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 9), 'cccc', [
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                        [new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start < range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 3, 1, 10), 'cccc', [
                        [new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7), new range_1.Range(1, 4, 1, 7)],
                        [new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7), new range_1.Range(1, 7, 1, 7)],
                    ]);
                });
                test('edit.start == range.start && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 6), 'cccc', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                        [new range_1.Range(1, 8, 1, 11), new range_1.Range(1, 8, 1, 11), new range_1.Range(1, 8, 1, 11), new range_1.Range(1, 8, 1, 11)],
                    ]);
                });
                test('edit.start == range.start && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), 'cccc', [
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                        [new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start == range.start && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 10), 'cccc', [
                        [new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8), new range_1.Range(1, 4, 1, 8)],
                        [new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8), new range_1.Range(1, 8, 1, 8)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end < range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 7), 'cccc', [
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                        [new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11), new range_1.Range(1, 4, 1, 11)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 9), 'cccc', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start > range.start && edit.start < range.end && edit.end > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 5, 1, 10), 'cccc', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
                test('edit.start == range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 9, 1, 11), 'cccc', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 13), new range_1.Range(1, 4, 1, 13), new range_1.Range(1, 4, 1, 13), new range_1.Range(1, 4, 1, 13)],
                    ]);
                });
                test('edit.start > range.end', function () {
                    runTest(new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 10, 1, 11), 'cccc', [
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                        [new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9), new range_1.Range(1, 4, 1, 9)],
                    ]);
                });
            });
        });
    });
    suite('deltaDecorations', function () {
        function decoration(id, startLineNumber, startColumn, endLineNumber, endColum) {
            return {
                id: id,
                range: new range_1.Range(startLineNumber, startColumn, endLineNumber, endColum)
            };
        }
        function toModelDeltaDecoration(dec) {
            return {
                range: dec.range,
                options: {
                    className: dec.id
                }
            };
        }
        function strcmp(a, b) {
            if (a === b) {
                return 0;
            }
            if (a < b) {
                return -1;
            }
            return 1;
        }
        function readModelDecorations(model, ids) {
            return ids.map(function (id) {
                return {
                    range: model.getDecorationRange(id),
                    id: model.getDecorationOptions(id).className
                };
            });
        }
        function testDeltaDecorations(text, decorations, newDecorations) {
            var model = textModel_1.TextModel.createFromString(text.join('\n'));
            // Add initial decorations & assert they are added
            var initialIds = model.deltaDecorations([], decorations.map(toModelDeltaDecoration));
            var actualDecorations = readModelDecorations(model, initialIds);
            assert.equal(initialIds.length, decorations.length, 'returns expected cnt of ids');
            assert.equal(initialIds.length, model.getAllDecorations().length, 'does not leak decorations');
            actualDecorations.sort(function (a, b) { return strcmp(a.id, b.id); });
            decorations.sort(function (a, b) { return strcmp(a.id, b.id); });
            assert.deepEqual(actualDecorations, decorations);
            var newIds = model.deltaDecorations(initialIds, newDecorations.map(toModelDeltaDecoration));
            var actualNewDecorations = readModelDecorations(model, newIds);
            assert.equal(newIds.length, newDecorations.length, 'returns expected cnt of ids');
            assert.equal(newIds.length, model.getAllDecorations().length, 'does not leak decorations');
            actualNewDecorations.sort(function (a, b) { return strcmp(a.id, b.id); });
            newDecorations.sort(function (a, b) { return strcmp(a.id, b.id); });
            assert.deepEqual(actualDecorations, decorations);
            model.dispose();
        }
        function range(startLineNumber, startColumn, endLineNumber, endColumn) {
            return new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        test('result respects input', function () {
            var model = textModel_1.TextModel.createFromString([
                'Hello world,',
                'How are you?'
            ].join('\n'));
            var ids = model.deltaDecorations([], [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            model.dispose();
        });
        test('deltaDecorations 1', function () {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 1, 1, 15),
                decoration('c', 1, 1, 2, 1),
                decoration('d', 1, 1, 2, 24),
                decoration('e', 2, 1, 2, 24),
                decoration('f', 2, 1, 4, 16)
            ], [
                decoration('x', 1, 1, 1, 2),
                decoration('b', 1, 1, 1, 15),
                decoration('c', 1, 1, 2, 1),
                decoration('d', 1, 1, 2, 24),
                decoration('e', 2, 1, 2, 21),
                decoration('f', 2, 17, 4, 16)
            ]);
        });
        test('deltaDecorations 2', function () {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 2, 1, 3),
                decoration('c', 1, 3, 1, 4),
                decoration('d', 1, 4, 1, 5),
                decoration('e', 1, 5, 1, 6)
            ], [
                decoration('a', 1, 2, 1, 3),
                decoration('b', 1, 3, 1, 4),
                decoration('c', 1, 4, 1, 5),
                decoration('d', 1, 5, 1, 6)
            ]);
        });
        test('deltaDecorations 3', function () {
            testDeltaDecorations([
                'This is a text',
                'That has multiple lines',
                'And is very friendly',
                'Towards testing'
            ], [
                decoration('a', 1, 1, 1, 2),
                decoration('b', 1, 2, 1, 3),
                decoration('c', 1, 3, 1, 4),
                decoration('d', 1, 4, 1, 5),
                decoration('e', 1, 5, 1, 6)
            ], []);
        });
        test('issue #4317: editor.setDecorations doesn\'t update the hover message', function () {
            var model = textModel_1.TextModel.createFromString('Hello world!');
            var ids = model.deltaDecorations([], [{
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 100,
                        endColumn: 1
                    },
                    options: {
                        hoverMessage: { value: 'hello1' }
                    }
                }]);
            ids = model.deltaDecorations(ids, [{
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 100,
                        endColumn: 1
                    },
                    options: {
                        hoverMessage: { value: 'hello2' }
                    }
                }]);
            var actualDecoration = model.getDecorationOptions(ids[0]);
            assert.deepEqual(actualDecoration.hoverMessage, { value: 'hello2' });
            model.dispose();
        });
        test('model doesn\'t get confused with individual tracked ranges', function () {
            var model = textModel_1.TextModel.createFromString([
                'Hello world,',
                'How are you?'
            ].join('\n'));
            var trackedRangeId = model.changeDecorations(function (changeAcessor) {
                return changeAcessor.addDecoration({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1
                }, {
                    stickiness: model_1.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
                });
            });
            model.changeDecorations(function (changeAccessor) {
                changeAccessor.removeDecoration(trackedRangeId);
            });
            var ids = model.deltaDecorations([], [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            ids = model.deltaDecorations(ids, [
                toModelDeltaDecoration(decoration('a', 1, 1, 1, 12)),
                toModelDeltaDecoration(decoration('b', 2, 1, 2, 13))
            ]);
            assert.deepEqual(model.getDecorationRange(ids[0]), range(1, 1, 1, 12));
            assert.deepEqual(model.getDecorationRange(ids[1]), range(2, 1, 2, 13));
            model.dispose();
        });
        test('issue #16922: Clicking on link doesn\'t seem to do anything', function () {
            var model = textModel_1.TextModel.createFromString([
                'Hello world,',
                'How are you?',
                'Fine.',
                'Good.',
            ].join('\n'));
            model.deltaDecorations([], [
                { range: new range_1.Range(1, 1, 1, 1), options: { className: '1' } },
                { range: new range_1.Range(1, 13, 1, 13), options: { className: '2' } },
                { range: new range_1.Range(2, 1, 2, 1), options: { className: '3' } },
                { range: new range_1.Range(2, 1, 2, 4), options: { className: '4' } },
                { range: new range_1.Range(2, 8, 2, 13), options: { className: '5' } },
                { range: new range_1.Range(3, 1, 4, 6), options: { className: '6' } },
                { range: new range_1.Range(1, 1, 3, 6), options: { className: 'x1' } },
                { range: new range_1.Range(2, 5, 2, 8), options: { className: 'x2' } },
                { range: new range_1.Range(1, 1, 2, 8), options: { className: 'x3' } },
                { range: new range_1.Range(2, 5, 3, 1), options: { className: 'x4' } },
            ]);
            var inRange = model.getDecorationsInRange(new range_1.Range(2, 6, 2, 6));
            var inRangeClassNames = inRange.map(function (d) { return d.options.className; });
            inRangeClassNames.sort();
            assert.deepEqual(inRangeClassNames, ['x1', 'x2', 'x3', 'x4']);
            model.dispose();
        });
    });
});
