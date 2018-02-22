define(["require", "exports", "vs/base/common/event", "./extHostTypes", "vs/base/common/glob", "vs/base/common/uri"], function (require, exports, event_1, extHostTypes_1, glob_1, uri_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileSystemWatcher = /** @class */ (function () {
        function FileSystemWatcher(dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            var _this = this;
            this._onDidCreate = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
            this._onDidDelete = new event_1.Emitter();
            this._config = 0;
            if (ignoreCreateEvents) {
                this._config += 1;
            }
            if (ignoreChangeEvents) {
                this._config += 2;
            }
            if (ignoreDeleteEvents) {
                this._config += 4;
            }
            var parsedPattern = glob_1.parse(globPattern);
            var subscription = dispatcher(function (events) {
                if (!ignoreCreateEvents) {
                    for (var _i = 0, _a = events.created; _i < _a.length; _i++) {
                        var created = _a[_i];
                        var uri = uri_1.default.revive(created);
                        if (parsedPattern(uri.fsPath)) {
                            _this._onDidCreate.fire(uri);
                        }
                    }
                }
                if (!ignoreChangeEvents) {
                    for (var _b = 0, _c = events.changed; _b < _c.length; _b++) {
                        var changed = _c[_b];
                        var uri = uri_1.default.revive(changed);
                        if (parsedPattern(uri.fsPath)) {
                            _this._onDidChange.fire(uri);
                        }
                    }
                }
                if (!ignoreDeleteEvents) {
                    for (var _d = 0, _e = events.deleted; _d < _e.length; _d++) {
                        var deleted = _e[_d];
                        var uri = uri_1.default.revive(deleted);
                        if (parsedPattern(uri.fsPath)) {
                            _this._onDidDelete.fire(uri);
                        }
                    }
                }
            });
            this._disposable = extHostTypes_1.Disposable.from(this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
        }
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreCreateEvents", {
            get: function () {
                return Boolean(this._config & 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreChangeEvents", {
            get: function () {
                return Boolean(this._config & 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "ignoreDeleteEvents", {
            get: function () {
                return Boolean(this._config & 4);
            },
            enumerable: true,
            configurable: true
        });
        FileSystemWatcher.prototype.dispose = function () {
            this._disposable.dispose();
        };
        Object.defineProperty(FileSystemWatcher.prototype, "onDidCreate", {
            get: function () {
                return this._onDidCreate.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "onDidChange", {
            get: function () {
                return this._onDidChange.event;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemWatcher.prototype, "onDidDelete", {
            get: function () {
                return this._onDidDelete.event;
            },
            enumerable: true,
            configurable: true
        });
        return FileSystemWatcher;
    }());
    var ExtHostFileSystemEventService = /** @class */ (function () {
        function ExtHostFileSystemEventService() {
            this._emitter = new event_1.Emitter();
        }
        ExtHostFileSystemEventService.prototype.createFileSystemWatcher = function (globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            return new FileSystemWatcher(this._emitter.event, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
        };
        ExtHostFileSystemEventService.prototype.$onFileEvent = function (events) {
            this._emitter.fire(events);
        };
        return ExtHostFileSystemEventService;
    }());
    exports.ExtHostFileSystemEventService = ExtHostFileSystemEventService;
});
