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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./dirtydiffDecorator", "vs/workbench/browser/viewlet", "vs/workbench/parts/scm/common/scm", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/services/editor/common/editorService", "./scmActivity", "vs/workbench/parts/scm/electron-browser/scmViewlet", "vs/platform/lifecycle/common/lifecycle", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, nls_1, platform_1, contributions_1, dirtydiffDecorator_1, viewlet_1, scm_1, actions_1, actions_2, viewlet_2, editorService_1, scmActivity_1, scmViewlet_1, lifecycle_1, configurationRegistry_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var OpenSCMViewletAction = /** @class */ (function (_super) {
        __extends(OpenSCMViewletAction, _super);
        function OpenSCMViewletAction(id, label, viewletService, editorService) {
            return _super.call(this, id, label, scm_1.VIEWLET_ID, viewletService, editorService) || this;
        }
        OpenSCMViewletAction.ID = scm_1.VIEWLET_ID;
        OpenSCMViewletAction.LABEL = nls_1.localize('toggleGitViewlet', "Show Git");
        OpenSCMViewletAction = __decorate([
            __param(2, viewlet_2.IViewletService), __param(3, editorService_1.IWorkbenchEditorService)
        ], OpenSCMViewletAction);
        return OpenSCMViewletAction;
    }(viewlet_1.ToggleViewletAction));
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(dirtydiffDecorator_1.DirtyDiffWorkbenchController, lifecycle_1.LifecyclePhase.Running);
    var viewletDescriptor = new viewlet_1.ViewletDescriptor(scmViewlet_1.SCMViewlet, scm_1.VIEWLET_ID, nls_1.localize('source control', "Source Control"), 'scm', 36);
    platform_1.Registry.as(viewlet_1.Extensions.Viewlets)
        .registerViewlet(viewletDescriptor);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(scmActivity_1.StatusUpdater, lifecycle_1.LifecyclePhase.Running);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(scmActivity_1.StatusBarController, lifecycle_1.LifecyclePhase.Running);
    // Register Action to Open Viewlet
    platform_1.Registry.as(actions_1.Extensions.WorkbenchActions).registerWorkbenchAction(new actions_2.SyncActionDescriptor(OpenSCMViewletAction, scm_1.VIEWLET_ID, nls_1.localize('toggleSCMViewlet', "Show SCM"), {
        primary: null,
        win: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */ },
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */ },
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 37 /* KEY_G */ }
    }), 'View: Show SCM', nls_1.localize('view', "View"));
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'scm',
        order: 5,
        title: nls_1.localize('scmConfigurationTitle', "SCM"),
        type: 'object',
        properties: {
            'scm.alwaysShowProviders': {
                type: 'boolean',
                description: nls_1.localize('alwaysShowProviders', "Whether to always show the Source Control Provider section."),
                default: false
            },
            'scm.diffDecorations': {
                type: 'string',
                enum: ['all', 'gutter', 'overview', 'none'],
                default: 'all',
                description: nls_1.localize('diffDecorations', "Controls diff decorations in the editor.")
            },
            'scm.diffDecorationsGutterWidth': {
                type: 'number',
                enum: [1, 2, 3, 4, 5],
                default: 3,
                description: nls_1.localize('diffGutterWidth', "Controls the width(px) of diff decorations in gutter (added & modified).")
            }
        }
    });
});
