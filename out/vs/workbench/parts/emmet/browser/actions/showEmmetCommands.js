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
define(["require", "exports", "vs/nls", "vs/base/common/winjs.base", "vs/editor/browser/editorExtensions", "vs/platform/quickOpen/common/quickOpen", "vs/editor/common/editorContextKeys"], function (require, exports, nls, winjs_base_1, editorExtensions_1, quickOpen_1, editorContextKeys_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var EMMET_COMMANDS_PREFIX = '>Emmet: ';
    var ShowEmmetCommandsAction = /** @class */ (function (_super) {
        __extends(ShowEmmetCommandsAction, _super);
        function ShowEmmetCommandsAction() {
            return _super.call(this, {
                id: 'workbench.action.showEmmetCommands',
                label: nls.localize('showEmmetCommands', "Show Emmet Commands"),
                alias: 'Show Emmet Commands',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
            }) || this;
        }
        ShowEmmetCommandsAction.prototype.run = function (accessor, editor) {
            var quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
            quickOpenService.show(EMMET_COMMANDS_PREFIX);
            return winjs_base_1.TPromise.as(null);
        };
        return ShowEmmetCommandsAction;
    }(editorExtensions_1.EditorAction));
    editorExtensions_1.registerEditorAction(ShowEmmetCommandsAction);
});
