/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/common/uri", "vs/workbench/services/files/node/watcher/common", "vs/workbench/services/files/node/watcher/unix/watcherIpc", "path"], function (require, exports, winjs_base_1, ipc_1, ipc_cp_1, uri_1, common_1, watcherIpc_1, path_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileWatcher = /** @class */ (function () {
        function FileWatcher(contextService, ignored, onFileChanges, errorLogger, verboseLogging) {
            this.contextService = contextService;
            this.ignored = ignored;
            this.onFileChanges = onFileChanges;
            this.errorLogger = errorLogger;
            this.verboseLogging = verboseLogging;
            this.isDisposed = false;
            this.restartCounter = 0;
        }
        FileWatcher.prototype.startWatching = function () {
            var _this = this;
            var args = ['--type=watcherService'];
            var client = new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                serverName: 'Watcher',
                args: args,
                env: {
                    AMD_ENTRYPOINT: 'vs/workbench/services/files/node/watcher/unix/watcherApp',
                    PIPE_LOGGING: 'true',
                    VERBOSE_LOGGING: this.verboseLogging
                }
            });
            var channel = ipc_1.getNextTickChannel(client.getChannel('watcher'));
            var service = new watcherIpc_1.WatcherChannelClient(channel);
            // Start watching
            var basePath = path_1.normalize(this.contextService.getWorkspace().folders[0].uri.fsPath);
            service.watch({ basePath: basePath, ignored: this.ignored, verboseLogging: this.verboseLogging }).then(null, function (err) {
                if (!_this.isDisposed && !(err instanceof Error && err.name === 'Canceled' && err.message === 'Canceled')) {
                    return winjs_base_1.TPromise.wrapError(err); // the service lib uses the promise cancel error to indicate the process died, we do not want to bubble this up
                }
                return void 0;
            }, function (events) { return _this.onRawFileEvents(events); }).done(function () {
                // our watcher app should never be completed because it keeps on watching. being in here indicates
                // that the watcher process died and we want to restart it here. we only do it a max number of times
                if (!_this.isDisposed) {
                    if (_this.restartCounter <= FileWatcher.MAX_RESTARTS) {
                        _this.errorLogger('[FileWatcher] terminated unexpectedly and is restarted again...');
                        _this.restartCounter++;
                        _this.startWatching();
                    }
                    else {
                        _this.errorLogger('[FileWatcher] failed to start after retrying for some time, giving up. Please report this as a bug report!');
                    }
                }
            }, function (error) {
                if (!_this.isDisposed) {
                    _this.errorLogger(error);
                }
            });
            return function () {
                _this.isDisposed = true;
                client.dispose();
            };
        };
        FileWatcher.prototype.onRawFileEvents = function (events) {
            if (this.isDisposed) {
                return;
            }
            // Emit through event emitter
            if (events.length > 0) {
                this.onFileChanges(common_1.toFileChangesEvent(events));
            }
        };
        FileWatcher.MAX_RESTARTS = 5;
        return FileWatcher;
    }());
    exports.FileWatcher = FileWatcher;
});
