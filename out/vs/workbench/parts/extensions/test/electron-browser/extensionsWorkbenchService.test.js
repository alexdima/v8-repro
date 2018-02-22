/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "fs", "vs/base/common/objects", "vs/base/common/winjs.base", "vs/base/common/uuid", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/parts/extensions/node/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionManagementService", "vs/workbench/parts/extensions/electron-browser/extensionTipsService", "vs/platform/extensionManagement/test/common/extensionEnablementService.test", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/workbenchTestServices", "vs/platform/message/common/message", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/windows/common/windows", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressService2"], function (require, exports, sinon, assert, fs, objects_1, winjs_base_1, uuid_1, extensions_1, extensionsWorkbenchService_1, extensionManagement_1, extensionManagementUtil_1, extensionManagementService_1, extensionTipsService_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, message_1, configuration_1, log_1, windows_1, progress_1, progressService2_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsWorkbenchService Test', function () {
        var instantiationService;
        var testObject;
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
            instantiationService.stub(progress_1.IProgressService2, progressService2_1.ProgressService2);
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService());
            instantiationService.stub(configuration_1.IConfigurationService, { onDidUpdateConfiguration: function () { }, onDidChangeConfiguration: function () { }, getConfiguration: function () { return ({}); } });
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, extensionManagementService_1.ExtensionManagementService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onInstallExtension', installEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidInstallExtension', didInstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onUninstallExtension', uninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidUninstallExtension', didUninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, extensionTipsService_1.ExtensionTipsService);
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, 'getKeymapRecommendations', function () { return []; });
            instantiationService.stub(message_1.IChoiceService, { choose: function () { return null; } });
        });
        setup(function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getExtensionsReport', []);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage());
            instantiationService.stubPromise(message_1.IChoiceService, 'choose', 0);
            instantiationService.get(extensionManagement_1.IExtensionEnablementService).reset();
        });
        teardown(function () {
            testObject.dispose();
        });
        test('test gallery extension', function () {
            var expected = aGalleryExtension('expectedName', {
                displayName: 'expectedDisplayName',
                version: '1.5',
                publisherId: 'expectedPublisherId',
                publisher: 'expectedPublisher',
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1', 'pub.2'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
            });
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(expected));
            return testObject.queryGallery().then(function (pagedResponse) {
                assert.equal(1, pagedResponse.firstPage.length);
                var actual = pagedResponse.firstPage[0];
                assert.equal(null, actual.type);
                assert.equal('expectedName', actual.name);
                assert.equal('expectedDisplayName', actual.displayName);
                assert.equal('expectedPublisher.expectedname', actual.id);
                assert.equal('expectedPublisher', actual.publisher);
                assert.equal('expectedPublisherDisplayName', actual.publisherDisplayName);
                assert.equal('1.5', actual.version);
                assert.equal('1.5', actual.latestVersion);
                assert.equal('expectedDescription', actual.description);
                assert.equal('uri:icon', actual.iconUrl);
                assert.equal('fallback:icon', actual.iconUrlFallback);
                assert.equal('uri:license', actual.licenseUrl);
                assert.equal(extensions_1.ExtensionState.Uninstalled, actual.state);
                assert.equal(1000, actual.installCount);
                assert.equal(4, actual.rating);
                assert.equal(100, actual.ratingCount);
                assert.equal(false, actual.outdated);
                assert.deepEqual(['pub.1', 'pub.2'], actual.dependencies);
            });
        });
        test('test for empty installed extensions', function () {
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            assert.deepEqual([], testObject.local);
        });
        test('test for installed extensions', function () {
            var expected1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: extensionManagement_1.LocalExtensionType.User,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                path: 'localPath1'
            });
            var expected2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: extensionManagement_1.LocalExtensionType.System,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [expected1, expected2]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var actuals = testObject.local;
            assert.equal(2, actuals.length);
            var actual = actuals[0];
            assert.equal(extensionManagement_1.LocalExtensionType.User, actual.type);
            assert.equal('local1', actual.name);
            assert.equal('localDisplayName1', actual.displayName);
            assert.equal('localPublisher1.local1', actual.id);
            assert.equal('localPublisher1', actual.publisher);
            assert.equal('1.1.0', actual.version);
            assert.equal('1.1.0', actual.latestVersion);
            assert.equal('localDescription1', actual.description);
            assert.equal('file:///localPath1/localIcon1', actual.iconUrl);
            assert.equal('file:///localPath1/localIcon1', actual.iconUrlFallback);
            assert.equal(null, actual.licenseUrl);
            assert.equal(extensions_1.ExtensionState.Installed, actual.state);
            assert.equal(null, actual.installCount);
            assert.equal(null, actual.rating);
            assert.equal(null, actual.ratingCount);
            assert.equal(false, actual.outdated);
            assert.deepEqual(['pub.1', 'pub.2'], actual.dependencies);
            actual = actuals[1];
            assert.equal(extensionManagement_1.LocalExtensionType.System, actual.type);
            assert.equal('local2', actual.name);
            assert.equal('localDisplayName2', actual.displayName);
            assert.equal('localPublisher2.local2', actual.id);
            assert.equal('localPublisher2', actual.publisher);
            assert.equal('1.2.0', actual.version);
            assert.equal('1.2.0', actual.latestVersion);
            assert.equal('localDescription2', actual.description);
            assert.ok(fs.existsSync(actual.iconUrl));
            assert.equal(null, actual.licenseUrl);
            assert.equal(extensions_1.ExtensionState.Installed, actual.state);
            assert.equal(null, actual.installCount);
            assert.equal(null, actual.rating);
            assert.equal(null, actual.ratingCount);
            assert.equal(false, actual.outdated);
            assert.deepEqual([], actual.dependencies);
        });
        test('test installed extensions get syncs with gallery', function () {
            var local1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: extensionManagement_1.LocalExtensionType.User,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                path: 'localPath1'
            });
            var local2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: extensionManagement_1.LocalExtensionType.System,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            var gallery1 = aGalleryExtension(local1.manifest.name, {
                identifier: local1.identifier,
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: local1.manifest.publisher,
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local1, local2]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery1));
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            return eventToPromise(testObject.onChange).then(function () {
                var actuals = testObject.local;
                assert.equal(2, actuals.length);
                var actual = actuals[0];
                assert.equal(extensionManagement_1.LocalExtensionType.User, actual.type);
                assert.equal('local1', actual.name);
                assert.equal('expectedDisplayName', actual.displayName);
                assert.equal('localPublisher1.local1', actual.id);
                assert.equal('localPublisher1', actual.publisher);
                assert.equal('1.1.0', actual.version);
                assert.equal('1.5.0', actual.latestVersion);
                assert.equal('expectedDescription', actual.description);
                assert.equal('uri:icon', actual.iconUrl);
                assert.equal('fallback:icon', actual.iconUrlFallback);
                assert.equal(extensions_1.ExtensionState.Installed, actual.state);
                assert.equal('uri:license', actual.licenseUrl);
                assert.equal(1000, actual.installCount);
                assert.equal(4, actual.rating);
                assert.equal(100, actual.ratingCount);
                assert.equal(true, actual.outdated);
                assert.deepEqual(['pub.1'], actual.dependencies);
                actual = actuals[1];
                assert.equal(extensionManagement_1.LocalExtensionType.System, actual.type);
                assert.equal('local2', actual.name);
                assert.equal('localDisplayName2', actual.displayName);
                assert.equal('localPublisher2.local2', actual.id);
                assert.equal('localPublisher2', actual.publisher);
                assert.equal('1.2.0', actual.version);
                assert.equal('1.2.0', actual.latestVersion);
                assert.equal('localDescription2', actual.description);
                assert.ok(fs.existsSync(actual.iconUrl));
                assert.equal(null, actual.licenseUrl);
                assert.equal(extensions_1.ExtensionState.Installed, actual.state);
                assert.equal(null, actual.installCount);
                assert.equal(null, actual.rating);
                assert.equal(null, actual.ratingCount);
                assert.equal(false, actual.outdated);
                assert.deepEqual([], actual.dependencies);
            });
        });
        test('test extension state computation', function () {
            var gallery = aGalleryExtension('gallery1');
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                assert.equal(extensions_1.ExtensionState.Uninstalled, extension.state);
                testObject.install(extension);
                var identifier = { id: extensionManagementService_1.getLocalExtensionIdFromGallery(gallery, gallery.version) };
                // Installing
                installEvent.fire({ identifier: identifier, gallery: gallery });
                var local = testObject.local;
                assert.equal(1, local.length);
                var actual = local[0];
                assert.equal(gallery.publisher + "." + gallery.name, actual.id);
                assert.equal(extensions_1.ExtensionState.Installing, actual.state);
                // Installed
                didInstallEvent.fire({ identifier: identifier, gallery: gallery, local: aLocalExtension(gallery.name, gallery, { identifier: identifier }) });
                assert.equal(extensions_1.ExtensionState.Installed, actual.state);
                assert.equal(1, testObject.local.length);
                testObject.uninstall(actual);
                // Uninstalling
                uninstallEvent.fire(identifier);
                assert.equal(extensions_1.ExtensionState.Uninstalling, actual.state);
                // Uninstalled
                didUninstallEvent.fire({ identifier: identifier });
                assert.equal(extensions_1.ExtensionState.Uninstalled, actual.state);
                assert.equal(0, testObject.local.length);
            });
        });
        test('test extension doesnot show outdated for system extensions', function () {
            var local = aLocalExtension('a', { version: '1.0.1' }, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier, version: '1.0.2' })));
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            assert.ok(!testObject.local[0].outdated);
        });
        test('test canInstall returns false for extensions with out gallery', function () {
            var local = aLocalExtension('a', { version: '1.0.1' }, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var target = testObject.local[0];
            testObject.uninstall(target);
            uninstallEvent.fire(local.identifier);
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.canInstall(target));
        });
        test('test canInstall returns false for a system extension', function () {
            var local = aLocalExtension('a', { version: '1.0.1' }, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var target = testObject.local[0];
            assert.ok(!testObject.canInstall(target));
        });
        test('test canInstall returns true for extensions with gallery', function () {
            var local = aLocalExtension('a', { version: '1.0.1' }, { type: extensionManagement_1.LocalExtensionType.User });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var target = testObject.local[0];
            return eventToPromise(testObject.onChange).then(function () {
                assert.ok(testObject.canInstall(target));
            });
        });
        test('test onchange event is triggered while installing', function () {
            var gallery = aGalleryExtension('gallery1');
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            var target = sinon.spy();
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                assert.equal(extensions_1.ExtensionState.Uninstalled, extension.state);
                testObject.install(extension);
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                testObject.onChange(target);
                // Installed
                didInstallEvent.fire({ identifier: gallery.identifier, gallery: gallery, local: aLocalExtension(gallery.name, gallery, gallery) });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered when installation is finished', function () {
            var gallery = aGalleryExtension('gallery1');
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            var target = sinon.spy();
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                assert.equal(extensions_1.ExtensionState.Uninstalled, extension.state);
                testObject.install(extension);
                testObject.onChange(target);
                // Installing
                installEvent.fire({ identifier: gallery.identifier, gallery: gallery });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered while uninstalling', function () {
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            testObject.onChange(target);
            uninstallEvent.fire(local.identifier);
            assert.ok(target.calledOnce);
        });
        test('test onchange event is triggered when uninstalling is finished', function () {
            var local = aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            var target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            uninstallEvent.fire(local.identifier);
            testObject.onChange(target);
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test extension dependencies when empty', function () {
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
            return testObject.queryGallery().then(function (page) {
                return testObject.loadDependencies(page.firstPage[0]).then(function (dependencies) {
                    assert.equal(null, dependencies);
                });
            });
        });
        test('test one level extension dependencies without cycle', function () {
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', {}, { dependencies: ['pub.b', 'pub.c', 'pub.d'] })));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'loadAllDependencies', [aGalleryExtension('b'), aGalleryExtension('c'), aGalleryExtension('d')]);
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                return testObject.loadDependencies(extension).then(function (actual) {
                    assert.ok(actual.hasDependencies);
                    assert.equal(extension, actual.extension);
                    assert.equal(null, actual.dependent);
                    assert.equal(3, actual.dependencies.length);
                    assert.equal('pub.a', actual.identifier);
                    var dependent = actual;
                    actual = dependent.dependencies[0];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.b', actual.extension.id);
                    assert.equal('pub.b', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                    actual = dependent.dependencies[1];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.c', actual.extension.id);
                    assert.equal('pub.c', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                    actual = dependent.dependencies[2];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.d', actual.extension.id);
                    assert.equal('pub.d', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                });
            });
        });
        test('test one level extension dependencies with cycle', function () {
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', {}, { dependencies: ['pub.b', 'pub.a'] })));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'loadAllDependencies', [aGalleryExtension('b'), aGalleryExtension('a')]);
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                return testObject.loadDependencies(extension).then(function (actual) {
                    assert.ok(actual.hasDependencies);
                    assert.equal(extension, actual.extension);
                    assert.equal(null, actual.dependent);
                    assert.equal(2, actual.dependencies.length);
                    assert.equal('pub.a', actual.identifier);
                    var dependent = actual;
                    actual = dependent.dependencies[0];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.b', actual.extension.id);
                    assert.equal('pub.b', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                    actual = dependent.dependencies[1];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.a', actual.extension.id);
                    assert.equal('pub.a', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                });
            });
        });
        test('test one level extension dependencies with missing dependencies', function () {
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', {}, { dependencies: ['pub.b', 'pub.a'] })));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'loadAllDependencies', [aGalleryExtension('a')]);
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                return testObject.loadDependencies(extension).then(function (actual) {
                    assert.ok(actual.hasDependencies);
                    assert.equal(extension, actual.extension);
                    assert.equal(null, actual.dependent);
                    assert.equal(2, actual.dependencies.length);
                    assert.equal('pub.a', actual.identifier);
                    var dependent = actual;
                    actual = dependent.dependencies[0];
                    assert.ok(!actual.hasDependencies);
                    assert.equal(null, actual.extension);
                    assert.equal('pub.b', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                    actual = dependent.dependencies[1];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.a', actual.extension.id);
                    assert.equal('pub.a', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                });
            });
        });
        test('test one level extension dependencies with in built dependencies', function () {
            var local = aLocalExtension('inbuilt', {}, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', {}, { dependencies: ['pub.inbuilt', 'pub.a'] })));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'loadAllDependencies', [aGalleryExtension('a')]);
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                return testObject.loadDependencies(extension).then(function (actual) {
                    assert.ok(actual.hasDependencies);
                    assert.equal(extension, actual.extension);
                    assert.equal(null, actual.dependent);
                    assert.equal(2, actual.dependencies.length);
                    assert.equal('pub.a', actual.identifier);
                    var dependent = actual;
                    actual = dependent.dependencies[0];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.inbuilt', actual.extension.id);
                    assert.equal('pub.inbuilt', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                    actual = dependent.dependencies[1];
                    assert.ok(!actual.hasDependencies);
                    assert.equal('pub.a', actual.extension.id);
                    assert.equal('pub.a', actual.identifier);
                    assert.equal(dependent, actual.dependent);
                    assert.equal(0, actual.dependencies.length);
                });
            });
        });
        test('test more than one level of extension dependencies', function () {
            var local = aLocalExtension('c', { extensionDependencies: ['pub.d'] }, { type: extensionManagement_1.LocalExtensionType.System });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a', {}, { dependencies: ['pub.b', 'pub.c'] })));
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'loadAllDependencies', [
                aGalleryExtension('b', {}, { dependencies: ['pub.d', 'pub.e'] }),
                aGalleryExtension('d', {}, { dependencies: ['pub.f', 'pub.c'] }),
                aGalleryExtension('e')
            ]);
            return testObject.queryGallery().then(function (page) {
                var extension = page.firstPage[0];
                return testObject.loadDependencies(extension).then(function (a) {
                    assert.ok(a.hasDependencies);
                    assert.equal(extension, a.extension);
                    assert.equal(null, a.dependent);
                    assert.equal(2, a.dependencies.length);
                    assert.equal('pub.a', a.identifier);
                    var b = a.dependencies[0];
                    assert.ok(b.hasDependencies);
                    assert.equal('pub.b', b.extension.id);
                    assert.equal('pub.b', b.identifier);
                    assert.equal(a, b.dependent);
                    assert.equal(2, b.dependencies.length);
                    var c = a.dependencies[1];
                    assert.ok(c.hasDependencies);
                    assert.equal('pub.c', c.extension.id);
                    assert.equal('pub.c', c.identifier);
                    assert.equal(a, c.dependent);
                    assert.equal(1, c.dependencies.length);
                    var d = b.dependencies[0];
                    assert.ok(d.hasDependencies);
                    assert.equal('pub.d', d.extension.id);
                    assert.equal('pub.d', d.identifier);
                    assert.equal(b, d.dependent);
                    assert.equal(2, d.dependencies.length);
                    var e = b.dependencies[1];
                    assert.ok(!e.hasDependencies);
                    assert.equal('pub.e', e.extension.id);
                    assert.equal('pub.e', e.identifier);
                    assert.equal(b, e.dependent);
                    assert.equal(0, e.dependencies.length);
                    var f = d.dependencies[0];
                    assert.ok(!f.hasDependencies);
                    assert.equal(null, f.extension);
                    assert.equal('pub.f', f.identifier);
                    assert.equal(d, f.dependent);
                    assert.equal(0, f.dependencies.length);
                    c = d.dependencies[1];
                    assert.ok(c.hasDependencies);
                    assert.equal('pub.c', c.extension.id);
                    assert.equal('pub.c', c.identifier);
                    assert.equal(d, c.dependent);
                    assert.equal(1, c.dependencies.length);
                    d = c.dependencies[0];
                    assert.ok(!d.hasDependencies);
                    assert.equal('pub.d', d.extension.id);
                    assert.equal('pub.d', d.identifier);
                    assert.equal(c, d.dependent);
                    assert.equal(0, d.dependencies.length);
                    c = a.dependencies[1];
                    d = c.dependencies[0];
                    assert.ok(d.hasDependencies);
                    assert.equal('pub.d', d.extension.id);
                    assert.equal('pub.d', d.identifier);
                    assert.equal(c, d.dependent);
                    assert.equal(2, d.dependencies.length);
                    f = d.dependencies[0];
                    assert.ok(!f.hasDependencies);
                    assert.equal(null, f.extension);
                    assert.equal('pub.f', f.identifier);
                    assert.equal(d, f.dependent);
                    assert.equal(0, f.dependencies.length);
                    c = d.dependencies[1];
                    assert.ok(!c.hasDependencies);
                    assert.equal('pub.c', c.extension.id);
                    assert.equal('pub.c', c.identifier);
                    assert.equal(d, c.dependent);
                    assert.equal(0, c.dependencies.length);
                });
            });
        });
        test('test uninstalled extensions are always enabled', function () {
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
                return testObject.queryGallery().then(function (pagedResponse) {
                    var actual = pagedResponse.firstPage[0];
                    assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Enabled);
                });
            });
        });
        test('test enablement state installed enabled extension', function () {
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                var actual = testObject.local[0];
                assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Enabled);
            });
        });
        test('test workspace disabled extension', function () {
            var extensionA = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('d'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('e'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                var actual = testObject.local[0];
                assert.equal(actual.enablementState, extensionManagement_1.EnablementState.WorkspaceDisabled);
            });
        });
        test('test globally disabled extension', function () {
            var localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(localExtension, extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('d'), extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                var actual = testObject.local[0];
                assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Disabled);
            });
        });
        test('test enablement state is updated for user extensions', function () {
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.WorkspaceDisabled)
                    .then(function () {
                    var actual = testObject.local[0];
                    assert.equal(actual.enablementState, extensionManagement_1.EnablementState.WorkspaceDisabled);
                });
            });
        });
        test('test enable extension globally when extension is disabled for workspace', function () {
            var localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(localExtension, extensionManagement_1.EnablementState.WorkspaceDisabled)
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Enabled)
                    .then(function () {
                    var actual = testObject.local[0];
                    assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Enabled);
                });
            });
        });
        test('test disable extension globally', function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var actual = testObject.local[0];
                assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Disabled);
            });
        });
        test('test system extensions are always enabled', function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a', {}, { type: extensionManagement_1.LocalExtensionType.System })]);
            testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                .then(function () {
                var actual = testObject.local[0];
                assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Enabled);
            });
        });
        test('test enablement state is updated on change from outside', function () {
            var localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(localExtension, extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    var actual = testObject.local[0];
                    assert.equal(actual.enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test disable extension with dependencies disable only itself', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Enabled);
                });
            });
        });
        test('test disable extension with dependencies disable all', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test disable extension fails if extension is a dependent of other', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[1], extensionManagement_1.EnablementState.Disabled).then(function () { return assert.fail('Should fail'); }, function (error) { return assert.ok(true); });
            });
        });
        test('test disable extension does not fail if its dependency is a dependent of other but chosen to disable only itself', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test disable extension fails if its dependency is a dependent of other', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled).then(function () { return assert.fail('Should fail'); }, function (error) { return assert.ok(true); });
            });
        });
        test('test disable extension if its dependency is a dependent of other disabled extension', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Disabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test disable extension if its dependencys dependency is itself', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b', { extensionDependencies: ['pub.a'] });
            var extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test disable extension if its dependency is dependent and is disabled', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () { return assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled); });
            });
        });
        test('test disable extension with cyclic dependencies', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Enabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Enabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Enabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                instantiationService.stubPromise(message_1.IChoiceService, 'choose', 1);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Disabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Disabled);
                });
            });
        });
        test('test enable extension with dependencies enable all', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b');
            var extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Disabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Enabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Enabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Enabled);
                });
            });
        });
        test('test enable extension with cyclic dependencies', function () {
            var extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            var extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            var extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionA, extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionB, extensionManagement_1.EnablementState.Disabled); })
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(extensionC, extensionManagement_1.EnablementState.Disabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Enabled)
                    .then(function () {
                    assert.equal(testObject.local[0].enablementState, extensionManagement_1.EnablementState.Enabled);
                    assert.equal(testObject.local[1].enablementState, extensionManagement_1.EnablementState.Enabled);
                    assert.equal(testObject.local[2].enablementState, extensionManagement_1.EnablementState.Enabled);
                });
            });
        });
        test('test change event is fired when disablement flags are changed', function () {
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                var target = sinon.spy();
                testObject.onChange(target);
                return testObject.setEnablement(testObject.local[0], extensionManagement_1.EnablementState.Disabled)
                    .then(function () { return assert.ok(target.calledOnce); });
            });
        });
        test('test change event is fired when disablement flags are changed from outside', function () {
            var localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('c'), extensionManagement_1.EnablementState.Disabled)
                .then(function () { return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(aLocalExtension('b'), extensionManagement_1.EnablementState.WorkspaceDisabled); })
                .then(function () {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
                var target = sinon.spy();
                testObject.onChange(target);
                return instantiationService.get(extensionManagement_1.IExtensionEnablementService).setEnablement(localExtension, extensionManagement_1.EnablementState.Disabled)
                    .then(function () { return assert.ok(target.calledOnce); });
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
        var noAssets = {
            changelog: null,
            download: null,
            icon: null,
            license: null,
            manifest: null,
            readme: null,
            repository: null
        };
        function aGalleryExtension(name, properties, galleryExtensionProperties, assets) {
            if (properties === void 0) { properties = {}; }
            if (galleryExtensionProperties === void 0) { galleryExtensionProperties = {}; }
            if (assets === void 0) { assets = noAssets; }
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
        function eventToPromise(event, count) {
            if (count === void 0) { count = 1; }
            return new winjs_base_1.TPromise(function (c) {
                var counter = 0;
                event(function () {
                    if (++counter === count) {
                        c(null);
                    }
                });
            });
        }
    });
});
