/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "path", "graceful-fs", "vs/base/common/arrays", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/winjs.base", "vs/workbench/services/search/node/fileSearch", "vs/platform/files/node/files", "vs/workbench/services/search/node/ripgrepTextSearch", "vs/workbench/services/search/node/textSearch", "vs/workbench/services/search/node/textSearchWorkerProvider", "vs/base/common/strings", "vs/base/parts/quickopen/common/quickOpenScorer"], function (require, exports, fs, path_1, gracefulFs, arrays, objects, strings, winjs_base_1, fileSearch_1, files_1, ripgrepTextSearch_1, textSearch_1, textSearchWorkerProvider_1, strings_1, quickOpenScorer_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    gracefulFs.gracefulify(fs);
    var SearchService = /** @class */ (function () {
        function SearchService() {
            this.caches = Object.create(null);
        }
        SearchService.prototype.fileSearch = function (config) {
            return this.doFileSearch(fileSearch_1.Engine, config, SearchService.BATCH_SIZE);
        };
        SearchService.prototype.textSearch = function (config) {
            return config.useRipgrep ?
                this.ripgrepTextSearch(config) :
                this.legacyTextSearch(config);
        };
        SearchService.prototype.ripgrepTextSearch = function (config) {
            config.maxFilesize = files_1.MAX_FILE_SIZE;
            var engine = new ripgrepTextSearch_1.RipgrepEngine(config);
            return new winjs_base_1.PPromise(function (c, e, p) {
                // Use BatchedCollector to get new results to the frontend every 2s at least, until 50 results have been returned
                var collector = new BatchedCollector(SearchService.BATCH_SIZE, p);
                engine.search(function (match) {
                    collector.addItem(match, match.numMatches);
                }, function (message) {
                    p(message);
                }, function (error, stats) {
                    collector.flush();
                    if (error) {
                        e(error);
                    }
                    else {
                        c(stats);
                    }
                });
            }, function () {
                engine.cancel();
            });
        };
        SearchService.prototype.legacyTextSearch = function (config) {
            if (!this.textSearchWorkerProvider) {
                this.textSearchWorkerProvider = new textSearchWorkerProvider_1.TextSearchWorkerProvider();
            }
            var engine = new textSearch_1.Engine(config, new fileSearch_1.FileWalker({
                folderQueries: config.folderQueries,
                extraFiles: config.extraFiles,
                includePattern: config.includePattern,
                excludePattern: config.excludePattern,
                filePattern: config.filePattern,
                useRipgrep: false,
                maxFilesize: files_1.MAX_FILE_SIZE
            }), this.textSearchWorkerProvider);
            return this.doTextSearch(engine, SearchService.BATCH_SIZE);
        };
        SearchService.prototype.doFileSearch = function (EngineClass, config, batchSize) {
            var _this = this;
            if (config.sortByScore) {
                var sortedSearch_1 = this.trySortedSearchFromCache(config);
                if (!sortedSearch_1) {
                    var walkerConfig = config.maxResults ? objects.assign({}, config, { maxResults: null }) : config;
                    var engine = new EngineClass(walkerConfig);
                    sortedSearch_1 = this.doSortedSearch(engine, config);
                }
                return new winjs_base_1.PPromise(function (c, e, p) {
                    process.nextTick(function () {
                        sortedSearch_1.then(function (_a) {
                            var result = _a[0], rawMatches = _a[1];
                            var serializedMatches = rawMatches.map(function (rawMatch) { return _this.rawMatchToSearchItem(rawMatch); });
                            _this.sendProgress(serializedMatches, p, batchSize);
                            c(result);
                        }, e, p);
                    });
                }, function () {
                    sortedSearch_1.cancel();
                });
            }
            var searchPromise;
            return new winjs_base_1.PPromise(function (c, e, p) {
                var engine = new EngineClass(config);
                searchPromise = _this.doSearch(engine, batchSize)
                    .then(c, e, function (progress) {
                    if (Array.isArray(progress)) {
                        p(progress.map(function (m) { return _this.rawMatchToSearchItem(m); }));
                    }
                    else if (progress.relativePath) {
                        p(_this.rawMatchToSearchItem(progress));
                    }
                    else {
                        p(progress);
                    }
                });
            }, function () {
                searchPromise.cancel();
            });
        };
        SearchService.prototype.rawMatchToSearchItem = function (match) {
            return { path: match.base ? [match.base, match.relativePath].join(path_1.sep) : match.relativePath };
        };
        SearchService.prototype.doSortedSearch = function (engine, config) {
            var _this = this;
            var searchPromise;
            var allResultsPromise = new winjs_base_1.PPromise(function (c, e, p) {
                var results = [];
                searchPromise = _this.doSearch(engine, -1)
                    .then(function (result) {
                    c([result, results]);
                    if (_this.telemetryPipe) {
                        _this.telemetryPipe({
                            eventName: 'fileSearch',
                            data: result.stats
                        });
                    }
                }, e, function (progress) {
                    if (Array.isArray(progress)) {
                        results = progress;
                    }
                    else {
                        p(progress);
                    }
                });
            }, function () {
                searchPromise.cancel();
            });
            var cache;
            if (config.cacheKey) {
                cache = this.getOrCreateCache(config.cacheKey);
                cache.resultsToSearchCache[config.filePattern] = allResultsPromise;
                allResultsPromise.then(null, function (err) {
                    delete cache.resultsToSearchCache[config.filePattern];
                });
                allResultsPromise = this.preventCancellation(allResultsPromise);
            }
            var chained;
            return new winjs_base_1.PPromise(function (c, e, p) {
                chained = allResultsPromise.then(function (_a) {
                    var result = _a[0], results = _a[1];
                    var scorerCache = cache ? cache.scorerCache : Object.create(null);
                    var unsortedResultTime = Date.now();
                    return _this.sortResults(config, results, scorerCache)
                        .then(function (sortedResults) {
                        var sortedResultTime = Date.now();
                        c([{
                                stats: objects.assign({}, result.stats, {
                                    unsortedResultTime: unsortedResultTime,
                                    sortedResultTime: sortedResultTime
                                }),
                                limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults
                            }, sortedResults]);
                    });
                }, e, p);
            }, function () {
                chained.cancel();
            });
        };
        SearchService.prototype.getOrCreateCache = function (cacheKey) {
            var existing = this.caches[cacheKey];
            if (existing) {
                return existing;
            }
            return this.caches[cacheKey] = new Cache();
        };
        SearchService.prototype.trySortedSearchFromCache = function (config) {
            var _this = this;
            var cache = config.cacheKey && this.caches[config.cacheKey];
            if (!cache) {
                return undefined;
            }
            var cacheLookupStartTime = Date.now();
            var cached = this.getResultsFromCache(cache, config.filePattern);
            if (cached) {
                var chained_1;
                return new winjs_base_1.PPromise(function (c, e, p) {
                    chained_1 = cached.then(function (_a) {
                        var result = _a[0], results = _a[1], cacheStats = _a[2];
                        var cacheLookupResultTime = Date.now();
                        return _this.sortResults(config, results, cache.scorerCache)
                            .then(function (sortedResults) {
                            var sortedResultTime = Date.now();
                            var stats = {
                                fromCache: true,
                                cacheLookupStartTime: cacheLookupStartTime,
                                cacheFilterStartTime: cacheStats.cacheFilterStartTime,
                                cacheLookupResultTime: cacheLookupResultTime,
                                cacheEntryCount: cacheStats.cacheFilterResultCount,
                                resultCount: results.length
                            };
                            if (config.sortByScore) {
                                stats.unsortedResultTime = cacheLookupResultTime;
                                stats.sortedResultTime = sortedResultTime;
                            }
                            if (!cacheStats.cacheWasResolved) {
                                stats.joined = result.stats;
                            }
                            c([
                                {
                                    limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults,
                                    stats: stats
                                },
                                sortedResults
                            ]);
                        });
                    }, e, p);
                }, function () {
                    chained_1.cancel();
                });
            }
            return undefined;
        };
        SearchService.prototype.sortResults = function (config, results, scorerCache) {
            // we use the same compare function that is used later when showing the results using fuzzy scoring
            // this is very important because we are also limiting the number of results by config.maxResults
            // and as such we want the top items to be included in this result set if the number of items
            // exceeds config.maxResults.
            var query = quickOpenScorer_1.prepareQuery(config.filePattern);
            var compare = function (matchA, matchB) { return quickOpenScorer_1.compareItemsByScore(matchA, matchB, query, true, FileMatchItemAccessor, scorerCache); };
            return arrays.topAsync(results, compare, config.maxResults, 10000);
        };
        SearchService.prototype.sendProgress = function (results, progressCb, batchSize) {
            if (batchSize && batchSize > 0) {
                for (var i = 0; i < results.length; i += batchSize) {
                    progressCb(results.slice(i, i + batchSize));
                }
            }
            else {
                progressCb(results);
            }
        };
        SearchService.prototype.getResultsFromCache = function (cache, searchValue) {
            if (path_1.isAbsolute(searchValue)) {
                return null; // bypass cache if user looks up an absolute path where matching goes directly on disk
            }
            // Find cache entries by prefix of search value
            var hasPathSep = searchValue.indexOf(path_1.sep) >= 0;
            var cached;
            var wasResolved;
            for (var previousSearch in cache.resultsToSearchCache) {
                // If we narrow down, we might be able to reuse the cached results
                if (strings.startsWith(searchValue, previousSearch)) {
                    if (hasPathSep && previousSearch.indexOf(path_1.sep) < 0) {
                        continue; // since a path character widens the search for potential more matches, require it in previous search too
                    }
                    var c = cache.resultsToSearchCache[previousSearch];
                    c.then(function () { wasResolved = false; });
                    wasResolved = true;
                    cached = this.preventCancellation(c);
                    break;
                }
            }
            if (!cached) {
                return null;
            }
            return new winjs_base_1.PPromise(function (c, e, p) {
                cached.then(function (_a) {
                    var complete = _a[0], cachedEntries = _a[1];
                    var cacheFilterStartTime = Date.now();
                    // Pattern match on results
                    var results = [];
                    var normalizedSearchValueLowercase = strings.stripWildcards(searchValue).toLowerCase();
                    for (var i = 0; i < cachedEntries.length; i++) {
                        var entry = cachedEntries[i];
                        // Check if this entry is a match for the search value
                        if (!strings_1.fuzzyContains(entry.relativePath, normalizedSearchValueLowercase)) {
                            continue;
                        }
                        results.push(entry);
                    }
                    c([complete, results, {
                            cacheWasResolved: wasResolved,
                            cacheFilterStartTime: cacheFilterStartTime,
                            cacheFilterResultCount: cachedEntries.length
                        }]);
                }, e, p);
            }, function () {
                cached.cancel();
            });
        };
        SearchService.prototype.doTextSearch = function (engine, batchSize) {
            return new winjs_base_1.PPromise(function (c, e, p) {
                // Use BatchedCollector to get new results to the frontend every 2s at least, until 50 results have been returned
                var collector = new BatchedCollector(batchSize, p);
                engine.search(function (matches) {
                    var totalMatches = matches.reduce(function (acc, m) { return acc + m.numMatches; }, 0);
                    collector.addItems(matches, totalMatches);
                }, function (progress) {
                    p(progress);
                }, function (error, stats) {
                    collector.flush();
                    if (error) {
                        e(error);
                    }
                    else {
                        c(stats);
                    }
                });
            }, function () {
                engine.cancel();
            });
        };
        SearchService.prototype.doSearch = function (engine, batchSize) {
            return new winjs_base_1.PPromise(function (c, e, p) {
                var batch = [];
                engine.search(function (match) {
                    if (match) {
                        if (batchSize) {
                            batch.push(match);
                            if (batchSize > 0 && batch.length >= batchSize) {
                                p(batch);
                                batch = [];
                            }
                        }
                        else {
                            p(match);
                        }
                    }
                }, function (progress) {
                    process.nextTick(function () {
                        p(progress);
                    });
                }, function (error, stats) {
                    if (batch.length) {
                        p(batch);
                    }
                    if (error) {
                        e(error);
                    }
                    else {
                        c(stats);
                    }
                });
            }, function () {
                engine.cancel();
            });
        };
        SearchService.prototype.clearCache = function (cacheKey) {
            delete this.caches[cacheKey];
            return winjs_base_1.TPromise.as(undefined);
        };
        SearchService.prototype.fetchTelemetry = function () {
            var _this = this;
            return new winjs_base_1.PPromise(function (c, e, p) {
                _this.telemetryPipe = p;
            }, function () {
                _this.telemetryPipe = null;
            });
        };
        SearchService.prototype.preventCancellation = function (promise) {
            return new winjs_base_1.PPromise(function (c, e, p) {
                // Allow for piled up cancellations to come through first.
                process.nextTick(function () {
                    promise.then(c, e, p);
                });
            }, function () {
                // Do not propagate.
            });
        };
        SearchService.BATCH_SIZE = 512;
        return SearchService;
    }());
    exports.SearchService = SearchService;
    var Cache = /** @class */ (function () {
        function Cache() {
            this.resultsToSearchCache = Object.create(null);
            this.scorerCache = Object.create(null);
        }
        return Cache;
    }());
    var FileMatchItemAccessor = new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype.getItemLabel = function (match) {
            return match.basename; // e.g. myFile.txt
        };
        class_1.prototype.getItemDescription = function (match) {
            return match.relativePath.substr(0, match.relativePath.length - match.basename.length - 1); // e.g. some/path/to/file
        };
        class_1.prototype.getItemPath = function (match) {
            return match.relativePath; // e.g. some/path/to/file/myFile.txt
        };
        return class_1;
    }());
    /**
     * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
     * set of items collected.
     * But after that point, the callback is called with batches of maxBatchSize.
     * If the batch isn't filled within some time, the callback is also called.
     */
    var BatchedCollector = /** @class */ (function () {
        function BatchedCollector(maxBatchSize, cb) {
            this.maxBatchSize = maxBatchSize;
            this.cb = cb;
            this.totalNumberCompleted = 0;
            this.batch = [];
            this.batchSize = 0;
        }
        BatchedCollector.prototype.addItem = function (item, size) {
            if (!item) {
                return;
            }
            if (this.maxBatchSize > 0) {
                this.addItemToBatch(item, size);
            }
            else {
                this.cb(item);
            }
        };
        BatchedCollector.prototype.addItems = function (items, size) {
            if (!items) {
                return;
            }
            if (this.maxBatchSize > 0) {
                this.addItemsToBatch(items, size);
            }
            else {
                this.cb(items);
            }
        };
        BatchedCollector.prototype.addItemToBatch = function (item, size) {
            this.batch.push(item);
            this.batchSize += size;
            this.onUpdate();
        };
        BatchedCollector.prototype.addItemsToBatch = function (item, size) {
            this.batch = this.batch.concat(item);
            this.batchSize += size;
            this.onUpdate();
        };
        BatchedCollector.prototype.onUpdate = function () {
            var _this = this;
            if (this.totalNumberCompleted < BatchedCollector.START_BATCH_AFTER_COUNT) {
                // Flush because we aren't batching yet
                this.flush();
            }
            else if (this.batchSize >= this.maxBatchSize) {
                // Flush because the batch is full
                this.flush();
            }
            else if (!this.timeoutHandle) {
                // No timeout running, start a timeout to flush
                this.timeoutHandle = setTimeout(function () {
                    _this.flush();
                }, BatchedCollector.TIMEOUT);
            }
        };
        BatchedCollector.prototype.flush = function () {
            if (this.batchSize) {
                this.totalNumberCompleted += this.batchSize;
                this.cb(this.batch);
                this.batch = [];
                this.batchSize = 0;
                if (this.timeoutHandle) {
                    clearTimeout(this.timeoutHandle);
                    this.timeoutHandle = 0;
                }
            }
        };
        BatchedCollector.TIMEOUT = 4000;
        // After RUN_TIMEOUT_UNTIL_COUNT items have been collected, stop flushing on timeout
        BatchedCollector.START_BATCH_AFTER_COUNT = 50;
        return BatchedCollector;
    }());
});
