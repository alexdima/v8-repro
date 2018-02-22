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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/editor/common/services/resolverService", "vs/editor/common/services/modelService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/model", "vs/editor/common/services/modeService", "vs/base/common/marked/marked", "vs/base/common/network", "vs/editor/common/core/range"], function (require, exports, winjs_base_1, uri_1, resolverService_1, modelService_1, textfiles_1, model_1, modeService_1, marked_1, network_1, range_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WalkThroughContentProvider = /** @class */ (function () {
        function WalkThroughContentProvider(textModelResolverService, textFileService, modeService, modelService) {
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.modeService = modeService;
            this.modelService = modelService;
            this.textModelResolverService.registerTextModelContentProvider(network_1.Schemas.walkThrough, this);
        }
        WalkThroughContentProvider.prototype.provideTextContent = function (resource) {
            var _this = this;
            var query = resource.query ? JSON.parse(resource.query) : {};
            var content = (query.moduleId ? new winjs_base_1.TPromise(function (resolve, reject) {
                require([query.moduleId], function (content) {
                    try {
                        resolve(content.default());
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            }) : this.textFileService.resolveTextContent(uri_1.default.file(resource.fsPath)).then(function (content) { return content.value; }));
            return content.then(function (content) {
                var codeEditorModel = _this.modelService.getModel(resource);
                if (!codeEditorModel) {
                    codeEditorModel = _this.modelService.createModel(content, _this.modeService.getOrCreateModeByFilenameOrFirstLine(resource.fsPath), resource);
                }
                else {
                    _this.modelService.updateModel(codeEditorModel, content);
                }
                return codeEditorModel;
            });
        };
        WalkThroughContentProvider = __decorate([
            __param(0, resolverService_1.ITextModelService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService)
        ], WalkThroughContentProvider);
        return WalkThroughContentProvider;
    }());
    exports.WalkThroughContentProvider = WalkThroughContentProvider;
    var WalkThroughSnippetContentProvider = /** @class */ (function () {
        function WalkThroughSnippetContentProvider(textModelResolverService, textFileService, modeService, modelService) {
            this.textModelResolverService = textModelResolverService;
            this.textFileService = textFileService;
            this.modeService = modeService;
            this.modelService = modelService;
            this.textModelResolverService.registerTextModelContentProvider(network_1.Schemas.walkThroughSnippet, this);
        }
        WalkThroughSnippetContentProvider.prototype.provideTextContent = function (resource) {
            var _this = this;
            return this.textFileService.resolveTextContent(uri_1.default.file(resource.fsPath)).then(function (content) {
                var codeEditorModel = _this.modelService.getModel(resource);
                if (!codeEditorModel) {
                    var j_1 = parseInt(resource.fragment);
                    var codeSnippet_1 = '';
                    var languageName_1 = '';
                    var i_1 = 0;
                    var renderer = new marked_1.marked.Renderer();
                    renderer.code = function (code, lang) {
                        if (i_1++ === j_1) {
                            codeSnippet_1 = code;
                            languageName_1 = lang;
                        }
                        return '';
                    };
                    var textBuffer = content.value.create(model_1.DefaultEndOfLine.LF);
                    var lineCount = textBuffer.getLineCount();
                    var range = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
                    var markdown = textBuffer.getValueInRange(range, model_1.EndOfLinePreference.TextDefined);
                    marked_1.marked(markdown, { renderer: renderer });
                    var modeId = _this.modeService.getModeIdForLanguageName(languageName_1);
                    var mode = _this.modeService.getOrCreateMode(modeId);
                    codeEditorModel = _this.modelService.createModel(codeSnippet_1, mode, resource);
                }
                else {
                    _this.modelService.updateModel(codeEditorModel, content.value);
                }
                return codeEditorModel;
            });
        };
        WalkThroughSnippetContentProvider = __decorate([
            __param(0, resolverService_1.ITextModelService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, modeService_1.IModeService),
            __param(3, modelService_1.IModelService)
        ], WalkThroughSnippetContentProvider);
        return WalkThroughSnippetContentProvider;
    }());
    exports.WalkThroughSnippetContentProvider = WalkThroughSnippetContentProvider;
});
