/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/nls", "vs/base/common/paths", "vs/base/common/platform", "vs/base/common/labels"], function (require, exports, instantiation_1, files_1, nls_1, paths_1, platform_1, labels_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWorkspacesMainService = instantiation_1.createDecorator('workspacesMainService');
    exports.IWorkspacesService = instantiation_1.createDecorator('workspacesService');
    exports.WORKSPACE_EXTENSION = 'code-workspace';
    exports.WORKSPACE_FILTER = [{ name: nls_1.localize('codeWorkspace', "Code Workspace"), extensions: [exports.WORKSPACE_EXTENSION] }];
    exports.UNTITLED_WORKSPACE_NAME = 'workspace.json';
    function isStoredWorkspaceFolder(thing) {
        return isRawFileWorkspaceFolder(thing) || isRawUriWorkspaceFolder(thing);
    }
    exports.isStoredWorkspaceFolder = isStoredWorkspaceFolder;
    function isRawFileWorkspaceFolder(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.path === 'string'
            && (!thing.name || typeof thing.name === 'string');
    }
    exports.isRawFileWorkspaceFolder = isRawFileWorkspaceFolder;
    function isRawUriWorkspaceFolder(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.uri === 'string'
            && (!thing.name || typeof thing.name === 'string');
    }
    exports.isRawUriWorkspaceFolder = isRawUriWorkspaceFolder;
    function getWorkspaceLabel(workspace, environmentService, options) {
        // Workspace: Single Folder
        if (isSingleFolderWorkspaceIdentifier(workspace)) {
            return labels_1.tildify(workspace, environmentService.userHome);
        }
        // Workspace: Untitled
        if (files_1.isParent(workspace.configPath, environmentService.workspacesHome, !platform_1.isLinux /* ignore case */)) {
            return nls_1.localize('untitledWorkspace', "Untitled (Workspace)");
        }
        // Workspace: Saved
        var filename = paths_1.basename(workspace.configPath);
        var workspaceName = filename.substr(0, filename.length - exports.WORKSPACE_EXTENSION.length - 1);
        if (options && options.verbose) {
            return nls_1.localize('workspaceNameVerbose', "{0} (Workspace)", labels_1.getPathLabel(paths_1.join(paths_1.dirname(workspace.configPath), workspaceName), null, environmentService));
        }
        return nls_1.localize('workspaceName', "{0} (Workspace)", workspaceName);
    }
    exports.getWorkspaceLabel = getWorkspaceLabel;
    function isSingleFolderWorkspaceIdentifier(obj) {
        return typeof obj === 'string';
    }
    exports.isSingleFolderWorkspaceIdentifier = isSingleFolderWorkspaceIdentifier;
    function isWorkspaceIdentifier(obj) {
        var workspaceIdentifier = obj;
        return workspaceIdentifier && typeof workspaceIdentifier.id === 'string' && typeof workspaceIdentifier.configPath === 'string';
    }
    exports.isWorkspaceIdentifier = isWorkspaceIdentifier;
});
