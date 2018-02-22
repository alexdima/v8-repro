/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/objects", "vs/base/common/lifecycle", "vs/base/browser/touch", "vs/base/browser/dom", "vs/base/common/event", "vs/base/browser/event", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/scrollable", "./rangeMap", "./rowCache", "vs/base/common/platform", "vs/base/browser/browser", "vs/base/common/decorators", "vs/base/browser/mouseEvent"], function (require, exports, objects_1, lifecycle_1, touch_1, DOM, event_1, event_2, scrollableElement_1, scrollable_1, rangeMap_1, rowCache_1, platform_1, browser, decorators_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function canUseTranslate3d() {
        if (browser.isFirefox) {
            return false;
        }
        if (browser.getZoomLevel() !== 0) {
            return false;
        }
        // see https://github.com/Microsoft/vscode/issues/24483
        if (browser.isChromev56) {
            var pixelRatio = browser.getPixelRatio();
            if (Math.floor(pixelRatio) !== pixelRatio) {
                // Not an integer
                return false;
            }
        }
        return true;
    }
    var DefaultOptions = {
        useShadows: true,
        verticalScrollMode: scrollable_1.ScrollbarVisibility.Auto
    };
    var ListView = /** @class */ (function () {
        function ListView(container, delegate, renderers, options) {
            if (options === void 0) { options = DefaultOptions; }
            this.delegate = delegate;
            this.renderers = new Map();
            this.splicing = false;
            this.items = [];
            this.itemId = 0;
            this.rangeMap = new rangeMap_1.RangeMap();
            for (var _i = 0, renderers_1 = renderers; _i < renderers_1.length; _i++) {
                var renderer = renderers_1[_i];
                this.renderers.set(renderer.templateId, renderer);
            }
            this.cache = new rowCache_1.RowCache(this.renderers);
            this.lastRenderTop = 0;
            this.lastRenderHeight = 0;
            this._domNode = document.createElement('div');
            this._domNode.className = 'monaco-list';
            this.rowsContainer = document.createElement('div');
            this.rowsContainer.className = 'monaco-list-rows';
            touch_1.Gesture.addTarget(this.rowsContainer);
            this.scrollableElement = new scrollableElement_1.ScrollableElement(this.rowsContainer, {
                alwaysConsumeMouseWheel: true,
                horizontal: scrollable_1.ScrollbarVisibility.Hidden,
                vertical: objects_1.getOrDefault(options, function (o) { return o.verticalScrollMode; }, DefaultOptions.verticalScrollMode),
                useShadows: objects_1.getOrDefault(options, function (o) { return o.useShadows; }, DefaultOptions.useShadows)
            });
            this._domNode.appendChild(this.scrollableElement.getDomNode());
            container.appendChild(this._domNode);
            this.disposables = [this.rangeMap, this.gesture, this.scrollableElement];
            this.scrollableElement.onScroll(this.onScroll, this, this.disposables);
            event_2.domEvent(this.rowsContainer, touch_1.EventType.Change)(this.onTouchChange, this, this.disposables);
            var onDragOver = event_1.mapEvent(event_2.domEvent(this.rowsContainer, 'dragover'), function (e) { return new mouseEvent_1.DragMouseEvent(e); });
            onDragOver(this.onDragOver, this, this.disposables);
            this.layout();
        }
        Object.defineProperty(ListView.prototype, "domNode", {
            get: function () {
                return this._domNode;
            },
            enumerable: true,
            configurable: true
        });
        ListView.prototype.splice = function (start, deleteCount, elements) {
            if (elements === void 0) { elements = []; }
            if (this.splicing) {
                throw new Error('Can\'t run recursive splices.');
            }
            this.splicing = true;
            try {
                return this._splice(start, deleteCount, elements);
            }
            finally {
                this.splicing = false;
            }
        };
        ListView.prototype._splice = function (start, deleteCount, elements) {
            var _this = this;
            if (elements === void 0) { elements = []; }
            var previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            var deleteRange = { start: start, end: start + deleteCount };
            var removeRange = rangeMap_1.intersect(previousRenderRange, deleteRange);
            for (var i = removeRange.start; i < removeRange.end; i++) {
                this.removeItemFromDOM(this.items[i]);
            }
            var previousRestRange = { start: start + deleteCount, end: this.items.length };
            var previousRenderedRestRange = rangeMap_1.intersect(previousRestRange, previousRenderRange);
            var previousUnrenderedRestRanges = rangeMap_1.relativeComplement(previousRestRange, previousRenderRange);
            var inserted = elements.map(function (element) { return ({
                id: String(_this.itemId++),
                element: element,
                size: _this.delegate.getHeight(element),
                templateId: _this.delegate.getTemplateId(element),
                row: null
            }); });
            (_a = this.rangeMap).splice.apply(_a, [start, deleteCount].concat(inserted));
            var deleted = (_b = this.items).splice.apply(_b, [start, deleteCount].concat(inserted));
            var delta = elements.length - deleteCount;
            var renderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            var renderedRestRange = rangeMap_1.shift(previousRenderedRestRange, delta);
            var updateRange = rangeMap_1.intersect(renderRange, renderedRestRange);
            for (var i = updateRange.start; i < updateRange.end; i++) {
                this.updateItemInDOM(this.items[i], i);
            }
            var removeRanges = rangeMap_1.relativeComplement(renderedRestRange, renderRange);
            for (var r = 0; r < removeRanges.length; r++) {
                var removeRange_1 = removeRanges[r];
                for (var i = removeRange_1.start; i < removeRange_1.end; i++) {
                    this.removeItemFromDOM(this.items[i]);
                }
            }
            var unrenderedRestRanges = previousUnrenderedRestRanges.map(function (r) { return rangeMap_1.shift(r, delta); });
            var elementsRange = { start: start, end: start + elements.length };
            var insertRanges = [elementsRange].concat(unrenderedRestRanges).map(function (r) { return rangeMap_1.intersect(renderRange, r); });
            for (var r = 0; r < insertRanges.length; r++) {
                var insertRange = insertRanges[r];
                for (var i = insertRange.start; i < insertRange.end; i++) {
                    this.insertItemInDOM(this.items[i], i);
                }
            }
            var scrollHeight = this.getContentHeight();
            this.rowsContainer.style.height = scrollHeight + "px";
            this.scrollableElement.setScrollDimensions({ scrollHeight: scrollHeight });
            return deleted.map(function (i) { return i.element; });
            var _a, _b;
        };
        Object.defineProperty(ListView.prototype, "length", {
            get: function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "renderHeight", {
            get: function () {
                var scrollDimensions = this.scrollableElement.getScrollDimensions();
                return scrollDimensions.height;
            },
            enumerable: true,
            configurable: true
        });
        ListView.prototype.element = function (index) {
            return this.items[index].element;
        };
        ListView.prototype.domElement = function (index) {
            var row = this.items[index].row;
            return row && row.domNode;
        };
        ListView.prototype.elementHeight = function (index) {
            return this.items[index].size;
        };
        ListView.prototype.elementTop = function (index) {
            return this.rangeMap.positionAt(index);
        };
        ListView.prototype.indexAt = function (position) {
            return this.rangeMap.indexAt(position);
        };
        ListView.prototype.indexAfter = function (position) {
            return this.rangeMap.indexAfter(position);
        };
        ListView.prototype.layout = function (height) {
            this.scrollableElement.setScrollDimensions({
                height: height || DOM.getContentHeight(this._domNode)
            });
        };
        // Render
        ListView.prototype.render = function (renderTop, renderHeight) {
            var previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
            var renderRange = this.getRenderRange(renderTop, renderHeight);
            var rangesToInsert = rangeMap_1.relativeComplement(renderRange, previousRenderRange);
            var rangesToRemove = rangeMap_1.relativeComplement(previousRenderRange, renderRange);
            for (var _i = 0, rangesToInsert_1 = rangesToInsert; _i < rangesToInsert_1.length; _i++) {
                var range = rangesToInsert_1[_i];
                for (var i = range.start; i < range.end; i++) {
                    this.insertItemInDOM(this.items[i], i);
                }
            }
            for (var _a = 0, rangesToRemove_1 = rangesToRemove; _a < rangesToRemove_1.length; _a++) {
                var range = rangesToRemove_1[_a];
                for (var i = range.start; i < range.end; i++) {
                    this.removeItemFromDOM(this.items[i]);
                }
            }
            if (canUseTranslate3d() && !platform_1.isWindows /* Windows: translate3d breaks subpixel-antialias (ClearType) unless a background is defined */) {
                var transform = "translate3d(0px, -" + renderTop + "px, 0px)";
                this.rowsContainer.style.transform = transform;
                this.rowsContainer.style.webkitTransform = transform;
            }
            else {
                this.rowsContainer.style.top = "-" + renderTop + "px";
            }
            this.lastRenderTop = renderTop;
            this.lastRenderHeight = renderHeight;
        };
        // DOM operations
        ListView.prototype.insertItemInDOM = function (item, index) {
            if (!item.row) {
                item.row = this.cache.alloc(item.templateId);
            }
            if (!item.row.domNode.parentElement) {
                this.rowsContainer.appendChild(item.row.domNode);
            }
            var renderer = this.renderers.get(item.templateId);
            item.row.domNode.style.top = this.elementTop(index) + "px";
            item.row.domNode.style.height = item.size + "px";
            item.row.domNode.setAttribute('data-index', "" + index);
            renderer.renderElement(item.element, index, item.row.templateData);
        };
        ListView.prototype.updateItemInDOM = function (item, index) {
            item.row.domNode.style.top = this.elementTop(index) + "px";
            item.row.domNode.setAttribute('data-index', "" + index);
        };
        ListView.prototype.removeItemFromDOM = function (item) {
            this.cache.release(item.row);
            item.row = null;
        };
        ListView.prototype.getContentHeight = function () {
            return this.rangeMap.size;
        };
        ListView.prototype.getScrollTop = function () {
            var scrollPosition = this.scrollableElement.getScrollPosition();
            return scrollPosition.scrollTop;
        };
        ListView.prototype.setScrollTop = function (scrollTop) {
            this.scrollableElement.setScrollPosition({ scrollTop: scrollTop });
        };
        Object.defineProperty(ListView.prototype, "scrollTop", {
            get: function () {
                return this.getScrollTop();
            },
            set: function (scrollTop) {
                this.setScrollTop(scrollTop);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseClick", {
            // Events
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'click'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseDblClick", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'dblclick'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseUp", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'mouseup'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseDown", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'mousedown'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseOver", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'mouseover'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseMove", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'mousemove'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onMouseOut", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'mouseout'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onContextMenu", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'contextmenu'), function (e) { return _this.toMouseEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onTouchStart", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.domNode, 'touchstart'), function (e) { return _this.toTouchEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "onTap", {
            get: function () {
                var _this = this;
                return event_1.filterEvent(event_1.mapEvent(event_2.domEvent(this.rowsContainer, touch_1.EventType.Tap), function (e) { return _this.toGestureEvent(e); }), function (e) { return e.index >= 0; });
            },
            enumerable: true,
            configurable: true
        });
        ListView.prototype.toMouseEvent = function (browserEvent) {
            var index = this.getItemIndexFromEventTarget(browserEvent.target);
            var element = index < 0 ? undefined : this.items[index].element;
            return { browserEvent: browserEvent, index: index, element: element };
        };
        ListView.prototype.toTouchEvent = function (browserEvent) {
            var index = this.getItemIndexFromEventTarget(browserEvent.target);
            var element = index < 0 ? undefined : this.items[index].element;
            return { browserEvent: browserEvent, index: index, element: element };
        };
        ListView.prototype.toGestureEvent = function (browserEvent) {
            var index = this.getItemIndexFromEventTarget(browserEvent.initialTarget);
            var element = index < 0 ? undefined : this.items[index].element;
            return { browserEvent: browserEvent, index: index, element: element };
        };
        ListView.prototype.onScroll = function (e) {
            this.render(e.scrollTop, e.height);
        };
        ListView.prototype.onTouchChange = function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.scrollTop -= event.translationY;
        };
        ListView.prototype.onDragOver = function (event) {
            this.setupDragAndDropScrollInterval();
            this.dragAndDropMouseY = event.posy;
        };
        ListView.prototype.setupDragAndDropScrollInterval = function () {
            var _this = this;
            var viewTop = DOM.getTopLeftOffset(this._domNode).top;
            if (!this.dragAndDropScrollInterval) {
                this.dragAndDropScrollInterval = window.setInterval(function () {
                    if (_this.dragAndDropMouseY === undefined) {
                        return;
                    }
                    var diff = _this.dragAndDropMouseY - viewTop;
                    var scrollDiff = 0;
                    var upperLimit = _this.renderHeight - 35;
                    if (diff < 35) {
                        scrollDiff = Math.max(-14, 0.2 * (diff - 35));
                    }
                    else if (diff > upperLimit) {
                        scrollDiff = Math.min(14, 0.2 * (diff - upperLimit));
                    }
                    _this.scrollTop += scrollDiff;
                }, 10);
                this.cancelDragAndDropScrollTimeout();
                this.dragAndDropScrollTimeout = window.setTimeout(function () {
                    _this.cancelDragAndDropScrollInterval();
                    _this.dragAndDropScrollTimeout = null;
                }, 1000);
            }
        };
        ListView.prototype.cancelDragAndDropScrollInterval = function () {
            if (this.dragAndDropScrollInterval) {
                window.clearInterval(this.dragAndDropScrollInterval);
                this.dragAndDropScrollInterval = null;
            }
            this.cancelDragAndDropScrollTimeout();
        };
        ListView.prototype.cancelDragAndDropScrollTimeout = function () {
            if (this.dragAndDropScrollTimeout) {
                window.clearTimeout(this.dragAndDropScrollTimeout);
                this.dragAndDropScrollTimeout = null;
            }
        };
        // Util
        ListView.prototype.getItemIndexFromEventTarget = function (target) {
            while (target instanceof HTMLElement && target !== this.rowsContainer) {
                var element = target;
                var rawIndex = element.getAttribute('data-index');
                if (rawIndex) {
                    var index = Number(rawIndex);
                    if (!isNaN(index)) {
                        return index;
                    }
                }
                target = element.parentElement;
            }
            return -1;
        };
        ListView.prototype.getRenderRange = function (renderTop, renderHeight) {
            return {
                start: this.rangeMap.indexAt(renderTop),
                end: this.rangeMap.indexAfter(renderTop + renderHeight - 1)
            };
        };
        // Dispose
        ListView.prototype.dispose = function () {
            this.items = null;
            if (this._domNode && this._domNode.parentElement) {
                this._domNode.parentNode.removeChild(this._domNode);
                this._domNode = null;
            }
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseClick", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseDblClick", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseUp", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseDown", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseOver", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseMove", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onMouseOut", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onContextMenu", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onTouchStart", null);
        __decorate([
            decorators_1.memoize
        ], ListView.prototype, "onTap", null);
        return ListView;
    }());
    exports.ListView = ListView;
});
