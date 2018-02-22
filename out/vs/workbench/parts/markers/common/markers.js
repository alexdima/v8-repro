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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/markers/common/markersModel", "vs/base/common/lifecycle", "vs/platform/markers/common/markers", "vs/workbench/services/activity/common/activity", "vs/nls", "vs/workbench/parts/markers/common/constants", "vs/base/common/event"], function (require, exports, instantiation_1, markersModel_1, lifecycle_1, markers_1, activity_1, nls_1, constants_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IMarkersWorkbenchService = instantiation_1.createDecorator('markersWorkbenchService');
    var MarkersWorkbenchService = /** @class */ (function (_super) {
        __extends(MarkersWorkbenchService, _super);
        function MarkersWorkbenchService(markerService, activityService) {
            var _this = _super.call(this) || this;
            _this.markerService = markerService;
            _this.activityService = activityService;
            _this._onDidChangeMarkersForResources = _this._register(new event_1.Emitter());
            _this.onDidChangeMarkersForResources = _this._onDidChangeMarkersForResources.event;
            _this.markersModel = _this._register(new markersModel_1.MarkersModel(_this.markerService.read()));
            _this._register(markerService.onMarkerChanged(function (resources) { return _this.onMarkerChanged(resources); }));
            return _this;
        }
        MarkersWorkbenchService.prototype.filter = function (filter) {
            this.markersModel.update(new markersModel_1.FilterOptions(filter));
            this.refreshBadge();
        };
        MarkersWorkbenchService.prototype.onMarkerChanged = function (resources) {
            var bulkUpdater = this.markersModel.getBulkUpdater();
            for (var _i = 0, resources_1 = resources; _i < resources_1.length; _i++) {
                var resource = resources_1[_i];
                bulkUpdater.add(resource, this.markerService.read({ resource: resource }));
            }
            bulkUpdater.done();
            this.refreshBadge();
            this._onDidChangeMarkersForResources.fire(resources);
        };
        MarkersWorkbenchService.prototype.refreshBadge = function () {
            var total = this.markersModel.total();
            var count = this.markersModel.count();
            var message = total === count ? nls_1.localize('totalProblems', 'Total {0} Problems', total) : nls_1.localize('filteredProblems', 'Showing {0} of {1} Problems', count, total);
            this.activityService.showActivity(constants_1.default.MARKERS_PANEL_ID, new activity_1.NumberBadge(count, function () { return message; }));
        };
        MarkersWorkbenchService = __decorate([
            __param(0, markers_1.IMarkerService),
            __param(1, activity_1.IActivityService)
        ], MarkersWorkbenchService);
        return MarkersWorkbenchService;
    }(lifecycle_1.Disposable));
    exports.MarkersWorkbenchService = MarkersWorkbenchService;
});
