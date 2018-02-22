/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/group/common/groupService", "vs/platform/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/editor/common/editorService", "minimist", "path", "vs/workbench/services/search/node/searchService", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/test/workbenchTestServices", "vs/platform/environment/common/environment", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/platform/instantiation/common/instantiationService", "vs/editor/standalone/browser/simpleServices", "vs/platform/configuration/common/configuration", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/modelService", "vs/workbench/parts/search/common/searchModel", "vs/workbench/parts/search/common/queryBuilder", "vs/base/common/event", "vs/platform/workspace/test/common/testWorkspace", "../../../platform/log/common/log", "vs/workbench/parts/search/electron-browser/search.contribution"], function (require, exports, assert, fs, workspace_1, descriptors_1, groupService_1, search_1, telemetry_1, untitledEditorService_1, editorService_1, minimist, path, searchService_1, serviceCollection_1, workbenchTestServices_1, environment_1, winjs_base_1, uri_1, instantiationService_1, simpleServices_1, configuration_1, modelServiceImpl_1, modelService_1, searchModel_1, queryBuilder_1, event, testWorkspace_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Checkout sources to run against:
    // git clone --separate-git-dir=testGit --no-checkout --single-branch https://chromium.googlesource.com/chromium/src testWorkspace
    // cd testWorkspace; git checkout 39a7f93d67f7
    // Run from repository root folder with (test.bat on Windows): ./scripts/test-int-mocha.sh --grep TextSearch.performance --timeout 500000 --testWorkspace <path>
    suite('TextSearch performance (integration)', function () {
        test('Measure', function () {
            if (process.env['VSCODE_PID']) {
                return undefined; // TODO@Rob find out why test fails when run from within VS Code
            }
            var n = 3;
            var argv = minimist(process.argv);
            var testWorkspaceArg = argv['testWorkspace'];
            var testWorkspacePath = testWorkspaceArg ? path.resolve(testWorkspaceArg) : __dirname;
            if (!fs.existsSync(testWorkspacePath)) {
                throw new Error("--testWorkspace doesn't exist");
            }
            var telemetryService = new TestTelemetryService();
            var configurationService = new simpleServices_1.SimpleConfigurationService();
            var instantiationService = new instantiationService_1.InstantiationService(new serviceCollection_1.ServiceCollection([telemetry_1.ITelemetryService, telemetryService], [configuration_1.IConfigurationService, configurationService], [modelService_1.IModelService, new modelServiceImpl_1.ModelServiceImpl(null, configurationService)], [workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService(testWorkspace_1.testWorkspace(uri_1.default.file(testWorkspacePath)))], [editorService_1.IWorkbenchEditorService, new workbenchTestServices_1.TestEditorService()], [groupService_1.IEditorGroupService, new workbenchTestServices_1.TestEditorGroupService()], [environment_1.IEnvironmentService, workbenchTestServices_1.TestEnvironmentService], [untitledEditorService_1.IUntitledEditorService, descriptors_1.createSyncDescriptor(untitledEditorService_1.UntitledEditorService)], [search_1.ISearchService, descriptors_1.createSyncDescriptor(searchService_1.SearchService)], [log_1.ILogService, new log_1.NullLogService()]));
            var queryOptions = {
                maxResults: 2048
            };
            var searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            function runSearch() {
                var queryBuilder = instantiationService.createInstance(queryBuilder_1.QueryBuilder);
                var query = queryBuilder.text({ pattern: 'static_library(' }, [uri_1.default.file(testWorkspacePath)], queryOptions);
                // Wait for the 'searchResultsFinished' event, which is fired after the search() promise is resolved
                var onSearchResultsFinished = event.filterEvent(telemetryService.eventLogged, function (e) { return e.name === 'searchResultsFinished'; });
                event.once(onSearchResultsFinished)(onComplete);
                function onComplete() {
                    try {
                        var allEvents = telemetryService.events.map(function (e) { return JSON.stringify(e); }).join('\n');
                        assert.equal(telemetryService.events.length, 3, 'Expected 3 telemetry events, got:\n' + allEvents);
                        var _a = telemetryService.events, firstRenderEvent = _a[0], resultsShownEvent = _a[1], resultsFinishedEvent = _a[2];
                        assert.equal(firstRenderEvent.name, 'searchResultsFirstRender');
                        assert.equal(resultsShownEvent.name, 'searchResultsShown');
                        assert.equal(resultsFinishedEvent.name, 'searchResultsFinished');
                        telemetryService.events = [];
                        resolve(resultsFinishedEvent);
                    }
                    catch (e) {
                        // Fail the runSearch() promise
                        error(e);
                    }
                }
                var resolve;
                var error;
                return new winjs_base_1.TPromise(function (_resolve, _error) {
                    resolve = _resolve;
                    error = _error;
                    // Don't wait on this promise, we're waiting on the event fired above
                    searchModel.search(query).then(null, _error);
                });
            }
            var finishedEvents = [];
            return runSearch() // Warm-up first
                .then(function () {
                if (testWorkspaceArg) {
                    var i_1 = n;
                    return (function iterate() {
                        if (!i_1--) {
                            return;
                        }
                        return runSearch()
                            .then(function (resultsFinishedEvent) {
                            console.log("Iteration " + (n - i_1) + ": " + resultsFinishedEvent.data.duration / 1000 + "s");
                            finishedEvents.push(resultsFinishedEvent);
                            return iterate();
                        });
                    })().then(function () {
                        var totalTime = finishedEvents.reduce(function (sum, e) { return sum + e.data.duration; }, 0);
                        console.log("Avg duration: " + totalTime / n / 1000 + "s");
                    });
                }
            });
        });
    });
    var TestTelemetryService = /** @class */ (function () {
        function TestTelemetryService() {
            this.isOptedIn = true;
            this.events = [];
            this.emitter = new event.Emitter();
        }
        Object.defineProperty(TestTelemetryService.prototype, "eventLogged", {
            get: function () {
                return this.emitter.event;
            },
            enumerable: true,
            configurable: true
        });
        TestTelemetryService.prototype.publicLog = function (eventName, data) {
            var event = { name: eventName, data: data };
            this.events.push(event);
            this.emitter.fire(event);
            return winjs_base_1.TPromise.wrap(null);
        };
        TestTelemetryService.prototype.getTelemetryInfo = function () {
            return winjs_base_1.TPromise.wrap({
                instanceId: 'someValue.instanceId',
                sessionId: 'someValue.sessionId',
                machineId: 'someValue.machineId'
            });
        };
        return TestTelemetryService;
    }());
});
