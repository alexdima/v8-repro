/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/parts/update/electron-browser/releaseNotesEditor", "vs/workbench/parts/update/electron-browser/releaseNotesInput", "vs/workbench/common/activity", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "./update", "vs/workbench/browser/editor", "vs/platform/lifecycle/common/lifecycle", "vs/css!./media/update.contribution", "vs/platform/update/node/update.config.contribution"], function (require, exports, nls, platform, platform_1, contributions_1, releaseNotesEditor_1, releaseNotesInput_1, activity_1, descriptors_1, actions_1, actions_2, update_1, editor_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(update_1.ProductContribution, lifecycle_1.LifecyclePhase.Running);
    if (platform.isWindows && process.arch === 'ia32') {
        platform_1.Registry.as(contributions_1.Extensions.Workbench)
            .registerWorkbenchContribution(update_1.Win3264BitContribution, lifecycle_1.LifecyclePhase.Running);
    }
    platform_1.Registry.as(activity_1.GlobalActivityExtensions)
        .registerActivity(update_1.UpdateContribution);
    // Editor
    var editorDescriptor = new editor_1.EditorDescriptor(releaseNotesEditor_1.ReleaseNotesEditor, releaseNotesEditor_1.ReleaseNotesEditor.ID, nls.localize('release notes', "Release notes"));
    platform_1.Registry.as(editor_1.Extensions.Editors)
        .registerEditor(editorDescriptor, [new descriptors_1.SyncDescriptor(releaseNotesInput_1.ReleaseNotesInput)]);
    platform_1.Registry.as(actions_1.Extensions.WorkbenchActions)
        .registerWorkbenchAction(new actions_2.SyncActionDescriptor(update_1.ShowCurrentReleaseNotesAction, update_1.ShowCurrentReleaseNotesAction.ID, update_1.ShowCurrentReleaseNotesAction.LABEL), 'Show Release Notes');
});
