/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/parts/backup/common/backupModelTracker", "vs/workbench/parts/backup/common/backupRestorer", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, platform_1, contributions_1, backupModelTracker_1, backupRestorer_1, lifecycle_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Backup Model Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(backupModelTracker_1.BackupModelTracker, lifecycle_1.LifecyclePhase.Starting);
    // Register Backup Restorer
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(backupRestorer_1.BackupRestorer, lifecycle_1.LifecyclePhase.Starting);
});
