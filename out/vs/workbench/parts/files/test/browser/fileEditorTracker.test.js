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
define(["require", "exports", "assert", "vs/workbench/parts/files/browser/editors/fileEditorTracker", "vs/base/common/uri", "vs/base/common/paths", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/workbenchTestServices", "vs/workbench/services/group/common/groupService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/base/common/event"], function (require, exports, assert, fileEditorTracker_1, uri_1, paths_1, fileEditorInput_1, editorService_1, workbenchTestServices_1, groupService_1, textfiles_1, files_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestFileEditorTracker = /** @class */ (function (_super) {
        __extends(TestFileEditorTracker, _super);
        function TestFileEditorTracker() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TestFileEditorTracker.prototype.setCloseOnFileDelete = function (value) {
            this.closeOnFileDelete = value;
        };
        return TestFileEditorTracker;
    }(fileEditorTracker_1.FileEditorTracker));
    function toResource(self, path) {
        return uri_1.default.file(paths_1.join('C:\\', new Buffer(self.test.fullTitle()).toString('base64'), path));
    }
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(editorService, editorGroupService, textFileService, fileService) {
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.textFileService = textFileService;
            this.fileService = fileService;
        }
        ServiceAccessor = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, groupService_1.IEditorGroupService),
            __param(2, textfiles_1.ITextFileService),
            __param(3, files_1.IFileService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    suite('Files - FileEditorTracker', function () {
        var instantiationService;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        test('disposes input when resource gets deleted - local file changes', function () {
            var stacks = accessor.editorGroupService.getStacksModel();
            var group = stacks.openGroup('first', true);
            var tracker = instantiationService.createInstance(fileEditorTracker_1.FileEditorTracker);
            assert.ok(tracker);
            var parent = toResource(this, '/foo/bar');
            var resource = toResource(this, '/foo/bar/updatefile.js');
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            assert.ok(!input.isDisposed());
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(resource, files_1.FileOperation.DELETE));
            assert.ok(input.isDisposed());
            group.closeEditor(input);
            input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            var other = toResource(this, '/foo/barfoo');
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(other, files_1.FileOperation.DELETE));
            assert.ok(!input.isDisposed());
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(parent, files_1.FileOperation.DELETE));
            assert.ok(input.isDisposed());
            // Move
            var to = toResource(this, '/foo/barfoo/change.js');
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(resource, files_1.FileOperation.MOVE, to));
            assert.ok(input.isDisposed());
            tracker.dispose();
        });
        test('disposes input when resource gets deleted - local file changes - even when closeOnFileDelete = false', function () {
            var stacks = accessor.editorGroupService.getStacksModel();
            var group = stacks.openGroup('first', true);
            var tracker = instantiationService.createInstance(TestFileEditorTracker);
            tracker.setCloseOnFileDelete(false);
            assert.ok(tracker);
            var parent = toResource(this, '/foo/bar');
            var resource = toResource(this, '/foo/bar/updatefile.js');
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            assert.ok(!input.isDisposed());
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(resource, files_1.FileOperation.DELETE));
            assert.ok(input.isDisposed());
            group.closeEditor(input);
            input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            var other = toResource(this, '/foo/barfoo');
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(other, files_1.FileOperation.DELETE));
            assert.ok(!input.isDisposed());
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(parent, files_1.FileOperation.DELETE));
            assert.ok(input.isDisposed());
            // Move
            var to = toResource(this, '/foo/barfoo/change.js');
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(resource, files_1.FileOperation.MOVE, to));
            assert.ok(input.isDisposed());
            tracker.dispose();
        });
        test('disposes when resource gets deleted - remote file changes', function (done) {
            var _this = this;
            var stacks = accessor.editorGroupService.getStacksModel();
            var group = stacks.openGroup('first', true);
            var tracker = instantiationService.createInstance(fileEditorTracker_1.FileEditorTracker);
            assert.ok(tracker);
            var parent = toResource(this, '/foo/bar');
            var resource = toResource(this, '/foo/bar/updatefile.js');
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            assert.ok(!input.isDisposed());
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: resource, type: files_1.FileChangeType.DELETED }]));
            event_1.once(input.onDispose)(function () {
                assert.ok(input.isDisposed());
                group.closeEditor(input);
                input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
                group.openEditor(input);
                var other = toResource(_this, '/foo/barfoo');
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: other, type: files_1.FileChangeType.DELETED }]));
                assert.ok(!input.isDisposed());
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: parent, type: files_1.FileChangeType.DELETED }]));
                event_1.once(input.onDispose)(function () {
                    assert.ok(input.isDisposed());
                    tracker.dispose();
                    done();
                });
            });
        });
        test('keeps open when resource gets deleted - remote file changes - closeOnFileDelete = false', function () {
            var stacks = accessor.editorGroupService.getStacksModel();
            var group = stacks.openGroup('first', true);
            var tracker = instantiationService.createInstance(TestFileEditorTracker);
            tracker.setCloseOnFileDelete(false);
            assert.ok(tracker);
            var resource = toResource(this, '/foo/bar/updatefile.js');
            var input = instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, void 0);
            group.openEditor(input);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: resource, type: files_1.FileChangeType.DELETED }]));
            assert.ok(!input.isDisposed());
            tracker.dispose();
        });
        test('file change event updates model', function (done) {
            var tracker = instantiationService.createInstance(fileEditorTracker_1.FileEditorTracker);
            var resource = toResource(this, '/path/index.txt');
            accessor.textFileService.models.loadOrCreate(resource).then(function (model) {
                model.textEditorModel.setValue('Super Good');
                assert.equal(files_1.snapshotToString(model.createSnapshot()), 'Super Good');
                model.save().then(function () {
                    // change event (watcher)
                    accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource: resource, type: files_1.FileChangeType.UPDATED }]));
                    assert.equal(files_1.snapshotToString(model.createSnapshot()), 'Hello Html');
                    tracker.dispose();
                    done();
                });
            });
        });
    });
});
