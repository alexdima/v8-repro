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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/part/common/partService", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/browser/mouseEvent", "vs/base/browser/keyboardEvent", "vs/workbench/browser/parts/compositebar/compositeBarActions", "vs/css!./media/activityaction"], function (require, exports, DOM, touch_1, winjs_base_1, actions_1, contextView_1, lifecycle_1, viewlet_1, partService_1, themeService_1, colorRegistry_1, mouseEvent_1, keyboardEvent_1, compositeBarActions_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ViewletActivityAction = /** @class */ (function (_super) {
        __extends(ViewletActivityAction, _super);
        function ViewletActivityAction(activity, viewletService, partService) {
            var _this = _super.call(this, activity) || this;
            _this.viewletService = viewletService;
            _this.partService = partService;
            _this.lastRun = 0;
            return _this;
        }
        ViewletActivityAction.prototype.run = function (event) {
            var _this = this;
            if (event instanceof MouseEvent && event.button === 2) {
                return winjs_base_1.TPromise.as(false); // do not run on right click
            }
            // prevent accident trigger on a doubleclick (to help nervous people)
            var now = Date.now();
            if (now > this.lastRun /* https://github.com/Microsoft/vscode/issues/25830 */ && now - this.lastRun < ViewletActivityAction.preventDoubleClickDelay) {
                return winjs_base_1.TPromise.as(true);
            }
            this.lastRun = now;
            var sideBarVisible = this.partService.isVisible(partService_1.Parts.SIDEBAR_PART);
            var activeViewlet = this.viewletService.getActiveViewlet();
            // Hide sidebar if selected viewlet already visible
            if (sideBarVisible && activeViewlet && activeViewlet.getId() === this.activity.id) {
                return this.partService.setSideBarHidden(true);
            }
            return this.viewletService.openViewlet(this.activity.id, true).then(function () { return _this.activate(); });
        };
        ViewletActivityAction.preventDoubleClickDelay = 300;
        ViewletActivityAction = __decorate([
            __param(1, viewlet_1.IViewletService),
            __param(2, partService_1.IPartService)
        ], ViewletActivityAction);
        return ViewletActivityAction;
    }(compositeBarActions_1.ActivityAction));
    exports.ViewletActivityAction = ViewletActivityAction;
    var ToggleViewletAction = /** @class */ (function (_super) {
        __extends(ToggleViewletAction, _super);
        function ToggleViewletAction(_viewlet, partService, viewletService) {
            var _this = _super.call(this, _viewlet.id, _viewlet.name) || this;
            _this._viewlet = _viewlet;
            _this.partService = partService;
            _this.viewletService = viewletService;
            return _this;
        }
        ToggleViewletAction.prototype.run = function () {
            var sideBarVisible = this.partService.isVisible(partService_1.Parts.SIDEBAR_PART);
            var activeViewlet = this.viewletService.getActiveViewlet();
            // Hide sidebar if selected viewlet already visible
            if (sideBarVisible && activeViewlet && activeViewlet.getId() === this._viewlet.id) {
                return this.partService.setSideBarHidden(true);
            }
            return this.viewletService.openViewlet(this._viewlet.id, true);
        };
        ToggleViewletAction = __decorate([
            __param(1, partService_1.IPartService),
            __param(2, viewlet_1.IViewletService)
        ], ToggleViewletAction);
        return ToggleViewletAction;
    }(actions_1.Action));
    exports.ToggleViewletAction = ToggleViewletAction;
    var GlobalActivityAction = /** @class */ (function (_super) {
        __extends(GlobalActivityAction, _super);
        function GlobalActivityAction(activity) {
            return _super.call(this, activity) || this;
        }
        return GlobalActivityAction;
    }(compositeBarActions_1.ActivityAction));
    exports.GlobalActivityAction = GlobalActivityAction;
    var GlobalActivityActionItem = /** @class */ (function (_super) {
        __extends(GlobalActivityActionItem, _super);
        function GlobalActivityActionItem(action, colors, themeService, contextMenuService) {
            var _this = _super.call(this, action, { draggable: false, colors: colors, icon: true }, themeService) || this;
            _this.contextMenuService = contextMenuService;
            return _this;
        }
        GlobalActivityActionItem.prototype.render = function (container) {
            var _this = this;
            _super.prototype.render.call(this, container);
            // Context menus are triggered on mouse down so that an item can be picked
            // and executed with releasing the mouse over it
            this.$container.on(DOM.EventType.MOUSE_DOWN, function (e) {
                DOM.EventHelper.stop(e, true);
                var event = new mouseEvent_1.StandardMouseEvent(e);
                _this.showContextMenu({ x: event.posx, y: event.posy });
            });
            this.$container.on(DOM.EventType.KEY_UP, function (e) {
                var event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
                    DOM.EventHelper.stop(e, true);
                    _this.showContextMenu(_this.$container.getHTMLElement());
                }
            });
            this.$container.on(touch_1.EventType.Tap, function (e) {
                DOM.EventHelper.stop(e, true);
                var event = new mouseEvent_1.StandardMouseEvent(e);
                _this.showContextMenu({ x: event.posx, y: event.posy });
            });
        };
        GlobalActivityActionItem.prototype.showContextMenu = function (location) {
            var globalAction = this._action;
            var activity = globalAction.activity;
            var actions = activity.getActions();
            this.contextMenuService.showContextMenu({
                getAnchor: function () { return location; },
                getActions: function () { return winjs_base_1.TPromise.as(actions); },
                onHide: function () { return lifecycle_1.dispose(actions); }
            });
        };
        GlobalActivityActionItem = __decorate([
            __param(2, themeService_1.IThemeService),
            __param(3, contextView_1.IContextMenuService)
        ], GlobalActivityActionItem);
        return GlobalActivityActionItem;
    }(compositeBarActions_1.ActivityActionItem));
    exports.GlobalActivityActionItem = GlobalActivityActionItem;
    themeService_1.registerThemingParticipant(function (theme, collector) {
        // Styling with Outline color (e.g. high contrast theme)
        var outline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (outline) {
            collector.addRule("\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:before {\n\t\t\t\tcontent: \"\";\n\t\t\t\tposition: absolute;\n\t\t\t\ttop: 9px;\n\t\t\t\tleft: 9px;\n\t\t\t\theight: 32px;\n\t\t\t\twidth: 32px;\n\t\t\t\topacity: 0.6;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active:hover:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked:hover:before {\n\t\t\t\toutline: 1px solid;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:hover:before {\n\t\t\t\toutline: 1px dashed;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:hover:before {\n\t\t\t\topacity: 1;\n\t\t\t}\n\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:focus:before {\n\t\t\t\tborder-left-color: " + outline + ";\n\t\t\t}\n\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active:hover:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked:hover:before,\n\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:hover:before {\n\t\t\t\toutline-color: " + outline + ";\n\t\t\t}\n\t\t");
        }
        else {
            var focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusBorderColor) {
                collector.addRule("\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.active .action-label,\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item.checked .action-label,\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:focus .action-label,\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:hover .action-label {\n\t\t\t\t\topacity: 1;\n\t\t\t\t}\n\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item .action-label {\n\t\t\t\t\topacity: 0.6;\n\t\t\t\t}\n\n\t\t\t\t.monaco-workbench > .activitybar > .content .monaco-action-bar .action-item:focus:before {\n\t\t\t\t\tborder-left-color: " + focusBorderColor + ";\n\t\t\t\t}\n\t\t\t");
            }
        }
    });
});
