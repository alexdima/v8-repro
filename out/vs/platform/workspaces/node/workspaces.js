/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/workspaces/common/workspaces", "vs/base/common/platform", "path", "vs/base/common/paths", "vs/base/common/labels"], function (require, exports, workspaces_1, platform_1, path_1, paths_1, labels_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SLASH = '/';
    /**
     * Given the absolute path to a folder, massage it in a way that it fits
     * into an existing set of workspace folders of a workspace.
     *
     * @param absoluteFolderPath the absolute path of a workspace folder
     * @param targetConfigFolder the folder where the workspace is living in
     * @param existingFolders a set of existing folders of the workspace
     */
    function massageFolderPathForWorkspace(absoluteFolderPath, targetConfigFolder, existingFolders) {
        var useSlashesForPath = shouldUseSlashForPath(existingFolders);
        // Convert path to relative path if the target config folder
        // is a parent of the path.
        if (paths_1.isEqualOrParent(absoluteFolderPath, targetConfigFolder, !platform_1.isLinux)) {
            absoluteFolderPath = path_1.relative(targetConfigFolder, absoluteFolderPath) || '.';
        }
        // Windows gets special treatment:
        // - normalize all paths to get nice casing of drive letters
        // - convert to slashes if we want to use slashes for paths
        if (platform_1.isWindows) {
            if (path_1.isAbsolute(absoluteFolderPath)) {
                if (useSlashesForPath) {
                    absoluteFolderPath = paths_1.normalize(absoluteFolderPath, false /* do not use OS path separator */);
                }
                absoluteFolderPath = labels_1.normalizeDriveLetter(absoluteFolderPath);
            }
            else if (useSlashesForPath) {
                absoluteFolderPath = absoluteFolderPath.replace(/[\\]/g, SLASH);
            }
        }
        return absoluteFolderPath;
    }
    exports.massageFolderPathForWorkspace = massageFolderPathForWorkspace;
    function shouldUseSlashForPath(storedFolders) {
        // Determine which path separator to use:
        // - macOS/Linux: slash
        // - Windows: use slash if already used in that file
        var useSlashesForPath = !platform_1.isWindows;
        if (platform_1.isWindows) {
            storedFolders.forEach(function (folder) {
                if (workspaces_1.isRawFileWorkspaceFolder(folder) && !useSlashesForPath && folder.path.indexOf(SLASH) >= 0) {
                    useSlashesForPath = true;
                }
            });
        }
        return useSlashesForPath;
    }
});
