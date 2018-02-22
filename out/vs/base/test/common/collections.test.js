/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/collections"], function (require, exports, assert, collections) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Collections', function () {
        test('forEach', function () {
            collections.forEach({}, function () { return assert(false); });
            collections.forEach(Object.create(null), function () { return assert(false); });
            var count = 0;
            collections.forEach({ toString: 123 }, function () { return count++; });
            assert.equal(count, 1);
            count = 0;
            var dict = Object.create(null);
            dict['toString'] = 123;
            collections.forEach(dict, function () { return count++; });
            assert.equal(count, 1);
            collections.forEach(dict, function () { return false; });
            collections.forEach(dict, function (x, remove) { return remove(); });
            assert.equal(dict['toString'], null);
            // don't iterate over properties that are not on the object itself
            var test = Object.create({ 'derived': true });
            collections.forEach(test, function () { return assert(false); });
        });
        test('groupBy', function () {
            var group1 = 'a', group2 = 'b';
            var value1 = 1, value2 = 2, value3 = 3;
            var source = [
                { key: group1, value: value1 },
                { key: group1, value: value2 },
                { key: group2, value: value3 },
            ];
            var grouped = collections.groupBy(source, function (x) { return x.key; });
            // Group 1
            assert.equal(grouped[group1].length, 2);
            assert.equal(grouped[group1][0].value, value1);
            assert.equal(grouped[group1][1].value, value2);
            // Group 2
            assert.equal(grouped[group2].length, 1);
            assert.equal(grouped[group2][0].value, value3);
        });
        test('remove', function () {
            assert(collections.remove({ 'far': 1 }, 'far'));
            assert(!collections.remove({ 'far': 1 }, 'boo'));
        });
    });
});
