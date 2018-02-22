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
define(["require", "exports", "original-fs", "path", "vs/base/node/pfs", "vs/base/common/decorators", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMain", "vs/platform/request/node/request", "vs/platform/node/product", "vs/base/common/winjs.base", "vs/platform/update/common/update", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/update/electron-main/abstractUpdateService", "vs/base/node/request", "vs/base/node/crypto", "os", "child_process"], function (require, exports, fs, path, pfs, decorators_1, configuration_1, lifecycleMain_1, request_1, product_1, winjs_base_1, update_1, telemetry_1, environment_1, log_1, abstractUpdateService_1, request_2, crypto_1, os_1, child_process_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function pollUntil(fn, timeout) {
        if (timeout === void 0) { timeout = 1000; }
        return new winjs_base_1.TPromise(function (c) {
            var poll = function () {
                if (fn()) {
                    c(null);
                }
                else {
                    setTimeout(poll, timeout);
                }
            };
            poll();
        });
    }
    var Win32UpdateService = /** @class */ (function (_super) {
        __extends(Win32UpdateService, _super);
        function Win32UpdateService(lifecycleService, configurationService, telemetryService, environmentService, requestService, logService) {
            var _this = _super.call(this, lifecycleService, configurationService, environmentService, logService) || this;
            _this.telemetryService = telemetryService;
            _this.requestService = requestService;
            return _this;
        }
        Object.defineProperty(Win32UpdateService.prototype, "cachePath", {
            get: function () {
                var result = path.join(os_1.tmpdir(), "vscode-update-" + process.arch);
                return pfs.mkdirp(result, null).then(function () { return result; });
            },
            enumerable: true,
            configurable: true
        });
        Win32UpdateService.prototype.setUpdateFeedUrl = function (quality) {
            if (!fs.existsSync(path.join(path.dirname(process.execPath), 'unins000.exe'))) {
                return false;
            }
            this.url = abstractUpdateService_1.createUpdateURL(process.arch === 'x64' ? 'win32-x64' : 'win32', quality);
            return true;
        };
        Win32UpdateService.prototype.doCheckForUpdates = function (explicit) {
            var _this = this;
            if (!this.url) {
                return;
            }
            this.setState(update_1.State.CheckingForUpdates(explicit));
            this.requestService.request({ url: this.url })
                .then(request_2.asJson)
                .then(function (update) {
                if (!update || !update.url || !update.version) {
                    /* __GDPR__
                            "update:notAvailable" : {
                                "explicit" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                            }
                        */
                    _this.telemetryService.publicLog('update:notAvailable', { explicit: explicit });
                    _this.setState(update_1.State.Idle);
                    return winjs_base_1.TPromise.as(null);
                }
                _this.setState(update_1.State.Downloading(update));
                return _this.cleanup(update.version).then(function () {
                    return _this.getUpdatePackagePath(update.version).then(function (updatePackagePath) {
                        return pfs.exists(updatePackagePath).then(function (exists) {
                            if (exists) {
                                return winjs_base_1.TPromise.as(updatePackagePath);
                            }
                            var url = update.url;
                            var hash = update.hash;
                            var downloadPath = updatePackagePath + ".tmp";
                            return _this.requestService.request({ url: url })
                                .then(function (context) { return request_2.download(downloadPath, context); })
                                .then(hash ? function () { return crypto_1.checksum(downloadPath, update.hash); } : function () { return null; })
                                .then(function () { return pfs.rename(downloadPath, updatePackagePath); })
                                .then(function () { return updatePackagePath; });
                        });
                    }).then(function (packagePath) {
                        var fastUpdatesEnabled = _this.configurationService.getValue('update.enableWindowsBackgroundUpdates');
                        _this.availableUpdate = { packagePath: packagePath };
                        if (fastUpdatesEnabled && update.supportsFastUpdate) {
                            _this.setState(update_1.State.Downloaded(update));
                        }
                        else {
                            _this.setState(update_1.State.Ready(update));
                        }
                    });
                });
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
        Win32UpdateService.prototype.getUpdatePackagePath = function (version) {
            return this.cachePath.then(function (cachePath) { return path.join(cachePath, "CodeSetup-" + product_1.default.quality + "-" + version + ".exe"); });
        };
        Win32UpdateService.prototype.cleanup = function (exceptVersion) {
            if (exceptVersion === void 0) { exceptVersion = null; }
            var filter = exceptVersion ? function (one) { return !(new RegExp(product_1.default.quality + "-" + exceptVersion + "\\.exe$").test(one)); } : function () { return true; };
            return this.cachePath
                .then(function (cachePath) { return pfs.readdir(cachePath)
                .then(function (all) { return winjs_base_1.Promise.join(all
                .filter(filter)
                .map(function (one) { return pfs.unlink(path.join(cachePath, one)).then(null, function () { return null; }); })); }); });
        };
        Win32UpdateService.prototype.doApplyUpdate = function () {
            var _this = this;
            if (this.state.type !== update_1.StateType.Downloaded || !this.availableUpdate) {
                return winjs_base_1.TPromise.as(null);
            }
            var update = this.state.update;
            this.setState(update_1.State.Updating(update));
            return this.cachePath.then(function (cachePath) {
                _this.availableUpdate.updateFilePath = path.join(cachePath, "CodeSetup-" + product_1.default.quality + "-" + update.version + ".flag");
                return pfs.writeFile(_this.availableUpdate.updateFilePath, 'flag').then(function () {
                    var child = child_process_1.spawn(_this.availableUpdate.packagePath, ['/verysilent', "/update=\"" + _this.availableUpdate.updateFilePath + "\"", '/nocloseapplications', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                        detached: true,
                        stdio: ['ignore', 'ignore', 'ignore'],
                        windowsVerbatimArguments: true
                    });
                    child.once('exit', function () {
                        _this.availableUpdate = undefined;
                        _this.setState(update_1.State.Idle);
                    });
                    var readyMutexName = product_1.default.win32MutexName + "-ready";
                    var isActive = require.__$__nodeRequire('windows-mutex').isActive;
                    // poll for mutex-ready
                    pollUntil(function () { return isActive(readyMutexName); })
                        .then(function () { return _this.setState(update_1.State.Ready(update)); });
                });
            });
        };
        Win32UpdateService.prototype.doQuitAndInstall = function () {
            if (this.state.type !== update_1.StateType.Ready) {
                return;
            }
            this.logService.trace('update#quitAndInstall(): running raw#quitAndInstall()');
            if (this.state.update.supportsFastUpdate && this.availableUpdate.updateFilePath) {
                fs.unlinkSync(this.availableUpdate.updateFilePath);
            }
            else {
                child_process_1.spawn(this.availableUpdate.packagePath, ['/silent', '/mergetasks=runcode,!desktopicon,!quicklaunchicon'], {
                    detached: true,
                    stdio: ['ignore', 'ignore', 'ignore']
                });
            }
        };
        __decorate([
            decorators_1.memoize
        ], Win32UpdateService.prototype, "cachePath", null);
        Win32UpdateService = __decorate([
            __param(0, lifecycleMain_1.ILifecycleService),
            __param(1, configuration_1.IConfigurationService),
            __param(2, telemetry_1.ITelemetryService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, request_1.IRequestService),
            __param(5, log_1.ILogService)
        ], Win32UpdateService);
        return Win32UpdateService;
    }(abstractUpdateService_1.AbstractUpdateService));
    exports.Win32UpdateService = Win32UpdateService;
});
