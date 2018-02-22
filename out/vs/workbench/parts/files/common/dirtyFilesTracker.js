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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/platform", "vs/platform/editor/common/editor", "vs/platform/windows/common/windows", "vs/workbench/services/group/common/groupService", "vs/platform/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/activity/common/activity", "vs/workbench/services/untitled/common/untitledEditorService", "vs/base/common/arrays"], function (require, exports, nls, errors, files_1, textfiles_1, platform_1, editor_1, windows_1, groupService_1, lifecycle_1, lifecycle_2, editorService_1, activity_1, untitledEditorService_1, arrays) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DirtyFilesTracker = /** @class */ (function () {
        function DirtyFilesTracker(textFileService, lifecycleService, editorGroupService, editorService, activityService, windowService, untitledEditorService) {
            this.textFileService = textFileService;
            this.lifecycleService = lifecycleService;
            this.editorService = editorService;
            this.activityService = activityService;
            this.windowService = windowService;
            this.untitledEditorService = untitledEditorService;
            this.toUnbind = [];
            this.isDocumentedEdited = false;
            this.stacks = editorGroupService.getStacksModel();
            this.registerListeners();
        }
        DirtyFilesTracker.prototype.registerListeners = function () {
            var _this = this;
            // Local text file changes
            this.toUnbind.push(this.untitledEditorService.onDidChangeDirty(function (e) { return _this.onUntitledDidChangeDirty(e); }));
            this.toUnbind.push(this.textFileService.models.onModelsDirty(function (e) { return _this.onTextFilesDirty(e); }));
            this.toUnbind.push(this.textFileService.models.onModelsSaved(function (e) { return _this.onTextFilesSaved(e); }));
            this.toUnbind.push(this.textFileService.models.onModelsSaveError(function (e) { return _this.onTextFilesSaveError(e); }));
            this.toUnbind.push(this.textFileService.models.onModelsReverted(function (e) { return _this.onTextFilesReverted(e); }));
            // Lifecycle
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        DirtyFilesTracker.prototype.onUntitledDidChangeDirty = function (resource) {
            var gotDirty = this.untitledEditorService.isDirty(resource);
            if ((!this.isDocumentedEdited && gotDirty) || (this.isDocumentedEdited && !gotDirty)) {
                this.updateDocumentEdited();
            }
            if (gotDirty || this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        DirtyFilesTracker.prototype.onTextFilesDirty = function (e) {
            var _this = this;
            if ((this.textFileService.getAutoSaveMode() !== textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY) && !this.isDocumentedEdited) {
                this.updateDocumentEdited(); // no indication needed when auto save is enabled for short delay
            }
            if (this.textFileService.getAutoSaveMode() !== textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                this.updateActivityBadge(); // no indication needed when auto save is enabled for short delay
            }
            // If files become dirty but are not opened, we open it in the background unless there are pending to be saved
            this.doOpenDirtyResources(arrays.distinct(e.filter(function (e) {
                // Only dirty models that are not PENDING_SAVE
                var model = _this.textFileService.models.get(e.resource);
                var shouldOpen = model && model.isDirty() && !model.hasState(textfiles_1.ModelState.PENDING_SAVE);
                // Only if not open already
                return shouldOpen && !_this.stacks.isOpen(e.resource);
            }).map(function (e) { return e.resource; }), function (r) { return r.toString(); }));
        };
        DirtyFilesTracker.prototype.doOpenDirtyResources = function (resources) {
            var activeEditor = this.editorService.getActiveEditor();
            var activePosition = activeEditor ? activeEditor.position : editor_1.Position.ONE;
            // Open
            this.editorService.openEditors(resources.map(function (resource) {
                return {
                    input: {
                        resource: resource,
                        options: { inactive: true, pinned: true, preserveFocus: true }
                    },
                    position: activePosition
                };
            })).done(null, errors.onUnexpectedError);
        };
        DirtyFilesTracker.prototype.onTextFilesSaved = function (e) {
            if (this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
            if (this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        DirtyFilesTracker.prototype.onTextFilesSaveError = function (e) {
            if (!this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
            this.updateActivityBadge();
        };
        DirtyFilesTracker.prototype.onTextFilesReverted = function (e) {
            if (this.isDocumentedEdited) {
                this.updateDocumentEdited();
            }
            if (this.lastDirtyCount > 0) {
                this.updateActivityBadge();
            }
        };
        DirtyFilesTracker.prototype.updateActivityBadge = function () {
            var dirtyCount = this.textFileService.getDirty().length;
            this.lastDirtyCount = dirtyCount;
            lifecycle_2.dispose(this.badgeHandle);
            if (dirtyCount > 0) {
                this.badgeHandle = this.activityService.showActivity(files_1.VIEWLET_ID, new activity_1.NumberBadge(dirtyCount, function (num) { return num === 1 ? nls.localize('dirtyFile', "1 unsaved file") : nls.localize('dirtyFiles', "{0} unsaved files", dirtyCount); }), 'explorer-viewlet-label');
            }
        };
        DirtyFilesTracker.prototype.updateDocumentEdited = function () {
            if (platform_1.platform === platform_1.Platform.Mac) {
                var hasDirtyFiles = this.textFileService.isDirty();
                this.isDocumentedEdited = hasDirtyFiles;
                this.windowService.setDocumentEdited(hasDirtyFiles);
            }
        };
        DirtyFilesTracker.prototype.dispose = function () {
            this.toUnbind = lifecycle_2.dispose(this.toUnbind);
        };
        DirtyFilesTracker = __decorate([
            __param(0, textfiles_1.ITextFileService),
            __param(1, lifecycle_1.ILifecycleService),
            __param(2, groupService_1.IEditorGroupService),
            __param(3, editorService_1.IWorkbenchEditorService),
            __param(4, activity_1.IActivityService),
            __param(5, windows_1.IWindowService),
            __param(6, untitledEditorService_1.IUntitledEditorService)
        ], DirtyFilesTracker);
        return DirtyFilesTracker;
    }());
    exports.DirtyFilesTracker = DirtyFilesTracker;
});
