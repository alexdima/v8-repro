/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "path", "path", "vs/workbench/services/search/node/rawSearchService", "vs/workbench/services/search/node/searchService"], function (require, exports, assert, path_1, path, rawSearchService_1, searchService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEST_FOLDER_QUERIES = [
        { folder: path_1.normalize('/some/where') }
    ];
    var TEST_FIXTURES = path.normalize(require.toUrl('./fixtures'));
    var MULTIROOT_QUERIES = [
        { folder: path.join(TEST_FIXTURES, 'examples') },
        { folder: path.join(TEST_FIXTURES, 'more') }
    ];
    var stats = {
        fromCache: false,
        resultCount: 4,
        traversal: 'node',
        errors: [],
        fileWalkStartTime: 0,
        fileWalkResultTime: 1,
        directoriesWalked: 2,
        filesWalked: 3
    };
    var TestSearchEngine = /** @class */ (function () {
        function TestSearchEngine(result, config) {
            this.result = result;
            this.config = config;
            this.isCanceled = false;
            TestSearchEngine.last = this;
        }
        TestSearchEngine.prototype.search = function (onResult, onProgress, done) {
            var self = this;
            (function next() {
                process.nextTick(function () {
                    if (self.isCanceled) {
                        done(null, {
                            limitHit: false,
                            stats: stats
                        });
                        return;
                    }
                    var result = self.result();
                    if (!result) {
                        done(null, {
                            limitHit: false,
                            stats: stats
                        });
                    }
                    else {
                        onResult(result);
                        next();
                    }
                });
            })();
        };
        TestSearchEngine.prototype.cancel = function () {
            this.isCanceled = true;
        };
        return TestSearchEngine;
    }());
    var testTimeout = 5000;
    suite('SearchService', function () {
        var rawSearch = {
            folderQueries: TEST_FOLDER_QUERIES,
            filePattern: 'a'
        };
        var rawMatch = {
            base: path_1.normalize('/some'),
            relativePath: 'where',
            basename: 'where',
            size: 123
        };
        var match = {
            path: path_1.normalize('/some/where')
        };
        test('Individual results', function () {
            this.timeout(testTimeout);
            var i = 5;
            var Engine = TestSearchEngine.bind(null, function () { return i-- && rawMatch; });
            var service = new rawSearchService_1.SearchService();
            var results = 0;
            return service.doFileSearch(Engine, rawSearch)
                .then(function () {
                assert.strictEqual(results, 5);
            }, null, function (value) {
                if (!Array.isArray(value)) {
                    assert.deepStrictEqual(value, match);
                    results++;
                }
                else {
                    assert.fail(value);
                }
            });
        });
        test('Batch results', function () {
            this.timeout(testTimeout);
            var i = 25;
            var Engine = TestSearchEngine.bind(null, function () { return i-- && rawMatch; });
            var service = new rawSearchService_1.SearchService();
            var results = [];
            return service.doFileSearch(Engine, rawSearch, 10)
                .then(function () {
                assert.deepStrictEqual(results, [10, 10, 5]);
            }, null, function (value) {
                if (Array.isArray(value)) {
                    value.forEach(function (m) {
                        assert.deepStrictEqual(m, match);
                    });
                    results.push(value.length);
                }
                else {
                    assert.fail(value);
                }
            });
        });
        test('Collect batched results', function () {
            this.timeout(testTimeout);
            var uriPath = '/some/where';
            var i = 25;
            var Engine = TestSearchEngine.bind(null, function () { return i-- && rawMatch; });
            var service = new rawSearchService_1.SearchService();
            var progressResults = [];
            return searchService_1.DiskSearch.collectResults(service.doFileSearch(Engine, rawSearch, 10))
                .then(function (result) {
                assert.strictEqual(result.results.length, 25, 'Result');
                assert.strictEqual(progressResults.length, 25, 'Progress');
            }, null, function (match) {
                assert.strictEqual(match.resource.path, uriPath);
                progressResults.push(match);
            });
        });
        test('Multi-root with include pattern and maxResults', function () {
            this.timeout(testTimeout);
            var service = new rawSearchService_1.SearchService();
            var query = {
                folderQueries: MULTIROOT_QUERIES,
                maxResults: 1,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            };
            return searchService_1.DiskSearch.collectResults(service.fileSearch(query))
                .then(function (result) {
                assert.strictEqual(result.results.length, 1, 'Result');
            });
        });
        test('Multi-root with include pattern and exists', function () {
            this.timeout(testTimeout);
            var service = new rawSearchService_1.SearchService();
            var query = {
                folderQueries: MULTIROOT_QUERIES,
                exists: true,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            };
            return searchService_1.DiskSearch.collectResults(service.fileSearch(query))
                .then(function (result) {
                assert.strictEqual(result.results.length, 0, 'Result');
                assert.ok(result.limitHit);
            });
        });
        test('Sorted results', function () {
            this.timeout(testTimeout);
            var paths = ['bab', 'bbc', 'abb'];
            var matches = paths.map(function (relativePath) { return ({
                base: path_1.normalize('/some/where'),
                relativePath: relativePath,
                basename: relativePath,
                size: 3
            }); });
            var Engine = TestSearchEngine.bind(null, function () { return matches.shift(); });
            var service = new rawSearchService_1.SearchService();
            var results = [];
            return service.doFileSearch(Engine, {
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'bb',
                sortByScore: true,
                maxResults: 2
            }, 1).then(function () {
                assert.notStrictEqual(typeof TestSearchEngine.last.config.maxResults, 'number');
                assert.deepStrictEqual(results, [path_1.normalize('/some/where/bbc'), path_1.normalize('/some/where/bab')]);
            }, null, function (value) {
                if (Array.isArray(value)) {
                    results.push.apply(results, value.map(function (v) { return v.path; }));
                }
                else {
                    assert.fail(value);
                }
            });
        });
        test('Sorted result batches', function () {
            this.timeout(testTimeout);
            var i = 25;
            var Engine = TestSearchEngine.bind(null, function () { return i-- && rawMatch; });
            var service = new rawSearchService_1.SearchService();
            var results = [];
            return service.doFileSearch(Engine, {
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'a',
                sortByScore: true,
                maxResults: 23
            }, 10)
                .then(function () {
                assert.deepStrictEqual(results, [10, 10, 3]);
            }, null, function (value) {
                if (Array.isArray(value)) {
                    value.forEach(function (m) {
                        assert.deepStrictEqual(m, match);
                    });
                    results.push(value.length);
                }
                else {
                    assert.fail(value);
                }
            });
        });
        test('Cached results', function () {
            this.timeout(testTimeout);
            var paths = ['bcb', 'bbc', 'aab'];
            var matches = paths.map(function (relativePath) { return ({
                base: path_1.normalize('/some/where'),
                relativePath: relativePath,
                basename: relativePath,
                size: 3
            }); });
            var Engine = TestSearchEngine.bind(null, function () { return matches.shift(); });
            var service = new rawSearchService_1.SearchService();
            var results = [];
            return service.doFileSearch(Engine, {
                folderQueries: TEST_FOLDER_QUERIES,
                filePattern: 'b',
                sortByScore: true,
                cacheKey: 'x'
            }, -1).then(function (complete) {
                assert.strictEqual(complete.stats.fromCache, false);
                assert.deepStrictEqual(results, [path_1.normalize('/some/where/bcb'), path_1.normalize('/some/where/bbc'), path_1.normalize('/some/where/aab')]);
            }, null, function (value) {
                if (Array.isArray(value)) {
                    results.push.apply(results, value.map(function (v) { return v.path; }));
                }
                else {
                    assert.fail(value);
                }
            }).then(function () {
                var results = [];
                return service.doFileSearch(Engine, {
                    folderQueries: TEST_FOLDER_QUERIES,
                    filePattern: 'bc',
                    sortByScore: true,
                    cacheKey: 'x'
                }, -1).then(function (complete) {
                    assert.ok(complete.stats.fromCache);
                    assert.deepStrictEqual(results, [path_1.normalize('/some/where/bcb'), path_1.normalize('/some/where/bbc')]);
                }, null, function (value) {
                    if (Array.isArray(value)) {
                        results.push.apply(results, value.map(function (v) { return v.path; }));
                    }
                    else {
                        assert.fail(value);
                    }
                });
            }).then(function () {
                return service.clearCache('x');
            }).then(function () {
                matches.push({
                    base: path_1.normalize('/some/where'),
                    relativePath: 'bc',
                    basename: 'bc',
                    size: 3
                });
                var results = [];
                return service.doFileSearch(Engine, {
                    folderQueries: TEST_FOLDER_QUERIES,
                    filePattern: 'bc',
                    sortByScore: true,
                    cacheKey: 'x'
                }, -1).then(function (complete) {
                    assert.strictEqual(complete.stats.fromCache, false);
                    assert.deepStrictEqual(results, [path_1.normalize('/some/where/bc')]);
                }, null, function (value) {
                    if (Array.isArray(value)) {
                        results.push.apply(results, value.map(function (v) { return v.path; }));
                    }
                    else {
                        assert.fail(value);
                    }
                });
            });
        });
    });
});
