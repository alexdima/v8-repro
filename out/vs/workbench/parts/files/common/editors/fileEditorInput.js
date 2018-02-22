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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/decorators", "vs/base/common/paths", "vs/base/common/resources", "vs/base/common/labels", "vs/workbench/common/editor", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/files/common/files", "vs/workbench/parts/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/editor/common/editor", "vs/platform/environment/common/environment", "vs/editor/common/services/resolverService", "vs/workbench/services/hash/common/hashService"], function (require, exports, nls_1, winjs_base_1, decorators_1, paths, resources, labels, editor_1, binaryEditorModel_1, files_1, files_2, textfiles_1, workspace_1, instantiation_1, lifecycle_1, telemetryUtils_1, editor_2, environment_1, resolverService_1, hashService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    var FileEditorInput = /** @class */ (function (_super) {
        __extends(FileEditorInput, _super);
        /**
         * An editor input who's contents are retrieved from file services.
         */
        function FileEditorInput(resource, preferredEncoding, instantiationService, contextService, textFileService, environmentService, textModelResolverService, hashService) {
            var _this = _super.call(this) || this;
            _this.resource = resource;
            _this.preferredEncoding = preferredEncoding;
            _this.instantiationService = instantiationService;
            _this.contextService = contextService;
            _this.textFileService = textFileService;
            _this.environmentService = environmentService;
            _this.textModelResolverService = textModelResolverService;
            _this.hashService = hashService;
            _this.toUnbind = [];
            _this.registerListeners();
            return _this;
        }
        FileEditorInput.prototype.registerListeners = function () {
            var _this = this;
            // Model changes
            this.toUnbind.push(this.textFileService.models.onModelDirty(function (e) { return _this.onDirtyStateChange(e); }));
            this.toUnbind.push(this.textFileService.models.onModelSaveError(function (e) { return _this.onDirtyStateChange(e); }));
            this.toUnbind.push(this.textFileService.models.onModelSaved(function (e) { return _this.onDirtyStateChange(e); }));
            this.toUnbind.push(this.textFileService.models.onModelReverted(function (e) { return _this.onDirtyStateChange(e); }));
            this.toUnbind.push(this.textFileService.models.onModelOrphanedChanged(function (e) { return _this.onModelOrphanedChanged(e); }));
        };
        FileEditorInput.prototype.onDirtyStateChange = function (e) {
            if (e.resource.toString() === this.resource.toString()) {
                this._onDidChangeDirty.fire();
            }
        };
        FileEditorInput.prototype.onModelOrphanedChanged = function (e) {
            if (e.resource.toString() === this.resource.toString()) {
                this._onDidChangeLabel.fire();
            }
        };
        FileEditorInput.prototype.getResource = function () {
            return this.resource;
        };
        FileEditorInput.prototype.setPreferredEncoding = function (encoding) {
            this.preferredEncoding = encoding;
        };
        FileEditorInput.prototype.getEncoding = function () {
            var textModel = this.textFileService.models.get(this.resource);
            if (textModel) {
                return textModel.getEncoding();
            }
            return this.preferredEncoding;
        };
        FileEditorInput.prototype.getPreferredEncoding = function () {
            return this.preferredEncoding;
        };
        FileEditorInput.prototype.setEncoding = function (encoding, mode) {
            this.preferredEncoding = encoding;
            var textModel = this.textFileService.models.get(this.resource);
            if (textModel) {
                textModel.setEncoding(encoding, mode);
            }
        };
        FileEditorInput.prototype.setForceOpenAsBinary = function () {
            this.forceOpenAsBinary = true;
        };
        FileEditorInput.prototype.getTypeId = function () {
            return files_2.FILE_EDITOR_INPUT_ID;
        };
        FileEditorInput.prototype.getName = function () {
            if (!this.name) {
                this.name = resources.basenameOrAuthority(this.resource);
            }
            return this.decorateOrphanedFiles(this.name);
        };
        Object.defineProperty(FileEditorInput.prototype, "shortDescription", {
            get: function () {
                return paths.basename(labels.getPathLabel(resources.dirname(this.resource), void 0, this.environmentService));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileEditorInput.prototype, "mediumDescription", {
            get: function () {
                return labels.getPathLabel(resources.dirname(this.resource), this.contextService, this.environmentService);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileEditorInput.prototype, "longDescription", {
            get: function () {
                return labels.getPathLabel(resources.dirname(this.resource), void 0, this.environmentService);
            },
            enumerable: true,
            configurable: true
        });
        FileEditorInput.prototype.getDescription = function (verbosity) {
            if (verbosity === void 0) { verbosity = editor_2.Verbosity.MEDIUM; }
            var description;
            switch (verbosity) {
                case editor_2.Verbosity.SHORT:
                    description = this.shortDescription;
                    break;
                case editor_2.Verbosity.LONG:
                    description = this.longDescription;
                    break;
                case editor_2.Verbosity.MEDIUM:
                default:
                    description = this.mediumDescription;
                    break;
            }
            return description;
        };
        Object.defineProperty(FileEditorInput.prototype, "shortTitle", {
            get: function () {
                return this.getName();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileEditorInput.prototype, "mediumTitle", {
            get: function () {
                return labels.getPathLabel(this.resource, this.contextService, this.environmentService);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileEditorInput.prototype, "longTitle", {
            get: function () {
                return labels.getPathLabel(this.resource, void 0, this.environmentService);
            },
            enumerable: true,
            configurable: true
        });
        FileEditorInput.prototype.getTitle = function (verbosity) {
            var title;
            switch (verbosity) {
                case editor_2.Verbosity.SHORT:
                    title = this.shortTitle;
                    break;
                case editor_2.Verbosity.MEDIUM:
                    title = this.mediumTitle;
                    break;
                case editor_2.Verbosity.LONG:
                    title = this.longTitle;
                    break;
            }
            return this.decorateOrphanedFiles(title);
        };
        FileEditorInput.prototype.decorateOrphanedFiles = function (label) {
            var model = this.textFileService.models.get(this.resource);
            if (model && model.hasState(textfiles_1.ModelState.ORPHAN)) {
                return nls_1.localize('orphanedFile', "{0} (deleted from disk)", label);
            }
            return label;
        };
        FileEditorInput.prototype.isDirty = function () {
            var model = this.textFileService.models.get(this.resource);
            if (!model) {
                return false;
            }
            if (model.hasState(textfiles_1.ModelState.CONFLICT) || model.hasState(textfiles_1.ModelState.ERROR)) {
                return true; // always indicate dirty state if we are in conflict or error state
            }
            if (this.textFileService.getAutoSaveMode() === textfiles_1.AutoSaveMode.AFTER_SHORT_DELAY) {
                return false; // fast auto save enabled so we do not declare dirty
            }
            return model.isDirty();
        };
        FileEditorInput.prototype.confirmSave = function () {
            return this.textFileService.confirmSave([this.resource]);
        };
        FileEditorInput.prototype.save = function () {
            return this.textFileService.save(this.resource);
        };
        FileEditorInput.prototype.revert = function (options) {
            return this.textFileService.revert(this.resource, options);
        };
        FileEditorInput.prototype.getPreferredEditorId = function (candidates) {
            return this.forceOpenAsBinary ? files_2.BINARY_FILE_EDITOR_ID : files_2.TEXT_FILE_EDITOR_ID;
        };
        FileEditorInput.prototype.resolve = function (refresh) {
            var _this = this;
            // Resolve as binary
            if (this.forceOpenAsBinary) {
                return this.resolveAsBinary();
            }
            // Resolve as text
            return this.textFileService.models.loadOrCreate(this.resource, { encoding: this.preferredEncoding, reload: refresh }).then(function (model) {
                // This is a bit ugly, because we first resolve the model and then resolve a model reference. the reason being that binary
                // or very large files do not resolve to a text file model but should be opened as binary files without text. First calling into
                // loadOrCreate ensures we are not creating model references for these kind of resources.
                // In addition we have a bit of payload to take into account (encoding, reload) that the text resolver does not handle yet.
                if (!_this.textModelReference) {
                    _this.textModelReference = _this.textModelResolverService.createModelReference(_this.resource);
                }
                return _this.textModelReference.then(function (ref) { return ref.object; });
            }, function (error) {
                // In case of an error that indicates that the file is binary or too large, just return with the binary editor model
                if (error.fileOperationResult === files_1.FileOperationResult.FILE_IS_BINARY || error.fileOperationResult === files_1.FileOperationResult.FILE_TOO_LARGE) {
                    return _this.resolveAsBinary();
                }
                // Bubble any other error up
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        FileEditorInput.prototype.resolveAsBinary = function () {
            return this.instantiationService.createInstance(binaryEditorModel_1.BinaryEditorModel, this.resource, this.getName()).load().then(function (m) { return m; });
        };
        FileEditorInput.prototype.isResolved = function () {
            return !!this.textFileService.models.get(this.resource);
        };
        FileEditorInput.prototype.getTelemetryDescriptor = function () {
            var _this = this;
            var descriptor = _super.prototype.getTelemetryDescriptor.call(this);
            descriptor['resource'] = telemetryUtils_1.telemetryURIDescriptor(this.getResource(), function (path) { return _this.hashService.createSHA1(path); });
            /* __GDPR__FRAGMENT__
                "EditorTelemetryDescriptor" : {
                    "resource": { "${inline}": [ "${URIDescriptor}" ] }
                }
            */
            return descriptor;
        };
        FileEditorInput.prototype.dispose = function () {
            // Model reference
            if (this.textModelReference) {
                this.textModelReference.done(function (ref) { return ref.dispose(); });
                this.textModelReference = null;
            }
            // Listeners
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
            _super.prototype.dispose.call(this);
        };
        FileEditorInput.prototype.matches = function (otherInput) {
            if (_super.prototype.matches.call(this, otherInput) === true) {
                return true;
            }
            if (otherInput) {
                return otherInput instanceof FileEditorInput && otherInput.resource.toString() === this.resource.toString();
            }
            return false;
        };
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "shortDescription", null);
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "mediumDescription", null);
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "longDescription", null);
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "shortTitle", null);
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "mediumTitle", null);
        __decorate([
            decorators_1.memoize
        ], FileEditorInput.prototype, "longTitle", null);
        FileEditorInput = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, textfiles_1.ITextFileService),
            __param(5, environment_1.IEnvironmentService),
            __param(6, resolverService_1.ITextModelService),
            __param(7, hashService_1.IHashService)
        ], FileEditorInput);
        return FileEditorInput;
    }(editor_1.EditorInput));
    exports.FileEditorInput = FileEditorInput;
});
