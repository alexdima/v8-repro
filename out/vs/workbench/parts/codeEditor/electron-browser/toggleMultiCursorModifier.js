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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/platform/configuration/common/configuration"], function (require, exports, nls, platform_1, actions_1, actions_2, actions_3, configuration_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleMultiCursorModifierAction = /** @class */ (function (_super) {
        __extends(ToggleMultiCursorModifierAction, _super);
        function ToggleMultiCursorModifierAction(id, label, configurationService) {
            var _this = _super.call(this, id, label) || this;
            _this.configurationService = configurationService;
            return _this;
        }
        ToggleMultiCursorModifierAction.prototype.run = function () {
            var editorConf = this.configurationService.getValue('editor');
            var newValue = (editorConf.multiCursorModifier === 'ctrlCmd' ? 'alt' : 'ctrlCmd');
            return this.configurationService.updateValue(ToggleMultiCursorModifierAction.multiCursorModifierConfigurationKey, newValue, configuration_1.ConfigurationTarget.USER);
        };
        ToggleMultiCursorModifierAction.ID = 'workbench.action.toggleMultiCursorModifier';
        ToggleMultiCursorModifierAction.LABEL = nls.localize('toggleLocation', "Toggle Multi-Cursor Modifier");
        ToggleMultiCursorModifierAction.multiCursorModifierConfigurationKey = 'editor.multiCursorModifier';
        ToggleMultiCursorModifierAction = __decorate([
            __param(2, configuration_1.IConfigurationService)
        ], ToggleMultiCursorModifierAction);
        return ToggleMultiCursorModifierAction;
    }(actions_1.Action));
    exports.ToggleMultiCursorModifierAction = ToggleMultiCursorModifierAction;
    var registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ToggleMultiCursorModifierAction, ToggleMultiCursorModifierAction.ID, ToggleMultiCursorModifierAction.LABEL), 'Toggle Multi-Cursor Modifier');
});
