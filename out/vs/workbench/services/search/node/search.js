/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileMatch = /** @class */ (function () {
        function FileMatch(path) {
            this.path = path;
            this.lineMatches = [];
        }
        FileMatch.prototype.addMatch = function (lineMatch) {
            this.lineMatches.push(lineMatch);
        };
        FileMatch.prototype.serialize = function () {
            var lineMatches = [];
            var numMatches = 0;
            for (var i = 0; i < this.lineMatches.length; i++) {
                numMatches += this.lineMatches[i].offsetAndLengths.length;
                lineMatches.push(this.lineMatches[i].serialize());
            }
            return {
                path: this.path,
                lineMatches: lineMatches,
                numMatches: numMatches
            };
        };
        return FileMatch;
    }());
    exports.FileMatch = FileMatch;
    var LineMatch = /** @class */ (function () {
        function LineMatch(preview, lineNumber) {
            this.preview = preview.replace(/(\r|\n)*$/, '');
            this.lineNumber = lineNumber;
            this.offsetAndLengths = [];
        }
        LineMatch.prototype.addMatch = function (offset, length) {
            this.offsetAndLengths.push([offset, length]);
        };
        LineMatch.prototype.serialize = function () {
            var result = {
                preview: this.preview,
                lineNumber: this.lineNumber,
                offsetAndLengths: this.offsetAndLengths
            };
            return result;
        };
        return LineMatch;
    }());
    exports.LineMatch = LineMatch;
});
