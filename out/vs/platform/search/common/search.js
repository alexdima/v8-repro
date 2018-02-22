define(["require", "exports", "vs/base/common/objects", "vs/base/common/paths", "vs/base/common/glob", "vs/platform/instantiation/common/instantiation"], function (require, exports, objects, paths, glob, instantiation_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ID = 'searchService';
    exports.ISearchService = instantiation_1.createDecorator(exports.ID);
    var QueryType;
    (function (QueryType) {
        QueryType[QueryType["File"] = 1] = "File";
        QueryType[QueryType["Text"] = 2] = "Text";
    })(QueryType = exports.QueryType || (exports.QueryType = {}));
    // ---- very simple implementation of the search model --------------------
    var FileMatch = /** @class */ (function () {
        function FileMatch(resource) {
            this.resource = resource;
            this.lineMatches = [];
            // empty
        }
        return FileMatch;
    }());
    exports.FileMatch = FileMatch;
    var LineMatch = /** @class */ (function () {
        function LineMatch(preview, lineNumber, offsetAndLengths) {
            this.preview = preview;
            this.lineNumber = lineNumber;
            this.offsetAndLengths = offsetAndLengths;
            // empty
        }
        return LineMatch;
    }());
    exports.LineMatch = LineMatch;
    function getExcludes(configuration) {
        var fileExcludes = configuration && configuration.files && configuration.files.exclude;
        var searchExcludes = configuration && configuration.search && configuration.search.exclude;
        if (!fileExcludes && !searchExcludes) {
            return undefined;
        }
        if (!fileExcludes || !searchExcludes) {
            return fileExcludes || searchExcludes;
        }
        var allExcludes = Object.create(null);
        // clone the config as it could be frozen
        allExcludes = objects.mixin(allExcludes, objects.deepClone(fileExcludes));
        allExcludes = objects.mixin(allExcludes, objects.deepClone(searchExcludes), true);
        return allExcludes;
    }
    exports.getExcludes = getExcludes;
    function pathIncludedInQuery(query, fsPath) {
        if (query.excludePattern && glob.match(query.excludePattern, fsPath)) {
            return false;
        }
        if (query.includePattern && !glob.match(query.includePattern, fsPath)) {
            return false;
        }
        // If searchPaths are being used, the extra file must be in a subfolder and match the pattern, if present
        if (query.usingSearchPaths) {
            return query.folderQueries.every(function (fq) {
                var searchPath = fq.folder.fsPath;
                if (paths.isEqualOrParent(fsPath, searchPath)) {
                    return !fq.includePattern || !!glob.match(fq.includePattern, fsPath);
                }
                else {
                    return false;
                }
            });
        }
        return true;
    }
    exports.pathIncludedInQuery = pathIncludedInQuery;
});
