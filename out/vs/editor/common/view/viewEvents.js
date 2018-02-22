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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, errors, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewEventType;
    (function (ViewEventType) {
        ViewEventType[ViewEventType["ViewConfigurationChanged"] = 1] = "ViewConfigurationChanged";
        ViewEventType[ViewEventType["ViewCursorStateChanged"] = 2] = "ViewCursorStateChanged";
        ViewEventType[ViewEventType["ViewDecorationsChanged"] = 3] = "ViewDecorationsChanged";
        ViewEventType[ViewEventType["ViewFlushed"] = 4] = "ViewFlushed";
        ViewEventType[ViewEventType["ViewFocusChanged"] = 5] = "ViewFocusChanged";
        ViewEventType[ViewEventType["ViewLineMappingChanged"] = 6] = "ViewLineMappingChanged";
        ViewEventType[ViewEventType["ViewLinesChanged"] = 7] = "ViewLinesChanged";
        ViewEventType[ViewEventType["ViewLinesDeleted"] = 8] = "ViewLinesDeleted";
        ViewEventType[ViewEventType["ViewLinesInserted"] = 9] = "ViewLinesInserted";
        ViewEventType[ViewEventType["ViewRevealRangeRequest"] = 10] = "ViewRevealRangeRequest";
        ViewEventType[ViewEventType["ViewScrollChanged"] = 11] = "ViewScrollChanged";
        ViewEventType[ViewEventType["ViewTokensChanged"] = 12] = "ViewTokensChanged";
        ViewEventType[ViewEventType["ViewTokensColorsChanged"] = 13] = "ViewTokensColorsChanged";
        ViewEventType[ViewEventType["ViewZonesChanged"] = 14] = "ViewZonesChanged";
        ViewEventType[ViewEventType["ViewThemeChanged"] = 15] = "ViewThemeChanged";
        ViewEventType[ViewEventType["ViewLanguageConfigurationChanged"] = 16] = "ViewLanguageConfigurationChanged";
    })(ViewEventType = exports.ViewEventType || (exports.ViewEventType = {}));
    var ViewConfigurationChangedEvent = /** @class */ (function () {
        function ViewConfigurationChangedEvent(source) {
            this.type = 1 /* ViewConfigurationChanged */;
            this.canUseLayerHinting = source.canUseLayerHinting;
            this.pixelRatio = source.pixelRatio;
            this.editorClassName = source.editorClassName;
            this.lineHeight = source.lineHeight;
            this.readOnly = source.readOnly;
            this.accessibilitySupport = source.accessibilitySupport;
            this.emptySelectionClipboard = source.emptySelectionClipboard;
            this.layoutInfo = source.layoutInfo;
            this.fontInfo = source.fontInfo;
            this.viewInfo = source.viewInfo;
            this.wrappingInfo = source.wrappingInfo;
        }
        return ViewConfigurationChangedEvent;
    }());
    exports.ViewConfigurationChangedEvent = ViewConfigurationChangedEvent;
    var ViewCursorStateChangedEvent = /** @class */ (function () {
        function ViewCursorStateChangedEvent(selections) {
            this.type = 2 /* ViewCursorStateChanged */;
            this.selections = selections;
        }
        return ViewCursorStateChangedEvent;
    }());
    exports.ViewCursorStateChangedEvent = ViewCursorStateChangedEvent;
    var ViewDecorationsChangedEvent = /** @class */ (function () {
        function ViewDecorationsChangedEvent() {
            this.type = 3 /* ViewDecorationsChanged */;
            // Nothing to do
        }
        return ViewDecorationsChangedEvent;
    }());
    exports.ViewDecorationsChangedEvent = ViewDecorationsChangedEvent;
    var ViewFlushedEvent = /** @class */ (function () {
        function ViewFlushedEvent() {
            this.type = 4 /* ViewFlushed */;
            // Nothing to do
        }
        return ViewFlushedEvent;
    }());
    exports.ViewFlushedEvent = ViewFlushedEvent;
    var ViewFocusChangedEvent = /** @class */ (function () {
        function ViewFocusChangedEvent(isFocused) {
            this.type = 5 /* ViewFocusChanged */;
            this.isFocused = isFocused;
        }
        return ViewFocusChangedEvent;
    }());
    exports.ViewFocusChangedEvent = ViewFocusChangedEvent;
    var ViewLineMappingChangedEvent = /** @class */ (function () {
        function ViewLineMappingChangedEvent() {
            this.type = 6 /* ViewLineMappingChanged */;
            // Nothing to do
        }
        return ViewLineMappingChangedEvent;
    }());
    exports.ViewLineMappingChangedEvent = ViewLineMappingChangedEvent;
    var ViewLinesChangedEvent = /** @class */ (function () {
        function ViewLinesChangedEvent(fromLineNumber, toLineNumber) {
            this.type = 7 /* ViewLinesChanged */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
        return ViewLinesChangedEvent;
    }());
    exports.ViewLinesChangedEvent = ViewLinesChangedEvent;
    var ViewLinesDeletedEvent = /** @class */ (function () {
        function ViewLinesDeletedEvent(fromLineNumber, toLineNumber) {
            this.type = 8 /* ViewLinesDeleted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
        return ViewLinesDeletedEvent;
    }());
    exports.ViewLinesDeletedEvent = ViewLinesDeletedEvent;
    var ViewLinesInsertedEvent = /** @class */ (function () {
        function ViewLinesInsertedEvent(fromLineNumber, toLineNumber) {
            this.type = 9 /* ViewLinesInserted */;
            this.fromLineNumber = fromLineNumber;
            this.toLineNumber = toLineNumber;
        }
        return ViewLinesInsertedEvent;
    }());
    exports.ViewLinesInsertedEvent = ViewLinesInsertedEvent;
    var VerticalRevealType;
    (function (VerticalRevealType) {
        VerticalRevealType[VerticalRevealType["Simple"] = 0] = "Simple";
        VerticalRevealType[VerticalRevealType["Center"] = 1] = "Center";
        VerticalRevealType[VerticalRevealType["CenterIfOutsideViewport"] = 2] = "CenterIfOutsideViewport";
        VerticalRevealType[VerticalRevealType["Top"] = 3] = "Top";
        VerticalRevealType[VerticalRevealType["Bottom"] = 4] = "Bottom";
    })(VerticalRevealType = exports.VerticalRevealType || (exports.VerticalRevealType = {}));
    var ViewRevealRangeRequestEvent = /** @class */ (function () {
        function ViewRevealRangeRequestEvent(range, verticalType, revealHorizontal, scrollType) {
            this.type = 10 /* ViewRevealRangeRequest */;
            this.range = range;
            this.verticalType = verticalType;
            this.revealHorizontal = revealHorizontal;
            this.scrollType = scrollType;
        }
        return ViewRevealRangeRequestEvent;
    }());
    exports.ViewRevealRangeRequestEvent = ViewRevealRangeRequestEvent;
    var ViewScrollChangedEvent = /** @class */ (function () {
        function ViewScrollChangedEvent(source) {
            this.type = 11 /* ViewScrollChanged */;
            this.scrollWidth = source.scrollWidth;
            this.scrollLeft = source.scrollLeft;
            this.scrollHeight = source.scrollHeight;
            this.scrollTop = source.scrollTop;
            this.scrollWidthChanged = source.scrollWidthChanged;
            this.scrollLeftChanged = source.scrollLeftChanged;
            this.scrollHeightChanged = source.scrollHeightChanged;
            this.scrollTopChanged = source.scrollTopChanged;
        }
        return ViewScrollChangedEvent;
    }());
    exports.ViewScrollChangedEvent = ViewScrollChangedEvent;
    var ViewTokensChangedEvent = /** @class */ (function () {
        function ViewTokensChangedEvent(ranges) {
            this.type = 12 /* ViewTokensChanged */;
            this.ranges = ranges;
        }
        return ViewTokensChangedEvent;
    }());
    exports.ViewTokensChangedEvent = ViewTokensChangedEvent;
    var ViewThemeChangedEvent = /** @class */ (function () {
        function ViewThemeChangedEvent() {
            this.type = 15 /* ViewThemeChanged */;
        }
        return ViewThemeChangedEvent;
    }());
    exports.ViewThemeChangedEvent = ViewThemeChangedEvent;
    var ViewTokensColorsChangedEvent = /** @class */ (function () {
        function ViewTokensColorsChangedEvent() {
            this.type = 13 /* ViewTokensColorsChanged */;
            // Nothing to do
        }
        return ViewTokensColorsChangedEvent;
    }());
    exports.ViewTokensColorsChangedEvent = ViewTokensColorsChangedEvent;
    var ViewZonesChangedEvent = /** @class */ (function () {
        function ViewZonesChangedEvent() {
            this.type = 14 /* ViewZonesChanged */;
            // Nothing to do
        }
        return ViewZonesChangedEvent;
    }());
    exports.ViewZonesChangedEvent = ViewZonesChangedEvent;
    var ViewLanguageConfigurationEvent = /** @class */ (function () {
        function ViewLanguageConfigurationEvent() {
            this.type = 16 /* ViewLanguageConfigurationChanged */;
        }
        return ViewLanguageConfigurationEvent;
    }());
    exports.ViewLanguageConfigurationEvent = ViewLanguageConfigurationEvent;
    var ViewEventEmitter = /** @class */ (function (_super) {
        __extends(ViewEventEmitter, _super);
        function ViewEventEmitter() {
            var _this = _super.call(this) || this;
            _this._listeners = [];
            return _this;
        }
        ViewEventEmitter.prototype.dispose = function () {
            this._listeners = [];
            _super.prototype.dispose.call(this);
        };
        ViewEventEmitter.prototype._emit = function (events) {
            var listeners = this._listeners.slice(0);
            for (var i = 0, len = listeners.length; i < len; i++) {
                safeInvokeListener(listeners[i], events);
            }
        };
        ViewEventEmitter.prototype.addEventListener = function (listener) {
            var _this = this;
            this._listeners.push(listener);
            return {
                dispose: function () {
                    var listeners = _this._listeners;
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        if (listeners[i] === listener) {
                            listeners.splice(i, 1);
                            break;
                        }
                    }
                }
            };
        };
        return ViewEventEmitter;
    }(lifecycle_1.Disposable));
    exports.ViewEventEmitter = ViewEventEmitter;
    function safeInvokeListener(listener, events) {
        try {
            listener(events);
        }
        catch (e) {
            errors.onUnexpectedError(e);
        }
    }
});
