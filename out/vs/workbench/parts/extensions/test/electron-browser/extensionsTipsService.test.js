/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "path", "fs", "os", "vs/base/common/winjs.base", "vs/base/common/uuid", "vs/base/node/pfs", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/parts/extensions/electron-browser/extensionTipsService", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/files/common/files", "vs/workbench/services/files/node/fileService", "vs/base/node/extfs", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/common/objects", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/uuid", "vs/platform/environment/common/environment", "vs/platform/storage/common/storage", "vs/workbench/parts/extensions/common/extensions", "vs/platform/extensionManagement/node/extensionManagementService", "vs/workbench/parts/extensions/node/extensionsWorkbenchService", "vs/platform/extensionManagement/test/common/extensionEnablementService.test", "vs/platform/url/common/url", "vs/platform/message/common/message", "vs/platform/node/product", "vs/editor/common/services/modelService", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, assert, path, fs, os, winjs_base_1, uuid, pfs_1, extensionManagement_1, extensionTipsService_1, extensionGalleryService_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, configuration_1, uri_1, testWorkspace_1, files_1, fileService_1, extfs, testConfigurationService_1, objects_1, extensionManagementUtil_1, uuid_1, environment_1, storage_1, extensions_1, extensionManagementService_1, extensionsWorkbenchService_1, extensionEnablementService_test_1, url_1, message_1, product_1, modelService_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var mockExtensionGallery = [
        aGalleryExtension('MockExtension1', {
            displayName: 'Mock Extension 1',
            version: '1.5',
            publisherId: 'mockPublisher1Id',
            publisher: 'mockPublisher1',
            publisherDisplayName: 'Mock Publisher 1',
            description: 'Mock Description',
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
        }),
        aGalleryExtension('MockExtension2', {
            displayName: 'Mock Extension 2',
            version: '1.5',
            publisherId: 'mockPublisher2Id',
            publisher: 'mockPublisher2',
            publisherDisplayName: 'Mock Publisher 2',
            description: 'Mock Description',
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
        })
    ];
    var mockExtensionLocal = [
        {
            type: extensionManagement_1.LocalExtensionType.User,
            identifier: mockExtensionGallery[0].identifier,
            manifest: {
                name: mockExtensionGallery[0].name,
                publisher: mockExtensionGallery[0].publisher,
                version: mockExtensionGallery[0].version
            },
            metadata: null,
            path: 'somepath',
            readmeUrl: 'some readmeUrl',
            changelogUrl: 'some changelogUrl'
        },
        {
            type: extensionManagement_1.LocalExtensionType.User,
            identifier: mockExtensionGallery[1].identifier,
            manifest: {
                name: mockExtensionGallery[1].name,
                publisher: mockExtensionGallery[1].publisher,
                version: mockExtensionGallery[1].version
            },
            metadata: null,
            path: 'somepath',
            readmeUrl: 'some readmeUrl',
            changelogUrl: 'some changelogUrl'
        }
    ];
    var mockTestData = {
        recommendedExtensions: [
            'mockPublisher1.mockExtension1',
            'MOCKPUBLISHER2.mockextension2',
            'badlyformattedextension',
            'MOCKPUBLISHER2.mockextension2',
            'unknown.extension'
        ],
        validRecommendedExtensions: [
            'mockPublisher1.mockExtension1',
            'MOCKPUBLISHER2.mockextension2'
        ]
    };
    function aPage() {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i] = arguments[_i];
        }
        return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: function () { return null; } };
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
    suite('ExtensionsTipsService Test', function () {
        var workspaceService;
        var instantiationService;
        var extensionsWorkbenchService;
        var testConfigurationService;
        var testObject;
        var parentResource;
        var installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        var prompted;
        var onModelAddedEvent;
        suiteSetup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            installEvent = new event_1.Emitter();
            didInstallEvent = new event_1.Emitter();
            uninstallEvent = new event_1.Emitter();
            didUninstallEvent = new event_1.Emitter();
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService());
            testConfigurationService = new testConfigurationService_1.TestConfigurationService();
            instantiationService.stub(configuration_1.IConfigurationService, testConfigurationService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, extensionManagementService_1.ExtensionManagementService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onInstallExtension', installEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidInstallExtension', didInstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onUninstallExtension', uninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, 'onDidUninstallExtension', didUninstallEvent.event);
            instantiationService.stub(extensionManagement_1.IExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            instantiationService.stub(url_1.IURLService, { onOpenURL: new event_1.Emitter().event });
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            onModelAddedEvent = new event_1.Emitter();
            product_1.default.extensionTips = {
                'ms-vscode.csharp': '{**/*.cs,**/project.json,**/global.json,**/*.csproj,**/*.sln,**/appsettings.json}',
                'msjsdiag.debugger-for-chrome': '{**/*.ts,**/*.tsx**/*.js,**/*.jsx,**/*.es6,**/.babelrc}',
                'lukehoban.Go': '**/*.go'
            };
            product_1.default.extensionImportantTips = {
                'ms-python.python': {
                    'name': 'Python',
                    'pattern': '{**/*.py}'
                },
                'ms-vscode.PowerShell': {
                    'name': 'PowerShell',
                    'pattern': '{**/*.ps,**/*.ps1}'
                }
            };
        });
        setup(function () {
            instantiationService.stub(environment_1.IEnvironmentService, { extensionDevelopmentPath: false });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, 'isEnabled', true);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage.apply(void 0, mockExtensionGallery));
            extensionsWorkbenchService = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            instantiationService.stub(extensions_1.IExtensionsWorkbenchService, extensionsWorkbenchService);
            prompted = false;
            instantiationService.stub(message_1.IChoiceService, {
                choose: function () {
                    prompted = true;
                    return winjs_base_1.TPromise.as(3);
                }
            });
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { ignoreRecommendations: false, showRecommendationsOnlyOnDemand: false });
            instantiationService.stub(storage_1.IStorageService, { get: function (a, b, c) { return c; }, getBoolean: function (a, b, c) { return c; }, store: function () { } });
            instantiationService.stub(modelService_1.IModelService, {
                getModels: function () { return []; },
                onModelAdded: onModelAddedEvent.event
            });
        });
        teardown(function (done) {
            testObject.dispose();
            extensionsWorkbenchService.dispose();
            if (parentResource) {
                extfs.del(parentResource, os.tmpdir(), function () { }, done);
            }
        });
        function setUpFolderWorkspace(folderName, recommendedExtensions) {
            var id = uuid.generateUuid();
            parentResource = path.join(os.tmpdir(), 'vsctests', id);
            return setUpFolder(folderName, parentResource, recommendedExtensions);
        }
        function setUpFolder(folderName, parentDir, recommendedExtensions) {
            var folderDir = path.join(parentDir, folderName);
            var workspaceSettingsDir = path.join(folderDir, '.vscode');
            return pfs_1.mkdirp(workspaceSettingsDir, 493).then(function () {
                var configPath = path.join(workspaceSettingsDir, 'extensions.json');
                fs.writeFileSync(configPath, JSON.stringify({
                    'recommendations': recommendedExtensions
                }, null, '\t'));
                var myWorkspace = testWorkspace_1.testWorkspace(uri_1.default.from({ scheme: 'file', path: folderDir }));
                workspaceService = new workbenchTestServices_1.TestContextService(myWorkspace);
                instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
                instantiationService.stub(files_1.IFileService, new fileService_1.FileService(workspaceService, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_1.TestTextResourceConfigurationService(), new testConfigurationService_1.TestConfigurationService(), new workbenchTestServices_1.TestLifecycleService(), { disableWatcher: true }));
            });
        }
        function testNoPromptForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', recommendations).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                return testObject.promptWorkspaceRecommendationsPromise.then(function () {
                    assert.equal(Object.keys(testObject.getAllRecommendationsWithReason()).length, recommendations.length);
                    assert.ok(!prompted);
                });
            });
        }
        function testNoPromptOrRecommendationsForValidRecommendations(recommendations) {
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                assert.equal(!testObject.promptWorkspaceRecommendationsPromise, true);
                assert.ok(!prompted);
                return testObject.getWorkspaceRecommendations().then(function () {
                    assert.equal(Object.keys(testObject.getAllRecommendationsWithReason()).length, 0);
                    assert.ok(!prompted);
                });
            });
        }
        test('ExtensionTipsService: No Prompt for valid workspace recommendations when galleryService is absent', function () {
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, 'isEnabled', false);
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions);
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations during extension development', function () {
            instantiationService.stub(environment_1.IEnvironmentService, { extensionDevelopmentPath: true });
            return testNoPromptOrRecommendationsForValidRecommendations(mockTestData.validRecommendedExtensions);
        });
        test('ExtensionTipsService: No workspace recommendations or prompts when extensions.json has empty array', function () {
            return testNoPromptForValidRecommendations([]);
        });
        test('ExtensionTipsService: Prompt for valid workspace recommendations', function () {
            return setUpFolderWorkspace('myFolder', mockTestData.recommendedExtensions).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                return testObject.promptWorkspaceRecommendationsPromise.then(function () {
                    var recommendations = Object.keys(testObject.getAllRecommendationsWithReason());
                    assert.equal(recommendations.length, mockTestData.validRecommendedExtensions.length);
                    mockTestData.validRecommendedExtensions.forEach(function (x) {
                        assert.equal(recommendations.indexOf(x.toLowerCase()) > -1, true);
                    });
                    assert.ok(prompted);
                });
            });
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations if they are already installed', function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations with casing mismatch if they are already installed', function () {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', mockExtensionLocal);
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions.map(function (x) { return x.toUpperCase(); }));
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set', function () {
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { ignoreRecommendations: true });
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations if showRecommendationsOnlyOnDemand is set', function () {
            testConfigurationService.setUserConfiguration(extensions_1.ConfigurationKey, { showRecommendationsOnlyOnDemand: true });
            return setUpFolderWorkspace('myFolder', mockTestData.validRecommendedExtensions).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                return testObject.promptWorkspaceRecommendationsPromise.then(function () {
                    assert.equal(Object.keys(testObject.getAllRecommendationsWithReason()).length, 0);
                    assert.ok(!prompted);
                });
            });
        });
        test('ExtensionTipsService: No Prompt for valid workspace recommendations if ignoreRecommendations is set for current workspace', function () {
            instantiationService.stub(storage_1.IStorageService, { get: function (a, b, c) { return c; }, getBoolean: function (a, b, c) { return a === 'extensionsAssistant/workspaceRecommendationsIgnore' || c; } });
            return testNoPromptForValidRecommendations(mockTestData.validRecommendedExtensions);
        });
        test('ExtensionTipsService: Get file based recommendations from storage (old format)', function () {
            var storedRecommendations = '["ms-vscode.csharp", "ms-python.python", "eg2.tslint"]';
            instantiationService.stub(storage_1.IStorageService, { get: function (a, b, c) { return a === 'extensionsAssistant/recommendations' ? storedRecommendations : c; } });
            return setUpFolderWorkspace('myFolder', []).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                var recommendations = testObject.getFileBasedRecommendations();
                assert.equal(recommendations.length, 2);
                assert.ok(recommendations.indexOf('ms-vscode.csharp') > -1); // stored recommendation that exists in product.extensionTips
                assert.ok(recommendations.indexOf('ms-python.python') > -1); // stored recommendation that exists in product.extensionImportantTips
                assert.ok(recommendations.indexOf('eg2.tslint') === -1); // stored recommendation that is no longer in neither product.extensionTips nor product.extensionImportantTips
            });
        });
        test('ExtensionTipsService: Get file based recommendations from storage (new format)', function () {
            var milliSecondsInADay = 1000 * 60 * 60 * 24;
            var now = Date.now();
            var tenDaysOld = 10 * milliSecondsInADay;
            var storedRecommendations = "{\"ms-vscode.csharp\": " + now + ", \"ms-python.python\": " + now + ", \"eg2.tslint\": " + now + ", \"lukehoban.Go\": " + tenDaysOld + "}";
            instantiationService.stub(storage_1.IStorageService, { get: function (a, b, c) { return a === 'extensionsAssistant/recommendations' ? storedRecommendations : c; } });
            return setUpFolderWorkspace('myFolder', []).then(function () {
                testObject = instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService);
                var recommendations = testObject.getFileBasedRecommendations();
                assert.equal(recommendations.length, 2);
                assert.ok(recommendations.indexOf('ms-vscode.csharp') > -1); // stored recommendation that exists in product.extensionTips
                assert.ok(recommendations.indexOf('ms-python.python') > -1); // stored recommendation that exists in product.extensionImportantTips
                assert.ok(recommendations.indexOf('eg2.tslint') === -1); // stored recommendation that is no longer in neither product.extensionTips nor product.extensionImportantTips
                assert.ok(recommendations.indexOf('lukehoban.Go') === -1); //stored recommendation that is older than a week
            });
        });
    });
});
