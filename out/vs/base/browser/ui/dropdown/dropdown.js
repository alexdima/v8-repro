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
define(["require", "exports", "vs/base/browser/builder", "vs/base/common/winjs.base", "vs/base/browser/touch", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/css!./dropdown"], function (require, exports, builder_1, winjs_base_1, touch_1, actions_1, lifecycle_1, dom_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseDropdown = /** @class */ (function (_super) {
        __extends(BaseDropdown, _super);
        function BaseDropdown(container, options) {
            var _this = _super.call(this) || this;
            _this._toDispose = [];
            _this.$el = builder_1.$('.dropdown').appendTo(container);
            _this.$label = builder_1.$('.dropdown-label');
            var labelRenderer = options.labelRenderer;
            if (!labelRenderer) {
                labelRenderer = function (container) {
                    builder_1.$(container).text(options.label || '');
                    return null;
                };
            }
            _this.$label.on([dom_1.EventType.CLICK, dom_1.EventType.MOUSE_DOWN, touch_1.EventType.Tap], function (e) {
                dom_1.EventHelper.stop(e, true); // prevent default click behaviour to trigger
            }).on([dom_1.EventType.MOUSE_DOWN, touch_1.EventType.Tap], function (e) {
                if (e instanceof MouseEvent && e.detail > 1) {
                    return; // prevent multiple clicks to open multiple context menus (https://github.com/Microsoft/vscode/issues/41363)
                }
                _this.show();
            }).appendTo(_this.$el);
            var cleanupFn = labelRenderer(_this.$label.getHTMLElement());
            if (cleanupFn) {
                _this._toDispose.push(cleanupFn);
            }
            touch_1.Gesture.addTarget(_this.$label.getHTMLElement());
            return _this;
        }
        Object.defineProperty(BaseDropdown.prototype, "toDispose", {
            get: function () {
                return this._toDispose;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseDropdown.prototype, "element", {
            get: function () {
                return this.$el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseDropdown.prototype, "label", {
            get: function () {
                return this.$label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseDropdown.prototype, "tooltip", {
            set: function (tooltip) {
                this.$label.title(tooltip);
            },
            enumerable: true,
            configurable: true
        });
        BaseDropdown.prototype.show = function () {
            // noop
        };
        BaseDropdown.prototype.hide = function () {
            // noop
        };
        BaseDropdown.prototype.onEvent = function (e, activeElement) {
            this.hide();
        };
        BaseDropdown.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.hide();
            this._toDispose = lifecycle_1.dispose(this.toDispose);
            if (this.$boxContainer) {
                this.$boxContainer.destroy();
                this.$boxContainer = null;
            }
            if (this.$contents) {
                this.$contents.destroy();
                this.$contents = null;
            }
            if (this.$label) {
                this.$label.destroy();
                this.$label = null;
            }
        };
        return BaseDropdown;
    }(actions_1.ActionRunner));
    exports.BaseDropdown = BaseDropdown;
    var Dropdown = /** @class */ (function (_super) {
        __extends(Dropdown, _super);
        function Dropdown(container, options) {
            var _this = _super.call(this, container, options) || this;
            _this.contextViewProvider = options.contextViewProvider;
            return _this;
        }
        Dropdown.prototype.show = function () {
            var _this = this;
            this.element.addClass('active');
            this.contextViewProvider.showContextView({
                getAnchor: function () { return _this.element.getHTMLElement(); },
                render: function (container) {
                    return _this.renderContents(container);
                },
                onDOMEvent: function (e, activeElement) {
                    _this.onEvent(e, activeElement);
                },
                onHide: function () {
                    _this.element.removeClass('active');
                }
            });
        };
        Dropdown.prototype.hide = function () {
            if (this.contextViewProvider) {
                this.contextViewProvider.hideContextView();
            }
        };
        Dropdown.prototype.renderContents = function (container) {
            return null;
        };
        return Dropdown;
    }(BaseDropdown));
    exports.Dropdown = Dropdown;
    var DropdownMenu = /** @class */ (function (_super) {
        __extends(DropdownMenu, _super);
        function DropdownMenu(container, options) {
            var _this = _super.call(this, container, options) || this;
            _this._contextMenuProvider = options.contextMenuProvider;
            _this.actions = options.actions || [];
            _this.actionProvider = options.actionProvider;
            _this.menuClassName = options.menuClassName || '';
            return _this;
        }
        Object.defineProperty(DropdownMenu.prototype, "menuOptions", {
            get: function () {
                return this._menuOptions;
            },
            set: function (options) {
                this._menuOptions = options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropdownMenu.prototype, "actions", {
            get: function () {
                if (this.actionProvider) {
                    return this.actionProvider.getActions();
                }
                return this._actions;
            },
            set: function (actions) {
                this._actions = actions;
            },
            enumerable: true,
            configurable: true
        });
        DropdownMenu.prototype.show = function () {
            var _this = this;
            this.element.addClass('active');
            this._contextMenuProvider.showContextMenu({
                getAnchor: function () { return _this.element.getHTMLElement(); },
                getActions: function () { return winjs_base_1.TPromise.as(_this.actions); },
                getActionsContext: function () { return _this.menuOptions ? _this.menuOptions.context : null; },
                getActionItem: function (action) { return _this.menuOptions && _this.menuOptions.actionItemProvider ? _this.menuOptions.actionItemProvider(action) : null; },
                getKeyBinding: function (action) { return _this.menuOptions && _this.menuOptions.getKeyBinding ? _this.menuOptions.getKeyBinding(action) : null; },
                getMenuClassName: function () { return _this.menuClassName; },
                onHide: function () { return _this.element.removeClass('active'); }
            });
        };
        DropdownMenu.prototype.hide = function () {
            // noop
        };
        return DropdownMenu;
    }(BaseDropdown));
    exports.DropdownMenu = DropdownMenu;
});
