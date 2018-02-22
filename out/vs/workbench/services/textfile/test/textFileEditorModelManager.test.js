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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/winjs.base", "vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/base/common/paths", "vs/workbench/test/workbenchTestServices", "vs/base/test/common/utils", "vs/workbench/services/group/common/groupService", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/files/common/files", "vs/editor/common/services/modelService"], function (require, exports, assert, uri_1, winjs_base_1, textFileEditorModelManager_1, paths_1, workbenchTestServices_1, utils_1, groupService_1, textFileEditorModel_1, files_1, modelService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestTextFileEditorModelManager = /** @class */ (function (_super) {
        __extends(TestTextFileEditorModelManager, _super);
        function TestTextFileEditorModelManager() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestTextFileEditorModelManager.prototype.debounceDelay = function () {
            return 10;
        };
        return TestTextFileEditorModelManager;
    }(textFileEditorModelManager_1.TextFileEditorModelManager));
    exports.TestTextFileEditorModelManager = TestTextFileEditorModelManager;
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(editorGroupService, fileService, modelService) {
            this.editorGroupService = editorGroupService;
            this.fileService = fileService;
            this.modelService = modelService;
        }
        ServiceAccessor = __decorate([
            __param(0, groupService_1.IEditorGroupService),
            __param(1, files_1.IFileService),
            __param(2, modelService_1.IModelService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    function toResource(path) {
        return uri_1.default.file(paths_1.join('C:\\', path));
    }
    suite('Files - TextFileEditorModelManager', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        test('add, remove, clear, get, getAll', function () {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var model1 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random1.txt'), 'utf8');
            var model2 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random2.txt'), 'utf8');
            var model3 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random3.txt'), 'utf8');
            manager.add(uri_1.default.file('/test.html'), model1);
            manager.add(uri_1.default.file('/some/other.html'), model2);
            manager.add(uri_1.default.file('/some/this.txt'), model3);
            var fileUpper = uri_1.default.file('/TEST.html');
            assert(!manager.get(uri_1.default.file('foo')));
            assert.strictEqual(manager.get(uri_1.default.file('/test.html')), model1);
            assert.ok(!manager.get(fileUpper));
            var result = manager.getAll();
            assert.strictEqual(3, result.length);
            result = manager.getAll(uri_1.default.file('/yes'));
            assert.strictEqual(0, result.length);
            result = manager.getAll(uri_1.default.file('/some/other.txt'));
            assert.strictEqual(0, result.length);
            result = manager.getAll(uri_1.default.file('/some/other.html'));
            assert.strictEqual(1, result.length);
            result = manager.getAll(fileUpper);
            assert.strictEqual(0, result.length);
            manager.remove(uri_1.default.file(''));
            result = manager.getAll();
            assert.strictEqual(3, result.length);
            manager.remove(uri_1.default.file('/some/other.html'));
            result = manager.getAll();
            assert.strictEqual(2, result.length);
            manager.remove(fileUpper);
            result = manager.getAll();
            assert.strictEqual(2, result.length);
            manager.clear();
            result = manager.getAll();
            assert.strictEqual(0, result.length);
            model1.dispose();
            model2.dispose();
            model3.dispose();
        });
        test('loadOrCreate', function (done) {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var resource = uri_1.default.file('/test.html');
            var encoding = 'utf8';
            manager.loadOrCreate(resource, { encoding: encoding, reload: true }).done(function (model) {
                assert.ok(model);
                assert.equal(model.getEncoding(), encoding);
                assert.equal(manager.get(resource), model);
                return manager.loadOrCreate(resource, { encoding: encoding }).then(function (model2) {
                    assert.equal(model2, model);
                    model.dispose();
                    return manager.loadOrCreate(resource, { encoding: encoding }).then(function (model3) {
                        assert.notEqual(model3, model2);
                        assert.equal(manager.get(resource), model3);
                        model3.dispose();
                        done();
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('removed from cache when model disposed', function () {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var model1 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random1.txt'), 'utf8');
            var model2 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random2.txt'), 'utf8');
            var model3 = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, toResource('/path/random3.txt'), 'utf8');
            manager.add(uri_1.default.file('/test.html'), model1);
            manager.add(uri_1.default.file('/some/other.html'), model2);
            manager.add(uri_1.default.file('/some/this.txt'), model3);
            assert.strictEqual(manager.get(uri_1.default.file('/test.html')), model1);
            model1.dispose();
            assert(!manager.get(uri_1.default.file('/test.html')));
            model2.dispose();
            model3.dispose();
        });
        test('events', function (done) {
            textFileEditorModel_1.TextFileEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY = 0;
            textFileEditorModel_1.TextFileEditorModel.DEFAULT_ORPHANED_CHANGE_BUFFER_DELAY = 0;
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var resource1 = toResource('/path/index.txt');
            var resource2 = toResource('/path/other.txt');
            var dirtyCounter = 0;
            var revertedCounter = 0;
            var savedCounter = 0;
            var encodingCounter = 0;
            var disposeCounter = 0;
            var contentCounter = 0;
            manager.onModelDirty(function (e) {
                if (e.resource.toString() === resource1.toString()) {
                    dirtyCounter++;
                }
            });
            manager.onModelReverted(function (e) {
                if (e.resource.toString() === resource1.toString()) {
                    revertedCounter++;
                }
            });
            manager.onModelSaved(function (e) {
                if (e.resource.toString() === resource1.toString()) {
                    savedCounter++;
                }
            });
            manager.onModelEncodingChanged(function (e) {
                if (e.resource.toString() === resource1.toString()) {
                    encodingCounter++;
                }
            });
            manager.onModelContentChanged(function (e) {
                if (e.resource.toString() === resource1.toString()) {
                    contentCounter++;
                }
            });
            manager.onModelDisposed(function (e) {
                disposeCounter++;
            });
            manager.loadOrCreate(resource1, { encoding: 'utf8' }).done(function (model1) {
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: resource1, type: files_1.FileChangeType.DELETED }]));
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: resource1, type: files_1.FileChangeType.ADDED }]));
                return manager.loadOrCreate(resource2, { encoding: 'utf8' }).then(function (model2) {
                    model1.textEditorModel.setValue('changed');
                    model1.updatePreferredEncoding('utf16');
                    return model1.revert().then(function () {
                        model1.textEditorModel.setValue('changed again');
                        return model1.save().then(function () {
                            model1.dispose();
                            model2.dispose();
                            assert.equal(disposeCounter, 2);
                            return model1.revert().then(function () {
                                assert.equal(dirtyCounter, 2);
                                assert.equal(revertedCounter, 1);
                                assert.equal(savedCounter, 1);
                                assert.equal(encodingCounter, 2);
                                // content change event if done async
                                winjs_base_1.TPromise.timeout(10).then(function () {
                                    assert.equal(contentCounter, 2);
                                    model1.dispose();
                                    model2.dispose();
                                    assert.ok(!accessor.modelService.getModel(resource1));
                                    assert.ok(!accessor.modelService.getModel(resource2));
                                    done();
                                });
                            });
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('events debounced', function (done) {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var resource1 = toResource('/path/index.txt');
            var resource2 = toResource('/path/other.txt');
            var dirtyCounter = 0;
            var revertedCounter = 0;
            var savedCounter = 0;
            textFileEditorModel_1.TextFileEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY = 0;
            manager.onModelsDirty(function (e) {
                dirtyCounter += e.length;
                assert.equal(e[0].resource.toString(), resource1.toString());
            });
            manager.onModelsReverted(function (e) {
                revertedCounter += e.length;
                assert.equal(e[0].resource.toString(), resource1.toString());
            });
            manager.onModelsSaved(function (e) {
                savedCounter += e.length;
                assert.equal(e[0].resource.toString(), resource1.toString());
            });
            manager.loadOrCreate(resource1, { encoding: 'utf8' }).done(function (model1) {
                return manager.loadOrCreate(resource2, { encoding: 'utf8' }).then(function (model2) {
                    model1.textEditorModel.setValue('changed');
                    model1.updatePreferredEncoding('utf16');
                    return model1.revert().then(function () {
                        model1.textEditorModel.setValue('changed again');
                        return model1.save().then(function () {
                            model1.dispose();
                            model2.dispose();
                            return model1.revert().then(function () {
                                return winjs_base_1.TPromise.timeout(20).then(function () {
                                    assert.equal(dirtyCounter, 2);
                                    assert.equal(revertedCounter, 1);
                                    assert.equal(savedCounter, 1);
                                    model1.dispose();
                                    model2.dispose();
                                    assert.ok(!accessor.modelService.getModel(resource1));
                                    assert.ok(!accessor.modelService.getModel(resource2));
                                    done();
                                });
                            });
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('disposing model takes it out of the manager', function (done) {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var resource = toResource('/path/index_something.txt');
            manager.loadOrCreate(resource, { encoding: 'utf8' }).done(function (model) {
                model.dispose();
                assert.ok(!manager.get(resource));
                assert.ok(!accessor.modelService.getModel(model.getResource()));
                manager.dispose();
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('dispose prevents dirty model from getting disposed', function (done) {
            var manager = instantiationService.createInstance(TestTextFileEditorModelManager);
            var resource = toResource('/path/index_something.txt');
            manager.loadOrCreate(resource, { encoding: 'utf8' }).done(function (model) {
                model.textEditorModel.setValue('make dirty');
                manager.disposeModel(model);
                assert.ok(!model.isDisposed());
                model.revert(true);
                manager.disposeModel(model);
                assert.ok(model.isDisposed());
                manager.dispose();
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
    });
});
