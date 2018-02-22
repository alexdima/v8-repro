var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/paths", "vs/base/common/arrays", "path", "vs/platform/workspace/common/workspace", "./extHost.protocol", "vs/base/common/strings", "vs/base/common/map", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/message/common/message", "vs/nls"], function (require, exports, uri_1, event_1, paths_1, arrays_1, path_1, workspace_1, extHost_protocol_1, strings_1, map_1, resources_1, platform_1, message_1, nls_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function isFolderEqual(folderA, folderB) {
        return resources_1.isEqual(folderA, folderB, !platform_1.isLinux);
    }
    function compareWorkspaceFolderByUri(a, b) {
        return isFolderEqual(a.uri, b.uri) ? 0 : strings_1.compare(a.uri.toString(), b.uri.toString());
    }
    function compareWorkspaceFolderByUriAndNameAndIndex(a, b) {
        if (a.index !== b.index) {
            return a.index < b.index ? -1 : 1;
        }
        return isFolderEqual(a.uri, b.uri) ? strings_1.compare(a.name, b.name) : strings_1.compare(a.uri.toString(), b.uri.toString());
    }
    function delta(oldFolders, newFolders, compare) {
        var oldSortedFolders = oldFolders.slice(0).sort(compare);
        var newSortedFolders = newFolders.slice(0).sort(compare);
        return arrays_1.delta(oldSortedFolders, newSortedFolders, compare);
    }
    var ExtHostWorkspaceImpl = /** @class */ (function (_super) {
        __extends(ExtHostWorkspaceImpl, _super);
        function ExtHostWorkspaceImpl(id, name, folders) {
            var _this = _super.call(this, id, name, folders.map(function (f) { return new workspace_1.WorkspaceFolder(f); })) || this;
            _this._workspaceFolders = [];
            _this._structure = map_1.TernarySearchTree.forPaths();
            // setup the workspace folder data structure
            folders.forEach(function (folder) {
                _this._workspaceFolders.push(folder);
                _this._structure.set(folder.uri.toString(), folder);
            });
            return _this;
        }
        ExtHostWorkspaceImpl.toExtHostWorkspace = function (data, previousConfirmedWorkspace, previousUnconfirmedWorkspace) {
            if (!data) {
                return { workspace: null, added: [], removed: [] };
            }
            var id = data.id, name = data.name, folders = data.folders;
            var newWorkspaceFolders = [];
            // If we have an existing workspace, we try to find the folders that match our
            // data and update their properties. It could be that an extension stored them
            // for later use and we want to keep them "live" if they are still present.
            var oldWorkspace = previousConfirmedWorkspace;
            if (oldWorkspace) {
                folders.forEach(function (folderData, index) {
                    var folderUri = uri_1.default.revive(folderData.uri);
                    var existingFolder = ExtHostWorkspaceImpl._findFolder(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri);
                    if (existingFolder) {
                        existingFolder.name = folderData.name;
                        existingFolder.index = folderData.index;
                        newWorkspaceFolders.push(existingFolder);
                    }
                    else {
                        newWorkspaceFolders.push({ uri: folderUri, name: folderData.name, index: index });
                    }
                });
            }
            else {
                newWorkspaceFolders.push.apply(newWorkspaceFolders, folders.map(function (_a) {
                    var uri = _a.uri, name = _a.name, index = _a.index;
                    return ({ uri: uri_1.default.revive(uri), name: name, index: index });
                }));
            }
            // make sure to restore sort order based on index
            newWorkspaceFolders.sort(function (f1, f2) { return f1.index < f2.index ? -1 : 1; });
            var workspace = new ExtHostWorkspaceImpl(id, name, newWorkspaceFolders);
            var _a = delta(oldWorkspace ? oldWorkspace.workspaceFolders : [], workspace.workspaceFolders, compareWorkspaceFolderByUri), added = _a.added, removed = _a.removed;
            return { workspace: workspace, added: added, removed: removed };
        };
        ExtHostWorkspaceImpl._findFolder = function (workspace, folderUriToFind) {
            for (var i = 0; i < workspace.folders.length; i++) {
                var folder = workspace.workspaceFolders[i];
                if (isFolderEqual(folder.uri, folderUriToFind)) {
                    return folder;
                }
            }
            return undefined;
        };
        Object.defineProperty(ExtHostWorkspaceImpl.prototype, "workspaceFolders", {
            get: function () {
                return this._workspaceFolders.slice(0);
            },
            enumerable: true,
            configurable: true
        });
        ExtHostWorkspaceImpl.prototype.getWorkspaceFolder = function (uri, resolveParent) {
            if (resolveParent && this._structure.get(uri.toString())) {
                // `uri` is a workspace folder so we check for its parent
                uri = uri.with({ path: path_1.dirname(uri.path) });
            }
            return this._structure.findSubstr(uri.toString());
        };
        return ExtHostWorkspaceImpl;
    }(workspace_1.Workspace));
    var ExtHostWorkspace = /** @class */ (function () {
        function ExtHostWorkspace(mainContext, data) {
            this._onDidChangeWorkspace = new event_1.Emitter();
            this.onDidChangeWorkspace = this._onDidChangeWorkspace.event;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadWorkspace);
            this._messageService = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadMessageService);
            this._confirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace(data).workspace;
        }
        Object.defineProperty(ExtHostWorkspace.prototype, "workspace", {
            // --- workspace ---
            get: function () {
                return this._actualWorkspace;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtHostWorkspace.prototype, "_actualWorkspace", {
            get: function () {
                return this._unconfirmedWorkspace || this._confirmedWorkspace;
            },
            enumerable: true,
            configurable: true
        });
        ExtHostWorkspace.prototype.getWorkspaceFolders = function () {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.workspaceFolders.slice(0);
        };
        ExtHostWorkspace.prototype.updateWorkspaceFolders = function (extension, index, deleteCount) {
            var _this = this;
            var workspaceFoldersToAdd = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                workspaceFoldersToAdd[_i - 3] = arguments[_i];
            }
            var validatedDistinctWorkspaceFoldersToAdd = [];
            if (Array.isArray(workspaceFoldersToAdd)) {
                workspaceFoldersToAdd.forEach(function (folderToAdd) {
                    if (uri_1.default.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some(function (f) { return isFolderEqual(f.uri, folderToAdd.uri); })) {
                        validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || resources_1.basenameOrAuthority(folderToAdd.uri) });
                    }
                });
            }
            if (!!this._unconfirmedWorkspace) {
                return false; // prevent accumulated calls without a confirmed workspace
            }
            if ([index, deleteCount].some(function (i) { return typeof i !== 'number' || i < 0; })) {
                return false; // validate numbers
            }
            if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
                return false; // nothing to delete or add
            }
            var currentWorkspaceFolders = this._actualWorkspace ? this._actualWorkspace.workspaceFolders : [];
            if (index + deleteCount > currentWorkspaceFolders.length) {
                return false; // cannot delete more than we have
            }
            // Simulate the updateWorkspaceFolders method on our data to do more validation
            var newWorkspaceFolders = currentWorkspaceFolders.slice(0);
            newWorkspaceFolders.splice.apply(newWorkspaceFolders, [index, deleteCount].concat(validatedDistinctWorkspaceFoldersToAdd.map(function (f) { return ({ uri: f.uri, name: f.name || resources_1.basenameOrAuthority(f.uri), index: undefined }); })));
            var _loop_1 = function (i) {
                var folder = newWorkspaceFolders[i];
                if (newWorkspaceFolders.some(function (otherFolder, index) { return index !== i && isFolderEqual(folder.uri, otherFolder.uri); })) {
                    return { value: false };
                }
            };
            for (var i = 0; i < newWorkspaceFolders.length; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            newWorkspaceFolders.forEach(function (f, index) { return f.index = index; }); // fix index
            var _a = delta(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex), added = _a.added, removed = _a.removed;
            if (added.length === 0 && removed.length === 0) {
                return false; // nothing actually changed
            }
            // Trigger on main side
            if (this._proxy) {
                var extName_1 = extension.displayName || extension.name;
                this._proxy.$updateWorkspaceFolders(extName_1, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(null, function (error) {
                    // in case of an error, make sure to clear out the unconfirmed workspace
                    // because we cannot expect the acknowledgement from the main side for this
                    _this._unconfirmedWorkspace = undefined;
                    // show error to user
                    _this._messageService.$showMessage(message_1.Severity.Error, nls_1.localize('updateerror', "Extension '{0}' failed to update workspace folders: {1}", extName_1, error.toString()), { extension: extension }, []);
                });
            }
            // Try to accept directly
            this.trySetWorkspaceFolders(newWorkspaceFolders);
            return true;
        };
        ExtHostWorkspace.prototype.getWorkspaceFolder = function (uri, resolveParent) {
            if (!this._actualWorkspace) {
                return undefined;
            }
            return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
        };
        ExtHostWorkspace.prototype.getPath = function () {
            // this is legacy from the days before having
            // multi-root and we keep it only alive if there
            // is just one workspace folder.
            if (!this._actualWorkspace) {
                return undefined;
            }
            var folders = this._actualWorkspace.folders;
            if (folders.length === 0) {
                return undefined;
            }
            return folders[0].uri.fsPath;
        };
        ExtHostWorkspace.prototype.getRelativePath = function (pathOrUri, includeWorkspace) {
            var path;
            if (typeof pathOrUri === 'string') {
                path = pathOrUri;
            }
            else if (typeof pathOrUri !== 'undefined') {
                path = pathOrUri.fsPath;
            }
            if (!path) {
                return path;
            }
            var folder = this.getWorkspaceFolder(typeof pathOrUri === 'string' ? uri_1.default.file(pathOrUri) : pathOrUri, true);
            if (!folder) {
                return path;
            }
            if (typeof includeWorkspace === 'undefined') {
                includeWorkspace = this._actualWorkspace.folders.length > 1;
            }
            var result = path_1.relative(folder.uri.fsPath, path);
            if (includeWorkspace) {
                result = folder.name + "/" + result;
            }
            return paths_1.normalize(result, true);
        };
        ExtHostWorkspace.prototype.trySetWorkspaceFolders = function (folders) {
            // Update directly here. The workspace is unconfirmed as long as we did not get an
            // acknowledgement from the main side (via $acceptWorkspaceData)
            if (this._actualWorkspace) {
                this._unconfirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace({
                    id: this._actualWorkspace.id,
                    name: this._actualWorkspace.name,
                    configuration: this._actualWorkspace.configuration,
                    folders: folders
                }, this._actualWorkspace).workspace;
            }
        };
        ExtHostWorkspace.prototype.$acceptWorkspaceData = function (data) {
            var _a = ExtHostWorkspaceImpl.toExtHostWorkspace(data, this._confirmedWorkspace, this._unconfirmedWorkspace), workspace = _a.workspace, added = _a.added, removed = _a.removed;
            // Update our workspace object. We have a confirmed workspace, so we drop our
            // unconfirmed workspace.
            this._confirmedWorkspace = workspace;
            this._unconfirmedWorkspace = undefined;
            // Events
            this._onDidChangeWorkspace.fire(Object.freeze({
                added: Object.freeze(added),
                removed: Object.freeze(removed)
            }));
        };
        // --- search ---
        ExtHostWorkspace.prototype.findFiles = function (include, exclude, maxResults, token) {
            var _this = this;
            var requestId = ExtHostWorkspace._requestIdPool++;
            var includePattern;
            var includeFolder;
            if (include) {
                if (typeof include === 'string') {
                    includePattern = include;
                }
                else {
                    includePattern = include.pattern;
                    includeFolder = include.base;
                }
            }
            var excludePatternOrDisregardExcludes;
            if (exclude === null) {
                excludePatternOrDisregardExcludes = false;
            }
            else if (exclude) {
                if (typeof exclude === 'string') {
                    excludePatternOrDisregardExcludes = exclude;
                }
                else {
                    excludePatternOrDisregardExcludes = exclude.pattern;
                }
            }
            var result = this._proxy.$startSearch(includePattern, includeFolder, excludePatternOrDisregardExcludes, maxResults, requestId);
            if (token) {
                token.onCancellationRequested(function () { return _this._proxy.$cancelSearch(requestId); });
            }
            return result.then(function (data) { return data.map(uri_1.default.revive); });
        };
        ExtHostWorkspace.prototype.saveAll = function (includeUntitled) {
            return this._proxy.$saveAll(includeUntitled);
        };
        ExtHostWorkspace._requestIdPool = 0;
        return ExtHostWorkspace;
    }());
    exports.ExtHostWorkspace = ExtHostWorkspace;
});
