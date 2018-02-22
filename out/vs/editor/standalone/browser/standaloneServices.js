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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextMenuService", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextViewService", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/platform/markers/common/markerService", "vs/platform/markers/common/markers", "vs/platform/message/common/message", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/editorWorkerService", "vs/editor/common/services/editorWorkerServiceImpl", "vs/editor/common/services/resourceConfiguration", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/editor/common/services/modelService", "vs/editor/common/services/modelServiceImpl", "vs/editor/browser/services/codeEditorServiceImpl", "vs/editor/standalone/browser/simpleServices", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/actions/common/actions", "vs/editor/standalone/common/standaloneThemeService", "vs/editor/standalone/browser/standaloneThemeServiceImpl", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, configuration_1, contextMenuService_1, contextView_1, contextViewService_1, instantiation_1, instantiationService_1, serviceCollection_1, commands_1, keybinding_1, contextkey_1, markerService_1, markers_1, message_1, progress_1, storage_1, telemetry_1, workspace_1, codeEditorService_1, editorWorkerService_1, editorWorkerServiceImpl_1, resourceConfiguration_1, modeService_1, modeServiceImpl_1, modelService_1, modelServiceImpl_1, codeEditorServiceImpl_1, simpleServices_1, contextKeyService_1, actions_1, standaloneThemeService_1, standaloneThemeServiceImpl_1, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var StaticServices;
    (function (StaticServices) {
        var _serviceCollection = new serviceCollection_1.ServiceCollection();
        var LazyStaticService = /** @class */ (function () {
            function LazyStaticService(serviceId, factory) {
                this._serviceId = serviceId;
                this._factory = factory;
                this._value = null;
            }
            Object.defineProperty(LazyStaticService.prototype, "id", {
                get: function () { return this._serviceId; },
                enumerable: true,
                configurable: true
            });
            LazyStaticService.prototype.get = function (overrides) {
                if (!this._value) {
                    if (overrides) {
                        this._value = overrides[this._serviceId.toString()];
                    }
                    if (!this._value) {
                        this._value = this._factory(overrides);
                    }
                    if (!this._value) {
                        throw new Error('Service ' + this._serviceId + ' is missing!');
                    }
                    _serviceCollection.set(this._serviceId, this._value);
                }
                return this._value;
            };
            return LazyStaticService;
        }());
        StaticServices.LazyStaticService = LazyStaticService;
        var _all = [];
        function define(serviceId, factory) {
            var r = new LazyStaticService(serviceId, factory);
            _all.push(r);
            return r;
        }
        function init(overrides) {
            // Create a fresh service collection
            var result = new serviceCollection_1.ServiceCollection();
            // Initialize the service collection with the overrides
            for (var serviceId in overrides) {
                if (overrides.hasOwnProperty(serviceId)) {
                    result.set(instantiation_1.createDecorator(serviceId), overrides[serviceId]);
                }
            }
            // Make sure the same static services are present in all service collections
            _all.forEach(function (service) { return result.set(service.id, service.get(overrides)); });
            // Ensure the collection gets the correct instantiation service
            var instantiationService = new instantiationService_1.InstantiationService(result, true);
            result.set(instantiation_1.IInstantiationService, instantiationService);
            return [result, instantiationService];
        }
        StaticServices.init = init;
        StaticServices.instantiationService = define(instantiation_1.IInstantiationService, function () { return new instantiationService_1.InstantiationService(_serviceCollection, true); });
        var configurationServiceImpl = new simpleServices_1.SimpleConfigurationService();
        StaticServices.configurationService = define(configuration_1.IConfigurationService, function () { return configurationServiceImpl; });
        StaticServices.resourceConfigurationService = define(resourceConfiguration_1.ITextResourceConfigurationService, function () { return new simpleServices_1.SimpleResourceConfigurationService(configurationServiceImpl); });
        StaticServices.contextService = define(workspace_1.IWorkspaceContextService, function () { return new simpleServices_1.SimpleWorkspaceContextService(); });
        StaticServices.telemetryService = define(telemetry_1.ITelemetryService, function () { return new simpleServices_1.StandaloneTelemetryService(); });
        StaticServices.messageService = define(message_1.IMessageService, function () { return new simpleServices_1.SimpleMessageService(); });
        StaticServices.markerService = define(markers_1.IMarkerService, function () { return new markerService_1.MarkerService(); });
        StaticServices.modeService = define(modeService_1.IModeService, function (o) { return new modeServiceImpl_1.ModeServiceImpl(); });
        StaticServices.modelService = define(modelService_1.IModelService, function (o) { return new modelServiceImpl_1.ModelServiceImpl(StaticServices.markerService.get(o), StaticServices.configurationService.get(o)); });
        StaticServices.editorWorkerService = define(editorWorkerService_1.IEditorWorkerService, function (o) { return new editorWorkerServiceImpl_1.EditorWorkerServiceImpl(StaticServices.modelService.get(o), StaticServices.resourceConfigurationService.get(o)); });
        StaticServices.standaloneThemeService = define(standaloneThemeService_1.IStandaloneThemeService, function () { return new standaloneThemeServiceImpl_1.StandaloneThemeServiceImpl(); });
        StaticServices.codeEditorService = define(codeEditorService_1.ICodeEditorService, function (o) { return new codeEditorServiceImpl_1.CodeEditorServiceImpl(StaticServices.standaloneThemeService.get(o)); });
        StaticServices.progressService = define(progress_1.IProgressService, function () { return new simpleServices_1.SimpleProgressService(); });
        StaticServices.storageService = define(storage_1.IStorageService, function () { return storage_1.NullStorageService; });
        StaticServices.logService = define(log_1.ILogService, function () { return new log_1.NullLogService(); });
    })(StaticServices = exports.StaticServices || (exports.StaticServices = {}));
    var DynamicStandaloneServices = /** @class */ (function (_super) {
        __extends(DynamicStandaloneServices, _super);
        function DynamicStandaloneServices(domElement, overrides) {
            var _this = _super.call(this) || this;
            var _a = StaticServices.init(overrides), _serviceCollection = _a[0], _instantiationService = _a[1];
            _this._serviceCollection = _serviceCollection;
            _this._instantiationService = _instantiationService;
            var configurationService = _this.get(configuration_1.IConfigurationService);
            var messageService = _this.get(message_1.IMessageService);
            var telemetryService = _this.get(telemetry_1.ITelemetryService);
            var ensure = function (serviceId, factory) {
                var value = null;
                if (overrides) {
                    value = overrides[serviceId.toString()];
                }
                if (!value) {
                    value = factory();
                }
                _this._serviceCollection.set(serviceId, value);
                return value;
            };
            var contextKeyService = ensure(contextkey_1.IContextKeyService, function () { return _this._register(new contextKeyService_1.ContextKeyService(configurationService)); });
            var commandService = ensure(commands_1.ICommandService, function () { return new simpleServices_1.StandaloneCommandService(_this._instantiationService); });
            ensure(keybinding_1.IKeybindingService, function () { return _this._register(new simpleServices_1.StandaloneKeybindingService(contextKeyService, commandService, telemetryService, messageService, domElement)); });
            var contextViewService = ensure(contextView_1.IContextViewService, function () { return _this._register(new contextViewService_1.ContextViewService(domElement, telemetryService, messageService, new log_1.NullLogService())); });
            ensure(contextView_1.IContextMenuService, function () { return _this._register(new contextMenuService_1.ContextMenuService(domElement, telemetryService, messageService, contextViewService)); });
            ensure(actions_1.IMenuService, function () { return new simpleServices_1.SimpleMenuService(commandService); });
            return _this;
        }
        DynamicStandaloneServices.prototype.get = function (serviceId) {
            var r = this._serviceCollection.get(serviceId);
            if (!r) {
                throw new Error('Missing service ' + serviceId);
            }
            return r;
        };
        DynamicStandaloneServices.prototype.set = function (serviceId, instance) {
            this._serviceCollection.set(serviceId, instance);
        };
        DynamicStandaloneServices.prototype.has = function (serviceId) {
            return this._serviceCollection.has(serviceId);
        };
        return DynamicStandaloneServices;
    }(lifecycle_1.Disposable));
    exports.DynamicStandaloneServices = DynamicStandaloneServices;
});
