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
    var ToggleMinimapAction = /** @class */ (function (_super) {
        __extends(ToggleMinimapAction, _super);
        function ToggleMinimapAction() {
            return _super.call(this, {
                id: 'editor.action.toggleMinimap',
                label: nls.localize('toggleMinimap', "View: Toggle Minimap"),
                alias: 'View: Toggle Minimap',
                precondition: null
            }) || this;
        }
        ToggleMinimapAction.prototype.run = function (accessor, editor) {
            var configurationService = accessor.get(configuration_1.IConfigurationService);
            var newValue = !editor.getConfiguration().viewInfo.minimap.enabled;
            configurationService.updateValue('editor.minimap.enabled', newValue, configuration_1.ConfigurationTarget.USER);
        };
        return ToggleMinimapAction;
    }(editorExtensions_1.EditorAction));
    exports.ToggleMinimapAction = ToggleMinimapAction;
    editorExtensions_1.registerEditorAction(ToggleMinimapAction);
});
