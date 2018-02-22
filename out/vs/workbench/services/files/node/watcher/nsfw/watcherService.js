/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/common/uri", "vs/workbench/services/files/node/watcher/common", "vs/workbench/services/files/node/watcher/nsfw/watcherIpc", "vs/base/common/lifecycle", "vs/base/common/network"], function (require, exports, winjs_base_1, ipc_1, ipc_cp_1, uri_1, common_1, watcherIpc_1, lifecycle_1, network_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileWatcher = /** @class */ (function () {
        function FileWatcher(contextService, configurationService, onFileChanges, errorLogger, verboseLogging) {
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.onFileChanges = onFileChanges;
            this.errorLogger = errorLogger;
            this.verboseLogging = verboseLogging;
            this.isDisposed = false;
            this.restartCounter = 0;
            this.toDispose = [];
        }
        FileWatcher.prototype.startWatching = function () {
            var _this = this;
            var args = ['--type=watcherService'];
            var client = new ipc_cp_1.Client(uri_1.default.parse(require.toUrl('bootstrap')).fsPath, {
                serverName: 'Watcher',
                args: args,
                env: {
                    AMD_ENTRYPOINT: 'vs/workbench/services/files/node/watcher/nsfw/watcherApp',
                    PIPE_LOGGING: 'true',
                    VERBOSE_LOGGING: this.verboseLogging
                }
            });
            this.toDispose.push(client);
            // Initialize watcher
            var channel = ipc_1.getNextTickChannel(client.getChannel('watcher'));
            this.service = new watcherIpc_1.WatcherChannelClient(channel);
            this.service.initialize(this.verboseLogging).then(null, function (err) {
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
            // Start watching
            this.updateFolders();
            this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(function () { return _this.updateFolders(); }));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) {
                if (e.affectsConfiguration('files.watcherExclude')) {
                    _this.updateFolders();
                }
            }));
            return function () { return _this.dispose(); };
        };
        FileWatcher.prototype.updateFolders = function () {
            var _this = this;
            if (this.isDisposed) {
                return;
            }
            this.service.setRoots(this.contextService.getWorkspace().folders.filter(function (folder) {
                // Only workspace folders on disk
                return folder.uri.scheme === network_1.Schemas.file;
            }).map(function (folder) {
                // Fetch the root's watcherExclude setting and return it
                var configuration = _this.configurationService.getValue({
                    resource: folder.uri
                });
                var ignored = [];
                if (configuration.files && configuration.files.watcherExclude) {
                    ignored = Object.keys(configuration.files.watcherExclude).filter(function (k) { return !!configuration.files.watcherExclude[k]; });
                }
                return {
                    basePath: folder.uri.fsPath,
                    ignored: ignored
                };
            }));
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
        FileWatcher.prototype.dispose = function () {
            this.isDisposed = true;
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        FileWatcher.MAX_RESTARTS = 5;
        return FileWatcher;
    }());
    exports.FileWatcher = FileWatcher;
});
