/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage"], function (require, exports, instantiationServiceMock_1, workspace_1, storage_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - GettingStarted', function () {
        var instantiation = null;
        var welcomePageEnvConfig = null;
        var hideWelcomeSettingsValue = null;
        // let machineId: string = null;
        var appName = null;
        suiteSetup(function () {
            instantiation = new instantiationServiceMock_1.TestInstantiationService();
            instantiation.stub(workspace_1.IWorkspaceContextService, {
                getConfiguration: function () {
                    return {
                        env: {
                            welcomePage: welcomePageEnvConfig,
                            appName: appName
                        }
                    };
                }
            });
            instantiation.stub(storage_1.IStorageService, {
                get: function () { return hideWelcomeSettingsValue; },
                store: function (value) { return hideWelcomeSettingsValue = value; }
            });
        });
        suiteTeardown(function () {
            instantiation = null;
        });
        setup(function () {
            welcomePageEnvConfig = null;
            hideWelcomeSettingsValue = null;
            appName = null;
        });
    });
});
