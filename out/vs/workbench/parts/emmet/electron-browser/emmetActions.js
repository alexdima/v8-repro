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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/workbench/services/textMate/electron-browser/TMGrammars", "vs/editor/common/services/modeService", "vs/platform/extensions/common/extensions", "vs/platform/commands/common/commands"], function (require, exports, editorExtensions_1, TMGrammars_1, modeService_1, extensions_1, commands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GrammarContributions = /** @class */ (function () {
        function GrammarContributions(contributions) {
            if (GrammarContributions._grammars === null) {
                this.fillModeScopeMap(contributions);
            }
        }
        GrammarContributions.prototype.fillModeScopeMap = function (contributions) {
            GrammarContributions._grammars = {};
            contributions.forEach(function (contribution) {
                contribution.value.forEach(function (grammar) {
                    if (grammar.language && grammar.scopeName) {
                        GrammarContributions._grammars[grammar.language] = grammar.scopeName;
                    }
                });
            });
        };
        GrammarContributions.prototype.getGrammar = function (mode) {
            return GrammarContributions._grammars[mode];
        };
        GrammarContributions._grammars = null;
        return GrammarContributions;
    }());
    var EmmetEditorAction = /** @class */ (function (_super) {
        __extends(EmmetEditorAction, _super);
        function EmmetEditorAction(opts) {
            var _this = _super.call(this, opts) || this;
            _this._lastGrammarContributions = null;
            _this._lastExtensionService = null;
            _this.emmetActionName = opts.actionName;
            return _this;
        }
        EmmetEditorAction.prototype._withGrammarContributions = function (extensionService) {
            if (this._lastExtensionService !== extensionService) {
                this._lastExtensionService = extensionService;
                this._lastGrammarContributions = extensionService.readExtensionPointContributions(TMGrammars_1.grammarsExtPoint).then(function (contributions) {
                    return new GrammarContributions(contributions);
                });
            }
            return this._lastGrammarContributions;
        };
        EmmetEditorAction.prototype.run = function (accessor, editor) {
            var _this = this;
            var extensionService = accessor.get(extensions_1.IExtensionService);
            var modeService = accessor.get(modeService_1.IModeService);
            var commandService = accessor.get(commands_1.ICommandService);
            return this._withGrammarContributions(extensionService).then(function (grammarContributions) {
                if (_this.id === 'editor.emmet.action.expandAbbreviation') {
                    return commandService.executeCommand('emmet.expandAbbreviation', EmmetEditorAction.getLanguage(modeService, editor, grammarContributions));
                }
                return undefined;
            });
        };
        EmmetEditorAction.getLanguage = function (languageIdentifierResolver, editor, grammars) {
            var _this = this;
            var position = editor.getSelection().getStartPosition();
            editor.getModel().tokenizeIfCheap(position.lineNumber);
            var languageId = editor.getModel().getLanguageIdAtPosition(position.lineNumber, position.column);
            var language = languageIdentifierResolver.getLanguageIdentifier(languageId).language;
            var syntax = language.split('.').pop();
            var checkParentMode = function () {
                var languageGrammar = grammars.getGrammar(syntax);
                if (!languageGrammar) {
                    return syntax;
                }
                var languages = languageGrammar.split('.');
                if (languages.length < 2) {
                    return syntax;
                }
                for (var i = 1; i < languages.length; i++) {
                    var language_1 = languages[languages.length - i];
                    if (_this.emmetSupportedModes.indexOf(language_1) !== -1) {
                        return language_1;
                    }
                }
                return syntax;
            };
            return {
                language: syntax,
                parentMode: checkParentMode()
            };
        };
        EmmetEditorAction.emmetSupportedModes = ['html', 'css', 'xml', 'xsl', 'haml', 'jade', 'jsx', 'slim', 'scss', 'sass', 'less', 'stylus', 'styl', 'svg'];
        return EmmetEditorAction;
    }(editorExtensions_1.EditorAction));
    exports.EmmetEditorAction = EmmetEditorAction;
});
