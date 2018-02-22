var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/objects", "vs/platform/configuration/common/configuration", "vs/platform/windows/common/windows", "vs/platform/telemetry/common/telemetry", "electron", "vs/platform/node/product", "vs/platform/node/package", "os", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, nls, errors_1, objects_1, configuration_1, windows_1, telemetry_1, electron_1, product_1, package_1, os, platform_1, instantiation_1, configurationRegistry_1, platform_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ICrashReporterService = instantiation_1.createDecorator('crashReporterService');
    exports.TELEMETRY_SECTION_ID = 'telemetry';
    var configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': exports.TELEMETRY_SECTION_ID,
        'order': 110,
        title: nls.localize('telemetryConfigurationTitle', "Telemetry"),
        'type': 'object',
        'properties': {
            'telemetry.enableCrashReporter': {
                'type': 'boolean',
                'description': nls.localize('telemetry.enableCrashReporting', "Enable crash reports to be sent to Microsoft.\nThis option requires restart to take effect."),
                'default': true
            }
        }
    });
    exports.NullCrashReporterService = {
        _serviceBrand: undefined,
        getChildProcessStartOptions: function (processName) { return undefined; }
    };
    var CrashReporterService = /** @class */ (function () {
        function CrashReporterService(telemetryService, windowsService, configurationService) {
            this.telemetryService = telemetryService;
            this.windowsService = windowsService;
            var config = configurationService.getValue(exports.TELEMETRY_SECTION_ID);
            this.isEnabled = !!config.enableCrashReporter;
            if (this.isEnabled) {
                this.startCrashReporter();
            }
        }
        CrashReporterService.prototype.startCrashReporter = function () {
            var _this = this;
            // base options with product info
            this.options = {
                companyName: product_1.default.crashReporter.companyName,
                productName: product_1.default.crashReporter.productName,
                submitURL: this.getSubmitURL(),
                extra: {
                    vscode_version: package_1.default.version,
                    vscode_commit: product_1.default.commit
                }
            };
            // mixin telemetry info
            this.telemetryService.getTelemetryInfo()
                .then(function (info) {
                objects_1.assign(_this.options.extra, {
                    vscode_sessionId: info.sessionId,
                    vscode_machineId: info.machineId
                });
                // start crash reporter right here
                electron_1.crashReporter.start(objects_1.deepClone(_this.options));
                // start crash reporter in the main process
                return _this.windowsService.startCrashReporter(_this.options);
            })
                .done(null, errors_1.onUnexpectedError);
        };
        CrashReporterService.prototype.getSubmitURL = function () {
            var submitURL;
            if (platform_1.isWindows) {
                submitURL = product_1.default.hockeyApp["win32-" + process.arch];
            }
            else if (platform_1.isMacintosh) {
                submitURL = product_1.default.hockeyApp.darwin;
            }
            else if (platform_1.isLinux) {
                submitURL = product_1.default.hockeyApp["linux-" + process.arch];
            }
            return submitURL;
        };
        CrashReporterService.prototype.getChildProcessStartOptions = function (name) {
            // Experimental crash reporting support for child processes on Mac only for now
            if (this.isEnabled && platform_1.isMacintosh) {
                var childProcessOptions = objects_1.deepClone(this.options);
                childProcessOptions.extra.processName = name;
                childProcessOptions.crashesDirectory = os.tmpdir();
                return childProcessOptions;
            }
            return void 0;
        };
        CrashReporterService = __decorate([
            __param(0, telemetry_1.ITelemetryService),
            __param(1, windows_1.IWindowsService),
            __param(2, configuration_1.IConfigurationService)
        ], CrashReporterService);
        return CrashReporterService;
    }());
    exports.CrashReporterService = CrashReporterService;
});
