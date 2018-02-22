var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/winjs.base", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/lifecycle", "vs/workbench/services/textfile/common/textfiles", "vs/platform/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/map"], function (require, exports, event_1, winjs_base_1, textFileEditorModel_1, lifecycle_1, textfiles_1, lifecycle_2, instantiation_1, map_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextFileEditorModelManager = /** @class */ (function () {
        function TextFileEditorModelManager(lifecycleService, instantiationService) {
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.toUnbind = [];
            this._onModelDisposed = new event_1.Emitter();
            this._onModelContentChanged = new event_1.Emitter();
            this._onModelDirty = new event_1.Emitter();
            this._onModelSaveError = new event_1.Emitter();
            this._onModelSaved = new event_1.Emitter();
            this._onModelReverted = new event_1.Emitter();
            this._onModelEncodingChanged = new event_1.Emitter();
            this._onModelOrphanedChanged = new event_1.Emitter();
            this.toUnbind.push(this._onModelDisposed);
            this.toUnbind.push(this._onModelContentChanged);
            this.toUnbind.push(this._onModelDirty);
            this.toUnbind.push(this._onModelSaveError);
            this.toUnbind.push(this._onModelSaved);
            this.toUnbind.push(this._onModelReverted);
            this.toUnbind.push(this._onModelEncodingChanged);
            this.toUnbind.push(this._onModelOrphanedChanged);
            this.mapResourceToModel = new map_1.ResourceMap();
            this.mapResourceToDisposeListener = new map_1.ResourceMap();
            this.mapResourceToStateChangeListener = new map_1.ResourceMap();
            this.mapResourceToModelContentChangeListener = new map_1.ResourceMap();
            this.mapResourceToPendingModelLoaders = new map_1.ResourceMap();
            this.registerListeners();
        }
        TextFileEditorModelManager.prototype.registerListeners = function () {
            // Lifecycle
            this.lifecycleService.onShutdown(this.dispose, this);
        };
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelDisposed", {
            get: function () {
                return this._onModelDisposed.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelContentChanged", {
            get: function () {
                return this._onModelContentChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelDirty", {
            get: function () {
                return this._onModelDirty.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelSaveError", {
            get: function () {
                return this._onModelSaveError.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelSaved", {
            get: function () {
                return this._onModelSaved.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelReverted", {
            get: function () {
                return this._onModelReverted.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelEncodingChanged", {
            get: function () {
                return this._onModelEncodingChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelOrphanedChanged", {
            get: function () {
                return this._onModelOrphanedChanged.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelsDirty", {
            get: function () {
                if (!this._onModelsDirtyEvent) {
                    this._onModelsDirtyEvent = this.debounce(this.onModelDirty);
                }
                return this._onModelsDirtyEvent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelsSaveError", {
            get: function () {
                if (!this._onModelsSaveError) {
                    this._onModelsSaveError = this.debounce(this.onModelSaveError);
                }
                return this._onModelsSaveError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelsSaved", {
            get: function () {
                if (!this._onModelsSaved) {
                    this._onModelsSaved = this.debounce(this.onModelSaved);
                }
                return this._onModelsSaved;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextFileEditorModelManager.prototype, "onModelsReverted", {
            get: function () {
                if (!this._onModelsReverted) {
                    this._onModelsReverted = this.debounce(this.onModelReverted);
                }
                return this._onModelsReverted;
            },
            enumerable: true,
            configurable: true
        });
        TextFileEditorModelManager.prototype.debounce = function (event) {
            return event_1.debounceEvent(event, function (prev, cur) {
                if (!prev) {
                    prev = [cur];
                }
                else {
                    prev.push(cur);
                }
                return prev;
            }, this.debounceDelay());
        };
        TextFileEditorModelManager.prototype.debounceDelay = function () {
            return 250;
        };
        TextFileEditorModelManager.prototype.get = function (resource) {
            return this.mapResourceToModel.get(resource);
        };
        TextFileEditorModelManager.prototype.loadOrCreate = function (resource, options) {
            var _this = this;
            // Return early if model is currently being loaded
            var pendingLoad = this.mapResourceToPendingModelLoaders.get(resource);
            if (pendingLoad) {
                return pendingLoad;
            }
            var modelPromise;
            // Model exists
            var model = this.get(resource);
            if (model) {
                if (!options || !options.reload) {
                    modelPromise = winjs_base_1.TPromise.as(model);
                }
                else {
                    modelPromise = model.load();
                }
            }
            else {
                model = this.instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, resource, options ? options.encoding : void 0);
                modelPromise = model.load();
                // Install state change listener
                this.mapResourceToStateChangeListener.set(resource, model.onDidStateChange(function (state) {
                    var event = new textfiles_1.TextFileModelChangeEvent(model, state);
                    switch (state) {
                        case textfiles_1.StateChange.DIRTY:
                            _this._onModelDirty.fire(event);
                            break;
                        case textfiles_1.StateChange.SAVE_ERROR:
                            _this._onModelSaveError.fire(event);
                            break;
                        case textfiles_1.StateChange.SAVED:
                            _this._onModelSaved.fire(event);
                            break;
                        case textfiles_1.StateChange.REVERTED:
                            _this._onModelReverted.fire(event);
                            break;
                        case textfiles_1.StateChange.ENCODING:
                            _this._onModelEncodingChanged.fire(event);
                            break;
                        case textfiles_1.StateChange.ORPHANED_CHANGE:
                            _this._onModelOrphanedChanged.fire(event);
                            break;
                    }
                }));
                // Install model content change listener
                this.mapResourceToModelContentChangeListener.set(resource, model.onDidContentChange(function (e) {
                    _this._onModelContentChanged.fire(new textfiles_1.TextFileModelChangeEvent(model, e));
                }));
            }
            // Store pending loads to avoid race conditions
            this.mapResourceToPendingModelLoaders.set(resource, modelPromise);
            return modelPromise.then(function (model) {
                // Make known to manager (if not already known)
                _this.add(resource, model);
                // Model can be dirty if a backup was restored, so we make sure to have this event delivered
                if (model.isDirty()) {
                    _this._onModelDirty.fire(new textfiles_1.TextFileModelChangeEvent(model, textfiles_1.StateChange.DIRTY));
                }
                // Remove from pending loads
                _this.mapResourceToPendingModelLoaders.delete(resource);
                return model;
            }, function (error) {
                // Free resources of this invalid model
                model.dispose();
                // Remove from pending loads
                _this.mapResourceToPendingModelLoaders.delete(resource);
                return winjs_base_1.TPromise.wrapError(error);
            });
        };
        TextFileEditorModelManager.prototype.getAll = function (resource, filter) {
            if (resource) {
                var res_1 = this.mapResourceToModel.get(resource);
                return res_1 ? [res_1] : [];
            }
            var res = [];
            this.mapResourceToModel.forEach(function (model) {
                if (!filter || filter(model)) {
                    res.push(model);
                }
            });
            return res;
        };
        TextFileEditorModelManager.prototype.add = function (resource, model) {
            var _this = this;
            var knownModel = this.mapResourceToModel.get(resource);
            if (knownModel === model) {
                return; // already cached
            }
            // dispose any previously stored dispose listener for this resource
            var disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                disposeListener.dispose();
            }
            // store in cache but remove when model gets disposed
            this.mapResourceToModel.set(resource, model);
            this.mapResourceToDisposeListener.set(resource, model.onDispose(function () {
                _this.remove(resource);
                _this._onModelDisposed.fire(resource);
            }));
        };
        TextFileEditorModelManager.prototype.remove = function (resource) {
            this.mapResourceToModel.delete(resource);
            var disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                lifecycle_1.dispose(disposeListener);
                this.mapResourceToDisposeListener.delete(resource);
            }
            var stateChangeListener = this.mapResourceToStateChangeListener.get(resource);
            if (stateChangeListener) {
                lifecycle_1.dispose(stateChangeListener);
                this.mapResourceToStateChangeListener.delete(resource);
            }
            var modelContentChangeListener = this.mapResourceToModelContentChangeListener.get(resource);
            if (modelContentChangeListener) {
                lifecycle_1.dispose(modelContentChangeListener);
                this.mapResourceToModelContentChangeListener.delete(resource);
            }
        };
        TextFileEditorModelManager.prototype.clear = function () {
            // model caches
            this.mapResourceToModel.clear();
            this.mapResourceToPendingModelLoaders.clear();
            // dispose dispose listeners
            this.mapResourceToDisposeListener.forEach(function (l) { return l.dispose(); });
            this.mapResourceToDisposeListener.clear();
            // dispose state change listeners
            this.mapResourceToStateChangeListener.forEach(function (l) { return l.dispose(); });
            this.mapResourceToStateChangeListener.clear();
            // dispose model content change listeners
            this.mapResourceToModelContentChangeListener.forEach(function (l) { return l.dispose(); });
            this.mapResourceToModelContentChangeListener.clear();
        };
        TextFileEditorModelManager.prototype.disposeModel = function (model) {
            if (!model) {
                return; // we need data!
            }
            if (model.isDisposed()) {
                return; // already disposed
            }
            if (this.mapResourceToPendingModelLoaders.has(model.getResource())) {
                return; // not yet loaded
            }
            if (model.isDirty()) {
                return; // not saved
            }
            model.dispose();
        };
        TextFileEditorModelManager.prototype.dispose = function () {
            this.toUnbind = lifecycle_1.dispose(this.toUnbind);
        };
        TextFileEditorModelManager = __decorate([
            __param(0, lifecycle_2.ILifecycleService),
            __param(1, instantiation_1.IInstantiationService)
        ], TextFileEditorModelManager);
        return TextFileEditorModelManager;
    }());
    exports.TextFileEditorModelManager = TextFileEditorModelManager;
});
