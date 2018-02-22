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
define(["require", "exports", "assert", "vs/base/common/platform", "crypto", "os", "fs", "path", "vs/base/node/extfs", "vs/base/node/pfs", "vs/base/common/uri", "vs/workbench/services/backup/node/backupFileService", "vs/workbench/services/files/node/fileService", "vs/editor/common/model/textModel", "vs/workbench/test/workbenchTestServices", "vs/platform/workspace/common/workspace", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/model", "vs/platform/files/common/files", "vs/base/common/network"], function (require, exports, assert, platform, crypto, os, fs, path, extfs, pfs, uri_1, backupFileService_1, fileService_1, textModel_1, workbenchTestServices_1, workspace_1, testConfigurationService_1, model_1, files_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var parentDir = workbenchTestServices_1.getRandomTestPath(os.tmpdir(), 'vsctests', 'backupfileservice');
    var backupHome = path.join(parentDir, 'Backups');
    var workspacesJsonPath = path.join(backupHome, 'workspaces.json');
    var workspaceResource = uri_1.default.file(platform.isWindows ? 'c:\\workspace' : '/workspace');
    var workspaceBackupPath = path.join(backupHome, crypto.createHash('md5').update(workspaceResource.fsPath).digest('hex'));
    var fooFile = uri_1.default.file(platform.isWindows ? 'c:\\Foo' : '/Foo');
    var barFile = uri_1.default.file(platform.isWindows ? 'c:\\Bar' : '/Bar');
    var untitledFile = uri_1.default.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
    var fooBackupPath = path.join(workspaceBackupPath, 'file', crypto.createHash('md5').update(fooFile.fsPath).digest('hex'));
    var barBackupPath = path.join(workspaceBackupPath, 'file', crypto.createHash('md5').update(barFile.fsPath).digest('hex'));
    var untitledBackupPath = path.join(workspaceBackupPath, 'untitled', crypto.createHash('md5').update(untitledFile.fsPath).digest('hex'));
    var TestBackupFileService = /** @class */ (function (_super) {
        __extends(TestBackupFileService, _super);
        function TestBackupFileService(workspace, backupHome, workspacesJsonPath) {
            var _this = this;
            var fileService = new fileService_1.FileService(new workbenchTestServices_1.TestContextService(new workspace_1.Workspace(workspace.fsPath, workspace.fsPath, workspace_1.toWorkspaceFolders([{ path: workspace.fsPath }]))), workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true });
            _this = _super.call(this, workspaceBackupPath, fileService) || this;
            return _this;
        }
        TestBackupFileService.prototype.toBackupResource = function (resource) {
            return _super.prototype.toBackupResource.call(this, resource);
        };
        return TestBackupFileService;
    }(backupFileService_1.BackupFileService));
    suite('BackupFileService', function () {
        var service;
        setup(function (done) {
            service = new TestBackupFileService(workspaceResource, backupHome, workspacesJsonPath);
            // Delete any existing backups completely and then re-create it.
            extfs.del(backupHome, os.tmpdir(), function () {
                pfs.mkdirp(backupHome).then(function () {
                    pfs.writeFile(workspacesJsonPath, '').then(function () {
                        done();
                    });
                });
            });
        });
        teardown(function (done) {
            extfs.del(backupHome, os.tmpdir(), done);
        });
        suite('getBackupResource', function () {
            test('should get the correct backup path for text files', function () {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                var backupResource = fooFile;
                var workspaceHash = crypto.createHash('md5').update(workspaceResource.fsPath).digest('hex');
                var filePathHash = crypto.createHash('md5').update(backupResource.fsPath).digest('hex');
                var expectedPath = uri_1.default.file(path.join(backupHome, workspaceHash, 'file', filePathHash)).fsPath;
                assert.equal(service.toBackupResource(backupResource).fsPath, expectedPath);
            });
            test('should get the correct backup path for untitled files', function () {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePath>
                var backupResource = uri_1.default.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
                var workspaceHash = crypto.createHash('md5').update(workspaceResource.fsPath).digest('hex');
                var filePathHash = crypto.createHash('md5').update(backupResource.fsPath).digest('hex');
                var expectedPath = uri_1.default.file(path.join(backupHome, workspaceHash, 'untitled', filePathHash)).fsPath;
                assert.equal(service.toBackupResource(backupResource).fsPath, expectedPath);
            });
        });
        suite('loadBackupResource', function () {
            test('should return whether a backup resource exists', function (done) {
                pfs.mkdirp(path.dirname(fooBackupPath)).then(function () {
                    fs.writeFileSync(fooBackupPath, 'foo');
                    service = new TestBackupFileService(workspaceResource, backupHome, workspacesJsonPath);
                    service.loadBackupResource(fooFile).then(function (resource) {
                        assert.ok(resource);
                        assert.equal(path.basename(resource.fsPath), path.basename(fooBackupPath));
                        return service.hasBackups().then(function (hasBackups) {
                            assert.ok(hasBackups);
                            done();
                        });
                    });
                });
            });
        });
        suite('backupResource', function () {
            test('text file', function (done) {
                service.backupResource(fooFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 1);
                    assert.equal(fs.existsSync(fooBackupPath), true);
                    assert.equal(fs.readFileSync(fooBackupPath), fooFile.toString() + "\ntest");
                    done();
                });
            });
            test('untitled file', function (done) {
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 1);
                    assert.equal(fs.existsSync(untitledBackupPath), true);
                    assert.equal(fs.readFileSync(untitledBackupPath), untitledFile.toString() + "\ntest");
                    done();
                });
            });
            test('text file (ITextSnapshot)', function (done) {
                var model = textModel_1.TextModel.createFromString('test');
                service.backupResource(fooFile, model.createSnapshot()).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 1);
                    assert.equal(fs.existsSync(fooBackupPath), true);
                    assert.equal(fs.readFileSync(fooBackupPath), fooFile.toString() + "\ntest");
                    model.dispose();
                    done();
                });
            });
            test('untitled file (ITextSnapshot)', function (done) {
                var model = textModel_1.TextModel.createFromString('test');
                service.backupResource(untitledFile, model.createSnapshot()).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 1);
                    assert.equal(fs.existsSync(untitledBackupPath), true);
                    assert.equal(fs.readFileSync(untitledBackupPath), untitledFile.toString() + "\ntest");
                    model.dispose();
                    done();
                });
            });
            test('text file (large file, ITextSnapshot)', function (done) {
                var largeString = (new Array(10 * 1024)).join('Large String\n');
                var model = textModel_1.TextModel.createFromString(largeString);
                service.backupResource(fooFile, model.createSnapshot()).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 1);
                    assert.equal(fs.existsSync(fooBackupPath), true);
                    assert.equal(fs.readFileSync(fooBackupPath), fooFile.toString() + "\n" + largeString);
                    model.dispose();
                    done();
                });
            });
            test('untitled file (large file, ITextSnapshot)', function (done) {
                var largeString = (new Array(10 * 1024)).join('Large String\n');
                var model = textModel_1.TextModel.createFromString(largeString);
                service.backupResource(untitledFile, model.createSnapshot()).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 1);
                    assert.equal(fs.existsSync(untitledBackupPath), true);
                    assert.equal(fs.readFileSync(untitledBackupPath), untitledFile.toString() + "\n" + largeString);
                    model.dispose();
                    done();
                });
            });
        });
        suite('discardResourceBackup', function () {
            test('text file', function (done) {
                service.backupResource(fooFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 1);
                    service.discardResourceBackup(fooFile).then(function () {
                        assert.equal(fs.existsSync(fooBackupPath), false);
                        assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 0);
                        done();
                    });
                });
            });
            test('untitled file', function (done) {
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 1);
                    service.discardResourceBackup(untitledFile).then(function () {
                        assert.equal(fs.existsSync(untitledBackupPath), false);
                        assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 0);
                        done();
                    });
                });
            });
        });
        suite('discardAllWorkspaceBackups', function () {
            test('text file', function (done) {
                service.backupResource(fooFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 1);
                    service.backupResource(barFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                        assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'file')).length, 2);
                        service.discardAllWorkspaceBackups().then(function () {
                            assert.equal(fs.existsSync(fooBackupPath), false);
                            assert.equal(fs.existsSync(barBackupPath), false);
                            assert.equal(fs.existsSync(path.join(workspaceBackupPath, 'file')), false);
                            done();
                        });
                    });
                });
            });
            test('untitled file', function (done) {
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    assert.equal(fs.readdirSync(path.join(workspaceBackupPath, 'untitled')).length, 1);
                    service.discardAllWorkspaceBackups().then(function () {
                        assert.equal(fs.existsSync(untitledBackupPath), false);
                        assert.equal(fs.existsSync(path.join(workspaceBackupPath, 'untitled')), false);
                        done();
                    });
                });
            });
            test('should disable further backups', function (done) {
                service.discardAllWorkspaceBackups().then(function () {
                    service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                        assert.equal(fs.existsSync(workspaceBackupPath), false);
                        done();
                    });
                });
            });
        });
        suite('getWorkspaceFileBackups', function () {
            test('("file") - text file', function (done) {
                service.backupResource(fooFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    service.getWorkspaceFileBackups().then(function (textFiles) {
                        assert.deepEqual(textFiles.map(function (f) { return f.fsPath; }), [fooFile.fsPath]);
                        service.backupResource(barFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                            service.getWorkspaceFileBackups().then(function (textFiles) {
                                assert.deepEqual(textFiles.map(function (f) { return f.fsPath; }), [fooFile.fsPath, barFile.fsPath]);
                                done();
                            });
                        });
                    });
                });
            });
            test('("file") - untitled file', function (done) {
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    service.getWorkspaceFileBackups().then(function (textFiles) {
                        assert.deepEqual(textFiles.map(function (f) { return f.fsPath; }), [untitledFile.fsPath]);
                        done();
                    });
                });
            });
            test('("untitled") - untitled file', function (done) {
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory('test').create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    service.getWorkspaceFileBackups().then(function (textFiles) {
                        assert.deepEqual(textFiles.map(function (f) { return f.fsPath; }), ['Untitled-1']);
                        done();
                    });
                });
            });
        });
        test('resolveBackupContent', function () {
            test('should restore the original contents (untitled file)', function () {
                var contents = 'test\nand more stuff';
                service.backupResource(untitledFile, textModel_1.createTextBufferFactory(contents).create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    service.resolveBackupContent(service.toBackupResource(untitledFile)).then(function (factory) {
                        assert.equal(contents, files_1.snapshotToString(factory.create(platform.isWindows ? model_1.DefaultEndOfLine.CRLF : model_1.DefaultEndOfLine.LF).createSnapshot(true)));
                    });
                });
            });
            test('should restore the original contents (text file)', function () {
                var contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'consectetur ',
                    'adipiscing ßß elit',
                ].join('');
                service.backupResource(fooFile, textModel_1.createTextBufferFactory(contents).create(model_1.DefaultEndOfLine.LF).createSnapshot(false)).then(function () {
                    service.resolveBackupContent(service.toBackupResource(untitledFile)).then(function (factory) {
                        assert.equal(contents, files_1.snapshotToString(factory.create(platform.isWindows ? model_1.DefaultEndOfLine.CRLF : model_1.DefaultEndOfLine.LF).createSnapshot(true)));
                    });
                });
            });
        });
    });
    suite('BackupFilesModel', function () {
        test('simple', function () {
            var model = new backupFileService_1.BackupFilesModel();
            var resource1 = uri_1.default.file('test.html');
            assert.equal(model.has(resource1), false);
            model.add(resource1);
            assert.equal(model.has(resource1), true);
            assert.equal(model.has(resource1, 0), true);
            assert.equal(model.has(resource1, 1), false);
            model.remove(resource1);
            assert.equal(model.has(resource1), false);
            model.add(resource1);
            assert.equal(model.has(resource1), true);
            assert.equal(model.has(resource1, 0), true);
            assert.equal(model.has(resource1, 1), false);
            model.clear();
            assert.equal(model.has(resource1), false);
            model.add(resource1, 1);
            assert.equal(model.has(resource1), true);
            assert.equal(model.has(resource1, 0), false);
            assert.equal(model.has(resource1, 1), true);
            var resource2 = uri_1.default.file('test1.html');
            var resource3 = uri_1.default.file('test2.html');
            var resource4 = uri_1.default.file('test3.html');
            model.add(resource2);
            model.add(resource3);
            model.add(resource4);
            assert.equal(model.has(resource1), true);
            assert.equal(model.has(resource2), true);
            assert.equal(model.has(resource3), true);
            assert.equal(model.has(resource4), true);
        });
        test('resolve', function (done) {
            pfs.mkdirp(path.dirname(fooBackupPath)).then(function () {
                fs.writeFileSync(fooBackupPath, 'foo');
                var model = new backupFileService_1.BackupFilesModel();
                model.resolve(workspaceBackupPath).then(function (model) {
                    assert.equal(model.has(uri_1.default.file(fooBackupPath)), true);
                    done();
                });
            });
        });
        test('get', function () {
            var model = new backupFileService_1.BackupFilesModel();
            assert.deepEqual(model.get(), []);
            var file1 = uri_1.default.file('/root/file/foo.html');
            var file2 = uri_1.default.file('/root/file/bar.html');
            var untitled = uri_1.default.file('/root/untitled/bar.html');
            model.add(file1);
            model.add(file2);
            model.add(untitled);
            assert.deepEqual(model.get().map(function (f) { return f.fsPath; }), [file1.fsPath, file2.fsPath, untitled.fsPath]);
        });
    });
});
