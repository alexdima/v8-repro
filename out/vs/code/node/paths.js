/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/paths", "vs/base/common/platform", "vs/base/common/types", "vs/base/node/extfs"], function (require, exports, path, arrays, strings, paths, platform, types, extfs_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function validatePaths(args) {
        // Track URLs if they're going to be used
        if (args['open-url']) {
            args._urls = args._;
            args._ = [];
        }
        // Realpath/normalize paths and watch out for goto line mode
        var paths = doValidatePaths(args._, args.goto);
        // Update environment
        args._ = paths;
        args.diff = args.diff && paths.length === 2;
        return args;
    }
    exports.validatePaths = validatePaths;
    function doValidatePaths(args, gotoLineMode) {
        var cwd = process.env['VSCODE_CWD'] || process.cwd();
        var result = args.map(function (arg) {
            var pathCandidate = String(arg);
            var parsedPath;
            if (gotoLineMode) {
                parsedPath = parseLineAndColumnAware(pathCandidate);
                pathCandidate = parsedPath.path;
            }
            if (pathCandidate) {
                pathCandidate = preparePath(cwd, pathCandidate);
            }
            var realPath;
            try {
                realPath = extfs_1.realpathSync(pathCandidate);
            }
            catch (error) {
                // in case of an error, assume the user wants to create this file
                // if the path is relative, we join it to the cwd
                realPath = path.normalize(path.isAbsolute(pathCandidate) ? pathCandidate : path.join(cwd, pathCandidate));
            }
            var basename = path.basename(realPath);
            if (basename /* can be empty if code is opened on root */ && !paths.isValidBasename(basename)) {
                return null; // do not allow invalid file names
            }
            if (gotoLineMode) {
                parsedPath.path = realPath;
                return toPath(parsedPath);
            }
            return realPath;
        });
        var caseInsensitive = platform.isWindows || platform.isMacintosh;
        var distinct = arrays.distinct(result, function (e) { return e && caseInsensitive ? e.toLowerCase() : e; });
        return arrays.coalesce(distinct);
    }
    function preparePath(cwd, p) {
        // Trim trailing quotes
        if (platform.isWindows) {
            p = strings.rtrim(p, '"'); // https://github.com/Microsoft/vscode/issues/1498
        }
        // Trim whitespaces
        p = strings.trim(strings.trim(p, ' '), '\t');
        if (platform.isWindows) {
            // Resolve the path against cwd if it is relative
            p = path.resolve(cwd, p);
            // Trim trailing '.' chars on Windows to prevent invalid file names
            p = strings.rtrim(p, '.');
        }
        return p;
    }
    function parseLineAndColumnAware(rawPath) {
        var segments = rawPath.split(':'); // C:\file.txt:<line>:<column>
        var path;
        var line = null;
        var column = null;
        segments.forEach(function (segment) {
            var segmentAsNumber = Number(segment);
            if (!types.isNumber(segmentAsNumber)) {
                path = !!path ? [path, segment].join(':') : segment; // a colon can well be part of a path (e.g. C:\...)
            }
            else if (line === null) {
                line = segmentAsNumber;
            }
            else if (column === null) {
                column = segmentAsNumber;
            }
        });
        if (!path) {
            throw new Error('Format for `--goto` should be: `FILE:LINE(:COLUMN)`');
        }
        return {
            path: path,
            line: line !== null ? line : void 0,
            column: column !== null ? column : line !== null ? 1 : void 0 // if we have a line, make sure column is also set
        };
    }
    exports.parseLineAndColumnAware = parseLineAndColumnAware;
    function toPath(p) {
        var segments = [p.path];
        if (types.isNumber(p.line)) {
            segments.push(String(p.line));
        }
        if (types.isNumber(p.column)) {
            segments.push(String(p.column));
        }
        return segments.join(':');
    }
});
