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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/workbench/browser/parts/editor/baseEditor", "vs/workbench/common/editor", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/test/workbenchTestServices", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/theme/test/common/testThemeService", "vs/base/common/uri", "vs/workbench/browser/editor"], function (require, exports, assert, baseEditor_1, editor_1, instantiationServiceMock_1, Platform, descriptors_1, telemetry_1, telemetryUtils_1, workbenchTestServices_1, resourceEditorInput_1, testThemeService_1, uri_1, editor_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var NullThemeService = new testThemeService_1.TestThemeService();
    var EditorRegistry = Platform.Registry.as(editor_2.Extensions.Editors);
    var EditorInputRegistry = Platform.Registry.as(editor_1.Extensions.EditorInputFactories);
    var MyEditor = /** @class */ (function (_super) {
        __extends(MyEditor, _super);
        function MyEditor(telemetryService) {
            return _super.call(this, 'MyEditor', telemetryUtils_1.NullTelemetryService, NullThemeService) || this;
        }
        MyEditor.prototype.getId = function () {
            return 'myEditor';
        };
        MyEditor.prototype.layout = function () {
        };
        MyEditor.prototype.createEditor = function () {
        };
        MyEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService)
        ], MyEditor);
        return MyEditor;
    }(baseEditor_1.BaseEditor));
    exports.MyEditor = MyEditor;
    var MyOtherEditor = /** @class */ (function (_super) {
        __extends(MyOtherEditor, _super);
        function MyOtherEditor(telemetryService) {
            return _super.call(this, 'myOtherEditor', telemetryUtils_1.NullTelemetryService, NullThemeService) || this;
        }
        MyOtherEditor.prototype.getId = function () {
            return 'myOtherEditor';
        };
        MyOtherEditor.prototype.layout = function () {
        };
        MyOtherEditor.prototype.createEditor = function () {
        };
        MyOtherEditor = __decorate([
            __param(0, telemetry_1.ITelemetryService)
        ], MyOtherEditor);
        return MyOtherEditor;
    }(baseEditor_1.BaseEditor));
    exports.MyOtherEditor = MyOtherEditor;
    var MyInputFactory = /** @class */ (function () {
        function MyInputFactory() {
        }
        MyInputFactory.prototype.serialize = function (input) {
            return input.toString();
        };
        MyInputFactory.prototype.deserialize = function (instantiationService, raw) {
            return {};
        };
        return MyInputFactory;
    }());
    var MyInput = /** @class */ (function (_super) {
        __extends(MyInput, _super);
        function MyInput() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MyInput.prototype.getPreferredEditorId = function (ids) {
            return ids[1];
        };
        MyInput.prototype.getTypeId = function () {
            return '';
        };
        MyInput.prototype.resolve = function (refresh) {
            return null;
        };
        return MyInput;
    }(editor_1.EditorInput));
    var MyOtherInput = /** @class */ (function (_super) {
        __extends(MyOtherInput, _super);
        function MyOtherInput() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MyOtherInput.prototype.getTypeId = function () {
            return '';
        };
        MyOtherInput.prototype.resolve = function (refresh) {
            return null;
        };
        return MyOtherInput;
    }(editor_1.EditorInput));
    var MyResourceInput = /** @class */ (function (_super) {
        __extends(MyResourceInput, _super);
        function MyResourceInput() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MyResourceInput;
    }(resourceEditorInput_1.ResourceEditorInput));
    suite('Workbench BaseEditor', function () {
        test('BaseEditor API', function (done) {
            var e = new MyEditor(telemetryUtils_1.NullTelemetryService);
            var input = new MyOtherInput();
            var options = new editor_1.EditorOptions();
            assert(!e.isVisible());
            assert(!e.input);
            assert(!e.options);
            e.setInput(input, options).then(function () {
                assert.strictEqual(input, e.input);
                assert.strictEqual(options, e.options);
                e.setVisible(true);
                assert(e.isVisible());
                input.onDispose(function () {
                    assert(false);
                });
                e.dispose();
                e.clearInput();
                e.setVisible(false);
                assert(!e.isVisible());
                assert(!e.input);
                assert(!e.options);
                assert(!e.getControl());
            }).done(function () { return done(); });
        });
        test('EditorDescriptor', function () {
            var d = new editor_2.EditorDescriptor(MyEditor, 'id', 'name');
            assert.strictEqual(d.getId(), 'id');
            assert.strictEqual(d.getName(), 'name');
        });
        test('Editor Registration', function () {
            var d1 = new editor_2.EditorDescriptor(MyEditor, 'id1', 'name');
            var d2 = new editor_2.EditorDescriptor(MyOtherEditor, 'id2', 'name');
            var oldEditorsCnt = EditorRegistry.getEditors().length;
            var oldInputCnt = EditorRegistry.getEditorInputs().length;
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(MyInput));
            EditorRegistry.registerEditor(d2, [new descriptors_1.SyncDescriptor(MyInput), new descriptors_1.SyncDescriptor(MyOtherInput)]);
            assert.equal(EditorRegistry.getEditors().length, oldEditorsCnt + 2);
            assert.equal(EditorRegistry.getEditorInputs().length, oldInputCnt + 3);
            assert.strictEqual(EditorRegistry.getEditor(new MyInput()), d2);
            assert.strictEqual(EditorRegistry.getEditor(new MyOtherInput()), d2);
            assert.strictEqual(EditorRegistry.getEditorById('id1'), d1);
            assert.strictEqual(EditorRegistry.getEditorById('id2'), d2);
            assert(!EditorRegistry.getEditorById('id3'));
        });
        test('Editor Lookup favors specific class over superclass (match on specific class)', function () {
            var d1 = new editor_2.EditorDescriptor(MyEditor, 'id1', 'name');
            var d2 = new editor_2.EditorDescriptor(MyOtherEditor, 'id2', 'name');
            var oldEditors = EditorRegistry.getEditors();
            EditorRegistry.setEditors([]);
            EditorRegistry.registerEditor(d2, new descriptors_1.SyncDescriptor(resourceEditorInput_1.ResourceEditorInput));
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(MyResourceInput));
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            var editor = EditorRegistry.getEditor(inst.createInstance(MyResourceInput, 'fake', '', uri_1.default.file('/fake'))).instantiate(inst);
            assert.strictEqual(editor.getId(), 'myEditor');
            var otherEditor = EditorRegistry.getEditor(inst.createInstance(resourceEditorInput_1.ResourceEditorInput, 'fake', '', uri_1.default.file('/fake'))).instantiate(inst);
            assert.strictEqual(otherEditor.getId(), 'myOtherEditor');
            EditorRegistry.setEditors(oldEditors);
        });
        test('Editor Lookup favors specific class over superclass (match on super class)', function () {
            var d1 = new editor_2.EditorDescriptor(MyOtherEditor, 'id1', 'name');
            var oldEditors = EditorRegistry.getEditors();
            EditorRegistry.setEditors([]);
            EditorRegistry.registerEditor(d1, new descriptors_1.SyncDescriptor(resourceEditorInput_1.ResourceEditorInput));
            var inst = new instantiationServiceMock_1.TestInstantiationService();
            var editor = EditorRegistry.getEditor(inst.createInstance(MyResourceInput, 'fake', '', uri_1.default.file('/fake'))).instantiate(inst);
            assert.strictEqual('myOtherEditor', editor.getId());
            EditorRegistry.setEditors(oldEditors);
        });
        test('Editor Input Factory', function () {
            EditorInputRegistry.setInstantiationService(workbenchTestServices_1.workbenchInstantiationService());
            EditorInputRegistry.registerEditorInputFactory('myInputId', MyInputFactory);
            var factory = EditorInputRegistry.getEditorInputFactory('myInputId');
            assert(factory);
        });
        return {
            MyEditor: MyEditor,
            MyOtherEditor: MyOtherEditor
        };
    });
});
