/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/parts/snippets/electron-browser/snippets.contribution", "vs/workbench/parts/snippets/electron-browser/snippetsService", "vs/platform/registry/common/platform", "vs/base/common/strings", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/snippetController2", "vs/editor/contrib/suggest/suggest", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/editorContextKeys", "vs/platform/configuration/common/configuration"], function (require, exports, nls_1, contextkey_1, keybindingsRegistry_1, snippets_contribution_1, snippetsService_1, platform_1, strings_1, lifecycle_1, range_1, editorExtensions_1, snippetController2_1, suggest_1, configurationRegistry_1, editorContextKeys_1, configuration_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TabCompletionController = /** @class */ (function () {
        function TabCompletionController(_editor, _snippetService, _configurationService, contextKeyService) {
            var _this = this;
            this._editor = _editor;
            this._snippetService = _snippetService;
            this._configurationService = _configurationService;
            this._activeSnippets = [];
            this._hasSnippets = TabCompletionController.ContextKey.bindTo(contextKeyService);
            this._configListener = this._configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('editor.tabCompletion')) {
                    _this._update();
                }
            });
            this._update();
        }
        TabCompletionController.get = function (editor) {
            return editor.getContribution(TabCompletionController.ID);
        };
        TabCompletionController.prototype.getId = function () {
            return TabCompletionController.ID;
        };
        TabCompletionController.prototype.dispose = function () {
            lifecycle_1.dispose(this._configListener);
            lifecycle_1.dispose(this._selectionListener);
        };
        TabCompletionController.prototype._update = function () {
            var _this = this;
            var enabled = this._configurationService.getValue('editor.tabCompletion');
            if (!enabled) {
                lifecycle_1.dispose(this._selectionListener);
            }
            else {
                this._selectionListener = this._editor.onDidChangeCursorSelection(function (e) { return _this._updateSnippets(); });
                if (this._editor.getModel()) {
                    this._updateSnippets();
                }
            }
        };
        TabCompletionController.prototype._updateSnippets = function () {
            // reset first
            this._activeSnippets = [];
            // lots of dance for getting the
            var selection = this._editor.getSelection();
            var model = this._editor.getModel();
            model.tokenizeIfCheap(selection.positionLineNumber);
            var id = model.getLanguageIdAtPosition(selection.positionLineNumber, selection.positionColumn);
            var snippets = this._snippetService.getSnippetsSync(id);
            if (!snippets) {
                // nothing for this language
                this._hasSnippets.set(false);
                return;
            }
            if (range_1.Range.isEmpty(selection)) {
                // empty selection -> real text (no whitespace) left of cursor
                var prefix = snippetsService_1.getNonWhitespacePrefix(model, selection.getPosition());
                if (prefix) {
                    for (var _i = 0, snippets_1 = snippets; _i < snippets_1.length; _i++) {
                        var snippet = snippets_1[_i];
                        if (strings_1.endsWith(prefix, snippet.prefix)) {
                            this._activeSnippets.push(snippet);
                        }
                    }
                }
            }
            else if (!range_1.Range.spansMultipleLines(selection) && model.getValueLengthInRange(selection) <= 100) {
                // actual selection -> snippet must be a full match
                var selected = model.getValueInRange(selection);
                if (selected) {
                    for (var _a = 0, snippets_2 = snippets; _a < snippets_2.length; _a++) {
                        var snippet = snippets_2[_a];
                        if (selected === snippet.prefix) {
                            this._activeSnippets.push(snippet);
                        }
                    }
                }
            }
            this._hasSnippets.set(this._activeSnippets.length > 0);
        };
        TabCompletionController.prototype.performSnippetCompletions = function () {
            if (this._activeSnippets.length === 1) {
                // one -> just insert
                var snippet = this._activeSnippets[0];
                snippetController2_1.SnippetController2.get(this._editor).insert(snippet.codeSnippet, snippet.prefix.length, 0);
            }
            else if (this._activeSnippets.length > 1) {
                // two or more -> show IntelliSense box
                suggest_1.showSimpleSuggestions(this._editor, this._activeSnippets.map(function (snippet) { return new snippetsService_1.SnippetSuggestion(snippet, snippet.prefix.length); }));
            }
        };
        TabCompletionController.ID = 'editor.tabCompletionController';
        TabCompletionController.ContextKey = new contextkey_1.RawContextKey('hasSnippetCompletions', undefined);
        TabCompletionController = __decorate([
            __param(1, snippets_contribution_1.ISnippetsService),
            __param(2, configuration_1.IConfigurationService),
            __param(3, contextkey_1.IContextKeyService)
        ], TabCompletionController);
        return TabCompletionController;
    }());
    exports.TabCompletionController = TabCompletionController;
    editorExtensions_1.registerEditorContribution(TabCompletionController);
    var TabCompletionCommand = editorExtensions_1.EditorCommand.bindToContribution(TabCompletionController.get);
    editorExtensions_1.registerEditorCommand(new TabCompletionCommand({
        id: 'insertSnippet',
        precondition: TabCompletionController.ContextKey,
        handler: function (x) { return x.performSnippetCompletions(); },
        kbOpts: {
            weight: keybindingsRegistry_1.KeybindingsRegistry.WEIGHT.editorContrib(),
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, snippetController2_1.SnippetController2.InSnippetMode.toNegated()),
            primary: 2 /* Tab */
        }
    }));
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'editor',
        order: 5,
        type: 'object',
        properties: {
            'editor.tabCompletion': {
                'type': 'boolean',
                'default': false,
                'description': nls_1.localize('tabCompletion', "Insert snippets when their prefix matches. Works best when 'quickSuggestions' aren't enabled.")
            },
        }
    });
});
