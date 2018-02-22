/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/storage/common/storageService", "vs/platform/storage/common/migration", "vs/base/common/uri", "vs/platform/storage/common/storage", "vs/base/common/strings"], function (require, exports, assert, storageService_1, migration_1, uri_1, storage_1, strings_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Storage Migration', function () {
        var storage = window.localStorage;
        setup(function () {
            storage.clear();
        });
        teardown(function () {
            storage.clear();
        });
        test('Parse Storage (Global)', function () {
            var service = createService();
            var parsed = migration_1.parseStorage(storage);
            assert.equal(parsed.global.size, 4);
            assert.equal(parsed.global.get('key1'), service.get('key1'));
            assert.equal(parsed.global.get('key2.something'), service.get('key2.something'));
            assert.equal(parsed.global.get('key3/special'), service.get('key3/special'));
            assert.equal(parsed.global.get('key4 space'), service.get('key4 space'));
        });
        test('Parse Storage (mixed)', function () {
            // Fill the storage with multiple workspaces of all kinds (empty, root, folders)
            var workspaceIds = [
                // Multi Root Workspace
                uri_1.default.from({ path: '1500007676869', scheme: 'root' }).toString(),
                uri_1.default.from({ path: '2500007676869', scheme: 'root' }).toString(),
                uri_1.default.from({ path: '3500007676869', scheme: 'root' }).toString(),
                // Empty Workspace
                uri_1.default.from({ path: '4500007676869', scheme: 'empty' }).toString(),
                uri_1.default.from({ path: '5500007676869', scheme: 'empty' }).toString(),
                uri_1.default.from({ path: '6500007676869', scheme: 'empty' }).toString(),
                // Unix Paths
                uri_1.default.file('/some/folder/folder1').toString(),
                uri_1.default.file('/some/folder/folder2').toString(),
                uri_1.default.file('/some/folder/folder3').toString(),
                uri_1.default.file('/some/folder/folder1/sub1').toString(),
                uri_1.default.file('/some/folder/folder2/sub2').toString(),
                uri_1.default.file('/some/folder/folder3/sub3').toString(),
                // Windows Paths
                uri_1.default.file('c:\\some\\folder\\folder1').toString(),
                uri_1.default.file('c:\\some\\folder\\folder2').toString(),
                uri_1.default.file('c:\\some\\folder\\folder3').toString(),
                uri_1.default.file('c:\\some\\folder\\folder1\\sub1').toString(),
                uri_1.default.file('c:\\some\\folder\\folder2\\sub2').toString(),
                uri_1.default.file('c:\\some\\folder\\folder3\\sub3').toString(),
                // UNC Paths
                'file://localhost/c%3A/some/folder/folder1',
                'file://localhost/c%3A/some/folder/folder2',
                'file://localhost/c%3A/some/folder/folder3',
                'file://localhost/c%3A/some/folder/folder1/sub1',
                'file://localhost/c%3A/some/folder/folder2/sub2',
                'file://localhost/c%3A/some/folder/folder3/sub3'
            ];
            var services = workspaceIds.map(function (id) { return createService(id); });
            var parsed = migration_1.parseStorage(storage);
            services.forEach(function (service, index) {
                var expectedKeyCount = 4;
                var storageToTest;
                var workspaceId = workspaceIds[index];
                if (strings_1.startsWith(workspaceId, 'file:')) {
                    storageToTest = parsed.folder.get(workspaceId);
                    expectedKeyCount++; // workspaceIdentifier gets added!
                }
                else if (strings_1.startsWith(workspaceId, 'empty:')) {
                    storageToTest = parsed.empty.get(workspaceId);
                }
                else if (strings_1.startsWith(workspaceId, 'root:')) {
                    storageToTest = parsed.multiRoot.get(workspaceId);
                }
                assert.equal(Object.keys(storageToTest).length, expectedKeyCount);
                assert.equal(storageToTest['key1'], service.get('key1', storage_1.StorageScope.WORKSPACE));
                assert.equal(storageToTest['key2.something'], service.get('key2.something', storage_1.StorageScope.WORKSPACE));
                assert.equal(storageToTest['key3/special'], service.get('key3/special', storage_1.StorageScope.WORKSPACE));
                assert.equal(storageToTest['key4 space'], service.get('key4 space', storage_1.StorageScope.WORKSPACE));
            });
        });
        test('Parse Storage (handle subfolders properly)', function () {
            var ws1 = uri_1.default.file('/some/folder/folder1').toString();
            var ws2 = uri_1.default.file('/some/folder/folder1/sub1').toString();
            var s1 = new storageService_1.StorageService(storage, storage, ws1, Date.now());
            var s2 = new storageService_1.StorageService(storage, storage, ws2, Date.now());
            s1.store('s1key1', 'value1', storage_1.StorageScope.WORKSPACE);
            s1.store('s1key2.something', JSON.stringify({ foo: 'bar' }), storage_1.StorageScope.WORKSPACE);
            s1.store('s1key3/special', true, storage_1.StorageScope.WORKSPACE);
            s1.store('s1key4 space', 4, storage_1.StorageScope.WORKSPACE);
            s2.store('s2key1', 'value1', storage_1.StorageScope.WORKSPACE);
            s2.store('s2key2.something', JSON.stringify({ foo: 'bar' }), storage_1.StorageScope.WORKSPACE);
            s2.store('s2key3/special', true, storage_1.StorageScope.WORKSPACE);
            s2.store('s2key4 space', 4, storage_1.StorageScope.WORKSPACE);
            var parsed = migration_1.parseStorage(storage);
            var s1Storage = parsed.folder.get(ws1);
            assert.equal(Object.keys(s1Storage).length, 5);
            assert.equal(s1Storage['s1key1'], s1.get('s1key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(s1Storage['s1key2.something'], s1.get('s1key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(s1Storage['s1key3/special'], s1.get('s1key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(s1Storage['s1key4 space'], s1.get('s1key4 space', storage_1.StorageScope.WORKSPACE));
            var s2Storage = parsed.folder.get(ws2);
            assert.equal(Object.keys(s2Storage).length, 5);
            assert.equal(s2Storage['s2key1'], s2.get('s2key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(s2Storage['s2key2.something'], s2.get('s2key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(s2Storage['s2key3/special'], s2.get('s2key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(s2Storage['s2key4 space'], s2.get('s2key4 space', storage_1.StorageScope.WORKSPACE));
        });
        function createService(workspaceId) {
            var service = new storageService_1.StorageService(storage, storage, workspaceId, workspaceId && strings_1.startsWith(workspaceId, 'file:') ? Date.now() : void 0);
            // Unrelated
            storage.setItem('foo', 'bar');
            storage.setItem('storage://foo', 'bar');
            storage.setItem('storage://global/storage://foo', 'bar');
            // Global
            service.store('key1', 'value1');
            service.store('key2.something', JSON.stringify({ foo: 'bar' }));
            service.store('key3/special', true);
            service.store('key4 space', 4);
            // Workspace
            service.store('key1', 'value1', storage_1.StorageScope.WORKSPACE);
            service.store('key2.something', JSON.stringify({ foo: 'bar' }), storage_1.StorageScope.WORKSPACE);
            service.store('key3/special', true, storage_1.StorageScope.WORKSPACE);
            service.store('key4 space', 4, storage_1.StorageScope.WORKSPACE);
            return service;
        }
        test('Migrate Storage (folder (Unix) => multi root)', function () {
            var workspaceToMigrateFrom = uri_1.default.file('/some/folder/folder1').toString();
            createService(workspaceToMigrateFrom);
            var workspaceToMigrateTo = uri_1.default.from({ path: '1500007676869', scheme: 'root' }).toString();
            migration_1.migrateStorageToMultiRootWorkspace(workspaceToMigrateFrom, { id: '1500007676869', configPath: null }, storage);
            var s2 = new storageService_1.StorageService(storage, storage, workspaceToMigrateTo);
            var parsed = migration_1.parseStorage(storage);
            assert.equal(parsed.empty.size, 0);
            assert.equal(parsed.folder.size, 1);
            assert.equal(parsed.multiRoot.size, 1);
            var migratedStorage = parsed.multiRoot.get(workspaceToMigrateTo);
            assert.equal(Object.keys(migratedStorage).length, 4);
            assert.equal(migratedStorage['key1'], s2.get('key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key2.something'], s2.get('key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key3/special'], s2.get('key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key4 space'], s2.get('key4 space', storage_1.StorageScope.WORKSPACE));
        });
        test('Migrate Storage (folder (Windows) => multi root)', function () {
            var workspaceToMigrateFrom = uri_1.default.file('c:\\some\\folder\\folder1').toString();
            createService(workspaceToMigrateFrom);
            var workspaceToMigrateTo = uri_1.default.from({ path: '1500007676869', scheme: 'root' }).toString();
            migration_1.migrateStorageToMultiRootWorkspace(workspaceToMigrateFrom, { id: '1500007676869', configPath: null }, storage);
            var s2 = new storageService_1.StorageService(storage, storage, workspaceToMigrateTo);
            var parsed = migration_1.parseStorage(storage);
            assert.equal(parsed.empty.size, 0);
            assert.equal(parsed.folder.size, 1);
            assert.equal(parsed.multiRoot.size, 1);
            var migratedStorage = parsed.multiRoot.get(workspaceToMigrateTo);
            assert.equal(Object.keys(migratedStorage).length, 4);
            assert.equal(migratedStorage['key1'], s2.get('key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key2.something'], s2.get('key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key3/special'], s2.get('key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key4 space'], s2.get('key4 space', storage_1.StorageScope.WORKSPACE));
        });
        test('Migrate Storage (folder (Windows UNC) => multi root)', function () {
            var workspaceToMigrateFrom = 'file://localhost/c%3A/some/folder/folder1';
            createService(workspaceToMigrateFrom);
            var workspaceToMigrateTo = uri_1.default.from({ path: '1500007676869', scheme: 'root' }).toString();
            migration_1.migrateStorageToMultiRootWorkspace(workspaceToMigrateFrom, { id: '1500007676869', configPath: null }, storage);
            var s2 = new storageService_1.StorageService(storage, storage, workspaceToMigrateTo);
            var parsed = migration_1.parseStorage(storage);
            assert.equal(parsed.empty.size, 0);
            assert.equal(parsed.folder.size, 1);
            assert.equal(parsed.multiRoot.size, 1);
            var migratedStorage = parsed.multiRoot.get(workspaceToMigrateTo);
            assert.equal(Object.keys(migratedStorage).length, 4);
            assert.equal(migratedStorage['key1'], s2.get('key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key2.something'], s2.get('key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key3/special'], s2.get('key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key4 space'], s2.get('key4 space', storage_1.StorageScope.WORKSPACE));
        });
        test('Migrate Storage (empty => multi root)', function () {
            var workspaceToMigrateFrom = uri_1.default.from({ path: '1500007676869', scheme: 'empty' }).toString();
            createService(workspaceToMigrateFrom);
            var workspaceToMigrateTo = uri_1.default.from({ path: '2500007676869', scheme: 'root' }).toString();
            migration_1.migrateStorageToMultiRootWorkspace(workspaceToMigrateFrom, { id: '2500007676869', configPath: null }, storage);
            var s2 = new storageService_1.StorageService(storage, storage, workspaceToMigrateTo);
            var parsed = migration_1.parseStorage(storage);
            assert.equal(parsed.empty.size, 1);
            assert.equal(parsed.folder.size, 0);
            assert.equal(parsed.multiRoot.size, 1);
            var migratedStorage = parsed.multiRoot.get(workspaceToMigrateTo);
            assert.equal(Object.keys(migratedStorage).length, 4);
            assert.equal(migratedStorage['key1'], s2.get('key1', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key2.something'], s2.get('key2.something', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key3/special'], s2.get('key3/special', storage_1.StorageScope.WORKSPACE));
            assert.equal(migratedStorage['key4 space'], s2.get('key4 space', storage_1.StorageScope.WORKSPACE));
        });
    });
});
