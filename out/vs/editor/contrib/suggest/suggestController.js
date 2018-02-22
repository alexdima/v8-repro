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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/base/browser/ui/aria/aria", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/contrib/snippet/snippetParser", "vs/editor/contrib/snippet/snippetController2", "./suggest", "./suggestModel", "./suggestWidget", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/contrib/suggest/suggestMemory"], function (require, exports, nls, errors_1, arrays_1, lifecycle_1, instantiation_1, contextkey_1, commands_1, editorContextKeys_1, editorExtensions_1, aria_1, editOperation_1, range_1, snippetParser_1, snippetController2_1, suggest_1, suggestModel_1, suggestWidget_1, keybindingsRegistry_1, suggestMemory_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var AcceptOnCharacterOracle = /** @class */ (function () {
        function AcceptOnCharacterOracle(editor, widget, accept) {
            var _this = this;
            this._disposables = [];
            this._activeAcceptCharacters = new Set();
            this._disposables.push(widget.onDidShow(function () { return _this._onItem(widget.getFocusedItem()); }));
            this._disposables.push(widget.onDidFocus(this._onItem, this));
            this._disposables.push(widget.onDidHide(this.reset, this));
            this._disposables.push(editor.onWillType(function (text) {
                if (_this._activeItem) {
                    var ch = text[text.length - 1];
                    if (_this._activeAcceptCharacters.has(ch) && editor.getConfiguration().contribInfo.acceptSuggestionOnCommitCharacter) {
                        accept(_this._activeItem);
                    }
                }
            }));
        }
        AcceptOnCharacterOracle.prototype._onItem = function (selected) {
            if (!selected || arrays_1.isFalsyOrEmpty(selected.item.suggestion.commitCharacters)) {
                this.reset();
                return;
            }
            this._activeItem = selected;
            this._activeAcceptCharacters.clear();
            for (var _i = 0, _a = selected.item.suggestion.commitCharacters; _i < _a.length; _i++) {
                var ch = _a[_i];
                if (ch.length > 0) {
                    this._activeAcceptCharacters.add(ch[0]);
                }
            }
        };
        AcceptOnCharacterOracle.prototype.reset = function () {
            this._activeItem = undefined;
        };
        AcceptOnCharacterOracle.prototype.dispose = function () {
            lifecycle_1.dispose(this._disposables);
        };
        return AcceptOnCharacterOracle;
    }());
    var SuggestController = /** @class */ (function () {
        function SuggestController(_editor, _commandService, _contextKeyService, _instantiationService) {
            var _this = this;
            this._editor = _editor;
            this._commandService = _commandService;
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._toDispose = [];
            this._model = new suggestModel_1.SuggestModel(this._editor);
            this._memory = _instantiationService.createInstance(suggestMemory_1.SuggestMemories, this._editor.getConfiguration().contribInfo.suggestSelection);
            this._toDispose.push(this._model.onDidTrigger(function (e) {
                if (!_this._widget) {
                    _this._createSuggestWidget();
                }
                _this._widget.showTriggered(e.auto);
            }));
            this._toDispose.push(this._model.onDidSuggest(function (e) {
                var index = _this._memory.select(_this._editor.getModel(), _this._editor.getPosition(), e.completionModel.items);
                _this._widget.showSuggestions(e.completionModel, index, e.isFrozen, e.auto);
            }));
            this._toDispose.push(this._model.onDidCancel(function (e) {
                if (_this._widget && !e.retrigger) {
                    _this._widget.hideWidget();
                }
            }));
            // Manage the acceptSuggestionsOnEnter context key
            var acceptSuggestionsOnEnter = suggest_1.Context.AcceptSuggestionsOnEnter.bindTo(_contextKeyService);
            var updateFromConfig = function () {
                var _a = _this._editor.getConfiguration().contribInfo, acceptSuggestionOnEnter = _a.acceptSuggestionOnEnter, suggestSelection = _a.suggestSelection;
                acceptSuggestionsOnEnter.set(acceptSuggestionOnEnter === 'on' || acceptSuggestionOnEnter === 'smart');
                _this._memory.setMode(suggestSelection);
            };
            this._toDispose.push(this._editor.onDidChangeConfiguration(function (e) { return updateFromConfig(); }));
            updateFromConfig();
        }
        SuggestController.get = function (editor) {
            return editor.getContribution(SuggestController.ID);
        };
        SuggestController.prototype._createSuggestWidget = function () {
            var _this = this;
            this._widget = this._instantiationService.createInstance(suggestWidget_1.SuggestWidget, this._editor);
            this._toDispose.push(this._widget.onDidSelect(this._onDidSelectItem, this));
            // Wire up logic to accept a suggestion on certain characters
            var autoAcceptOracle = new AcceptOnCharacterOracle(this._editor, this._widget, function (item) { return _this._onDidSelectItem(item); });
            this._toDispose.push(autoAcceptOracle, this._model.onDidSuggest(function (e) {
                if (e.completionModel.items.length === 0) {
                    autoAcceptOracle.reset();
                }
            }));
            var makesTextEdit = suggest_1.Context.MakesTextEdit.bindTo(this._contextKeyService);
            this._toDispose.push(this._widget.onDidFocus(function (_a) {
                var item = _a.item;
                var position = _this._editor.getPosition();
                var startColumn = item.position.column - item.suggestion.overwriteBefore;
                var endColumn = position.column;
                var value = true;
                if (_this._editor.getConfiguration().contribInfo.acceptSuggestionOnEnter === 'smart'
                    && _this._model.state === 2 /* Auto */
                    && !item.suggestion.command
                    && !item.suggestion.additionalTextEdits
                    && item.suggestion.snippetType !== 'textmate'
                    && endColumn - startColumn === item.suggestion.insertText.length) {
                    var oldText = _this._editor.getModel().getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: endColumn
                    });
                    value = oldText !== item.suggestion.insertText;
                }
                makesTextEdit.set(value);
            }));
            this._toDispose.push({
                dispose: function () { makesTextEdit.reset(); }
            });
        };
        SuggestController.prototype.getId = function () {
            return SuggestController.ID;
        };
        SuggestController.prototype.dispose = function () {
            this._toDispose = lifecycle_1.dispose(this._toDispose);
            if (this._widget) {
                this._widget.dispose();
                this._widget = null;
            }
            if (this._model) {
                this._model.dispose();
                this._model = null;
            }
        };
        SuggestController.prototype._onDidSelectItem = function (event) {
            if (!event || !event.item) {
                this._model.cancel();
                return;
            }
            var _a = event.item, suggestion = _a.suggestion, position = _a.position;
            var editorColumn = this._editor.getPosition().column;
            var columnDelta = editorColumn - position.column;
            if (Array.isArray(suggestion.additionalTextEdits)) {
                this._editor.pushUndoStop();
                this._editor.executeEdits('suggestController.additionalTextEdits', suggestion.additionalTextEdits.map(function (edit) { return editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text); }));
                this._editor.pushUndoStop();
            }
            // keep item in memory
            this._memory.memorize(this._editor.getModel(), this._editor.getPosition(), event.item);
            var insertText = suggestion.insertText;
            if (suggestion.snippetType !== 'textmate') {
                insertText = snippetParser_1.SnippetParser.escape(insertText);
            }
            snippetController2_1.SnippetController2.get(this._editor).insert(insertText, suggestion.overwriteBefore + columnDelta, suggestion.overwriteAfter);
            if (!suggestion.command) {
                // done
                this._model.cancel();
            }
            else if (suggestion.command.id === TriggerSuggestAction.id) {
                // retigger
                this._model.trigger({ auto: this._model.state === 2 /* Auto */ }, true);
            }
            else {
                // exec command, done
                (_b = this._commandService).executeCommand.apply(_b, [suggestion.command.id].concat(suggestion.command.arguments)).done(undefined, errors_1.onUnexpectedError);
                this._model.cancel();
            }
            this._alertCompletionItem(event.item);
            var _b;
        };
        SuggestController.prototype._alertCompletionItem = function (_a) {
            var suggestion = _a.suggestion;
            var msg = nls.localize('arai.alert.snippet', "Accepting '{0}' did insert the following text: {1}", suggestion.label, suggestion.insertText);
            aria_1.alert(msg);
        };
        SuggestController.prototype.triggerSuggest = function (onlyFrom) {
            this._model.trigger({ auto: false }, false, onlyFrom);
            this._editor.revealLine(this._editor.getPosition().lineNumber, 0 /* Smooth */);
            this._editor.focus();
        };
        SuggestController.prototype.acceptSelectedSuggestion = function () {
            if (this._widget) {
                var item = this._widget.getFocusedItem();
                this._onDidSelectItem(item);
            }
        };
        SuggestController.prototype.cancelSuggestWidget = function () {
            if (this._widget) {
                this._model.cancel();
                this._widget.hideWidget();
            }
        };
        SuggestController.prototype.selectNextSuggestion = function () {
            if (this._widget) {
                this._widget.selectNext();
            }
        };
        SuggestController.prototype.selectNextPageSuggestion = function () {
            if (this._widget) {
                this._widget.selectNextPage();
            }
        };
        SuggestController.prototype.selectLastSuggestion = function () {
            if (this._widget) {
                this._widget.selectLast();
            }
        };
        SuggestController.prototype.selectPrevSuggestion = function () {
            if (this._widget) {
                this._widget.selectPrevious();
            }
        };
        SuggestController.prototype.selectPrevPageSuggestion = function () {
            if (this._widget) {
                this._widget.selectPreviousPage();
            }
        };
        SuggestController.prototype.selectFirstSuggestion = function () {
            if (this._widget) {
                this._widget.selectFirst();
            }
        };
        SuggestController.prototype.toggleSuggestionDetails = function () {
            if (this._widget) {
                this._widget.toggleDetails();
            }
        };
        SuggestController.prototype.toggleSuggestionFocus = function () {
            if (this._widget) {
                this._widget.toggleDetailsFocus();
            }
        };
        SuggestController.ID = 'editor.contrib.suggestController';
        SuggestController = __decorate([
            __param(1, commands_1.ICommandService),
            __param(2, contextkey_1.IContextKeyService),
            __param(3, instantiation_1.IInstantiationService)
        ], SuggestController);
        return SuggestController;
    }());
    exports.SuggestController = SuggestController;
    var TriggerSuggestAction = /** @class */ (function (_super) {
        __extends(TriggerSuggestAction, _super);
        function TriggerSuggestAction() {
            return _super.call(this, {
                id: TriggerSuggestAction.id,
                label: nls.localize('suggest.trigger.label', "Trigger Suggest"),
                alias: 'Trigger Suggest',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCompletionItemProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
                    primary: 2048 /* CtrlCmd */ | 10 /* Space */,
                    mac: { primary: 256 /* WinCtrl */ | 10 /* Space */ }
                }
            }) || this;
        }
        TriggerSuggestAction.prototype.run = function (accessor, editor) {
            var controller = SuggestController.get(editor);
            if (!controller) {
                return;
            }
            controller.triggerSuggest();
        };
        TriggerSuggestAction.id = 'editor.action.triggerSuggest';
        return TriggerSuggestAction;
    }(editorExtensions_1.EditorAction));
    exports.TriggerSuggestAction = TriggerSuggestAction;
    editorExtensions_1.registerEditorContribution(SuggestController);
    editorExtensions_1.registerEditorAction(TriggerSuggestAction);
    var weight = keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(90);
    var SuggestCommand = editorExtensions_1.EditorCommand.bindToContribution(SuggestController.get);
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'acceptSelectedSuggestion',
        precondition: suggest_1.Context.Visible,
        handler: function (x) { return x.acceptSelectedSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 2 /* Tab */
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'acceptSelectedSuggestionOnEnter',
        precondition: suggest_1.Context.Visible,
        handler: function (x) { return x.acceptSelectedSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textFocus, suggest_1.Context.AcceptSuggestionsOnEnter, suggest_1.Context.MakesTextEdit),
            primary: 3 /* Enter */
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'hideSuggestWidget',
        precondition: suggest_1.Context.Visible,
        handler: function (x) { return x.cancelSuggestWidget(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 9 /* Escape */,
            secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectNextSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectNextSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 18 /* DownArrow */,
            secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */],
            mac: { primary: 18 /* DownArrow */, secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */, 256 /* WinCtrl */ | 44 /* KEY_N */] }
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectNextPageSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectNextPageSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 12 /* PageDown */,
            secondary: [2048 /* CtrlCmd */ | 12 /* PageDown */]
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectLastSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectLastSuggestion(); }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectPrevSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectPrevSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 16 /* UpArrow */,
            secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */],
            mac: { primary: 16 /* UpArrow */, secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */, 256 /* WinCtrl */ | 46 /* KEY_P */] }
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectPrevPageSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectPrevPageSuggestion(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 11 /* PageUp */,
            secondary: [2048 /* CtrlCmd */ | 11 /* PageUp */]
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'selectFirstSuggestion',
        precondition: contextkey_1.ContextKeyExpr.and(suggest_1.Context.Visible, suggest_1.Context.MultipleSuggestions),
        handler: function (c) { return c.selectFirstSuggestion(); }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'toggleSuggestionDetails',
        precondition: suggest_1.Context.Visible,
        handler: function (x) { return x.toggleSuggestionDetails(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 2048 /* CtrlCmd */ | 10 /* Space */,
            mac: { primary: 256 /* WinCtrl */ | 10 /* Space */ }
        }
    }));
    editorExtensions_1.registerEditorCommand(new SuggestCommand({
        id: 'toggleSuggestionFocus',
        precondition: suggest_1.Context.Visible,
        handler: function (x) { return x.toggleSuggestionFocus(); },
        kbOpts: {
            weight: weight,
            kbExpr: editorContextKeys_1.EditorContextKeys.textFocus,
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 10 /* Space */,
            mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 10 /* Space */ }
        }
    }));
});
