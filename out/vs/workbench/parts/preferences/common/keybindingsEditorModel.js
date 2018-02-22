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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/platform", "vs/base/common/filters", "vs/platform/registry/common/platform", "vs/base/common/keybindingLabels", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/common/editor", "vs/platform/extensions/common/extensions", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/keybindingResolver"], function (require, exports, nls_1, arrays_1, strings, platform_1, filters_1, platform_2, keybindingLabels_1, actions_1, actions_2, editor_1, extensions_1, keybinding_1, resolvedKeybindingItem_1, keybindingResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KEYBINDING_ENTRY_TEMPLATE_ID = 'keybinding.entry.template';
    exports.KEYBINDING_HEADER_TEMPLATE_ID = 'keybinding.header.template';
    var wordFilter = filters_1.or(filters_1.matchesPrefix, filters_1.matchesWords, filters_1.matchesContiguousSubString);
    var KeybindingsEditorModel = /** @class */ (function (_super) {
        __extends(KeybindingsEditorModel, _super);
        function KeybindingsEditorModel(os, keybindingsService, extensionService) {
            var _this = _super.call(this) || this;
            _this.keybindingsService = keybindingsService;
            _this.extensionService = extensionService;
            _this.modifierLabels = {
                ui: keybindingLabels_1.UILabelProvider.modifierLabels[os],
                aria: keybindingLabels_1.AriaLabelProvider.modifierLabels[os],
                user: keybindingLabels_1.UserSettingsLabelProvider.modifierLabels[os]
            };
            return _this;
        }
        KeybindingsEditorModel.prototype.fetch = function (searchValue, sortByPrecedence) {
            if (sortByPrecedence === void 0) { sortByPrecedence = false; }
            searchValue = searchValue.trim();
            var quoteAtFirstChar = searchValue.charAt(0) === '"';
            var quoteAtLastChar = searchValue.charAt(searchValue.length - 1) === '"';
            if (quoteAtFirstChar) {
                searchValue = searchValue.substring(1);
            }
            if (quoteAtLastChar) {
                searchValue = searchValue.substring(0, searchValue.length - 1);
            }
            searchValue = searchValue.trim();
            return this.fetchKeybindingItems(sortByPrecedence ? this._keybindingItemsSortedByPrecedence : this._keybindingItems, searchValue, quoteAtFirstChar && quoteAtLastChar);
        };
        KeybindingsEditorModel.prototype.fetchKeybindingItems = function (keybindingItems, searchValue, completeMatch) {
            if (!searchValue) {
                return keybindingItems.map(function (keybindingItem) { return ({ id: KeybindingsEditorModel.getId(keybindingItem), keybindingItem: keybindingItem, templateId: exports.KEYBINDING_ENTRY_TEMPLATE_ID }); });
            }
            var result = [];
            var words = searchValue.split(' ');
            var keybindingWords = this.splitKeybindingWords(words);
            for (var _i = 0, keybindingItems_1 = keybindingItems; _i < keybindingItems_1.length; _i++) {
                var keybindingItem = keybindingItems_1[_i];
                var keybindingMatches = new KeybindingItemMatches(this.modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch);
                if (keybindingMatches.commandIdMatches
                    || keybindingMatches.commandLabelMatches
                    || keybindingMatches.commandDefaultLabelMatches
                    || keybindingMatches.sourceMatches
                    || keybindingMatches.whenMatches
                    || keybindingMatches.keybindingMatches) {
                    result.push({
                        id: KeybindingsEditorModel.getId(keybindingItem),
                        templateId: exports.KEYBINDING_ENTRY_TEMPLATE_ID,
                        commandLabelMatches: keybindingMatches.commandLabelMatches,
                        commandDefaultLabelMatches: keybindingMatches.commandDefaultLabelMatches,
                        keybindingItem: keybindingItem,
                        keybindingMatches: keybindingMatches.keybindingMatches,
                        commandIdMatches: keybindingMatches.commandIdMatches,
                        sourceMatches: keybindingMatches.sourceMatches,
                        whenMatches: keybindingMatches.whenMatches
                    });
                }
            }
            return result;
        };
        KeybindingsEditorModel.prototype.splitKeybindingWords = function (wordsSeparatedBySpaces) {
            var result = [];
            for (var _i = 0, wordsSeparatedBySpaces_1 = wordsSeparatedBySpaces; _i < wordsSeparatedBySpaces_1.length; _i++) {
                var word = wordsSeparatedBySpaces_1[_i];
                result.push.apply(result, word.split('+'));
            }
            return result;
        };
        KeybindingsEditorModel.prototype.resolve = function (editorActionsLabels) {
            var _this = this;
            return this.extensionService.whenInstalledExtensionsRegistered()
                .then(function () {
                var workbenchActionsRegistry = platform_2.Registry.as(actions_2.Extensions.WorkbenchActions);
                _this._keybindingItemsSortedByPrecedence = [];
                var boundCommands = new Map();
                for (var _i = 0, _a = _this.keybindingsService.getKeybindings(); _i < _a.length; _i++) {
                    var keybinding = _a[_i];
                    if (keybinding.command) {
                        _this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel.toKeybindingEntry(keybinding.command, keybinding, workbenchActionsRegistry, editorActionsLabels));
                        boundCommands.set(keybinding.command, true);
                    }
                }
                var commandsWithDefaultKeybindings = _this.keybindingsService.getDefaultKeybindings().map(function (keybinding) { return keybinding.command; });
                for (var _b = 0, _c = keybindingResolver_1.KeybindingResolver.getAllUnboundCommands(boundCommands); _b < _c.length; _b++) {
                    var command = _c[_b];
                    var keybindingItem = new resolvedKeybindingItem_1.ResolvedKeybindingItem(null, command, null, null, commandsWithDefaultKeybindings.indexOf(command) === -1);
                    _this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel.toKeybindingEntry(command, keybindingItem, workbenchActionsRegistry, editorActionsLabels));
                }
                _this._keybindingItems = _this._keybindingItemsSortedByPrecedence.slice(0).sort(function (a, b) { return KeybindingsEditorModel.compareKeybindingData(a, b); });
                return _this;
            });
        };
        KeybindingsEditorModel.getId = function (keybindingItem) {
            return keybindingItem.command + (keybindingItem.keybinding ? keybindingItem.keybinding.getAriaLabel() : '') + keybindingItem.source + keybindingItem.when;
        };
        KeybindingsEditorModel.compareKeybindingData = function (a, b) {
            if (a.keybinding && !b.keybinding) {
                return -1;
            }
            if (b.keybinding && !a.keybinding) {
                return 1;
            }
            if (a.commandLabel && !b.commandLabel) {
                return -1;
            }
            if (b.commandLabel && !a.commandLabel) {
                return 1;
            }
            if (a.commandLabel && b.commandLabel) {
                if (a.commandLabel !== b.commandLabel) {
                    return a.commandLabel.localeCompare(b.commandLabel);
                }
            }
            if (a.command === b.command) {
                return a.keybindingItem.isDefault ? 1 : -1;
            }
            return a.command.localeCompare(b.command);
        };
        KeybindingsEditorModel.toKeybindingEntry = function (command, keybindingItem, workbenchActionsRegistry, editorActions) {
            var menuCommand = actions_1.MenuRegistry.getCommand(command);
            var editorActionLabel = editorActions[command];
            return {
                keybinding: keybindingItem.resolvedKeybinding,
                keybindingItem: keybindingItem,
                command: command,
                commandLabel: KeybindingsEditorModel.getCommandLabel(menuCommand, editorActionLabel),
                commandDefaultLabel: KeybindingsEditorModel.getCommandDefaultLabel(menuCommand, workbenchActionsRegistry),
                when: keybindingItem.when ? keybindingItem.when.serialize() : '',
                source: keybindingItem.isDefault ? nls_1.localize('default', "Default") : nls_1.localize('user', "User")
            };
        };
        KeybindingsEditorModel.getCommandDefaultLabel = function (menuCommand, workbenchActionsRegistry) {
            if (platform_1.language !== platform_1.LANGUAGE_DEFAULT) {
                if (menuCommand && menuCommand.title && menuCommand.title.original) {
                    return menuCommand.title.original;
                }
            }
            return null;
        };
        KeybindingsEditorModel.getCommandLabel = function (menuCommand, editorActionLabel) {
            if (menuCommand) {
                return typeof menuCommand.title === 'string' ? menuCommand.title : menuCommand.title.value;
            }
            if (editorActionLabel) {
                return editorActionLabel;
            }
            return '';
        };
        KeybindingsEditorModel = __decorate([
            __param(1, keybinding_1.IKeybindingService),
            __param(2, extensions_1.IExtensionService)
        ], KeybindingsEditorModel);
        return KeybindingsEditorModel;
    }(editor_1.EditorModel));
    exports.KeybindingsEditorModel = KeybindingsEditorModel;
    var KeybindingItemMatches = /** @class */ (function () {
        function KeybindingItemMatches(modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch) {
            this.modifierLabels = modifierLabels;
            this.completeMatch = completeMatch;
            this.commandIdMatches = null;
            this.commandLabelMatches = null;
            this.commandDefaultLabelMatches = null;
            this.sourceMatches = null;
            this.whenMatches = null;
            this.keybindingMatches = null;
            this.commandIdMatches = this.matches(searchValue, keybindingItem.command, filters_1.or(filters_1.matchesWords, filters_1.matchesCamelCase), words);
            this.commandLabelMatches = keybindingItem.commandLabel ? this.matches(searchValue, keybindingItem.commandLabel, function (word, wordToMatchAgainst) { return filters_1.matchesWords(word, keybindingItem.commandLabel, true); }, words) : null;
            this.commandDefaultLabelMatches = keybindingItem.commandDefaultLabel ? this.matches(searchValue, keybindingItem.commandDefaultLabel, function (word, wordToMatchAgainst) { return filters_1.matchesWords(word, keybindingItem.commandDefaultLabel, true); }, words) : null;
            this.sourceMatches = this.matches(searchValue, keybindingItem.source, function (word, wordToMatchAgainst) { return filters_1.matchesWords(word, keybindingItem.source, true); }, words);
            this.whenMatches = keybindingItem.when ? this.matches(searchValue, keybindingItem.when, filters_1.or(filters_1.matchesWords, filters_1.matchesCamelCase), words) : null;
            this.keybindingMatches = keybindingItem.keybinding ? this.matchesKeybinding(keybindingItem.keybinding, searchValue, keybindingWords) : null;
        }
        KeybindingItemMatches.prototype.matches = function (searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
            var matches = wordFilter(searchValue, wordToMatchAgainst);
            if (!matches) {
                matches = this.matchesWords(words, wordToMatchAgainst, wordMatchesFilter);
            }
            if (matches) {
                matches = this.filterAndSort(matches);
            }
            return matches;
        };
        KeybindingItemMatches.prototype.matchesWords = function (words, wordToMatchAgainst, wordMatchesFilter) {
            var matches = [];
            for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                var word = words_1[_i];
                var wordMatches = wordMatchesFilter(word, wordToMatchAgainst);
                if (wordMatches) {
                    matches = (matches || []).concat(wordMatches);
                }
                else {
                    matches = null;
                    break;
                }
            }
            return matches;
        };
        KeybindingItemMatches.prototype.filterAndSort = function (matches) {
            return arrays_1.distinct(matches, (function (a) { return a.start + '.' + a.end; })).filter(function (match) { return !matches.some(function (m) { return !(m.start === match.start && m.end === match.end) && (m.start <= match.start && m.end >= match.end); }); }).sort(function (a, b) { return a.start - b.start; });
        };
        KeybindingItemMatches.prototype.matchesKeybinding = function (keybinding, searchValue, words) {
            var _a = keybinding.getParts(), firstPart = _a[0], chordPart = _a[1];
            if (strings.compareIgnoreCase(searchValue, keybinding.getAriaLabel()) === 0 || strings.compareIgnoreCase(searchValue, keybinding.getLabel()) === 0) {
                return {
                    firstPart: this.createCompleteMatch(firstPart),
                    chordPart: this.createCompleteMatch(chordPart)
                };
            }
            var firstPartMatch = {};
            var chordPartMatch = {};
            var matchedWords = [];
            var firstPartMatchedWords = [];
            var chordPartMatchedWords = [];
            var matchFirstPart = true;
            for (var index = 0; index < words.length; index++) {
                var word = words[index];
                var firstPartMatched = false;
                var chordPartMatched = false;
                matchFirstPart = matchFirstPart && !firstPartMatch.keyCode;
                var matchChordPart = !chordPartMatch.keyCode;
                if (matchFirstPart) {
                    firstPartMatched = this.matchPart(firstPart, firstPartMatch, word);
                    if (firstPartMatch.keyCode) {
                        for (var _i = 0, chordPartMatchedWords_1 = chordPartMatchedWords; _i < chordPartMatchedWords_1.length; _i++) {
                            var cordPartMatchedWordIndex = chordPartMatchedWords_1[_i];
                            if (firstPartMatchedWords.indexOf(cordPartMatchedWordIndex) === -1) {
                                matchedWords.splice(matchedWords.indexOf(cordPartMatchedWordIndex), 1);
                            }
                        }
                        chordPartMatch = {};
                        chordPartMatchedWords = [];
                        matchChordPart = false;
                    }
                }
                if (matchChordPart) {
                    chordPartMatched = this.matchPart(chordPart, chordPartMatch, word);
                }
                if (firstPartMatched) {
                    firstPartMatchedWords.push(index);
                }
                if (chordPartMatched) {
                    chordPartMatchedWords.push(index);
                }
                if (firstPartMatched || chordPartMatched) {
                    matchedWords.push(index);
                }
                matchFirstPart = matchFirstPart && this.isModifier(word);
            }
            if (matchedWords.length !== words.length) {
                return null;
            }
            if (this.completeMatch && (!this.isCompleteMatch(firstPart, firstPartMatch) || !this.isCompleteMatch(chordPart, chordPartMatch))) {
                return null;
            }
            return this.hasAnyMatch(firstPartMatch) || this.hasAnyMatch(chordPartMatch) ? { firstPart: firstPartMatch, chordPart: chordPartMatch } : null;
        };
        KeybindingItemMatches.prototype.matchPart = function (part, match, word) {
            var matched = false;
            if (this.matchesMetaModifier(part, word)) {
                matched = true;
                match.metaKey = true;
            }
            if (this.matchesCtrlModifier(part, word)) {
                matched = true;
                match.ctrlKey = true;
            }
            if (this.matchesShiftModifier(part, word)) {
                matched = true;
                match.shiftKey = true;
            }
            if (this.matchesAltModifier(part, word)) {
                matched = true;
                match.altKey = true;
            }
            if (this.matchesKeyCode(part, word)) {
                match.keyCode = true;
                matched = true;
            }
            return matched;
        };
        KeybindingItemMatches.prototype.matchesKeyCode = function (keybinding, word) {
            if (!keybinding) {
                return false;
            }
            var ariaLabel = keybinding.keyAriaLabel;
            if (this.completeMatch || ariaLabel.length === 1 || word.length === 1) {
                if (strings.compareIgnoreCase(ariaLabel, word) === 0) {
                    return true;
                }
            }
            else {
                if (filters_1.matchesContiguousSubString(word, ariaLabel)) {
                    return true;
                }
            }
            return false;
        };
        KeybindingItemMatches.prototype.matchesMetaModifier = function (keybinding, word) {
            if (!keybinding) {
                return false;
            }
            if (!keybinding.metaKey) {
                return false;
            }
            return this.wordMatchesMetaModifier(word);
        };
        KeybindingItemMatches.prototype.wordMatchesMetaModifier = function (word) {
            if (filters_1.matchesPrefix(this.modifierLabels.ui.metaKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.aria.metaKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.user.metaKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(nls_1.localize('meta', "meta"), word)) {
                return true;
            }
            return false;
        };
        KeybindingItemMatches.prototype.matchesCtrlModifier = function (keybinding, word) {
            if (!keybinding) {
                return false;
            }
            if (!keybinding.ctrlKey) {
                return false;
            }
            return this.wordMatchesCtrlModifier(word);
        };
        KeybindingItemMatches.prototype.wordMatchesCtrlModifier = function (word) {
            if (filters_1.matchesPrefix(this.modifierLabels.ui.ctrlKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.aria.ctrlKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.user.ctrlKey, word)) {
                return true;
            }
            return false;
        };
        KeybindingItemMatches.prototype.matchesShiftModifier = function (keybinding, word) {
            if (!keybinding) {
                return false;
            }
            if (!keybinding.shiftKey) {
                return false;
            }
            return this.wordMatchesShiftModifier(word);
        };
        KeybindingItemMatches.prototype.wordMatchesShiftModifier = function (word) {
            if (filters_1.matchesPrefix(this.modifierLabels.ui.shiftKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.aria.shiftKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.user.shiftKey, word)) {
                return true;
            }
            return false;
        };
        KeybindingItemMatches.prototype.matchesAltModifier = function (keybinding, word) {
            if (!keybinding) {
                return false;
            }
            if (!keybinding.altKey) {
                return false;
            }
            return this.wordMatchesAltModifier(word);
        };
        KeybindingItemMatches.prototype.wordMatchesAltModifier = function (word) {
            if (filters_1.matchesPrefix(this.modifierLabels.ui.altKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.aria.altKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(this.modifierLabels.user.altKey, word)) {
                return true;
            }
            if (filters_1.matchesPrefix(nls_1.localize('option', "option"), word)) {
                return true;
            }
            return false;
        };
        KeybindingItemMatches.prototype.hasAnyMatch = function (keybindingMatch) {
            return keybindingMatch.altKey ||
                keybindingMatch.ctrlKey ||
                keybindingMatch.metaKey ||
                keybindingMatch.shiftKey ||
                keybindingMatch.keyCode;
        };
        KeybindingItemMatches.prototype.isCompleteMatch = function (part, match) {
            if (!part) {
                return true;
            }
            if (!match.keyCode) {
                return false;
            }
            if (part.metaKey && !match.metaKey) {
                return false;
            }
            if (part.altKey && !match.altKey) {
                return false;
            }
            if (part.ctrlKey && !match.ctrlKey) {
                return false;
            }
            if (part.shiftKey && !match.shiftKey) {
                return false;
            }
            return true;
        };
        KeybindingItemMatches.prototype.createCompleteMatch = function (part) {
            var match = {};
            if (part) {
                match.keyCode = true;
                if (part.metaKey) {
                    match.metaKey = true;
                }
                if (part.altKey) {
                    match.altKey = true;
                }
                if (part.ctrlKey) {
                    match.ctrlKey = true;
                }
                if (part.shiftKey) {
                    match.shiftKey = true;
                }
            }
            return match;
        };
        KeybindingItemMatches.prototype.isModifier = function (word) {
            if (this.wordMatchesAltModifier(word)) {
                return true;
            }
            if (this.wordMatchesCtrlModifier(word)) {
                return true;
            }
            if (this.wordMatchesMetaModifier(word)) {
                return true;
            }
            if (this.wordMatchesShiftModifier(word)) {
                return true;
            }
            return false;
        };
        return KeybindingItemMatches;
    }());
});
