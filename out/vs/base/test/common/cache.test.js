/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cache", "vs/base/common/winjs.base"], function (require, exports, assert, cache_1, winjs_base_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Cache', function () {
        test('simple value', function () {
            var counter = 0;
            var cache = new cache_1.default(function () { return winjs_base_1.TPromise.as(counter++); });
            return cache.get()
                .then(function (c) { return assert.equal(c, 0); }, function () { return assert.fail(); })
                .then(function () { return cache.get(); })
                .then(function (c) { return assert.equal(c, 0); }, function () { return assert.fail(); });
        });
        test('simple error', function () {
            var counter = 0;
            var cache = new cache_1.default(function () { return winjs_base_1.TPromise.wrapError(new Error(String(counter++))); });
            return cache.get()
                .then(function () { return assert.fail(); }, function (err) { return assert.equal(err.message, 0); })
                .then(function () { return cache.get(); })
                .then(function () { return assert.fail(); }, function (err) { return assert.equal(err.message, 0); });
        });
        test('should retry cancellations', function () {
            var counter1 = 0, counter2 = 0;
            var cache = new cache_1.default(function () {
                counter1++;
                return winjs_base_1.TPromise.timeout(1).then(function () { return counter2++; });
            });
            assert.equal(counter1, 0);
            assert.equal(counter2, 0);
            var promise = cache.get();
            assert.equal(counter1, 1);
            assert.equal(counter2, 0);
            promise.cancel();
            assert.equal(counter1, 1);
            assert.equal(counter2, 0);
            promise = cache.get();
            assert.equal(counter1, 2);
            assert.equal(counter2, 0);
            return promise
                .then(function (c) {
                assert.equal(counter1, 2);
                assert.equal(counter2, 1);
            })
                .then(function () { return cache.get(); })
                .then(function (c) {
                assert.equal(counter1, 2);
                assert.equal(counter2, 1);
            });
        });
    });
});
