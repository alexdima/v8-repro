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
define(["require", "exports", "vs/base/common/uri", "assert", "vs/base/common/winjs.base", "vs/base/common/paths", "vs/workbench/services/untitled/common/untitledEditorService", "vs/platform/configuration/common/configuration", "vs/workbench/test/workbenchTestServices", "vs/workbench/common/editor/untitledEditorModel", "vs/editor/common/services/modeService", "vs/platform/files/common/files"], function (require, exports, uri_1, assert, winjs_base_1, paths_1, untitledEditorService_1, configuration_1, workbenchTestServices_1, untitledEditorModel_1, modeService_1, files_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestUntitledEditorService = /** @class */ (function (_super) {
        __extends(TestUntitledEditorService, _super);
        function TestUntitledEditorService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestUntitledEditorService.prototype.get = function (resource) {
            return _super.prototype.get.call(this, resource);
        };
        TestUntitledEditorService.prototype.getAll = function (resources) {
            return _super.prototype.getAll.call(this, resources);
        };
        return TestUntitledEditorService;
    }(untitledEditorService_1.UntitledEditorService));
    exports.TestUntitledEditorService = TestUntitledEditorService;
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(untitledEditorService, modeService, testConfigurationService) {
            this.untitledEditorService = untitledEditorService;
            this.modeService = modeService;
            this.testConfigurationService = testConfigurationService;
        }
        ServiceAccessor = __decorate([
            __param(0, untitledEditorService_1.IUntitledEditorService),
            __param(1, modeService_1.IModeService),
            __param(2, configuration_1.IConfigurationService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('Workbench - Untitled Editor', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        teardown(function () {
            accessor.untitledEditorService.revertAll();
            accessor.untitledEditorService.dispose();
        });
        test('Untitled Editor Service', function (done) {
            var service = accessor.untitledEditorService;
            assert.equal(service.getAll().length, 0);
            var input1 = service.createOrGet();
            assert.equal(input1, service.createOrGet(input1.getResource()));
            assert.ok(service.exists(input1.getResource()));
            assert.ok(!service.exists(uri_1.default.file('testing')));
            var input2 = service.createOrGet();
            // get() / getAll()
            assert.equal(service.get(input1.getResource()), input1);
            assert.equal(service.getAll().length, 2);
            assert.equal(service.getAll([input1.getResource(), input2.getResource()]).length, 2);
            // revertAll()
            service.revertAll([input1.getResource()]);
            assert.ok(input1.isDisposed());
            assert.equal(service.getAll().length, 1);
            // dirty
            input2.resolve().then(function (model) {
                assert.ok(!service.isDirty(input2.getResource()));
                var listener = service.onDidChangeDirty(function (resource) {
                    listener.dispose();
                    assert.equal(resource.toString(), input2.getResource().toString());
                    assert.ok(service.isDirty(input2.getResource()));
                    assert.equal(service.getDirty()[0].toString(), input2.getResource().toString());
                    assert.equal(service.getDirty([input2.getResource()])[0].toString(), input2.getResource().toString());
                    assert.equal(service.getDirty([input1.getResource()]).length, 0);
                    service.revertAll();
                    assert.equal(service.getAll().length, 0);
                    assert.ok(!input2.isDirty());
                    assert.ok(!model.isDirty());
                    input2.dispose();
                    assert.ok(!service.exists(input2.getResource()));
                    done();
                });
                model.textEditorModel.setValue('foo bar');
            });
        });
        test('Untitled with associated resource', function () {
            var service = accessor.untitledEditorService;
            var file = uri_1.default.file(paths_1.join('C:\\', '/foo/file.txt'));
            var untitled = service.createOrGet(file);
            assert.ok(service.hasAssociatedFilePath(untitled.getResource()));
            untitled.dispose();
        });
        test('Untitled no longer dirty when content gets empty', function (done) {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            // dirty
            input.resolve().then(function (model) {
                model.textEditorModel.setValue('foo bar');
                assert.ok(model.isDirty());
                model.textEditorModel.setValue('');
                assert.ok(!model.isDirty());
                input.dispose();
                done();
            });
        });
        test('Untitled via loadOrCreate', function (done) {
            var service = accessor.untitledEditorService;
            service.loadOrCreate().then(function (model1) {
                model1.textEditorModel.setValue('foo bar');
                assert.ok(model1.isDirty());
                model1.textEditorModel.setValue('');
                assert.ok(!model1.isDirty());
                return service.loadOrCreate({ initialValue: 'Hello World' }).then(function (model2) {
                    assert.equal(files_1.snapshotToString(model2.createSnapshot()), 'Hello World');
                    var input = service.createOrGet();
                    return service.loadOrCreate({ resource: input.getResource() }).then(function (model3) {
                        assert.equal(model3.getResource().toString(), input.getResource().toString());
                        var file = uri_1.default.file(paths_1.join('C:\\', '/foo/file44.txt'));
                        return service.loadOrCreate({ resource: file }).then(function (model4) {
                            assert.ok(service.hasAssociatedFilePath(model4.getResource()));
                            assert.ok(model4.isDirty());
                            model1.dispose();
                            model2.dispose();
                            model3.dispose();
                            model4.dispose();
                            input.dispose();
                            done();
                        });
                    });
                });
            });
        });
        test('Untitled suggest name', function () {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            assert.ok(service.suggestFileName(input.getResource()));
        });
        test('Untitled with associated path remains dirty when content gets empty', function (done) {
            var service = accessor.untitledEditorService;
            var file = uri_1.default.file(paths_1.join('C:\\', '/foo/file.txt'));
            var input = service.createOrGet(file);
            // dirty
            input.resolve().then(function (model) {
                model.textEditorModel.setValue('foo bar');
                assert.ok(model.isDirty());
                model.textEditorModel.setValue('');
                assert.ok(model.isDirty());
                input.dispose();
                done();
            });
        });
        test('Untitled created with files.defaultLanguage setting', function () {
            var defaultLanguage = 'javascript';
            var config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            assert.equal(input.getModeId(), defaultLanguage);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
            input.dispose();
        });
        test('Untitled created with modeId overrides files.defaultLanguage setting', function () {
            var modeId = 'typescript';
            var defaultLanguage = 'javascript';
            var config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            var service = accessor.untitledEditorService;
            var input = service.createOrGet(null, modeId);
            assert.equal(input.getModeId(), modeId);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
            input.dispose();
        });
        test('encoding change event', function (done) {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            var counter = 0;
            service.onDidChangeEncoding(function (r) {
                counter++;
                assert.equal(r.toString(), input.getResource().toString());
            });
            // dirty
            input.resolve().then(function (model) {
                model.setEncoding('utf16');
                assert.equal(counter, 1);
                input.dispose();
                done();
            });
        });
        test('onDidChangeContent event', function (done) {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            untitledEditorModel_1.UntitledEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY = 0;
            var counter = 0;
            service.onDidChangeContent(function (r) {
                counter++;
                assert.equal(r.toString(), input.getResource().toString());
            });
            input.resolve().then(function (model) {
                model.textEditorModel.setValue('foo');
                assert.equal(counter, 0, 'Dirty model should not trigger event immediately');
                winjs_base_1.TPromise.timeout(3).then(function () {
                    assert.equal(counter, 1, 'Dirty model should trigger event');
                    model.textEditorModel.setValue('bar');
                    winjs_base_1.TPromise.timeout(3).then(function () {
                        assert.equal(counter, 2, 'Content change when dirty should trigger event');
                        model.textEditorModel.setValue('');
                        winjs_base_1.TPromise.timeout(3).then(function () {
                            assert.equal(counter, 3, 'Manual revert should trigger event');
                            model.textEditorModel.setValue('foo');
                            winjs_base_1.TPromise.timeout(3).then(function () {
                                assert.equal(counter, 4, 'Dirty model should trigger event');
                                model.revert();
                                winjs_base_1.TPromise.timeout(3).then(function () {
                                    assert.equal(counter, 5, 'Revert should trigger event');
                                    input.dispose();
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        test('onDidDisposeModel event', function (done) {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            var counter = 0;
            service.onDidDisposeModel(function (r) {
                counter++;
                assert.equal(r.toString(), input.getResource().toString());
            });
            input.resolve().then(function (model) {
                assert.equal(counter, 0);
                input.dispose();
                assert.equal(counter, 1);
                done();
            });
        });
    });
});
