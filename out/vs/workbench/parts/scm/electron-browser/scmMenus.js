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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuItemActionItem", "./scmUtil", "vs/platform/contextview/browser/contextView", "vs/css!./media/scmViewlet"], function (require, exports, event_1, lifecycle_1, contextkey_1, actions_1, menuItemActionItem_1, scmUtil_1, contextView_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SCMMenus = /** @class */ (function () {
        function SCMMenus(provider, contextKeyService, menuService, contextMenuService) {
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.titleActions = [];
            this.titleSecondaryActions = [];
            this._onDidChangeTitle = new event_1.Emitter();
            this.disposables = [];
            this.contextKeyService = contextKeyService.createScoped();
            var scmProviderKey = this.contextKeyService.createKey('scmProvider', void 0);
            if (provider) {
                scmProviderKey.set(provider.contextValue);
            }
            else {
                scmProviderKey.set('');
            }
            this.titleMenu = this.menuService.createMenu(actions_1.MenuId.SCMTitle, this.contextKeyService);
            this.disposables.push(this.titleMenu);
            this.titleMenu.onDidChange(this.updateTitleActions, this, this.disposables);
            this.updateTitleActions();
        }
        Object.defineProperty(SCMMenus.prototype, "onDidChangeTitle", {
            get: function () { return this._onDidChangeTitle.event; },
            enumerable: true,
            configurable: true
        });
        SCMMenus.prototype.updateTitleActions = function () {
            this.titleActions = [];
            this.titleSecondaryActions = [];
            // TODO@joao: second arg used to be null
            menuItemActionItem_1.fillInActions(this.titleMenu, { shouldForwardArgs: true }, { primary: this.titleActions, secondary: this.titleSecondaryActions }, this.contextMenuService);
            this._onDidChangeTitle.fire();
        };
        SCMMenus.prototype.getTitleActions = function () {
            return this.titleActions;
        };
        SCMMenus.prototype.getTitleSecondaryActions = function () {
            return this.titleSecondaryActions;
        };
        SCMMenus.prototype.getResourceGroupActions = function (group) {
            return this.getActions(actions_1.MenuId.SCMResourceGroupContext, group).primary;
        };
        SCMMenus.prototype.getResourceGroupContextActions = function (group) {
            return this.getActions(actions_1.MenuId.SCMResourceGroupContext, group).secondary;
        };
        SCMMenus.prototype.getResourceActions = function (resource) {
            return this.getActions(actions_1.MenuId.SCMResourceContext, resource).primary;
        };
        SCMMenus.prototype.getResourceContextActions = function (resource) {
            return this.getActions(actions_1.MenuId.SCMResourceContext, resource).secondary;
        };
        SCMMenus.prototype.getActions = function (menuId, resource) {
            var contextKeyService = this.contextKeyService.createScoped();
            contextKeyService.createKey('scmResourceGroup', scmUtil_1.getSCMResourceContextKey(resource));
            var menu = this.menuService.createMenu(menuId, contextKeyService);
            var primary = [];
            var secondary = [];
            var result = { primary: primary, secondary: secondary };
            menuItemActionItem_1.fillInActions(menu, { shouldForwardArgs: true }, result, this.contextMenuService, function (g) { return /^inline/.test(g); });
            menu.dispose();
            contextKeyService.dispose();
            return result;
        };
        SCMMenus.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        SCMMenus = __decorate([
            __param(1, contextkey_1.IContextKeyService),
            __param(2, actions_1.IMenuService),
            __param(3, contextView_1.IContextMenuService)
        ], SCMMenus);
        return SCMMenus;
    }());
    exports.SCMMenus = SCMMenus;
});
