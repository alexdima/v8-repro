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
define(["require", "exports", "vs/workbench/services/panel/common/panelService"], function (require, exports, panelService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActivityService = /** @class */ (function () {
        function ActivityService(activitybarPart, panelPart, panelService) {
            this.activitybarPart = activitybarPart;
            this.panelPart = panelPart;
            this.panelService = panelService;
        }
        ActivityService.prototype.showActivity = function (compositeOrActionId, badge, clazz, priority) {
            if (this.panelService.getPanels().filter(function (p) { return p.id === compositeOrActionId; }).length) {
                return this.panelPart.showActivity(compositeOrActionId, badge, clazz);
            }
            return this.activitybarPart.showActivity(compositeOrActionId, badge, clazz, priority);
        };
        ActivityService = __decorate([
            __param(2, panelService_1.IPanelService)
        ], ActivityService);
        return ActivityService;
    }());
    exports.ActivityService = ActivityService;
});
