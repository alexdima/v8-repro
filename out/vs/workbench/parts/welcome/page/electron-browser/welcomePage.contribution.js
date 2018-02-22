define(["require", "exports", "vs/nls", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/parts/welcome/page/electron-browser/welcomePage", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/editor", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, nls_1, contributions_1, platform_1, welcomePage_1, actions_1, actions_2, configurationRegistry_1, editor_1, lifecycle_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        'id': 'workbench',
        'order': 7,
        'title': nls_1.localize('workbenchConfigurationTitle', "Workbench"),
        'properties': {
            'workbench.startupEditor': {
                'type': 'string',
                'enum': ['none', 'welcomePage', 'newUntitledFile'],
                'enumDescriptions': [
                    nls_1.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.none' }, "Start without an editor."),
                    nls_1.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePage' }, "Open the Welcome page (default)."),
                    nls_1.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.newUntitledFile' }, "Open a new untitled file."),
                ],
                'default': 'welcomePage',
                'description': nls_1.localize('workbench.startupEditor', "Controls which editor is shown at startup, if none is restored from the previous session. Select 'none' to start without an editor, 'welcomePage' to open the Welcome page (default), 'newUntitledFile' to open a new untitled file (only opening an empty workspace).")
            },
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(welcomePage_1.WelcomePageContribution, lifecycle_1.LifecyclePhase.Running);
    platform_1.Registry.as(actions_1.Extensions.WorkbenchActions)
        .registerWorkbenchAction(new actions_2.SyncActionDescriptor(welcomePage_1.WelcomePageAction, welcomePage_1.WelcomePageAction.ID, welcomePage_1.WelcomePageAction.LABEL), 'Help: Welcome', nls_1.localize('help', "Help"));
    platform_1.Registry.as(editor_1.Extensions.EditorInputFactories).registerEditorInputFactory(welcomePage_1.WelcomeInputFactory.ID, welcomePage_1.WelcomeInputFactory);
});
