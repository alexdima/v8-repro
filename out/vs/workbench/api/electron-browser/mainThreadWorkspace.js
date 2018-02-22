var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/platform/search/common/search", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/winjs.base", "../node/extHost.protocol", "vs/base/common/lifecycle", "vs/workbench/api/electron-browser/extHostCustomers", "vs/platform/configuration/common/configuration", "vs/workbench/services/workspace/common/workspaceEditing", "vs/nls", "vs/platform/statusbar/common/statusbar"], function (require, exports, errors_1, uri_1, search_1, workspace_1, textfiles_1, winjs_base_1, extHost_protocol_1, lifecycle_1, extHostCustomers_1, configuration_1, workspaceEditing_1, nls_1, statusbar_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MainThreadWorkspace = /** @class */ (function () {
        function MainThreadWorkspace(extHostContext, _searchService, _contextService, _textFileService, _configurationService, _workspaceEditingService, _statusbarService) {
            this._searchService = _searchService;
            this._contextService = _contextService;
            this._textFileService = _textFileService;
            this._configurationService = _configurationService;
            this._workspaceEditingService = _workspaceEditingService;
            this._statusbarService = _statusbarService;
            this._toDispose = [];
            this._activeSearches = Object.create(null);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWorkspace);
            this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace, this, this._toDispose);
            this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace, this, this._toDispose);
        }
        MainThreadWorkspace.prototype.dispose = function () {
            lifecycle_1.dispose(this._toDispose);
            for (var requestId in this._activeSearches) {
                var search = this._activeSearches[requestId];
                search.cancel();
            }
        };
        // --- workspace ---
        MainThreadWorkspace.prototype.$updateWorkspaceFolders = function (extensionName, index, deleteCount, foldersToAdd) {
            var workspaceFoldersToAdd = foldersToAdd.map(function (f) { return ({ uri: uri_1.default.revive(f.uri), name: f.name }); });
            // Indicate in status message
            this._statusbarService.setStatusMessage(this.getStatusMessage(extensionName, workspaceFoldersToAdd.length, deleteCount), 10 * 1000 /* 10s */);
            return this._workspaceEditingService.updateFolders(index, deleteCount, workspaceFoldersToAdd, true);
        };
        MainThreadWorkspace.prototype.getStatusMessage = function (extensionName, addCount, removeCount) {
            var message;
            var wantsToAdd = addCount > 0;
            var wantsToDelete = removeCount > 0;
            // Add Folders
            if (wantsToAdd && !wantsToDelete) {
                if (addCount === 1) {
                    message = nls_1.localize('folderStatusMessageAddSingleFolder', "Extension '{0}' added 1 folder to the workspace", extensionName);
                }
                else {
                    message = nls_1.localize('folderStatusMessageAddMultipleFolders', "Extension '{0}' added {1} folders to the workspace", extensionName, addCount);
                }
            }
            else if (wantsToDelete && !wantsToAdd) {
                if (removeCount === 1) {
                    message = nls_1.localize('folderStatusMessageRemoveSingleFolder', "Extension '{0}' removed 1 folder from the workspace", extensionName);
                }
                else {
                    message = nls_1.localize('folderStatusMessageRemoveMultipleFolders', "Extension '{0}' removed {1} folders from the workspace", extensionName, removeCount);
                }
            }
            else {
                message = nls_1.localize('folderStatusChangeFolder', "Extension '{0}' changed folders of the workspace", extensionName);
            }
            return message;
        };
        MainThreadWorkspace.prototype._onDidChangeWorkspace = function () {
            this._proxy.$acceptWorkspaceData(this._contextService.getWorkbenchState() === workspace_1.WorkbenchState.EMPTY ? null : this._contextService.getWorkspace());
        };
        // --- search ---
        MainThreadWorkspace.prototype.$startSearch = function (includePattern, includeFolder, excludePatternOrDisregardExcludes, maxResults, requestId) {
            var _this = this;
            var workspace = this._contextService.getWorkspace();
            if (!workspace.folders.length) {
                return undefined;
            }
            var folderQueries;
            if (typeof includeFolder === 'string') {
                folderQueries = [{ folder: uri_1.default.file(includeFolder) }]; // if base provided, only search in that folder
            }
            else {
                folderQueries = workspace.folders.map(function (folder) { return ({ folder: folder.uri }); }); // absolute pattern: search across all folders
            }
            if (!folderQueries) {
                return undefined; // invalid query parameters
            }
            var useRipgrep = folderQueries.every(function (folderQuery) {
                var folderConfig = _this._configurationService.getValue({ resource: folderQuery.folder });
                return folderConfig.search.useRipgrep;
            });
            var ignoreSymlinks = folderQueries.every(function (folderQuery) {
                var folderConfig = _this._configurationService.getValue({ resource: folderQuery.folder });
                return !folderConfig.search.followSymlinks;
            });
            var query = {
                folderQueries: folderQueries,
                type: search_1.QueryType.File,
                maxResults: maxResults,
                includePattern: (_a = {}, _a[typeof includePattern === 'string' ? includePattern : undefined] = true, _a),
                excludePattern: (_b = {}, _b[typeof excludePatternOrDisregardExcludes === 'string' ? excludePatternOrDisregardExcludes : undefined] = true, _b),
                disregardExcludeSettings: excludePatternOrDisregardExcludes === false,
                useRipgrep: useRipgrep,
                ignoreSymlinks: ignoreSymlinks
            };
            this._searchService.extendQuery(query);
            var search = this._searchService.search(query).then(function (result) {
                return result.results.map(function (m) { return m.resource; });
            }, function (err) {
                if (!errors_1.isPromiseCanceledError(err)) {
                    return winjs_base_1.TPromise.wrapError(err);
                }
                return undefined;
            });
            this._activeSearches[requestId] = search;
            var onDone = function () { return delete _this._activeSearches[requestId]; };
            search.done(onDone, onDone);
            return search;
            var _a, _b;
        };
        MainThreadWorkspace.prototype.$cancelSearch = function (requestId) {
            var search = this._activeSearches[requestId];
            if (search) {
                delete this._activeSearches[requestId];
                search.cancel();
                return winjs_base_1.TPromise.as(true);
            }
            return undefined;
        };
        // --- save & edit resources ---
        MainThreadWorkspace.prototype.$saveAll = function (includeUntitled) {
            return this._textFileService.saveAll(includeUntitled).then(function (result) {
                return result.results.every(function (each) { return each.success === true; });
            });
        };
        MainThreadWorkspace = __decorate([
            extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadWorkspace),
            __param(1, search_1.ISearchService),
            __param(2, workspace_1.IWorkspaceContextService),
            __param(3, textfiles_1.ITextFileService),
            __param(4, configuration_1.IConfigurationService),
            __param(5, workspaceEditing_1.IWorkspaceEditingService),
            __param(6, statusbar_1.IStatusbarService)
        ], MainThreadWorkspace);
        return MainThreadWorkspace;
    }());
    exports.MainThreadWorkspace = MainThreadWorkspace;
});
