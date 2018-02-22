/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/htmlContentRenderer", "vs/platform/opener/common/opener", "vs/editor/common/services/modeService", "vs/base/common/uri", "vs/base/common/errors", "vs/editor/common/modes/textToHtmlTokenizer", "vs/platform/instantiation/common/instantiation", "vs/base/common/event"], function (require, exports, htmlContentRenderer_1, opener_1, modeService_1, uri_1, errors_1, textToHtmlTokenizer_1, instantiation_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MarkdownRenderer = /** @class */ (function () {
        function MarkdownRenderer(editor, _modeService, _openerService) {
            if (_openerService === void 0) { _openerService = opener_1.NullOpenerService; }
            var _this = this;
            this._modeService = _modeService;
            this._openerService = _openerService;
            this._onDidRenderCodeBlock = new event_1.Emitter();
            this.onDidRenderCodeBlock = this._onDidRenderCodeBlock.event;
            this._options = {
                actionCallback: function (content) {
                    _this._openerService.open(uri_1.default.parse(content)).then(void 0, errors_1.onUnexpectedError);
                },
                codeBlockRenderer: function (languageAlias, value) {
                    // In markdown,
                    // it is possible that we stumble upon language aliases (e.g.js instead of javascript)
                    // it is possible no alias is given in which case we fall back to the current editor lang
                    var modeId = languageAlias
                        ? _this._modeService.getModeIdForLanguageName(languageAlias)
                        : editor.getModel().getLanguageIdentifier().language;
                    return _this._modeService.getOrCreateMode(modeId).then(function (_) {
                        return textToHtmlTokenizer_1.tokenizeToString(value, modeId);
                    }).then(function (code) {
                        return "<span style=\"font-family: " + editor.getConfiguration().fontInfo.fontFamily + "\">" + code + "</span>";
                    });
                },
                codeBlockRenderCallback: function () { return _this._onDidRenderCodeBlock.fire(); }
            };
        }
        MarkdownRenderer.prototype.render = function (markdown, options) {
            if (!markdown) {
                return document.createElement('span');
            }
            if (options) {
                return htmlContentRenderer_1.renderMarkdown(markdown, __assign({}, options, this._options));
            }
            else {
                return htmlContentRenderer_1.renderMarkdown(markdown, this._options);
            }
        };
        MarkdownRenderer = __decorate([
            __param(1, modeService_1.IModeService),
            __param(2, instantiation_1.optional(opener_1.IOpenerService))
        ], MarkdownRenderer);
        return MarkdownRenderer;
    }());
    exports.MarkdownRenderer = MarkdownRenderer;
});
