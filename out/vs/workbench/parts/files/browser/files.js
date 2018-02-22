/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/parts/files/common/explorerModel", "vs/workbench/common/editor", "vs/base/parts/tree/browser/treeImpl", "vs/base/browser/ui/list/listWidget"], function (require, exports, uri_1, explorerModel_1, editor_1, treeImpl_1, listWidget_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Commands can get exeucted from a command pallete, from a context menu or from some list using a keybinding
    // To cover all these cases we need to properly compute the resource on which the command is being executed
    function getResourceForCommand(resource, listService, editorService) {
        if (uri_1.default.isUri(resource)) {
            return resource;
        }
        var list = listService.lastFocusedList;
        if (list && list.isDOMFocused()) {
            var focus_1 = list.getFocus();
            if (focus_1 instanceof explorerModel_1.FileStat) {
                return focus_1.resource;
            }
            else if (focus_1 instanceof explorerModel_1.OpenEditor) {
                return focus_1.getResource();
            }
        }
        return editor_1.toResource(editorService.getActiveEditorInput(), { supportSideBySide: true });
    }
    exports.getResourceForCommand = getResourceForCommand;
    function getMultiSelectedResources(resource, listService, editorService) {
        var list = listService.lastFocusedList;
        if (list && list.isDOMFocused()) {
            // Explorer
            if (list instanceof treeImpl_1.Tree) {
                var focus_2 = list.getFocus();
                // If the resource is passed it has to be a part of the returned context.
                if (focus_2 && (!uri_1.default.isUri(resource) || focus_2.resource.toString() === resource.toString())) {
                    var selection = list.getSelection();
                    // We only respect the selection if it contains the focused element.
                    if (selection && selection.indexOf(focus_2) >= 0) {
                        return selection.map(function (fs) { return fs.resource; });
                    }
                }
            }
            // Open editors view
            if (list instanceof listWidget_1.List) {
                var focus_3 = list.getFocusedElements();
                // If the resource is passed it has to be a part of the returned context.
                if (focus_3.length && (!uri_1.default.isUri(resource) || (focus_3[0] instanceof explorerModel_1.OpenEditor && focus_3[0].getResource().toString() === resource.toString()))) {
                    var selection = list.getSelectedElements();
                    // We only respect the selection if it contains the focused element.
                    if (selection && selection.indexOf(focus_3[0]) >= 0) {
                        return selection.filter(function (s) { return s instanceof explorerModel_1.OpenEditor; }).map(function (oe) { return oe.getResource(); });
                    }
                }
            }
        }
        var result = getResourceForCommand(resource, listService, editorService);
        return !!result ? [result] : [];
    }
    exports.getMultiSelectedResources = getMultiSelectedResources;
});
