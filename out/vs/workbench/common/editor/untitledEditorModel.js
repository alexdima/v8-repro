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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/workbench/common/editor/textEditorModel", "vs/editor/common/modes/modesRegistry", "vs/platform/files/common/files", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService", "vs/base/common/event", "vs/base/common/async", "vs/workbench/services/backup/common/backup", "vs/editor/common/services/resourceConfiguration", "vs/editor/common/model/textModel"], function (require, exports, lifecycle_1, winjs_base_1, textEditorModel_1, modesRegistry_1, files_1, modeService_1, modelService_1, event_1, async_1, backup_1, resourceConfiguration_1, textModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var UntitledEditorModel = /** @class */ (function (_super) {
        __extends(UntitledEditorModel, _super);
        function UntitledEditorModel(modeId, resource, hasAssociatedFilePath, initialValue, preferredEncoding, modeService, modelService, backupFileService, configurationService) {
            var _this = _super.call(this, modelService, modeService) || this;
            _this.modeId = modeId;
            _this.resource = resource;
            _this.hasAssociatedFilePath = hasAssociatedFilePath;
            _this.initialValue = initialValue;
            _this.preferredEncoding = preferredEncoding;
            _this.backupFileService = backupFileService;
            _this.configurationService = configurationService;
            _this.dirty = false;
            _this.versionId = 0;
            _this.toDispose = [];
            _this._onDidChangeContent = new event_1.Emitter();
            _this.toDispose.push(_this._onDidChangeContent);
            _this._onDidChangeDirty = new event_1.Emitter();
            _this.toDispose.push(_this._onDidChangeDirty);
            _this._onDidChangeEncoding = new event_1.Emitter();
            _this.toDispose.push(_this._onDidChangeEncoding);
            _this.contentChangeEventScheduler = new async_1.RunOnceScheduler(function () { return _this._onDidChangeContent.fire(); }, UntitledEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY);
            _this.toDispose.push(_this.contentChangeEventScheduler);
            _this.registerListeners();
            return _this;
        }
        Object.defineProperty(UntitledEditorModel.prototype, "onDidChangeContent", {
            get: function () {
                return this._onDidChangeContent.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UntitledEditorModel.prototype, "onDidChangeDirty", {
            get: function () {
                return this._onDidChangeDirty.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UntitledEditorModel.prototype, "onDidChangeEncoding", {
            get: function () {
                return this._onDidChangeEncoding.event;
            },
            enumerable: true,
            configurable: true
        });
        UntitledEditorModel.prototype.getOrCreateMode = function (modeService, modeId, firstLineText) {
            if (!modeId || modeId === modesRegistry_1.PLAINTEXT_MODE_ID) {
                return modeService.getOrCreateModeByFilenameOrFirstLine(this.resource.fsPath, firstLineText); // lookup mode via resource path if the provided modeId is unspecific
            }
            return _super.prototype.getOrCreateMode.call(this, modeService, modeId, firstLineText);
        };
        UntitledEditorModel.prototype.registerListeners = function () {
            var _this = this;
            // Config Changes
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChange(); }));
        };
        UntitledEditorModel.prototype.onConfigurationChange = function () {
            var configuredEncoding = this.configurationService.getValue(this.resource, 'files.encoding');
            if (this.configuredEncoding !== configuredEncoding) {
                this.configuredEncoding = configuredEncoding;
                if (!this.preferredEncoding) {
                    this._onDidChangeEncoding.fire(); // do not fire event if we have a preferred encoding set
                }
            }
        };
        UntitledEditorModel.prototype.getVersionId = function () {
            return this.versionId;
        };
        UntitledEditorModel.prototype.getModeId = function () {
            if (this.textEditorModel) {
                return this.textEditorModel.getLanguageIdentifier().language;
            }
            return null;
        };
        UntitledEditorModel.prototype.getEncoding = function () {
            return this.preferredEncoding || this.configuredEncoding;
        };
        UntitledEditorModel.prototype.setEncoding = function (encoding) {
            var oldEncoding = this.getEncoding();
            this.preferredEncoding = encoding;
            // Emit if it changed
            if (oldEncoding !== this.preferredEncoding) {
                this._onDidChangeEncoding.fire();
            }
        };
        UntitledEditorModel.prototype.isDirty = function () {
            return this.dirty;
        };
        UntitledEditorModel.prototype.setDirty = function (dirty) {
            if (this.dirty === dirty) {
                return;
            }
            this.dirty = dirty;
            this._onDidChangeDirty.fire();
        };
        UntitledEditorModel.prototype.getResource = function () {
            return this.resource;
        };
        UntitledEditorModel.prototype.revert = function () {
            this.setDirty(false);
            // Handle content change event buffered
            this.contentChangeEventScheduler.schedule();
        };
        UntitledEditorModel.prototype.load = function () {
            var _this = this;
            // Check for backups first
            return this.backupFileService.loadBackupResource(this.resource).then(function (backupResource) {
                if (backupResource) {
                    return _this.backupFileService.resolveBackupContent(backupResource);
                }
                return null;
            }).then(function (backupTextBufferFactory) {
                var hasBackup = !!backupTextBufferFactory;
                // untitled associated to file path are dirty right away as well as untitled with content
                _this.setDirty(_this.hasAssociatedFilePath || hasBackup);
                var untitledContents;
                if (backupTextBufferFactory) {
                    untitledContents = backupTextBufferFactory;
                }
                else {
                    untitledContents = textModel_1.createTextBufferFactory(_this.initialValue || '');
                }
                return _this.doLoad(untitledContents).then(function (model) {
                    // Encoding
                    _this.configuredEncoding = _this.configurationService.getValue(_this.resource, 'files.encoding');
                    // Listen to content changes
                    _this.toDispose.push(_this.textEditorModel.onDidChangeContent(function () { return _this.onModelContentChanged(); }));
                    // Listen to mode changes
                    _this.toDispose.push(_this.textEditorModel.onDidChangeLanguage(function () { return _this.onConfigurationChange(); })); // mode change can have impact on config
                    return model;
                });
            });
        };
        UntitledEditorModel.prototype.doLoad = function (content) {
            var _this = this;
            // Create text editor model if not yet done
            if (!this.textEditorModel) {
                return this.createTextEditorModel(content, this.resource, this.modeId).then(function (model) { return _this; });
            }
            else {
                this.updateTextEditorModel(content);
            }
            return winjs_base_1.TPromise.as(this);
        };
        UntitledEditorModel.prototype.onModelContentChanged = function () {
            this.versionId++;
            // mark the untitled editor as non-dirty once its content becomes empty and we do
            // not have an associated path set. we never want dirty indicator in that case.
            if (!this.hasAssociatedFilePath && this.textEditorModel.getLineCount() === 1 && this.textEditorModel.getLineContent(1) === '') {
                this.setDirty(false);
            }
            else {
                this.setDirty(true);
            }
            // Handle content change event buffered
            this.contentChangeEventScheduler.schedule();
        };
        UntitledEditorModel.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        UntitledEditorModel.DEFAULT_CONTENT_CHANGE_BUFFER_DELAY = files_1.CONTENT_CHANGE_EVENT_BUFFER_DELAY;
        UntitledEditorModel = __decorate([
            __param(5, modeService_1.IModeService),
            __param(6, modelService_1.IModelService),
            __param(7, backup_1.IBackupFileService),
            __param(8, resourceConfiguration_1.ITextResourceConfigurationService)
        ], UntitledEditorModel);
        return UntitledEditorModel;
    }(textEditorModel_1.BaseTextEditorModel));
    exports.UntitledEditorModel = UntitledEditorModel;
});
