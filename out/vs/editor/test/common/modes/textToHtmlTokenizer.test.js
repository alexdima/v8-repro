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
define(["require", "exports", "assert", "vs/editor/common/modes", "vs/editor/common/modes/textToHtmlTokenizer", "vs/editor/test/common/mocks/mockMode", "vs/editor/common/core/token", "vs/editor/test/common/core/viewLineToken"], function (require, exports, assert, modes_1, textToHtmlTokenizer_1, mockMode_1, token_1, viewLineToken_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor Modes - textToHtmlTokenizer', function () {
        function toStr(pieces) {
            var resultArr = pieces.map(function (t) { return "<span class=\"" + t.className + "\">" + t.text + "</span>"; });
            return resultArr.join('');
        }
        test('TextToHtmlTokenizer 1', function () {
            var mode = new Mode();
            var actual = textToHtmlTokenizer_1.tokenizeToString('.abc..def...gh', mode.getId());
            var expected = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            var expectedStr = "<div class=\"monaco-tokenized-source\">" + toStr(expected) + "</div>";
            assert.equal(actual, expectedStr);
            mode.dispose();
        });
        test('TextToHtmlTokenizer 2', function () {
            var mode = new Mode();
            var actual = textToHtmlTokenizer_1.tokenizeToString('.abc..def...gh\n.abc..def...gh', mode.getId());
            var expected1 = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            var expected2 = [
                { className: 'mtk7', text: '.' },
                { className: 'mtk9', text: 'abc' },
                { className: 'mtk7', text: '..' },
                { className: 'mtk9', text: 'def' },
                { className: 'mtk7', text: '...' },
                { className: 'mtk9', text: 'gh' },
            ];
            var expectedStr1 = toStr(expected1);
            var expectedStr2 = toStr(expected2);
            var expectedStr = "<div class=\"monaco-tokenized-source\">" + expectedStr1 + "<br/>" + expectedStr2 + "</div>";
            assert.equal(actual, expectedStr);
            mode.dispose();
        });
        test('tokenizeLineToHTML', function () {
            var text = 'Ciao hello world!';
            var lineTokens = new viewLineToken_1.ViewLineTokens([
                new viewLineToken_1.ViewLineToken(4, ((3 << 14 /* FOREGROUND_OFFSET */)
                    | ((2 /* Bold */ | 1 /* Italic */) << 11 /* FONT_STYLE_OFFSET */)) >>> 0),
                new viewLineToken_1.ViewLineToken(5, ((1 << 14 /* FOREGROUND_OFFSET */)) >>> 0),
                new viewLineToken_1.ViewLineToken(10, ((4 << 14 /* FOREGROUND_OFFSET */)) >>> 0),
                new viewLineToken_1.ViewLineToken(11, ((1 << 14 /* FOREGROUND_OFFSET */)) >>> 0),
                new viewLineToken_1.ViewLineToken(17, ((5 << 14 /* FOREGROUND_OFFSET */)
                    | ((4 /* Underline */) << 11 /* FONT_STYLE_OFFSET */)) >>> 0)
            ]);
            var colorMap = [null, '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 0, 17, 4), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 0, 12, 4), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #0000ff;text-decoration: underline;">w</span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 0, 11, 4), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 1, 11, 4), [
                '<div>',
                '<span style="color: #ff0000;font-style: italic;font-weight: bold;">iao</span>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 4, 11, 4), [
                '<div>',
                '<span style="color: #000000;"> </span>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 5, 11, 4), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '<span style="color: #000000;"> </span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 5, 10, 4), [
                '<div>',
                '<span style="color: #00ff00;">hello</span>',
                '</div>'
            ].join(''));
            assert.equal(textToHtmlTokenizer_1.tokenizeLineToHTML(text, lineTokens, colorMap, 6, 9, 4), [
                '<div>',
                '<span style="color: #00ff00;">ell</span>',
                '</div>'
            ].join(''));
        });
    });
    var Mode = /** @class */ (function (_super) {
        __extends(Mode, _super);
        function Mode() {
            var _this = _super.call(this, Mode._id) || this;
            _this._register(modes_1.TokenizationRegistry.register(_this.getId(), {
                getInitialState: function () { return null; },
                tokenize: undefined,
                tokenize2: function (line, state) {
                    var tokensArr = [];
                    var prevColor = -1;
                    for (var i = 0; i < line.length; i++) {
                        var colorId = line.charAt(i) === '.' ? 7 : 9;
                        if (prevColor !== colorId) {
                            tokensArr.push(i);
                            tokensArr.push((colorId << 14 /* FOREGROUND_OFFSET */) >>> 0);
                        }
                        prevColor = colorId;
                    }
                    var tokens = new Uint32Array(tokensArr.length);
                    for (var i = 0; i < tokens.length; i++) {
                        tokens[i] = tokensArr[i];
                    }
                    return new token_1.TokenizationResult2(tokens, null);
                }
            }));
            return _this;
        }
        Mode._id = new modes_1.LanguageIdentifier('textToHtmlTokenizerMode', 3);
        return Mode;
    }(mockMode_1.MockMode));
});
