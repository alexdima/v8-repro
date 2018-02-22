define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/uri", "vs/base/common/paths", "vs/base/common/strings", "vs/base/common/arrays", "vs/editor/common/core/range"], function (require, exports, winjs_base_1, uri_1, paths, strings, arrays, range_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OutputLinkComputer = /** @class */ (function () {
        function OutputLinkComputer(ctx, createData) {
            this.ctx = ctx;
            this.patterns = new Map();
            this.computePatterns(createData);
        }
        OutputLinkComputer.prototype.computePatterns = function (createData) {
            var _this = this;
            // Produce patterns for each workspace root we are configured with
            // This means that we will be able to detect links for paths that
            // contain any of the workspace roots as segments.
            var workspaceFolders = createData.workspaceFolders.map(function (r) { return uri_1.default.parse(r); });
            workspaceFolders.forEach(function (workspaceFolder) {
                var patterns = OutputLinkComputer.createPatterns(workspaceFolder);
                _this.patterns.set(workspaceFolder.fsPath, patterns);
            });
        };
        OutputLinkComputer.prototype.getModel = function (uri) {
            var models = this.ctx.getMirrorModels();
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                if (model.uri.toString() === uri) {
                    return model;
                }
            }
            return null;
        };
        OutputLinkComputer.prototype.computeLinks = function (uri) {
            var model = this.getModel(uri);
            if (!model) {
                return void 0;
            }
            var links = [];
            var lines = model.getValue().split(/\r\n|\r|\n/);
            // For each workspace root patterns
            this.patterns.forEach(function (folderPatterns, folderPath) {
                var resourceCreator = {
                    toResource: function (folderRelativePath) {
                        if (typeof folderRelativePath === 'string') {
                            return uri_1.default.file(paths.join(folderPath, folderRelativePath));
                        }
                        return null;
                    }
                };
                for (var i = 0, len = lines.length; i < len; i++) {
                    links.push.apply(links, OutputLinkComputer.detectLinks(lines[i], i + 1, folderPatterns, resourceCreator));
                }
            });
            return winjs_base_1.TPromise.as(links);
        };
        OutputLinkComputer.createPatterns = function (workspaceFolder) {
            var patterns = [];
            var workspaceFolderVariants = arrays.distinct([
                paths.normalize(workspaceFolder.fsPath, true),
                paths.normalize(workspaceFolder.fsPath, false)
            ]);
            workspaceFolderVariants.forEach(function (workspaceFolderVariant) {
                // Example: /workspaces/express/server.js on line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + '(\\S*) on line ((\\d+)(, column (\\d+))?)', 'gi'));
                // Example: /workspaces/express/server.js:line 8, column 13
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + '(\\S*):line ((\\d+)(, column (\\d+))?)', 'gi'));
                // Example: /workspaces/mankala/Features.ts(45): error
                // Example: /workspaces/mankala/Features.ts (45): error
                // Example: /workspaces/mankala/Features.ts(45,18): error
                // Example: /workspaces/mankala/Features.ts (45,18): error
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + '([^\\s\\(\\)]*)(\\s?\\((\\d+)(,(\\d+))?)\\)', 'gi'));
                // Example: at /workspaces/mankala/Game.ts
                // Example: at /workspaces/mankala/Game.ts:336
                // Example: at /workspaces/mankala/Game.ts:336:9
                patterns.push(new RegExp(strings.escapeRegExpCharacters(workspaceFolderVariant) + '([^:\\s\\(\\)<>\'\"\\[\\]]*)(:(\\d+))?(:(\\d+))?', 'gi'));
            });
            return patterns;
        };
        /**
         * Detect links. Made public static to allow for tests.
         */
        OutputLinkComputer.detectLinks = function (line, lineIndex, patterns, resourceCreator) {
            var links = [];
            patterns.forEach(function (pattern) {
                pattern.lastIndex = 0; // the holy grail of software development
                var match;
                var offset = 0;
                var _loop_1 = function () {
                    // Convert the relative path information to a resource that we can use in links
                    var folderRelativePath = strings.rtrim(match[1], '.').replace(/\\/g, '/'); // remove trailing "." that likely indicate end of sentence
                    var resource = void 0;
                    try {
                        resource = resourceCreator.toResource(folderRelativePath).toString();
                    }
                    catch (error) {
                        return "continue";
                    }
                    // Append line/col information to URI if matching
                    if (match[3]) {
                        var lineNumber = match[3];
                        if (match[5]) {
                            var columnNumber = match[5];
                            resource = strings.format('{0}#{1},{2}', resource, lineNumber, columnNumber);
                        }
                        else {
                            resource = strings.format('{0}#{1}', resource, lineNumber);
                        }
                    }
                    var fullMatch = strings.rtrim(match[0], '.'); // remove trailing "." that likely indicate end of sentence
                    var index = line.indexOf(fullMatch, offset);
                    offset += index + fullMatch.length;
                    var linkRange = {
                        startColumn: index + 1,
                        startLineNumber: lineIndex,
                        endColumn: index + 1 + fullMatch.length,
                        endLineNumber: lineIndex
                    };
                    if (links.some(function (link) { return range_1.Range.areIntersectingOrTouching(link.range, linkRange); })) {
                        return { value: void 0 };
                    }
                    links.push({
                        range: linkRange,
                        url: resource
                    });
                };
                while ((match = pattern.exec(line)) !== null) {
                    var state_1 = _loop_1();
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            });
            return links;
        };
        return OutputLinkComputer;
    }());
    exports.OutputLinkComputer = OutputLinkComputer;
    function create(ctx, createData) {
        return new OutputLinkComputer(ctx, createData);
    }
    exports.create = create;
});
