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
define(["require", "exports", "assert", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/model/textModel"], function (require, exports, assert, instantiationServiceMock_1, editor_1, textEditorModel_1, modeService_1, modeServiceImpl_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, textModel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MyEditorModel = /** @class */ (function (_super) {
        __extends(MyEditorModel, _super);
        function MyEditorModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return MyEditorModel;
    }(editor_1.EditorModel));
    var MyTextEditorModel = /** @class */ (function (_super) {
        __extends(MyTextEditorModel, _super);
        function MyTextEditorModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MyTextEditorModel.prototype.createTextEditorModel = function (value, resource, modeId) {
            return _super.prototype.createTextEditorModel.call(this, value, resource, modeId);
        };
        return MyTextEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    suite('Workbench - EditorModel', function () {
        var instantiationService;
        var modeService;
        setup(function () {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            modeService = instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
        });
        test('EditorModel', function (done) {
            var counter = 0;
            var m = new MyEditorModel();
            m.onDispose(function () {
                assert(true);
                counter++;
            });
            m.load().then(function (model) {
                assert(model === m);
                assert.strictEqual(m.isResolved(), true);
                m.dispose();
                assert.equal(counter, 1);
            }).done(function () { return done(); });
        });
        test('BaseTextEditorModel', function (done) {
            var modelService = stubModelService(instantiationService);
            var m = new MyTextEditorModel(modelService, modeService);
            m.load().then(function (model) {
                assert(model === m);
                return model.createTextEditorModel(textModel_1.createTextBufferFactory('foo'), null, 'text/plain').then(function () {
                    assert.strictEqual(m.isResolved(), true);
                });
            }).done(function () {
                m.dispose();
                done();
            });
        });
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
