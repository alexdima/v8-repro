define(["require", "exports", "vs/editor/common/modes"], function (require, exports, modes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A token on a line.
     */
    var ViewLineToken = /** @class */ (function () {
        function ViewLineToken(endIndex, metadata) {
            this.endIndex = endIndex;
            this._metadata = metadata;
        }
        ViewLineToken.prototype.getForeground = function () {
            return modes_1.TokenMetadata.getForeground(this._metadata);
        };
        ViewLineToken.prototype.getType = function () {
            return modes_1.TokenMetadata.getClassNameFromMetadata(this._metadata);
        };
        ViewLineToken.prototype.getInlineStyle = function (colorMap) {
            return modes_1.TokenMetadata.getInlineStyleFromMetadata(this._metadata, colorMap);
        };
        ViewLineToken._equals = function (a, b) {
            return (a.endIndex === b.endIndex
                && a._metadata === b._metadata);
        };
        ViewLineToken.equalsArr = function (a, b) {
            var aLen = a.length;
            var bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (var i = 0; i < aLen; i++) {
                if (!this._equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        };
        return ViewLineToken;
    }());
    exports.ViewLineToken = ViewLineToken;
    var ViewLineTokens = /** @class */ (function () {
        function ViewLineTokens(actual) {
            this._actual = actual;
        }
        ViewLineTokens.prototype.equals = function (other) {
            if (other instanceof ViewLineTokens) {
                return ViewLineToken.equalsArr(this._actual, other._actual);
            }
            return false;
        };
        ViewLineTokens.prototype.getCount = function () {
            return this._actual.length;
        };
        ViewLineTokens.prototype.getForeground = function (tokenIndex) {
            return this._actual[tokenIndex].getForeground();
        };
        ViewLineTokens.prototype.getEndOffset = function (tokenIndex) {
            return this._actual[tokenIndex].endIndex;
        };
        ViewLineTokens.prototype.getClassName = function (tokenIndex) {
            return this._actual[tokenIndex].getType();
        };
        ViewLineTokens.prototype.getInlineStyle = function (tokenIndex, colorMap) {
            return this._actual[tokenIndex].getInlineStyle(colorMap);
        };
        return ViewLineTokens;
    }());
    exports.ViewLineTokens = ViewLineTokens;
    var ViewLineTokenFactory = /** @class */ (function () {
        function ViewLineTokenFactory() {
        }
        ViewLineTokenFactory.inflateArr = function (tokens) {
            var tokensCount = (tokens.length >>> 1);
            var result = new Array(tokensCount);
            for (var i = 0; i < tokensCount; i++) {
                var endOffset = tokens[i << 1];
                var metadata = tokens[(i << 1) + 1];
                result[i] = new ViewLineToken(endOffset, metadata);
            }
            return result;
        };
        return ViewLineTokenFactory;
    }());
    exports.ViewLineTokenFactory = ViewLineTokenFactory;
});
