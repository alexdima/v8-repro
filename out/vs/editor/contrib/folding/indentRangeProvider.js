/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/contrib/folding/foldingRanges", "vs/editor/common/model/textModel"], function (require, exports, foldingRanges_1, textModel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MAX_FOLDING_REGIONS_FOR_INDENT_LIMIT = 5000;
    // public only for testing
    var RangesCollector = /** @class */ (function () {
        function RangesCollector(FoldingRangesLimit) {
            this._startIndexes = [];
            this._endIndexes = [];
            this._indentOccurrences = [];
            this._length = 0;
            this._FoldingRangesLimit = FoldingRangesLimit;
        }
        RangesCollector.prototype.insertFirst = function (startLineNumber, endLineNumber, indent) {
            if (startLineNumber > foldingRanges_1.MAX_LINE_NUMBER || endLineNumber > foldingRanges_1.MAX_LINE_NUMBER) {
                return;
            }
            var index = this._length;
            this._startIndexes[index] = startLineNumber;
            this._endIndexes[index] = endLineNumber;
            this._length++;
            if (indent < 1000) {
                this._indentOccurrences[indent] = (this._indentOccurrences[indent] || 0) + 1;
            }
        };
        RangesCollector.prototype.toIndentRanges = function (model) {
            if (this._length <= this._FoldingRangesLimit) {
                // reverse and create arrays of the exact length
                var startIndexes = new Uint32Array(this._length);
                var endIndexes = new Uint32Array(this._length);
                for (var i = this._length - 1, k = 0; i >= 0; i--, k++) {
                    startIndexes[k] = this._startIndexes[i];
                    endIndexes[k] = this._endIndexes[i];
                }
                return new foldingRanges_1.FoldingRanges(startIndexes, endIndexes);
            }
            else {
                var entries = 0;
                var maxIndent = this._indentOccurrences.length;
                for (var i = 0; i < this._indentOccurrences.length; i++) {
                    var n = this._indentOccurrences[i];
                    if (n) {
                        if (n + entries > this._FoldingRangesLimit) {
                            maxIndent = i;
                            break;
                        }
                        entries += n;
                    }
                }
                var tabSize = model.getOptions().tabSize;
                // reverse and create arrays of the exact length
                var startIndexes = new Uint32Array(entries);
                var endIndexes = new Uint32Array(entries);
                for (var i = this._length - 1, k = 0; i >= 0; i--) {
                    var startIndex = this._startIndexes[i];
                    var lineContent = model.getLineContent(startIndex);
                    var indent = textModel_1.TextModel.computeIndentLevel(lineContent, tabSize);
                    if (indent < maxIndent) {
                        startIndexes[k] = startIndex;
                        endIndexes[k] = this._endIndexes[i];
                        k++;
                    }
                }
                return new foldingRanges_1.FoldingRanges(startIndexes, endIndexes);
            }
        };
        return RangesCollector;
    }());
    exports.RangesCollector = RangesCollector;
    function computeRanges(model, offSide, markers, FoldingRangesLimit) {
        if (FoldingRangesLimit === void 0) { FoldingRangesLimit = MAX_FOLDING_REGIONS_FOR_INDENT_LIMIT; }
        var tabSize = model.getOptions().tabSize;
        var result = new RangesCollector(FoldingRangesLimit);
        var pattern = void 0;
        if (markers) {
            pattern = new RegExp("(" + markers.start.source + ")|(?:" + markers.end.source + ")");
        }
        var previousRegions = [];
        previousRegions.push({ indent: -1, line: model.getLineCount() + 1, marker: false }); // sentinel, to make sure there's at least one entry
        for (var line = model.getLineCount(); line > 0; line--) {
            var lineContent = model.getLineContent(line);
            var indent = textModel_1.TextModel.computeIndentLevel(lineContent, tabSize);
            var previous = previousRegions[previousRegions.length - 1];
            if (indent === -1) {
                if (offSide && !previous.marker) {
                    // for offSide languages, empty lines are associated to the next block
                    previous.line = line;
                }
                continue; // only whitespace
            }
            var m = void 0;
            if (pattern && (m = lineContent.match(pattern))) {
                // folding pattern match
                if (m[1]) {
                    // discard all regions until the folding pattern
                    var i = previousRegions.length - 1;
                    while (i > 0 && !previousRegions[i].marker) {
                        i--;
                    }
                    if (i > 0) {
                        previousRegions.length = i + 1;
                        previous = previousRegions[i];
                        // new folding range from pattern, includes the end line
                        result.insertFirst(line, previous.line, indent);
                        previous.marker = false;
                        previous.indent = indent;
                        previous.line = line;
                        continue;
                    }
                    else {
                        // no end marker found, treat line as a regular line
                    }
                }
                else {
                    previousRegions.push({ indent: -2, line: line, marker: true });
                    continue;
                }
            }
            if (previous.indent > indent) {
                // discard all regions with larger indent
                do {
                    previousRegions.pop();
                    previous = previousRegions[previousRegions.length - 1];
                } while (previous.indent > indent);
                // new folding range
                var endLineNumber = previous.line - 1;
                if (endLineNumber - line >= 1) {
                    result.insertFirst(line, endLineNumber, indent);
                }
            }
            if (previous.indent === indent) {
                previous.line = line;
            }
            else {
                // new region with a bigger indent
                previousRegions.push({ indent: indent, line: line, marker: false });
            }
        }
        return result.toIndentRanges(model);
    }
    exports.computeRanges = computeRanges;
});
