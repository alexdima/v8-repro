var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/base/common/winjs.base", "../node/extHost.protocol", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/api/electron-browser/extHostCustomers", "vs/platform/search/common/search", "vs/workbench/services/workspace/common/workspaceEditing", "vs/base/common/errors", "vs/base/common/map", "vs/base/common/arrays"], function (require, exports, uri_1, winjs_base_1, extHost_protocol_1, files_1, lifecycle_1, event_1, extHostCustomers_1, search_1, workspaceEditing_1, errors_1, map_1, arrays_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadFileSystem = /** @class */ (function () {
        function MainThreadFileSystem(extHostContext, _fileService, _searchService, _workspaceEditingService) {
            this._fileService = _fileService;
            this._searchService = _searchService;
            this._workspaceEditingService = _workspaceEditingService;
            this._provider = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostFileSystem);
        }
        MainThreadFileSystem.prototype.dispose = function () {
            this._provider.forEach(function (value) { return lifecycle_1.dispose(); });
            this._provider.clear();
        };
        MainThreadFileSystem.prototype.$registerFileSystemProvider = function (handle, scheme) {
            this._provider.set(handle, new RemoteFileSystemProvider(this._fileService, this._searchService, scheme, handle, this._proxy));
        };
        MainThreadFileSystem.prototype.$unregisterFileSystemProvider = function (handle) {
            lifecycle_1.dispose(this._provider.get(handle));
            this._provider.delete(handle);
        };
        MainThreadFileSystem.prototype.$onDidAddFileSystemRoot = function (data) {
            this._workspaceEditingService.addFolders([{ uri: uri_1.default.revive(data) }], true).done(null, errors_1.onUnexpectedError);
        };
        MainThreadFileSystem.prototype.$onFileSystemChange = function (handle, changes) {
            this._provider.get(handle).$onFileSystemChange(changes);
        };
        MainThreadFileSystem.prototype.$reportFileChunk = function (handle, session, chunk) {
            this._provider.get(handle).reportFileChunk(session, chunk);
        };
        // --- search
        MainThreadFileSystem.prototype.$handleFindMatch = function (handle, session, data) {
            this._provider.get(handle).handleFindMatch(session, data);
        };
        MainThreadFileSystem = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadFileSystem),
            __param(1, files_1.IFileService),
            __param(2, search_1.ISearchService),
            __param(3, workspaceEditing_1.IWorkspaceEditingService)
        ], MainThreadFileSystem);
        return MainThreadFileSystem;
    }());
    exports.MainThreadFileSystem = MainThreadFileSystem;
    var FileReadOperation = /** @class */ (function () {
        function FileReadOperation(progress, id) {
            if (id === void 0) { id = ++FileReadOperation._idPool; }
            this.progress = progress;
            this.id = id;
            //
        }
        FileReadOperation._idPool = 0;
        return FileReadOperation;
    }());
    var SearchOperation = /** @class */ (function () {
        function SearchOperation(progress, id, matches) {
            if (id === void 0) { id = ++SearchOperation._idPool; }
            if (matches === void 0) { matches = new Map(); }
            this.progress = progress;
            this.id = id;
            this.matches = matches;
            //
        }
        SearchOperation._idPool = 0;
        return SearchOperation;
    }());
    var RemoteFileSystemProvider = /** @class */ (function () {
        function RemoteFileSystemProvider(fileService, searchService, _scheme, _handle, _proxy) {
            this._scheme = _scheme;
            this._handle = _handle;
            this._proxy = _proxy;
            this._onDidChange = new event_1.Emitter();
            this._reads = new Map();
            this._searches = new Map();
            this.onDidChange = this._onDidChange.event;
            this._registrations = [
                fileService.registerProvider(_scheme, this),
                searchService.registerSearchResultProvider(this),
            ];
        }
        RemoteFileSystemProvider.prototype.dispose = function () {
            lifecycle_1.dispose(this._registrations);
            this._onDidChange.dispose();
        };
        RemoteFileSystemProvider.prototype.$onFileSystemChange = function (changes) {
            this._onDidChange.fire(changes.map(RemoteFileSystemProvider._createFileChange));
        };
        RemoteFileSystemProvider._createFileChange = function (dto) {
            return { resource: uri_1.default.revive(dto.resource), type: dto.type };
        };
        // --- forwarding calls
        RemoteFileSystemProvider.prototype.utimes = function (resource, mtime, atime) {
            return this._proxy.$utimes(this._handle, resource, mtime, atime);
        };
        RemoteFileSystemProvider.prototype.stat = function (resource) {
            return this._proxy.$stat(this._handle, resource);
        };
        RemoteFileSystemProvider.prototype.read = function (resource, offset, count, progress) {
            var _this = this;
            var read = new FileReadOperation(progress);
            this._reads.set(read.id, read);
            return this._proxy.$read(this._handle, read.id, offset, count, resource).then(function (value) {
                _this._reads.delete(read.id);
                return value;
            });
        };
        RemoteFileSystemProvider.prototype.reportFileChunk = function (session, chunk) {
            this._reads.get(session).progress.report(Buffer.from(chunk));
        };
        RemoteFileSystemProvider.prototype.write = function (resource, content) {
            return this._proxy.$write(this._handle, resource, [].slice.call(content));
        };
        RemoteFileSystemProvider.prototype.unlink = function (resource) {
            return this._proxy.$unlink(this._handle, resource);
        };
        RemoteFileSystemProvider.prototype.move = function (resource, target) {
            return this._proxy.$move(this._handle, resource, target);
        };
        RemoteFileSystemProvider.prototype.mkdir = function (resource) {
            return this._proxy.$mkdir(this._handle, resource);
        };
        RemoteFileSystemProvider.prototype.readdir = function (resource) {
            return this._proxy.$readdir(this._handle, resource).then(function (data) {
                return data.map(function (tuple) { return [uri_1.default.revive(tuple[0]), tuple[1]]; });
            });
        };
        RemoteFileSystemProvider.prototype.rmdir = function (resource) {
            return this._proxy.$rmdir(this._handle, resource);
        };
        // --- search
        RemoteFileSystemProvider.prototype.search = function (query) {
            var _this = this;
            if (arrays_1.isFalsyOrEmpty(query.folderQueries)) {
                return winjs_base_1.PPromise.as(undefined);
            }
            var includes = __assign({}, query.includePattern);
            var excludes = __assign({}, query.excludePattern);
            for (var _i = 0, _a = query.folderQueries; _i < _a.length; _i++) {
                var folderQuery = _a[_i];
                if (folderQuery.folder.scheme === this._scheme) {
                    includes = __assign({}, includes, folderQuery.includePattern);
                    excludes = __assign({}, excludes, folderQuery.excludePattern);
                }
            }
            return new winjs_base_1.PPromise(function (resolve, reject, report) {
                var search = new SearchOperation(report);
                _this._searches.set(search.id, search);
                var promise = query.type === search_1.QueryType.File
                    ? _this._proxy.$findFiles(_this._handle, search.id, query.filePattern)
                    : _this._proxy.$provideTextSearchResults(_this._handle, search.id, query.contentPattern, { excludes: Object.keys(excludes), includes: Object.keys(includes) });
                promise.then(function () {
                    _this._searches.delete(search.id);
                    resolve(({ results: map_1.values(search.matches), stats: undefined }));
                }, function (err) {
                    _this._searches.delete(search.id);
                    reject(err);
                });
            });
        };
        RemoteFileSystemProvider.prototype.handleFindMatch = function (session, dataOrUri) {
            var resource;
            var match;
            if (Array.isArray(dataOrUri)) {
                resource = uri_1.default.revive(dataOrUri[0]);
                match = dataOrUri[1];
            }
            else {
                resource = uri_1.default.revive(dataOrUri);
            }
            var matches = this._searches.get(session).matches;
            if (!matches.has(resource.toString())) {
                matches.set(resource.toString(), { resource: resource, lineMatches: [] });
            }
            if (match) {
                matches.get(resource.toString()).lineMatches.push(match);
            }
        };
        return RemoteFileSystemProvider;
    }());
});
