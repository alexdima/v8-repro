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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/terminal/electron-browser/terminalInstance", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/splitview/splitview"], function (require, exports, instantiation_1, terminalInstance_1, event_1, lifecycle_1, splitview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SplitPane = /** @class */ (function () {
        function SplitPane(_parent, orthogonalSize, _needsReattach) {
            this._parent = _parent;
            this.orthogonalSize = orthogonalSize;
            this._needsReattach = _needsReattach;
            this.minimumSize = 100;
            this.maximumSize = Number.MAX_VALUE;
            this._children = [];
            this._isContainerSet = false;
            this._onDidChange = event_1.default.None;
        }
        Object.defineProperty(SplitPane.prototype, "children", {
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPane.prototype, "onDidChange", {
            get: function () { return this._onDidChange; },
            enumerable: true,
            configurable: true
        });
        SplitPane.prototype.branch = function (container, orientation, instance) {
            var _this = this;
            this.orientation = orientation;
            container.removeChild(this.instance._wrapperElement);
            this._splitView = new splitview_1.SplitView(container, { orientation: orientation });
            this._splitView.onDidSashReset(function () { return _this._resetSize(); });
            this.layout(this._size);
            this.orthogonalLayout(this.orthogonalSize);
            this.addChild(this.orthogonalSize / 2, this._size, this.instance, 0, this._isContainerSet);
            this.addChild(this.orthogonalSize / 2, this._size, instance);
            // Instance is now owned by the first child
            this.instance = null;
        };
        SplitPane.prototype.split = function (instance) {
            if (this._parent && this._parent.orientation === this.orientation) {
                // TODO: Splitting sizes can be a bit weird when not splitting the right-most pane
                //       If we kept proportions when adding the view to the splitview it would be alright
                var index = this._parent._children.indexOf(this);
                this._parent.addChild(this._size / 2, this.orthogonalSize, instance, index + 1);
            }
            else {
                this.branch(this._container, this.orientation, instance);
            }
        };
        SplitPane.prototype.addChild = function (size, orthogonalSize, instance, index, needsReattach) {
            var child = new SplitPane(this, orthogonalSize, needsReattach);
            child.orientation = this.orientation;
            child.instance = instance;
            this._splitView.addView(child, size, index);
            if (typeof index === 'number') {
                this._children.splice(index, 0, child);
            }
            else {
                this._children.push(child);
            }
            this._onDidChange = event_1.anyEvent.apply(void 0, this._children.map(function (c) { return c.onDidChange; }));
        };
        SplitPane.prototype._resetSize = function () {
            var totalSize = 0;
            for (var i = 0; i < this._splitView.length; i++) {
                totalSize += this._splitView.getViewSize(i);
            }
            var newSize = Math.floor(totalSize / this._splitView.length);
            for (var i = 0; i < this._splitView.length - 1; i++) {
                this._splitView.resizeView(i, newSize);
            }
        };
        SplitPane.prototype.remove = function () {
            if (!this._parent) {
                return;
            }
            this._parent.removeChild(this);
        };
        SplitPane.prototype.removeChild = function (child) {
            var index = this._children.indexOf(child);
            this._children.splice(index, 1);
            this._splitView.removeView(index);
        };
        SplitPane.prototype.render = function (container) {
            if (!container) {
                return;
            }
            this._container = container;
            if (!this._isContainerSet && this.instance) {
                if (this._needsReattach) {
                    this.instance.reattachToElement(container);
                }
                else {
                    this.instance.attachToElement(container);
                }
                this._isContainerSet = true;
            }
        };
        SplitPane.prototype.layout = function (size) {
            // Only layout when both sizes are known
            this._size = size;
            if (!this._size || !this.orthogonalSize) {
                return;
            }
            if (this.instance) {
                if (this.orientation === splitview_1.Orientation.VERTICAL) {
                    this.instance.layout({ width: this.orthogonalSize, height: this._size });
                }
                else {
                    this.instance.layout({ width: this._size, height: this.orthogonalSize });
                }
                return;
            }
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.orthogonalLayout(this._size);
            }
        };
        SplitPane.prototype.orthogonalLayout = function (size) {
            this.orthogonalSize = size;
            if (this._splitView) {
                this._splitView.layout(this.orthogonalSize);
            }
        };
        return SplitPane;
    }());
    var RootSplitPane = /** @class */ (function (_super) {
        __extends(RootSplitPane, _super);
        function RootSplitPane() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RootSplitPane.prototype.branch = function (container, orientation, instance) {
            if (orientation === splitview_1.Orientation.VERTICAL) {
                this._size = this._width || RootSplitPane._lastKnownWidth;
                this.orthogonalSize = this._height || RootSplitPane._lastKnownHeight;
            }
            else {
                this._size = this._height || RootSplitPane._lastKnownHeight;
                this.orthogonalSize = this._width || RootSplitPane._lastKnownWidth;
            }
            _super.prototype.branch.call(this, container, orientation, instance);
        };
        RootSplitPane.prototype.layoutBox = function (width, height) {
            RootSplitPane._lastKnownWidth = width;
            RootSplitPane._lastKnownHeight = height;
            if (this.orientation === splitview_1.Orientation.VERTICAL) {
                this.layout(width);
                this.orthogonalLayout(height);
            }
            else if (this.orientation === splitview_1.Orientation.HORIZONTAL) {
                this.layout(height);
                this.orthogonalLayout(width);
            }
            else {
                this._width = width;
                this._height = height;
                this.instance.layout({ width: width, height: height });
            }
        };
        return RootSplitPane;
    }(SplitPane));
    var directionOrientation = (_a = {},
        _a[0 /* Left */] = splitview_1.Orientation.HORIZONTAL,
        _a[1 /* Right */] = splitview_1.Orientation.HORIZONTAL,
        _a[2 /* Up */] = splitview_1.Orientation.VERTICAL,
        _a[3 /* Down */] = splitview_1.Orientation.VERTICAL,
        _a);
    var TerminalTab = /** @class */ (function (_super) {
        __extends(TerminalTab, _super);
        function TerminalTab(terminalFocusContextKey, configHelper, _container, shellLaunchConfig, _instantiationService) {
            var _this = _super.call(this) || this;
            _this._container = _container;
            _this._instantiationService = _instantiationService;
            _this._terminalInstances = [];
            _this._onDisposed = new event_1.Emitter();
            _this._onInstancesChanged = new event_1.Emitter();
            var instance = _this._instantiationService.createInstance(terminalInstance_1.TerminalInstance, terminalFocusContextKey, configHelper, undefined, shellLaunchConfig);
            _this._terminalInstances.push(instance);
            _this._initInstanceListeners(instance);
            _this._activeInstanceIndex = 0;
            _this._rootSplitPane = new RootSplitPane();
            _this._rootSplitPane.instance = instance;
            if (_this._container) {
                _this.attachToElement(_this._container);
            }
            return _this;
        }
        Object.defineProperty(TerminalTab.prototype, "terminalInstances", {
            get: function () { return this._terminalInstances; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalTab.prototype, "onDisposed", {
            get: function () { return this._onDisposed.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerminalTab.prototype, "onInstancesChanged", {
            get: function () { return this._onInstancesChanged.event; },
            enumerable: true,
            configurable: true
        });
        TerminalTab.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this._tabElement) {
                this._container.removeChild(this._tabElement);
                this._tabElement = null;
            }
            this._terminalInstances = [];
            this._onInstancesChanged.fire();
        };
        Object.defineProperty(TerminalTab.prototype, "activeInstance", {
            get: function () {
                if (this._terminalInstances.length === 0) {
                    return null;
                }
                return this._terminalInstances[this._activeInstanceIndex];
            },
            enumerable: true,
            configurable: true
        });
        TerminalTab.prototype._initInstanceListeners = function (instance) {
            var _this = this;
            instance.addDisposable(instance.onDisposed(function (instance) { return _this._onInstanceDisposed(instance); }));
            instance.addDisposable(instance.onFocused(function (instance) { return _this._setActiveInstance(instance); }));
        };
        TerminalTab.prototype._onInstanceDisposed = function (instance) {
            // Get the index of the instance and remove it from the list
            var index = this._terminalInstances.indexOf(instance);
            var wasActiveInstance = instance === this.activeInstance;
            if (index !== -1) {
                this._terminalInstances.splice(index, 1);
            }
            // Adjust focus if the instance was active
            if (wasActiveInstance && this._terminalInstances.length > 0) {
                var newIndex = index < this._terminalInstances.length ? index : this._terminalInstances.length - 1;
                this.setActiveInstanceByIndex(newIndex);
                // TODO: Only focus the new instance if the tab had focus?
                this.activeInstance.focus(true);
            }
            // Find the instance's SplitPane and unsplit it
            var pane = this._findSplitPane(instance);
            if (pane) {
                pane.remove();
            }
            // Fire events and dispose tab if it was the last instance
            this._onInstancesChanged.fire();
            if (this._terminalInstances.length === 0) {
                this._onDisposed.fire(this);
                this.dispose();
            }
        };
        TerminalTab.prototype._findSplitPane = function (instance) {
            var openList = [this._rootSplitPane];
            while (openList.length > 0) {
                var current = openList.shift();
                if (current.instance === instance) {
                    return current;
                }
                openList.push.apply(openList, current.children);
            }
            return null;
        };
        // TODO: Should this live inside SplitPane?
        TerminalTab.prototype._findSplitPanePath = function (instance, path) {
            if (path === void 0) { path = [this._rootSplitPane]; }
            // Gets all split panes from the root to the pane containing the instance.
            var pane = path[path.length - 1];
            // Base case: path found
            if (pane.instance === instance) {
                return path;
            }
            // Rescurse child panes
            for (var i = 0; i < pane.children.length; i++) {
                var child = pane.children[i];
                var subPath = path.slice();
                subPath.push(child);
                var result = this._findSplitPanePath(instance, subPath);
                if (result) {
                    return result;
                }
            }
            // No children contain instance
            return null;
        };
        TerminalTab.prototype._setActiveInstance = function (instance) {
            this.setActiveInstanceByIndex(this._getIndexFromId(instance.id));
        };
        TerminalTab.prototype._getIndexFromId = function (terminalId) {
            var terminalIndex = -1;
            this.terminalInstances.forEach(function (terminalInstance, i) {
                if (terminalInstance.id === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error("Terminal with ID " + terminalId + " does not exist (has it already been disposed?)");
            }
            return terminalIndex;
        };
        TerminalTab.prototype.setActiveInstanceByIndex = function (index) {
            // Check for invalid value
            if (index >= this._terminalInstances.length) {
                return;
            }
            var didInstanceChange = this._activeInstanceIndex !== index;
            this._activeInstanceIndex = index;
            if (didInstanceChange) {
                this._onInstancesChanged.fire();
            }
        };
        TerminalTab.prototype.attachToElement = function (element) {
            this._container = element;
            this._tabElement = document.createElement('div');
            this._tabElement.classList.add('terminal-tab');
            this._container.appendChild(this._tabElement);
            this._rootSplitPane.render(this._tabElement);
        };
        Object.defineProperty(TerminalTab.prototype, "title", {
            get: function () {
                var title = this.terminalInstances[0].title;
                for (var i = 1; i < this.terminalInstances.length; i++) {
                    title += ", " + this.terminalInstances[i].title;
                }
                return title;
            },
            enumerable: true,
            configurable: true
        });
        TerminalTab.prototype.setVisible = function (visible) {
            if (this._tabElement) {
                this._tabElement.style.display = visible ? '' : 'none';
            }
            this.terminalInstances.forEach(function (i) { return i.setVisible(visible); });
        };
        TerminalTab.prototype.split = function (terminalFocusContextKey, configHelper, shellLaunchConfig) {
            var instance = this._instantiationService.createInstance(terminalInstance_1.TerminalInstance, terminalFocusContextKey, configHelper, undefined, shellLaunchConfig);
            // TODO: Should this be pulled from the splitpanes instead? Currently there are 2 sources of truth.
            //       _terminalInstances is also the order they were created, not the order in which they appear
            this._terminalInstances.push(instance);
            this._initInstanceListeners(instance);
            if (this._rootSplitPane.instance) {
                this._rootSplitPane.orientation = splitview_1.Orientation.HORIZONTAL;
                this._rootSplitPane.split(instance);
            }
            else {
                // The original branch has already occured, find the inner SplitPane and split it
                var activePane = this._findSplitPane(this.activeInstance);
                activePane.orientation = splitview_1.Orientation.HORIZONTAL;
                activePane.split(instance);
            }
            if (this._tabElement) {
                this._rootSplitPane.render(this._tabElement);
            }
            this._setActiveInstance(instance);
            return instance;
        };
        TerminalTab.prototype.addDisposable = function (disposable) {
            this._register(disposable);
        };
        TerminalTab.prototype.layout = function (width, height) {
            this._rootSplitPane.layoutBox(width, height);
        };
        TerminalTab.prototype.focusDirection = function (direction) {
            var activeInstance = this.activeInstance;
            if (!activeInstance) {
                return null;
            }
            var desiredOrientation = directionOrientation[direction];
            var isUpOrLeft = direction === 0 /* Left */ || direction === 2 /* Up */;
            // Find the closest horizontal SplitPane ancestor with a child to the left
            var closestHorizontalPane = null;
            var panePath = this._findSplitPanePath(activeInstance);
            var index = panePath.length - 1;
            var ancestorIndex;
            while (--index >= 0) {
                var pane = panePath[index];
                // Continue up the path if not the desired orientation
                if (pane.orientation !== desiredOrientation) {
                    continue;
                }
                // Find index of the panePath pane and break out of loop if it's not the left-most child
                ancestorIndex = pane.children.indexOf(panePath[index + 1]);
                // Make sure that the pane is not on the boundary
                if (isUpOrLeft) {
                    if (ancestorIndex > 0) {
                        closestHorizontalPane = pane;
                        break;
                    }
                }
                else {
                    if (ancestorIndex < pane.children.length - 1) {
                        closestHorizontalPane = pane;
                        break;
                    }
                }
            }
            // There are no panes to the left
            if (!closestHorizontalPane) {
                return;
            }
            var current;
            if (isUpOrLeft) {
                // Find the bottom/right-most instance
                current = closestHorizontalPane.children[ancestorIndex - 1];
                while (current.children && current.children.length > 0) {
                    current = current.children[current.children.length - 1];
                }
            }
            else {
                // Find the top/left-most instance
                current = closestHorizontalPane.children[ancestorIndex + 1];
                while (current.children && current.children.length > 0) {
                    current = current.children[0];
                }
            }
            // Focus the instance to the left
            current.instance.focus();
        };
        TerminalTab = __decorate([
            __param(4, instantiation_1.IInstantiationService)
        ], TerminalTab);
        return TerminalTab;
    }(lifecycle_1.Disposable));
    exports.TerminalTab = TerminalTab;
    var _a;
});
