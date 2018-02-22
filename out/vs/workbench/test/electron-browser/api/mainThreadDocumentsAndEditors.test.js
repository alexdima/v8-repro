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
define(["require", "exports", "assert", "vs/workbench/api/electron-browser/mainThreadDocumentsAndEditors", "./testRPCProtocol", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/test/browser/testCodeEditorService", "vs/editor/test/browser/testCodeEditor", "vs/workbench/test/electron-browser/api/mock", "vs/base/common/event"], function (require, exports, assert, mainThreadDocumentsAndEditors_1, testRPCProtocol_1, testConfigurationService_1, modelServiceImpl_1, testCodeEditorService_1, testCodeEditor_1, mock_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentsAndEditors', function () {
        var modelService;
        var codeEditorService;
        var textFileService;
        var workbenchEditorService;
        var deltas = [];
        var hugeModelString = new Array(2 + (50 * 1024 * 1024)).join('-');
        setup(function () {
            deltas.length = 0;
            var configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('editor', { 'detectIndentation': false });
            modelService = new modelServiceImpl_1.ModelServiceImpl(null, configService);
            codeEditorService = new testCodeEditorService_1.TestCodeEditorService();
            textFileService = new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.models = {
                        onModelSaved: event_1.default.None,
                        onModelReverted: event_1.default.None,
                        onModelDirty: event_1.default.None,
                    };
                    return _this;
                }
                class_1.prototype.isDirty = function () { return false; };
                return class_1;
            }(mock_1.mock()));
            workbenchEditorService = {
                getVisibleEditors: function () { return []; },
                getActiveEditor: function () { return undefined; }
            };
            var editorGroupService = new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.onEditorsChanged = event_1.default.None;
                    _this.onEditorGroupMoved = event_1.default.None;
                    return _this;
                }
                return class_2;
            }(mock_1.mock()));
            /* tslint:disable */
            new mainThreadDocumentsAndEditors_1.MainThreadDocumentsAndEditors(testRPCProtocol_1.SingleProxyRPCProtocol(new /** @class */ (function (_super) {
                __extends(class_3, _super);
                function class_3() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_3.prototype.$acceptDocumentsAndEditorsDelta = function (delta) { deltas.push(delta); };
                return class_3;
            }(mock_1.mock()))), modelService, textFileService, workbenchEditorService, codeEditorService, null, null, null, null, editorGroupService);
            /* tslint:enable */
        });
        test('Model#add', function () {
            deltas.length = 0;
            modelService.createModel('farboo', null, null);
            assert.equal(deltas.length, 1);
            var delta = deltas[0];
            assert.equal(delta.addedDocuments.length, 1);
            assert.equal(delta.removedDocuments, undefined);
            assert.equal(delta.addedEditors, undefined);
            assert.equal(delta.removedEditors, undefined);
            assert.equal(delta.newActiveEditor, null);
        });
        test('ignore huge model', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            var model = modelService.createModel(hugeModelString, null, null);
            assert.ok(model.isTooLargeForHavingARichMode());
            assert.equal(deltas.length, 1);
            var delta = deltas[0];
            assert.equal(delta.newActiveEditor, null);
            assert.equal(delta.addedDocuments, undefined);
            assert.equal(delta.removedDocuments, undefined);
            assert.equal(delta.addedEditors, undefined);
            assert.equal(delta.removedEditors, undefined);
        });
        test('ignore huge model from editor', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            var model = modelService.createModel(hugeModelString, null, null);
            var editor = testCodeEditor_1.createTestCodeEditor(model);
            assert.equal(deltas.length, 1);
            deltas.length = 0;
            codeEditorService.addCodeEditor(editor);
            assert.equal(deltas.length, 0);
        });
        test('ignore editor w/o model', function () {
            var editor = testCodeEditor_1.createTestCodeEditor(null);
            editor.setModel(null);
            codeEditorService.addCodeEditor(editor);
            assert.equal(deltas.length, 1);
            var delta = deltas[0];
            assert.equal(delta.newActiveEditor, null);
            assert.equal(delta.addedDocuments, undefined);
            assert.equal(delta.removedDocuments, undefined);
            assert.equal(delta.addedEditors, undefined);
            assert.equal(delta.removedEditors, undefined);
        });
        test('editor with model', function () {
            deltas.length = 0;
            var model = modelService.createModel('farboo', null, null);
            codeEditorService.addCodeEditor(testCodeEditor_1.createTestCodeEditor(model));
            assert.equal(deltas.length, 2);
            var first = deltas[0], second = deltas[1];
            assert.equal(first.addedDocuments.length, 1);
            assert.equal(first.newActiveEditor, null);
            assert.equal(first.removedDocuments, undefined);
            assert.equal(first.addedEditors, undefined);
            assert.equal(first.removedEditors, undefined);
            assert.equal(second.addedEditors.length, 1);
            assert.equal(second.addedDocuments, undefined);
            assert.equal(second.removedDocuments, undefined);
            assert.equal(second.removedEditors, undefined);
            assert.equal(typeof second.newActiveEditor, 'string');
        });
        test('editor with dispos-ed/-ing model', function () {
            modelService.createModel('foobar', null, null);
            var model = modelService.createModel('farboo', null, null);
            var editor = testCodeEditor_1.createTestCodeEditor(model);
            codeEditorService.addCodeEditor(editor);
            // ignore things until now
            deltas.length = 0;
            modelService.destroyModel(model.uri);
            assert.equal(deltas.length, 1);
            var first = deltas[0];
            assert.equal(first.newActiveEditor, null);
            assert.equal(first.removedEditors.length, 1);
            assert.equal(first.removedDocuments.length, 1);
            assert.equal(first.addedDocuments, undefined);
            assert.equal(first.addedEditors, undefined);
        });
    });
});
