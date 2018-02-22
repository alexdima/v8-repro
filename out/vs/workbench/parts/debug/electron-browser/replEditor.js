/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/parts/codeEditor/electron-browser/menuPreventer", "vs/workbench/parts/codeEditor/electron-browser/selectionClipboard", "vs/editor/contrib/contextmenu/contextmenu", "vs/editor/contrib/suggest/suggestController", "vs/editor/contrib/snippet/snippetController2", "vs/workbench/parts/snippets/electron-browser/tabCompletion", "vs/platform/theme/common/themeService"], function (require, exports, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, contextkey_1, instantiation_1, commands_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, suggestController_1, snippetController2_1, tabCompletion_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ReplInputEditor = /** @class */ (function (_super) {
        __extends(ReplInputEditor, _super);
        function ReplInputEditor(domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, themeService) {
            return _super.call(this, domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, themeService) || this;
        }
        ReplInputEditor.prototype._getContributions = function () {
            return [
                menuPreventer_1.MenuPreventer,
                selectionClipboard_1.SelectionClipboard,
                contextmenu_1.ContextMenuController,
                suggestController_1.SuggestController,
                snippetController2_1.SnippetController2,
                tabCompletion_1.TabCompletionController,
            ];
        };
        ReplInputEditor.prototype._getActions = function () {
            return editorExtensions_1.EditorExtensionsRegistry.getEditorActions();
        };
        ReplInputEditor = __decorate([
            __param(2, instantiation_1.IInstantiationService),
            __param(3, codeEditorService_1.ICodeEditorService),
            __param(4, commands_1.ICommandService),
            __param(5, contextkey_1.IContextKeyService),
            __param(6, themeService_1.IThemeService)
        ], ReplInputEditor);
        return ReplInputEditor;
    }(codeEditorWidget_1.CodeEditorWidget));
    exports.ReplInputEditor = ReplInputEditor;
});
