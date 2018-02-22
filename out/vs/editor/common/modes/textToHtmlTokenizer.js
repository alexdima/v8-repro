define(["require", "exports", "vs/base/common/strings", "vs/editor/common/modes", "vs/editor/common/modes/nullMode", "vs/editor/common/core/lineTokens"], function (require, exports, strings, modes_1, nullMode_1, lineTokens_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function tokenizeToString(text, languageId) {
        return _tokenizeToString(text, _getSafeTokenizationSupport(languageId));
    }
    exports.tokenizeToString = tokenizeToString;
    function tokenizeLineToHTML(text, viewLineTokens, colorMap, startOffset, endOffset, tabSize) {
        var result = "<div>";
        var charIndex = startOffset;
        var tabsCharDelta = 0;
        for (var tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
            var tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
            if (tokenEndIndex <= startOffset) {
                continue;
            }
            var partContent = '';
            for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
                var charCode = text.charCodeAt(charIndex);
                switch (charCode) {
                    case 9 /* Tab */:
                        var insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                        tabsCharDelta += insertSpacesCount - 1;
                        while (insertSpacesCount > 0) {
                            partContent += '&nbsp;';
                            insertSpacesCount--;
                        }
                        break;
                    case 60 /* LessThan */:
                        partContent += '&lt;';
                        break;
                    case 62 /* GreaterThan */:
                        partContent += '&gt;';
                        break;
                    case 38 /* Ampersand */:
                        partContent += '&amp;';
                        break;
                    case 0 /* Null */:
                        partContent += '&#00;';
                        break;
                    case 65279 /* UTF8_BOM */:
                    case 8232 /* LINE_SEPARATOR_2028 */:
                        partContent += '\ufffd';
                        break;
                    case 13 /* CarriageReturn */:
                        // zero width space, because carriage return would introduce a line break
                        partContent += '&#8203';
                        break;
                    default:
                        partContent += String.fromCharCode(charCode);
                }
            }
            result += "<span style=\"" + viewLineTokens.getInlineStyle(tokenIndex, colorMap) + "\">" + partContent + "</span>";
            if (tokenEndIndex > endOffset || charIndex >= endOffset) {
                break;
            }
        }
        result += "</div>";
        return result;
    }
    exports.tokenizeLineToHTML = tokenizeLineToHTML;
    function _getSafeTokenizationSupport(languageId) {
        var tokenizationSupport = modes_1.TokenizationRegistry.get(languageId);
        if (tokenizationSupport) {
            return tokenizationSupport;
        }
        return {
            getInitialState: function () { return nullMode_1.NULL_STATE; },
            tokenize: undefined,
            tokenize2: function (buffer, state, deltaOffset) { return nullMode_1.nullTokenize2(0 /* Null */, buffer, state, deltaOffset); }
        };
    }
    function _tokenizeToString(text, tokenizationSupport) {
        var result = "<div class=\"monaco-tokenized-source\">";
        var lines = text.split(/\r\n|\r|\n/);
        var currentState = tokenizationSupport.getInitialState();
        for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i];
            if (i > 0) {
                result += "<br/>";
            }
            var tokenizationResult = tokenizationSupport.tokenize2(line, currentState, 0);
            lineTokens_1.LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
            var lineTokens = new lineTokens_1.LineTokens(tokenizationResult.tokens, line);
            var viewLineTokens = lineTokens.inflate();
            var startOffset = 0;
            for (var j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
                var type = viewLineTokens.getClassName(j);
                var endIndex = viewLineTokens.getEndOffset(j);
                result += "<span class=\"" + type + "\">" + strings.escape(line.substring(startOffset, endIndex)) + "</span>";
                startOffset = endIndex;
            }
            currentState = tokenizationResult.endState;
        }
        result += "</div>";
        return result;
    }
});
