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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/message/common/message", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/workbench/browser/parts/views/viewsViewlet", "vs/platform/configuration/common/configuration", "vs/css!./media/views"], function (require, exports, event_1, lifecycle_1, instantiation_1, message_1, keybinding_1, contextView_1, actions_1, menuItemActionItem_1, contextkey_1, views_1, viewsViewlet_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomTreeViewPanel = /** @class */ (function (_super) {
        __extends(CustomTreeViewPanel, _super);
        function CustomTreeViewPanel(options, messageService, keybindingService, contextMenuService, instantiationService, configurationService, customViewsService) {
            var _this = _super.call(this, __assign({}, options, { ariaHeaderLabel: options.name }), keybindingService, contextMenuService, configurationService) || this;
            _this.messageService = messageService;
            _this.instantiationService = instantiationService;
            _this.treeViewer = customViewsService.getTreeViewer(_this.id);
            _this.disposables.push(lifecycle_1.toDisposable(function () { return _this.treeViewer.setVisibility(false); }));
            _this.menus = _this.instantiationService.createInstance(Menus, _this.id);
            _this.menus.onDidChangeTitle(function () { return _this.updateActions(); }, _this, _this.disposables);
            _this.updateTreeVisibility();
            return _this;
        }
        CustomTreeViewPanel.prototype.setVisible = function (visible) {
            var _this = this;
            return _super.prototype.setVisible.call(this, visible).then(function () { return _this.updateTreeVisibility(); });
        };
        CustomTreeViewPanel.prototype.focus = function () {
            _super.prototype.focus.call(this);
            this.treeViewer.focus();
        };
        CustomTreeViewPanel.prototype.renderBody = function (container) {
            this.treeViewer.show(container);
        };
        CustomTreeViewPanel.prototype.setExpanded = function (expanded) {
            this.treeViewer.setVisibility(this.isVisible() && expanded);
            _super.prototype.setExpanded.call(this, expanded);
        };
        CustomTreeViewPanel.prototype.layoutBody = function (size) {
            this.treeViewer.layout(size);
        };
        CustomTreeViewPanel.prototype.getActions = function () {
            return this.menus.getTitleActions().slice();
        };
        CustomTreeViewPanel.prototype.getSecondaryActions = function () {
            return this.menus.getTitleSecondaryActions();
        };
        CustomTreeViewPanel.prototype.getActionItem = function (action) {
            return action instanceof actions_1.MenuItemAction ? new menuItemActionItem_1.ContextAwareMenuItemActionItem(action, this.keybindingService, this.messageService, this.contextMenuService) : undefined;
        };
        CustomTreeViewPanel.prototype.getOptimalWidth = function () {
            return this.treeViewer.getOptimalWidth();
        };
        CustomTreeViewPanel.prototype.updateTreeVisibility = function () {
            this.treeViewer.setVisibility(this.isVisible() && this.isExpanded());
        };
        CustomTreeViewPanel.prototype.dispose = function () {
            lifecycle_1.dispose(this.disposables);
            _super.prototype.dispose.call(this);
        };
        CustomTreeViewPanel = __decorate([
            __param(1, message_1.IMessageService),
            __param(2, keybinding_1.IKeybindingService),
            __param(3, contextView_1.IContextMenuService),
            __param(4, instantiation_1.IInstantiationService),
            __param(5, configuration_1.IConfigurationService),
            __param(6, views_1.ICustomViewsService)
        ], CustomTreeViewPanel);
        return CustomTreeViewPanel;
    }(viewsViewlet_1.ViewsViewletPanel));
    exports.CustomTreeViewPanel = CustomTreeViewPanel;
    var Menus = /** @class */ (function () {
        function Menus(id, contextKeyService, menuService, contextMenuService) {
            var _this = this;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.disposables = [];
            this.titleDisposable = lifecycle_1.empty;
            this.titleActions = [];
            this.titleSecondaryActions = [];
            this._onDidChangeTitle = new event_1.Emitter();
            if (this.titleDisposable) {
                this.titleDisposable.dispose();
                this.titleDisposable = lifecycle_1.empty;
            }
            var _contextKeyService = this.contextKeyService.createScoped();
            _contextKeyService.createKey('view', id);
            var titleMenu = this.menuService.createMenu(actions_1.MenuId.ViewTitle, _contextKeyService);
            var updateActions = function () {
                _this.titleActions = [];
                _this.titleSecondaryActions = [];
                menuItemActionItem_1.fillInActions(titleMenu, null, { primary: _this.titleActions, secondary: _this.titleSecondaryActions }, _this.contextMenuService);
                _this._onDidChangeTitle.fire();
            };
            var listener = titleMenu.onDidChange(updateActions);
            updateActions();
            this.titleDisposable = lifecycle_1.toDisposable(function () {
                listener.dispose();
                titleMenu.dispose();
                _contextKeyService.dispose();
                _this.titleActions = [];
                _this.titleSecondaryActions = [];
            });
        }
        Object.defineProperty(Menus.prototype, "onDidChangeTitle", {
            get: function () { return this._onDidChangeTitle.event; },
            enumerable: true,
            configurable: true
        });
        Menus.prototype.getTitleActions = function () {
            return this.titleActions;
        };
        Menus.prototype.getTitleSecondaryActions = function () {
            return this.titleSecondaryActions;
        };
        Menus.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        Menus = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, actions_1.IMenuService),
            __param(3, contextView_1.IContextMenuService)
        ], Menus);
        return Menus;
    }());
    exports.Menus = Menus;
});
