define(["require", "exports"], function (require, exports) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Viewport = /** @class */ (function () {
        function Viewport(top, left, width, height) {
            this.top = top | 0;
            this.left = left | 0;
            this.width = width | 0;
            this.height = height | 0;
        }
        return Viewport;
    }());
    exports.Viewport = Viewport;
    var MinimapLinesRenderingData = /** @class */ (function () {
        function MinimapLinesRenderingData(tabSize, data) {
            this.tabSize = tabSize;
            this.data = data;
        }
        return MinimapLinesRenderingData;
    }());
    exports.MinimapLinesRenderingData = MinimapLinesRenderingData;
    var ViewLineData = /** @class */ (function () {
        function ViewLineData(content, minColumn, maxColumn, tokens) {
            this.content = content;
            this.minColumn = minColumn;
            this.maxColumn = maxColumn;
            this.tokens = tokens;
        }
        return ViewLineData;
    }());
    exports.ViewLineData = ViewLineData;
    var ViewLineRenderingData = /** @class */ (function () {
        function ViewLineRenderingData(minColumn, maxColumn, content, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize) {
            this.minColumn = minColumn;
            this.maxColumn = maxColumn;
            this.content = content;
            this.mightContainRTL = mightContainRTL;
            this.mightContainNonBasicASCII = mightContainNonBasicASCII;
            this.tokens = tokens;
            this.inlineDecorations = inlineDecorations;
            this.tabSize = tabSize;
        }
        return ViewLineRenderingData;
    }());
    exports.ViewLineRenderingData = ViewLineRenderingData;
    var InlineDecorationType;
    (function (InlineDecorationType) {
        InlineDecorationType[InlineDecorationType["Regular"] = 0] = "Regular";
        InlineDecorationType[InlineDecorationType["Before"] = 1] = "Before";
        InlineDecorationType[InlineDecorationType["After"] = 2] = "After";
    })(InlineDecorationType = exports.InlineDecorationType || (exports.InlineDecorationType = {}));
    var InlineDecoration = /** @class */ (function () {
        function InlineDecoration(range, inlineClassName, type) {
            this.range = range;
            this.inlineClassName = inlineClassName;
            this.type = type;
        }
        return InlineDecoration;
    }());
    exports.InlineDecoration = InlineDecoration;
    var ViewModelDecoration = /** @class */ (function () {
        function ViewModelDecoration(range, options) {
            this.range = range;
            this.options = options;
        }
        return ViewModelDecoration;
    }());
    exports.ViewModelDecoration = ViewModelDecoration;
    var ViewEventsCollector = /** @class */ (function () {
        function ViewEventsCollector() {
            this._eventsLen = 0;
            this._events = [];
            this._eventsLen = 0;
        }
        ViewEventsCollector.prototype.emit = function (event) {
            this._events[this._eventsLen++] = event;
        };
        ViewEventsCollector.prototype.finalize = function () {
            var result = this._events;
            this._events = null;
            return result;
        };
        return ViewEventsCollector;
    }());
    exports.ViewEventsCollector = ViewEventsCollector;
});
