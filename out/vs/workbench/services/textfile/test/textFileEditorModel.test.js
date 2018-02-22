/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/test/workbenchTestServices", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/editor/common/services/modelService"], function (require, exports, assert, winjs_base_1, editor_1, textFileEditorModel_1, textfiles_1, workbenchTestServices_1, utils_1, files_1, modelService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(textFileService, modelService, fileService) {
            this.textFileService = textFileService;
            this.modelService = modelService;
            this.fileService = fileService;
        }
        ServiceAccessor = __decorate([
            __param(0, textfiles_1.ITextFileService), __param(1, modelService_1.IModelService), __param(2, files_1.IFileService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    function getLastModifiedTime(model) {
        var stat = model.getStat();
        return stat ? stat.mtime : -1;
    }
    suite('Files - TextFileEditorModel', function () {
        var instantiationService;
        var accessor;
        var content;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
            content = accessor.fileService.getContent();
        });
        teardown(function () {
            accessor.textFileService.models.clear();
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant(null); // reset any set participant
            accessor.fileService.setContent(content);
        });
        test('Save', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                model.textEditorModel.setValue('bar');
                assert.ok(getLastModifiedTime(model) <= Date.now());
                return model.save().then(function () {
                    assert.ok(model.getLastSaveAttemptTime() <= Date.now());
                    assert.ok(!model.isDirty());
                    model.dispose();
                    assert.ok(!accessor.modelService.getModel(model.getResource()));
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('setEncoding - encode', function () {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.setEncoding('utf8', editor_1.EncodingMode.Encode); // no-op
            assert.equal(getLastModifiedTime(model), -1);
            model.setEncoding('utf16', editor_1.EncodingMode.Encode);
            assert.ok(getLastModifiedTime(model) <= Date.now()); // indicates model was saved due to encoding change
            model.dispose();
        });
        test('setEncoding - decode', function () {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.setEncoding('utf16', editor_1.EncodingMode.Decode);
            assert.ok(model.isResolved()); // model got loaded due to decoding
            model.dispose();
        });
        test('disposes when underlying model is destroyed', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                model.textEditorModel.dispose();
                assert.ok(model.isDisposed());
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Load does not trigger save', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index.txt'), 'utf8');
            assert.ok(model.hasState(textfiles_1.ModelState.SAVED));
            model.onDidStateChange(function (e) {
                assert.ok(e !== textfiles_1.StateChange.DIRTY && e !== textfiles_1.StateChange.SAVED);
            });
            model.load().done(function () {
                assert.ok(model.isResolved());
                model.dispose();
                assert.ok(!accessor.modelService.getModel(model.getResource()));
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Load returns dirty model as long as model is dirty', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(model.isDirty());
                assert.ok(model.hasState(textfiles_1.ModelState.DIRTY));
                return model.load().then(function () {
                    assert.ok(model.isDirty());
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Revert', function (done) {
            var eventCounter = 0;
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.onDidStateChange(function (e) {
                if (e === textfiles_1.StateChange.REVERTED) {
                    eventCounter++;
                }
            });
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(model.isDirty());
                return model.revert().then(function () {
                    assert.ok(!model.isDirty());
                    assert.equal(model.textEditorModel.getValue(), 'Hello Html');
                    assert.equal(eventCounter, 1);
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Revert (soft)', function (done) {
            var eventCounter = 0;
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.onDidStateChange(function (e) {
                if (e === textfiles_1.StateChange.REVERTED) {
                    eventCounter++;
                }
            });
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(model.isDirty());
                return model.revert(true /* soft revert */).then(function () {
                    assert.ok(!model.isDirty());
                    assert.equal(model.textEditorModel.getValue(), 'foo');
                    assert.equal(eventCounter, 1);
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Load and undo turns model dirty', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                accessor.fileService.setContent('Hello Change');
                model.load().done(function () {
                    model.textEditorModel.undo();
                    assert.ok(model.isDirty());
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('File not modified error is handled gracefully', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                var mtime = getLastModifiedTime(model);
                accessor.textFileService.setResolveTextContentErrorOnce(new files_1.FileOperationError('error', files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE));
                return model.load().then(function (model) {
                    assert.ok(model);
                    assert.equal(getLastModifiedTime(model), mtime);
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Load error is handled gracefully if model already exists', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.load().done(function () {
                accessor.textFileService.setResolveTextContentErrorOnce(new files_1.FileOperationError('error', files_1.FileOperationResult.FILE_NOT_FOUND));
                return model.load().then(function (model) {
                    assert.ok(model);
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('save() and isDirty() - proper with check for mtimes', function (done) {
            var _this = this;
            var input1 = workbenchTestServices_1.createFileInput(instantiationService, utils_1.toResource.call(this, '/path/index_async2.txt'));
            var input2 = workbenchTestServices_1.createFileInput(instantiationService, utils_1.toResource.call(this, '/path/index_async.txt'));
            input1.resolve().done(function (model1) {
                return input2.resolve().then(function (model2) {
                    model1.textEditorModel.setValue('foo');
                    var m1Mtime = model1.getStat().mtime;
                    var m2Mtime = model2.getStat().mtime;
                    assert.ok(m1Mtime > 0);
                    assert.ok(m2Mtime > 0);
                    assert.ok(accessor.textFileService.isDirty());
                    assert.ok(accessor.textFileService.isDirty(utils_1.toResource.call(_this, '/path/index_async2.txt')));
                    assert.ok(!accessor.textFileService.isDirty(utils_1.toResource.call(_this, '/path/index_async.txt')));
                    model2.textEditorModel.setValue('foo');
                    assert.ok(accessor.textFileService.isDirty(utils_1.toResource.call(_this, '/path/index_async.txt')));
                    return winjs_base_1.TPromise.timeout(10).then(function () {
                        accessor.textFileService.saveAll().then(function () {
                            assert.ok(!accessor.textFileService.isDirty(utils_1.toResource.call(_this, '/path/index_async.txt')));
                            assert.ok(!accessor.textFileService.isDirty(utils_1.toResource.call(_this, '/path/index_async2.txt')));
                            assert.ok(model1.getStat().mtime > m1Mtime);
                            assert.ok(model2.getStat().mtime > m2Mtime);
                            assert.ok(model1.getLastSaveAttemptTime() > m1Mtime);
                            assert.ok(model2.getLastSaveAttemptTime() > m2Mtime);
                            model1.dispose();
                            model2.dispose();
                            done();
                        });
                    });
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Save Participant', function (done) {
            var eventCounter = 0;
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            model.onDidStateChange(function (e) {
                if (e === textfiles_1.StateChange.SAVED) {
                    assert.equal(files_1.snapshotToString(model.createSnapshot()), 'bar');
                    assert.ok(!model.isDirty());
                    eventCounter++;
                }
            });
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant({
                participate: function (model) {
                    assert.ok(model.isDirty());
                    model.textEditorModel.setValue('bar');
                    assert.ok(model.isDirty());
                    eventCounter++;
                    return undefined;
                }
            });
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                return model.save().then(function () {
                    model.dispose();
                    assert.equal(eventCounter, 2);
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Save Participant, async participant', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant({
                participate: function (model) {
                    return winjs_base_1.TPromise.timeout(10);
                }
            });
            return model.load().done(function () {
                model.textEditorModel.setValue('foo');
                var now = Date.now();
                return model.save().then(function () {
                    assert.ok(Date.now() - now >= 10);
                    model.dispose();
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('Save Participant, bad participant', function (done) {
            var model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/index_async.txt'), 'utf8');
            textFileEditorModel_1.TextFileEditorModel.setSaveParticipant({
                participate: function (model) {
                    return winjs_base_1.TPromise.wrapError(new Error('boom'));
                }
            });
            return model.load().then(function () {
                model.textEditorModel.setValue('foo');
                return model.save().then(function () {
                    assert.ok(true);
                    model.dispose();
                    done();
                }, function (err) {
                    assert.ok(false);
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('SaveSequentializer - pending basics', function (done) {
            var sequentializer = new textFileEditorModel_1.SaveSequentializer();
            assert.ok(!sequentializer.hasPendingSave());
            assert.ok(!sequentializer.hasPendingSave(2323));
            assert.ok(!sequentializer.pendingSave);
            // pending removes itself after done
            sequentializer.setPending(1, winjs_base_1.TPromise.as(null));
            assert.ok(!sequentializer.hasPendingSave());
            assert.ok(!sequentializer.hasPendingSave(1));
            assert.ok(!sequentializer.pendingSave);
            // pending removes itself after done (use timeout)
            sequentializer.setPending(2, winjs_base_1.TPromise.timeout(1));
            assert.ok(sequentializer.hasPendingSave());
            assert.ok(sequentializer.hasPendingSave(2));
            assert.ok(!sequentializer.hasPendingSave(1));
            assert.ok(sequentializer.pendingSave);
            return winjs_base_1.TPromise.timeout(2).then(function () {
                assert.ok(!sequentializer.hasPendingSave());
                assert.ok(!sequentializer.hasPendingSave(2));
                assert.ok(!sequentializer.pendingSave);
                done();
            });
        });
        test('SaveSequentializer - pending and next (finishes instantly)', function (done) {
            var sequentializer = new textFileEditorModel_1.SaveSequentializer();
            var pendingDone = false;
            sequentializer.setPending(1, winjs_base_1.TPromise.timeout(1).then(function () { pendingDone = true; return null; }));
            // next finishes instantly
            var nextDone = false;
            var res = sequentializer.setNext(function () { return winjs_base_1.TPromise.as(null).then(function () { nextDone = true; return null; }); });
            return res.done(function () {
                assert.ok(pendingDone);
                assert.ok(nextDone);
                done();
            });
        });
        test('SaveSequentializer - pending and next (finishes after timeout)', function (done) {
            var sequentializer = new textFileEditorModel_1.SaveSequentializer();
            var pendingDone = false;
            sequentializer.setPending(1, winjs_base_1.TPromise.timeout(1).then(function () { pendingDone = true; return null; }));
            // next finishes after timeout
            var nextDone = false;
            var res = sequentializer.setNext(function () { return winjs_base_1.TPromise.timeout(1).then(function () { nextDone = true; return null; }); });
            return res.done(function () {
                assert.ok(pendingDone);
                assert.ok(nextDone);
                done();
            });
        });
        test('SaveSequentializer - pending and multiple next (last one wins)', function (done) {
            var sequentializer = new textFileEditorModel_1.SaveSequentializer();
            var pendingDone = false;
            sequentializer.setPending(1, winjs_base_1.TPromise.timeout(1).then(function () { pendingDone = true; return null; }));
            // next finishes after timeout
            var firstDone = false;
            var firstRes = sequentializer.setNext(function () { return winjs_base_1.TPromise.timeout(2).then(function () { firstDone = true; return null; }); });
            var secondDone = false;
            var secondRes = sequentializer.setNext(function () { return winjs_base_1.TPromise.timeout(3).then(function () { secondDone = true; return null; }); });
            var thirdDone = false;
            var thirdRes = sequentializer.setNext(function () { return winjs_base_1.TPromise.timeout(4).then(function () { thirdDone = true; return null; }); });
            return winjs_base_1.TPromise.join([firstRes, secondRes, thirdRes]).then(function () {
                assert.ok(pendingDone);
                assert.ok(!firstDone);
                assert.ok(!secondDone);
                assert.ok(thirdDone);
                done();
            });
        });
    });
});
