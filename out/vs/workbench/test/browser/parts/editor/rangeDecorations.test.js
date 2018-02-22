/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/workbenchTestServices", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/editor/rangeDecorations", "vs/editor/common/model/textModel", "vs/editor/test/browser/testCodeEditor", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/browser/controller/coreCommands"], function (require, exports, assert, uri_1, workbenchTestServices_1, modelService_1, modeService_1, modeServiceImpl_1, WorkbenchEditorService, rangeDecorations_1, textModel_1, testCodeEditor_1, fileEditorInput_1, range_1, position_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, coreCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor - Range decorations', function () {
        var instantiationService;
        var codeEditor;
        var model;
        var text;
        var testObject;
        var modelsToDispose = [];
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            instantiationService.stub(WorkbenchEditorService.IWorkbenchEditorService, new workbenchTestServices_1.TestEditorService());
            instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
            instantiationService.stub(modelService_1.IModelService, stubModelService(instantiationService));
            text = 'LINE1' + '\n' + 'LINE2' + '\n' + 'LINE3' + '\n' + 'LINE4' + '\r\n' + 'LINE5';
            model = aModel(uri_1.default.file('some_file'));
            codeEditor = testCodeEditor_1.createTestCodeEditor(model);
            mockEditorService(codeEditor.getModel().uri);
            instantiationService.stub(WorkbenchEditorService.IWorkbenchEditorService, 'getActiveEditor', { getControl: function () { return codeEditor; } });
            testObject = instantiationService.createInstance(rangeDecorations_1.RangeHighlightDecorations);
        });
        teardown(function () {
            codeEditor.dispose();
            modelsToDispose.forEach(function (model) { return model.dispose(); });
        });
        test('highlight range for the resource if it is an active editor', function () {
            var range = { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
            testObject.highlightRange({ resource: model.uri, range: range });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([range], actuals);
        });
        test('remove highlight range', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            testObject.removeHighlightRange();
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([], actuals);
        });
        test('highlight range for the resource removes previous highlight', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            var range = { startLineNumber: 2, startColumn: 2, endLineNumber: 4, endColumn: 3 };
            testObject.highlightRange({ resource: model.uri, range: range });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([range], actuals);
        });
        test('highlight range for a new resource removes highlight of previous resource', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            var anotherModel = prepareActiveEditor('anotherModel');
            var range = { startLineNumber: 2, startColumn: 2, endLineNumber: 4, endColumn: 3 };
            testObject.highlightRange({ resource: anotherModel.uri, range: range });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([], actuals);
            actuals = rangeHighlightDecorations(anotherModel);
            assert.deepEqual([range], actuals);
        });
        test('highlight is removed on model change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            prepareActiveEditor('anotherModel');
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([], actuals);
        });
        test('highlight is removed on cursor position change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            codeEditor.trigger('mouse', coreCommands_1.CoreNavigationCommands.MoveTo.id, {
                position: new position_1.Position(2, 1)
            });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([], actuals);
        });
        test('range is not highlight if not active editor', function () {
            var model = aModel(uri_1.default.file('some model'));
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([], actuals);
        });
        test('previous highlight is not removed if not active editor', function () {
            var range = { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 };
            testObject.highlightRange({ resource: model.uri, range: range });
            var model1 = aModel(uri_1.default.file('some model'));
            testObject.highlightRange({ resource: model1.uri, range: { startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 } });
            var actuals = rangeHighlightDecorations(model);
            assert.deepEqual([range], actuals);
        });
        function prepareActiveEditor(resource) {
            var model = aModel(uri_1.default.file(resource));
            codeEditor.setModel(model);
            mockEditorService(model.uri);
            return model;
        }
        function aModel(resource, content) {
            if (content === void 0) { content = text; }
            var model = textModel_1.TextModel.createFromString(content, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null, resource);
            modelsToDispose.push(model);
            return model;
        }
        function mockEditorService(arg) {
            var editorInput = arg instanceof uri_1.default ? instantiationService.createInstance(fileEditorInput_1.FileEditorInput, arg, void 0) : arg;
            instantiationService.stub(WorkbenchEditorService.IWorkbenchEditorService, 'getActiveEditorInput', editorInput);
        }
        function rangeHighlightDecorations(m) {
            var rangeHighlights = [];
            for (var _i = 0, _a = m.getAllDecorations(); _i < _a.length; _i++) {
                var dec = _a[_i];
                if (dec.options.className === 'rangeHighlight') {
                    rangeHighlights.push(dec.range);
                }
            }
            rangeHighlights.sort(range_1.Range.compareRangesUsingStarts);
            return rangeHighlights;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
