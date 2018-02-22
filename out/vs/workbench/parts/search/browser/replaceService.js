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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/winjs.base", "vs/base/common/network", "vs/base/common/lifecycle", "vs/workbench/parts/search/common/replace", "vs/platform/editor/common/editor", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/workbench/parts/search/common/searchModel", "vs/editor/browser/services/bulkEdit", "vs/editor/common/services/resolverService", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/editor/common/model/textModel"], function (require, exports, nls, errors, winjs_base_1, network, lifecycle_1, replace_1, editor_1, modelService_1, modeService_1, searchModel_1, bulkEdit_1, resolverService_1, instantiation_1, files_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var REPLACE_PREVIEW = 'replacePreview';
    var toReplaceResource = function (fileResource) {
        return fileResource.with({ scheme: network.Schemas.internal, fragment: REPLACE_PREVIEW, query: JSON.stringify({ scheme: fileResource.scheme }) });
    };
    var toFileResource = function (replaceResource) {
        return replaceResource.with({ scheme: JSON.parse(replaceResource.query)['scheme'], fragment: '', query: '' });
    };
    var ReplacePreviewContentProvider = /** @class */ (function () {
        function ReplacePreviewContentProvider(instantiationService, textModelResolverService) {
            this.instantiationService = instantiationService;
            this.textModelResolverService = textModelResolverService;
            this.textModelResolverService.registerTextModelContentProvider(network.Schemas.internal, this);
        }
        ReplacePreviewContentProvider.prototype.provideTextContent = function (uri) {
            if (uri.fragment === REPLACE_PREVIEW) {
                return this.instantiationService.createInstance(ReplacePreviewModel).resolve(uri);
            }
            return null;
        };
        ReplacePreviewContentProvider = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, resolverService_1.ITextModelService)
        ], ReplacePreviewContentProvider);
        return ReplacePreviewContentProvider;
    }());
    exports.ReplacePreviewContentProvider = ReplacePreviewContentProvider;
    var ReplacePreviewModel = /** @class */ (function (_super) {
        __extends(ReplacePreviewModel, _super);
        function ReplacePreviewModel(modelService, modeService, textModelResolverService, replaceService, searchWorkbenchService) {
            var _this = _super.call(this) || this;
            _this.modelService = modelService;
            _this.modeService = modeService;
            _this.textModelResolverService = textModelResolverService;
            _this.replaceService = replaceService;
            _this.searchWorkbenchService = searchWorkbenchService;
            return _this;
        }
        ReplacePreviewModel.prototype.resolve = function (replacePreviewUri) {
            var _this = this;
            var fileResource = toFileResource(replacePreviewUri);
            var fileMatch = this.searchWorkbenchService.searchModel.searchResult.matches().filter(function (match) { return match.resource().toString() === fileResource.toString(); })[0];
            return this.textModelResolverService.createModelReference(fileResource).then(function (ref) {
                ref = _this._register(ref);
                var sourceModel = ref.object.textEditorModel;
                var sourceModelModeId = sourceModel.getLanguageIdentifier().language;
                var replacePreviewModel = _this.modelService.createModel(textModel_1.createTextBufferFactoryFromSnapshot(sourceModel.createSnapshot()), _this.modeService.getOrCreateMode(sourceModelModeId), replacePreviewUri);
                _this._register(fileMatch.onChange(function (modelChange) { return _this.update(sourceModel, replacePreviewModel, fileMatch, modelChange); }));
                _this._register(_this.searchWorkbenchService.searchModel.onReplaceTermChanged(function () { return _this.update(sourceModel, replacePreviewModel, fileMatch); }));
                _this._register(fileMatch.onDispose(function () { return replacePreviewModel.dispose(); })); // TODO@Sandeep we should not dispose a model directly but rather the reference (depends on https://github.com/Microsoft/vscode/issues/17073)
                _this._register(replacePreviewModel.onWillDispose(function () { return _this.dispose(); }));
                _this._register(sourceModel.onWillDispose(function () { return _this.dispose(); }));
                return replacePreviewModel;
            });
        };
        ReplacePreviewModel.prototype.update = function (sourceModel, replacePreviewModel, fileMatch, override) {
            if (override === void 0) { override = false; }
            if (!sourceModel.isDisposed() && !replacePreviewModel.isDisposed()) {
                this.replaceService.updateReplacePreview(fileMatch, override);
            }
        };
        ReplacePreviewModel = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, modeService_1.IModeService),
            __param(2, resolverService_1.ITextModelService),
            __param(3, replace_1.IReplaceService),
            __param(4, searchModel_1.ISearchWorkbenchService)
        ], ReplacePreviewModel);
        return ReplacePreviewModel;
    }(lifecycle_1.Disposable));
    var ReplaceService = /** @class */ (function () {
        function ReplaceService(fileService, editorService, textModelResolverService) {
            this.fileService = fileService;
            this.editorService = editorService;
            this.textModelResolverService = textModelResolverService;
        }
        ReplaceService.prototype.replace = function (arg, progress, resource) {
            var _this = this;
            if (progress === void 0) { progress = null; }
            if (resource === void 0) { resource = null; }
            var bulkEdit = new bulkEdit_1.BulkEdit(null, progress, this.textModelResolverService, this.fileService);
            if (arg instanceof searchModel_1.Match) {
                var match = arg;
                bulkEdit.add([this.createEdit(match, match.replaceString, resource)]);
            }
            if (arg instanceof searchModel_1.FileMatch) {
                arg = [arg];
            }
            if (arg instanceof Array) {
                arg.forEach(function (element) {
                    var fileMatch = element;
                    if (fileMatch.count() > 0) {
                        fileMatch.matches().forEach(function (match) {
                            bulkEdit.add([_this.createEdit(match, match.replaceString, resource)]);
                        });
                    }
                });
            }
            return bulkEdit.perform();
        };
        ReplaceService.prototype.openReplacePreview = function (element, preserveFocus, sideBySide, pinned) {
            var _this = this;
            var fileMatch = element instanceof searchModel_1.Match ? element.parent() : element;
            return this.editorService.openEditor({
                leftResource: fileMatch.resource(),
                rightResource: toReplaceResource(fileMatch.resource()),
                label: nls.localize('fileReplaceChanges', "{0} ↔ {1} (Replace Preview)", fileMatch.name(), fileMatch.name()),
                options: {
                    preserveFocus: preserveFocus,
                    pinned: pinned,
                    revealIfVisible: true
                }
            }).then(function (editor) {
                _this.updateReplacePreview(fileMatch).then(function () {
                    var editorControl = editor.getControl();
                    if (element instanceof searchModel_1.Match) {
                        editorControl.revealLineInCenter(element.range().startLineNumber, 1 /* Immediate */);
                    }
                });
            }, errors.onUnexpectedError);
        };
        ReplaceService.prototype.updateReplacePreview = function (fileMatch, override) {
            var _this = this;
            if (override === void 0) { override = false; }
            var replacePreviewUri = toReplaceResource(fileMatch.resource());
            return winjs_base_1.TPromise.join([this.textModelResolverService.createModelReference(fileMatch.resource()), this.textModelResolverService.createModelReference(replacePreviewUri)])
                .then(function (_a) {
                var sourceModelRef = _a[0], replaceModelRef = _a[1];
                var sourceModel = sourceModelRef.object.textEditorModel;
                var replaceModel = replaceModelRef.object.textEditorModel;
                var returnValue = winjs_base_1.TPromise.wrap(null);
                // If model is disposed do not update
                if (sourceModel && replaceModel) {
                    if (override) {
                        replaceModel.setValue(sourceModel.getValue());
                    }
                    else {
                        replaceModel.undo();
                    }
                    returnValue = _this.replace(fileMatch, null, replacePreviewUri);
                }
                return returnValue.then(function () {
                    sourceModelRef.dispose();
                    replaceModelRef.dispose();
                });
            });
        };
        ReplaceService.prototype.createEdit = function (match, text, resource) {
            if (resource === void 0) { resource = null; }
            var fileMatch = match.parent();
            var resourceEdit = {
                resource: resource !== null ? resource : fileMatch.resource(),
                edits: [{
                        range: match.range(),
                        text: text
                    }]
            };
            return resourceEdit;
        };
        ReplaceService = __decorate([
            __param(0, files_1.IFileService),
            __param(1, editor_1.IEditorService),
            __param(2, resolverService_1.ITextModelService)
        ], ReplaceService);
        return ReplaceService;
    }());
    exports.ReplaceService = ReplaceService;
});
