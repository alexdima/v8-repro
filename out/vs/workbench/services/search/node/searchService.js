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
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/objects", "vs/base/common/strings", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/search/common/search", "vs/workbench/services/untitled/common/untitledEditorService", "vs/editor/common/services/modelService", "vs/platform/configuration/common/configuration", "./searchIpc", "vs/platform/environment/common/environment", "vs/base/common/map", "vs/platform/telemetry/common/telemetry", "vs/base/common/errors", "vs/base/common/network", "vs/base/node/pfs", "vs/platform/log/common/log"], function (require, exports, winjs_base_1, uri_1, objects, strings, ipc_1, ipc_cp_1, search_1, untitledEditorService_1, modelService_1, configuration_1, searchIpc_1, environment_1, map_1, telemetry_1, errors_1, network_1, pfs, log_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchService = /** @class */ (function () {
        function SearchService(modelService, untitledEditorService, environmentService, telemetryService, configurationService, logService) {
            this.modelService = modelService;
            this.untitledEditorService = untitledEditorService;
            this.telemetryService = telemetryService;
            this.configurationService = configurationService;
            this.logService = logService;
            this.searchProvider = [];
            this.diskSearch = new DiskSearch(!environmentService.isBuilt || environmentService.verbose, /*timeout=*/ undefined, environmentService.debugSearch);
            this.registerSearchResultProvider(this.diskSearch);
        }
        SearchService.prototype.registerSearchResultProvider = function (provider) {
            var _this = this;
            this.searchProvider.push(provider);
            return {
                dispose: function () {
                    var idx = _this.searchProvider.indexOf(provider);
                    if (idx >= 0) {
                        _this.searchProvider.splice(idx, 1);
                    }
                }
            };
        };
        SearchService.prototype.extendQuery = function (query) {
            var configuration = this.configurationService.getValue();
            // Configuration: Encoding
            if (!query.fileEncoding) {
                var fileEncoding = configuration && configuration.files && configuration.files.encoding;
                query.fileEncoding = fileEncoding;
            }
            // Configuration: File Excludes
            if (!query.disregardExcludeSettings) {
                var fileExcludes = objects.deepClone(configuration && configuration.files && configuration.files.exclude);
                if (fileExcludes) {
                    if (!query.excludePattern) {
                        query.excludePattern = fileExcludes;
                    }
                    else {
                        objects.mixin(query.excludePattern, fileExcludes, false /* no overwrite */);
                    }
                }
            }
        };
        SearchService.prototype.search = function (query) {
            var _this = this;
            this.forwardTelemetry();
            var combinedPromise;
            return new winjs_base_1.PPromise(function (onComplete, onError, onProgress) {
                // Get local results from dirty/untitled
                var localResults = _this.getLocalResults(query);
                // Allow caller to register progress callback
                process.nextTick(function () { return localResults.values().filter(function (res) { return !!res; }).forEach(onProgress); });
                _this.logService.trace('SearchService#search', JSON.stringify(query));
                var providerPromises = _this.searchProvider.map(function (provider) { return winjs_base_1.TPromise.wrap(provider.search(query)).then(function (e) { return e; }, function (err) {
                    // TODO@joh
                    // single provider fail. fail all?
                    onError(err);
                }, function (progress) {
                    if (progress.resource) {
                        // Match
                        if (!localResults.has(progress.resource)) {
                            onProgress(progress);
                        }
                    }
                    else {
                        // Progress
                        onProgress(progress);
                    }
                    if (progress.message) {
                        _this.logService.debug('SearchService#search', progress.message);
                    }
                }); });
                combinedPromise = winjs_base_1.TPromise.join(providerPromises).then(function (values) {
                    var result = {
                        limitHit: false,
                        results: [],
                        stats: undefined
                    };
                    // TODO@joh
                    // sorting, disjunct results
                    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                        var value = values_1[_i];
                        if (!value) {
                            continue;
                        }
                        // TODO@joh individual stats/limit
                        result.stats = value.stats || result.stats;
                        result.limitHit = value.limitHit || result.limitHit;
                        for (var _a = 0, _b = value.results; _a < _b.length; _a++) {
                            var match = _b[_a];
                            if (!localResults.has(match.resource)) {
                                result.results.push(match);
                            }
                        }
                    }
                    return result;
                }).then(onComplete, onError);
            }, function () { return combinedPromise && combinedPromise.cancel(); });
        };
        SearchService.prototype.getLocalResults = function (query) {
            var _this = this;
            var localResults = new map_1.ResourceMap();
            if (query.type === search_1.QueryType.Text) {
                var models = this.modelService.getModels();
                models.forEach(function (model) {
                    var resource = model.uri;
                    if (!resource) {
                        return;
                    }
                    // Support untitled files
                    if (resource.scheme === network_1.Schemas.untitled) {
                        if (!_this.untitledEditorService.exists(resource)) {
                            return;
                        }
                    }
                    else if (resource.scheme !== network_1.Schemas.file) {
                        return;
                    }
                    if (!_this.matches(resource, query)) {
                        return; // respect user filters
                    }
                    // Use editor API to find matches
                    var matches = model.findMatches(query.contentPattern.pattern, false, query.contentPattern.isRegExp, query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, query.maxResults);
                    if (matches.length) {
                        var fileMatch_1 = new search_1.FileMatch(resource);
                        localResults.set(resource, fileMatch_1);
                        matches.forEach(function (match) {
                            fileMatch_1.lineMatches.push(new search_1.LineMatch(model.getLineContent(match.range.startLineNumber), match.range.startLineNumber - 1, [[match.range.startColumn - 1, match.range.endColumn - match.range.startColumn]]));
                        });
                    }
                    else {
                        localResults.set(resource, null);
                    }
                });
            }
            return localResults;
        };
        SearchService.prototype.matches = function (resource, query) {
            // file pattern
            if (query.filePattern) {
                if (resource.scheme !== network_1.Schemas.file) {
                    return false; // if we match on file pattern, we have to ignore non file resources
                }
                if (!strings.fuzzyContains(resource.fsPath, strings.stripWildcards(query.filePattern).toLowerCase())) {
                    return false;
                }
            }
            // includes
            if (query.includePattern) {
                if (resource.scheme !== network_1.Schemas.file) {
                    return false; // if we match on file patterns, we have to ignore non file resources
                }
            }
            return search_1.pathIncludedInQuery(query, resource.fsPath);
        };
        SearchService.prototype.clearCache = function (cacheKey) {
            return this.diskSearch.clearCache(cacheKey);
        };
        SearchService.prototype.forwardTelemetry = function () {
            var _this = this;
            if (!this.forwardingTelemetry) {
                this.forwardingTelemetry = this.diskSearch.fetchTelemetry()
                    .then(null, errors_1.onUnexpectedError, function (event) {
                    _this.telemetryService.publicLog(event.eventName, event.data);
                });
            }
        };
        SearchService = __decorate([
            __param(0, modelService_1.IModelService),
            __param(1, untitledEditorService_1.IUntitledEditorService),
            __param(2, environment_1.IEnvironmentService),
            __param(3, telemetry_1.ITelemetryService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, log_1.ILogService)
        ], SearchService);
        return SearchService;
    }());
    exports.SearchService = SearchService;
    var DiskSearch = /** @class */ (function () {
        function DiskSearch(verboseLogging, timeout, searchDebug) {
            if (timeout === void 0) { timeout = 60 * 60 * 1000; }
            var opts = {
                serverName: 'Search',
                timeout: timeout,
                args: ['--type=searchService'],
                // See https://github.com/Microsoft/vscode/issues/27665
                // Pass in fresh execArgv to the forked process such that it doesn't inherit them from `process.execArgv`.
                // e.g. Launching the extension host process with `--inspect-brk=xxx` and then forking a process from the extension host
                // results in the forked process inheriting `--inspect-brk=xxx`.
                freshExecArgv: true,
                env: {
                    AMD_ENTRYPOINT: 'vs/workbench/services/search/node/searchApp',
                    PIPE_LOGGING: 'true',
                    VERBOSE_LOGGING: verboseLogging
                }
            };
            if (searchDebug) {
                if (searchDebug.break && searchDebug.port) {
                    opts.debugBrk = searchDebug.port;
                }
                else if (!searchDebug.break && searchDebug.port) {
                    opts.debug = searchDebug.port;
                }
            }
            var client = new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, opts);
            var channel = ipc_1.getNextTickChannel(client.getChannel('search'));
            this.raw = new searchIpc_1.SearchChannelClient(channel);
        }
        DiskSearch.prototype.search = function (query) {
            return __awaiter(this, void 0, winjs_base_1.PPromise, function () {
                var request, rawSearch, _i, _a, q, _b, _c, _d, r;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            rawSearch = {
                                folderQueries: [],
                                extraFiles: [],
                                filePattern: query.filePattern,
                                excludePattern: query.excludePattern,
                                includePattern: query.includePattern,
                                maxResults: query.maxResults,
                                exists: query.exists,
                                sortByScore: query.sortByScore,
                                cacheKey: query.cacheKey,
                                useRipgrep: query.useRipgrep,
                                disregardIgnoreFiles: query.disregardIgnoreFiles,
                                ignoreSymlinks: query.ignoreSymlinks
                            };
                            if (!query.folderQueries) return [3 /*break*/, 5];
                            _i = 0, _a = query.folderQueries;
                            _e.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            q = _a[_i];
                            _b = q.folder.scheme === network_1.Schemas.file;
                            if (!_b) return [3 /*break*/, 3];
                            return [4 /*yield*/, pfs.exists(q.folder.fsPath)];
                        case 2:
                            _b = (_e.sent());
                            _e.label = 3;
                        case 3:
                            if (_b) {
                                rawSearch.folderQueries.push({
                                    excludePattern: q.excludePattern,
                                    includePattern: q.includePattern,
                                    fileEncoding: q.fileEncoding,
                                    disregardIgnoreFiles: q.disregardIgnoreFiles,
                                    folder: q.folder.fsPath
                                });
                            }
                            _e.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5:
                            if (query.extraFileResources) {
                                for (_c = 0, _d = query.extraFileResources; _c < _d.length; _c++) {
                                    r = _d[_c];
                                    if (r.scheme === network_1.Schemas.file) {
                                        rawSearch.extraFiles.push(r.fsPath);
                                    }
                                }
                            }
                            if (query.type === search_1.QueryType.Text) {
                                rawSearch.contentPattern = query.contentPattern;
                            }
                            if (query.type === search_1.QueryType.File) {
                                request = this.raw.fileSearch(rawSearch);
                            }
                            else {
                                request = this.raw.textSearch(rawSearch);
                            }
                            return [2 /*return*/, DiskSearch.collectResults(request)];
                    }
                });
            });
        };
        DiskSearch.collectResults = function (request) {
            var _this = this;
            var result = [];
            return new winjs_base_1.PPromise(function (c, e, p) {
                request.done(function (complete) {
                    c({
                        limitHit: complete.limitHit,
                        results: result,
                        stats: complete.stats
                    });
                }, e, function (data) {
                    // Matches
                    if (Array.isArray(data)) {
                        var fileMatches = data.map(function (d) { return _this.createFileMatch(d); });
                        result = result.concat(fileMatches);
                        fileMatches.forEach(p);
                    }
                    else if (data.path) {
                        var fileMatch = _this.createFileMatch(data);
                        result.push(fileMatch);
                        p(fileMatch);
                    }
                    else {
                        p(data);
                    }
                });
            }, function () { return request.cancel(); });
        };
        DiskSearch.createFileMatch = function (data) {
            var fileMatch = new search_1.FileMatch(uri_1.default.file(data.path));
            if (data.lineMatches) {
                for (var j = 0; j < data.lineMatches.length; j++) {
                    fileMatch.lineMatches.push(new search_1.LineMatch(data.lineMatches[j].preview, data.lineMatches[j].lineNumber, data.lineMatches[j].offsetAndLengths));
                }
            }
            return fileMatch;
        };
        DiskSearch.prototype.clearCache = function (cacheKey) {
            return this.raw.clearCache(cacheKey);
        };
        DiskSearch.prototype.fetchTelemetry = function () {
            return this.raw.fetchTelemetry();
        };
        return DiskSearch;
    }());
    exports.DiskSearch = DiskSearch;
});
