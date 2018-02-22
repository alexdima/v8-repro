/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/workbench/common/editor"], function (require, exports, winjs_base_1, errors_1, editor_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var WorkspaceSymbolProviderRegistry;
    (function (WorkspaceSymbolProviderRegistry) {
        var _supports = [];
        function register(support) {
            if (support) {
                _supports.push(support);
            }
            return {
                dispose: function () {
                    if (support) {
                        var idx = _supports.indexOf(support);
                        if (idx >= 0) {
                            _supports.splice(idx, 1);
                            support = undefined;
                        }
                    }
                }
            };
        }
        WorkspaceSymbolProviderRegistry.register = register;
        function all() {
            return _supports.slice(0);
        }
        WorkspaceSymbolProviderRegistry.all = all;
    })(WorkspaceSymbolProviderRegistry = exports.WorkspaceSymbolProviderRegistry || (exports.WorkspaceSymbolProviderRegistry = {}));
    function getWorkspaceSymbols(query) {
        var result = [];
        var promises = WorkspaceSymbolProviderRegistry.all().map(function (support) {
            return support.provideWorkspaceSymbols(query).then(function (value) {
                if (Array.isArray(value)) {
                    result.push([support, value]);
                }
            }, errors_1.onUnexpectedError);
        });
        return winjs_base_1.TPromise.join(promises).then(function (_) { return result; });
    }
    exports.getWorkspaceSymbols = getWorkspaceSymbols;
    /**
     * Helper to return all opened editors with resources not belonging to the currently opened workspace.
     */
    function getOutOfWorkspaceEditorResources(editorGroupService, contextService) {
        var resources = [];
        editorGroupService.getStacksModel().groups.forEach(function (group) {
            var editors = group.getEditors();
            editors.forEach(function (editor) {
                var resource = editor_1.toResource(editor, { supportSideBySide: true });
                if (resource && !contextService.isInsideWorkspace(resource)) {
                    resources.push(resource);
                }
            });
        });
        return resources;
    }
    exports.getOutOfWorkspaceEditorResources = getOutOfWorkspaceEditorResources;
});
