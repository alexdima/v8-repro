/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/winjs.base", "vs/nls", "vs/base/common/async", "vs/base/common/types", "vs/base/parts/quickopen/browser/quickOpenModel", "vs/workbench/browser/quickopen", "vs/workbench/parts/search/browser/openFileHandler", "vs/workbench/parts/search/browser/openSymbolHandler", "vs/platform/message/common/message", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configuration", "vs/base/parts/quickopen/common/quickOpenScorer"], function (require, exports, arrays, winjs_base_1, nls, async_1, types, quickOpenModel_1, quickopen_1, openFileHandler_1, openSymbolHandler, message_1, instantiation_1, configuration_1, quickOpenScorer_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenSymbolHandler = openSymbolHandler.OpenSymbolHandler; // OpenSymbolHandler is used from an extension and must be in the main bundle file so it can load
    var OpenAnythingHandler = /** @class */ (function (_super) {
        __extends(OpenAnythingHandler, _super);
        function OpenAnythingHandler(messageService, instantiationService, configurationService) {
            var _this = _super.call(this) || this;
            _this.messageService = messageService;
            _this.configurationService = configurationService;
            _this.scorerCache = Object.create(null);
            _this.searchDelayer = new async_1.ThrottledDelayer(OpenAnythingHandler.FILE_SEARCH_DELAY);
            _this.openSymbolHandler = instantiationService.createInstance(exports.OpenSymbolHandler);
            _this.openFileHandler = instantiationService.createInstance(openFileHandler_1.OpenFileHandler);
            _this.updateHandlers(_this.configurationService.getValue());
            _this.registerListeners();
            return _this;
        }
        OpenAnythingHandler.prototype.registerListeners = function () {
            var _this = this;
            this.configurationService.onDidChangeConfiguration(function (e) { return _this.updateHandlers(_this.configurationService.getValue()); });
        };
        OpenAnythingHandler.prototype.updateHandlers = function (configuration) {
            this.includeSymbols = configuration && configuration.search && configuration.search.quickOpen && configuration.search.quickOpen.includeSymbols;
            // Files
            this.openFileHandler.setOptions({
                forceUseIcons: this.includeSymbols // only need icons for file results if we mix with symbol results
            });
            // Symbols
            this.openSymbolHandler.setOptions({
                skipDelay: true,
                skipLocalSymbols: true,
                skipSorting: true // we sort combined with file results
            });
        };
        OpenAnythingHandler.prototype.getResults = function (searchValue) {
            var _this = this;
            this.cancelPendingSearch();
            this.isClosed = false; // Treat this call as the handler being in use
            // Prepare search for scoring
            var query = quickOpenScorer_1.prepareQuery(searchValue);
            var searchWithRange = this.extractRange(query.value); // Find a suitable range from the pattern looking for ":" and "#"
            if (searchWithRange) {
                query.value = searchWithRange.search; // ignore range portion in query
                query.lowercase = query.value.toLowerCase();
            }
            if (!query.value) {
                return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel()); // Respond directly to empty search
            }
            // The throttler needs a factory for its promises
            var promiseFactory = function () {
                var resultPromises = [];
                // File Results
                var filePromise = _this.openFileHandler.getResults(query.value, OpenAnythingHandler.MAX_DISPLAYED_RESULTS);
                resultPromises.push(filePromise);
                // Symbol Results (unless disabled or a range or absolute path is specified)
                if (_this.includeSymbols && !searchWithRange) {
                    resultPromises.push(_this.openSymbolHandler.getResults(query.value));
                }
                // Join and sort unified
                _this.pendingSearch = winjs_base_1.TPromise.join(resultPromises).then(function (results) {
                    _this.pendingSearch = null;
                    // If the quick open widget has been closed meanwhile, ignore the result
                    if (_this.isClosed) {
                        return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel());
                    }
                    // Combine results.
                    var mergedResults = [].concat.apply([], results.map(function (r) { return r.entries; }));
                    // Sort
                    var compare = function (elementA, elementB) { return quickOpenScorer_1.compareItemsByScore(elementA, elementB, query, true, quickOpenModel_1.QuickOpenItemAccessor, _this.scorerCache); };
                    var viewResults = arrays.top(mergedResults, compare, OpenAnythingHandler.MAX_DISPLAYED_RESULTS);
                    // Apply range and highlights to file entries
                    viewResults.forEach(function (entry) {
                        if (entry instanceof openFileHandler_1.FileEntry) {
                            entry.setRange(searchWithRange ? searchWithRange.range : null);
                            var itemScore = quickOpenScorer_1.scoreItem(entry, query, true, quickOpenModel_1.QuickOpenItemAccessor, _this.scorerCache);
                            entry.setHighlights(itemScore.labelMatch, itemScore.descriptionMatch);
                        }
                    });
                    return winjs_base_1.TPromise.as(new quickOpenModel_1.QuickOpenModel(viewResults));
                }, function (error) {
                    _this.pendingSearch = null;
                    if (error && error[0] && error[0].message) {
                        _this.messageService.show(message_1.Severity.Error, error[0].message.replace(/[\*_\[\]]/g, '\\$&'));
                    }
                    else {
                        _this.messageService.show(message_1.Severity.Error, error);
                    }
                    return null;
                });
                return _this.pendingSearch;
            };
            // Trigger through delayer to prevent accumulation while the user is typing (except when expecting results to come from cache)
            return this.hasShortResponseTime() ? promiseFactory() : this.searchDelayer.trigger(promiseFactory, this.includeSymbols ? OpenAnythingHandler.SYMBOL_SEARCH_DELAY : OpenAnythingHandler.FILE_SEARCH_DELAY);
        };
        OpenAnythingHandler.prototype.hasShortResponseTime = function () {
            if (!this.includeSymbols) {
                return this.openFileHandler.hasShortResponseTime();
            }
            return this.openFileHandler.hasShortResponseTime() && this.openSymbolHandler.hasShortResponseTime();
        };
        OpenAnythingHandler.prototype.extractRange = function (value) {
            if (!value) {
                return null;
            }
            var range = null;
            // Find Line/Column number from search value using RegExp
            var patternMatch = OpenAnythingHandler.LINE_COLON_PATTERN.exec(value);
            if (patternMatch && patternMatch.length > 1) {
                var startLineNumber = parseInt(patternMatch[1], 10);
                // Line Number
                if (types.isNumber(startLineNumber)) {
                    range = {
                        startLineNumber: startLineNumber,
                        startColumn: 1,
                        endLineNumber: startLineNumber,
                        endColumn: 1
                    };
                    // Column Number
                    if (patternMatch.length > 3) {
                        var startColumn = parseInt(patternMatch[3], 10);
                        if (types.isNumber(startColumn)) {
                            range = {
                                startLineNumber: range.startLineNumber,
                                startColumn: startColumn,
                                endLineNumber: range.endLineNumber,
                                endColumn: startColumn
                            };
                        }
                    }
                }
                else if (patternMatch[1] === '') {
                    range = {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1
                    };
                }
            }
            if (range) {
                return {
                    search: value.substr(0, patternMatch.index),
                    range: range
                };
            }
            return null;
        };
        OpenAnythingHandler.prototype.getGroupLabel = function () {
            return this.includeSymbols ? nls.localize('fileAndTypeResults', "file and symbol results") : nls.localize('fileResults', "file results");
        };
        OpenAnythingHandler.prototype.getAutoFocus = function (searchValue) {
            return {
                autoFocusFirstEntry: true
            };
        };
        OpenAnythingHandler.prototype.onOpen = function () {
            this.openSymbolHandler.onOpen();
            this.openFileHandler.onOpen();
        };
        OpenAnythingHandler.prototype.onClose = function (canceled) {
            this.isClosed = true;
            // Cancel any pending search
            this.cancelPendingSearch();
            // Clear Cache
            this.scorerCache = Object.create(null);
            // Propagate
            this.openSymbolHandler.onClose(canceled);
            this.openFileHandler.onClose(canceled);
        };
        OpenAnythingHandler.prototype.cancelPendingSearch = function () {
            if (this.pendingSearch) {
                this.pendingSearch.cancel();
                this.pendingSearch = null;
            }
        };
        OpenAnythingHandler.ID = 'workbench.picker.anything';
        OpenAnythingHandler.LINE_COLON_PATTERN = /[#|:|\(](\d*)([#|:|,](\d*))?\)?$/;
        OpenAnythingHandler.FILE_SEARCH_DELAY = 300;
        OpenAnythingHandler.SYMBOL_SEARCH_DELAY = 500; // go easier on those symbols!
        OpenAnythingHandler.MAX_DISPLAYED_RESULTS = 512;
        OpenAnythingHandler = __decorate([
            __param(0, message_1.IMessageService),
            __param(1, instantiation_1.IInstantiationService),
            __param(2, configuration_1.IConfigurationService)
        ], OpenAnythingHandler);
        return OpenAnythingHandler;
    }(quickopen_1.QuickOpenHandler));
    exports.OpenAnythingHandler = OpenAnythingHandler;
});
