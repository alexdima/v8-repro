/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/linkedList"], function (require, exports, assert, linkedList_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LinkedList', function () {
        function assertElements(list) {
            var elements = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                elements[_i - 1] = arguments[_i];
            }
            // first: assert toArray
            assert.deepEqual(list.toArray(), elements);
            // second: assert iterator
            for (var iter = list.iterator(), element = iter.next(); !element.done; element = iter.next()) {
                assert.equal(elements.shift(), element.value);
            }
            assert.equal(elements.length, 0);
        }
        test('Push/Iter', function () {
            var list = new linkedList_1.LinkedList();
            list.push(0);
            list.push(1);
            list.push(2);
            assertElements(list, 0, 1, 2);
        });
        test('Push/Remove', function () {
            var list = new linkedList_1.LinkedList();
            var disp = list.push(0);
            list.push(1);
            list.push(2);
            disp();
            assertElements(list, 1, 2);
            list = new linkedList_1.LinkedList();
            list.push(0);
            disp = list.push(1);
            list.push(2);
            disp();
            assertElements(list, 0, 2);
            list = new linkedList_1.LinkedList();
            list.push(0);
            list.push(1);
            disp = list.push(2);
            disp();
            assertElements(list, 0, 1);
        });
        test('Push/toArray', function () {
            var list = new linkedList_1.LinkedList();
            list.push('foo');
            list.push('bar');
            list.push('far');
            list.push('boo');
            assert.deepEqual(list.toArray(), [
                'foo',
                'bar',
                'far',
                'boo',
            ]);
        });
        test('unshift/Iter', function () {
            var list = new linkedList_1.LinkedList();
            list.unshift(0);
            list.unshift(1);
            list.unshift(2);
            assertElements(list, 2, 1, 0);
        });
        test('unshift/Remove', function () {
            var list = new linkedList_1.LinkedList();
            var disp = list.unshift(0);
            list.unshift(1);
            list.unshift(2);
            disp();
            assertElements(list, 2, 1);
            list = new linkedList_1.LinkedList();
            list.unshift(0);
            disp = list.unshift(1);
            list.unshift(2);
            disp();
            assertElements(list, 2, 0);
            list = new linkedList_1.LinkedList();
            list.unshift(0);
            list.unshift(1);
            disp = list.unshift(2);
            disp();
            assertElements(list, 1, 0);
        });
        test('unshift/toArray', function () {
            var list = new linkedList_1.LinkedList();
            list.unshift('foo');
            list.unshift('bar');
            list.unshift('far');
            list.unshift('boo');
            assert.deepEqual(list.toArray(), [
                'boo',
                'far',
                'bar',
                'foo',
            ]);
        });
    });
});
