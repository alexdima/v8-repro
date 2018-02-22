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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/builder", "vs/base/browser/browser", "vs/base/common/platform", "vs/base/common/types", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/mouseEvent", "vs/base/common/event", "vs/css!./sash"], function (require, exports, lifecycle_1, builder_1, browser_1, platform_1, types, DOM, touch_1, mouseEvent_1, event_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Orientation;
    (function (Orientation) {
        Orientation[Orientation["VERTICAL"] = 0] = "VERTICAL";
        Orientation[Orientation["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(Orientation = exports.Orientation || (exports.Orientation = {}));
    var Sash = /** @class */ (function () {
        function Sash(container, layoutProvider, options) {
            if (options === void 0) { options = {}; }
            var _this = this;
            this._onDidStart = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
            this._onDidReset = new event_1.Emitter();
            this._onDidEnd = new event_1.Emitter();
            this.$e = builder_1.$('.monaco-sash').appendTo(container);
            if (platform_1.isMacintosh) {
                this.$e.addClass('mac');
            }
            this.$e.on(DOM.EventType.MOUSE_DOWN, function (e) { _this.onMouseDown(e); });
            this.$e.on(DOM.EventType.DBLCLICK, function (e) { return _this._onDidReset.fire(); });
            touch_1.Gesture.addTarget(this.$e.getHTMLElement());
            this.$e.on(touch_1.EventType.Start, function (e) { _this.onTouchStart(e); });
            this.size = options.baseSize || 5;
            if (browser_1.isIPad) {
                this.size *= 4; // see also http://ux.stackexchange.com/questions/39023/what-is-the-optimum-button-size-of-touch-screen-applications
                this.$e.addClass('touch');
            }
            this.setOrientation(options.orientation || Orientation.VERTICAL);
            this.isDisabled = false;
            this.hidden = false;
            this.layoutProvider = layoutProvider;
        }
        Object.defineProperty(Sash.prototype, "onDidStart", {
            get: function () {
                return this._onDidStart.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sash.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sash.prototype, "onDidReset", {
            get: function () {
                return this._onDidReset.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sash.prototype, "onDidEnd", {
            get: function () {
                return this._onDidEnd.event;
            },
            enumerable: true,
            configurable: true
        });
        Sash.prototype.setOrientation = function (orientation) {
            this.orientation = orientation;
            this.$e.removeClass('horizontal', 'vertical');
            this.$e.addClass(this.getOrientation());
            if (this.orientation === Orientation.HORIZONTAL) {
                this.$e.size(null, this.size);
            }
            else {
                this.$e.size(this.size);
            }
            if (this.layoutProvider) {
                this.layout();
            }
        };
        Sash.prototype.getOrientation = function () {
            return this.orientation === Orientation.HORIZONTAL ? 'horizontal' : 'vertical';
        };
        Sash.prototype.onMouseDown = function (e) {
            var _this = this;
            DOM.EventHelper.stop(e, false);
            if (this.isDisabled) {
                return;
            }
            var iframes = builder_1.$(DOM.getElementsByTagName('iframe'));
            if (iframes) {
                iframes.style('pointer-events', 'none'); // disable mouse events on iframes as long as we drag the sash
            }
            var mouseDownEvent = new mouseEvent_1.StandardMouseEvent(e);
            var startX = mouseDownEvent.posx;
            var startY = mouseDownEvent.posy;
            var startEvent = {
                startX: startX,
                currentX: startX,
                startY: startY,
                currentY: startY
            };
            this.$e.addClass('active');
            this._onDidStart.fire(startEvent);
            var $window = builder_1.$(window);
            var containerCSSClass = this.getOrientation() + "-cursor-container" + (platform_1.isMacintosh ? '-mac' : '');
            $window.on('mousemove', function (e) {
                DOM.EventHelper.stop(e, false);
                var mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                var event = {
                    startX: startX,
                    currentX: mouseMoveEvent.posx,
                    startY: startY,
                    currentY: mouseMoveEvent.posy
                };
                _this._onDidChange.fire(event);
            }).once('mouseup', function (e) {
                DOM.EventHelper.stop(e, false);
                _this.$e.removeClass('active');
                _this._onDidEnd.fire();
                $window.off('mousemove');
                document.body.classList.remove(containerCSSClass);
                var iframes = builder_1.$(DOM.getElementsByTagName('iframe'));
                if (iframes) {
                    iframes.style('pointer-events', 'auto');
                }
            });
            document.body.classList.add(containerCSSClass);
        };
        Sash.prototype.onTouchStart = function (event) {
            var _this = this;
            DOM.EventHelper.stop(event);
            var listeners = [];
            var startX = event.pageX;
            var startY = event.pageY;
            this._onDidStart.fire({
                startX: startX,
                currentX: startX,
                startY: startY,
                currentY: startY
            });
            listeners.push(DOM.addDisposableListener(this.$e.getHTMLElement(), touch_1.EventType.Change, function (event) {
                if (types.isNumber(event.pageX) && types.isNumber(event.pageY)) {
                    _this._onDidChange.fire({
                        startX: startX,
                        currentX: event.pageX,
                        startY: startY,
                        currentY: event.pageY
                    });
                }
            }));
            listeners.push(DOM.addDisposableListener(this.$e.getHTMLElement(), touch_1.EventType.End, function (event) {
                _this._onDidEnd.fire();
                lifecycle_1.dispose(listeners);
            }));
        };
        Sash.prototype.layout = function () {
            var style;
            if (this.orientation === Orientation.VERTICAL) {
                var verticalProvider = this.layoutProvider;
                style = { left: verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px' };
                if (verticalProvider.getVerticalSashTop) {
                    style.top = verticalProvider.getVerticalSashTop(this) + 'px';
                }
                if (verticalProvider.getVerticalSashHeight) {
                    style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
                }
            }
            else {
                var horizontalProvider = this.layoutProvider;
                style = { top: horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px' };
                if (horizontalProvider.getHorizontalSashLeft) {
                    style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';
                }
                if (horizontalProvider.getHorizontalSashWidth) {
                    style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
                }
            }
            this.$e.style(style);
        };
        Sash.prototype.show = function () {
            this.hidden = false;
            this.$e.show();
        };
        Sash.prototype.hide = function () {
            this.hidden = true;
            this.$e.hide();
        };
        Sash.prototype.isHidden = function () {
            return this.hidden;
        };
        Sash.prototype.enable = function () {
            this.$e.removeClass('disabled');
            this.isDisabled = false;
        };
        Sash.prototype.disable = function () {
            this.$e.addClass('disabled');
            this.isDisabled = true;
        };
        Object.defineProperty(Sash.prototype, "enabled", {
            get: function () {
                return !this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        Sash.prototype.dispose = function () {
            if (this.$e) {
                this.$e.destroy();
                this.$e = null;
            }
        };
        return Sash;
    }());
    exports.Sash = Sash;
    /**
     * A simple Vertical Sash that computes the position of the sash when it is moved between the given dimension.
     * Triggers onPositionChange event when the position is changed
     */
    var VSash = /** @class */ (function (_super) {
        __extends(VSash, _super);
        function VSash(container, minWidth) {
            var _this = _super.call(this) || this;
            _this.minWidth = minWidth;
            _this._onPositionChange = new event_1.Emitter();
            _this.ratio = 0.5;
            _this.sash = new Sash(container, _this);
            _this._register(_this.sash.onDidStart(function () { return _this.onSashDragStart(); }));
            _this._register(_this.sash.onDidChange(function (e) { return _this.onSashDrag(e); }));
            _this._register(_this.sash.onDidEnd(function () { return _this.onSashDragEnd(); }));
            _this._register(_this.sash.onDidReset(function () { return _this.onSashReset(); }));
            return _this;
        }
        Object.defineProperty(VSash.prototype, "onPositionChange", {
            get: function () { return this._onPositionChange.event; },
            enumerable: true,
            configurable: true
        });
        VSash.prototype.getVerticalSashTop = function () {
            return 0;
        };
        VSash.prototype.getVerticalSashLeft = function () {
            return this.position;
        };
        VSash.prototype.getVerticalSashHeight = function () {
            return this.dimension.height;
        };
        VSash.prototype.setDimenesion = function (dimension) {
            this.dimension = dimension;
            this.compute(this.ratio);
        };
        VSash.prototype.onSashDragStart = function () {
            this.startPosition = this.position;
        };
        VSash.prototype.onSashDrag = function (e) {
            this.compute((this.startPosition + (e.currentX - e.startX)) / this.dimension.width);
        };
        VSash.prototype.compute = function (ratio) {
            this.computeSashPosition(ratio);
            this.ratio = this.position / this.dimension.width;
            this._onPositionChange.fire(this.position);
        };
        VSash.prototype.onSashDragEnd = function () {
            this.sash.layout();
        };
        VSash.prototype.onSashReset = function () {
            this.compute(0.5);
            this._onPositionChange.fire(this.position);
            this.sash.layout();
        };
        VSash.prototype.computeSashPosition = function (sashRatio) {
            if (sashRatio === void 0) { sashRatio = this.ratio; }
            var contentWidth = this.dimension.width;
            var sashPosition = Math.floor((sashRatio || 0.5) * contentWidth);
            var midPoint = Math.floor(0.5 * contentWidth);
            if (contentWidth > this.minWidth * 2) {
                if (sashPosition < this.minWidth) {
                    sashPosition = this.minWidth;
                }
                if (sashPosition > contentWidth - this.minWidth) {
                    sashPosition = contentWidth - this.minWidth;
                }
            }
            else {
                sashPosition = midPoint;
            }
            if (this.position !== sashPosition) {
                this.position = sashPosition;
                this.sash.layout();
            }
        };
        return VSash;
    }(lifecycle_1.Disposable));
    exports.VSash = VSash;
});
