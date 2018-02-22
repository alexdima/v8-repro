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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/actions", "vs/workbench/parts/output/common/output", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "vs/workbench/browser/panel", "vs/base/common/lifecycle", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/contextview/browser/contextView", "vs/platform/registry/common/platform"], function (require, exports, winjs_base_1, nls, actions_1, output_1, actionbar_1, partService_1, panelService_1, panel_1, lifecycle_1, styler_1, themeService_1, contextView_1, platform_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleOutputAction = /** @class */ (function (_super) {
        __extends(ToggleOutputAction, _super);
        function ToggleOutputAction(id, label, partService, panelService) {
            return _super.call(this, id, label, output_1.OUTPUT_PANEL_ID, panelService, partService) || this;
        }
        ToggleOutputAction.ID = 'workbench.action.output.toggleOutput';
        ToggleOutputAction.LABEL = nls.localize('toggleOutput', "Toggle Output");
        ToggleOutputAction = __decorate([
            __param(2, partService_1.IPartService),
            __param(3, panelService_1.IPanelService)
        ], ToggleOutputAction);
        return ToggleOutputAction;
    }(panel_1.TogglePanelAction));
    exports.ToggleOutputAction = ToggleOutputAction;
    var ClearOutputAction = /** @class */ (function (_super) {
        __extends(ClearOutputAction, _super);
        function ClearOutputAction(id, label, outputService, panelService) {
            var _this = _super.call(this, id, label, 'output-action clear-output') || this;
            _this.outputService = outputService;
            _this.panelService = panelService;
            return _this;
        }
        ClearOutputAction.prototype.run = function () {
            this.outputService.getActiveChannel().clear();
            this.panelService.getActivePanel().focus();
            return winjs_base_1.TPromise.as(true);
        };
        ClearOutputAction.ID = 'workbench.output.action.clearOutput';
        ClearOutputAction.LABEL = nls.localize('clearOutput', "Clear Output");
        ClearOutputAction = __decorate([
            __param(2, output_1.IOutputService),
            __param(3, panelService_1.IPanelService)
        ], ClearOutputAction);
        return ClearOutputAction;
    }(actions_1.Action));
    exports.ClearOutputAction = ClearOutputAction;
    var ToggleOutputScrollLockAction = /** @class */ (function (_super) {
        __extends(ToggleOutputScrollLockAction, _super);
        function ToggleOutputScrollLockAction(id, label, outputService) {
            var _this = _super.call(this, id, label, 'output-action output-scroll-unlock') || this;
            _this.outputService = outputService;
            _this.toDispose = [];
            _this.toDispose.push(_this.outputService.onActiveOutputChannel(function (channel) { return _this.setClass(_this.outputService.getActiveChannel().scrollLock); }));
            return _this;
        }
        ToggleOutputScrollLockAction.prototype.run = function () {
            var activeChannel = this.outputService.getActiveChannel();
            if (activeChannel) {
                activeChannel.scrollLock = !activeChannel.scrollLock;
                this.setClass(activeChannel.scrollLock);
            }
            return winjs_base_1.TPromise.as(true);
        };
        ToggleOutputScrollLockAction.prototype.setClass = function (locked) {
            if (locked) {
                this.class = 'output-action output-scroll-lock';
            }
            else {
                this.class = 'output-action output-scroll-unlock';
            }
        };
        ToggleOutputScrollLockAction.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        ToggleOutputScrollLockAction.ID = 'workbench.output.action.toggleOutputScrollLock';
        ToggleOutputScrollLockAction.LABEL = nls.localize({ key: 'toggleOutputScrollLock', comment: ['Turn on / off automatic output scrolling'] }, "Toggle Output Scroll Lock");
        ToggleOutputScrollLockAction = __decorate([
            __param(2, output_1.IOutputService)
        ], ToggleOutputScrollLockAction);
        return ToggleOutputScrollLockAction;
    }(actions_1.Action));
    exports.ToggleOutputScrollLockAction = ToggleOutputScrollLockAction;
    var SwitchOutputAction = /** @class */ (function (_super) {
        __extends(SwitchOutputAction, _super);
        function SwitchOutputAction(outputService) {
            var _this = _super.call(this, SwitchOutputAction.ID, nls.localize('switchToOutput.label', "Switch to Output")) || this;
            _this.outputService = outputService;
            _this.class = 'output-action switch-to-output';
            return _this;
        }
        SwitchOutputAction.prototype.run = function (channelId) {
            return this.outputService.showChannel(channelId);
        };
        SwitchOutputAction.ID = 'workbench.output.action.switchBetweenOutputs';
        SwitchOutputAction = __decorate([
            __param(0, output_1.IOutputService)
        ], SwitchOutputAction);
        return SwitchOutputAction;
    }(actions_1.Action));
    exports.SwitchOutputAction = SwitchOutputAction;
    var SwitchOutputActionItem = /** @class */ (function (_super) {
        __extends(SwitchOutputActionItem, _super);
        function SwitchOutputActionItem(action, outputService, themeService, contextViewService) {
            var _this = _super.call(this, null, action, [], 0, contextViewService) || this;
            _this.outputService = outputService;
            var outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            _this.toDispose.push(outputChannelRegistry.onDidRegisterChannel(function () { return _this.updateOtions(); }));
            _this.toDispose.push(outputChannelRegistry.onDidRemoveChannel(function () { return _this.updateOtions(); }));
            _this.toDispose.push(_this.outputService.onActiveOutputChannel(function (activeChannelId) { return _this.setOptions(_this.getOptions(), _this.getSelected(activeChannelId)); }));
            _this.toDispose.push(styler_1.attachSelectBoxStyler(_this.selectBox, themeService));
            _this.setOptions(_this.getOptions(), _this.getSelected(_this.outputService.getActiveChannel().id));
            return _this;
        }
        SwitchOutputActionItem.prototype.getActionContext = function (option) {
            var channel = this.outputService.getChannels().filter(function (channelData) { return channelData.label === option; }).pop();
            return channel ? channel.id : option;
        };
        SwitchOutputActionItem.prototype.getOptions = function () {
            return this.outputService.getChannels().map(function (c) { return c.label; });
        };
        SwitchOutputActionItem.prototype.updateOtions = function () {
            var activeChannelIndex = this.getSelected(this.outputService.getActiveChannel().id);
            this.setOptions(this.getOptions(), activeChannelIndex);
        };
        SwitchOutputActionItem.prototype.getSelected = function (outputId) {
            if (!outputId) {
                return undefined;
            }
            return Math.max(0, this.outputService.getChannels().map(function (c) { return c.id; }).indexOf(outputId));
        };
        SwitchOutputActionItem = __decorate([
            __param(1, output_1.IOutputService),
            __param(2, themeService_1.IThemeService),
            __param(3, contextView_1.IContextViewService)
        ], SwitchOutputActionItem);
        return SwitchOutputActionItem;
    }(actionbar_1.SelectActionItem));
    exports.SwitchOutputActionItem = SwitchOutputActionItem;
});
