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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/platform/markers/common/problemMatcher", "vs/platform/markers/common/markers"], function (require, exports, uri_1, event_1, problemMatcher_1, markers_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProblemCollectorEventKind;
    (function (ProblemCollectorEventKind) {
        ProblemCollectorEventKind["BackgroundProcessingBegins"] = "backgroundProcessingBegins";
        ProblemCollectorEventKind["BackgroundProcessingEnds"] = "backgroundProcessingEnds";
    })(ProblemCollectorEventKind = exports.ProblemCollectorEventKind || (exports.ProblemCollectorEventKind = {}));
    var ProblemCollectorEvent;
    (function (ProblemCollectorEvent) {
        function create(kind) {
            return Object.freeze({ kind: kind });
        }
        ProblemCollectorEvent.create = create;
    })(ProblemCollectorEvent || (ProblemCollectorEvent = {}));
    var AbstractProblemCollector = /** @class */ (function () {
        function AbstractProblemCollector(problemMatchers, markerService, modelService) {
            var _this = this;
            this.markerService = markerService;
            this.modelService = modelService;
            this.matchers = Object.create(null);
            this.bufferLength = 1;
            problemMatchers.map(function (elem) { return problemMatcher_1.createLineMatcher(elem); }).forEach(function (matcher) {
                var length = matcher.matchLength;
                if (length > _this.bufferLength) {
                    _this.bufferLength = length;
                }
                var value = _this.matchers[length];
                if (!value) {
                    value = [];
                    _this.matchers[length] = value;
                }
                value.push(matcher);
            });
            this.buffer = [];
            this.activeMatcher = null;
            this._numberOfMatches = 0;
            this.openModels = Object.create(null);
            this.modelListeners = [];
            this.applyToByOwner = new Map();
            for (var _i = 0, problemMatchers_1 = problemMatchers; _i < problemMatchers_1.length; _i++) {
                var problemMatcher = problemMatchers_1[_i];
                var current = this.applyToByOwner.get(problemMatcher.owner);
                if (current === void 0) {
                    this.applyToByOwner.set(problemMatcher.owner, problemMatcher.applyTo);
                }
                else {
                    this.applyToByOwner.set(problemMatcher.owner, this.mergeApplyTo(current, problemMatcher.applyTo));
                }
            }
            this.resourcesToClean = new Map();
            this.markers = new Map();
            this.deliveredMarkers = new Map();
            this.modelService.onModelAdded(function (model) {
                _this.openModels[model.uri.toString()] = true;
            }, this, this.modelListeners);
            this.modelService.onModelRemoved(function (model) {
                delete _this.openModels[model.uri.toString()];
            }, this, this.modelListeners);
            this.modelService.getModels().forEach(function (model) { return _this.openModels[model.uri.toString()] = true; });
            this._onDidStateChange = new event_1.Emitter();
        }
        Object.defineProperty(AbstractProblemCollector.prototype, "onDidStateChange", {
            get: function () {
                return this._onDidStateChange.event;
            },
            enumerable: true,
            configurable: true
        });
        AbstractProblemCollector.prototype.dispose = function () {
            this.modelListeners.forEach(function (disposable) { return disposable.dispose(); });
        };
        Object.defineProperty(AbstractProblemCollector.prototype, "numberOfMatches", {
            get: function () {
                return this._numberOfMatches;
            },
            enumerable: true,
            configurable: true
        });
        AbstractProblemCollector.prototype.tryFindMarker = function (line) {
            var result = null;
            if (this.activeMatcher) {
                result = this.activeMatcher.next(line);
                if (result) {
                    this._numberOfMatches++;
                    return result;
                }
                this.clearBuffer();
                this.activeMatcher = null;
            }
            if (this.buffer.length < this.bufferLength) {
                this.buffer.push(line);
            }
            else {
                var end = this.buffer.length - 1;
                for (var i = 0; i < end; i++) {
                    this.buffer[i] = this.buffer[i + 1];
                }
                this.buffer[end] = line;
            }
            result = this.tryMatchers();
            if (result) {
                this.clearBuffer();
            }
            return result;
        };
        AbstractProblemCollector.prototype.shouldApplyMatch = function (result) {
            switch (result.description.applyTo) {
                case problemMatcher_1.ApplyToKind.allDocuments:
                    return true;
                case problemMatcher_1.ApplyToKind.openDocuments:
                    return !!this.openModels[result.resource.toString()];
                case problemMatcher_1.ApplyToKind.closedDocuments:
                    return !this.openModels[result.resource.toString()];
                default:
                    return true;
            }
        };
        AbstractProblemCollector.prototype.mergeApplyTo = function (current, value) {
            if (current === value || current === problemMatcher_1.ApplyToKind.allDocuments) {
                return current;
            }
            return problemMatcher_1.ApplyToKind.allDocuments;
        };
        AbstractProblemCollector.prototype.tryMatchers = function () {
            this.activeMatcher = null;
            var length = this.buffer.length;
            for (var startIndex = 0; startIndex < length; startIndex++) {
                var candidates = this.matchers[length - startIndex];
                if (!candidates) {
                    continue;
                }
                for (var i = 0; i < candidates.length; i++) {
                    var matcher = candidates[i];
                    var result = matcher.handle(this.buffer, startIndex);
                    if (result.match) {
                        this._numberOfMatches++;
                        if (result.continue) {
                            this.activeMatcher = matcher;
                        }
                        return result.match;
                    }
                }
            }
            return null;
        };
        AbstractProblemCollector.prototype.clearBuffer = function () {
            if (this.buffer.length > 0) {
                this.buffer = [];
            }
        };
        AbstractProblemCollector.prototype.recordResourcesToClean = function (owner) {
            var resourceSetToClean = this.getResourceSetToClean(owner);
            this.markerService.read({ owner: owner }).forEach(function (marker) { return resourceSetToClean.set(marker.resource.toString(), marker.resource); });
        };
        AbstractProblemCollector.prototype.recordResourceToClean = function (owner, resource) {
            this.getResourceSetToClean(owner).set(resource.toString(), resource);
        };
        AbstractProblemCollector.prototype.removeResourceToClean = function (owner, resource) {
            var resourceSet = this.resourcesToClean.get(owner);
            if (resourceSet) {
                resourceSet.delete(resource);
            }
        };
        AbstractProblemCollector.prototype.getResourceSetToClean = function (owner) {
            var result = this.resourcesToClean.get(owner);
            if (!result) {
                result = new Map();
                this.resourcesToClean.set(owner, result);
            }
            return result;
        };
        AbstractProblemCollector.prototype.cleanAllMarkers = function () {
            var _this = this;
            this.resourcesToClean.forEach(function (value, owner) {
                _this._cleanMarkers(owner, value);
            });
            this.resourcesToClean = new Map();
        };
        AbstractProblemCollector.prototype.cleanMarkers = function (owner) {
            var toClean = this.resourcesToClean.get(owner);
            if (toClean) {
                this._cleanMarkers(owner, toClean);
                this.resourcesToClean.delete(owner);
            }
        };
        AbstractProblemCollector.prototype._cleanMarkers = function (owner, toClean) {
            var _this = this;
            var uris = [];
            var applyTo = this.applyToByOwner.get(owner);
            toClean.forEach(function (uri, uriAsString) {
                if (applyTo === problemMatcher_1.ApplyToKind.allDocuments ||
                    (applyTo === problemMatcher_1.ApplyToKind.openDocuments && _this.openModels[uriAsString]) ||
                    (applyTo === problemMatcher_1.ApplyToKind.closedDocuments && !_this.openModels[uriAsString])) {
                    uris.push(uri);
                }
            });
            this.markerService.remove(owner, uris);
        };
        AbstractProblemCollector.prototype.recordMarker = function (marker, owner, resourceAsString) {
            var markersPerOwner = this.markers.get(owner);
            if (!markersPerOwner) {
                markersPerOwner = new Map();
                this.markers.set(owner, markersPerOwner);
            }
            var markersPerResource = markersPerOwner.get(resourceAsString);
            if (!markersPerResource) {
                markersPerResource = new Map();
                markersPerOwner.set(resourceAsString, markersPerResource);
            }
            var key = markers_1.IMarkerData.makeKey(marker);
            if (!markersPerResource.has(key)) {
                markersPerResource.set(key, marker);
            }
        };
        AbstractProblemCollector.prototype.reportMarkers = function () {
            var _this = this;
            this.markers.forEach(function (markersPerOwner, owner) {
                var develieredMarkersPerOwner = _this.getDeliveredMarkersPerOwner(owner);
                markersPerOwner.forEach(function (markers, resource) {
                    _this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markers, develieredMarkersPerOwner);
                });
            });
        };
        AbstractProblemCollector.prototype.deliverMarkersPerOwnerAndResource = function (owner, resource) {
            var markersPerOwner = this.markers.get(owner);
            if (!markersPerOwner) {
                return;
            }
            var deliveredMarkersPerOwner = this.getDeliveredMarkersPerOwner(owner);
            var markersPerResource = markersPerOwner.get(resource);
            if (!markersPerResource) {
                return;
            }
            this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markersPerResource, deliveredMarkersPerOwner);
        };
        AbstractProblemCollector.prototype.deliverMarkersPerOwnerAndResourceResolved = function (owner, resource, markers, reported) {
            if (markers.size !== reported.get(resource)) {
                var toSet_1 = [];
                markers.forEach(function (value) { return toSet_1.push(value); });
                this.markerService.changeOne(owner, uri_1.default.parse(resource), toSet_1);
                reported.set(resource, markers.size);
            }
        };
        AbstractProblemCollector.prototype.getDeliveredMarkersPerOwner = function (owner) {
            var result = this.deliveredMarkers.get(owner);
            if (!result) {
                result = new Map();
                this.deliveredMarkers.set(owner, result);
            }
            return result;
        };
        AbstractProblemCollector.prototype.cleanMarkerCaches = function () {
            this.markers.clear();
            this.deliveredMarkers.clear();
        };
        AbstractProblemCollector.prototype.done = function () {
            this.reportMarkers();
            this.cleanAllMarkers();
        };
        return AbstractProblemCollector;
    }());
    exports.AbstractProblemCollector = AbstractProblemCollector;
    var ProblemHandlingStrategy;
    (function (ProblemHandlingStrategy) {
        ProblemHandlingStrategy[ProblemHandlingStrategy["Clean"] = 0] = "Clean";
    })(ProblemHandlingStrategy = exports.ProblemHandlingStrategy || (exports.ProblemHandlingStrategy = {}));
    var StartStopProblemCollector = /** @class */ (function (_super) {
        __extends(StartStopProblemCollector, _super);
        function StartStopProblemCollector(problemMatchers, markerService, modelService, _strategy) {
            if (_strategy === void 0) { _strategy = ProblemHandlingStrategy.Clean; }
            var _this = _super.call(this, problemMatchers, markerService, modelService) || this;
            var ownerSet = Object.create(null);
            problemMatchers.forEach(function (description) { return ownerSet[description.owner] = true; });
            _this.owners = Object.keys(ownerSet);
            _this.owners.forEach(function (owner) {
                _this.recordResourcesToClean(owner);
            });
            return _this;
        }
        StartStopProblemCollector.prototype.processLine = function (line) {
            var markerMatch = this.tryFindMarker(line);
            if (!markerMatch) {
                return;
            }
            var owner = markerMatch.description.owner;
            var resource = markerMatch.resource;
            var resourceAsString = resource.toString();
            this.removeResourceToClean(owner, resourceAsString);
            var shouldApplyMatch = this.shouldApplyMatch(markerMatch);
            if (shouldApplyMatch) {
                this.recordMarker(markerMatch.marker, owner, resourceAsString);
                if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
                    if (this.currentOwner && this.currentResource) {
                        this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
                    }
                    this.currentOwner = owner;
                    this.currentResource = resourceAsString;
                }
            }
        };
        return StartStopProblemCollector;
    }(AbstractProblemCollector));
    exports.StartStopProblemCollector = StartStopProblemCollector;
    var WatchingProblemCollector = /** @class */ (function (_super) {
        __extends(WatchingProblemCollector, _super);
        function WatchingProblemCollector(problemMatchers, markerService, modelService) {
            var _this = _super.call(this, problemMatchers, markerService, modelService) || this;
            _this.problemMatchers = problemMatchers;
            _this.resetCurrentResource();
            _this.watchingBeginsPatterns = [];
            _this.watchingEndsPatterns = [];
            _this.problemMatchers.forEach(function (matcher) {
                if (matcher.watching) {
                    _this.watchingBeginsPatterns.push({ problemMatcher: matcher, pattern: matcher.watching.beginsPattern });
                    _this.watchingEndsPatterns.push({ problemMatcher: matcher, pattern: matcher.watching.endsPattern });
                }
            });
            return _this;
        }
        WatchingProblemCollector.prototype.aboutToStart = function () {
            var _this = this;
            this.problemMatchers.forEach(function (matcher) {
                if (matcher.watching && matcher.watching.activeOnStart) {
                    _this._onDidStateChange.fire(ProblemCollectorEvent.create(ProblemCollectorEventKind.BackgroundProcessingBegins));
                    _this.recordResourcesToClean(matcher.owner);
                }
            });
        };
        WatchingProblemCollector.prototype.processLine = function (line) {
            if (this.tryBegin(line) || this.tryFinish(line)) {
                return;
            }
            var markerMatch = this.tryFindMarker(line);
            if (!markerMatch) {
                return;
            }
            var resource = markerMatch.resource;
            var owner = markerMatch.description.owner;
            var resourceAsString = resource.toString();
            this.removeResourceToClean(owner, resourceAsString);
            var shouldApplyMatch = this.shouldApplyMatch(markerMatch);
            if (shouldApplyMatch) {
                this.recordMarker(markerMatch.marker, owner, resourceAsString);
                if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
                    this.reportMarkersForCurrentResource();
                    this.currentOwner = owner;
                    this.currentResource = resourceAsString;
                }
            }
        };
        WatchingProblemCollector.prototype.forceDelivery = function () {
            this.reportMarkersForCurrentResource();
        };
        WatchingProblemCollector.prototype.tryBegin = function (line) {
            var result = false;
            for (var i = 0; i < this.watchingBeginsPatterns.length; i++) {
                var beginMatcher = this.watchingBeginsPatterns[i];
                var matches = beginMatcher.pattern.regexp.exec(line);
                if (matches) {
                    result = true;
                    this._onDidStateChange.fire(ProblemCollectorEvent.create(ProblemCollectorEventKind.BackgroundProcessingBegins));
                    this.cleanMarkerCaches();
                    this.resetCurrentResource();
                    var owner = beginMatcher.problemMatcher.owner;
                    var file = matches[beginMatcher.pattern.file];
                    if (file) {
                        var resource = problemMatcher_1.getResource(file, beginMatcher.problemMatcher);
                        this.recordResourceToClean(owner, resource);
                    }
                    else {
                        this.recordResourcesToClean(owner);
                    }
                }
            }
            return result;
        };
        WatchingProblemCollector.prototype.tryFinish = function (line) {
            var result = false;
            for (var i = 0; i < this.watchingEndsPatterns.length; i++) {
                var endMatcher = this.watchingEndsPatterns[i];
                var matches = endMatcher.pattern.regexp.exec(line);
                if (matches) {
                    this._onDidStateChange.fire(ProblemCollectorEvent.create(ProblemCollectorEventKind.BackgroundProcessingEnds));
                    result = true;
                    var owner = endMatcher.problemMatcher.owner;
                    this.resetCurrentResource();
                    this.cleanMarkers(owner);
                    this.cleanMarkerCaches();
                }
            }
            return result;
        };
        WatchingProblemCollector.prototype.resetCurrentResource = function () {
            this.reportMarkersForCurrentResource();
            this.currentOwner = null;
            this.currentResource = null;
        };
        WatchingProblemCollector.prototype.reportMarkersForCurrentResource = function () {
            if (this.currentOwner && this.currentResource) {
                this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
            }
        };
        return WatchingProblemCollector;
    }(AbstractProblemCollector));
    exports.WatchingProblemCollector = WatchingProblemCollector;
});
