/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/strings", "vs/base/browser/dom", "vs/editor/common/core/range", "vs/editor/browser/editorBrowser", "vs/editor/common/model/textModel", "vs/editor/common/view/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/css!./codelensWidget"], function (require, exports, lifecycle_1, severity_1, strings_1, dom, range_1, editorBrowser, textModel_1, editorColorRegistry_1, themeService_1, colorRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var CodeLensViewZone = /** @class */ (function () {
        function CodeLensViewZone(afterLineNumber, onHeight) {
            this.afterLineNumber = afterLineNumber;
            this._onHeight = onHeight;
            this.heightInLines = 1;
            this.suppressMouseDown = true;
            this.domNode = document.createElement('div');
        }
        CodeLensViewZone.prototype.onComputedHeight = function (height) {
            if (this._lastHeight === undefined) {
                this._lastHeight = height;
            }
            else if (this._lastHeight !== height) {
                this._lastHeight = height;
                this._onHeight();
            }
        };
        return CodeLensViewZone;
    }());
    var CodeLensContentWidget = /** @class */ (function () {
        function CodeLensContentWidget(editor, symbolRange, commandService, messageService) {
            var _this = this;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this._disposables = [];
            this._commands = Object.create(null);
            this._id = 'codeLensWidget' + (++CodeLensContentWidget._idPool);
            this._editor = editor;
            this.setSymbolRange(symbolRange);
            this._domNode = document.createElement('span');
            this._domNode.innerHTML = '&nbsp;';
            dom.addClass(this._domNode, 'codelens-decoration');
            dom.addClass(this._domNode, 'invisible-cl');
            this._updateHeight();
            this._disposables.push(this._editor.onDidChangeConfiguration(function (e) { return e.fontInfo && _this._updateHeight(); }));
            this._disposables.push(dom.addDisposableListener(this._domNode, 'click', function (e) {
                var element = e.target;
                if (element.tagName === 'A' && element.id) {
                    var command = _this._commands[element.id];
                    if (command) {
                        editor.focus();
                        commandService.executeCommand.apply(commandService, [command.id].concat(command.arguments)).done(undefined, function (err) {
                            messageService.show(severity_1.default.Error, err);
                        });
                    }
                }
            }));
            this.updateVisibility();
        }
        CodeLensContentWidget.prototype.dispose = function () {
            lifecycle_1.dispose(this._disposables);
        };
        CodeLensContentWidget.prototype._updateHeight = function () {
            var _a = this._editor.getConfiguration(), fontInfo = _a.fontInfo, lineHeight = _a.lineHeight;
            this._domNode.style.height = Math.round(lineHeight * 1.1) + "px";
            this._domNode.style.lineHeight = lineHeight + "px";
            this._domNode.style.fontSize = Math.round(fontInfo.fontSize * .9) + "px";
            this._domNode.innerHTML = '&nbsp;';
        };
        CodeLensContentWidget.prototype.updateVisibility = function () {
            if (this.isVisible()) {
                dom.removeClass(this._domNode, 'invisible-cl');
                dom.addClass(this._domNode, 'fadein');
            }
        };
        CodeLensContentWidget.prototype.withCommands = function (symbols) {
            this._commands = Object.create(null);
            if (!symbols || !symbols.length) {
                this._domNode.innerHTML = 'no commands';
                return;
            }
            var html = [];
            for (var i = 0; i < symbols.length; i++) {
                var command = symbols[i].command;
                var title = strings_1.escape(command.title);
                var part = void 0;
                if (command.id) {
                    part = strings_1.format('<a id={0}>{1}</a>', i, title);
                    this._commands[i] = command;
                }
                else {
                    part = strings_1.format('<span>{0}</span>', title);
                }
                html.push(part);
            }
            this._domNode.innerHTML = html.join('<span>&nbsp;|&nbsp;</span>');
            this._editor.layoutContentWidget(this);
        };
        CodeLensContentWidget.prototype.getId = function () {
            return this._id;
        };
        CodeLensContentWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        CodeLensContentWidget.prototype.setSymbolRange = function (range) {
            var lineNumber = range.startLineNumber;
            var column = this._editor.getModel().getLineFirstNonWhitespaceColumn(lineNumber);
            this._widgetPosition = {
                position: { lineNumber: lineNumber, column: column },
                preference: [editorBrowser.ContentWidgetPositionPreference.ABOVE]
            };
        };
        CodeLensContentWidget.prototype.getPosition = function () {
            return this._widgetPosition;
        };
        CodeLensContentWidget.prototype.isVisible = function () {
            return this._domNode.hasAttribute('monaco-visible-content-widget');
        };
        CodeLensContentWidget._idPool = 0;
        return CodeLensContentWidget;
    }());
    var CodeLensHelper = /** @class */ (function () {
        function CodeLensHelper() {
            this._removeDecorations = [];
            this._addDecorations = [];
            this._addDecorationsCallbacks = [];
        }
        CodeLensHelper.prototype.addDecoration = function (decoration, callback) {
            this._addDecorations.push(decoration);
            this._addDecorationsCallbacks.push(callback);
        };
        CodeLensHelper.prototype.removeDecoration = function (decorationId) {
            this._removeDecorations.push(decorationId);
        };
        CodeLensHelper.prototype.commit = function (changeAccessor) {
            var resultingDecorations = changeAccessor.deltaDecorations(this._removeDecorations, this._addDecorations);
            for (var i = 0, len = resultingDecorations.length; i < len; i++) {
                this._addDecorationsCallbacks[i](resultingDecorations[i]);
            }
        };
        return CodeLensHelper;
    }());
    exports.CodeLensHelper = CodeLensHelper;
    var CodeLens = /** @class */ (function () {
        function CodeLens(data, editor, helper, viewZoneChangeAccessor, commandService, messageService, updateCallabck) {
            var _this = this;
            this._editor = editor;
            this._data = data;
            this._decorationIds = new Array(this._data.length);
            var range;
            this._data.forEach(function (codeLensData, i) {
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: textModel_1.ModelDecorationOptions.EMPTY
                }, function (id) { return _this._decorationIds[i] = id; });
                // the range contains all lenses on this line
                if (!range) {
                    range = range_1.Range.lift(codeLensData.symbol.range);
                }
                else {
                    range = range_1.Range.plusRange(range, codeLensData.symbol.range);
                }
            });
            this._contentWidget = new CodeLensContentWidget(editor, range, commandService, messageService);
            this._viewZone = new CodeLensViewZone(range.startLineNumber - 1, updateCallabck);
            this._viewZoneId = viewZoneChangeAccessor.addZone(this._viewZone);
            this._editor.addContentWidget(this._contentWidget);
        }
        CodeLens.prototype.dispose = function (helper, viewZoneChangeAccessor) {
            while (this._decorationIds.length) {
                helper.removeDecoration(this._decorationIds.pop());
            }
            if (viewZoneChangeAccessor) {
                viewZoneChangeAccessor.removeZone(this._viewZoneId);
            }
            this._editor.removeContentWidget(this._contentWidget);
            this._contentWidget.dispose();
        };
        CodeLens.prototype.isValid = function () {
            var _this = this;
            return this._decorationIds.some(function (id, i) {
                var range = _this._editor.getModel().getDecorationRange(id);
                var symbol = _this._data[i].symbol;
                return range && range_1.Range.isEmpty(symbol.range) === range.isEmpty();
            });
        };
        CodeLens.prototype.updateCodeLensSymbols = function (data, helper) {
            var _this = this;
            while (this._decorationIds.length) {
                helper.removeDecoration(this._decorationIds.pop());
            }
            this._data = data;
            this._decorationIds = new Array(this._data.length);
            this._data.forEach(function (codeLensData, i) {
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: textModel_1.ModelDecorationOptions.EMPTY
                }, function (id) { return _this._decorationIds[i] = id; });
            });
        };
        CodeLens.prototype.computeIfNecessary = function (model) {
            this._contentWidget.updateVisibility(); // trigger the fade in
            if (!this._contentWidget.isVisible()) {
                return null;
            }
            // Read editor current state
            for (var i = 0; i < this._decorationIds.length; i++) {
                this._data[i].symbol.range = model.getDecorationRange(this._decorationIds[i]);
            }
            return this._data;
        };
        CodeLens.prototype.updateCommands = function (symbols) {
            this._contentWidget.withCommands(symbols);
        };
        CodeLens.prototype.getLineNumber = function () {
            var range = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
            if (range) {
                return range.startLineNumber;
            }
            return -1;
        };
        CodeLens.prototype.update = function (viewZoneChangeAccessor) {
            if (this.isValid()) {
                var range = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
                this._viewZone.afterLineNumber = range.startLineNumber - 1;
                viewZoneChangeAccessor.layoutZone(this._viewZoneId);
                this._contentWidget.setSymbolRange(range);
                this._editor.layoutContentWidget(this._contentWidget);
            }
        };
        return CodeLens;
    }());
    exports.CodeLens = CodeLens;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var codeLensForeground = theme.getColor(editorColorRegistry_1.editorCodeLensForeground);
        if (codeLensForeground) {
            collector.addRule(".monaco-editor .codelens-decoration { color: " + codeLensForeground + "; }");
        }
        var activeLinkForeground = theme.getColor(colorRegistry_1.editorActiveLinkForeground);
        if (activeLinkForeground) {
            collector.addRule(".monaco-editor .codelens-decoration > a:hover { color: " + activeLinkForeground + " !important; }");
        }
    });
});
