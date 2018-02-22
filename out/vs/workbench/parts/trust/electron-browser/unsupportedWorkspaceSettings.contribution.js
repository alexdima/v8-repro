/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/winjs.base", "vs/base/common/actions", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/lifecycle/common/lifecycle", "vs/platform/message/common/message", "vs/workbench/parts/preferences/common/preferences", "vs/workbench/services/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace"], function (require, exports, nls, lifecycle_1, winjs_base_1, actions_1, contributions_1, platform_1, lifecycle_2, message_1, preferences_1, configuration_1, storage_1, workspace_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var UnsupportedWorkspaceSettingsContribution = /** @class */ (function () {
        function UnsupportedWorkspaceSettingsContribution(lifecycleService, workspaceContextService, workspaceConfigurationService, preferencesService, messageService, storageService) {
            var _this = this;
            this.workspaceConfigurationService = workspaceConfigurationService;
            this.preferencesService = preferencesService;
            this.messageService = messageService;
            this.storageService = storageService;
            this.toDispose = [];
            this.isUntrusted = false;
            lifecycleService.onShutdown(this.dispose, this);
            this.toDispose.push(this.workspaceConfigurationService.onDidChangeConfiguration(function (e) { return _this.checkWorkspaceSettings(); }));
            this.toDispose.push(workspaceContextService.onDidChangeWorkspaceFolders(function (e) { return _this.checkWorkspaceSettings(); }));
        }
        UnsupportedWorkspaceSettingsContribution.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        UnsupportedWorkspaceSettingsContribution.prototype.checkWorkspaceSettings = function () {
            if (this.isUntrusted) {
                return;
            }
            var configurationKeys = this.workspaceConfigurationService.getUnsupportedWorkspaceKeys();
            this.isUntrusted = configurationKeys.length > 0;
            if (this.isUntrusted && !this.hasShownWarning()) {
                this.showWarning(configurationKeys);
            }
        };
        UnsupportedWorkspaceSettingsContribution.prototype.hasShownWarning = function () {
            return this.storageService.getBoolean(UnsupportedWorkspaceSettingsContribution.storageKey, storage_1.StorageScope.WORKSPACE, false);
        };
        UnsupportedWorkspaceSettingsContribution.prototype.rememberWarningWasShown = function () {
            this.storageService.store(UnsupportedWorkspaceSettingsContribution.storageKey, true, storage_1.StorageScope.WORKSPACE);
        };
        UnsupportedWorkspaceSettingsContribution.prototype.showWarning = function (unsupportedKeys) {
            var _this = this;
            var message = nls.localize('unsupportedWorkspaceSettings', 'This Workspace contains settings that can only be set in User Settings. ({0})', unsupportedKeys.join(', '));
            var openWorkspaceSettings = new actions_1.Action('unsupportedWorkspaceSettings.openWorkspaceSettings', nls.localize('openWorkspaceSettings', 'Open Workspace Settings'), '', true, function () {
                _this.rememberWarningWasShown();
                return _this.preferencesService.openWorkspaceSettings();
            });
            var openDocumentation = new actions_1.Action('unsupportedWorkspaceSettings.openDocumentation', nls.localize('openDocumentation', 'Learn More'), '', true, function () {
                _this.rememberWarningWasShown();
                window.open('https://go.microsoft.com/fwlink/?linkid=839878'); // Don't change link.
                return winjs_base_1.TPromise.as(true);
            });
            var close = new actions_1.Action('unsupportedWorkspaceSettings.Ignore', nls.localize('ignore', 'Ignore'), '', true, function () {
                _this.rememberWarningWasShown();
                return winjs_base_1.TPromise.as(true);
            });
            var actions = [openWorkspaceSettings, openDocumentation, close];
            this.messageService.show(message_1.Severity.Warning, { message: message, actions: actions });
        };
        UnsupportedWorkspaceSettingsContribution.storageKey = 'workspace.settings.unsupported.warning';
        UnsupportedWorkspaceSettingsContribution = __decorate([
            __param(0, lifecycle_2.ILifecycleService),
            __param(1, workspace_1.IWorkspaceContextService),
            __param(2, configuration_1.IWorkspaceConfigurationService),
            __param(3, preferences_1.IPreferencesService),
            __param(4, message_1.IMessageService),
            __param(5, storage_1.IStorageService)
        ], UnsupportedWorkspaceSettingsContribution);
        return UnsupportedWorkspaceSettingsContribution;
    }());
    var workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(UnsupportedWorkspaceSettingsContribution, lifecycle_2.LifecyclePhase.Running);
});
