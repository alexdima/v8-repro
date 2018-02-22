/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "path"], function (require, exports, fs_1, path_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function asSortedItems(map) {
        var a = [];
        map.forEach(function (value, index) { return a.push({ name: index, count: value }); });
        return a.sort(function (a, b) { return b.count - a.count; });
    }
    function collectLaunchConfigs(folder) {
        var launchConfigs = new Map();
        var launchConfig = path_1.join(folder, '.vscode', 'launch.json');
        if (fs_1.existsSync(launchConfig)) {
            try {
                var contents = fs_1.readFileSync(launchConfig).toString();
                var json = JSON.parse(contents);
                if (json['configurations']) {
                    for (var _i = 0, _a = json['configurations']; _i < _a.length; _i++) {
                        var each = _a[_i];
                        var type = each['type'];
                        if (type) {
                            if (launchConfigs.has(type)) {
                                launchConfigs.set(type, launchConfigs.get(type) + 1);
                            }
                            else {
                                launchConfigs.set(type, 1);
                            }
                        }
                    }
                }
            }
            catch (_b) {
            }
        }
        return asSortedItems(launchConfigs);
    }
    exports.collectLaunchConfigs = collectLaunchConfigs;
    function collectWorkspaceStats(folder, filter) {
        var configFilePatterns = [
            { 'tag': 'grunt.js', 'pattern': /^gruntfile\.js$/i },
            { 'tag': 'gulp.js', 'pattern': /^gulpfile\.js$/i },
            { 'tag': 'tsconfig.json', 'pattern': /^tsconfig\.json$/i },
            { 'tag': 'package.json', 'pattern': /^package\.json$/i },
            { 'tag': 'jsconfig.json', 'pattern': /^jsconfig\.json$/i },
            { 'tag': 'tslint.json', 'pattern': /^tslint\.json$/i },
            { 'tag': 'eslint.json', 'pattern': /^eslint\.json$/i },
            { 'tag': 'tasks.json', 'pattern': /^tasks\.json$/i },
            { 'tag': 'launch.json', 'pattern': /^launch\.json$/i },
            { 'tag': 'settings.json', 'pattern': /^settings\.json$/i },
            { 'tag': 'webpack.config.js', 'pattern': /^webpack\.config\.js$/i },
            { 'tag': 'project.json', 'pattern': /^project\.json$/i },
            { 'tag': 'makefile', 'pattern': /^makefile$/i },
            { 'tag': 'sln', 'pattern': /^.+\.sln$/i },
            { 'tag': 'csproj', 'pattern': /^.+\.csproj$/i },
            { 'tag': 'cmake', 'pattern': /^.+\.cmake$/i }
        ];
        var fileTypes = new Map();
        var configFiles = new Map();
        var MAX_FILES = 20000;
        var walkSync = function (dir, acceptFile, filter, token) {
            try {
                var files = fs_1.readdirSync(dir);
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var file = files_1[_i];
                    if (token.maxReached) {
                        return;
                    }
                    try {
                        if (fs_1.statSync(path_1.join(dir, file)).isDirectory()) {
                            if (filter.indexOf(file) === -1) {
                                walkSync(path_1.join(dir, file), acceptFile, filter, token);
                            }
                        }
                        else {
                            if (token.count >= MAX_FILES) {
                                token.maxReached = true;
                                return;
                            }
                            token.count++;
                            acceptFile(file);
                        }
                    }
                    catch (_a) {
                        // skip over files for which stat fails
                    }
                }
            }
            catch (_b) {
                // skip over folders that cannot be read
            }
        };
        var addFileType = function (fileType) {
            if (fileTypes.has(fileType)) {
                fileTypes.set(fileType, fileTypes.get(fileType) + 1);
            }
            else {
                fileTypes.set(fileType, 1);
            }
        };
        var addConfigFiles = function (fileName) {
            for (var _i = 0, configFilePatterns_1 = configFilePatterns; _i < configFilePatterns_1.length; _i++) {
                var each = configFilePatterns_1[_i];
                if (each.pattern.test(fileName)) {
                    if (configFiles.has(each.tag)) {
                        configFiles.set(each.tag, configFiles.get(each.tag) + 1);
                    }
                    else {
                        configFiles.set(each.tag, 1);
                    }
                }
            }
        };
        var acceptFile = function (name) {
            if (name.lastIndexOf('.') >= 0) {
                var suffix = name.split('.').pop();
                if (suffix) {
                    addFileType(suffix);
                }
            }
            addConfigFiles(name);
        };
        var token = { count: 0, maxReached: false };
        walkSync(folder, acceptFile, filter, token);
        return {
            configFiles: asSortedItems(configFiles),
            fileTypes: asSortedItems(fileTypes),
            fileCount: token.count,
            maxFilesReached: token.maxReached
        };
    }
    exports.collectWorkspaceStats = collectWorkspaceStats;
});
