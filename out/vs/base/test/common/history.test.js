define(["require", "exports", "assert", "vs/base/common/history"], function (require, exports, assert, history_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('History Navigator', function () {
        test('create reduces the input to limit', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 2);
            assert.deepEqual(['3', '4'], toArray(testObject));
        });
        test('create sets the position to last', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            assert.equal('4', testObject.current());
            assert.equal(null, testObject.next());
            assert.equal('3', testObject.previous());
        });
        test('last returns last element', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            assert.equal('4', testObject.last());
        });
        test('first returns first element', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            assert.equal('2', testObject.first());
        });
        test('next returns next element', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            assert.equal('3', testObject.next());
            assert.equal('4', testObject.next());
            assert.equal(null, testObject.next());
        });
        test('previous returns previous element', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            assert.equal('3', testObject.previous());
            assert.equal('2', testObject.previous());
            assert.equal(null, testObject.previous());
        });
        test('next on last element returs null and remains on last', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            testObject.last();
            assert.equal('4', testObject.current());
            assert.equal(null, testObject.next());
        });
        test('previous on first element returs null and remains on first', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            assert.equal('2', testObject.current());
            assert.equal(null, testObject.previous());
        });
        test('add reduces the input to limit', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 2);
            testObject.add('5');
            assert.deepEqual(['4', '5'], toArray(testObject));
        });
        test('adding existing element changes the position', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 5);
            testObject.add('2');
            assert.deepEqual(['1', '3', '4', '2'], toArray(testObject));
        });
        test('add resets the navigator to last', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            testObject.add('5');
            assert.equal('5', testObject.current());
            assert.equal(null, testObject.next());
        });
        test('adding an existing item changes the order', function () {
            var testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.add('1');
            assert.deepEqual(['2', '3', '1'], toArray(testObject));
        });
        function toArray(historyNavigator) {
            var result = [];
            historyNavigator.first();
            if (historyNavigator.current()) {
                do {
                    result.push(historyNavigator.current());
                } while (historyNavigator.next());
            }
            return result;
        }
    });
});
