/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/parts/stats/node/workspaceStats", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, platform_1, contributions_1, workspaceStats_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Workspace Stats Contribution
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workspaceStats_1.WorkspaceStats, lifecycle_1.LifecyclePhase.Eventually);
});
