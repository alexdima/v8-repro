define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "../common/htmlInput", "vs/workbench/parts/html/browser/htmlPreviewPart", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/group/common/groupService", "vs/platform/actions/common/actions", "vs/workbench/parts/extensions/common/extensions", "vs/workbench/browser/editor", "vs/css!./media/htmlPreviewPart", "./webview.contribution"], function (require, exports, uri_1, nls_1, commands_1, instantiation_1, editorService_1, htmlInput_1, htmlPreviewPart_1, platform_1, descriptors_1, groupService_1, actions_1, extensions_1, editor_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function getActivePreviewsForResource(accessor, resource) {
        var uri = resource instanceof uri_1.default ? resource : uri_1.default.parse(resource);
        return accessor.get(editorService_1.IWorkbenchEditorService).getVisibleEditors()
            .filter(function (c) { return c instanceof htmlPreviewPart_1.HtmlPreviewPart && c.model; })
            .map(function (e) { return e; })
            .filter(function (e) { return e.model.uri.scheme === uri.scheme && e.model.uri.toString() === uri.toString(); });
    }
    // --- Register Editor
    platform_1.Registry.as(editor_1.Extensions.Editors).registerEditor(new editor_1.EditorDescriptor(htmlPreviewPart_1.HtmlPreviewPart, htmlPreviewPart_1.HtmlPreviewPart.ID, nls_1.localize('html.editor.label', "Html Preview")), [new descriptors_1.SyncDescriptor(htmlInput_1.HtmlInput)]);
    // --- Register Commands
    var defaultPreviewHtmlOptions = {
        allowScripts: true,
        allowSvgs: true
    };
    commands_1.CommandsRegistry.registerCommand('_workbench.previewHtml', function (accessor, resource, position, label, options) {
        var uri = resource instanceof uri_1.default ? resource : uri_1.default.parse(resource);
        label = label || uri.fsPath;
        var input;
        // Find already opened HTML input if any
        var stacks = accessor.get(groupService_1.IEditorGroupService).getStacksModel();
        var targetGroup = stacks.groupAt(position) || stacks.activeGroup;
        if (targetGroup) {
            var existingInput = targetGroup.getEditor(uri);
            if (existingInput instanceof htmlInput_1.HtmlInput) {
                input = existingInput;
            }
        }
        var inputOptions = Object.assign({}, options || defaultPreviewHtmlOptions);
        var extensionsWorkbenchService = accessor.get(extensions_1.IExtensionsWorkbenchService);
        inputOptions.svgWhiteList = extensionsWorkbenchService.allowedBadgeProviders;
        // Otherwise, create new input and open it
        if (!input) {
            input = accessor.get(instantiation_1.IInstantiationService).createInstance(htmlInput_1.HtmlInput, label, '', uri, inputOptions);
        }
        else {
            input.setName(label); // make sure to use passed in label
        }
        return accessor.get(editorService_1.IWorkbenchEditorService)
            .openEditor(input, { pinned: true }, position)
            .then(function (editor) { return true; });
    });
    commands_1.CommandsRegistry.registerCommand('_workbench.htmlPreview.postMessage', function (accessor, resource, message) {
        var activePreviews = getActivePreviewsForResource(accessor, resource);
        for (var _i = 0, activePreviews_1 = activePreviews; _i < activePreviews_1.length; _i++) {
            var preview = activePreviews_1[_i];
            preview.sendMessage(message);
        }
        return activePreviews.length > 0;
    });
    commands_1.CommandsRegistry.registerCommand('_webview.openDevTools', function () {
        var elements = document.querySelectorAll('webview.ready');
        for (var i = 0; i < elements.length; i++) {
            try {
                elements.item(i).openDevTools();
            }
            catch (e) {
                console.error(e);
            }
        }
    });
    actions_1.MenuRegistry.addCommand({
        id: '_webview.openDevTools',
        title: nls_1.localize('devtools.webview', "Developer: Webview Tools")
    });
});
