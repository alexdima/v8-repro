var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/arrays", "vs/workbench/common/editor/untitledEditorInput", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/map", "vs/base/common/network"], function (require, exports, uri_1, instantiation_1, arrays, untitledEditorInput_1, configuration_1, event_1, map_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IUntitledEditorService = instantiation_1.createDecorator('untitledEditorService');
    var UntitledEditorService = /** @class */ (function () {
        function UntitledEditorService(instantiationService, configurationService) {
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.mapResourceToInput = new map_1.ResourceMap();
            this.mapResourceToAssociatedFilePath = new map_1.ResourceMap();
            this._onDidChangeContent = new event_1.Emitter();
            this._onDidChangeDirty = new event_1.Emitter();
            this._onDidChangeEncoding = new event_1.Emitter();
            this._onDidDisposeModel = new event_1.Emitter();
        }
        Object.defineProperty(UntitledEditorService.prototype, "onDidDisposeModel", {
            get: function () {
                return this._onDidDisposeModel.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UntitledEditorService.prototype, "onDidChangeContent", {
            get: function () {
                return this._onDidChangeContent.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UntitledEditorService.prototype, "onDidChangeDirty", {
            get: function () {
                return this._onDidChangeDirty.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UntitledEditorService.prototype, "onDidChangeEncoding", {
            get: function () {
                return this._onDidChangeEncoding.event;
            },
            enumerable: true,
            configurable: true
        });
        UntitledEditorService.prototype.get = function (resource) {
            return this.mapResourceToInput.get(resource);
        };
        UntitledEditorService.prototype.getAll = function (resources) {
            var _this = this;
            if (resources) {
                return arrays.coalesce(resources.map(function (r) { return _this.get(r); }));
            }
            return this.mapResourceToInput.values();
        };
        UntitledEditorService.prototype.exists = function (resource) {
            return this.mapResourceToInput.has(resource);
        };
        UntitledEditorService.prototype.revertAll = function (resources, force) {
            var reverted = [];
            var untitledInputs = this.getAll(resources);
            untitledInputs.forEach(function (input) {
                if (input) {
                    input.revert();
                    input.dispose();
                    reverted.push(input.getResource());
                }
            });
            return reverted;
        };
        UntitledEditorService.prototype.isDirty = function (resource) {
            var input = this.get(resource);
            return input && input.isDirty();
        };
        UntitledEditorService.prototype.getDirty = function (resources) {
            var _this = this;
            var inputs;
            if (resources) {
                inputs = resources.map(function (r) { return _this.get(r); }).filter(function (i) { return !!i; });
            }
            else {
                inputs = this.mapResourceToInput.values();
            }
            return inputs
                .filter(function (i) { return i.isDirty(); })
                .map(function (i) { return i.getResource(); });
        };
        UntitledEditorService.prototype.loadOrCreate = function (options) {
            if (options === void 0) { options = Object.create(null); }
            return this.createOrGet(options.resource, options.modeId, options.initialValue, options.encoding).resolve();
        };
        UntitledEditorService.prototype.createOrGet = function (resource, modeId, initialValue, encoding) {
            // Massage resource if it comes with a file:// scheme
            var hasAssociatedFilePath = false;
            if (resource) {
                hasAssociatedFilePath = (resource.scheme === network_1.Schemas.file);
                resource = resource.with({ scheme: network_1.Schemas.untitled }); // ensure we have the right scheme
                if (hasAssociatedFilePath) {
                    this.mapResourceToAssociatedFilePath.set(resource, true); // remember for future lookups
                }
            }
            // Return existing instance if asked for it
            if (resource && this.mapResourceToInput.has(resource)) {
                return this.mapResourceToInput.get(resource);
            }
            // Create new otherwise
            return this.doCreate(resource, hasAssociatedFilePath, modeId, initialValue, encoding);
        };
        UntitledEditorService.prototype.doCreate = function (resource, hasAssociatedFilePath, modeId, initialValue, encoding) {
            var _this = this;
            if (!resource) {
                // Create new taking a resource URI that is not already taken
                var counter = this.mapResourceToInput.size + 1;
                do {
                    resource = uri_1.default.from({ scheme: network_1.Schemas.untitled, path: "Untitled-" + counter });
                    counter++;
                } while (this.mapResourceToInput.has(resource));
            }
            // Look up default language from settings if any
            if (!modeId && !hasAssociatedFilePath) {
                var configuration = this.configurationService.getValue();
                if (configuration.files && configuration.files.defaultLanguage) {
                    modeId = configuration.files.defaultLanguage;
                }
            }
            var input = this.instantiationService.createInstance(untitledEditorInput_1.UntitledEditorInput, resource, hasAssociatedFilePath, modeId, initialValue, encoding);
            var contentListener = input.onDidModelChangeContent(function () {
                _this._onDidChangeContent.fire(resource);
            });
            var dirtyListener = input.onDidChangeDirty(function () {
                _this._onDidChangeDirty.fire(resource);
            });
            var encodingListener = input.onDidModelChangeEncoding(function () {
                _this._onDidChangeEncoding.fire(resource);
            });
            var disposeListener = input.onDispose(function () {
                _this._onDidDisposeModel.fire(resource);
            });
            // Remove from cache on dispose
            var onceDispose = event_1.once(input.onDispose);
            onceDispose(function () {
                _this.mapResourceToInput.delete(input.getResource());
                _this.mapResourceToAssociatedFilePath.delete(input.getResource());
                contentListener.dispose();
                dirtyListener.dispose();
                encodingListener.dispose();
                disposeListener.dispose();
            });
            // Add to cache
            this.mapResourceToInput.set(resource, input);
            return input;
        };
        UntitledEditorService.prototype.hasAssociatedFilePath = function (resource) {
            return this.mapResourceToAssociatedFilePath.has(resource);
        };
        UntitledEditorService.prototype.suggestFileName = function (resource) {
            var input = this.get(resource);
            return input ? input.suggestFileName() : void 0;
        };
        UntitledEditorService.prototype.getEncoding = function (resource) {
            var input = this.get(resource);
            return input ? input.getEncoding() : void 0;
        };
        UntitledEditorService.prototype.dispose = function () {
            this._onDidChangeContent.dispose();
            this._onDidChangeDirty.dispose();
            this._onDidChangeEncoding.dispose();
            this._onDidDisposeModel.dispose();
        };
        UntitledEditorService = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, configuration_1.IConfigurationService)
        ], UntitledEditorService);
        return UntitledEditorService;
    }());
    exports.UntitledEditorService = UntitledEditorService;
});
