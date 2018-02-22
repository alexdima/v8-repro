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
define(["require", "exports", "assert", "vs/base/common/scrollable"], function (require, exports, assert, scrollable_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestSmoothScrollingOperation = /** @class */ (function (_super) {
        __extends(TestSmoothScrollingOperation, _super);
        function TestSmoothScrollingOperation(from, to, viewportSize, startTime, duration) {
            var _this = this;
            duration = duration + 10;
            startTime = startTime - 10;
            _this = _super.call(this, { scrollLeft: 0, scrollTop: from, width: 0, height: viewportSize }, { scrollLeft: 0, scrollTop: to, width: 0, height: viewportSize }, startTime, duration) || this;
            return _this;
        }
        TestSmoothScrollingOperation.prototype.testTick = function (now) {
            return this._tick(now);
        };
        return TestSmoothScrollingOperation;
    }(scrollable_1.SmoothScrollingOperation));
    suite('SmoothScrollingOperation', function () {
        var VIEWPORT_HEIGHT = 800;
        var ANIMATION_DURATION = 125;
        var LINE_HEIGHT = 20;
        function extractLines(scrollable, now) {
            var scrollTop = scrollable.testTick(now).scrollTop;
            var scrollBottom = scrollTop + VIEWPORT_HEIGHT;
            var startLineNumber = Math.floor(scrollTop / LINE_HEIGHT);
            var endLineNumber = Math.ceil(scrollBottom / LINE_HEIGHT);
            return [startLineNumber, endLineNumber];
        }
        function simulateSmoothScroll(from, to) {
            var scrollable = new TestSmoothScrollingOperation(from, to, VIEWPORT_HEIGHT, 0, ANIMATION_DURATION);
            var result = [], resultLen = 0;
            result[resultLen++] = extractLines(scrollable, 0);
            result[resultLen++] = extractLines(scrollable, 25);
            result[resultLen++] = extractLines(scrollable, 50);
            result[resultLen++] = extractLines(scrollable, 75);
            result[resultLen++] = extractLines(scrollable, 100);
            result[resultLen++] = extractLines(scrollable, 125);
            return result;
        }
        function assertSmoothScroll(from, to, expected) {
            var actual = simulateSmoothScroll(from, to);
            assert.deepEqual(actual, expected);
        }
        test('scroll 25 lines (40 fit)', function () {
            assertSmoothScroll(0, 500, [
                [5, 46],
                [14, 55],
                [20, 61],
                [23, 64],
                [24, 65],
                [25, 65],
            ]);
        });
        test('scroll 75 lines (40 fit)', function () {
            assertSmoothScroll(0, 1500, [
                [15, 56],
                [44, 85],
                [62, 103],
                [71, 112],
                [74, 115],
                [75, 115],
            ]);
        });
        test('scroll 100 lines (40 fit)', function () {
            assertSmoothScroll(0, 2000, [
                [20, 61],
                [59, 100],
                [82, 123],
                [94, 135],
                [99, 140],
                [100, 140],
            ]);
        });
        test('scroll 125 lines (40 fit)', function () {
            assertSmoothScroll(0, 2500, [
                [16, 57],
                [29, 70],
                [107, 148],
                [119, 160],
                [124, 165],
                [125, 165],
            ]);
        });
        test('scroll 500 lines (40 fit)', function () {
            assertSmoothScroll(0, 10000, [
                [16, 57],
                [29, 70],
                [482, 523],
                [494, 535],
                [499, 540],
                [500, 540],
            ]);
        });
    });
});
