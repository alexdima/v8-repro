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
define(["require", "exports", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/errors", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/map", "vs/base/common/event", "vs/platform/search/common/search", "vs/platform/search/common/replace", "vs/platform/telemetry/common/telemetry", "vs/editor/common/core/range", "vs/editor/common/model", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/modelService", "vs/workbench/parts/search/common/replace", "vs/editor/common/model/textModel", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/labels"], function (require, exports, objects, strings, errors, async_1, lifecycle_1, uri_1, map_1, event_1, search_1, replace_1, telemetry_1, range_1, model_1, instantiation_1, modelService_1, replace_2, textModel_1, colorRegistry_1, themeService_1, labels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Match = /** @class */ (function () {
        function Match(_parent, text, lineNumber, offset, length) {
            this._parent = _parent;
            this._lineText = text;
            this._range = new range_1.Range(1 + lineNumber, 1 + offset, 1 + lineNumber, 1 + offset + length);
            this._id = this._parent.id() + '>' + lineNumber + '>' + offset + this.getMatchString();
        }
        Match.prototype.id = function () {
            return this._id;
        };
        Match.prototype.parent = function () {
            return this._parent;
        };
        Match.prototype.text = function () {
            return this._lineText;
        };
        Match.prototype.range = function () {
            return this._range;
        };
        Match.prototype.preview = function () {
            var before = this._lineText.substring(0, this._range.startColumn - 1), inside = this.getMatchString(), after = this._lineText.substring(this._range.endColumn - 1, Math.min(this._range.endColumn + 150, this._lineText.length));
            before = strings.lcut(before, 26);
            return {
                before: before,
                inside: inside,
                after: after,
            };
        };
        Object.defineProperty(Match.prototype, "replaceString", {
            get: function () {
                var searchModel = this.parent().parent().searchModel;
                var matchString = this.getMatchString();
                var replaceString = searchModel.replacePattern.getReplaceString(matchString);
                // If match string is not matching then regex pattern has a lookahead expression
                if (replaceString === null) {
                    replaceString = searchModel.replacePattern.getReplaceString(matchString + this._lineText.substring(this._range.endColumn - 1));
                }
                // Match string is still not matching. Could be unsupported matches (multi-line).
                if (replaceString === null) {
                    replaceString = searchModel.replacePattern.pattern;
                }
                return replaceString;
            },
            enumerable: true,
            configurable: true
        });
        Match.prototype.getMatchString = function () {
            return this._lineText.substring(this._range.startColumn - 1, this._range.endColumn - 1);
        };
        return Match;
    }());
    exports.Match = Match;
    var FileMatch = /** @class */ (function (_super) {
        __extends(FileMatch, _super);
        function FileMatch(_query, _maxResults, _parent, rawMatch, modelService, replaceService) {
            var _this = _super.call(this) || this;
            _this._query = _query;
            _this._maxResults = _maxResults;
            _this._parent = _parent;
            _this.rawMatch = rawMatch;
            _this.modelService = modelService;
            _this.replaceService = replaceService;
            _this._onChange = _this._register(new event_1.Emitter());
            _this.onChange = _this._onChange.event;
            _this._onDispose = _this._register(new event_1.Emitter());
            _this.onDispose = _this._onDispose.event;
            _this._modelDecorations = [];
            _this._resource = _this.rawMatch.resource;
            _this._matches = new Map();
            _this._removedMatches = new Set();
            _this._updateScheduler = new async_1.RunOnceScheduler(_this.updateMatchesForModel.bind(_this), 250);
            _this.createMatches();
            _this.registerListeners();
            return _this;
        }
        FileMatch.getDecorationOption = function (selected) {
            return (selected ? FileMatch._CURRENT_FIND_MATCH : FileMatch._FIND_MATCH);
        };
        FileMatch.prototype.createMatches = function () {
            var _this = this;
            var model = this.modelService.getModel(this._resource);
            if (model) {
                this.bindModel(model);
                this.updateMatchesForModel();
            }
            else {
                this.rawMatch.lineMatches.forEach(function (rawLineMatch) {
                    rawLineMatch.offsetAndLengths.forEach(function (offsetAndLength) {
                        var match = new Match(_this, rawLineMatch.preview, rawLineMatch.lineNumber, offsetAndLength[0], offsetAndLength[1]);
                        _this.add(match);
                    });
                });
            }
        };
        FileMatch.prototype.registerListeners = function () {
            var _this = this;
            this._register(this.modelService.onModelAdded(function (model) {
                if (model.uri.toString() === _this._resource.toString()) {
                    _this.bindModel(model);
                }
            }));
        };
        FileMatch.prototype.bindModel = function (model) {
            var _this = this;
            this._model = model;
            this._modelListener = this._model.onDidChangeContent(function () {
                _this._updateScheduler.schedule();
            });
            this._model.onWillDispose(function () { return _this.onModelWillDispose(); });
            this.updateHighlights();
        };
        FileMatch.prototype.onModelWillDispose = function () {
            // Update matches because model might have some dirty changes
            this.updateMatchesForModel();
            this.unbindModel();
        };
        FileMatch.prototype.unbindModel = function () {
            if (this._model) {
                this._updateScheduler.cancel();
                this._model.deltaDecorations(this._modelDecorations, []);
                this._model = null;
                this._modelListener.dispose();
            }
        };
        FileMatch.prototype.updateMatchesForModel = function () {
            // this is called from a timeout and might fire
            // after the model has been disposed
            if (!this._model) {
                return;
            }
            this._matches = new Map();
            var matches = this._model
                .findMatches(this._query.pattern, this._model.getFullModelRange(), this._query.isRegExp, this._query.isCaseSensitive, this._query.isWordMatch ? this._query.wordSeparators : null, false, this._maxResults);
            this.updateMatches(matches, true);
        };
        FileMatch.prototype.updatesMatchesForLineAfterReplace = function (lineNumber, modelChange) {
            var _this = this;
            var range = {
                startLineNumber: lineNumber,
                startColumn: this._model.getLineMinColumn(lineNumber),
                endLineNumber: lineNumber,
                endColumn: this._model.getLineMaxColumn(lineNumber)
            };
            var oldMatches = map_1.values(this._matches).filter(function (match) { return match.range().startLineNumber === lineNumber; });
            oldMatches.forEach(function (match) { return _this._matches.delete(match.id()); });
            var matches = this._model.findMatches(this._query.pattern, range, this._query.isRegExp, this._query.isCaseSensitive, this._query.isWordMatch ? this._query.wordSeparators : null, false, this._maxResults);
            this.updateMatches(matches, modelChange);
        };
        FileMatch.prototype.updateMatches = function (matches, modelChange) {
            var _this = this;
            matches.forEach(function (m) {
                var match = new Match(_this, _this._model.getLineContent(m.range.startLineNumber), m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endColumn - m.range.startColumn);
                if (!_this._removedMatches.has(match.id())) {
                    _this.add(match);
                    if (_this.isMatchSelected(match)) {
                        _this._selectedMatch = match;
                    }
                }
            });
            this._onChange.fire(modelChange);
            this.updateHighlights();
        };
        FileMatch.prototype.updateHighlights = function () {
            var _this = this;
            if (!this._model) {
                return;
            }
            if (this.parent().showHighlights) {
                this._modelDecorations = this._model.deltaDecorations(this._modelDecorations, this.matches().map(function (match) { return ({
                    range: match.range(),
                    options: FileMatch.getDecorationOption(_this.isMatchSelected(match))
                }); }));
            }
            else {
                this._modelDecorations = this._model.deltaDecorations(this._modelDecorations, []);
            }
        };
        FileMatch.prototype.id = function () {
            return this.resource().toString();
        };
        FileMatch.prototype.parent = function () {
            return this._parent;
        };
        FileMatch.prototype.matches = function () {
            return map_1.values(this._matches);
        };
        FileMatch.prototype.remove = function (match) {
            this.removeMatch(match);
            this._removedMatches.add(match.id());
            this._onChange.fire(false);
        };
        FileMatch.prototype.replace = function (toReplace) {
            var _this = this;
            return this.replaceService.replace(toReplace)
                .then(function () { return _this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false); });
        };
        FileMatch.prototype.setSelectedMatch = function (match) {
            if (match) {
                if (!this._matches.has(match.id())) {
                    return;
                }
                if (this.isMatchSelected(match)) {
                    return;
                }
            }
            this._selectedMatch = match;
            this.updateHighlights();
        };
        FileMatch.prototype.getSelectedMatch = function () {
            return this._selectedMatch;
        };
        FileMatch.prototype.isMatchSelected = function (match) {
            return this._selectedMatch && this._selectedMatch.id() === match.id();
        };
        FileMatch.prototype.count = function () {
            return this.matches().length;
        };
        FileMatch.prototype.resource = function () {
            return this._resource;
        };
        FileMatch.prototype.name = function () {
            return labels_1.getBaseLabel(this.resource());
        };
        FileMatch.prototype.add = function (match, trigger) {
            this._matches.set(match.id(), match);
            if (trigger) {
                this._onChange.fire(true);
            }
        };
        FileMatch.prototype.removeMatch = function (match) {
            this._matches.delete(match.id());
            if (this.isMatchSelected(match)) {
                this.setSelectedMatch(null);
            }
            else {
                this.updateHighlights();
            }
        };
        FileMatch.prototype.dispose = function () {
            this.setSelectedMatch(null);
            this.unbindModel();
            this._onDispose.fire();
            _super.prototype.dispose.call(this);
        };
        FileMatch._CURRENT_FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'currentFindMatch',
            overviewRuler: {
                color: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerFindMatchForeground),
                darkColor: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            }
        });
        FileMatch._FIND_MATCH = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'findMatch',
            overviewRuler: {
                color: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerFindMatchForeground),
                darkColor: themeService_1.themeColorFromId(colorRegistry_1.overviewRulerFindMatchForeground),
                position: model_1.OverviewRulerLane.Center
            }
        });
        FileMatch = __decorate([
            __param(4, modelService_1.IModelService), __param(5, replace_2.IReplaceService)
        ], FileMatch);
        return FileMatch;
    }(lifecycle_1.Disposable));
    exports.FileMatch = FileMatch;
    var FolderMatch = /** @class */ (function (_super) {
        __extends(FolderMatch, _super);
        function FolderMatch(_resource, _id, _index, _query, _parent, _searchModel, replaceService, instantiationService) {
            var _this = _super.call(this) || this;
            _this._resource = _resource;
            _this._id = _id;
            _this._index = _index;
            _this._query = _query;
            _this._parent = _parent;
            _this._searchModel = _searchModel;
            _this.replaceService = replaceService;
            _this.instantiationService = instantiationService;
            _this._onChange = _this._register(new event_1.Emitter());
            _this.onChange = _this._onChange.event;
            _this._onDispose = _this._register(new event_1.Emitter());
            _this.onDispose = _this._onDispose.event;
            _this._replacingAll = false;
            _this._fileMatches = new map_1.ResourceMap();
            _this._unDisposedFileMatches = new map_1.ResourceMap();
            return _this;
        }
        Object.defineProperty(FolderMatch.prototype, "searchModel", {
            get: function () {
                return this._searchModel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderMatch.prototype, "showHighlights", {
            get: function () {
                return this._parent.showHighlights;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderMatch.prototype, "replacingAll", {
            set: function (b) {
                this._replacingAll = b;
            },
            enumerable: true,
            configurable: true
        });
        FolderMatch.prototype.id = function () {
            return this._id;
        };
        FolderMatch.prototype.resource = function () {
            return this._resource;
        };
        FolderMatch.prototype.index = function () {
            return this._index;
        };
        FolderMatch.prototype.name = function () {
            return labels_1.getBaseLabel(this.resource());
        };
        FolderMatch.prototype.parent = function () {
            return this._parent;
        };
        FolderMatch.prototype.hasRoot = function () {
            return this._resource.fsPath !== '';
        };
        FolderMatch.prototype.add = function (raw, silent) {
            var _this = this;
            var changed = [];
            raw.forEach(function (rawFileMatch) {
                if (!_this._fileMatches.has(rawFileMatch.resource)) {
                    var fileMatch_1 = _this.instantiationService.createInstance(FileMatch, _this._query.contentPattern, _this._query.maxResults, _this, rawFileMatch);
                    _this.doAdd(fileMatch_1);
                    changed.push(fileMatch_1);
                    var disposable_1 = fileMatch_1.onChange(function () { return _this.onFileChange(fileMatch_1); });
                    fileMatch_1.onDispose(function () { return disposable_1.dispose(); });
                }
            });
            if (!silent && changed.length) {
                this._onChange.fire({ elements: changed, added: true });
            }
        };
        FolderMatch.prototype.clear = function () {
            var changed = this.matches();
            this.disposeMatches();
            this._onChange.fire({ elements: changed, removed: true });
        };
        FolderMatch.prototype.remove = function (match) {
            this.doRemove(match);
        };
        FolderMatch.prototype.replace = function (match) {
            var _this = this;
            return this.replaceService.replace([match]).then(function () {
                _this.doRemove(match, false, true);
            });
        };
        FolderMatch.prototype.replaceAll = function () {
            var _this = this;
            var matches = this.matches();
            return this.replaceService.replace(matches).then(function () {
                matches.forEach(function (match) { return _this.doRemove(match, false, true); });
            });
        };
        FolderMatch.prototype.matches = function () {
            return this._fileMatches.values();
        };
        FolderMatch.prototype.isEmpty = function () {
            return this.fileCount() === 0;
        };
        FolderMatch.prototype.fileCount = function () {
            return this._fileMatches.size;
        };
        FolderMatch.prototype.count = function () {
            return this.matches().reduce(function (prev, match) { return prev + match.count(); }, 0);
        };
        FolderMatch.prototype.onFileChange = function (fileMatch) {
            var added = false;
            var removed = false;
            if (!this._fileMatches.has(fileMatch.resource())) {
                this.doAdd(fileMatch);
                added = true;
            }
            if (fileMatch.count() === 0) {
                this.doRemove(fileMatch, false, false);
                added = false;
                removed = true;
            }
            if (!this._replacingAll) {
                this._onChange.fire({ elements: [fileMatch], added: added, removed: removed });
            }
        };
        FolderMatch.prototype.doAdd = function (fileMatch) {
            this._fileMatches.set(fileMatch.resource(), fileMatch);
            if (this._unDisposedFileMatches.has(fileMatch.resource())) {
                this._unDisposedFileMatches.delete(fileMatch.resource());
            }
        };
        FolderMatch.prototype.doRemove = function (fileMatch, dispose, trigger) {
            if (dispose === void 0) { dispose = true; }
            if (trigger === void 0) { trigger = true; }
            this._fileMatches.delete(fileMatch.resource());
            if (dispose) {
                fileMatch.dispose();
            }
            else {
                this._unDisposedFileMatches.set(fileMatch.resource(), fileMatch);
            }
            if (trigger) {
                this._onChange.fire({ elements: [fileMatch], removed: true });
            }
        };
        FolderMatch.prototype.disposeMatches = function () {
            this._fileMatches.values().forEach(function (fileMatch) { return fileMatch.dispose(); });
            this._unDisposedFileMatches.values().forEach(function (fileMatch) { return fileMatch.dispose(); });
            this._fileMatches.clear();
            this._unDisposedFileMatches.clear();
        };
        FolderMatch.prototype.dispose = function () {
            this.disposeMatches();
            this._onDispose.fire();
            _super.prototype.dispose.call(this);
        };
        FolderMatch = __decorate([
            __param(6, replace_2.IReplaceService),
            __param(7, instantiation_1.IInstantiationService)
        ], FolderMatch);
        return FolderMatch;
    }(lifecycle_1.Disposable));
    exports.FolderMatch = FolderMatch;
    var SearchResult = /** @class */ (function (_super) {
        __extends(SearchResult, _super);
        function SearchResult(_searchModel, replaceService, telemetryService, instantiationService) {
            var _this = _super.call(this) || this;
            _this._searchModel = _searchModel;
            _this.replaceService = replaceService;
            _this.telemetryService = telemetryService;
            _this.instantiationService = instantiationService;
            _this._onChange = _this._register(new event_1.Emitter());
            _this.onChange = _this._onChange.event;
            _this._folderMatches = [];
            _this._folderMatchesMap = map_1.TernarySearchTree.forPaths();
            _this._rangeHighlightDecorations = _this.instantiationService.createInstance(RangeHighlightDecorations);
            return _this;
        }
        Object.defineProperty(SearchResult.prototype, "query", {
            set: function (query) {
                var _this = this;
                // When updating the query we could change the roots, so ensure we clean up the old roots first.
                this.clear();
                var otherFiles = uri_1.default.parse('');
                this._folderMatches = (query.folderQueries || []).map(function (fq) { return fq.folder; }).concat([otherFiles]).map(function (resource, index) {
                    var id = resource.toString() || 'otherFiles';
                    var folderMatch = _this.instantiationService.createInstance(FolderMatch, resource, id, index, query, _this, _this._searchModel);
                    var disposable = folderMatch.onChange(function (event) { return _this._onChange.fire(event); });
                    folderMatch.onDispose(function () { return disposable.dispose(); });
                    return folderMatch;
                });
                // otherFiles is the fallback for missing values in the TrieMap. So we do not insert it.
                this._folderMatches.slice(0, this.folderMatches.length - 1)
                    .forEach(function (fm) { return _this._folderMatchesMap.set(fm.resource().fsPath, fm); });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchResult.prototype, "searchModel", {
            get: function () {
                return this._searchModel;
            },
            enumerable: true,
            configurable: true
        });
        SearchResult.prototype.add = function (allRaw, silent) {
            var _this = this;
            if (silent === void 0) { silent = false; }
            // Split up raw into a list per folder so we can do a batch add per folder.
            var rawPerFolder = new map_1.ResourceMap();
            this._folderMatches.forEach(function (folderMatch) { return rawPerFolder.set(folderMatch.resource(), []); });
            allRaw.forEach(function (rawFileMatch) {
                var folderMatch = _this.getFolderMatch(rawFileMatch.resource);
                if (folderMatch) {
                    rawPerFolder.get(folderMatch.resource()).push(rawFileMatch);
                }
            });
            rawPerFolder.forEach(function (raw) {
                if (!raw.length) {
                    return;
                }
                var folderMatch = _this.getFolderMatch(raw[0].resource);
                if (folderMatch) {
                    folderMatch.add(raw, silent);
                }
            });
        };
        SearchResult.prototype.clear = function () {
            this._folderMatches.forEach(function (folderMatch) { return folderMatch.clear(); });
            this.disposeMatches();
        };
        SearchResult.prototype.remove = function (match) {
            if (match instanceof FileMatch) {
                this.getFolderMatch(match.resource()).remove(match);
            }
            else {
                match.clear();
            }
        };
        SearchResult.prototype.replace = function (match) {
            return this.getFolderMatch(match.resource()).replace(match);
        };
        SearchResult.prototype.replaceAll = function (progressRunner) {
            var _this = this;
            this.replacingAll = true;
            var promise = this.replaceService.replace(this.matches(), progressRunner);
            var onDone = event_1.stopwatch(event_1.fromPromise(promise));
            /* __GDPR__
                "replaceAll.started" : {
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                }
            */
            onDone(function (duration) { return _this.telemetryService.publicLog('replaceAll.started', { duration: duration }); });
            return promise.then(function () {
                _this.replacingAll = false;
                _this.clear();
            }, function () {
                _this.replacingAll = false;
            });
        };
        SearchResult.prototype.folderMatches = function () {
            return this._folderMatches.concat();
        };
        SearchResult.prototype.matches = function () {
            var matches = [];
            this._folderMatches.forEach(function (folderMatch) {
                matches.push(folderMatch.matches());
            });
            return [].concat.apply([], matches);
        };
        SearchResult.prototype.isEmpty = function () {
            return this._folderMatches.every(function (folderMatch) { return folderMatch.isEmpty(); });
        };
        SearchResult.prototype.fileCount = function () {
            return this.folderMatches().reduce(function (prev, match) { return prev + match.fileCount(); }, 0);
        };
        SearchResult.prototype.count = function () {
            return this.matches().reduce(function (prev, match) { return prev + match.count(); }, 0);
        };
        Object.defineProperty(SearchResult.prototype, "showHighlights", {
            get: function () {
                return this._showHighlights;
            },
            enumerable: true,
            configurable: true
        });
        SearchResult.prototype.toggleHighlights = function (value) {
            if (this._showHighlights === value) {
                return;
            }
            this._showHighlights = value;
            var selectedMatch = null;
            this.matches().forEach(function (fileMatch) {
                fileMatch.updateHighlights();
                if (!selectedMatch) {
                    selectedMatch = fileMatch.getSelectedMatch();
                }
            });
            if (this._showHighlights && selectedMatch) {
                this._rangeHighlightDecorations.highlightRange(selectedMatch.parent().resource(), selectedMatch.range());
            }
            else {
                this._rangeHighlightDecorations.removeHighlightRange();
            }
        };
        Object.defineProperty(SearchResult.prototype, "rangeHighlightDecorations", {
            get: function () {
                return this._rangeHighlightDecorations;
            },
            enumerable: true,
            configurable: true
        });
        SearchResult.prototype.getFolderMatch = function (resource) {
            var folderMatch = this._folderMatchesMap.findSubstr(resource.fsPath);
            return folderMatch ? folderMatch : this.otherFiles;
        };
        Object.defineProperty(SearchResult.prototype, "otherFiles", {
            get: function () {
                return this._folderMatches[this._folderMatches.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchResult.prototype, "replacingAll", {
            set: function (running) {
                this._folderMatches.forEach(function (folderMatch) {
                    folderMatch.replacingAll = running;
                });
            },
            enumerable: true,
            configurable: true
        });
        SearchResult.prototype.disposeMatches = function () {
            this._folderMatches.forEach(function (folderMatch) { return folderMatch.dispose(); });
            this._folderMatches = [];
            this._folderMatchesMap = map_1.TernarySearchTree.forPaths();
            this._rangeHighlightDecorations.removeHighlightRange();
        };
        SearchResult.prototype.dispose = function () {
            this.disposeMatches();
            this._rangeHighlightDecorations.dispose();
            _super.prototype.dispose.call(this);
        };
        SearchResult = __decorate([
            __param(1, replace_2.IReplaceService), __param(2, telemetry_1.ITelemetryService),
            __param(3, instantiation_1.IInstantiationService)
        ], SearchResult);
        return SearchResult;
    }(lifecycle_1.Disposable));
    exports.SearchResult = SearchResult;
    var SearchModel = /** @class */ (function (_super) {
        __extends(SearchModel, _super);
        function SearchModel(searchService, telemetryService, instantiationService) {
            var _this = _super.call(this) || this;
            _this.searchService = searchService;
            _this.telemetryService = telemetryService;
            _this.instantiationService = instantiationService;
            _this._searchQuery = null;
            _this._replaceActive = false;
            _this._replaceString = null;
            _this._replacePattern = null;
            _this._onReplaceTermChanged = _this._register(new event_1.Emitter());
            _this.onReplaceTermChanged = _this._onReplaceTermChanged.event;
            _this._searchResult = _this.instantiationService.createInstance(SearchResult, _this);
            return _this;
        }
        SearchModel.prototype.isReplaceActive = function () {
            return this._replaceActive;
        };
        Object.defineProperty(SearchModel.prototype, "replaceActive", {
            set: function (replaceActive) {
                this._replaceActive = replaceActive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchModel.prototype, "replacePattern", {
            get: function () {
                return this._replacePattern;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchModel.prototype, "replaceString", {
            get: function () {
                return this._replaceString;
            },
            set: function (replaceString) {
                this._replaceString = replaceString;
                if (this._searchQuery) {
                    this._replacePattern = new replace_1.ReplacePattern(replaceString, this._searchQuery.contentPattern);
                }
                this._onReplaceTermChanged.fire();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SearchModel.prototype, "searchResult", {
            get: function () {
                return this._searchResult;
            },
            enumerable: true,
            configurable: true
        });
        SearchModel.prototype.search = function (query) {
            var _this = this;
            this.cancelSearch();
            this._searchQuery = query;
            this.currentRequest = this.searchService.search(this._searchQuery);
            this.searchResult.clear();
            this._searchResult.query = this._searchQuery;
            this._replacePattern = new replace_1.ReplacePattern(this._replaceString, this._searchQuery.contentPattern);
            var onDone = event_1.fromPromise(this.currentRequest);
            var progressEmitter = new event_1.Emitter();
            var onFirstRender = event_1.anyEvent(onDone, progressEmitter.event);
            var onFirstRenderStopwatch = event_1.stopwatch(onFirstRender);
            /* __GDPR__
                "searchResultsFirstRender" : {
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                }
            */
            onFirstRenderStopwatch(function (duration) { return _this.telemetryService.publicLog('searchResultsFirstRender', { duration: duration }); });
            var onDoneStopwatch = event_1.stopwatch(onDone);
            var start = Date.now();
            /* __GDPR__
                "searchResultsFinished" : {
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                }
            */
            onDoneStopwatch(function (duration) { return _this.telemetryService.publicLog('searchResultsFinished', { duration: duration }); });
            var currentRequest = this.currentRequest;
            this.currentRequest.then(function (value) { return _this.onSearchCompleted(value, Date.now() - start); }, function (e) { return _this.onSearchError(e, Date.now() - start); }, function (p) {
                progressEmitter.fire();
                _this.onSearchProgress(p);
            });
            // this.currentRequest may be completed (and nulled) immediately
            return currentRequest;
        };
        SearchModel.prototype.onSearchCompleted = function (completed, duration) {
            this.currentRequest = null;
            if (completed) {
                this._searchResult.add(completed.results, false);
            }
            var options = objects.assign({}, this._searchQuery.contentPattern);
            delete options.pattern;
            /* __GDPR__
                "searchResultsShown" : {
                    "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "fileCount": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "options": { "${inline}": [ "${IPatternInfo}" ] },
                    "duration": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" },
                    "useRipgrep": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('searchResultsShown', {
                count: this._searchResult.count(),
                fileCount: this._searchResult.fileCount(),
                options: options,
                duration: duration,
                useRipgrep: this._searchQuery.useRipgrep
            });
            return completed;
        };
        SearchModel.prototype.onSearchError = function (e, duration) {
            if (errors.isPromiseCanceledError(e)) {
                this.onSearchCompleted(null, duration);
            }
        };
        SearchModel.prototype.onSearchProgress = function (p) {
            if (p.resource) {
                this._searchResult.add([p], true);
            }
        };
        SearchModel.prototype.cancelSearch = function () {
            if (this.currentRequest) {
                this.currentRequest.cancel();
                this.currentRequest = null;
                return true;
            }
            return false;
        };
        SearchModel.prototype.dispose = function () {
            this.cancelSearch();
            this.searchResult.dispose();
            _super.prototype.dispose.call(this);
        };
        SearchModel = __decorate([
            __param(0, search_1.ISearchService), __param(1, telemetry_1.ITelemetryService), __param(2, instantiation_1.IInstantiationService)
        ], SearchModel);
        return SearchModel;
    }(lifecycle_1.Disposable));
    exports.SearchModel = SearchModel;
    var SearchWorkbenchService = /** @class */ (function () {
        function SearchWorkbenchService(instantiationService) {
            this.instantiationService = instantiationService;
        }
        Object.defineProperty(SearchWorkbenchService.prototype, "searchModel", {
            get: function () {
                if (!this._searchModel) {
                    this._searchModel = this.instantiationService.createInstance(SearchModel);
                }
                return this._searchModel;
            },
            enumerable: true,
            configurable: true
        });
        SearchWorkbenchService = __decorate([
            __param(0, instantiation_1.IInstantiationService)
        ], SearchWorkbenchService);
        return SearchWorkbenchService;
    }());
    exports.SearchWorkbenchService = SearchWorkbenchService;
    exports.ISearchWorkbenchService = instantiation_1.createDecorator('searchWorkbenchService');
    /**
     * Can add a range highlight decoration to a model.
     * It will automatically remove it when the model has its decorations changed.
     */
    var RangeHighlightDecorations = /** @class */ (function () {
        function RangeHighlightDecorations(_modelService) {
            this._modelService = _modelService;
            this._decorationId = null;
            this._model = null;
            this._modelDisposables = [];
        }
        RangeHighlightDecorations.prototype.removeHighlightRange = function () {
            if (this._model && this._decorationId) {
                this._model.deltaDecorations([this._decorationId], []);
            }
            this._decorationId = null;
        };
        RangeHighlightDecorations.prototype.highlightRange = function (resource, range, ownerId) {
            if (ownerId === void 0) { ownerId = 0; }
            var model;
            if (uri_1.default.isUri(resource)) {
                model = this._modelService.getModel(resource);
            }
            else {
                model = resource;
            }
            if (model) {
                this.doHighlightRange(model, range);
            }
        };
        RangeHighlightDecorations.prototype.doHighlightRange = function (model, range) {
            this.removeHighlightRange();
            this._decorationId = model.deltaDecorations([], [{ range: range, options: RangeHighlightDecorations._RANGE_HIGHLIGHT_DECORATION }])[0];
            this.setModel(model);
        };
        RangeHighlightDecorations.prototype.setModel = function (model) {
            var _this = this;
            if (this._model !== model) {
                this.disposeModelListeners();
                this._model = model;
                this._modelDisposables.push(this._model.onDidChangeDecorations(function (e) {
                    _this.disposeModelListeners();
                    _this.removeHighlightRange();
                    _this._model = null;
                }));
                this._modelDisposables.push(this._model.onWillDispose(function () {
                    _this.disposeModelListeners();
                    _this.removeHighlightRange();
                    _this._model = null;
                }));
            }
        };
        RangeHighlightDecorations.prototype.disposeModelListeners = function () {
            this._modelDisposables.forEach(function (disposable) { return disposable.dispose(); });
            this._modelDisposables = [];
        };
        RangeHighlightDecorations.prototype.dispose = function () {
            if (this._model) {
                this.removeHighlightRange();
                this.disposeModelListeners();
                this._model = null;
            }
        };
        RangeHighlightDecorations._RANGE_HIGHLIGHT_DECORATION = textModel_1.ModelDecorationOptions.register({
            stickiness: model_1.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: 'rangeHighlight',
            isWholeLine: true
        });
        RangeHighlightDecorations = __decorate([
            __param(0, modelService_1.IModelService)
        ], RangeHighlightDecorations);
        return RangeHighlightDecorations;
    }());
    exports.RangeHighlightDecorations = RangeHighlightDecorations;
});
