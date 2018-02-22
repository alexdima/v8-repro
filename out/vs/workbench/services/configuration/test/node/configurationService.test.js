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
define(["require", "exports", "assert", "sinon", "fs", "path", "os", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/platform/registry/common/platform", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/environment/node/argv", "vs/base/node/extfs", "vs/base/common/uuid", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/configuration/node/configurationService", "vs/workbench/services/configuration/node/configurationEditingService", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/test/workbenchTestServices", "vs/workbench/services/files/node/fileService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/resolverService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/workbench/services/configuration/node/jsonEditingService", "vs/base/node/pfs"], function (require, exports, assert, sinon, fs, path, os, uri_1, winjs_base_1, platform_1, environment_1, environmentService_1, argv_1, extfs, uuid, configurationRegistry_1, configurationService_1, configurationEditingService_1, files_1, workspace_1, configuration_1, workbenchTestServices_1, fileService_1, textfiles_1, resolverService_1, textModelResolverService_1, jsonEditingService_1, pfs_1) {
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
    function setUpFolderWorkspace(folderName) {
        var id = uuid.generateUuid();
        var parentDir = path.join(os.tmpdir(), 'vsctests', id);
        return setUpFolder(folderName, parentDir).then(function (folderDir) { return ({ parentDir: parentDir, folderDir: folderDir }); });
    }
    function setUpFolder(folderName, parentDir) {
        var folderDir = path.join(parentDir, folderName);
        var workspaceSettingsDir = path.join(folderDir, '.vscode');
        return pfs_1.mkdirp(workspaceSettingsDir, 493).then(function () { return folderDir; });
    }
    function setUpWorkspace(folders) {
        var id = uuid.generateUuid();
        var parentDir = path.join(os.tmpdir(), 'vsctests', id);
        return pfs_1.mkdirp(parentDir, 493)
            .then(function () {
            var configPath = path.join(parentDir, 'vsctests.code-workspace');
            var workspace = { folders: folders.map(function (path) { return ({ path: path }); }) };
            fs.writeFileSync(configPath, JSON.stringify(workspace, null, '\t'));
            return winjs_base_1.TPromise.join(folders.map(function (folder) { return setUpFolder(folder, parentDir); }))
                .then(function () { return ({ parentDir: parentDir, configPath: configPath }); });
        });
    }
    suite('WorkspaceContextService - Folder', function () {
        var workspaceName = "testWorkspace" + uuid.generateUuid(), parentResource, workspaceResource, workspaceContextService;
        setup(function () {
            return setUpFolderWorkspace(workspaceName)
                .then(function (_a) {
                var parentDir = _a.parentDir, folderDir = _a.folderDir;
                parentResource = parentDir;
                workspaceResource = folderDir;
                var globalSettingsFile = path.join(parentDir, 'settings.json');
                var environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, globalSettingsFile);
                workspaceContextService = new configurationService_1.WorkspaceService(environmentService);
                return workspaceContextService.initialize(folderDir);
            });
        });
        teardown(function (done) {
            if (workspaceContextService) {
                workspaceContextService.dispose();
            }
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        test('getWorkspace()', function () {
            var actual = workspaceContextService.getWorkspace();
            assert.equal(actual.folders.length, 1);
            assert.equal(actual.folders[0].uri.fsPath, uri_1.default.file(workspaceResource).fsPath);
            assert.equal(actual.folders[0].name, workspaceName);
            assert.equal(actual.folders[0].index, 0);
            assert.ok(!actual.configuration);
        });
        test('getWorkbenchState()', function () {
            var actual = workspaceContextService.getWorkbenchState();
            assert.equal(actual, workspace_1.WorkbenchState.FOLDER);
        });
        test('getWorkspaceFolder()', function () {
            var actual = workspaceContextService.getWorkspaceFolder(uri_1.default.file(path.join(workspaceResource, 'a')));
            assert.equal(actual, workspaceContextService.getWorkspace().folders[0]);
        });
        test('isCurrentWorkspace() => true', function () {
            assert.ok(workspaceContextService.isCurrentWorkspace(workspaceResource));
        });
        test('isCurrentWorkspace() => false', function () {
            assert.ok(!workspaceContextService.isCurrentWorkspace(workspaceResource + 'abc'));
        });
    });
    suite('WorkspaceContextService - Workspace', function () {
        var parentResource, testObject;
        setup(function () {
            return setUpWorkspace(['a', 'b'])
                .then(function (_a) {
                var parentDir = _a.parentDir, configPath = _a.configPath;
                parentResource = parentDir;
                var environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, path.join(parentDir, 'settings.json'));
                var workspaceService = new configurationService_1.WorkspaceService(environmentService);
                var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(configuration_1.IConfigurationService, workspaceService);
                instantiationService.stub(environment_1.IEnvironmentService, environmentService);
                return workspaceService.initialize({ id: configPath, configPath: configPath }).then(function () {
                    instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), workspaceService, new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
                    instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                    instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                    workspaceService.setInstantiationService(instantiationService);
                    testObject = workspaceService;
                });
            });
        });
        teardown(function (done) {
            if (testObject) {
                testObject.dispose();
            }
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        test('workspace folders', function () {
            var actual = testObject.getWorkspace().folders;
            assert.equal(actual.length, 2);
            assert.equal(path.basename(actual[0].uri.fsPath), 'a');
            assert.equal(path.basename(actual[1].uri.fsPath), 'b');
        });
        test('add folders', function () {
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            return testObject.addFolders([{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }])
                .then(function () {
                var actual = testObject.getWorkspace().folders;
                assert.equal(actual.length, 4);
                assert.equal(path.basename(actual[0].uri.fsPath), 'a');
                assert.equal(path.basename(actual[1].uri.fsPath), 'b');
                assert.equal(path.basename(actual[2].uri.fsPath), 'd');
                assert.equal(path.basename(actual[3].uri.fsPath), 'c');
            });
        });
        test('add folders (at specific index)', function () {
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            return testObject.addFolders([{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }], 0)
                .then(function () {
                var actual = testObject.getWorkspace().folders;
                assert.equal(actual.length, 4);
                assert.equal(path.basename(actual[0].uri.fsPath), 'd');
                assert.equal(path.basename(actual[1].uri.fsPath), 'c');
                assert.equal(path.basename(actual[2].uri.fsPath), 'a');
                assert.equal(path.basename(actual[3].uri.fsPath), 'b');
            });
        });
        test('add folders (at specific wrong index)', function () {
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            return testObject.addFolders([{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }], 10)
                .then(function () {
                var actual = testObject.getWorkspace().folders;
                assert.equal(actual.length, 4);
                assert.equal(path.basename(actual[0].uri.fsPath), 'a');
                assert.equal(path.basename(actual[1].uri.fsPath), 'b');
                assert.equal(path.basename(actual[2].uri.fsPath), 'd');
                assert.equal(path.basename(actual[3].uri.fsPath), 'c');
            });
        });
        test('add folders (with name)', function () {
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            return testObject.addFolders([{ uri: uri_1.default.file(path.join(workspaceDir, 'd')), name: 'DDD' }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')), name: 'CCC' }])
                .then(function () {
                var actual = testObject.getWorkspace().folders;
                assert.equal(actual.length, 4);
                assert.equal(path.basename(actual[0].uri.fsPath), 'a');
                assert.equal(path.basename(actual[1].uri.fsPath), 'b');
                assert.equal(path.basename(actual[2].uri.fsPath), 'd');
                assert.equal(path.basename(actual[3].uri.fsPath), 'c');
                assert.equal(actual[2].name, 'DDD');
                assert.equal(actual[3].name, 'CCC');
            });
        });
        test('add folders triggers change event', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            var addedFolders = [{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }];
            return testObject.addFolders(addedFolders)
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added.map(function (r) { return r.uri.toString(); }), addedFolders.map(function (a) { return a.uri.toString(); }));
                assert.deepEqual(actual.removed, []);
                assert.deepEqual(actual.changed, []);
            });
        });
        test('remove folders', function () {
            return testObject.removeFolders([testObject.getWorkspace().folders[0].uri])
                .then(function () {
                var actual = testObject.getWorkspace().folders;
                assert.equal(actual.length, 1);
                assert.equal(path.basename(actual[0].uri.fsPath), 'b');
            });
        });
        test('remove folders triggers change event', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var removedFolder = testObject.getWorkspace().folders[0];
            return testObject.removeFolders([removedFolder.uri])
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added, []);
                assert.deepEqual(actual.removed.map(function (r) { return r.uri.toString(); }), [removedFolder.uri.toString()]);
                assert.deepEqual(actual.changed.map(function (c) { return c.uri.toString(); }), [testObject.getWorkspace().folders[0].uri.toString()]);
            });
        });
        test('update folders (remove last and add to end)', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            var addedFolders = [{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }];
            var removedFolders = [testObject.getWorkspace().folders[1]].map(function (f) { return f.uri; });
            return testObject.updateFolders(addedFolders, removedFolders)
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added.map(function (r) { return r.uri.toString(); }), addedFolders.map(function (a) { return a.uri.toString(); }));
                assert.deepEqual(actual.removed.map(function (r) { return r.uri.toString(); }), removedFolders.map(function (a) { return a.toString(); }));
                assert.deepEqual(actual.changed, []);
            });
        });
        test('update folders (rename first via add and remove)', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            var addedFolders = [{ uri: uri_1.default.file(path.join(workspaceDir, 'a')), name: 'The Folder' }];
            var removedFolders = [testObject.getWorkspace().folders[0]].map(function (f) { return f.uri; });
            return testObject.updateFolders(addedFolders, removedFolders, 0)
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added, []);
                assert.deepEqual(actual.removed, []);
                assert.deepEqual(actual.changed.map(function (r) { return r.uri.toString(); }), removedFolders.map(function (a) { return a.toString(); }));
            });
        });
        test('update folders (remove first and add to end)', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspaceDir = path.dirname(testObject.getWorkspace().folders[0].uri.fsPath);
            var addedFolders = [{ uri: uri_1.default.file(path.join(workspaceDir, 'd')) }, { uri: uri_1.default.file(path.join(workspaceDir, 'c')) }];
            var removedFolders = [testObject.getWorkspace().folders[0]].map(function (f) { return f.uri; });
            var changedFolders = [testObject.getWorkspace().folders[1]].map(function (f) { return f.uri; });
            return testObject.updateFolders(addedFolders, removedFolders)
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added.map(function (r) { return r.uri.toString(); }), addedFolders.map(function (a) { return a.uri.toString(); }));
                assert.deepEqual(actual.removed.map(function (r) { return r.uri.toString(); }), removedFolders.map(function (a) { return a.toString(); }));
                assert.deepEqual(actual.changed.map(function (r) { return r.uri.toString(); }), changedFolders.map(function (a) { return a.toString(); }));
            });
        });
        test('reorder folders trigger change event', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspace = { folders: [{ path: testObject.getWorkspace().folders[1].uri.fsPath }, { path: testObject.getWorkspace().folders[0].uri.fsPath }] };
            fs.writeFileSync(testObject.getWorkspace().configuration.fsPath, JSON.stringify(workspace, null, '\t'));
            return testObject.reloadConfiguration()
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added, []);
                assert.deepEqual(actual.removed, []);
                assert.deepEqual(actual.changed.map(function (c) { return c.uri.toString(); }), testObject.getWorkspace().folders.map(function (f) { return f.uri.toString(); }).reverse());
            });
        });
        test('rename folders trigger change event', function () {
            var target = sinon.spy();
            testObject.onDidChangeWorkspaceFolders(target);
            var workspace = { folders: [{ path: testObject.getWorkspace().folders[0].uri.fsPath, name: '1' }, { path: testObject.getWorkspace().folders[1].uri.fsPath }] };
            fs.writeFileSync(testObject.getWorkspace().configuration.fsPath, JSON.stringify(workspace, null, '\t'));
            return testObject.reloadConfiguration()
                .then(function () {
                assert.ok(target.calledOnce);
                var actual = target.args[0][0];
                assert.deepEqual(actual.added, []);
                assert.deepEqual(actual.removed, []);
                assert.deepEqual(actual.changed.map(function (c) { return c.uri.toString(); }), [testObject.getWorkspace().folders[0].uri.toString()]);
            });
        });
    });
    suite('WorkspaceService - Initialization', function () {
        var parentResource, workspaceConfigPath, testObject, globalSettingsFile;
        var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        suiteSetup(function () {
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'initialization.testSetting1': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    },
                    'initialization.testSetting2': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    }
                }
            });
        });
        setup(function () {
            return setUpWorkspace(['1', '2'])
                .then(function (_a) {
                var parentDir = _a.parentDir, configPath = _a.configPath;
                parentResource = parentDir;
                workspaceConfigPath = configPath;
                globalSettingsFile = path.join(parentDir, 'settings.json');
                var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
                var environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, globalSettingsFile);
                var workspaceService = new configurationService_1.WorkspaceService(environmentService);
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(configuration_1.IConfigurationService, workspaceService);
                instantiationService.stub(environment_1.IEnvironmentService, environmentService);
                return workspaceService.initialize({}).then(function () {
                    instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), workspaceService, new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
                    instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                    instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                    workspaceService.setInstantiationService(instantiationService);
                    testObject = workspaceService;
                });
            });
        });
        teardown(function (done) {
            if (testObject) {
                testObject.dispose();
            }
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        test('initialize a folder workspace from an empty workspace with no configuration changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "initialization.testSetting1": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                return testObject.initialize(path.join(parentResource, '1'))
                    .then(function () {
                    assert.equal(testObject.getValue('initialization.testSetting1'), 'userValue');
                    assert.equal(target.callCount, 3);
                    assert.deepEqual(target.args[0], [workspace_1.WorkbenchState.FOLDER]);
                    assert.deepEqual(target.args[1], [undefined]);
                    assert.deepEqual(target.args[2][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath]);
                    assert.deepEqual(target.args[2][0].removed, []);
                    assert.deepEqual(target.args[2][0].changed, []);
                });
            });
        });
        test('initialize a folder workspace from an empty workspace with configuration changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "initialization.testSetting1": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                fs.writeFileSync(path.join(parentResource, '1', '.vscode', 'settings.json'), '{ "initialization.testSetting1": "workspaceValue" }');
                return testObject.initialize(path.join(parentResource, '1'))
                    .then(function () {
                    assert.equal(testObject.getValue('initialization.testSetting1'), 'workspaceValue');
                    assert.equal(target.callCount, 4);
                    assert.deepEqual(target.args[0][0].affectedKeys, ['initialization.testSetting1']);
                    assert.deepEqual(target.args[1], [workspace_1.WorkbenchState.FOLDER]);
                    assert.deepEqual(target.args[2], [undefined]);
                    assert.deepEqual(target.args[3][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath]);
                    assert.deepEqual(target.args[3][0].removed, []);
                    assert.deepEqual(target.args[3][0].changed, []);
                });
            });
        });
        test('initialize a multi root workspace from an empty workspace with no configuration changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "initialization.testSetting1": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                return testObject.initialize({ id: workspaceConfigPath, configPath: workspaceConfigPath })
                    .then(function () {
                    assert.equal(target.callCount, 3);
                    assert.deepEqual(target.args[0], [workspace_1.WorkbenchState.WORKSPACE]);
                    assert.deepEqual(target.args[1], [undefined]);
                    assert.deepEqual(target.args[2][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath, uri_1.default.file(path.join(parentResource, '2')).fsPath]);
                    assert.deepEqual(target.args[2][0].removed, []);
                    assert.deepEqual(target.args[2][0].changed, []);
                });
            });
        });
        test('initialize a multi root workspace from an empty workspace with configuration changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "initialization.testSetting1": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                fs.writeFileSync(path.join(parentResource, '1', '.vscode', 'settings.json'), '{ "initialization.testSetting1": "workspaceValue1" }');
                fs.writeFileSync(path.join(parentResource, '2', '.vscode', 'settings.json'), '{ "initialization.testSetting2": "workspaceValue2" }');
                return testObject.initialize({ id: workspaceConfigPath, configPath: workspaceConfigPath })
                    .then(function () {
                    assert.equal(target.callCount, 4);
                    assert.deepEqual(target.args[0][0].affectedKeys, ['initialization.testSetting1', 'initialization.testSetting2']);
                    assert.deepEqual(target.args[1], [workspace_1.WorkbenchState.WORKSPACE]);
                    assert.deepEqual(target.args[2], [undefined]);
                    assert.deepEqual(target.args[3][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath, uri_1.default.file(path.join(parentResource, '2')).fsPath]);
                    assert.deepEqual(target.args[3][0].removed, []);
                    assert.deepEqual(target.args[3][0].changed, []);
                });
            });
        });
        test('initialize a folder workspace from a folder workspace with no configuration changes', function () {
            return testObject.initialize(path.join(parentResource, '1'))
                .then(function () {
                fs.writeFileSync(globalSettingsFile, '{ "initialization.testSetting1": "userValue" }');
                return testObject.reloadConfiguration()
                    .then(function () {
                    var target = sinon.spy();
                    testObject.onDidChangeWorkbenchState(target);
                    testObject.onDidChangeWorkspaceName(target);
                    testObject.onDidChangeWorkspaceFolders(target);
                    testObject.onDidChangeConfiguration(target);
                    return testObject.initialize(path.join(parentResource, '2'))
                        .then(function () {
                        assert.equal(testObject.getValue('initialization.testSetting1'), 'userValue');
                        assert.equal(target.callCount, 1);
                        assert.deepEqual(target.args[0][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '2')).fsPath]);
                        assert.deepEqual(target.args[0][0].removed.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath]);
                        assert.deepEqual(target.args[0][0].changed, []);
                    });
                });
            });
        });
        test('initialize a folder workspace from a folder workspace with configuration changes', function () {
            return testObject.initialize(path.join(parentResource, '1'))
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                fs.writeFileSync(path.join(parentResource, '2', '.vscode', 'settings.json'), '{ "initialization.testSetting1": "workspaceValue2" }');
                return testObject.initialize(path.join(parentResource, '2'))
                    .then(function () {
                    assert.equal(testObject.getValue('initialization.testSetting1'), 'workspaceValue2');
                    assert.equal(target.callCount, 2);
                    assert.deepEqual(target.args[0][0].affectedKeys, ['initialization.testSetting1']);
                    assert.deepEqual(target.args[1][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '2')).fsPath]);
                    assert.deepEqual(target.args[1][0].removed.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '1')).fsPath]);
                    assert.deepEqual(target.args[1][0].changed, []);
                });
            });
        });
        test('initialize a multi folder workspace from a folder workspacce triggers change events in the right order', function () {
            var folderDir = path.join(parentResource, '1');
            return testObject.initialize(folderDir)
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeWorkbenchState(target);
                testObject.onDidChangeWorkspaceName(target);
                testObject.onDidChangeWorkspaceFolders(target);
                testObject.onDidChangeConfiguration(target);
                fs.writeFileSync(path.join(parentResource, '1', '.vscode', 'settings.json'), '{ "initialization.testSetting1": "workspaceValue2" }');
                return testObject.initialize({ id: workspaceConfigPath, configPath: workspaceConfigPath })
                    .then(function () {
                    assert.equal(target.callCount, 4);
                    assert.deepEqual(target.args[0][0].affectedKeys, ['initialization.testSetting1']);
                    assert.deepEqual(target.args[1], [workspace_1.WorkbenchState.WORKSPACE]);
                    assert.deepEqual(target.args[2], [undefined]);
                    assert.deepEqual(target.args[3][0].added.map(function (folder) { return folder.uri.fsPath; }), [uri_1.default.file(path.join(parentResource, '2')).fsPath]);
                    assert.deepEqual(target.args[3][0].removed, []);
                    assert.deepEqual(target.args[3][0].changed, []);
                });
            });
        });
    });
    suite('WorkspaceConfigurationService - Folder', function () {
        var workspaceName = "testWorkspace" + uuid.generateUuid(), parentResource, workspaceDir, testObject, globalSettingsFile;
        var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        suiteSetup(function () {
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configurationService.folder.testSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    },
                    'configurationService.folder.executableSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        isExecutable: true
                    }
                }
            });
        });
        setup(function () {
            return setUpFolderWorkspace(workspaceName)
                .then(function (_a) {
                var parentDir = _a.parentDir, folderDir = _a.folderDir;
                parentResource = parentDir;
                workspaceDir = folderDir;
                globalSettingsFile = path.join(parentDir, 'settings.json');
                var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
                var environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, globalSettingsFile);
                var workspaceService = new configurationService_1.WorkspaceService(environmentService);
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(configuration_1.IConfigurationService, workspaceService);
                instantiationService.stub(environment_1.IEnvironmentService, environmentService);
                return workspaceService.initialize(folderDir).then(function () {
                    instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), workspaceService, new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
                    instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                    instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                    workspaceService.setInstantiationService(instantiationService);
                    testObject = workspaceService;
                });
            });
        });
        teardown(function (done) {
            if (testObject) {
                testObject.dispose();
            }
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        test('defaults', function () {
            assert.deepEqual(testObject.getValue('configurationService'), { 'folder': { 'testSetting': 'isSet', 'executableSetting': 'isSet' } });
        });
        test('globals override defaults', function () {
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.testSetting": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('configurationService.folder.testSetting'), 'userValue'); });
        });
        test('globals', function () {
            fs.writeFileSync(globalSettingsFile, '{ "testworkbench.editor.tabs": true }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('testworkbench.editor.tabs'), true); });
        });
        test('workspace settings', function () {
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "testworkbench.editor.icons": true }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('testworkbench.editor.icons'), true); });
        });
        test('workspace settings override user settings', function () {
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.testSetting": "userValue" }');
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.testSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('configurationService.folder.testSetting'), 'workspaceValue'); });
        });
        test('workspace settings override user settings after defaults are registered ', function () {
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.newSetting": "userValue" }');
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.newSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.folder.newSetting': {
                            'type': 'string',
                            'default': 'isSet'
                        }
                    }
                });
                assert.equal(testObject.getValue('configurationService.folder.newSetting'), 'workspaceValue');
            });
        });
        test('executable settings are not read from workspace', function () {
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.executableSetting": "userValue" }');
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.executableSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('configurationService.folder.executableSetting'), 'userValue'); });
        });
        test('get unsupported workspace settings', function () {
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.executableSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.deepEqual(testObject.getUnsupportedWorkspaceKeys(), ['configurationService.folder.executableSetting']); });
        });
        test('get unsupported workspace settings after defaults are registered', function () {
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.anotherExecutableSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.folder.anotherExecutableSetting': {
                            'type': 'string',
                            'default': 'isSet',
                            isExecutable: true
                        }
                    }
                });
                assert.deepEqual(testObject.getUnsupportedWorkspaceKeys(), ['configurationService.folder.anotherExecutableSetting']);
            });
        });
        test('workspace change triggers event', function () {
            var settingsFile = path.join(workspaceDir, '.vscode', 'settings.json');
            fs.writeFileSync(settingsFile, '{ "configurationService.folder.testSetting": "workspaceValue" }');
            var event = new files_1.FileChangesEvent([{ resource: uri_1.default.file(settingsFile), type: files_1.FileChangeType.ADDED }]);
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.handleWorkspaceFileEvents(event)
                .then(function () {
                assert.equal(testObject.getValue('configurationService.folder.testSetting'), 'workspaceValue');
                assert.ok(target.called);
            });
        });
        test('reload configuration emits events after global configuraiton changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "testworkbench.editor.tabs": true }');
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.reloadConfiguration().then(function () { return assert.ok(target.called); });
        });
        test('reload configuration emits events after workspace configuraiton changes', function () {
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.testSetting": "workspaceValue" }');
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.reloadConfiguration().then(function () { return assert.ok(target.called); });
        });
        test('reload configuration should not emit event if no changes', function () {
            fs.writeFileSync(globalSettingsFile, '{ "testworkbench.editor.tabs": true }');
            fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.testSetting": "workspaceValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                var target = sinon.spy();
                testObject.onDidChangeConfiguration(function () { target(); });
                return testObject.reloadConfiguration()
                    .then(function () { return assert.ok(!target.called); });
            });
        });
        test('inspect', function () {
            var actual = testObject.inspect('something.missing');
            assert.equal(actual.default, void 0);
            assert.equal(actual.user, void 0);
            assert.equal(actual.workspace, void 0);
            assert.equal(actual.workspaceFolder, void 0);
            assert.equal(actual.value, void 0);
            actual = testObject.inspect('configurationService.folder.testSetting');
            assert.equal(actual.default, 'isSet');
            assert.equal(actual.user, void 0);
            assert.equal(actual.workspace, void 0);
            assert.equal(actual.workspaceFolder, void 0);
            assert.equal(actual.value, 'isSet');
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.testSetting": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                actual = testObject.inspect('configurationService.folder.testSetting');
                assert.equal(actual.default, 'isSet');
                assert.equal(actual.user, 'userValue');
                assert.equal(actual.workspace, void 0);
                assert.equal(actual.workspaceFolder, void 0);
                assert.equal(actual.value, 'userValue');
                fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.testSetting": "workspaceValue" }');
                return testObject.reloadConfiguration()
                    .then(function () {
                    actual = testObject.inspect('configurationService.folder.testSetting');
                    assert.equal(actual.default, 'isSet');
                    assert.equal(actual.user, 'userValue');
                    assert.equal(actual.workspace, 'workspaceValue');
                    assert.equal(actual.workspaceFolder, void 0);
                    assert.equal(actual.value, 'workspaceValue');
                });
            });
        });
        test('keys', function () {
            var actual = testObject.keys();
            assert.ok(actual.default.indexOf('configurationService.folder.testSetting') !== -1);
            assert.deepEqual(actual.user, []);
            assert.deepEqual(actual.workspace, []);
            assert.deepEqual(actual.workspaceFolder, []);
            fs.writeFileSync(globalSettingsFile, '{ "configurationService.folder.testSetting": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                actual = testObject.keys();
                assert.ok(actual.default.indexOf('configurationService.folder.testSetting') !== -1);
                assert.deepEqual(actual.user, ['configurationService.folder.testSetting']);
                assert.deepEqual(actual.workspace, []);
                assert.deepEqual(actual.workspaceFolder, []);
                fs.writeFileSync(path.join(workspaceDir, '.vscode', 'settings.json'), '{ "configurationService.folder.testSetting": "workspaceValue" }');
                return testObject.reloadConfiguration()
                    .then(function () {
                    actual = testObject.keys();
                    assert.ok(actual.default.indexOf('configurationService.folder.testSetting') !== -1);
                    assert.deepEqual(actual.user, ['configurationService.folder.testSetting']);
                    assert.deepEqual(actual.workspace, ['configurationService.folder.testSetting']);
                    assert.deepEqual(actual.workspaceFolder, []);
                });
            });
        });
        test('update user configuration', function () {
            return testObject.updateValue('configurationService.folder.testSetting', 'value', configuration_1.ConfigurationTarget.USER)
                .then(function () { return assert.equal(testObject.getValue('configurationService.folder.testSetting'), 'value'); });
        });
        test('update workspace configuration', function () {
            return testObject.updateValue('tasks.service.testSetting', 'value', configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.equal(testObject.getValue('tasks.service.testSetting'), 'value'); });
        });
        test('update tasks configuration', function () {
            return testObject.updateValue('tasks', { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }, configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.deepEqual(testObject.getValue('tasks'), { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }); });
        });
        test('update user configuration should trigger change event before promise is resolve', function () {
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('configurationService.folder.testSetting', 'value', configuration_1.ConfigurationTarget.USER)
                .then(function () { return assert.ok(target.called); });
        });
        test('update workspace configuration should trigger change event before promise is resolve', function () {
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('configurationService.folder.testSetting', 'value', configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.ok(target.called); });
        });
        test('update task configuration should trigger change event before promise is resolve', function () {
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('tasks', { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }, configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.ok(target.called); });
        });
    });
    suite('WorkspaceConfigurationService - Multiroot', function () {
        var parentResource, workspaceContextService, environmentService, jsonEditingServce, testObject;
        var configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        suiteSetup(function () {
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configurationService.workspace.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationService.workspace.testResourceSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    },
                    'configurationService.workspace.testExecutableSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        isExecutable: true
                    },
                    'configurationService.workspace.testExecutableResourceSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        isExecutable: true,
                        scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                    }
                }
            });
        });
        setup(function () {
            return setUpWorkspace(['1', '2'])
                .then(function (_a) {
                var parentDir = _a.parentDir, configPath = _a.configPath;
                parentResource = parentDir;
                environmentService = new SettingsTestEnvironmentService(argv_1.parseArgs(process.argv), process.execPath, path.join(parentDir, 'settings.json'));
                var workspaceService = new configurationService_1.WorkspaceService(environmentService);
                var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(configuration_1.IConfigurationService, workspaceService);
                instantiationService.stub(environment_1.IEnvironmentService, environmentService);
                return workspaceService.initialize({ id: configPath, configPath: configPath }).then(function () {
                    instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), workspaceService, new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
                    instantiationService.stub(textfiles_1.ITextFileService, instantiationService.createInstance(workbenchTestServices_1.TestTextFileService));
                    instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
                    workspaceService.setInstantiationService(instantiationService);
                    workspaceContextService = workspaceService;
                    jsonEditingServce = instantiationService.createInstance(jsonEditingService_1.JSONEditingService);
                    testObject = workspaceService;
                });
            });
        });
        teardown(function (done) {
            if (testObject) {
                testObject.dispose();
            }
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        test('executable settings are not read from workspace', function () {
            fs.writeFileSync(environmentService.appSettingsPath, '{ "configurationService.workspace.testExecutableSetting": "userValue" }');
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.testExecutableSetting': 'workspaceValue' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () { return assert.equal(testObject.getValue('configurationService.workspace.testExecutableSetting'), 'userValue'); });
        });
        test('executable settings are not read from workspace folder', function () {
            fs.writeFileSync(environmentService.appSettingsPath, '{ "configurationService.workspace.testExecutableResourceSetting": "userValue" }');
            fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testExecutableResourceSetting": "workspaceFolderValue" }');
            return testObject.reloadConfiguration()
                .then(function () { return assert.equal(testObject.getValue('configurationService.workspace.testExecutableResourceSetting', { resource: workspaceContextService.getWorkspace().folders[0].uri }), 'userValue'); });
        });
        test('get unsupported workspace settings', function () {
            fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testExecutableResourceSetting": "workspaceFolderValue" }');
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.testExecutableSetting': 'workspaceValue' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () { return assert.deepEqual(testObject.getUnsupportedWorkspaceKeys(), ['configurationService.workspace.testExecutableSetting', 'configurationService.workspace.testExecutableResourceSetting']); });
        });
        test('workspace settings override user settings after defaults are registered ', function () {
            fs.writeFileSync(environmentService.appSettingsPath, '{ "configurationService.workspace.newSetting": "userValue" }');
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.newSetting': 'workspaceValue' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.workspace.newSetting': {
                            'type': 'string',
                            'default': 'isSet'
                        }
                    }
                });
                assert.equal(testObject.getValue('configurationService.workspace.newSetting'), 'workspaceValue');
            });
        });
        test('executable settings are not read from workspace folder after defaults are registered', function () {
            fs.writeFileSync(environmentService.appSettingsPath, '{ "configurationService.workspace.testNewExecutableResourceSetting": "userValue" }');
            fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testNewExecutableResourceSetting": "workspaceFolderValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.workspace.testNewExecutableResourceSetting': {
                            'type': 'string',
                            'default': 'isSet',
                            isExecutable: true,
                            scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                        }
                    }
                });
                assert.equal(testObject.getValue('configurationService.workspace.testNewExecutableResourceSetting', { resource: workspaceContextService.getWorkspace().folders[0].uri }), 'userValue');
            });
        });
        test('get unsupported workspace settings after defaults are registered', function () {
            fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testNewExecutableResourceSetting2": "workspaceFolderValue" }');
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.testExecutableSetting': 'workspaceValue' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.workspace.testNewExecutableResourceSetting2': {
                            'type': 'string',
                            'default': 'isSet',
                            isExecutable: true,
                            scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                        }
                    }
                });
                assert.deepEqual(testObject.getUnsupportedWorkspaceKeys(), ['configurationService.workspace.testExecutableSetting', 'configurationService.workspace.testNewExecutableResourceSetting2']);
            });
        });
        test('resource setting in folder is read after it is registered later', function () {
            fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testNewResourceSetting2": "workspaceFolderValue" }');
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.testNewResourceSetting2': 'workspaceValue' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                configurationRegistry.registerConfiguration({
                    'id': '_test',
                    'type': 'object',
                    'properties': {
                        'configurationService.workspace.testNewResourceSetting2': {
                            'type': 'string',
                            'default': 'isSet',
                            scope: configurationRegistry_1.ConfigurationScope.RESOURCE
                        }
                    }
                });
                assert.equal(testObject.getValue('configurationService.workspace.testNewResourceSetting2', { resource: workspaceContextService.getWorkspace().folders[0].uri }), 'workspaceFolderValue');
            });
        });
        test('inspect', function () {
            var actual = testObject.inspect('something.missing');
            assert.equal(actual.default, void 0);
            assert.equal(actual.user, void 0);
            assert.equal(actual.workspace, void 0);
            assert.equal(actual.workspaceFolder, void 0);
            assert.equal(actual.value, void 0);
            actual = testObject.inspect('configurationService.workspace.testResourceSetting');
            assert.equal(actual.default, 'isSet');
            assert.equal(actual.user, void 0);
            assert.equal(actual.workspace, void 0);
            assert.equal(actual.workspaceFolder, void 0);
            assert.equal(actual.value, 'isSet');
            fs.writeFileSync(environmentService.appSettingsPath, '{ "configurationService.workspace.testResourceSetting": "userValue" }');
            return testObject.reloadConfiguration()
                .then(function () {
                actual = testObject.inspect('configurationService.workspace.testResourceSetting');
                assert.equal(actual.default, 'isSet');
                assert.equal(actual.user, 'userValue');
                assert.equal(actual.workspace, void 0);
                assert.equal(actual.workspaceFolder, void 0);
                assert.equal(actual.value, 'userValue');
                return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'settings', value: { 'configurationService.workspace.testResourceSetting': 'workspaceValue' } }, true)
                    .then(function () { return testObject.reloadConfiguration(); })
                    .then(function () {
                    actual = testObject.inspect('configurationService.workspace.testResourceSetting');
                    assert.equal(actual.default, 'isSet');
                    assert.equal(actual.user, 'userValue');
                    assert.equal(actual.workspace, 'workspaceValue');
                    assert.equal(actual.workspaceFolder, void 0);
                    assert.equal(actual.value, 'workspaceValue');
                    fs.writeFileSync(workspaceContextService.getWorkspace().folders[0].toResource('.vscode/settings.json').fsPath, '{ "configurationService.workspace.testResourceSetting": "workspaceFolderValue" }');
                    return testObject.reloadConfiguration()
                        .then(function () {
                        actual = testObject.inspect('configurationService.workspace.testResourceSetting', { resource: workspaceContextService.getWorkspace().folders[0].uri });
                        assert.equal(actual.default, 'isSet');
                        assert.equal(actual.user, 'userValue');
                        assert.equal(actual.workspace, 'workspaceValue');
                        assert.equal(actual.workspaceFolder, 'workspaceFolderValue');
                        assert.equal(actual.value, 'workspaceFolderValue');
                    });
                });
            });
        });
        test('get launch configuration', function () {
            var expectedLaunchConfiguration = {
                'version': '0.1.0',
                'configurations': [
                    {
                        'type': 'node',
                        'request': 'launch',
                        'name': 'Gulp Build',
                        'program': '${workspaceFolder}/node_modules/gulp/bin/gulp.js',
                        'stopOnEntry': true,
                        'args': [
                            'watch-extension:json-client'
                        ],
                        'cwd': '${workspaceFolder}'
                    }
                ]
            };
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'launch', value: expectedLaunchConfiguration }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                var actual = testObject.getValue('launch');
                assert.deepEqual(actual, expectedLaunchConfiguration);
            });
        });
        test('inspect launch configuration', function () {
            var expectedLaunchConfiguration = {
                'version': '0.1.0',
                'configurations': [
                    {
                        'type': 'node',
                        'request': 'launch',
                        'name': 'Gulp Build',
                        'program': '${workspaceFolder}/node_modules/gulp/bin/gulp.js',
                        'stopOnEntry': true,
                        'args': [
                            'watch-extension:json-client'
                        ],
                        'cwd': '${workspaceFolder}'
                    }
                ]
            };
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'launch', value: expectedLaunchConfiguration }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                var actual = testObject.inspect('launch').workspace;
                assert.deepEqual(actual, expectedLaunchConfiguration);
            });
        });
        test('update user configuration', function () {
            return testObject.updateValue('configurationService.workspace.testSetting', 'userValue', configuration_1.ConfigurationTarget.USER)
                .then(function () { return assert.equal(testObject.getValue('configurationService.workspace.testSetting'), 'userValue'); });
        });
        test('update user configuration should trigger change event before promise is resolve', function () {
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('configurationService.workspace.testSetting', 'userValue', configuration_1.ConfigurationTarget.USER)
                .then(function () { return assert.ok(target.called); });
        });
        test('update workspace configuration', function () {
            return testObject.updateValue('configurationService.workspace.testSetting', 'workspaceValue', configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.equal(testObject.getValue('configurationService.workspace.testSetting'), 'workspaceValue'); });
        });
        test('update workspace configuration should trigger change event before promise is resolve', function () {
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('configurationService.workspace.testSetting', 'workspaceValue', configuration_1.ConfigurationTarget.WORKSPACE)
                .then(function () { return assert.ok(target.called); });
        });
        test('update workspace folder configuration', function () {
            var workspace = workspaceContextService.getWorkspace();
            return testObject.updateValue('configurationService.workspace.testResourceSetting', 'workspaceFolderValue', { resource: workspace.folders[0].uri }, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER)
                .then(function () { return assert.equal(testObject.getValue('configurationService.workspace.testResourceSetting', { resource: workspace.folders[0].uri }), 'workspaceFolderValue'); });
        });
        test('update workspace folder configuration should trigger change event before promise is resolve', function () {
            var workspace = workspaceContextService.getWorkspace();
            var target = sinon.spy();
            testObject.onDidChangeConfiguration(target);
            return testObject.updateValue('configurationService.workspace.testResourceSetting', 'workspaceFolderValue', { resource: workspace.folders[0].uri }, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER)
                .then(function () { return assert.ok(target.called); });
        });
        test('update tasks configuration in a folder', function () {
            var workspace = workspaceContextService.getWorkspace();
            return testObject.updateValue('tasks', { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }, { resource: workspace.folders[0].uri }, configuration_1.ConfigurationTarget.WORKSPACE_FOLDER)
                .then(function () { return assert.deepEqual(testObject.getValue('tasks', { resource: workspace.folders[0].uri }), { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }); });
        });
        test('update tasks configuration in a workspace is not supported', function () {
            var workspace = workspaceContextService.getWorkspace();
            return testObject.updateValue('tasks', { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] }, { resource: workspace.folders[0].uri }, configuration_1.ConfigurationTarget.WORKSPACE, true)
                .then(function () { return assert.fail('Should not be supported'); }, function (e) { return assert.equal(e.code, configurationEditingService_1.ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET); });
        });
        test('update launch configuration in a workspace', function () {
            var workspace = workspaceContextService.getWorkspace();
            return testObject.updateValue('launch', { 'version': '1.0.0', configurations: [{ 'name': 'myLaunch' }] }, { resource: workspace.folders[0].uri }, configuration_1.ConfigurationTarget.WORKSPACE, true)
                .then(function () { return assert.deepEqual(testObject.getValue('launch'), { 'version': '1.0.0', configurations: [{ 'name': 'myLaunch' }] }); });
        });
        test('task configurations are not read from workspace', function () {
            return jsonEditingServce.write(workspaceContextService.getWorkspace().configuration, { key: 'tasks', value: { 'version': '1.0' } }, true)
                .then(function () { return testObject.reloadConfiguration(); })
                .then(function () {
                var actual = testObject.inspect('tasks.version');
                assert.equal(actual.workspace, void 0);
            });
        });
    });
});
