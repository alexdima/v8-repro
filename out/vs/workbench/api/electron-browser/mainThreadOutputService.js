var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/parts/output/common/output", "vs/workbench/services/part/common/partService", "vs/workbench/services/panel/common/panelService", "../node/extHost.protocol", "vs/workbench/api/electron-browser/extHostCustomers"], function (require, exports, platform_1, output_1, partService_1, panelService_1, extHost_protocol_1, extHostCustomers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadOutputService = /** @class */ (function () {
        function MainThreadOutputService(extHostContext, outputService, partService, panelService) {
            this._outputService = outputService;
            this._partService = partService;
            this._panelService = panelService;
        }
        MainThreadOutputService.prototype.dispose = function () {
            // Leave all the existing channels intact (e.g. might help with troubleshooting)
        };
        MainThreadOutputService.prototype.$append = function (channelId, label, value) {
            this._getChannel(channelId, label).append(value);
            return undefined;
        };
        MainThreadOutputService.prototype.$clear = function (channelId, label) {
            this._getChannel(channelId, label).clear();
            return undefined;
        };
        MainThreadOutputService.prototype.$reveal = function (channelId, label, preserveFocus) {
            var channel = this._getChannel(channelId, label);
            this._outputService.showChannel(channel.id, preserveFocus);
            return undefined;
        };
        MainThreadOutputService.prototype._getChannel = function (channelId, label) {
            if (!platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(channelId)) {
                platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel(channelId, label);
            }
            return this._outputService.getChannel(channelId);
        };
        MainThreadOutputService.prototype.$close = function (channelId) {
            var panel = this._panelService.getActivePanel();
            if (panel && panel.getId() === output_1.OUTPUT_PANEL_ID && channelId === this._outputService.getActiveChannel().id) {
                return this._partService.setPanelHidden(true);
            }
            return undefined;
        };
        MainThreadOutputService.prototype.$dispose = function (channelId, label) {
            this._getChannel(channelId, label).dispose();
            return undefined;
        };
        MainThreadOutputService = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadOutputService),
            __param(1, output_1.IOutputService),
            __param(2, partService_1.IPartService),
            __param(3, panelService_1.IPanelService)
        ], MainThreadOutputService);
        return MainThreadOutputService;
    }());
    exports.MainThreadOutputService = MainThreadOutputService;
});
