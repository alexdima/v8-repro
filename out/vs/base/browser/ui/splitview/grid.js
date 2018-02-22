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
define(["require", "exports", "vs/base/common/event", "vs/base/browser/ui/sash/sash", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/browser/ui/sash/sash"], function (require, exports, event_1, sash_1, dom_1, splitview_1, sash_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Orientation = sash_2.Orientation;
    var GridNode = /** @class */ (function () {
        function GridNode(parent, orthogonalSize, color) {
            this.parent = parent;
            this.maximumSize = Number.MAX_VALUE;
            this._onDidChange = event_1.default.None;
            this.children = [];
            this.orthogonalSize = orthogonalSize;
            this.color = color || "hsl(" + Math.round(Math.random() * 360) + ", 72%, 72%)";
        }
        Object.defineProperty(GridNode.prototype, "minimumSize", {
            get: function () {
                var result = 0;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    for (var _b = 0, _c = child.children; _b < _c.length; _b++) {
                        var grandchild = _c[_b];
                        result += grandchild.minimumSize;
                    }
                }
                return result === 0 ? 50 : result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GridNode.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange;
            },
            enumerable: true,
            configurable: true
        });
        GridNode.prototype.render = function (container) {
            var _this = this;
            container = dom_1.append(container, dom_1.$('.node'));
            container.style.backgroundColor = this.color;
            dom_1.append(container, dom_1.$('.action', { onclick: function () { return _this.split(container, sash_1.Orientation.HORIZONTAL); } }, '⬌'));
            dom_1.append(container, dom_1.$('.action', { onclick: function () { return _this.split(container, sash_1.Orientation.VERTICAL); } }, '⬍'));
        };
        GridNode.prototype.split = function (container, orientation) {
            if (this.parent && this.parent.orientation === orientation) {
                var index = this.parent.children.indexOf(this);
                this.parent.addChild(this.size / 2, this.orthogonalSize, index + 1);
            }
            else {
                this.branch(container, orientation);
            }
        };
        GridNode.prototype.branch = function (container, orientation) {
            this.orientation = orientation;
            container.innerHTML = '';
            this.splitview = new splitview_1.SplitView(container, { orientation: orientation });
            this.layout(this.size);
            this.orthogonalLayout(this.orthogonalSize);
            this.addChild(this.orthogonalSize / 2, this.size, 0, this.color);
            this.addChild(this.orthogonalSize / 2, this.size);
        };
        GridNode.prototype.layout = function (size) {
            this.size = size;
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var child = _a[_i];
                child.orthogonalLayout(size);
            }
        };
        GridNode.prototype.orthogonalLayout = function (size) {
            this.orthogonalSize = size;
            if (this.splitview) {
                this.splitview.layout(size);
            }
        };
        GridNode.prototype.addChild = function (size, orthogonalSize, index, color) {
            var child = new GridNode(this, orthogonalSize, color);
            this.splitview.addView(child, size, index);
            if (typeof index === 'number') {
                this.children.splice(index, 0, child);
            }
            else {
                this.children.push(child);
            }
            this._onDidChange = event_1.anyEvent.apply(void 0, this.children.map(function (c) { return c.onDidChange; }));
        };
        return GridNode;
    }());
    exports.GridNode = GridNode;
    var RootGridNode = /** @class */ (function (_super) {
        __extends(RootGridNode, _super);
        function RootGridNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RootGridNode.prototype.branch = function (container, orientation) {
            if (orientation === sash_1.Orientation.VERTICAL) {
                this.size = this.width;
                this.orthogonalSize = this.height;
            }
            else {
                this.size = this.height;
                this.orthogonalSize = this.width;
            }
            _super.prototype.branch.call(this, container, orientation);
        };
        RootGridNode.prototype.layoutBox = function (width, height) {
            if (this.orientation === sash_1.Orientation.VERTICAL) {
                this.layout(width);
                this.orthogonalLayout(height);
            }
            else if (this.orientation === sash_1.Orientation.HORIZONTAL) {
                this.layout(height);
                this.orthogonalLayout(width);
            }
            else {
                this.width = width;
                this.height = height;
            }
        };
        return RootGridNode;
    }(GridNode));
    exports.RootGridNode = RootGridNode;
    var Grid = /** @class */ (function () {
        function Grid(container) {
            this.root = new RootGridNode();
            this.root.render(container);
        }
        Grid.prototype.layout = function (width, height) {
            this.root.layoutBox(width, height);
        };
        return Grid;
    }());
    exports.Grid = Grid;
});
