var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "assert", "vs/base/common/paths", "vs/base/common/arrays", "vs/base/common/uri", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/parts/search/common/queryBuilder", "vs/platform/environment/common/environment", "vs/workbench/test/workbenchTestServices", "vs/platform/search/common/search"], function (require, exports, assert, paths, arrays, uri_1, instantiationServiceMock_1, configuration_1, workspace_1, testConfigurationService_1, queryBuilder_1, environment_1, workbenchTestServices_1, search_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_USER_CONFIG = { useRipgrep: true, useIgnoreFiles: true };
    var DEFAULT_QUERY_PROPS = { useRipgrep: true, disregardIgnoreFiles: false };
    suite('QueryBuilder', function () {
        var PATTERN_INFO = { pattern: 'a' };
        var ROOT_1 = fixPath('/foo/root1');
        var ROOT_1_URI = getUri(ROOT_1);
        var instantiationService;
        var queryBuilder;
        var mockConfigService;
        var mockContextService;
        var mockWorkspace;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            mockConfigService = new testConfigurationService_1.TestConfigurationService();
            mockConfigService.setUserConfiguration('search', DEFAULT_USER_CONFIG);
            instantiationService.stub(configuration_1.IConfigurationService, mockConfigService);
            mockContextService = new workbenchTestServices_1.TestContextService();
            mockWorkspace = new workspace_1.Workspace('workspace', 'workspace', workspace_1.toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }]));
            mockContextService.setWorkspace(mockWorkspace);
            instantiationService.stub(workspace_1.IWorkspaceContextService, mockContextService);
            instantiationService.stub(environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            queryBuilder = instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        });
        test('simple text pattern', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO), {
                contentPattern: PATTERN_INFO,
                type: search_1.QueryType.Text
            });
        });
        test('folderResources', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI]), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{ folder: ROOT_1_URI }],
                type: search_1.QueryType.Text
            });
        });
        test('simple exclude setting', function () {
            mockConfigService.setUserConfiguration('search', __assign({}, DEFAULT_USER_CONFIG, { exclude: {
                    'bar/**': true,
                    'foo/**': {
                        'when': '$(basename).ts'
                    }
                } }));
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI]), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI,
                        excludePattern: {
                            'bar/**': true,
                            'foo/**': {
                                'when': '$(basename).ts'
                            }
                        }
                    }],
                type: search_1.QueryType.Text
            });
        });
        test('simple include', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { includePattern: './bar' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: getUri(fixPath(paths.join(ROOT_1, 'bar')))
                    }],
                type: search_1.QueryType.Text
            });
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { includePattern: '.\\bar' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: getUri(fixPath(paths.join(ROOT_1, 'bar')))
                    }],
                type: search_1.QueryType.Text
            });
        });
        test('exclude setting and searchPath', function () {
            mockConfigService.setUserConfiguration('search', __assign({}, DEFAULT_USER_CONFIG, { exclude: {
                    'foo/**/*.js': true,
                    'bar/**': {
                        'when': '$(basename).ts'
                    }
                } }));
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { includePattern: './foo' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: getUri(paths.join(ROOT_1, 'foo'))
                    }],
                excludePattern: (_a = {},
                    _a[paths.join(ROOT_1, 'foo/**/*.js')] = true,
                    _a[paths.join(ROOT_1, 'bar/**')] = {
                        'when': '$(basename).ts'
                    },
                    _a),
                type: search_1.QueryType.Text
            });
            var _a;
        });
        test('multiroot exclude settings', function () {
            var ROOT_2 = fixPath('/project/root2');
            var ROOT_2_URI = getUri(ROOT_2);
            var ROOT_3 = fixPath('/project/root3');
            var ROOT_3_URI = getUri(ROOT_3);
            mockWorkspace.folders = workspace_1.toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: ROOT_2_URI.fsPath }, { path: ROOT_3_URI.fsPath }]);
            mockWorkspace.configuration = uri_1.default.file(fixPath('/config'));
            mockConfigService.setUserConfiguration('search', __assign({}, DEFAULT_USER_CONFIG, { exclude: { 'foo/**/*.js': true } }), ROOT_1_URI);
            mockConfigService.setUserConfiguration('search', __assign({}, DEFAULT_USER_CONFIG, { exclude: { 'bar': true } }), ROOT_2_URI);
            // There are 3 roots, the first two have search.exclude settings, test that the correct basic query is returned
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI]), {
                contentPattern: PATTERN_INFO,
                folderQueries: [
                    { folder: ROOT_1_URI, excludePattern: patternsToIExpression('foo/**/*.js') },
                    { folder: ROOT_2_URI, excludePattern: patternsToIExpression('bar') },
                    { folder: ROOT_3_URI }
                ],
                type: search_1.QueryType.Text
            });
            // Now test that it merges the root excludes when an 'include' is used
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI], { includePattern: './root2/src' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [
                    { folder: getUri(paths.join(ROOT_2, 'src')) }
                ],
                excludePattern: patternsToIExpression(paths.join(ROOT_1, 'foo/**/*.js'), paths.join(ROOT_2, 'bar')),
                type: search_1.QueryType.Text
            });
        });
        test('simple exclude input pattern', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { excludePattern: 'foo' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                type: search_1.QueryType.Text,
                excludePattern: patternsToIExpression.apply(void 0, globalGlob('foo'))
            });
        });
        test('exclude ./ syntax', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { excludePattern: './bar' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: patternsToIExpression(fixPath(paths.join(ROOT_1, 'bar'))),
                type: search_1.QueryType.Text
            });
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { excludePattern: './bar/**/*.ts' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: patternsToIExpression(fixPath(paths.join(ROOT_1, 'bar/**/*.ts'))),
                type: search_1.QueryType.Text
            });
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { excludePattern: '.\\bar\\**\\*.ts' }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: patternsToIExpression(fixPath(paths.join(ROOT_1, 'bar/**/*.ts'))),
                type: search_1.QueryType.Text
            });
        });
        test('extraFileResources', function () {
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], { extraFileResources: [getUri('/foo/bar.js')] }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                extraFileResources: [getUri('/foo/bar.js')],
                type: search_1.QueryType.Text
            });
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [getUri('/foo/bar.js')],
                excludePattern: '*.js'
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                excludePattern: patternsToIExpression.apply(void 0, globalGlob('*.js')),
                type: search_1.QueryType.Text
            });
            assertEqualQueries(queryBuilder.text(PATTERN_INFO, [ROOT_1_URI], {
                extraFileResources: [getUri('/foo/bar.js')],
                includePattern: '*.txt'
            }), {
                contentPattern: PATTERN_INFO,
                folderQueries: [{
                        folder: ROOT_1_URI
                    }],
                includePattern: patternsToIExpression.apply(void 0, globalGlob('*.txt')),
                type: search_1.QueryType.Text
            });
        });
        suite('parseSearchPaths', function () {
            test('simple includes', function () {
                function testSimpleIncludes(includePattern, expectedPatterns) {
                    assert.deepEqual(queryBuilder.parseSearchPaths(includePattern), {
                        pattern: patternsToIExpression.apply(void 0, arrays.flatten(expectedPatterns.map(globalGlob)))
                    }, includePattern);
                }
                [
                    ['a', ['a']],
                    ['a/b', ['a/b']],
                    ['a/b,  c', ['a/b', 'c']],
                    ['a,.txt', ['a', '*.txt']],
                    ['a,,,b', ['a', 'b']],
                    ['**/a,b/**', ['**/a', 'b/**']]
                ].forEach(function (_a) {
                    var includePattern = _a[0], expectedPatterns = _a[1];
                    return testSimpleIncludes(includePattern, expectedPatterns);
                });
            });
            function testIncludes(includePattern, expectedResult) {
                assertEqualSearchPathResults(queryBuilder.parseSearchPaths(includePattern), expectedResult, includePattern);
            }
            function testIncludesDataItem(_a) {
                var includePattern = _a[0], expectedResult = _a[1];
                testIncludes(includePattern, expectedResult);
            }
            test('absolute includes', function () {
                var cases = [
                    [
                        fixPath('/foo/bar'),
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }]
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + 'a',
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }],
                            pattern: patternsToIExpression.apply(void 0, globalGlob('a'))
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + fixPath('/1/2'),
                        {
                            searchPaths: [{ searchPath: getUri('/foo/bar') }, { searchPath: getUri('/1/2') }]
                        }
                    ],
                    [
                        fixPath('/foo/bar') + ',' + fixPath('/foo/../foo/bar/fooar/..'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar')
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/bar/**/*.ts'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar'),
                                    pattern: '**/*.ts'
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/bar/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo/bar'),
                                    pattern: '*a/b/c'
                                }]
                        }
                    ],
                    [
                        fixPath('/*a/b/c'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/'),
                                    pattern: '*a/b/c'
                                }]
                        }
                    ],
                    [
                        fixPath('/foo/{b,c}ar'),
                        {
                            searchPaths: [{
                                    searchPath: getUri('/foo'),
                                    pattern: '{b,c}ar'
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/single root folder', function () {
                var cases = [
                    [
                        './a',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1 + '/a')
                                }]
                        }
                    ],
                    [
                        './a/*b/c',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1 + '/a'),
                                    pattern: '*b/c'
                                }]
                        }
                    ],
                    [
                        './a/*b/c, ' + fixPath('/project/foo'),
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_1 + '/a'),
                                    pattern: '*b/c'
                                },
                                {
                                    searchPath: getUri('/project/foo')
                                }
                            ]
                        }
                    ],
                    [
                        './a/b/..,./a',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1 + '/a')
                                }]
                        }
                    ],
                    [
                        '../',
                        {
                            searchPaths: [{
                                    searchPath: getUri('foo/')
                                }]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/two root folders', function () {
                var ROOT_2 = '/project/root2';
                mockWorkspace.folders = workspace_1.toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }]);
                mockWorkspace.configuration = uri_1.default.file(fixPath('config'));
                var cases = [
                    [
                        './root1',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root2',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_2),
                                }]
                        }
                    ],
                    [
                        './root1/a/**/b, ./root2/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_1 + '/a'),
                                    pattern: '**/b'
                                },
                                {
                                    searchPath: getUri(ROOT_2),
                                    pattern: '**/*.txt'
                                }
                            ]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
            test('relative includes w/multiple ambiguous root folders', function () {
                var ROOT_2 = '/project/rootB';
                var ROOT_3 = '/otherproject/rootB';
                mockWorkspace.folders = workspace_1.toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }, { path: getUri(ROOT_3).fsPath }]);
                mockWorkspace.configuration = uri_1.default.file(fixPath('/config'));
                var cases = [
                    [
                        '',
                        {
                            searchPaths: undefined
                        }
                    ],
                    [
                        './',
                        {
                            searchPaths: undefined
                        }
                    ],
                    [
                        './root1',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './root1,./',
                        {
                            searchPaths: [{
                                    searchPath: getUri(ROOT_1)
                                }]
                        }
                    ],
                    [
                        './rootB',
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_2),
                                },
                                {
                                    searchPath: getUri(ROOT_3),
                                }
                            ]
                        }
                    ],
                    [
                        './rootB/a/**/b, ./rootB/b/**/*.txt',
                        {
                            searchPaths: [
                                {
                                    searchPath: getUri(ROOT_2 + '/a'),
                                    pattern: '**/b'
                                },
                                {
                                    searchPath: getUri(ROOT_3 + '/a'),
                                    pattern: '**/b'
                                },
                                {
                                    searchPath: getUri(ROOT_2 + '/b'),
                                    pattern: '**/*.txt'
                                },
                                {
                                    searchPath: getUri(ROOT_3 + '/b'),
                                    pattern: '**/*.txt'
                                }
                            ]
                        }
                    ]
                ];
                cases.forEach(testIncludesDataItem);
            });
        });
        suite('smartCase', function () {
            test('no flags -> no change', function () {
                var query = queryBuilder.text({
                    pattern: 'a'
                }, []);
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('maintains isCaseSensitive when smartCase not set', function () {
                var query = queryBuilder.text({
                    pattern: 'a',
                    isCaseSensitive: true
                }, []);
                assert(query.contentPattern.isCaseSensitive);
            });
            test('maintains isCaseSensitive when smartCase set', function () {
                var query = queryBuilder.text({
                    pattern: 'a',
                    isCaseSensitive: true,
                    isSmartCase: true
                }, []);
                assert(query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines not case sensitive', function () {
                var query = queryBuilder.text({
                    pattern: 'abcd',
                    isSmartCase: true
                }, []);
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines case sensitive', function () {
                var query = queryBuilder.text({
                    pattern: 'abCd',
                    isSmartCase: true
                }, []);
                assert(query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines not case sensitive (regex)', function () {
                var query = queryBuilder.text({
                    pattern: 'ab\\Sd',
                    isRegExp: true,
                    isSmartCase: true
                }, []);
                assert(!query.contentPattern.isCaseSensitive);
            });
            test('smartCase determines case sensitive (regex)', function () {
                var query = queryBuilder.text({
                    pattern: 'ab[A-Z]d',
                    isRegExp: true,
                    isSmartCase: true
                }, []);
                assert(query.contentPattern.isCaseSensitive);
            });
        });
        suite('file', function () {
            test('simple file query', function () {
                var cacheKey = 'asdf';
                var query = queryBuilder.file([ROOT_1_URI], {
                    cacheKey: cacheKey,
                    sortByScore: true
                });
                assert.equal(query.folderQueries.length, 1);
                assert.equal(query.cacheKey, cacheKey);
                assert(query.sortByScore);
            });
        });
    });
    function assertEqualQueries(actual, expected) {
        expected = __assign({}, DEFAULT_QUERY_PROPS, expected);
        var folderQueryToCompareObject = function (fq) {
            return {
                path: fq.folder.fsPath,
                excludePattern: normalizeExpression(fq.excludePattern),
                includePattern: normalizeExpression(fq.includePattern),
                fileEncoding: fq.fileEncoding
            };
        };
        delete actual.ignoreSymlinks;
        // Avoid comparing URI objects, not a good idea
        if (expected.folderQueries) {
            assert.deepEqual(actual.folderQueries.map(folderQueryToCompareObject), expected.folderQueries.map(folderQueryToCompareObject));
            delete actual.folderQueries;
            delete expected.folderQueries;
        }
        if (expected.extraFileResources) {
            assert.deepEqual(actual.extraFileResources.map(function (extraFile) { return extraFile.fsPath; }), expected.extraFileResources.map(function (extraFile) { return extraFile.fsPath; }));
            delete expected.extraFileResources;
            delete actual.extraFileResources;
        }
        delete actual.usingSearchPaths;
        actual.includePattern = normalizeExpression(actual.includePattern);
        actual.excludePattern = normalizeExpression(actual.excludePattern);
        cleanUndefinedQueryValues(actual);
        assert.deepEqual(actual, expected);
    }
    function assertEqualSearchPathResults(actual, expected, message) {
        cleanUndefinedQueryValues(actual);
        assert.deepEqual(actual.pattern, expected.pattern, message);
        assert.equal(actual.searchPaths && actual.searchPaths.length, expected.searchPaths && expected.searchPaths.length);
        if (actual.searchPaths) {
            actual.searchPaths.forEach(function (searchPath, i) {
                var expectedSearchPath = expected.searchPaths[i];
                assert.equal(searchPath.pattern, expectedSearchPath.pattern);
                assert.equal(searchPath.searchPath.toString(), expectedSearchPath.searchPath.toString());
            });
        }
    }
    /**
     * Recursively delete all undefined property values from the search query, to make it easier to
     * assert.deepEqual with some expected object.
     */
    function cleanUndefinedQueryValues(q) {
        for (var key in q) {
            if (q[key] === undefined) {
                delete q[key];
            }
            else if (typeof q[key] === 'object') {
                cleanUndefinedQueryValues(q[key]);
            }
        }
        return q;
    }
    function globalGlob(pattern) {
        return [
            "**/" + pattern + "/**",
            "**/" + pattern
        ];
    }
    function patternsToIExpression() {
        var patterns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            patterns[_i] = arguments[_i];
        }
        return patterns.length ?
            patterns.reduce(function (glob, cur) { glob[cur] = true; return glob; }, Object.create(null)) :
            undefined;
    }
    function getUri(slashPath) {
        return uri_1.default.file(fixPath(slashPath));
    }
    function fixPath(slashPath) {
        return process.platform === 'win32' ?
            (slashPath.match(/^c:/) ? slashPath : paths.join.apply(paths, ['c:'].concat(slashPath.split('/')))) :
            slashPath;
    }
    function normalizeExpression(expression) {
        if (!expression) {
            return expression;
        }
        var normalized = Object.create(null);
        Object.keys(expression).forEach(function (key) {
            normalized[key.replace(/\\/g, '/')] = expression[key];
        });
        return normalized;
    }
});
