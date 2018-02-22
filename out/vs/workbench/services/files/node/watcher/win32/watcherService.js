/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/files/node/watcher/common", "vs/workbench/services/files/node/watcher/win32/csharpWatcherService", "path", "vs/base/common/strings", "vs/base/common/paths"], function (require, exports, common_1, csharpWatcherService_1, path_1, strings_1, paths_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileWatcher = /** @class */ (function () {
        function FileWatcher(contextService, ignored, onFileChanges, errorLogger, verboseLogging) {
            this.contextService = contextService;
            this.ignored = ignored;
            this.onFileChanges = onFileChanges;
            this.errorLogger = errorLogger;
            this.verboseLogging = verboseLogging;
        }
        FileWatcher.prototype.startWatching = function () {
            var _this = this;
            var basePath = path_1.normalize(this.contextService.getWorkspace().folders[0].uri.fsPath);
            if (basePath && basePath.indexOf('\\\\') === 0 && strings_1.endsWith(basePath, paths_1.sep)) {
                // for some weird reason, node adds a trailing slash to UNC paths
                // we never ever want trailing slashes as our base path unless
                // someone opens root ("/").
                // See also https://github.com/nodejs/io.js/issues/1765
                basePath = strings_1.rtrim(basePath, paths_1.sep);
            }
            var watcher = new csharpWatcherService_1.OutOfProcessWin32FolderWatcher(basePath, this.ignored, function (events) { return _this.onRawFileEvents(events); }, function (error) { return _this.onError(error); }, this.verboseLogging);
            return function () {
                _this.isDisposed = true;
                watcher.dispose();
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
        FileWatcher.prototype.onError = function (error) {
            if (!this.isDisposed) {
                this.errorLogger(error);
            }
        };
        return FileWatcher;
    }());
    exports.FileWatcher = FileWatcher;
});
