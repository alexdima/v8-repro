define(["require", "exports", "vs/editor/common/core/position", "vs/base/common/strings", "vs/editor/common/model/textModel", "vs/editor/common/core/selection", "vs/editor/common/core/range", "vs/editor/common/modes/languageConfigurationRegistry", "vs/base/common/errors"], function (require, exports, position_1, strings, textModel_1, selection_1, range_1, languageConfigurationRegistry_1, errors_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var RevealTarget;
    (function (RevealTarget) {
        RevealTarget[RevealTarget["Primary"] = 0] = "Primary";
        RevealTarget[RevealTarget["TopMost"] = 1] = "TopMost";
        RevealTarget[RevealTarget["BottomMost"] = 2] = "BottomMost";
    })(RevealTarget = exports.RevealTarget || (exports.RevealTarget = {}));
    /**
     * This is an operation type that will be recorded for undo/redo purposes.
     * The goal is to introduce an undo stop when the controller switches between different operation types.
     */
    var EditOperationType;
    (function (EditOperationType) {
        EditOperationType[EditOperationType["Other"] = 0] = "Other";
        EditOperationType[EditOperationType["Typing"] = 1] = "Typing";
        EditOperationType[EditOperationType["DeletingLeft"] = 2] = "DeletingLeft";
        EditOperationType[EditOperationType["DeletingRight"] = 3] = "DeletingRight";
    })(EditOperationType = exports.EditOperationType || (exports.EditOperationType = {}));
    var CursorConfiguration = /** @class */ (function () {
        function CursorConfiguration(languageIdentifier, oneIndent, modelOptions, configuration) {
            this._languageIdentifier = languageIdentifier;
            var c = configuration.editor;
            this.readOnly = c.readOnly;
            this.tabSize = modelOptions.tabSize;
            this.insertSpaces = modelOptions.insertSpaces;
            this.oneIndent = oneIndent;
            this.pageSize = Math.floor(c.layoutInfo.height / c.fontInfo.lineHeight) - 2;
            this.lineHeight = c.lineHeight;
            this.useTabStops = c.useTabStops;
            this.wordSeparators = c.wordSeparators;
            this.emptySelectionClipboard = c.emptySelectionClipboard;
            this.autoClosingBrackets = c.autoClosingBrackets;
            this.autoIndent = c.autoIndent;
            this.autoClosingPairsOpen = {};
            this.autoClosingPairsClose = {};
            this.surroundingPairs = {};
            this._electricChars = null;
            var autoClosingPairs = CursorConfiguration._getAutoClosingPairs(languageIdentifier);
            if (autoClosingPairs) {
                for (var i = 0; i < autoClosingPairs.length; i++) {
                    this.autoClosingPairsOpen[autoClosingPairs[i].open] = autoClosingPairs[i].close;
                    this.autoClosingPairsClose[autoClosingPairs[i].close] = autoClosingPairs[i].open;
                }
            }
            var surroundingPairs = CursorConfiguration._getSurroundingPairs(languageIdentifier);
            if (surroundingPairs) {
                for (var i = 0; i < surroundingPairs.length; i++) {
                    this.surroundingPairs[surroundingPairs[i].open] = surroundingPairs[i].close;
                }
            }
        }
        CursorConfiguration.shouldRecreate = function (e) {
            return (e.layoutInfo
                || e.wordSeparators
                || e.emptySelectionClipboard
                || e.autoClosingBrackets
                || e.useTabStops
                || e.lineHeight
                || e.readOnly);
        };
        Object.defineProperty(CursorConfiguration.prototype, "electricChars", {
            get: function () {
                if (!this._electricChars) {
                    this._electricChars = {};
                    var electricChars = CursorConfiguration._getElectricCharacters(this._languageIdentifier);
                    if (electricChars) {
                        for (var i = 0; i < electricChars.length; i++) {
                            this._electricChars[electricChars[i]] = true;
                        }
                    }
                }
                return this._electricChars;
            },
            enumerable: true,
            configurable: true
        });
        CursorConfiguration.prototype.normalizeIndentation = function (str) {
            return textModel_1.TextModel.normalizeIndentation(str, this.tabSize, this.insertSpaces);
        };
        CursorConfiguration._getElectricCharacters = function (languageIdentifier) {
            try {
                return languageConfigurationRegistry_1.LanguageConfigurationRegistry.getElectricCharacters(languageIdentifier.id);
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
                return null;
            }
        };
        CursorConfiguration._getAutoClosingPairs = function (languageIdentifier) {
            try {
                return languageConfigurationRegistry_1.LanguageConfigurationRegistry.getAutoClosingPairs(languageIdentifier.id);
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
                return null;
            }
        };
        CursorConfiguration._getSurroundingPairs = function (languageIdentifier) {
            try {
                return languageConfigurationRegistry_1.LanguageConfigurationRegistry.getSurroundingPairs(languageIdentifier.id);
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
                return null;
            }
        };
        return CursorConfiguration;
    }());
    exports.CursorConfiguration = CursorConfiguration;
    /**
     * Represents the cursor state on either the model or on the view model.
     */
    var SingleCursorState = /** @class */ (function () {
        function SingleCursorState(selectionStart, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
            this.selectionStart = selectionStart;
            this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
            this.position = position;
            this.leftoverVisibleColumns = leftoverVisibleColumns;
            this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
        }
        SingleCursorState.prototype.equals = function (other) {
            return (this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns
                && this.leftoverVisibleColumns === other.leftoverVisibleColumns
                && this.position.equals(other.position)
                && this.selectionStart.equalsRange(other.selectionStart));
        };
        SingleCursorState.prototype.hasSelection = function () {
            return (!this.selection.isEmpty() || !this.selectionStart.isEmpty());
        };
        SingleCursorState.prototype.move = function (inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
            if (inSelectionMode) {
                // move just position
                return new SingleCursorState(this.selectionStart, this.selectionStartLeftoverVisibleColumns, new position_1.Position(lineNumber, column), leftoverVisibleColumns);
            }
            else {
                // move everything
                return new SingleCursorState(new range_1.Range(lineNumber, column, lineNumber, column), leftoverVisibleColumns, new position_1.Position(lineNumber, column), leftoverVisibleColumns);
            }
        };
        SingleCursorState._computeSelection = function (selectionStart, position) {
            var startLineNumber, startColumn, endLineNumber, endColumn;
            if (selectionStart.isEmpty()) {
                startLineNumber = selectionStart.startLineNumber;
                startColumn = selectionStart.startColumn;
                endLineNumber = position.lineNumber;
                endColumn = position.column;
            }
            else {
                if (position.isBeforeOrEqual(selectionStart.getStartPosition())) {
                    startLineNumber = selectionStart.endLineNumber;
                    startColumn = selectionStart.endColumn;
                    endLineNumber = position.lineNumber;
                    endColumn = position.column;
                }
                else {
                    startLineNumber = selectionStart.startLineNumber;
                    startColumn = selectionStart.startColumn;
                    endLineNumber = position.lineNumber;
                    endColumn = position.column;
                }
            }
            return new selection_1.Selection(startLineNumber, startColumn, endLineNumber, endColumn);
        };
        return SingleCursorState;
    }());
    exports.SingleCursorState = SingleCursorState;
    var CursorContext = /** @class */ (function () {
        function CursorContext(configuration, model, viewModel) {
            this.model = model;
            this.viewModel = viewModel;
            this.config = new CursorConfiguration(this.model.getLanguageIdentifier(), this.model.getOneIndent(), this.model.getOptions(), configuration);
        }
        CursorContext.prototype.validateViewPosition = function (viewPosition, modelPosition) {
            return this.viewModel.coordinatesConverter.validateViewPosition(viewPosition, modelPosition);
        };
        CursorContext.prototype.validateViewRange = function (viewRange, expectedModelRange) {
            return this.viewModel.coordinatesConverter.validateViewRange(viewRange, expectedModelRange);
        };
        CursorContext.prototype.convertViewRangeToModelRange = function (viewRange) {
            return this.viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
        };
        CursorContext.prototype.convertViewPositionToModelPosition = function (lineNumber, column) {
            return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(lineNumber, column));
        };
        CursorContext.prototype.convertModelPositionToViewPosition = function (modelPosition) {
            return this.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
        };
        CursorContext.prototype.convertModelRangeToViewRange = function (modelRange) {
            return this.viewModel.coordinatesConverter.convertModelRangeToViewRange(modelRange);
        };
        CursorContext.prototype.getCurrentScrollTop = function () {
            return this.viewModel.viewLayout.getCurrentScrollTop();
        };
        CursorContext.prototype.getCompletelyVisibleViewRange = function () {
            return this.viewModel.getCompletelyVisibleViewRange();
        };
        CursorContext.prototype.getCompletelyVisibleModelRange = function () {
            var viewRange = this.viewModel.getCompletelyVisibleViewRange();
            return this.viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
        };
        CursorContext.prototype.getCompletelyVisibleViewRangeAtScrollTop = function (scrollTop) {
            return this.viewModel.getCompletelyVisibleViewRangeAtScrollTop(scrollTop);
        };
        CursorContext.prototype.getVerticalOffsetForViewLine = function (viewLineNumber) {
            return this.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewLineNumber);
        };
        return CursorContext;
    }());
    exports.CursorContext = CursorContext;
    var CursorState = /** @class */ (function () {
        function CursorState(modelState, viewState) {
            this.modelState = modelState;
            this.viewState = viewState;
        }
        CursorState.fromModelState = function (modelState) {
            return new CursorState(modelState, null);
        };
        CursorState.fromViewState = function (viewState) {
            return new CursorState(null, viewState);
        };
        CursorState.fromModelSelection = function (modelSelection) {
            var selectionStartLineNumber = modelSelection.selectionStartLineNumber;
            var selectionStartColumn = modelSelection.selectionStartColumn;
            var positionLineNumber = modelSelection.positionLineNumber;
            var positionColumn = modelSelection.positionColumn;
            var modelState = new SingleCursorState(new range_1.Range(selectionStartLineNumber, selectionStartColumn, selectionStartLineNumber, selectionStartColumn), 0, new position_1.Position(positionLineNumber, positionColumn), 0);
            return CursorState.fromModelState(modelState);
        };
        CursorState.fromModelSelections = function (modelSelections) {
            var states = [];
            for (var i = 0, len = modelSelections.length; i < len; i++) {
                states[i] = this.fromModelSelection(modelSelections[i]);
            }
            return states;
        };
        CursorState.prototype.equals = function (other) {
            return (this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState));
        };
        return CursorState;
    }());
    exports.CursorState = CursorState;
    var EditOperationResult = /** @class */ (function () {
        function EditOperationResult(type, commands, opts) {
            this.type = type;
            this.commands = commands;
            this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
            this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
        }
        return EditOperationResult;
    }());
    exports.EditOperationResult = EditOperationResult;
    /**
     * Common operations that work and make sense both on the model and on the view model.
     */
    var CursorColumns = /** @class */ (function () {
        function CursorColumns() {
        }
        CursorColumns.isLowSurrogate = function (model, lineNumber, charOffset) {
            var lineContent = model.getLineContent(lineNumber);
            if (charOffset < 0 || charOffset >= lineContent.length) {
                return false;
            }
            return strings.isLowSurrogate(lineContent.charCodeAt(charOffset));
        };
        CursorColumns.isHighSurrogate = function (model, lineNumber, charOffset) {
            var lineContent = model.getLineContent(lineNumber);
            if (charOffset < 0 || charOffset >= lineContent.length) {
                return false;
            }
            return strings.isHighSurrogate(lineContent.charCodeAt(charOffset));
        };
        CursorColumns.isInsideSurrogatePair = function (model, lineNumber, column) {
            return this.isHighSurrogate(model, lineNumber, column - 2);
        };
        CursorColumns.visibleColumnFromColumn = function (lineContent, column, tabSize) {
            var endOffset = lineContent.length;
            if (endOffset > column - 1) {
                endOffset = column - 1;
            }
            var result = 0;
            for (var i = 0; i < endOffset; i++) {
                var charCode = lineContent.charCodeAt(i);
                if (charCode === 9 /* Tab */) {
                    result = this.nextTabStop(result, tabSize);
                }
                else {
                    result = result + 1;
                }
            }
            return result;
        };
        CursorColumns.visibleColumnFromColumn2 = function (config, model, position) {
            return this.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, config.tabSize);
        };
        CursorColumns.columnFromVisibleColumn = function (lineContent, visibleColumn, tabSize) {
            if (visibleColumn <= 0) {
                return 1;
            }
            var lineLength = lineContent.length;
            var beforeVisibleColumn = 0;
            for (var i = 0; i < lineLength; i++) {
                var charCode = lineContent.charCodeAt(i);
                var afterVisibleColumn = void 0;
                if (charCode === 9 /* Tab */) {
                    afterVisibleColumn = this.nextTabStop(beforeVisibleColumn, tabSize);
                }
                else {
                    afterVisibleColumn = beforeVisibleColumn + 1;
                }
                if (afterVisibleColumn >= visibleColumn) {
                    var prevDelta = visibleColumn - beforeVisibleColumn;
                    var afterDelta = afterVisibleColumn - visibleColumn;
                    if (afterDelta < prevDelta) {
                        return i + 2;
                    }
                    else {
                        return i + 1;
                    }
                }
                beforeVisibleColumn = afterVisibleColumn;
            }
            // walked the entire string
            return lineLength + 1;
        };
        CursorColumns.columnFromVisibleColumn2 = function (config, model, lineNumber, visibleColumn) {
            var result = this.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, config.tabSize);
            var minColumn = model.getLineMinColumn(lineNumber);
            if (result < minColumn) {
                return minColumn;
            }
            var maxColumn = model.getLineMaxColumn(lineNumber);
            if (result > maxColumn) {
                return maxColumn;
            }
            return result;
        };
        /**
         * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
         */
        CursorColumns.nextTabStop = function (visibleColumn, tabSize) {
            return visibleColumn + tabSize - visibleColumn % tabSize;
        };
        /**
         * ATTENTION: This works with 0-based columns (as oposed to the regular 1-based columns)
         */
        CursorColumns.prevTabStop = function (column, tabSize) {
            return column - 1 - (column - 1) % tabSize;
        };
        return CursorColumns;
    }());
    exports.CursorColumns = CursorColumns;
});
