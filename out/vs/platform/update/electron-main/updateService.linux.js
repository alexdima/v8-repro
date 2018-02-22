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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/platform/request/node/request", "vs/platform/update/common/update", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/update/electron-main/abstractUpdateService", "vs/base/node/request", "vs/base/common/winjs.base", "electron"], function (require, exports, configuration_1, lifecycleMain_1, request_1, update_1, telemetry_1, environment_1, log_1, abstractUpdateService_1, request_2, winjs_base_1, electron_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var LinuxUpdateService = /** @class */ (function (_super) {
        __extends(LinuxUpdateService, _super);
        function LinuxUpdateService(lifecycleService, configurationService, telemetryService, environmentService, requestService, logService) {
            var _this = _super.call(this, lifecycleService, configurationService, environmentService, logService) || this;
            _this.telemetryService = telemetryService;
            _this.requestService = requestService;
            return _this;
        }
        LinuxUpdateService.prototype.setUpdateFeedUrl = function (quality) {
            this.url = abstractUpdateService_1.createUpdateURL("linux-" + process.arch, quality);
            return true;
        };
        LinuxUpdateService.prototype.doCheckForUpdates = function (explicit) {
            var _this = this;
            if (!this.url) {
                return;
            }
            this.setState(update_1.State.CheckingForUpdates(explicit));
            this.requestService.request({ url: this.url })
                .then(request_2.asJson)
                .then(function (update) {
                if (!update || !update.url || !update.version || !update.productVersion) {
                    /* __GDPR__
                            "update:notAvailable" : {
                                "explicit" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                    _this.telemetryService.publicLog('update:notAvailable', { explicit: explicit });
                    _this.setState(update_1.State.Idle);
                }
                else {
                    _this.setState(update_1.State.AvailableForDownload(update));
                }
            })
                .then(null, function (err) {
                _this.logService.error(err);
                /* __GDPR__
                    "update:notAvailable" : {
                    "explicit" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                    */
                _this.telemetryService.publicLog('update:notAvailable', { explicit: explicit });
                _this.setState(update_1.State.Idle);
            });
        };
        LinuxUpdateService.prototype.doDownloadUpdate = function (state) {
            electron_1.shell.openExternal(state.update.url);
            this.setState(update_1.State.Idle);
            return winjs_base_1.TPromise.as(null);
        };
        LinuxUpdateService = __decorate([
            __param(0, lifecycleMain_1.ILifecycleService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, request_1.IRequestService),
            __param(5, log_1.ILogService)
        ], LinuxUpdateService);
        return LinuxUpdateService;
    }(abstractUpdateService_1.AbstractUpdateService));
    exports.LinuxUpdateService = LinuxUpdateService;
});
