define(["require", "exports", "assert", "sinon", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/parts/search/common/searchModel", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/editor/common/core/range", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/modelService", "vs/workbench/parts/search/common/replace"], function (require, exports, assert, sinon, instantiationServiceMock_1, searchModel_1, uri_1, telemetry_1, telemetryUtils_1, range_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, modelService_1, replace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SearchResult', function () {
        var instantiationService;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(modelService_1.IModelService, stubModelService(instantiationService));
            instantiationService.stubPromise(replace_1.IReplaceService, {});
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', null);
        });
        test('Line Match', function () {
            var fileMatch = aFileMatch('folder/file.txt', null);
            var lineMatch = new searchModel_1.Match(fileMatch, 'foo bar', 1, 0, 3);
            assert.equal(lineMatch.text(), 'foo bar');
            assert.equal(lineMatch.range().startLineNumber, 2);
            assert.equal(lineMatch.range().endLineNumber, 2);
            assert.equal(lineMatch.range().startColumn, 1);
            assert.equal(lineMatch.range().endColumn, 4);
            assert.equal('file:///folder/file.txt>1>0foo', lineMatch.id());
        });
        test('Line Match - Remove', function () {
            var fileMatch = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo bar',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }]));
            var lineMatch = fileMatch.matches()[0];
            fileMatch.remove(lineMatch);
            assert.equal(fileMatch.matches().length, 0);
        });
        test('File Match', function () {
            var fileMatch = aFileMatch('folder/file.txt');
            assert.equal(fileMatch.matches(), 0);
            assert.equal(fileMatch.resource().toString(), 'file:///folder/file.txt');
            assert.equal(fileMatch.name(), 'file.txt');
            fileMatch = aFileMatch('file.txt');
            assert.equal(fileMatch.matches(), 0);
            assert.equal(fileMatch.resource().toString(), 'file:///file.txt');
            assert.equal(fileMatch.name(), 'file.txt');
        });
        test('File Match: Select an existing match', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.equal(testObject.matches()[0], testObject.getSelectedMatch());
        });
        test('File Match: Select non existing match', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            var target = testObject.matches()[0];
            testObject.remove(target);
            testObject.setSelectedMatch(target);
            assert.equal(undefined, testObject.getSelectedMatch());
        });
        test('File Match: isSelected return true for selected match', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            var target = testObject.matches()[0];
            testObject.setSelectedMatch(target);
            assert.ok(testObject.isMatchSelected(target));
        });
        test('File Match: isSelected return false for un-selected match', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            testObject.setSelectedMatch(testObject.matches()[0]);
            assert.ok(!testObject.isMatchSelected(testObject.matches()[1]));
        });
        test('File Match: unselect', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            testObject.setSelectedMatch(testObject.matches()[0]);
            testObject.setSelectedMatch(null);
            assert.equal(null, testObject.getSelectedMatch());
        });
        test('File Match: unselect when not selected', function () {
            var testObject = aFileMatch.apply(void 0, ['folder/file.txt', aSearchResult()].concat([{
                    preview: 'foo',
                    lineNumber: 1,
                    offsetAndLengths: [[0, 3]]
                }, {
                    preview: 'bar',
                    lineNumber: 1,
                    offsetAndLengths: [[5, 3]]
                }]));
            testObject.setSelectedMatch(null);
            assert.equal(null, testObject.getSelectedMatch());
        });
        test('Alle Drei Zusammen', function () {
            var searchResult = instantiationService.createInstance(searchModel_1.SearchResult, null);
            var fileMatch = aFileMatch('far/boo', searchResult);
            var lineMatch = new searchModel_1.Match(fileMatch, 'foo bar', 1, 0, 3);
            assert(lineMatch.parent() === fileMatch);
            assert(fileMatch.parent() === searchResult);
        });
        test('Adding a raw match will add a file match with line matches', function () {
            var testObject = aSearchResult();
            var target = [aRawMatch('file://c:/', aLineMatch('preview 1', 1, [[1, 3], [4, 7]]), aLineMatch('preview 2'))];
            testObject.add(target);
            assert.equal(3, testObject.count());
            var actual = testObject.matches();
            assert.equal(1, actual.length);
            assert.equal('file://c:/', actual[0].resource().toString());
            var actuaMatches = actual[0].matches();
            assert.equal(3, actuaMatches.length);
            assert.equal('preview 1', actuaMatches[0].text());
            assert.ok(new range_1.Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
            assert.equal('preview 1', actuaMatches[1].text());
            assert.ok(new range_1.Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
            assert.equal('preview 2', actuaMatches[2].text());
            assert.ok(new range_1.Range(2, 1, 2, 2).equalsRange(actuaMatches[2].range()));
        });
        test('Adding multiple raw matches', function () {
            var testObject = aSearchResult();
            var target = [aRawMatch('file://c:/1', aLineMatch('preview 1', 1, [[1, 3], [4, 7]])), aRawMatch('file://c:/2', aLineMatch('preview 2'))];
            testObject.add(target);
            assert.equal(3, testObject.count());
            var actual = testObject.matches();
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
        test('Dispose disposes matches', function () {
            var target1 = sinon.spy();
            var target2 = sinon.spy();
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1')), aRawMatch('file://c:/2', aLineMatch('preview 2'))]);
            testObject.matches()[0].onDispose(target1);
            testObject.matches()[1].onDispose(target2);
            testObject.dispose();
            assert.ok(testObject.isEmpty());
            assert.ok(target1.calledOnce);
            assert.ok(target2.calledOnce);
        });
        test('remove triggers change event', function () {
            var target = sinon.spy();
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1'))]);
            var objectRoRemove = testObject.matches()[0];
            testObject.onChange(target);
            testObject.remove(objectRoRemove);
            assert.ok(target.calledOnce);
            assert.deepEqual([{ elements: [objectRoRemove], removed: true }], target.args[0]);
        });
        test('remove triggers change event', function () {
            var target = sinon.spy();
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1'))]);
            var objectRoRemove = testObject.matches()[0];
            testObject.onChange(target);
            testObject.remove(objectRoRemove);
            assert.ok(target.calledOnce);
            assert.deepEqual([{ elements: [objectRoRemove], removed: true }], target.args[0]);
        });
        test('Removing all line matches and adding back will add file back to result', function () {
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1'))]);
            var target = testObject.matches()[0];
            var matchToRemove = target.matches()[0];
            target.remove(matchToRemove);
            assert.ok(testObject.isEmpty());
            target.add(matchToRemove, true);
            assert.equal(1, testObject.fileCount());
            assert.equal(target, testObject.matches()[0]);
        });
        test('replace should remove the file match', function () {
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', null);
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1'))]);
            testObject.replace(testObject.matches()[0]);
            assert.ok(testObject.isEmpty());
        });
        test('replace should trigger the change event', function () {
            var target = sinon.spy();
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', null);
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1'))]);
            testObject.onChange(target);
            var objectRoRemove = testObject.matches()[0];
            testObject.replace(objectRoRemove);
            assert.ok(target.calledOnce);
            assert.deepEqual([{ elements: [objectRoRemove], removed: true }], target.args[0]);
        });
        test('replaceAll should remove all file matches', function () {
            instantiationService.stubPromise(replace_1.IReplaceService, 'replace', null);
            var testObject = aSearchResult();
            testObject.add([aRawMatch('file://c:/1', aLineMatch('preview 1')), aRawMatch('file://c:/2', aLineMatch('preview 2'))]);
            testObject.replaceAll(null);
            assert.ok(testObject.isEmpty());
        });
        //// ----- utils
        //function lineHasDecorations(model: editor.IModel, lineNumber: number, decorations: { start: number; end: number; }[]): void {
        //    let lineDecorations:typeof decorations = [];
        //    let decs = model.getLineDecorations(lineNumber);
        //    for (let i = 0, len = decs.length; i < len; i++) {
        //        lineDecorations.push({
        //            start: decs[i].range.startColumn,
        //            end: decs[i].range.endColumn
        //        });
        //    }
        //    assert.deepEqual(lineDecorations, decorations);
        //}
        //
        //function lineHasNoDecoration(model: editor.IModel, lineNumber: number): void {
        //    lineHasDecorations(model, lineNumber, []);
        //}
        //
        //function lineHasDecoration(model: editor.IModel, lineNumber: number, start: number, end: number): void {
        //    lineHasDecorations(model, lineNumber, [{
        //        start: start,
        //        end: end
        //    }]);
        //}
        //// ----- end utils
        //
        //test('Model Highlights', function () {
        //
        //    let fileMatch = instantiation.createInstance(FileMatch, null, toUri('folder\\file.txt'));
        //    fileMatch.add(new Match(fileMatch, 'line2', 1, 0, 2));
        //    fileMatch.connect();
        //    lineHasDecoration(oneModel, 2, 1, 3);
        //});
        //
        //test('Dispose', function () {
        //
        //    let fileMatch = instantiation.createInstance(FileMatch, null, toUri('folder\\file.txt'));
        //    fileMatch.add(new Match(fileMatch, 'line2', 1, 0, 2));
        //    fileMatch.connect();
        //    lineHasDecoration(oneModel, 2, 1, 3);
        //
        //    fileMatch.dispose();
        //    lineHasNoDecoration(oneModel, 2);
        //});
        function aFileMatch(path, searchResult) {
            var lineMatches = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                lineMatches[_i - 2] = arguments[_i];
            }
            var rawMatch = {
                resource: uri_1.default.file('/' + path),
                lineMatches: lineMatches
            };
            return instantiationService.createInstance(searchModel_1.FileMatch, null, null, searchResult, rawMatch);
        }
        function aSearchResult() {
            var searchModel = instantiationService.createInstance(searchModel_1.SearchModel);
            searchModel.searchResult.query = { type: 1, folderQueries: [{ folder: uri_1.default.parse('file://c:/') }] };
            return searchModel.searchResult;
        }
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
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
