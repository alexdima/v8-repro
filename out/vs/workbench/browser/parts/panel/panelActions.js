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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/lifecycle", "vs/base/common/actions", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/part/common/partService", "vs/workbench/browser/parts/compositebar/compositeBarActions", "vs/css!./media/panelpart"], function (require, exports, nls, winjs_base_1, lifecycle_1, actions_1, platform_1, actions_2, actions_3, panelService_1, partService_1, compositeBarActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ClosePanelAction = /** @class */ (function (_super) {
        __extends(ClosePanelAction, _super);
        function ClosePanelAction(id, name, partService) {
            var _this = _super.call(this, id, name, 'hide-panel-action') || this;
            _this.partService = partService;
            return _this;
        }
        ClosePanelAction.prototype.run = function () {
            return this.partService.setPanelHidden(true);
        };
        ClosePanelAction.ID = 'workbench.action.closePanel';
        ClosePanelAction.LABEL = nls.localize('closePanel', "Close Panel");
        ClosePanelAction = __decorate([
            __param(2, partService_1.IPartService)
        ], ClosePanelAction);
        return ClosePanelAction;
    }(actions_1.Action));
    exports.ClosePanelAction = ClosePanelAction;
    var TogglePanelAction = /** @class */ (function (_super) {
        __extends(TogglePanelAction, _super);
        function TogglePanelAction(id, name, partService) {
            var _this = _super.call(this, id, name, partService.isVisible(partService_1.Parts.PANEL_PART) ? 'panel expanded' : 'panel') || this;
            _this.partService = partService;
            return _this;
        }
        TogglePanelAction.prototype.run = function () {
            return this.partService.setPanelHidden(this.partService.isVisible(partService_1.Parts.PANEL_PART));
        };
        TogglePanelAction.ID = 'workbench.action.togglePanel';
        TogglePanelAction.LABEL = nls.localize('togglePanel', "Toggle Panel");
        TogglePanelAction = __decorate([
            __param(2, partService_1.IPartService)
        ], TogglePanelAction);
        return TogglePanelAction;
    }(actions_1.Action));
    exports.TogglePanelAction = TogglePanelAction;
    var FocusPanelAction = /** @class */ (function (_super) {
        __extends(FocusPanelAction, _super);
        function FocusPanelAction(id, label, panelService, partService) {
            var _this = _super.call(this, id, label) || this;
            _this.panelService = panelService;
            _this.partService = partService;
            return _this;
        }
        FocusPanelAction.prototype.run = function () {
            // Show panel
            if (!this.partService.isVisible(partService_1.Parts.PANEL_PART)) {
                return this.partService.setPanelHidden(false);
            }
            // Focus into active panel
            var panel = this.panelService.getActivePanel();
            if (panel) {
                panel.focus();
            }
            return winjs_base_1.TPromise.as(true);
        };
        FocusPanelAction.ID = 'workbench.action.focusPanel';
        FocusPanelAction.LABEL = nls.localize('focusPanel', "Focus into Panel");
        FocusPanelAction = __decorate([
            __param(2, panelService_1.IPanelService),
            __param(3, partService_1.IPartService)
        ], FocusPanelAction);
        return FocusPanelAction;
    }(actions_1.Action));
    var TogglePanelPositionAction = /** @class */ (function (_super) {
        __extends(TogglePanelPositionAction, _super);
        function TogglePanelPositionAction(id, label, partService) {
            var _this = _super.call(this, id, label, partService.getPanelPosition() === partService_1.Position.RIGHT ? 'move-panel-to-bottom' : 'move-panel-to-right') || this;
            _this.partService = partService;
            _this.toDispose = [];
            var setClassAndLabel = function () {
                var positionRight = _this.partService.getPanelPosition() === partService_1.Position.RIGHT;
                _this.class = positionRight ? 'move-panel-to-bottom' : 'move-panel-to-right';
                _this.label = positionRight ? TogglePanelPositionAction.MOVE_TO_BOTTOM_LABEL : TogglePanelPositionAction.MOVE_TO_RIGHT_LABEL;
            };
            _this.toDispose.push(partService.onEditorLayout(function () { return setClassAndLabel(); }));
            setClassAndLabel();
            return _this;
        }
        TogglePanelPositionAction.prototype.run = function () {
            var position = this.partService.getPanelPosition();
            return this.partService.setPanelPosition(position === partService_1.Position.BOTTOM ? partService_1.Position.RIGHT : partService_1.Position.BOTTOM);
        };
        TogglePanelPositionAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        TogglePanelPositionAction.ID = 'workbench.action.togglePanelPosition';
        TogglePanelPositionAction.LABEL = nls.localize('toggledPanelPosition', "Toggle Panel Position");
        TogglePanelPositionAction.MOVE_TO_RIGHT_LABEL = nls.localize('moveToRight', "Move to Right");
        TogglePanelPositionAction.MOVE_TO_BOTTOM_LABEL = nls.localize('moveToBottom', "Move to Bottom");
        TogglePanelPositionAction = __decorate([
            __param(2, partService_1.IPartService)
        ], TogglePanelPositionAction);
        return TogglePanelPositionAction;
    }(actions_1.Action));
    exports.TogglePanelPositionAction = TogglePanelPositionAction;
    var ToggleMaximizedPanelAction = /** @class */ (function (_super) {
        __extends(ToggleMaximizedPanelAction, _super);
        function ToggleMaximizedPanelAction(id, label, partService) {
            var _this = _super.call(this, id, label, partService.isPanelMaximized() ? 'minimize-panel-action' : 'maximize-panel-action') || this;
            _this.partService = partService;
            _this.toDispose = [];
            _this.toDispose.push(partService.onEditorLayout(function () {
                var maximized = _this.partService.isPanelMaximized();
                _this.class = maximized ? 'minimize-panel-action' : 'maximize-panel-action';
                _this.label = maximized ? ToggleMaximizedPanelAction.RESTORE_LABEL : ToggleMaximizedPanelAction.MAXIMIZE_LABEL;
            }));
            return _this;
        }
        ToggleMaximizedPanelAction.prototype.run = function () {
            var _this = this;
            // Show panel
            return (!this.partService.isVisible(partService_1.Parts.PANEL_PART) ? this.partService.setPanelHidden(false) : winjs_base_1.TPromise.as(null))
                .then(function () { return _this.partService.toggleMaximizedPanel(); });
        };
        ToggleMaximizedPanelAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        ToggleMaximizedPanelAction.ID = 'workbench.action.toggleMaximizedPanel';
        ToggleMaximizedPanelAction.LABEL = nls.localize('toggleMaximizedPanel', "Toggle Maximized Panel");
        ToggleMaximizedPanelAction.MAXIMIZE_LABEL = nls.localize('maximizePanel', "Maximize Panel Size");
        ToggleMaximizedPanelAction.RESTORE_LABEL = nls.localize('minimizePanel', "Restore Panel Size");
        ToggleMaximizedPanelAction = __decorate([
            __param(2, partService_1.IPartService)
        ], ToggleMaximizedPanelAction);
        return ToggleMaximizedPanelAction;
    }(actions_1.Action));
    exports.ToggleMaximizedPanelAction = ToggleMaximizedPanelAction;
    var PanelActivityAction = /** @class */ (function (_super) {
        __extends(PanelActivityAction, _super);
        function PanelActivityAction(activity, panelService) {
            var _this = _super.call(this, activity) || this;
            _this.panelService = panelService;
            return _this;
        }
        PanelActivityAction.prototype.run = function (event) {
            var _this = this;
            return this.panelService.openPanel(this.activity.id, true).then(function () { return _this.activate(); });
        };
        PanelActivityAction = __decorate([
            __param(1, panelService_1.IPanelService)
        ], PanelActivityAction);
        return PanelActivityAction;
    }(compositeBarActions_1.ActivityAction));
    exports.PanelActivityAction = PanelActivityAction;
    var actionRegistry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(TogglePanelAction, TogglePanelAction.ID, TogglePanelAction.LABEL, { primary: 2048 /* CtrlCmd */ | 40 /* KEY_J */ }), 'View: Toggle Panel', nls.localize('view', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(FocusPanelAction, FocusPanelAction.ID, FocusPanelAction.LABEL), 'View: Focus into Panel', nls.localize('view', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ToggleMaximizedPanelAction, ToggleMaximizedPanelAction.ID, ToggleMaximizedPanelAction.LABEL), 'View: Toggle Maximized Panel', nls.localize('view', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ClosePanelAction, ClosePanelAction.ID, ClosePanelAction.LABEL), 'View: Close Panel', nls.localize('view', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(TogglePanelPositionAction, TogglePanelPositionAction.ID, TogglePanelPositionAction.LABEL), 'View: Toggle Panel Position', nls.localize('view', "View"));
    actionRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ToggleMaximizedPanelAction, ToggleMaximizedPanelAction.ID, undefined), 'View: Toggle Panel Position', nls.localize('view', "View"));
});
