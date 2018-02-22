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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/workbench/browser/parts/compositePart", "vs/workbench/browser/viewlet", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/part/common/partService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/platform/message/common/message", "vs/platform/telemetry/common/telemetry", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/browser/actions/toggleSidebarVisibility", "vs/css!./media/sidebarpart"], function (require, exports, winjs_base_1, nls, platform_1, actions_1, compositePart_1, viewlet_1, actions_2, actions_3, actionbar_1, viewlet_2, partService_1, storage_1, contextView_1, message_1, telemetry_1, keybinding_1, instantiation_1, themeService_1, colorRegistry_1, theme_1, toggleSidebarVisibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SidebarPart = /** @class */ (function (_super) {
        __extends(SidebarPart, _super);
        function SidebarPart(id, messageService, storageService, telemetryService, contextMenuService, partService, keybindingService, instantiationService, themeService) {
            var _this = _super.call(this, messageService, storageService, telemetryService, contextMenuService, partService, keybindingService, instantiationService, themeService, platform_1.Registry.as(viewlet_1.Extensions.Viewlets), SidebarPart.activeViewletSettingsKey, platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getDefaultViewletId(), 'sideBar', 'viewlet', theme_1.SIDE_BAR_TITLE_FOREGROUND, id, { hasTitle: true, borderWidth: function () { return (_this.getColor(theme_1.SIDE_BAR_BORDER) || _this.getColor(colorRegistry_1.contrastBorder)) ? 1 : 0; } }) || this;
            return _this;
        }
        Object.defineProperty(SidebarPart.prototype, "onDidViewletOpen", {
            get: function () {
                return this._onDidCompositeOpen.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SidebarPart.prototype, "onDidViewletClose", {
            get: function () {
                return this._onDidCompositeClose.event;
            },
            enumerable: true,
            configurable: true
        });
        SidebarPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            // Part container
            var container = this.getContainer();
            container.style('background-color', this.getColor(theme_1.SIDE_BAR_BACKGROUND));
            container.style('color', this.getColor(theme_1.SIDE_BAR_FOREGROUND));
            var borderColor = this.getColor(theme_1.SIDE_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            var isPositionLeft = this.partService.getSideBarPosition() === partService_1.Position.LEFT;
            container.style('border-right-width', borderColor && isPositionLeft ? '1px' : null);
            container.style('border-right-style', borderColor && isPositionLeft ? 'solid' : null);
            container.style('border-right-color', isPositionLeft ? borderColor : null);
            container.style('border-left-width', borderColor && !isPositionLeft ? '1px' : null);
            container.style('border-left-style', borderColor && !isPositionLeft ? 'solid' : null);
            container.style('border-left-color', !isPositionLeft ? borderColor : null);
        };
        SidebarPart.prototype.openViewlet = function (id, focus) {
            var _this = this;
            if (this.blockOpeningViewlet) {
                return winjs_base_1.TPromise.as(null); // Workaround against a potential race condition
            }
            // First check if sidebar is hidden and show if so
            var promise = winjs_base_1.TPromise.wrap(null);
            if (!this.partService.isVisible(partService_1.Parts.SIDEBAR_PART)) {
                try {
                    this.blockOpeningViewlet = true;
                    promise = this.partService.setSideBarHidden(false);
                }
                finally {
                    this.blockOpeningViewlet = false;
                }
            }
            return promise.then(function () { return _this.openComposite(id, focus); });
        };
        SidebarPart.prototype.getActiveViewlet = function () {
            return this.getActiveComposite();
        };
        SidebarPart.prototype.getLastActiveViewletId = function () {
            return this.getLastActiveCompositetId();
        };
        SidebarPart.prototype.hideActiveViewlet = function () {
            return this.hideActiveComposite().then(function (composite) { return void 0; });
        };
        SidebarPart.prototype.layout = function (dimension) {
            if (!this.partService.isVisible(partService_1.Parts.SIDEBAR_PART)) {
                return [dimension];
            }
            return _super.prototype.layout.call(this, dimension);
        };
        SidebarPart.prototype.getTitleAreaContextMenuActions = function () {
            var contextMenuActions = _super.prototype.getTitleAreaContextMenuActions.call(this);
            if (contextMenuActions.length) {
                contextMenuActions.push(new actionbar_1.Separator());
            }
            contextMenuActions.push(this.createHideSideBarAction());
            return contextMenuActions;
        };
        SidebarPart.prototype.createHideSideBarAction = function () {
            var _this = this;
            return {
                id: toggleSidebarVisibility_1.ToggleSidebarVisibilityAction.ID,
                label: nls.localize('compositePart.hideSideBarLabel', "Hide Side Bar"),
                enabled: true,
                run: function () { return _this.partService.setSideBarHidden(true); }
            };
        };
        SidebarPart.activeViewletSettingsKey = 'workbench.sidebar.activeviewletid';
        SidebarPart = __decorate([
            __param(1, message_1.IMessageService),
            __param(2, storage_1.IStorageService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, contextView_1.IContextMenuService),
            __param(5, partService_1.IPartService),
            __param(6, keybinding_1.IKeybindingService),
            __param(7, instantiation_1.IInstantiationService),
            __param(8, themeService_1.IThemeService)
        ], SidebarPart);
        return SidebarPart;
    }(compositePart_1.CompositePart));
    exports.SidebarPart = SidebarPart;
    var FocusSideBarAction = /** @class */ (function (_super) {
        __extends(FocusSideBarAction, _super);
        function FocusSideBarAction(id, label, viewletService, partService) {
            var _this = _super.call(this, id, label) || this;
            _this.viewletService = viewletService;
            _this.partService = partService;
            return _this;
        }
        FocusSideBarAction.prototype.run = function () {
            // Show side bar
            if (!this.partService.isVisible(partService_1.Parts.SIDEBAR_PART)) {
                return this.partService.setSideBarHidden(false);
            }
            // Focus into active viewlet
            var viewlet = this.viewletService.getActiveViewlet();
            if (viewlet) {
                viewlet.focus();
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusSideBarAction.ID = 'workbench.action.focusSideBar';
        FocusSideBarAction.LABEL = nls.localize('focusSideBar', "Focus into Side Bar");
        FocusSideBarAction = __decorate([
            __param(2, viewlet_2.IViewletService),
            __param(3, partService_1.IPartService)
        ], FocusSideBarAction);
        return FocusSideBarAction;
    }(actions_1.Action));
    var registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_3.SyncActionDescriptor(FocusSideBarAction, FocusSideBarAction.ID, FocusSideBarAction.LABEL, {
        primary: 2048 /* CtrlCmd */ | 21 /* KEY_0 */
    }), 'View: Focus into Side Bar', nls.localize('viewCategory', "View"));
});
