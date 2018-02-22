/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "assert", "os", "path", "fs", "vs/platform/registry/common/platform", "vs/platform/configuration/node/configurationService", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/base/node/extfs", "vs/base/common/uuid", "vs/platform/configuration/common/configurationRegistry", "vs/base/node/pfs"], function (require, exports, assert, os, path, fs, platform_1, configurationService_1, argv_1, environmentService_1, extfs, uuid, configurationRegistry_1, pfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SettingsTestEnvironmentService = /** @class */ (function (_super) {
        __extends(SettingsTestEnvironmentService, _super);
        function SettingsTestEnvironmentService(args, _execPath, customAppSettingsHome) {
            var _this = _super.call(this, args, _execPath) || this;
            _this.customAppSettingsHome = customAppSettingsHome;
            return _this;
        }
        Object.defineProperty(SettingsTestEnvironmentService.prototype, "appSettingsPath", {
            get: function () { return this.customAppSettingsHome; },
            enumerable: true,
            configurable: true
        });
        return SettingsTestEnvironmentService;
    }(environmentService_1.EnvironmentService));
    suite('ConfigurationService - Node', function () {
        function testFile(callback) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'config', id);
            var testFile = path.join(newDir, 'config.json');
            var onMkdirp = function (error) { return callback(testFile, function (callback) { return extfs.del(parentDir, os.tmpdir(), function () { }, callback); }); };
            pfs_1.mkdirp(newDir, 493).done(function () { return onMkdirp(null); }, function (error) { return onMkdirp(error); });
        }
        test('simple', function (done) {
            testFile(function (testFile, cleanUp) {
                fs.writeFileSync(testFile, '{ "foo": "bar" }');
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var config = service.getValue();
                assert.ok(config);
                assert.equal(config.foo, 'bar');
                service.dispose();
                cleanUp(done);
            });
        });
        test('config gets flattened', function (done) {
            testFile(function (testFile, cleanUp) {
                fs.writeFileSync(testFile, '{ "testworkbench.editor.tabs": true }');
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var config = service.getValue();
                assert.ok(config);
                assert.ok(config.testworkbench);
                assert.ok(config.testworkbench.editor);
                assert.equal(config.testworkbench.editor.tabs, true);
                service.dispose();
                cleanUp(done);
            });
        });
        test('error case does not explode', function (done) {
            testFile(function (testFile, cleanUp) {
                fs.writeFileSync(testFile, ',,,,');
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var config = service.getValue();
                assert.ok(config);
                service.dispose();
                cleanUp(done);
            });
        });
        test('missing file does not explode', function () {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'config', id);
            var testFile = path.join(newDir, 'config.json');
            var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
            var config = service.getValue();
            assert.ok(config);
            service.dispose();
        });
        test('reloadConfiguration', function (done) {
            testFile(function (testFile, cleanUp) {
                fs.writeFileSync(testFile, '{ "foo": "bar" }');
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var config = service.getValue();
                assert.ok(config);
                assert.equal(config.foo, 'bar');
                fs.writeFileSync(testFile, '{ "foo": "changed" }');
                // still outdated
                config = service.getValue();
                assert.ok(config);
                assert.equal(config.foo, 'bar');
                // force a reload to get latest
                service.reloadConfiguration().then(function () {
                    config = service.getValue();
                    assert.ok(config);
                    assert.equal(config.foo, 'changed');
                    service.dispose();
                    cleanUp(done);
                });
            });
        });
        test('model defaults', function (done) {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configuration.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    }
                }
            });
            var serviceWithoutFile = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, '__testFile'));
            var setting = serviceWithoutFile.getValue();
            assert.ok(setting);
            assert.equal(setting.configuration.service.testSetting, 'isSet');
            testFile(function (testFile, cleanUp) {
                fs.writeFileSync(testFile, '{ "testworkbench.editor.tabs": true }');
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var setting = service.getValue();
                assert.ok(setting);
                assert.equal(setting.configuration.service.testSetting, 'isSet');
                fs.writeFileSync(testFile, '{ "configuration.service.testSetting": "isChanged" }');
                service.reloadConfiguration().then(function () {
                    var setting = service.getValue();
                    assert.ok(setting);
                    assert.equal(setting.configuration.service.testSetting, 'isChanged');
                    service.dispose();
                    serviceWithoutFile.dispose();
                    cleanUp(done);
                });
            });
        });
        test('lookup', function (done) {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'lookup.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    }
                }
            });
            testFile(function (testFile, cleanUp) {
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var res = service.inspect('something.missing');
                assert.strictEqual(res.value, void 0);
                assert.strictEqual(res.default, void 0);
                assert.strictEqual(res.user, void 0);
                res = service.inspect('lookup.service.testSetting');
                assert.strictEqual(res.default, 'isSet');
                assert.strictEqual(res.value, 'isSet');
                assert.strictEqual(res.user, void 0);
                fs.writeFileSync(testFile, '{ "lookup.service.testSetting": "bar" }');
                return service.reloadConfiguration().then(function () {
                    res = service.inspect('lookup.service.testSetting');
                    assert.strictEqual(res.default, 'isSet');
                    assert.strictEqual(res.user, 'bar');
                    assert.strictEqual(res.value, 'bar');
                    service.dispose();
                    cleanUp(done);
                });
            });
        });
        test('lookup with null', function (done) {
            var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_testNull',
                'type': 'object',
                'properties': {
                    'lookup.service.testNullSetting': {
                        'type': 'null',
                    }
                }
            });
            testFile(function (testFile, cleanUp) {
                var service = new configurationService_1.ConfigurationService(new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, testFile));
                var res = service.inspect('lookup.service.testNullSetting');
                assert.strictEqual(res.default, null);
                assert.strictEqual(res.value, null);
                assert.strictEqual(res.user, void 0);
                fs.writeFileSync(testFile, '{ "lookup.service.testNullSetting": null }');
                return service.reloadConfiguration().then(function () {
                    res = service.inspect('lookup.service.testNullSetting');
                    assert.strictEqual(res.default, null);
                    assert.strictEqual(res.value, null);
                    assert.strictEqual(res.user, null);
                    service.dispose();
                    cleanUp(done);
                });
            });
        });
    });
});
