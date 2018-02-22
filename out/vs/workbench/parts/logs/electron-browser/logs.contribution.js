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
define(["require", "exports", "vs/nls", "vs/base/common/paths", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/parts/output/common/output", "vs/platform/lifecycle/common/lifecycle", "vs/platform/environment/common/environment", "vs/platform/windows/common/windows", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/parts/logs/common/logConstants", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/workbench/parts/logs/electron-browser/logsActions"], function (require, exports, nls, paths_1, platform_1, contributions_1, output_1, lifecycle_1, environment_1, windows_1, lifecycle_2, uri_1, instantiation_1, Constants, actions_1, actions_2, logsActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LogOutputChannels = /** @class */ (function (_super) {
        __extends(LogOutputChannels, _super);
        function LogOutputChannels(windowService, environmentService, instantiationService) {
            var _this = _super.call(this) || this;
            _this.windowService = windowService;
            _this.environmentService = environmentService;
            var outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            outputChannelRegistry.registerChannel(Constants.mainLogChannelId, nls.localize('mainLog', "Log (Main)"), uri_1.default.file(paths_1.join(_this.environmentService.logsPath, "main.log")));
            outputChannelRegistry.registerChannel(Constants.sharedLogChannelId, nls.localize('sharedLog', "Log (Shared)"), uri_1.default.file(paths_1.join(_this.environmentService.logsPath, "sharedprocess.log")));
            outputChannelRegistry.registerChannel(Constants.rendererLogChannelId, nls.localize('rendererLog', "Log (Window)"), uri_1.default.file(paths_1.join(_this.environmentService.logsPath, "renderer" + _this.windowService.getCurrentWindowId() + ".log")));
            outputChannelRegistry.registerChannel(Constants.extHostLogChannelId, nls.localize('extensionsLog', "Log (Extension Host)"), uri_1.default.file(paths_1.join(_this.environmentService.logsPath, "extHost" + _this.windowService.getCurrentWindowId() + ".log")));
            var workbenchActionsRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
            var devCategory = nls.localize('developer', "Developer");
            workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(logsActions_1.OpenLogsFolderAction, logsActions_1.OpenLogsFolderAction.ID, logsActions_1.OpenLogsFolderAction.LABEL), 'Developer: Open Log Folder', devCategory);
            workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(logsActions_1.SetLogLevelAction, logsActions_1.SetLogLevelAction.ID, logsActions_1.SetLogLevelAction.LABEL), 'Developer: Set Log Level', devCategory);
            workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(logsActions_1.ShowLogsAction, logsActions_1.ShowLogsAction.ID, logsActions_1.ShowLogsAction.LABEL), 'Developer: Show Logs...', devCategory);
            workbenchActionsRegistry.registerWorkbenchAction(new actions_2.SyncActionDescriptor(logsActions_1.OpenLogFileAction, logsActions_1.OpenLogFileAction.ID, logsActions_1.OpenLogFileAction.LABEL), 'Developer: Open Log File...', devCategory);
            return _this;
        }
        LogOutputChannels = __decorate([
            __param(0, windows_1.IWindowService),
            __param(1, environment_1.IEnvironmentService),
            __param(2, instantiation_1.IInstantiationService)
        ], LogOutputChannels);
        return LogOutputChannels;
    }(lifecycle_2.Disposable));
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LogOutputChannels, lifecycle_1.LifecyclePhase.Eventually);
});
