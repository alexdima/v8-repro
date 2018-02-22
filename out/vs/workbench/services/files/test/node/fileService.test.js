/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "path", "os", "assert", "vs/base/common/winjs.base", "vs/workbench/services/files/node/fileService", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/node/extfs", "vs/base/node/encoding", "vs/workbench/services/files/test/node/utils", "vs/base/test/common/utils", "vs/workbench/test/workbenchTestServices", "vs/platform/workspace/common/workspace", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/model/textModel"], function (require, exports, fs, path, os, assert, winjs_base_1, fileService_1, files_1, uri_1, uuid, extfs, encodingLib, utils, utils_1, workbenchTestServices_1, workspace_1, testConfigurationService_1, textModel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('FileService', function () {
        var service;
        var parentDir = workbenchTestServices_1.getRandomTestPath(os.tmpdir(), 'vsctests', 'fileservice');
        var testDir;
        setup(function (done) {
            var id = uuid.generateUuid();
            testDir = path.join(parentDir, id);
            var sourceDir = require.toUrl('./fixtures/service');
            extfs.copy(sourceDir, testDir, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                service = new fileService_1.FileService(new workbenchTestServices_1.TestContextService(new workspace_1.Workspace(testDir, testDir, workspace_1.toWorkspaceFolders([{ path: testDir }]))), workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true });
                done();
            });
        });
        teardown(function (done) {
            service.dispose();
            extfs.del(parentDir, os.tmpdir(), function () { }, done);
        });
        test('createFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var contents = 'Hello World';
            var resource = uri_1.default.file(path.join(testDir, 'test.txt'));
            service.createFile(resource, contents).done(function (s) {
                assert.equal(s.name, 'test.txt');
                assert.equal(fs.existsSync(s.resource.fsPath), true);
                assert.equal(fs.readFileSync(s.resource.fsPath), contents);
                assert.ok(event);
                assert.equal(event.resource.fsPath, resource.fsPath);
                assert.equal(event.operation, files_1.FileOperation.CREATE);
                assert.equal(event.target.resource.fsPath, resource.fsPath);
                toDispose.dispose();
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('createFile (does not overwrite by default)', function (done) {
            var contents = 'Hello World';
            var resource = uri_1.default.file(path.join(testDir, 'test.txt'));
            fs.writeFileSync(resource.fsPath, ''); // create file
            service.createFile(resource, contents).done(null, function (error) {
                assert.ok(error);
                done();
            });
        });
        test('createFile (allows to overwrite existing)', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var contents = 'Hello World';
            var resource = uri_1.default.file(path.join(testDir, 'test.txt'));
            fs.writeFileSync(resource.fsPath, ''); // create file
            service.createFile(resource, contents, { overwrite: true }).done(function (s) {
                assert.equal(s.name, 'test.txt');
                assert.equal(fs.existsSync(s.resource.fsPath), true);
                assert.equal(fs.readFileSync(s.resource.fsPath), contents);
                assert.ok(event);
                assert.equal(event.resource.fsPath, resource.fsPath);
                assert.equal(event.operation, files_1.FileOperation.CREATE);
                assert.equal(event.target.resource.fsPath, resource.fsPath);
                toDispose.dispose();
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('createFolder', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                var resource = uri_1.default.file(path.join(parent.resource.fsPath, 'newFolder'));
                return service.createFolder(resource).then(function (f) {
                    assert.equal(f.name, 'newFolder');
                    assert.equal(fs.existsSync(f.resource.fsPath), true);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.CREATE);
                    assert.equal(event.target.resource.fsPath, resource.fsPath);
                    assert.equal(event.target.isDirectory, true);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('touchFile', function (done) {
            service.touchFile(uri_1.default.file(path.join(testDir, 'test.txt'))).done(function (s) {
                assert.equal(s.name, 'test.txt');
                assert.equal(fs.existsSync(s.resource.fsPath), true);
                assert.equal(fs.readFileSync(s.resource.fsPath).length, 0);
                var stat = fs.statSync(s.resource.fsPath);
                return winjs_base_1.TPromise.timeout(10).then(function () {
                    return service.touchFile(s.resource).done(function (s) {
                        var statNow = fs.statSync(s.resource.fsPath);
                        assert.ok(statNow.mtime.getTime() >= stat.mtime.getTime()); // one some OS the resolution seems to be 1s, so we use >= here
                        assert.equal(statNow.size, stat.size);
                        done();
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('renameFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveFile(resource).done(function (source) {
                return service.rename(source.resource, 'other.html').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.MOVE);
                    assert.equal(event.target.resource.fsPath, renamed.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('renameFolder', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'deep'));
            service.resolveFile(resource).done(function (source) {
                return service.rename(source.resource, 'deeper').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.MOVE);
                    assert.equal(event.target.resource.fsPath, renamed.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            });
        });
        test('renameFile - MIX CASE', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveFile(resource).done(function (source) {
                return service.rename(source.resource, 'INDEX.html').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(path.basename(renamed.resource.fsPath), 'INDEX.html');
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.MOVE);
                    assert.equal(event.target.resource.fsPath, renamed.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('moveFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveFile(resource).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'other.html'))).then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.MOVE);
                    assert.equal(event.target.resource.fsPath, renamed.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('move - FILE_MOVE_CONFLICT', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'binary.txt'))).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_MOVE_CONFLICT);
                    assert.ok(!event);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('moveFile - MIX CASE', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveFile(resource).done(function (source) {
                return service.moveFile(source.resource, uri_1.default.file(path.join(testDir, 'INDEX.html'))).then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.equal(path.basename(renamed.resource.fsPath), 'INDEX.html');
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.MOVE);
                    assert.equal(event.target.resource.fsPath, renamed.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('moveFile - overwrite folder with file', function (done) {
            var createEvent;
            var moveEvent;
            var deleteEvent;
            var toDispose = service.onAfterOperation(function (e) {
                if (e.operation === files_1.FileOperation.CREATE) {
                    createEvent = e;
                }
                else if (e.operation === files_1.FileOperation.DELETE) {
                    deleteEvent = e;
                }
                else if (e.operation === files_1.FileOperation.MOVE) {
                    moveEvent = e;
                }
            });
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                var folderResource = uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'));
                return service.createFolder(folderResource).then(function (f) {
                    var resource = uri_1.default.file(path.join(testDir, 'deep', 'conway.js'));
                    return service.moveFile(resource, f.resource, true).then(function (moved) {
                        assert.equal(fs.existsSync(moved.resource.fsPath), true);
                        assert.ok(fs.statSync(moved.resource.fsPath).isFile);
                        assert.ok(createEvent);
                        assert.ok(deleteEvent);
                        assert.ok(moveEvent);
                        assert.equal(moveEvent.resource.fsPath, resource.fsPath);
                        assert.equal(moveEvent.target.resource.fsPath, moved.resource.fsPath);
                        assert.equal(deleteEvent.resource.fsPath, folderResource.fsPath);
                        toDispose.dispose();
                        done();
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('copyFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                var resource = uri_1.default.file(path.join(testDir, 'other.html'));
                return service.copyFile(source.resource, resource).then(function (copied) {
                    assert.equal(fs.existsSync(copied.resource.fsPath), true);
                    assert.equal(fs.existsSync(source.resource.fsPath), true);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, source.resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.COPY);
                    assert.equal(event.target.resource.fsPath, copied.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('copyFile - overwrite folder with file', function (done) {
            var createEvent;
            var copyEvent;
            var deleteEvent;
            var toDispose = service.onAfterOperation(function (e) {
                if (e.operation === files_1.FileOperation.CREATE) {
                    createEvent = e;
                }
                else if (e.operation === files_1.FileOperation.DELETE) {
                    deleteEvent = e;
                }
                else if (e.operation === files_1.FileOperation.COPY) {
                    copyEvent = e;
                }
            });
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                var folderResource = uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'));
                return service.createFolder(folderResource).then(function (f) {
                    var resource = uri_1.default.file(path.join(testDir, 'deep', 'conway.js'));
                    return service.copyFile(resource, f.resource, true).then(function (copied) {
                        assert.equal(fs.existsSync(copied.resource.fsPath), true);
                        assert.ok(fs.statSync(copied.resource.fsPath).isFile);
                        assert.ok(createEvent);
                        assert.ok(deleteEvent);
                        assert.ok(copyEvent);
                        assert.equal(copyEvent.resource.fsPath, resource.fsPath);
                        assert.equal(copyEvent.target.resource.fsPath, copied.resource.fsPath);
                        assert.equal(deleteEvent.resource.fsPath, folderResource.fsPath);
                        toDispose.dispose();
                        done();
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('importFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            service.resolveFile(uri_1.default.file(path.join(testDir, 'deep'))).done(function (target) {
                var resource = uri_1.default.file(require.toUrl('./fixtures/service/index.html'));
                return service.importFile(resource, target.resource).then(function (res) {
                    assert.equal(res.isNew, true);
                    assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.IMPORT);
                    assert.equal(event.target.resource.fsPath, res.stat.resource.fsPath);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('importFile - MIX CASE', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.rename(source.resource, 'CONWAY.js').then(function (renamed) {
                    assert.equal(fs.existsSync(renamed.resource.fsPath), true);
                    assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'CONWAY.js'; }));
                    return service.resolveFile(uri_1.default.file(path.join(testDir, 'deep', 'conway.js'))).done(function (source) {
                        return service.importFile(source.resource, uri_1.default.file(testDir)).then(function (res) {
                            assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                            assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'conway.js'; }));
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('importFile - overwrite folder with file', function (done) {
            var createEvent;
            var importEvent;
            var deleteEvent;
            var toDispose = service.onAfterOperation(function (e) {
                if (e.operation === files_1.FileOperation.CREATE) {
                    createEvent = e;
                }
                else if (e.operation === files_1.FileOperation.DELETE) {
                    deleteEvent = e;
                }
                else if (e.operation === files_1.FileOperation.IMPORT) {
                    importEvent = e;
                }
            });
            service.resolveFile(uri_1.default.file(testDir)).done(function (parent) {
                var folderResource = uri_1.default.file(path.join(parent.resource.fsPath, 'conway.js'));
                return service.createFolder(folderResource).then(function (f) {
                    var resource = uri_1.default.file(path.join(testDir, 'deep', 'conway.js'));
                    return service.importFile(resource, uri_1.default.file(testDir)).then(function (res) {
                        assert.equal(fs.existsSync(res.stat.resource.fsPath), true);
                        assert.ok(fs.readdirSync(testDir).some(function (f) { return f === 'conway.js'; }));
                        assert.ok(fs.statSync(res.stat.resource.fsPath).isFile);
                        assert.ok(createEvent);
                        assert.ok(deleteEvent);
                        assert.ok(importEvent);
                        assert.equal(importEvent.resource.fsPath, resource.fsPath);
                        assert.equal(importEvent.target.resource.fsPath, res.stat.resource.fsPath);
                        assert.equal(deleteEvent.resource.fsPath, folderResource.fsPath);
                        toDispose.dispose();
                        done();
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('importFile - same file', function (done) {
            service.resolveFile(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (source) {
                return service.importFile(source.resource, uri_1.default.file(path.dirname(source.resource.fsPath))).then(function (imported) {
                    assert.equal(imported.stat.size, source.size);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('deleteFile', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'deep', 'conway.js'));
            service.resolveFile(resource).done(function (source) {
                return service.del(source.resource).then(function () {
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.DELETE);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('deleteFolder', function (done) {
            var event;
            var toDispose = service.onAfterOperation(function (e) {
                event = e;
            });
            var resource = uri_1.default.file(path.join(testDir, 'deep'));
            service.resolveFile(resource).done(function (source) {
                return service.del(source.resource).then(function () {
                    assert.equal(fs.existsSync(source.resource.fsPath), false);
                    assert.ok(event);
                    assert.equal(event.resource.fsPath, resource.fsPath);
                    assert.equal(event.operation, files_1.FileOperation.DELETE);
                    toDispose.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveFile', function (done) {
            service.resolveFile(uri_1.default.file(testDir), { resolveTo: [uri_1.default.file(path.join(testDir, 'deep'))] }).done(function (r) {
                assert.equal(r.children.length, 8);
                var deep = utils.getByName(r, 'deep');
                assert.equal(deep.children.length, 4);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveFiles', function (done) {
            service.resolveFiles([
                { resource: uri_1.default.file(testDir), options: { resolveTo: [uri_1.default.file(path.join(testDir, 'deep'))] } },
                { resource: uri_1.default.file(path.join(testDir, 'deep')) }
            ]).then(function (res) {
                var r1 = res[0].stat;
                assert.equal(r1.children.length, 8);
                var deep = utils.getByName(r1, 'deep');
                assert.equal(deep.children.length, 4);
                var r2 = res[1].stat;
                assert.equal(r2.children.length, 4);
                assert.equal(r2.name, 'deep');
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('existsFile', function (done) {
            service.existsFile(uri_1.default.file(testDir)).then(function (exists) {
                assert.equal(exists, true);
                service.existsFile(uri_1.default.file(testDir + 'something')).then(function (exists) {
                    assert.equal(exists, false);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.value, 'Small File');
                c.value = 'Updates to the small file';
                return service.updateContent(c.resource, c.value).then(function (c) {
                    assert.equal(fs.readFileSync(resource.fsPath), 'Updates to the small file');
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent (ITextSnapShot)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.value, 'Small File');
                var model = textModel_1.TextModel.createFromString('Updates to the small file');
                return service.updateContent(c.resource, model.createSnapshot()).then(function (c) {
                    assert.equal(fs.readFileSync(resource.fsPath), 'Updates to the small file');
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent (large file)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'lorem.txt'));
            service.resolveContent(resource).done(function (c) {
                var newValue = c.value + c.value;
                c.value = newValue;
                return service.updateContent(c.resource, c.value).then(function (c) {
                    assert.equal(fs.readFileSync(resource.fsPath), newValue);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent (large file, ITextSnapShot)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'lorem.txt'));
            service.resolveContent(resource).done(function (c) {
                var newValue = c.value + c.value;
                var model = textModel_1.TextModel.createFromString(newValue);
                return service.updateContent(c.resource, model.createSnapshot()).then(function (c) {
                    assert.equal(fs.readFileSync(resource.fsPath), newValue);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent - use encoding (UTF 16 BE)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            var encoding = 'utf16be';
            service.resolveContent(resource).done(function (c) {
                c.encoding = encoding;
                return service.updateContent(c.resource, c.value, { encoding: encoding }).then(function (c) {
                    return encodingLib.detectEncodingByBOM(c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16be);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent - use encoding (UTF 16 BE, ITextSnapShot)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            var encoding = 'utf16be';
            service.resolveContent(resource).done(function (c) {
                c.encoding = encoding;
                var model = textModel_1.TextModel.createFromString(c.value);
                return service.updateContent(c.resource, model.createSnapshot(), { encoding: encoding }).then(function (c) {
                    return encodingLib.detectEncodingByBOM(c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16be);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            model.dispose();
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent - encoding preserved (UTF 16 LE)', function (done) {
            var encoding = 'utf16le';
            var resource = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.encoding, encoding);
                c.value = 'Some updates';
                return service.updateContent(c.resource, c.value, { encoding: encoding }).then(function (c) {
                    return encodingLib.detectEncodingByBOM(c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16le);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('updateContent - encoding preserved (UTF 16 LE, ITextSnapShot)', function (done) {
            var encoding = 'utf16le';
            var resource = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(c.encoding, encoding);
                var model = textModel_1.TextModel.createFromString('Some updates');
                return service.updateContent(c.resource, model.createSnapshot(), { encoding: encoding }).then(function (c) {
                    return encodingLib.detectEncodingByBOM(c.resource.fsPath).then(function (enc) {
                        assert.equal(enc, encodingLib.UTF16le);
                        return service.resolveContent(resource).then(function (c) {
                            assert.equal(c.encoding, encoding);
                            model.dispose();
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - large file', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'lorem.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.ok(c.value.length > 64000);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Files are intermingled #38331', function () {
            var resource1 = uri_1.default.file(path.join(testDir, 'lorem.txt'));
            var resource2 = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            var value1;
            var value2;
            // load in sequence and keep data
            return service.resolveContent(resource1).then(function (c) { return value1 = c.value; }).then(function () {
                return service.resolveContent(resource2).then(function (c) { return value2 = c.value; });
            }).then(function () {
                // load in parallel in expect the same result
                return winjs_base_1.TPromise.join([
                    service.resolveContent(resource1).then(function (c) { return assert.equal(c.value, value1); }),
                    service.resolveContent(resource2).then(function (c) { return assert.equal(c.value, value2); })
                ]);
            });
        });
        test('resolveContent - FILE_IS_BINARY', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'binary.txt'));
            service.resolveContent(resource, { acceptTextOnly: true }).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_IS_BINARY);
                return service.resolveContent(uri_1.default.file(path.join(testDir, 'small.txt')), { acceptTextOnly: true }).then(function (r) {
                    assert.equal(r.name, 'small.txt');
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - FILE_IS_DIRECTORY', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'deep'));
            service.resolveContent(resource).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_IS_DIRECTORY);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - FILE_NOT_FOUND', function (done) {
            var resource = uri_1.default.file(path.join(testDir, '404.html'));
            service.resolveContent(resource).done(null, function (e) {
                assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_NOT_FOUND);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - FILE_NOT_MODIFIED_SINCE', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource).done(function (c) {
                return service.resolveContent(resource, { etag: c.etag }).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - FILE_MODIFIED_SINCE', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource).done(function (c) {
                fs.writeFileSync(resource.fsPath, 'Updates Incoming!');
                return service.updateContent(resource, c.value, { etag: c.etag, mtime: c.mtime - 1000 }).then(null, function (e) {
                    assert.equal(e.fileOperationResult, files_1.FileOperationResult.FILE_MODIFIED_SINCE);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - encoding picked up', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            var encoding = 'windows1252';
            service.resolveContent(resource, { encoding: encoding }).done(function (c) {
                assert.equal(c.encoding, encoding);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - user overrides BOM', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'some_utf16le.css'));
            service.resolveContent(resource, { encoding: 'windows1252' }).done(function (c) {
                assert.equal(c.encoding, 'windows1252');
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - BOM removed', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'some_utf8_bom.txt'));
            service.resolveContent(resource).done(function (c) {
                assert.equal(encodingLib.detectEncodingByBOMFromBuffer(new Buffer(c.value), 512), null);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - invalid encoding', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            service.resolveContent(resource, { encoding: 'superduper' }).done(function (c) {
                assert.equal(c.encoding, 'utf8');
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('watchFileChanges', function (done) {
            var toWatch = uri_1.default.file(path.join(testDir, 'index.html'));
            service.watchFileChanges(toWatch);
            service.onFileChanges(function (e) {
                assert.ok(e);
                service.unwatchFileChanges(toWatch);
                done();
            });
            setTimeout(function () {
                fs.writeFileSync(toWatch.fsPath, 'Changes');
            }, 100);
        });
        test('watchFileChanges - support atomic save', function (done) {
            var toWatch = uri_1.default.file(path.join(testDir, 'index.html'));
            service.watchFileChanges(toWatch);
            service.onFileChanges(function (e) {
                assert.ok(e);
                service.unwatchFileChanges(toWatch);
                done();
            });
            setTimeout(function () {
                // Simulate atomic save by deleting the file, creating it under different name
                // and then replacing the previously deleted file with those contents
                var renamed = toWatch.fsPath + ".bak";
                fs.unlinkSync(toWatch.fsPath);
                fs.writeFileSync(renamed, 'Changes');
                fs.renameSync(renamed, toWatch.fsPath);
            }, 100);
        });
        test('options - encoding', function (done) {
            // setup
            var _id = uuid.generateUuid();
            var _testDir = path.join(parentDir, _id);
            var _sourceDir = require.toUrl('./fixtures/service');
            extfs.copy(_sourceDir, _testDir, function () {
                var encodingOverride = [];
                encodingOverride.push({
                    resource: uri_1.default.file(path.join(testDir, 'deep')),
                    encoding: 'utf16le'
                });
                var configurationService = new testConfigurationService_1.TestConfigurationService();
                configurationService.setUserConfiguration('files', { encoding: 'windows1252' });
                var textResourceConfigurationService = new workbenchTestServices_1.TestTextResourceConfigurationService(configurationService);
                var _service = new fileService_1.FileService(new workbenchTestServices_1.TestContextService(new workspace_1.Workspace(_testDir, _testDir, workspace_1.toWorkspaceFolders([{ path: _testDir }]))), workbenchTestServices_1.TestEnvironmentService, textResourceConfigurationService, configurationService, new workbenchTestServices_1.TestLifecycleService(), {
                    encodingOverride: encodingOverride,
                    disableWatcher: true
                });
                _service.resolveContent(uri_1.default.file(path.join(testDir, 'index.html'))).done(function (c) {
                    assert.equal(c.encoding, 'windows1252');
                    return _service.resolveContent(uri_1.default.file(path.join(testDir, 'deep', 'conway.js'))).done(function (c) {
                        assert.equal(c.encoding, 'utf16le');
                        // teardown
                        _service.dispose();
                        done();
                    });
                });
            });
        });
        test('UTF 8 BOMs', function (done) {
            // setup
            var _id = uuid.generateUuid();
            var _testDir = path.join(parentDir, _id);
            var _sourceDir = require.toUrl('./fixtures/service');
            var resource = uri_1.default.file(path.join(testDir, 'index.html'));
            var _service = new fileService_1.FileService(new workbenchTestServices_1.TestContextService(new workspace_1.Workspace(_testDir, _testDir, workspace_1.toWorkspaceFolders([{ path: _testDir }]))), workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestLifecycleService(), {
                disableWatcher: true
            });
            extfs.copy(_sourceDir, _testDir, function () {
                fs.readFile(resource.fsPath, function (error, data) {
                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                    var model = textModel_1.TextModel.createFromString('Hello Bom');
                    // Update content: UTF_8 => UTF_8_BOM
                    _service.updateContent(resource, model.createSnapshot(), { encoding: encodingLib.UTF8_with_bom }).done(function () {
                        fs.readFile(resource.fsPath, function (error, data) {
                            assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), encodingLib.UTF8);
                            // Update content: PRESERVE BOM when using UTF-8
                            model.setValue('Please stay Bom');
                            _service.updateContent(resource, model.createSnapshot(), { encoding: encodingLib.UTF8 }).done(function () {
                                fs.readFile(resource.fsPath, function (error, data) {
                                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), encodingLib.UTF8);
                                    // Update content: REMOVE BOM
                                    model.setValue('Go away Bom');
                                    _service.updateContent(resource, model.createSnapshot(), { encoding: encodingLib.UTF8, overwriteEncoding: true }).done(function () {
                                        fs.readFile(resource.fsPath, function (error, data) {
                                            assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                                            // Update content: BOM comes not back
                                            model.setValue('Do not come back Bom');
                                            _service.updateContent(resource, model.createSnapshot(), { encoding: encodingLib.UTF8 }).done(function () {
                                                fs.readFile(resource.fsPath, function (error, data) {
                                                    assert.equal(encodingLib.detectEncodingByBOMFromBuffer(data, 512), null);
                                                    model.dispose();
                                                    _service.dispose();
                                                    done();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        test('resolveContent - from position (ASCII)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small.txt'));
            service.resolveContent(resource, { position: 6 }).done(function (content) {
                assert.equal(content.value, 'File');
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('resolveContent - from position (with umlaut)', function (done) {
            var resource = uri_1.default.file(path.join(testDir, 'small_umlaut.txt'));
            service.resolveContent(resource, { position: new Buffer('Small File with Ü').length }).done(function (content) {
                assert.equal(content.value, 'mlaut');
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
    });
});
