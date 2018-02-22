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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "assert", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/test/workbenchTestServices", "vs/base/test/common/utils", "vs/editor/common/services/resolverService", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/untitled/common/untitledEditorService", "vs/base/common/event", "vs/platform/files/common/files"], function (require, exports, assert, winjs_base_1, uri_1, resourceEditorInput_1, workbenchTestServices_1, utils_1, resolverService_1, modelService_1, modeService_1, textFileEditorModel_1, textfiles_1, untitledEditorService_1, event_1, files_1) {
    'use strict';
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(textModelResolverService, modelService, modeService, textFileService, untitledEditorService) {
            this.textModelResolverService = textModelResolverService;
            this.modelService = modelService;
            this.modeService = modeService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
        }
        ServiceAccessor = __decorate([
            __param(0, resolverService_1.ITextModelService),
            __param(1, modelService_1.IModelService),
            __param(2, modeService_1.IModeService),
            __param(3, textfiles_1.ITextFileService),
            __param(4, untitledEditorService_1.IUntitledEditorService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('Workbench - TextModelResolverService', function () {
        var instantiationService;
        var accessor;
        var model;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        teardown(function () {
            if (model) {
                model.dispose();
                model = void 0;
            }
            accessor.textFileService.models.clear();
            accessor.textFileService.models.dispose();
            accessor.untitledEditorService.revertAll();
        });
        test('resolve resource', function (done) {
            var dispose = accessor.textModelResolverService.registerTextModelContentProvider('test', {
                provideTextContent: function (resource) {
                    if (resource.scheme === 'test') {
                        var modelContent = 'Hello Test';
                        var mode = accessor.modeService.getOrCreateMode('json');
                        return winjs_base_1.TPromise.as(accessor.modelService.createModel(modelContent, mode, resource));
                    }
                    return winjs_base_1.TPromise.as(null);
                }
            });
            var resource = uri_1.default.from({ scheme: 'test', authority: null, path: 'thePath' });
            var input = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, 'The Name', 'The Description', resource);
            input.resolve().then(function (model) {
                assert.ok(model);
                assert.equal(files_1.snapshotToString(model.createSnapshot()), 'Hello Test');
                var disposed = false;
                event_1.once(model.onDispose)(function () {
                    disposed = true;
                });
                input.dispose();
                assert.equal(disposed, true);
                dispose.dispose();
                done();
            });
        });
        test('resolve file', function () {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file_resolver.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            return model.load().then(function () {
                return accessor.textModelResolverService.createModelReference(model.getResource()).then(function (ref) {
                    var model = ref.object;
                    var editorModel = model.textEditorModel;
                    assert.ok(editorModel);
                    assert.equal(editorModel.getValue(), 'Hello Html');
                    var disposed = false;
                    event_1.once(model.onDispose)(function () {
                        disposed = true;
                    });
                    ref.dispose();
                    assert.equal(disposed, true);
                });
            });
        });
        test('resolve untitled', function () {
            var service = accessor.untitledEditorService;
            var input = service.createOrGet();
            return input.resolve().then(function () {
                return accessor.textModelResolverService.createModelReference(input.getResource()).then(function (ref) {
                    var model = ref.object;
                    var editorModel = model.textEditorModel;
                    assert.ok(editorModel);
                    ref.dispose();
                    input.dispose();
                });
            });
        });
        test('even loading documents should be refcounted', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var resolveModel, waitForIt, disposable, uri, modelRefPromise1, modelRefPromise2, modelRef1, model1, modelRef2, model2, textModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        waitForIt = new winjs_base_1.TPromise(function (c) { return resolveModel = c; });
                        disposable = accessor.textModelResolverService.registerTextModelContentProvider('test', {
                            provideTextContent: function (resource) { return __awaiter(_this, void 0, winjs_base_1.TPromise, function () {
                                var modelContent, mode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, waitForIt];
                                        case 1:
                                            _a.sent();
                                            modelContent = 'Hello Test';
                                            mode = accessor.modeService.getOrCreateMode('json');
                                            return [2 /*return*/, accessor.modelService.createModel(modelContent, mode, resource)];
                                    }
                                });
                            }); }
                        });
                        uri = uri_1.default.from({ scheme: 'test', authority: null, path: 'thePath' });
                        modelRefPromise1 = accessor.textModelResolverService.createModelReference(uri);
                        modelRefPromise2 = accessor.textModelResolverService.createModelReference(uri);
                        resolveModel();
                        return [4 /*yield*/, modelRefPromise1];
                    case 1:
                        modelRef1 = _a.sent();
                        model1 = modelRef1.object;
                        return [4 /*yield*/, modelRefPromise2];
                    case 2:
                        modelRef2 = _a.sent();
                        model2 = modelRef2.object;
                        textModel = model1.textEditorModel;
                        assert.equal(model1, model2, 'they are the same model');
                        assert(!textModel.isDisposed(), 'the text model should not be disposed');
                        modelRef1.dispose();
                        assert(!textModel.isDisposed(), 'the text model should still not be disposed');
                        modelRef2.dispose();
                        assert(textModel.isDisposed(), 'the text model should finally be disposed');
                        disposable.dispose();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
