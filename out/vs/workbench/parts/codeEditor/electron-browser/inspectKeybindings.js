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
define(["require", "exports", "vs/nls", "vs/editor/browser/editorExtensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/keybinding/electron-browser/keybindingService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls, editorExtensions_1, keybinding_1, keybindingService_1, editorService_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var InspectKeyMap = /** @class */ (function (_super) {
        __extends(InspectKeyMap, _super);
        function InspectKeyMap() {
            return _super.call(this, {
                id: 'workbench.action.inspectKeyMappings',
                label: nls.localize('workbench.action.inspectKeyMap', "Developer: Inspect Key Mappings"),
                alias: 'Developer: Inspect Key Mappings',
                precondition: null
            }) || this;
        }
        InspectKeyMap.prototype.run = function (accessor, editor) {
            var keybindingService = accessor.get(keybinding_1.IKeybindingService);
            var editorService = accessor.get(editorService_1.IWorkbenchEditorService);
            if (keybindingService instanceof keybindingService_1.WorkbenchKeybindingService) {
                editorService.openEditor({ contents: keybindingService.dumpDebugInfo(), options: { pinned: true } });
            }
        };
        return InspectKeyMap;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorAction(InspectKeyMap);
});
