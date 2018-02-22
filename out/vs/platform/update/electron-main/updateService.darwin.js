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
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/decorators", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/platform/update/common/update", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/update/electron-main/abstractUpdateService"], function (require, exports, electron, lifecycle_1, event_1, decorators_1, configuration_1, lifecycleMain_1, update_1, telemetry_1, environment_1, log_1, abstractUpdateService_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var DarwinUpdateService = /** @class */ (function (_super) {
        __extends(DarwinUpdateService, _super);
        function DarwinUpdateService(lifecycleService, configurationService, telemetryService, environmentService, logService) {
            var _this = _super.call(this, lifecycleService, configurationService, environmentService, logService) || this;
            _this.telemetryService = telemetryService;
            _this.disposables = [];
            _this.onRawError(_this.onError, _this, _this.disposables);
            _this.onRawUpdateAvailable(_this.onUpdateAvailable, _this, _this.disposables);
            _this.onRawUpdateDownloaded(_this.onUpdateDownloaded, _this, _this.disposables);
            _this.onRawUpdateNotAvailable(_this.onUpdateNotAvailable, _this, _this.disposables);
            return _this;
        }
        Object.defineProperty(DarwinUpdateService.prototype, "onRawError", {
            get: function () { return event_1.fromNodeEventEmitter(electron.autoUpdater, 'error', function (_, message) { return message; }); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DarwinUpdateService.prototype, "onRawUpdateNotAvailable", {
            get: function () { return event_1.fromNodeEventEmitter(electron.autoUpdater, 'update-not-available'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DarwinUpdateService.prototype, "onRawUpdateAvailable", {
            get: function () { return event_1.fromNodeEventEmitter(electron.autoUpdater, 'update-available', function (_, url, version) { return ({ url: url, version: version, productVersion: version }); }); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DarwinUpdateService.prototype, "onRawUpdateDownloaded", {
            get: function () { return event_1.fromNodeEventEmitter(electron.autoUpdater, 'update-downloaded', function (_, releaseNotes, version, date) { return ({ releaseNotes: releaseNotes, version: version, productVersion: version, date: date }); }); },
            enumerable: true,
            configurable: true
        });
        DarwinUpdateService.prototype.onError = function (err) {
            this.logService.error('UpdateService error: ', err);
            this.setState(update_1.State.Idle);
        };
        DarwinUpdateService.prototype.setUpdateFeedUrl = function (quality) {
            try {
                electron.autoUpdater.setFeedURL(abstractUpdateService_1.createUpdateURL('darwin', quality));
            }
            catch (e) {
                // application is very likely not signed
                this.logService.error('Failed to set update feed URL');
                return false;
            }
            return true;
        };
        DarwinUpdateService.prototype.doCheckForUpdates = function (explicit) {
            this.setState(update_1.State.CheckingForUpdates(explicit));
            electron.autoUpdater.checkForUpdates();
        };
        DarwinUpdateService.prototype.onUpdateAvailable = function (update) {
            if (this.state.type !== update_1.StateType.CheckingForUpdates) {
                return;
            }
            this.setState(update_1.State.Downloading(update));
        };
        DarwinUpdateService.prototype.onUpdateDownloaded = function (update) {
            if (this.state.type !== update_1.StateType.Downloading) {
                return;
            }
            /* __GDPR__
                "update:downloaded" : {
                    "version" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('update:downloaded', { version: update.version });
            this.setState(update_1.State.Ready(update));
        };
        DarwinUpdateService.prototype.onUpdateNotAvailable = function () {
            if (this.state.type !== update_1.StateType.CheckingForUpdates) {
                return;
            }
            /* __GDPR__
                    "update:notAvailable" : {
                        "explicit" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
            this.telemetryService.publicLog('update:notAvailable', { explicit: this.state.explicit });
            this.setState(update_1.State.Idle);
        };
        DarwinUpdateService.prototype.doQuitAndInstall = function () {
            // for some reason updating on Mac causes the local storage not to be flushed.
            // we workaround this issue by forcing an explicit flush of the storage data.
            // see also https://github.com/Microsoft/vscode/issues/172
            this.logService.trace('update#quitAndInstall(): calling flushStorageData()');
            electron.session.defaultSession.flushStorageData();
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            electron.autoUpdater.quitAndInstall();
        };
        DarwinUpdateService.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        __decorate([
            decorators_1.memoize
        ], DarwinUpdateService.prototype, "onRawError", null);
        __decorate([
            decorators_1.memoize
        ], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", null);
        __decorate([
            decorators_1.memoize
        ], DarwinUpdateService.prototype, "onRawUpdateAvailable", null);
        __decorate([
            decorators_1.memoize
        ], DarwinUpdateService.prototype, "onRawUpdateDownloaded", null);
        DarwinUpdateService = __decorate([
            __param(0, lifecycleMain_1.ILifecycleService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, log_1.ILogService)
        ], DarwinUpdateService);
        return DarwinUpdateService;
    }(abstractUpdateService_1.AbstractUpdateService));
    exports.DarwinUpdateService = DarwinUpdateService;
});
