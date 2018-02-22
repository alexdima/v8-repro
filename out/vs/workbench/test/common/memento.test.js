/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/storage/common/storageService", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, storage_1, memento_1, storageService_1, testWorkspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench Memento', function () {
        var context = undefined;
        var storage;
        setup(function () {
            storage = new storageService_1.StorageService(new storageService_1.InMemoryLocalStorage(), null, testWorkspace_1.TestWorkspace.id);
        });
        test('Loading and Saving Memento with Scopes', function () {
            var myMemento = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage);
            memento.foo = [1, 2, 3];
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage);
            assert.deepEqual(memento, { foo: [1, 2, 3] });
            globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World' });
            // Assert the Mementos are stored properly in storage
            assert.deepEqual(JSON.parse(storage.get('memento/memento.test')), { foo: [1, 2, 3] });
            assert.deepEqual(JSON.parse(storage.get('memento/memento.test', storage_1.StorageScope.WORKSPACE)), { foo: 'Hello World' });
            // Delete Global
            memento = myMemento.getMemento(storage, context);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            delete memento.foo;
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, {});
            // Assert the Mementos are also removed from storage
            assert.strictEqual(storage.get('memento/memento.test', storage_1.StorageScope.GLOBAL, null), null);
            assert.strictEqual(storage.get('memento/memento.test', storage_1.StorageScope.WORKSPACE, null), null);
        });
        test('Save and Load', function () {
            var myMemento = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage, context);
            memento.foo = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3] });
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World' });
            // Global
            memento = myMemento.getMemento(storage, context);
            memento.foo = [4, 5, 6];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'World Hello';
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [4, 5, 6] });
            globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'World Hello' });
            // Delete Global
            memento = myMemento.getMemento(storage, context);
            delete memento.foo;
            // Delete Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            delete memento.foo;
            myMemento.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, {});
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, {});
        });
        test('Save and Load - 2 Components with same id', function () {
            var myMemento = new memento_1.Memento('memento.test');
            var myMemento2 = new memento_1.Memento('memento.test');
            // Global
            var memento = myMemento.getMemento(storage, context);
            memento.foo = [1, 2, 3];
            memento = myMemento2.getMemento(storage, context);
            memento.bar = [1, 2, 3];
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.foo = 'Hello World';
            memento = myMemento2.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert(memento);
            memento.bar = 'Hello World';
            myMemento.saveMemento();
            myMemento2.saveMemento();
            // Global
            memento = myMemento.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            var globalMemento = myMemento.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            memento = myMemento2.getMemento(storage, context);
            assert.deepEqual(memento, { foo: [1, 2, 3], bar: [1, 2, 3] });
            globalMemento = myMemento2.getMemento(storage, memento_1.Scope.GLOBAL);
            assert.deepEqual(globalMemento, memento);
            // Workspace
            memento = myMemento.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
            memento = myMemento2.getMemento(storage, memento_1.Scope.WORKSPACE);
            assert.deepEqual(memento, { foo: 'Hello World', bar: 'Hello World' });
        });
    });
});
