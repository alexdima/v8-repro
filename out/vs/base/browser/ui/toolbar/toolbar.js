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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/browser/builder", "vs/base/common/types", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/dropdown/dropdown", "vs/css!./toolbar"], function (require, exports, nls, winjs_base_1, builder_1, types, actions_1, actionbar_1, dropdown_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXT = 'context.toolbar';
    /**
     * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
     */
    var ToolBar = /** @class */ (function () {
        function ToolBar(container, contextMenuProvider, options) {
            if (options === void 0) { options = { orientation: actionbar_1.ActionsOrientation.HORIZONTAL }; }
            var _this = this;
            this.options = options;
            this.lookupKeybindings = typeof this.options.getKeyBinding === 'function';
            this.toggleMenuAction = new ToggleMenuAction(function () { return _this.toggleMenuActionItem && _this.toggleMenuActionItem.show(); });
            var element = document.createElement('div');
            element.className = 'monaco-toolbar';
            container.appendChild(element);
            this.actionBar = new actionbar_1.ActionBar(builder_1.$(element), {
                orientation: options.orientation,
                ariaLabel: options.ariaLabel,
                actionRunner: options.actionRunner,
                actionItemProvider: function (action) {
                    // Return special action item for the toggle menu action
                    if (action.id === ToggleMenuAction.ID) {
                        // Dispose old
                        if (_this.toggleMenuActionItem) {
                            _this.toggleMenuActionItem.dispose();
                        }
                        // Create new
                        _this.toggleMenuActionItem = new DropdownMenuActionItem(action, action.menuActions, contextMenuProvider, _this.options.actionItemProvider, _this.actionRunner, _this.options.getKeyBinding, 'toolbar-toggle-more');
                        _this.toggleMenuActionItem.setActionContext(_this.actionBar.context);
                        return _this.toggleMenuActionItem;
                    }
                    return options.actionItemProvider ? options.actionItemProvider(action) : null;
                }
            });
        }
        Object.defineProperty(ToolBar.prototype, "actionRunner", {
            get: function () {
                return this.actionBar.actionRunner;
            },
            set: function (actionRunner) {
                this.actionBar.actionRunner = actionRunner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolBar.prototype, "context", {
            set: function (context) {
                this.actionBar.context = context;
                if (this.toggleMenuActionItem) {
                    this.toggleMenuActionItem.setActionContext(context);
                }
            },
            enumerable: true,
            configurable: true
        });
        ToolBar.prototype.getContainer = function () {
            return this.actionBar.getContainer();
        };
        ToolBar.prototype.setAriaLabel = function (label) {
            this.actionBar.setAriaLabel(label);
        };
        ToolBar.prototype.setActions = function (primaryActions, secondaryActions) {
            var _this = this;
            return function () {
                var primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
                // Inject additional action to open secondary actions if present
                _this.hasSecondaryActions = secondaryActions && secondaryActions.length > 0;
                if (_this.hasSecondaryActions) {
                    _this.toggleMenuAction.menuActions = secondaryActions.slice(0);
                    primaryActionsToSet.push(_this.toggleMenuAction);
                }
                _this.actionBar.clear();
                primaryActionsToSet.forEach(function (action) {
                    _this.actionBar.push(action, { icon: true, label: false, keybinding: _this.getKeybindingLabel(action) });
                });
            };
        };
        ToolBar.prototype.getKeybindingLabel = function (action) {
            var key = this.lookupKeybindings ? this.options.getKeyBinding(action) : void 0;
            return key ? key.getLabel() : void 0;
        };
        ToolBar.prototype.addPrimaryAction = function (primaryAction) {
            var _this = this;
            return function () {
                // Add after the "..." action if we have secondary actions
                if (_this.hasSecondaryActions) {
                    var itemCount = _this.actionBar.length();
                    _this.actionBar.push(primaryAction, { icon: true, label: false, index: itemCount, keybinding: _this.getKeybindingLabel(primaryAction) });
                }
                else {
                    _this.actionBar.push(primaryAction, { icon: true, label: false, keybinding: _this.getKeybindingLabel(primaryAction) });
                }
            };
        };
        ToolBar.prototype.dispose = function () {
            this.actionBar.dispose();
            this.toggleMenuAction.dispose();
            if (this.toggleMenuActionItem) {
                this.toggleMenuActionItem.dispose();
            }
        };
        return ToolBar;
    }());
    exports.ToolBar = ToolBar;
    var ToggleMenuAction = /** @class */ (function (_super) {
        __extends(ToggleMenuAction, _super);
        function ToggleMenuAction(toggleDropdownMenu) {
            var _this = _super.call(this, ToggleMenuAction.ID, nls.localize('more', "More"), null, true) || this;
            _this.toggleDropdownMenu = toggleDropdownMenu;
            return _this;
        }
        ToggleMenuAction.prototype.run = function () {
            this.toggleDropdownMenu();
            return winjs_base_1.TPromise.as(true);
        };
        Object.defineProperty(ToggleMenuAction.prototype, "menuActions", {
            get: function () {
                return this._menuActions;
            },
            set: function (actions) {
                this._menuActions = actions;
            },
            enumerable: true,
            configurable: true
        });
        ToggleMenuAction.ID = 'toolbar.toggle.more';
        return ToggleMenuAction;
    }(actions_1.Action));
    var DropdownMenuActionItem = /** @class */ (function (_super) {
        __extends(DropdownMenuActionItem, _super);
        function DropdownMenuActionItem(action, menuActionsOrProvider, contextMenuProvider, actionItemProvider, actionRunner, keybindings, clazz) {
            var _this = _super.call(this, null, action) || this;
            _this.menuActionsOrProvider = menuActionsOrProvider;
            _this.contextMenuProvider = contextMenuProvider;
            _this.actionItemProvider = actionItemProvider;
            _this.actionRunner = actionRunner;
            _this.keybindings = keybindings;
            _this.clazz = clazz;
            return _this;
        }
        DropdownMenuActionItem.prototype.render = function (container) {
            var _this = this;
            var labelRenderer = function (el) {
                _this.builder = builder_1.$('a.action-label').attr({
                    tabIndex: '0',
                    role: 'button',
                    'aria-haspopup': 'true',
                    title: _this._action.label || '',
                    class: _this.clazz
                });
                _this.builder.appendTo(el);
                return null;
            };
            var options = {
                contextMenuProvider: this.contextMenuProvider,
                labelRenderer: labelRenderer
            };
            // Render the DropdownMenu around a simple action to toggle it
            if (types.isArray(this.menuActionsOrProvider)) {
                options.actions = this.menuActionsOrProvider;
            }
            else {
                options.actionProvider = this.menuActionsOrProvider;
            }
            this.dropdownMenu = new dropdown_1.DropdownMenu(container, options);
            this.dropdownMenu.menuOptions = {
                actionItemProvider: this.actionItemProvider,
                actionRunner: this.actionRunner,
                getKeyBinding: this.keybindings,
                context: this._context
            };
        };
        DropdownMenuActionItem.prototype.setActionContext = function (newContext) {
            _super.prototype.setActionContext.call(this, newContext);
            if (this.dropdownMenu) {
                this.dropdownMenu.menuOptions.context = newContext;
            }
        };
        DropdownMenuActionItem.prototype.show = function () {
            if (this.dropdownMenu) {
                this.dropdownMenu.show();
            }
        };
        DropdownMenuActionItem.prototype.dispose = function () {
            this.dropdownMenu.dispose();
            _super.prototype.dispose.call(this);
        };
        return DropdownMenuActionItem;
    }(actionbar_1.BaseActionItem));
    exports.DropdownMenuActionItem = DropdownMenuActionItem;
});
