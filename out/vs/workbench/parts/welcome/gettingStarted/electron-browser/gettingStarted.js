var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/base/common/platform", "vs/platform/node/product"], function (require, exports, storage_1, telemetry_1, environment_1, platform, product_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var GettingStarted = /** @class */ (function () {
        function GettingStarted(storageService, environmentService, telemetryService) {
            this.storageService = storageService;
            this.telemetryService = telemetryService;
            this.appName = product_1.default.nameLong;
            /* do not open a browser when we run an extension or --skip-getting-started is provided */
            if (product_1.default.welcomePage && !environmentService.isExtensionDevelopment && !environmentService.skipGettingStarted) {
                this.welcomePageURL = product_1.default.welcomePage;
                this.handleWelcome();
            }
        }
        GettingStarted.prototype.getUrl = function (telemetryInfo) {
            return this.welcomePageURL + "&&from=" + this.appName + "&&id=" + telemetryInfo.machineId;
        };
        GettingStarted.prototype.openExternal = function (url) {
            // Don't open the welcome page as the root user on Linux, this is due to a bug with xdg-open
            // which recommends against running itself as root.
            if (platform.isLinux && platform.isRootUser()) {
                return;
            }
            window.open(url);
        };
        GettingStarted.prototype.handleWelcome = function () {
            var _this = this;
            //make sure the user is online, otherwise refer to the next run to show the welcome page
            if (!navigator.onLine) {
                return;
            }
            var firstStartup = !this.storageService.get(GettingStarted.hideWelcomeSettingskey);
            if (firstStartup && this.welcomePageURL) {
                this.telemetryService.getTelemetryInfo().then(function (info) {
                    var url = _this.getUrl(info);
                    _this.openExternal(url);
                    _this.storageService.store(GettingStarted.hideWelcomeSettingskey, true);
                });
            }
        };
        GettingStarted.hideWelcomeSettingskey = 'workbench.hide.welcome';
        GettingStarted = __decorate([
            __param(0, storage_1.IStorageService),
            __param(1, environment_1.IEnvironmentService),
            __param(2, telemetry_1.ITelemetryService)
        ], GettingStarted);
        return GettingStarted;
    }());
    exports.GettingStarted = GettingStarted;
});
