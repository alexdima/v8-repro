define(["require", "exports", "vs/base/common/uri", "vs/base/common/winjs.base", "./extHost.protocol", "vs/base/common/async", "vs/base/common/map", "vs/workbench/api/node/extHostTypes"], function (require, exports, uri_1, winjs_base_1, extHost_protocol_1, async_1, map_1, extHostTypes_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var FsLinkProvider = /** @class */ (function () {
        function FsLinkProvider() {
            this._schemes = new Set();
        }
        FsLinkProvider.prototype.add = function (scheme) {
            this._regex = undefined;
            this._schemes.add(scheme);
        };
        FsLinkProvider.prototype.delete = function (scheme) {
            if (this._schemes.delete(scheme)) {
                this._regex = undefined;
            }
        };
        FsLinkProvider.prototype.provideDocumentLinks = function (document, token) {
            if (this._schemes.size === 0) {
                return undefined;
            }
            if (!this._regex) {
                this._regex = new RegExp("(" + (map_1.values(this._schemes).join('|')) + "):[^\\s]+", 'gi');
            }
            var result = [];
            var max = Math.min(document.lineCount, 2500);
            for (var line = 0; line < max; line++) {
                this._regex.lastIndex = 0;
                var textLine = document.lineAt(line);
                var m = void 0;
                while (m = this._regex.exec(textLine.text)) {
                    var target = uri_1.default.parse(m[0]);
                    var range = new extHostTypes_1.Range(line, this._regex.lastIndex - m[0].length, line, this._regex.lastIndex);
                    result.push({ target: target, range: range });
                }
            }
            return result;
        };
        return FsLinkProvider;
    }());
    var ExtHostFileSystem = /** @class */ (function () {
        function ExtHostFileSystem(mainContext, extHostLanguageFeatures) {
            this._provider = new Map();
            this._linkProvider = new FsLinkProvider();
            this._handlePool = 0;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadFileSystem);
            extHostLanguageFeatures.registerDocumentLinkProvider('*', this._linkProvider);
        }
        ExtHostFileSystem.prototype.registerFileSystemProvider = function (scheme, provider) {
            var _this = this;
            var handle = this._handlePool++;
            this._linkProvider.add(scheme);
            this._provider.set(handle, provider);
            this._proxy.$registerFileSystemProvider(handle, scheme);
            if (provider.root) {
                // todo@remote
                this._proxy.$onDidAddFileSystemRoot(provider.root);
            }
            var reg;
            if (provider.onDidChange) {
                reg = provider.onDidChange(function (event) { return _this._proxy.$onFileSystemChange(handle, event); });
            }
            return {
                dispose: function () {
                    if (reg) {
                        reg.dispose();
                    }
                    _this._linkProvider.delete(scheme);
                    _this._provider.delete(handle);
                    _this._proxy.$unregisterFileSystemProvider(handle);
                }
            };
        };
        ExtHostFileSystem.prototype.$utimes = function (handle, resource, mtime, atime) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).utimes(uri_1.default.revive(resource), mtime, atime); });
        };
        ExtHostFileSystem.prototype.$stat = function (handle, resource) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).stat(uri_1.default.revive(resource)); });
        };
        ExtHostFileSystem.prototype.$read = function (handle, session, offset, count, resource) {
            var _this = this;
            var progress = {
                report: function (chunk) {
                    _this._proxy.$reportFileChunk(handle, session, [].slice.call(chunk));
                }
            };
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).read(uri_1.default.revive(resource), offset, count, progress); });
        };
        ExtHostFileSystem.prototype.$write = function (handle, resource, content) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).write(uri_1.default.revive(resource), Buffer.from(content)); });
        };
        ExtHostFileSystem.prototype.$unlink = function (handle, resource) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).unlink(uri_1.default.revive(resource)); });
        };
        ExtHostFileSystem.prototype.$move = function (handle, resource, target) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).move(uri_1.default.revive(resource), uri_1.default.revive(target)); });
        };
        ExtHostFileSystem.prototype.$mkdir = function (handle, resource) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).mkdir(uri_1.default.revive(resource)); });
        };
        ExtHostFileSystem.prototype.$readdir = function (handle, resource) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).readdir(uri_1.default.revive(resource)); });
        };
        ExtHostFileSystem.prototype.$rmdir = function (handle, resource) {
            var _this = this;
            return async_1.asWinJsPromise(function (token) { return _this._provider.get(handle).rmdir(uri_1.default.revive(resource)); });
        };
        ExtHostFileSystem.prototype.$findFiles = function (handle, session, query) {
            var _this = this;
            var provider = this._provider.get(handle);
            if (!provider.findFiles) {
                return winjs_base_1.TPromise.as(undefined);
            }
            var progress = {
                report: function (uri) {
                    _this._proxy.$handleFindMatch(handle, session, uri);
                }
            };
            return async_1.asWinJsPromise(function (token) { return provider.findFiles(query, progress, token); });
        };
        ExtHostFileSystem.prototype.$provideTextSearchResults = function (handle, session, pattern, options) {
            var _this = this;
            var provider = this._provider.get(handle);
            if (!provider.provideTextSearchResults) {
                return winjs_base_1.TPromise.as(undefined);
            }
            var progress = {
                report: function (data) {
                    _this._proxy.$handleFindMatch(handle, session, [data.uri, {
                            lineNumber: 1 + data.range.start.line,
                            preview: data.preview.leading + data.preview.matching + data.preview.trailing,
                            offsetAndLengths: [[data.preview.leading.length, data.preview.matching.length]]
                        }]);
                }
            };
            return async_1.asWinJsPromise(function (token) { return provider.provideTextSearchResults(pattern, options, progress, token); });
        };
        return ExtHostFileSystem;
    }());
    exports.ExtHostFileSystem = ExtHostFileSystem;
});
