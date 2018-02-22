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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/browser/quickopen", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/base/parts/quickopen/common/quickOpen", "vs/base/common/filters", "vs/base/common/strings", "vs/editor/common/core/range", "vs/base/common/labels", "vs/editor/common/modes", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/parts/search/common/search", "vs/platform/environment/common/environment", "vs/base/common/paths"], function (require, exports, nls, winjs_base_1, errors_1, async_1, quickopen_1, quickOpenModel_1, quickOpen_1, filters, strings, range_1, labels, modes_1, editorService_1, instantiation_1, workspace_1, configuration_1, search_1, environment_1, paths_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SymbolEntry = /** @class */ (function (_super) {
        __extends(SymbolEntry, _super);
        function SymbolEntry(_bearing, _provider, _configurationService, _contextService, editorService, _environmentService) {
            var _this = _super.call(this, editorService) || this;
            _this._bearing = _bearing;
            _this._provider = _provider;
            _this._configurationService = _configurationService;
            _this._contextService = _contextService;
            _this._environmentService = _environmentService;
            return _this;
        }
        SymbolEntry.prototype.getLabel = function () {
            return this._bearing.name;
        };
        SymbolEntry.prototype.getAriaLabel = function () {
            return nls.localize('entryAriaLabel', "{0}, symbols picker", this.getLabel());
        };
        SymbolEntry.prototype.getDescription = function () {
            var containerName = this._bearing.containerName;
            if (this._bearing.location.uri) {
                if (containerName) {
                    return containerName + " \u2014 " + paths_1.basename(this._bearing.location.uri.fsPath);
                }
                else {
                    return labels.getPathLabel(this._bearing.location.uri, this._contextService, this._environmentService);
                }
            }
            return containerName;
        };
        SymbolEntry.prototype.getIcon = function () {
            return modes_1.symbolKindToCssClass(this._bearing.kind);
        };
        SymbolEntry.prototype.getResource = function () {
            return this._bearing.location.uri;
        };
        SymbolEntry.prototype.run = function (mode, context) {
            var _this = this;
            // resolve this type bearing if neccessary
            if (!this._bearingResolve
                && typeof this._provider.resolveWorkspaceSymbol === 'function'
                && !this._bearing.location.range) {
                this._bearingResolve = this._provider.resolveWorkspaceSymbol(this._bearing).then(function (result) {
                    _this._bearing = result || _this._bearing;
                    return _this;
                }, errors_1.onUnexpectedError);
            }
            winjs_base_1.TPromise.as(this._bearingResolve)
                .then(function (_) { return _super.prototype.run.call(_this, mode, context); })
                .then(undefined, errors_1.onUnexpectedError);
            // hide if OPEN
            return mode === quickOpen_1.Mode.OPEN;
        };
        SymbolEntry.prototype.getInput = function () {
            var input = {
                resource: this._bearing.location.uri,
                options: {
                    pinned: !this._configurationService.getValue().workbench.editor.enablePreviewFromQuickOpen
                }
            };
            if (this._bearing.location.range) {
                input.options.selection = range_1.Range.collapseToStart(this._bearing.location.range);
            }
            return input;
        };
        SymbolEntry.compare = function (elementA, elementB, searchValue) {
            // Sort by Type if name is identical
            var elementAName = elementA.getLabel().toLowerCase();
            var elementBName = elementB.getLabel().toLowerCase();
            if (elementAName === elementBName) {
                var elementAType = modes_1.symbolKindToCssClass(elementA._bearing.kind);
                var elementBType = modes_1.symbolKindToCssClass(elementB._bearing.kind);
                return elementAType.localeCompare(elementBType);
            }
            return quickOpenModel_1.compareEntries(elementA, elementB, searchValue);
        };
        SymbolEntry = __decorate([
            __param(2, configuration_1.IConfigurationService),
            __param(3, workspace_1.IWorkspaceContextService),
            __param(4, editorService_1.IWorkbenchEditorService),
            __param(5, environment_1.IEnvironmentService)
        ], SymbolEntry);
        return SymbolEntry;
    }(quickopen_1.EditorQuickOpenEntry));
    var OpenSymbolHandler = /** @class */ (function (_super) {
        __extends(OpenSymbolHandler, _super);
        function OpenSymbolHandler(instantiationService) {
            var _this = _super.call(this) || this;
            _this.instantiationService = instantiationService;
            _this.delayer = new async_1.ThrottledDelayer(OpenSymbolHandler.SEARCH_DELAY);
            _this.options = Object.create(null);
            return _this;
        }
        OpenSymbolHandler.prototype.setOptions = function (options) {
            this.options = options;
        };
        OpenSymbolHandler.prototype.canRun = function () {
            return true;
        };
        OpenSymbolHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            searchValue = searchValue.trim();
            var promise;
            if (!this.options.skipDelay) {
                promise = this.delayer.trigger(function () { return _this.doGetResults(searchValue); }); // Run search with delay as needed
            }
            else {
                promise = this.doGetResults(searchValue);
            }
            return promise.then(function (e) { return new quickOpenModel_1.QuickOpenModel(e); });
        };
        OpenSymbolHandler.prototype.doGetResults = function (searchValue) {
            var _this = this;
            return search_1.getWorkspaceSymbols(searchValue).then(function (tuples) {
                var result = [];
                for (var _i = 0, tuples_1 = tuples; _i < tuples_1.length; _i++) {
                    var tuple = tuples_1[_i];
                    var provider = tuple[0], bearings = tuple[1];
                    _this.fillInSymbolEntries(result, provider, bearings, searchValue);
                }
                // Sort (Standalone only)
                if (!_this.options.skipSorting) {
                    searchValue = searchValue ? strings.stripWildcards(searchValue.toLowerCase()) : searchValue;
                    return result.sort(function (a, b) { return SymbolEntry.compare(a, b, searchValue); });
                }
                else {
                    return result;
                }
            });
        };
        OpenSymbolHandler.prototype.fillInSymbolEntries = function (bucket, provider, types, searchValue) {
            // Convert to Entries
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var element = types_1[_i];
                if (this.options.skipLocalSymbols && !!element.containerName) {
                    continue; // ignore local symbols if we are told so
                }
                var entry = this.instantiationService.createInstance(SymbolEntry, element, provider);
                entry.setHighlights(filters.matchesFuzzy(searchValue, entry.getLabel()));
                bucket.push(entry);
            }
        };
        OpenSymbolHandler.prototype.getGroupLabel = function () {
            return nls.localize('symbols', "symbol results");
        };
        OpenSymbolHandler.prototype.getEmptyLabel = function (searchString) {
            if (searchString.length > 0) {
                return nls.localize('noSymbolsMatching', "No symbols matching");
            }
            return nls.localize('noSymbolsWithoutInput', "Type to search for symbols");
        };
        OpenSymbolHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true,
                autoFocusPrefixMatch: searchValue.trim()
            };
        };
        OpenSymbolHandler.ID = 'workbench.picker.symbols';
        OpenSymbolHandler.SEARCH_DELAY = 500; // This delay accommodates for the user typing a word and then stops typing to start searching
        OpenSymbolHandler = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], OpenSymbolHandler);
        return OpenSymbolHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenSymbolHandler = OpenSymbolHandler;
});
