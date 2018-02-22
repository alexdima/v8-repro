/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "path", "fs", "vs/base/node/extfs", "vs/base/common/uuid", "vs/base/node/config", "vs/base/test/common/utils", "vs/base/node/pfs"], function (require, exports, assert, os, path, fs, extfs, uuid, config_1, utils_1, pfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Config', function () {
        function testFile(callback) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'config', id);
            var testFile = path.join(newDir, 'config.json');
            var onMkdirp = function (error) { return callback(error, testFile, function (callback) { return extfs.del(parentDir, os.tmpdir(), function () { }, callback); }); };
            pfs_1.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        }
        test('defaults', function () {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'config', id);
            var testFile = path.join(newDir, 'config.json');
            var watcher = new config_1.ConfigWatcher(testFile);
            var config = watcher.getConfig();
            assert.ok(config);
            assert.equal(Object.keys(config), 0);
            watcher.dispose();
            var watcher2 = new config_1.ConfigWatcher(testFile, { defaultConfig: ['foo'], onError: console.error });
            var config2 = watcher2.getConfig();
            assert.ok(Array.isArray(config2));
            assert.equal(config2.length, 1);
            watcher.dispose();
        });
        test('getConfig / getValue', function (done) {
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "bar" }');
                var watcher = new config_1.ConfigWatcher(testFile);
                var config = watcher.getConfig();
                assert.ok(config);
                assert.equal(config.foo, 'bar');
                assert.equal(watcher.getValue('foo'), 'bar');
                assert.equal(watcher.getValue('bar'), void 0);
                assert.equal(watcher.getValue('bar', 'fallback'), 'fallback');
                assert.ok(!watcher.hasParseErrors);
                watcher.dispose();
                cleanUp(done);
            });
        });
        test('getConfig / getValue - broken JSON', function (done) {
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(testFile, '// my comment\n "foo": "bar ... ');
                var watcher = new config_1.ConfigWatcher(testFile);
                var config = watcher.getConfig();
                assert.ok(config);
                assert.ok(!config.foo);
                assert.ok(watcher.hasParseErrors);
                watcher.dispose();
                cleanUp(done);
            });
        });
        test('watching', function (done) {
            this.timeout(10000); // watching is timing intense
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "bar" }');
                var watcher = new config_1.ConfigWatcher(testFile);
                watcher.getConfig(); // ensure we are in sync
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "changed" }');
                watcher.onDidUpdateConfiguration(function (event) {
                    assert.ok(event);
                    assert.equal(event.config.foo, 'changed');
                    assert.equal(watcher.getValue('foo'), 'changed');
                    watcher.dispose();
                    cleanUp(done);
                });
            });
        });
        test('watching also works when file created later', function (done) {
            this.timeout(10000); // watching is timing intense
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                var watcher = new config_1.ConfigWatcher(testFile);
                watcher.getConfig(); // ensure we are in sync
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "changed" }');
                watcher.onDidUpdateConfiguration(function (event) {
                    assert.ok(event);
                    assert.equal(event.config.foo, 'changed');
                    assert.equal(watcher.getValue('foo'), 'changed');
                    watcher.dispose();
                    cleanUp(done);
                });
            });
        });
        test('watching detects the config file getting deleted', function (done) {
            this.timeout(10000); // watching is timing intense
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "bar" }');
                var watcher = new config_1.ConfigWatcher(testFile);
                watcher.getConfig(); // ensure we are in sync
                watcher.onDidUpdateConfiguration(function (event) {
                    assert.ok(event);
                    watcher.dispose();
                    cleanUp(done);
                });
                fs.unlinkSync(testFile);
            });
        });
        test('reload', function (done) {
            testFile(function (error, testFile, cleanUp) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "bar" }');
                var watcher = new config_1.ConfigWatcher(testFile, { changeBufferDelay: 100, onError: console.error });
                watcher.getConfig(); // ensure we are in sync
                fs.writeFileSync(testFile, '// my comment\n{ "foo": "changed" }');
                // still old values because change is not bubbling yet
                assert.equal(watcher.getConfig().foo, 'bar');
                assert.equal(watcher.getValue('foo'), 'bar');
                // force a load from disk
                watcher.reload(function (config) {
                    assert.equal(config.foo, 'changed');
                    assert.equal(watcher.getConfig().foo, 'changed');
                    assert.equal(watcher.getValue('foo'), 'changed');
                    watcher.dispose();
                    cleanUp(done);
                });
            });
        });
    });
});
