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
define(["require", "exports", "vs/nls", "vs/workbench/parts/emmet/electron-browser/emmetActions", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, emmetActions_1, editorExtensions_1, editorContextKeys_1, contextkey_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExpandAbbreviationAction = /** @class */ (function (_super) {
        __extends(ExpandAbbreviationAction, _super);
        function ExpandAbbreviationAction() {
            return _super.call(this, {
                id: 'editor.emmet.action.expandAbbreviation',
                label: nls.localize('expandAbbreviationAction', "Emmet: Expand Abbreviation"),
                alias: 'Emmet: Expand Abbreviation',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                actionName: 'expand_abbreviation',
                kbOpts: {
                    primary: 2 /* Tab */,
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus, contextkey_1.ContextKeyExpr.has('config.emmet.triggerExpansionOnTab'))
                }
            }) || this;
        }
        return ExpandAbbreviationAction;
    }(emmetActions_1.EmmetEditorAction));
    editorExtensions_1.registerEditorAction(ExpandAbbreviationAction);
});
