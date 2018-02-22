define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/viewModel/viewModel"], function (require, exports, range_1, position_1, viewModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewModelDecorations = /** @class */ (function () {
        function ViewModelDecorations(editorId, model, configuration, linesCollection, coordinatesConverter) {
            this.editorId = editorId;
            this.model = model;
            this.configuration = configuration;
            this._linesCollection = linesCollection;
            this._coordinatesConverter = coordinatesConverter;
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        ViewModelDecorations.prototype._clearCachedModelDecorationsResolver = function () {
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverViewRange = null;
        };
        ViewModelDecorations.prototype.dispose = function () {
            this._decorationsCache = null;
            this._clearCachedModelDecorationsResolver();
        };
        ViewModelDecorations.prototype.reset = function () {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        };
        ViewModelDecorations.prototype.onModelDecorationsChanged = function () {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        };
        ViewModelDecorations.prototype.onLineMappingChanged = function () {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        };
        ViewModelDecorations.prototype._getOrCreateViewModelDecoration = function (modelDecoration) {
            var id = modelDecoration.id;
            var r = this._decorationsCache[id];
            if (!r) {
                var modelRange = modelDecoration.range;
                var options = modelDecoration.options;
                var viewRange = void 0;
                if (options.isWholeLine) {
                    var start = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.startLineNumber, 1));
                    var end = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.endLineNumber, this.model.getLineMaxColumn(modelRange.endLineNumber)));
                    viewRange = new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
                }
                else {
                    viewRange = this._coordinatesConverter.convertModelRangeToViewRange(modelRange);
                }
                r = new viewModel_1.ViewModelDecoration(viewRange, options);
                this._decorationsCache[id] = r;
            }
            return r;
        };
        ViewModelDecorations.prototype.getDecorationsViewportData = function (viewRange) {
            var cacheIsValid = true;
            cacheIsValid = cacheIsValid && (this._cachedModelDecorationsResolver !== null);
            cacheIsValid = cacheIsValid && (viewRange.equalsRange(this._cachedModelDecorationsResolverViewRange));
            if (!cacheIsValid) {
                this._cachedModelDecorationsResolver = this._getDecorationsViewportData(viewRange);
                this._cachedModelDecorationsResolverViewRange = viewRange;
            }
            return this._cachedModelDecorationsResolver;
        };
        ViewModelDecorations.prototype._getDecorationsViewportData = function (viewportRange) {
            var modelDecorations = this._linesCollection.getDecorationsInRange(viewportRange, this.editorId, this.configuration.editor.readOnly);
            var startLineNumber = viewportRange.startLineNumber;
            var endLineNumber = viewportRange.endLineNumber;
            var decorationsInViewport = [], decorationsInViewportLen = 0;
            var inlineDecorations = [];
            for (var j = startLineNumber; j <= endLineNumber; j++) {
                inlineDecorations[j - startLineNumber] = [];
            }
            for (var i = 0, len = modelDecorations.length; i < len; i++) {
                var modelDecoration = modelDecorations[i];
                var decorationOptions = modelDecoration.options;
                var viewModelDecoration = this._getOrCreateViewModelDecoration(modelDecoration);
                var viewRange = viewModelDecoration.range;
                decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
                if (decorationOptions.inlineClassName) {
                    var inlineDecoration = new viewModel_1.InlineDecoration(viewRange, decorationOptions.inlineClassName, 0 /* Regular */);
                    var intersectedStartLineNumber = Math.max(startLineNumber, viewRange.startLineNumber);
                    var intersectedEndLineNumber = Math.min(endLineNumber, viewRange.endLineNumber);
                    for (var j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
                        inlineDecorations[j - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.beforeContentClassName) {
                    if (startLineNumber <= viewRange.startLineNumber && viewRange.startLineNumber <= endLineNumber) {
                        var inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.startLineNumber, viewRange.startColumn, viewRange.startLineNumber, viewRange.startColumn), decorationOptions.beforeContentClassName, 1 /* Before */);
                        inlineDecorations[viewRange.startLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.afterContentClassName) {
                    if (startLineNumber <= viewRange.endLineNumber && viewRange.endLineNumber <= endLineNumber) {
                        var inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.endLineNumber, viewRange.endColumn, viewRange.endLineNumber, viewRange.endColumn), decorationOptions.afterContentClassName, 2 /* After */);
                        inlineDecorations[viewRange.endLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
            }
            return {
                decorations: decorationsInViewport,
                inlineDecorations: inlineDecorations
            };
        };
        return ViewModelDecorations;
    }());
    exports.ViewModelDecorations = ViewModelDecorations;
});
