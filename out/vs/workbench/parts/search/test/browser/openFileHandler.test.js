define(["require", "exports", "assert", "vs/base/common/errors", "vs/base/common/objects", "vs/workbench/parts/search/browser/openFileHandler", "vs/base/test/common/utils", "vs/platform/search/common/search"], function (require, exports, assert, errors, objects, openFileHandler_1, utils_1, search_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CacheState', function () {
        test('reuse old cacheKey until new cache is loaded', function () {
            var cache = new MockCache();
            var first = createCacheState(cache);
            var firstKey = first.cacheKey;
            assert.strictEqual(first.isLoaded, false);
            assert.strictEqual(first.isUpdating, false);
            first.load();
            assert.strictEqual(first.isLoaded, false);
            assert.strictEqual(first.isUpdating, true);
            cache.loading[firstKey].complete(null);
            assert.strictEqual(first.isLoaded, true);
            assert.strictEqual(first.isUpdating, false);
            var second = createCacheState(cache, first);
            second.load();
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, true);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
            assert.strictEqual(second.cacheKey, firstKey); // still using old cacheKey
            var secondKey = cache.cacheKeys[1];
            cache.loading[secondKey].complete(null);
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 1);
            assert.strictEqual(second.cacheKey, secondKey);
        });
        test('do not spawn additional load if previous is still loading', function () {
            var cache = new MockCache();
            var first = createCacheState(cache);
            var firstKey = first.cacheKey;
            first.load();
            assert.strictEqual(first.isLoaded, false);
            assert.strictEqual(first.isUpdating, true);
            assert.strictEqual(Object.keys(cache.loading).length, 1);
            var second = createCacheState(cache, first);
            second.load();
            assert.strictEqual(second.isLoaded, false);
            assert.strictEqual(second.isUpdating, true);
            assert.strictEqual(cache.cacheKeys.length, 2);
            assert.strictEqual(Object.keys(cache.loading).length, 1); // still only one loading
            assert.strictEqual(second.cacheKey, firstKey);
            cache.loading[firstKey].complete(null);
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
        });
        test('do not use previous cacheKey if query changed', function () {
            var cache = new MockCache();
            var first = createCacheState(cache);
            var firstKey = first.cacheKey;
            first.load();
            cache.loading[firstKey].complete(null);
            assert.strictEqual(first.isLoaded, true);
            assert.strictEqual(first.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
            cache.baseQuery.excludePattern = { '**/node_modules': true };
            var second = createCacheState(cache, first);
            assert.strictEqual(second.isLoaded, false);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 1);
            second.load();
            assert.strictEqual(second.isLoaded, false);
            assert.strictEqual(second.isUpdating, true);
            assert.notStrictEqual(second.cacheKey, firstKey); // not using old cacheKey
            var secondKey = cache.cacheKeys[1];
            assert.strictEqual(second.cacheKey, secondKey);
            cache.loading[secondKey].complete(null);
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 1);
        });
        test('dispose propagates', function () {
            var cache = new MockCache();
            var first = createCacheState(cache);
            var firstKey = first.cacheKey;
            first.load();
            cache.loading[firstKey].complete(null);
            var second = createCacheState(cache, first);
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
            second.dispose();
            assert.strictEqual(second.isLoaded, false);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.disposing).length, 1);
            assert.ok(cache.disposing[firstKey]);
        });
        test('keep using old cacheKey when loading fails', function () {
            var cache = new MockCache();
            var first = createCacheState(cache);
            var firstKey = first.cacheKey;
            first.load();
            cache.loading[firstKey].complete(null);
            var second = createCacheState(cache, first);
            second.load();
            var secondKey = cache.cacheKeys[1];
            var origErrorHandler = errors.errorHandler.getUnexpectedErrorHandler();
            try {
                errors.setUnexpectedErrorHandler(function () { return null; });
                cache.loading[secondKey].error('loading failed');
            }
            finally {
                errors.setUnexpectedErrorHandler(origErrorHandler);
            }
            assert.strictEqual(second.isLoaded, true);
            assert.strictEqual(second.isUpdating, false);
            assert.strictEqual(Object.keys(cache.loading).length, 2);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
            assert.strictEqual(second.cacheKey, firstKey); // keep using old cacheKey
            var third = createCacheState(cache, second);
            third.load();
            assert.strictEqual(third.isLoaded, true);
            assert.strictEqual(third.isUpdating, true);
            assert.strictEqual(Object.keys(cache.loading).length, 3);
            assert.strictEqual(Object.keys(cache.disposing).length, 0);
            assert.strictEqual(third.cacheKey, firstKey);
            var thirdKey = cache.cacheKeys[2];
            cache.loading[thirdKey].complete(null);
            assert.strictEqual(third.isLoaded, true);
            assert.strictEqual(third.isUpdating, false);
            assert.strictEqual(Object.keys(cache.loading).length, 3);
            assert.strictEqual(Object.keys(cache.disposing).length, 2);
            assert.strictEqual(third.cacheKey, thirdKey); // recover with next successful load
        });
        function createCacheState(cache, previous) {
            return new openFileHandler_1.CacheState(function (cacheKey) { return cache.query(cacheKey); }, function (query) { return cache.load(query); }, function (cacheKey) { return cache.dispose(cacheKey); }, previous);
        }
        var MockCache = /** @class */ (function () {
            function MockCache() {
                this.cacheKeys = [];
                this.loading = {};
                this.disposing = {};
                this.baseQuery = {
                    type: search_1.QueryType.File
                };
            }
            MockCache.prototype.query = function (cacheKey) {
                this.cacheKeys.push(cacheKey);
                return objects.assign({ cacheKey: cacheKey }, this.baseQuery);
            };
            MockCache.prototype.load = function (query) {
                var promise = new utils_1.DeferredTPromise();
                this.loading[query.cacheKey] = promise;
                return promise;
            };
            MockCache.prototype.dispose = function (cacheKey) {
                var promise = new utils_1.DeferredTPromise();
                this.disposing[cacheKey] = promise;
                return promise;
            };
            return MockCache;
        }());
    });
});
