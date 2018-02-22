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
define(["require", "exports", "vs/nls", "vs/base/common/errors", "vs/base/common/objects", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/platform/node/package", "path", "os", "vs/base/node/pfs", "vs/base/common/uri", "vs/base/common/platform", "vs/workbench/services/extensions/node/extensionDescriptionRegistry", "vs/platform/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensionsRegistry", "vs/workbench/services/extensions/node/extensionPoints", "vs/platform/message/common/message", "vs/workbench/api/node/extHost.protocol", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/electron-browser/extensionHost", "vs/workbench/api/electron-browser/extHostCustomers", "vs/platform/windows/common/windows", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/platform/lifecycle/common/lifecycle", "vs/base/common/async", "vs/base/common/event", "vs/workbench/services/extensions/electron-browser/extensionHostProfiler", "vs/workbench/electron-browser/actions", "vs/platform/node/product", "vs/base/common/strings", "vs/workbench/services/extensions/node/rpcProtocol"], function (require, exports, nls, errors, objects, severity_1, winjs_base_1, package_1, path, os, pfs, uri_1, platform, extensionDescriptionRegistry_1, extensions_1, extensionManagement_1, extensionManagementUtil_1, extensionsRegistry_1, extensionPoints_1, message_1, extHost_protocol_1, telemetry_1, environment_1, storage_1, instantiation_1, extensionHost_1, extHostCustomers_1, windows_1, actions_1, lifecycle_1, performance_1, lifecycle_2, async_1, event_1, extensionHostProfiler_1, actions_2, product_1, strings, rpcProtocol_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var _SystemExtensionsRoot = null;
    function getSystemExtensionsRoot() {
        if (!_SystemExtensionsRoot) {
            _SystemExtensionsRoot = path.normalize(path.join(uri_1.default.parse(require.toUrl('')).fsPath, '..', 'extensions'));
        }
        return _SystemExtensionsRoot;
    }
    var _ExtraDevSystemExtensionsRoot = null;
    function getExtraDevSystemExtensionsRoot() {
        if (!_ExtraDevSystemExtensionsRoot) {
            _ExtraDevSystemExtensionsRoot = path.normalize(path.join(uri_1.default.parse(require.toUrl('')).fsPath, '..', '.build', 'builtInExtensions'));
        }
        return _ExtraDevSystemExtensionsRoot;
    }
    var ExtraBuiltInExtensionResolver = /** @class */ (function () {
        function ExtraBuiltInExtensionResolver(builtInExtensions, control) {
            this.builtInExtensions = builtInExtensions;
            this.control = control;
        }
        ExtraBuiltInExtensionResolver.prototype.resolveExtensions = function () {
            var result = [];
            for (var _i = 0, _a = this.builtInExtensions; _i < _a.length; _i++) {
                var ext = _a[_i];
                var controlState = this.control[ext.name] || 'marketplace';
                switch (controlState) {
                    case 'disabled':
                        break;
                    case 'marketplace':
                        result.push({ name: ext.name, path: path.join(getExtraDevSystemExtensionsRoot(), ext.name) });
                        break;
                    default:
                        result.push({ name: ext.name, path: controlState });
                        break;
                }
            }
            return winjs_base_1.TPromise.as(result);
        };
        return ExtraBuiltInExtensionResolver;
    }());
    // Enable to see detailed message communication between window and extension host
    var logExtensionHostCommunication = false;
    function messageWithSource(msg) {
        return messageWithSource2(msg.source, msg.message);
    }
    function messageWithSource2(source, message) {
        if (source) {
            return "[" + source + "]: " + message;
        }
        return message;
    }
    var hasOwnProperty = Object.hasOwnProperty;
    var NO_OP_VOID_PROMISE = winjs_base_1.TPromise.wrap(void 0);
    var ExtensionService = /** @class */ (function (_super) {
        __extends(ExtensionService, _super);
        function ExtensionService(_instantiationService, _messageService, _environmentService, _telemetryService, _extensionEnablementService, _storageService, _windowService, lifecycleService) {
            var _this = _super.call(this) || this;
            _this._instantiationService = _instantiationService;
            _this._messageService = _messageService;
            _this._environmentService = _environmentService;
            _this._telemetryService = _telemetryService;
            _this._extensionEnablementService = _extensionEnablementService;
            _this._storageService = _storageService;
            _this._windowService = _windowService;
            _this._onDidChangeExtensionsStatus = _this._register(new event_1.Emitter());
            _this.onDidChangeExtensionsStatus = _this._onDidChangeExtensionsStatus.event;
            _this._registry = null;
            _this._installedExtensionsReady = new async_1.Barrier();
            _this._isDev = !_this._environmentService.isBuilt || _this._environmentService.isExtensionDevelopment;
            _this._extensionsMessages = {};
            _this._allRequestedActivateEvents = Object.create(null);
            _this._onDidRegisterExtensions = new event_1.Emitter();
            _this._extensionHostProcessFinishedActivateEvents = Object.create(null);
            _this._extensionHostProcessActivationTimes = Object.create(null);
            _this._extensionHostExtensionRuntimeErrors = Object.create(null);
            _this._extensionHostProcessWorker = null;
            _this._extensionHostProcessRPCProtocol = null;
            _this._extensionHostProcessCustomers = [];
            _this._extensionHostProcessProxy = null;
            _this.startDelayed(lifecycleService);
            return _this;
        }
        ExtensionService.prototype.startDelayed = function (lifecycleService) {
            var _this = this;
            var started = false;
            var startOnce = function () {
                if (!started) {
                    started = true;
                    _this._startExtensionHostProcess([]);
                    _this._scanAndHandleExtensions();
                }
            };
            // delay extension host creation and extension scanning
            // until the workbench is restoring. we cannot defer the
            // extension host more (LifecyclePhase.Running) because
            // some editors require the extension host to restore
            // and this would result in a deadlock
            // see https://github.com/Microsoft/vscode/issues/41322
            lifecycleService.when(lifecycle_2.LifecyclePhase.Restoring).then(function () {
                // we add an additional delay of 800ms because the extension host
                // starting is a potential expensive operation and we do no want
                // to fight with editors, viewlets and panels restoring.
                setTimeout(function () { return startOnce(); }, 800);
            });
            // if we are running before the 800ms delay, make sure to start
            // the extension host right away though.
            lifecycleService.when(lifecycle_2.LifecyclePhase.Running).then(function () { return startOnce(); });
        };
        ExtensionService.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(ExtensionService.prototype, "onDidRegisterExtensions", {
            get: function () {
                return this._onDidRegisterExtensions.event;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionService.prototype.restartExtensionHost = function () {
            this._stopExtensionHostProcess();
            this._startExtensionHostProcess(Object.keys(this._allRequestedActivateEvents));
        };
        ExtensionService.prototype.startExtensionHost = function () {
            this._startExtensionHostProcess(Object.keys(this._allRequestedActivateEvents));
        };
        ExtensionService.prototype.stopExtensionHost = function () {
            this._stopExtensionHostProcess();
        };
        ExtensionService.prototype._stopExtensionHostProcess = function () {
            var previouslyActivatedExtensionIds = Object.keys(this._extensionHostProcessActivationTimes);
            this._extensionHostProcessFinishedActivateEvents = Object.create(null);
            this._extensionHostProcessActivationTimes = Object.create(null);
            this._extensionHostExtensionRuntimeErrors = Object.create(null);
            if (this._extensionHostProcessWorker) {
                this._extensionHostProcessWorker.dispose();
                this._extensionHostProcessWorker = null;
            }
            if (this._extensionHostProcessRPCProtocol) {
                this._extensionHostProcessRPCProtocol.dispose();
                this._extensionHostProcessRPCProtocol = null;
            }
            for (var i = 0, len = this._extensionHostProcessCustomers.length; i < len; i++) {
                var customer = this._extensionHostProcessCustomers[i];
                try {
                    customer.dispose();
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                }
            }
            this._extensionHostProcessCustomers = [];
            this._extensionHostProcessProxy = null;
            this._onDidChangeExtensionsStatus.fire(previouslyActivatedExtensionIds);
        };
        ExtensionService.prototype._startExtensionHostProcess = function (initialActivationEvents) {
            var _this = this;
            this._stopExtensionHostProcess();
            this._extensionHostProcessWorker = this._instantiationService.createInstance(extensionHost_1.ExtensionHostProcessWorker, this);
            this._extensionHostProcessWorker.onCrashed(function (_a) {
                var code = _a[0], signal = _a[1];
                return _this._onExtensionHostCrashed(code, signal);
            });
            this._extensionHostProcessProxy = this._extensionHostProcessWorker.start().then(function (protocol) {
                return { value: _this._createExtensionHostCustomers(protocol) };
            }, function (err) {
                console.error('Error received from starting extension host');
                console.error(err);
                return null;
            });
            this._extensionHostProcessProxy.then(function () {
                initialActivationEvents.forEach(function (activationEvent) { return _this.activateByEvent(activationEvent); });
            });
        };
        ExtensionService.prototype._onExtensionHostCrashed = function (code, signal) {
            var _this = this;
            var openDevTools = new actions_1.Action('openDevTools', nls.localize('devTools', "Developer Tools"), '', true, function () {
                return _this._windowService.openDevTools().then(function () { return false; });
            });
            var restart = new actions_1.Action('restart', nls.localize('restart', "Restart Extension Host"), '', true, function () {
                _this._messageService.hideAll();
                _this._startExtensionHostProcess(Object.keys(_this._allRequestedActivateEvents));
                return winjs_base_1.TPromise.as(true);
            });
            console.error('Extension host terminated unexpectedly. Code: ', code, ' Signal: ', signal);
            this._stopExtensionHostProcess();
            var message = nls.localize('extensionHostProcess.crash', "Extension host terminated unexpectedly.");
            if (code === 87) {
                message = nls.localize('extensionHostProcess.unresponsiveCrash', "Extension host terminated because it was not responsive.");
            }
            this._messageService.show(severity_1.default.Error, {
                message: message,
                actions: [
                    openDevTools,
                    restart
                ]
            });
        };
        ExtensionService.prototype._createExtensionHostCustomers = function (protocol) {
            if (logExtensionHostCommunication || this._environmentService.logExtensionHostCommunication) {
                protocol = asLoggingProtocol(protocol);
            }
            this._extensionHostProcessRPCProtocol = new rpcProtocol_1.RPCProtocol(protocol);
            var extHostContext = this._extensionHostProcessRPCProtocol;
            // Named customers
            var namedCustomers = extHostCustomers_1.ExtHostCustomersRegistry.getNamedCustomers();
            for (var i = 0, len = namedCustomers.length; i < len; i++) {
                var _a = namedCustomers[i], id = _a[0], ctor = _a[1];
                var instance = this._instantiationService.createInstance(ctor, extHostContext);
                this._extensionHostProcessCustomers.push(instance);
                this._extensionHostProcessRPCProtocol.set(id, instance);
            }
            // Customers
            var customers = extHostCustomers_1.ExtHostCustomersRegistry.getCustomers();
            for (var i = 0, len = customers.length; i < len; i++) {
                var ctor = customers[i];
                var instance = this._instantiationService.createInstance(ctor, extHostContext);
                this._extensionHostProcessCustomers.push(instance);
            }
            // Check that no named customers are missing
            var expected = Object.keys(extHost_protocol_1.MainContext).map(function (key) { return extHost_protocol_1.MainContext[key]; });
            this._extensionHostProcessRPCProtocol.assertRegistered(expected);
            return this._extensionHostProcessRPCProtocol.getProxy(extHost_protocol_1.ExtHostContext.ExtHostExtensionService);
        };
        // ---- begin IExtensionService
        ExtensionService.prototype.activateByEvent = function (activationEvent) {
            var _this = this;
            if (this._installedExtensionsReady.isOpen()) {
                // Extensions have been scanned and interpreted
                if (!this._registry.containsActivationEvent(activationEvent)) {
                    // There is no extension that is interested in this activation event
                    return NO_OP_VOID_PROMISE;
                }
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents[activationEvent] = true;
                return this._activateByEvent(activationEvent);
            }
            else {
                // Extensions have not been scanned yet.
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents[activationEvent] = true;
                return this._installedExtensionsReady.wait().then(function () { return _this._activateByEvent(activationEvent); });
            }
        };
        ExtensionService.prototype._activateByEvent = function (activationEvent) {
            var _this = this;
            if (this._extensionHostProcessFinishedActivateEvents[activationEvent] || !this._extensionHostProcessProxy) {
                return NO_OP_VOID_PROMISE;
            }
            return this._extensionHostProcessProxy.then(function (proxy) {
                return proxy.value.$activateByEvent(activationEvent);
            }).then(function () {
                _this._extensionHostProcessFinishedActivateEvents[activationEvent] = true;
            });
        };
        ExtensionService.prototype.whenInstalledExtensionsRegistered = function () {
            return this._installedExtensionsReady.wait();
        };
        ExtensionService.prototype.getExtensions = function () {
            var _this = this;
            return this._installedExtensionsReady.wait().then(function () {
                return _this._registry.getAllExtensionDescriptions();
            });
        };
        ExtensionService.prototype.readExtensionPointContributions = function (extPoint) {
            var _this = this;
            return this._installedExtensionsReady.wait().then(function () {
                var availableExtensions = _this._registry.getAllExtensionDescriptions();
                var result = [], resultLen = 0;
                for (var i = 0, len = availableExtensions.length; i < len; i++) {
                    var desc = availableExtensions[i];
                    if (desc.contributes && hasOwnProperty.call(desc.contributes, extPoint.name)) {
                        result[resultLen++] = new extensions_1.ExtensionPointContribution(desc, desc.contributes[extPoint.name]);
                    }
                }
                return result;
            });
        };
        ExtensionService.prototype.getExtensionsStatus = function () {
            var result = Object.create(null);
            if (this._registry) {
                var extensions = this._registry.getAllExtensionDescriptions();
                for (var i = 0, len = extensions.length; i < len; i++) {
                    var extension = extensions[i];
                    var id = extension.id;
                    result[id] = {
                        messages: this._extensionsMessages[id],
                        activationTimes: this._extensionHostProcessActivationTimes[id],
                        runtimeErrors: this._extensionHostExtensionRuntimeErrors[id],
                    };
                }
            }
            return result;
        };
        ExtensionService.prototype.canProfileExtensionHost = function () {
            return this._extensionHostProcessWorker && Boolean(this._extensionHostProcessWorker.getInspectPort());
        };
        ExtensionService.prototype.startExtensionHostProfile = function () {
            if (this._extensionHostProcessWorker) {
                var port = this._extensionHostProcessWorker.getInspectPort();
                if (port) {
                    return this._instantiationService.createInstance(extensionHostProfiler_1.ExtensionHostProfiler, port).start();
                }
            }
            throw new Error('Extension host not running or no inspect port available');
        };
        // ---- end IExtensionService
        // --- impl
        ExtensionService.prototype._scanAndHandleExtensions = function () {
            var _this = this;
            this._getRuntimeExtension()
                .then(function (runtimeExtensons) {
                _this._registry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(runtimeExtensons);
                var availableExtensions = _this._registry.getAllExtensionDescriptions();
                var extensionPoints = extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints();
                var messageHandler = function (msg) { return _this._handleExtensionPointMessage(msg); };
                for (var i = 0, len = extensionPoints.length; i < len; i++) {
                    var clock = performance_1.time("handleExtensionPoint:" + extensionPoints[i].name);
                    try {
                        ExtensionService._handleExtensionPoint(extensionPoints[i], availableExtensions, messageHandler);
                    }
                    finally {
                        clock.stop();
                    }
                }
                performance_1.mark('extensionHostReady');
                _this._installedExtensionsReady.open();
                _this._onDidRegisterExtensions.fire(availableExtensions);
                _this._onDidChangeExtensionsStatus.fire(availableExtensions.map(function (e) { return e.id; }));
            });
        };
        ExtensionService.prototype._getRuntimeExtension = function () {
            var _this = this;
            var log = new Logger(function (severity, source, message) {
                _this._logOrShowMessage(severity, _this._isDev ? messageWithSource2(source, message) : message);
            });
            return ExtensionService._scanInstalledExtensions(this._instantiationService, this._messageService, this._environmentService, log)
                .then(function (_a) {
                var system = _a.system, user = _a.user, development = _a.development;
                _this._extensionEnablementService.migrateToIdentifiers(user); // TODO: @sandy Remove it after couple of milestones
                return _this._extensionEnablementService.getDisabledExtensions()
                    .then(function (disabledExtensions) {
                    var result = {};
                    var extensionsToDisable = [];
                    var userMigratedSystemExtensions = [{ id: extensionManagementUtil_1.BetterMergeId }];
                    system.forEach(function (systemExtension) {
                        // Disabling system extensions is not supported
                        result[systemExtension.id] = systemExtension;
                    });
                    user.forEach(function (userExtension) {
                        if (result.hasOwnProperty(userExtension.id)) {
                            log.warn(userExtension.extensionFolderPath, nls.localize('overwritingExtension', "Overwriting extension {0} with {1}.", result[userExtension.id].extensionFolderPath, userExtension.extensionFolderPath));
                        }
                        if (disabledExtensions.every(function (disabled) { return !extensionManagementUtil_1.areSameExtensions(disabled, userExtension); })) {
                            // Check if the extension is changed to system extension
                            var userMigratedSystemExtension = userMigratedSystemExtensions.filter(function (userMigratedSystemExtension) { return extensionManagementUtil_1.areSameExtensions(userMigratedSystemExtension, { id: userExtension.id }); })[0];
                            if (userMigratedSystemExtension) {
                                extensionsToDisable.push(userMigratedSystemExtension);
                            }
                            else {
                                result[userExtension.id] = userExtension;
                            }
                        }
                    });
                    development.forEach(function (developedExtension) {
                        log.info('', nls.localize('extensionUnderDevelopment', "Loading development extension at {0}", developedExtension.extensionFolderPath));
                        if (result.hasOwnProperty(developedExtension.id)) {
                            log.warn(developedExtension.extensionFolderPath, nls.localize('overwritingExtension', "Overwriting extension {0} with {1}.", result[developedExtension.id].extensionFolderPath, developedExtension.extensionFolderPath));
                        }
                        // Do not disable extensions under development
                        result[developedExtension.id] = developedExtension;
                    });
                    var runtimeExtensions = Object.keys(result).map(function (name) { return result[name]; });
                    _this._telemetryService.publicLog('extensionsScanned', {
                        totalCount: runtimeExtensions.length,
                        disabledCount: disabledExtensions.length
                    });
                    if (extensionsToDisable.length) {
                        return winjs_base_1.TPromise.join(extensionsToDisable.map(function (e) { return _this._extensionEnablementService.setEnablement(e, extensionManagement_1.EnablementState.Disabled); }))
                            .then(function () {
                            _this._storageService.store(extensionManagementUtil_1.BetterMergeDisabledNowKey, true);
                            return runtimeExtensions;
                        });
                    }
                    else {
                        return runtimeExtensions;
                    }
                });
            });
        };
        ExtensionService.prototype._handleExtensionPointMessage = function (msg) {
            if (!this._extensionsMessages[msg.source]) {
                this._extensionsMessages[msg.source] = [];
            }
            this._extensionsMessages[msg.source].push(msg);
            if (msg.source === this._environmentService.extensionDevelopmentPath) {
                // This message is about the extension currently being developed
                this._showMessageToUser(msg.type, messageWithSource(msg));
            }
            else {
                this._logMessageInConsole(msg.type, messageWithSource(msg));
            }
            if (!this._isDev && msg.extensionId) {
                var type = msg.type, extensionId = msg.extensionId, extensionPointId = msg.extensionPointId, message = msg.message;
                /* __GDPR__
                    "extensionsMessage" : {
                        "type" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                        "extensionId": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                        "extensionPointId": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                        "message": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                    }
                */
                this._telemetryService.publicLog('extensionsMessage', {
                    type: type, extensionId: extensionId, extensionPointId: extensionPointId, message: message
                });
            }
        };
        ExtensionService._validateExtensionsCache = function (instantiationService, messageService, environmentService, cacheKey, input) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var cacheFolder, cacheFile, expected, cacheContents, actual, err_1, message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheFolder = path.join(environmentService.userDataPath, extensions_1.MANIFEST_CACHE_FOLDER);
                            cacheFile = path.join(cacheFolder, cacheKey);
                            return [4 /*yield*/, extensionPoints_1.ExtensionScanner.scanExtensions(input, new NullLogger())];
                        case 1:
                            expected = _a.sent();
                            return [4 /*yield*/, this._readExtensionCache(environmentService, cacheKey)];
                        case 2:
                            cacheContents = _a.sent();
                            if (!cacheContents) {
                                // Cache has been deleted by someone else, which is perfectly fine...
                                return [2 /*return*/];
                            }
                            actual = cacheContents.result;
                            if (objects.equals(expected, actual)) {
                                // Cache is valid and running with it is perfectly fine...
                                return [2 /*return*/];
                            }
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, pfs.del(cacheFile)];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            err_1 = _a.sent();
                            errors.onUnexpectedError(err_1);
                            console.error(err_1);
                            return [3 /*break*/, 6];
                        case 6:
                            message = nls.localize('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window.");
                            messageService.show(severity_1.default.Info, {
                                message: message,
                                actions: [
                                    instantiationService.createInstance(actions_2.ReloadWindowAction, actions_2.ReloadWindowAction.ID, actions_2.ReloadWindowAction.LABEL),
                                    message_1.CloseAction
                                ]
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        ExtensionService._readExtensionCache = function (environmentService, cacheKey) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var cacheFolder, cacheFile, cacheRawContents, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheFolder = path.join(environmentService.userDataPath, extensions_1.MANIFEST_CACHE_FOLDER);
                            cacheFile = path.join(cacheFolder, cacheKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, pfs.readFile(cacheFile, 'utf8')];
                        case 2:
                            cacheRawContents = _a.sent();
                            return [2 /*return*/, JSON.parse(cacheRawContents)];
                        case 3:
                            err_2 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/, null];
                    }
                });
            });
        };
        ExtensionService._writeExtensionCache = function (environmentService, cacheKey, cacheContents) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var cacheFolder, cacheFile, err_3, err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheFolder = path.join(environmentService.userDataPath, extensions_1.MANIFEST_CACHE_FOLDER);
                            cacheFile = path.join(cacheFolder, cacheKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, pfs.mkdirp(cacheFolder)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_3 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            _a.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, pfs.writeFile(cacheFile, JSON.stringify(cacheContents))];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            err_4 = _a.sent();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        ExtensionService._scanExtensionsWithCache = function (instantiationService, messageService, environmentService, cacheKey, input, log) {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var _this = this;
                var folderStat, err_5, cacheContents, counterLogger, result, cacheContents_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (input.devMode) {
                                // Do not cache when running out of sources...
                                return [2 /*return*/, extensionPoints_1.ExtensionScanner.scanExtensions(input, log)];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, pfs.stat(input.absoluteFolderPath)];
                        case 2:
                            folderStat = _a.sent();
                            input.mtime = folderStat.mtime.getTime();
                            return [3 /*break*/, 4];
                        case 3:
                            err_5 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this._readExtensionCache(environmentService, cacheKey)];
                        case 5:
                            cacheContents = _a.sent();
                            if (cacheContents && cacheContents.input && extensionPoints_1.ExtensionScannerInput.equals(cacheContents.input, input)) {
                                // Validate the cache asynchronously after 5s
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var err_6;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, this._validateExtensionsCache(instantiationService, messageService, environmentService, cacheKey, input)];
                                            case 1:
                                                _a.sent();
                                                return [3 /*break*/, 3];
                                            case 2:
                                                err_6 = _a.sent();
                                                errors.onUnexpectedError(err_6);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); }, 5000);
                                return [2 /*return*/, cacheContents.result];
                            }
                            counterLogger = new CounterLogger(log);
                            return [4 /*yield*/, extensionPoints_1.ExtensionScanner.scanExtensions(input, counterLogger)];
                        case 6:
                            result = _a.sent();
                            if (!(counterLogger.errorCnt === 0)) return [3 /*break*/, 8];
                            cacheContents_1 = {
                                input: input,
                                result: result
                            };
                            return [4 /*yield*/, this._writeExtensionCache(environmentService, cacheKey, cacheContents_1)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/, result];
                    }
                });
            });
        };
        ExtensionService._scanInstalledExtensions = function (instantiationService, messageService, environmentService, log) {
            var _this = this;
            var translationConfig = platform.translationsConfigFile
                ? pfs.readFile(platform.translationsConfigFile, 'utf8').then(function (content) {
                    try {
                        return JSON.parse(content);
                    }
                    catch (err) {
                        return Object.create(null);
                    }
                }, function (err) {
                    return Object.create(null);
                })
                : winjs_base_1.TPromise.as(Object.create(null));
            return translationConfig.then(function (translations) {
                var version = package_1.default.version;
                var commit = product_1.default.commit;
                var devMode = !!process.env['VSCODE_DEV'];
                var locale = platform.locale;
                var builtinExtensions = _this._scanExtensionsWithCache(instantiationService, messageService, environmentService, extensions_1.BUILTIN_MANIFEST_CACHE_FILE, new extensionPoints_1.ExtensionScannerInput(version, commit, locale, devMode, getSystemExtensionsRoot(), true, translations), log);
                var finalBuiltinExtensions = builtinExtensions;
                if (devMode) {
                    var builtInExtensionsFilePath = path.normalize(path.join(uri_1.default.parse(require.toUrl('')).fsPath, '..', 'build', 'builtInExtensions.json'));
                    var builtInExtensions = pfs.readFile(builtInExtensionsFilePath, 'utf8')
                        .then(function (raw) { return JSON.parse(raw); });
                    var controlFilePath = path.join(os.homedir(), '.vscode-oss-dev', 'extensions', 'control.json');
                    var controlFile = pfs.readFile(controlFilePath, 'utf8')
                        .then(function (raw) { return JSON.parse(raw); }, function () { return ({}); });
                    var input_1 = new extensionPoints_1.ExtensionScannerInput(version, commit, locale, devMode, getExtraDevSystemExtensionsRoot(), true, translations);
                    var extraBuiltinExtensions = winjs_base_1.TPromise.join([builtInExtensions, controlFile])
                        .then(function (_a) {
                        var builtInExtensions = _a[0], control = _a[1];
                        return new ExtraBuiltInExtensionResolver(builtInExtensions, control);
                    })
                        .then(function (resolver) { return extensionPoints_1.ExtensionScanner.scanExtensions(input_1, log, resolver); });
                    finalBuiltinExtensions = winjs_base_1.TPromise.join([builtinExtensions, extraBuiltinExtensions]).then(function (_a) {
                        var builtinExtensions = _a[0], extraBuiltinExtensions = _a[1];
                        var resultMap = Object.create(null);
                        for (var i = 0, len = builtinExtensions.length; i < len; i++) {
                            resultMap[builtinExtensions[i].id] = builtinExtensions[i];
                        }
                        // Overwrite with extensions found in extra
                        for (var i = 0, len = extraBuiltinExtensions.length; i < len; i++) {
                            resultMap[extraBuiltinExtensions[i].id] = extraBuiltinExtensions[i];
                        }
                        var resultArr = Object.keys(resultMap).map(function (id) { return resultMap[id]; });
                        resultArr.sort(function (a, b) {
                            var aLastSegment = path.basename(a.extensionFolderPath);
                            var bLastSegment = path.basename(b.extensionFolderPath);
                            if (aLastSegment < bLastSegment) {
                                return -1;
                            }
                            if (aLastSegment > bLastSegment) {
                                return 1;
                            }
                            return 0;
                        });
                        return resultArr;
                    });
                }
                var userExtensions = (environmentService.disableExtensions || !environmentService.extensionsPath
                    ? winjs_base_1.TPromise.as([])
                    : _this._scanExtensionsWithCache(instantiationService, messageService, environmentService, extensions_1.USER_MANIFEST_CACHE_FILE, new extensionPoints_1.ExtensionScannerInput(version, commit, locale, devMode, environmentService.extensionsPath, false, translations), log));
                // Always load developed extensions while extensions development
                var developedExtensions = (environmentService.isExtensionDevelopment
                    ? extensionPoints_1.ExtensionScanner.scanOneOrMultipleExtensions(new extensionPoints_1.ExtensionScannerInput(version, commit, locale, devMode, environmentService.extensionDevelopmentPath, false, translations), log)
                    : winjs_base_1.TPromise.as([]));
                return winjs_base_1.TPromise.join([finalBuiltinExtensions, userExtensions, developedExtensions]).then(function (extensionDescriptions) {
                    var system = extensionDescriptions[0];
                    var user = extensionDescriptions[1];
                    var development = extensionDescriptions[2];
                    return { system: system, user: user, development: development };
                }).then(null, function (err) {
                    log.error('', err);
                    return { system: [], user: [], development: [] };
                });
            });
        };
        ExtensionService._handleExtensionPoint = function (extensionPoint, availableExtensions, messageHandler) {
            var users = [], usersLen = 0;
            for (var i = 0, len = availableExtensions.length; i < len; i++) {
                var desc = availableExtensions[i];
                if (desc.contributes && hasOwnProperty.call(desc.contributes, extensionPoint.name)) {
                    users[usersLen++] = {
                        description: desc,
                        value: desc.contributes[extensionPoint.name],
                        collector: new extensionsRegistry_1.ExtensionMessageCollector(messageHandler, desc, extensionPoint.name)
                    };
                }
            }
            extensionPoint.acceptUsers(users);
        };
        ExtensionService.prototype._showMessageToUser = function (severity, msg) {
            if (severity === severity_1.default.Error || severity === severity_1.default.Warning) {
                this._messageService.show(severity, msg);
            }
            else {
                this._logMessageInConsole(severity, msg);
            }
        };
        ExtensionService.prototype._logMessageInConsole = function (severity, msg) {
            if (severity === severity_1.default.Error) {
                console.error(msg);
            }
            else if (severity === severity_1.default.Warning) {
                console.warn(msg);
            }
            else {
                console.log(msg);
            }
        };
        // -- called by extension host
        ExtensionService.prototype._logOrShowMessage = function (severity, msg) {
            if (this._isDev) {
                this._showMessageToUser(severity, msg);
            }
            else {
                this._logMessageInConsole(severity, msg);
            }
        };
        ExtensionService.prototype._onExtensionActivated = function (extensionId, startup, codeLoadingTime, activateCallTime, activateResolvedTime, activationEvent) {
            this._extensionHostProcessActivationTimes[extensionId] = new extensions_1.ActivationTimes(startup, codeLoadingTime, activateCallTime, activateResolvedTime, activationEvent);
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        };
        ExtensionService.prototype._onExtensionRuntimeError = function (extensionId, err) {
            if (!this._extensionHostExtensionRuntimeErrors[extensionId]) {
                this._extensionHostExtensionRuntimeErrors[extensionId] = [];
            }
            this._extensionHostExtensionRuntimeErrors[extensionId].push(err);
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        };
        ExtensionService.prototype._addMessage = function (extensionId, severity, message) {
            if (!this._extensionsMessages[extensionId]) {
                this._extensionsMessages[extensionId] = [];
            }
            this._extensionsMessages[extensionId].push({
                type: severity,
                message: message,
                source: null,
                extensionId: null,
                extensionPointId: null
            });
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        };
        ExtensionService = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, message_1.IMessageService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, extensionManagement_1.IExtensionEnablementService),
            __param(5, storage_1.IStorageService),
            __param(6, windows_1.IWindowService),
            __param(7, lifecycle_2.ILifecycleService)
        ], ExtensionService);
        return ExtensionService;
    }(lifecycle_1.Disposable));
    exports.ExtensionService = ExtensionService;
    function asLoggingProtocol(protocol) {
        protocol.onMessage(function (msg) {
            console.log('%c[Extension \u2192 Window]%c[len: ' + strings.pad(msg.length, 5, ' ') + ']', 'color: darkgreen', 'color: grey', msg);
        });
        return {
            onMessage: protocol.onMessage,
            send: function (msg) {
                protocol.send(msg);
                console.log('%c[Window \u2192 Extension]%c[len: ' + strings.pad(msg.length, 5, ' ') + ']', 'color: darkgreen', 'color: grey', msg);
            }
        };
    }
    var Logger = /** @class */ (function () {
        function Logger(messageHandler) {
            this._messageHandler = messageHandler;
        }
        Logger.prototype.error = function (source, message) {
            this._messageHandler(severity_1.default.Error, source, message);
        };
        Logger.prototype.warn = function (source, message) {
            this._messageHandler(severity_1.default.Warning, source, message);
        };
        Logger.prototype.info = function (source, message) {
            this._messageHandler(severity_1.default.Info, source, message);
        };
        return Logger;
    }());
    exports.Logger = Logger;
    var CounterLogger = /** @class */ (function () {
        function CounterLogger(_actual) {
            this._actual = _actual;
            this.errorCnt = 0;
            this.warnCnt = 0;
            this.infoCnt = 0;
        }
        CounterLogger.prototype.error = function (source, message) {
            this._actual.error(source, message);
        };
        CounterLogger.prototype.warn = function (source, message) {
            this._actual.warn(source, message);
        };
        CounterLogger.prototype.info = function (source, message) {
            this._actual.info(source, message);
        };
        return CounterLogger;
    }());
    var NullLogger = /** @class */ (function () {
        function NullLogger() {
        }
        NullLogger.prototype.error = function (source, message) {
        };
        NullLogger.prototype.warn = function (source, message) {
        };
        NullLogger.prototype.info = function (source, message) {
        };
        return NullLogger;
    }());
});
