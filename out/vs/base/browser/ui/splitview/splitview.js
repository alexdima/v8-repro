/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/types", "vs/base/browser/dom", "vs/base/common/numbers", "vs/base/common/arrays", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/sash/sash", "vs/css!./splitview"], function (require, exports, lifecycle_1, event_1, types, dom, numbers_1, arrays_1, sash_1, sash_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Orientation = sash_2.Orientation;
    var State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Busy"] = 1] = "Busy";
    })(State || (State = {}));
    function pushToEnd(arr, value) {
        var didFindValue = false;
        var result = arr.filter(function (v) {
            if (v === value) {
                didFindValue = true;
                return false;
            }
            return true;
        });
        if (didFindValue) {
            result.push(value);
        }
        return result;
    }
    var SplitView = /** @class */ (function () {
        function SplitView(container, options) {
            if (options === void 0) { options = {}; }
            this.size = 0;
            this.contentSize = 0;
            this.viewItems = [];
            this.sashItems = [];
            this.state = State.Idle;
            this._onDidSashChange = new event_1.Emitter();
            this.onDidSashChange = this._onDidSashChange.event;
            this._onDidSashReset = new event_1.Emitter();
            this.onDidSashReset = this._onDidSashReset.event;
            this.orientation = types.isUndefined(options.orientation) ? sash_1.Orientation.VERTICAL : options.orientation;
            this.el = document.createElement('div');
            dom.addClass(this.el, 'monaco-split-view2');
            dom.addClass(this.el, this.orientation === sash_1.Orientation.VERTICAL ? 'vertical' : 'horizontal');
            container.appendChild(this.el);
        }
        Object.defineProperty(SplitView.prototype, "length", {
            get: function () {
                return this.viewItems.length;
            },
            enumerable: true,
            configurable: true
        });
        SplitView.prototype.addView = function (view, size, index) {
            var _this = this;
            if (index === void 0) { index = this.viewItems.length; }
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            // Add view
            var container = dom.$('.split-view-view');
            if (index === this.viewItems.length) {
                this.el.appendChild(container);
            }
            else {
                this.el.insertBefore(container, this.el.children.item(index));
            }
            var onChangeDisposable = view.onDidChange(function (size) { return _this.onViewChange(item, size); });
            var containerDisposable = lifecycle_1.toDisposable(function () { return _this.el.removeChild(container); });
            var disposable = lifecycle_1.combinedDisposable([onChangeDisposable, containerDisposable]);
            var layoutContainer = this.orientation === sash_1.Orientation.VERTICAL
                ? function (size) { return item.container.style.height = item.size + "px"; }
                : function (size) { return item.container.style.width = item.size + "px"; };
            var layout = function () {
                layoutContainer(item.size);
                item.view.layout(item.size, _this.orientation);
            };
            size = Math.round(size);
            var item = { view: view, container: container, size: size, layout: layout, disposable: disposable };
            this.viewItems.splice(index, 0, item);
            // Add sash
            if (this.viewItems.length > 1) {
                var orientation_1 = this.orientation === sash_1.Orientation.VERTICAL ? sash_1.Orientation.HORIZONTAL : sash_1.Orientation.VERTICAL;
                var layoutProvider = this.orientation === sash_1.Orientation.VERTICAL ? { getHorizontalSashTop: function (sash) { return _this.getSashPosition(sash); } } : { getVerticalSashLeft: function (sash) { return _this.getSashPosition(sash); } };
                var sash_3 = new sash_1.Sash(this.el, layoutProvider, { orientation: orientation_1 });
                var sashEventMapper = this.orientation === sash_1.Orientation.VERTICAL
                    ? function (e) { return ({ sash: sash_3, start: e.startY, current: e.currentY }); }
                    : function (e) { return ({ sash: sash_3, start: e.startX, current: e.currentX }); };
                var onStart = event_1.mapEvent(sash_3.onDidStart, sashEventMapper);
                var onStartDisposable = onStart(this.onSashStart, this);
                var onChange = event_1.mapEvent(sash_3.onDidChange, sashEventMapper);
                var onSashChangeDisposable = onChange(this.onSashChange, this);
                var onEnd = event_1.mapEvent(sash_3.onDidEnd, function () { return null; });
                var onEndDisposable = onEnd(function () { return _this._onDidSashChange.fire(); });
                var onDidReset = event_1.mapEvent(sash_3.onDidReset, function () { return null; });
                var onDidResetDisposable = onDidReset(function () { return _this._onDidSashReset.fire(); });
                var disposable_1 = lifecycle_1.combinedDisposable([onStartDisposable, onSashChangeDisposable, onEndDisposable, onDidResetDisposable, sash_3]);
                var sashItem = { sash: sash_3, disposable: disposable_1 };
                this.sashItems.splice(index - 1, 0, sashItem);
            }
            view.render(container, this.orientation);
            this.relayout(index);
            this.state = State.Idle;
        };
        SplitView.prototype.removeView = function (index) {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            // Remove view
            var viewItem = this.viewItems.splice(index, 1)[0];
            viewItem.disposable.dispose();
            // Remove sash
            if (this.viewItems.length >= 1) {
                var sashIndex = Math.max(index - 1, 0);
                var sashItem = this.sashItems.splice(sashIndex, 1)[0];
                sashItem.disposable.dispose();
            }
            this.relayout();
            this.state = State.Idle;
        };
        SplitView.prototype.moveView = function (from, to) {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            if (from < 0 || from >= this.viewItems.length) {
                return;
            }
            if (to < 0 || to >= this.viewItems.length) {
                return;
            }
            if (from === to) {
                return;
            }
            var viewItem = this.viewItems.splice(from, 1)[0];
            this.viewItems.splice(to, 0, viewItem);
            if (to + 1 < this.viewItems.length) {
                this.el.insertBefore(viewItem.container, this.viewItems[to + 1].container);
            }
            else {
                this.el.appendChild(viewItem.container);
            }
            this.layoutViews();
            this.state = State.Idle;
        };
        SplitView.prototype.relayout = function (lowPriorityIndex) {
            var contentSize = this.viewItems.reduce(function (r, i) { return r + i.size; }, 0);
            this.resize(this.viewItems.length - 1, this.size - contentSize, undefined, lowPriorityIndex);
        };
        SplitView.prototype.layout = function (size) {
            var previousSize = Math.max(this.size, this.contentSize);
            this.size = size;
            this.resize(this.viewItems.length - 1, size - previousSize);
        };
        SplitView.prototype.onSashStart = function (_a) {
            var _this = this;
            var sash = _a.sash, start = _a.start;
            var index = arrays_1.firstIndex(this.sashItems, function (item) { return item.sash === sash; });
            var sizes = this.viewItems.map(function (i) { return i.size; });
            var upIndexes = arrays_1.range(index, -1);
            var collapseUp = upIndexes.reduce(function (r, i) { return r + (sizes[i] - _this.viewItems[i].view.minimumSize); }, 0);
            var expandUp = upIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].view.maximumSize - sizes[i]); }, 0);
            var downIndexes = arrays_1.range(index + 1, this.viewItems.length);
            var collapseDown = downIndexes.reduce(function (r, i) { return r + (sizes[i] - _this.viewItems[i].view.minimumSize); }, 0);
            var expandDown = downIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].view.maximumSize - sizes[i]); }, 0);
            var minDelta = -Math.min(collapseUp, expandDown);
            var maxDelta = Math.min(collapseDown, expandUp);
            this.sashDragState = { start: start, index: index, sizes: sizes, minDelta: minDelta, maxDelta: maxDelta };
        };
        SplitView.prototype.onSashChange = function (_a) {
            var sash = _a.sash, current = _a.current;
            var _b = this.sashDragState, index = _b.index, start = _b.start, sizes = _b.sizes, minDelta = _b.minDelta, maxDelta = _b.maxDelta;
            var delta = numbers_1.clamp(current - start, minDelta, maxDelta);
            this.resize(index, delta, sizes);
        };
        SplitView.prototype.onViewChange = function (item, size) {
            var index = this.viewItems.indexOf(item);
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            size = typeof size === 'number' ? size : item.size;
            size = numbers_1.clamp(size, item.view.minimumSize, item.view.maximumSize);
            item.size = size;
            this.relayout(index);
        };
        SplitView.prototype.resizeView = function (index, size) {
            var _this = this;
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            var item = this.viewItems[index];
            size = Math.round(size);
            size = numbers_1.clamp(size, item.view.minimumSize, item.view.maximumSize);
            var delta = size - item.size;
            if (delta !== 0 && index < this.viewItems.length - 1) {
                var downIndexes = arrays_1.range(index + 1, this.viewItems.length);
                var collapseDown = downIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].size - _this.viewItems[i].view.minimumSize); }, 0);
                var expandDown = downIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].view.maximumSize - _this.viewItems[i].size); }, 0);
                var deltaDown = numbers_1.clamp(delta, -expandDown, collapseDown);
                this.resize(index, deltaDown);
                delta -= deltaDown;
            }
            if (delta !== 0 && index > 0) {
                var upIndexes = arrays_1.range(index - 1, -1);
                var collapseUp = upIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].size - _this.viewItems[i].view.minimumSize); }, 0);
                var expandUp = upIndexes.reduce(function (r, i) { return r + (_this.viewItems[i].view.maximumSize - _this.viewItems[i].size); }, 0);
                var deltaUp = numbers_1.clamp(-delta, -collapseUp, expandUp);
                this.resize(index - 1, deltaUp);
            }
            this.state = State.Idle;
        };
        SplitView.prototype.getViewSize = function (index) {
            if (index < 0 || index >= this.viewItems.length) {
                return -1;
            }
            return this.viewItems[index].size;
        };
        SplitView.prototype.resize = function (index, delta, sizes, lowPriorityIndex) {
            var _this = this;
            if (sizes === void 0) { sizes = this.viewItems.map(function (i) { return i.size; }); }
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            if (delta !== 0) {
                var upIndexes = arrays_1.range(index, -1);
                var downIndexes = arrays_1.range(index + 1, this.viewItems.length);
                if (typeof lowPriorityIndex === 'number') {
                    upIndexes = pushToEnd(upIndexes, lowPriorityIndex);
                    downIndexes = pushToEnd(downIndexes, lowPriorityIndex);
                }
                var upItems = upIndexes.map(function (i) { return _this.viewItems[i]; });
                var upSizes = upIndexes.map(function (i) { return sizes[i]; });
                var downItems = downIndexes.map(function (i) { return _this.viewItems[i]; });
                var downSizes = downIndexes.map(function (i) { return sizes[i]; });
                for (var i = 0, deltaUp = delta; deltaUp !== 0 && i < upItems.length; i++) {
                    var item = upItems[i];
                    var size = numbers_1.clamp(upSizes[i] + deltaUp, item.view.minimumSize, item.view.maximumSize);
                    var viewDelta = size - upSizes[i];
                    deltaUp -= viewDelta;
                    item.size = size;
                }
                for (var i = 0, deltaDown = delta; deltaDown !== 0 && i < downItems.length; i++) {
                    var item = downItems[i];
                    var size = numbers_1.clamp(downSizes[i] - deltaDown, item.view.minimumSize, item.view.maximumSize);
                    var viewDelta = size - downSizes[i];
                    deltaDown += viewDelta;
                    item.size = size;
                }
            }
            var contentSize = this.viewItems.reduce(function (r, i) { return r + i.size; }, 0);
            var emptyDelta = this.size - contentSize;
            for (var i = this.viewItems.length - 1; emptyDelta > 0 && i >= 0; i--) {
                var item = this.viewItems[i];
                var size = numbers_1.clamp(item.size + emptyDelta, item.view.minimumSize, item.view.maximumSize);
                var viewDelta = size - item.size;
                emptyDelta -= viewDelta;
                item.size = size;
            }
            this.contentSize = this.viewItems.reduce(function (r, i) { return r + i.size; }, 0);
            this.layoutViews();
        };
        SplitView.prototype.layoutViews = function () {
            this.viewItems.forEach(function (item) { return item.layout(); });
            this.sashItems.forEach(function (item) { return item.sash.layout(); });
            // Update sashes enablement
            var previous = false;
            var collapsesDown = this.viewItems.map(function (i) { return previous = (i.size - i.view.minimumSize > 0) || previous; });
            previous = false;
            var expandsDown = this.viewItems.map(function (i) { return previous = (i.view.maximumSize - i.size > 0) || previous; });
            var reverseViews = this.viewItems.slice().reverse();
            previous = false;
            var collapsesUp = reverseViews.map(function (i) { return previous = (i.size - i.view.minimumSize > 0) || previous; }).reverse();
            previous = false;
            var expandsUp = reverseViews.map(function (i) { return previous = (i.view.maximumSize - i.size > 0) || previous; }).reverse();
            this.sashItems.forEach(function (s, i) {
                if ((collapsesDown[i] && expandsUp[i + 1]) || (expandsDown[i] && collapsesUp[i + 1])) {
                    s.sash.enable();
                }
                else {
                    s.sash.disable();
                }
            });
        };
        SplitView.prototype.getSashPosition = function (sash) {
            var position = 0;
            for (var i = 0; i < this.sashItems.length; i++) {
                position += this.viewItems[i].size;
                if (this.sashItems[i].sash === sash) {
                    return position;
                }
            }
            return 0;
        };
        SplitView.prototype.dispose = function () {
            this.viewItems.forEach(function (i) { return i.disposable.dispose(); });
            this.viewItems = [];
            this.sashItems.forEach(function (i) { return i.disposable.dispose(); });
            this.sashItems = [];
        };
        return SplitView;
    }());
    exports.SplitView = SplitView;
});
