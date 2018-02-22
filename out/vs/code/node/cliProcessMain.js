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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "vs/nls", "vs/platform/node/product", "vs/platform/node/package", "path", "vs/base/common/winjs.base", "vs/base/common/async", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/node/extensionGalleryService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/node/commonProperties", "vs/platform/request/node/request", "vs/platform/request/node/requestService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/node/configurationService", "vs/platform/telemetry/node/appInsightsAppender", "vs/base/node/pfs", "vs/platform/message/common/message", "vs/platform/message/node/messageCli", "vs/base/common/labels", "vs/platform/state/common/state", "vs/platform/state/node/stateService", "vs/platform/log/node/spdlogService", "vs/platform/log/common/log", "vs/base/common/errors"], function (require, exports, nls_1, product_1, package_1, path, winjs_base_1, async_1, serviceCollection_1, descriptors_1, instantiationService_1, environment_1, environmentService_1, extensionManagement_1, extensionManagementService_1, extensionGalleryService_1, telemetry_1, telemetryUtils_1, telemetryService_1, commonProperties_1, request_1, requestService_1, configuration_1, configurationService_1, appInsightsAppender_1, pfs_1, message_1, messageCli_1, labels_1, state_1, stateService_1, spdlogService_1, log_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var notFound = function (id) { return nls_1.localize('notFound', "Extension '{0}' not found.", id); };
    var notInstalled = function (id) { return nls_1.localize('notInstalled', "Extension '{0}' is not installed.", id); };
    var useId = nls_1.localize('useId', "Make sure you use the full extension ID, including the publisher, eg: {0}", 'ms-vscode.csharp');
    function getId(manifest, withVersion) {
        if (withVersion) {
            return manifest.publisher + "." + manifest.name + "@" + manifest.version;
        }
        else {
            return manifest.publisher + "." + manifest.name;
        }
    }
    var Main = /** @class */ (function () {
        function Main(environmentService, extensionManagementService, extensionGalleryService) {
            this.environmentService = environmentService;
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
        }
        Main.prototype.run = function (argv) {
            // TODO@joao - make this contributable
            if (argv['install-source']) {
                return this.setInstallSource(argv['install-source']);
            }
            else if (argv['list-extensions']) {
                return this.listExtensions(argv['show-versions']);
            }
            else if (argv['install-extension']) {
                var arg = argv['install-extension'];
                var args = typeof arg === 'string' ? [arg] : arg;
                return this.installExtension(args);
            }
            else if (argv['uninstall-extension']) {
                var arg = argv['uninstall-extension'];
                var ids = typeof arg === 'string' ? [arg] : arg;
                return this.uninstallExtension(ids);
            }
            return undefined;
        };
        Main.prototype.setInstallSource = function (installSource) {
            return pfs_1.writeFile(this.environmentService.installSourcePath, installSource.slice(0, 30));
        };
        Main.prototype.listExtensions = function (showVersions) {
            return this.extensionManagementService.getInstalled(extensionManagement_1.LocalExtensionType.User).then(function (extensions) {
                extensions.forEach(function (e) { return console.log(getId(e.manifest, showVersions)); });
            });
        };
        Main.prototype.installExtension = function (extensions) {
            var _this = this;
            var vsixTasks = extensions
                .filter(function (e) { return /\.vsix$/i.test(e); })
                .map(function (id) { return function () {
                var extension = path.isAbsolute(id) ? id : path.join(process.cwd(), id);
                return _this.extensionManagementService.install(extension).then(function () {
                    console.log(nls_1.localize('successVsixInstall', "Extension '{0}' was successfully installed!", labels_1.getBaseLabel(extension)));
                }, function (error) {
                    if (errors_1.isPromiseCanceledError(error)) {
                        console.log(nls_1.localize('cancelVsixInstall', "Cancelled installing Extension '{0}'.", labels_1.getBaseLabel(extension)));
                        return null;
                    }
                    else {
                        return winjs_base_1.TPromise.wrapError(error);
                    }
                });
            }; });
            var galleryTasks = extensions
                .filter(function (e) { return !/\.vsix$/i.test(e); })
                .map(function (id) { return function () {
                return _this.extensionManagementService.getInstalled(extensionManagement_1.LocalExtensionType.User).then(function (installed) {
                    var isInstalled = installed.some(function (e) { return getId(e.manifest) === id; });
                    if (isInstalled) {
                        console.log(nls_1.localize('alreadyInstalled', "Extension '{0}' is already installed.", id));
                        return winjs_base_1.TPromise.as(null);
                    }
                    return _this.extensionGalleryService.query({ names: [id], source: 'cli' })
                        .then(null, function (err) {
                        if (err.responseText) {
                            try {
                                var response = JSON.parse(err.responseText);
                                return winjs_base_1.TPromise.wrapError(response.message);
                            }
                            catch (e) {
                                // noop
                            }
                        }
                        return winjs_base_1.TPromise.wrapError(err);
                    })
                        .then(function (result) {
                        var extension = result.firstPage[0];
                        if (!extension) {
                            return winjs_base_1.TPromise.wrapError(new Error(notFound(id) + "\n" + useId));
                        }
                        console.log(nls_1.localize('foundExtension', "Found '{0}' in the marketplace.", id));
                        console.log(nls_1.localize('installing', "Installing..."));
                        return _this.extensionManagementService.installFromGallery(extension)
                            .then(function () { return console.log(nls_1.localize('successInstall', "Extension '{0}' v{1} was successfully installed!", id, extension.version)); }, function (error) {
                            if (errors_1.isPromiseCanceledError(error)) {
                                console.log(nls_1.localize('cancelVsixInstall', "Cancelled installing Extension '{0}'.", id));
                                return null;
                            }
                            else {
                                return winjs_base_1.TPromise.wrapError(error);
                            }
                        });
                    });
                });
            }; });
            return async_1.sequence(vsixTasks.concat(galleryTasks));
        };
        Main.prototype.uninstallExtension = function (extensions) {
            var _this = this;
            function getExtensionId(extensionDescription) {
                return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                    var zipPath, manifest;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!/\.vsix$/i.test(extensionDescription)) {
                                    return [2 /*return*/, extensionDescription];
                                }
                                zipPath = path.isAbsolute(extensionDescription) ? extensionDescription : path.join(process.cwd(), extensionDescription);
                                return [4 /*yield*/, extensionManagementService_1.validateLocalExtension(zipPath)];
                            case 1:
                                manifest = _a.sent();
                                return [2 /*return*/, getId(manifest)];
                        }
                    });
                });
            }
            return async_1.sequence(extensions.map(function (extension) { return function () {
                return getExtensionId(extension).then(function (id) {
                    return _this.extensionManagementService.getInstalled(extensionManagement_1.LocalExtensionType.User).then(function (installed) {
                        var extension = installed.filter(function (e) { return getId(e.manifest) === id; })[0];
                        if (!extension) {
                            return winjs_base_1.TPromise.wrapError(new Error(notInstalled(id) + "\n" + useId));
                        }
                        console.log(nls_1.localize('uninstalling', "Uninstalling {0}...", id));
                        return _this.extensionManagementService.uninstall(extension, true)
                            .then(function () { return console.log(nls_1.localize('successUninstall', "Extension '{0}' was successfully uninstalled!", id)); });
                    });
                });
            }; }));
        };
        Main = __decorate([
            __param(0, environment_1.IEnvironmentService),
            __param(1, extensionManagement_1.IExtensionManagementService),
            __param(2, extensionManagement_1.IExtensionGalleryService)
        ], Main);
        return Main;
    }());
    var eventPrefix = 'monacoworkbench';
    function main(argv) {
        var services = new serviceCollection_1.ServiceCollection();
        var environmentService = new environmentService_1.EnvironmentService(argv, process.execPath);
        var logService = spdlogService_1.createSpdLogService('cli', log_1.getLogLevel(environmentService), environmentService.logsPath);
        process.once('exit', function () { return logService.dispose(); });
        logService.info('main', argv);
        services.set(environment_1.IEnvironmentService, environmentService);
        services.set(log_1.ILogService, logService);
        services.set(state_1.IStateService, new descriptors_1.SyncDescriptor(stateService_1.StateService));
        var instantiationService = new instantiationService_1.InstantiationService(services);
        return instantiationService.invokeFunction(function (accessor) {
            var envService = accessor.get(environment_1.IEnvironmentService);
            var stateService = accessor.get(state_1.IStateService);
            return winjs_base_1.TPromise.join([envService.appSettingsHome, envService.extensionsPath].map(function (p) { return pfs_1.mkdirp(p); })).then(function () {
                var appRoot = envService.appRoot, extensionsPath = envService.extensionsPath, extensionDevelopmentPath = envService.extensionDevelopmentPath, isBuilt = envService.isBuilt, installSourcePath = envService.installSourcePath;
                var services = new serviceCollection_1.ServiceCollection();
                services.set(configuration_1.IConfigurationService, new descriptors_1.SyncDescriptor(configurationService_1.ConfigurationService));
                services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
                services.set(extensionManagement_1.IExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
                services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService));
                services.set(message_1.IChoiceService, new descriptors_1.SyncDescriptor(messageCli_1.ChoiceCliService));
                if (isBuilt && !extensionDevelopmentPath && !envService.args['disable-telemetry'] && product_1.default.enableTelemetry) {
                    var appenders_1 = [];
                    if (product_1.default.aiConfig && product_1.default.aiConfig.asimovKey) {
                        appenders_1.push(new appInsightsAppender_1.AppInsightsAppender(eventPrefix, null, product_1.default.aiConfig.asimovKey));
                    }
                    // It is important to dispose the AI adapter properly because
                    // only then they flush remaining data.
                    process.once('exit', function () { return appenders_1.forEach(function (a) { return a.dispose(); }); });
                    var config = {
                        appender: telemetryUtils_1.combinedAppender.apply(void 0, appenders_1),
                        commonProperties: commonProperties_1.resolveCommonProperties(product_1.default.commit, package_1.default.version, stateService.getItem('telemetry.machineId'), installSourcePath),
                        piiPaths: [appRoot, extensionsPath]
                    };
                    services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, config));
                }
                else {
                    services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
                }
                var instantiationService2 = instantiationService.createChild(services);
                var main = instantiationService2.createInstance(Main);
                return main.run(argv);
            });
        });
    }
    exports.main = main;
});
