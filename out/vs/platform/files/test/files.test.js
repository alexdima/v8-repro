/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/paths", "vs/platform/files/common/files", "vs/base/common/platform"], function (require, exports, assert, uri_1, paths_1, files_1, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files', function () {
        function toResource(path) {
            return uri_1.default.file(paths_1.join('C:\\', path));
        }
        test('FileChangesEvent', function () {
            var changes = [
                { resource: uri_1.default.file(paths_1.join('C:\\', '/foo/updated.txt')), type: files_1.FileChangeType.UPDATED },
                { resource: uri_1.default.file(paths_1.join('C:\\', '/foo/otherupdated.txt')), type: files_1.FileChangeType.UPDATED },
                { resource: uri_1.default.file(paths_1.join('C:\\', '/added.txt')), type: files_1.FileChangeType.ADDED },
                { resource: uri_1.default.file(paths_1.join('C:\\', '/bar/deleted.txt')), type: files_1.FileChangeType.DELETED },
                { resource: uri_1.default.file(paths_1.join('C:\\', '/bar/folder')), type: files_1.FileChangeType.DELETED }
            ];
            var r1 = new files_1.FileChangesEvent(changes);
            assert(!r1.contains(toResource('/foo'), files_1.FileChangeType.UPDATED));
            assert(r1.contains(toResource('/foo/updated.txt'), files_1.FileChangeType.UPDATED));
            assert(!r1.contains(toResource('/foo/updated.txt'), files_1.FileChangeType.ADDED));
            assert(!r1.contains(toResource('/foo/updated.txt'), files_1.FileChangeType.DELETED));
            assert(r1.contains(toResource('/bar/folder'), files_1.FileChangeType.DELETED));
            assert(r1.contains(toResource('/bar/folder/somefile'), files_1.FileChangeType.DELETED));
            assert(r1.contains(toResource('/bar/folder/somefile/test.txt'), files_1.FileChangeType.DELETED));
            assert(!r1.contains(toResource('/bar/folder2/somefile'), files_1.FileChangeType.DELETED));
            assert.strictEqual(5, r1.changes.length);
            assert.strictEqual(1, r1.getAdded().length);
            assert.strictEqual(true, r1.gotAdded());
            assert.strictEqual(2, r1.getUpdated().length);
            assert.strictEqual(true, r1.gotUpdated());
            assert.strictEqual(2, r1.getDeleted().length);
            assert.strictEqual(true, r1.gotDeleted());
        });
        function testIsEqual(testMethod) {
            // corner cases
            assert(testMethod('', '', true));
            assert(!testMethod(null, '', true));
            assert(!testMethod(void 0, '', true));
            // basics (string)
            assert(testMethod('/', '/', true));
            assert(testMethod('/some', '/some', true));
            assert(testMethod('/some/path', '/some/path', true));
            assert(testMethod('c:\\', 'c:\\', true));
            assert(testMethod('c:\\some', 'c:\\some', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\path', true));
            assert(testMethod('/someöäü/path', '/someöäü/path', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someöäü\\path', true));
            assert(!testMethod('/some/path', '/some/other/path', true));
            assert(!testMethod('c:\\some\\path', 'c:\\some\\other\\path', true));
            assert(!testMethod('c:\\some\\path', 'd:\\some\\path', true));
            assert(testMethod('/some/path', '/some/PATH', true));
            assert(testMethod('/someöäü/path', '/someÖÄÜ/PATH', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\PATH', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someÖÄÜ\\PATH', true));
            assert(testMethod('c:\\some\\path', 'C:\\some\\PATH', true));
        }
        test('isEqual (ignoreCase)', function () {
            testIsEqual(paths_1.isEqual);
            // basics (uris)
            assert(paths_1.isEqual(uri_1.default.file('/some/path').fsPath, uri_1.default.file('/some/path').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('c:\\some\\path').fsPath, uri_1.default.file('c:\\some\\path').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('/someöäü/path').fsPath, uri_1.default.file('/someöäü/path').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('c:\\someöäü\\path').fsPath, uri_1.default.file('c:\\someöäü\\path').fsPath, true));
            assert(!paths_1.isEqual(uri_1.default.file('/some/path').fsPath, uri_1.default.file('/some/other/path').fsPath, true));
            assert(!paths_1.isEqual(uri_1.default.file('c:\\some\\path').fsPath, uri_1.default.file('c:\\some\\other\\path').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('/some/path').fsPath, uri_1.default.file('/some/PATH').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('/someöäü/path').fsPath, uri_1.default.file('/someÖÄÜ/PATH').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('c:\\some\\path').fsPath, uri_1.default.file('c:\\some\\PATH').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('c:\\someöäü\\path').fsPath, uri_1.default.file('c:\\someÖÄÜ\\PATH').fsPath, true));
            assert(paths_1.isEqual(uri_1.default.file('c:\\some\\path').fsPath, uri_1.default.file('C:\\some\\PATH').fsPath, true));
        });
        test('isParent (ignorecase)', function () {
            if (platform_1.isWindows) {
                assert(files_1.isParent('c:\\some\\path', 'c:\\', true));
                assert(files_1.isParent('c:\\some\\path', 'c:\\some', true));
                assert(files_1.isParent('c:\\some\\path', 'c:\\some\\', true));
                assert(files_1.isParent('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert(files_1.isParent('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert(files_1.isParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert(files_1.isParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert(files_1.isParent('c:\\some\\path', 'C:\\', true));
                assert(files_1.isParent('c:\\some\\path', 'c:\\SOME', true));
                assert(files_1.isParent('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!files_1.isParent('c:\\some\\path', 'd:\\', true));
                assert(!files_1.isParent('c:\\some\\path', 'c:\\some\\path', true));
                assert(!files_1.isParent('c:\\some\\path', 'd:\\some\\path', true));
                assert(!files_1.isParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!files_1.isParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert(files_1.isParent('/some/path', '/', true));
                assert(files_1.isParent('/some/path', '/some', true));
                assert(files_1.isParent('/some/path', '/some/', true));
                assert(files_1.isParent('/someöäü/path', '/someöäü', true));
                assert(files_1.isParent('/someöäü/path', '/someöäü/', true));
                assert(files_1.isParent('/foo/bar/test.ts', '/foo/bar', true));
                assert(files_1.isParent('/foo/bar/test.ts', '/foo/bar/', true));
                assert(files_1.isParent('/some/path', '/SOME', true));
                assert(files_1.isParent('/some/path', '/SOME/', true));
                assert(files_1.isParent('/someöäü/path', '/SOMEÖÄÜ', true));
                assert(files_1.isParent('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!files_1.isParent('/some/path', '/some/path', true));
                assert(!files_1.isParent('/foo/bar/test.ts', '/foo/barr', true));
                assert(!files_1.isParent('/foo/bar/test.ts', '/foo/bar/test', true));
            }
        });
        test('isEqualOrParent (ignorecase)', function () {
            // same assertions apply as with isEqual()
            testIsEqual(paths_1.isEqualOrParent);
            if (platform_1.isWindows) {
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\some', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\some\\', true));
                assert(paths_1.isEqualOrParent('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert(paths_1.isEqualOrParent('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert(paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert(paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\some\\path', true));
                assert(paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.ts', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'C:\\', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\SOME', true));
                assert(paths_1.isEqualOrParent('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!paths_1.isEqualOrParent('c:\\some\\path', 'd:\\', true));
                assert(!paths_1.isEqualOrParent('c:\\some\\path', 'd:\\some\\path', true));
                assert(!paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
                assert(!paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.', true));
                assert(!paths_1.isEqualOrParent('c:\\foo\\bar\\test.ts', 'c:\\foo\\BAR\\test.', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert(paths_1.isEqualOrParent('/some/path', '/', true));
                assert(paths_1.isEqualOrParent('/some/path', '/some', true));
                assert(paths_1.isEqualOrParent('/some/path', '/some/', true));
                assert(paths_1.isEqualOrParent('/someöäü/path', '/someöäü', true));
                assert(paths_1.isEqualOrParent('/someöäü/path', '/someöäü/', true));
                assert(paths_1.isEqualOrParent('/foo/bar/test.ts', '/foo/bar', true));
                assert(paths_1.isEqualOrParent('/foo/bar/test.ts', '/foo/bar/', true));
                assert(paths_1.isEqualOrParent('/some/path', '/some/path', true));
                assert(paths_1.isEqualOrParent('/some/path', '/SOME', true));
                assert(paths_1.isEqualOrParent('/some/path', '/SOME/', true));
                assert(paths_1.isEqualOrParent('/someöäü/path', '/SOMEÖÄÜ', true));
                assert(paths_1.isEqualOrParent('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!paths_1.isEqualOrParent('/foo/bar/test.ts', '/foo/barr', true));
                assert(!paths_1.isEqualOrParent('/foo/bar/test.ts', '/foo/bar/test', true));
                assert(!paths_1.isEqualOrParent('foo/bar/test.ts', 'foo/bar/test.', true));
                assert(!paths_1.isEqualOrParent('foo/bar/test.ts', 'foo/BAR/test.', true));
            }
        });
        test('indexOf (ignorecase)', function () {
            assert.equal(files_1.indexOf('/some/path', '/some/path', true), 0);
            assert.equal(files_1.indexOf('/some/path/more', '/some/path', true), 0);
            assert.equal(files_1.indexOf('c:\\some\\path', 'c:\\some\\path', true), 0);
            assert.equal(files_1.indexOf('c:\\some\\path\\more', 'c:\\some\\path', true), 0);
            assert.equal(files_1.indexOf('/some/path', '/some/other/path', true), -1);
            assert.equal(files_1.indexOf('/some/path', '/some/PATH', true), 0);
        });
    });
});
