define(["require", "exports", "vs/base/common/errors", "vs/editor/common/commands/replaceCommand", "vs/editor/common/controller/cursorCommon", "vs/editor/common/core/range", "vs/base/common/strings", "vs/editor/common/commands/shiftCommand", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/commands/surroundSelectionCommand", "vs/editor/common/controller/wordCharacterClassifier"], function (require, exports, errors_1, replaceCommand_1, cursorCommon_1, range_1, strings, shiftCommand_1, languageConfigurationRegistry_1, languageConfiguration_1, surroundSelectionCommand_1, wordCharacterClassifier_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TypeOperations = /** @class */ (function () {
        function TypeOperations() {
        }
        TypeOperations.indent = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: false,
                    tabSize: config.tabSize,
                    oneIndent: config.oneIndent,
                    useTabStops: config.useTabStops
                });
            }
            return commands;
        };
        TypeOperations.outdent = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = new shiftCommand_1.ShiftCommand(selections[i], {
                    isUnshift: true,
                    tabSize: config.tabSize,
                    oneIndent: config.oneIndent,
                    useTabStops: config.useTabStops
                });
            }
            return commands;
        };
        TypeOperations.shiftIndent = function (config, indentation, count) {
            count = count || 1;
            var desiredIndentCount = shiftCommand_1.ShiftCommand.shiftIndentCount(indentation, indentation.length + count, config.tabSize);
            var newIndentation = '';
            for (var i = 0; i < desiredIndentCount; i++) {
                newIndentation += '\t';
            }
            return newIndentation;
        };
        TypeOperations.unshiftIndent = function (config, indentation, count) {
            count = count || 1;
            var desiredIndentCount = shiftCommand_1.ShiftCommand.unshiftIndentCount(indentation, indentation.length + count, config.tabSize);
            var newIndentation = '';
            for (var i = 0; i < desiredIndentCount; i++) {
                newIndentation += '\t';
            }
            return newIndentation;
        };
        TypeOperations._distributedPaste = function (config, model, selections, text) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], text[i]);
            }
            return new cursorCommon_1.EditOperationResult(0 /* Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        };
        TypeOperations._simplePaste = function (config, model, selections, text, pasteOnNewLine) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                var position = selection.getPosition();
                if (pasteOnNewLine && text.indexOf('\n') !== text.length - 1) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine && selection.startLineNumber !== selection.endLineNumber) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine && selection.startColumn === model.getLineMinColumn(selection.startLineNumber) && selection.endColumn === model.getLineMaxColumn(selection.startLineNumber)) {
                    pasteOnNewLine = false;
                }
                if (pasteOnNewLine) {
                    // Paste entire line at the beginning of line
                    var typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, 1);
                    commands[i] = new replaceCommand_1.ReplaceCommand(typeSelection, text);
                }
                else {
                    commands[i] = new replaceCommand_1.ReplaceCommand(selection, text);
                }
            }
            return new cursorCommon_1.EditOperationResult(0 /* Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        };
        TypeOperations._distributePasteToCursors = function (selections, text, pasteOnNewLine, multicursorText) {
            if (pasteOnNewLine) {
                return null;
            }
            if (selections.length === 1) {
                return null;
            }
            if (multicursorText && multicursorText.length === selections.length) {
                return multicursorText;
            }
            return null;
        };
        TypeOperations.paste = function (config, model, selections, text, pasteOnNewLine, multicursorText) {
            var distributedPaste = this._distributePasteToCursors(selections, text, pasteOnNewLine, multicursorText);
            if (distributedPaste) {
                selections = selections.sort(range_1.Range.compareRangesUsingStarts);
                return this._distributedPaste(config, model, selections, distributedPaste);
            }
            else {
                return this._simplePaste(config, model, selections, text, pasteOnNewLine);
            }
        };
        TypeOperations._goodIndentForLine = function (config, model, lineNumber) {
            var action;
            var indentation;
            var expectedIndentAction = config.autoIndent ? languageConfigurationRegistry_1.LanguageConfigurationRegistry.getInheritIndentForLine(model, lineNumber, false) : null;
            if (expectedIndentAction) {
                action = expectedIndentAction.action;
                indentation = expectedIndentAction.indentation;
            }
            else if (lineNumber > 1) {
                var lastLineNumber = lineNumber - 1;
                for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                    var lineText = model.getLineContent(lastLineNumber);
                    var nonWhitespaceIdx = strings.lastNonWhitespaceIndex(lineText);
                    if (nonWhitespaceIdx >= 0) {
                        break;
                    }
                }
                if (lastLineNumber < 1) {
                    // No previous line with content found
                    return null;
                }
                var maxColumn = model.getLineMaxColumn(lastLineNumber);
                var expectedEnterAction = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getEnterAction(model, new range_1.Range(lastLineNumber, maxColumn, lastLineNumber, maxColumn));
                if (expectedEnterAction) {
                    indentation = expectedEnterAction.indentation;
                    action = expectedEnterAction.enterAction;
                    if (action) {
                        indentation += action.appendText;
                    }
                }
            }
            if (action) {
                if (action === languageConfiguration_1.IndentAction.Indent) {
                    indentation = TypeOperations.shiftIndent(config, indentation);
                }
                if (action === languageConfiguration_1.IndentAction.Outdent) {
                    indentation = TypeOperations.unshiftIndent(config, indentation);
                }
                indentation = config.normalizeIndentation(indentation);
            }
            if (!indentation) {
                return null;
            }
            return indentation;
        };
        TypeOperations._replaceJumpToNextIndent = function (config, model, selection, insertsAutoWhitespace) {
            var typeText = '';
            var position = selection.getStartPosition();
            if (config.insertSpaces) {
                var visibleColumnFromColumn = cursorCommon_1.CursorColumns.visibleColumnFromColumn2(config, model, position);
                var tabSize = config.tabSize;
                var spacesCnt = tabSize - (visibleColumnFromColumn % tabSize);
                for (var i = 0; i < spacesCnt; i++) {
                    typeText += ' ';
                }
            }
            else {
                typeText = '\t';
            }
            return new replaceCommand_1.ReplaceCommand(selection, typeText, insertsAutoWhitespace);
        };
        TypeOperations.tab = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                if (selection.isEmpty()) {
                    var lineText = model.getLineContent(selection.startLineNumber);
                    if (/^\s*$/.test(lineText) && model.isCheapToTokenize(selection.startLineNumber)) {
                        var goodIndent = this._goodIndentForLine(config, model, selection.startLineNumber);
                        goodIndent = goodIndent || '\t';
                        var possibleTypeText = config.normalizeIndentation(goodIndent);
                        if (!strings.startsWith(lineText, possibleTypeText)) {
                            commands[i] = new replaceCommand_1.ReplaceCommand(new range_1.Range(selection.startLineNumber, 1, selection.startLineNumber, lineText.length + 1), possibleTypeText, true);
                            continue;
                        }
                    }
                    commands[i] = this._replaceJumpToNextIndent(config, model, selection, true);
                }
                else {
                    if (selection.startLineNumber === selection.endLineNumber) {
                        var lineMaxColumn = model.getLineMaxColumn(selection.startLineNumber);
                        if (selection.startColumn !== 1 || selection.endColumn !== lineMaxColumn) {
                            // This is a single line selection that is not the entire line
                            commands[i] = this._replaceJumpToNextIndent(config, model, selection, false);
                            continue;
                        }
                    }
                    commands[i] = new shiftCommand_1.ShiftCommand(selection, {
                        isUnshift: false,
                        tabSize: config.tabSize,
                        oneIndent: config.oneIndent,
                        useTabStops: config.useTabStops
                    });
                }
            }
            return commands;
        };
        TypeOperations.replacePreviousChar = function (prevEditOperationType, config, model, selections, txt, replaceCharCnt) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                if (!selection.isEmpty()) {
                    // looks like https://github.com/Microsoft/vscode/issues/2773
                    // where a cursor operation occurred before a canceled composition
                    // => ignore composition
                    commands[i] = null;
                    continue;
                }
                var pos = selection.getPosition();
                var startColumn = Math.max(1, pos.column - replaceCharCnt);
                var range = new range_1.Range(pos.lineNumber, startColumn, pos.lineNumber, pos.column);
                commands[i] = new replaceCommand_1.ReplaceCommand(range, txt);
            }
            return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands, {
                shouldPushStackElementBefore: (prevEditOperationType !== 1 /* Typing */),
                shouldPushStackElementAfter: false
            });
        };
        TypeOperations._typeCommand = function (range, text, keepPosition) {
            if (keepPosition) {
                return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, text, true);
            }
            else {
                return new replaceCommand_1.ReplaceCommand(range, text, true);
            }
        };
        TypeOperations._enter = function (config, model, keepPosition, range) {
            if (!model.isCheapToTokenize(range.getStartPosition().lineNumber)) {
                var lineText_1 = model.getLineContent(range.startLineNumber);
                var indentation_1 = strings.getLeadingWhitespace(lineText_1).substring(0, range.startColumn - 1);
                return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation_1), keepPosition);
            }
            var r = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getEnterAction(model, range);
            if (r) {
                var enterAction = r.enterAction;
                var indentation_2 = r.indentation;
                if (enterAction.indentAction === languageConfiguration_1.IndentAction.None) {
                    // Nothing special
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation_2 + enterAction.appendText), keepPosition);
                }
                else if (enterAction.indentAction === languageConfiguration_1.IndentAction.Indent) {
                    // Indent once
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation_2 + enterAction.appendText), keepPosition);
                }
                else if (enterAction.indentAction === languageConfiguration_1.IndentAction.IndentOutdent) {
                    // Ultra special
                    var normalIndent = config.normalizeIndentation(indentation_2);
                    var increasedIndent = config.normalizeIndentation(indentation_2 + enterAction.appendText);
                    var typeText = '\n' + increasedIndent + '\n' + normalIndent;
                    if (keepPosition) {
                        return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, typeText, true);
                    }
                    else {
                        return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, typeText, -1, increasedIndent.length - normalIndent.length, true);
                    }
                }
                else if (enterAction.indentAction === languageConfiguration_1.IndentAction.Outdent) {
                    var actualIndentation = TypeOperations.unshiftIndent(config, indentation_2);
                    return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(actualIndentation + enterAction.appendText), keepPosition);
                }
            }
            // no enter rules applied, we should check indentation rules then.
            if (!config.autoIndent) {
                // Nothing special
                var lineText_2 = model.getLineContent(range.startLineNumber);
                var indentation_3 = strings.getLeadingWhitespace(lineText_2).substring(0, range.startColumn - 1);
                return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation_3), keepPosition);
            }
            var ir = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getIndentForEnter(model, range, {
                unshiftIndent: function (indent) {
                    return TypeOperations.unshiftIndent(config, indent);
                },
                shiftIndent: function (indent) {
                    return TypeOperations.shiftIndent(config, indent);
                },
                normalizeIndentation: function (indent) {
                    return config.normalizeIndentation(indent);
                }
            }, config.autoIndent);
            var lineText = model.getLineContent(range.startLineNumber);
            var indentation = strings.getLeadingWhitespace(lineText).substring(0, range.startColumn - 1);
            if (ir) {
                var oldEndViewColumn = cursorCommon_1.CursorColumns.visibleColumnFromColumn2(config, model, range.getEndPosition());
                var oldEndColumn = range.endColumn;
                var beforeText = '\n';
                if (indentation !== config.normalizeIndentation(ir.beforeEnter)) {
                    beforeText = config.normalizeIndentation(ir.beforeEnter) + lineText.substring(indentation.length, range.startColumn - 1) + '\n';
                    range = new range_1.Range(range.startLineNumber, 1, range.endLineNumber, range.endColumn);
                }
                var newLineContent = model.getLineContent(range.endLineNumber);
                var firstNonWhitespace = strings.firstNonWhitespaceIndex(newLineContent);
                if (firstNonWhitespace >= 0) {
                    range = range.setEndPosition(range.endLineNumber, Math.max(range.endColumn, firstNonWhitespace + 1));
                }
                else {
                    range = range.setEndPosition(range.endLineNumber, model.getLineMaxColumn(range.endLineNumber));
                }
                if (keepPosition) {
                    return new replaceCommand_1.ReplaceCommandWithoutChangingPosition(range, beforeText + config.normalizeIndentation(ir.afterEnter), true);
                }
                else {
                    var offset = 0;
                    if (oldEndColumn <= firstNonWhitespace + 1) {
                        if (!config.insertSpaces) {
                            oldEndViewColumn = Math.ceil(oldEndViewColumn / config.tabSize);
                        }
                        offset = Math.min(oldEndViewColumn + 1 - config.normalizeIndentation(ir.afterEnter).length - 1, 0);
                    }
                    return new replaceCommand_1.ReplaceCommandWithOffsetCursorState(range, beforeText + config.normalizeIndentation(ir.afterEnter), 0, offset, true);
                }
            }
            else {
                return TypeOperations._typeCommand(range, '\n' + config.normalizeIndentation(indentation), keepPosition);
            }
        };
        TypeOperations._isAutoIndentType = function (config, model, selections) {
            if (!config.autoIndent) {
                return false;
            }
            for (var i = 0, len = selections.length; i < len; i++) {
                if (!model.isCheapToTokenize(selections[i].getEndPosition().lineNumber)) {
                    return false;
                }
            }
            return true;
        };
        TypeOperations._runAutoIndentType = function (config, model, range, ch) {
            var currentIndentation = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getIndentationAtPosition(model, range.startLineNumber, range.startColumn);
            var actualIndentation = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getIndentActionForType(model, range, ch, {
                shiftIndent: function (indentation) {
                    return TypeOperations.shiftIndent(config, indentation);
                },
                unshiftIndent: function (indentation) {
                    return TypeOperations.unshiftIndent(config, indentation);
                },
            });
            if (actualIndentation === null) {
                return null;
            }
            if (actualIndentation !== config.normalizeIndentation(currentIndentation)) {
                var firstNonWhitespace = model.getLineFirstNonWhitespaceColumn(range.startLineNumber);
                if (firstNonWhitespace === 0) {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 0, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) + ch, false);
                }
                else {
                    return TypeOperations._typeCommand(new range_1.Range(range.startLineNumber, 0, range.endLineNumber, range.endColumn), config.normalizeIndentation(actualIndentation) +
                        model.getLineContent(range.startLineNumber).substring(firstNonWhitespace - 1, range.startColumn - 1) + ch, false);
                }
            }
            return null;
        };
        TypeOperations._isAutoClosingCloseCharType = function (config, model, selections, ch) {
            if (!config.autoClosingBrackets || !config.autoClosingPairsClose.hasOwnProperty(ch)) {
                return false;
            }
            var isEqualPair = (ch === config.autoClosingPairsClose[ch]);
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                if (!selection.isEmpty()) {
                    return false;
                }
                var position = selection.getPosition();
                var lineText = model.getLineContent(position.lineNumber);
                var afterCharacter = lineText.charAt(position.column - 1);
                if (afterCharacter !== ch) {
                    return false;
                }
                if (isEqualPair) {
                    var lineTextBeforeCursor = lineText.substr(0, position.column - 1);
                    var chCntBefore = this._countNeedlesInHaystack(lineTextBeforeCursor, ch);
                    if (chCntBefore % 2 === 0) {
                        return false;
                    }
                }
            }
            return true;
        };
        TypeOperations._countNeedlesInHaystack = function (haystack, needle) {
            var cnt = 0;
            var lastIndex = -1;
            while ((lastIndex = haystack.indexOf(needle, lastIndex + 1)) !== -1) {
                cnt++;
            }
            return cnt;
        };
        TypeOperations._runAutoClosingCloseCharType = function (prevEditOperationType, config, model, selections, ch) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                var position = selection.getPosition();
                var typeSelection = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1);
                commands[i] = new replaceCommand_1.ReplaceCommand(typeSelection, ch);
            }
            return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands, {
                shouldPushStackElementBefore: (prevEditOperationType !== 1 /* Typing */),
                shouldPushStackElementAfter: false
            });
        };
        TypeOperations._isAutoClosingOpenCharType = function (config, model, selections, ch) {
            if (!config.autoClosingBrackets || !config.autoClosingPairsOpen.hasOwnProperty(ch)) {
                return false;
            }
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                if (!selection.isEmpty()) {
                    return false;
                }
                var position = selection.getPosition();
                var lineText = model.getLineContent(position.lineNumber);
                // Do not auto-close ' or " after a word character
                if ((ch === '\'' || ch === '"') && position.column > 1) {
                    var wordSeparators = wordCharacterClassifier_1.getMapForWordSeparators(config.wordSeparators);
                    var characterBeforeCode = lineText.charCodeAt(position.column - 2);
                    var characterBeforeType = wordSeparators.get(characterBeforeCode);
                    if (characterBeforeType === 0 /* Regular */) {
                        return false;
                    }
                }
                // Only consider auto closing the pair if a space follows or if another autoclosed pair follows
                var characterAfter = lineText.charAt(position.column - 1);
                if (characterAfter) {
                    var thisBraceIsSymmetric = (config.autoClosingPairsOpen[ch] === ch);
                    var isBeforeCloseBrace = false;
                    for (var otherCloseBrace in config.autoClosingPairsClose) {
                        var otherBraceIsSymmetric = (config.autoClosingPairsOpen[otherCloseBrace] === otherCloseBrace);
                        if (!thisBraceIsSymmetric && otherBraceIsSymmetric) {
                            continue;
                        }
                        if (characterAfter === otherCloseBrace) {
                            isBeforeCloseBrace = true;
                            break;
                        }
                    }
                    if (!isBeforeCloseBrace && !/\s/.test(characterAfter)) {
                        return false;
                    }
                }
                if (!model.isCheapToTokenize(position.lineNumber)) {
                    // Do not force tokenization
                    return false;
                }
                model.forceTokenization(position.lineNumber);
                var lineTokens = model.getLineTokens(position.lineNumber);
                var shouldAutoClosePair = false;
                try {
                    shouldAutoClosePair = languageConfigurationRegistry_1.LanguageConfigurationRegistry.shouldAutoClosePair(ch, lineTokens, position.column);
                }
                catch (e) {
                    errors_1.onUnexpectedError(e);
                }
                if (!shouldAutoClosePair) {
                    return false;
                }
            }
            return true;
        };
        TypeOperations._runAutoClosingOpenCharType = function (prevEditOperationType, config, model, selections, ch) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                var closeCharacter = config.autoClosingPairsOpen[ch];
                commands[i] = new replaceCommand_1.ReplaceCommandWithOffsetCursorState(selection, ch + closeCharacter, 0, -closeCharacter.length);
            }
            return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: false
            });
        };
        TypeOperations._isSurroundSelectionType = function (config, model, selections, ch) {
            if (!config.autoClosingBrackets || !config.surroundingPairs.hasOwnProperty(ch)) {
                return false;
            }
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                if (selection.isEmpty()) {
                    return false;
                }
                var selectionContainsOnlyWhitespace = true;
                for (var lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
                    var lineText = model.getLineContent(lineNumber);
                    var startIndex = (lineNumber === selection.startLineNumber ? selection.startColumn - 1 : 0);
                    var endIndex = (lineNumber === selection.endLineNumber ? selection.endColumn - 1 : lineText.length);
                    var selectedText = lineText.substring(startIndex, endIndex);
                    if (/[^ \t]/.test(selectedText)) {
                        // this selected text contains something other than whitespace
                        selectionContainsOnlyWhitespace = false;
                        break;
                    }
                }
                if (selectionContainsOnlyWhitespace) {
                    return false;
                }
            }
            return true;
        };
        TypeOperations._runSurroundSelectionType = function (prevEditOperationType, config, model, selections, ch) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var selection = selections[i];
                var closeCharacter = config.surroundingPairs[ch];
                commands[i] = new surroundSelectionCommand_1.SurroundSelectionCommand(selection, ch, closeCharacter);
            }
            return new cursorCommon_1.EditOperationResult(0 /* Other */, commands, {
                shouldPushStackElementBefore: true,
                shouldPushStackElementAfter: true
            });
        };
        TypeOperations._isTypeInterceptorElectricChar = function (config, model, selections) {
            if (selections.length === 1 && model.isCheapToTokenize(selections[0].getEndPosition().lineNumber)) {
                return true;
            }
            return false;
        };
        TypeOperations._typeInterceptorElectricChar = function (prevEditOperationType, config, model, selection, ch) {
            if (!config.electricChars.hasOwnProperty(ch) || !selection.isEmpty()) {
                return null;
            }
            var position = selection.getPosition();
            model.forceTokenization(position.lineNumber);
            var lineTokens = model.getLineTokens(position.lineNumber);
            var electricAction;
            try {
                electricAction = languageConfigurationRegistry_1.LanguageConfigurationRegistry.onElectricCharacter(ch, lineTokens, position.column);
            }
            catch (e) {
                errors_1.onUnexpectedError(e);
            }
            if (!electricAction) {
                return null;
            }
            if (electricAction.appendText) {
                var command = new replaceCommand_1.ReplaceCommandWithOffsetCursorState(selection, ch + electricAction.appendText, 0, -electricAction.appendText.length);
                return new cursorCommon_1.EditOperationResult(1 /* Typing */, [command], {
                    shouldPushStackElementBefore: false,
                    shouldPushStackElementAfter: true
                });
            }
            if (electricAction.matchOpenBracket) {
                var endColumn = (lineTokens.getLineContent() + ch).lastIndexOf(electricAction.matchOpenBracket) + 1;
                var match = model.findMatchingBracketUp(electricAction.matchOpenBracket, {
                    lineNumber: position.lineNumber,
                    column: endColumn
                });
                if (match) {
                    if (match.startLineNumber === position.lineNumber) {
                        // matched something on the same line => no change in indentation
                        return null;
                    }
                    var matchLine = model.getLineContent(match.startLineNumber);
                    var matchLineIndentation = strings.getLeadingWhitespace(matchLine);
                    var newIndentation = config.normalizeIndentation(matchLineIndentation);
                    var lineText = model.getLineContent(position.lineNumber);
                    var lineFirstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber) || position.column;
                    var prefix = lineText.substring(lineFirstNonBlankColumn - 1, position.column - 1);
                    var typeText = newIndentation + prefix + ch;
                    var typeSelection = new range_1.Range(position.lineNumber, 1, position.lineNumber, position.column);
                    var command = new replaceCommand_1.ReplaceCommand(typeSelection, typeText);
                    return new cursorCommon_1.EditOperationResult(1 /* Typing */, [command], {
                        shouldPushStackElementBefore: false,
                        shouldPushStackElementAfter: true
                    });
                }
            }
            return null;
        };
        TypeOperations.typeWithInterceptors = function (prevEditOperationType, config, model, selections, ch) {
            if (ch === '\n') {
                var commands_1 = [];
                for (var i = 0, len = selections.length; i < len; i++) {
                    commands_1[i] = TypeOperations._enter(config, model, false, selections[i]);
                }
                return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands_1, {
                    shouldPushStackElementBefore: true,
                    shouldPushStackElementAfter: false,
                });
            }
            if (this._isAutoIndentType(config, model, selections)) {
                var commands_2 = [];
                var autoIndentFails = false;
                for (var i = 0, len = selections.length; i < len; i++) {
                    commands_2[i] = this._runAutoIndentType(config, model, selections[i], ch);
                    if (!commands_2[i]) {
                        autoIndentFails = true;
                        break;
                    }
                }
                if (!autoIndentFails) {
                    return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands_2, {
                        shouldPushStackElementBefore: true,
                        shouldPushStackElementAfter: false,
                    });
                }
            }
            if (this._isAutoClosingCloseCharType(config, model, selections, ch)) {
                return this._runAutoClosingCloseCharType(prevEditOperationType, config, model, selections, ch);
            }
            if (this._isAutoClosingOpenCharType(config, model, selections, ch)) {
                return this._runAutoClosingOpenCharType(prevEditOperationType, config, model, selections, ch);
            }
            if (this._isSurroundSelectionType(config, model, selections, ch)) {
                return this._runSurroundSelectionType(prevEditOperationType, config, model, selections, ch);
            }
            // Electric characters make sense only when dealing with a single cursor,
            // as multiple cursors typing brackets for example would interfer with bracket matching
            if (this._isTypeInterceptorElectricChar(config, model, selections)) {
                var r = this._typeInterceptorElectricChar(prevEditOperationType, config, model, selections[0], ch);
                if (r) {
                    return r;
                }
            }
            // A simple character type
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], ch);
            }
            var shouldPushStackElementBefore = (prevEditOperationType !== 1 /* Typing */);
            if (ch === ' ') {
                shouldPushStackElementBefore = true;
            }
            return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands, {
                shouldPushStackElementBefore: shouldPushStackElementBefore,
                shouldPushStackElementAfter: false
            });
        };
        TypeOperations.typeWithoutInterceptors = function (prevEditOperationType, config, model, selections, str) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = new replaceCommand_1.ReplaceCommand(selections[i], str);
            }
            return new cursorCommon_1.EditOperationResult(1 /* Typing */, commands, {
                shouldPushStackElementBefore: (prevEditOperationType !== 1 /* Typing */),
                shouldPushStackElementAfter: false
            });
        };
        TypeOperations.lineInsertBefore = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var lineNumber = selections[i].positionLineNumber;
                if (lineNumber === 1) {
                    commands[i] = new replaceCommand_1.ReplaceCommandWithoutChangingPosition(new range_1.Range(1, 1, 1, 1), '\n');
                }
                else {
                    lineNumber--;
                    var column = model.getLineMaxColumn(lineNumber);
                    commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
                }
            }
            return commands;
        };
        TypeOperations.lineInsertAfter = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                var lineNumber = selections[i].positionLineNumber;
                var column = model.getLineMaxColumn(lineNumber);
                commands[i] = this._enter(config, model, false, new range_1.Range(lineNumber, column, lineNumber, column));
            }
            return commands;
        };
        TypeOperations.lineBreakInsert = function (config, model, selections) {
            var commands = [];
            for (var i = 0, len = selections.length; i < len; i++) {
                commands[i] = this._enter(config, model, true, selections[i]);
            }
            return commands;
        };
        return TypeOperations;
    }());
    exports.TypeOperations = TypeOperations;
});
