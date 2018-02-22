var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/parts/files/common/explorerModel", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workbench/common/contextkeys"], function (require, exports, uri_1, files_1, explorerModel_1, contextkey_1, lifecycle_1, errors_1, modelService_1, modeService_1, textfiles_1, contextkeys_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Explorer viewlet id.
     */
    exports.VIEWLET_ID = 'workbench.view.explorer';
    /**
     * Context Keys to use with keybindings for the Explorer and Open Editors view
     */
    var explorerViewletVisibleId = 'explorerViewletVisible';
    var filesExplorerFocusId = 'filesExplorerFocus';
    var openEditorsVisibleId = 'openEditorsVisible';
    var openEditorsFocusId = 'openEditorsFocus';
    var explorerViewletFocusId = 'explorerViewletFocus';
    var explorerResourceIsFolderId = 'explorerResourceIsFolder';
    var explorerResourceIsRootId = 'explorerResourceIsRoot';
    exports.ExplorerViewletVisibleContext = new contextkey_1.RawContextKey(explorerViewletVisibleId, true);
    exports.ExplorerFolderContext = new contextkey_1.RawContextKey(explorerResourceIsFolderId, false);
    exports.ExplorerRootContext = new contextkey_1.RawContextKey(explorerResourceIsRootId, false);
    exports.FilesExplorerFocusedContext = new contextkey_1.RawContextKey(filesExplorerFocusId, true);
    exports.OpenEditorsVisibleContext = new contextkey_1.RawContextKey(openEditorsVisibleId, false);
    exports.OpenEditorsFocusedContext = new contextkey_1.RawContextKey(openEditorsFocusId, true);
    exports.ExplorerFocusedContext = new contextkey_1.RawContextKey(explorerViewletFocusId, true);
    exports.OpenEditorsVisibleCondition = contextkey_1.ContextKeyExpr.has(openEditorsVisibleId);
    exports.FilesExplorerFocusCondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(explorerViewletVisibleId), contextkey_1.ContextKeyExpr.has(filesExplorerFocusId), contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    exports.ExplorerFocusCondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(explorerViewletVisibleId), contextkey_1.ContextKeyExpr.has(explorerViewletFocusId), contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    /**
     * File editor input id.
     */
    exports.FILE_EDITOR_INPUT_ID = 'workbench.editors.files.fileEditorInput';
    /**
     * Text file editor id.
     */
    exports.TEXT_FILE_EDITOR_ID = 'workbench.editors.files.textFileEditor';
    /**
     * Binary file editor id.
     */
    exports.BINARY_FILE_EDITOR_ID = 'workbench.editors.files.binaryFileEditor';
    /**
     * Helper to get an explorer item from an object.
     */
    function explorerItemToFileResource(obj) {
        if (obj instanceof explorerModel_1.FileStat) {
            var stat = obj;
            return {
                resource: stat.resource,
                isDirectory: stat.isDirectory
            };
        }
        if (obj instanceof explorerModel_1.OpenEditor) {
            var editor = obj;
            var resource = editor.getResource();
            if (resource) {
                return {
                    resource: resource
                };
            }
        }
        return null;
    }
    exports.explorerItemToFileResource = explorerItemToFileResource;
    exports.SortOrderConfiguration = {
        DEFAULT: 'default',
        MIXED: 'mixed',
        FILES_FIRST: 'filesFirst',
        TYPE: 'type',
        MODIFIED: 'modified'
    };
    var FileOnDiskContentProvider = /** @class */ (function () {
        function FileOnDiskContentProvider(textFileService, fileService, modeService, modelService) {
            this.textFileService = textFileService;
            this.fileService = fileService;
            this.modeService = modeService;
            this.modelService = modelService;
        }
        FileOnDiskContentProvider.prototype.provideTextContent = function (resource) {
            var _this = this;
            var fileOnDiskResource = uri_1.default.file(resource.fsPath);
            // Make sure our file from disk is resolved up to date
            return this.resolveEditorModel(resource).then(function (codeEditorModel) {
                // Make sure to keep contents on disk up to date when it changes
                if (!_this.fileWatcher) {
                    _this.fileWatcher = _this.fileService.onFileChanges(function (changes) {
                        if (changes.contains(fileOnDiskResource, files_1.FileChangeType.UPDATED)) {
                            _this.resolveEditorModel(resource, false /* do not create if missing */).done(null, errors_1.onUnexpectedError); // update model when resource changes
                        }
                    });
                    var disposeListener_1 = codeEditorModel.onWillDispose(function () {
                        disposeListener_1.dispose();
                        _this.fileWatcher = lifecycle_1.dispose(_this.fileWatcher);
                    });
                }
                return codeEditorModel;
            });
        };
        FileOnDiskContentProvider.prototype.resolveEditorModel = function (resource, createAsNeeded) {
            var _this = this;
            if (createAsNeeded === void 0) { createAsNeeded = true; }
            var fileOnDiskResource = uri_1.default.file(resource.fsPath);
            return this.textFileService.resolveTextContent(fileOnDiskResource).then(function (content) {
                var codeEditorModel = _this.modelService.getModel(resource);
                if (codeEditorModel) {
                    _this.modelService.updateModel(codeEditorModel, content.value);
                }
                else if (createAsNeeded) {
                    var fileOnDiskModel = _this.modelService.getModel(fileOnDiskResource);
                    var mode = void 0;
                    if (fileOnDiskModel) {
                        mode = _this.modeService.getOrCreateMode(fileOnDiskModel.getModeId());
                    }
                    else {
                        mode = _this.modeService.getOrCreateModeByFilenameOrFirstLine(fileOnDiskResource.fsPath);
                    }
                    codeEditorModel = _this.modelService.createModel(content.value, mode, resource);
                }
                return codeEditorModel;
            });
        };
        FileOnDiskContentProvider.prototype.dispose = function () {
            this.fileWatcher = lifecycle_1.dispose(this.fileWatcher);
        };
        FileOnDiskContentProvider = __decorate([
            __param(0, textfiles_1.ITextFileService),
            __param(1, files_1.IFileService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService)
        ], FileOnDiskContentProvider);
        return FileOnDiskContentProvider;
    }());
    exports.FileOnDiskContentProvider = FileOnDiskContentProvider;
});
