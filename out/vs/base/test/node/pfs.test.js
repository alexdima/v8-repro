define(["require", "exports", "vs/base/common/winjs.base", "assert", "os", "path", "fs", "vs/base/common/uuid", "vs/base/node/extfs", "vs/base/test/common/utils", "vs/base/node/pfs"], function (require, exports, winjs_base_1, assert, os, path, fs, uuid, extfs, utils_1, pfs) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('PFS', function () {
        test('writeFile', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'pfs', id);
            var testFile = path.join(newDir, 'writefile.txt');
            var onMkdirp = function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                pfs.writeFile(testFile, 'Hello World', null).done(function () {
                    assert.equal(fs.readFileSync(testFile), 'Hello World');
                    extfs.del(parentDir, os.tmpdir(), function () { }, done);
                }, function (error) { return utils_1.onError(error, done); });
            };
            pfs.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        });
        test('writeFile - parallel write on different files works', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'pfs', id);
            var testFile1 = path.join(newDir, 'writefile1.txt');
            var testFile2 = path.join(newDir, 'writefile2.txt');
            var testFile3 = path.join(newDir, 'writefile3.txt');
            var testFile4 = path.join(newDir, 'writefile4.txt');
            var testFile5 = path.join(newDir, 'writefile5.txt');
            var onMkdirp = function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                winjs_base_1.TPromise.join([
                    pfs.writeFile(testFile1, 'Hello World 1', null),
                    pfs.writeFile(testFile2, 'Hello World 2', null),
                    pfs.writeFile(testFile3, 'Hello World 3', null),
                    pfs.writeFile(testFile4, 'Hello World 4', null),
                    pfs.writeFile(testFile5, 'Hello World 5', null)
                ]).done(function () {
                    assert.equal(fs.readFileSync(testFile1), 'Hello World 1');
                    assert.equal(fs.readFileSync(testFile2), 'Hello World 2');
                    assert.equal(fs.readFileSync(testFile3), 'Hello World 3');
                    assert.equal(fs.readFileSync(testFile4), 'Hello World 4');
                    assert.equal(fs.readFileSync(testFile5), 'Hello World 5');
                    extfs.del(parentDir, os.tmpdir(), function () { }, done);
                }, function (error) { return utils_1.onError(error, done); });
            };
            pfs.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        });
        test('writeFile - parallel write on same files works and is sequentalized', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'pfs', id);
            var testFile = path.join(newDir, 'writefile.txt');
            var onMkdirp = function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                winjs_base_1.TPromise.join([
                    pfs.writeFile(testFile, 'Hello World 1', null),
                    pfs.writeFile(testFile, 'Hello World 2', null),
                    winjs_base_1.TPromise.timeout(10).then(function () { return pfs.writeFile(testFile, 'Hello World 3', null); }),
                    pfs.writeFile(testFile, 'Hello World 4', null),
                    winjs_base_1.TPromise.timeout(10).then(function () { return pfs.writeFile(testFile, 'Hello World 5', null); })
                ]).done(function () {
                    assert.equal(fs.readFileSync(testFile), 'Hello World 5');
                    extfs.del(parentDir, os.tmpdir(), function () { }, done);
                }, function (error) { return utils_1.onError(error, done); });
            };
            pfs.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        });
        test('rimraf - simple', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var onMkdirp = function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(path.join(newDir, 'somefile.txt'), 'Contents');
                fs.writeFileSync(path.join(newDir, 'someOtherFile.txt'), 'Contents');
                pfs.rimraf(newDir).then(function () {
                    assert.ok(!fs.existsSync(newDir));
                    done();
                }, function (error) { return utils_1.onError(error, done); });
            };
            pfs.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        });
        test('rimraf - recursive folder structure', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var onMkdirp = function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(path.join(newDir, 'somefile.txt'), 'Contents');
                fs.writeFileSync(path.join(newDir, 'someOtherFile.txt'), 'Contents');
                fs.mkdirSync(path.join(newDir, 'somefolder'));
                fs.writeFileSync(path.join(newDir, 'somefolder', 'somefile.txt'), 'Contents');
                pfs.rimraf(newDir).then(function () {
                    assert.ok(!fs.existsSync(newDir));
                    done();
                }, function (error) { return utils_1.onError(error, done); });
            };
            pfs.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        });
    });
});
