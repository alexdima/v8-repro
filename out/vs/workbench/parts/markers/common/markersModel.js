define(["require", "exports", "vs/base/common/paths", "vs/base/common/types", "vs/base/common/severity", "vs/base/common/uri", "vs/editor/common/core/range", "vs/base/common/filters", "vs/workbench/parts/markers/common/messages", "vs/base/common/network"], function (require, exports, paths, types, severity_1, uri_1, range_1, filters_1, messages_1, network_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var Resource = /** @class */ (function () {
        function Resource(uri, markers, statistics, matches) {
            if (matches === void 0) { matches = []; }
            this.uri = uri;
            this.markers = markers;
            this.statistics = statistics;
            this.matches = matches;
            this._name = null;
            this._path = null;
        }
        Object.defineProperty(Resource.prototype, "path", {
            get: function () {
                if (this._path === null) {
                    this._path = this.uri.fsPath;
                }
                return this._path;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Resource.prototype, "name", {
            get: function () {
                if (this._name === null) {
                    this._name = paths.basename(this.uri.fsPath);
                }
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        return Resource;
    }());
    exports.Resource = Resource;
    var Marker = /** @class */ (function () {
        function Marker(id, marker, labelMatches, sourceMatches) {
            if (labelMatches === void 0) { labelMatches = []; }
            if (sourceMatches === void 0) { sourceMatches = []; }
            this.id = id;
            this.marker = marker;
            this.labelMatches = labelMatches;
            this.sourceMatches = sourceMatches;
        }
        Object.defineProperty(Marker.prototype, "resource", {
            get: function () {
                return this.marker.resource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Marker.prototype, "range", {
            get: function () {
                return this.marker;
            },
            enumerable: true,
            configurable: true
        });
        Marker.prototype.toString = function () {
            return [
                "file: '" + this.marker.resource + "'",
                "severity: '" + severity_1.default.toString(this.marker.severity) + "'",
                "message: '" + this.marker.message + "'",
                "at: '" + this.marker.startLineNumber + "," + this.marker.startColumn + "'",
                "source: '" + (this.marker.source ? this.marker.source : '') + "'",
                "code: '" + (this.marker.code ? this.marker.code : '') + "'"
            ].join('\n');
        };
        return Marker;
    }());
    exports.Marker = Marker;
    var FilterOptions = /** @class */ (function () {
        function FilterOptions(filter) {
            if (filter === void 0) { filter = ''; }
            this._filterErrors = false;
            this._filterWarnings = false;
            this._filterInfos = false;
            this._filter = '';
            this._completeFilter = '';
            if (filter) {
                this.parse(filter);
            }
        }
        Object.defineProperty(FilterOptions.prototype, "filterErrors", {
            get: function () {
                return this._filterErrors;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilterOptions.prototype, "filterWarnings", {
            get: function () {
                return this._filterWarnings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilterOptions.prototype, "filterInfos", {
            get: function () {
                return this._filterInfos;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilterOptions.prototype, "filter", {
            get: function () {
                return this._filter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FilterOptions.prototype, "completeFilter", {
            get: function () {
                return this._completeFilter;
            },
            enumerable: true,
            configurable: true
        });
        FilterOptions.prototype.hasFilters = function () {
            return !!this._filter;
        };
        FilterOptions.prototype.parse = function (filter) {
            this._completeFilter = filter;
            this._filter = filter.trim();
            this._filterErrors = this.matches(this._filter, messages_1.default.MARKERS_PANEL_FILTER_ERRORS);
            this._filterWarnings = this.matches(this._filter, messages_1.default.MARKERS_PANEL_FILTER_WARNINGS);
            this._filterInfos = this.matches(this._filter, messages_1.default.MARKERS_PANEL_FILTER_INFOS);
        };
        FilterOptions.prototype.matches = function (prefix, word) {
            var result = filters_1.matchesPrefix(prefix, word);
            return result && result.length > 0;
        };
        FilterOptions._filter = filters_1.or(filters_1.matchesPrefix, filters_1.matchesContiguousSubString);
        FilterOptions._fuzzyFilter = filters_1.or(filters_1.matchesPrefix, filters_1.matchesContiguousSubString, filters_1.matchesFuzzy);
        return FilterOptions;
    }());
    exports.FilterOptions = FilterOptions;
    var MarkersModel = /** @class */ (function () {
        function MarkersModel(markers) {
            if (markers === void 0) { markers = []; }
            this.markersByResource = new Map();
            this._filterOptions = new FilterOptions();
            this.update(markers);
        }
        Object.defineProperty(MarkersModel.prototype, "filterOptions", {
            get: function () {
                return this._filterOptions;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MarkersModel.prototype, "filteredResources", {
            get: function () {
                return this._filteredResources;
            },
            enumerable: true,
            configurable: true
        });
        MarkersModel.prototype.hasFilteredResources = function () {
            return this.filteredResources.length > 0;
        };
        MarkersModel.prototype.hasResources = function () {
            return this.markersByResource.size > 0;
        };
        MarkersModel.prototype.hasResource = function (resource) {
            return this.markersByResource.has(resource.toString());
        };
        MarkersModel.prototype.total = function () {
            var total = 0;
            this.markersByResource.forEach(function (markers) { return total = total + markers.length; });
            return total;
        };
        MarkersModel.prototype.count = function () {
            var count = 0;
            this.filteredResources.forEach(function (resource) { return count = count + resource.markers.length; });
            return count;
        };
        Object.defineProperty(MarkersModel.prototype, "nonFilteredResources", {
            get: function () {
                return this._nonFilteredResources;
            },
            enumerable: true,
            configurable: true
        });
        MarkersModel.prototype.getBulkUpdater = function () {
            var _this = this;
            return {
                add: function (resourceUri, markers) {
                    _this.updateResource(resourceUri, markers);
                },
                done: function () {
                    _this.refresh();
                }
            };
        };
        MarkersModel.prototype.update = function (arg1, arg2) {
            if (arg1 instanceof FilterOptions) {
                this._filterOptions = arg1;
            }
            if (arg1 instanceof uri_1.default) {
                this.updateResource(arg1, arg2);
            }
            if (types.isArray(arg1)) {
                this.updateMarkers(arg1);
            }
            this.refresh();
        };
        MarkersModel.prototype.refresh = function () {
            this.refreshResources();
        };
        MarkersModel.prototype.refreshResources = function () {
            var _this = this;
            this._nonFilteredResources = [];
            this._filteredResources = [];
            this.markersByResource.forEach(function (values, uri) {
                var filteredResource = _this.toFilteredResource(uri_1.default.parse(uri), values);
                if (filteredResource.markers.length) {
                    _this._filteredResources.push(filteredResource);
                }
                else {
                    _this._nonFilteredResources.push(filteredResource);
                }
            });
        };
        MarkersModel.prototype.updateResource = function (resourceUri, markers) {
            if (this.markersByResource.has(resourceUri.toString())) {
                this.markersByResource.delete(resourceUri.toString());
            }
            if (markers.length > 0) {
                this.markersByResource.set(resourceUri.toString(), markers);
            }
        };
        MarkersModel.prototype.updateMarkers = function (markers) {
            var _this = this;
            markers.forEach(function (marker) {
                var uri = marker.resource;
                var markers = _this.markersByResource.get(uri.toString());
                if (!markers) {
                    markers = [];
                    _this.markersByResource.set(uri.toString(), markers);
                }
                markers.push(marker);
            });
        };
        MarkersModel.prototype.toFilteredResource = function (uri, values) {
            var markers = [];
            for (var i = 0; i < values.length; i++) {
                var m = values[i];
                if (uri.scheme !== network_1.Schemas.walkThrough && uri.scheme !== network_1.Schemas.walkThroughSnippet && (!this._filterOptions.hasFilters() || this.filterMarker(m))) {
                    markers.push(this.toMarker(m, i, uri.toString()));
                }
            }
            var matches = this._filterOptions.hasFilters() ? FilterOptions._filter(this._filterOptions.filter, paths.basename(uri.fsPath)) : [];
            return new Resource(uri, markers, this.getStatistics(values), matches || []);
        };
        MarkersModel.prototype.toMarker = function (marker, index, uri) {
            var labelMatches = this._filterOptions.hasFilters() ? FilterOptions._fuzzyFilter(this._filterOptions.filter, marker.message) : [];
            var sourceMatches = marker.source && this._filterOptions.hasFilters() ? FilterOptions._filter(this._filterOptions.filter, marker.source) : [];
            return new Marker(uri + index, marker, labelMatches || [], sourceMatches || []);
        };
        MarkersModel.prototype.filterMarker = function (marker) {
            if (this._filterOptions.filterErrors && severity_1.default.Error === marker.severity) {
                return true;
            }
            if (this._filterOptions.filterWarnings && severity_1.default.Warning === marker.severity) {
                return true;
            }
            if (this._filterOptions.filterInfos && severity_1.default.Info === marker.severity) {
                return true;
            }
            if (!!FilterOptions._fuzzyFilter(this._filterOptions.filter, marker.message)) {
                return true;
            }
            if (!!FilterOptions._filter(this._filterOptions.filter, paths.basename(marker.resource.fsPath))) {
                return true;
            }
            if (!!marker.source && !!FilterOptions._filter(this._filterOptions.filter, marker.source)) {
                return true;
            }
            return false;
        };
        MarkersModel.prototype.getStatistics = function (markers) {
            var errors = 0, warnings = 0, infos = 0, unknowns = 0;
            for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
                var marker = markers_1[_i];
                switch (marker.severity) {
                    case severity_1.default.Error:
                        errors++;
                        break;
                    case severity_1.default.Warning:
                        warnings++;
                        break;
                    case severity_1.default.Info:
                        infos++;
                        break;
                    default:
                        unknowns++;
                        break;
                }
            }
            return { errors: errors, warnings: warnings, infos: infos, unknowns: unknowns };
        };
        MarkersModel.prototype.dispose = function () {
            this.markersByResource.clear();
            this._filteredResources = [];
            this._nonFilteredResources = [];
        };
        MarkersModel.prototype.getMessage = function () {
            if (this.hasFilteredResources()) {
                return '';
            }
            if (this.hasResources()) {
                if (this._filterOptions.hasFilters()) {
                    return messages_1.default.MARKERS_PANEL_NO_PROBLEMS_FILTERS;
                }
            }
            return messages_1.default.MARKERS_PANEL_NO_PROBLEMS_BUILT;
        };
        MarkersModel.compare = function (a, b) {
            if (a instanceof Resource && b instanceof Resource) {
                return MarkersModel.compareResources(a, b);
            }
            if (a instanceof Marker && b instanceof Marker) {
                return MarkersModel.compareMarkers(a, b);
            }
            return 0;
        };
        MarkersModel.compareResources = function (a, b) {
            if (a.statistics.errors === 0 && b.statistics.errors > 0) {
                return 1;
            }
            if (b.statistics.errors === 0 && a.statistics.errors > 0) {
                return -1;
            }
            return a.path.localeCompare(b.path) || a.name.localeCompare(b.name);
        };
        MarkersModel.compareMarkers = function (a, b) {
            if (a.marker.severity === b.marker.severity) {
                return range_1.Range.compareRangesUsingStarts(a.marker, b.marker);
            }
            return a.marker.severity > b.marker.severity ? -1 : 1;
        };
        return MarkersModel;
    }());
    exports.MarkersModel = MarkersModel;
});
