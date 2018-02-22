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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/winjs.base", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/editor/common/modes", "vs/editor/contrib/hover/getHover", "./hoverOperation", "./hoverWidgets", "vs/base/common/htmlContent", "vs/editor/common/model/textModel", "vs/editor/contrib/colorPicker/colorPickerModel", "vs/editor/contrib/colorPicker/colorPickerWidget", "vs/editor/contrib/colorPicker/colorDetector", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/contrib/colorPicker/color"], function (require, exports, nls, dom, winjs_base_1, range_1, position_1, modes_1, getHover_1, hoverOperation_1, hoverWidgets_1, htmlContent_1, textModel_1, colorPickerModel_1, colorPickerWidget_1, colorDetector_1, color_1, lifecycle_1, color_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = dom.$;
    var ColorHover = /** @class */ (function () {
        function ColorHover(range, color, provider) {
            this.range = range;
            this.color = color;
            this.provider = provider;
        }
        return ColorHover;
    }());
    var ModesContentComputer = /** @class */ (function () {
        function ModesContentComputer(editor) {
            this._editor = editor;
            this._range = null;
        }
        ModesContentComputer.prototype.setRange = function (range) {
            this._range = range;
            this._result = [];
        };
        ModesContentComputer.prototype.clearResult = function () {
            this._result = [];
        };
        ModesContentComputer.prototype.computeAsync = function () {
            var model = this._editor.getModel();
            if (!modes_1.HoverProviderRegistry.has(model)) {
                return winjs_base_1.TPromise.as(null);
            }
            return getHover_1.getHover(model, new position_1.Position(this._range.startLineNumber, this._range.startColumn));
        };
        ModesContentComputer.prototype.computeSync = function () {
            var _this = this;
            var lineNumber = this._range.startLineNumber;
            if (lineNumber > this._editor.getModel().getLineCount()) {
                // Illegal line number => no results
                return [];
            }
            var colorDetector = colorDetector_1.ColorDetector.get(this._editor);
            var maxColumn = this._editor.getModel().getLineMaxColumn(lineNumber);
            var lineDecorations = this._editor.getLineDecorations(lineNumber);
            var didFindColor = false;
            var result = lineDecorations.map(function (d) {
                var startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                var endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                if (startColumn > _this._range.startColumn || _this._range.endColumn > endColumn) {
                    return null;
                }
                var range = new range_1.Range(_this._range.startLineNumber, startColumn, _this._range.startLineNumber, endColumn);
                var colorData = colorDetector.getColorData(d.range.getStartPosition());
                if (!didFindColor && colorData) {
                    didFindColor = true;
                    var _a = colorData.colorInfo, color = _a.color, range_2 = _a.range;
                    return new ColorHover(range_2, color, colorData.provider);
                }
                else {
                    if (htmlContent_1.isEmptyMarkdownString(d.options.hoverMessage)) {
                        return null;
                    }
                    var contents = void 0;
                    if (d.options.hoverMessage) {
                        if (Array.isArray(d.options.hoverMessage)) {
                            contents = d.options.hoverMessage.slice();
                        }
                        else {
                            contents = [d.options.hoverMessage];
                        }
                    }
                    return { contents: contents, range: range };
                }
            });
            return result.filter(function (d) { return !!d; });
        };
        ModesContentComputer.prototype.onResult = function (result, isFromSynchronousComputation) {
            // Always put synchronous messages before asynchronous ones
            if (isFromSynchronousComputation) {
                this._result = result.concat(this._result.sort(function (a, b) {
                    if (a instanceof ColorHover) {
                        return -1;
                    }
                    else if (b instanceof ColorHover) {
                        return 1;
                    }
                    return 0;
                }));
            }
            else {
                this._result = this._result.concat(result);
            }
        };
        ModesContentComputer.prototype.getResult = function () {
            return this._result.slice(0);
        };
        ModesContentComputer.prototype.getResultWithLoadingMessage = function () {
            return this._result.slice(0).concat([this._getLoadingMessage()]);
        };
        ModesContentComputer.prototype._getLoadingMessage = function () {
            return {
                range: this._range,
                contents: [new htmlContent_1.MarkdownString().appendText(nls.localize('modesContentHover.loading', "Loading..."))]
            };
        };
        return ModesContentComputer;
    }());
    var ModesContentHoverWidget = /** @class */ (function (_super) {
        __extends(ModesContentHoverWidget, _super);
        function ModesContentHoverWidget(editor, markdownRenderner) {
            var _this = _super.call(this, ModesContentHoverWidget.ID, editor) || this;
            _this.renderDisposable = lifecycle_1.empty;
            _this.toDispose = [];
            _this._computer = new ModesContentComputer(_this._editor);
            _this._highlightDecorations = [];
            _this._isChangingDecorations = false;
            _this._markdownRenderer = markdownRenderner;
            markdownRenderner.onDidRenderCodeBlock(_this.onContentsChange, _this, _this.toDispose);
            _this._hoverOperation = new hoverOperation_1.HoverOperation(_this._computer, function (result) { return _this._withResult(result, true); }, null, function (result) { return _this._withResult(result, false); });
            _this.toDispose.push(dom.addStandardDisposableListener(_this.getDomNode(), dom.EventType.FOCUS, function () {
                if (_this._colorPicker) {
                    dom.addClass(_this.getDomNode(), 'colorpicker-hover');
                }
            }));
            _this.toDispose.push(dom.addStandardDisposableListener(_this.getDomNode(), dom.EventType.BLUR, function () {
                dom.removeClass(_this.getDomNode(), 'colorpicker-hover');
            }));
            return _this;
        }
        ModesContentHoverWidget.prototype.dispose = function () {
            this.renderDisposable.dispose();
            this.renderDisposable = lifecycle_1.empty;
            this._hoverOperation.cancel();
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        ModesContentHoverWidget.prototype.onModelDecorationsChanged = function () {
            if (this._isChangingDecorations) {
                return;
            }
            if (this.isVisible) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this._hoverOperation.cancel();
                this._computer.clearResult();
                if (!this._colorPicker) {
                    this._hoverOperation.start();
                }
            }
        };
        ModesContentHoverWidget.prototype.startShowingAt = function (range, focus) {
            if (this._lastRange && this._lastRange.equalsRange(range)) {
                // We have to show the widget at the exact same range as before, so no work is needed
                return;
            }
            this._hoverOperation.cancel();
            if (this.isVisible) {
                // The range might have changed, but the hover is visible
                // Instead of hiding it completely, filter out messages that are still in the new range and
                // kick off a new computation
                if (this._showAtPosition.lineNumber !== range.startLineNumber) {
                    this.hide();
                }
                else {
                    var filteredMessages = [];
                    for (var i = 0, len = this._messages.length; i < len; i++) {
                        var msg = this._messages[i];
                        var rng = msg.range;
                        if (rng.startColumn <= range.startColumn && rng.endColumn >= range.endColumn) {
                            filteredMessages.push(msg);
                        }
                    }
                    if (filteredMessages.length > 0) {
                        if (hoverContentsEquals(filteredMessages, this._messages)) {
                            return;
                        }
                        this._renderMessages(range, filteredMessages);
                    }
                    else {
                        this.hide();
                    }
                }
            }
            this._lastRange = range;
            this._computer.setRange(range);
            this._shouldFocus = focus;
            this._hoverOperation.start();
        };
        ModesContentHoverWidget.prototype.hide = function () {
            this._lastRange = null;
            this._hoverOperation.cancel();
            _super.prototype.hide.call(this);
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, []);
            this._isChangingDecorations = false;
            this.renderDisposable.dispose();
            this.renderDisposable = lifecycle_1.empty;
            this._colorPicker = null;
        };
        ModesContentHoverWidget.prototype.isColorPickerVisible = function () {
            if (this._colorPicker) {
                return true;
            }
            return false;
        };
        ModesContentHoverWidget.prototype._withResult = function (result, complete) {
            this._messages = result;
            if (this._lastRange && this._messages.length > 0) {
                this._renderMessages(this._lastRange, this._messages);
            }
            else if (complete) {
                this.hide();
            }
        };
        ModesContentHoverWidget.prototype._renderMessages = function (renderRange, messages) {
            var _this = this;
            this.renderDisposable.dispose();
            this._colorPicker = null;
            // update column from which to show
            var renderColumn = Number.MAX_VALUE, highlightRange = messages[0].range, fragment = document.createDocumentFragment(), isEmptyHoverContent = true;
            var containColorPicker = false;
            messages.forEach(function (msg) {
                if (!msg.range) {
                    return;
                }
                renderColumn = Math.min(renderColumn, msg.range.startColumn);
                highlightRange = range_1.Range.plusRange(highlightRange, msg.range);
                if (!(msg instanceof ColorHover)) {
                    msg.contents
                        .filter(function (contents) { return !htmlContent_1.isEmptyMarkdownString(contents); })
                        .forEach(function (contents) {
                        var renderedContents = _this._markdownRenderer.render(contents);
                        fragment.appendChild($('div.hover-row', null, renderedContents));
                        isEmptyHoverContent = false;
                    });
                }
                else {
                    containColorPicker = true;
                    var _a = msg.color, red = _a.red, green = _a.green, blue = _a.blue, alpha = _a.alpha;
                    var rgba = new color_1.RGBA(red * 255, green * 255, blue * 255, alpha);
                    var color_3 = new color_1.Color(rgba);
                    var editorModel_1 = _this._editor.getModel();
                    var range_3 = new range_1.Range(msg.range.startLineNumber, msg.range.startColumn, msg.range.endLineNumber, msg.range.endColumn);
                    var colorInfo = { range: msg.range, color: msg.color };
                    // create blank olor picker model and widget first to ensure it's positioned correctly.
                    var model_1 = new colorPickerModel_1.ColorPickerModel(color_3, [], 0);
                    var widget_1 = new colorPickerWidget_1.ColorPickerWidget(fragment, model_1, _this._editor.getConfiguration().pixelRatio);
                    color_2.getColorPresentations(editorModel_1, colorInfo, msg.provider).then(function (colorPresentations) {
                        model_1.colorPresentations = colorPresentations;
                        var originalText = _this._editor.getModel().getValueInRange(msg.range);
                        model_1.guessColorPresentation(color_3, originalText);
                        var updateEditorModel = function () {
                            var textEdits;
                            var newRange;
                            if (model_1.presentation.textEdit) {
                                textEdits = [model_1.presentation.textEdit];
                                newRange = new range_1.Range(model_1.presentation.textEdit.range.startLineNumber, model_1.presentation.textEdit.range.startColumn, model_1.presentation.textEdit.range.endLineNumber, model_1.presentation.textEdit.range.endColumn);
                                newRange = newRange.setEndPosition(newRange.endLineNumber, newRange.startColumn + model_1.presentation.textEdit.text.length);
                            }
                            else {
                                textEdits = [{ identifier: null, range: range_3, text: model_1.presentation.label, forceMoveMarkers: false }];
                                newRange = range_3.setEndPosition(range_3.endLineNumber, range_3.startColumn + model_1.presentation.label.length);
                            }
                            editorModel_1.pushEditOperations([], textEdits, function () { return []; });
                            if (model_1.presentation.additionalTextEdits) {
                                textEdits = model_1.presentation.additionalTextEdits.slice();
                                editorModel_1.pushEditOperations([], textEdits, function () { return []; });
                                _this.hide();
                            }
                            _this._editor.pushUndoStop();
                            range_3 = newRange;
                        };
                        var updateColorPresentations = function (color) {
                            return color_2.getColorPresentations(editorModel_1, {
                                range: range_3,
                                color: {
                                    red: color.rgba.r / 255,
                                    green: color.rgba.g / 255,
                                    blue: color.rgba.b / 255,
                                    alpha: color.rgba.a
                                }
                            }, msg.provider).then(function (colorPresentations) {
                                model_1.colorPresentations = colorPresentations;
                            });
                        };
                        var colorListener = model_1.onColorFlushed(function (color) {
                            updateColorPresentations(color).then(updateEditorModel);
                        });
                        var colorChangeListener = model_1.onDidChangeColor(updateColorPresentations);
                        _this._colorPicker = widget_1;
                        _this.showAt(new position_1.Position(renderRange.startLineNumber, renderColumn), _this._shouldFocus);
                        _this.updateContents(fragment);
                        _this._colorPicker.layout();
                        _this.renderDisposable = lifecycle_1.combinedDisposable([colorListener, colorChangeListener, widget_1]);
                    });
                }
            });
            // show
            if (!containColorPicker && !isEmptyHoverContent) {
                this.showAt(new position_1.Position(renderRange.startLineNumber, renderColumn), this._shouldFocus);
                this.updateContents(fragment);
            }
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, [{
                    range: highlightRange,
                    options: ModesContentHoverWidget._DECORATION_OPTIONS
                }]);
            this._isChangingDecorations = false;
        };
        ModesContentHoverWidget.ID = 'editor.contrib.modesContentHoverWidget';
        ModesContentHoverWidget._DECORATION_OPTIONS = textModel_1.ModelDecorationOptions.register({
            className: 'hoverHighlight'
        });
        return ModesContentHoverWidget;
    }(hoverWidgets_1.ContentHoverWidget));
    exports.ModesContentHoverWidget = ModesContentHoverWidget;
    function hoverContentsEquals(first, second) {
        if ((!first && second) || (first && !second) || first.length !== second.length) {
            return false;
        }
        for (var i = 0; i < first.length; i++) {
            var firstElement = first[i];
            var secondElement = second[i];
            if (firstElement instanceof ColorHover) {
                return false;
            }
            if (secondElement instanceof ColorHover) {
                return false;
            }
            if (!htmlContent_1.markedStringsEquals(firstElement.contents, secondElement.contents)) {
                return false;
            }
        }
        return true;
    }
});
