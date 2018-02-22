/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vscode-chokidar", "fs", "graceful-fs", "vs/base/common/winjs.base", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/strings", "vs/base/node/extfs", "vs/base/common/platform", "vs/workbench/services/files/node/watcher/common"], function (require, exports, chokidar, fs, gracefulFs, winjs_base_1, files_1, async_1, strings, extfs_1, platform_1, watcher) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    gracefulFs.gracefulify(fs);
    var ChokidarWatcherService = /** @class */ (function () {
        function ChokidarWatcherService() {
        }
        ChokidarWatcherService.prototype.watch = function (request) {
            var _this = this;
            var watcherOpts = {
                ignoreInitial: true,
                ignorePermissionErrors: true,
                followSymlinks: true,
                ignored: request.ignored,
                interval: 1000,
                binaryInterval: 1000,
                disableGlobbing: true // fix https://github.com/Microsoft/vscode/issues/4586
            };
            // Chokidar fails when the basePath does not match case-identical to the path on disk
            // so we have to find the real casing of the path and do some path massaging to fix this
            // see https://github.com/paulmillr/chokidar/issues/418
            var originalBasePath = request.basePath;
            var realBasePath = platform_1.isMacintosh ? (extfs_1.realcaseSync(originalBasePath) || originalBasePath) : originalBasePath;
            var realBasePathLength = realBasePath.length;
            var realBasePathDiffers = (originalBasePath !== realBasePath);
            if (realBasePathDiffers) {
                console.warn("Watcher basePath does not match version on disk and was corrected (original: " + originalBasePath + ", real: " + realBasePath + ")");
            }
            var chokidarWatcher = chokidar.watch(realBasePath, watcherOpts);
            // Detect if for some reason the native watcher library fails to load
            if (platform_1.isMacintosh && !chokidarWatcher.options.useFsEvents) {
                console.error('Watcher is not using native fsevents library and is falling back to unefficient polling.');
            }
            var undeliveredFileEvents = [];
            var fileEventDelayer = new async_1.ThrottledDelayer(ChokidarWatcherService.FS_EVENT_DELAY);
            return new winjs_base_1.TPromise(function (c, e, p) {
                chokidarWatcher.on('all', function (type, path) {
                    if (platform_1.isMacintosh) {
                        // Mac: uses NFD unicode form on disk, but we want NFC
                        // See also https://github.com/nodejs/node/issues/2165
                        path = strings.normalizeNFC(path);
                    }
                    if (path.indexOf(realBasePath) < 0) {
                        return; // we really only care about absolute paths here in our basepath context here
                    }
                    // Make sure to convert the path back to its original basePath form if the realpath is different
                    if (realBasePathDiffers) {
                        path = originalBasePath + path.substr(realBasePathLength);
                    }
                    var event = null;
                    // Change
                    if (type === 'change') {
                        event = { type: 0, path: path };
                    }
                    else if (type === 'add' || type === 'addDir') {
                        event = { type: 1, path: path };
                    }
                    else if (type === 'unlink' || type === 'unlinkDir') {
                        event = { type: 2, path: path };
                    }
                    if (event) {
                        // Logging
                        if (request.verboseLogging) {
                            console.log(event.type === files_1.FileChangeType.ADDED ? '[ADDED]' : event.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', event.path);
                        }
                        // Check for spam
                        var now = Date.now();
                        if (undeliveredFileEvents.length === 0) {
                            _this.spamWarningLogged = false;
                            _this.spamCheckStartTime = now;
                        }
                        else if (!_this.spamWarningLogged && _this.spamCheckStartTime + ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD < now) {
                            _this.spamWarningLogged = true;
                            console.warn(strings.format('Watcher is busy catching up with {0} file changes in 60 seconds. Latest changed path is "{1}"', undeliveredFileEvents.length, event.path));
                        }
                        // Add to buffer
                        undeliveredFileEvents.push(event);
                        // Delay and send buffer
                        fileEventDelayer.trigger(function () {
                            var events = undeliveredFileEvents;
                            undeliveredFileEvents = [];
                            // Broadcast to clients normalized
                            var res = watcher.normalize(events);
                            p(res);
                            // Logging
                            if (request.verboseLogging) {
                                res.forEach(function (r) {
                                    console.log(' >> normalized', r.type === files_1.FileChangeType.ADDED ? '[ADDED]' : r.type === files_1.FileChangeType.DELETED ? '[DELETED]' : '[CHANGED]', r.path);
                                });
                            }
                            return winjs_base_1.TPromise.as(null);
                        });
                    }
                });
                chokidarWatcher.on('error', function (error) {
                    if (error) {
                        // Specially handle ENOSPC errors that can happen when
                        // the watcher consumes so many file descriptors that
                        // we are running into a limit. We only want to warn
                        // once in this case to avoid log spam.
                        // See https://github.com/Microsoft/vscode/issues/7950
                        if (error.code === 'ENOSPC') {
                            if (!_this.enospcErrorLogged) {
                                _this.enospcErrorLogged = true;
                                e(new Error('Inotify limit reached (ENOSPC)'));
                            }
                        }
                        else {
                            console.error(error.toString());
                        }
                    }
                });
            }, function () {
                chokidarWatcher.close();
                fileEventDelayer.cancel();
            });
        };
        ChokidarWatcherService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
        ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD = 60 * 1000; // warn after certain time span of event spam
        return ChokidarWatcherService;
    }());
    exports.ChokidarWatcherService = ChokidarWatcherService;
});
