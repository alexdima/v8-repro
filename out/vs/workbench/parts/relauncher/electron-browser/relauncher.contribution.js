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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/message/common/message", "vs/platform/windows/common/windows", "vs/platform/configuration/common/configuration", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/lifecycle/common/lifecycle"], function (require, exports, lifecycle_1, contributions_1, platform_1, message_1, windows_1, configuration_1, nls_1, environment_1, workspace_1, extensions_1, async_1, resources_1, platform_2, lifecycle_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var SettingsChangeRelauncher = /** @class */ (function () {
        function SettingsChangeRelauncher(windowsService, windowService, configurationService, envService, messageService, contextService, extensionService) {
            var _this = this;
            this.windowsService = windowsService;
            this.windowService = windowService;
            this.configurationService = configurationService;
            this.envService = envService;
            this.messageService = messageService;
            this.contextService = contextService;
            this.extensionService = extensionService;
            this.toDispose = [];
            var workspace = this.contextService.getWorkspace();
            this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
            this.extensionHostRestarter = new async_1.RunOnceScheduler(function () { return _this.extensionService.restartExtensionHost(); }, 10);
            this.onConfigurationChange(configurationService.getValue(), false);
            this.handleWorkbenchState();
            this.registerListeners();
        }
        SettingsChangeRelauncher.prototype.registerListeners = function () {
            var _this = this;
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(function (e) { return _this.onConfigurationChange(_this.configurationService.getValue(), true); }));
            this.toDispose.push(this.contextService.onDidChangeWorkbenchState(function () { return setTimeout(function () { return _this.handleWorkbenchState(); }); }));
        };
        SettingsChangeRelauncher.prototype.onConfigurationChange = function (config, notify) {
            var _this = this;
            var changed = false;
            // Titlebar style
            if (config.window && config.window.titleBarStyle !== this.titleBarStyle && (config.window.titleBarStyle === 'native' || config.window.titleBarStyle === 'custom')) {
                this.titleBarStyle = config.window.titleBarStyle;
                changed = true;
            }
            // Native tabs
            if (config.window && typeof config.window.nativeTabs === 'boolean' && config.window.nativeTabs !== this.nativeTabs) {
                this.nativeTabs = config.window.nativeTabs;
                changed = true;
            }
            // Update channel
            if (config.update && typeof config.update.channel === 'string' && config.update.channel !== this.updateChannel) {
                this.updateChannel = config.update.channel;
                changed = true;
            }
            // Crash reporter
            if (config.telemetry && typeof config.telemetry.enableCrashReporter === 'boolean' && config.telemetry.enableCrashReporter !== this.enableCrashReporter) {
                this.enableCrashReporter = config.telemetry.enableCrashReporter;
                changed = true;
            }
            // Touchbar config
            if (config.keyboard && config.keyboard.touchbar && typeof config.keyboard.touchbar.enabled === 'boolean' && config.keyboard.touchbar.enabled !== this.touchbarEnabled) {
                this.touchbarEnabled = config.keyboard.touchbar.enabled;
                changed = true;
            }
            // Notify only when changed and we are the focused window (avoids notification spam across windows)
            if (notify && changed) {
                this.doConfirm(nls_1.localize('relaunchSettingMessage', "A setting has changed that requires a restart to take effect."), nls_1.localize('relaunchSettingDetail', "Press the restart button to restart {0} and enable the setting.", this.envService.appNameLong), nls_1.localize('restart', "&&Restart"), function () { return _this.windowsService.relaunch(Object.create(null)); });
            }
        };
        SettingsChangeRelauncher.prototype.handleWorkbenchState = function () {
            var _this = this;
            // React to folder changes when we are in workspace state
            if (this.contextService.getWorkbenchState() === workspace_1.WorkbenchState.WORKSPACE) {
                // Update our known first folder path if we entered workspace
                var workspace = this.contextService.getWorkspace();
                this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
                // Install workspace folder listener
                if (!this.onDidChangeWorkspaceFoldersUnbind) {
                    this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(function () { return _this.onDidChangeWorkspaceFolders(); });
                }
            }
            else {
                this.onDidChangeWorkspaceFoldersUnbind = lifecycle_1.dispose(this.onDidChangeWorkspaceFoldersUnbind);
            }
        };
        SettingsChangeRelauncher.prototype.onDidChangeWorkspaceFolders = function () {
            var workspace = this.contextService.getWorkspace();
            // Restart extension host if first root folder changed (impact on deprecated workspace.rootPath API)
            var newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
            if (!resources_1.isEqual(this.firstFolderResource, newFirstFolderResource, !platform_2.isLinux)) {
                this.firstFolderResource = newFirstFolderResource;
                this.extensionHostRestarter.schedule(); // buffer calls to extension host restart
            }
        };
        SettingsChangeRelauncher.prototype.doConfirm = function (message, detail, primaryButton, confirmed) {
            var _this = this;
            this.windowService.isFocused().then(function (focused) {
                if (focused) {
                    return _this.messageService.confirm({
                        type: 'info',
                        message: message,
                        detail: detail,
                        primaryButton: primaryButton
                    }).then(function (confirm) {
                        if (confirm) {
                            confirmed();
                        }
                    });
                }
                return void 0;
            });
        };
        SettingsChangeRelauncher.prototype.dispose = function () {
            this.toDispose = lifecycle_1.dispose(this.toDispose);
        };
        SettingsChangeRelauncher = __decorate([
            __param(0, windows_1.IWindowsService),
            __param(1, windows_1.IWindowService),
            __param(2, configuration_1.IConfigurationService),
            __param(3, environment_1.IEnvironmentService),
            __param(4, message_1.IMessageService),
            __param(5, workspace_1.IWorkspaceContextService),
            __param(6, extensions_1.IExtensionService)
        ], SettingsChangeRelauncher);
        return SettingsChangeRelauncher;
    }());
    exports.SettingsChangeRelauncher = SettingsChangeRelauncher;
    var workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(SettingsChangeRelauncher, lifecycle_2.LifecyclePhase.Running);
});
