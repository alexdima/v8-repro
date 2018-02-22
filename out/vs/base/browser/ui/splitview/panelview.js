/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/color", "./splitview", "vs/css!./panelview"], function (require, exports, lifecycle_1, event_1, event_2, keyboardEvent_1, dom_1, arrays_1, color_1, splitview_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Panel = /** @class */ (function () {
        function Panel(options) {
            if (options === void 0) { options = {}; }
            this.expandedSize = undefined;
            this._headerVisible = true;
            this.styles = undefined;
            this.disposables = [];
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._expanded = typeof options.expanded === 'undefined' ? true : !!options.expanded;
            this.ariaHeaderLabel = options.ariaHeaderLabel || '';
            this._minimumBodySize = typeof options.minimumBodySize === 'number' ? options.minimumBodySize : 120;
            this._maximumBodySize = typeof options.maximumBodySize === 'number' ? options.maximumBodySize : Number.POSITIVE_INFINITY;
        }
        Object.defineProperty(Panel.prototype, "draggableElement", {
            get: function () {
                return this.header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "dropTargetElement", {
            get: function () {
                return this.el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "dropBackground", {
            get: function () {
                return this._dropBackground;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "minimumBodySize", {
            get: function () {
                return this._minimumBodySize;
            },
            set: function (size) {
                this._minimumBodySize = size;
                this._onDidChange.fire();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "maximumBodySize", {
            get: function () {
                return this._maximumBodySize;
            },
            set: function (size) {
                this._maximumBodySize = size;
                this._onDidChange.fire();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "headerSize", {
            get: function () {
                return this.headerVisible ? Panel.HEADER_SIZE : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "minimumSize", {
            get: function () {
                var headerSize = this.headerSize;
                var expanded = !this.headerVisible || this.isExpanded();
                var minimumBodySize = expanded ? this._minimumBodySize : 0;
                return headerSize + minimumBodySize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Panel.prototype, "maximumSize", {
            get: function () {
                var headerSize = this.headerSize;
                var expanded = !this.headerVisible || this.isExpanded();
                var maximumBodySize = expanded ? this._maximumBodySize : 0;
                return headerSize + maximumBodySize;
            },
            enumerable: true,
            configurable: true
        });
        Panel.prototype.isExpanded = function () {
            return this._expanded;
        };
        Panel.prototype.setExpanded = function (expanded) {
            if (this._expanded === !!expanded) {
                return;
            }
            this._expanded = !!expanded;
            this.updateHeader();
            this._onDidChange.fire(expanded ? this.expandedSize : undefined);
        };
        Object.defineProperty(Panel.prototype, "headerVisible", {
            get: function () {
                return this._headerVisible;
            },
            set: function (visible) {
                if (this._headerVisible === !!visible) {
                    return;
                }
                this._headerVisible = !!visible;
                this.updateHeader();
                this._onDidChange.fire();
            },
            enumerable: true,
            configurable: true
        });
        Panel.prototype.render = function (container) {
            var _this = this;
            this.el = dom_1.append(container, dom_1.$('.panel'));
            this.header = dom_1.$('.panel-header');
            dom_1.append(this.el, this.header);
            this.header.setAttribute('tabindex', '0');
            this.header.setAttribute('role', 'toolbar');
            this.header.setAttribute('aria-label', this.ariaHeaderLabel);
            this.renderHeader(this.header);
            var focusTracker = dom_1.trackFocus(this.header);
            focusTracker.onDidFocus(function () { return dom_1.addClass(_this.header, 'focused'); });
            focusTracker.onDidBlur(function () { return dom_1.removeClass(_this.header, 'focused'); });
            this.updateHeader();
            var onHeaderKeyDown = event_1.chain(event_2.domEvent(this.header, 'keydown'))
                .map(function (e) { return new keyboardEvent_1.StandardKeyboardEvent(e); });
            onHeaderKeyDown.filter(function (e) { return e.keyCode === 3 /* Enter */ || e.keyCode === 10 /* Space */; })
                .event(function () { return _this.setExpanded(!_this.isExpanded()); }, null, this.disposables);
            onHeaderKeyDown.filter(function (e) { return e.keyCode === 15 /* LeftArrow */; })
                .event(function () { return _this.setExpanded(false); }, null, this.disposables);
            onHeaderKeyDown.filter(function (e) { return e.keyCode === 17 /* RightArrow */; })
                .event(function () { return _this.setExpanded(true); }, null, this.disposables);
            event_2.domEvent(this.header, 'click')(function () { return _this.setExpanded(!_this.isExpanded()); }, null, this.disposables);
            // TODO@Joao move this down to panelview
            // onHeaderKeyDown.filter(e => e.keyCode === KeyCode.UpArrow)
            // 	.event(focusPrevious, this, this.disposables);
            // onHeaderKeyDown.filter(e => e.keyCode === KeyCode.DownArrow)
            // 	.event(focusNext, this, this.disposables);
            var body = dom_1.append(this.el, dom_1.$('.panel-body'));
            this.renderBody(body);
        };
        Panel.prototype.layout = function (size) {
            var headerSize = this.headerVisible ? Panel.HEADER_SIZE : 0;
            this.layoutBody(size - headerSize);
            if (this.isExpanded()) {
                this.expandedSize = size;
            }
        };
        Panel.prototype.style = function (styles) {
            this.styles = styles;
            if (!this.header) {
                return;
            }
            this.updateHeader();
        };
        Panel.prototype.updateHeader = function () {
            var expanded = !this.headerVisible || this.isExpanded();
            this.header.style.height = this.headerSize + "px";
            this.header.style.lineHeight = this.headerSize + "px";
            dom_1.toggleClass(this.header, 'hidden', !this.headerVisible);
            dom_1.toggleClass(this.header, 'expanded', expanded);
            this.header.setAttribute('aria-expanded', String(expanded));
            this.header.style.color = this.styles.headerForeground ? this.styles.headerForeground.toString() : null;
            this.header.style.backgroundColor = this.styles.headerBackground ? this.styles.headerBackground.toString() : null;
            this.header.style.borderTop = this.styles.headerHighContrastBorder ? "1px solid " + this.styles.headerHighContrastBorder : null;
            this._dropBackground = this.styles.dropBackground;
        };
        Panel.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        Panel.HEADER_SIZE = 22;
        return Panel;
    }());
    exports.Panel = Panel;
    var PanelDraggable = /** @class */ (function () {
        function PanelDraggable(panel, context) {
            this.panel = panel;
            this.context = context;
            // see https://github.com/Microsoft/vscode/issues/14470
            this.dragOverCounter = 0;
            this.disposables = [];
            this._onDidDrop = new event_1.Emitter();
            this.onDidDrop = this._onDidDrop.event;
            panel.draggableElement.draggable = true;
            event_2.domEvent(panel.draggableElement, 'dragstart')(this.onDragStart, this, this.disposables);
            event_2.domEvent(panel.dropTargetElement, 'dragenter')(this.onDragEnter, this, this.disposables);
            event_2.domEvent(panel.dropTargetElement, 'dragleave')(this.onDragLeave, this, this.disposables);
            event_2.domEvent(panel.dropTargetElement, 'dragend')(this.onDragEnd, this, this.disposables);
            event_2.domEvent(panel.dropTargetElement, 'drop')(this.onDrop, this, this.disposables);
        }
        PanelDraggable.prototype.onDragStart = function (e) {
            e.dataTransfer.effectAllowed = 'move';
            var dragImage = dom_1.append(document.body, dom_1.$('.monaco-panel-drag-image', {}, this.panel.draggableElement.textContent));
            e.dataTransfer.setDragImage(dragImage, -10, -10);
            setTimeout(function () { return document.body.removeChild(dragImage); }, 0);
            this.context.draggable = this;
        };
        PanelDraggable.prototype.onDragEnter = function (e) {
            if (!this.context.draggable || this.context.draggable === this) {
                return;
            }
            this.dragOverCounter++;
            this.render();
        };
        PanelDraggable.prototype.onDragLeave = function (e) {
            if (!this.context.draggable || this.context.draggable === this) {
                return;
            }
            this.dragOverCounter--;
            if (this.dragOverCounter === 0) {
                this.render();
            }
        };
        PanelDraggable.prototype.onDragEnd = function (e) {
            if (!this.context.draggable) {
                return;
            }
            this.dragOverCounter = 0;
            this.render();
            this.context.draggable = null;
        };
        PanelDraggable.prototype.onDrop = function (e) {
            if (!this.context.draggable) {
                return;
            }
            this.dragOverCounter = 0;
            this.render();
            if (this.context.draggable !== this) {
                this._onDidDrop.fire({ from: this.context.draggable.panel, to: this.panel });
            }
            this.context.draggable = null;
        };
        PanelDraggable.prototype.render = function () {
            var backgroundColor = null;
            if (this.dragOverCounter > 0) {
                backgroundColor = (this.panel.dropBackground || PanelDraggable.DefaultDragOverBackgroundColor).toString();
            }
            this.panel.dropTargetElement.style.backgroundColor = backgroundColor;
        };
        PanelDraggable.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        PanelDraggable.DefaultDragOverBackgroundColor = new color_1.Color(new color_1.RGBA(128, 128, 128, 0.5));
        return PanelDraggable;
    }());
    var IPanelViewOptions = /** @class */ (function () {
        function IPanelViewOptions() {
        }
        return IPanelViewOptions;
    }());
    exports.IPanelViewOptions = IPanelViewOptions;
    var PanelView = /** @class */ (function () {
        function PanelView(container, options) {
            if (options === void 0) { options = {}; }
            this.dndContext = { draggable: null };
            this.panelItems = [];
            this.animationTimer = null;
            this._onDidDrop = new event_1.Emitter();
            this.onDidDrop = this._onDidDrop.event;
            this.dnd = !!options.dnd;
            this.el = dom_1.append(container, dom_1.$('.monaco-panel-view'));
            this.splitview = new splitview_1.SplitView(this.el);
            this.onDidSashChange = this.splitview.onDidSashChange;
        }
        PanelView.prototype.addPanel = function (panel, size, index) {
            if (index === void 0) { index = this.splitview.length; }
            var disposables = [];
            panel.onDidChange(this.setupAnimation, this, disposables);
            var panelItem = { panel: panel, disposable: lifecycle_1.combinedDisposable(disposables) };
            this.panelItems.splice(index, 0, panelItem);
            this.splitview.addView(panel, size, index);
            if (this.dnd) {
                var draggable = new PanelDraggable(panel, this.dndContext);
                disposables.push(draggable);
                draggable.onDidDrop(this._onDidDrop.fire, this._onDidDrop, disposables);
            }
        };
        PanelView.prototype.removePanel = function (panel) {
            var index = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === panel; });
            if (index === -1) {
                return;
            }
            this.splitview.removeView(index);
            var panelItem = this.panelItems.splice(index, 1)[0];
            panelItem.disposable.dispose();
        };
        PanelView.prototype.movePanel = function (from, to) {
            var fromIndex = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === from; });
            var toIndex = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === to; });
            if (fromIndex === -1 || toIndex === -1) {
                return;
            }
            var panelItem = this.panelItems.splice(fromIndex, 1)[0];
            this.panelItems.splice(toIndex, 0, panelItem);
            this.splitview.moveView(fromIndex, toIndex);
        };
        PanelView.prototype.resizePanel = function (panel, size) {
            var index = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === panel; });
            if (index === -1) {
                return;
            }
            this.splitview.resizeView(index, size);
        };
        PanelView.prototype.getPanelSize = function (panel) {
            var index = arrays_1.firstIndex(this.panelItems, function (item) { return item.panel === panel; });
            if (index === -1) {
                return -1;
            }
            return this.splitview.getViewSize(index);
        };
        PanelView.prototype.layout = function (size) {
            this.splitview.layout(size);
        };
        PanelView.prototype.setupAnimation = function () {
            var _this = this;
            if (typeof this.animationTimer === 'number') {
                window.clearTimeout(this.animationTimer);
            }
            dom_1.addClass(this.el, 'animated');
            this.animationTimer = window.setTimeout(function () {
                _this.animationTimer = null;
                dom_1.removeClass(_this.el, 'animated');
            }, 200);
        };
        PanelView.prototype.dispose = function () {
            this.panelItems.forEach(function (i) { return i.disposable.dispose(); });
            this.splitview.dispose();
        };
        return PanelView;
    }());
    exports.PanelView = PanelView;
});
