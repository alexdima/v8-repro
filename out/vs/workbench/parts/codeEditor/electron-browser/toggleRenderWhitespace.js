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
define(["require", "exports", "vs/nls", "vs/editor/browser/editorExtensions", "vs/platform/configuration/common/configuration"], function (require, exports, nls, editorExtensions_1, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleRenderWhitespaceAction = /** @class */ (function (_super) {
        __extends(ToggleRenderWhitespaceAction, _super);
        function ToggleRenderWhitespaceAction() {
            return _super.call(this, {
                id: 'editor.action.toggleRenderWhitespace',
                label: nls.localize('toggleRenderWhitespace', "View: Toggle Render Whitespace"),
                alias: 'View: Toggle Render Whitespace',
                precondition: null
            }) || this;
        }
        ToggleRenderWhitespaceAction.prototype.run = function (accessor, editor) {
            var configurationService = accessor.get(configuration_1.IConfigurationService);
            var renderWhitespace = editor.getConfiguration().viewInfo.renderWhitespace;
            var newRenderWhitespace;
            if (renderWhitespace === 'none') {
                newRenderWhitespace = 'all';
            }
            else {
                newRenderWhitespace = 'none';
            }
            configurationService.updateValue('editor.renderWhitespace', newRenderWhitespace, configuration_1.ConfigurationTarget.USER);
        };
        return ToggleRenderWhitespaceAction;
    }(editorExtensions_1.EditorAction));
    exports.ToggleRenderWhitespaceAction = ToggleRenderWhitespaceAction;
    editorExtensions_1.registerEditorAction(ToggleRenderWhitespaceAction);
});
