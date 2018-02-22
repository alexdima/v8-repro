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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/browser/editorBrowser", "vs/workbench/services/textMate/electron-browser/textMateService", "vs/editor/common/services/modeService", "vs/editor/common/modes", "vs/workbench/services/textMate/electron-browser/TMHelper", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/color", "vs/platform/message/common/message", "vs/base/common/severity", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/css!./inspectTMScopes"], function (require, exports, nls, dom, lifecycle_1, strings_1, editorExtensions_1, editorBrowser_1, textMateService_1, modeService_1, modes_1, TMHelper_1, workbenchThemeService_1, color_1, message_1, severity_1, themeService_1, colorRegistry_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var InspectTMScopesController = /** @class */ (function (_super) {
        __extends(InspectTMScopesController, _super);
        function InspectTMScopesController(editor, textMateService, modeService, themeService, messageService) {
            var _this = _super.call(this) || this;
            _this._editor = editor;
            _this._textMateService = textMateService;
            _this._themeService = themeService;
            _this._modeService = modeService;
            _this._messageService = messageService;
            _this._widget = null;
            _this._register(_this._editor.onDidChangeModel(function (e) { return _this.stop(); }));
            _this._register(_this._editor.onDidChangeModelLanguage(function (e) { return _this.stop(); }));
            _this._register(_this._editor.onKeyUp(function (e) { return e.keyCode === 9 /* Escape */ && _this.stop(); }));
            return _this;
        }
        InspectTMScopesController.get = function (editor) {
            return editor.getContribution(InspectTMScopesController.ID);
        };
        InspectTMScopesController.prototype.getId = function () {
            return InspectTMScopesController.ID;
        };
        InspectTMScopesController.prototype.dispose = function () {
            this.stop();
            _super.prototype.dispose.call(this);
        };
        InspectTMScopesController.prototype.launch = function () {
            if (this._widget) {
                return;
            }
            if (!this._editor.getModel()) {
                return;
            }
            this._widget = new InspectTMScopesWidget(this._editor, this._textMateService, this._modeService, this._themeService, this._messageService);
        };
        InspectTMScopesController.prototype.stop = function () {
            if (this._widget) {
                this._widget.dispose();
                this._widget = null;
            }
        };
        InspectTMScopesController.prototype.toggle = function () {
            if (!this._widget) {
                this.launch();
            }
            else {
                this.stop();
            }
        };
        InspectTMScopesController.ID = 'editor.contrib.inspectTMScopes';
        InspectTMScopesController = __decorate([
            __param(1, textMateService_1.ITextMateService),
            __param(2, modeService_1.IModeService),
            __param(3, workbenchThemeService_1.IWorkbenchThemeService),
            __param(4, message_1.IMessageService)
        ], InspectTMScopesController);
        return InspectTMScopesController;
    }(lifecycle_1.Disposable));
    var InspectTMScopes = /** @class */ (function (_super) {
        __extends(InspectTMScopes, _super);
        function InspectTMScopes() {
            return _super.call(this, {
                id: 'editor.action.inspectTMScopes',
                label: nls.localize('inspectTMScopes', "Developer: Inspect TM Scopes"),
                alias: 'Developer: Inspect TM Scopes',
                precondition: null
            }) || this;
        }
        InspectTMScopes.prototype.run = function (accessor, editor) {
            var controller = InspectTMScopesController.get(editor);
            if (controller) {
                controller.toggle();
            }
        };
        return InspectTMScopes;
    }(editorExtensions_1.EditorAction));
    function renderTokenText(tokenText) {
        if (tokenText.length > 40) {
            tokenText = tokenText.substr(0, 20) + '…' + tokenText.substr(tokenText.length - 20);
        }
        var result = '';
        for (var charIndex = 0, len = tokenText.length; charIndex < len; charIndex++) {
            var charCode = tokenText.charCodeAt(charIndex);
            switch (charCode) {
                case 9 /* Tab */:
                    result += '&rarr;';
                    break;
                case 32 /* Space */:
                    result += '&middot;';
                    break;
                case 60 /* LessThan */:
                    result += '&lt;';
                    break;
                case 62 /* GreaterThan */:
                    result += '&gt;';
                    break;
                case 38 /* Ampersand */:
                    result += '&amp;';
                    break;
                default:
                    result += String.fromCharCode(charCode);
            }
        }
        return result;
    }
    var InspectTMScopesWidget = /** @class */ (function (_super) {
        __extends(InspectTMScopesWidget, _super);
        function InspectTMScopesWidget(editor, textMateService, modeService, themeService, messageService) {
            var _this = _super.call(this) || this;
            // Editor.IContentWidget.allowEditorOverflow
            _this.allowEditorOverflow = true;
            _this._isDisposed = false;
            _this._editor = editor;
            _this._modeService = modeService;
            _this._themeService = themeService;
            _this._messageService = messageService;
            _this._model = _this._editor.getModel();
            _this._domNode = document.createElement('div');
            _this._domNode.className = 'tm-inspect-widget';
            _this._grammar = textMateService.createGrammar(_this._model.getLanguageIdentifier().language);
            _this._beginCompute(_this._editor.getPosition());
            _this._register(_this._editor.onDidChangeCursorPosition(function (e) { return _this._beginCompute(_this._editor.getPosition()); }));
            _this._editor.addContentWidget(_this);
            return _this;
        }
        InspectTMScopesWidget.prototype.dispose = function () {
            this._isDisposed = true;
            this._editor.removeContentWidget(this);
            _super.prototype.dispose.call(this);
        };
        InspectTMScopesWidget.prototype.getId = function () {
            return InspectTMScopesWidget._ID;
        };
        InspectTMScopesWidget.prototype._beginCompute = function (position) {
            var _this = this;
            dom.clearNode(this._domNode);
            this._domNode.appendChild(document.createTextNode(nls.localize('inspectTMScopesWidget.loading', "Loading...")));
            this._grammar.then(function (grammar) { return _this._compute(grammar, position); }, function (err) {
                _this._messageService.show(severity_1.default.Warning, err);
                setTimeout(function () {
                    InspectTMScopesController.get(_this._editor).stop();
                });
            });
        };
        InspectTMScopesWidget.prototype._compute = function (grammar, position) {
            if (this._isDisposed) {
                return;
            }
            var data = this._getTokensAtLine(grammar, position.lineNumber);
            var token1Index = 0;
            for (var i = data.tokens1.length - 1; i >= 0; i--) {
                var t = data.tokens1[i];
                if (position.column - 1 >= t.startIndex) {
                    token1Index = i;
                    break;
                }
            }
            var token2Index = 0;
            for (var i = (data.tokens2.length >>> 1); i >= 0; i--) {
                if (position.column - 1 >= data.tokens2[(i << 1)]) {
                    token2Index = i;
                    break;
                }
            }
            var result = '';
            var tokenStartIndex = data.tokens1[token1Index].startIndex;
            var tokenEndIndex = data.tokens1[token1Index].endIndex;
            var tokenText = this._model.getLineContent(position.lineNumber).substring(tokenStartIndex, tokenEndIndex);
            result += "<h2 class=\"tm-token\">" + renderTokenText(tokenText) + "<span class=\"tm-token-length\">(" + tokenText.length + " " + (tokenText.length === 1 ? 'char' : 'chars') + ")</span></h2>";
            result += "<hr class=\"tm-metadata-separator\" style=\"clear:both\"/>";
            var metadata = this._decodeMetadata(data.tokens2[(token2Index << 1) + 1]);
            result += "<table class=\"tm-metadata-table\"><tbody>";
            result += "<tr><td class=\"tm-metadata-key\">language</td><td class=\"tm-metadata-value\">" + strings_1.escape(metadata.languageIdentifier.language) + "</td>";
            result += "<tr><td class=\"tm-metadata-key\">token type</td><td class=\"tm-metadata-value\">" + this._tokenTypeToString(metadata.tokenType) + "</td>";
            result += "<tr><td class=\"tm-metadata-key\">font style</td><td class=\"tm-metadata-value\">" + this._fontStyleToString(metadata.fontStyle) + "</td>";
            result += "<tr><td class=\"tm-metadata-key\">foreground</td><td class=\"tm-metadata-value\">" + color_1.Color.Format.CSS.formatHexA(metadata.foreground) + "</td>";
            result += "<tr><td class=\"tm-metadata-key\">background</td><td class=\"tm-metadata-value\">" + color_1.Color.Format.CSS.formatHexA(metadata.background) + "</td>";
            result += "</tbody></table>";
            var theme = this._themeService.getColorTheme();
            result += "<hr class=\"tm-metadata-separator\"/>";
            var matchingRule = TMHelper_1.findMatchingThemeRule(theme, data.tokens1[token1Index].scopes, false);
            if (matchingRule) {
                result += "<code class=\"tm-theme-selector\">" + matchingRule.rawSelector + "\n" + JSON.stringify(matchingRule.settings, null, '\t') + "</code>";
            }
            else {
                result += "<span class=\"tm-theme-selector\">No theme selector.</span>";
            }
            result += "<hr class=\"tm-metadata-separator\"/>";
            result += "<ul>";
            for (var i = data.tokens1[token1Index].scopes.length - 1; i >= 0; i--) {
                result += "<li>" + strings_1.escape(data.tokens1[token1Index].scopes[i]) + "</li>";
            }
            result += "</ul>";
            this._domNode.innerHTML = result;
            this._editor.layoutContentWidget(this);
        };
        InspectTMScopesWidget.prototype._decodeMetadata = function (metadata) {
            var colorMap = modes_1.TokenizationRegistry.getColorMap();
            var languageId = modes_1.TokenMetadata.getLanguageId(metadata);
            var tokenType = modes_1.TokenMetadata.getTokenType(metadata);
            var fontStyle = modes_1.TokenMetadata.getFontStyle(metadata);
            var foreground = modes_1.TokenMetadata.getForeground(metadata);
            var background = modes_1.TokenMetadata.getBackground(metadata);
            return {
                languageIdentifier: this._modeService.getLanguageIdentifier(languageId),
                tokenType: tokenType,
                fontStyle: fontStyle,
                foreground: colorMap[foreground],
                background: colorMap[background]
            };
        };
        InspectTMScopesWidget.prototype._tokenTypeToString = function (tokenType) {
            switch (tokenType) {
                case 0 /* Other */: return 'Other';
                case 1 /* Comment */: return 'Comment';
                case 2 /* String */: return 'String';
                case 4 /* RegEx */: return 'RegEx';
            }
            return '??';
        };
        InspectTMScopesWidget.prototype._fontStyleToString = function (fontStyle) {
            var r = '';
            if (fontStyle & 1 /* Italic */) {
                r += 'italic ';
            }
            if (fontStyle & 2 /* Bold */) {
                r += 'bold ';
            }
            if (fontStyle & 4 /* Underline */) {
                r += 'underline ';
            }
            if (r.length === 0) {
                r = '---';
            }
            return r;
        };
        InspectTMScopesWidget.prototype._getTokensAtLine = function (grammar, lineNumber) {
            var stateBeforeLine = this._getStateBeforeLine(grammar, lineNumber);
            var tokenizationResult1 = grammar.tokenizeLine(this._model.getLineContent(lineNumber), stateBeforeLine);
            var tokenizationResult2 = grammar.tokenizeLine2(this._model.getLineContent(lineNumber), stateBeforeLine);
            return {
                startState: stateBeforeLine,
                tokens1: tokenizationResult1.tokens,
                tokens2: tokenizationResult2.tokens,
                endState: tokenizationResult1.ruleStack
            };
        };
        InspectTMScopesWidget.prototype._getStateBeforeLine = function (grammar, lineNumber) {
            var state = null;
            for (var i = 1; i < lineNumber; i++) {
                var tokenizationResult = grammar.tokenizeLine(this._model.getLineContent(i), state);
                state = tokenizationResult.ruleStack;
            }
            return state;
        };
        InspectTMScopesWidget.prototype.getDomNode = function () {
            return this._domNode;
        };
        InspectTMScopesWidget.prototype.getPosition = function () {
            return {
                position: this._editor.getPosition(),
                preference: [editorBrowser_1.ContentWidgetPositionPreference.BELOW, editorBrowser_1.ContentWidgetPositionPreference.ABOVE]
            };
        };
        InspectTMScopesWidget._ID = 'editor.contrib.inspectTMScopesWidget';
        return InspectTMScopesWidget;
    }(lifecycle_1.Disposable));
    editorExtensions_1.registerEditorContribution(InspectTMScopesController);
    editorExtensions_1.registerEditorAction(InspectTMScopes);
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var border = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (border) {
            var borderWidth = theme.type === themeService_1.HIGH_CONTRAST ? 2 : 1;
            collector.addRule(".monaco-editor .tm-inspect-widget { border: " + borderWidth + "px solid " + border + "; }");
            collector.addRule(".monaco-editor .tm-inspect-widget .tm-metadata-separator { background-color: " + border + "; }");
        }
        var background = theme.getColor(colorRegistry_1.editorHoverBackground);
        if (background) {
            collector.addRule(".monaco-editor .tm-inspect-widget { background-color: " + background + "; }");
        }
    });
});
