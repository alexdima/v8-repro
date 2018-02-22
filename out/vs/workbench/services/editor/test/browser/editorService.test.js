/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/base/common/paths", "vs/platform/editor/common/editor", "vs/base/common/uri", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/editor", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/workbench/test/workbenchTestServices", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor/untitledEditorInput", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/theme/test/common/testThemeService", "vs/platform/files/common/files"], function (require, exports, assert, winjs_base_1, paths, editor_1, uri_1, baseEditor_1, editor_2, fileEditorInput_1, workbenchTestServices_1, editorService_1, untitledEditorInput_1, resourceEditorInput_1, testThemeService_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var activeEditor = {
        getSelection: function () {
            return 'test.selection';
        }
    };
    var openedEditorInput;
    var openedEditorOptions;
    function toResource(path) {
        return uri_1.default.from({ scheme: 'custom', path: path });
    }
    function toFileResource(self, path) {
        return uri_1.default.file(paths.join('C:\\', new Buffer(self.test.fullTitle()).toString('base64'), path));
    }
    var TestEditorPart = /** @class */ (function () {
        function TestEditorPart() {
        }
        TestEditorPart.prototype.getId = function () {
            return null;
        };
        TestEditorPart.prototype.openEditors = function (args) {
            return winjs_base_1.TPromise.as([]);
        };
        TestEditorPart.prototype.replaceEditors = function (editors) {
            return winjs_base_1.TPromise.as([]);
        };
        TestEditorPart.prototype.closeEditors = function (positionOrEditors, filterOrEditors) {
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorPart.prototype.closeEditor = function (position, input) {
            return winjs_base_1.TPromise.as(null);
        };
        TestEditorPart.prototype.openEditor = function (input, options, arg) {
            openedEditorInput = input;
            openedEditorOptions = options;
            return winjs_base_1.TPromise.as(activeEditor);
        };
        TestEditorPart.prototype.getActiveEditor = function () {
            return activeEditor;
        };
        TestEditorPart.prototype.setActiveEditorInput = function (input) {
            this.activeInput = input;
        };
        TestEditorPart.prototype.getActiveEditorInput = function () {
            return this.activeInput;
        };
        TestEditorPart.prototype.getVisibleEditors = function () {
            return [activeEditor];
        };
        return TestEditorPart;
    }());
    suite('WorkbenchEditorService', function () {
        test('basics', function () {
            var _this = this;
            var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            var activeInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toFileResource(this, '/something.js'), void 0);
            var testEditorPart = new TestEditorPart();
            testEditorPart.setActiveEditorInput(activeInput);
            var service = instantiationService.createInstance(editorService_1.WorkbenchEditorService, testEditorPart);
            assert.strictEqual(service.getActiveEditor(), activeEditor);
            assert.strictEqual(service.getActiveEditorInput(), activeInput);
            // Open EditorInput
            service.openEditor(activeInput, null).then(function (editor) {
                assert.strictEqual(openedEditorInput, activeInput);
                assert.strictEqual(openedEditorOptions, null);
                assert.strictEqual(editor, activeEditor);
                assert.strictEqual(service.getVisibleEditors().length, 1);
                assert(service.getVisibleEditors()[0] === editor);
            });
            service.openEditor(activeInput, null, editor_1.Position.ONE).then(function (editor) {
                assert.strictEqual(openedEditorInput, activeInput);
                assert.strictEqual(openedEditorOptions, null);
                assert.strictEqual(editor, activeEditor);
                assert.strictEqual(service.getVisibleEditors().length, 1);
                assert(service.getVisibleEditors()[0] === editor);
            });
            // Open Untyped Input (file)
            service.openEditor({ resource: toFileResource(this, '/index.html'), options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof fileEditorInput_1.FileEditorInput);
                var contentInput = openedEditorInput;
                assert.strictEqual(contentInput.getResource().fsPath, toFileResource(_this, '/index.html').fsPath);
                assert(openedEditorOptions instanceof editor_2.TextEditorOptions);
                var textEditorOptions = openedEditorOptions;
                assert(textEditorOptions.hasOptionsDefined());
            });
            // Open Untyped Input (file, encoding)
            service.openEditor({ resource: toFileResource(this, '/index.html'), encoding: 'utf16le', options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof fileEditorInput_1.FileEditorInput);
                var contentInput = openedEditorInput;
                assert.equal(contentInput.getPreferredEncoding(), 'utf16le');
            });
            // Open Untyped Input (untitled)
            service.openEditor({ options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof untitledEditorInput_1.UntitledEditorInput);
                assert(openedEditorOptions instanceof editor_2.TextEditorOptions);
                var textEditorOptions = openedEditorOptions;
                assert(textEditorOptions.hasOptionsDefined());
            });
            // Open Untyped Input (untitled with contents)
            service.openEditor({ contents: 'Hello Untitled', options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof untitledEditorInput_1.UntitledEditorInput);
                var untitledInput = openedEditorInput;
                untitledInput.resolve().then(function (model) {
                    assert.equal(files_1.snapshotToString(model.createSnapshot()), 'Hello Untitled');
                });
            });
            // Open Untyped Input (untitled with file path)
            service.openEditor({ filePath: '/some/path.txt', options: { selection: { startLineNumber: 1, startColumn: 1 } } }).then(function (editor) {
                assert.strictEqual(editor, activeEditor);
                assert(openedEditorInput instanceof untitledEditorInput_1.UntitledEditorInput);
                var untitledInput = openedEditorInput;
                assert.ok(untitledInput.hasAssociatedFilePath);
            });
        });
        test('caching', function () {
            var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            var activeInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toFileResource(this, '/something.js'), void 0);
            var testEditorPart = new TestEditorPart();
            testEditorPart.setActiveEditorInput(activeInput);
            var service = instantiationService.createInstance(editorService_1.WorkbenchEditorService, testEditorPart);
            // Cached Input (Files)
            var fileResource1 = toFileResource(this, '/foo/bar/cache1.js');
            var fileInput1 = service.createInput({ resource: fileResource1 });
            assert.ok(fileInput1);
            var fileResource2 = toFileResource(this, '/foo/bar/cache2.js');
            var fileInput2 = service.createInput({ resource: fileResource2 });
            assert.ok(fileInput2);
            assert.notEqual(fileInput1, fileInput2);
            var fileInput1Again = service.createInput({ resource: fileResource1 });
            assert.equal(fileInput1Again, fileInput1);
            fileInput1Again.dispose();
            assert.ok(fileInput1.isDisposed());
            var fileInput1AgainAndAgain = service.createInput({ resource: fileResource1 });
            assert.notEqual(fileInput1AgainAndAgain, fileInput1);
            assert.ok(!fileInput1AgainAndAgain.isDisposed());
            // Cached Input (Resource)
            var resource1 = toResource.call(this, '/foo/bar/cache1.js');
            var input1 = service.createInput({ resource: resource1 });
            assert.ok(input1);
            var resource2 = toResource.call(this, '/foo/bar/cache2.js');
            var input2 = service.createInput({ resource: resource2 });
            assert.ok(input2);
            assert.notEqual(input1, input2);
            var input1Again = service.createInput({ resource: resource1 });
            assert.equal(input1Again, input1);
            input1Again.dispose();
            assert.ok(input1.isDisposed());
            var input1AgainAndAgain = service.createInput({ resource: resource1 });
            assert.notEqual(input1AgainAndAgain, input1);
            assert.ok(!input1AgainAndAgain.isDisposed());
        });
        test('delegate', function (done) {
            var instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            var activeInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toFileResource(this, '/something.js'), void 0);
            var testEditorPart = new TestEditorPart();
            testEditorPart.setActiveEditorInput(activeInput);
            instantiationService.createInstance(editorService_1.WorkbenchEditorService, testEditorPart);
            var MyEditor = /** @class */ (function (_super) {
                __extends(MyEditor, _super);
                function MyEditor(id) {
                    return _super.call(this, id, null, new testThemeService_1.TestThemeService()) || this;
                }
                MyEditor.prototype.getId = function () {
                    return 'myEditor';
                };
                MyEditor.prototype.layout = function () {
                };
                MyEditor.prototype.createEditor = function () {
                };
                return MyEditor;
            }(baseEditor_1.BaseEditor));
            var ed = instantiationService.createInstance(MyEditor, 'my.editor');
            var inp = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, 'name', 'description', uri_1.default.parse('my://resource'));
            var delegate = instantiationService.createInstance(editorService_1.DelegatingWorkbenchEditorService);
            delegate.setEditorOpenHandler(function (input, options) {
                assert.strictEqual(input, inp);
                return winjs_base_1.TPromise.as(ed);
            });
            delegate.setEditorCloseHandler(function (position, input) {
                assert.strictEqual(input, inp);
                done();
                return winjs_base_1.TPromise.as(void 0);
            });
            delegate.openEditor(inp);
            delegate.closeEditor(0, inp);
        });
    });
});
