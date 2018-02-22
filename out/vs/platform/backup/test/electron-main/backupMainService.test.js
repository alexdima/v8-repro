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
define(["require", "exports", "assert", "vs/base/common/platform", "fs", "os", "path", "vs/base/node/extfs", "vs/base/node/pfs", "vs/base/common/uri", "vs/platform/environment/node/environmentService", "vs/platform/environment/node/argv", "vs/platform/backup/electron-main/backupMainService", "vs/platform/files/common/files", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/log/common/log", "crypto", "vs/workbench/test/workbenchTestServices", "vs/base/common/network"], function (require, exports, assert, platform, fs, os, path, extfs, pfs, uri_1, environmentService_1, argv_1, backupMainService_1, files_1, testConfigurationService_1, log_1, crypto_1, workbenchTestServices_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BackupMainService', function () {
        var parentDir = workbenchTestServices_1.getRandomTestPath(os.tmpdir(), 'vsctests', 'backupservice');
        var backupHome = path.join(parentDir, 'Backups');
        var backupWorkspacesPath = path.join(backupHome, 'workspaces.json');
        var environmentService = new environmentService_1.EnvironmentService(argv_1.parseArgs(process.argv), process.execPath);
        var TestBackupMainService = /** @class */ (function (_super) {
            __extends(TestBackupMainService, _super);
            function TestBackupMainService(backupHome, backupWorkspacesPath, configService) {
                var _this = _super.call(this, environmentService, configService, new log_1.ConsoleLogMainService()) || this;
                _this.backupHome = backupHome;
                _this.workspacesJsonPath = backupWorkspacesPath;
                // Force a reload with the new paths
                _this.loadSync();
                return _this;
            }
            Object.defineProperty(TestBackupMainService.prototype, "backupsData", {
                get: function () {
                    return this.backups;
                },
                enumerable: true,
                configurable: true
            });
            TestBackupMainService.prototype.removeBackupPathSync = function (workspaceIdentifier, target) {
                return _super.prototype.removeBackupPathSync.call(this, workspaceIdentifier, target);
            };
            TestBackupMainService.prototype.loadSync = function () {
                _super.prototype.loadSync.call(this);
            };
            TestBackupMainService.prototype.dedupeBackups = function (backups) {
                return _super.prototype.dedupeBackups.call(this, backups);
            };
            TestBackupMainService.prototype.toBackupPath = function (workspacePath) {
                return path.join(this.backupHome, _super.prototype.getFolderHash.call(this, workspacePath));
            };
            TestBackupMainService.prototype.getFolderHash = function (folderPath) {
                return _super.prototype.getFolderHash.call(this, folderPath);
            };
            return TestBackupMainService;
        }(backupMainService_1.BackupMainService));
        function toWorkspace(path) {
            return {
                id: crypto_1.createHash('md5').update(sanitizePath(path)).digest('hex'),
                configPath: path
            };
        }
        function sanitizePath(p) {
            return platform.isLinux ? p : p.toLowerCase();
        }
        var fooFile = uri_1.default.file(platform.isWindows ? 'C:\\foo' : '/foo');
        var barFile = uri_1.default.file(platform.isWindows ? 'C:\\bar' : '/bar');
        var service;
        var configService;
        setup(function (done) {
            configService = new testConfigurationService_1.TestConfigurationService();
            service = new TestBackupMainService(backupHome, backupWorkspacesPath, configService);
            // Delete any existing backups completely and then re-create it.
            extfs.del(backupHome, os.tmpdir(), function () {
                pfs.mkdirp(backupHome).then(function () {
                    done();
                });
            });
        });
        teardown(function (done) {
            extfs.del(backupHome, os.tmpdir(), done);
        });
        test('service validates backup workspaces on startup and cleans up (folder workspaces)', function (done) {
            // 1) backup workspace path does not exist
            service.registerFolderBackupSync(fooFile.fsPath);
            service.registerFolderBackupSync(barFile.fsPath);
            service.loadSync();
            assert.deepEqual(service.getFolderBackupPaths(), []);
            // 2) backup workspace path exists with empty contents within
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            service.registerFolderBackupSync(fooFile.fsPath);
            service.registerFolderBackupSync(barFile.fsPath);
            service.loadSync();
            assert.deepEqual(service.getFolderBackupPaths(), []);
            assert.ok(!fs.exists(service.toBackupPath(fooFile.fsPath)));
            assert.ok(!fs.exists(service.toBackupPath(barFile.fsPath)));
            // 3) backup workspace path exists with empty folders within
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            fs.mkdirSync(path.join(service.toBackupPath(fooFile.fsPath), network_1.Schemas.file));
            fs.mkdirSync(path.join(service.toBackupPath(barFile.fsPath), network_1.Schemas.untitled));
            service.registerFolderBackupSync(fooFile.fsPath);
            service.registerFolderBackupSync(barFile.fsPath);
            service.loadSync();
            assert.deepEqual(service.getFolderBackupPaths(), []);
            assert.ok(!fs.exists(service.toBackupPath(fooFile.fsPath)));
            assert.ok(!fs.exists(service.toBackupPath(barFile.fsPath)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            var fileBackups = path.join(service.toBackupPath(fooFile.fsPath), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            fs.mkdirSync(fileBackups);
            service.registerFolderBackupSync(fooFile.fsPath);
            assert.equal(service.getFolderBackupPaths().length, 1);
            assert.equal(service.getEmptyWindowBackupPaths().length, 0);
            fs.writeFileSync(path.join(fileBackups, 'backup.txt'), '');
            service.loadSync();
            assert.equal(service.getFolderBackupPaths().length, 0);
            assert.equal(service.getEmptyWindowBackupPaths().length, 1);
            done();
        });
        test('service validates backup workspaces on startup and cleans up (root workspaces)', function (done) {
            // 1) backup workspace path does not exist
            service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath));
            service.registerWorkspaceBackupSync(toWorkspace(barFile.fsPath));
            service.loadSync();
            assert.deepEqual(service.getWorkspaceBackups(), []);
            // 2) backup workspace path exists with empty contents within
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath));
            service.registerWorkspaceBackupSync(toWorkspace(barFile.fsPath));
            service.loadSync();
            assert.deepEqual(service.getWorkspaceBackups(), []);
            assert.ok(!fs.exists(service.toBackupPath(fooFile.fsPath)));
            assert.ok(!fs.exists(service.toBackupPath(barFile.fsPath)));
            // 3) backup workspace path exists with empty folders within
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            fs.mkdirSync(path.join(service.toBackupPath(fooFile.fsPath), network_1.Schemas.file));
            fs.mkdirSync(path.join(service.toBackupPath(barFile.fsPath), network_1.Schemas.untitled));
            service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath));
            service.registerWorkspaceBackupSync(toWorkspace(barFile.fsPath));
            service.loadSync();
            assert.deepEqual(service.getWorkspaceBackups(), []);
            assert.ok(!fs.exists(service.toBackupPath(fooFile.fsPath)));
            assert.ok(!fs.exists(service.toBackupPath(barFile.fsPath)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            var fileBackups = path.join(service.toBackupPath(fooFile.fsPath), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile.fsPath));
            fs.mkdirSync(service.toBackupPath(barFile.fsPath));
            fs.mkdirSync(fileBackups);
            service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath));
            assert.equal(service.getWorkspaceBackups().length, 1);
            assert.equal(service.getEmptyWindowBackupPaths().length, 0);
            fs.writeFileSync(path.join(fileBackups, 'backup.txt'), '');
            service.loadSync();
            assert.equal(service.getWorkspaceBackups().length, 0);
            assert.equal(service.getEmptyWindowBackupPaths().length, 1);
            done();
        });
        test('service supports to migrate backup data from another location', function (done) {
            var backupPathToMigrate = service.toBackupPath(fooFile.fsPath);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.join(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackupSync(backupPathToMigrate);
            var workspaceBackupPath = service.registerWorkspaceBackupSync(toWorkspace(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.join(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            var emptyBackups = service.getEmptyWindowBackupPaths();
            assert.equal(0, emptyBackups.length);
            done();
        });
        test('service backup migration makes sure to preserve existing backups', function (done) {
            var backupPathToMigrate = service.toBackupPath(fooFile.fsPath);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.join(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackupSync(backupPathToMigrate);
            var backupPathToPreserve = service.toBackupPath(barFile.fsPath);
            fs.mkdirSync(backupPathToPreserve);
            fs.writeFileSync(path.join(backupPathToPreserve, 'backup.txt'), 'Some Data');
            service.registerFolderBackupSync(backupPathToPreserve);
            var workspaceBackupPath = service.registerWorkspaceBackupSync(toWorkspace(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.join(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            var emptyBackups = service.getEmptyWindowBackupPaths();
            assert.equal(1, emptyBackups.length);
            assert.equal(1, fs.readdirSync(path.join(backupHome, emptyBackups[0])).length);
            done();
        });
        suite('loadSync', function () {
            test('getFolderBackupPaths() should return [] when workspaces.json doesn\'t exist', function () {
                assert.deepEqual(service.getFolderBackupPaths(), []);
            });
            test('getFolderBackupPaths() should return [] when workspaces.json is not properly formed JSON', function () {
                fs.writeFileSync(backupWorkspacesPath, '');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{]');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, 'foo');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
            });
            test('getFolderBackupPaths() should return [] when folderWorkspaces in workspaces.json is absent', function () {
                fs.writeFileSync(backupWorkspacesPath, '{}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
            });
            test('getFolderBackupPaths() should return [] when folderWorkspaces in workspaces.json is not a string array', function () {
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":{}}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":{"foo": ["bar"]}}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":{"foo": []}}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":{"foo": "bar"}}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":"foo"}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"folderWorkspaces":1}');
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
            });
            test('getFolderBackupPaths() should return [] when files.hotExit = "onExitAndWindowClose"', function () {
                service.registerFolderBackupSync(fooFile.fsPath.toUpperCase());
                assert.deepEqual(service.getFolderBackupPaths(), [fooFile.fsPath.toUpperCase()]);
                configService.setUserConfiguration('files.hotExit', files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE);
                service.loadSync();
                assert.deepEqual(service.getFolderBackupPaths(), []);
            });
            test('getWorkspaceBackups() should return [] when workspaces.json doesn\'t exist', function () {
                assert.deepEqual(service.getWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when workspaces.json is not properly formed JSON', function () {
                fs.writeFileSync(backupWorkspacesPath, '');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{]');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, 'foo');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when folderWorkspaces in workspaces.json is absent', function () {
                fs.writeFileSync(backupWorkspacesPath, '{}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when rootWorkspaces in workspaces.json is not a object array', function () {
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":{}}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":{"foo": ["bar"]}}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":{"foo": []}}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":{"foo": "bar"}}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":"foo"}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"rootWorkspaces":1}');
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when files.hotExit = "onExitAndWindowClose"', function () {
                service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath.toUpperCase()));
                assert.equal(service.getWorkspaceBackups().length, 1);
                assert.deepEqual(service.getWorkspaceBackups().map(function (r) { return r.configPath; }), [fooFile.fsPath.toUpperCase()]);
                configService.setUserConfiguration('files.hotExit', files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE);
                service.loadSync();
                assert.deepEqual(service.getWorkspaceBackups(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when workspaces.json doesn\'t exist', function () {
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when workspaces.json is not properly formed JSON', function () {
                fs.writeFileSync(backupWorkspacesPath, '');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{]');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, 'foo');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is absent', function () {
                fs.writeFileSync(backupWorkspacesPath, '{}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is not a string array', function () {
                this.timeout(5000);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":{}}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":{"foo": ["bar"]}}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":{"foo": []}}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":{"foo": "bar"}}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":"foo"}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
                fs.writeFileSync(backupWorkspacesPath, '{"emptyWorkspaces":1}');
                service.loadSync();
                assert.deepEqual(service.getEmptyWindowBackupPaths(), []);
            });
        });
        suite('dedupeFolderWorkspaces', function () {
            test('should ignore duplicates on Windows and Mac (folder workspace)', function () {
                // Skip test on Linux
                if (platform.isLinux) {
                    return;
                }
                var backups = {
                    rootWorkspaces: [],
                    folderWorkspaces: platform.isWindows ? ['c:\\FOO', 'C:\\FOO', 'c:\\foo'] : ['/FOO', '/foo'],
                    emptyWorkspaces: []
                };
                service.dedupeBackups(backups);
                assert.equal(backups.folderWorkspaces.length, 1);
                if (platform.isWindows) {
                    assert.deepEqual(backups.folderWorkspaces, ['c:\\FOO'], 'should return the first duplicated entry');
                }
                else {
                    assert.deepEqual(backups.folderWorkspaces, ['/FOO'], 'should return the first duplicated entry');
                }
            });
            test('should ignore duplicates on Windows and Mac (root workspace)', function () {
                // Skip test on Linux
                if (platform.isLinux) {
                    return;
                }
                var backups = {
                    rootWorkspaces: platform.isWindows ? [toWorkspace('c:\\FOO'), toWorkspace('C:\\FOO'), toWorkspace('c:\\foo')] : [toWorkspace('/FOO'), toWorkspace('/foo')],
                    folderWorkspaces: [],
                    emptyWorkspaces: []
                };
                service.dedupeBackups(backups);
                assert.equal(backups.rootWorkspaces.length, 1);
                if (platform.isWindows) {
                    assert.deepEqual(backups.rootWorkspaces.map(function (r) { return r.configPath; }), ['c:\\FOO'], 'should return the first duplicated entry');
                }
                else {
                    assert.deepEqual(backups.rootWorkspaces.map(function (r) { return r.configPath; }), ['/FOO'], 'should return the first duplicated entry');
                }
            });
        });
        suite('registerWindowForBackups', function () {
            test('should persist paths to workspaces.json (folder workspace)', function (done) {
                service.registerFolderBackupSync(fooFile.fsPath);
                service.registerFolderBackupSync(barFile.fsPath);
                assert.deepEqual(service.getFolderBackupPaths(), [fooFile.fsPath, barFile.fsPath]);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.folderWorkspaces, [fooFile.fsPath, barFile.fsPath]);
                    done();
                });
            });
            test('should persist paths to workspaces.json (root workspace)', function (done) {
                var ws1 = toWorkspace(fooFile.fsPath);
                service.registerWorkspaceBackupSync(ws1);
                var ws2 = toWorkspace(barFile.fsPath);
                service.registerWorkspaceBackupSync(ws2);
                assert.deepEqual(service.getWorkspaceBackups().map(function (b) { return b.configPath; }), [fooFile.fsPath, barFile.fsPath]);
                assert.equal(ws1.id, service.getWorkspaceBackups()[0].id);
                assert.equal(ws2.id, service.getWorkspaceBackups()[1].id);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.rootWorkspaces.map(function (b) { return b.configPath; }), [fooFile.fsPath, barFile.fsPath]);
                    assert.equal(ws1.id, json.rootWorkspaces[0].id);
                    assert.equal(ws2.id, json.rootWorkspaces[1].id);
                    done();
                });
            });
            test('should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (folder workspace)', function (done) {
                service.registerFolderBackupSync(fooFile.fsPath.toUpperCase());
                assert.deepEqual(service.getFolderBackupPaths(), [fooFile.fsPath.toUpperCase()]);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.folderWorkspaces, [fooFile.fsPath.toUpperCase()]);
                    done();
                });
            });
            test('should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (root workspace)', function (done) {
                service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath.toUpperCase()));
                assert.deepEqual(service.getWorkspaceBackups().map(function (b) { return b.configPath; }), [fooFile.fsPath.toUpperCase()]);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.rootWorkspaces.map(function (b) { return b.configPath; }), [fooFile.fsPath.toUpperCase()]);
                    done();
                });
            });
        });
        suite('removeBackupPathSync', function () {
            test('should remove folder workspaces from workspaces.json (folder workspace)', function (done) {
                service.registerFolderBackupSync(fooFile.fsPath);
                service.registerFolderBackupSync(barFile.fsPath);
                service.removeBackupPathSync(fooFile.fsPath, service.backupsData.folderWorkspaces);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.folderWorkspaces, [barFile.fsPath]);
                    service.removeBackupPathSync(barFile.fsPath, service.backupsData.folderWorkspaces);
                    pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (content) {
                        var json2 = JSON.parse(content);
                        assert.deepEqual(json2.folderWorkspaces, []);
                        done();
                    });
                });
            });
            test('should remove folder workspaces from workspaces.json (root workspace)', function (done) {
                var ws1 = toWorkspace(fooFile.fsPath);
                service.registerWorkspaceBackupSync(ws1);
                var ws2 = toWorkspace(barFile.fsPath);
                service.registerWorkspaceBackupSync(ws2);
                service.removeBackupPathSync(ws1, service.backupsData.rootWorkspaces);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.rootWorkspaces.map(function (r) { return r.configPath; }), [barFile.fsPath]);
                    service.removeBackupPathSync(ws2, service.backupsData.rootWorkspaces);
                    pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (content) {
                        var json2 = JSON.parse(content);
                        assert.deepEqual(json2.rootWorkspaces, []);
                        done();
                    });
                });
            });
            test('should remove empty workspaces from workspaces.json', function (done) {
                service.registerEmptyWindowBackupSync('foo');
                service.registerEmptyWindowBackupSync('bar');
                service.removeBackupPathSync('foo', service.backupsData.emptyWorkspaces);
                pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (buffer) {
                    var json = JSON.parse(buffer);
                    assert.deepEqual(json.emptyWorkspaces, ['bar']);
                    service.removeBackupPathSync('bar', service.backupsData.emptyWorkspaces);
                    pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (content) {
                        var json2 = JSON.parse(content);
                        assert.deepEqual(json2.emptyWorkspaces, []);
                        done();
                    });
                });
            });
            test('should fail gracefully when removing a path that doesn\'t exist', function (done) {
                var workspacesJson = { rootWorkspaces: [], folderWorkspaces: [fooFile.fsPath], emptyWorkspaces: [] };
                pfs.writeFile(backupWorkspacesPath, JSON.stringify(workspacesJson)).then(function () {
                    service.removeBackupPathSync(barFile.fsPath, service.backupsData.folderWorkspaces);
                    service.removeBackupPathSync('test', service.backupsData.emptyWorkspaces);
                    pfs.readFile(backupWorkspacesPath, 'utf-8').then(function (content) {
                        var json = JSON.parse(content);
                        assert.deepEqual(json.folderWorkspaces, [fooFile.fsPath]);
                        done();
                    });
                });
            });
        });
        suite('getWorkspaceHash', function () {
            test('should perform an md5 hash on the path', function () {
                assert.equal(service.getFolderHash('/foo'), '1effb2475fcfba4f9e8b8a1dbc8f3caf');
            });
            test('should ignore case on Windows and Mac', function () {
                // Skip test on Linux
                if (platform.isLinux) {
                    return;
                }
                if (platform.isMacintosh) {
                    assert.equal(service.getFolderHash('/foo'), service.getFolderHash('/FOO'));
                }
                if (platform.isWindows) {
                    assert.equal(service.getFolderHash('c:\\foo'), service.getFolderHash('C:\\FOO'));
                }
            });
        });
        suite('mixed path casing', function () {
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (folder workspace)', function (done) {
                service.registerFolderBackupSync(fooFile.fsPath);
                service.registerFolderBackupSync(fooFile.fsPath.toUpperCase());
                if (platform.isLinux) {
                    assert.equal(service.getFolderBackupPaths().length, 2);
                }
                else {
                    assert.equal(service.getFolderBackupPaths().length, 1);
                }
                done();
            });
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (root workspace)', function (done) {
                service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath));
                service.registerWorkspaceBackupSync(toWorkspace(fooFile.fsPath.toUpperCase()));
                if (platform.isLinux) {
                    assert.equal(service.getWorkspaceBackups().length, 2);
                }
                else {
                    assert.equal(service.getWorkspaceBackups().length, 1);
                }
                done();
            });
            test('should handle case insensitive paths properly (removeBackupPathSync) (folder workspace)', function (done) {
                // same case
                service.registerFolderBackupSync(fooFile.fsPath);
                service.removeBackupPathSync(fooFile.fsPath, service.backupsData.folderWorkspaces);
                assert.equal(service.getFolderBackupPaths().length, 0);
                // mixed case
                service.registerFolderBackupSync(fooFile.fsPath);
                service.removeBackupPathSync(fooFile.fsPath.toUpperCase(), service.backupsData.folderWorkspaces);
                if (platform.isLinux) {
                    assert.equal(service.getFolderBackupPaths().length, 1);
                }
                else {
                    assert.equal(service.getFolderBackupPaths().length, 0);
                }
                done();
            });
        });
    });
});
