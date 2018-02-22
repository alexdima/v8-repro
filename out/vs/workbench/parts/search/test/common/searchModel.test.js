define(["require", "exports", "assert", "sinon", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/test/common/utils", "vs/base/common/winjs.base", "vs/workbench/parts/search/common/searchModel", "vs/base/common/uri", "vs/platform/search/common/search", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/range", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl"], function (require, exports, assert, sinon, instantiationServiceMock_1, utils_1, winjs_base_1, searchModel_1, uri_1, search_1, telemetry_1, telemetryUtils_1, range_1, modelService_1, configuration_1, testConfigurationService_1, modelServiceImpl_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var nullEvent = new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype.stop = function () {
            return;
        };
        class_1.prototype.timeTaken = function () {
            return -1;
        };
        return class_1;
    }());
    suite('SearchModel', function () {
        var instantiationService;
        var restoreStubs;
        var testSearchStats = {
            fromCache: false,
            resultCount: 4,
            traversal: 'node',
            errors: [],
            fileWalkStartTime: 0,
            fileWalkResultTime: 1,
            directoriesWalked: 2,
            filesWalked: 3
        };
        var folderQueries = [
            { folder: uri_1.default.parse('file://c:/') }
        ];
        setup(function () {
            restoreStubs = [];
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(modelService_1.IModelService, stubModelService(instantiationService));
            instantiationService.stub(search_1.ISearchService, {});
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: [] }));
        });
        teardown(function () {
            restoreStubs.forEach(function (element) {
                element.restore();
            });
        });
        test('Search Model: Search adds to results', function () {
            var results = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]])), aRawMatch('file://c:/2', aLineMatch('preview 2'))];
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: results }));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            var actual = testObject.searchResult.matches();
            assert.equal(2, actual.length);
            assert.equal('file://c:/1', actual[0].resource().toString());
            var actuaMatches = actual[0].matches();
            assert.equal(2, actuaMatches.length);
            assert.equal('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.equal('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            actuaMatches = actual[1].matches();
            assert.equal(1, actuaMatches.length);
            assert.equal('preview 2', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
        });
        test('Search Model: Search adds to results during progress', function (done) {
            var results = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]])), aRawMatch('file://c:/2', aLineMatch('preview 2'))];
            var promise = new utils_1.DeferredPPromise();
            instantiationService.stub(search_1.ISearchService, 'search', promise);
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            var result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            promise.progress(results[0]);
            promise.progress(results[1]);
            promise.complete({ results: [], stats: testSearchStats });
            result.done(function () {
                var actual = testObject.searchResult.matches();
                assert.equal(2, actual.length);
                assert.equal('file://c:/1', actual[0].resource().toString());
                var actuaMatches = actual[0].matches();
                assert.equal(2, actuaMatches.length);
                assert.equal('preview 1', actuaMatches[0].text());
                assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
                assert.equal('preview 1', actuaMatches[1].text());
                assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
                actuaMatches = actual[1].matches();
                assert.equal(1, actuaMatches.length);
                assert.equal('preview 2', actuaMatches[0].text());
                assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
                done();
            });
        });
        test('Search Model: Search reports telemetry on search completed', function () {
            var target = instantiationService.spy(telemetry_1.ITelemetryService, 'publicLog');
            var results = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]])), aRawMatch('file://c:/2', aLineMatch('preview 2'))];
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: results }));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            assert.ok(target.calledOnce);
            var data = target.args[0];
            data[1].duration = -1;
            assert.deepEqual(['searchResultsShown', { count: 3, fileCount: 2, options: {}, duration: -1, useRipgrep: undefined }], data);
        });
        test('Search Model: Search reports timed telemetry on search when progress is not called', function (done) {
            var target2 = sinon.spy();
            stub(nullEvent, 'stop', target2);
            var target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: [] }));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            var result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            setTimeout(function () {
                result.done(function () {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    done();
                });
            }, 0);
        });
        test('Search Model: Search reports timed telemetry on search when progress is called', function (done) {
            var target2 = sinon.spy();
            stub(nullEvent, 'stop', target2);
            var target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            var promise = new utils_1.DeferredPPromise();
            instantiationService.stub(search_1.ISearchService, 'search', promise);
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            var result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            promise.progress(aRawMatch('file://c:/1', aLineMatch('some preview')));
            promise.complete({ results: [], stats: testSearchStats });
            setTimeout(function () {
                result.done(function () {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.equal(1, target2.callCount);
                    done();
                });
            }, 0);
        });
        test('Search Model: Search reports timed telemetry on search when error is called', function (done) {
            var target2 = sinon.spy();
            stub(nullEvent, 'stop', target2);
            var target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            var promise = new utils_1.DeferredPPromise();
            instantiationService.stub(search_1.ISearchService, 'search', promise);
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            var result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            promise.error('error');
            setTimeout(function () {
                result.done(function () { }, function () {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.ok(target2.calledOnce);
                    done();
                });
            }, 0);
        });
        test('Search Model: Search reports timed telemetry on search when error is cancelled error', function (done) {
            var target2 = sinon.spy();
            stub(nullEvent, 'stop', target2);
            var target1 = sinon.stub().returns(nullEvent);
            instantiationService.stub(telemetry_1.ITelemetryService, 'publicLog', target1);
            var promise = new utils_1.DeferredPPromise();
            instantiationService.stub(search_1.ISearchService, 'search', promise);
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            var result = testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            promise.cancel();
            setTimeout(function () {
                result.done(function () { }, function () {
                    assert.ok(target1.calledWith('searchResultsFirstRender'));
                    assert.ok(target1.calledWith('searchResultsFinished'));
                    // assert.ok(target2.calledOnce);
                    done();
                });
            }, 0);
        });
        test('Search Model: Search results are cleared during search', function () {
            var results = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]])), aRawMatch('file://c:/2', aLineMatch('preview 2'))];
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: results }));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            assert.ok(!testObject.searchResult.isEmpty());
            instantiationService.stub(search_1.ISearchService, 'search', new utils_1.DeferredPPromise());
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            assert.ok(testObject.searchResult.isEmpty());
        });
        test('Search Model: Previous search is cancelled when new search is called', function () {
            var target = sinon.spy();
            instantiationService.stub(search_1.ISearchService, 'search', new utils_1.DeferredPPromise(function (c, e, p) { }, target));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            instantiationService.stub(search_1.ISearchService, 'search', new utils_1.DeferredPPromise());
            testObject.search({ contentPattern: { pattern: 'somestring' }, type: 1, folderQueries: folderQueries });
            assert.ok(target.calledOnce);
        });
        test('getReplaceString returns proper replace string for regExpressions', function () {
            var results = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]]))];
            instantiationService.stub(search_1.ISearchService, 'search', winjs_base_1.PPromise.as({ results: results }));
            var testObject = instantiationService.createInstance(searchModel_1.SearchModel);
            testObject.search({ contentPattern: { pattern: 're' }, type: 1, folderQueries: folderQueries });
            testObject.replaceString = 'hello';
            var match = testObject.searchResult.matches()[0].matches()[0];
            assert.equal('hello', match.replaceString);
            testObject.search({ contentPattern: { pattern: 're', isRegExp: true }, type: 1, folderQueries: folderQueries });
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.equal('hello', match.replaceString);
            testObject.search({ contentPattern: { pattern: 're(?:vi)', isRegExp: true }, type: 1, folderQueries: folderQueries });
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.equal('hello', match.replaceString);
            testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 1, folderQueries: folderQueries });
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.equal('hello', match.replaceString);
            testObject.search({ contentPattern: { pattern: 'r(e)(?:vi)', isRegExp: true }, type: 1, folderQueries: folderQueries });
            testObject.replaceString = 'hello$1';
            match = testObject.searchResult.matches()[0].matches()[0];
            assert.equal('helloe', match.replaceString);
        });
        function aRawMatch(resource) {
            var lineMatches = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                lineMatches[_i - 1] = arguments[_i];
            }
            return { resource: uri_1.default.parse(resource), lineMatches: lineMatches };
        }
        function aLineMatch(preview, lineNumber, offsetAndLengths) {
            if (lineNumber === void 0) { lineNumber = 1; }
            if (offsetAndLengths === void 0) { offsetAndLengths = [[0, 1]]; }
            return { preview: preview, lineNumber: lineNumber, offsetAndLengths: offsetAndLengths };
        }
        function stub(arg1, arg2, arg3) {
            var stub = sinon.stub(arg1, arg2, arg3);
            restoreStubs.push(stub);
            return stub;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
