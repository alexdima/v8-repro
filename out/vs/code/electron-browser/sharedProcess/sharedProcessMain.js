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
define(["require", "exports", "fs", "vs/base/common/platform", "vs/platform/node/product", "vs/platform/node/package", "vs/base/parts/ipc/node/ipc.net", "vs/base/common/winjs.base", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/node/configurationService", "vs/platform/request/node/request", "vs/platform/request/electron-browser/requestService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/commonProperties", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/node/appInsightsAppender", "vs/platform/message/common/message", "vs/platform/message/common/messageIpc", "vs/platform/windows/common/windows", "vs/platform/windows/common/windowsIpc", "electron", "vs/base/common/lifecycle", "vs/code/electron-browser/sharedProcess/contrib/contributions", "vs/platform/log/node/spdlogService", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/localizations/node/localizations", "vs/platform/localizations/common/localizations", "vs/platform/localizations/common/localizationsIpc"], function (require, exports, fs, platform, product_1, package_1, ipc_net_1, winjs_base_1, serviceCollection_1, descriptors_1, instantiationService_1, environment_1, environmentService_1, extensionManagementIpc_1, extensionManagement_1, extensionManagementService_1, extensionGalleryService_1, configuration_1, configurationService_1, request_1, requestService_1, telemetry_1, telemetryUtils_1, commonProperties_1, telemetryIpc_1, telemetryService_1, appInsightsAppender_1, message_1, messageIpc_1, windows_1, windowsIpc_1, electron_1, lifecycle_1, contributions_1, spdlogService_1, log_1, logIpc_1, localizations_1, localizations_2, localizationsIpc_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function startup(configuration) {
        handshake(configuration);
    }
    exports.startup = startup;
    var ActiveWindowManager = /** @class */ (function () {
        function ActiveWindowManager(windowsService) {
            this.disposables = [];
            windowsService.onWindowOpen(this.setActiveWindow, this, this.disposables);
            windowsService.onWindowFocus(this.setActiveWindow, this, this.disposables);
        }
        ActiveWindowManager.prototype.setActiveWindow = function (windowId) {
            this._activeWindowId = windowId;
        };
        Object.defineProperty(ActiveWindowManager.prototype, "activeClientId", {
            get: function () {
                return "window:" + this._activeWindowId;
            },
            enumerable: true,
            configurable: true
        });
        ActiveWindowManager.prototype.dispose = function () {
            this.disposables = lifecycle_1.dispose(this.disposables);
        };
        ActiveWindowManager = __decorate([
            __param(0, windows_1.IWindowsService)
        ], ActiveWindowManager);
        return ActiveWindowManager;
    }());
    var eventPrefix = 'monacoworkbench';
    function main(server, initData, configuration) {
        var services = new serviceCollection_1.ServiceCollection();
        var environmentService = new environmentService_1.EnvironmentService(initData.args, process.execPath);
        var logLevelClient = new logIpc_1.LogLevelSetterChannelClient(server.getChannel('loglevel', { route: function () { return 'main'; } }));
        var logService = new logIpc_1.FollowerLogService(logLevelClient, spdlogService_1.createSpdLogService('sharedprocess', initData.logLevel, environmentService.logsPath));
        process.once('exit', function () { return logService.dispose(); });
        logService.info('main', JSON.stringify(configuration));
        services.set(environment_1.IEnvironmentService, environmentService);
        services.set(log_1.ILogService, logService);
        services.set(configuration_1.IConfigurationService, new descriptors_1.SyncDescriptor(configurationService_1.ConfigurationService));
        services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
        var windowsChannel = server.getChannel('windows', { route: function () { return 'main'; } });
        var windowsService = new windowsIpc_1.WindowsChannelClient(windowsChannel);
        services.set(windows_1.IWindowsService, windowsService);
        var activeWindowManager = new ActiveWindowManager(windowsService);
        var choiceChannel = server.getChannel('choice', {
            route: function () {
                logService.info('Routing choice request to the client', activeWindowManager.activeClientId);
                return activeWindowManager.activeClientId;
            }
        });
        services.set(message_1.IChoiceService, new messageIpc_1.ChoiceChannelClient(choiceChannel));
        var instantiationService = new instantiationService_1.InstantiationService(services);
        instantiationService.invokeFunction(function (accessor) {
            var appenders = [];
            if (product_1.default.aiConfig && product_1.default.aiConfig.asimovKey) {
                appenders.push(new appInsightsAppender_1.AppInsightsAppender(eventPrefix, null, product_1.default.aiConfig.asimovKey));
            }
            // It is important to dispose the AI adapter properly because
            // only then they flush remaining data.
            process.once('exit', function () { return appenders.forEach(function (a) { return a.dispose(); }); });
            var appender = telemetryUtils_1.combinedAppender.apply(void 0, appenders);
            server.registerChannel('telemetryAppender', new telemetryIpc_1.TelemetryAppenderChannel(appender));
            var services = new serviceCollection_1.ServiceCollection();
            var environmentService = accessor.get(environment_1.IEnvironmentService);
            var appRoot = environmentService.appRoot, extensionsPath = environmentService.extensionsPath, extensionDevelopmentPath = environmentService.extensionDevelopmentPath, isBuilt = environmentService.isBuilt, installSourcePath = environmentService.installSourcePath;
            if (isBuilt && !extensionDevelopmentPath && !environmentService.args['disable-telemetry'] && product_1.default.enableTelemetry) {
                var config = {
                    appender: appender,
                    commonProperties: commonProperties_1.resolveCommonProperties(product_1.default.commit, package_1.default.version, configuration.machineId, installSourcePath),
                    piiPaths: [appRoot, extensionsPath]
                };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, config));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            services.set(extensionManagement_1.IExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService));
            services.set(localizations_2.ILocalizationsService, new descriptors_1.SyncDescriptor(localizations_1.LocalizationsService));
            var instantiationService2 = instantiationService.createChild(services);
            instantiationService2.invokeFunction(function (accessor) {
                var extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
                var channel = new extensionManagementIpc_1.ExtensionManagementChannel(extensionManagementService);
                server.registerChannel('extensions', channel);
                // clean up deprecated extensions
                extensionManagementService.removeDeprecatedExtensions();
                var localizationsService = accessor.get(localizations_2.ILocalizationsService);
                var localizationsChannel = new localizationsIpc_1.LocalizationsChannel(localizationsService);
                server.registerChannel('localizations', localizationsChannel);
                contributions_1.createSharedProcessContributions(instantiationService2);
            });
        });
    }
    function setupIPC(hook) {
        function setup(retry) {
            return ipc_net_1.serve(hook).then(null, function (err) {
                if (!retry || platform.isWindows || err.code !== 'EADDRINUSE') {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                // should retry, not windows and eaddrinuse
                return ipc_net_1.connect(hook, '').then(function (client) {
                    // we could connect to a running instance. this is not good, abort
                    client.dispose();
                    return winjs_base_1.TPromise.wrapError(new Error('There is an instance already running.'));
                }, function (err) {
                    // it happens on Linux and OS X that the pipe is left behind
                    // let's delete it, since we can't connect to it
                    // and the retry the whole thing
                    try {
                        fs.unlinkSync(hook);
                    }
                    catch (e) {
                        return winjs_base_1.TPromise.wrapError(new Error('Error deleting the shared ipc hook.'));
                    }
                    return setup(false);
                });
            });
        }
        return setup(true);
    }
    function startHandshake() {
        return new winjs_base_1.TPromise(function (c, e) {
            electron_1.ipcRenderer.once('handshake:hey there', function (_, r) { return c(r); });
            electron_1.ipcRenderer.send('handshake:hello');
        });
    }
    function handshake(configuration) {
        return startHandshake()
            .then(function (data) { return setupIPC(data.sharedIPCHandle).then(function (server) { return main(server, data, configuration); }); })
            .then(function () { return electron_1.ipcRenderer.send('handshake:im ready'); });
    }
});
