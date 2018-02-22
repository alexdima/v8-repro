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
define(["require", "exports", "vs/base/common/winjs.base", "vs/workbench/services/untitled/common/untitledEditorService", "vs/base/common/errors", "vs/workbench/services/backup/common/backup", "vs/workbench/services/group/common/groupService", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/network", "vs/platform/lifecycle/common/lifecycle", "vs/platform/files/common/files"], function (require, exports, winjs_base_1, untitledEditorService_1, errors, backup_1, groupService_1, editorService_1, editor_1, textfiles_1, network_1, lifecycle_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var BackupRestorer = /** @class */ (function () {
        function BackupRestorer(untitledEditorService, editorService, backupFileService, textFileService, groupService, lifecycleService, fileService) {
            this.untitledEditorService = untitledEditorService;
            this.editorService = editorService;
            this.backupFileService = backupFileService;
            this.textFileService = textFileService;
            this.groupService = groupService;
            this.lifecycleService = lifecycleService;
            this.fileService = fileService;
            this.restoreBackups();
        }
        BackupRestorer.prototype.restoreBackups = function () {
            var _this = this;
            if (this.backupFileService.backupEnabled) {
                this.lifecycleService.when(lifecycle_1.LifecyclePhase.Running).then(function () {
                    _this.doRestoreBackups().done(null, errors.onUnexpectedError);
                });
            }
        };
        BackupRestorer.prototype.doRestoreBackups = function () {
            var _this = this;
            // Find all files and untitled with backups
            return this.backupFileService.getWorkspaceFileBackups().then(function (backups) {
                // Resolve backups that are opened in stacks model
                return _this.doResolveOpenedBackups(backups).then(function (unresolved) {
                    // Some failed to restore or were not opened at all so we open and resolve them manually
                    if (unresolved.length > 0) {
                        return _this.doOpenEditors(unresolved).then(function () { return _this.doResolveOpenedBackups(unresolved); });
                    }
                    return void 0;
                });
            });
        };
        BackupRestorer.prototype.doResolveOpenedBackups = function (backups) {
            var _this = this;
            var stacks = this.groupService.getStacksModel();
            var restorePromises = [];
            var unresolved = [];
            backups.forEach(function (backup) {
                if (stacks.isOpen(backup)) {
                    if (_this.fileService.canHandleResource(backup)) {
                        restorePromises.push(_this.textFileService.models.loadOrCreate(backup).then(null, function () { return unresolved.push(backup); }));
                    }
                    else if (backup.scheme === network_1.Schemas.untitled) {
                        restorePromises.push(_this.untitledEditorService.loadOrCreate({ resource: backup }).then(null, function () { return unresolved.push(backup); }));
                    }
                }
                else {
                    unresolved.push(backup);
                }
            });
            return winjs_base_1.TPromise.join(restorePromises).then(function () { return unresolved; }, function () { return unresolved; });
        };
        BackupRestorer.prototype.doOpenEditors = function (resources) {
            var _this = this;
            var stacks = this.groupService.getStacksModel();
            var hasOpenedEditors = stacks.groups.length > 0;
            var inputs = resources.map(function (resource, index) { return _this.resolveInput(resource, index, hasOpenedEditors); });
            // Open all remaining backups as editors and resolve them to load their backups
            return this.editorService.openEditors(inputs.map(function (input) { return { input: input, position: editor_1.Position.ONE }; })).then(function () { return void 0; });
        };
        BackupRestorer.prototype.resolveInput = function (resource, index, hasOpenedEditors) {
            var options = { pinned: true, preserveFocus: true, inactive: index > 0 || hasOpenedEditors };
            if (resource.scheme === network_1.Schemas.untitled && !BackupRestorer.UNTITLED_REGEX.test(resource.fsPath)) {
                return { filePath: resource.fsPath, options: options };
            }
            return { resource: resource, options: options };
        };
        BackupRestorer.UNTITLED_REGEX = /Untitled-\d+/;
        BackupRestorer = __decorate([
            __param(0, untitledEditorService_1.IUntitledEditorService),
            __param(1, editorService_1.IWorkbenchEditorService),
            __param(2, backup_1.IBackupFileService),
            __param(3, textfiles_1.ITextFileService),
            __param(4, groupService_1.IEditorGroupService),
            __param(5, lifecycle_1.ILifecycleService),
            __param(6, files_1.IFileService)
        ], BackupRestorer);
        return BackupRestorer;
    }());
    exports.BackupRestorer = BackupRestorer;
});
