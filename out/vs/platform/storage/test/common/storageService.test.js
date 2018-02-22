/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storageService", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, instantiationServiceMock_1, storage_1, workspace_1, storageService_1, testWorkspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench StorageSevice', function () {
        var contextService;
        var instantiationService;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            contextService = instantiationService.stub(workspace_1.IWorkspaceContextService, {
                getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; },
                getWorkspace: function () {
                    return testWorkspace_1.TestWorkspace;
                }
            });
        });
        test('Remove Data', function () {
            var s = new storageService_1.StorageService(new storageService_1.InMemoryLocalStorage(), null, contextService.getWorkspace().id);
            s.store('Monaco.IDE.Core.Storage.Test.remove', 'foobar');
            assert.strictEqual('foobar', s.get('Monaco.IDE.Core.Storage.Test.remove'));
            s.remove('Monaco.IDE.Core.Storage.Test.remove');
            assert.ok(!s.get('Monaco.IDE.Core.Storage.Test.remove'));
        });
        test('Get Data, Integer, Boolean', function () {
            var s = new storageService_1.StorageService(new storageService_1.InMemoryLocalStorage(), null, contextService.getWorkspace().id);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get', storage_1.StorageScope.GLOBAL, 'foobar'), 'foobar');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get', storage_1.StorageScope.GLOBAL, ''), '');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getInteger', storage_1.StorageScope.GLOBAL, 5), 5);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getInteger', storage_1.StorageScope.GLOBAL, 0), 0);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getBoolean', storage_1.StorageScope.GLOBAL, true), true);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getBoolean', storage_1.StorageScope.GLOBAL, false), false);
            s.store('Monaco.IDE.Core.Storage.Test.get', 'foobar');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get'), 'foobar');
            s.store('Monaco.IDE.Core.Storage.Test.get', '');
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.get'), '');
            s.store('Monaco.IDE.Core.Storage.Test.getInteger', 5);
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getInteger'), 5);
            s.store('Monaco.IDE.Core.Storage.Test.getInteger', 0);
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getInteger'), 0);
            s.store('Monaco.IDE.Core.Storage.Test.getBoolean', true);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBoolean'), true);
            s.store('Monaco.IDE.Core.Storage.Test.getBoolean', false);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBoolean'), false);
            assert.strictEqual(s.get('Monaco.IDE.Core.Storage.Test.getDefault', storage_1.StorageScope.GLOBAL, 'getDefault'), 'getDefault');
            assert.strictEqual(s.getInteger('Monaco.IDE.Core.Storage.Test.getIntegerDefault', storage_1.StorageScope.GLOBAL, 5), 5);
            assert.strictEqual(s.getBoolean('Monaco.IDE.Core.Storage.Test.getBooleanDefault', storage_1.StorageScope.GLOBAL, true), true);
        });
        test('StorageSevice cleans up when workspace changes', function () {
            var storageImpl = new storageService_1.InMemoryLocalStorage();
            var time = new Date().getTime();
            var s = new storageService_1.StorageService(storageImpl, null, contextService.getWorkspace().id, time);
            s.store('key1', 'foobar');
            s.store('key2', 'something');
            s.store('wkey1', 'foo', storage_1.StorageScope.WORKSPACE);
            s.store('wkey2', 'foo2', storage_1.StorageScope.WORKSPACE);
            s = new storageService_1.StorageService(storageImpl, null, contextService.getWorkspace().id, time);
            assert.strictEqual(s.get('key1', storage_1.StorageScope.GLOBAL), 'foobar');
            assert.strictEqual(s.get('key1', storage_1.StorageScope.WORKSPACE, null), null);
            assert.strictEqual(s.get('key2', storage_1.StorageScope.GLOBAL), 'something');
            assert.strictEqual(s.get('wkey1', storage_1.StorageScope.WORKSPACE), 'foo');
            assert.strictEqual(s.get('wkey2', storage_1.StorageScope.WORKSPACE), 'foo2');
            s = new storageService_1.StorageService(storageImpl, null, contextService.getWorkspace().id, time + 100);
            assert.strictEqual(s.get('key1', storage_1.StorageScope.GLOBAL), 'foobar');
            assert.strictEqual(s.get('key1', storage_1.StorageScope.WORKSPACE, null), null);
            assert.strictEqual(s.get('key2', storage_1.StorageScope.GLOBAL), 'something');
            assert(!s.get('wkey1', storage_1.StorageScope.WORKSPACE));
            assert(!s.get('wkey2', storage_1.StorageScope.WORKSPACE));
        });
    });
});
