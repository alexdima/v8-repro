/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/objects", "vs/base/common/uuid", "vs/base/common/winjs.base", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/parts/extensions/browser/extensionsActions", "vs/workbench/parts/extensions/node/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionManagementService", "vs/workbench/parts/extensions/electron-browser/extensionTipsService", "vs/platform/extensionManagement/test/common/extensionEnablementService.test", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/test/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/windows/common/windows"], function (require, exports, assert, objects_1, uuid_1, winjs_base_1, extensions_1, ExtensionsActions, extensionsWorkbenchService_1, extensionManagement_1, extensionManagementUtil_1, extensionManagementService_1, extensionTipsService_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, extensions_2, workspace_1, workbenchTestServices_1, configuration_1, log_1, windows_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsActions Test', function () {
        var instantiationService;
        var installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        suiteSetup(function () {
            installEvent = new event_1.Emitter();
            didInstallEvent = new event_1.Emitter();
            uninstallEvent = new event_1.Emitter();
            didUninstallEvent = new event_1.Emitter();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(url_1.IURLService, { onOpenURL: new event_1.Emitter().event });
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(log_1.ILogService, log_1.NullLogService);
            instantiationService.stub(windows_1.IWindowService, workbenchTestServices_1.TestWindowService);
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            instantiationService.stub(configuration_1.IConfigurationService, { onDidUpdateConfiguration: function () { }, onDidChangeConfiguration: function () { }, getConfiguration: function () { return ({}); } });
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, extensionManagementService_1.ExtensionManagementService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onInstallExtension', installEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidInstallExtension', didInstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onUninstallExtension', uninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidUninstallExtension', didUninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, extensionTipsService_1.ExtensionTipsService);
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, 'getKeymapRecommendations', function () { return []; });
        });
        setup(function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getExtensionsReport', []);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage());
            instantiationService.stub(extensions_2.IExtensionService, { getExtensions: function () { return winjs_base_1.TPromise.wrap([]); } });
            instantiationService.get(extensionManagement_1.IExtensionEnablementService).reset();
            instantiationService.set(extensions_1.IExtensionsWorkbenchService, instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService));
        });
        teardown(function () {
            instantiationService.get(extensions_1.IExtensionsWorkbenchService).dispose();
        });
        test('Install action is disabled when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            assert.ok(!testObject.enabled);
        });
        test('Test Install action when state is installed', function () {
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return workbenchService.queryLocal()
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier })));
                return workbenchService.queryGallery()
                    .then(function (paged) {
                    testObject.extension = paged.firstPage[0];
                    assert.ok(!testObject.enabled);
                    assert.equal('Install', testObject.label);
                    assert.equal('extension-action prominent install', testObject.class);
                });
            });
        });
        test('Test Install action when state is installing', function () {
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return workbenchService.queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
                assert.equal('Installing', testObject.label);
                assert.equal('extension-action install installing', testObject.class);
            });
        });
        test('Test Install action when state is uninstalled', function () {
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return workbenchService.queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                assert.ok(testObject.enabled);
                assert.equal('Install', testObject.label);
            });
        });
        test('Test Install action when extension is system action', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                uninstallEvent.fire(local.identifier);
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test Install action when extension doesnot has gallery', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.InstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                uninstallEvent.fire(local.identifier);
                didUninstallEvent.fire({ identifier: local.identifier });
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Uninstall action is disabled when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UninstallAction);
            assert.ok(!testObject.enabled);
        });
        test('Test Uninstall action when state is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UninstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
                assert.equal('Uninstalling', testObject.label);
                assert.equal('extension-action uninstall uninstalling', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is user extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UninstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.equal('Uninstall', testObject.label);
                assert.equal('extension-action uninstall', testObject.class);
            });
        });
        test('Test Uninstall action when state is installed and is system extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UninstallAction);
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
                assert.equal('Uninstall', testObject.label);
                assert.equal('extension-action uninstall', testObject.class);
            });
        });
        test('Test Uninstall action after extension is installed', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UninstallAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                assert.ok(testObject.enabled);
                assert.equal('Uninstall', testObject.label);
                assert.equal('extension-action uninstall', testObject.class);
            });
        });
        test('Test CombinedInstallAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            assert.ok(!testObject.enabled);
            assert.equal('extension-action prominent install no-extension', testObject.class);
        });
        test('Test CombinedInstallAction when extension is system extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
                assert.equal('extension-action prominent install no-extension', testObject.class);
            });
        });
        test('Test CombinedInstallAction when installAction is enabled', function () {
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return workbenchService.queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                assert.ok(testObject.enabled);
                assert.equal('Install', testObject.label);
                assert.equal('extension-action prominent install', testObject.class);
            });
        });
        test('Test CombinedInstallAction when unInstallAction is enabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.equal('Uninstall', testObject.label);
                assert.equal('extension-action uninstall', testObject.class);
            });
        });
        test('Test CombinedInstallAction when state is installing', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return workbenchService.queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
                assert.equal('Installing', testObject.label);
                assert.equal('extension-action install installing', testObject.class);
            });
        });
        test('Test CombinedInstallAction when state is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.CombinedInstallAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
                assert.equal('Uninstalling', testObject.label);
                assert.equal('extension-action uninstall uninstalling', testObject.class);
            });
        });
        test('Test UpdateAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            assert.ok(!testObject.enabled);
        });
        test('Test UpdateAction when extension is uninstalled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            var gallery = aGalleryExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test UpdateAction when extension is installed and not outdated', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            var local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: local.manifest.version })));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                    .then(function (extensions) { return assert.ok(!testObject.enabled); });
            });
        });
        test('Test UpdateAction when extension is installed outdated and system extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            var local = aLocalExtension('a', { version: '1.0.0' }, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' })));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                    .then(function (extensions) { return assert.ok(!testObject.enabled); });
            });
        });
        test('Test UpdateAction when extension is installed outdated and user extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            var local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' })));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                    .then(function (extensions) { return assert.ok(testObject.enabled); });
            });
        });
        test('Test UpdateAction when extension is installing and outdated and user extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAction);
            var local = aLocalExtension('a', { version: '1.0.0' });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                var gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.1' });
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                    .then(function (extensions) {
                    installEvent.fire({ identifier: local.identifier, gallery: gallery });
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test ManageExtensionAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            assert.ok(!testObject.enabled);
        });
        test('Test ManageExtensionAction when extension is installed', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
                assert.equal('extension-action manage', testObject.class);
                assert.equal('', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
                assert.equal('extension-action manage hide', testObject.class);
                assert.equal('', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is installing', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
                assert.equal('extension-action manage hide', testObject.class);
                assert.equal('', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is queried from gallery and installed', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                assert.ok(testObject.enabled);
                assert.equal('extension-action manage', testObject.class);
                assert.equal('', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is system extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
                assert.equal('extension-action manage hide', testObject.class);
                assert.equal('', testObject.tooltip);
            });
        });
        test('Test ManageExtensionAction when extension is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ManageExtensionAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
                assert.equal('extension-action manage', testObject.class);
                assert.equal('Uninstalling', testObject.tooltip);
            });
        });
        test('Test EnableForWorkspaceAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction, 'id');
            assert.ok(!testObject.enabled);
        });
        test('Test EnableForWorkspaceAction when there extension is not disabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction, 'id');
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when extension is disabled for workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableForWorkspaceAction when the extension is disabled globally and workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableForWorkspaceAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableGloballyAction, 'id');
            assert.ok(!testObject.enabled);
        });
        test('Test EnableGloballyAction when the extension is not disabled', function () {
            var local = aLocalExtension('a');
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableGloballyAction, 'id');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableGloballyAction when the extension is disabled for workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableGloballyAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableGloballyAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableGloballyAction when the extension is disabled in both', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableGloballyAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
            assert.ok(!testObject.enabled);
        });
        test('Test EnableAction when extension is installed and enabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableAction when extension is installed and disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableAction when extension is installed and disabled for workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test EnableAction when extension is uninstalled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableAction when extension is installing', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test EnableAction when extension is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.EnableAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableForWorkspaceAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction, 'id');
            assert.ok(!testObject.enabled);
        });
        test('Test DisableForWorkspaceAction when the extension is disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when the extension is disabled workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableForWorkspaceAction when extension is enabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableForWorkspaceAction, 'id');
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableGloballyAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableGloballyAction, 'id');
            assert.ok(!testObject.enabled);
        });
        test('Test DisableGloballyAction when the extension is disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableGloballyAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is disabled for workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableGloballyAction, 'id');
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableGloballyAction when the extension is enabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableGloballyAction, 'id');
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
            assert.ok(!testObject.enabled);
        });
        test('Test DisableAction when extension is installed and enabled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                assert.ok(testObject.enabled);
            });
        });
        test('Test DisableAction when extension is installed and disabled globally', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableAction when extension is installed and disabled for workspace', function () {
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test DisableAction when extension is uninstalled', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableAction when extension is installing', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (page) {
                testObject.extension = page.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test DisableAction when extension is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.DisableAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
            });
        });
        test('Test UpdateAllAction when no installed extensions', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAllAction, 'id', 'label');
            assert.ok(!testObject.enabled);
        });
        test('Test UpdateAllAction when installed extensions are not outdated', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAllAction, 'id', 'label');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a'), aLocalExtension('b')]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) { return assert.ok(!testObject.enabled); });
        });
        test('Test UpdateAllAction when some installed extensions are outdated', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAllAction, 'id', 'label');
            var local = [aLocalExtension('a', { version: '1.0.1' }), aLocalExtension('b', { version: '1.0.1' }), aLocalExtension('c', { version: '1.0.1' })];
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', local);
            return workbenchService.queryLocal()
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', { identifier: local[0].identifier, version: '1.0.2' }), aGalleryExtension('b', { identifier: local[1].identifier, version: '1.0.2' }), aGalleryExtension('c', local[2].manifest)));
                return workbenchService.queryGallery()
                    .then(function () { return assert.ok(testObject.enabled); });
            });
        });
        test('Test UpdateAllAction when some installed extensions are outdated and some outdated are being installed', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAllAction, 'id', 'label');
            var local = [aLocalExtension('a', { version: '1.0.1' }), aLocalExtension('b', { version: '1.0.1' }), aLocalExtension('c', { version: '1.0.1' })];
            var gallery = [aGalleryExtension('a', { identifier: local[0].identifier, version: '1.0.2' }), aGalleryExtension('b', { identifier: local[1].identifier, version: '1.0.2' }), aGalleryExtension('c', local[2].manifest)];
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', local);
            return workbenchService.queryLocal()
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage.apply(void 0, gallery));
                return workbenchService.queryGallery()
                    .then(function () {
                    installEvent.fire({ identifier: local[0].identifier, gallery: gallery[0] });
                    assert.ok(testObject.enabled);
                });
            });
        });
        test('Test UpdateAllAction when some installed extensions are outdated and all outdated are being installed', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.UpdateAllAction, 'id', 'label');
            var local = [aLocalExtension('a', { version: '1.0.1' }), aLocalExtension('b', { version: '1.0.1' }), aLocalExtension('c', { version: '1.0.1' })];
            var gallery = [aGalleryExtension('a', { identifier: local[0].identifier, version: '1.0.2' }), aGalleryExtension('b', { identifier: local[1].identifier, version: '1.0.2' }), aGalleryExtension('c', local[2].manifest)];
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', local);
            return workbenchService.queryLocal()
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage.apply(void 0, gallery));
                return workbenchService.queryGallery()
                    .then(function () {
                    installEvent.fire({ identifier: local[0].identifier, gallery: gallery[0] });
                    installEvent.fire({ identifier: local[1].identifier, gallery: gallery[1] });
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test ReloadAction when there is no extension', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            assert.ok(!testObject.enabled);
        });
        test('Test ReloadAction when extension state is installing', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return workbenchService.queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test ReloadAction when extension state is uninstalling', function () {
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                assert.ok(!testObject.enabled);
            });
        });
        test('Test ReloadAction when extension is newly installed', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                assert.ok(testObject.enabled);
                assert.equal('Reload to activate', testObject.tooltip);
                assert.equal("Reload this window to activate the extension 'a'?", testObject.reloadMessage);
            });
        });
        test('Test ReloadAction when extension is installed and uninstalled', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var gallery = aGalleryExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryGallery()
                .then(function (paged) {
                testObject.extension = paged.firstPage[0];
                var identifier = { id: extensionManagementService_1.getLocalExtensionIdFromGallery(gallery, gallery.version) };
                installEvent.fire({ identifier: identifier, gallery: gallery });
                didInstallEvent.fire({ identifier: identifier, gallery: gallery, local: aLocalExtension('a', gallery, { identifier: identifier }) });
                uninstallEvent.fire(identifier);
                didUninstallEvent.fire({ identifier: identifier });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test ReloadAction when extension is uninstalled', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.a' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                didUninstallEvent.fire({ identifier: local.identifier });
                assert.ok(testObject.enabled);
                assert.equal('Reload to deactivate', testObject.tooltip);
                assert.equal("Reload this window to deactivate the uninstalled extension 'a'?", testObject.reloadMessage);
            });
        });
        test('Test ReloadAction when extension is uninstalled and installed', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.a', version: '1.0.0' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return instantiationService.get(extensions_1.IExtensionsWorkbenchService).queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                uninstallEvent.fire(local.identifier);
                didUninstallEvent.fire({ identifier: local.identifier });
                var gallery = aGalleryExtension('a');
                var id = extensionManagementService_1.getLocalExtensionIdFromGallery(gallery, gallery.version);
                installEvent.fire({ identifier: { id: id }, gallery: gallery });
                didInstallEvent.fire({ identifier: { id: id }, gallery: gallery, local: local });
                assert.ok(!testObject.enabled);
            });
        });
        test('Test ReloadAction when extension is updated while running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.a', version: '1.0.1' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a', { version: '1.0.1' });
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return workbenchService.queryLocal()
                .then(function (extensions) {
                testObject.extension = extensions[0];
                var gallery = aGalleryExtension('a', { uuid: local.identifier.id, version: '1.0.2' });
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                assert.ok(testObject.enabled);
                assert.equal('Reload to update', testObject.tooltip);
                assert.equal("Reload this window to activate the updated extension 'a'?", testObject.reloadMessage);
            });
        });
        test('Test ReloadAction when extension is updated when not running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var local = aLocalExtension('a', { version: '1.0.1' });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
                var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return workbenchService.queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    var gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.2' });
                    installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                    didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                    assert.ok(!testObject.enabled);
                });
            });
        });
        test('Test ReloadAction when extension is disabled when running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.a' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a');
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return workbenchService.queryLocal().then(function (extensions) {
                testObject.extension = extensions[0];
                return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.ok(testObject.enabled);
                    assert.equal('Reload to deactivate', testObject.tooltip);
                    assert.equal("Reload this window to deactivate the extension 'a'?", testObject.reloadMessage);
                });
            });
        });
        test('Test ReloadAction when extension enablement is toggled when running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.a', version: '1.0.0' }]);
            var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
            var local = aLocalExtension('a');
            var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            return workbenchService.queryLocal().
                then(function (extensions) {
                testObject.extension = extensions[0];
                return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () { return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Enabled); })
                    .then(function () { return assert.ok(!testObject.enabled); });
            });
        });
        test('Test ReloadAction when extension is enabled when not running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
                var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return workbenchService.queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Enabled)
                        .then(function () {
                        assert.ok(testObject.enabled);
                        assert.equal('Reload to activate', testObject.tooltip);
                        assert.equal("Reload this window to activate the extension 'a'?", testObject.reloadMessage);
                    });
                });
            });
        });
        test('Test ReloadAction when extension enablement is toggled when not running', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var local = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
                var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return workbenchService.queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Enabled)
                        .then(function () { return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Disabled); })
                        .then(function () { return assert.ok(!testObject.enabled); });
                });
            });
        });
        test('Test ReloadAction when extension is updated when not running and enabled', function () {
            instantiationService.stubPromise(extensions_2.IExtensionService, 'getExtensions', [{ id: 'pub.b' }]);
            var local = aLocalExtension('a', { version: '1.0.1' });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(local, extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var testObject = instantiationService.createInstance(ExtensionsActions.ReloadAction);
                var workbenchService = instantiationService.get(extensions_1.IExtensionsWorkbenchService);
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
                return workbenchService.queryLocal()
                    .then(function (extensions) {
                    testObject.extension = extensions[0];
                    var gallery = aGalleryExtension('a', { identifier: local.identifier, version: '1.0.2' });
                    installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                    didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension('a', gallery, gallery) });
                    return workbenchService.setEnablement(extensions[0], extensionManagement_1.EnablementState.Enabled)
                        .then(function () {
                        assert.ok(testObject.enabled);
                        assert.equal('Reload to activate', testObject.tooltip);
                        assert.equal("Reload this window to activate the extension 'a'?", testObject.reloadMessage);
                    });
                });
            });
        });
        function aLocalExtension(name, manifest, properties) {
            if (name === void 0) { name = 'someext'; }
            if (manifest === void 0) { manifest = {}; }
            if (properties === void 0) { properties = {}; }
            var localExtension = Object.create({ manifest: {} });
            objects_1.assign(localExtension, { type: extensionManagement_1.LocalExtensionType.User, manifest: {} }, properties);
            objects_1.assign(localExtension.manifest, { name: name, publisher: 'pub', version: '1.0.0' }, manifest);
            localExtension.identifier = { id: extensionManagementService_1.getLocalExtensionIdFromManifest(localExtension.manifest) };
            localExtension.metadata = { id: localExtension.identifier.id, publisherId: localExtension.manifest.publisher, publisherDisplayName: 'somename' };
            return localExtension;
        }
        function aGalleryExtension(name, properties, galleryExtensionProperties, assets) {
            if (properties === void 0) { properties = {}; }
            if (galleryExtensionProperties === void 0) { galleryExtensionProperties = {}; }
            if (assets === void 0) { assets = {}; }
            var galleryExtension = Object.create({});
            objects_1.assign(galleryExtension, { name: name, publisher: 'pub', version: '1.0.0', properties: {}, assets: {} }, properties);
            objects_1.assign(galleryExtension.properties, { dependencies: [] }, galleryExtensionProperties);
            objects_1.assign(galleryExtension.assets, assets);
            galleryExtension.identifier = { id: extensionManagementUtil_1.getGalleryExtensionId(galleryExtension.publisher, galleryExtension.name), uuid: uuid_1.generateUuid() };
            return galleryExtension;
        }
        function aPage() {
            var objects = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                objects[_i] = arguments[_i];
            }
            return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: function () { return null; } };
        }
    });
});
