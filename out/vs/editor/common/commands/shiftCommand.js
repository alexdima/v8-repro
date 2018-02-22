define(["require", "exports", "vs/base/common/strings", "vs/editor/common/controller/cursorCommon", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/modes/languageConfigurationRegistry"], function (require, exports, strings, cursorCommon_1, range_1, selection_1, languageConfigurationRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ShiftCommand = /** @class */ (function () {
        function ShiftCommand(range, opts) {
            this._opts = opts;
            this._selection = range;
            this._useLastEditRangeForCursorEndPosition = false;
            this._selectionStartColumnStaysPut = false;
        }
        ShiftCommand.unshiftIndentCount = function (line, column, tabSize) {
            // Determine the visible column where the content starts
            var contentStartVisibleColumn = cursorCommon_1.CursorColumns.visibleColumnFromColumn(line, column, tabSize);
            var desiredTabStop = cursorCommon_1.CursorColumns.prevTabStop(contentStartVisibleColumn, tabSize);
            // The `desiredTabStop` is a multiple of `tabSize` => determine the number of indents
            return desiredTabStop / tabSize;
        };
        ShiftCommand.shiftIndentCount = function (line, column, tabSize) {
            // Determine the visible column where the content starts
            var contentStartVisibleColumn = cursorCommon_1.CursorColumns.visibleColumnFromColumn(line, column, tabSize);
            var desiredTabStop = cursorCommon_1.CursorColumns.nextTabStop(contentStartVisibleColumn, tabSize);
            // The `desiredTabStop` is a multiple of `tabSize` => determine the number of indents
            return desiredTabStop / tabSize;
        };
        ShiftCommand.prototype._addEditOperation = function (builder, range, text) {
            if (this._useLastEditRangeForCursorEndPosition) {
                builder.addTrackedEditOperation(range, text);
            }
            else {
                builder.addEditOperation(range, text);
            }
        };
        ShiftCommand.prototype.getEditOperations = function (model, builder) {
            var startLine = this._selection.startLineNumber;
            var endLine = this._selection.endLineNumber;
            if (this._selection.endColumn === 1 && startLine !== endLine) {
                endLine = endLine - 1;
            }
            var tabSize = this._opts.tabSize;
            var oneIndent = this._opts.oneIndent;
            var shouldIndentEmptyLines = (startLine === endLine);
            // if indenting or outdenting on a whitespace only line
            if (this._selection.isEmpty()) {
                if (/^\s*$/.test(model.getLineContent(startLine))) {
                    this._useLastEditRangeForCursorEndPosition = true;
                }
            }
            if (this._opts.useTabStops) {
                // indents[i] represents i * oneIndent
                var indents = ['', oneIndent];
                // keep track of previous line's "miss-alignment"
                var previousLineExtraSpaces = 0, extraSpaces = 0;
                for (var lineNumber = startLine; lineNumber <= endLine; lineNumber++, previousLineExtraSpaces = extraSpaces) {
                    extraSpaces = 0;
                    var lineText = model.getLineContent(lineNumber);
                    var indentationEndIndex = strings.firstNonWhitespaceIndex(lineText);
                    if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (lineNumber > 1) {
                        var contentStartVisibleColumn = cursorCommon_1.CursorColumns.visibleColumnFromColumn(lineText, indentationEndIndex + 1, tabSize);
                        if (contentStartVisibleColumn % tabSize !== 0) {
                            // The current line is "miss-aligned", so let's see if this is expected...
                            // This can only happen when it has trailing commas in the indent
                            if (model.isCheapToTokenize(lineNumber - 1)) {
                                var enterAction = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getRawEnterActionAtPosition(model, lineNumber - 1, model.getLineMaxColumn(lineNumber - 1));
                                if (enterAction) {
                                    extraSpaces = previousLineExtraSpaces;
                                    if (enterAction.appendText) {
                                        for (var j = 0, lenJ = enterAction.appendText.length; j < lenJ && extraSpaces < tabSize; j++) {
                                            if (enterAction.appendText.charCodeAt(j) === 32 /* Space */) {
                                                extraSpaces++;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                    if (enterAction.removeText) {
                                        extraSpaces = Math.max(0, extraSpaces - enterAction.removeText);
                                    }
                                    // Act as if `prefixSpaces` is not part of the indentation
                                    for (var j = 0; j < extraSpaces; j++) {
                                        if (indentationEndIndex === 0 || lineText.charCodeAt(indentationEndIndex - 1) !== 32 /* Space */) {
                                            break;
                                        }
                                        indentationEndIndex--;
                                    }
                                }
                            }
                        }
                    }
                    if (this._opts.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    var desiredIndentCount = void 0;
                    if (this._opts.isUnshift) {
                        desiredIndentCount = ShiftCommand.unshiftIndentCount(lineText, indentationEndIndex + 1, tabSize);
                    }
                    else {
                        desiredIndentCount = ShiftCommand.shiftIndentCount(lineText, indentationEndIndex + 1, tabSize);
                    }
                    // Fill `indents`, as needed
                    for (var j = indents.length; j <= desiredIndentCount; j++) {
                        indents[j] = indents[j - 1] + oneIndent;
                    }
                    this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, indentationEndIndex + 1), indents[desiredIndentCount]);
                    if (lineNumber === startLine) {
                        // Force the startColumn to stay put because we're inserting after it
                        this._selectionStartColumnStaysPut = (this._selection.startColumn <= indentationEndIndex + 1);
                    }
                }
            }
            else {
                for (var lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
                    var lineText = model.getLineContent(lineNumber);
                    var indentationEndIndex = strings.firstNonWhitespaceIndex(lineText);
                    if (this._opts.isUnshift && (lineText.length === 0 || indentationEndIndex === 0)) {
                        // empty line or line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (!shouldIndentEmptyLines && !this._opts.isUnshift && lineText.length === 0) {
                        // do not indent empty lines => nothing to do
                        continue;
                    }
                    if (indentationEndIndex === -1) {
                        // the entire line is whitespace
                        indentationEndIndex = lineText.length;
                    }
                    if (this._opts.isUnshift && indentationEndIndex === 0) {
                        // line with no leading whitespace => nothing to do
                        continue;
                    }
                    if (this._opts.isUnshift) {
                        indentationEndIndex = Math.min(indentationEndIndex, tabSize);
                        for (var i = 0; i < indentationEndIndex; i++) {
                            var chr = lineText.charCodeAt(i);
                            if (chr === 9 /* Tab */) {
                                indentationEndIndex = i + 1;
                                break;
                            }
                        }
                        this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, indentationEndIndex + 1), '');
                    }
                    else {
                        this._addEditOperation(builder, new range_1.Range(lineNumber, 1, lineNumber, 1), oneIndent);
                        if (lineNumber === startLine) {
                            // Force the startColumn to stay put because we're inserting after it
                            this._selectionStartColumnStaysPut = (this._selection.startColumn === 1);
                        }
                    }
                }
            }
            this._selectionId = builder.trackSelection(this._selection);
        };
        ShiftCommand.prototype.computeCursorState = function (model, helper) {
            if (this._useLastEditRangeForCursorEndPosition) {
                var lastOp = helper.getInverseEditOperations()[0];
                return new selection_1.Selection(lastOp.range.endLineNumber, lastOp.range.endColumn, lastOp.range.endLineNumber, lastOp.range.endColumn);
            }
            var result = helper.getTrackedSelection(this._selectionId);
            if (this._selectionStartColumnStaysPut) {
                // The selection start should not move
                var initialStartColumn = this._selection.startColumn;
                var resultStartColumn = result.startColumn;
                if (resultStartColumn <= initialStartColumn) {
                    return result;
                }
                if (result.getDirection() === selection_1.SelectionDirection.LTR) {
                    return new selection_1.Selection(result.startLineNumber, initialStartColumn, result.endLineNumber, result.endColumn);
                }
                return new selection_1.Selection(result.endLineNumber, result.endColumn, result.startLineNumber, initialStartColumn);
            }
            return result;
        };
        return ShiftCommand;
    }());
    exports.ShiftCommand = ShiftCommand;
});
