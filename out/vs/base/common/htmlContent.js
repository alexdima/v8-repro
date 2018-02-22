/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays"], function (require, exports, arrays_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MarkdownString = /** @class */ (function () {
        function MarkdownString(value) {
            if (value === void 0) { value = ''; }
            this.value = value;
        }
        MarkdownString.prototype.appendText = function (value) {
            // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
            this.value += value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
            return this;
        };
        MarkdownString.prototype.appendMarkdown = function (value) {
            this.value += value;
            return this;
        };
        MarkdownString.prototype.appendCodeblock = function (langId, code) {
            this.value += '\n```';
            this.value += langId;
            this.value += '\n';
            this.value += code;
            this.value += '\n```\n';
            return this;
        };
        return MarkdownString;
    }());
    exports.MarkdownString = MarkdownString;
    function isEmptyMarkdownString(oneOrMany) {
        if (isMarkdownString(oneOrMany)) {
            return !oneOrMany.value;
        }
        else if (Array.isArray(oneOrMany)) {
            return oneOrMany.every(isEmptyMarkdownString);
        }
        else {
            return true;
        }
    }
    exports.isEmptyMarkdownString = isEmptyMarkdownString;
    function isMarkdownString(thing) {
        if (thing instanceof MarkdownString) {
            return true;
        }
        else if (thing && typeof thing === 'object') {
            return typeof thing.value === 'string'
                && (typeof thing.isTrusted === 'boolean' || thing.isTrusted === void 0);
        }
        return false;
    }
    exports.isMarkdownString = isMarkdownString;
    function markedStringsEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        else if (Array.isArray(a) && Array.isArray(b)) {
            return arrays_1.equals(a, b, markdownStringEqual);
        }
        else if (isMarkdownString(a) && isMarkdownString(b)) {
            return markdownStringEqual(a, b);
        }
        else {
            return false;
        }
    }
    exports.markedStringsEquals = markedStringsEquals;
    function markdownStringEqual(a, b) {
        if (a === b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        else {
            return a.value === b.value && a.isTrusted === b.isTrusted;
        }
    }
    function removeMarkdownEscapes(text) {
        if (!text) {
            return text;
        }
        return text.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1');
    }
    exports.removeMarkdownEscapes = removeMarkdownEscapes;
});
