/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/group/common/groupService", "vs/platform/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/experiments", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/editor/common/editorService", "minimist", "path", "vs/workbench/browser/quickopen", "vs/platform/registry/common/platform", "vs/workbench/services/search/node/searchService", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/test/workbenchTestServices", "vs/platform/environment/common/environment", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/platform/instantiation/common/instantiationService", "vs/editor/standalone/browser/simpleServices", "vs/platform/configuration/common/configuration", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/modelService", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/parts/search/electron-browser/search.contribution"], function (require, exports, assert, workspace_1, descriptors_1, groupService_1, search_1, telemetry_1, experiments_1, untitledEditorService_1, editorService_1, minimist, path, quickopen_1, platform_1, searchService_1, serviceCollection_1, workbenchTestServices_1, environment_1, winjs_base_1, uri_1, instantiationService_1, simpleServices_1, configuration_1, modelServiceImpl_1, modelService_1, testWorkspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Checkout sources to run against:
    // git clone --separate-git-dir=testGit --no-checkout --single-branch https://chromium.googlesource.com/chromium/src testWorkspace
    // cd testWorkspace; git checkout 39a7f93d67f7
    // Run from repository root folder with (test.bat on Windows): ./scripts/test.sh --grep QuickOpen.performance --timeout 180000 --testWorkspace <path>
    suite.skip('QuickOpen performance (integration)', function () {
        test('Measure', function () {
            if (process.env['VSCODE_PID']) {
                return void 0; // TODO@Christoph find out why test fails when run from within VS Code
            }
            var n = 3;
            var argv = minimist(process.argv);
            var testWorkspaceArg = argv['testWorkspace'];
            var verboseResults = argv['verboseResults'];
            var testWorkspacePath = testWorkspaceArg ? path.resolve(testWorkspaceArg) : __dirname;
            var telemetryService = new TestTelemetryService();
            var experimentService = new TestExperimentService();
            var configurationService = new simpleServices_1.SimpleConfigurationService();
            var instantiationService = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([telemetry_1.ITelemetryService, telemetryService], [experiments_1.IExperimentService, experimentService], [configuration_1.IConfigurationService, configurationService], [modelService_1.IModelService, new modelServiceImpl_1.ModelServiceImpl(null, configurationService)], [workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService(testWorkspace_1.testWorkspace(uri_1.default.file(testWorkspacePath)))], [editorService_1.IWorkbenchEditorService, new workbenchTestServices_1.TestEditorService()], [groupService_1.IEditorGroupService, new workbenchTestServices_1.TestEditorGroupService()], [environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService], [untitledEditorService_1.IUntitledEditorService, descriptors_1.createSyncDescriptor(untitledEditorService_1.UntitledEditorService)], [search_1.ISearchService, descriptors_1.createSyncDescriptor(searchService_1.SearchService)]));
            var registry = platform_1.Registry.as(quickopen_1.Extensions.Quickopen);
            var descriptor = registry.getDefaultQuickOpenHandler();
            assert.ok(descriptor);
            function measure() {
                var handler = descriptor.instantiate(instantiationService);
                handler.onOpen();
                return handler.getResults('a').then(function (result) {
                    var uncachedEvent = popEvent();
                    assert.strictEqual(uncachedEvent.data.symbols.fromCache, false, 'symbols.fromCache');
                    assert.strictEqual(uncachedEvent.data.files.fromCache, true, 'files.fromCache');
                    if (testWorkspaceArg) {
                        assert.ok(!!uncachedEvent.data.files.joined, 'files.joined');
                    }
                    return uncachedEvent;
                }).then(function (uncachedEvent) {
                    return handler.getResults('ab').then(function (result) {
                        var cachedEvent = popEvent();
                        assert.strictEqual(uncachedEvent.data.symbols.fromCache, false, 'symbols.fromCache');
                        assert.ok(cachedEvent.data.files.fromCache, 'filesFromCache');
                        handler.onClose(false);
                        return [uncachedEvent, cachedEvent];
                    });
                });
            }
            function popEvent() {
                var events = telemetryService.events
                    .filter(function (event) { return event.name === 'openAnything'; });
                assert.strictEqual(events.length, 1);
                var event = events[0];
                telemetryService.events.length = 0;
                return event;
            }
            function printResult(data) {
                if (verboseResults) {
                    console.log(JSON.stringify(data, null, '  ') + ',');
                }
                else {
                    console.log(JSON.stringify({
                        filesfromCacheNotJoined: data.files.fromCache && !data.files.joined,
                        searchLength: data.searchLength,
                        sortedResultDuration: data.sortedResultDuration,
                        filesResultCount: data.files.resultCount,
                        errorCount: data.files.errors && data.files.errors.length || undefined
                    }) + ',');
                }
            }
            return measure() // Warm-up first
                .then(function () {
                if (testWorkspaceArg || verboseResults) {
                    var cachedEvents_1 = [];
                    var i_1 = n;
                    return (function iterate() {
                        if (!i_1--) {
                            return undefined;
                        }
                        return measure()
                            .then(function (_a) {
                            var uncachedEvent = _a[0], cachedEvent = _a[1];
                            printResult(uncachedEvent.data);
                            cachedEvents_1.push(cachedEvent);
                            return iterate();
                        });
                    })().then(function () {
                        console.log();
                        cachedEvents_1.forEach(function (cachedEvent) {
                            printResult(cachedEvent.data);
                        });
                    });
                }
                return undefined;
            });
        });
    });
    var TestTelemetryService = /** @class */ (function () {
        function TestTelemetryService() {
            this.isOptedIn = true;
            this.events = [];
        }
        TestTelemetryService.prototype.publicLog = function (eventName, data) {
            this.events.push({ name: eventName, data: data });
            return winjs_base_1.TPromise.wrap(null);
        };
        TestTelemetryService.prototype.getTelemetryInfo = function () {
            return winjs_base_1.TPromise.as({
                instanceId: 'someValue.instanceId',
                sessionId: 'someValue.sessionId',
                machineId: 'someValue.machineId'
            });
        };
        return TestTelemetryService;
    }());
    var TestExperimentService = /** @class */ (function () {
        function TestExperimentService() {
        }
        TestExperimentService.prototype.getExperiments = function () {
            return {};
        };
        return TestExperimentService;
    }());
});
