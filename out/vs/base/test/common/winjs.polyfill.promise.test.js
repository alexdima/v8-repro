define(["require", "exports", "assert", "vs/base/common/winjs.polyfill.promise", "vs/base/common/winjs.base"], function (require, exports, assert, winjs_polyfill_promise_1, winjs_base_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Polyfill Promise', function () {
        test('sync-resolve, NativePromise', function () {
            // native promise behaviour
            var actual = [];
            var promise = new Promise(function (resolve) {
                actual.push('inCtor');
                resolve(null);
            }).then(function () { return actual.push('inThen'); });
            actual.push('afterCtor');
            return promise.then(function () {
                assert.deepEqual(actual, ['inCtor', 'afterCtor', 'inThen']);
            });
        });
        test('sync-resolve, WinJSPromise', function () {
            // winjs promise behaviour
            var actual = [];
            var promise = new winjs_base_1.Promise(function (resolve) {
                actual.push('inCtor');
                resolve(null);
            }).then(function () { return actual.push('inThen'); });
            actual.push('afterCtor');
            return promise.then(function () {
                assert.deepEqual(actual, ['inCtor', 'inThen', 'afterCtor']);
            });
        });
        test('sync-resolve, PolyfillPromise', function () {
            // winjs promise behaviour
            var actual = [];
            var promise = new winjs_polyfill_promise_1.PolyfillPromise(function (resolve) {
                actual.push('inCtor');
                resolve(null);
            }).then(function () { return actual.push('inThen'); });
            actual.push('afterCtor');
            return promise.then(function () {
                assert.deepEqual(actual, ['inCtor', 'afterCtor', 'inThen']);
            });
        });
        test('sync-then, NativePromise', function () {
            var actual = [];
            var promise = Promise.resolve(123).then(function () { return actual.push('inThen'); });
            actual.push('afterThen');
            return promise.then(function () {
                assert.deepEqual(actual, ['afterThen', 'inThen']);
            });
        });
        test('sync-then, WinJSPromise', function () {
            var actual = [];
            var promise = winjs_base_1.Promise.as(123).then(function () { return actual.push('inThen'); });
            actual.push('afterThen');
            return promise.then(function () {
                assert.deepEqual(actual, ['inThen', 'afterThen']);
            });
        });
        test('sync-then, PolyfillPromise', function () {
            var actual = [];
            var promise = winjs_polyfill_promise_1.PolyfillPromise.resolve(123).then(function () { return actual.push('inThen'); });
            actual.push('afterThen');
            return promise.then(function () {
                assert.deepEqual(actual, ['afterThen', 'inThen']);
            });
        });
        test('PolyfillPromise, executor has two params', function () {
            return new winjs_polyfill_promise_1.PolyfillPromise(function () {
                assert.equal(arguments.length, 2);
                assert.equal(typeof arguments[0], 'function');
                assert.equal(typeof arguments[1], 'function');
                arguments[0]();
            });
        });
        // run the same tests for the native and polyfill promise
        [Promise, winjs_polyfill_promise_1.PolyfillPromise].forEach(function (PromiseCtor) {
            test(PromiseCtor.name + ', resolved value', function () {
                return new PromiseCtor(function (resolve) { return resolve(1); }).then(function (value) { return assert.equal(value, 1); });
            });
            test(PromiseCtor.name + ', rejected value', function () {
                return new PromiseCtor(function (_, reject) { return reject(1); }).then(null, function (value) { return assert.equal(value, 1); });
            });
            test(PromiseCtor.name + ', catch', function () {
                return new PromiseCtor(function (_, reject) { return reject(1); }).catch(function (value) { return assert.equal(value, 1); });
            });
            test(PromiseCtor.name + ', static-resolve', function () {
                return PromiseCtor.resolve(42).then(function (value) { return assert.equal(value, 42); });
            });
            test(PromiseCtor.name + ', static-reject', function () {
                return PromiseCtor.reject(42).then(null, function (value) { return assert.equal(value, 42); });
            });
            test(PromiseCtor.name + ', static-all, 1', function () {
                return PromiseCtor.all([
                    PromiseCtor.resolve(1),
                    PromiseCtor.resolve(2)
                ]).then(function (values) {
                    assert.deepEqual(values, [1, 2]);
                });
            });
            test(PromiseCtor.name + ', static-all, 2', function () {
                return PromiseCtor.all([
                    PromiseCtor.resolve(1),
                    3,
                    PromiseCtor.resolve(2)
                ]).then(function (values) {
                    assert.deepEqual(values, [1, 3, 2]);
                });
            });
            test(PromiseCtor.name + ', static-all, 3', function () {
                return PromiseCtor.all([
                    PromiseCtor.resolve(1),
                    PromiseCtor.reject(13),
                    PromiseCtor.reject(12),
                ]).catch(function (values) {
                    assert.deepEqual(values, 13);
                });
            });
            test(PromiseCtor.name + ', static-race, 1', function () {
                return PromiseCtor.race([
                    PromiseCtor.resolve(1),
                    PromiseCtor.resolve(2),
                ]).then(function (value) {
                    assert.deepEqual(value, 1);
                });
            });
            test(PromiseCtor.name + ', static-race, 2', function () {
                return PromiseCtor.race([
                    PromiseCtor.reject(-1),
                    PromiseCtor.resolve(2),
                ]).catch(function (value) {
                    assert.deepEqual(value, -1);
                });
            });
            test(PromiseCtor.name + ', static-race, 3', function () {
                return PromiseCtor.race([
                    PromiseCtor.resolve(1),
                    PromiseCtor.reject(2),
                ]).then(function (value) {
                    assert.deepEqual(value, 1);
                });
            });
            test(PromiseCtor.name + ', throw in ctor', function () {
                return new PromiseCtor(function () {
                    throw new Error('sooo bad');
                }).catch(function (err) {
                    assert.equal(err.message, 'sooo bad');
                });
            });
        });
    });
});
