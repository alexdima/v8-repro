/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "path", "assert", "vs/base/common/winjs.base", "vs/workbench/services/search/node/fileSearch", "vs/workbench/services/search/node/textSearch", "vs/workbench/services/search/node/ripgrepTextSearch", "vs/workbench/services/search/node/textSearchWorkerProvider"], function (require, exports, path, assert, winjs_base_1, fileSearch_1, textSearch_1, ripgrepTextSearch_1, textSearchWorkerProvider_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function countAll(matches) {
        return matches.reduce(function (acc, m) { return acc + m.numMatches; }, 0);
    }
    var TEST_FIXTURES = path.normalize(require.toUrl('./fixtures'));
    var EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, 'examples');
    var MORE_FIXTURES = path.join(TEST_FIXTURES, 'more');
    var TEST_ROOT_FOLDER = { folder: TEST_FIXTURES };
    var ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    var MULTIROOT_QUERIES = [
        { folder: EXAMPLES_FIXTURES },
        { folder: MORE_FIXTURES }
    ];
    var textSearchWorkerProvider = new textSearchWorkerProvider_1.TextSearchWorkerProvider();
    function doLegacySearchTest(config, expectedResultCount) {
        return new winjs_base_1.TPromise(function (resolve, reject) {
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker(__assign({}, config, { useRipgrep: false })), textSearchWorkerProvider);
            var c = 0;
            engine.search(function (result) {
                if (result) {
                    c += countAll(result);
                }
            }, function () { }, function (error) {
                try {
                    assert.ok(!error);
                    if (typeof expectedResultCount === 'function') {
                        assert(expectedResultCount(c));
                    }
                    else {
                        assert.equal(c, expectedResultCount, 'legacy');
                    }
                }
                catch (e) {
                    reject(e);
                }
                resolve(undefined);
            });
        });
    }
    function doRipgrepSearchTest(config, expectedResultCount) {
        return new winjs_base_1.TPromise(function (resolve, reject) {
            var engine = new ripgrepTextSearch_1.RipgrepEngine(config);
            var c = 0;
            engine.search(function (result) {
                if (result) {
                    c += result.numMatches;
                }
            }, function () { }, function (error) {
                try {
                    assert.ok(!error);
                    if (typeof expectedResultCount === 'function') {
                        assert(expectedResultCount(c));
                    }
                    else {
                        assert.equal(c, expectedResultCount, 'rg');
                    }
                }
                catch (e) {
                    reject(e);
                }
                resolve(undefined);
            });
        });
    }
    function doSearchTest(config, expectedResultCount, done) {
        return doLegacySearchTest(config, expectedResultCount)
            .then(function () { return doRipgrepSearchTest(config, expectedResultCount); })
            .then(done, done);
    }
    suite('Search-integration', function () {
        this.timeout(1000 * 60); // increase timeout for this suite
        test('Text: GameOfLife', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife' },
            };
            doSearchTest(config, 4, done);
        });
        test('Text: GameOfLife (RegExp)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'Game.?fL\\w?fe', isRegExp: true }
            };
            doSearchTest(config, 4, done);
        });
        test('Text: GameOfLife (RegExp to EOL)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife.*', isRegExp: true }
            };
            doSearchTest(config, 4, done);
        });
        test('Text: GameOfLife (Word Match, Case Sensitive)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'GameOfLife', isWordMatch: true, isCaseSensitive: true }
            };
            doSearchTest(config, 4, done);
        });
        test('Text: GameOfLife (Word Match, Spaces)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: ' GameOfLife ', isWordMatch: true }
            };
            doSearchTest(config, 1, done);
        });
        test('Text: GameOfLife (Word Match, Punctuation and Spaces)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: ', as =', isWordMatch: true }
            };
            doSearchTest(config, 1, done);
        });
        test('Text: Helvetica (UTF 16)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'Helvetica' }
            };
            doSearchTest(config, 3, done);
        });
        test('Text: e', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' }
            };
            doSearchTest(config, 776, done);
        });
        test('Text: e (with excludes)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                excludePattern: { '**/examples': true }
            };
            doSearchTest(config, 394, done);
        });
        test('Text: e (with includes)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                includePattern: { '**/examples/**': true }
            };
            doSearchTest(config, 382, done);
        });
        test('Text: e (with absolute path excludes)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression(path.join(TEST_FIXTURES, '**/examples'))
            };
            doSearchTest(config, 394, done);
        });
        test('Text: e (with mixed absolute/relative path excludes)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression(path.join(TEST_FIXTURES, '**/examples'), '*.css')
            };
            doSearchTest(config, 310, done);
        });
        test('Text: sibling exclude', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'm' },
                includePattern: makeExpression('**/site*'),
                excludePattern: { '*.css': { when: '$(basename).less' } }
            };
            doSearchTest(config, 1, done);
        });
        test('Text: e (with includes and exclude)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'e' },
                includePattern: { '**/examples/**': true },
                excludePattern: { '**/examples/small.js': true }
            };
            doSearchTest(config, 361, done);
        });
        test('Text: a (capped)', function (done) {
            var maxResults = 520;
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'a' },
                maxResults: maxResults
            };
            // (Legacy) search can go over the maxResults because it doesn't trim the results from its worker processes to the exact max size.
            // But the worst-case scenario should be 2*max-1
            return doLegacySearchTest(config, function (count) { return count < maxResults * 2; })
                .then(function () { return doRipgrepSearchTest(config, maxResults); })
                .then(done, done);
        });
        test('Text: a (no results)', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: 'ahsogehtdas' }
            };
            doSearchTest(config, 0, done);
        });
        test('Text: -size', function (done) {
            var config = {
                folderQueries: ROOT_FOLDER_QUERY,
                contentPattern: { pattern: '-size' }
            };
            doSearchTest(config, 9, done);
        });
        test('Multiroot: Conway', function (done) {
            var config = {
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'conway' }
            };
            doSearchTest(config, 8, done);
        });
        test('Multiroot: e with partial global exclude', function (done) {
            var config = {
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression('**/*.txt')
            };
            doSearchTest(config, 382, done);
        });
        test('Multiroot: e with global excludes', function (done) {
            var config = {
                folderQueries: MULTIROOT_QUERIES,
                contentPattern: { pattern: 'e' },
                excludePattern: makeExpression('**/*.txt', '**/*.js')
            };
            doSearchTest(config, 0, done);
        });
        test('Multiroot: e with folder exclude', function (done) {
            var config = {
                folderQueries: [
                    { folder: EXAMPLES_FIXTURES, excludePattern: makeExpression('**/e*.js') },
                    { folder: MORE_FIXTURES }
                ],
                contentPattern: { pattern: 'e' }
            };
            doSearchTest(config, 286, done);
        });
    });
    function makeExpression() {
        var patterns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            patterns[_i] = arguments[_i];
        }
        return patterns.reduce(function (glob, pattern) {
            // glob.ts needs forward slashes
            pattern = pattern.replace(/\\/g, '/');
            glob[pattern] = true;
            return glob;
        }, Object.create(null));
    }
});
