/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/storage/common/storageService", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, storageService_1, strings_1, uri_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * We currently store local storage with the following format:
     *
     * [Global]
     * storage://global/<key>
     *
     * [Workspace]
     * storage://workspace/<folder>/<key>
     * storage://workspace/empty:<id>/<key>
     * storage://workspace/root:<id>/<key>
     *
     * <folder>
     * macOS/Linux: /some/folder/path
     *     Windows: c%3A/Users/name/folder (normal path)
     *              file://localhost/c%24/name/folder (unc path)
     *
     * [no workspace]
     * storage://workspace/__$noWorkspace__<key>
     * => no longer being used (used for empty workspaces previously)
     */
    var EMPTY_WORKSPACE_PREFIX = storageService_1.StorageService.COMMON_PREFIX + "workspace/empty:";
    var MULTI_ROOT_WORKSPACE_PREFIX = storageService_1.StorageService.COMMON_PREFIX + "workspace/root:";
    /**
     * Parses the local storage implementation into global, multi root, folder and empty storage.
     */
    function parseStorage(storage) {
        var globalStorage = new Map();
        var folderWorkspacesStorage = new Map();
        var emptyWorkspacesStorage = new Map();
        var multiRootWorkspacesStorage = new Map();
        var workspaces = [];
        for (var i = 0; i < storage.length; i++) {
            var key = storage.key(i);
            // Workspace Storage (storage://workspace/)
            if (strings_1.startsWith(key, storageService_1.StorageService.WORKSPACE_PREFIX)) {
                // We are looking for key: storage://workspace/<folder>/workspaceIdentifier to be able to find all folder
                // paths that are known to the storage. is the only way how to parse all folder paths known in storage.
                if (strings_1.endsWith(key, storageService_1.StorageService.WORKSPACE_IDENTIFIER)) {
                    // storage://workspace/<folder>/workspaceIdentifier => <folder>/
                    var workspace = key.substring(storageService_1.StorageService.WORKSPACE_PREFIX.length, key.length - storageService_1.StorageService.WORKSPACE_IDENTIFIER.length);
                    // macOS/Unix: Users/name/folder/
                    //    Windows: c%3A/Users/name/folder/
                    if (!strings_1.startsWith(workspace, 'file:')) {
                        workspace = "file:///" + strings_1.rtrim(workspace, '/');
                    }
                    else {
                        workspace = strings_1.rtrim(workspace, '/');
                    }
                    // storage://workspace/<folder>/workspaceIdentifier => storage://workspace/<folder>/
                    var prefix = key.substr(0, key.length - storageService_1.StorageService.WORKSPACE_IDENTIFIER.length);
                    workspaces.push({ prefix: prefix, resource: workspace });
                }
                else if (strings_1.startsWith(key, EMPTY_WORKSPACE_PREFIX)) {
                    // storage://workspace/empty:<id>/<key> => <id>
                    var emptyWorkspaceId = key.substring(EMPTY_WORKSPACE_PREFIX.length, key.indexOf('/', EMPTY_WORKSPACE_PREFIX.length));
                    var emptyWorkspaceResource = uri_1.default.from({ path: emptyWorkspaceId, scheme: 'empty' }).toString();
                    var emptyWorkspaceStorage = emptyWorkspacesStorage.get(emptyWorkspaceResource);
                    if (!emptyWorkspaceStorage) {
                        emptyWorkspaceStorage = Object.create(null);
                        emptyWorkspacesStorage.set(emptyWorkspaceResource, emptyWorkspaceStorage);
                    }
                    // storage://workspace/empty:<id>/someKey => someKey
                    var storageKey = key.substr(EMPTY_WORKSPACE_PREFIX.length + emptyWorkspaceId.length + 1 /* trailing / */);
                    emptyWorkspaceStorage[storageKey] = storage.getItem(key);
                }
                else if (strings_1.startsWith(key, MULTI_ROOT_WORKSPACE_PREFIX)) {
                    // storage://workspace/root:<id>/<key> => <id>
                    var multiRootWorkspaceId = key.substring(MULTI_ROOT_WORKSPACE_PREFIX.length, key.indexOf('/', MULTI_ROOT_WORKSPACE_PREFIX.length));
                    var multiRootWorkspaceResource = uri_1.default.from({ path: multiRootWorkspaceId, scheme: 'root' }).toString();
                    var multiRootWorkspaceStorage = multiRootWorkspacesStorage.get(multiRootWorkspaceResource);
                    if (!multiRootWorkspaceStorage) {
                        multiRootWorkspaceStorage = Object.create(null);
                        multiRootWorkspacesStorage.set(multiRootWorkspaceResource, multiRootWorkspaceStorage);
                    }
                    // storage://workspace/root:<id>/someKey => someKey
                    var storageKey = key.substr(MULTI_ROOT_WORKSPACE_PREFIX.length + multiRootWorkspaceId.length + 1 /* trailing / */);
                    multiRootWorkspaceStorage[storageKey] = storage.getItem(key);
                }
            }
            else if (strings_1.startsWith(key, storageService_1.StorageService.GLOBAL_PREFIX)) {
                // storage://global/someKey => someKey
                var globalStorageKey = key.substr(storageService_1.StorageService.GLOBAL_PREFIX.length);
                if (strings_1.startsWith(globalStorageKey, storageService_1.StorageService.COMMON_PREFIX)) {
                    continue; // filter out faulty keys that have the form storage://something/storage://
                }
                globalStorage.set(globalStorageKey, storage.getItem(key));
            }
        }
        // With all the folder paths known we can now extract storage for each path. We have to go through all workspaces
        // from the longest path first to reliably extract the storage. The reason is that one folder path can be a parent
        // of another folder path and as such a simple indexOf check is not enough.
        var workspacesByLength = workspaces.sort(function (w1, w2) { return w1.prefix.length >= w2.prefix.length ? -1 : 1; });
        var handledKeys = new Map();
        workspacesByLength.forEach(function (workspace) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                if (handledKeys.has(key) || !strings_1.startsWith(key, workspace.prefix)) {
                    continue; // not part of workspace prefix or already handled
                }
                handledKeys.set(key, true);
                var folderWorkspaceStorage = folderWorkspacesStorage.get(workspace.resource);
                if (!folderWorkspaceStorage) {
                    folderWorkspaceStorage = Object.create(null);
                    folderWorkspacesStorage.set(workspace.resource, folderWorkspaceStorage);
                }
                // storage://workspace/<folder>/someKey => someKey
                var storageKey = key.substr(workspace.prefix.length);
                folderWorkspaceStorage[storageKey] = storage.getItem(key);
            }
        });
        return {
            global: globalStorage,
            multiRoot: multiRootWorkspacesStorage,
            folder: folderWorkspacesStorage,
            empty: emptyWorkspacesStorage
        };
    }
    exports.parseStorage = parseStorage;
    function migrateStorageToMultiRootWorkspace(fromWorkspaceId, toWorkspace, storage) {
        var parsed = parseStorage(storage);
        var newWorkspaceId = uri_1.default.from({ path: toWorkspace.id, scheme: 'root' }).toString();
        // Find in which location the workspace storage is to be migrated from
        var storageForWorkspace;
        if (parsed.multiRoot.has(fromWorkspaceId)) {
            storageForWorkspace = parsed.multiRoot.get(fromWorkspaceId);
        }
        else if (parsed.empty.has(fromWorkspaceId)) {
            storageForWorkspace = parsed.empty.get(fromWorkspaceId);
        }
        else if (parsed.folder.has(fromWorkspaceId)) {
            storageForWorkspace = parsed.folder.get(fromWorkspaceId);
        }
        // Migrate existing storage to new workspace id
        if (storageForWorkspace) {
            Object.keys(storageForWorkspace).forEach(function (key) {
                if (key === storageService_1.StorageService.WORKSPACE_IDENTIFIER) {
                    return; // make sure to never migrate the workspace identifier
                }
                storage.setItem("" + storageService_1.StorageService.WORKSPACE_PREFIX + newWorkspaceId + "/" + key, storageForWorkspace[key]);
            });
        }
        return newWorkspaceId;
    }
    exports.migrateStorageToMultiRootWorkspace = migrateStorageToMultiRootWorkspace;
});
