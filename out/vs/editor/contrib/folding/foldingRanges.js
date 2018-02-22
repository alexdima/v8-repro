/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MAX_FOLDING_REGIONS = 0xFFFF;
    exports.MAX_LINE_NUMBER = 0xFFFFFF;
    var MASK_INDENT = 0xFF000000;
    var FoldingRanges = /** @class */ (function () {
        function FoldingRanges(startIndexes, endIndexes) {
            if (startIndexes.length !== endIndexes.length || startIndexes.length > exports.MAX_FOLDING_REGIONS) {
                throw new Error('invalid startIndexes or endIndexes size');
            }
            this._startIndexes = startIndexes;
            this._endIndexes = endIndexes;
            this._collapseStates = new Uint32Array(Math.ceil(startIndexes.length / 32));
        }
        FoldingRanges.prototype.ensureParentIndices = function () {
            var _this = this;
            if (!this._parentsComputed) {
                this._parentsComputed = true;
                var parentIndexes_1 = [];
                var isInsideLast = function (startLineNumber, endLineNumber) {
                    var index = parentIndexes_1[parentIndexes_1.length - 1];
                    return _this.getStartLineNumber(index) <= startLineNumber && _this.getEndLineNumber(index) >= endLineNumber;
                };
                for (var i = 0, len = this._startIndexes.length; i < len; i++) {
                    var startLineNumber = this._startIndexes[i];
                    var endLineNumber = this._endIndexes[i];
                    if (startLineNumber > exports.MAX_LINE_NUMBER || endLineNumber > exports.MAX_LINE_NUMBER) {
                        throw new Error('startLineNumber or endLineNumber must not exceed ' + exports.MAX_LINE_NUMBER);
                    }
                    while (parentIndexes_1.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
                        parentIndexes_1.pop();
                    }
                    var parentIndex = parentIndexes_1.length > 0 ? parentIndexes_1[parentIndexes_1.length - 1] : -1;
                    parentIndexes_1.push(i);
                    this._startIndexes[i] = startLineNumber + ((parentIndex & 0xFF) << 24);
                    this._endIndexes[i] = endLineNumber + ((parentIndex & 0xFF00) << 16);
                }
            }
        };
        Object.defineProperty(FoldingRanges.prototype, "length", {
            get: function () {
                return this._startIndexes.length;
            },
            enumerable: true,
            configurable: true
        });
        FoldingRanges.prototype.getStartLineNumber = function (index) {
            return this._startIndexes[index] & exports.MAX_LINE_NUMBER;
        };
        FoldingRanges.prototype.getEndLineNumber = function (index) {
            return this._endIndexes[index] & exports.MAX_LINE_NUMBER;
        };
        FoldingRanges.prototype.isCollapsed = function (index) {
            var arrayIndex = (index / 32) | 0;
            var bit = index % 32;
            return (this._collapseStates[arrayIndex] & (1 << bit)) !== 0;
        };
        FoldingRanges.prototype.setCollapsed = function (index, newState) {
            var arrayIndex = (index / 32) | 0;
            var bit = index % 32;
            var value = this._collapseStates[arrayIndex];
            if (newState) {
                this._collapseStates[arrayIndex] = value | (1 << bit);
            }
            else {
                this._collapseStates[arrayIndex] = value & ~(1 << bit);
            }
        };
        FoldingRanges.prototype.toRegion = function (index) {
            return new FoldingRegion(this, index);
        };
        FoldingRanges.prototype.getParentIndex = function (index) {
            this.ensureParentIndices();
            var parent = ((this._startIndexes[index] & MASK_INDENT) >>> 24) + ((this._endIndexes[index] & MASK_INDENT) >>> 16);
            if (parent === exports.MAX_FOLDING_REGIONS) {
                return -1;
            }
            return parent;
        };
        FoldingRanges.prototype.contains = function (index, line) {
            return this.getStartLineNumber(index) <= line && this.getEndLineNumber(index) >= line;
        };
        FoldingRanges.prototype.findIndex = function (line) {
            var low = 0, high = this._startIndexes.length;
            if (high === 0) {
                return -1; // no children
            }
            while (low < high) {
                var mid = Math.floor((low + high) / 2);
                if (line < this.getStartLineNumber(mid)) {
                    high = mid;
                }
                else {
                    low = mid + 1;
                }
            }
            return low - 1;
        };
        FoldingRanges.prototype.findRange = function (line) {
            var index = this.findIndex(line);
            if (index >= 0) {
                var endLineNumber = this.getEndLineNumber(index);
                if (endLineNumber >= line) {
                    return index;
                }
                index = this.getParentIndex(index);
                while (index !== -1) {
                    if (this.contains(index, line)) {
                        return index;
                    }
                    index = this.getParentIndex(index);
                }
            }
            return -1;
        };
        return FoldingRanges;
    }());
    exports.FoldingRanges = FoldingRanges;
    var FoldingRegion = /** @class */ (function () {
        function FoldingRegion(ranges, index) {
            this.ranges = ranges;
            this.index = index;
        }
        Object.defineProperty(FoldingRegion.prototype, "startLineNumber", {
            get: function () {
                return this.ranges.getStartLineNumber(this.index);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FoldingRegion.prototype, "endLineNumber", {
            get: function () {
                return this.ranges.getEndLineNumber(this.index);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FoldingRegion.prototype, "regionIndex", {
            get: function () {
                return this.index;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FoldingRegion.prototype, "parentIndex", {
            get: function () {
                return this.ranges.getParentIndex(this.index);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FoldingRegion.prototype, "isCollapsed", {
            get: function () {
                return this.ranges.isCollapsed(this.index);
            },
            enumerable: true,
            configurable: true
        });
        FoldingRegion.prototype.containedBy = function (range) {
            return range.startLineNumber <= this.startLineNumber && range.endLineNumber >= this.endLineNumber;
        };
        FoldingRegion.prototype.containsLine = function (lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber;
        };
        FoldingRegion.prototype.hidesLine = function (lineNumber) {
            return this.startLineNumber < lineNumber && lineNumber <= this.endLineNumber;
        };
        return FoldingRegion;
    }());
    exports.FoldingRegion = FoldingRegion;
});
