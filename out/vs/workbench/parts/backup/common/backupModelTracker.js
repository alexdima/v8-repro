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
define(["require", "exports", "vs/base/common/errors", "vs/workbench/services/backup/common/backup", "vs/base/common/lifecycle", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/untitled/common/untitledEditorService", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files"], function (require, exports, errors, backup_1, lifecycle_1, textfiles_1, untitledEditorService_1, configuration_1, files_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var AUTO_SAVE_AFTER_DELAY_DISABLED_TIME = files_1.CONTENT_CHANGE_EVENT_BUFFER_DELAY + 500;
    var BackupModelTracker = /** @class */ (function () {
        function BackupModelTracker(backupFileService, textFileService, untitledEditorService, configurationService) {
            this.backupFileService = backupFileService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
            this.configurationService = configurationService;
            this.toDispose = [];
            this.registerListeners();
        }
        BackupModelTracker.prototype.registerListeners = function () {
            var _this = this;
            if (!this.backupFileService.backupEnabled) {
                return;
            }
            // Listen for text file model changes
            this.toDispose.push(this.textFileService.models.onModelContentChanged(function (e) { return _this.onTextFileModelChanged(e); }));
            this.toDispose.push(this.textFileService.models.onModelSaved(function (e) { return _this.discardBackup(e.resource); }));
            this.toDispose.push(this.textFileService.models.onModelDisposed(function (e) { return _this.discardBackup(e); }));
            // Listen for untitled model changes
            this.toDispose.push(this.untitledEditorService.onDidChangeContent(function (e) { return _this.onUntitledModelChanged(e); }));
            this.toDispose.push(this.untitledEditorService.onDidDisposeModel(function (e) { return _this.discardBackup(e); }));
            // Listen to config changes
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChange(_this.configurationService.getValue()); }));
        };
        BackupModelTracker.prototype.onConfigurationChange = function (configuration) {
            if (!configuration || !configuration.files) {
                this.configuredAutoSaveAfterDelay = false;
                return;
            }
            this.configuredAutoSaveAfterDelay =
                (configuration.files.autoSave === files_1.AutoSaveConfiguration.AFTER_DELAY &&
                    configuration.files.autoSaveDelay <= AUTO_SAVE_AFTER_DELAY_DISABLED_TIME);
        };
        BackupModelTracker.prototype.onTextFileModelChanged = function (event) {
            if (event.kind === textfiles_1.StateChange.REVERTED) {
                // This must proceed even if auto save after delay is configured in order to clean up
                // any backups made before the config change
                this.discardBackup(event.resource);
            }
            else if (event.kind === textfiles_1.StateChange.CONTENT_CHANGE) {
                // Do not backup when auto save after delay is configured
                if (!this.configuredAutoSaveAfterDelay) {
                    var model = this.textFileService.models.get(event.resource);
                    this.backupFileService.backupResource(model.getResource(), model.createSnapshot(), model.getVersionId()).done(null, errors.onUnexpectedError);
                }
            }
        };
        BackupModelTracker.prototype.onUntitledModelChanged = function (resource) {
            var _this = this;
            if (this.untitledEditorService.isDirty(resource)) {
                this.untitledEditorService.loadOrCreate({ resource: resource }).then(function (model) { return _this.backupFileService.backupResource(resource, model.createSnapshot(), model.getVersionId()); }).done(null, errors.onUnexpectedError);
            }
            else {
                this.discardBackup(resource);
            }
        };
        BackupModelTracker.prototype.discardBackup = function (resource) {
            this.backupFileService.discardResourceBackup(resource).done(null, errors.onUnexpectedError);
        };
        BackupModelTracker.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        BackupModelTracker = __decorate([
            __param(0, backup_1.IBackupFileService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, configuration_1.IConfigurationService)
        ], BackupModelTracker);
        return BackupModelTracker;
    }());
    exports.BackupModelTracker = BackupModelTracker;
});
