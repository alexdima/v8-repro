var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/paths", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/workbenchTestServices", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/platform/editor/common/editor", "vs/workbench/services/group/common/groupService", "vs/editor/common/services/modelService"], function (require, exports, assert, uri_1, paths_1, fileEditorInput_1, editorService_1, workbenchTestServices_1, editor_1, textfiles_1, files_1, editor_2, groupService_1, modelService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function toResource(self, path) {
        return uri_1.default.file(paths_1.join('C:\\', new Buffer(self.test.fullTitle()).toString('base64'), path));
    }
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(editorService, textFileService, modelService, editorGroupService) {
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.modelService = modelService;
            this.editorGroupService = editorGroupService;
        }
        ServiceAccessor = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, modelService_1.IModelService),
            __param(3, groupService_1.IEditorGroupService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('Files - FileEditorInput', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        test('Basics', function (done) {
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/file.js'), void 0);
            var otherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, 'foo/bar/otherfile.js'), void 0);
            var otherInputSame = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, 'foo/bar/file.js'), void 0);
            assert(input.matches(input));
            assert(input.matches(otherInputSame));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert.ok(input.getName());
            assert.ok(input.getDescription());
            assert.ok(input.getTitle(editor_2.Verbosity.SHORT));
            assert.strictEqual('file.js', input.getName());
            assert.strictEqual(toResource(this, '/foo/bar/file.js').fsPath, input.getResource().fsPath);
            assert(input.getResource() instanceof uri_1.default);
            input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar.html'), void 0);
            var inputToResolve = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/file.js'), void 0);
            var sameOtherInput = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/file.js'), void 0);
            return inputToResolve.resolve(true).then(function (resolved) {
                assert.ok(inputToResolve.isResolved());
                var resolvedModelA = resolved;
                return inputToResolve.resolve(true).then(function (resolved) {
                    assert(resolvedModelA === resolved); // OK: Resolved Model cached globally per input
                    return sameOtherInput.resolve(true).then(function (otherResolved) {
                        assert(otherResolved === resolvedModelA); // OK: Resolved Model cached globally per input
                        inputToResolve.dispose();
                        return inputToResolve.resolve(true).then(function (resolved) {
                            assert(resolvedModelA === resolved); // Model is still the same because we had 2 clients
                            inputToResolve.dispose();
                            sameOtherInput.dispose();
                            resolvedModelA.dispose();
                            return inputToResolve.resolve(true).then(function (resolved) {
                                assert(resolvedModelA !== resolved); // Different instance, because input got disposed
                                var stat = resolved.getStat();
                                return inputToResolve.resolve(true).then(function (resolved) {
                                    assert(stat !== resolved.getStat()); // Different stat, because resolve always goes to the server for refresh
                                    stat = resolved.getStat();
                                    return inputToResolve.resolve(false).then(function (resolved) {
                                        assert(stat === resolved.getStat()); // Same stat, because not refreshed
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        test('matches', function () {
            var input1 = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            var input2 = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            var input3 = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/other.js'), void 0);
            var input2Upper = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/UPDATEFILE.js'), void 0);
            assert.strictEqual(input1.matches(null), false);
            assert.strictEqual(input1.matches(input1), true);
            assert.strictEqual(input1.matches(input2), true);
            assert.strictEqual(input1.matches(input3), false);
            assert.strictEqual(input1.matches(input2Upper), false);
        });
        test('getEncoding/setEncoding', function (done) {
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            input.setEncoding('utf16', editor_1.EncodingMode.Encode);
            assert.equal(input.getEncoding(), 'utf16');
            return input.resolve(true).then(function (resolved) {
                assert.equal(input.getEncoding(), resolved.getEncoding());
                resolved.dispose();
                done();
            });
        });
        test('save', function (done) {
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            return input.resolve(true).then(function (resolved) {
                resolved.textEditorModel.setValue('changed');
                assert.ok(input.isDirty());
                input.save().then(function () {
                    assert.ok(!input.isDirty());
                    resolved.dispose();
                    done();
                });
            });
        });
        test('revert', function (done) {
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            return input.resolve(true).then(function (resolved) {
                resolved.textEditorModel.setValue('changed');
                assert.ok(input.isDirty());
                input.revert().then(function () {
                    assert.ok(!input.isDirty());
                    resolved.dispose();
                    done();
                });
            });
        });
        test('resolve handles binary files', function (done) {
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, toResource(this, '/foo/bar/updatefile.js'), void 0);
            accessor.textFileService.setResolveTextContentErrorOnce(new files_1.FileOperationError('error', files_1.FileOperationResult.FILE_IS_BINARY));
            return input.resolve(true).then(function (resolved) {
                assert.ok(resolved);
                resolved.dispose();
                done();
            });
        });
        test('disposes model when not open anymore', function (done) {
            var resource = toResource(this, '/path/index.txt');
            var input = workbenchTestServices_1.createFileInput(instantiationService, resource);
            input.resolve().then(function (model) {
                var stacks = accessor.editorGroupService.getStacksModel();
                var group = stacks.openGroup('group', true);
                group.openEditor(input);
                accessor.editorGroupService.fireChange();
                assert.ok(!model.isDisposed());
                group.closeEditor(input);
                accessor.editorGroupService.fireChange();
                assert.ok(model.isDisposed());
                model.dispose();
                assert.ok(!accessor.modelService.getModel(model.getResource()));
                done();
            });
        });
    });
});
