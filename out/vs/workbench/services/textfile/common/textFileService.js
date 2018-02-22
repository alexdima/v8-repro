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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/paths", "vs/base/common/errors", "vs/base/common/objects", "vs/base/common/event", "vs/base/common/platform", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/platform/lifecycle/common/lifecycle", "vs/platform/workspace/common/workspace", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/platform/message/common/message", "vs/base/common/map", "vs/base/common/network", "vs/editor/common/model/textModel"], function (require, exports, nls, winjs_base_1, uri_1, paths, errors, objects, event_1, platform, textfiles_1, editor_1, lifecycle_1, workspace_1, files_1, lifecycle_2, textFileEditorModelManager_1, message_1, map_1, network_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The workbench file service implementation implements the raw file service spec and adds additional methods on top.
     *
     * It also adds diagnostics and logging around file system operations.
     */
    var TextFileService = /** @class */ (function () {
        function TextFileService(lifecycleService, contextService, configurationService, fileService, untitledEditorService, instantiationService, messageService, environmentService, backupFileService, windowsService, historyService, contextKeyService, modelService) {
            this.lifecycleService = lifecycleService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.fileService = fileService;
            this.untitledEditorService = untitledEditorService;
            this.instantiationService = instantiationService;
            this.messageService = messageService;
            this.environmentService = environmentService;
            this.backupFileService = backupFileService;
            this.windowsService = windowsService;
            this.historyService = historyService;
            this.modelService = modelService;
            this.toUnbind = [];
            this._onAutoSaveConfigurationChange = new event_1.Emitter();
            this.toUnbind.push(this._onAutoSaveConfigurationChange);
            this._onFilesAssociationChange = new event_1.Emitter();
            this.toUnbind.push(this._onFilesAssociationChange);
            this._models = this.instantiationService.createInstance(textFileEditorModelManager_1.TextFileEditorModelManager);
            this.autoSaveContext = textfiles_1.AutoSaveContext.bindTo(contextKeyService);
            var configuration = this.configurationService.getValue();
            this.currentFilesAssociationConfig = configuration && configuration.files && configuration.files.associations;
            this.onFilesConfigurationChange(configuration);
            this.registerListeners();
        }
        Object.defineProperty(TextFileService.prototype, "models", {
            get: function () {
                return this._models;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileService.prototype, "onAutoSaveConfigurationChange", {
            get: function () {
                return this._onAutoSaveConfigurationChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileService.prototype, "onFilesAssociationChange", {
            get: function () {
                return this._onFilesAssociationChange.event;
            },
            enumerable: true,
            configurable: true
        });
        TextFileService.prototype.registerListeners = function () {
            var _this = this;
            // Lifecycle
            this.lifecycleService.onWillShutdown(function (event) { return event.veto(_this.beforeShutdown(event.reason)); });
            this.lifecycleService.onShutdown(this.dispose, this);
            // Files configuration changes
            this.toUnbind.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('files')) {
                    _this.onFilesConfigurationChange(_this.configurationService.getValue());
                }
            }));
        };
        TextFileService.prototype.beforeShutdown = function (reason) {
            var _this = this;
            // Dirty files need treatment on shutdown
            var dirty = this.getDirty();
            if (dirty.length) {
                // If auto save is enabled, save all files and then check again for dirty files
                // We DO NOT run any save participant if we are in the shutdown phase for performance reasons
                var handleAutoSave = void 0;
                if (this.getAutoSaveMode() !== textfiles_1.AutoSaveMode.OFF) {
                    handleAutoSave = this.saveAll(false /* files only */, { skipSaveParticipants: true }).then(function () { return _this.getDirty(); });
                }
                else {
                    handleAutoSave = winjs_base_1.TPromise.as(dirty);
                }
                return handleAutoSave.then(function (dirty) {
                    // If we still have dirty files, we either have untitled ones or files that cannot be saved
                    // or auto save was not enabled and as such we did not save any dirty files to disk automatically
                    if (dirty.length) {
                        // If hot exit is enabled, backup dirty files and allow to exit without confirmation
                        if (_this.isHotExitEnabled) {
                            return _this.backupBeforeShutdown(dirty, _this.models, reason).then(function (result) {
                                if (result.didBackup) {
                                    return _this.noVeto({ cleanUpBackups: false }); // no veto and no backup cleanup (since backup was successful)
                                }
                                // since a backup did not happen, we have to confirm for the dirty files now
                                return _this.confirmBeforeShutdown();
                            }, function (errors) {
                                var firstError = errors[0];
                                _this.messageService.show(message_1.Severity.Error, nls.localize('files.backup.failSave', "Files that are dirty could not be written to the backup location (Error: {0}). Try saving your files first and then exit.", firstError.message));
                                return true; // veto, the backups failed
                            });
                        }
                        // Otherwise just confirm from the user what to do with the dirty files
                        return _this.confirmBeforeShutdown();
                    }
                    return void 0;
                });
            }
            // No dirty files: no veto
            return this.noVeto({ cleanUpBackups: true });
        };
        TextFileService.prototype.backupBeforeShutdown = function (dirtyToBackup, textFileEditorModelManager, reason) {
            var _this = this;
            return this.windowsService.getWindowCount().then(function (windowCount) {
                // When quit is requested skip the confirm callback and attempt to backup all workspaces.
                // When quit is not requested the confirm callback should be shown when the window being
                // closed is the only VS Code window open, except for on Mac where hot exit is only
                // ever activated when quit is requested.
                var doBackup;
                switch (reason) {
                    case lifecycle_1.ShutdownReason.CLOSE:
                        if (_this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY && _this.configuredHotExit === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            doBackup = true; // backup if a folder is open and onExitAndWindowClose is configured
                        }
                        else if (windowCount > 1 || platform.isMacintosh) {
                            doBackup = false; // do not backup if a window is closed that does not cause quitting of the application
                        }
                        else {
                            doBackup = true; // backup if last window is closed on win/linux where the application quits right after
                        }
                        break;
                    case lifecycle_1.ShutdownReason.QUIT:
                        doBackup = true; // backup because next start we restore all backups
                        break;
                    case lifecycle_1.ShutdownReason.RELOAD:
                        doBackup = true; // backup because after window reload, backups restore
                        break;
                    case lifecycle_1.ShutdownReason.LOAD:
                        if (_this.contextService.getWorkbenchState() !== workspace_1.WorkbenchState.EMPTY && _this.configuredHotExit === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            doBackup = true; // backup if a folder is open and onExitAndWindowClose is configured
                        }
                        else {
                            doBackup = false; // do not backup because we are switching contexts
                        }
                        break;
                }
                if (!doBackup) {
                    return winjs_base_1.TPromise.as({ didBackup: false });
                }
                // Backup
                return _this.backupAll(dirtyToBackup, textFileEditorModelManager).then(function () { return { didBackup: true }; });
            });
        };
        TextFileService.prototype.backupAll = function (dirtyToBackup, textFileEditorModelManager) {
            var _this = this;
            // split up between files and untitled
            var filesToBackup = [];
            var untitledToBackup = [];
            dirtyToBackup.forEach(function (s) {
                if (_this.fileService.canHandleResource(s)) {
                    filesToBackup.push(textFileEditorModelManager.get(s));
                }
                else if (s.scheme === network_1.Schemas.untitled) {
                    untitledToBackup.push(s);
                }
            });
            return this.doBackupAll(filesToBackup, untitledToBackup);
        };
        TextFileService.prototype.doBackupAll = function (dirtyFileModels, untitledResources) {
            var _this = this;
            // Handle file resources first
            return winjs_base_1.TPromise.join(dirtyFileModels.map(function (model) { return _this.backupFileService.backupResource(model.getResource(), model.createSnapshot(), model.getVersionId()); })).then(function (results) {
                // Handle untitled resources
                var untitledModelPromises = untitledResources
                    .filter(function (untitled) { return _this.untitledEditorService.exists(untitled); })
                    .map(function (untitled) { return _this.untitledEditorService.loadOrCreate({ resource: untitled }); });
                return winjs_base_1.TPromise.join(untitledModelPromises).then(function (untitledModels) {
                    var untitledBackupPromises = untitledModels.map(function (model) {
                        return _this.backupFileService.backupResource(model.getResource(), model.createSnapshot(), model.getVersionId());
                    });
                    return winjs_base_1.TPromise.join(untitledBackupPromises).then(function () { return void 0; });
                });
            });
        };
        TextFileService.prototype.confirmBeforeShutdown = function () {
            var _this = this;
            return this.confirmSave().then(function (confirm) {
                // Save
                if (confirm === editor_1.ConfirmResult.SAVE) {
                    return _this.saveAll(true /* includeUntitled */, { skipSaveParticipants: true }).then(function (result) {
                        if (result.results.some(function (r) { return !r.success; })) {
                            return true; // veto if some saves failed
                        }
                        return _this.noVeto({ cleanUpBackups: true });
                    });
                }
                else if (confirm === editor_1.ConfirmResult.DONT_SAVE) {
                    // Make sure to revert untitled so that they do not restore
                    // see https://github.com/Microsoft/vscode/issues/29572
                    _this.untitledEditorService.revertAll();
                    return _this.noVeto({ cleanUpBackups: true });
                }
                else if (confirm === editor_1.ConfirmResult.CANCEL) {
                    return true; // veto
                }
                return void 0;
            });
        };
        TextFileService.prototype.noVeto = function (options) {
            if (!options.cleanUpBackups) {
                return false;
            }
            return this.cleanupBackupsBeforeShutdown().then(function () { return false; }, function () { return false; });
        };
        TextFileService.prototype.cleanupBackupsBeforeShutdown = function () {
            if (this.environmentService.isExtensionDevelopment) {
                return winjs_base_1.TPromise.as(void 0);
            }
            return this.backupFileService.discardAllWorkspaceBackups();
        };
        TextFileService.prototype.onFilesConfigurationChange = function (configuration) {
            var wasAutoSaveEnabled = (this.getAutoSaveMode() !== textfiles_1.AutoSaveMode.OFF);
            var autoSaveMode = (configuration && configuration.files && configuration.files.autoSave) || files_1.AutoSaveConfiguration.OFF;
            this.autoSaveContext.set(autoSaveMode);
            switch (autoSaveMode) {
                case files_1.AutoSaveConfiguration.AFTER_DELAY:
                    this.configuredAutoSaveDelay = configuration && configuration.files && configuration.files.autoSaveDelay;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
                case files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE:
                    this.configuredAutoSaveDelay = void 0;
                    this.configuredAutoSaveOnFocusChange = true;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
                case files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE:
                    this.configuredAutoSaveDelay = void 0;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = true;
                    break;
                default:
                    this.configuredAutoSaveDelay = void 0;
                    this.configuredAutoSaveOnFocusChange = false;
                    this.configuredAutoSaveOnWindowChange = false;
                    break;
            }
            // Emit as event
            this._onAutoSaveConfigurationChange.fire(this.getAutoSaveConfiguration());
            // save all dirty when enabling auto save
            if (!wasAutoSaveEnabled && this.getAutoSaveMode() !== textfiles_1.AutoSaveMode.OFF) {
                this.saveAll().done(null, errors.onUnexpectedError);
            }
            // Check for change in files associations
            var filesAssociation = configuration && configuration.files && configuration.files.associations;
            if (!objects.equals(this.currentFilesAssociationConfig, filesAssociation)) {
                this.currentFilesAssociationConfig = filesAssociation;
                this._onFilesAssociationChange.fire();
            }
            // Hot exit
            var hotExitMode = configuration && configuration.files && configuration.files.hotExit;
            if (hotExitMode === files_1.HotExitConfiguration.OFF || hotExitMode === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                this.configuredHotExit = hotExitMode;
            }
            else {
                this.configuredHotExit = files_1.HotExitConfiguration.ON_EXIT;
            }
        };
        TextFileService.prototype.getDirty = function (resources) {
            // Collect files
            var dirty = this.getDirtyFileModels(resources).map(function (m) { return m.getResource(); });
            // Add untitled ones
            dirty.push.apply(dirty, this.untitledEditorService.getDirty(resources));
            return dirty;
        };
        TextFileService.prototype.isDirty = function (resource) {
            // Check for dirty file
            if (this._models.getAll(resource).some(function (model) { return model.isDirty(); })) {
                return true;
            }
            // Check for dirty untitled
            return this.untitledEditorService.getDirty().some(function (dirty) { return !resource || dirty.toString() === resource.toString(); });
        };
        TextFileService.prototype.save = function (resource, options) {
            // Run a forced save if we detect the file is not dirty so that save participants can still run
            if (options && options.force && this.fileService.canHandleResource(resource) && !this.isDirty(resource)) {
                var model_1 = this._models.get(resource);
                if (model_1) {
                    model_1.save({ force: true, reason: textfiles_1.SaveReason.EXPLICIT }).then(function () { return !model_1.isDirty(); });
                }
            }
            return this.saveAll([resource], options).then(function (result) { return result.results.length === 1 && result.results[0].success; });
        };
        TextFileService.prototype.saveAll = function (arg1, options) {
            // get all dirty
            var toSave = [];
            if (Array.isArray(arg1)) {
                toSave = this.getDirty(arg1);
            }
            else {
                toSave = this.getDirty();
            }
            // split up between files and untitled
            var filesToSave = [];
            var untitledToSave = [];
            toSave.forEach(function (s) {
                if ((Array.isArray(arg1) || arg1 === true /* includeUntitled */) && s.scheme === network_1.Schemas.untitled) {
                    untitledToSave.push(s);
                }
                else {
                    filesToSave.push(s);
                }
            });
            return this.doSaveAll(filesToSave, untitledToSave, options);
        };
        TextFileService.prototype.doSaveAll = function (fileResources, untitledResources, options) {
            var _this = this;
            // Handle files first that can just be saved
            return this.doSaveAllFiles(fileResources, options).then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var targetsForUntitled, i, untitled, targetPath, untitledSaveAsPromises;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            targetsForUntitled = [];
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < untitledResources.length)) return [3 /*break*/, 6];
                            untitled = untitledResources[i];
                            if (!this.untitledEditorService.exists(untitled)) return [3 /*break*/, 5];
                            targetPath = void 0;
                            if (!this.untitledEditorService.hasAssociatedFilePath(untitled)) return [3 /*break*/, 2];
                            targetPath = untitled.fsPath;
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.promptForPath(this.suggestFileName(untitled))];
                        case 3:
                            targetPath = _a.sent();
                            if (!targetPath) {
                                return [2 /*return*/, winjs_base_1.TPromise.as({
                                        results: fileResources.concat(untitledResources).map(function (r) {
                                            return {
                                                source: r
                                            };
                                        })
                                    })];
                            }
                            _a.label = 4;
                        case 4:
                            targetsForUntitled.push(uri_1.default.file(targetPath));
                            _a.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 1];
                        case 6:
                            untitledSaveAsPromises = [];
                            targetsForUntitled.forEach(function (target, index) {
                                var untitledSaveAsPromise = _this.saveAs(untitledResources[index], target).then(function (uri) {
                                    result.results.push({
                                        source: untitledResources[index],
                                        target: uri,
                                        success: !!uri
                                    });
                                });
                                untitledSaveAsPromises.push(untitledSaveAsPromise);
                            });
                            return [2 /*return*/, winjs_base_1.TPromise.join(untitledSaveAsPromises).then(function () {
                                    return result;
                                })];
                    }
                });
            }); });
        };
        TextFileService.prototype.doSaveAllFiles = function (resources, options) {
            if (options === void 0) { options = Object.create(null); }
            var dirtyFileModels = this.getDirtyFileModels(Array.isArray(resources) ? resources : void 0 /* Save All */)
                .filter(function (model) {
                if (model.hasState(textfiles_1.ModelState.CONFLICT) && (options.reason === textfiles_1.SaveReason.AUTO || options.reason === textfiles_1.SaveReason.FOCUS_CHANGE || options.reason === textfiles_1.SaveReason.WINDOW_CHANGE)) {
                    return false; // if model is in save conflict, do not save unless save reason is explicit or not provided at all
                }
                return true;
            });
            var mapResourceToResult = new map_1.ResourceMap();
            dirtyFileModels.forEach(function (m) {
                mapResourceToResult.set(m.getResource(), {
                    source: m.getResource()
                });
            });
            return winjs_base_1.TPromise.join(dirtyFileModels.map(function (model) {
                return model.save(options).then(function () {
                    if (!model.isDirty()) {
                        mapResourceToResult.get(model.getResource()).success = true;
                    }
                });
            })).then(function (r) {
                return {
                    results: mapResourceToResult.values()
                };
            });
        };
        TextFileService.prototype.getFileModels = function (arg1) {
            var _this = this;
            if (Array.isArray(arg1)) {
                var models_1 = [];
                arg1.forEach(function (resource) {
                    models_1.push.apply(models_1, _this.getFileModels(resource));
                });
                return models_1;
            }
            return this._models.getAll(arg1);
        };
        TextFileService.prototype.getDirtyFileModels = function (arg1) {
            return this.getFileModels(arg1).filter(function (model) { return model.isDirty(); });
        };
        TextFileService.prototype.saveAs = function (resource, target, options) {
            var _this = this;
            // Get to target resource
            var targetPromise;
            if (target) {
                targetPromise = winjs_base_1.TPromise.wrap(target);
            }
            else {
                var dialogPath = resource.fsPath;
                if (resource.scheme === network_1.Schemas.untitled) {
                    dialogPath = this.suggestFileName(resource);
                }
                targetPromise = this.promptForPath(dialogPath).then(function (pathRaw) {
                    if (pathRaw) {
                        return uri_1.default.file(pathRaw);
                    }
                    return void 0;
                });
            }
            return targetPromise.then(function (target) {
                if (!target) {
                    return winjs_base_1.TPromise.as(null); // user canceled
                }
                // Just save if target is same as models own resource
                if (resource.toString() === target.toString()) {
                    return _this.save(resource, options).then(function () { return resource; });
                }
                // Do it
                return _this.doSaveAs(resource, target, options);
            });
        };
        TextFileService.prototype.doSaveAs = function (resource, target, options) {
            var _this = this;
            // Retrieve text model from provided resource if any
            var modelPromise = winjs_base_1.TPromise.as(null);
            if (this.fileService.canHandleResource(resource)) {
                modelPromise = winjs_base_1.TPromise.as(this._models.get(resource));
            }
            else if (resource.scheme === network_1.Schemas.untitled && this.untitledEditorService.exists(resource)) {
                modelPromise = this.untitledEditorService.loadOrCreate({ resource: resource });
            }
            return modelPromise.then(function (model) {
                // We have a model: Use it (can be null e.g. if this file is binary and not a text file or was never opened before)
                if (model) {
                    return _this.doSaveTextFileAs(model, resource, target, options);
                }
                // Otherwise we can only copy
                return _this.fileService.copyFile(resource, target);
            }).then(function () {
                // Revert the source
                return _this.revert(resource).then(function () {
                    // Done: return target
                    return target;
                });
            });
        };
        TextFileService.prototype.doSaveTextFileAs = function (sourceModel, resource, target, options) {
            var _this = this;
            var targetModelResolver;
            // Prefer an existing model if it is already loaded for the given target resource
            var targetModel = this.models.get(target);
            if (targetModel && targetModel.isResolved()) {
                targetModelResolver = winjs_base_1.TPromise.as(targetModel);
            }
            else {
                targetModelResolver = this.fileService.resolveFile(target).then(function (stat) { return stat; }, function () { return null; }).then(function (stat) { return stat || _this.fileService.updateContent(target, ''); }).then(function (stat) {
                    return _this.models.loadOrCreate(target);
                });
            }
            return targetModelResolver.then(function (targetModel) {
                // take over encoding and model value from source model
                targetModel.updatePreferredEncoding(sourceModel.getEncoding());
                _this.modelService.updateModel(targetModel.textEditorModel, textModel_1.createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()));
                // save model
                return targetModel.save(options);
            }, function (error) {
                // binary model: delete the file and run the operation again
                if (error.fileOperationResult === files_1.FileOperationResult.FILE_IS_BINARY || error.fileOperationResult === files_1.FileOperationResult.FILE_TOO_LARGE) {
                    return _this.fileService.del(target).then(function () { return _this.doSaveTextFileAs(sourceModel, resource, target, options); });
                }
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileService.prototype.suggestFileName = function (untitledResource) {
            var untitledFileName = this.untitledEditorService.suggestFileName(untitledResource);
            var lastActiveFile = this.historyService.getLastActiveFile();
            if (lastActiveFile) {
                return uri_1.default.file(paths.join(paths.dirname(lastActiveFile.fsPath), untitledFileName)).fsPath;
            }
            var lastActiveFolder = this.historyService.getLastActiveWorkspaceRoot('file');
            if (lastActiveFolder) {
                return uri_1.default.file(paths.join(lastActiveFolder.fsPath, untitledFileName)).fsPath;
            }
            return untitledFileName;
        };
        TextFileService.prototype.revert = function (resource, options) {
            return this.revertAll([resource], options).then(function (result) { return result.results.length === 1 && result.results[0].success; });
        };
        TextFileService.prototype.revertAll = function (resources, options) {
            var _this = this;
            // Revert files first
            return this.doRevertAllFiles(resources, options).then(function (operation) {
                // Revert untitled
                var reverted = _this.untitledEditorService.revertAll(resources);
                reverted.forEach(function (res) { return operation.results.push({ source: res, success: true }); });
                return operation;
            });
        };
        TextFileService.prototype.doRevertAllFiles = function (resources, options) {
            var fileModels = options && options.force ? this.getFileModels(resources) : this.getDirtyFileModels(resources);
            var mapResourceToResult = new map_1.ResourceMap();
            fileModels.forEach(function (m) {
                mapResourceToResult.set(m.getResource(), {
                    source: m.getResource()
                });
            });
            return winjs_base_1.TPromise.join(fileModels.map(function (model) {
                return model.revert(options && options.soft).then(function () {
                    if (!model.isDirty()) {
                        mapResourceToResult.get(model.getResource()).success = true;
                    }
                }, function (error) {
                    // FileNotFound means the file got deleted meanwhile, so still record as successful revert
                    if (error.fileOperationResult === files_1.FileOperationResult.FILE_NOT_FOUND) {
                        mapResourceToResult.get(model.getResource()).success = true;
                    }
                    else {
                        return winjs_base_1.TPromise.wrapError(error);
                    }
                    return void 0;
                });
            })).then(function (r) {
                return {
                    results: mapResourceToResult.values()
                };
            });
        };
        TextFileService.prototype.getAutoSaveMode = function () {
            if (this.configuredAutoSaveOnFocusChange) {
                return textfiles_1.AutoSaveMode.ON_FOCUS_CHANGE;
            }
            if (this.configuredAutoSaveOnWindowChange) {
                return textfiles_1.AutoSaveMode.ON_WINDOW_CHANGE;
            }
            if (this.configuredAutoSaveDelay && this.configuredAutoSaveDelay > 0) {
                return this.configuredAutoSaveDelay <= 1000 ? textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY : textfiles_1.AutoSaveMode.AFTER_LONG_DELAY;
            }
            return textfiles_1.AutoSaveMode.OFF;
        };
        TextFileService.prototype.getAutoSaveConfiguration = function () {
            return {
                autoSaveDelay: this.configuredAutoSaveDelay && this.configuredAutoSaveDelay > 0 ? this.configuredAutoSaveDelay : void 0,
                autoSaveFocusChange: this.configuredAutoSaveOnFocusChange,
                autoSaveApplicationChange: this.configuredAutoSaveOnWindowChange
            };
        };
        Object.defineProperty(TextFileService.prototype, "isHotExitEnabled", {
            get: function () {
                return !this.environmentService.isExtensionDevelopment && this.configuredHotExit !== files_1.HotExitConfiguration.OFF;
            },
            enumerable: true,
            configurable: true
        });
        TextFileService.prototype.dispose = function () {
            this.toUnbind = lifecycle_2.dispose(this.toUnbind);
            // Clear all caches
            this._models.clear();
        };
        return TextFileService;
    }());
    exports.TextFileService = TextFileService;
});
