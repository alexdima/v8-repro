var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/paths", "vs/workbench/common/editor", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/parts/files/common/editors/fileEditorInput", "vs/workbench/services/group/common/groupService", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/map", "vs/platform/workspace/common/workspace", "vs/editor/browser/editorBrowser", "vs/workbench/browser/parts/editor/sideBySideEditor"], function (require, exports, winjs_base_1, errors, paths, editor_1, files_1, textfiles_1, files_2, fileEditorInput_1, groupService_1, lifecycle_1, editorService_1, lifecycle_2, arrays_1, environment_1, configuration_1, platform_1, async_1, map_1, workspace_1, editorBrowser_1, sideBySideEditor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileEditorTracker = /** @class */ (function () {
        function FileEditorTracker(editorService, textFileService, lifecycleService, editorGroupService, fileService, environmentService, configurationService, contextService) {
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.lifecycleService = lifecycleService;
            this.editorGroupService = editorGroupService;
            this.fileService = fileService;
            this.environmentService = environmentService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.toUnbind = [];
            this.modelLoadQueue = new async_1.ResourceQueue();
            this.activeOutOfWorkspaceWatchers = new map_1.ResourceMap();
            this.onConfigurationUpdated(configurationService.getValue());
            this.registerListeners();
        }
        FileEditorTracker.prototype.registerListeners = function () {
            var _this = this;
            // Update editors from operation changes
            this.toUnbind.push(this.fileService.onAfterOperation(function (e) { return _this.onFileOperation(e); }));
            // Update editors from disk changes
            this.toUnbind.push(this.fileService.onFileChanges(function (e) { return _this.onFileChanges(e); }));
            // Editor changing
            this.toUnbind.push(this.editorGroupService.onEditorsChanged(function () { return _this.onEditorsChanged(); }));
            // Lifecycle
            this.lifecycleService.onShutdown(this.dispose, this);
            // Configuration
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationUpdated(_this.configurationService.getValue()); }));
        };
        FileEditorTracker.prototype.onConfigurationUpdated = function (configuration) {
            if (configuration.workbench && configuration.workbench.editor && typeof configuration.workbench.editor.closeOnFileDelete === 'boolean') {
                this.closeOnFileDelete = configuration.workbench.editor.closeOnFileDelete;
            }
            else {
                this.closeOnFileDelete = true; // default
            }
        };
        // Note: there is some duplication with the other file event handler below. Since we cannot always rely on the disk events
        // carrying all necessary data in all environments, we also use the file operation events to make sure operations are handled.
        // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
        // that the event ordering is random as well as might not carry all information needed.
        FileEditorTracker.prototype.onFileOperation = function (e) {
            // Handle moves specially when file is opened
            if (e.operation === files_2.FileOperation.MOVE) {
                this.handleMovedFileInOpenedEditors(e.resource, e.target.resource);
            }
            // Handle deletes
            if (e.operation === files_2.FileOperation.DELETE || e.operation === files_2.FileOperation.MOVE) {
                this.handleDeletes(e.resource, false, e.target ? e.target.resource : void 0);
            }
        };
        FileEditorTracker.prototype.onFileChanges = function (e) {
            // Handle updates
            this.handleUpdates(e);
            // Handle deletes
            if (e.gotDeleted()) {
                this.handleDeletes(e, true);
            }
        };
        FileEditorTracker.prototype.handleDeletes = function (arg1, isExternal, movedTo) {
            var _this = this;
            var nonDirtyFileEditors = this.getOpenedFileEditors(false /* non-dirty only */);
            nonDirtyFileEditors.forEach(function (editor) {
                var resource = editor.getResource();
                // Handle deletes in opened editors depending on:
                // - the user has not disabled the setting closeOnFileDelete
                // - the file change is local or external
                // - the input is not resolved (we need to dispose because we cannot restore otherwise since we do not have the contents)
                if (_this.closeOnFileDelete || !isExternal || !editor.isResolved()) {
                    // Do NOT close any opened editor that matches the resource path (either equal or being parent) of the
                    // resource we move to (movedTo). Otherwise we would close a resource that has been renamed to the same
                    // path but different casing.
                    if (movedTo && paths.isEqualOrParent(resource.fsPath, movedTo.fsPath, !platform_1.isLinux /* ignorecase */) && resource.fsPath.indexOf(movedTo.fsPath) === 0) {
                        return;
                    }
                    var matches = false;
                    if (arg1 instanceof files_2.FileChangesEvent) {
                        matches = arg1.contains(resource, files_2.FileChangeType.DELETED);
                    }
                    else {
                        matches = paths.isEqualOrParent(resource.fsPath, arg1.fsPath, !platform_1.isLinux /* ignorecase */);
                    }
                    if (!matches) {
                        return;
                    }
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/Microsoft/vscode/issues/13665).
                    // Since we do not want to close an editor without reason, we have to check if the
                    // file is really gone and not just a faulty file event.
                    // This only applies to external file events, so we need to check for the isExternal
                    // flag.
                    var checkExists = void 0;
                    if (isExternal) {
                        checkExists = winjs_base_1.TPromise.timeout(100).then(function () { return _this.fileService.existsFile(resource); });
                    }
                    else {
                        checkExists = winjs_base_1.TPromise.as(false);
                    }
                    checkExists.done(function (exists) {
                        if (!exists && !editor.isDisposed()) {
                            editor.dispose();
                        }
                        else if (_this.environmentService.verbose) {
                            console.warn("File exists even though we received a delete event: " + resource.toString());
                        }
                    });
                }
            });
        };
        FileEditorTracker.prototype.getOpenedFileEditors = function (dirtyState) {
            var editors = [];
            var stacks = this.editorGroupService.getStacksModel();
            stacks.groups.forEach(function (group) {
                group.getEditors().forEach(function (editor) {
                    if (editor instanceof fileEditorInput_1.FileEditorInput) {
                        if (!!editor.isDirty() === dirtyState) {
                            editors.push(editor);
                        }
                    }
                    else if (editor instanceof editor_1.SideBySideEditorInput) {
                        var master = editor.master;
                        var details = editor.details;
                        if (master instanceof fileEditorInput_1.FileEditorInput) {
                            if (!!master.isDirty() === dirtyState) {
                                editors.push(master);
                            }
                        }
                        if (details instanceof fileEditorInput_1.FileEditorInput) {
                            if (!!details.isDirty() === dirtyState) {
                                editors.push(details);
                            }
                        }
                    }
                });
            });
            return editors;
        };
        FileEditorTracker.prototype.handleMovedFileInOpenedEditors = function (oldResource, newResource) {
            var _this = this;
            var stacks = this.editorGroupService.getStacksModel();
            stacks.groups.forEach(function (group) {
                group.getEditors().forEach(function (input) {
                    if (input instanceof fileEditorInput_1.FileEditorInput) {
                        var resource = input.getResource();
                        // Update Editor if file (or any parent of the input) got renamed or moved
                        if (paths.isEqualOrParent(resource.fsPath, oldResource.fsPath, !platform_1.isLinux /* ignorecase */)) {
                            var reopenFileResource = void 0;
                            if (oldResource.toString() === resource.toString()) {
                                reopenFileResource = newResource; // file got moved
                            }
                            else {
                                var index = files_2.indexOf(resource.path, oldResource.path, !platform_1.isLinux /* ignorecase */);
                                reopenFileResource = newResource.with({ path: paths.join(newResource.path, resource.path.substr(index + oldResource.path.length + 1)) }); // parent folder got moved
                            }
                            // Reopen
                            _this.editorService.openEditor({
                                resource: reopenFileResource,
                                options: {
                                    preserveFocus: true,
                                    pinned: group.isPinned(input),
                                    index: group.indexOf(input),
                                    inactive: !group.isActive(input),
                                    viewState: _this.getViewStateFor(oldResource, group)
                                }
                            }, stacks.positionOfGroup(group)).done(null, errors.onUnexpectedError);
                        }
                    }
                });
            });
        };
        FileEditorTracker.prototype.getViewStateFor = function (resource, group) {
            var stacks = this.editorGroupService.getStacksModel();
            var editors = this.editorService.getVisibleEditors();
            for (var i = 0; i < editors.length; i++) {
                var editor = editors[i];
                if (editor && editor.input && editor.position === stacks.positionOfGroup(group)) {
                    var editorResource = editor.input.getResource();
                    if (editorResource && resource.toString() === editorResource.toString()) {
                        var control = editor.getControl();
                        if (editorBrowser_1.isCodeEditor(control)) {
                            return control.saveViewState();
                        }
                    }
                }
            }
            return void 0;
        };
        FileEditorTracker.prototype.handleUpdates = function (e) {
            // Handle updates to visible binary editors
            this.handleUpdatesToVisibleBinaryEditors(e);
            // Handle updates to text models
            this.handleUpdatesToTextModels(e);
        };
        FileEditorTracker.prototype.handleUpdatesToVisibleBinaryEditors = function (e) {
            var _this = this;
            var editors = this.editorService.getVisibleEditors();
            editors.forEach(function (editor) {
                var resource = editor_1.toResource(editor.input, { supportSideBySide: true });
                // Support side-by-side binary editors too
                var isBinaryEditor = false;
                if (editor instanceof sideBySideEditor_1.SideBySideEditor) {
                    isBinaryEditor = editor.getMasterEditor().getId() === files_1.BINARY_FILE_EDITOR_ID;
                }
                else {
                    isBinaryEditor = editor.getId() === files_1.BINARY_FILE_EDITOR_ID;
                }
                // Binary editor that should reload from event
                if (resource && isBinaryEditor && (e.contains(resource, files_2.FileChangeType.UPDATED) || e.contains(resource, files_2.FileChangeType.ADDED))) {
                    _this.editorService.openEditor(editor.input, { forceOpen: true, preserveFocus: true }, editor.position).done(null, errors.onUnexpectedError);
                }
            });
        };
        FileEditorTracker.prototype.handleUpdatesToTextModels = function (e) {
            var _this = this;
            // Collect distinct (saved) models to update.
            //
            // Note: we also consider the added event because it could be that a file was added
            // and updated right after.
            arrays_1.distinct(e.getUpdated().concat(e.getAdded()).map(function (u) { return _this.textFileService.models.get(u.resource); })
                .filter(function (model) { return model && !model.isDirty(); }), function (m) { return m.getResource().toString(); })
                .forEach(function (model) { return _this.queueModelLoad(model); });
        };
        FileEditorTracker.prototype.queueModelLoad = function (model) {
            // Load model to update (use a queue to prevent accumulation of loads
            // when the load actually takes long. At most we only want the queue
            // to have a size of 2 (1 running load and 1 queued load).
            var queue = this.modelLoadQueue.queueFor(model.getResource());
            if (queue.size <= 1) {
                queue.queue(function () { return model.load().then(null, errors.onUnexpectedError); });
            }
        };
        FileEditorTracker.prototype.onEditorsChanged = function () {
            this.handleOutOfWorkspaceWatchers();
        };
        FileEditorTracker.prototype.handleOutOfWorkspaceWatchers = function () {
            var _this = this;
            var visibleOutOfWorkspacePaths = new map_1.ResourceMap();
            this.editorService.getVisibleEditors().map(function (editor) {
                return editor_1.toResource(editor.input, { supportSideBySide: true });
            }).filter(function (resource) {
                return !!resource && _this.fileService.canHandleResource(resource) && !_this.contextService.isInsideWorkspace(resource);
            }).forEach(function (resource) {
                visibleOutOfWorkspacePaths.set(resource, resource);
            });
            // Handle no longer visible out of workspace resources
            this.activeOutOfWorkspaceWatchers.forEach(function (resource) {
                if (!visibleOutOfWorkspacePaths.get(resource)) {
                    _this.fileService.unwatchFileChanges(resource);
                    _this.activeOutOfWorkspaceWatchers.delete(resource);
                }
            });
            // Handle newly visible out of workspace resources
            visibleOutOfWorkspacePaths.forEach(function (resource) {
                if (!_this.activeOutOfWorkspaceWatchers.get(resource)) {
                    _this.fileService.watchFileChanges(resource);
                    _this.activeOutOfWorkspaceWatchers.set(resource, resource);
                }
            });
        };
        FileEditorTracker.prototype.dispose = function () {
            var _this = this;
            this.toUnbind = lifecycle_2.dispose(this.toUnbind);
            // Dispose watchers if any
            this.activeOutOfWorkspaceWatchers.forEach(function (resource) { return _this.fileService.unwatchFileChanges(resource); });
            this.activeOutOfWorkspaceWatchers.clear();
        };
        FileEditorTracker = __decorate([
            __param(0, editorService_1.IWorkbenchEditorService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, lifecycle_1.ILifecycleService),
            __param(3, groupService_1.IEditorGroupService),
            __param(4, files_2.IFileService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, configuration_1.IConfigurationService),
            __param(7, workspace_1.IWorkspaceContextService)
        ], FileEditorTracker);
        return FileEditorTracker;
    }());
    exports.FileEditorTracker = FileEditorTracker;
});
