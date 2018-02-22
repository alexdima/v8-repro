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
define(["require", "exports", "vs/base/common/lifecycle", "path", "vs/base/node/pfs", "vs/base/common/severity", "vs/base/common/winjs.base", "vs/workbench/services/extensions/node/extensionDescriptionRegistry", "vs/workbench/api/node/extHostStorage", "vs/workbench/api/node/extHost.api.impl", "./extHost.protocol", "vs/workbench/api/node/extHostExtensionActivator", "vs/base/common/map", "vs/base/common/async", "vs/base/common/uri"], function (require, exports, lifecycle_1, path_1, pfs_1, severity_1, winjs_base_1, extensionDescriptionRegistry_1, extHostStorage_1, extHost_api_impl_1, extHost_protocol_1, extHostExtensionActivator_1, map_1, async_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtensionMemento = /** @class */ (function () {
        function ExtensionMemento(id, global, storage) {
            var _this = this;
            this._id = id;
            this._shared = global;
            this._storage = storage;
            this._init = this._storage.getValue(this._shared, this._id, Object.create(null)).then(function (value) {
                _this._value = value;
                return _this;
            });
        }
        Object.defineProperty(ExtensionMemento.prototype, "whenReady", {
            get: function () {
                return this._init;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionMemento.prototype.get = function (key, defaultValue) {
            var value = this._value[key];
            if (typeof value === 'undefined') {
                value = defaultValue;
            }
            return value;
        };
        ExtensionMemento.prototype.update = function (key, value) {
            this._value[key] = value;
            return this._storage
                .setValue(this._shared, this._id, this._value)
                .then(function () { return true; });
        };
        return ExtensionMemento;
    }());
    var ExtensionStoragePath = /** @class */ (function () {
        function ExtensionStoragePath(workspace, environment) {
            var _this = this;
            this._workspace = workspace;
            this._environment = environment;
            this._ready = this._getOrCreateWorkspaceStoragePath().then(function (value) { return _this._value = value; });
        }
        Object.defineProperty(ExtensionStoragePath.prototype, "whenReady", {
            get: function () {
                return this._ready;
            },
            enumerable: true,
            configurable: true
        });
        ExtensionStoragePath.prototype.value = function (extension) {
            if (this._value) {
                return path_1.join(this._value, extension.id);
            }
            return undefined;
        };
        ExtensionStoragePath.prototype._getOrCreateWorkspaceStoragePath = function () {
            return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
                var storageName, storagePath, exists, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this._workspace) {
                                return [2 /*return*/, winjs_base_1.TPromise.as(undefined)];
                            }
                            storageName = this._workspace.id;
                            storagePath = path_1.join(this._environment.appSettingsHome, 'workspaceStorage', storageName);
                            return [4 /*yield*/, pfs_1.dirExists(storagePath)];
                        case 1:
                            exists = _a.sent();
                            if (exists) {
                                return [2 /*return*/, storagePath];
                            }
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, pfs_1.mkdirp(storagePath)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, pfs_1.writeFile(path_1.join(storagePath, 'meta.json'), JSON.stringify({
                                    id: this._workspace.id,
                                    configuration: this._workspace.configuration && uri_1.default.revive(this._workspace.configuration).toString(),
                                    name: this._workspace.name
                                }, undefined, 2))];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, storagePath];
                        case 5:
                            e_1 = _a.sent();
                            console.error(e_1);
                            return [2 /*return*/, undefined];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return ExtensionStoragePath;
    }());
    var ExtHostExtensionService = /** @class */ (function () {
        /**
         * This class is constructed manually because it is a service, so it doesn't use any ctor injection
         */
        function ExtHostExtensionService(initData, extHostContext, extHostWorkspace, extHostConfiguration, extHostLogService, environmentService) {
            var _this = this;
            this._barrier = new async_1.Barrier();
            this._registry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry(initData.extensions);
            this._extHostLogService = extHostLogService;
            this._mainThreadTelemetry = extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            this._storage = new extHostStorage_1.ExtHostStorage(extHostContext);
            this._storagePath = new ExtensionStoragePath(initData.workspace, initData.environment);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.MainContext.MainThreadExtensionService);
            this._activator = null;
            // initialize API first (i.e. do not release barrier until the API is initialized)
            var apiFactory = extHost_api_impl_1.createApiFactory(initData, extHostContext, extHostWorkspace, extHostConfiguration, this, this._extHostLogService);
            extHost_api_impl_1.initializeExtensionApi(this, apiFactory).then(function () {
                _this._activator = new extHostExtensionActivator_1.ExtensionsActivator(_this._registry, {
                    showMessage: function (severity, message) {
                        _this._proxy.$localShowMessage(severity, message);
                        switch (severity) {
                            case severity_1.default.Error:
                                console.error(message);
                                break;
                            case severity_1.default.Warning:
                                console.warn(message);
                                break;
                            default:
                                console.log(message);
                        }
                    },
                    actualActivateExtension: function (extensionDescription, reason) {
                        return _this._activateExtension(extensionDescription, reason);
                    }
                });
                _this._barrier.open();
            });
        }
        ExtHostExtensionService.prototype.onExtensionAPIReady = function () {
            return this._barrier.wait();
        };
        ExtHostExtensionService.prototype.isActivated = function (extensionId) {
            if (this._barrier.isOpen()) {
                return this._activator.isActivated(extensionId);
            }
            return false;
        };
        ExtHostExtensionService.prototype.activateByEvent = function (activationEvent, startup) {
            var _this = this;
            var reason = new extHostExtensionActivator_1.ExtensionActivatedByEvent(startup, activationEvent);
            if (this._barrier.isOpen()) {
                return this._activator.activateByEvent(activationEvent, reason);
            }
            else {
                return this._barrier.wait().then(function () { return _this._activator.activateByEvent(activationEvent, reason); });
            }
        };
        ExtHostExtensionService.prototype.activateById = function (extensionId, reason) {
            var _this = this;
            if (this._barrier.isOpen()) {
                return this._activator.activateById(extensionId, reason);
            }
            else {
                return this._barrier.wait().then(function () { return _this._activator.activateById(extensionId, reason); });
            }
        };
        ExtHostExtensionService.prototype.getAllExtensionDescriptions = function () {
            return this._registry.getAllExtensionDescriptions();
        };
        ExtHostExtensionService.prototype.getExtensionDescription = function (extensionId) {
            return this._registry.getExtensionDescription(extensionId);
        };
        ExtHostExtensionService.prototype.getExtensionExports = function (extensionId) {
            if (this._barrier.isOpen()) {
                return this._activator.getActivatedExtension(extensionId).exports;
            }
            else {
                return null;
            }
        };
        // create trie to enable fast 'filename -> extension id' look up
        ExtHostExtensionService.prototype.getExtensionPathIndex = function () {
            if (!this._extensionPathIndex) {
                var tree_1 = map_1.TernarySearchTree.forPaths();
                var extensions = this.getAllExtensionDescriptions().map(function (ext) {
                    if (!ext.main) {
                        return undefined;
                    }
                    return pfs_1.realpath(ext.extensionFolderPath).then(function (value) { return tree_1.set(value, ext); });
                });
                this._extensionPathIndex = winjs_base_1.TPromise.join(extensions).then(function () { return tree_1; });
            }
            return this._extensionPathIndex;
        };
        ExtHostExtensionService.prototype.deactivate = function (extensionId) {
            var result = winjs_base_1.TPromise.as(void 0);
            if (!this._barrier.isOpen()) {
                return result;
            }
            if (!this._activator.isActivated(extensionId)) {
                return result;
            }
            var extension = this._activator.getActivatedExtension(extensionId);
            if (!extension) {
                return result;
            }
            // call deactivate if available
            try {
                if (typeof extension.module.deactivate === 'function') {
                    result = winjs_base_1.TPromise.wrap(extension.module.deactivate()).then(null, function (err) {
                        // TODO: Do something with err if this is not the shutdown case
                        return winjs_base_1.TPromise.as(void 0);
                    });
                }
            }
            catch (err) {
                // TODO: Do something with err if this is not the shutdown case
            }
            // clean up subscriptions
            try {
                lifecycle_1.dispose(extension.subscriptions);
            }
            catch (err) {
                // TODO: Do something with err if this is not the shutdown case
            }
            return result;
        };
        ExtHostExtensionService.prototype.addMessage = function (extensionId, severity, message) {
            this._proxy.$addMessage(extensionId, severity, message);
        };
        // --- impl
        ExtHostExtensionService.prototype._activateExtension = function (extensionDescription, reason) {
            var _this = this;
            return this._doActivateExtension(extensionDescription, reason).then(function (activatedExtension) {
                var activationTimes = activatedExtension.activationTimes;
                var activationEvent = (reason instanceof extHostExtensionActivator_1.ExtensionActivatedByEvent ? reason.activationEvent : null);
                _this._proxy.$onExtensionActivated(extensionDescription.id, activationTimes.startup, activationTimes.codeLoadingTime, activationTimes.activateCallTime, activationTimes.activateResolvedTime, activationEvent);
                return activatedExtension;
            }, function (err) {
                _this._proxy.$onExtensionActivationFailed(extensionDescription.id);
                throw err;
            });
        };
        ExtHostExtensionService.prototype._doActivateExtension = function (extensionDescription, reason) {
            var _this = this;
            var event = getTelemetryActivationEvent(extensionDescription);
            /* __GDPR__
                "activatePlugin" : {
                    "${include}": [
                        "${TelemetryActivationEvent}"
                    ]
                }
            */
            this._mainThreadTelemetry.$publicLog('activatePlugin', event);
            if (!extensionDescription.main) {
                // Treat the extension as being empty => NOT AN ERROR CASE
                return winjs_base_1.TPromise.as(new extHostExtensionActivator_1.EmptyExtension(extHostExtensionActivator_1.ExtensionActivationTimes.NONE));
            }
            this._extHostLogService.info("ExtensionService#_doActivateExtension " + extensionDescription.id + " " + JSON.stringify(reason));
            var activationTimesBuilder = new extHostExtensionActivator_1.ExtensionActivationTimesBuilder(reason.startup);
            return winjs_base_1.TPromise.join([
                loadCommonJSModule(this._extHostLogService, extensionDescription.main, activationTimesBuilder),
                this._loadExtensionContext(extensionDescription)
            ]).then(function (values) {
                return ExtHostExtensionService._callActivate(_this._extHostLogService, extensionDescription.id, values[0], values[1], activationTimesBuilder);
            }, function (errors) {
                // Avoid failing with an array of errors, fail with a single error
                if (errors[0]) {
                    return winjs_base_1.TPromise.wrapError(errors[0]);
                }
                if (errors[1]) {
                    return winjs_base_1.TPromise.wrapError(errors[1]);
                }
                return undefined;
            });
        };
        ExtHostExtensionService.prototype._loadExtensionContext = function (extensionDescription) {
            var _this = this;
            var globalState = new ExtensionMemento(extensionDescription.id, true, this._storage);
            var workspaceState = new ExtensionMemento(extensionDescription.id, false, this._storage);
            this._extHostLogService.trace("ExtensionService#loadExtensionContext " + extensionDescription.id);
            return winjs_base_1.TPromise.join([
                globalState.whenReady,
                workspaceState.whenReady,
                this._storagePath.whenReady
            ]).then(function () {
                var that = _this;
                return Object.freeze({
                    globalState: globalState,
                    workspaceState: workspaceState,
                    subscriptions: [],
                    get extensionPath() { return extensionDescription.extensionFolderPath; },
                    storagePath: _this._storagePath.value(extensionDescription),
                    asAbsolutePath: function (relativePath) { return path_1.join(extensionDescription.extensionFolderPath, relativePath); },
                    get logger() {
                        extHost_api_impl_1.checkProposedApiEnabled(extensionDescription);
                        return that._extHostLogService.getExtLogger(extensionDescription.id);
                    }
                });
            });
        };
        ExtHostExtensionService._callActivate = function (logService, extensionId, extensionModule, context, activationTimesBuilder) {
            // Make sure the extension's surface is not undefined
            extensionModule = extensionModule || {
                activate: undefined,
                deactivate: undefined
            };
            return this._callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder).then(function (extensionExports) {
                return new extHostExtensionActivator_1.ActivatedExtension(false, activationTimesBuilder.build(), extensionModule, extensionExports, context.subscriptions);
            });
        };
        ExtHostExtensionService._callActivateOptional = function (logService, extensionId, extensionModule, context, activationTimesBuilder) {
            if (typeof extensionModule.activate === 'function') {
                try {
                    activationTimesBuilder.activateCallStart();
                    logService.trace("ExtensionService#_callActivateOptional " + extensionId);
                    var activateResult = extensionModule.activate.apply(global, [context]);
                    activationTimesBuilder.activateCallStop();
                    activationTimesBuilder.activateResolveStart();
                    return winjs_base_1.TPromise.as(activateResult).then(function (value) {
                        activationTimesBuilder.activateResolveStop();
                        return value;
                    });
                }
                catch (err) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
            }
            else {
                // No activate found => the module is the extension's exports
                return winjs_base_1.TPromise.as(extensionModule);
            }
        };
        // -- called by main thread
        ExtHostExtensionService.prototype.$activateByEvent = function (activationEvent) {
            return this.activateByEvent(activationEvent, false);
        };
        return ExtHostExtensionService;
    }());
    exports.ExtHostExtensionService = ExtHostExtensionService;
    function loadCommonJSModule(logService, modulePath, activationTimesBuilder) {
        var r = null;
        activationTimesBuilder.codeLoadingStart();
        logService.info("ExtensionService#loadCommonJSModule " + modulePath);
        try {
            r = require.__$__nodeRequire(modulePath);
        }
        catch (e) {
            return winjs_base_1.TPromise.wrapError(e);
        }
        finally {
            activationTimesBuilder.codeLoadingStop();
        }
        return winjs_base_1.TPromise.as(r);
    }
    function getTelemetryActivationEvent(extensionDescription) {
        /* __GDPR__FRAGMENT__
            "TelemetryActivationEvent" : {
                "id": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "name": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "publisherDisplayName": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" },
                "activationEvents": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "isBuiltin": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
        */
        var event = {
            id: extensionDescription.id,
            name: extensionDescription.name,
            publisherDisplayName: extensionDescription.publisher,
            activationEvents: extensionDescription.activationEvents ? extensionDescription.activationEvents.join(',') : null,
            isBuiltin: extensionDescription.isBuiltin
        };
        return event;
    }
});
