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
define(["require", "exports", "assert", "sinon", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/storage/common/storageService", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment"], function (require, exports, assert, sinon, extensionManagement_1, extensionEnablementService_1, instantiationServiceMock_1, event_1, storageService_1, storage_1, workspace_1, environment_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function storageService(instantiationService) {
        var service = instantiationService.get(storage_1.IStorageService);
        if (!service) {
            var workspaceContextService = instantiationService.get(workspace_1.IWorkspaceContextService);
            if (!workspaceContextService) {
                workspaceContextService = instantiationService.stub(workspace_1.IWorkspaceContextService, {
                    getWorkbenchState: function () { return workspace_1.WorkbenchState.FOLDER; },
                });
            }
            service = instantiationService.stub(storage_1.IStorageService, instantiationService.createInstance(storageService_1.StorageService, new storageService_1.InMemoryLocalStorage(), new storageService_1.InMemoryLocalStorage()));
        }
        return service;
    }
    var TestExtensionEnablementService = /** @class */ (function (_super) {
        __extends(TestExtensionEnablementService, _super);
        function TestExtensionEnablementService(instantiationService) {
            return _super.call(this, storageService(instantiationService), instantiationService.get(workspace_1.IWorkspaceContextService), instantiationService.get(environment_1.IEnvironmentService) || instantiationService.stub(environment_1.IEnvironmentService, {}), instantiationService.get(extensionManagement_1.IExtensionManagementService) || instantiationService.stub(extensionManagement_1.IExtensionManagementService, { onDidUninstallExtension: new event_1.Emitter() })) || this;
        }
        TestExtensionEnablementService.prototype.reset = function () {
            var _this = this;
            return this.getDisabledExtensions().then(function (extensions) { return extensions.forEach(function (d) { return _this.setEnablement(aLocalExtension(d.id), extensionManagement_1.EnablementState.Enabled); }); });
        };
        return TestExtensionEnablementService;
    }(extensionEnablementService_1.ExtensionEnablementService));
    exports.TestExtensionEnablementService = TestExtensionEnablementService;
    suite('ExtensionEnablementService Test', function () {
        var instantiationService;
        var testObject;
        var didUninstallEvent = new event_1.Emitter();
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, { onDidUninstallExtension: didUninstallEvent.event });
            testObject = new TestExtensionEnablementService(instantiationService);
        });
        teardown(function () {
            testObject.dispose();
        });
        test('test when no extensions are disabled', function () {
            return testObject.getDisabledExtensions().then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test when no extensions are disabled for workspace when there is no workspace', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkbenchState', workspace_1.WorkbenchState.EMPTY);
                return testObject.getDisabledExtensions().then(function (extensions) { return assert.deepEqual([], extensions); });
            });
        });
        test('test disable an extension globally', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([{ id: 'pub.a' }], extensions); });
        });
        test('test disable an extension globally should return truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function (value) { return assert.ok(value); });
        });
        test('test disable an extension globally triggers the change event', function () {
            var target = sinon.spy();
            testObject.onEnablementChanged(target);
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return assert.ok(target.calledWithExactly({ id: 'pub.a', uuid: void 0 })); });
        });
        test('test disable an extension globally again should return a falsy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function (value) { return assert.ok(!value); });
        });
        test('test state of globally disabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Disabled); });
        });
        test('test state of globally enabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Enabled); });
        });
        test('test disable an extension for workspace', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([{ id: 'pub.a' }], extensions); });
        });
        test('test disable an extension for workspace returns a truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function (value) { return assert.ok(value); });
        });
        test('test disable an extension for workspace again should return a falsy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function (value) { return assert.ok(!value); });
        });
        test('test state of workspace disabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.WorkspaceDisabled); });
        });
        test('test state of workspace and globally disabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.WorkspaceDisabled); });
        });
        test('test state of workspace enabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.WorkspaceEnabled); });
        });
        test('test state of globally disabled and workspace enabled extension', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.WorkspaceEnabled); });
        });
        test('test state of an extension when disabled for workspace from workspace enabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.WorkspaceDisabled); });
        });
        test('test state of an extension when disabled globally from workspace enabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Disabled); });
        });
        test('test state of an extension when disabled globally from workspace disabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Disabled); });
        });
        test('test state of an extension when enabled globally from workspace enabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Enabled); });
        });
        test('test state of an extension when enabled globally from workspace disabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return assert.equal(testObject.getEnablementState({ id: 'pub.a' }), extensionManagement_1.EnablementState.Enabled); });
        });
        test('test disable an extension for workspace and then globally', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([{ id: 'pub.a' }], extensions); });
        });
        test('test disable an extension for workspace and then globally return a truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function (value) { return assert.ok(value); });
        });
        test('test disable an extension for workspace and then globally trigger the change event', function () {
            var target = sinon.spy();
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.onEnablementChanged(target); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return assert.ok(target.calledWithExactly({ id: 'pub.a', uuid: void 0 })); });
        });
        test('test disable an extension globally and then for workspace', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([{ id: 'pub.a' }], extensions); });
        });
        test('test disable an extension globally and then for workspace return a truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function (value) { return assert.ok(value); });
        });
        test('test disable an extension globally and then for workspace triggers the change event', function () {
            var target = sinon.spy();
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.onEnablementChanged(target); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return assert.ok(target.calledWithExactly({ id: 'pub.a', uuid: void 0 })); });
        });
        test('test disable an extension for workspace when there is no workspace throws error', function (done) {
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkbenchState', workspace_1.WorkbenchState.EMPTY);
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return assert.fail('should throw an error'); }, function (error) { return assert.ok(error); })
                .then(done, done);
        });
        test('test enable an extension globally', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test enable an extension globally return truthy promise', function (done) {
            testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function (value) { return assert.ok(value); })
                .then(done, done);
        });
        test('test enable an extension globally triggers change event', function (done) {
            var target = sinon.spy();
            testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return testObject.onEnablementChanged(target); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return assert.ok(target.calledWithExactly({ id: 'pub.a', uuid: void 0 })); })
                .then(done, done);
        });
        test('test enable an extension globally when already enabled return falsy promise', function (done) {
            testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled)
                .then(function (value) { return assert.ok(!value); })
                .then(done, done);
        });
        test('test enable an extension for workspace', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test enable an extension for workspace return truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function (value) { return assert.ok(value); });
        });
        test('test enable an extension for workspace triggers change event', function () {
            var target = sinon.spy();
            return testObject.setEnablement(aLocalExtension('pub.b'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.onEnablementChanged(target); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.b'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return assert.ok(target.calledWithExactly({ id: 'pub.b', uuid: void 0 })); });
        });
        test('test enable an extension for workspace when already enabled return truthy promise', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled)
                .then(function (value) { return assert.ok(value); });
        });
        test('test enable an extension for workspace when disabled in workspace and gloablly', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceEnabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test enable an extension globally when disabled in workspace and gloablly', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test remove an extension from disablement list when uninstalled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return didUninstallEvent.fire({ identifier: { id: 'pub.a-1.0.0' } }); })
                .then(function () { return testObject.getDisabledExtensions(); })
                .then(function (extensions) { return assert.deepEqual([], extensions); });
        });
        test('test isEnabled return false extension is disabled globally', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return assert.ok(!testObject.isEnabled({ id: 'pub.a' })); });
        });
        test('test isEnabled return false extension is disabled in workspace', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return assert.ok(!testObject.isEnabled({ id: 'pub.a' })); });
        });
        test('test isEnabled return true extension is not disabled', function () {
            return testObject.setEnablement(aLocalExtension('pub.a'), extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () { return testObject.setEnablement(aLocalExtension('pub.c'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return assert.ok(testObject.isEnabled({ id: 'pub.b' })); });
        });
        test('test canChangeEnablement return false for language packs', function () {
            assert.equal(testObject.canChangeEnablement(aLocalExtension('pub.a', { localizations: [{ languageId: 'gr', translations: [{ id: 'vscode', path: 'path' }] }] })), false);
        });
    });
    function aLocalExtension(id, contributes) {
        var _a = id.split('.'), publisher = _a[0], name = _a[1];
        return Object.create({
            identifier: { id: id },
            manifest: {
                name: name,
                publisher: publisher,
                contributes: contributes
            }
        });
    }
});
