/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/editor/common/view/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/platform", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/core/position", "vs/css!./lineNumbers"], function (require, exports, editorColorRegistry_1, themeService_1, platform, dynamicViewOverlay_1, position_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LineNumbersOverlay = /** @class */ (function (_super) {
        __extends(LineNumbersOverlay, _super);
        function LineNumbersOverlay(context) {
            var _this = _super.call(this) || this;
            _this._context = context;
            _this._readConfig();
            _this._lastCursorModelPosition = new position_1.Position(1, 1);
            _this._renderResult = null;
            _this._context.addEventHandler(_this);
            return _this;
        }
        LineNumbersOverlay.prototype._readConfig = function () {
            var config = this._context.configuration.editor;
            this._lineHeight = config.lineHeight;
            this._renderLineNumbers = config.viewInfo.renderLineNumbers;
            this._renderCustomLineNumbers = config.viewInfo.renderCustomLineNumbers;
            this._lineNumbersLeft = config.layoutInfo.lineNumbersLeft;
            this._lineNumbersWidth = config.layoutInfo.lineNumbersWidth;
        };
        LineNumbersOverlay.prototype.dispose = function () {
            this._context.removeEventHandler(this);
            this._context = null;
            this._renderResult = null;
            _super.prototype.dispose.call(this);
        };
        // --- begin event handlers
        LineNumbersOverlay.prototype.onConfigurationChanged = function (e) {
            this._readConfig();
            return true;
        };
        LineNumbersOverlay.prototype.onCursorStateChanged = function (e) {
            var primaryViewPosition = e.selections[0].getPosition();
            this._lastCursorModelPosition = this._context.model.coordinatesConverter.convertViewPositionToModelPosition(primaryViewPosition);
            if (this._renderLineNumbers === 2 /* Relative */ || this._renderLineNumbers === 3 /* Interval */) {
                return true;
            }
            return false;
        };
        LineNumbersOverlay.prototype.onFlushed = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onLinesChanged = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onLinesDeleted = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onLinesInserted = function (e) {
            return true;
        };
        LineNumbersOverlay.prototype.onScrollChanged = function (e) {
            return e.scrollTopChanged;
        };
        LineNumbersOverlay.prototype.onZonesChanged = function (e) {
            return true;
        };
        // --- end event handlers
        LineNumbersOverlay.prototype._getLineRenderLineNumber = function (viewLineNumber) {
            var modelPosition = this._context.model.coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(viewLineNumber, 1));
            if (modelPosition.column !== 1) {
                return '';
            }
            var modelLineNumber = modelPosition.lineNumber;
            if (this._renderCustomLineNumbers) {
                return this._renderCustomLineNumbers(modelLineNumber);
            }
            if (this._renderLineNumbers === 2 /* Relative */) {
                var diff = Math.abs(this._lastCursorModelPosition.lineNumber - modelLineNumber);
                if (diff === 0) {
                    return '<span class="relative-current-line-number">' + modelLineNumber + '</span>';
                }
                return String(diff);
            }
            if (this._renderLineNumbers === 3 /* Interval */) {
                if (this._lastCursorModelPosition.lineNumber === modelLineNumber) {
                    return String(modelLineNumber);
                }
                if (modelLineNumber % 10 === 0) {
                    return String(modelLineNumber);
                }
                return '';
            }
            return String(modelLineNumber);
        };
        LineNumbersOverlay.prototype.prepareRender = function (ctx) {
            if (this._renderLineNumbers === 0 /* Off */) {
                this._renderResult = null;
                return;
            }
            var lineHeightClassName = (platform.isLinux ? (this._lineHeight % 2 === 0 ? ' lh-even' : ' lh-odd') : '');
            var visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            var visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            var common = '<div class="' + LineNumbersOverlay.CLASS_NAME + lineHeightClassName + '" style="left:' + this._lineNumbersLeft.toString() + 'px;width:' + this._lineNumbersWidth.toString() + 'px;">';
            var output = [];
            for (var lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                var lineIndex = lineNumber - visibleStartLineNumber;
                var renderLineNumber = this._getLineRenderLineNumber(lineNumber);
                if (renderLineNumber) {
                    output[lineIndex] = (common
                        + renderLineNumber
                        + '</div>');
                }
                else {
                    output[lineIndex] = '';
                }
            }
            this._renderResult = output;
        };
        LineNumbersOverlay.prototype.render = function (startLineNumber, lineNumber) {
            if (!this._renderResult) {
                return '';
            }
            var lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                return '';
            }
            return this._renderResult[lineIndex];
        };
        LineNumbersOverlay.CLASS_NAME = 'line-numbers';
        return LineNumbersOverlay;
    }(dynamicViewOverlay_1.DynamicViewOverlay));
    exports.LineNumbersOverlay = LineNumbersOverlay;
    // theming
    themeService_1.registerThemingParticipant(function (theme, collector) {
        var lineNumbers = theme.getColor(editorColorRegistry_1.editorLineNumbers);
        if (lineNumbers) {
            collector.addRule(".monaco-editor .line-numbers { color: " + lineNumbers + "; }");
        }
    });
});
