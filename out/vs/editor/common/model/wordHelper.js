define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';
    /**
     * Create a word definition regular expression based on default word separators.
     * Optionally provide allowed separators that should be included in words.
     *
     * The default would look like this:
     * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
     */
    function createWordRegExp(allowInWords) {
        if (allowInWords === void 0) { allowInWords = ''; }
        var source = '(-?\\d*\\.\\d\\w*)|([^';
        for (var i = 0; i < exports.USUAL_WORD_SEPARATORS.length; i++) {
            if (allowInWords.indexOf(exports.USUAL_WORD_SEPARATORS[i]) >= 0) {
                continue;
            }
            source += '\\' + exports.USUAL_WORD_SEPARATORS[i];
        }
        source += '\\s]+)';
        return new RegExp(source, 'g');
    }
    // catches numbers (including floating numbers) in the first group, and alphanum in the second
    exports.DEFAULT_WORD_REGEXP = createWordRegExp();
    function ensureValidWordDefinition(wordDefinition) {
        var result = exports.DEFAULT_WORD_REGEXP;
        if (wordDefinition && (wordDefinition instanceof RegExp)) {
            if (!wordDefinition.global) {
                var flags = 'g';
                if (wordDefinition.ignoreCase) {
                    flags += 'i';
                }
                if (wordDefinition.multiline) {
                    flags += 'm';
                }
                result = new RegExp(wordDefinition.source, flags);
            }
            else {
                result = wordDefinition;
            }
        }
        result.lastIndex = 0;
        return result;
    }
    exports.ensureValidWordDefinition = ensureValidWordDefinition;
    function getWordAtPosFast(column, wordDefinition, text, textOffset) {
        // find whitespace enclosed text around column and match from there
        var pos = column - 1 - textOffset;
        var start = text.lastIndexOf(' ', pos - 1) + 1;
        var end = text.indexOf(' ', pos);
        if (end === -1) {
            end = text.length;
        }
        wordDefinition.lastIndex = start;
        var match;
        while (match = wordDefinition.exec(text)) {
            if (match.index <= pos && wordDefinition.lastIndex >= pos) {
                return {
                    word: match[0],
                    startColumn: textOffset + 1 + match.index,
                    endColumn: textOffset + 1 + wordDefinition.lastIndex
                };
            }
        }
        return null;
    }
    function getWordAtPosSlow(column, wordDefinition, text, textOffset) {
        // matches all words starting at the beginning
        // of the input until it finds a match that encloses
        // the desired column. slow but correct
        var pos = column - 1 - textOffset;
        wordDefinition.lastIndex = 0;
        var match;
        while (match = wordDefinition.exec(text)) {
            if (match.index > pos) {
                // |nW -> matched only after the pos
                return null;
            }
            else if (wordDefinition.lastIndex >= pos) {
                // W|W -> match encloses pos
                return {
                    word: match[0],
                    startColumn: textOffset + 1 + match.index,
                    endColumn: textOffset + 1 + wordDefinition.lastIndex
                };
            }
        }
        return null;
    }
    function getWordAtText(column, wordDefinition, text, textOffset) {
        // if `words` can contain whitespace character we have to use the slow variant
        // otherwise we use the fast variant of finding a word
        wordDefinition.lastIndex = 0;
        var match = wordDefinition.exec(text);
        if (!match) {
            return null;
        }
        // todo@joh the `match` could already be the (first) word
        var ret = match[0].indexOf(' ') >= 0
            // did match a word which contains a space character -> use slow word find
            ? getWordAtPosSlow(column, wordDefinition, text, textOffset)
            // sane word definition -> use fast word find
            : getWordAtPosFast(column, wordDefinition, text, textOffset);
        // both (getWordAtPosFast and getWordAtPosSlow) leave the wordDefinition-RegExp
        // in an undefined state and to not confuse other users of the wordDefinition
        // we reset the lastIndex
        wordDefinition.lastIndex = 0;
        return ret;
    }
    exports.getWordAtText = getWordAtText;
});
