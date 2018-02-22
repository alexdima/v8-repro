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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/browser/builder", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/activity", "vs/platform/registry/common/platform", "vs/workbench/browser/part", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/part/common/partService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/base/browser/mouseEvent", "vs/base/common/lifecycle", "vs/workbench/browser/actions/toggleActivityBarVisibility", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositebar/compositeBar", "vs/workbench/browser/parts/compositebar/compositeBarActions", "vs/css!./media/activitybarpart"], function (require, exports, nls, winjs_base_1, errors_1, builder_1, actionbar_1, activity_1, platform_1, part_1, activitybarActions_1, viewlet_1, partService_1, instantiation_1, contextView_1, mouseEvent_1, lifecycle_1, toggleActivityBarVisibility_1, themeService_1, theme_1, colorRegistry_1, compositeBar_1, compositeBarActions_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActivitybarPart = /** @class */ (function (_super) {
        __extends(ActivitybarPart, _super);
        function ActivitybarPart(id, viewletService, contextMenuService, instantiationService, partService, themeService) {
            var _this = _super.call(this, id, { hasTitle: false }, themeService) || this;
            _this.viewletService = viewletService;
            _this.contextMenuService = contextMenuService;
            _this.instantiationService = instantiationService;
            _this.partService = partService;
            _this.globalActivityIdToActions = Object.create(null);
            _this.compositeBar = _this.instantiationService.createInstance(compositeBar_1.CompositeBar, {
                icon: true,
                storageId: ActivitybarPart.PINNED_VIEWLETS,
                orientation: actionbar_1.ActionsOrientation.VERTICAL,
                composites: _this.viewletService.getViewlets(),
                openComposite: function (compositeId) { return _this.viewletService.openViewlet(compositeId, true); },
                getActivityAction: function (compositeId) { return _this.instantiationService.createInstance(activitybarActions_1.ViewletActivityAction, _this.viewletService.getViewlet(compositeId)); },
                getCompositePinnedAction: function (compositeId) { return new compositeBarActions_1.ToggleCompositePinnedAction(_this.viewletService.getViewlet(compositeId), _this.compositeBar); },
                getOnCompositeClickAction: function (compositeId) { return _this.instantiationService.createInstance(activitybarActions_1.ToggleViewletAction, _this.viewletService.getViewlet(compositeId)); },
                getDefaultCompositeId: function () { return _this.viewletService.getDefaultViewletId(); },
                hidePart: function () { return _this.partService.setSideBarHidden(true); },
                colors: ActivitybarPart.COLORS,
                overflowActionSize: ActivitybarPart.ACTION_HEIGHT
            });
            _this.registerListeners();
            return _this;
        }
        ActivitybarPart.prototype.registerListeners = function () {
            var _this = this;
            // Activate viewlet action on opening of a viewlet
            this.toUnbind.push(this.viewletService.onDidViewletOpen(function (viewlet) { return _this.compositeBar.activateComposite(viewlet.getId()); }));
            // Deactivate viewlet action on close
            this.toUnbind.push(this.viewletService.onDidViewletClose(function (viewlet) { return _this.compositeBar.deactivateComposite(viewlet.getId()); }));
            this.toUnbind.push(this.compositeBar.onDidContextMenu(function (e) { return _this.showContextMenu(e); }));
        };
        ActivitybarPart.prototype.showActivity = function (viewletOrActionId, badge, clazz, priority) {
            if (this.viewletService.getViewlet(viewletOrActionId)) {
                return this.compositeBar.showActivity(viewletOrActionId, badge, clazz, priority);
            }
            return this.showGlobalActivity(viewletOrActionId, badge, clazz);
        };
        ActivitybarPart.prototype.showGlobalActivity = function (globalActivityId, badge, clazz) {
            if (!badge) {
                throw errors_1.illegalArgument('badge');
            }
            var action = this.globalActivityIdToActions[globalActivityId];
            if (!action) {
                throw errors_1.illegalArgument('globalActivityId');
            }
            action.setBadge(badge, clazz);
            return lifecycle_1.toDisposable(function () { return action.setBadge(undefined); });
        };
        ActivitybarPart.prototype.createContentArea = function (parent) {
            var $el = builder_1.$(parent);
            var $result = builder_1.$('.content').appendTo($el);
            // Top Actionbar with action items for each viewlet action
            this.compositeBar.create($result.getHTMLElement());
            // Top Actionbar with action items for each viewlet action
            this.createGlobalActivityActionBar(builder_1.$('.global-activity').appendTo($result).getHTMLElement());
            return $result;
        };
        ActivitybarPart.prototype.updateStyles = function () {
            _super.prototype.updateStyles.call(this);
            // Part container
            var container = this.getContainer();
            var background = this.getColor(theme_1.ACTIVITY_BAR_BACKGROUND);
            container.style('background-color', background);
            var borderColor = this.getColor(theme_1.ACTIVITY_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            var isPositionLeft = this.partService.getSideBarPosition() === partService_1.Position.LEFT;
            container.style('box-sizing', borderColor && isPositionLeft ? 'border-box' : null);
            container.style('border-right-width', borderColor && isPositionLeft ? '1px' : null);
            container.style('border-right-style', borderColor && isPositionLeft ? 'solid' : null);
            container.style('border-right-color', isPositionLeft ? borderColor : null);
            container.style('border-left-width', borderColor && !isPositionLeft ? '1px' : null);
            container.style('border-left-style', borderColor && !isPositionLeft ? 'solid' : null);
            container.style('border-left-color', !isPositionLeft ? borderColor : null);
        };
        ActivitybarPart.prototype.showContextMenu = function (e) {
            var _this = this;
            var event = new mouseEvent_1.StandardMouseEvent(e);
            var actions = this.viewletService.getViewlets().map(function (viewlet) { return _this.instantiationService.createInstance(compositeBarActions_1.ToggleCompositePinnedAction, viewlet, _this.compositeBar); });
            actions.push(new actionbar_1.Separator());
            actions.push(this.instantiationService.createInstance(toggleActivityBarVisibility_1.ToggleActivityBarVisibilityAction, toggleActivityBarVisibility_1.ToggleActivityBarVisibilityAction.ID, nls.localize('hideActivitBar', "Hide Activity Bar")));
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return { x: event.posx, y: event.posy }; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); },
                onHide: function () { return lifecycle_1.dispose(actions); }
            });
        };
        ActivitybarPart.prototype.createGlobalActivityActionBar = function (container) {
            var _this = this;
            var activityRegistry = platform_1.Registry.as(activity_1.GlobalActivityExtensions);
            var descriptors = activityRegistry.getActivities();
            var actions = descriptors
                .map(function (d) { return _this.instantiationService.createInstance(d); })
                .map(function (a) { return new activitybarActions_1.GlobalActivityAction(a); });
            this.globalActionBar = new actionbar_1.ActionBar(container, {
                actionItemProvider: function (a) { return _this.instantiationService.createInstance(activitybarActions_1.GlobalActivityActionItem, a, ActivitybarPart.COLORS); },
                orientation: actionbar_1.ActionsOrientation.VERTICAL,
                ariaLabel: nls.localize('globalActions', "Global Actions"),
                animated: false
            });
            actions.forEach(function (a) {
                _this.globalActivityIdToActions[a.id] = a;
                _this.globalActionBar.push(a);
            });
        };
        ActivitybarPart.prototype.getPinned = function () {
            var _this = this;
            return this.viewletService.getViewlets().map(function (v) { return v.id; }).filter(function (id) { return _this.compositeBar.isPinned(id); });
        };
        /**
         * Layout title, content and status area in the given dimension.
         */
        ActivitybarPart.prototype.layout = function (dimension) {
            if (!this.partService.isVisible(partService_1.Parts.ACTIVITYBAR_PART)) {
                return [dimension];
            }
            // Pass to super
            var sizes = _super.prototype.layout.call(this, dimension);
            this.dimension = sizes[1];
            var availableHeight = this.dimension.height;
            if (this.globalActionBar) {
                // adjust height for global actions showing
                availableHeight -= (this.globalActionBar.items.length * ActivitybarPart.ACTION_HEIGHT);
            }
            this.compositeBar.layout(new builder_1.Dimension(dimension.width, availableHeight));
            return sizes;
        };
        ActivitybarPart.prototype.dispose = function () {
            if (this.compositeBar) {
                this.compositeBar.dispose();
                this.compositeBar = null;
            }
            if (this.globalActionBar) {
                this.globalActionBar.dispose();
                this.globalActionBar = null;
            }
            _super.prototype.dispose.call(this);
        };
        ActivitybarPart.PINNED_VIEWLETS = 'workbench.activity.pinnedViewlets';
        ActivitybarPart.COLORS = {
            backgroundColor: theme_1.ACTIVITY_BAR_FOREGROUND,
            badgeBackground: theme_1.ACTIVITY_BAR_BADGE_BACKGROUND,
            badgeForeground: theme_1.ACTIVITY_BAR_BADGE_FOREGROUND,
            dragAndDropBackground: theme_1.ACTIVITY_BAR_DRAG_AND_DROP_BACKGROUND
        };
        ActivitybarPart.ACTION_HEIGHT = 50;
        ActivitybarPart = __decorate([
            __param(1, viewlet_1.IViewletService),
            __param(2, contextView_1.IContextMenuService),
            __param(3, instantiation_1.IInstantiationService),
            __param(4, partService_1.IPartService),
            __param(5, themeService_1.IThemeService)
        ], ActivitybarPart);
        return ActivitybarPart;
    }(part_1.Part));
    exports.ActivitybarPart = ActivitybarPart;
});
