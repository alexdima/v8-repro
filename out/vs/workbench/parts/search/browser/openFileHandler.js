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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/nls", "vs/base/common/paths", "vs/base/common/labels", "vs/base/common/objects", "vs/base/common/idGenerator", "vs/base/common/resources", "vs/editor/common/services/modeService", "vs/workbench/browser/labels", "vs/editor/common/services/modelService", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/workbench/parts/search/common/queryBuilder", "vs/workbench/services/group/common/groupService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/search/common/search", "vs/platform/workspace/common/workspace", "vs/platform/environment/common/environment", "vs/workbench/parts/search/common/search"], function (require, exports, winjs_base_1, errors, nls, paths, labels, objects, idGenerator_1, resources, modeService_1, labels_1, modelService_1, workbenchThemeService_1, quickOpenModel_1, quickopen_1, queryBuilder_1, groupService_1, editorService_1, configuration_1, instantiation_1, search_1, workspace_1, environment_1, search_2) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileQuickOpenModel = /** @class */ (function (_super) {
        __extends(FileQuickOpenModel, _super);
        function FileQuickOpenModel(entries, stats) {
            var _this = _super.call(this, entries) || this;
            _this.stats = stats;
            return _this;
        }
        return FileQuickOpenModel;
    }(quickOpenModel_1.QuickOpenModel));
    exports.FileQuickOpenModel = FileQuickOpenModel;
    var FileEntry = /** @class */ (function (_super) {
        __extends(FileEntry, _super);
        function FileEntry(resource, name, description, icon, editorService, modeService, modelService, configurationService, contextService) {
            var _this = _super.call(this, editorService) || this;
            _this.resource = resource;
            _this.name = name;
            _this.description = description;
            _this.icon = icon;
            _this.modeService = modeService;
            _this.modelService = modelService;
            _this.configurationService = configurationService;
            return _this;
        }
        FileEntry.prototype.getLabel = function () {
            return this.name;
        };
        FileEntry.prototype.getLabelOptions = function () {
            return {
                extraClasses: labels_1.getIconClasses(this.modelService, this.modeService, this.resource)
            };
        };
        FileEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, file picker", this.getLabel());
        };
        FileEntry.prototype.getDescription = function () {
            return this.description;
        };
        FileEntry.prototype.getIcon = function () {
            return this.icon;
        };
        FileEntry.prototype.getResource = function () {
            return this.resource;
        };
        FileEntry.prototype.setRange = function (range) {
            this.range = range;
        };
        FileEntry.prototype.mergeWithEditorHistory = function () {
            return true;
        };
        FileEntry.prototype.getInput = function () {
            var input = {
                resource: this.resource,
                options: {
                    pinned: !this.configurationService.getValue().workbench.editor.enablePreviewFromQuickOpen
                }
            };
            if (this.range) {
                input.options.selection = this.range;
            }
            return input;
        };
        FileEntry = __decorate([
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, modeService_1.IModeService),
            __param(6, modelService_1.IModelService),
            __param(7, configuration_1.IConfigurationService),
            __param(8, workspace_1.IWorkspaceContextService)
        ], FileEntry);
        return FileEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    exports.FileEntry = FileEntry;
    var OpenFileHandler = /** @class */ (function (_super) {
        __extends(OpenFileHandler, _super);
        function OpenFileHandler(editorGroupService, instantiationService, themeService, contextService, searchService, environmentService) {
            var _this = _super.call(this) || this;
            _this.editorGroupService = editorGroupService;
            _this.instantiationService = instantiationService;
            _this.themeService = themeService;
            _this.contextService = contextService;
            _this.searchService = searchService;
            _this.environmentService = environmentService;
            _this.queryBuilder = _this.instantiationService.createInstance(queryBuilder_1.QueryBuilder);
            return _this;
        }
        OpenFileHandler.prototype.setOptions = function (options) {
            this.options = options;
        };
        OpenFileHandler.prototype.getResults = function (searchValue, maxSortedResults) {
            searchValue = searchValue.trim();
            // Respond directly to empty search
            if (!searchValue) {
                return winjs_base_1.TPromise.as(new FileQuickOpenModel([]));
            }
            // Untildify file pattern
            searchValue = labels.untildify(searchValue, this.environmentService.userHome);
            // Do find results
            return this.doFindResults(searchValue, this.cacheState.cacheKey, maxSortedResults);
        };
        OpenFileHandler.prototype.doFindResults = function (searchValue, cacheKey, maxSortedResults) {
            var _this = this;
            var query = {
                extraFileResources: search_2.getOutOfWorkspaceEditorResources(this.editorGroupService, this.contextService),
                filePattern: searchValue,
                cacheKey: cacheKey
            };
            if (typeof maxSortedResults === 'number') {
                query.maxResults = maxSortedResults;
                query.sortByScore = true;
            }
            var iconClass;
            if (this.options && this.options.forceUseIcons && !this.themeService.getFileIconTheme()) {
                iconClass = 'file'; // only use a generic file icon if we are forced to use an icon and have no icon theme set otherwise
            }
            var folderResources = this.contextService.getWorkspace().folders.map(function (folder) { return folder.uri; });
            return this.searchService.search(this.queryBuilder.file(folderResources, query)).then(function (complete) {
                var results = [];
                for (var i = 0; i < complete.results.length; i++) {
                    var fileMatch = complete.results[i];
                    var label = paths.basename(fileMatch.resource.fsPath);
                    var description = labels.getPathLabel(resources.dirname(fileMatch.resource), _this.contextService, _this.environmentService);
                    results.push(_this.instantiationService.createInstance(FileEntry, fileMatch.resource, label, description, iconClass));
                }
                return new FileQuickOpenModel(results, complete.stats);
            });
        };
        OpenFileHandler.prototype.hasShortResponseTime = function () {
            return this.isCacheLoaded;
        };
        OpenFileHandler.prototype.onOpen = function () {
            var _this = this;
            this.cacheState = new CacheState(function (cacheKey) { return _this.cacheQuery(cacheKey); }, function (query) { return _this.searchService.search(query); }, function (cacheKey) { return _this.searchService.clearCache(cacheKey); }, this.cacheState);
            this.cacheState.load();
        };
        OpenFileHandler.prototype.cacheQuery = function (cacheKey) {
            var options = {
                extraFileResources: search_2.getOutOfWorkspaceEditorResources(this.editorGroupService, this.contextService),
                filePattern: '',
                cacheKey: cacheKey,
                maxResults: 0,
                sortByScore: true,
            };
            var folderResources = this.contextService.getWorkspace().folders.map(function (folder) { return folder.uri; });
            var query = this.queryBuilder.file(folderResources, options);
            return query;
        };
        Object.defineProperty(OpenFileHandler.prototype, "isCacheLoaded", {
            get: function () {
                return this.cacheState && this.cacheState.isLoaded;
            },
            enumerable: true,
            configurable: true
        });
        OpenFileHandler.prototype.getGroupLabel = function () {
            return nls.localize('searchResults', "search results");
        };
        OpenFileHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true
            };
        };
        OpenFileHandler = __decorate([
            __param(0, groupService_1.IEditorGroupService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, workbenchThemeService_1.IWorkbenchThemeService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, search_1.ISearchService),
            __param(5, environment_1.IEnvironmentService)
        ], OpenFileHandler);
        return OpenFileHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenFileHandler = OpenFileHandler;
    var LoadingPhase;
    (function (LoadingPhase) {
        LoadingPhase[LoadingPhase["Created"] = 1] = "Created";
        LoadingPhase[LoadingPhase["Loading"] = 2] = "Loading";
        LoadingPhase[LoadingPhase["Loaded"] = 3] = "Loaded";
        LoadingPhase[LoadingPhase["Errored"] = 4] = "Errored";
        LoadingPhase[LoadingPhase["Disposed"] = 5] = "Disposed";
    })(LoadingPhase || (LoadingPhase = {}));
    /**
     * Exported for testing.
     */
    var CacheState = /** @class */ (function () {
        function CacheState(cacheQuery, doLoad, doDispose, previous) {
            this.doLoad = doLoad;
            this.doDispose = doDispose;
            this.previous = previous;
            this._cacheKey = idGenerator_1.defaultGenerator.nextId();
            this.loadingPhase = LoadingPhase.Created;
            this.query = cacheQuery(this._cacheKey);
            if (this.previous) {
                var current = objects.assign({}, this.query, { cacheKey: null });
                var previous_1 = objects.assign({}, this.previous.query, { cacheKey: null });
                if (!objects.equals(current, previous_1)) {
                    this.previous.dispose();
                    this.previous = null;
                }
            }
        }
        Object.defineProperty(CacheState.prototype, "cacheKey", {
            get: function () {
                return this.loadingPhase === LoadingPhase.Loaded || !this.previous ? this._cacheKey : this.previous.cacheKey;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CacheState.prototype, "isLoaded", {
            get: function () {
                var isLoaded = this.loadingPhase === LoadingPhase.Loaded;
                return isLoaded || !this.previous ? isLoaded : this.previous.isLoaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CacheState.prototype, "isUpdating", {
            get: function () {
                var isUpdating = this.loadingPhase === LoadingPhase.Loading;
                return isUpdating || !this.previous ? isUpdating : this.previous.isUpdating;
            },
            enumerable: true,
            configurable: true
        });
        CacheState.prototype.load = function () {
            var _this = this;
            if (this.isUpdating) {
                return;
            }
            this.loadingPhase = LoadingPhase.Loading;
            this.promise = this.doLoad(this.query)
                .then(function () {
                _this.loadingPhase = LoadingPhase.Loaded;
                if (_this.previous) {
                    _this.previous.dispose();
                    _this.previous = null;
                }
            }, function (err) {
                _this.loadingPhase = LoadingPhase.Errored;
                errors.onUnexpectedError(err);
            });
        };
        CacheState.prototype.dispose = function () {
            var _this = this;
            if (this.promise) {
                this.promise.then(null, function () { })
                    .then(function () {
                    _this.loadingPhase = LoadingPhase.Disposed;
                    return _this.doDispose(_this._cacheKey);
                }).then(null, function (err) {
                    errors.onUnexpectedError(err);
                });
            }
            else {
                this.loadingPhase = LoadingPhase.Disposed;
            }
            if (this.previous) {
                this.previous.dispose();
                this.previous = null;
            }
        };
        return CacheState;
    }());
    exports.CacheState = CacheState;
});
