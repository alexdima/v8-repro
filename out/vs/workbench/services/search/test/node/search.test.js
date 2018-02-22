/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "assert", "vs/base/common/paths", "vs/base/common/platform", "vs/workbench/services/search/node/fileSearch"], function (require, exports, path, assert, paths_1, platform, fileSearch_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEST_FIXTURES = path.normalize(require.toUrl('./fixtures'));
    var EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, 'examples');
    var MORE_FIXTURES = path.join(TEST_FIXTURES, 'more');
    var TEST_ROOT_FOLDER = { folder: TEST_FIXTURES };
    var ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    var ROOT_FOLDER_QUERY_36438 = [
        { folder: path.normalize(require.toUrl('./fixtures2/36438')) }
    ];
    var MULTIROOT_QUERIES = [
        { folder: EXAMPLES_FIXTURES },
        { folder: MORE_FIXTURES }
    ];
    var testTimeout = 5000;
    suite('FileSearchEngine', function () {
        test('Files: *.js', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.js'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 4);
                done();
            });
        });
        test('Files: maxResults', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                maxResults: 1
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: maxResults without Ripgrep', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                maxResults: 1,
                useRipgrep: false
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: exists', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/file.txt': true },
                exists: true
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: not exists', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/nofile.txt': true },
                exists: true
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 0);
                assert.ok(!complete.limitHit);
                done();
            });
        });
        test('Files: exists without Ripgrep', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/file.txt': true },
                exists: true,
                useRipgrep: false
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: not exists without Ripgrep', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/nofile.txt': true },
                exists: true,
                useRipgrep: false
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 0);
                assert.ok(!complete.limitHit);
                done();
            });
        });
        test('Files: examples/com*', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: paths_1.normalize(paths_1.join('examples', 'com*'), true)
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: examples (fuzzy)', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'xl'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 7);
                done();
            });
        });
        test('Files: multiroot', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: MULTIROOT_QUERIES,
                filePattern: 'file'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 3);
                done();
            });
        });
        test('Files: multiroot with includePattern and maxResults', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: MULTIROOT_QUERIES,
                maxResults: 1,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
                useRipgrep: true
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: multiroot with includePattern and exists', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: MULTIROOT_QUERIES,
                exists: true,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
                useRipgrep: true
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error, complete) {
                assert.ok(!error);
                assert.equal(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: NPE (CamelCase)', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'NullPE'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: *.*', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 14);
                done();
            });
        });
        test('Files: *.as', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.as'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 0);
                done();
            });
        });
        test('Files: *.* without derived', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'site.*',
                excludePattern: { '**/*.css': { 'when': '$(basename).less' } }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.strictEqual(path.basename(res.relativePath), 'site.less');
                done();
            });
        });
        test('Files: *.* exclude folder without wildcard', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { 'examples': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 8);
                done();
            });
        });
        test('Files: exclude folder without wildcard #36438', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY_36438,
                excludePattern: { 'modules': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: include folder without wildcard #36438', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY_36438,
                includePattern: { 'modules/**': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
        test('Files: *.* exclude folder with leading wildcard', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { '**/examples': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 8);
                done();
            });
        });
        test('Files: *.* exclude folder with trailing wildcard', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { 'examples/**': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 8);
                done();
            });
        });
        test('Files: *.* exclude with unicode', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { '**/üm laut汉语': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 13);
                done();
            });
        });
        test('Files: multiroot with exclude', function (done) {
            this.timeout(testTimeout);
            var folderQueries = [
                {
                    folder: EXAMPLES_FIXTURES,
                    excludePattern: {
                        '**/anotherfile.txt': true
                    }
                },
                {
                    folder: MORE_FIXTURES,
                    excludePattern: {
                        '**/file.txt': true
                    }
                }
            ];
            var engine = new fileSearch_1.Engine({
                folderQueries: folderQueries,
                filePattern: '*'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 5);
                done();
            });
        });
        test('Files: Unicode and Spaces', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '汉语'
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), '汉语.txt');
                done();
            });
        });
        test('Files: no results', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'nofilematch'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 0);
                done();
            });
        });
        test('Files: absolute path to file ignores excludes', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                excludePattern: { '**/*.css': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), 'site.css');
                done();
            });
        });
        test('Files: relative path matched once', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.normalize(path.join('examples', 'company.js'))
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: relative path to file ignores excludes', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.normalize(path.join('examples', 'company.js')),
                excludePattern: { '**/*.js': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: Include pattern, single files', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: {
                    'site.css': true,
                    'examples/company.js': true,
                    'examples/subfolder/subfile.txt': true
                }
            });
            var res = [];
            engine.search(function (result) {
                res.push(result);
            }, function () { }, function (error) {
                assert.ok(!error);
                var basenames = res.map(function (r) { return path.basename(r.relativePath); });
                assert.ok(basenames.indexOf('site.css') !== -1, "site.css missing in " + JSON.stringify(basenames));
                assert.ok(basenames.indexOf('company.js') !== -1, "company.js missing in " + JSON.stringify(basenames));
                assert.ok(basenames.indexOf('subfile.txt') !== -1, "subfile.txt missing in " + JSON.stringify(basenames));
                done();
            });
        });
        test('Files: extraFiles only', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.js'
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: extraFiles only (with include)', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.*',
                includePattern: { '**/*.css': true }
            });
            var count = 0;
            var res;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
                res = result;
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                assert.equal(path.basename(res.relativePath), 'site.css');
                done();
            });
        });
        test('Files: extraFiles only (with exclude)', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: [],
                extraFiles: [
                    path.normalize(path.join(require.toUrl('./fixtures'), 'site.css')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'examples', 'company.js')),
                    path.normalize(path.join(require.toUrl('./fixtures'), 'index.html'))
                ],
                filePattern: '*.*',
                excludePattern: { '**/*.css': true }
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 2);
                done();
            });
        });
        test('Files: no dupes in nested folders', function (done) {
            this.timeout(testTimeout);
            var engine = new fileSearch_1.Engine({
                folderQueries: [
                    { folder: EXAMPLES_FIXTURES },
                    { folder: path.join(EXAMPLES_FIXTURES, 'subfolder') }
                ],
                filePattern: 'subfile.txt'
            });
            var count = 0;
            engine.search(function (result) {
                if (result) {
                    count++;
                }
            }, function () { }, function (error) {
                assert.ok(!error);
                assert.equal(count, 1);
                done();
            });
        });
    });
    suite('FileWalker', function () {
        test('Find: exclude subfolder', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var file0 = './more/file.txt';
            var file1 = './examples/subfolder/subfile.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/something': true } });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder': true } });
                var cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', /*isRipgrep=*/ false, function (err2, stdout2) {
                    assert.equal(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        test('Find: folder excludes', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var folderQueries = [
                {
                    folder: TEST_FIXTURES,
                    excludePattern: { '**/subfolder': true }
                }
            ];
            var file0 = './more/file.txt';
            var file1 = './examples/subfolder/subfile.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: folderQueries });
            var cmd1 = walker.spawnFindCmd(folderQueries[0]);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert(outputContains(stdout1, file0), stdout1);
                assert(!outputContains(stdout1, file1), stdout1);
                done();
            });
        });
        test('Find: exclude multiple folders', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var file0 = './index.html';
            var file1 = './examples/small.js';
            var file2 = './more/file.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/something': true } });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file2), -1, stdout1);
                var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '{**/examples,**/more}': true } });
                var cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', /*isRipgrep=*/ false, function (err2, stdout2) {
                    assert.equal(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    assert.strictEqual(stdout2.split('\n').indexOf(file2), -1, stdout2);
                    done();
                });
            });
        });
        test('Find: exclude folder path suffix', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var file0 = './examples/company.js';
            var file1 = './examples/subfolder/subfile.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/something': true } });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/subfolder': true } });
                var cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', /*isRipgrep=*/ false, function (err2, stdout2) {
                    assert.equal(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        test('Find: exclude subfolder path suffix', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var file0 = './examples/subfolder/subfile.txt';
            var file1 = './examples/subfolder/anotherfolder/anotherfile.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/something': true } });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/anotherfolder': true } });
                var cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', /*isRipgrep=*/ false, function (err2, stdout2) {
                    assert.equal(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        test('Find: exclude folder path', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var file0 = './examples/company.js';
            var file1 = './examples/subfolder/subfile.txt';
            var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/something': true } });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                var walker = new fileSearch_1.FileWalker({ folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/subfolder': true } });
                var cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', /*isRipgrep=*/ false, function (err2, stdout2) {
                    assert.equal(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        test('Find: exclude combination of paths', function (done) {
            this.timeout(testTimeout);
            if (platform.isWindows) {
                done();
                return;
            }
            var filesIn = [
                './examples/subfolder/subfile.txt',
                './examples/company.js',
                './index.html'
            ];
            var filesOut = [
                './examples/subfolder/anotherfolder/anotherfile.txt',
                './more/file.txt'
            ];
            var walker = new fileSearch_1.FileWalker({
                folderQueries: ROOT_FOLDER_QUERY,
                excludePattern: {
                    '**/subfolder/anotherfolder': true,
                    '**/something/else': true,
                    '**/more': true,
                    '**/andmore': true
                }
            });
            var cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', /*isRipgrep=*/ false, function (err1, stdout1) {
                assert.equal(err1, null);
                for (var _i = 0, filesIn_1 = filesIn; _i < filesIn_1.length; _i++) {
                    var fileIn = filesIn_1[_i];
                    assert.notStrictEqual(stdout1.split('\n').indexOf(fileIn), -1, stdout1);
                }
                for (var _a = 0, filesOut_1 = filesOut; _a < filesOut_1.length; _a++) {
                    var fileOut = filesOut_1[_a];
                    assert.strictEqual(stdout1.split('\n').indexOf(fileOut), -1, stdout1);
                }
                done();
            });
        });
        function outputContains(stdout) {
            var files = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                files[_i - 1] = arguments[_i];
            }
            var lines = stdout.split('\n');
            return files.every(function (file) { return lines.indexOf(file) >= 0; });
        }
    });
});
