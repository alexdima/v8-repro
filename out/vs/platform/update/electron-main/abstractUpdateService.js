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
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/platform/node/product", "vs/base/common/winjs.base", "vs/platform/update/common/update", "vs/platform/environment/common/environment", "vs/platform/log/common/log"], function (require, exports, event_1, async_1, configuration_1, lifecycleMain_1, product_1, winjs_base_1, update_1, environment_1, log_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function createUpdateURL(platform, quality) {
        return product_1.default.updateUrl + "/api/update/" + platform + "/" + quality + "/" + product_1.default.commit;
    }
    exports.createUpdateURL = createUpdateURL;
    var AbstractUpdateService = /** @class */ (function () {
        function AbstractUpdateService(lifecycleService, configurationService, environmentService, logService) {
            var _this = this;
            this.lifecycleService = lifecycleService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.logService = logService;
            this._state = update_1.State.Uninitialized;
            this.throttler = new async_1.Throttler();
            this._onStateChange = new event_1.Emitter();
            if (this.environmentService.disableUpdates) {
                this.logService.info('update#ctor - updates are disabled');
                return;
            }
            if (!product_1.default.updateUrl || !product_1.default.commit) {
                this.logService.info('update#ctor - updates are disabled');
                return;
            }
            var quality = this.getProductQuality();
            if (!quality) {
                this.logService.info('update#ctor - updates are disabled');
                return;
            }
            if (!this.setUpdateFeedUrl(quality)) {
                this.logService.info('update#ctor - updates are disabled');
                return;
            }
            this.setState({ type: update_1.StateType.Idle });
            // Start checking for updates after 30 seconds
            this.scheduleCheckForUpdates(30 * 1000)
                .done(null, function (err) { return _this.logService.error(err); });
        }
        Object.defineProperty(AbstractUpdateService.prototype, "onStateChange", {
            get: function () { return this._onStateChange.event; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractUpdateService.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        AbstractUpdateService.prototype.setState = function (state) {
            this.logService.info('update#setState', state.type);
            this._state = state;
            this._onStateChange.fire(state);
        };
        AbstractUpdateService.prototype.getProductQuality = function () {
            var quality = this.configurationService.getValue('update.channel');
            return quality === 'none' ? null : product_1.default.quality;
        };
        AbstractUpdateService.prototype.scheduleCheckForUpdates = function (delay) {
            var _this = this;
            if (delay === void 0) { delay = 60 * 60 * 1000; }
            return winjs_base_1.TPromise.timeout(delay)
                .then(function () { return _this.checkForUpdates(); })
                .then(function (update) {
                if (update) {
                    // Update found, no need to check more
                    return winjs_base_1.TPromise.as(null);
                }
                // Check again after 1 hour
                return _this.scheduleCheckForUpdates(60 * 60 * 1000);
            });
        };
        AbstractUpdateService.prototype.checkForUpdates = function (explicit) {
            var _this = this;
            if (explicit === void 0) { explicit = false; }
            this.logService.trace('update#checkForUpdates, state = ', this.state.type);
            if (this.state.type !== update_1.StateType.Idle) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.throttler.queue(function () { return winjs_base_1.TPromise.as(_this.doCheckForUpdates(explicit)); });
        };
        AbstractUpdateService.prototype.downloadUpdate = function () {
            this.logService.trace('update#downloadUpdate, state = ', this.state.type);
            if (this.state.type !== update_1.StateType.AvailableForDownload) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.doDownloadUpdate(this.state);
        };
        AbstractUpdateService.prototype.doDownloadUpdate = function (state) {
            return winjs_base_1.TPromise.as(null);
        };
        AbstractUpdateService.prototype.applyUpdate = function () {
            this.logService.trace('update#applyUpdate, state = ', this.state.type);
            if (this.state.type !== update_1.StateType.Downloaded) {
                return winjs_base_1.TPromise.as(null);
            }
            return this.doApplyUpdate();
        };
        AbstractUpdateService.prototype.doApplyUpdate = function () {
            return winjs_base_1.TPromise.as(null);
        };
        AbstractUpdateService.prototype.quitAndInstall = function () {
            var _this = this;
            this.logService.trace('update#quitAndInstall, state = ', this.state.type);
            if (this.state.type !== update_1.StateType.Ready) {
                return winjs_base_1.TPromise.as(null);
            }
            this.logService.trace('update#quitAndInstall(): before lifecycle quit()');
            this.lifecycleService.quit(true /* from update */).done(function (vetod) {
                _this.logService.trace("update#quitAndInstall(): after lifecycle quit() with veto: " + vetod);
                if (vetod) {
                    return;
                }
                _this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
                _this.doQuitAndInstall();
            });
            return winjs_base_1.TPromise.as(null);
        };
        AbstractUpdateService.prototype.doQuitAndInstall = function () {
            // noop
        };
        AbstractUpdateService = __decorate([
            __param(0, lifecycleMain_1.ILifecycleService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, log_1.ILogService)
        ], AbstractUpdateService);
        return AbstractUpdateService;
    }());
    exports.AbstractUpdateService = AbstractUpdateService;
});
