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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/async", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/modelService", "vs/workbench/common/editor/resourceEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledEditorService", "vs/workbench/services/textfile/common/textFileEditorModel"], function (require, exports, winjs_base_1, uri_1, async_1, instantiation_1, lifecycle_1, modelService_1, resourceEditorModel_1, textfiles_1, network, untitledEditorService_1, textFileEditorModel_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResourceModelCollection = /** @class */ (function (_super) {
        __extends(ResourceModelCollection, _super);
        function ResourceModelCollection(instantiationService, textFileService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.textFileService = textFileService;
            _this.providers = Object.create(null);
            return _this;
        }
        ResourceModelCollection.prototype.createReferencedObject = function (key) {
            var _this = this;
            var resource = uri_1.default.parse(key);
            if (resource.scheme === network.Schemas.file) {
                return this.textFileService.models.loadOrCreate(resource);
            }
            if (!this.providers[resource.scheme]) {
                // TODO@remote
                return this.textFileService.models.loadOrCreate(resource);
            }
            return this.resolveTextModelContent(key).then(function () { return _this.instantiationService.createInstance(resourceEditorModel_1.ResourceEditorModel, resource); });
        };
        ResourceModelCollection.prototype.destroyReferencedObject = function (modelPromise) {
            var _this = this;
            modelPromise.done(function (model) {
                if (model instanceof textFileEditorModel_1.TextFileEditorModel) {
                    _this.textFileService.models.disposeModel(model);
                }
                else {
                    model.dispose();
                }
            }, function (err) {
                // ignore
            });
        };
        ResourceModelCollection.prototype.registerTextModelContentProvider = function (scheme, provider) {
            var registry = this.providers;
            var providers = registry[scheme] || (registry[scheme] = []);
            providers.unshift(provider);
            return lifecycle_1.toDisposable(function () {
                var array = registry[scheme];
                if (!array) {
                    return;
                }
                var index = array.indexOf(provider);
                if (index === -1) {
                    return;
                }
                array.splice(index, 1);
                if (array.length === 0) {
                    delete registry[scheme];
                }
            });
        };
        ResourceModelCollection.prototype.resolveTextModelContent = function (key) {
            var resource = uri_1.default.parse(key);
            var providers = this.providers[resource.scheme] || [];
            var factories = providers.map(function (p) { return function () { return p.provideTextContent(resource); }; });
            return async_1.first(factories).then(function (model) {
                if (!model) {
                    console.error("Unable to open '" + resource + "' resource is not available."); // TODO PII
                    return winjs_base_1.TPromise.wrapError(new Error('resource is not available'));
                }
                return model;
            });
        };
        ResourceModelCollection = __decorate([
            __param(0, instantiation_1.IInstantiationService),
            __param(1, textfiles_1.ITextFileService)
        ], ResourceModelCollection);
        return ResourceModelCollection;
    }(lifecycle_1.ReferenceCollection));
    var TextModelResolverService = /** @class */ (function () {
        function TextModelResolverService(untitledEditorService, instantiationService, modelService) {
            this.untitledEditorService = untitledEditorService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.resourceModelCollection = instantiationService.createInstance(ResourceModelCollection);
        }
        TextModelResolverService.prototype.createModelReference = function (resource) {
            return this._createModelReference(resource);
        };
        TextModelResolverService.prototype._createModelReference = function (resource) {
            // Untitled Schema: go through cached input
            // TODO ImmortalReference is a hack
            if (resource.scheme === network.Schemas.untitled) {
                return this.untitledEditorService.loadOrCreate({ resource: resource }).then(function (model) { return new lifecycle_1.ImmortalReference(model); });
            }
            // InMemory Schema: go through model service cache
            // TODO ImmortalReference is a hack
            if (resource.scheme === 'inmemory') {
                var cachedModel = this.modelService.getModel(resource);
                if (!cachedModel) {
                    return winjs_base_1.TPromise.wrapError(new Error('Cant resolve inmemory resource'));
                }
                return winjs_base_1.TPromise.as(new lifecycle_1.ImmortalReference(this.instantiationService.createInstance(resourceEditorModel_1.ResourceEditorModel, resource)));
            }
            var ref = this.resourceModelCollection.acquire(resource.toString());
            return ref.object.then(function (model) { return ({ object: model, dispose: function () { return ref.dispose(); } }); }, function (err) {
                ref.dispose();
                return winjs_base_1.TPromise.wrapError(err);
            });
        };
        TextModelResolverService.prototype.registerTextModelContentProvider = function (scheme, provider) {
            return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider);
        };
        TextModelResolverService = __decorate([
            __param(0, untitledEditorService_1.IUntitledEditorService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, modelService_1.IModelService)
        ], TextModelResolverService);
        return TextModelResolverService;
    }());
    exports.TextModelResolverService = TextModelResolverService;
});
