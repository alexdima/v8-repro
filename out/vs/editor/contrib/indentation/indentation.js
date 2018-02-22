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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/strings", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/platform/quickOpen/common/quickOpen", "vs/editor/common/services/modelService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/core/editOperation", "vs/editor/common/model/textModel", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/commands/shiftCommand", "./indentUtils"], function (require, exports, nls, lifecycle_1, winjs_base_1, strings, editorContextKeys_1, editorExtensions_1, quickOpen_1, modelService_1, range_1, selection_1, editOperation_1, textModel_1, languageConfigurationRegistry_1, shiftCommand_1, IndentUtil) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function shiftIndent(tabSize, indentation, count) {
        count = count || 1;
        var desiredIndentCount = shiftCommand_1.ShiftCommand.shiftIndentCount(indentation, indentation.length + count, tabSize);
        var newIndentation = '';
        for (var i = 0; i < desiredIndentCount; i++) {
            newIndentation += '\t';
        }
        return newIndentation;
    }
    exports.shiftIndent = shiftIndent;
    function unshiftIndent(tabSize, indentation, count) {
        count = count || 1;
        var desiredIndentCount = shiftCommand_1.ShiftCommand.unshiftIndentCount(indentation, indentation.length + count, tabSize);
        var newIndentation = '';
        for (var i = 0; i < desiredIndentCount; i++) {
            newIndentation += '\t';
        }
        return newIndentation;
    }
    exports.unshiftIndent = unshiftIndent;
    function getReindentEditOperations(model, startLineNumber, endLineNumber, inheritedIndent) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return undefined;
        }
        var indentationRules = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getIndentationRules(model.getLanguageIdentifier().id);
        if (!indentationRules) {
            return undefined;
        }
        endLineNumber = Math.min(endLineNumber, model.getLineCount());
        // Skip `unIndentedLinePattern` lines
        while (startLineNumber <= endLineNumber) {
            if (!indentationRules.unIndentedLinePattern) {
                break;
            }
            var text = model.getLineContent(startLineNumber);
            if (!indentationRules.unIndentedLinePattern.test(text)) {
                break;
            }
            startLineNumber++;
        }
        if (startLineNumber > endLineNumber - 1) {
            return undefined;
        }
        var _a = model.getOptions(), tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
        var indentEdits = [];
        // indentation being passed to lines below
        var globalIndent;
        // Calculate indentation for the first line
        // If there is no passed-in indentation, we use the indentation of the first line as base.
        var currentLineText = model.getLineContent(startLineNumber);
        var adjustedLineContent = currentLineText;
        if (inheritedIndent !== undefined && inheritedIndent !== null) {
            globalIndent = inheritedIndent;
            var oldIndentation = strings.getLeadingWhitespace(currentLineText);
            adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = unshiftIndent(tabSize, globalIndent);
                adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            }
            if (currentLineText !== adjustedLineContent) {
                indentEdits.push(editOperation_1.EditOperation.replace(new selection_1.Selection(startLineNumber, 1, startLineNumber, oldIndentation.length + 1), textModel_1.TextModel.normalizeIndentation(globalIndent, tabSize, insertSpaces)));
            }
        }
        else {
            globalIndent = strings.getLeadingWhitespace(currentLineText);
        }
        // idealIndentForNextLine doesn't equal globalIndent when there is a line matching `indentNextLinePattern`.
        var idealIndentForNextLine = globalIndent;
        if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(tabSize, idealIndentForNextLine);
            globalIndent = shiftIndent(tabSize, globalIndent);
        }
        else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(tabSize, idealIndentForNextLine);
        }
        startLineNumber++;
        // Calculate indentation adjustment for all following lines
        for (var lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            var text = model.getLineContent(lineNumber);
            var oldIndentation = strings.getLeadingWhitespace(text);
            var adjustedLineContent_1 = idealIndentForNextLine + text.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent_1)) {
                idealIndentForNextLine = unshiftIndent(tabSize, idealIndentForNextLine);
                globalIndent = unshiftIndent(tabSize, globalIndent);
            }
            if (oldIndentation !== idealIndentForNextLine) {
                indentEdits.push(editOperation_1.EditOperation.replace(new selection_1.Selection(lineNumber, 1, lineNumber, oldIndentation.length + 1), textModel_1.TextModel.normalizeIndentation(idealIndentForNextLine, tabSize, insertSpaces)));
            }
            // calculate idealIndentForNextLine
            if (indentationRules.unIndentedLinePattern && indentationRules.unIndentedLinePattern.test(text)) {
                // In reindent phase, if the line matches `unIndentedLinePattern` we inherit indentation from above lines
                // but don't change globalIndent and idealIndentForNextLine.
                continue;
            }
            else if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent_1)) {
                globalIndent = shiftIndent(tabSize, globalIndent);
                idealIndentForNextLine = globalIndent;
            }
            else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent_1)) {
                idealIndentForNextLine = shiftIndent(tabSize, idealIndentForNextLine);
            }
            else {
                idealIndentForNextLine = globalIndent;
            }
        }
        return indentEdits;
    }
    exports.getReindentEditOperations = getReindentEditOperations;
    var IndentationToSpacesAction = /** @class */ (function (_super) {
        __extends(IndentationToSpacesAction, _super);
        function IndentationToSpacesAction() {
            return _super.call(this, {
                id: IndentationToSpacesAction.ID,
                label: nls.localize('indentationToSpaces', "Convert Indentation to Spaces"),
                alias: 'Convert Indentation to Spaces',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        IndentationToSpacesAction.prototype.run = function (accessor, editor) {
            var model = editor.getModel();
            if (!model) {
                return;
            }
            var modelOpts = model.getOptions();
            var command = new IndentationToSpacesCommand(editor.getSelection(), modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: true
            });
        };
        IndentationToSpacesAction.ID = 'editor.action.indentationToSpaces';
        return IndentationToSpacesAction;
    }(editorExtensions_1.EditorAction));
    exports.IndentationToSpacesAction = IndentationToSpacesAction;
    var IndentationToTabsAction = /** @class */ (function (_super) {
        __extends(IndentationToTabsAction, _super);
        function IndentationToTabsAction() {
            return _super.call(this, {
                id: IndentationToTabsAction.ID,
                label: nls.localize('indentationToTabs', "Convert Indentation to Tabs"),
                alias: 'Convert Indentation to Tabs',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        IndentationToTabsAction.prototype.run = function (accessor, editor) {
            var model = editor.getModel();
            if (!model) {
                return;
            }
            var modelOpts = model.getOptions();
            var command = new IndentationToTabsCommand(editor.getSelection(), modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: false
            });
        };
        IndentationToTabsAction.ID = 'editor.action.indentationToTabs';
        return IndentationToTabsAction;
    }(editorExtensions_1.EditorAction));
    exports.IndentationToTabsAction = IndentationToTabsAction;
    var ChangeIndentationSizeAction = /** @class */ (function (_super) {
        __extends(ChangeIndentationSizeAction, _super);
        function ChangeIndentationSizeAction(insertSpaces, opts) {
            var _this = _super.call(this, opts) || this;
            _this.insertSpaces = insertSpaces;
            return _this;
        }
        ChangeIndentationSizeAction.prototype.run = function (accessor, editor) {
            var _this = this;
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            var modelService = accessor.get(modelService_1.IModelService);
            var model = editor.getModel();
            if (!model) {
                return undefined;
            }
            var creationOpts = modelService.getCreationOptions(model.getLanguageIdentifier().language, model.uri);
            var picks = [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return ({
                id: n.toString(),
                label: n.toString(),
                // add description for tabSize value set in the configuration
                description: n === creationOpts.tabSize ? nls.localize('configuredTabSize', "Configured Tab Size") : null
            }); });
            // auto focus the tabSize set for the current editor
            var autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
            return winjs_base_1.TPromise.timeout(50 /* quick open is sensitive to being opened so soon after another */).then(function () {
                return quickOpenService.pick(picks, { placeHolder: nls.localize({ key: 'selectTabWidth', comment: ['Tab corresponds to the tab key'] }, "Select Tab Size for Current File"), autoFocus: { autoFocusIndex: autoFocusIndex } }).then(function (pick) {
                    if (pick) {
                        model.updateOptions({
                            tabSize: parseInt(pick.label, 10),
                            insertSpaces: _this.insertSpaces
                        });
                    }
                });
            });
        };
        return ChangeIndentationSizeAction;
    }(editorExtensions_1.EditorAction));
    exports.ChangeIndentationSizeAction = ChangeIndentationSizeAction;
    var IndentUsingTabs = /** @class */ (function (_super) {
        __extends(IndentUsingTabs, _super);
        function IndentUsingTabs() {
            return _super.call(this, false, {
                id: IndentUsingTabs.ID,
                label: nls.localize('indentUsingTabs', "Indent Using Tabs"),
                alias: 'Indent Using Tabs',
                precondition: null
            }) || this;
        }
        IndentUsingTabs.ID = 'editor.action.indentUsingTabs';
        return IndentUsingTabs;
    }(ChangeIndentationSizeAction));
    exports.IndentUsingTabs = IndentUsingTabs;
    var IndentUsingSpaces = /** @class */ (function (_super) {
        __extends(IndentUsingSpaces, _super);
        function IndentUsingSpaces() {
            return _super.call(this, true, {
                id: IndentUsingSpaces.ID,
                label: nls.localize('indentUsingSpaces', "Indent Using Spaces"),
                alias: 'Indent Using Spaces',
                precondition: null
            }) || this;
        }
        IndentUsingSpaces.ID = 'editor.action.indentUsingSpaces';
        return IndentUsingSpaces;
    }(ChangeIndentationSizeAction));
    exports.IndentUsingSpaces = IndentUsingSpaces;
    var DetectIndentation = /** @class */ (function (_super) {
        __extends(DetectIndentation, _super);
        function DetectIndentation() {
            return _super.call(this, {
                id: DetectIndentation.ID,
                label: nls.localize('detectIndentation', "Detect Indentation from Content"),
                alias: 'Detect Indentation from Content',
                precondition: null
            }) || this;
        }
        DetectIndentation.prototype.run = function (accessor, editor) {
            var modelService = accessor.get(modelService_1.IModelService);
            var model = editor.getModel();
            if (!model) {
                return;
            }
            var creationOpts = modelService.getCreationOptions(model.getLanguageIdentifier().language, model.uri);
            model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
        };
        DetectIndentation.ID = 'editor.action.detectIndentation';
        return DetectIndentation;
    }(editorExtensions_1.EditorAction));
    exports.DetectIndentation = DetectIndentation;
    var ReindentLinesAction = /** @class */ (function (_super) {
        __extends(ReindentLinesAction, _super);
        function ReindentLinesAction() {
            return _super.call(this, {
                id: 'editor.action.reindentlines',
                label: nls.localize('editor.reindentlines', "Reindent Lines"),
                alias: 'Reindent Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            }) || this;
        }
        ReindentLinesAction.prototype.run = function (accessor, editor) {
            var model = editor.getModel();
            if (!model) {
                return;
            }
            var edits = getReindentEditOperations(model, 1, model.getLineCount());
            if (edits) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        };
        return ReindentLinesAction;
    }(editorExtensions_1.EditorAction));
    exports.ReindentLinesAction = ReindentLinesAction;
    var AutoIndentOnPasteCommand = /** @class */ (function () {
        function AutoIndentOnPasteCommand(edits, initialSelection) {
            this._initialSelection = initialSelection;
            this._edits = [];
            for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                var edit = edits_1[_i];
                if (edit.range && typeof edit.text === 'string') {
                    this._edits.push(edit);
                }
            }
        }
        AutoIndentOnPasteCommand.prototype.getEditOperations = function (model, builder) {
            for (var _i = 0, _a = this._edits; _i < _a.length; _i++) {
                var edit = _a[_i];
                builder.addEditOperation(range_1.Range.lift(edit.range), edit.text);
            }
            var selectionIsSet = false;
            if (Array.isArray(this._edits) && this._edits.length === 1 && this._initialSelection.isEmpty()) {
                if (this._edits[0].range.startColumn === this._initialSelection.endColumn &&
                    this._edits[0].range.startLineNumber === this._initialSelection.endLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, true);
                }
                else if (this._edits[0].range.endColumn === this._initialSelection.startColumn &&
                    this._edits[0].range.endLineNumber === this._initialSelection.startLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, false);
                }
            }
            if (!selectionIsSet) {
                this._selectionId = builder.trackSelection(this._initialSelection);
            }
        };
        AutoIndentOnPasteCommand.prototype.computeCursorState = function (model, helper) {
            return helper.getTrackedSelection(this._selectionId);
        };
        return AutoIndentOnPasteCommand;
    }());
    exports.AutoIndentOnPasteCommand = AutoIndentOnPasteCommand;
    var AutoIndentOnPaste = /** @class */ (function () {
        function AutoIndentOnPaste(editor) {
            var _this = this;
            this.editor = editor;
            this.callOnDispose = [];
            this.callOnModel = [];
            this.callOnDispose.push(editor.onDidChangeConfiguration(function () { return _this.update(); }));
            this.callOnDispose.push(editor.onDidChangeModel(function () { return _this.update(); }));
            this.callOnDispose.push(editor.onDidChangeModelLanguage(function () { return _this.update(); }));
        }
        AutoIndentOnPaste.prototype.update = function () {
            var _this = this;
            // clean up
            this.callOnModel = lifecycle_1.dispose(this.callOnModel);
            // we are disabled
            if (!this.editor.getConfiguration().autoIndent || this.editor.getConfiguration().contribInfo.formatOnPaste) {
                return;
            }
            // no model
            if (!this.editor.getModel()) {
                return;
            }
            this.callOnModel.push(this.editor.onDidPaste(function (range) {
                _this.trigger(range);
            }));
        };
        AutoIndentOnPaste.prototype.trigger = function (range) {
            if (this.editor.getSelections().length > 1) {
                return;
            }
            var model = this.editor.getModel();
            if (!model.isCheapToTokenize(range.getStartPosition().lineNumber)) {
                return;
            }
            var _a = model.getOptions(), tabSize = _a.tabSize, insertSpaces = _a.insertSpaces;
            this.editor.pushUndoStop();
            var textEdits = [];
            var indentConverter = {
                shiftIndent: function (indentation) {
                    var desiredIndentCount = shiftCommand_1.ShiftCommand.shiftIndentCount(indentation, indentation.length + 1, tabSize);
                    var newIndentation = '';
                    for (var i = 0; i < desiredIndentCount; i++) {
                        newIndentation += '\t';
                    }
                    return newIndentation;
                },
                unshiftIndent: function (indentation) {
                    var desiredIndentCount = shiftCommand_1.ShiftCommand.unshiftIndentCount(indentation, indentation.length + 1, tabSize);
                    var newIndentation = '';
                    for (var i = 0; i < desiredIndentCount; i++) {
                        newIndentation += '\t';
                    }
                    return newIndentation;
                }
            };
            var startLineNumber = range.startLineNumber;
            while (startLineNumber <= range.endLineNumber) {
                if (this.shouldIgnoreLine(model, startLineNumber)) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber > range.endLineNumber) {
                return;
            }
            var firstLineText = model.getLineContent(startLineNumber);
            if (!/\S/.test(firstLineText.substring(0, range.startColumn - 1))) {
                var indentOfFirstLine = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getGoodIndentForLine(model, model.getLanguageIdentifier().id, startLineNumber, indentConverter);
                if (indentOfFirstLine !== null) {
                    var oldIndentation = strings.getLeadingWhitespace(firstLineText);
                    var newSpaceCnt = IndentUtil.getSpaceCnt(indentOfFirstLine, tabSize);
                    var oldSpaceCnt = IndentUtil.getSpaceCnt(oldIndentation, tabSize);
                    if (newSpaceCnt !== oldSpaceCnt) {
                        var newIndent = IndentUtil.generateIndent(newSpaceCnt, tabSize, insertSpaces);
                        textEdits.push({
                            range: new range_1.Range(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
                            text: newIndent
                        });
                        firstLineText = newIndent + firstLineText.substr(oldIndentation.length);
                    }
                    else {
                        var indentMetadata = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getIndentMetadata(model, startLineNumber);
                        if (indentMetadata === 0 || indentMetadata === 8 /* UNINDENT_MASK */) {
                            // we paste content into a line where only contains whitespaces
                            // after pasting, the indentation of the first line is already correct
                            // the first line doesn't match any indentation rule
                            // then no-op.
                            return;
                        }
                    }
                }
            }
            var firstLineNumber = startLineNumber;
            // ignore empty or ignored lines
            while (startLineNumber < range.endLineNumber) {
                if (!/\S/.test(model.getLineContent(startLineNumber + 1))) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber !== range.endLineNumber) {
                var virtualModel = {
                    getLineTokens: function (lineNumber) {
                        return model.getLineTokens(lineNumber);
                    },
                    getLanguageIdentifier: function () {
                        return model.getLanguageIdentifier();
                    },
                    getLanguageIdAtPosition: function (lineNumber, column) {
                        return model.getLanguageIdAtPosition(lineNumber, column);
                    },
                    getLineContent: function (lineNumber) {
                        if (lineNumber === firstLineNumber) {
                            return firstLineText;
                        }
                        else {
                            return model.getLineContent(lineNumber);
                        }
                    }
                };
                var indentOfSecondLine = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getGoodIndentForLine(virtualModel, model.getLanguageIdentifier().id, startLineNumber + 1, indentConverter);
                if (indentOfSecondLine !== null) {
                    var newSpaceCntOfSecondLine = IndentUtil.getSpaceCnt(indentOfSecondLine, tabSize);
                    var oldSpaceCntOfSecondLine = IndentUtil.getSpaceCnt(strings.getLeadingWhitespace(model.getLineContent(startLineNumber + 1)), tabSize);
                    if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
                        var spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
                        for (var i = startLineNumber + 1; i <= range.endLineNumber; i++) {
                            var lineContent = model.getLineContent(i);
                            var originalIndent = strings.getLeadingWhitespace(lineContent);
                            var originalSpacesCnt = IndentUtil.getSpaceCnt(originalIndent, tabSize);
                            var newSpacesCnt = originalSpacesCnt + spaceCntOffset;
                            var newIndent = IndentUtil.generateIndent(newSpacesCnt, tabSize, insertSpaces);
                            if (newIndent !== originalIndent) {
                                textEdits.push({
                                    range: new range_1.Range(i, 1, i, originalIndent.length + 1),
                                    text: newIndent
                                });
                            }
                        }
                    }
                }
            }
            var cmd = new AutoIndentOnPasteCommand(textEdits, this.editor.getSelection());
            this.editor.executeCommand('autoIndentOnPaste', cmd);
            this.editor.pushUndoStop();
        };
        AutoIndentOnPaste.prototype.shouldIgnoreLine = function (model, lineNumber) {
            model.forceTokenization(lineNumber);
            var nonWhiteSpaceColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            if (nonWhiteSpaceColumn === 0) {
                return true;
            }
            var tokens = model.getLineTokens(lineNumber);
            if (tokens.getCount() > 0) {
                var firstNonWhitespaceTokenIndex = tokens.findTokenIndexAtOffset(nonWhiteSpaceColumn);
                if (firstNonWhitespaceTokenIndex >= 0 && tokens.getStandardTokenType(firstNonWhitespaceTokenIndex) === 1 /* Comment */) {
                    return true;
                }
            }
            return false;
        };
        AutoIndentOnPaste.prototype.getId = function () {
            return AutoIndentOnPaste.ID;
        };
        AutoIndentOnPaste.prototype.dispose = function () {
            this.callOnDispose = lifecycle_1.dispose(this.callOnDispose);
            this.callOnModel = lifecycle_1.dispose(this.callOnModel);
        };
        AutoIndentOnPaste.ID = 'editor.contrib.autoIndentOnPaste';
        return AutoIndentOnPaste;
    }());
    exports.AutoIndentOnPaste = AutoIndentOnPaste;
    function getIndentationEditOperations(model, builder, tabSize, tabsToSpaces) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return;
        }
        var spaces = '';
        for (var i = 0; i < tabSize; i++) {
            spaces += ' ';
        }
        var content = model.getLinesContent();
        for (var i = 0; i < content.length; i++) {
            var lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(i + 1);
            if (lastIndentationColumn === 0) {
                lastIndentationColumn = model.getLineMaxColumn(i + 1);
            }
            var text = (tabsToSpaces ? content[i].substr(0, lastIndentationColumn).replace(/\t/ig, spaces) :
                content[i].substr(0, lastIndentationColumn).replace(new RegExp(spaces, 'gi'), '\t')) +
                content[i].substr(lastIndentationColumn);
            builder.addEditOperation(new range_1.Range(i + 1, 1, i + 1, model.getLineMaxColumn(i + 1)), text);
        }
    }
    var IndentationToSpacesCommand = /** @class */ (function () {
        function IndentationToSpacesCommand(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
        }
        IndentationToSpacesCommand.prototype.getEditOperations = function (model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, true);
        };
        IndentationToSpacesCommand.prototype.computeCursorState = function (model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        };
        return IndentationToSpacesCommand;
    }());
    exports.IndentationToSpacesCommand = IndentationToSpacesCommand;
    var IndentationToTabsCommand = /** @class */ (function () {
        function IndentationToTabsCommand(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
        }
        IndentationToTabsCommand.prototype.getEditOperations = function (model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, false);
        };
        IndentationToTabsCommand.prototype.computeCursorState = function (model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        };
        return IndentationToTabsCommand;
    }());
    exports.IndentationToTabsCommand = IndentationToTabsCommand;
    editorExtensions_1.registerEditorContribution(AutoIndentOnPaste);
    editorExtensions_1.registerEditorAction(IndentationToSpacesAction);
    editorExtensions_1.registerEditorAction(IndentationToTabsAction);
    editorExtensions_1.registerEditorAction(IndentUsingTabs);
    editorExtensions_1.registerEditorAction(IndentUsingSpaces);
    editorExtensions_1.registerEditorAction(DetectIndentation);
    editorExtensions_1.registerEditorAction(ReindentLinesAction);
});
