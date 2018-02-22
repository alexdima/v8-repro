var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/network", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/markers/common/markers", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModel", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/editor/common/config/editorOptions", "vs/editor/common/modes/modesRegistry", "vs/editor/common/model/intervalTree", "vs/base/common/diff/diff", "vs/editor/common/core/editOperation", "vs/platform/theme/common/themeService", "vs/editor/common/view/editorColorRegistry", "vs/editor/common/model"], function (require, exports, nls, network, event_1, htmlContent_1, lifecycle_1, severity_1, winjs_base_1, markers_1, range_1, selection_1, textModel_1, platform, configuration_1, editorOptions_1, modesRegistry_1, intervalTree_1, diff_1, editOperation_1, themeService_1, editorColorRegistry_1, model_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function MODEL_ID(resource) {
        return resource.toString();
    }
    var ModelData = /** @class */ (function () {
        function ModelData(model, onWillDispose, onDidChangeLanguage) {
            this.model = model;
            this._markerDecorations = [];
            this._modelEventListeners = [];
            this._modelEventListeners.push(model.onWillDispose(function () { return onWillDispose(model); }));
            this._modelEventListeners.push(model.onDidChangeLanguage(function (e) { return onDidChangeLanguage(model, e); }));
        }
        ModelData.prototype.dispose = function () {
            this._markerDecorations = this.model.deltaDecorations(this._markerDecorations, []);
            this._modelEventListeners = lifecycle_1.dispose(this._modelEventListeners);
            this.model = null;
        };
        ModelData.prototype.acceptMarkerDecorations = function (newDecorations) {
            this._markerDecorations = this.model.deltaDecorations(this._markerDecorations, newDecorations);
        };
        return ModelData;
    }());
    var ModelMarkerHandler = /** @class */ (function () {
        function ModelMarkerHandler() {
        }
        ModelMarkerHandler.setMarkers = function (modelData, markerService) {
            var _this = this;
            // Limit to the first 500 errors/warnings
            var markers = markerService.read({ resource: modelData.model.uri, take: 500 });
            var newModelDecorations = markers.map(function (marker) {
                return {
                    range: _this._createDecorationRange(modelData.model, marker),
                    options: _this._createDecorationOption(marker)
                };
            });
            modelData.acceptMarkerDecorations(newModelDecorations);
        };
        ModelMarkerHandler._createDecorationRange = function (model, rawMarker) {
            var marker = model.validateRange(new range_1.Range(rawMarker.startLineNumber, rawMarker.startColumn, rawMarker.endLineNumber, rawMarker.endColumn));
            var ret = new range_1.Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn);
            if (ret.isEmpty()) {
                var word = model.getWordAtPosition(ret.getStartPosition());
                if (word) {
                    ret = new range_1.Range(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
                }
                else {
                    var maxColumn = model.getLineLastNonWhitespaceColumn(marker.startLineNumber) ||
                        model.getLineMaxColumn(marker.startLineNumber);
                    if (maxColumn === 1) {
                        // empty line
                        // console.warn('marker on empty line:', marker);
                    }
                    else if (ret.endColumn >= maxColumn) {
                        // behind eol
                        ret = new range_1.Range(ret.startLineNumber, maxColumn - 1, ret.endLineNumber, maxColumn);
                    }
                    else {
                        // extend marker to width = 1
                        ret = new range_1.Range(ret.startLineNumber, ret.startColumn, ret.endLineNumber, ret.endColumn + 1);
                    }
                }
            }
            else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
                var minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
                if (minColumn < ret.endColumn) {
                    ret = new range_1.Range(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
                    rawMarker.startColumn = minColumn;
                }
            }
            return ret;
        };
        ModelMarkerHandler._createDecorationOption = function (marker) {
            var className;
            var color;
            var darkColor;
            switch (marker.severity) {
                case severity_1.default.Ignore:
                    // do something
                    break;
                case severity_1.default.Warning:
                    className = intervalTree_1.ClassName.EditorWarningDecoration;
                    color = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerWarning);
                    darkColor = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerWarning);
                    break;
                case severity_1.default.Info:
                    className = intervalTree_1.ClassName.EditorInfoDecoration;
                    color = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerInfo);
                    darkColor = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerInfo);
                    break;
                case severity_1.default.Error:
                default:
                    className = intervalTree_1.ClassName.EditorErrorDecoration;
                    color = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerError);
                    darkColor = themeService_1.themeColorFromId(editorColorRegistry_1.overviewRulerError);
                    break;
            }
            var hoverMessage = null;
            var message = marker.message, source = marker.source;
            if (typeof message === 'string') {
                message = message.trim();
                if (source) {
                    if (/\n/g.test(message)) {
                        message = nls.localize('diagAndSourceMultiline', "[{0}]\n{1}", source, message);
                    }
                    else {
                        message = nls.localize('diagAndSource', "[{0}] {1}", source, message);
                    }
                }
                hoverMessage = new htmlContent_1.MarkdownString().appendCodeblock('_', message);
            }
            return {
                stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                className: className,
                hoverMessage: hoverMessage,
                showIfCollapsed: true,
                overviewRuler: {
                    color: color,
                    darkColor: darkColor,
                    position: model_1.OverviewRulerLane.Right
                }
            };
        };
        return ModelMarkerHandler;
    }());
    var DEFAULT_EOL = (platform.isLinux || platform.isMacintosh) ? model_1.DefaultEndOfLine.LF : model_1.DefaultEndOfLine.CRLF;
    var ModelServiceImpl = /** @class */ (function () {
        function ModelServiceImpl(markerService, configurationService) {
            var _this = this;
            this._markerService = markerService;
            this._configurationService = configurationService;
            this._models = {};
            this._modelCreationOptionsByLanguageAndResource = Object.create(null);
            this._onModelAdded = new event_1.Emitter();
            this._onModelRemoved = new event_1.Emitter();
            this._onModelModeChanged = new event_1.Emitter();
            if (this._markerService) {
                this._markerServiceSubscription = this._markerService.onMarkerChanged(this._handleMarkerChange, this);
            }
            this._configurationServiceSubscription = this._configurationService.onDidChangeConfiguration(function (e) { return _this._updateModelOptions(); });
            this._updateModelOptions();
        }
        ModelServiceImpl._readModelOptions = function (config) {
            var tabSize = editorOptions_1.EDITOR_MODEL_DEFAULTS.tabSize;
            if (config.editor && typeof config.editor.tabSize !== 'undefined') {
                var parsedTabSize = parseInt(config.editor.tabSize, 10);
                if (!isNaN(parsedTabSize)) {
                    tabSize = parsedTabSize;
                }
            }
            var insertSpaces = editorOptions_1.EDITOR_MODEL_DEFAULTS.insertSpaces;
            if (config.editor && typeof config.editor.insertSpaces !== 'undefined') {
                insertSpaces = (config.editor.insertSpaces === 'false' ? false : Boolean(config.editor.insertSpaces));
            }
            var newDefaultEOL = DEFAULT_EOL;
            var eol = config.files && config.files.eol;
            if (eol === '\r\n') {
                newDefaultEOL = model_1.DefaultEndOfLine.CRLF;
            }
            else if (eol === '\n') {
                newDefaultEOL = model_1.DefaultEndOfLine.LF;
            }
            var trimAutoWhitespace = editorOptions_1.EDITOR_MODEL_DEFAULTS.trimAutoWhitespace;
            if (config.editor && typeof config.editor.trimAutoWhitespace !== 'undefined') {
                trimAutoWhitespace = (config.editor.trimAutoWhitespace === 'false' ? false : Boolean(config.editor.trimAutoWhitespace));
            }
            var detectIndentation = editorOptions_1.EDITOR_MODEL_DEFAULTS.detectIndentation;
            if (config.editor && typeof config.editor.detectIndentation !== 'undefined') {
                detectIndentation = (config.editor.detectIndentation === 'false' ? false : Boolean(config.editor.detectIndentation));
            }
            return {
                tabSize: tabSize,
                insertSpaces: insertSpaces,
                detectIndentation: detectIndentation,
                defaultEOL: newDefaultEOL,
                trimAutoWhitespace: trimAutoWhitespace
            };
        };
        ModelServiceImpl.prototype.getCreationOptions = function (language, resource) {
            var creationOptions = this._modelCreationOptionsByLanguageAndResource[language + resource];
            if (!creationOptions) {
                creationOptions = ModelServiceImpl._readModelOptions(this._configurationService.getValue({ overrideIdentifier: language, resource: resource }));
                this._modelCreationOptionsByLanguageAndResource[language + resource] = creationOptions;
            }
            return creationOptions;
        };
        ModelServiceImpl.prototype._updateModelOptions = function () {
            var oldOptionsByLanguageAndResource = this._modelCreationOptionsByLanguageAndResource;
            this._modelCreationOptionsByLanguageAndResource = Object.create(null);
            // Update options on all models
            var keys = Object.keys(this._models);
            for (var i = 0, len = keys.length; i < len; i++) {
                var modelId = keys[i];
                var modelData = this._models[modelId];
                var language = modelData.model.getLanguageIdentifier().language;
                var uri = modelData.model.uri;
                var oldOptions = oldOptionsByLanguageAndResource[language + uri];
                var newOptions = this.getCreationOptions(language, uri);
                ModelServiceImpl._setModelOptionsForModel(modelData.model, newOptions, oldOptions);
            }
        };
        ModelServiceImpl._setModelOptionsForModel = function (model, newOptions, currentOptions) {
            if (currentOptions
                && (currentOptions.detectIndentation === newOptions.detectIndentation)
                && (currentOptions.insertSpaces === newOptions.insertSpaces)
                && (currentOptions.tabSize === newOptions.tabSize)
                && (currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace)) {
                // Same indent opts, no need to touch the model
                return;
            }
            if (newOptions.detectIndentation) {
                model.detectIndentation(newOptions.insertSpaces, newOptions.tabSize);
                model.updateOptions({
                    trimAutoWhitespace: newOptions.trimAutoWhitespace
                });
            }
            else {
                model.updateOptions({
                    insertSpaces: newOptions.insertSpaces,
                    tabSize: newOptions.tabSize,
                    trimAutoWhitespace: newOptions.trimAutoWhitespace
                });
            }
        };
        ModelServiceImpl.prototype.dispose = function () {
            if (this._markerServiceSubscription) {
                this._markerServiceSubscription.dispose();
            }
            this._configurationServiceSubscription.dispose();
        };
        ModelServiceImpl.prototype._handleMarkerChange = function (changedResources) {
            var _this = this;
            changedResources.forEach(function (resource) {
                var modelId = MODEL_ID(resource);
                var modelData = _this._models[modelId];
                if (!modelData) {
                    return;
                }
                ModelMarkerHandler.setMarkers(modelData, _this._markerService);
            });
        };
        ModelServiceImpl.prototype._cleanUp = function (model) {
            var _this = this;
            // clean up markers for internal, transient models
            if (model.uri.scheme === network.Schemas.inMemory
                || model.uri.scheme === network.Schemas.internal
                || model.uri.scheme === network.Schemas.vscode) {
                if (this._markerService) {
                    this._markerService.read({ resource: model.uri }).map(function (marker) { return marker.owner; }).forEach(function (owner) { return _this._markerService.remove(owner, [model.uri]); });
                }
            }
            // clean up cache
            delete this._modelCreationOptionsByLanguageAndResource[model.getLanguageIdentifier().language + model.uri];
        };
        // --- begin IModelService
        ModelServiceImpl.prototype._createModelData = function (value, languageIdentifier, resource) {
            var _this = this;
            // create & save the model
            var options = this.getCreationOptions(languageIdentifier.language, resource);
            var model = new textModel_1.TextModel(value, options, languageIdentifier, resource);
            var modelId = MODEL_ID(model.uri);
            if (this._models[modelId]) {
                // There already exists a model with this id => this is a programmer error
                throw new Error('ModelService: Cannot add model because it already exists!');
            }
            var modelData = new ModelData(model, function (model) { return _this._onWillDispose(model); }, function (model, e) { return _this._onDidChangeLanguage(model, e); });
            this._models[modelId] = modelData;
            return modelData;
        };
        ModelServiceImpl.prototype.updateModel = function (model, value) {
            var options = this.getCreationOptions(model.getLanguageIdentifier().language, model.uri);
            var textBuffer = textModel_1.createTextBuffer(value, options.defaultEOL);
            // Return early if the text is already set in that form
            if (model.equalsTextBuffer(textBuffer)) {
                return;
            }
            // Otherwise find a diff between the values and update model
            model.setEOL(textBuffer.getEOL() === '\r\n' ? model_1.EndOfLineSequence.CRLF : model_1.EndOfLineSequence.LF);
            model.pushEditOperations([new selection_1.Selection(1, 1, 1, 1)], ModelServiceImpl._computeEdits(model, textBuffer), function (inverseEditOperations) { return [new selection_1.Selection(1, 1, 1, 1)]; });
        };
        /**
         * Compute edits to bring `model` to the state of `textSource`.
         */
        ModelServiceImpl._computeEdits = function (model, textBuffer) {
            var modelLineSequence = new /** @class */ (function () {
                function class_1() {
                }
                class_1.prototype.getLength = function () {
                    return model.getLineCount();
                };
                class_1.prototype.getElementHash = function (index) {
                    return model.getLineContent(index + 1);
                };
                return class_1;
            }());
            var textSourceLineSequence = new /** @class */ (function () {
                function class_2() {
                }
                class_2.prototype.getLength = function () {
                    return textBuffer.getLineCount();
                };
                class_2.prototype.getElementHash = function (index) {
                    return textBuffer.getLineContent(index + 1);
                };
                return class_2;
            }());
            var diffResult = new diff_1.LcsDiff(modelLineSequence, textSourceLineSequence).ComputeDiff(false);
            var edits = [], editsLen = 0;
            var modelLineCount = model.getLineCount();
            for (var i = 0, len = diffResult.length; i < len; i++) {
                var diff = diffResult[i];
                var originalStart = diff.originalStart;
                var originalLength = diff.originalLength;
                var modifiedStart = diff.modifiedStart;
                var modifiedLength = diff.modifiedLength;
                var lines = [];
                for (var j = 0; j < modifiedLength; j++) {
                    lines[j] = textBuffer.getLineContent(modifiedStart + j + 1);
                }
                var text = lines.join('\n');
                var range = void 0;
                if (originalLength === 0) {
                    // insertion
                    if (originalStart === modelLineCount) {
                        // insert at the end
                        var maxLineColumn = model.getLineMaxColumn(modelLineCount);
                        range = new range_1.Range(modelLineCount, maxLineColumn, modelLineCount, maxLineColumn);
                        text = '\n' + text;
                    }
                    else {
                        // insert
                        range = new range_1.Range(originalStart + 1, 1, originalStart + 1, 1);
                        text = text + '\n';
                    }
                }
                else if (modifiedLength === 0) {
                    // deletion
                    if (originalStart + originalLength >= modelLineCount) {
                        // delete at the end
                        range = new range_1.Range(originalStart, model.getLineMaxColumn(originalStart), originalStart + originalLength, model.getLineMaxColumn(originalStart + originalLength));
                    }
                    else {
                        // delete
                        range = new range_1.Range(originalStart + 1, 1, originalStart + originalLength + 1, 1);
                    }
                }
                else {
                    // modification
                    range = new range_1.Range(originalStart + 1, 1, originalStart + originalLength, model.getLineMaxColumn(originalStart + originalLength));
                }
                edits[editsLen++] = editOperation_1.EditOperation.replace(range, text);
            }
            return edits;
        };
        ModelServiceImpl.prototype.createModel = function (value, modeOrPromise, resource) {
            var modelData;
            if (!modeOrPromise || winjs_base_1.TPromise.is(modeOrPromise)) {
                modelData = this._createModelData(value, modesRegistry_1.PLAINTEXT_LANGUAGE_IDENTIFIER, resource);
                this.setMode(modelData.model, modeOrPromise);
            }
            else {
                modelData = this._createModelData(value, modeOrPromise.getLanguageIdentifier(), resource);
            }
            // handle markers (marker service => model)
            if (this._markerService) {
                ModelMarkerHandler.setMarkers(modelData, this._markerService);
            }
            this._onModelAdded.fire(modelData.model);
            return modelData.model;
        };
        ModelServiceImpl.prototype.setMode = function (model, modeOrPromise) {
            if (!modeOrPromise) {
                return;
            }
            if (winjs_base_1.TPromise.is(modeOrPromise)) {
                modeOrPromise.then(function (mode) {
                    if (!model.isDisposed()) {
                        model.setMode(mode.getLanguageIdentifier());
                    }
                });
            }
            else {
                model.setMode(modeOrPromise.getLanguageIdentifier());
            }
        };
        ModelServiceImpl.prototype.destroyModel = function (resource) {
            // We need to support that not all models get disposed through this service (i.e. model.dispose() should work!)
            var modelData = this._models[MODEL_ID(resource)];
            if (!modelData) {
                return;
            }
            modelData.model.dispose();
        };
        ModelServiceImpl.prototype.getModels = function () {
            var ret = [];
            var keys = Object.keys(this._models);
            for (var i = 0, len = keys.length; i < len; i++) {
                var modelId = keys[i];
                ret.push(this._models[modelId].model);
            }
            return ret;
        };
        ModelServiceImpl.prototype.getModel = function (resource) {
            var modelId = MODEL_ID(resource);
            var modelData = this._models[modelId];
            if (!modelData) {
                return null;
            }
            return modelData.model;
        };
        Object.defineProperty(ModelServiceImpl.prototype, "onModelAdded", {
            get: function () {
                return this._onModelAdded ? this._onModelAdded.event : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelServiceImpl.prototype, "onModelRemoved", {
            get: function () {
                return this._onModelRemoved ? this._onModelRemoved.event : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ModelServiceImpl.prototype, "onModelModeChanged", {
            get: function () {
                return this._onModelModeChanged ? this._onModelModeChanged.event : null;
            },
            enumerable: true,
            configurable: true
        });
        // --- end IModelService
        ModelServiceImpl.prototype._onWillDispose = function (model) {
            var modelId = MODEL_ID(model.uri);
            var modelData = this._models[modelId];
            delete this._models[modelId];
            modelData.dispose();
            this._cleanUp(model);
            this._onModelRemoved.fire(model);
        };
        ModelServiceImpl.prototype._onDidChangeLanguage = function (model, e) {
            var oldModeId = e.oldLanguage;
            var newModeId = model.getLanguageIdentifier().language;
            var oldOptions = this.getCreationOptions(oldModeId, model.uri);
            var newOptions = this.getCreationOptions(newModeId, model.uri);
            ModelServiceImpl._setModelOptionsForModel(model, newOptions, oldOptions);
            this._onModelModeChanged.fire({ model: model, oldModeId: oldModeId });
        };
        ModelServiceImpl = __decorate([
            __param(0, markers_1.IMarkerService),
            __param(1, configuration_1.IConfigurationService)
        ], ModelServiceImpl);
        return ModelServiceImpl;
    }());
    exports.ModelServiceImpl = ModelServiceImpl;
});
