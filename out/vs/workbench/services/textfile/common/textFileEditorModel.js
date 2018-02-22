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
define(["require", "exports", "vs/base/common/paths", "vs/nls", "vs/base/common/event", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/mime", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/paths", "vs/base/common/diagnostics", "vs/base/common/types", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/services/backup/common/backup", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/workbench/services/hash/common/hashService", "vs/editor/common/model/textModel"], function (require, exports, path, nls, event_1, winjs_base_1, errors_1, mime_1, errorMessage_1, lifecycle_1, paths, diagnostics, types, workspace_1, environment_1, textfiles_1, editor_1, textEditorModel_1, backup_1, files_1, instantiation_1, message_1, modeService_1, modelService_1, telemetry_1, async_1, hashService_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
     */
    var TextFileEditorModel = /** @class */ (function (_super) {
        __extends(TextFileEditorModel, _super);
        function TextFileEditorModel(resource, preferredEncoding, messageService, modeService, modelService, fileService, instantiationService, telemetryService, textFileService, backupFileService, environmentService, contextService, hashService) {
            var _this = _super.call(this, modelService, modeService) || this;
            _this.messageService = messageService;
            _this.fileService = fileService;
            _this.instantiationService = instantiationService;
            _this.telemetryService = telemetryService;
            _this.textFileService = textFileService;
            _this.backupFileService = backupFileService;
            _this.environmentService = environmentService;
            _this.contextService = contextService;
            _this.hashService = hashService;
            _this.resource = resource;
            _this.toDispose = [];
            _this._onDidContentChange = new event_1.Emitter();
            _this._onDidStateChange = new event_1.Emitter();
            _this.toDispose.push(_this._onDidContentChange);
            _this.toDispose.push(_this._onDidStateChange);
            _this.preferredEncoding = preferredEncoding;
            _this.inOrphanMode = false;
            _this.dirty = false;
            _this.versionId = 0;
            _this.lastSaveAttemptTime = 0;
            _this.saveSequentializer = new SaveSequentializer();
            _this.contentChangeEventScheduler = new async_1.RunOnceScheduler(function () { return _this._onDidContentChange.fire(textfiles_1.StateChange.CONTENT_CHANGE); }, TextFileEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY);
            _this.toDispose.push(_this.contentChangeEventScheduler);
            _this.orphanedChangeEventScheduler = new async_1.RunOnceScheduler(function () { return _this._onDidStateChange.fire(textfiles_1.StateChange.ORPHANED_CHANGE); }, TextFileEditorModel.DEFAULT_ORPHANED_CHANGE_BUFFER_DELAY);
            _this.toDispose.push(_this.orphanedChangeEventScheduler);
            _this.updateAutoSaveConfiguration(textFileService.getAutoSaveConfiguration());
            _this.registerListeners();
            return _this;
        }
        TextFileEditorModel.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.fileService.onFileChanges(function (e) { return _this.onFileChanges(e); }));
            this.toDispose.push(this.textFileService.onAutoSaveConfigurationChange(function (config) { return _this.updateAutoSaveConfiguration(config); }));
            this.toDispose.push(this.textFileService.onFilesAssociationChange(function (e) { return _this.onFilesAssociationChange(); }));
            this.toDispose.push(this.onDidStateChange(function (e) { return _this.onStateChange(e); }));
        };
        TextFileEditorModel.prototype.onStateChange = function (e) {
            if (e === textfiles_1.StateChange.REVERTED) {
                // Cancel any content change event promises as they are no longer valid.
                this.contentChangeEventScheduler.cancel();
                // Refire state change reverted events as content change events
                this._onDidContentChange.fire(textfiles_1.StateChange.REVERTED);
            }
        };
        TextFileEditorModel.prototype.onFileChanges = function (e) {
            var _this = this;
            // Track ADD and DELETES for updates of this model to orphan-mode
            var modelFileDeleted = e.contains(this.resource, files_1.FileChangeType.DELETED);
            var modelFileAdded = e.contains(this.resource, files_1.FileChangeType.ADDED);
            if (modelFileDeleted || modelFileAdded) {
                var newInOrphanModeGuess = modelFileDeleted && !modelFileAdded;
                if (this.inOrphanMode !== newInOrphanModeGuess) {
                    var checkOrphanedPromise = void 0;
                    if (newInOrphanModeGuess) {
                        // We have received reports of users seeing delete events even though the file still
                        // exists (network shares issue: https://github.com/Microsoft/vscode/issues/13665).
                        // Since we do not want to mark the model as orphaned, we have to check if the
                        // file is really gone and not just a faulty file event.
                        checkOrphanedPromise = winjs_base_1.TPromise.timeout(100).then(function () {
                            if (_this.disposed) {
                                return true;
                            }
                            return _this.fileService.existsFile(_this.resource).then(function (exists) { return !exists; });
                        });
                    }
                    else {
                        checkOrphanedPromise = winjs_base_1.TPromise.as(false);
                    }
                    checkOrphanedPromise.done(function (newInOrphanModeValidated) {
                        if (_this.inOrphanMode !== newInOrphanModeValidated && !_this.disposed) {
                            _this.setOrphaned(newInOrphanModeValidated);
                        }
                    });
                }
            }
        };
        TextFileEditorModel.prototype.setOrphaned = function (orphaned) {
            if (this.inOrphanMode !== orphaned) {
                this.inOrphanMode = orphaned;
                this.orphanedChangeEventScheduler.schedule();
            }
        };
        TextFileEditorModel.prototype.updateAutoSaveConfiguration = function (config) {
            if (typeof config.autoSaveDelay === 'number' && config.autoSaveDelay > 0) {
                this.autoSaveAfterMillies = config.autoSaveDelay;
                this.autoSaveAfterMilliesEnabled = true;
            }
            else {
                this.autoSaveAfterMillies = void 0;
                this.autoSaveAfterMilliesEnabled = false;
            }
        };
        TextFileEditorModel.prototype.onFilesAssociationChange = function () {
            this.updateTextEditorModelMode();
        };
        TextFileEditorModel.prototype.updateTextEditorModelMode = function (modeId) {
            if (!this.textEditorModel) {
                return;
            }
            var firstLineText = this.getFirstLineText(this.textEditorModel);
            var mode = this.getOrCreateMode(this.modeService, modeId, firstLineText);
            this.modelService.setMode(this.textEditorModel, mode);
        };
        Object.defineProperty(TextFileEditorModel.prototype, "onDidContentChange", {
            get: function () {
                return this._onDidContentChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModel.prototype, "onDidStateChange", {
            get: function () {
                return this._onDidStateChange.event;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * The current version id of the model.
         */
        TextFileEditorModel.prototype.getVersionId = function () {
            return this.versionId;
        };
        /**
         * Set a save error handler to install code that executes when save errors occur.
         */
        TextFileEditorModel.setSaveErrorHandler = function (handler) {
            TextFileEditorModel.saveErrorHandler = handler;
        };
        /**
         * Set a save participant handler to react on models getting saved.
         */
        TextFileEditorModel.setSaveParticipant = function (handler) {
            TextFileEditorModel.saveParticipant = handler;
        };
        /**
         * Discards any local changes and replaces the model with the contents of the version on disk.
         *
         * @param if the parameter soft is true, will not attempt to load the contents from disk.
         */
        TextFileEditorModel.prototype.revert = function (soft) {
            var _this = this;
            if (!this.isResolved()) {
                return winjs_base_1.TPromise.wrap(null);
            }
            // Cancel any running auto-save
            this.cancelAutoSavePromise();
            // Unset flags
            var undo = this.setDirty(false);
            var loadPromise;
            if (soft) {
                loadPromise = winjs_base_1.TPromise.as(this);
            }
            else {
                loadPromise = this.load(true /* force */);
            }
            return loadPromise.then(function () {
                // Emit file change event
                _this._onDidStateChange.fire(textfiles_1.StateChange.REVERTED);
            }, function (error) {
                // Set flags back to previous values, we are still dirty if revert failed
                undo();
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileEditorModel.prototype.load = function (force /* bypass any caches and really go to disk */) {
            diag('load() - enter', this.resource, new Date());
            // It is very important to not reload the model when the model is dirty. We only want to reload the model from the disk
            // if no save is pending to avoid data loss. This might cause a save conflict in case the file has been modified on the disk
            // meanwhile, but this is a very low risk.
            if (this.dirty) {
                diag('load() - exit - without loading because model is dirty', this.resource, new Date());
                return winjs_base_1.TPromise.as(this);
            }
            // Only for new models we support to load from backup
            if (!this.textEditorModel && !this.createTextEditorModelPromise) {
                return this.loadWithBackup(force);
            }
            // Otherwise load from file resource
            return this.loadFromFile(force);
        };
        TextFileEditorModel.prototype.loadWithBackup = function (force) {
            var _this = this;
            return this.backupFileService.loadBackupResource(this.resource).then(function (backup) {
                // Make sure meanwhile someone else did not suceed or start loading
                if (_this.createTextEditorModelPromise || _this.textEditorModel) {
                    return _this.createTextEditorModelPromise || winjs_base_1.TPromise.as(_this);
                }
                // If we have a backup, continue loading with it
                if (!!backup) {
                    var content = {
                        resource: _this.resource,
                        name: paths.basename(_this.resource.fsPath),
                        mtime: Date.now(),
                        etag: void 0,
                        value: textModel_1.createTextBufferFactory(''),
                        encoding: _this.fileService.getEncoding(_this.resource, _this.preferredEncoding)
                    };
                    return _this.loadWithContent(content, backup);
                }
                // Otherwise load from file
                return _this.loadFromFile(force);
            });
        };
        TextFileEditorModel.prototype.loadFromFile = function (force) {
            var _this = this;
            // Decide on etag
            var etag;
            if (force) {
                etag = void 0; // bypass cache if force loading is true
            }
            else if (this.lastResolvedDiskStat) {
                etag = this.lastResolvedDiskStat.etag; // otherwise respect etag to support caching
            }
            // Resolve Content
            return this.textFileService
                .resolveTextContent(this.resource, { acceptTextOnly: true, etag: etag, encoding: this.preferredEncoding })
                .then(function (content) { return _this.handleLoadSuccess(content); }, function (error) { return _this.handleLoadError(error); });
        };
        TextFileEditorModel.prototype.handleLoadSuccess = function (content) {
            // Clear orphaned state when load was successful
            this.setOrphaned(false);
            return this.loadWithContent(content);
        };
        TextFileEditorModel.prototype.handleLoadError = function (error) {
            var result = error.fileOperationResult;
            // Apply orphaned state based on error code
            this.setOrphaned(result === files_1.FileOperationResult.FILE_NOT_FOUND);
            // NotModified status is expected and can be handled gracefully
            if (result === files_1.FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
                this.setDirty(false); // Ensure we are not tracking a stale state
                return winjs_base_1.TPromise.as(this);
            }
            // Ignore when a model has been resolved once and the file was deleted meanwhile. Since
            // we already have the model loaded, we can return to this state and update the orphaned
            // flag to indicate that this model has no version on disk anymore.
            if (this.isResolved() && result === files_1.FileOperationResult.FILE_NOT_FOUND) {
                return winjs_base_1.TPromise.as(this);
            }
            // Otherwise bubble up the error
            return winjs_base_1.TPromise.wrapError(error);
        };
        TextFileEditorModel.prototype.loadWithContent = function (content, backup) {
            var _this = this;
            return this.doLoadWithContent(content, backup).then(function (model) {
                // Telemetry: We log the fileGet telemetry event after the model has been loaded to ensure a good mimetype
                if (_this.isSettingsFile()) {
                    /* __GDPR__
                        "settingsRead" : {}
                    */
                    _this.telemetryService.publicLog('settingsRead'); // Do not log read to user settings.json and .vscode folder as a fileGet event as it ruins our JSON usage data
                }
                else {
                    /* __GDPR__
                        "fileGet" : {
                            "mimeType" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "ext": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "path": { "classification": "CustomerContent", "purpose": "FeatureInsight" }
                        }
                    */
                    _this.telemetryService.publicLog('fileGet', { mimeType: mime_1.guessMimeTypes(_this.resource.fsPath).join(', '), ext: paths.extname(_this.resource.fsPath), path: _this.hashService.createSHA1(_this.resource.fsPath) });
                }
                return model;
            });
        };
        TextFileEditorModel.prototype.doLoadWithContent = function (content, backup) {
            diag('load() - resolved content', this.resource, new Date());
            // Update our resolved disk stat model
            var resolvedStat = {
                resource: this.resource,
                name: content.name,
                mtime: content.mtime,
                etag: content.etag,
                isDirectory: false,
                children: void 0
            };
            this.updateLastResolvedDiskStat(resolvedStat);
            // Keep the original encoding to not loose it when saving
            var oldEncoding = this.contentEncoding;
            this.contentEncoding = content.encoding;
            // Handle events if encoding changed
            if (this.preferredEncoding) {
                this.updatePreferredEncoding(this.contentEncoding); // make sure to reflect the real encoding of the file (never out of sync)
            }
            else if (oldEncoding !== this.contentEncoding) {
                this._onDidStateChange.fire(textfiles_1.StateChange.ENCODING);
            }
            // Update Existing Model
            if (this.textEditorModel) {
                return this.doUpdateTextModel(content.value);
            }
            else if (this.createTextEditorModelPromise) {
                diag('load() - join existing text editor model promise', this.resource, new Date());
                return this.createTextEditorModelPromise;
            }
            // Create New Model
            return this.doCreateTextModel(content.resource, content.value, backup);
        };
        TextFileEditorModel.prototype.doUpdateTextModel = function (value) {
            diag('load() - updated text editor model', this.resource, new Date());
            // Ensure we are not tracking a stale state
            this.setDirty(false);
            // Update model value in a block that ignores model content change events
            this.blockModelContentChange = true;
            try {
                this.updateTextEditorModel(value);
            }
            finally {
                this.blockModelContentChange = false;
            }
            // Ensure we track the latest saved version ID given that the contents changed
            this.updateSavedVersionId();
            return winjs_base_1.TPromise.as(this);
        };
        TextFileEditorModel.prototype.doCreateTextModel = function (resource, value, backup) {
            var _this = this;
            diag('load() - created text editor model', this.resource, new Date());
            this.createTextEditorModelPromise = this.doLoadBackup(backup).then(function (backupContent) {
                var hasBackupContent = !!backupContent;
                return _this.createTextEditorModel(hasBackupContent ? backupContent : value, resource).then(function () {
                    _this.createTextEditorModelPromise = null;
                    // We restored a backup so we have to set the model as being dirty
                    // We also want to trigger auto save if it is enabled to simulate the exact same behaviour
                    // you would get if manually making the model dirty (fixes https://github.com/Microsoft/vscode/issues/16977)
                    if (hasBackupContent) {
                        _this.makeDirty();
                        if (_this.autoSaveAfterMilliesEnabled) {
                            _this.doAutoSave(_this.versionId);
                        }
                    }
                    else {
                        _this.setDirty(false);
                    }
                    // Model Listeners
                    _this.installModelListeners();
                    return _this;
                }, function (error) {
                    _this.createTextEditorModelPromise = null;
                    return winjs_base_1.TPromise.wrapError(error);
                });
            });
            return this.createTextEditorModelPromise;
        };
        TextFileEditorModel.prototype.installModelListeners = function () {
            // See https://github.com/Microsoft/vscode/issues/30189
            // This code has been extracted to a different method because it caused a memory leak
            // where `value` was captured in the content change listener closure scope.
            var _this = this;
            // Content Change
            this.toDispose.push(this.textEditorModel.onDidChangeContent(function () { return _this.onModelContentChanged(); }));
        };
        TextFileEditorModel.prototype.doLoadBackup = function (backup) {
            if (!backup) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.backupFileService.resolveBackupContent(backup).then(function (backupContent) { return backupContent; }, function (error) { return null; } /* ignore errors */);
        };
        TextFileEditorModel.prototype.getOrCreateMode = function (modeService, preferredModeIds, firstLineText) {
            return modeService.getOrCreateModeByFilenameOrFirstLine(this.resource.fsPath, firstLineText);
        };
        TextFileEditorModel.prototype.onModelContentChanged = function () {
            diag("onModelContentChanged() - enter", this.resource, new Date());
            // In any case increment the version id because it tracks the textual content state of the model at all times
            this.versionId++;
            diag("onModelContentChanged() - new versionId " + this.versionId, this.resource, new Date());
            // Ignore if blocking model changes
            if (this.blockModelContentChange) {
                return;
            }
            // The contents changed as a matter of Undo and the version reached matches the saved one
            // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
            // Note: we currently only do this check when auto-save is turned off because there you see
            // a dirty indicator that you want to get rid of when undoing to the saved version.
            if (!this.autoSaveAfterMilliesEnabled && this.textEditorModel.getAlternativeVersionId() === this.bufferSavedVersionId) {
                diag('onModelContentChanged() - model content changed back to last saved version', this.resource, new Date());
                // Clear flags
                var wasDirty = this.dirty;
                this.setDirty(false);
                // Emit event
                if (wasDirty) {
                    this._onDidStateChange.fire(textfiles_1.StateChange.REVERTED);
                }
                return;
            }
            diag('onModelContentChanged() - model content changed and marked as dirty', this.resource, new Date());
            // Mark as dirty
            this.makeDirty();
            // Start auto save process unless we are in conflict resolution mode and unless it is disabled
            if (this.autoSaveAfterMilliesEnabled) {
                if (!this.inConflictMode) {
                    this.doAutoSave(this.versionId);
                }
                else {
                    diag('makeDirty() - prevented save because we are in conflict resolution mode', this.resource, new Date());
                }
            }
            // Handle content change events
            this.contentChangeEventScheduler.schedule();
        };
        TextFileEditorModel.prototype.makeDirty = function () {
            // Track dirty state and version id
            var wasDirty = this.dirty;
            this.setDirty(true);
            // Emit as Event if we turned dirty
            if (!wasDirty) {
                this._onDidStateChange.fire(textfiles_1.StateChange.DIRTY);
            }
        };
        TextFileEditorModel.prototype.doAutoSave = function (versionId) {
            var _this = this;
            diag("doAutoSave() - enter for versionId " + versionId, this.resource, new Date());
            // Cancel any currently running auto saves to make this the one that succeeds
            this.cancelAutoSavePromise();
            // Create new save promise and keep it
            this.autoSavePromise = winjs_base_1.TPromise.timeout(this.autoSaveAfterMillies).then(function () {
                // Only trigger save if the version id has not changed meanwhile
                if (versionId === _this.versionId) {
                    _this.doSave(versionId, { reason: textfiles_1.SaveReason.AUTO }).done(null, errors_1.onUnexpectedError); // Very important here to not return the promise because if the timeout promise is canceled it will bubble up the error otherwise - do not change
                }
            });
            return this.autoSavePromise;
        };
        TextFileEditorModel.prototype.cancelAutoSavePromise = function () {
            if (this.autoSavePromise) {
                this.autoSavePromise.cancel();
                this.autoSavePromise = void 0;
            }
        };
        /**
         * Saves the current versionId of this editor model if it is dirty.
         */
        TextFileEditorModel.prototype.save = function (options) {
            if (options === void 0) { options = Object.create(null); }
            if (!this.isResolved()) {
                return winjs_base_1.TPromise.wrap(null);
            }
            diag('save() - enter', this.resource, new Date());
            // Cancel any currently running auto saves to make this the one that succeeds
            this.cancelAutoSavePromise();
            return this.doSave(this.versionId, options);
        };
        TextFileEditorModel.prototype.doSave = function (versionId, options) {
            var _this = this;
            if (types.isUndefinedOrNull(options.reason)) {
                options.reason = textfiles_1.SaveReason.EXPLICIT;
            }
            diag("doSave(" + versionId + ") - enter with versionId ' + versionId", this.resource, new Date());
            // Lookup any running pending save for this versionId and return it if found
            //
            // Scenario: user invoked the save action multiple times quickly for the same contents
            //           while the save was not yet finished to disk
            //
            if (this.saveSequentializer.hasPendingSave(versionId)) {
                diag("doSave(" + versionId + ") - exit - found a pending save for versionId " + versionId, this.resource, new Date());
                return this.saveSequentializer.pendingSave;
            }
            // Return early if not dirty (unless forced) or version changed meanwhile
            //
            // Scenario A: user invoked save action even though the model is not dirty
            // Scenario B: auto save was triggered for a certain change by the user but meanwhile the user changed
            //             the contents and the version for which auto save was started is no longer the latest.
            //             Thus we avoid spawning multiple auto saves and only take the latest.
            //
            if ((!options.force && !this.dirty) || versionId !== this.versionId) {
                diag("doSave(" + versionId + ") - exit - because not dirty and/or versionId is different (this.isDirty: " + this.dirty + ", this.versionId: " + this.versionId + ")", this.resource, new Date());
                return winjs_base_1.TPromise.wrap(null);
            }
            // Return if currently saving by storing this save request as the next save that should happen.
            // Never ever must 2 saves execute at the same time because this can lead to dirty writes and race conditions.
            //
            // Scenario A: auto save was triggered and is currently busy saving to disk. this takes long enough that another auto save
            //             kicks in.
            // Scenario B: save is very slow (e.g. network share) and the user manages to change the buffer and trigger another save
            //             while the first save has not returned yet.
            //
            if (this.saveSequentializer.hasPendingSave()) {
                diag("doSave(" + versionId + ") - exit - because busy saving", this.resource, new Date());
                // Register this as the next upcoming save and return
                return this.saveSequentializer.setNext(function () { return _this.doSave(_this.versionId /* make sure to use latest version id here */, options); });
            }
            // Push all edit operations to the undo stack so that the user has a chance to
            // Ctrl+Z back to the saved version. We only do this when auto-save is turned off
            if (!this.autoSaveAfterMilliesEnabled) {
                this.textEditorModel.pushStackElement();
            }
            // A save participant can still change the model now and since we are so close to saving
            // we do not want to trigger another auto save or similar, so we block this
            // In addition we update our version right after in case it changed because of a model change
            // Save participants can also be skipped through API.
            var saveParticipantPromise = winjs_base_1.TPromise.as(versionId);
            if (TextFileEditorModel.saveParticipant && !options.skipSaveParticipants) {
                var onCompleteOrError = function () {
                    _this.blockModelContentChange = false;
                    return _this.versionId;
                };
                saveParticipantPromise = winjs_base_1.TPromise.as(undefined).then(function () {
                    _this.blockModelContentChange = true;
                    return TextFileEditorModel.saveParticipant.participate(_this, { reason: options.reason });
                }).then(onCompleteOrError, onCompleteOrError);
            }
            // mark the save participant as current pending save operation
            return this.saveSequentializer.setPending(versionId, saveParticipantPromise.then(function (newVersionId) {
                // Under certain conditions a save to the model will not cause the contents to the flushed on
                // disk because we can assume that the contents are already on disk. Instead, we just touch the
                // file to still trigger external file watchers for example.
                // The conditions are all of:
                // - a forced, explicit save (Ctrl+S)
                // - the model is not dirty (otherwise we know there are changed which needs to go to the file)
                // - the model is not in orphan mode (because in that case we know the file does not exist on disk)
                // - the model version did not change due to save participants running
                if (options.force && !_this.dirty && !_this.inOrphanMode && options.reason === textfiles_1.SaveReason.EXPLICIT && versionId === newVersionId) {
                    return _this.doTouch();
                }
                // update versionId with its new value (if pre-save changes happened)
                versionId = newVersionId;
                // Clear error flag since we are trying to save again
                _this.inErrorMode = false;
                // Remember when this model was saved last
                _this.lastSaveAttemptTime = Date.now();
                // Save to Disk
                // mark the save operation as currently pending with the versionId (it might have changed from a save participant triggering)
                diag("doSave(" + versionId + ") - before updateContent()", _this.resource, new Date());
                return _this.saveSequentializer.setPending(newVersionId, _this.fileService.updateContent(_this.lastResolvedDiskStat.resource, _this.createSnapshot(), {
                    overwriteReadonly: options.overwriteReadonly,
                    overwriteEncoding: options.overwriteEncoding,
                    mtime: _this.lastResolvedDiskStat.mtime,
                    encoding: _this.getEncoding(),
                    etag: _this.lastResolvedDiskStat.etag,
                    writeElevated: options.writeElevated
                }).then(function (stat) {
                    diag("doSave(" + versionId + ") - after updateContent()", _this.resource, new Date());
                    // Telemetry
                    if (_this.isSettingsFile()) {
                        /* __GDPR__
                            "settingsWritten" : {}
                        */
                        _this.telemetryService.publicLog('settingsWritten'); // Do not log write to user settings.json and .vscode folder as a filePUT event as it ruins our JSON usage data
                    }
                    else {
                        /* __GDPR__
                            "filePUT" : {
                                "mimeType" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                "ext": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                        _this.telemetryService.publicLog('filePUT', { mimeType: mime_1.guessMimeTypes(_this.resource.fsPath).join(', '), ext: paths.extname(_this.lastResolvedDiskStat.resource.fsPath) });
                    }
                    // Update dirty state unless model has changed meanwhile
                    if (versionId === _this.versionId) {
                        diag("doSave(" + versionId + ") - setting dirty to false because versionId did not change", _this.resource, new Date());
                        _this.setDirty(false);
                    }
                    else {
                        diag("doSave(" + versionId + ") - not setting dirty to false because versionId did change meanwhile", _this.resource, new Date());
                    }
                    // Updated resolved stat with updated stat
                    _this.updateLastResolvedDiskStat(stat);
                    // Cancel any content change event promises as they are no longer valid
                    _this.contentChangeEventScheduler.cancel();
                    // Emit File Saved Event
                    _this._onDidStateChange.fire(textfiles_1.StateChange.SAVED);
                }, function (error) {
                    diag("doSave(" + versionId + ") - exit - resulted in a save error: " + error.toString(), _this.resource, new Date());
                    // Flag as error state in the model
                    _this.inErrorMode = true;
                    // Look out for a save conflict
                    if (error.fileOperationResult === files_1.FileOperationResult.FILE_MODIFIED_SINCE) {
                        _this.inConflictMode = true;
                    }
                    // Show to user
                    _this.onSaveError(error);
                    // Emit as event
                    _this._onDidStateChange.fire(textfiles_1.StateChange.SAVE_ERROR);
                }));
            }));
        };
        TextFileEditorModel.prototype.isSettingsFile = function () {
            var _this = this;
            // Check for global settings file
            if (this.resource.fsPath === this.environmentService.appSettingsPath) {
                return true;
            }
            // Check for workspace settings file
            return this.contextService.getWorkspace().folders.some(function (folder) {
                return paths.isEqualOrParent(_this.resource.fsPath, path.join(folder.uri.fsPath, '.vscode'));
            });
        };
        TextFileEditorModel.prototype.doTouch = function () {
            var _this = this;
            return this.fileService.touchFile(this.resource).then(function (stat) {
                // Updated resolved stat with updated stat since touching it might have changed mtime
                _this.updateLastResolvedDiskStat(stat);
            }, function () { return void 0; } /* gracefully ignore errors if just touching */);
        };
        TextFileEditorModel.prototype.setDirty = function (dirty) {
            var _this = this;
            var wasDirty = this.dirty;
            var wasInConflictMode = this.inConflictMode;
            var wasInErrorMode = this.inErrorMode;
            var oldBufferSavedVersionId = this.bufferSavedVersionId;
            if (!dirty) {
                this.dirty = false;
                this.inConflictMode = false;
                this.inErrorMode = false;
                this.updateSavedVersionId();
            }
            else {
                this.dirty = true;
            }
            // Return function to revert this call
            return function () {
                _this.dirty = wasDirty;
                _this.inConflictMode = wasInConflictMode;
                _this.inErrorMode = wasInErrorMode;
                _this.bufferSavedVersionId = oldBufferSavedVersionId;
            };
        };
        TextFileEditorModel.prototype.updateSavedVersionId = function () {
            // we remember the models alternate version id to remember when the version
            // of the model matches with the saved version on disk. we need to keep this
            // in order to find out if the model changed back to a saved version (e.g.
            // when undoing long enough to reach to a version that is saved and then to
            // clear the dirty flag)
            if (this.textEditorModel) {
                this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
            }
        };
        TextFileEditorModel.prototype.updateLastResolvedDiskStat = function (newVersionOnDiskStat) {
            // First resolve - just take
            if (!this.lastResolvedDiskStat) {
                this.lastResolvedDiskStat = newVersionOnDiskStat;
            }
            else if (this.lastResolvedDiskStat.mtime <= newVersionOnDiskStat.mtime) {
                this.lastResolvedDiskStat = newVersionOnDiskStat;
            }
        };
        TextFileEditorModel.prototype.onSaveError = function (error) {
            // Prepare handler
            if (!TextFileEditorModel.saveErrorHandler) {
                TextFileEditorModel.setSaveErrorHandler(this.instantiationService.createInstance(DefaultSaveErrorHandler));
            }
            // Handle
            TextFileEditorModel.saveErrorHandler.onSaveError(error, this);
        };
        /**
         * Returns true if the content of this model has changes that are not yet saved back to the disk.
         */
        TextFileEditorModel.prototype.isDirty = function () {
            return this.dirty;
        };
        /**
         * Returns the time in millies when this working copy was attempted to be saved.
         */
        TextFileEditorModel.prototype.getLastSaveAttemptTime = function () {
            return this.lastSaveAttemptTime;
        };
        /**
         * Returns the time in millies when this working copy was last modified by the user or some other program.
         */
        TextFileEditorModel.prototype.getETag = function () {
            return this.lastResolvedDiskStat ? this.lastResolvedDiskStat.etag : null;
        };
        /**
         * Answers if this model is in a specific state.
         */
        TextFileEditorModel.prototype.hasState = function (state) {
            switch (state) {
                case textfiles_1.ModelState.CONFLICT:
                    return this.inConflictMode;
                case textfiles_1.ModelState.DIRTY:
                    return this.dirty;
                case textfiles_1.ModelState.ERROR:
                    return this.inErrorMode;
                case textfiles_1.ModelState.ORPHAN:
                    return this.inOrphanMode;
                case textfiles_1.ModelState.PENDING_SAVE:
                    return this.saveSequentializer.hasPendingSave();
                case textfiles_1.ModelState.SAVED:
                    return !this.dirty;
            }
        };
        TextFileEditorModel.prototype.getEncoding = function () {
            return this.preferredEncoding || this.contentEncoding;
        };
        TextFileEditorModel.prototype.setEncoding = function (encoding, mode) {
            if (!this.isNewEncoding(encoding)) {
                return; // return early if the encoding is already the same
            }
            // Encode: Save with encoding
            if (mode === editor_1.EncodingMode.Encode) {
                this.updatePreferredEncoding(encoding);
                // Save
                if (!this.isDirty()) {
                    this.versionId++; // needs to increment because we change the model potentially
                    this.makeDirty();
                }
                if (!this.inConflictMode) {
                    this.save({ overwriteEncoding: true }).done(null, errors_1.onUnexpectedError);
                }
            }
            else {
                if (this.isDirty()) {
                    this.messageService.show(message_1.Severity.Info, nls.localize('saveFileFirst', "The file is dirty. Please save it first before reopening it with another encoding."));
                    return;
                }
                this.updatePreferredEncoding(encoding);
                // Load
                this.load(true /* force because encoding has changed */).done(null, errors_1.onUnexpectedError);
            }
        };
        TextFileEditorModel.prototype.updatePreferredEncoding = function (encoding) {
            if (!this.isNewEncoding(encoding)) {
                return;
            }
            this.preferredEncoding = encoding;
            // Emit
            this._onDidStateChange.fire(textfiles_1.StateChange.ENCODING);
        };
        TextFileEditorModel.prototype.isNewEncoding = function (encoding) {
            if (this.preferredEncoding === encoding) {
                return false; // return early if the encoding is already the same
            }
            if (!this.preferredEncoding && this.contentEncoding === encoding) {
                return false; // also return if we don't have a preferred encoding but the content encoding is already the same
            }
            return true;
        };
        TextFileEditorModel.prototype.isResolved = function () {
            return !types.isUndefinedOrNull(this.lastResolvedDiskStat);
        };
        /**
         * Returns true if the dispose() method of this model has been called.
         */
        TextFileEditorModel.prototype.isDisposed = function () {
            return this.disposed;
        };
        /**
         * Returns the full resource URI of the file this text file editor model is about.
         */
        TextFileEditorModel.prototype.getResource = function () {
            return this.resource;
        };
        /**
         * Stat accessor only used by tests.
         */
        TextFileEditorModel.prototype.getStat = function () {
            return this.lastResolvedDiskStat;
        };
        TextFileEditorModel.prototype.dispose = function () {
            this.disposed = true;
            this.inConflictMode = false;
            this.inOrphanMode = false;
            this.inErrorMode = false;
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            this.createTextEditorModelPromise = null;
            this.cancelAutoSavePromise();
            _super.prototype.dispose.call(this);
        };
        TextFileEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY = files_1.CONTENT_CHANGE_EVENT_BUFFER_DELAY;
        TextFileEditorModel.DEFAULT_ORPHANED_CHANGE_BUFFER_DELAY = 100;
        TextFileEditorModel = __decorate([
            __param(2, message_1.IMessageService),
            __param(3, modeService_1.IModeService),
            __param(4, modelService_1.IModelService),
            __param(5, files_1.IFileService),
            __param(6, instantiation_1.IInstantiationService),
            __param(7, telemetry_1.ITelemetryService),
            __param(8, textfiles_1.ITextFileService),
            __param(9, backup_1.IBackupFileService),
            __param(10, environment_1.IEnvironmentService),
            __param(11, workspace_1.IWorkspaceContextService),
            __param(12, hashService_1.IHashService)
        ], TextFileEditorModel);
        return TextFileEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    exports.TextFileEditorModel = TextFileEditorModel;
    var SaveSequentializer = /** @class */ (function () {
        function SaveSequentializer() {
        }
        SaveSequentializer.prototype.hasPendingSave = function (versionId) {
            if (!this._pendingSave) {
                return false;
            }
            if (typeof versionId === 'number') {
                return this._pendingSave.versionId === versionId;
            }
            return !!this._pendingSave;
        };
        Object.defineProperty(SaveSequentializer.prototype, "pendingSave", {
            get: function () {
                return this._pendingSave ? this._pendingSave.promise : void 0;
            },
            enumerable: true,
            configurable: true
        });
        SaveSequentializer.prototype.setPending = function (versionId, promise) {
            var _this = this;
            this._pendingSave = { versionId: versionId, promise: promise };
            promise.done(function () { return _this.donePending(versionId); }, function () { return _this.donePending(versionId); });
            return promise;
        };
        SaveSequentializer.prototype.donePending = function (versionId) {
            if (this._pendingSave && versionId === this._pendingSave.versionId) {
                // only set pending to done if the promise finished that is associated with that versionId
                this._pendingSave = void 0;
                // schedule the next save now that we are free if we have any
                this.triggerNextSave();
            }
        };
        SaveSequentializer.prototype.triggerNextSave = function () {
            if (this._nextSave) {
                var saveOperation = this._nextSave;
                this._nextSave = void 0;
                // Run next save and complete on the associated promise
                saveOperation.run().done(saveOperation.promiseValue, saveOperation.promiseError);
            }
        };
        SaveSequentializer.prototype.setNext = function (run) {
            // this is our first next save, so we create associated promise with it
            // so that we can return a promise that completes when the save operation
            // has completed.
            if (!this._nextSave) {
                var promiseValue_1;
                var promiseError_1;
                var promise = new winjs_base_1.TPromise(function (c, e) {
                    promiseValue_1 = c;
                    promiseError_1 = e;
                });
                this._nextSave = {
                    run: run,
                    promise: promise,
                    promiseValue: promiseValue_1,
                    promiseError: promiseError_1
                };
            }
            else {
                this._nextSave.run = run;
            }
            return this._nextSave.promise;
        };
        return SaveSequentializer;
    }());
    exports.SaveSequentializer = SaveSequentializer;
    var DefaultSaveErrorHandler = /** @class */ (function () {
        function DefaultSaveErrorHandler(messageService) {
            this.messageService = messageService;
        }
        DefaultSaveErrorHandler.prototype.onSaveError = function (error, model) {
            this.messageService.show(message_1.Severity.Error, nls.localize('genericSaveError', "Failed to save '{0}': {1}", paths.basename(model.getResource().fsPath), errorMessage_1.toErrorMessage(error, false)));
        };
        DefaultSaveErrorHandler = __decorate([
            __param(0, message_1.IMessageService)
        ], DefaultSaveErrorHandler);
        return DefaultSaveErrorHandler;
    }());
    // Diagnostics support
    var diag;
    if (!diag) {
        diag = diagnostics.register('TextFileEditorModelDiagnostics', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log(args[1] + ' - ' + args[0] + ' (time: ' + args[2].getTime() + ' [' + args[2].toUTCString() + '])');
        });
    }
});
