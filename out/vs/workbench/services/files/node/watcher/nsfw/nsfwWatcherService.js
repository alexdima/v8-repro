/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/paths", "path", "vs/base/common/platform", "vs/workbench/services/files/node/watcher/common", "nsfw", "vs/base/common/winjs.base", "vs/base/common/async", "vs/platform/files/common/files", "vs/base/common/strings"], function (require, exports, glob, paths, path, platform, watcher, nsfw, winjs_base_1, async_1, files_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var nsfwActionToRawChangeType = [];
    nsfwActionToRawChangeType[nsfw.actions.CREATED] = files_1.FileChangeType.ADDED;
    nsfwActionToRawChangeType[nsfw.actions.MODIFIED] = files_1.FileChangeType.UPDATED;
    nsfwActionToRawChangeType[nsfw.actions.DELETED] = files_1.FileChangeType.DELETED;
    var NsfwWatcherService = /** @class */ (function () {
        function NsfwWatcherService() {
            this._pathWatchers = {};
        }
        NsfwWatcherService.prototype.initialize = function (verboseLogging) {
            var _this = this;
            this._verboseLogging = true;
            this._watcherPromise = new winjs_base_1.TPromise(function (c, e, p) {
                _this._errorCallback = e;
                _this._progressCallback = p;
            });
            return this._watcherPromise;
        };
        NsfwWatcherService.prototype._watch = function (request) {
            var _this = this;
            var undeliveredFileEvents = [];
            var fileEventDelayer = new async_1.ThrottledDelayer(NsfwWatcherService.FS_EVENT_DELAY);
            var readyPromiseCallback;
            this._pathWatchers[request.basePath] = {
                ready: new winjs_base_1.TPromise(function (c) { return readyPromiseCallback = c; }),
                ignored: request.ignored
            };
            process.on('uncaughtException', function (e) {
                // Specially handle ENOSPC errors that can happen when
                // the watcher consumes so many file descriptors that
                // we are running into a limit. We only want to warn
                // once in this case to avoid log spam.
                // See https://github.com/Microsoft/vscode/issues/7950
                if (e === 'Inotify limit reached' && !_this.enospcErrorLogged) {
                    _this.enospcErrorLogged = true;
                    _this._errorCallback(new Error('Inotify limit reached (ENOSPC)'));
                }
            });
            nsfw(request.basePath, function (events) {
                for (var i = 0; i < events.length; i++) {
                    var e = events[i];
                    // Logging
                    if (_this._verboseLogging) {
                        var logPath = e.action === nsfw.actions.RENAMED ? path.join(e.directory, e.oldFile) + ' -> ' + e.newFile : path.join(e.directory, e.file);
                        console.log(e.action === nsfw.actions.CREATED ? '[CREATED]' : e.action === nsfw.actions.DELETED ? '[DELETED]' : e.action === nsfw.actions.MODIFIED ? '[CHANGED]' : '[RENAMED]', logPath);
                    }
                    // Convert nsfw event to IRawFileChange and add to queue
                    var absolutePath = void 0;
                    if (e.action === nsfw.actions.RENAMED) {
                        // Rename fires when a file's name changes within a single directory
                        absolutePath = path.join(e.directory, e.oldFile);
                        if (!_this._isPathIgnored(absolutePath, _this._pathWatchers[request.basePath].ignored)) {
                            undeliveredFileEvents.push({ type: files_1.FileChangeType.DELETED, path: absolutePath });
                        }
                        absolutePath = path.join(e.directory, e.newFile);
                        if (!_this._isPathIgnored(absolutePath, _this._pathWatchers[request.basePath].ignored)) {
                            undeliveredFileEvents.push({ type: files_1.FileChangeType.ADDED, path: absolutePath });
                        }
                    }
                    else {
                        absolutePath = path.join(e.directory, e.file);
                        if (!_this._isPathIgnored(absolutePath, _this._pathWatchers[request.basePath].ignored)) {
                            undeliveredFileEvents.push({
                                type: nsfwActionToRawChangeType[e.action],
                                path: absolutePath
                            });
                        }
                    }
                }
                // Delay and send buffer
                fileEventDelayer.trigger(function () {
                    var events = undeliveredFileEvents;
                    undeliveredFileEvents = [];
                    // Mac uses NFD unicode form on disk, but we want NFC
                    if (platform.isMacintosh) {
                        events.forEach(function (e) { return e.path = strings_1.normalizeNFC(e.path); });
                    }
                    // Broadcast to clients normalized
                    var res = watcher.normalize(events);
                    _this._progressCallback(res);
                    // Logging
                    if (_this._verboseLogging) {
                        res.forEach(function (r) {
                            console.log(' >> normalized', r.type === files_1.FileChangeType.ADDED ? '[ADDED]' : r.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', r.path);
                        });
                    }
                    return winjs_base_1.TPromise.as(null);
                });
            }).then(function (watcher) {
                _this._pathWatchers[request.basePath].watcher = watcher;
                var startPromise = watcher.start();
                startPromise.then(function () { return readyPromiseCallback(watcher); });
                return startPromise;
            });
        };
        NsfwWatcherService.prototype.setRoots = function (roots) {
            var _this = this;
            var promises = [];
            var normalizedRoots = this._normalizeRoots(roots);
            // Gather roots that are not currently being watched
            var rootsToStartWatching = normalizedRoots.filter(function (r) {
                return !(r.basePath in _this._pathWatchers);
            });
            // Gather current roots that don't exist in the new roots array
            var rootsToStopWatching = Object.keys(this._pathWatchers).filter(function (r) {
                return normalizedRoots.every(function (normalizedRoot) { return normalizedRoot.basePath !== r; });
            });
            // Logging
            if (this._verboseLogging) {
                console.log("Start watching: [" + rootsToStartWatching.map(function (r) { return r.basePath; }).join(',') + "]\nStop watching: [" + rootsToStopWatching.join(',') + "]");
            }
            // Stop watching some roots
            rootsToStopWatching.forEach(function (root) {
                _this._pathWatchers[root].ready.then(function (watcher) { return watcher.stop(); });
                delete _this._pathWatchers[root];
            });
            // Start watching some roots
            rootsToStartWatching.forEach(function (root) { return _this._watch(root); });
            // Refresh ignored arrays in case they changed
            roots.forEach(function (root) {
                if (root.basePath in _this._pathWatchers) {
                    _this._pathWatchers[root.basePath].ignored = root.ignored;
                }
            });
            return winjs_base_1.TPromise.join(promises).then(function () { return void 0; });
        };
        /**
         * Normalizes a set of root paths by removing any root paths that are
         * sub-paths of other roots.
         */
        NsfwWatcherService.prototype._normalizeRoots = function (roots) {
            return roots.filter(function (r) { return roots.every(function (other) {
                return !(r.basePath.length > other.basePath.length && paths.isEqualOrParent(r.basePath, other.basePath));
            }); });
        };
        NsfwWatcherService.prototype._isPathIgnored = function (absolutePath, ignored) {
            return ignored && ignored.some(function (ignore) { return glob.match(ignore, absolutePath); });
        };
        NsfwWatcherService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
        return NsfwWatcherService;
    }());
    exports.NsfwWatcherService = NsfwWatcherService;
});
