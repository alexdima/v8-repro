define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/parts/search/common/searchModel", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/parts/search/browser/searchResultsView", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/modelService", "vs/platform/workspace/common/workspace", "vs/workbench/test/workbenchTestServices", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, uri_1, searchModel_1, instantiationServiceMock_1, searchResultsView_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, modelService_1, workspace_1, workbenchTestServices_1, testWorkspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Search - Viewlet', function () {
        var instantiation;
        setup(function () {
            instantiation = new instantiationServiceMock_1.TestInstantiationService();
            instantiation.stub(modelService_1.IModelService, stubModelService(instantiation));
            instantiation.set(workspace_1.IWorkspaceContextService, new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace));
        });
        test('Data Source', function () {
            var ds = instantiation.createInstance(searchResultsView_1.SearchDataSource);
            var result = instantiation.createInstance(searchModel_1.SearchResult, null);
            result.query = { type: 1, folderQueries: [{ folder: uri_1.default.parse('file://c:/') }] };
            result.add([{
                    resource: uri_1.default.parse('file:///c:/foo'),
                    lineMatches: [{ lineNumber: 1, preview: 'bar', offsetAndLengths: [[0, 1]] }]
                }]);
            var fileMatch = result.matches()[0];
            var lineMatch = fileMatch.matches()[0];
            assert.equal(ds.getId(null, result), 'root');
            assert.equal(ds.getId(null, fileMatch), 'file:///c%3A/foo');
            assert.equal(ds.getId(null, lineMatch), 'file:///c%3A/foo>1>0b');
            assert(!ds.hasChildren(null, 'foo'));
            assert(ds.hasChildren(null, result));
            assert(ds.hasChildren(null, fileMatch));
            assert(!ds.hasChildren(null, lineMatch));
        });
        test('Sorter', function () {
            var fileMatch1 = aFileMatch('C:\\foo');
            var fileMatch2 = aFileMatch('C:\\with\\path');
            var fileMatch3 = aFileMatch('C:\\with\\path\\foo');
            var lineMatch1 = new searchModel_1.Match(fileMatch1, 'bar', 1, 1, 1);
            var lineMatch2 = new searchModel_1.Match(fileMatch1, 'bar', 2, 1, 1);
            var lineMatch3 = new searchModel_1.Match(fileMatch1, 'bar', 2, 1, 1);
            var s = new searchResultsView_1.SearchSorter();
            assert(s.compare(null, fileMatch1, fileMatch2) < 0);
            assert(s.compare(null, fileMatch2, fileMatch1) > 0);
            assert(s.compare(null, fileMatch1, fileMatch1) === 0);
            assert(s.compare(null, fileMatch2, fileMatch3) < 0);
            assert(s.compare(null, lineMatch1, lineMatch2) < 0);
            assert(s.compare(null, lineMatch2, lineMatch1) > 0);
            assert(s.compare(null, lineMatch2, lineMatch3) === 0);
        });
        function aFileMatch(path, searchResult) {
            var lineMatches = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                lineMatches[_i - 2] = arguments[_i];
            }
            var rawMatch = {
                resource: uri_1.default.file('C:\\' + path),
                lineMatches: lineMatches
            };
            return instantiation.createInstance(searchModel_1.FileMatch, null, null, searchResult, rawMatch);
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
