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
define(["require", "exports", "vs/base/common/winjs.base", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/services/group/common/groupService", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/css!./media/actions"], function (require, exports, winjs_base_1, nls, platform_1, actions_1, actions_2, actions_3, groupService_1, lifecycle_1, commands_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ToggleEditorLayoutAction = /** @class */ (function (_super) {
        __extends(ToggleEditorLayoutAction, _super);
        function ToggleEditorLayoutAction(id, label, editorGroupService) {
            var _this = _super.call(this, id, label) || this;
            _this.editorGroupService = editorGroupService;
            _this.toDispose = [];
            _this.class = 'toggle-editor-layout';
            _this.updateEnablement();
            _this.updateLabel();
            _this.registerListeners();
            return _this;
        }
        ToggleEditorLayoutAction.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.editorGroupService.onEditorsChanged(function () { return _this.updateEnablement(); }));
            this.toDispose.push(this.editorGroupService.onGroupOrientationChanged(function () { return _this.updateLabel(); }));
        };
        ToggleEditorLayoutAction.prototype.updateLabel = function () {
            var editorGroupLayoutVertical = (this.editorGroupService.getGroupOrientation() !== 'horizontal');
            this.label = editorGroupLayoutVertical ? nls.localize('horizontalLayout', "Horizontal Editor Group Layout") : nls.localize('verticalLayout', "Vertical Editor Group Layout");
        };
        ToggleEditorLayoutAction.prototype.updateEnablement = function () {
            this.enabled = this.editorGroupService.getStacksModel().groups.length > 0;
        };
        ToggleEditorLayoutAction.prototype.run = function () {
            var groupOrientiation = this.editorGroupService.getGroupOrientation();
            var newGroupOrientation = (groupOrientiation === 'vertical') ? 'horizontal' : 'vertical';
            this.editorGroupService.setGroupOrientation(newGroupOrientation);
            return winjs_base_1.TPromise.as(null);
        };
        ToggleEditorLayoutAction.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
            _super.prototype.dispose.call(this);
        };
        ToggleEditorLayoutAction.ID = 'workbench.action.toggleEditorGroupLayout';
        ToggleEditorLayoutAction.LABEL = nls.localize('toggleEditorGroupLayout', "Toggle Editor Group Vertical/Horizontal Layout");
        ToggleEditorLayoutAction = __decorate([
            __param(2, groupService_1.IEditorGroupService)
        ], ToggleEditorLayoutAction);
        return ToggleEditorLayoutAction;
    }(actions_1.Action));
    exports.ToggleEditorLayoutAction = ToggleEditorLayoutAction;
    commands_1.CommandsRegistry.registerCommand('_workbench.editor.setGroupOrientation', function (accessor, args) {
        var editorGroupService = accessor.get(groupService_1.IEditorGroupService);
        var orientation = args[0];
        editorGroupService.setGroupOrientation(orientation);
        return winjs_base_1.TPromise.as(null);
    });
    var registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    var group = nls.localize('view', "View");
    registry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(ToggleEditorLayoutAction, ToggleEditorLayoutAction.ID, ToggleEditorLayoutAction.LABEL, { primary: 1024 /* Shift */ | 512 /* Alt */ | 21 /* KEY_0 */, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 21 /* KEY_0 */ } }), 'View: Toggle Editor Group Vertical/Horizontal Layout', group);
});
